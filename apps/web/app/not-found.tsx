"use client";

import { useEffect, useState } from "react";

// Simple 404 page that doesn't cause static generation issues
// Note: This is rendered within the layout, so no html/body tags
// Made a client component to prevent static generation during build
// Client components are not statically generated, preventing React rendering errors
export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return minimal content during SSR/static generation
  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827' }}>
            404
          </h1>
        </div>
      </div>
    );
  }

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

