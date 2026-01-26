# Account Expenses Tracking

## Overview

All accounts now have realistic expense transactions that reflect typical costs for a $1B AUM private banking structure. Expenses are tracked monthly, quarterly, and annually based on their nature.

## Expense Summary by Account

### 1. Safety & Financial Foundation Account ($400M)
**Annual Expenses: ~$630K**

- **Account Maintenance Fee**: $500/month
- **Investment Management Fee**: $50K/month (0.15% of balance annually)
- **Custody & Safekeeping Fee**: $2K/month

**Total**: 36 transactions/year

---

### 2. Long Term Investing Account ($300M)
**Annual Expenses: ~$840K**

- **Portfolio Management Fee**: $50K/month (0.20% of balance annually)
- **Trading & Execution Fees**: $15K/month
- **Performance Reporting & Analytics**: $3K/month
- **Tax Reporting & Documentation**: $5K/quarter

**Total**: 40 transactions/year

---

### 3. Lifestyle Allocation Checking Account ($100M)
**Annual Expenses: ~$6.06M**

- **Monthly Personal Expenses**: $300K/month
- **Property Maintenance & Upkeep**: $25K/month
- **Insurance Premiums**: $15K/month (Property, Health, Life)
- **Utilities & Services**: $8K/month
- **Travel & Leisure**: $50K/month
- **Charitable Donations (Personal)**: $20K/month
- **Dining & Entertainment**: $15K/month
- **Shopping & Personal Items**: $30K/month
- **Healthcare & Wellness**: $10K/month
- **Education & Personal Development**: $5K/month
- **Annual Property Tax**: $200K (January)
- **Annual Insurance Renewal**: $50K (January)
- **Annual Club Memberships**: $75K (January)

**Total**: 123 transactions/year

---

### 4. Professional Advice & Structure Checking Account ($50M)
**Annual Expenses: ~$12.825M**

#### Quarterly Expenses (Q1-Q4):
- **Family Office Costs**: $1M/quarter ($4M/year)
  - Executive team, operations, technology, infrastructure
- **Bank Management Fees**: $875K/quarter ($3.5M/year)
  - 0.25-0.45% of AUM (negotiated rate)
- **Bank Custody & Reporting**: $250K/quarter ($1M/year)
- **Legal & Tax Advisors**: $350K/quarter ($1.4M/year)
  - Multi-jurisdiction planning
- **Compliance & Reporting**: $162.5K/quarter ($650K/year)
  - T1141, T1135, FATCA, CRS
- **Operating Company Management**: $137.5K/quarter ($550K/year)

#### Annual Expenses:
- **Trust Administration**: $1M/year (January)
  - Multiple trusts across jurisdictions
- **Audit & Accounting**: $400K/year (January)
- **Insurance & Risk Management**: $275K/year (January)
- **Account Service Fee**: $1K/month

**Total**: 27 transactions/year (from previous script) + 12 monthly fees = 39 transactions/year

---

### 5. Cash Reserve Checking Account ($50M)
**Annual Expenses: ~$8.4K**

- **Account Maintenance Fee**: $200/month
- **Wire Transfer Fees**: $500/month

**Total**: 24 transactions/year

---

### 6. Charity & Giving Account
**Annual Expenses: ~$1.2K**

- **Donation Processing Fee**: $100/month

**Total**: 12 transactions/year

---

## Total Annual Expenses Across All Accounts

| Account | Annual Expenses |
|---------|----------------|
| Safety & Financial Foundation | $630K |
| Long Term Investing | $840K |
| Lifestyle Allocation | $6.06M |
| Professional Advice & Structure | $12.825M |
| Cash Reserve | $8.4K |
| Charity & Giving | $1.2K |
| **TOTAL** | **~$20.36M** |

**As % of AUM**: ~2.04% (within the expected 0.72-1.85% range for Professional Advice, plus lifestyle expenses)

---

## Expense Categories

All expenses are categorized for easy tracking:

- **`fees`**: Account fees, management fees, custody fees
- **`expense`**: Personal expenses, property costs, lifestyle expenses

---

## Transaction Frequency

- **Monthly**: Recurring expenses like fees, personal expenses
- **Quarterly**: Professional services, reporting fees
- **Annual**: Large one-time expenses like property tax, insurance renewals

---

## Viewing Expenses

Expenses can be viewed:

1. **Transactions Page** (`/transactions`): All transactions across all accounts
2. **Account Detail Page** (`/accounts/[id]`): Transactions for a specific account
3. **Dashboard**: Recent transactions summary

All expenses are properly dated with the current year and will appear in chronological order.

---

## Adding New Expenses

To add new expenses, use the script:

```bash
npx tsx scripts/add-all-account-expenses.ts
```

Or modify the `EXPENSE_CONFIGS` array in the script to add new expense types.

---

## Notes

- Expenses are realistic for a $1B AUM private banking structure
- Professional Advice expenses are the largest component (~$12.8M/year)
- Lifestyle expenses reflect a high-net-worth lifestyle (~$6M/year)
- Investment account fees are based on typical private banking rates (0.15-0.20% of AUM)
- All expenses use USD currency
- Transaction dates use the current year automatically
