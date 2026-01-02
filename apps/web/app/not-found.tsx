import { unstable_noStore } from 'next/cache';

// Force dynamic - prevent static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Minimal 404 page - pure JSX, no complex logic
// Use unstable_noStore to force dynamic rendering
export default function NotFound() {
  unstable_noStore();
  
  return (
    <html>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
              404
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#4b5563', margin: '1rem 0 2rem 0' }}>
              Page not found
            </p>
            <a
              href="/landing"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1e40af',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

