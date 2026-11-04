'use client';

import React from 'react';
import Link from 'next/link';
import MetricsBar from '@/components/MetricsBar';
import VideoPlayer from '@/components/VideoPlayer';
import RafitamaLink from '@/components/RafitamaLink';
import TwoToneTitle from '@/components/TwoToneTitle';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

export default function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <main>
      {/* Hero Section */}
      <section className="belsa-section" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)' }}>
        <div className="belsa-container belsa-grid-hero">
          <div className="belsa-hero-text-mobile belsa-reveal">
            <h1 className="heading-hero" style={{ color: 'var(--belsa-dark)', marginBottom: '20px' }}>
              {lang === 'id' ? (
                <>
                  Manufaktur Silinder <span style={{ color: 'var(--belsa-red)' }}>Hidrolik & Pneumatik</span>
                </>
              ) : (
                <>
                  Hydraulic & Pneumatic <span style={{ color: 'var(--belsa-red)' }}>Cylinder Manufacturer</span>
                </>
              )}
            </h1>
            <p className="subhead" style={{ marginBottom: '32px', maxWidth: '520px' }}>
              {t.hero.subtitle}
            </p>
            <div className="belsa-hero-btns" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-belsa-primary belsa-btn-sheen">
                {t.hero.btnExplore} &rarr;
              </Link>
              <Link href="/contact-us" className="btn-belsa-outline">
                {t.hero.btnContact}
              </Link>
            </div>
          </div>
          <div className="belsa-hero-cylinder-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src="/images/hero_cylinder_user.webp"
              alt="Hydraulic and Pneumatic Cylinder Precision Engineering"
              className="belsa-hero-cylinder-anim"
              style={{ maxHeight: '440px', width: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      </section>

      {/* Metrics Counter Bar */}
      <MetricsBar />

      {/* We Are Belsa Section */}
      <section className="belsa-section belsa-about-section" style={{ paddingBottom: 0, overflow: 'hidden' }}>
        <div className="belsa-container belsa-about-grid">
          <div className="belsa-about-text belsa-reveal">
            <h2 className="heading-section belsa-mobile-center-heading" style={{ marginBottom: '16px' }}>
              <TwoToneTitle text={t.weAreBelsa.title} />
            </h2>
            <p style={{ color: 'var(--belsa-gray)', lineHeight: 1.8, marginBottom: '24px', fontSize: '1.05rem' }}>
              {t.weAreBelsa.desc1}{' '}
              <RafitamaLink>{t.weAreBelsa.companyName}</RafitamaLink>
              {t.weAreBelsa.desc2}
            </p>
            <Link href="/about-us" className="btn-belsa-primary belsa-mobile-full-btn">
              {t.weAreBelsa.btnMore} &rarr;
            </Link>
          </div>
          <div className="belsa-about-img-wrap belsa-reveal belsa-stagger-2">
            <img
              src="/images/about_technician.webp"
              alt="Teknisi PT Rafitama Millenial Wahyudi memegang Silinder Pneumatik BELSA"
            />
          </div>
        </div>
      </section>

      {/* Our Products Section (4-column grid on desktop) */}
      <section className="belsa-section" style={{ backgroundColor: 'var(--belsa-bg-soft)' }}>
        <div className="belsa-container">
          <div className="belsa-reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="heading-section" style={{ marginBottom: '12px' }}>
              <TwoToneTitle text={t.homeProducts.title} />
            </h2>
            <p className="subhead">{t.homeProducts.subtitle}</p>
          </div>
          
          <div className="belsa-grid-3col" style={{ marginBottom: '40px' }}>
            {/* 1. Hydraulic & Pneumatic Cylinder */}
            <Link href="/products/silinder-hidrolik-pneumatik" className="belsa-card belsa-reveal belsa-stagger-1">
              <div className="belsa-card-img-wrap">
                <img src="/images/prod_cylinder_clean.webp" alt="Silinder Hidrolik & Pneumatik BELSA" loading="lazy" decoding="async" referrerPolicy="no-referrer" width={280} height={200} />
              </div>
              <h3 className="heading-card">{t.homeProducts.categories[0].title}</h3>
              <p className="belsa-card-desc">
                {t.homeProducts.categories[0].desc}
              </p>
              <span className="link-learn-more">
                {lang === 'id' ? 'Lihat Produk' : 'Explore Products'} &rarr;
              </span>
            </Link>

            {/* 2. Industrial Hose */}
            <Link href="/products/selang-hidrolik-industri" className="belsa-card belsa-reveal belsa-stagger-2">
              <div className="belsa-card-img-wrap">
                <img src="/images/prod_hose_clean.webp" alt="Selang Hidrolik & Industri BELSA" loading="lazy" decoding="async" referrerPolicy="no-referrer" width={280} height={200} />
              </div>
              <h3 className="heading-card">{t.homeProducts.categories[1].title}</h3>
              <p className="belsa-card-desc">
                {t.homeProducts.categories[1].desc}
              </p>
              <span className="link-learn-more">
                {lang === 'id' ? 'Lihat Produk' : 'Explore Products'} &rarr;
              </span>
            </Link>

            {/* 3. Process Valve */}
            <Link href="/products/process-valve" className="belsa-card belsa-reveal belsa-stagger-3">
              <div className="belsa-card-img-wrap">
                <img src="/images/prod_valve_clean.webp" alt="Process Valve BELSA" loading="lazy" decoding="async" referrerPolicy="no-referrer" width={280} height={200} />
              </div>
              <h3 className="heading-card">{t.homeProducts.categories[2].title}</h3>
              <p className="belsa-card-desc">
                {t.homeProducts.categories[2].desc}
              </p>
              <span className="link-learn-more">
                {lang === 'id' ? 'Lihat Produk' : 'Explore Products'} &rarr;
              </span>
            </Link>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/products" className="btn-belsa-primary belsa-mobile-full-btn" style={{ padding: '14px 36px' }}>
              {t.homeProducts.btnAllProducts} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Engineering Consultation Box */}
      <section style={{ padding: '20px 0 50px' }}>
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

      {/* Need Custom Industrial Solution */}
      <section className="belsa-section">
        <div className="belsa-container belsa-grid-2col">
          <div className="belsa-reveal">
            <h2 className="heading-section belsa-mobile-center-heading" style={{ marginBottom: '16px' }}>
              <TwoToneTitle text={t.workshop.title} />
            </h2>
            <p style={{ color: 'var(--belsa-gray)', lineHeight: 1.8, marginBottom: '28px', fontSize: '1.02rem' }}>
              {t.workshop.desc}
            </p>
            <Link href="/contact-us" className="btn-belsa-primary belsa-mobile-full-btn">
              {t.workshop.btnContact} &rarr;
            </Link>
          </div>
          <div className="belsa-reveal belsa-stagger-2">
            <VideoPlayer
              videoId="V4_F5Im9tks"
              title={lang === 'id' ? 'Custom Cylinder vs Standard Cylinder: Mengapa Industri Memilih Custom?' : 'Custom Cylinder vs Standard Cylinder: Why Industry Chooses Custom?'}
              thumbnail="/images/yt_custom_cylinder.webp"
              badge={lang === 'id' ? 'Video Teknis' : 'Technical Video'}
              showInfo={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
