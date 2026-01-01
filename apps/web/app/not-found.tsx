import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | SwissOne</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ 
          display: 'flex', 
          minHeight: '100vh', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#f9fafb' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              404
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>
              Page not found
            </p>
            <a
              href="/landing"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1e40af',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

