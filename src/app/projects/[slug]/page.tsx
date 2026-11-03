'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProjectDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { lang } = useLanguage();
  const isId = lang === 'id';
  const t = translations[lang].projectsPage;

  const [copied, setCopied] = useState(false);

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

  // Find project by slug
  const project = t.projectsList.find((p) => p.slug === slug);

  // Fallback if not found
  if (!project) {
    return (
      <main style={{ padding: '80px 0', minHeight: '60vh', textAlign: 'center' }}>
        <div className="belsa-container">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          <h1 className="heading-hero" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>
            {isId ? 'Studi Kasus Tidak Ditemukan' : 'Project Case Study Not Found'}
          </h1>
          <p style={{ color: 'var(--belsa-gray)', marginBottom: '24px' }}>
            {isId
              ? `Studi kasus yang Anda cari tidak ada di daftar proyek kami.`
              : `The requested project case study was not found in our portfolio.`}
          </p>
          <Link href="/projects" className="btn-belsa-primary">
            {isId ? 'Kembali ke Daftar Proyek' : 'Back to Projects Portfolio'}
          </Link>
        </div>
      </main>
    );
  }

  const imgSrc = projectImagesMap[slug] || '/images/project_1_clean.webp';
  const logoSrc = projectLogosMap[slug];
  const otherProjects = t.projectsList.filter((p) => p.slug !== slug);

  const waText = isId
    ? `Halo tim teknis BELSA, saya ingin konsultasi kebutuhan silinder yang mirip dengan proyek ${project.title} (${project.category}).`
    : `Hello BELSA engineering team, I would like to consult regarding an industrial cylinder project similar to ${project.title} (${project.category}).`;
  const waUrl = `https://wa.me/6281119168752?text=${encodeURIComponent(waText)}`;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Sector labels
  const sectorLabels: Record<string, { id: string; en: string }> = {
    extrusion: { id: 'Ekstrusi & Manufaktur', en: 'Precision Extrusion & Manufacturing' },
    steel: { id: 'Peleburan Baja & Metalurgi', en: 'Steel Melting & Heavy Metallurgy' },
    tire: { id: 'Industri Ban & Otomotif', en: 'Tire Manufacturing & Automotive' },
    energy: { id: 'Energi, Minyak & Pelumas', en: 'Energy, Oil & Industrial Lubricants' },
  };

  const sectorName = sectorLabels[project.sector]
    ? isId ? sectorLabels[project.sector].id : sectorLabels[project.sector].en
    : project.sector.toUpperCase();

  return (
    <main style={{ padding: '40px 0 60px' }}>
      {/* Breadcrumbs */}
      <div className="belsa-container" style={{ marginBottom: '24px' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#6B7280', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>
            {isId ? 'Beranda' : 'Home'}
          </Link>
          <span>/</span>
          <Link href="/projects" style={{ color: '#6B7280', textDecoration: 'none' }}>
            {isId ? 'Proyek' : 'Projects'}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--belsa-red)', fontWeight: 600 }}>{project.title}</span>
        </nav>
      </div>

      {/* Main Project Case Study Container */}
      <section style={{ marginBottom: '60px' }}>
        <div className="belsa-container">
          {/* Header with Client Logo */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span style={{
                  background: '#FEF2F2',
                  color: 'var(--belsa-red)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  {sectorName}
                </span>
                <span style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {isId ? 'Proyek Klien' : 'Verified Installation'}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--belsa-dark)', marginBottom: '8px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                {project.title}
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'var(--belsa-gray)', maxWidth: '850px', margin: 0, fontWeight: 500 }}>
                {project.category}
              </p>
            </div>

            {/* Client Logo (Frameless & Prominent) */}
            {logoSrc && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '70px',
                  flexShrink: 0
                }}
                title={`Klien: ${project.title}`}
              >
                <img
                  src={logoSrc}
                  alt={`${project.title} Client Logo`}
                  style={{
                    height: '56px',
                    maxHeight: '64px',
                    maxWidth: '160px',
                    width: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
            )}
          </div>

          {/* 2-Column Detail Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'start' }}>
            {/* Visual Column */}
            <div>
              <div style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
                boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                background: '#F9FAFB'
              }}>
                <img
                  src={imgSrc}
                  alt={project.title}
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '420px' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: 'rgba(17, 24, 39, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  {t.clientBadge}
                </div>
              </div>

              {/* Manufacturing Metrics Badge */}
              <div style={{
                marginTop: '20px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    {isId ? 'Standar Mutu' : 'Quality Standard'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--belsa-dark)', marginTop: '2px' }}>
                    ISO 9001:2015
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    {isId ? 'Pengujian' : 'Pressure Test'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {isId ? 'Uji Tekanan' : '100% Hydrostatic'}
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Specs Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--belsa-dark)', marginBottom: '14px' }}>
                  {isId ? (
                    <>
                      Ringkasan & <span style={{ color: 'var(--belsa-red)' }}>Lingkup Pekerjaan</span>
                    </>
                  ) : (
                    <>
                      Engineering Scope <span style={{ color: 'var(--belsa-red)' }}>& Overview</span>
                    </>
                  )}
                </h2>
                <p style={{ color: '#4B5563', lineHeight: 1.8, fontSize: '1.02rem', margin: 0 }}>
                  {project.desc}
                </p>

                {/* Technical Specs Tags */}
                {project.specs && project.specs.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                      {isId ? 'Spesifikasi Utama:' : 'Key Technical Specifications:'}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {project.specs.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            background: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            color: '#1F2937',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--belsa-red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ marginTop: '30px', paddingTop: '24px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-belsa-primary"
                    style={{ flexGrow: 1, justifyContent: 'center', padding: '12px 24px', textDecoration: 'none' }}
                  >
                    <span>{t.btnConsult}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn-belsa-outline"
                    style={{ padding: '12px 22px', whiteSpace: 'nowrap' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>{copied ? (isId ? 'Tautan disalin' : 'Link Copied!') : (isId ? 'Salin Tautan' : 'Copy Link')}</span>
                  </button>
                </div>
              </div>

              {/* Engineering Facility Callout */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--belsa-red)',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--belsa-red)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                    {isId ? 'Fasilitas Workshop Pasar Kemis, Tangerang' : 'Pasar Kemis Workshop Facility, Tangerang'}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                    {isId
                      ? 'Fabrikasi dikerjakan di workshop kami di Sunrise Bizpark, Pasar Kemis, Tangerang, dengan mesin bubut, CNC, dan honing. Kami membuat silinder custom sesuai drawing atau sample dari mesin Anda.'
                      : 'Our fabrication is backed by in-house lathes, Mazak CNC turning, and precision honing at Sunrise Bizpark workshop, Pasar Kemis, Tangerang. We are ready to re-engineer custom cylinders per your drawing and equipment samples.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Pillar Engineering Case Breakdown: Challenge, Solution, Outcome */}
          {((project as any).challenge || (project as any).solution || (project as any).result) && (
            <div style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid #E5E7EB' }}>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--belsa-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {isId ? 'Catatan Proyek' : 'Field Engineering Analysis'}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--belsa-dark)', margin: '4px 0 0' }}>
                  {isId ? (
                    <>
                      Masalah, Penanganan, <span style={{ color: 'var(--belsa-red)' }}>dan Hasil</span>
                    </>
                  ) : (
                    <>
                      Problem Decomposition & <span style={{ color: 'var(--belsa-red)' }}>Manufacturing Solution</span>
                    </>
                  )}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* 1. Challenge Card */}
                {(project as any).challenge && (
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                        {isId ? 'Masalah di Lapangan' : 'Operational Challenge'}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: 1.7, margin: 0, flexGrow: 1 }}>
                      {(project as any).challenge}
                    </p>
                  </div>
                )}

                {/* 2. Solution Card */}
                {(project as any).solution && (
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                      </div>
                      <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#1E40AF', margin: 0 }}>
                        {isId ? 'Penanganan BELSA' : 'Engineered Solution'}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: 1.7, margin: 0, flexGrow: 1 }}>
                      {(project as any).solution}
                    </p>
                  </div>
                )}

                {/* 3. Result Card */}
                {(project as any).result && (
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#ECFDF5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                      <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#065F46', margin: 0 }}>
                        {isId ? 'Hasil Pekerjaan' : 'Outcome & Quality Assurance'}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: 1.7, margin: 0, flexGrow: 1 }}>
                      {(project as any).result}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Other Projects / Portfolio Showcase */}
      <section style={{ marginBottom: '60px', background: '#F9FAFB', padding: '50px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="belsa-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="heading-section" style={{ fontSize: '1.5rem', margin: 0 }}>
                {isId ? (
                  <>
                    Studi Kasus <span style={{ color: 'var(--belsa-red)' }}>Lainnya</span>
                  </>
                ) : (
                  <>
                    Other Industrial <span style={{ color: 'var(--belsa-red)' }}>Case Studies</span>
                  </>
                )}
              </h2>
              <p style={{ color: 'var(--belsa-gray)', fontSize: '0.92rem', margin: '4px 0 0' }}>
                {isId ? 'Proyek silinder kami di sektor industri lain' : 'Explore our engineering work across heavy manufacturing industries'}
              </p>
            </div>
            <Link href="/projects" className="link-learn-more" style={{ fontWeight: 600 }}>
              {isId ? 'Lihat Semua Proyek →' : 'View All Projects →'}
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {otherProjects.slice(0, 3).map((op) => {
              const opImg = projectImagesMap[op.slug] || '/images/project_1_clean.webp';
              const opLogo = projectLogosMap[op.slug];
              return (
                <Link
                  key={op.slug}
                  href={`/projects/${op.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  className="belsa-card"
                >
                  <div style={{ height: '160px', overflow: 'hidden', borderRadius: '12px', marginBottom: '14px', background: '#E5E7EB' }}>
                    <img src={opImg} alt={op.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--belsa-red)', textTransform: 'uppercase' }}>
                      {op.sector}
                    </span>
                    {opLogo && (
                      <img src={opLogo} alt={`${op.title} Logo`} style={{ maxHeight: '20px', maxWidth: '70px', objectFit: 'contain' }} />
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0', color: 'var(--belsa-dark)' }}>
                    {op.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {op.desc}
                  </p>
                  <span className="link-learn-more" style={{ fontSize: '0.85rem' }}>
                    {isId ? 'Lihat Studi Kasus' : 'Read Case Study'} &rarr;
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tailored Engineering Consultation Box (Replacing Generic BannerCard) */}
      <section style={{ paddingBottom: '30px' }}>
        <div className="belsa-container">
          <div style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            borderRadius: '20px',
            padding: '36px 40px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            <div>
              <span style={{ color: 'var(--belsa-red)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                {isId ? 'Konsultasi Fabrikasi & Modifikasi' : 'Custom Engineering & Retrofit'}
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 8px', color: '#FFFFFF' }}>
                {isId ? 'Butuh Silinder untuk Mesin Serupa?' : 'Require Custom Cylinders or Similar Machine Retrofits?'}
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
                {isId
                  ? 'Kirim sample atau drawing, atau ceritakan masalah sistem hidrolik di pabrik Anda kepada tim teknis PT. Rafitama Millenial Wahyudi.'
                  : 'Submit technical drawings, machinery samples, or discuss hydraulic operational challenges with the engineering team at PT. Rafitama Millenial Wahyudi.'}
              </p>
            </div>
            <a
              href="https://wa.me/6281119168752"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-belsa-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {isId ? 'Konsultasi Teknis via WhatsApp' : 'Technical Consultation on WhatsApp'} &rarr;
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
