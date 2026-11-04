'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SCROLL_TARGET_SELECTOR = [
  '.belsa-reveal',
  '.belsa-card',
  '.belsa-series-card',
  '.belsa-project-card',
  '.belsa-calc-card',
  '.belsa-quality-card',
  '.belsa-cta-box-mobile',
  '.belsa-dark-cta-banner',
  '.belsa-about-text',
  '.belsa-about-img-wrap',
  '.contact-map-header',
  '.contact-map-footer',
  '.footer-light-header',
  '.footer-light-grid > *',
].join(', ');

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

  // Global Scroll-Triggered Slide ("Geser saat di-scroll") Engine
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observedSet = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add('is-inview');
          } else if (entry.boundingClientRect.top > window.innerHeight * 0.96) {
            // Reset when scrolled back above the element so scrolling down replays the slide animation
            el.classList.remove('is-inview');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -24px 0px',
      }
    );

    const registerElements = () => {
      const elements = document.querySelectorAll<HTMLElement>(SCROLL_TARGET_SELECTOR);
      elements.forEach((el, idx) => {
        if (observedSet.has(el)) return;
        // Skip anything inside sticky or fixed bars
        if (
          el.closest('.belsa-calc-mobile-monitor') ||
          el.closest('.belsa-calc-bottom-nav') ||
          el.closest('.belsa-calc-sticky-hud')
        ) {
          return;
        }

        observedSet.add(el);
        el.classList.add('belsa-scroll-slide');

        // Assign directional slide style if not already set
        if (!el.dataset.slideDir) {
          if (el.classList.contains('belsa-about-text')) {
            el.dataset.slideDir = 'left';
          } else if (el.classList.contains('belsa-about-img-wrap')) {
            el.dataset.slideDir = 'right';
          } else if (
            el.classList.contains('belsa-card') ||
            el.classList.contains('belsa-series-card') ||
            el.classList.contains('belsa-project-card') ||
            el.classList.contains('belsa-calc-card')
          ) {
            el.dataset.slideDir = idx % 2 === 0 ? 'left' : 'right';
          } else {
            el.dataset.slideDir = 'up';
          }
        }

        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88) {
          el.classList.add('is-inview');
        }

        io.observe(el);
      });
    };

    registerElements();
    const initTimer = setTimeout(registerElements, 120);

    const mo = new MutationObserver(() => {
      registerElements();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(initTimer);
      io.disconnect();
      mo.disconnect();
    };
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
