'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#0B0F19',
          color: '#F1ECE2',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '90%',
            padding: '36px',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              backgroundColor: '#8B2E24',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '15px',
            }}
          >
            HAB
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>
            Handicrafts Association of Bhutan
          </h2>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '24px', lineHeight: 1.6 }}>
            The application encountered an unexpected runtime state. Please reload to restore connection.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 22px',
                background: '#8B2E24',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Platform
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '10px 22px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
