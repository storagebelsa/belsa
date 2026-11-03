'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="belsa-lang-switcher" aria-label="Pilih Bahasa / Select Language">
      {/* Indonesia */}
      <button
        type="button"
        className={`lang-btn ${lang === 'id' ? 'active' : ''}`}
        onClick={() => setLang('id')}
        title="Bahasa Indonesia"
        aria-label="Bahasa Indonesia"
      >
        <svg className="flag-svg" viewBox="0 0 24 24" width="20" height="20">
          <circle cx="12" cy="12" r="11" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
          <g clipPath="url(#id-flag-clip)">
            <path d="M1 12A11 11 0 0 1 12 1a11 11 0 0 1 11 11H1z" fill="#E70011" />
            <path d="M1 12a11 11 0 0 0 11 11 11 11 0 0 0 11-11H1z" fill="#FFFFFF" />
          </g>
          <defs>
            <clipPath id="id-flag-clip">
              <circle cx="12" cy="12" r="11" />
            </clipPath>
          </defs>
        </svg>
      </button>

      {/* English / UK */}
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        title="English"
        aria-label="English"
      >
        <svg className="flag-svg" viewBox="0 0 24 24" width="20" height="20">
          <defs>
            <clipPath id="uk-flag-clip">
              <circle cx="12" cy="12" r="11" />
            </clipPath>
          </defs>
          <g clipPath="url(#uk-flag-clip)">
            {/* Blue background */}
            <rect width="24" height="24" fill="#012169" />
            {/* White diagonals */}
            <path d="M0 0L24 24M24 0L0 24" stroke="#FFFFFF" strokeWidth="4.5" />
            {/* Red diagonals */}
            <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="2" />
            {/* White cross */}
            <path d="M12 0V24M0 12H24" stroke="#FFFFFF" strokeWidth="7" />
            {/* Red cross */}
            <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="4.2" />
          </g>
          <circle cx="12" cy="12" r="11" fill="none" stroke="#E5E7EB" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
}
