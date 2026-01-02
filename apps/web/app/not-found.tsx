import { unstable_noStore } from 'next/cache';

// Force dynamic rendering - prevent static generation during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Simple 404 page - use unstable_noStore to force dynamic rendering
// This prevents Next.js from trying to statically generate it during build
export default function NotFound() {
  // Force dynamic rendering by marking this as uncacheable
  unstable_noStore();
  
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827', margin: 0 }}>
          404
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem', margin: 0 }}>
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
  );
}

