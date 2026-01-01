// app/api/wealth/income/route.ts
// API endpoint for monthly income distribution (living off returns)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WealthAllocationService } from '@/lib/services/wealth-allocation-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      );
    }

    const allocationService = new WealthAllocationService(supabase);
    const incomeDistribution = await allocationService.calculateMonthlyIncomeDistribution(user.id);

    return NextResponse.json({
      success: true,
      data: incomeDistribution,
    });
  } catch (error: any) {
    console.error('Error calculating income distribution:', error);
    return NextResponse.json(
      { error: 'Failed to calculate income distribution', details: error.message },
      { status: 500 }
    );
  }
}

