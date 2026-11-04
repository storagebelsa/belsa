'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatProductImageUrl } from '@/lib/imageUtils';

interface SkullShimmerImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  label?: string;
  fallbackSrc?: string;
}

export default function SkullShimmerImage({
  src,
  alt,
  className,
  width,
  height,
  style,
  label = 'Memuat Gambar...',
  fallbackSrc = '/images/prod_cylinder_clean.webp',
}: SkullShimmerImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const formattedSrc = formatProductImageUrl(src);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [formattedSrc]);

  return (
    <>
      {isLoading && (
        <div
          className="belsa-image-skeleton"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'inherit',
            zIndex: 2,
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'belsaSpin 1s linear infinite' }}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#64748b',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {label}
          </span>
        </div>
      )}

      <img
        ref={imgRef}
        src={formattedSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src.includes('googleusercontent.com/d/')) {
            const fId = target.src.split('/d/')[1]?.split('?')[0];
            if (fId) {
              target.src = `https://drive.google.com/thumbnail?id=${fId}&sz=w800`;
              return;
            }
          }
          target.src = fallbackSrc;
          setIsLoading(false);
        }}
        className={className}
        style={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transform: isLoading ? 'scale(0.96)' : undefined,
          transition:
            'opacity 0.26s ease-out, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </>
  );
}
