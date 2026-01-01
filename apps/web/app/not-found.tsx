// Minimal 404 page to prevent Next.js from using error.tsx for 404s
// This prevents React serialization errors during static generation
export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
          404
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>
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

