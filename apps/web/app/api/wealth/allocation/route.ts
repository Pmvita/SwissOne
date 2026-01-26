// app/api/wealth/allocation/route.ts
// API endpoint for wealth allocation calculations

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
    const allocation = await allocationService.calculateWealthAllocation(user.id);

    return NextResponse.json({
      success: true,
      data: allocation,
    });
  } catch (error: any) {
    console.error('Error calculating wealth allocation:', error);
    return NextResponse.json(
      { error: 'Failed to calculate wealth allocation', details: error.message },
      { status: 500 }
    );
  }
}

