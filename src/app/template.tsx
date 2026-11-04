'use client';

import React, { useEffect, useRef, useState } from 'react';
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

  // Global Scroll-Triggered Slide ("Geser saat di-scroll") Engine using Web Animations API
  // Does NOT mutate className, style, or data-* attributes, preventing any React hydration mismatch!
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const observedSet = new WeakSet<Element>();
    const armedMap = new WeakMap<Element, Animation>();
    const dirMap = new WeakMap<Element, 'left' | 'right' | 'up'>();

    const getKeyframes = (dir: 'left' | 'right' | 'up'): Keyframe[] => {
      if (dir === 'left') {
        return [
          { opacity: 0, transform: 'translate3d(-32px, 16px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ];
      }
      if (dir === 'right') {
        return [
          { opacity: 0, transform: 'translate3d(32px, 16px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ];
      }
      return [
        { opacity: 0, transform: 'translate3d(0, 32px, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' },
      ];
    };

    const armElement = (el: HTMLElement, dir: 'left' | 'right' | 'up') => {
      if (typeof el.animate !== 'function') return;
      const existing = armedMap.get(el);
      if (existing) existing.cancel();

      const anim = el.animate(getKeyframes(dir), {
        duration: 620,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both',
      });
      anim.pause();
      anim.currentTime = 0;
      armedMap.set(el, anim);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          const dir = dirMap.get(el) || 'up';

          if (entry.isIntersecting) {
            const armed = armedMap.get(el);
            if (armed) {
              armed.play();
              armed.onfinish = () => {
                armed.cancel();
                armedMap.delete(el);
              };
            }
          } else if (entry.boundingClientRect.top > window.innerHeight * 0.96) {
            // Re-arm when scrolled back above the element so scrolling down replays the slide
            if (!armedMap.has(el)) {
              armElement(el, dir);
            }
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px',
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
        if (rect.top >= window.innerHeight * 0.9) {
          armElement(el, dir);
        }

        io.observe(el);
      });
    };

    // Wait until after React hydration completes before registering
    const initTimer = setTimeout(() => {
      requestAnimationFrame(registerElements);
    }, 140);

    const mo = new MutationObserver(() => {
      registerElements();
    });
    const moTimer = setTimeout(() => {
      mo.observe(document.body, { childList: true, subtree: true });
    }, 200);

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
