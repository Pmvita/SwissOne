// apps/web/app/seed/page.tsx
// Seed Account Page - Allows admin to seed account with wealth structure data

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, CheckCircle2, XCircle } from 'lucide-react';

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
      setResult({ ...data, status: response.status });
      
      if (data.success) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (error: any) {
      setResult({ error: error.message, status: 500 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Seed Account Data</h1>
        <p className="text-gray-600 text-center mb-6">
          This will create accounts, portfolios, and transactions based on your wealth structure from the Manifestation document.
        </p>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> This will create multiple accounts, portfolios, and transactions. 
            Make sure you're logged in as an admin user.
          </p>
        </div>
        
        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Seeding Account...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Seed Account
            </>
          )}
        </button>
        
        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'Success!' : 'Error'}
                </h3>
                <pre className="text-xs overflow-auto max-h-60 bg-white p-3 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
                {result.success && result.data && (
                  <div className="mt-3 text-sm text-green-700">
                    <p>✅ Created {result.data.accountsCreated} accounts</p>
                    <p>✅ Created {result.data.portfoliosCreated} portfolios</p>
                    <p>✅ Created {result.data.transactionsCreated} transactions</p>
                    <p className="mt-2 font-semibold">Redirecting to dashboard...</p>
                  </div>
                )}
                {result.error && (
                  <div className="mt-3 text-sm text-red-700">
                    <p><strong>Error:</strong> {result.error}</p>
                    {result.details && (
                      <p className="mt-1 text-xs"><strong>Details:</strong> {result.details}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

