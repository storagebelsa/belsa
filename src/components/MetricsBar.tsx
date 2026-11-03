'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

export default function MetricsBar() {
  const { lang } = useLanguage();
  const t = translations[lang].metrics;

  return (
    <section className="belsa-metrics-section">
      <div className="belsa-container">
        <div className="belsa-stats-card">
          
          {/* 1. Founded 2017: Clean Calendar / Establishment Icon */}
          <div className="stat-item">
            <div className="stat-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01" strokeWidth="2.5" />
                <path d="M12 14h.01" strokeWidth="2.5" />
                <path d="M16 14h.01" strokeWidth="2.5" />
                <path d="M8 18h.01" strokeWidth="2.5" />
                <path d="M12 18h.01" strokeWidth="2.5" />
                <path d="M16 18h.01" strokeWidth="2.5" />
              </svg>
            </div>
            <div>
              <div className="stat-value">{t.experienceValue}</div>
              <div className="stat-label">{t.experienceLabel}</div>
            </div>
          </div>

          {/* 2. 6+ Product Categories: Modular Layers Component Icon */}
          <div className="stat-item">
            <div className="stat-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <div className="stat-value">{t.productsValue}</div>
              <div className="stat-label">{t.productsLabel}</div>
            </div>
          </div>

          {/* 3. 670+ Industrial Clients: Precision Industrial Factory Icon */}
          <div className="stat-item">
            <div className="stat-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20h20" />
                <path d="M5 20V9l5 4V9l5 4V4h5v16" />
                <line x1="17" y1="8" x2="17" y2="8.01" strokeWidth="2.5" />
                <line x1="17" y1="12" x2="17" y2="12.01" strokeWidth="2.5" />
              </svg>
            </div>
            <div>
              <div className="stat-value">{t.clientsValue}</div>
              <div className="stat-label">{t.clientsLabel}</div>
            </div>
          </div>

          {/* 4. ISO 9001:2015: Certified Quality Shield Icon */}
          <div className="stat-item">
            <div className="stat-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div>
              <div className="stat-value">{t.isoValue}</div>
              <div className="stat-label">{t.isoLabel}</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
