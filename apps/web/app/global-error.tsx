"use client";

// Force dynamic rendering to avoid React 19 + Next.js 15 static generation issues
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Use inline styles to avoid CSS class serialization issues during static generation
  return (
    <html>
      <body>
        <div style={{ 
          display: 'flex', 
          minHeight: '100vh', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#f9fafb' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1e40af',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

