// apps/web/app/api/cron/fetch-prices/route.ts
// Background price fetching job - runs via Vercel Cron

import { NextResponse } from 'next/server';
import { PriceFetchingService } from '@/lib/services/price-fetching-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify this is a cron request (Vercel adds a header)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const priceFetchingService = new PriceFetchingService();
    await priceFetchingService.fetchPricesForHoldings();

    return NextResponse.json({
      success: true,
      message: 'Prices fetched successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[Price Fetching Cron] Error:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prices. Check logs for details.',
      },
      { status: 500 }
    );
  }
}

