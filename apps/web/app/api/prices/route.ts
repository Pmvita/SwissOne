// API route for fetching real-time prices for holdings
// Uses PricingService with enhanced rate limiting and safety measures

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PricingService } from '@/lib/services/pricing-service';
import { rateLimiter, RATE_LIMIT_CONFIGS } from '@/lib/services/rate-limiter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PriceRequest {
  symbols: string[];
  assetTypes?: string[];
}

// Maximum symbols per request to prevent abuse
const MAX_SYMBOLS_PER_REQUEST = 50;
const MIN_SYMBOL_LENGTH = 1;
const MAX_SYMBOL_LENGTH = 20;

/**
 * Validate symbol format (basic safety check)
 */
function isValidSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }
  
  const trimmed = symbol.trim().toUpperCase();
  
  // Check length
  if (trimmed.length < MIN_SYMBOL_LENGTH || trimmed.length > MAX_SYMBOL_LENGTH) {
    return false;
  }
  
  // Only allow alphanumeric, dots, dashes, and common market symbols
  // Examples: AAPL, SPY, BTC-USD, ^TNX
  const validPattern = /^[A-Z0-9.\-^]+$/;
  return validPattern.test(trimmed);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit using enhanced rate limiter
    const rateLimitKey = `prices:${user.id}`;
    const rateLimitResult = rateLimiter.checkLimit(rateLimitKey, RATE_LIMIT_CONFIGS.PRICE_API);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimitResult.retryAfter
            ? `Please try again in ${rateLimitResult.retryAfter} seconds.`
            : 'Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.PRICE_API.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
            ...(rateLimitResult.retryAfter && {
              'Retry-After': rateLimitResult.retryAfter.toString(),
            }),
          },
        }
      );
    }

    // Parse and validate request body
    let body: PriceRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { symbols, assetTypes } = body;

    // Validate symbols array
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Invalid request: symbols must be an array' },
        { status: 400 }
      );
    }

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: symbols array cannot be empty' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (symbols.length > MAX_SYMBOLS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Too many symbols. Maximum ${MAX_SYMBOLS_PER_REQUEST} symbols per request.`,
        },
        { status: 400 }
      );
    }

    // Validate each symbol format
    const invalidSymbols = symbols.filter((s) => !isValidSymbol(s));
    if (invalidSymbols.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid symbol format',
          invalidSymbols,
        },
        { status: 400 }
      );
    }

    // Validate assetTypes if provided
    if (assetTypes) {
      if (!Array.isArray(assetTypes) || assetTypes.length !== symbols.length) {
        return NextResponse.json(
          {
            error: 'Invalid request: assetTypes must be an array with the same length as symbols',
          },
          { status: 400 }
        );
      }

      const validAssetTypes = ['equity', 'etf', 'bond', 'money_market', 'cash'];
      const invalidAssetTypes = assetTypes.filter(
        (at) => !validAssetTypes.includes(at)
      );
      if (invalidAssetTypes.length > 0) {
        return NextResponse.json(
          {
            error: 'Invalid asset types',
            invalidAssetTypes,
            validAssetTypes,
          },
          { status: 400 }
        );
      }
    }

    // Initialize pricing service
    const pricingService = new PricingService();

    // Prepare price requests
    const priceRequests = symbols.map((symbol, index) => ({
      symbol: symbol.toUpperCase(),
      assetType: (assetTypes?.[index] || 'equity') as 'equity' | 'etf' | 'bond' | 'money_market' | 'cash',
    }));

    // Fetch prices (uses internal caching and provider rate limiting)
    const prices = await pricingService.getPrices(priceRequests);

    // Return prices with rate limit headers
    return NextResponse.json(
      {
        success: true,
        prices: prices.map((p) => ({
          symbol: p.symbol,
          price: p.price,
          currency: p.currency,
          volume: p.volume,
          changePercent: p.changePercent,
          changeAmount: p.changeAmount,
          timestamp: p.timestamp.toISOString(),
          source: p.source,
          cached: p.cached,
        })),
        timestamp: new Date().toISOString(),
        meta: {
          requested: symbols.length,
          returned: prices.length,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.PRICE_API.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Price API] Error fetching prices:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    // Don't expose internal errors to client
    return NextResponse.json(
      {
        error: 'Failed to fetch prices. Please try again later.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint for single symbol (convenience)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimitKey = `prices:${user.id}`;
    const rateLimitResult = rateLimiter.checkLimit(rateLimitKey, RATE_LIMIT_CONFIGS.PRICE_API);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimitResult.retryAfter
            ? `Please try again in ${rateLimitResult.retryAfter} seconds.`
            : 'Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.PRICE_API.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
            ...(rateLimitResult.retryAfter && {
              'Retry-After': rateLimitResult.retryAfter.toString(),
            }),
          },
        }
      );
    }

    // Get symbol from query params
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const assetType = searchParams.get('assetType') || 'equity';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Validate symbol format
    if (!isValidSymbol(symbol)) {
      return NextResponse.json(
        { error: 'Invalid symbol format' },
        { status: 400 }
      );
    }

    // Validate asset type
    const validAssetTypes = ['equity', 'etf', 'bond', 'money_market', 'cash'];
    if (!validAssetTypes.includes(assetType)) {
      return NextResponse.json(
        {
          error: 'Invalid asset type',
          validAssetTypes,
        },
        { status: 400 }
      );
    }

    // Initialize pricing service
    const pricingService = new PricingService();

    // Fetch price
    const price = await pricingService.getPrice({
      symbol: symbol.toUpperCase(),
      assetType: assetType as 'equity' | 'etf' | 'bond' | 'money_market' | 'cash',
    });

    // Return price with rate limit headers
    return NextResponse.json(
      {
        success: true,
        price: {
          symbol: price.symbol,
          price: price.price,
          currency: price.currency,
          volume: price.volume,
          changePercent: price.changePercent,
          changeAmount: price.changeAmount,
          timestamp: price.timestamp.toISOString(),
          source: price.source,
          cached: price.cached,
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.PRICE_API.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Price API] Error fetching price:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch price. Please try again later.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
