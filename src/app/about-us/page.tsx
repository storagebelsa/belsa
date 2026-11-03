'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { withRafitamaLink } from '@/components/RafitamaLink';
import VideoPlayer from '@/components/VideoPlayer';
import CultureCarousel from '@/components/CultureCarousel';
import TwoToneTitle from '@/components/TwoToneTitle';

export default function AboutUsPage() {
  const { lang } = useLanguage();
  const isId = lang === 'id';
  const t = translations[lang].aboutPage;

  const visitWaUrl = `https://wa.me/6281119168752?text=${encodeURIComponent(
    isId
      ? 'Halo tim teknis PT. Rafitama Millenial Wahyudi (BELSA), kami ingin menjadwalkan kunjungan ke workshop untuk melihat fasilitas produksi dan membahas kebutuhan silinder kami.'
      : 'Hello technical team of PT. Rafitama Millenial Wahyudi (BELSA), our company would like to schedule a factory/workshop visit to inspect your machining facilities and discuss our cylinder requirements.'
  )}`;

  return (
    <main style={{ padding: '50px 0 60px' }}>
      {/* 1. Page Header & Hero Credibility */}
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
            {isId ? (
              <>
                Produsen dan Workshop <span style={{ color: 'var(--belsa-red)' }}>Fabrikasi Silinder Hidrolik</span> di Tangerang
              </>
            ) : (
              <>
                Precision Engineering & <span style={{ color: 'var(--belsa-red)' }}>In-House Hydraulic Cylinder</span> Fabrication
              </>
            )}
          </h1>
          <p className="subhead" style={{ maxWidth: '780px', margin: '0 auto' }}>
            {withRafitamaLink(t.heroSub)}
          </p>
        </div>
      </section>

      {/* 2. Company Profile & Credibility Metric Matrix */}
      <section style={{ marginBottom: '70px' }}>
        <div className="belsa-container belsa-grid-2col" style={{ alignItems: 'center', gap: '48px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--belsa-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              PT. Rafitama Millenial Wahyudi
            </span>
            <h2 className="heading-section" style={{ margin: '6px 0 18px', fontSize: '1.85rem' }}>
              <TwoToneTitle text={t.profileTitle} />
            </h2>
            <div style={{ color: 'var(--belsa-gray)', lineHeight: 1.8, fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <p>{withRafitamaLink(t.profileText1)}</p>
              <p>{t.profileText2}</p>
            </div>

            {/* Credibility Metric Cards */}
            {t.credibilityMetrics && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
                paddingTop: '20px',
                borderTop: '1px solid #E5E7EB'
              }}>
                {t.credibilityMetrics.map((item, mIdx) => (
                  <div
                    key={mIdx}
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--belsa-red)', lineHeight: 1.2 }}>
                      {item.value}
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--belsa-dark)', marginTop: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                      {item.sub}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workshop Facade Image */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--belsa-border)', boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}>
            <img 
              src="/images/facility_workshop_facade.webp" 
              alt="Fasilitas Workshop PT. Rafitama Millenial Wahyudi Sunrise Bizpark Pasar Kemis" 
              style={{ width: '100%', height: 'auto', minHeight: '340px', maxHeight: '440px', objectFit: 'cover', display: 'block' }} 
            />
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              padding: '20px 24px', 
              background: 'linear-gradient(to top, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.65) 75%, transparent 100%)', 
              color: '#FFFFFF'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, background: 'var(--belsa-red)', color: '#FFFFFF', padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFFFFF' }} />
                {isId ? 'Workshop Fabrikasi' : 'In-House Fabrication Facility'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
                PT. Rafitama Millenial Wahyudi
              </div>
              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '2px' }}>
                Kawasan Pergudangan Sunrise Bizpark, Pasar Kemis, Tangerang
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. In-House Machining Capabilities & Equipment Fleet */}
      {t.facilities && (
        <section style={{ marginBottom: '80px', background: '#F9FAFB', padding: '60px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
          <div className="belsa-container">
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--belsa-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isId ? 'Fasilitas Workshop' : 'Workshop Infrastructure'}
              </span>
              <h2 className="heading-section" style={{ margin: '6px 0 12px', fontSize: '2rem' }}>
                <TwoToneTitle text={t.facilityTitle} />
              </h2>
              <p className="subhead" style={{ maxWidth: '720px', margin: '0 auto' }}>
                {t.facilitySub}
              </p>
            </div>

            <div className="belsa-grid-4col" style={{ gap: '22px' }}>
              {t.facilities.map((fac: any, idx: number) => (
                <div key={idx} className="belsa-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden', background: '#E2E8F0' }}>
                    <img 
                      src={fac.image} 
                      alt={fac.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <span style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      left: '10px', 
                      background: 'rgba(15, 23, 42, 0.86)', 
                      backdropFilter: 'blur(6px)', 
                      color: '#FFFFFF', 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.18)' 
                    }}>
                      {fac.badge}
                    </span>
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--belsa-dark)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {fac.title}
                    </h3>
                    <p style={{ color: 'var(--belsa-gray)', fontSize: '0.86rem', lineHeight: 1.6, margin: '0 0 14px', flexGrow: 1 }}>
                      {fac.desc}
                    </p>
                    {fac.spec && (
                      <div style={{
                        background: '#F1F5F9',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#334155',
                        fontWeight: 600,
                        border: '1px solid #E2E8F0'
                      }}>
                        {fac.spec}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. 6-Stage Engineering & Quality Workflow */}
      {t.workflowSteps && (
        <section style={{ marginBottom: '85px' }}>
          <div className="belsa-container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--belsa-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isId ? 'Alur Kerja Fabrikasi' : 'Fabrication Methodology'}
              </span>
              <h2 className="heading-section" style={{ margin: '6px 0 12px', fontSize: '2rem' }}>
                <TwoToneTitle text={t.workflowTitle} />
              </h2>
              <p className="subhead" style={{ maxWidth: '720px', margin: '0 auto' }}>
                {t.workflowSub}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
              {t.workflowSteps.map((step: any, sIdx: number) => (
                <div
                  key={sIdx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: 'var(--belsa-red)',
                      fontFamily: 'monospace',
                      background: '#FEF2F2',
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #FEE2E2'
                    }}>
                      {step.step}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {isId ? `Tahap ${sIdx + 1}` : `Stage ${sIdx + 1}`}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--belsa-dark)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Engineering Insights & Technical Videos */}
      <section style={{ marginBottom: '85px', background: '#F8FAFC', padding: '60px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="belsa-container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--belsa-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isId ? 'Video Teknis' : 'Technical Insights'}
            </span>
            <h2 className="heading-section" style={{ margin: '6px 0 12px', fontSize: '1.9rem' }}>
              {isId ? (
                <>
                  Video Teknis <span style={{ color: 'var(--belsa-red)' }}>Hidrolik & Pneumatik</span>
                </>
              ) : (
                <>
                  Engineering Insights <span style={{ color: 'var(--belsa-red)' }}>& Technical Education</span>
                </>
              )}
            </h2>
            <p className="subhead" style={{ maxWidth: '660px', margin: '0 auto' }}>
              {isId
                ? 'Video penjelasan dari tim teknis PT. Rafitama Millenial Wahyudi tentang silinder custom dan perawatan rutin sistem hidrolik.'
                : "Watch in-depth technical presentations from PT. Rafitama Millenial Wahyudi's engineering team on custom cylinder advantages and industrial fluid system maintenance."}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {/* Video 1: Custom Cylinder */}
            <VideoPlayer
              videoId="V4_F5Im9tks"
              title={isId ? 'Custom Cylinder vs Standard Cylinder: Mengapa Industri Memilih Custom?' : 'Custom Cylinder vs Standard Cylinder: Why Industry Chooses Custom?'}
              desc={isId 
                ? 'Penjelasan kapan mesin membutuhkan silinder custom yang ukuran dan kapasitasnya disesuaikan dengan beban kerja.'
                : 'A comprehensive explanation of why high-performance industrial machinery relies on custom-engineered cylinders tailored to specific operating loads.'}
              thumbnail="/images/yt_custom_cylinder.webp"
              badge={isId ? 'Silinder Custom' : 'Cylinder Engineering'}
            />

            {/* Video 2: Hydraulic Maintenance & Repair */}
            <VideoPlayer
              videoId="_8UN_l5b0gQ"
              title={isId ? 'Semua Tentang Hidrolik: Fungsi, Komponen & Cara Perbaikan' : 'All About Hydraulics: Functions, Components & Repair Methods'}
              desc={isId
                ? 'Dasar prinsip kerja sistem hidrolik, cara mengenali kebocoran seal dan valve, serta langkah perawatan rutin agar mesin lebih awet.'
                : 'Essential guide on hydraulic power principles, seal/valve leakage diagnostics, and preventive maintenance practices for optimal equipment longevity.'}
              thumbnail="/images/yt_hidrolik_edukasi.webp"
              badge={isId ? 'Perawatan & Servis' : 'Maintenance & Service'}
            />
          </div>
        </div>
      </section>

      {/* 6. Operations & Machining in Action (Culture Carousel) */}
      <section style={{ marginBottom: '70px' }}>
        <div className="belsa-container">
          <CultureCarousel
            title={t.cultureTitle}
            subtitle={t.cultureSub}
            eyebrow={isId ? 'Dokumentasi Lapangan' : 'Field Documentation'}
          />
        </div>
      </section>

      {/* 7. Dedicated B2B Factory Visit & Drawing Review CTA */}
      <section style={{ marginBottom: '40px' }}>
        <div className="belsa-container">
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: '24px',
            padding: '48px 36px',
            color: '#FFFFFF',
            border: '1px solid #334155',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 14px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {isId ? 'Workshop Sunrise Bizpark, Pasar Kemis' : 'Sunrise Bizpark Workshop, Pasar Kemis'}
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.25, color: '#FFFFFF' }}>
                {t.factoryCta.title}
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '0.96rem', lineHeight: 1.7, margin: '0 0 16px', maxWidth: '600px' }}>
                {t.factoryCta.desc}
              </p>
              <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{t.factoryCta.locationNote}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
              <a
                href={visitWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#22C55E',
                  color: '#FFFFFF',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 20px rgba(34, 197, 94, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>{t.factoryCta.btnVisit}</span>
              </a>

              <Link
                href="/contact-us"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>{t.factoryCta.btnDrawing}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
