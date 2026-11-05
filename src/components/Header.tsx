'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useRfq } from '@/context/RfqContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';
import QuickSearchModal from './QuickSearchModal';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { lang } = useLanguage();
  const { totalCount, setIsDrawerOpen } = useRfq();
  const tNav = translations[lang].nav;

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    {
      href: '/',
      label: tNav.home,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      href: '/about-us',
      label: tNav.aboutUs,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
      )
    },
    {
      href: '/products',
      label: tNav.products,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      )
    },
    {
      href: '/projects',
      label: tNav.projects,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20h20"/>
          <path d="M5 20V9l5 4V9l5 4V4h5v16"/>
        </svg>
      )
    },
    {
      href: '/catalogue',
      label: tNav.catalogue,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
          <path d="M6 6h10M6 10h10"/>
        </svg>
      )
    },
    {
      href: '/calculator',
      label: tNav.calculator,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="16" y1="14" x2="16" y2="18"/>
          <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>
        </svg>
      )
    },
    {
      href: '/knowledge-hub',
      label: (tNav as any).knowledgeHub || 'Knowledge Hub',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      )
    },
    {
      href: '/contact-us',
      label: tNav.contactUs,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      )
    },
  ];

  return (
    <header className="belsa-header">
      <div className="belsa-container belsa-nav-wrapper">
        <Link href="/" className="belsa-logo">
          <img src="/images/logo.webp" alt="BELSA HYDRAULIC PNEUMATIC" />
        </Link>

        <div className="belsa-nav-right">
          {/* Desktop Navigation Menu (Streamlined: Home via Logo, Contact Us via Request Quote CTA) */}
          <nav>
            <ul className="belsa-nav-menu">
              {navLinks
                .filter((link) => link.href !== '/' && link.href !== '/contact-us')
                .map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`belsa-nav-link ${isActive ? 'active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop Search, RFQ Cart, Language Switcher & Quick CTA */}
          <div className="desktop-lang-wrapper">
            {/* Quick Search Button (Minimalist Icon) */}
            <button
              type="button"
              className="belsa-header-icon-btn"
              onClick={() => setIsSearchOpen(true)}
              title={lang === 'id' ? 'Cari Produk (Ctrl+K)' : 'Search Products (Ctrl+K)'}
              aria-label="Search"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* RFQ Cart Button (Minimalist Icon with Red Badge) */}
            <button
              type="button"
              className={`belsa-header-icon-btn ${totalCount > 0 ? 'has-badge' : ''}`}
              onClick={() => setIsDrawerOpen(true)}
              title={lang === 'id' ? (totalCount > 0 ? `Keranjang RFQ (${totalCount} item)` : 'Keranjang RFQ') : (totalCount > 0 ? `RFQ Cart (${totalCount} items)` : 'RFQ Cart')}
              aria-label="RFQ Cart"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              {totalCount > 0 && (
                <span className="belsa-header-badge">{totalCount}</span>
              )}
            </button>

            <LanguageSwitcher />

            <Link href="/contact-us" className="belsa-nav-cta" title={lang === 'id' ? 'Minta Penawaran' : 'Request Quotation'}>
              <span>{lang === 'id' ? 'Minta Penawaran' : 'Request Quote'}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {/* Mobile Header Buttons (Search, RFQ, & Hamburger Toggle) */}
          <div className="belsa-mobile-header-actions">
            <button
              type="button"
              className="belsa-mobile-icon-trigger"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Cari Produk"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            <button
              type="button"
              className={`belsa-mobile-icon-trigger ${totalCount > 0 ? 'has-badge' : ''}`}
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Keranjang RFQ"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              {totalCount > 0 && (
                <span className="belsa-header-badge">{totalCount}</span>
              )}
            </button>

            <button
              className="belsa-mobile-toggle"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Buka Navigasi"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Fullscreen Mobile Navigation Drawer (Only rendered when open) */}
      {isOpen && (
        <div className="belsa-mobile-drawer is-open" aria-hidden={false}>
        {/* Drawer Header */}
        <div className="belsa-mobile-drawer-header">
          <Link href="/" className="belsa-logo" onClick={() => setIsOpen(false)}>
            <img src="/images/logo.webp" alt="BELSA HYDRAULIC PNEUMATIC" />
          </Link>
          <div className="belsa-mobile-drawer-actions">
            <LanguageSwitcher />
            <button
              type="button"
              className="belsa-mobile-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="belsa-mobile-drawer-body">
          {/* Quick Search Bar Trigger */}
          <button
            type="button"
            className="belsa-mobile-search-bar"
            onClick={() => {
              setIsOpen(false);
              setIsSearchOpen(true);
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="belsa-mobile-search-text">
              {lang === 'id' ? 'Cari silinder, selang, atau spesifikasi...' : 'Search cylinders, hoses, specs...'}
            </span>
            <kbd className="belsa-mobile-search-kbd">⌘K</kbd>
          </button>

          {/* Core Navigation Links */}
          <nav className="belsa-mobile-nav-list">
            {navLinks.filter((link) => link.href !== '/catalogue').map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`belsa-mobile-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="belsa-mobile-nav-left">
                    <div className="belsa-mobile-icon-box">
                      {link.icon}
                    </div>
                    <span className="belsa-mobile-nav-label">{link.label}</span>
                  </div>
                  <div className="belsa-mobile-nav-right">
                    {isActive ? (
                      <span className="belsa-mobile-active-dot" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="belsa-mobile-chevron">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick RFQ Cart & WhatsApp Help Strip */}
          <div className="belsa-mobile-quick-strip">
            <button
              type="button"
              className={`belsa-mobile-strip-card ${totalCount > 0 ? 'has-items' : ''}`}
              onClick={() => {
                setIsOpen(false);
                setIsDrawerOpen(true);
              }}
            >
              <div className="belsa-mobile-strip-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M9 12h6M9 16h4" />
                </svg>
              </div>
              <div className="belsa-mobile-strip-info">
                <span className="belsa-mobile-strip-title">{lang === 'id' ? 'Keranjang RFQ' : 'RFQ Cart'}</span>
                <span className="belsa-mobile-strip-desc">
                  {totalCount > 0 ? `${totalCount} item` : (lang === 'id' ? 'Belum ada item' : 'Empty')}
                </span>
              </div>
              {totalCount > 0 && (
                <span className="belsa-mobile-strip-badge">{totalCount}</span>
              )}
            </button>

            <a
              href="https://wa.me/6281119168752?text=Halo%20BELSA%2C%20saya%20baru%20saja%20melihat%20website%20Belsa%20dan%20tertarik%20dengan%20produk%2Flayanan%20yang%20ditawarkan.%20Apakah%20bisa%20dibantu%20untuk%20informasi%20lebih%20lanjut%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="belsa-mobile-strip-card"
            >
              <div className="belsa-mobile-strip-icon wa-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <div className="belsa-mobile-strip-info">
                <span className="belsa-mobile-strip-title">WhatsApp</span>
                <span className="belsa-mobile-strip-desc">{lang === 'id' ? 'Chat dengan tim kami' : 'Direct Chat'}</span>
              </div>
              <span className="belsa-mobile-wa-status" title="Engineering Support Online" />
            </a>
          </div>

          {/* Primary RFQ Button */}
          <div className="belsa-mobile-cta-box">
            <Link
              href="/contact-us"
              className="btn-belsa-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '0.96rem' }}
              onClick={() => setIsOpen(false)}
            >
              <span>{lang === 'id' ? 'Minta Penawaran' : 'Request Official Quote'}</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Drawer Footer Micro-info */}
          <div className="belsa-mobile-drawer-footer">
            <span>© 2026 BELSA &bull; PT. Rafitama Millenial Wahyudi</span>
            <span className="belsa-mobile-iso-tag">ISO 9001:2015 Certified Manufacturing</span>
          </div>
        </div>
      </div>
      )}

      {/* Global Quick Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
