// apps/web/app/api/aum/realtime/route.ts
// Real-time AUM API - uses internal PricingService (provider-agnostic)

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

    // Get optional portfolio_id from query params
    const searchParams = request.nextUrl.searchParams;
    const portfolioId = searchParams.get('portfolio_id') || undefined;

    // Use internal pricing service - provider is completely abstracted
    const pricingService = new PricingService();
    const aumService = new AUMCalculationService(pricingService);
    
    const aum = await aumService.calculateRealtimeAUM(user.id, portfolioId);

    return NextResponse.json({
      totalAum: aum.totalAum,
      totalAumBaseCurrency: aum.totalAumBaseCurrency,
      baseCurrency: aum.baseCurrency,
      assetClassBreakdown: aum.assetClassBreakdown,
      portfolioWeights: aum.portfolioWeights,
      dailyChange: aum.dailyChange,
      dailyChangePercent: aum.dailyChangePercent,
      annualReturn: aum.annualReturn,
      yearToDateReturn: aum.yearToDateReturn,
      lastUpdated: aum.lastUpdated.toISOString(),
      holdingsCount: aum.holdingsCount,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate AUM';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[AUM API] Calculation error:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        error: 'An error occurred while calculating AUM. Please try again later.',
      },
      { status: 500 }
    );
  }
}

