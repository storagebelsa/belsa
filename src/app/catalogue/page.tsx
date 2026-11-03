'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';
import { formatProductImageUrl } from '@/lib/imageUtils';
import { HtoConfig, HtoBlock } from '@/types/hto';
import {
  BELSA_CATALOGUE_FULL,
  BELSA_CATEGORIES,
  BelsaCategory,
  BelsaProductSeries
} from '@/data/belsaCatalogueFull';
import { useRfq } from '@/context/RfqContext';
import { generateProductDatasheetPdf } from '@/lib/pdfDatasheetGenerator';

const CIRCLED_NUMBERS: Record<number, string> = {
  1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤',
  6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨', 10: '⑩',
  11: '⑪', 12: '⑫', 13: '⑬', 14: '⑭', 15: '⑮',
  16: '⑯', 17: '⑰', 18: '⑱', 19: '⑲', 20: '⑳'
};

const cleanSubTitle = (text?: string): string => {
  if (!text) return '';
  return text.replace(/\s*\([^)]*\)/g, '').trim();
};

const cleanHtoTitle = (title?: string): string => {
  if (!title) return '';
  let t = title.replace(/^[\u2460-\u2473\u24ea\u24eb\u24ec\u24ed\u24ee\u24ef\u24f0\u24f1\u24f2\u24f3\u24f4\u24f5\u24f6\u24f7\u24f8\u24f9\u24fa\u24fb\u24fc\u24fd\u24fe\u24ff#\$\d\s\.\-\–\—\(\)]+/, '').trim();
  t = t.replace(/\s*\((?!(?:mm|inch|in\.|npt|bar|psi|cm)\b)[^)]*\)/gi, '').trim();
  return t || title;
};

const COLUMN_LABEL_MAP: Record<string, string> = {
  'kode': 'Code',
  'code': 'Code',
  'deskripsi': 'Description',
  'keterangan': 'Description',
  'penjelasan': 'Description',
  'tipe': 'Type',
  'tipe filter': 'Filter Type',
  'ukuran': 'Size',
  'ukuran elemen': 'Element Size',
  'tekanan pembukaan bypass': 'Bypass Cracking Pressure',
  'tipe indikator': 'Indicator Type',
  'diameter': 'Diameter',
  'panjang': 'Length',
  'material': 'Material',
  'voltase': 'Voltage',
  'tegangan': 'Voltage',
  'koneksi': 'Connection',
  'port': 'Port Size',
  'akurasi': 'Filtration Rating',
  'akurasi filtrasi': 'Filtration Rating',
  'media filtrasi': 'Filter Media',
  'suhu': 'Temperature',
  'tekanan': 'Pressure',
};

const cleanColumnLabel = (label: string): string => {
  if (!label) return 'Description';
  const lower = label.toLowerCase().trim();
  if (COLUMN_LABEL_MAP[lower]) return COLUMN_LABEL_MAP[lower];
  return cleanHtoTitle(label) || label;
};

// Global in-memory cache of preloaded image URLs to avoid duplicate network fetches
const preloadedImageCache = new Set<string>();

export function preloadProductImage(url?: string) {
  if (!url || typeof window === 'undefined') return;
  const formatted = formatProductImageUrl(url);
  if (!formatted || preloadedImageCache.has(formatted)) return;
  preloadedImageCache.add(formatted);
  const img = new Image();
  img.referrerPolicy = 'no-referrer';
  img.src = formatted;
}

export default function CataloguePage() {
  const { lang } = useLanguage();
  const t = translations[lang].cataloguePage;

  // Selected Category & Accordion Expanded State
  const [selectedCategory, setSelectedCategory] = useState<BelsaCategory>('Air Cylinder');
  const [expandedCategory, setExpandedCategory] = useState<BelsaCategory | null>('Air Cylinder');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileHtoOpen, setIsMobileHtoOpen] = useState(false);

  // Custom Series from Google Sheets
  const [sheetSeries, setSheetSeries] = useState<BelsaProductSeries[]>([]);

  // Live Catalog loaded from /api/catalogue (defaults to master BELSA_CATALOGUE_FULL)
  const [activeCatalogue, setActiveCatalogue] = useState<BelsaProductSeries[]>(BELSA_CATALOGUE_FULL);

  // Combined Active Series - sorted alphabetically by series (A-Z)
  const allSeries = useMemo(() => {
    const combined = [...activeCatalogue, ...sheetSeries.filter(s => !activeCatalogue.some(ac => ac.id === s.id))];
    return combined.sort((a, b) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));
  }, [activeCatalogue, sheetSeries]);

  // Series filtered by active category for mobile dropdown picker
  const currentCategorySeries = useMemo(() => {
    return allSeries.filter(s => s.category === selectedCategory);
  }, [allSeries, selectedCategory]);

  // Series filtered by search query across all categories - sorted A-Z
  const searchFilteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allSeries
      .filter((s) =>
        s.series.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.subTitle.id.toLowerCase().includes(q) ||
        s.subTitle.en.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      )
      .sort((a, b) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));
  }, [allSeries, searchQuery]);

  // Selected Product Series - default to first A-Z product in 'Air Cylinder'
  const [selectedSeries, setSelectedSeries] = useState<BelsaProductSeries>(() => {
    const airSeries = BELSA_CATALOGUE_FULL
      .filter((s) => s.category === 'Air Cylinder')
      .sort((a, b) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));
    return airSeries[0] || BELSA_CATALOGUE_FULL[0];
  });
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Synchronize URL parameters immediately on client mount without hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlSlug = (params.get('series') || params.get('product') || params.get('slug'))?.toLowerCase().trim();
    if (urlSlug) {
      const match = BELSA_CATALOGUE_FULL.find(
        (item: BelsaProductSeries) =>
          item.slug?.toLowerCase() === urlSlug ||
          item.id.toLowerCase() === urlSlug ||
          item.code.toLowerCase() === urlSlug ||
          item.series.toLowerCase() === urlSlug
      );
      if (match) {
        setSelectedSeries(match);
        setSelectedCategory(match.category as BelsaCategory);
        setExpandedCategory(match.category as BelsaCategory);
      }
    }
  }, []);

  // Dynamic image cache inspection to control skeleton shimmer
  useEffect(() => {
    if (!selectedSeries?.image) return;
    const url = formatProductImageUrl(selectedSeries.image);
    if (typeof window !== 'undefined') {
      const testImg = new Image();
      testImg.src = url;
      if (testImg.complete && testImg.naturalWidth > 0) {
        setIsImageLoading(false);
        return;
      }
    }
    setIsImageLoading(true);
  }, [selectedSeries?.id, selectedSeries?.image]);

  // Intelligent Preload: Preload all images in the active/expanded category in the background
  useEffect(() => {
    if (!expandedCategory || !allSeries.length) return;
    const catItems = allSeries.filter((s) => s.category === expandedCategory);
    catItems.forEach((item) => {
      if (item.image) {
        preloadProductImage(item.image);
      }
    });
  }, [expandedCategory, allSeries]);

  // Preload first batch of series images on initial load
  useEffect(() => {
    if (!allSeries.length) return;
    allSeries.slice(0, 12).forEach((item) => {
      if (item.image) {
        preloadProductImage(item.image);
      }
    });
  }, [allSeries]);

  // Dynamic Slots Map: slotIndex -> code string
  const [dynamicSlots, setDynamicSlots] = useState<Record<number, string>>({});
  const [dynamicStrokeInput, setDynamicStrokeInput] = useState<string>('');

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [copiedSlug, setCopiedSlug] = useState<boolean>(false);

  // Initialize slots whenever selected series changes
  useEffect(() => {
    if (!selectedSeries?.htoConfig) return;
    const initial: Record<number, string> = {};
    if (selectedSeries.htoConfig.defaultSlotValues) {
      Object.assign(initial, selectedSeries.htoConfig.defaultSlotValues);
    } else {
      initial[1] = selectedSeries.htoConfig.codePrefix || selectedSeries.code;
    }

    setDynamicSlots(initial);
    setDynamicStrokeInput('');
  }, [selectedSeries]);

  // Handle selecting a product with automatic URL slug synchronization
  const handleSelectProduct = (s: BelsaProductSeries, cat?: BelsaCategory) => {
    setSelectedSeries(s);
    const targetCat = cat || (s.category as BelsaCategory);
    if (targetCat) {
      setSelectedCategory(targetCat);
      setExpandedCategory(targetCat);
    }
    if (typeof window !== 'undefined') {
      const targetSlug = s.slug || s.id;
      const url = new URL(window.location.href);
      url.searchParams.set('series', targetSlug);
      window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
    }
  };

  // Accordion Category Toggle
  const handleToggleCategory = (cat: BelsaCategory) => {
    if (expandedCategory === cat) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(cat);
      setSelectedCategory(cat);
      const catItems = allSeries
        .filter((s) => s.category === cat)
        .sort((a, b) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));
      if (catItems.length > 0) {
        handleSelectProduct(catItems[0], cat);
      }
    }
  };

  // Fetch live catalogue (including admin edits, additions, and deletions) on mount
  useEffect(() => {
    const loadLiveCatalogue = async () => {
      try {
        const res = await fetch('/api/catalogue');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setActiveCatalogue(json.data);

          // Check if URL specifies a series or product slug
          const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const urlSlug = params ? (params.get('series') || params.get('product') || params.get('slug')) : null;

          if (urlSlug) {
            const urlSlugLower = urlSlug.toLowerCase().trim();
            const slugMatch = json.data.find(
              (item: BelsaProductSeries) =>
                item.slug?.toLowerCase() === urlSlugLower ||
                item.id.toLowerCase() === urlSlugLower ||
                item.code.toLowerCase() === urlSlugLower ||
                item.series.toLowerCase() === urlSlugLower
            );
            if (slugMatch) {
              setSelectedSeries(slugMatch);
              setSelectedCategory(slugMatch.category as BelsaCategory);
              setExpandedCategory(slugMatch.category as BelsaCategory);
              return;
            }
          }

          // If current selectedSeries was updated, refresh it
          setSelectedSeries(prev => {
            const match = json.data.find((item: BelsaProductSeries) => item.id === prev?.id);
            if (match) return match;
            const catMatches = json.data
              .filter((item: BelsaProductSeries) => item.category === 'Air Cylinder')
              .sort((a: BelsaProductSeries, b: BelsaProductSeries) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));
            return catMatches[0] || json.data[0];
          });
        }
      } catch (err) {
        // Fallback silently to initial master catalog
      }
    };
    loadLiveCatalogue();
  }, []);

  // Listen to browser Back/Forward navigation (popstate) to keep product selection in sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSlug = params.get('series') || params.get('product') || params.get('slug');
      if (!urlSlug || !allSeries.length) return;
      const urlSlugLower = urlSlug.toLowerCase().trim();
      const match = allSeries.find(
        (item: BelsaProductSeries) =>
          item.slug?.toLowerCase() === urlSlugLower ||
          item.id.toLowerCase() === urlSlugLower ||
          item.code.toLowerCase() === urlSlugLower ||
          item.series.toLowerCase() === urlSlugLower
      );
      if (match) {
        setSelectedSeries(match);
        setSelectedCategory(match.category as BelsaCategory);
        setExpandedCategory(match.category as BelsaCategory);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allSeries]);

  // Fetch from Google Sheets on mount to integrate custom products from /belsa-admin
  useEffect(() => {
    const loadGoogleSheetData = async () => {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_items`);
        const json = await res.json();
        const rows = Array.isArray(json) ? json : json.data || [];
        if (Array.isArray(rows) && rows.length > 0) {
          const parsed: BelsaProductSeries[] = rows.map((r: any, idx: number) => {
            let hto: HtoConfig | undefined = undefined;
            if (r.htoConfig) {
              try {
                hto = typeof r.htoConfig === 'string' ? JSON.parse(r.htoConfig) : r.htoConfig;
              } catch (e) {
                // ignore
              }
            }
            const sCode = r.series || `CUSTOM_${idx + 1}`;
            return {
              id: `custom_${sCode.toLowerCase()}`,
              slug: sCode.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
              series: `${sCode} Series`,
              code: sCode,
              category: (r.category as BelsaCategory) || 'Air Cylinder',
              subTitle: { id: r.name || 'Silinder Khusus BELSA', en: r.name || 'BELSA Custom Cylinder' },
              image: r.imageUrl || r.image || '/images/prod_cylinder_clean.webp',
              symbolType: 'none',
              features: {
                id: [r.tagline || 'Dibuat sesuai spesifikasi pesanan.'],
                en: [r.taglineEn || 'Custom manufactured according to exact customer requirements.']
              },
              boreSizes: r.boreSizes ? r.boreSizes.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n)) : [40, 50, 63, 80, 100],
              standardStrokes: r.standardStrokes ? r.standardStrokes.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n)) : [25, 50, 75, 100, 150, 200, 250, 300, 500],
              maxStroke: parseInt(r.maxStroke, 10) || 2000,
              htoConfig: hto || {
                codePrefix: sCode,
                separator: '-',
                totalSlots: 8,
                blocks: []
              }
            };
          });
          setSheetSeries(parsed);
        }
      } catch (err) {
        // Fallback silently
      }
    };
    loadGoogleSheetData();
  }, []);

  // Calculated Model Code with strict "-" separator
  // Calculated Model Code respecting per-slot delimiters (e.g. '', '-', '/') or uniform separator
  const activeModelCode = useMemo(() => {
    if (!selectedSeries?.htoConfig) return selectedSeries?.code || '';
    const { totalSlots = 8, slotDelimiters, separator = '-' } = selectedSeries.htoConfig;

    if (slotDelimiters) {
      let result = '';
      let lastFilledSlot: number | null = null;

      for (let slot = 1; slot <= totalSlots; slot++) {
        const val = dynamicSlots[slot]?.trim();
        if (val) {
          if (lastFilledSlot !== null) {
            // Find delimiter between lastFilledSlot and current slot
            let delim = '';
            for (let k = lastFilledSlot; k < slot; k++) {
              if (slotDelimiters[k] !== undefined && slotDelimiters[k] !== '') {
                delim = slotDelimiters[k];
              }
            }
            if (delim === '' && slotDelimiters[lastFilledSlot] !== undefined) {
              delim = slotDelimiters[lastFilledSlot];
            } else if (delim === '' && slotDelimiters[lastFilledSlot] === undefined) {
              delim = separator.trim();
            }
            result += delim;
          }
          result += val;
          lastFilledSlot = slot;
        }
      }
      return result || selectedSeries.htoConfig.codePrefix || selectedSeries.code;
    }

    // Standard uniform separator fallback (e.g. Air Cylinders)
    const parts: string[] = [];
    for (let i = 1; i <= totalSlots; i++) {
      const val = dynamicSlots[i];
      if (val !== undefined && val !== null && val.trim() !== '') {
        parts.push(val.trim());
      }
    }

    if (parts.length === 0) {
      return selectedSeries.htoConfig.codePrefix || selectedSeries.code;
    }

    return parts.join(separator.trim() || '-');
  }, [selectedSeries, dynamicSlots]);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeModelCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  const { addItem, setIsDrawerOpen, isItemInCart } = useRfq();

  const handleAddToRfq = () => {
    addItem({
      id: selectedSeries.id,
      series: selectedSeries.series,
      code: selectedSeries.code,
      category: selectedSeries.category,
      image: selectedSeries.image,
      htoCode: activeModelCode || selectedSeries.code,
      quantity: 1,
    });
    setIsDrawerOpen(true);
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const optionsRecord: Record<string, string> = {};
      if (selectedSeries.htoConfig?.blocks) {
        selectedSeries.htoConfig.blocks.forEach((block) => {
          optionsRecord[block.id] = dynamicSlots[block.slotIndex] || block.rows?.[0]?.code || '—';
        });
      }
      await generateProductDatasheetPdf({
        product: selectedSeries,
        activeModelCode: activeModelCode || selectedSeries.code,
        selectedOptions: optionsRecord,
        lang: lang as 'id' | 'en',
      });
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const whatsappUrl = useMemo(() => {
    const text = `Halo PT. Rafitama Millenial Wahyudi (BELSA), saya ingin menanyakan atau memesan produk dari katalog BELSA dengan rincian berikut:\n\n• SERI: ${selectedSeries.series} (${selectedSeries.category})\n• KODE MODEL: ${activeModelCode}\n\nMohon info ketersediaan stok, harga, dan lead time. Terima kasih.`;
    return `https://wa.me/6281119168752?text=${encodeURIComponent(text)}`;
  }, [activeModelCode, selectedSeries]);

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '50px 0 60px' }}>
      
      {/* Page Header */}
      <section className="belsa-page-header">
        <div className="belsa-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{
              background: '#FEF2F2',
              color: 'var(--belsa-red)',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: '999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              ISO 9001:2015 Certified
            </span>
            <span style={{
              background: '#F1F5F9',
              color: '#475569',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              Est. 2017
            </span>
          </div>
          
          <h1 className="heading-hero" style={{ maxWidth: '920px', margin: '0 auto 16px', lineHeight: 1.25 }}>
            {lang === 'id' ? (
              <>
                Katalog Produk & <span style={{ color: 'var(--belsa-red)' }}>How to Order</span>
              </>
            ) : (
              <>
                Product Catalogue & <span style={{ color: 'var(--belsa-red)' }}>How To Order Matrix</span>
              </>
            )}
          </h1>
          <p className="subhead" style={{ maxWidth: '780px', margin: '0 auto' }}>
            {lang === 'id'
              ? 'Pilih kategori dan seri produk di panel kiri. Setiap seri dilengkapi tabel spesifikasi BELSA untuk menyusun kode model.'
              : 'Select a product category and series from the left sidebar to configure your precise model code using official manufacturer specification tables.'}
          </p>
        </div>
      </section>

      {/* Main Container: Sidebar + Interactive Preview */}
      <section>
        <div className="belsa-container" style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* SIDEBAR: TEXT-ONLY CATEGORIES & SERIES NAVIGATION (NO PHOTOS) */}
          <aside className="cat-sidebar-no-print cat-sidebar-desktop" style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '18px 14px',
            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: '90px'
          }}>
            
            {/* Search Input */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'id' ? 'Cari seri / produk (103)...' : 'Search series / product (103)...'}
                  style={{
                    width: '100%',
                    padding: '8px 28px 8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    background: '#f8fafc',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {/* Search Filtered List */}
            {searchQuery.trim() ? (
              <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: '2px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                  HASIL PENCARIAN ({searchFilteredSeries.length})
                </span>
                {searchFilteredSeries.length === 0 ? (
                  <div style={{ padding: '16px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                    Tidak ada seri ditemukan.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {searchFilteredSeries.map((s) => {
                      const isActive = selectedSeries.id === s.id;
                      const blockCount = s.htoConfig?.blocks?.length || 0;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectProduct(s)}
                          onMouseEnter={() => preloadProductImage(s.image)}
                          onTouchStart={() => preloadProductImage(s.image)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: isActive ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                            background: isActive ? '#fef2f2' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: isActive ? '0 2px 8px rgba(220, 38, 38, 0.1)' : 'none',
                            transition: 'all 0.12s ease'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ color: isActive ? '#dc2626' : '#0f172a', fontWeight: 800, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.series}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: isActive ? '#b91c1c' : '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.category} • {cleanSubTitle(s.subTitle[lang])}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Accordion Style Category & Product Navigation */
              <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: '2px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                  KATEGORI & SERI PRODUK
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {BELSA_CATEGORIES.map((cat) => {
                    const isExpanded = expandedCategory === cat;
                    const catSeries = allSeries
                      .filter((s) => s.category === cat)
                      .sort((a, b) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));
                    const catCount = catSeries.length;
                    return (
                      <div
                        key={cat}
                        style={{
                          border: isExpanded ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: '#ffffff',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        {/* Accordion Trigger */}
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '9px 12px',
                            background: isExpanded ? '#fef2f2' : '#ffffff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              color: isExpanded ? '#dc2626' : '#94a3b8',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.18s ease',
                              display: 'inline-block'
                            }}>
                              ▶
                            </span>
                            <span style={{
                              fontWeight: isExpanded ? 800 : 700,
                              fontSize: '0.82rem',
                              color: isExpanded ? '#dc2626' : '#334155',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '180px'
                            }}>
                              {cat}
                            </span>
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: isExpanded ? '#dc2626' : '#f1f5f9',
                            color: isExpanded ? '#ffffff' : '#64748b',
                            fontWeight: 700
                          }}>
                            {catCount}
                          </span>
                        </button>

                        {/* Accordion Content: Product Series List */}
                        {isExpanded && (
                          <div style={{
                            padding: '6px 8px 8px',
                            background: '#f8fafc',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            {catSeries.map((s) => {
                              const isActive = selectedSeries.id === s.id;
                              const blockCount = s.htoConfig?.blocks?.length || 0;
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(s, cat)}
                                  onMouseEnter={() => preloadProductImage(s.image)}
                                  onTouchStart={() => preloadProductImage(s.image)}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '7px 9px',
                                    borderRadius: '8px',
                                    border: isActive ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                                    background: isActive ? '#ffffff' : '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    boxShadow: isActive ? '0 2px 8px rgba(220, 38, 38, 0.12)' : 'none',
                                    transition: 'all 0.12s ease'
                                  }}
                                >
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ color: isActive ? '#dc2626' : '#0f172a', fontWeight: isActive ? 800 : 700, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {s.series}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: isActive ? '#b91c1c' : '#64748b', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {cleanSubTitle(s.subTitle[lang])}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Helper Badge */}
            <div style={{
              marginTop: '14px',
              padding: '8px 10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.72rem',
              color: '#64748b',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span><strong>Panduan:</strong> Klik opsi pada tabel untuk menyusun kode model secara otomatis.</span>
            </div>

          </aside>

          {/* MOBILE NAVIGATION BAR: Replaces the heavy vertical accordion on mobile */}
          <div className="cat-nav-mobile pdf-hide-buttons" style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)',
            marginBottom: '18px'
          }}>
            {/* Search Input on Mobile */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'id' ? 'Cari seri / produk (103)...' : 'Search series / product (103)...'}
                style={{
                  width: '100%',
                  padding: '9px 30px 9px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  ✕
                </button>
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </div>

            {/* If Search is Active on Mobile */}
            {searchQuery ? (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                  {lang === 'id' ? `Hasil Pencarian (${searchFilteredSeries.length}):` : `Search Results (${searchFilteredSeries.length}):`}
                </div>
                {searchFilteredSeries.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                    {lang === 'id' ? 'Tidak ada seri yang cocok.' : 'No matching series found.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                    {searchFilteredSeries.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          handleSelectProduct(s);
                          setSearchQuery('');
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: selectedSeries.id === s.id ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                          background: selectedSeries.id === s.id ? '#fee2e2' : '#ffffff',
                          color: selectedSeries.id === s.id ? '#dc2626' : '#0f172a',
                          fontWeight: selectedSeries.id === s.id ? 800 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}
                      >
                        {s.series} - <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{s.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Horizontal Category Chips Carousel */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    {lang === 'id' ? 'Kategori Produk:' : 'Product Category:'}
                  </div>
                  <div className="cat-mobile-chips" style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: '4px',
                    scrollbarWidth: 'none'
                  }}>
                    {BELSA_CATEGORIES.map(cat => {
                      const isCatActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setExpandedCategory(cat);
                            const firstInCat = allSeries.find(s => s.category === cat);
                            if (firstInCat) handleSelectProduct(firstInCat, cat);
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: isCatActive ? 800 : 600,
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            border: isCatActive ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                            background: isCatActive ? '#dc2626' : '#ffffff',
                            color: isCatActive ? '#ffffff' : '#334155',
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                          }}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Series Dropdown Selector */}
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    {lang === 'id' ? 'Pilih Seri Produk:' : 'Select Series:'}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={selectedSeries.id}
                      onChange={(e) => {
                        const found = allSeries.find(s => s.id === e.target.value);
                        if (found) handleSelectProduct(found);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 34px 10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        background: '#ffffff',
                        appearance: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                      }}
                    >
                      {currentCategorySeries.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.series} - {cleanSubTitle(s.subTitle[lang])}
                        </option>
                      ))}
                    </select>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* MAIN PREVIEW AREA */}
          <section id="belsa-catalog-sheet" style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: '0 4px 25px -4px rgba(0,0,0,0.05)'
          }}>

            {/* Top Sheet Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '22px',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '26px',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              {/* Left Side: Title & Subtitle with Category Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <h2 className="cat-hero-title" style={{
                    fontSize: '2.25rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: 0,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                  }}>
                    {selectedSeries.series}
                  </h2>
                  <span style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {selectedSeries.category}
                  </span>
                </div>

                <div style={{ fontSize: '1.02rem', color: '#64748b', fontWeight: 600 }}>
                  {cleanSubTitle(selectedSeries.subTitle[lang])}
                </div>
              </div>

              {/* Right Side: BELSA Official Brand Stamp - Large, Crisp & Symmetrical */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                textAlign: 'right',
                gap: '5px'
              }}>
                <img
                  className="cat-hero-logo"
                  src="/images/logo.webp"
                  alt="BELSA Official Logo"
                  style={{
                    height: '75px',
                    width: 'auto',
                    maxWidth: '280px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))',
                    display: 'block'
                  }}
                />
                <div style={{
                  fontSize: '0.84rem',
                  color: '#475569',
                  fontWeight: 700,
                  letterSpacing: '0.03em'
                }}>
                  PT. Rafitama Millenial Wahyudi
                </div>
              </div>
            </div>

            {/* Top Showcase: 3D Product Image + Features List (Clean 2-Column Layout, No ISO Box) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: '24px',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '26px'
            }}>
              {/* 3D Product Image with Intelligent Skeleton Shimmer */}
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '180px',
                height: '180px',
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {/* Skeleton Shimmer Loading Placeholder ("Skull Loading") */}
                {isImageLoading && (
                  <div
                    className="belsa-image-skeleton"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      zIndex: 2,
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                    }}>
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
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.02em' }}>
                      Memuat Gambar...
                    </span>
                  </div>
                )}

                <img
                  key={selectedSeries.id}
                  src={formatProductImageUrl(selectedSeries.image)}
                  alt={selectedSeries.series}
                  referrerPolicy="no-referrer"
                  onLoad={() => setIsImageLoading(false)}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('googleusercontent.com/d/')) {
                      const fId = target.src.split('/d/')[1]?.split('?')[0];
                      if (fId) {
                        target.src = `https://drive.google.com/thumbnail?id=${fId}&sz=w800`;
                        return;
                      }
                    }
                    target.src = '/images/prod_cylinder_clean.webp';
                    setIsImageLoading(false);
                  }}
                  style={{
                    maxHeight: '175px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.08))',
                    opacity: isImageLoading ? 0 : 1,
                    transform: isImageLoading ? 'scale(0.96)' : 'scale(1)',
                    transition: 'opacity 0.28s ease-out, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 1
                  }}
                />
              </div>

              {/* Key Features List */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                  Fitur & Spesifikasi
                </h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedSeries.features[lang].map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile Quick Action Buttons (Directly below features, thumb-friendly) */}
            <div className="cat-mobile-quick-actions pdf-hide-buttons" style={{
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '22px'
            }}>
              <button
                type="button"
                onClick={handleAddToRfq}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                  cursor: 'pointer'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
                <span>+ {lang === 'id' ? 'Tambah ke Penawaran (RFQ)' : 'Add to RFQ'}</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #16a34a',
                    background: '#15803d',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textDecoration: 'none'
                  }}
                >
                  <span>💬 WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #ef4444',
                    background: isGeneratingPdf ? '#991b1b' : '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: isGeneratingPdf ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📄 {isGeneratingPdf ? 'Membuat...' : 'Unduh PDF'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Toggle Button for How to Order Matrix */}
            <button
              type="button"
              onClick={() => setIsMobileHtoOpen(!isMobileHtoOpen)}
              className="cat-hto-mobile-toggle pdf-hide-buttons"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isMobileHtoOpen ? '#fee2e2' : '#f8fafc',
                border: '1.5px solid #fca5a5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#991b1b',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                marginBottom: '16px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>⚙️</span>
                <span>{lang === 'id' ? 'Tabel Spesifikasi & How to Order' : 'Specification & How to Order Table'}</span>
              </div>
              <span style={{
                fontSize: '0.78rem',
                background: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #fca5a5',
                fontWeight: 700
              }}>
                {isMobileHtoOpen ? (lang === 'id' ? 'Tutup ▲' : 'Close ▲') : (lang === 'id' ? 'Buka Tabel ▼' : 'Open Table ▼')}
              </span>
            </button>

            {/* How to Order Matrix: Always visible on Desktop, collapsible on Mobile */}
            <div className={`cat-hto-container ${isMobileHtoOpen ? 'is-open' : ''}`}>

            {/* Red "How to Order" Ribbon */}
            <div style={{
              background: '#dc2626',
              color: '#fff',
              display: 'inline-block',
              padding: '6px 20px',
              borderRadius: '12px 12px 0 0',
              fontWeight: 800,
              fontSize: '0.92rem',
              letterSpacing: '0.02em',
              marginBottom: '-1px'
            }}>
              How to Order
            </div>

            {/* Outer Box for How to Order Matrix */}
            <div style={{
              border: '1.5px solid #fca5a5',
              borderRadius: '0 16px 16px 16px',
              padding: '24px 20px',
              background: '#ffffff',
              marginBottom: '26px'
            }}>
              
              {/* Dynamic Slots Bar: Exact 1-line PDF layout with circled numbers and grouped styling */}
              <div style={{
                border: '1.5px solid #fecaca',
                borderRadius: '14px',
                padding: '16px 14px',
                marginBottom: '26px',
                background: '#f8fafc',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  minWidth: '100%',
                  gap: '4px',
                  flexWrap: 'nowrap'
                }}>
                  {(() => {
                    const totalSlots = selectedSeries.htoConfig?.totalSlots || 8;
                    const slotDelimiters = selectedSeries.htoConfig?.slotDelimiters;
                    const defaultSep = selectedSeries.htoConfig?.separator ?? '-';
                    const isManySlots = totalSlots >= 10;
                    const boxHeight = isManySlots ? '36px' : '40px';

                    return Array.from({ length: totalSlots }).map((_, idx) => {
                      const slotNum = idx + 1;
                      const val = dynamicSlots[slotNum] || '';

                      // Determine delimiter after this slot (if not the last slot)
                      let delimiterAfter: string | null = null;
                      if (slotNum < totalSlots) {
                        if (slotDelimiters) {
                          delimiterAfter = slotDelimiters[slotNum] !== undefined ? slotDelimiters[slotNum] : '';
                        } else if (defaultSep) {
                          delimiterAfter = defaultSep.trim();
                        }
                      }

                      return (
                        <React.Fragment key={slotNum}>
                          <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <div style={{
                              fontSize: isManySlots ? '0.94rem' : '1.08rem',
                              fontWeight: 800,
                              color: val ? '#dc2626' : '#94a3b8',
                              minWidth: isManySlots ? '36px' : '44px',
                              height: boxHeight,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#fff',
                              border: val ? '2px solid #dc2626' : '1.5px solid #fca5a5',
                              borderRadius: '10px',
                              padding: isManySlots ? '0 6px' : '0 10px',
                              boxShadow: val ? '0 2px 8px rgba(220,38,38,0.18)' : 'none',
                              transition: 'all 0.15s ease',
                              fontFamily: 'var(--belsa-font), sans-serif',
                              lineHeight: 1,
                              boxSizing: 'border-box'
                            }}>
                              <span style={{
                                display: 'inline-block',
                                lineHeight: 1,
                                transform: 'translateY(-1px)',
                                letterSpacing: '0.02em'
                              }}>
                                {val || ''}
                              </span>
                            </div>
                            <span style={{
                              fontSize: isManySlots ? '1.15rem' : '1.35rem',
                              color: '#0f172a',
                              fontWeight: 800,
                              marginTop: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: 1
                            }}>
                              {CIRCLED_NUMBERS[slotNum] || `#${slotNum}`}
                            </span>
                          </div>

                          {delimiterAfter && delimiterAfter.trim() !== '' && (
                            <div style={{
                              fontSize: isManySlots ? '1.25rem' : '1.45rem',
                              fontWeight: 900,
                              color: '#dc2626',
                              height: boxHeight,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 4px',
                              userSelect: 'none',
                              lineHeight: 1,
                              flexShrink: 0
                            }}>
                              <span style={{ display: 'inline-block', lineHeight: 1, transform: 'translateY(-1px)' }}>
                                {delimiterAfter}
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Exact How To Order Tables - Masonry Multi-Column Flow (Padat & Rapi) */}
              <div style={{
                columns: '2 320px',
                columnGap: '16px',
                fontSize: '0.82rem'
              }}>
                {selectedSeries.htoConfig?.blocks?.map((block) => (
                  <div
                    key={block.id}
                    style={{
                      breakInside: 'avoid',
                      marginBottom: '16px',
                      display: 'inline-block',
                      width: '100%',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      verticalAlign: 'top'
                    }}
                  >
                    
                    {/* Block Header */}
                    <div style={{
                      background: '#f8fafc',
                      padding: '8px 14px',
                      fontWeight: 700,
                      borderBottom: '1px solid #e2e8f0',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: '40px',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', lineHeight: 1 }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          lineHeight: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: 'translateY(-0.5px)'
                        }}>
                          {CIRCLED_NUMBERS[block.slotIndex] || `(${block.slotIndex})`}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}>
                          {cleanHtoTitle(block.title)}
                        </span>
                      </span>
                    </div>

                    {/* Display: Table (Compact & Scrollable for dense presentation) */}
                    {block.displayType === 'table' && (() => {
                      const visibleColumns = (block.columns || []).filter((c) => {
                        const normLabel = (c.label || '').toLowerCase().trim();
                        const normId = (c.id || '').toLowerCase().trim();
                        if (normId === 'code' || normLabel === 'kode' || normLabel === 'code' || normLabel === 'symbol' || normLabel === 'simbol' || normId === 'symbol') {
                          return false;
                        }
                        return true;
                      });

                      return (
                        <div style={{ padding: '4px 6px', maxHeight: block.rows.length > 8 ? '260px' : 'none', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem' }}>
                                <th style={{ padding: '8px 8px', verticalAlign: 'middle', lineHeight: 1.2 }}>Code</th>
                                {visibleColumns.length > 0 ? (
                                  visibleColumns.map((c) => (
                                    <th key={c.id} style={{ padding: '8px 8px', verticalAlign: 'middle', lineHeight: 1.2 }}>{cleanColumnLabel(c.label)}</th>
                                  ))
                                ) : (
                                  <th style={{ padding: '8px 8px', verticalAlign: 'middle', lineHeight: 1.2 }}>Description</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {block.rows.map((row) => {
                                const isSel = dynamicSlots[block.slotIndex] === row.code;
                                return (
                                  <tr
                                    key={row.id}
                                    onClick={() => setDynamicSlots({ ...dynamicSlots, [block.slotIndex]: row.code })}
                                    style={{
                                      cursor: 'pointer',
                                      background: isSel ? '#fef2f2' : 'transparent',
                                      borderBottom: '1px solid #f8fafc',
                                      transition: 'background 0.12s ease'
                                    }}
                                  >
                                    <td style={{ padding: '6px 8px', width: '70px', verticalAlign: 'middle' }}>
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '34px',
                                        height: '24px',
                                        padding: '0 8px',
                                        borderRadius: '5px',
                                        background: isSel ? '#fee2e2' : '#f1f5f9',
                                        color: isSel ? '#dc2626' : '#334155',
                                        fontWeight: 800,
                                        fontSize: '0.78rem',
                                        fontFamily: 'var(--belsa-font), monospace',
                                        lineHeight: 1,
                                        boxSizing: 'border-box'
                                      }}>
                                        <span style={{ display: 'inline-block', lineHeight: 1, transform: 'translateY(-0.5px)' }}>
                                          {row.code || 'Nil'}
                                        </span>
                                      </span>
                                    </td>
                                    {visibleColumns.length > 0 ? (
                                      visibleColumns.map((c) => (
                                        <td key={c.id} style={{ padding: '7px 8px', fontSize: '0.78rem', color: isSel ? '#dc2626' : '#475569', fontWeight: isSel ? 700 : 500, verticalAlign: 'middle', lineHeight: 1.35 }}>
                                          {row.values?.[c.id] || row.label || '-'}
                                        </td>
                                      ))
                                    ) : (
                                      <td style={{ padding: '7px 8px', fontSize: '0.78rem', color: isSel ? '#dc2626' : '#475569', fontWeight: isSel ? 700 : 500, verticalAlign: 'middle', lineHeight: 1.35 }}>
                                        {row.label || '-'}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}


                    {/* Display: Chips (e.g. Bore sizes) */}
                    {block.displayType === 'chips' && (
                      <div style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {block.chipValues?.map((chip) => {
                          const isSel = dynamicSlots[block.slotIndex] === String(chip);
                          return (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setDynamicSlots({ ...dynamicSlots, [block.slotIndex]: String(chip) })}
                              style={{
                                flex: '1 0 50px',
                                minHeight: '38px',
                                padding: '0 10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                border: isSel ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                                background: isSel ? '#dc2626' : '#fff',
                                color: isSel ? '#fff' : '#0f172a',
                                fontWeight: 800,
                                fontSize: '0.84rem',
                                lineHeight: 1,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <span style={{ display: 'inline-block', lineHeight: 1, transform: 'translateY(-0.5px)' }}>
                                Ø{chip}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Display: Stroke Matrix */}
                    {block.displayType === 'stroke_matrix' && (
                      <div style={{ padding: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: '6px', marginBottom: '10px' }}>
                          {block.standardStrokes?.map((stk) => {
                            const isSel = dynamicSlots[block.slotIndex] === String(stk);
                            return (
                              <button
                                key={stk}
                                type="button"
                                onClick={() => {
                                  setDynamicSlots({ ...dynamicSlots, [block.slotIndex]: String(stk) });
                                  setDynamicStrokeInput('');
                                }}
                                style={{
                                  height: '28px',
                                  padding: '0 4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '6px',
                                  border: isSel ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                                  background: isSel ? '#dc2626' : '#f8fafc',
                                  color: isSel ? '#fff' : '#334155',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  lineHeight: 1,
                                  cursor: 'pointer',
                                  textAlign: 'center'
                                }}
                              >
                                <span style={{ display: 'inline-block', lineHeight: 1, transform: 'translateY(-0.5px)' }}>
                                  {stk}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Stroke Input */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, lineHeight: 1 }}>
                            Custom (Max {block.maxStroke || 2000}mm):
                          </span>
                          <input
                            type="number"
                            placeholder="Input stroke..."
                            value={dynamicStrokeInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDynamicStrokeInput(val);
                              if (val.trim()) {
                                setDynamicSlots({ ...dynamicSlots, [block.slotIndex]: val });
                              }
                            }}
                            style={{
                              flex: 1,
                              height: '28px',
                              padding: '0 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.78rem',
                              fontFamily: 'var(--belsa-font), sans-serif',
                              lineHeight: '28px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>

            </div>

            {/* Action Bar (Configured Model Code, Copy, Print, WhatsApp) */}
            <div style={{
              background: '#0f172a',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {/* Top Tier: Model Code on Left, Utility Buttons (Copy & Print) on Right */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px', lineHeight: 1 }}>
                    KODE MODEL:
                  </span>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--belsa-font), monospace', color: '#38bdf8', letterSpacing: '0.04em', lineHeight: 1.2, display: 'inline-block' }}>
                    {activeModelCode}
                  </span>
                </div>

                <div className="pdf-hide-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Salin Kode Button */}
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      background: isCopied ? '#22c55e' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isCopied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>

                  {/* Cetak Button */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    <span>Cetak</span>
                  </button>
                </div>
              </div>

              {/* Bottom Tier: 3 Primary Action Buttons in a balanced grid */}
              <div className="pdf-hide-buttons" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '12px',
                marginTop: '16px'
              }}>
                {/* 1. Add to RFQ Cart */}
                <button
                  type="button"
                  onClick={handleAddToRfq}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid #3b82f6',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Tambahkan seri dan kode model ini ke daftar permintaan penawaran (RFQ)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="M12 11h4" />
                    <path d="M12 16h4" />
                    <path d="M8 11h.01" />
                    <path d="M8 16h.01" />
                  </svg>
                  <span>+ Tambah ke Penawaran (RFQ)</span>
                </button>

                {/* 2. Download PDF Datasheet */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid #ef4444',
                    background: isGeneratingPdf ? '#991b1b' : '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: isGeneratingPdf ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                    transition: 'all 0.15s ease',
                    opacity: isGeneratingPdf ? 0.85 : 1
                  }}
                  title="Unduh datasheet BELSA dalam format PDF"
                >
                  {isGeneratingPdf ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      <span>Memproses PDF...</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="12" y2="18" />
                        <line x1="15" y1="15" x2="12" y2="18" />
                      </svg>
                      <span>Unduh Datasheet PDF</span>
                    </>
                  )}
                </button>

                {/* 3. WhatsApp Order */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid #22c55e',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>Pesan via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Dedicated PDF & Print Official Footer (Hidden on Web Screen, Rendered on PDF/Print) */}
            <div className="pdf-show-footer" style={{ display: 'none', marginTop: '22px' }}>
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9f1239', marginBottom: '4px' }}>
                  PESANAN CUSTOM & KONSULTASI TEKNIS BELSA:
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                  Workshop PT. Rafitama Millenial Wahyudi dilengkapi mesin bubut, CNC, dan honing. Kami menerima pembuatan silinder dengan stroke dan bore khusus, penggantian seal kit, serta overhaul silinder.
                </div>
              </div>

              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                color: '#64748b'
              }}>
                <div>
                  <strong>PT. Rafitama Millenial Wahyudi</strong> • Hotline: +62 811-1916-8752 • Email: sales@rafitama.com • www.belsa.co.id
                </div>
                <div style={{ fontWeight: 800, color: '#dc2626' }}>
                  BELSA Fluid Power Systems • Official Technical Datasheet
                </div>
              </div>
            </div>

          </section>

        </div>
      </section>


      {/* Scoped CSS for Print-to-PDF & Responsive */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media print {
          header,
          footer,
          .cat-sidebar-no-print,
          .btn-floating-wa,
          nav,
          .belsa-page-header,
          .pdf-hide-buttons {
            display: none !important;
          }
          .pdf-show-footer {
            display: block !important;
          }
          body, main {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .belsa-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          #belsa-catalog-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 10px !important;
            width: 100% !important;
          }
        }
        @media (max-width: 1100px) {
          #belsa-catalog-sheet > div:nth-of-type(2) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 991px) {
          .belsa-container {
            grid-template-columns: 1fr !important;
          }
          .cat-sidebar-no-print {
            position: static !important;
          }
          #belsa-catalog-sheet {
            padding: 20px 14px !important;
          }
          #belsa-catalog-sheet > div:nth-of-type(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
