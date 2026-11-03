'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

function ProjectsContent() {
  const { lang } = useLanguage();
  const isId = lang === 'id';
  const t = translations[lang].projectsPage;
  const searchParams = useSearchParams();
  const sectorParam = searchParams.get('sector');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (sectorParam) {
      setSelectedCategory(sectorParam);
    }
  }, [sectorParam]);

  const projectImagesMap: Record<string, string> = {
    'pt-ykk-ap-indonesia': '/images/projects/project_ykk_ap.webp',
    'pt-the-master-steel-mfc-proyek-1': '/images/projects/project_mastersteel_1.webp',
    'pt-the-master-steel-mfc-proyek-2': '/images/projects/project_mastersteel_2.webp',
    'pt-elangperdana-tyre-industry': '/images/projects/project_elangperdana.webp',
    'pt-jx-nippon-oil-energy': '/images/projects/project_jx_nippon.webp',
    'pt-sumi-rubber-indonesia-dunlop': '/images/projects/project_sumirubber_dunlop.webp',
  };

  const projectLogosMap: Record<string, string> = {
    'pt-ykk-ap-indonesia': '/images/projects/logos/logo_ykk_ap.webp',
    'pt-the-master-steel-mfc-proyek-1': '/images/projects/logos/logo_mastersteel.webp',
    'pt-the-master-steel-mfc-proyek-2': '/images/projects/logos/logo_mastersteel.webp',
    'pt-elangperdana-tyre-industry': '/images/projects/logos/logo_elangperdana.webp',
    'pt-jx-nippon-oil-energy': '/images/projects/logos/logo_jx.webp',
    'pt-sumi-rubber-indonesia-dunlop': '/images/projects/logos/logo_sumirubber.webp',
  };

  const categories = [
    { id: 'all', label: t.filterAll },
    { id: 'steel', label: t.filterSteel },
    { id: 'tire', label: t.filterTire },
    { id: 'extrusion', label: t.filterExtrusion },
    { id: 'energy', label: t.filterEnergy },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? t.projectsList
    : t.projectsList.filter((p) => p.sector === selectedCategory);

  return (
    <main style={{ padding: '50px 0 60px' }}>
      {/* 1. Page Header */}
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
                Proyek Silinder dan Hidrolik <span style={{ color: 'var(--belsa-red)' }}>untuk Klien Industri</span>
              </>
            ) : (
              <>
                Heavy-Duty Reliability, <span style={{ color: 'var(--belsa-red)' }}>Engineered for Industrial Trust</span>
              </>
            )}
          </h1>
          <p className="subhead" style={{ maxWidth: '780px', margin: '0 auto' }}>
            {t.heroSub}
          </p>
        </div>
      </section>

      {/* 2. Category Filter Tabs & Projects Grid */}
      <section style={{ marginBottom: '70px' }}>
        <div className="belsa-container">
          {/* Interactive Filter Tabs (Clean text only, no count badges) */}
          <div className="belsa-filter-tabs-wrapper">
            <div className="belsa-filter-tabs">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`belsa-filter-tab ${isActive ? 'is-active' : ''}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects 2-Col Grid */}
          <div className="belsa-grid-2col-equal">
            {filteredProjects.map((p) => {
              const imgSrc = projectImagesMap[p.slug] || '/images/project_1_clean.webp';
              const logoSrc = projectLogosMap[p.slug];
              const waText = isId
                ? `Halo tim teknis BELSA, saya ingin konsultasi kebutuhan silinder yang mirip dengan proyek ${p.title} (${p.category}).`
                : `Hello BELSA engineering team, I would like to consult regarding an industrial cylinder project similar to ${p.title} (${p.category}).`;
              const waUrl = `https://wa.me/6281119168752?text=${encodeURIComponent(waText)}`;

              return (
                <div key={p.title} className="belsa-card belsa-project-card">
                  {/* Clean Card Image with Floating Category Badge */}
                  <div className="belsa-project-img-box">
                    <img
                      src={imgSrc}
                      alt={p.title}
                      className="belsa-project-img"
                      loading="lazy"
                    />
                    <div className="belsa-project-badge-overlay">
                      <span className="belsa-pulse-dot" />
                      <span>{p.category}</span>
                    </div>
                  </div>

                  {/* Card Body with Large Client Logo & Header */}
                  <div className="belsa-project-body">
                    <div className="belsa-project-title-row">
                      <div className="belsa-project-title-left">
                        <span className="belsa-project-sector-tag">
                          {isId ? 'Studi Kasus' : 'Manufacturing Case Study'}
                        </span>
                        <h3 className="belsa-project-title">
                          <Link href={`/projects/${p.slug}`}>
                            {p.title}
                          </Link>
                        </h3>
                      </div>
                      {logoSrc && (
                        <div
                          className="belsa-project-logo-wrap"
                          title={`Klien: ${p.title}`}
                        >
                          <img
                            src={logoSrc}
                            alt={`${p.title} Client Logo`}
                            className="belsa-project-logo-img"
                          />
                        </div>
                      )}
                    </div>

                    <p className="belsa-project-desc">{p.desc}</p>

                    {/* Engineering Specs Tags */}
                    {p.specs && p.specs.length > 0 && (
                      <div className="belsa-project-specs">
                        {p.specs.map((spec, sIdx) => (
                          <span key={sIdx} className="belsa-project-spec-tag">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dual Action Footer: View Case Study + Consult */}
                    <div className="belsa-project-footer">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="belsa-project-btn-case"
                      >
                        <span>{isId ? 'Lihat Studi Kasus' : 'View Case Study'}</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="belsa-project-btn-consult"
                        title={isId ? 'Konsultasi Teknis via WhatsApp' : 'Technical Consultation via WhatsApp'}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        <span>{isId ? 'Konsultasi' : 'Consult'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Custom Engineering Consultation CTA */}
      <section style={{ paddingBottom: '30px' }}>
        <div className="belsa-container">
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '40px 36px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}>
            <div>
              <span className="belsa-page-eyebrow" style={{ marginBottom: '8px', display: 'inline-block' }}>
                {isId ? 'Fabrikasi Silinder Custom' : 'Custom Cylinder Engineering'}
              </span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.3, color: 'var(--belsa-dark)' }}>
                {isId ? (
                  <>
                    Butuh Silinder Khusus atau <span style={{ color: 'var(--belsa-red)' }}>Overhaul Silinder Mesin?</span>
                  </>
                ) : (
                  <>
                    Require Custom Cylinders or <span style={{ color: 'var(--belsa-red)' }}>Equipment Overhaul?</span>
                  </>
                )}
              </h2>
              <p style={{ color: 'var(--belsa-gray)', fontSize: '0.94rem', lineHeight: 1.65, margin: 0, maxWidth: '580px' }}>
                {isId
                  ? 'Tim teknis PT. Rafitama Millenial Wahyudi membuat silinder hidrolik dan pneumatik custom berdasarkan drawing atau sample dari mesin Anda.'
                  : 'Our technical engineering team is ready to re-engineer custom hydraulic and pneumatic cylinders tailored to your equipment samples or CAD drawings.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <a
                href="https://wa.me/6281119168752?text=Halo%20tim%20teknis%20BELSA%2C%20saya%20ingin%20konsultasi%20kebutuhan%20silinder%20kustom%20untuk%20mesin%20pabrik%20kami."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-belsa-primary"
                style={{ padding: '14px 22px', fontSize: '0.92rem', justifyContent: 'center' }}
              >
                <span>{isId ? 'Konsultasi via WhatsApp' : 'Consult Technical Engineer (WhatsApp)'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>

              <Link
                href="/contact-us"
                className="btn-belsa-outline"
                style={{ padding: '13px 22px', fontSize: '0.92rem', justifyContent: 'center' }}
              >
                <span>{isId ? 'Kirim Drawing & Spesifikasi' : 'Submit Drawing & Specifications'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px 0', textAlign: 'center' }}>Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
