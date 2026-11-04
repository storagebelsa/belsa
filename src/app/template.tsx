'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SCROLL_TARGET_SELECTOR = [
  '.belsa-card',
  '.belsa-series-card',
  '.belsa-project-card',
  '.belsa-calc-card',
  '.belsa-quality-card',
  '.belsa-cta-box-mobile',
  '.belsa-dark-cta-banner',
  '.belsa-about-text',
  '.belsa-about-img-wrap',
  '.belsa-stats-card',
  '.contact-form-box',
  '.contact-map-header',
  '.footer-light-header',
  '.footer-light-grid > *',
].join(', ');

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstMount = useRef(true);
  const [isRouteSwitching, setIsRouteSwitching] = useState(false);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setIsRouteSwitching(true);
    const timer = setTimeout(() => {
      setIsRouteSwitching(false);
    }, 240);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Rock-Solid Scroll Slide Engine:
  // Never pre-hides elements at opacity: 0 (so elements NEVER disappear when scrolling!).
  // Plays a hardware-accelerated directional slide with fill: 'none' as elements enter the viewport.
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const observedSet = new WeakSet<Element>();
    const activeAnimMap = new WeakMap<Element, Animation>();
    const hasEnteredMap = new WeakMap<Element, boolean>();
    const dirMap = new WeakMap<Element, 'left' | 'right' | 'up'>();

    const getKeyframes = (dir: 'left' | 'right' | 'up'): Keyframe[] => {
      if (dir === 'left') {
        return [
          { opacity: 0.18, transform: 'translate3d(-26px, 18px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ];
      }
      if (dir === 'right') {
        return [
          { opacity: 0.18, transform: 'translate3d(26px, 18px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ];
      }
      return [
        { opacity: 0.18, transform: 'translate3d(0, 26px, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' },
      ];
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            if (!hasEnteredMap.get(el)) {
              hasEnteredMap.set(el, true);
              // Only animate elements entering from the lower part of the viewport
              if (entry.boundingClientRect.top > window.innerHeight * 0.45 && typeof el.animate === 'function') {
                const prev = activeAnimMap.get(el);
                if (prev) prev.cancel();
                const dir = dirMap.get(el) || 'up';
                const anim = el.animate(getKeyframes(dir), {
                  duration: 520,
                  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  fill: 'none',
                });
                activeAnimMap.set(el, anim);
              }
            }
          } else {
            // Only reset if the element has scrolled completely below the viewport
            if (entry.boundingClientRect.top >= window.innerHeight) {
              hasEnteredMap.set(el, false);
            }
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: '0px 0px -8px 0px',
      }
    );

    const registerElements = () => {
      const elements = document.querySelectorAll<HTMLElement>(SCROLL_TARGET_SELECTOR);
      elements.forEach((el, idx) => {
        if (observedSet.has(el)) return;
        if (
          el.closest('.belsa-calc-mobile-monitor') ||
          el.closest('.belsa-calc-bottom-nav') ||
          el.closest('.belsa-calc-sticky-hud')
        ) {
          return;
        }

        observedSet.add(el);

        let dir: 'left' | 'right' | 'up' = 'up';
        if (el.classList.contains('belsa-about-text')) {
          dir = 'left';
        } else if (el.classList.contains('belsa-about-img-wrap')) {
          dir = 'right';
        } else if (
          el.classList.contains('belsa-card') ||
          el.classList.contains('belsa-series-card') ||
          el.classList.contains('belsa-project-card') ||
          el.classList.contains('belsa-calc-card')
        ) {
          dir = idx % 2 === 0 ? 'left' : 'right';
        }
        dirMap.set(el, dir);

        const rect = el.getBoundingClientRect();
        // Mark elements already visible in the initial viewport so they don't re-animate until scrolled below
        if (rect.top < window.innerHeight * 0.92) {
          hasEnteredMap.set(el, true);
        } else {
          hasEnteredMap.set(el, false);
        }

        io.observe(el);
      });
    };

    const initTimer = setTimeout(() => {
      requestAnimationFrame(registerElements);
    }, 120);

    const mo = new MutationObserver(() => {
      registerElements();
    });
    const moTimer = setTimeout(() => {
      mo.observe(document.body, { childList: true, subtree: true });
    }, 180);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(moTimer);
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
