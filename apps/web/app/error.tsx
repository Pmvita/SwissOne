"use client";

import { useEffect, useState } from "react";

// Force dynamic rendering to avoid React 19 + Next.js 15 static generation issues
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During static generation or if reset is not available, return minimal content
  // This prevents React serialization errors during build
  if (!mounted || typeof window === "undefined" || typeof reset !== "function") {
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
            Error
          </h1>
        </div>
      </div>
    );
  }

  // Full error page only after client-side mount
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
          Something went wrong
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>
          An unexpected error occurred. Please try again.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
          <a
            href="/landing"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e5e7eb',
              color: '#111827',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

