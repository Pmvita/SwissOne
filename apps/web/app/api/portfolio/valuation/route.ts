// apps/web/app/api/portfolio/valuation/route.ts
// Portfolio valuation API - uses internal PricingService (provider-agnostic)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PricingService } from '@/lib/services/pricing-service';
import { AUMCalculationService } from '@/lib/services/aum-calculation-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get portfolio_id from query params (required)
    const searchParams = request.nextUrl.searchParams;
    const portfolioId = searchParams.get('portfolio_id');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'portfolio_id is required' },
        { status: 400 }
      );
    }

    const includeHistory = searchParams.get('include_history') === 'true';

    // Use internal pricing service - provider is completely abstracted
    const pricingService = new PricingService();
    const aumService = new AUMCalculationService(pricingService);
    
    const valuation = await aumService.getPortfolioValuation(
      user.id,
      portfolioId,
      includeHistory
    );

    return NextResponse.json(valuation);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get portfolio valuation';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[Portfolio Valuation API] Error:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        error: 'An error occurred while fetching portfolio valuation. Please try again later.',
      },
      { status: 500 }
    );
  }
}

