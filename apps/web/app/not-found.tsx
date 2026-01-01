"use client";

import { useEffect, useState } from "react";

// Force dynamic rendering - this page should never be statically generated
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render during static generation
  if (!mounted) {
    return null;
  }

  // Return minimal JSX with inline styles to avoid React serialization issues
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
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1e40af',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none'
          }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}

