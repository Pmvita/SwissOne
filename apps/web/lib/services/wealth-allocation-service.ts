// lib/services/wealth-allocation-service.ts
// Service for calculating wealth allocation, charity distributions, and living off returns

import { SupabaseClient } from '@supabase/supabase-js';

export interface WealthAllocationResult {
  totalNetWorth: number;
  accountAllocations: {
    name: string;
    type: string;
    balance: number;
    percentage: number;
    objective: string;
  }[];
  longTermInvestingBase: number;
  annualCharityAmount: number;
  annualPersonalIncome: number;
  monthlyPersonalIncome: number;
  withdrawalRate: number;
}

export interface CharityCalculationResult {
  longTermInvestingValue: number;
  annualReturnPercentage: number;
  annualReturnAmount: number;
  charityPercentage: number;
  charityAmount: number;
  remainingIncome: number;
  calculationDate: Date;
}

export class WealthAllocationService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Calculate current wealth allocation across all accounts
   */
  async calculateWealthAllocation(userId: string): Promise<WealthAllocationResult> {
    // Get all accounts for user
    const { data: accounts, error } = await this.supabase
      .from('accounts')
      .select('id, name, type, balance, currency')
      .eq('user_id', userId)
      .order('balance', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`);
    }

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found for user');
    }

    // Calculate total net worth (sum of all account balances)
    const totalNetWorth = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

    // Map account names to objectives
    const accountObjectives: Record<string, string> = {
      'Safety & Financial Foundation Account': 'Capital preservation and liquidity',
      'Long Term Investing Account': 'Growth and long term income',
      'Lifestyle Allocation Checking Account': 'Personal spending and large purchases',
      'Professional Advice & Structure Checking Account': 'Cover long term advisory, tax, legal, and estate planning costs',
      'Cash Reserve Checking Account': 'Immediate liquidity and flexibility',
      'Charity & Giving Account': 'Gifts and charitable contributions funded from annual returns',
    };

    // Calculate allocations
    const accountAllocations = accounts.map((acc) => ({
      name: acc.name,
      type: acc.type,
      balance: Number(acc.balance || 0),
      percentage: totalNetWorth > 0 ? (Number(acc.balance || 0) / totalNetWorth) * 100 : 0,
      objective: accountObjectives[acc.name] || 'General purpose',
    }));

    // Find Long Term Investing Account
    const longTermAccount = accounts.find((acc) =>
      acc.name.includes('Long Term Investing')
    );

    const longTermInvestingBase = longTermAccount ? Number(longTermAccount.balance || 0) : 0;

    // Calculate living off returns (4% of Long Term Investing Account)
    const withdrawalRate = 0.04; // 4% annually
    const annualPersonalIncome = longTermInvestingBase * withdrawalRate;
    const monthlyPersonalIncome = annualPersonalIncome / 12;

    // Charity calculation (10% of annual returns)
    // Using conservative 5-7% return assumption, average 6%
    const annualReturnRate = 0.06; // 6% average annual return
    const annualReturns = longTermInvestingBase * annualReturnRate;
    const charityPercentage = 0.10; // 10% of returns
    const annualCharityAmount = annualReturns * charityPercentage;

    return {
      totalNetWorth,
      accountAllocations,
      longTermInvestingBase,
      annualCharityAmount,
      annualPersonalIncome,
      monthlyPersonalIncome,
      withdrawalRate: withdrawalRate * 100, // Convert to percentage
    };
  }

  /**
   * Calculate charity distribution based on actual annual returns
   * This should be called annually to calculate the charity amount
   */
  async calculateCharityDistribution(
    userId: string,
    year: number = new Date().getFullYear()
  ): Promise<CharityCalculationResult> {
    // Find Long Term Investing Account
    const { data: longTermAccount, error: accountError } = await this.supabase
      .from('accounts')
      .select('id, name, balance')
      .eq('user_id', userId)
      .ilike('name', '%Long Term Investing%')
      .single();

    if (accountError || !longTermAccount) {
      throw new Error(`Long Term Investing Account not found: ${accountError?.message}`);
    }

    // Get portfolio value at start of year and end of year
    // For now, using current balance as proxy (in real implementation, use historical snapshots)
    const longTermInvestingValue = Number(longTermAccount.balance || 0);

    // Calculate annual return (in real implementation, use actual performance metrics)
    // Conservative assumption: 5-7% annual return, using 6% average
    const annualReturnPercentage = 6.0;
    const annualReturnAmount = longTermInvestingValue * (annualReturnPercentage / 100);

    // Charity: 10% of annual returns
    const charityPercentage = 10.0;
    const charityAmount = annualReturnAmount * (charityPercentage / 100);

    // Remaining income (after charity) goes to Lifestyle Account
    const remainingIncome = annualReturnAmount - charityAmount;

    return {
      longTermInvestingValue,
      annualReturnPercentage,
      annualReturnAmount,
      charityPercentage,
      charityAmount,
      remainingIncome,
      calculationDate: new Date(),
    };
  }

  /**
   * Calculate monthly income distribution (living off returns)
   * 4% of Long Term Investing Account, after charity deduction
   */
  async calculateMonthlyIncomeDistribution(userId: string): Promise<{
    annualTotalIncome: number;
    charityAmount: number;
    lifestyleIncome: number;
    monthlyLifestyleIncome: number;
  }> {
    const allocation = await this.calculateWealthAllocation(userId);
    const charityCalc = await this.calculateCharityDistribution(userId);

    // Annual income: 4% of Long Term Investing Account
    const annualTotalIncome = allocation.annualPersonalIncome;

    // Charity: 10% of annual returns (not of withdrawal, but of returns)
    const charityAmount = charityCalc.charityAmount;

    // Remaining goes to Lifestyle Account
    const lifestyleIncome = annualTotalIncome - charityAmount;
    const monthlyLifestyleIncome = lifestyleIncome / 12;

    return {
      annualTotalIncome,
      charityAmount,
      lifestyleIncome,
      monthlyLifestyleIncome,
    };
  }

  /**
   * Get wealth allocation summary for display
   */
  async getWealthAllocationSummary(userId: string): Promise<{
    totalNetWorth: number;
    safetyAccount: number;
    longTermInvesting: number;
    lifestyleAccount: number;
    professionalAdvice: number;
    cashReserve: number;
    charityAccount: number;
    allocationPercentages: {
      safety: number;
      longTerm: number;
      lifestyle: number;
      professional: number;
      cash: number;
      charity: number;
    };
  }> {
    const allocation = await this.calculateWealthAllocation(userId);

    const safetyAccount = allocation.accountAllocations.find((acc) =>
      acc.name.includes('Safety')
    )?.balance || 0;

    const longTermInvesting = allocation.longTermInvestingBase;

    const lifestyleAccount = allocation.accountAllocations.find((acc) =>
      acc.name.includes('Lifestyle')
    )?.balance || 0;

    const professionalAdvice = allocation.accountAllocations.find((acc) =>
      acc.name.includes('Professional Advice')
    )?.balance || 0;

    const cashReserve = allocation.accountAllocations.find((acc) =>
      acc.name.includes('Cash Reserve')
    )?.balance || 0;

    const charityAccount = allocation.accountAllocations.find((acc) =>
      acc.name.includes('Charity')
    )?.balance || 0;

    return {
      totalNetWorth: allocation.totalNetWorth,
      safetyAccount,
      longTermInvesting,
      lifestyleAccount,
      professionalAdvice,
      cashReserve,
      charityAccount,
      allocationPercentages: {
        safety: (safetyAccount / allocation.totalNetWorth) * 100,
        longTerm: (longTermInvesting / allocation.totalNetWorth) * 100,
        lifestyle: (lifestyleAccount / allocation.totalNetWorth) * 100,
        professional: (professionalAdvice / allocation.totalNetWorth) * 100,
        cash: (cashReserve / allocation.totalNetWorth) * 100,
        charity: (charityAccount / allocation.totalNetWorth) * 100,
      },
    };
  }
}

