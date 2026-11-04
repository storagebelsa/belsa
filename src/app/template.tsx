'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isRouteSwitching, setIsRouteSwitching] = useState(false);

  useEffect(() => {
    setIsRouteSwitching(true);
    const timer = setTimeout(() => {
      setIsRouteSwitching(false);
    }, 240);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div key={pathname} className="belsa-page-transition-wrap">
      {isRouteSwitching && (
        <>
          <div className="belsa-route-progress-bar" aria-hidden="true" />
          <div className="belsa-page-skull-veil" aria-hidden="true">
            <div className="belsa-page-skull-pill">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D3232A"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: 'belsaSpin 0.85s linear infinite' }}
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <span>Memuat...</span>
            </div>
          </div>
        </>
      )}
      {children}
    </div>
  );
}
