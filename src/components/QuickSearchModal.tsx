'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BELSA_CATALOGUE_FULL } from '@/data/belsaCatalogueFull';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

const DELETED_SERIES_IDS = new Set([
  'diverter_valve', 'bsp', 'cl_series', 'npp-nhpu', 'bhreb_20es_1',
  'd_nipple', 'double_nipple', 'fitting', 'r1at', 'r2at', 'rejseries',
  'bwe_series', 'tubing', 'rotary'
]);

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  type: 'catalogue' | 'product_category' | 'project' | 'calculator' | 'page';
  url: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { lang } = useLanguage();
  const isId = lang === 'id';
  const t = translations[lang];

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Build searchable index
  const searchIndex: SearchResultItem[] = useMemo(() => {
    const list: SearchResultItem[] = [];

    // 1. Catalogue Series
    BELSA_CATALOGUE_FULL.forEach((item) => {
      if (DELETED_SERIES_IDS.has(item.id)) return;
      list.push({
        id: `cat_${item.id}`,
        title: `${item.series} (${item.code})`,
        subtitle: isId ? item.subTitle?.id : item.subTitle?.en,
        category: item.category,
        type: 'catalogue',
        url: `/catalogue/${item.slug}`,
      });
    });

    // 2. Product Categories
    t.productsPage.items.forEach((p) => {
      list.push({
        id: `prod_${p.slug}`,
        title: p.title,
        subtitle: p.desc,
        category: isId ? 'Kategori Produk' : 'Product Category',
        type: 'product_category',
        url: `/products/${p.slug}`,
      });
    });

    // 3. Project Case Studies
    t.projectsPage.projectsList.forEach((proj) => {
      list.push({
        id: `proj_${proj.slug}`,
        title: proj.title,
        subtitle: `${proj.category} — ${proj.desc}`,
        category: isId ? 'Proyek' : 'Project Showcase',
        type: 'project',
        url: `/projects/${proj.slug}`,
      });
    });

    // 4. Calculator Tools
    const calcTools = [
      {
        slug: 'pressure',
        title: isId ? 'Kalkulator Tekanan & Gaya Silinder' : 'Cylinder Pressure & Load Calculator',
        desc: isId ? 'Hitung tekanan (bar/MPa) atau gaya dorong silinder (ton/kN)' : 'Calculate working pressure (bar) or thrust output force',
      },
      {
        slug: 'thickness',
        title: isId ? 'Kalkulator Tebal Dinding Tube & Batas Honing' : 'Tube Wall Thickness & Honing Limit',
        desc: isId ? 'Cek batas aman tegangan dinding tube dan batas oversize honing' : 'Safety limit for tube hoop stress and honing oversize allowance',
      },
      {
        slug: 'bolt',
        title: isId ? 'Kalkulator Kekuatan Baut Tie Rod' : 'Tie-Rod Bolt Safety Force Calculator',
        desc: isId ? 'Hitung safety factor tarik baut tie rod (grade 8.8, 10.9, 12.9)' : 'Tie-rod bolt tensile safety factor evaluation',
      },
      {
        slug: 'weight',
        title: isId ? 'Kalkulator Berat Material' : 'Material Mass & Weight Estimator',
        desc: isId ? 'Perkiraan berat round bar, hollow tube, dan plat baja ST52/S45C/SS400' : 'Weight computation for round rods, hollow tubes, and steel plates',
      },
      {
        slug: 'torque',
        title: isId ? 'Tabel Torsi Pengencangan Baut' : 'Bolt Tightening Torque Standard Matrix',
        desc: isId ? 'Torsi pengencangan yang disarankan (Nm / lbf.ft) untuk baut M5 hingga M100' : 'Recommended bolt tightening torque (Nm / Lbf.ft) for M5 to M100',
      },
    ];

    calcTools.forEach((tool) => {
      list.push({
        id: `calc_${tool.slug}`,
        title: tool.title,
        subtitle: tool.desc,
        category: isId ? 'Kalkulator Teknis' : 'Engineering Suite',
        type: 'calculator',
        url: `/calculator?tool=${tool.slug}`,
      });
    });

    // 5. Pages
    list.push({
      id: 'page_about',
      title: isId ? 'Profil Perusahaan & Workshop' : 'Company Profile & Workshop Facilities',
      subtitle: 'PT. Rafitama Millenial Wahyudi, workshop, ISO 9001:2015',
      category: isId ? 'Halaman' : 'Page',
      type: 'page',
      url: '/about-us',
    });
    list.push({
      id: 'page_contact',
      title: isId ? 'Hubungi Kami & Permintaan Penawaran' : 'Contact Us & Quotation Inquiries',
      subtitle: 'Head Office Gading Serpong, WhatsApp, dan jam kerja',
      category: isId ? 'Halaman' : 'Page',
      type: 'page',
      url: '/contact-us',
    });

    return list;
  }, [lang, isId, t]);

  // Filtered results
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Default top recommendations
      return searchIndex.slice(0, 8);
    }
    return searchIndex
      .filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      })
      .slice(0, 15);
  }, [query, searchIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].url);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  if (!isOpen) return null;

  const getTypeBadge = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'catalogue':
        return { label: 'Katalog', bg: '#FEF2F2', color: 'var(--belsa-red)' };
      case 'product_category':
        return { label: 'Kategori', bg: '#EFF6FF', color: '#2563EB' };
      case 'project':
        return { label: 'Proyek', bg: '#F0FDF4', color: '#16A34A' };
      case 'calculator':
        return { label: 'Kalkulator', bg: '#FEF3C7', color: '#D97706' };
      default:
        return { label: 'Navigasi', bg: '#F3F4F6', color: '#4B5563' };
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal Dialog */}
      <div
        style={{
          position: 'relative',
          width: '92%',
          maxWidth: '640px',
          maxHeight: '80vh',
          background: '#FFFFFF',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#FFFFFF',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            placeholder={isId ? 'Cari seri silinder, kode, valve, proyek, atau kalkulator...' : 'Search cylinder series, code, valve, project, or calculator...'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--belsa-dark)',
              fontWeight: 500,
            }}
          />

          <kbd
            style={{
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '0.75rem',
              color: '#6B7280',
              fontFamily: 'monospace',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '8px', maxHeight: '420px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--belsa-dark)' }}>
                {isId ? `Tidak ada hasil untuk "${query}"` : `No results found for "${query}"`}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
                {isId ? 'Coba cari dengan kode seri (misal MPC1, B160) atau nama produk.' : 'Try searching by series code (e.g. MPC1, B160) or category name.'}
              </p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const badge = getTypeBadge(item.type);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isSelected ? '#FEF2F2' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ minWidth: 0, flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {badge.label}
                      </span>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--belsa-red)' : 'var(--belsa-dark)',
                        }}
                      >
                        {item.title}
                      </h4>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: '#6B7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  <span style={{ color: isSelected ? 'var(--belsa-red)' : '#D1D5DB', fontSize: '1rem', fontWeight: 600 }}>
                    &rarr;
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Keybind Info */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid #F3F4F6',
            background: '#F9FAFB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#6B7280',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>↑↓ {isId ? 'Navigasi' : 'Navigate'}</span>
            <span>↵ {isId ? 'Pilih' : 'Select'}</span>
            <span>ESC {isId ? 'Tutup' : 'Close'}</span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--belsa-red)' }}>BELSA Quick Finder</span>
        </div>
      </div>
    </div>
  );
}
