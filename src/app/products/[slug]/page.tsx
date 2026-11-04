'use client';

import React, { use, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { BELSA_CATALOGUE_FULL, BelsaProductSeries } from '@/data/belsaCatalogueFull';
import { useRfq } from '@/context/RfqContext';
import { formatProductImageUrl } from '@/lib/imageUtils';

interface Props {
  params: Promise<{ slug: string }>;
}

const DELETED_SERIES_IDS = new Set([
  'diverter_valve', 'bsp', 'cl_series', 'npp-nhpu', 'bhreb_20es_1',
  'd_nipple', 'double_nipple', 'fitting', 'r1at', 'r2at', 'rejseries',
  'bwe_series', 'tubing', 'rotary'
]);

function getProductQuickSpecs(item: BelsaProductSeries, isId: boolean): string[] {
  const specs: string[] = [];
  const featList = isId ? item.features?.id : item.features?.en;

  if (featList && Array.isArray(featList)) {
    for (const f of featList) {
      if (specs.length >= 2) break;
      let clean = f.trim()
        .replace(/^[-•*]\s*/, '')
        .replace(/\.$/, '')
        .replace(/\s+/g, ' ');

      if (clean.length > 52) {
        clean = clean.substring(0, 49).trim() + '...';
      }

      if (!specs.includes(clean)) {
        specs.push(clean);
      }
    }
  }

  return specs;
}

export default function ProductCategoryPage({ params }: Props) {
  const { slug } = use(params);
  const { lang } = useLanguage();
  const isId = lang === 'id';
  const t = translations[lang].productsPage;
  const { addItem, setIsDrawerOpen } = useRfq();

  // Sub-category active filter state
  const [activeSubCat, setActiveSubCat] = useState<string>('all');

  // Mobile popup state when clicking Specifications
  const [desktopModalItem, setDesktopModalItem] = useState<BelsaProductSeries | null>(null);

  const handleSpecClick = (e: React.MouseEvent, item: BelsaProductSeries) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 991) {
      e.preventDefault();
      setDesktopModalItem(item);
    }
  };

  // Live Catalog loaded from /api/catalogue (defaults to master BELSA_CATALOGUE_FULL minus deleted items)
  const [activeCatalogue, setActiveCatalogue] = useState<BelsaProductSeries[]>(() =>
    BELSA_CATALOGUE_FULL.filter((item) => !DELETED_SERIES_IDS.has(item.id))
  );

  useEffect(() => {
    let isMounted = true;
    fetch('/api/catalogue')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setActiveCatalogue(json.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching live catalogue for category page:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Technical category classifications (3 core pillars)
  const categoryEyebrow: Record<string, { id: string; en: string }> = {
    'silinder-hidrolik-pneumatik': {
      id: 'Silinder Pneumatik & Hidrolik',
      en: 'Industrial Pneumatic & Hydraulic Actuators'
    },
    'selang-hidrolik-industri': {
      id: 'Selang Hidrolik & Fitting',
      en: 'High-Pressure Fluid Conveyance & Lines'
    },
    'process-valve': {
      id: 'Valve Pengatur Arah, Tekanan & Aliran',
      en: 'Directional, Pressure & Flow Process Control'
    }
  };

  // Category metadata & catalog mapping
  const categoryConfig: Record<string, {
    catNames?: string[];
    filter?: (item: BelsaProductSeries) => boolean;
    image: string;
    heroBg?: string;
    highlights: { id: string[]; en: string[] };
    subCategories?: { key: string; labelId: string; labelEn: string; matchCategory: string }[];
  }> = {
    'silinder-hidrolik-pneumatik': {
      catNames: ['Air Cylinder', 'Hydraulic Cylinder', 'Water Cylinder'],
      image: '/images/prod_cylinder_clean.webp',
      heroBg: '/images/facility_rafitama_technicians.webp',
      subCategories: [
        { key: 'Air Cylinder', labelId: 'Silinder Pneumatik', labelEn: 'Air / Pneumatic', matchCategory: 'Air Cylinder' },
        { key: 'Hydraulic Cylinder', labelId: 'Silinder Hidrolik', labelEn: 'Hydraulic Cylinder', matchCategory: 'Hydraulic Cylinder' },
        { key: 'Water Cylinder', labelId: 'Silinder Air', labelEn: 'Water Cylinder', matchCategory: 'Water Cylinder' }
      ],
      highlights: {
        id: [
          'Tabung hasil honing dan piston rod berlapis hard chrome',
          'Seal dipilih sesuai tekanan, suhu, dan jenis fluida',
          'Pengerjaan bubut dan CNC di workshop kami',
          'Bisa dibuat sesuai drawing atau sample'
        ],
        en: [
          'Honed Tube ST52 / STKM13C high-pressure cylinder barrels (Ra ≤ 0.4 µm)',
          'Piston rod with Hard Chrome Plated surface (min. 20-30 microns)',
          'International premium seals: NOK, Parker, or Hallite (ISO standard)',
          'Precision lathe & CNC tolerance within ±0.02 mm'
        ]
      }
    },
    'selang-hidrolik-industri': {
      catNames: ['Hose, Fittings & Pipe Accessories'],
      image: '/images/prod_hose_clean.webp',
      heroBg: '/images/facility_hose_warehouse.webp',
      highlights: {
        id: [
          'Selang hidrolik tipe 1SN, 2SN, 4SP, dan 4SH',
          'Crimping hose dan fitting dikerjakan di workshop',
          'Tersedia steam hose dan selang tahan bahan kimia',
          'Panjang selang dan jenis fitting sesuai kebutuhan'
        ],
        en: [
          'High-tensile wire braid & spiral hoses: 1SN, 2SN, 4SP, 4SH (up to 450 bar)',
          'Modern hydraulic hose crimping machines with leak-free fitting terminations',
          'High-temperature steam hoses and chemical-resistant flexible hoses',
          '100% hydrostatic pressure test inspection certificate provided'
        ]
      }
    },
    'process-valve': {
      catNames: ['Industrial & Hydraulic Valve', 'Industrial Brake & Clutch'],
      image: '/images/prod_valve_clean.webp',
      heroBg: '/images/facility_metrology_inspection.webp',
      subCategories: [
        { key: 'Industrial & Hydraulic Valve', labelId: 'Valve Hidrolik & Industri', labelEn: 'Hydraulic & Industrial Valves', matchCategory: 'Industrial & Hydraulic Valve' },
        { key: 'Industrial Brake & Clutch', labelId: 'Industrial Brake & Clutch', labelEn: 'Industrial Brake & Clutch', matchCategory: 'Industrial Brake & Clutch' }
      ],
      highlights: {
        id: [
          'Directional control valve (B4WE6, B4WE10) dengan interface Cetop / ISO',
          'Proportional valve dan servo valve untuk pengaturan aliran',
          'Check valve, modular relief, counter balance, dan throttle valve',
          'Solenoid valve untuk mesin dengan siklus kerja terus-menerus'
        ],
        en: [
          'Directional control valves (B4WE6, B4WE10) meeting Cetop / ISO standards',
          'Proportional and servo-valves for precision fluid modulation',
          'Check valves, modular relief, counter balance & throttle flow valves',
          'Rapid response electrical solenoids engineered for 24/7 duty cycles'
        ]
      }
    }
  };

  const productItem = t.items.find((it) => it.slug === slug);
  const currentConfig = categoryConfig[slug];

  // Base list of related products for this category
  const allCategoryItems: BelsaProductSeries[] = useMemo(() => {
    if (!currentConfig) return [];
    return activeCatalogue
      .filter((item) => {
        if (DELETED_SERIES_IDS.has(item.id)) return false;
        if (currentConfig.filter) {
          return currentConfig.filter(item);
        }
        if (currentConfig.catNames) {
          return currentConfig.catNames.includes(item.category);
        }
        return false;
      })
      .sort((a, b) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));
  }, [currentConfig, activeCatalogue]);

  // Filtered list based on active sub-category pill
  const displayedItems: BelsaProductSeries[] = useMemo(() => {
    if (activeSubCat === 'all') return allCategoryItems;
    return allCategoryItems.filter((item) => item.category === activeSubCat);
  }, [allCategoryItems, activeSubCat]);

  if (!productItem || !currentConfig) {
    return (
      <main style={{ padding: '80px 0', minHeight: '60vh', textAlign: 'center' }}>
        <div className="belsa-container">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <h1 className="heading-hero" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>
            {isId ? 'Kategori Produk Tidak Ditemukan' : 'Product Category Not Found'}
          </h1>
          <p style={{ color: 'var(--belsa-gray)', marginBottom: '24px' }}>
            {isId
              ? `Kategori ini tidak ada di katalog BELSA.`
              : `The requested product category was not found in the BELSA catalogue.`}
          </p>
          <Link href="/products" className="btn-belsa-primary">
            {isId ? 'Kembali ke Kategori Produk' : 'Back to Product Categories'}
          </Link>
        </div>
      </main>
    );
  }

  const waText = isId
    ? `Halo tim teknis BELSA, saya ingin konsultasi spesifikasi produk ${productItem.title}.`
    : `Hello BELSA engineering team, I would like to consult regarding product specifications for ${productItem.title}.`;
  const waUrl = `https://wa.me/6281119168752?text=${encodeURIComponent(waText)}`;

  const otherCategories = t.items.filter((it) => it.slug !== slug);

  const scrollToSeries = () => {
    const el = document.getElementById('daftar-seri');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main style={{ padding: '0 0 60px' }}>
      {/* Full-Bleed Edge-to-Edge Split Hero (Clean text left, 3 technicians clearly visible right) */}
      <section className="belsa-product-hero-split">
        {/* Right Half: Authentic Facility Photo with Soft Left Fade */}
        <div className="belsa-product-hero-bg">
          <img
            src={currentConfig.heroBg || '/images/facility_rafitama_technicians.webp'}
            alt={productItem.title}
          />
        </div>

        {/* Content Container (Left-aligned, zero overlap with technicians) */}
        <div className="belsa-container" style={{ width: '100%', position: 'relative', zIndex: 2, padding: '48px 24px 54px' }}>
          {/* Breadcrumbs inside hero top */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.86rem',
            color: '#94A3B8',
            marginBottom: '26px',
            flexWrap: 'wrap'
          }}>
            <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              {isId ? 'Beranda' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/products" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              {isId ? 'Produk' : 'Products'}
            </Link>
            <span>/</span>
            <span style={{ color: '#F87171', fontWeight: 600 }}>{productItem.title}</span>
          </nav>

          <div style={{ maxWidth: '490px' }}>
            {/* Engineering Eyebrow Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(239, 68, 68, 0.22)',
                color: '#FECACA',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
              }}>
                {categoryEyebrow[slug]?.[lang] || (isId ? 'Hidrolik & Pneumatik' : 'Industrial Fluid Power')}
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                color: '#F8FAFC',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                ISO 9001:2015 Certified
              </span>
            </div>

            <h1 className="heading-hero" style={{
              fontSize: 'clamp(2.1rem, 3.8vw, 3rem)',
              marginBottom: '18px',
              lineHeight: 1.2,
              color: '#FFFFFF',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
            }}>
              {productItem.title}
            </h1>

            <p style={{
              color: '#E2E8F0',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              marginBottom: '32px',
              fontWeight: 400,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)'
            }}>
              {productItem.desc}
            </p>

            {/* Action Button: Bright Red WhatsApp Consult ONLY */}
            <div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-belsa-primary belsa-mobile-full-btn belsa-btn-sheen"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 30px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--belsa-red)',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 20px rgba(211, 35, 42, 0.5)',
                  textDecoration: 'none'
                }}
              >
                <span>{isId ? 'Konsultasi Teknis' : 'Consult Technical Engineer'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Associated Products Section */}
      <section id="daftar-seri" style={{ marginBottom: '60px', background: '#F8FAFC', padding: '54px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="belsa-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="belsa-page-eyebrow" style={{ marginBottom: '4px', display: 'inline-block' }}>
                {isId ? 'Katalog Teknis' : 'Official Engineering Catalogue'}
              </span>
              <h2 className="heading-section" style={{ fontSize: '1.65rem', margin: 0 }}>
                {isId ? (
                  <>
                    Daftar Seri <span style={{ color: 'var(--belsa-red)' }}>{productItem.title}</span>
                  </>
                ) : (
                  <>
                    Technical Series in <span style={{ color: 'var(--belsa-red)' }}>{productItem.title}</span>
                  </>
                )}
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.94rem', margin: '6px 0 0' }}>
                {isId
                  ? `Tersedia ${allCategoryItems.length} seri produk, lengkap dengan data teknis dan How To Order.`
                  : `Registered ${allCategoryItems.length} product series with technical datasheets and How To Order matrices.`}
              </p>
            </div>

            <Link href="/catalogue" className="belsa-btn belsa-btn-outline hide-on-mobile" style={{ fontSize: '0.86rem' }}>
              {isId ? 'Lihat Katalog Lengkap →' : 'Explore Full Interactive Catalogue →'}
            </Link>
          </div>

          {/* Sub-Category Filter Pills (only when multiple sub-categories exist) */}
          {currentConfig.subCategories && currentConfig.subCategories.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '26px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setActiveSubCat('all')}
                className="belsa-topic-chip"
                style={{
                  background: activeSubCat === 'all' ? '#0F172A' : '#FFFFFF',
                  color: activeSubCat === 'all' ? '#FFFFFF' : '#475569',
                  border: activeSubCat === 'all' ? '1px solid #0F172A' : '1px solid #E2E8F0',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {isId ? `Semua (${allCategoryItems.length})` : `All (${allCategoryItems.length})`}
              </button>

              {currentConfig.subCategories.map((sub) => {
                const count = allCategoryItems.filter((it) => it.category === sub.matchCategory).length;
                const isActive = activeSubCat === sub.matchCategory;
                return (
                  <button
                    key={sub.key}
                    type="button"
                    onClick={() => setActiveSubCat(sub.matchCategory)}
                    className="belsa-topic-chip"
                    style={{
                      background: isActive ? '#0F172A' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#475569',
                      border: isActive ? '1px solid #0F172A' : '1px solid #E2E8F0',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isId ? sub.labelId : sub.labelEn} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Product Series Grid */}
          {displayedItems.length > 0 ? (
            <div key={activeSubCat} className="belsa-grid-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
              {displayedItems.map((item) => {
                const specs = getProductQuickSpecs(item, isId);
                const catalogueHref = `/catalogue?series=${item.slug || item.id}`;

                return (
                  <div
                    key={item.id}
                    className="belsa-series-card"
                  >
                    <div>
                      {/* Header info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{
                          background: '#FEF2F2',
                          color: 'var(--belsa-red)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(211, 35, 42, 0.15)'
                        }}>
                          {item.code}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}>
                          {item.category}
                        </span>
                      </div>

                      {/* Image - Clickable to Specs */}
                      <Link
                        href={catalogueHref}
                        className="belsa-series-img-wrap"
                        title={item.series}
                        onClick={(e) => handleSpecClick(e, item)}
                      >
                        <img
                          src={formatProductImageUrl(item.image)}
                          alt={item.series}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="belsa-series-img"
                        />
                      </Link>

                      {/* Title - Clickable to Specs */}
                      <Link
                        href={catalogueHref}
                        className="belsa-series-name"
                        onClick={(e) => handleSpecClick(e, item)}
                      >
                        {item.series}
                      </Link>

                      <p style={{ fontSize: '0.83rem', color: '#64748B', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {isId ? item.subTitle?.id : item.subTitle?.en}
                      </p>

                      {/* Quick Tech Specs Chips (Point 4) */}
                      {specs.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          margin: '8px 0 14px',
                          paddingTop: '10px',
                          borderTop: '1px solid #F1F5F9'
                        }}>
                          {specs.map((spec, sIdx) => (
                            <div
                              key={sIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.76rem',
                                color: '#475569',
                                fontWeight: 600,
                                lineHeight: 1.3
                              }}
                            >
                              <span style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                background: 'var(--belsa-red)',
                                flexShrink: 0
                              }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {spec}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Improved Buttons UI */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F8FAFC' }}>
                      <Link
                        href={catalogueHref}
                        className="belsa-btn-spec"
                        title={isId ? 'Lihat Spesifikasi & How To Order' : 'View Specifications & How To Order'}
                        onClick={(e) => handleSpecClick(e, item)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span>{isId ? 'Spesifikasi' : 'Specs'}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            id: item.id,
                            series: item.series,
                            code: item.code,
                            category: item.category,
                            image: item.image,
                            quantity: 1,
                          });
                          setIsDrawerOpen(true);
                        }}
                        className="belsa-btn-rfq"
                        title={isId ? 'Tambah ke Permintaan Penawaran (RFQ)' : 'Add to RFQ List'}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>RFQ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--belsa-gray)' }}>
              {isId ? 'Belum ada seri untuk filter ini.' : 'No series found for this filter.'}
            </div>
          )}
        </div>
      </section>

      {/* Other Categories Navigation */}
      <section style={{ marginBottom: '60px' }}>
        <div className="belsa-container">
          <h2 className="heading-section" style={{ fontSize: '1.45rem', marginBottom: '22px' }}>
            {isId ? (
              <>
                Kategori Produk <span style={{ color: 'var(--belsa-red)' }}>Lainnya</span>
              </>
            ) : (
              <>
                Other Product <span style={{ color: 'var(--belsa-red)' }}>Categories</span>
              </>
            )}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {otherCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products/${cat.slug}`}
                className="belsa-card"
                style={{ textDecoration: 'none', color: 'inherit', padding: '22px', borderRadius: '16px' }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#FEF2F2',
                  color: 'var(--belsa-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--belsa-dark)' }}>
                  {cat.title}
                </h3>
                <p style={{ fontSize: '0.83rem', color: '#64748B', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {cat.desc}
                </p>
                <span className="link-learn-more" style={{ fontSize: '0.82rem' }}>
                  {isId ? 'Lihat Kategori' : 'Explore Category'} &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Engineering Consultation Box */}
      <section style={{ paddingBottom: '30px' }}>
        <div className="belsa-container">
          <div
            className="belsa-cta-box-mobile belsa-reveal"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              padding: '36px 32px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <span className="belsa-page-eyebrow" style={{ marginBottom: '6px', display: 'inline-block' }}>
                {isId ? 'Konsultasi Fabrikasi & Drawing' : 'Custom Engineering & Drawing Inquiries'}
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--belsa-dark)', margin: '0 0 6px 0' }}>
                {isId ? `Butuh ${productItem.title} Ukuran Khusus?` : `Require Custom ${productItem.title}?`}
              </h3>
              <p style={{ color: '#64748B', margin: 0, fontSize: '0.94rem', maxWidth: '640px', lineHeight: 1.6 }}>
                {isId
                  ? 'Kirim drawing, sample, atau spesifikasi khusus Anda ke tim teknis PT. Rafitama Millenial Wahyudi.'
                  : 'Discuss your CAD drawings, physical samples, or bespoke technical specifications with our engineering team.'}
              </p>
            </div>
            <div className="belsa-cta-box-btns" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/contact-us" className="btn-belsa-primary">
                {isId ? 'Hubungi Tim Teknis' : 'Contact Engineering Team'} &rarr;
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-belsa-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Popup Modal for Specifications / Catalogue Feature */}
      {desktopModalItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setDesktopModalItem(null)}
            className="belsa-modal-backdrop-anim"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Popup Card */}
          <div
            role="dialog"
            aria-modal="true"
            className="belsa-modal-card-anim"
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '380px',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px 24px 24px',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.22)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setDesktopModalItem(null)}
              aria-label={isId ? 'Tutup' : 'Close'}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Desktop Monitor Icon */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: 'var(--belsa-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>

            {/* Series Tag */}
            <div style={{ marginBottom: '10px' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: '#F1F5F9',
                  color: '#334155',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                {desktopModalItem.series} ({desktopModalItem.code})
              </span>
            </div>

            <h3
              style={{
                fontSize: '1.18rem',
                fontWeight: 800,
                color: 'var(--belsa-dark)',
                margin: '0 0 10px',
                lineHeight: 1.3,
              }}
            >
              {isId ? 'Optimal pada Mode Desktop' : 'Best Viewed on Desktop'}
            </h3>

            <p
              style={{
                fontSize: '0.88rem',
                color: '#64748B',
                lineHeight: 1.6,
                margin: '0 0 22px',
              }}
            >
              {isId
                ? 'Tabel spesifikasi teknis, gambar dimensi, serta konfigurator "How To Order" dirancang untuk tampilan layar lebar. Silakan buka halaman ini melalui perangkat desktop atau laptop untuk mengakses fitur katalog interaktif.'
                : 'Interactive technical datasheets, dimensional blueprints, and the "How To Order" configurator are designed for larger screens. Please switch to a desktop or laptop to explore full product specifications.'}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDesktopModalItem(null)}
                className="btn-belsa-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.9rem' }}
              >
                {isId ? 'Mengerti, Tutup' : 'Got It, Close'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const item = desktopModalItem;
                  setDesktopModalItem(null);
                  addItem({
                    id: item.id,
                    series: item.series,
                    code: item.code,
                    category: item.category,
                    image: item.image,
                    quantity: 1,
                  });
                  setIsDrawerOpen(true);
                }}
                className="btn-belsa-outline"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 18px', fontSize: '0.85rem' }}
              >
                {isId ? '+ Tambah Seri Ini ke RFQ' : '+ Add This Series to RFQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
