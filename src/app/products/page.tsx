'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { formatProductImageUrl } from '@/lib/imageUtils';
import TwoToneTitle from '@/components/TwoToneTitle';
import SkullShimmerImage from '@/components/SkullShimmerImage';

export default function ProductsPage() {
  const { lang } = useLanguage();
  const t = translations[lang].productsPage;

  const productImages: Record<string, string> = {
    'silinder-hidrolik-pneumatik': '/images/prod_cylinder_clean.webp',
    'selang-hidrolik-industri': '/images/prod_hose_clean.webp',
    'process-valve': '/images/prod_valve_clean.webp',
  };

  return (
    <main style={{ padding: '50px 0 60px' }}>
      {/* Unified Page Header */}
      <section className="belsa-page-header belsa-reveal">
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
                Komponen Hidrolik <span style={{ color: 'var(--belsa-red)' }}>& Pneumatik</span> untuk Mesin Industri
              </>
            ) : (
              <>
                Precision Components <span style={{ color: 'var(--belsa-red)' }}>& Engineering Solutions</span> for Industrial Fluid Power
              </>
            )}
          </h1>
          <p className="subhead" style={{ maxWidth: '780px', margin: '0 auto' }}>
            {t.heroSub}
          </p>
        </div>
      </section>

      {/* Overview & Technical Capabilities */}
      <section style={{ marginBottom: '56px' }}>
        <div className="belsa-container belsa-grid-2col">
          <div className="belsa-reveal">
            <h2 className="heading-section belsa-mobile-center-heading" style={{ marginBottom: '16px' }}>
              <TwoToneTitle text={t.overviewTitle} />
            </h2>
            <p style={{ color: 'var(--belsa-gray)', lineHeight: 1.8, fontSize: '1.02rem', margin: 0 }}>
              {t.overviewText}
            </p>
          </div>

          <div
            className="belsa-quality-card belsa-reveal belsa-stagger-2"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--belsa-border)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '16px'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--belsa-dark)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
              {lang === 'id' ? 'Standar Mutu & Kemampuan Fabrikasi' : 'Quality Standards & Fabrication Capability'}
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li className="belsa-stagger-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--belsa-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong>{lang === 'id' ? 'Pemesinan CNC & Bubut:' : 'High-Precision Machining:'}</strong> {lang === 'id' ? 'Komponen dikerjakan di workshop kami dengan mesin CNC dan mesin bubut.' : 'Precision CNC & lathe machining tolerances up to ±0.02 mm for dimensional reliability.'}</span>
              </li>
              <li className="belsa-stagger-2" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--belsa-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong>{lang === 'id' ? 'Material:' : 'Industrial Grade Materials:'}</strong> {lang === 'id' ? 'Tabung hasil honing dan piston rod berlapis hard chrome. Material disesuaikan dengan aplikasi.' : 'Honed ST52 / S45C barrel tubes with Hard Chrome plated piston rods (min 25 µm).'}</span>
              </li>
              <li className="belsa-stagger-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--belsa-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong>{lang === 'id' ? 'Tekanan Kerja:' : 'Operating Pressure Range:'}</strong> {lang === 'id' ? 'Tersedia untuk tekanan kerja standar sampai heavy-duty, sesuai kebutuhan mesin Anda.' : 'Operating capacities from standard 70 Bar to heavy-duty 350 Bar for severe plant environments.'}</span>
              </li>
              <li className="belsa-stagger-4" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--belsa-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong>{lang === 'id' ? 'Pemeriksaan Mutu:' : '100% Quality Assurance:'}</strong> {lang === 'id' ? 'Unit diperiksa sebelum dikirim, mengikuti sistem manajemen mutu ISO 9001:2015.' : 'Full 1.5x working pressure hydrostatic test prior to dispatch guaranteeing zero-leak operation.'}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Symmetrical Products Grid */}
      <section style={{ marginBottom: '70px' }}>
        <div className="belsa-container">
          <h2 className="heading-section belsa-reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <TwoToneTitle text={t.listTitle} />
          </h2>
          <div className="belsa-grid-3col">
            {t.items.map((p, idx) => (
              <Link key={idx} href={`/products/${p.slug}`} className={`belsa-card belsa-reveal belsa-stagger-${(idx % 3) + 1}`}>
                <div className="belsa-card-img-wrap" style={{ position: 'relative' }}>
                  <SkullShimmerImage
                    src={productImages[p.slug]}
                    alt={p.title}
                    width={320}
                    height={220}
                    label={lang === 'id' ? 'Memuat Gambar...' : 'Loading Image...'}
                  />
                </div>
                <h3 className="heading-card belsa-prod-card-title" style={{ minHeight: '48px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.title}
                </h3>
                <p className="belsa-prod-card-desc" style={{ color: 'var(--belsa-gray)', fontSize: '0.9rem', marginTop: '8px', minHeight: '52px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                  {p.desc}
                </p>
                <span className="link-learn-more" style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  {lang === 'id' ? 'Lihat Kategori' : 'Explore Category'} &rarr;
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
                {lang === 'id' ? 'Konsultasi Fabrikasi & Drawing' : 'Custom Engineering & Drawing Inquiries'}
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--belsa-dark)', margin: '0 0 6px 0' }}>
                {lang === 'id' ? 'Butuh Komponen dengan Spesifikasi Khusus?' : 'Require Custom Specifications or Bespoke Fabrication?'}
              </h3>
              <p style={{ color: 'var(--belsa-gray)', margin: 0, fontSize: '0.94rem', maxWidth: '640px', lineHeight: 1.6 }}>
                {lang === 'id'
                  ? 'Kirim drawing, sample, atau kebutuhan overhaul komponen mesin Anda. Tim teknis PT. Rafitama Millenial Wahyudi akan membantu menghitung dan menyiapkan penawaran.'
                  : 'Discuss your CAD drawings, physical samples, or industrial machinery overhaul requirements with our engineering team.'}
              </p>
            </div>
            <div className="belsa-cta-box-btns" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/contact-us" className="btn-belsa-primary">
                {lang === 'id' ? 'Hubungi Tim Teknis' : 'Contact Engineering Team'} &rarr;
              </Link>
              <a
                href="https://wa.me/6281119168752"
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
    </main>
  );
}
