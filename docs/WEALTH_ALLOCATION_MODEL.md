# Wealth Allocation Model

This document describes the wealth allocation model implemented for Pierre Mvita's $1.5B USD portfolio.

## Total Net Worth: $1,500,000,000 USD

## Account Structure

### 1. Safety & Financial Foundation Account (40% = $600M)
- **Type**: Savings
- **Objective**: Capital preservation and liquidity
- **Asset Mix**:
  - High interest savings
  - Government bonds (60% = $360M)
  - Money market funds (40% = $240M)
- **Characteristics**:
  - Low volatility
  - High liquidity
  - Daily or near daily access
  - Used as the stability layer of the balance sheet

### 2. Long Term Investing Account (30% = $450M)
- **Type**: Investment
- **Objective**: Growth and long term income
- **Asset Mix**:
  - Global equity ETFs (60% = $270M)
  - Dividend paying stocks (40% = $180M)
- **Return Assumptions**:
  - Conservative expected return range: 5 to 7 percent annually
  - Used to generate sustainable income without touching principal
- **Portfolio Holdings**:
  - SPDR S&P 500 ETF Trust (SPY)
  - Vanguard Total World Stock ETF (VT)
  - Apple Inc. (AAPL)
  - Microsoft Corporation (MSFT)
  - Johnson & Johnson (JNJ)
  - Procter & Gamble (PG)

### 3. Lifestyle Allocation Checking Account (10% = $150M)
- **Type**: Checking
- **Objective**: Personal spending and large purchases
- **Note**: This capital may be drawn down over time

### 4. Professional Advice & Structure Checking Account (5% = $75M)
- **Type**: Checking
- **Objective**: Cover long term advisory, tax, legal, and estate planning costs

### 5. Cash Reserve Checking Account (5% = $75M)
- **Type**: Checking
- **Objective**: Immediate liquidity and flexibility
- **Note**: Used to avoid forced asset sales under pressure

### 6. Charity & Giving Account (Checking Account 4)
- **Type**: Checking
- **Initial Balance**: $0 (funded annually from returns)
- **Objective**: Gifts and charitable contributions funded from annual investment returns only

## Living Off Returns Logic

### Calculation Basis
- **Invested Base**: $450M (Long Term Investing Account)
- **Sustainable Withdrawal Rate**: 4% annually
- **Annual Personal Income**: $18M
- **Monthly Personal Income**: $1.5M

### Process
1. Annual income is calculated as 4% of the Long Term Investing Account balance ($450M × 4% = $18M/year)
2. Principal remains intact and compounds over time
3. Income is distributed monthly to the Lifestyle Allocation Checking Account ($1.5M/month)

## Charity Logic

### Calculation
- **Source**: Annual returns from the Long Term Investing Portfolio
- **Percentage**: 10% of annual returns
- **Principal**: Never touched (only returns are used)
- **Distribution**: Calculated and transferred once per year based on realized returns

### Example Calculation
- Long Term Investing Account: $450M
- Expected Annual Return: 5-7% (using 6% average)
- Annual Returns: $450M × 6% = $27M
- Charity Amount: $27M × 10% = $2.7M/year
- Remaining Income (after charity): $18M - $2.7M = $15.3M/year to Lifestyle Account

### Distribution Flow
1. Calculate annual returns on Long Term Investing Account
2. Calculate charity (10% of returns)
3. Transfer charity amount to Charity & Giving Account (once per year)
4. Remaining income (after charity subtraction) goes to Lifestyle Allocation Checking Account

## Technical Implementation

### Services

#### WealthAllocationService
Location: `lib/services/wealth-allocation-service.ts`

**Methods**:
- `calculateWealthAllocation(userId)`: Calculate current wealth allocation across all accounts
- `calculateCharityDistribution(userId, year)`: Calculate charity distribution based on annual returns
- `calculateMonthlyIncomeDistribution(userId)`: Calculate monthly income distribution (living off returns)
- `getWealthAllocationSummary(userId)`: Get wealth allocation summary for display

### API Endpoints

#### GET `/api/wealth/allocation`
Returns current wealth allocation across all accounts.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalNetWorth": 1500000000,
    "accountAllocations": [
      {
        "name": "Safety & Financial Foundation Account",
        "type": "savings",
        "balance": 600000000,
        "percentage": 40.0,
        "objective": "Capital preservation and liquidity"
      },
      // ... other accounts
    ],
    "longTermInvestingBase": 450000000,
    "annualCharityAmount": 2700000,
    "annualPersonalIncome": 18000000,
    "monthlyPersonalIncome": 1500000,
    "withdrawalRate": 4.0
  }
}
```

#### GET `/api/wealth/charity?year=2024`
Returns charity distribution calculation for a given year.

**Response**:
```json
{
  "success": true,
  "data": {
    "longTermInvestingValue": 450000000,
    "annualReturnPercentage": 6.0,
    "annualReturnAmount": 27000000,
    "charityPercentage": 10.0,
    "charityAmount": 2700000,
    "remainingIncome": 24300000,
    "calculationDate": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/wealth/income`
Returns monthly income distribution calculation.

**Response**:
```json
{
  "success": true,
  "data": {
    "annualTotalIncome": 18000000,
    "charityAmount": 2700000,
    "lifestyleIncome": 15300000,
    "monthlyLifestyleIncome": 1275000
  }
}
```

### Database Seeding

The seed script (`scripts/seed-account.ts`) creates:
1. Six accounts matching the allocation model
2. Two portfolios:
   - Safety & Financial Foundation Portfolio (bonds and money market funds)
   - Long Term Investing Portfolio (ETFs and dividend stocks)
3. Sample transactions demonstrating the income flow

Run the seed script:
```bash
npx tsx scripts/seed-account.ts
```

## AUM Calculation

Total AUM is calculated as:
- **Sum of all account balances** = $1.5B USD

The portfolio holdings within the Long Term Investing Account are used for:
- Asset class breakdown visualization
- Performance tracking
- Return calculations for charity and income distributions

But the **AUM** (Assets Under Management) remains the sum of account balances, not the market value of holdings.

## Future Enhancements

1. **Historical Performance Tracking**: Use `valuation_snapshots` table to track actual annual returns
2. **Automated Distributions**: Implement scheduled tasks to calculate and transfer charity/income annually/monthly
3. **Tax Optimization**: Add tax considerations to income distributions
4. **Performance Metrics**: Track actual vs. expected returns for the Long Term Investing Account
5. **Charity Tracking**: Track charity distributions over time for reporting

