import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="belsa-container" style={{ padding: '36px 16px 80px', minHeight: '70vh' }}>
      {/* Top Hero Skull Shimmer */}
      <div
        className="belsa-image-skeleton"
        style={{
          width: '100%',
          height: '240px',
          borderRadius: '22px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D3232A"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'belsaSpin 0.9s linear infinite' }}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </div>
        <span
          style={{
            fontSize: '0.78rem',
            color: '#475569',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          Memuat Halaman...
        </span>
      </div>

      {/* 3-Column Card Grid Skull Shimmer */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '18px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              className="belsa-image-skeleton"
              style={{ width: '100%', height: '150px', borderRadius: '12px' }}
            />
            <div
              className="belsa-image-skeleton"
              style={{ width: '68%', height: '20px', borderRadius: '6px' }}
            />
            <div
              className="belsa-image-skeleton"
              style={{ width: '92%', height: '14px', borderRadius: '6px' }}
            />
            <div
              className="belsa-image-skeleton"
              style={{ width: '54%', height: '14px', borderRadius: '6px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
