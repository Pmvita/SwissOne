# Seed Account with Wealth Structure Data

This guide explains how to seed your account with the UHNWI wealth structure data from the Manifestation document.

## Prerequisites

1. **Run Migration 027** (Optional - for session tracking):
   - Go to Supabase Dashboard → SQL Editor
   - Run `docs/migrations/027_create_user_sessions.sql`
   - This is optional - the app will work without it, but session tracking won't function

2. **Be logged in as admin**:
   - Make sure you're logged in with an admin account (`pmvita` / `admin123`)

## Method 1: Using curl (Recommended)

```bash
# Make sure you're logged in first, then get your auth token from browser cookies
# Or use this command after logging in:
curl -X POST http://localhost:3000/api/setup/seed-account \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

## Method 2: Using Browser (Easiest)

1. **Log in** to your account at `http://localhost:3000/login`
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Run this JavaScript**:

```javascript
fetch('/api/setup/seed-account', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies for authentication
})
  .then((res) => res.json())
  .then((data) => {
    console.log('Seed result:', data);
    if (data.success) {
      alert(`Success! Created ${data.data.accountsCreated} accounts, ${data.data.portfoliosCreated} portfolios, ${data.data.transactionsCreated} transactions`);
      window.location.reload(); // Refresh dashboard to see new data
    } else {
      alert('Error: ' + (data.error || 'Unknown error'));
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    alert('Error seeding account: ' + error.message);
  });
```

## Method 3: Create a Simple Page

Create a file `apps/web/app/seed/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/setup/seed-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Seed Account Data</h1>
        <p className="text-gray-600 mb-6">
          This will create accounts, portfolios, and transactions based on your wealth structure.
        </p>
        
        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Seeding...' : 'Seed Account'}
        </button>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

Then visit: `http://localhost:3000/seed`

## What Gets Created

### Accounts (12 total)
- Family Office Account (Swiss Private Banking) - $60M
- Offshore Account (Swiss Private Banking) - $57.125M
- Mvita Capital Investments accounts - $600M total
- Mvita Venture Capital account - $500M
- Mvita Syndicate accounts (BMO, RBC) - $150M total
- UAE accounts (Emirates NBD, FAB, WIO) - $11M total
- Liechtenstein Private Banking accounts - $200M total

### Portfolios (4 total)
1. **Venture Capital & Private Equity Portfolio**
   - SecureNet (60% Equity - $1.2B)
   - Syndicate X (60% Equity - $1.8B)
   - MapleAI (60% Equity - $2.0B)
   - OrbitTech (60% Equity - $5.1B)

2. **Private Equity Holdings Portfolio**
   - Golden Maple Circuit (60% Equity - $720M)
   - Agape Records (80% Equity - $320M)
   - Maison Agape (80% Equity - $68M)
   - Kinshasa Sky Residences (100% Equity - $1.0B)
   - KIEAT University (100% Equity - $500M)

3. **Public Markets Portfolio**
   - SPY ETF (100,000 shares)
   - QQQ ETF (50,000 shares)
   - Apple Stock (10,000 shares)
   - Microsoft Stock (10,000 shares)
   - US 10-Year Treasury Bond ($10M)

4. **Crypto Reserves**
   - Bitcoin (1,000 BTC)
   - Ethereum (10,000 ETH)

### Transactions
- Annual dividends from portfolio companies
- Operating expenses (staff salaries, charity)
- Income allocations

## Troubleshooting

### Error: "Unauthorized" (401)
- Make sure you're logged in as admin
- Check that your session is valid
- Try logging out and logging back in

### Error: "Method Not Allowed" (405)
- Make sure you're using POST, not GET
- Check the URL is correct: `/api/setup/seed-account`

### Error: "Table doesn't exist"
- This is normal for `user_sessions` - it's optional
- The seed will still work without it
- To enable session tracking, run migration 027

### No data appears after seeding
- Refresh the dashboard page
- Check browser console for errors
- Verify accounts were created in Supabase Dashboard → Table Editor → `accounts`

