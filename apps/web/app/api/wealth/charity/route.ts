// app/api/wealth/charity/route.ts
// API endpoint for charity distribution calculations

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

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year') 
      ? parseInt(searchParams.get('year')!, 10)
      : new Date().getFullYear();

    const allocationService = new WealthAllocationService(supabase);
    const charityCalc = await allocationService.calculateCharityDistribution(user.id, year);

    return NextResponse.json({
      success: true,
      data: charityCalc,
    });
  } catch (error: any) {
    console.error('Error calculating charity distribution:', error);
    return NextResponse.json(
      { error: 'Failed to calculate charity distribution', details: error.message },
      { status: 500 }
    );
  }
}

