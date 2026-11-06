'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import TwoToneTitle from '@/components/TwoToneTitle';

export default function ContactUsPage() {
  const { lang } = useLanguage();
  const isId = lang === 'id';
  const t = translations[lang].contactPage;

  const [submitted, setSubmitted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('hydraulic');
  const [activeMapTab, setActiveMapTab] = useState<'workshop' | 'office'>('workshop');
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMapTabChange = (tab: 'workshop' | 'office') => {
    if (tab === activeMapTab) return;
    setIsMapLoading(true);
    setActiveMapTab(tab);
  };

  const topics = [
    { id: 'hydraulic', labelId: 'Silinder Hidrolik Kustom', labelEn: 'Custom Hydraulic Cylinder' },
    { id: 'pneumatic', labelId: 'Silinder Pneumatik', labelEn: 'Industrial Pneumatic Cylinder' },
    { id: 'valve_hose', labelId: 'Selang Hidrolik & Process Valve', labelEn: 'Industrial Hose & Valve' },
    { id: 'overhaul', labelId: 'Overhaul / Servis Silinder', labelEn: 'Cylinder Overhaul / Service' },
    { id: 'general', labelId: 'Penawaran Umum / Tender', labelEn: 'General RFQ / Tender' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const matchedTopic = topics.find((t) => t.id === selectedTopic);
    const categoryLabel = matchedTopic ? (isId ? matchedTopic.labelId : matchedTopic.labelEn) : selectedTopic;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          topic: selectedTopic,
          topicLabel: categoryLabel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(data.message || 'Gagal mengirim pesan. Silakan coba kembali.');
      }
    } catch {
      setSubmitError('Terjadi kesalahan koneksi. Silakan hubungi kami via WhatsApp atau coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ padding: '50px 0 60px' }}>
      {/* 1. Page Header */}
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
            {isId ? (
              <>
                Konsultasi Teknis <span style={{ color: 'var(--belsa-red)' }}>& Permintaan Penawaran</span>
              </>
            ) : (
              <>
                Technical Consultation <span style={{ color: 'var(--belsa-red)' }}>& Quotation Request</span>
              </>
            )}
          </h1>
          <p className="subhead" style={{ maxWidth: '780px', margin: '0 auto' }}>
            {t.heroSub}
          </p>
        </div>
      </section>

      {/* 2. Quick Contact Channels (4-Column Grid) */}
      <section style={{ marginBottom: '48px' }}>
        <div className="belsa-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {/* Card 1: WhatsApp Hotline */}
            <a
              href="https://wa.me/6281119168752?text=Halo%20tim%20teknis%20BELSA%2C%20saya%20ingin%20berkonsultasi%20mengenai%20kebutuhan%20komponen%20mesin%20industri."
              target="_blank"
              rel="noopener noreferrer"
              className="belsa-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="belsa-brand-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <span className="belsa-brand-badge">
                  {isId ? 'Paling Cepat' : 'Fastest Response'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--belsa-dark)', margin: '0 0 4px' }}>
                  {isId ? 'WhatsApp Tim Teknis' : 'Technical WhatsApp'}
                </h3>
                <p style={{ color: 'var(--belsa-gray)', fontSize: '0.88rem', margin: 0 }}>
                  +62 811-1916-8752
                </p>
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--belsa-red)', marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>{isId ? 'Kirim Pesan WhatsApp' : 'Chat via WhatsApp'}</span>
                <span>&rarr;</span>
              </span>
            </a>

            {/* Card 2: Email Penawaran */}
            <a
              href="mailto:sales@belsa.id?subject=Permintaan%20Penawaran%20dan%20Konsultasi%20Teknis%20BELSA"
              className="belsa-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="belsa-brand-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <span className="belsa-brand-badge">
                  {isId ? 'Email Resmi' : 'Official RFQ Email'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--belsa-dark)', margin: '0 0 4px' }}>
                  {isId ? 'Email Penawaran & Tender' : 'Email Inquiry & Quotation'}
                </h3>
                <p style={{ color: 'var(--belsa-gray)', fontSize: '0.88rem', margin: 0 }}>
                  sales@belsa.id / sales@rafitama.com
                </p>
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--belsa-red)', marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>{isId ? 'Kirim Dokumen Tender' : 'Send Tender Documents'}</span>
                <span>&rarr;</span>
              </span>
            </a>

            {/* Card 3: Head Office & Workshop Tangerang */}
            <div
              className="belsa-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="belsa-brand-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="belsa-brand-badge">
                  {isId ? 'Lokasi Fasilitas' : 'Facility Locations'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--belsa-dark)', margin: '0 0 4px' }}>
                  {isId ? 'Kantor Pusat & Workshop' : 'Head Office & Workshop'}
                </h3>
                <p style={{ color: 'var(--belsa-gray)', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
                  <strong style={{ color: '#334155' }}>HO:</strong> Scientia Garden, Gading Serpong<br />
                  <strong style={{ color: '#334155' }}>Workshop:</strong> Sunrise Bizpark, Pasar Kemis
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '4px' }}>
                <a
                  href="https://www.google.com/maps/place/Nabel+Sakha+Building/@-6.259055,106.6080465,1346m/data=!3m1!1e3!4m6!3m5!1s0x2e69fc750c1499af:0x6a880c03d8ec12b1!8m2!3d-6.2589089!4d106.6079929!16s%2Fg%2F119vrtf59?entry=ttu&g_ep=EgoyMDI2MTEwMS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--belsa-red)', textDecoration: 'none' }}
                >
                  Maps HO &rarr;
                </a>
                <span style={{ color: '#CBD5E1' }}>|</span>
                <a
                  href="https://maps.app.goo.gl/CPFtJNBygVUNbXiQ9"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--belsa-red)', textDecoration: 'none' }}
                >
                  Maps Workshop &rarr;
                </a>
              </div>
            </div>

            {/* Card 4: Operating Hours */}
            <div
              className="belsa-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="belsa-brand-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="belsa-brand-badge">
                  {isId ? 'Waktu Operasional' : 'Business Hours'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--belsa-dark)', margin: '0 0 4px' }}>
                  {isId ? 'Jam Kerja' : 'Engineering Working Hours'}
                </h3>
                <p style={{ color: 'var(--belsa-gray)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                  Senin – Jumat: 08.30 – 17.00 WIB<br />
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Sabtu & Minggu: Tutup</span>
                </p>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--belsa-red)', marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>✓ {isId ? 'Pesan WhatsApp bisa dikirim kapan saja' : 'Emergency WhatsApp Line Active'}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Split Section: Form RFQ (Left) & Workshop / Technical Facilities (Right) */}
      <section style={{ marginBottom: '60px' }}>
        <div className="belsa-container">
          <div
            className="contact-main-split-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '36px',
              alignItems: 'start'
            }}
          >
            {/* Left Column: Corporate RFQ Form */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--belsa-border)',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)'
            }}
            className="contact-form-box belsa-reveal belsa-stagger-1">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16A34A',
                    margin: '0 auto 20px'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--belsa-dark)', marginBottom: '10px' }}>
                    {t.formSuccessTitle}
                  </h3>
                  <p style={{ color: 'var(--belsa-gray)', maxWidth: '440px', margin: '0 auto 28px', lineHeight: 1.65, fontSize: '0.94rem' }}>
                    {t.formSuccessDesc}
                  </p>
                  <button
                    type="button"
                    className="btn-belsa-outline"
                    onClick={() => setSubmitted(false)}
                    style={{ padding: '12px 28px' }}
                  >
                    {t.btnSendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--belsa-red)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {isId ? 'Formulir Penawaran Teknis' : 'Technical Quotation Form'}
                    </span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--belsa-dark)', margin: '4px 0 8px' }}>
                      <TwoToneTitle text={t.formTitle} />
                    </h2>
                    <p style={{ color: 'var(--belsa-gray)', fontSize: '0.92rem', margin: 0, lineHeight: 1.6 }}>
                      {t.formSub}
                    </p>
                  </div>

                  {/* Topic Selector Chips */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px', color: '#334155' }}>
                      {isId ? 'Kategori Kebutuhan Komponen:' : 'Component Requirement Category:'}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {topics.map((item) => {
                        const isSelected = selectedTopic === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedTopic(item.id)}
                            className={`belsa-topic-chip ${isSelected ? 'is-selected' : ''}`}
                            style={{
                              padding: '7px 13px',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: isSelected ? '1.5px solid var(--belsa-red)' : '1px solid #E2E8F0',
                              background: isSelected ? '#FEF2F2' : '#F8FAFC',
                              color: isSelected ? 'var(--belsa-red)' : '#475569',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          >
                            {isId ? item.labelId : item.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2-Column Inputs: Name & Company */}
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}
                    className="contact-form-row"
                  >
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px', color: '#334155' }}>
                        {t.formName}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={isId ? 'Nama Lengkap Anda' : 'Full Name'}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.92rem',
                          outline: 'none',
                          background: '#FFFFFF'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px', color: '#334155' }}>
                        {t.formCompany}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder={isId ? 'Nama perusahaan Anda' : 'Company Name'}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.92rem',
                          outline: 'none',
                          background: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>

                  {/* 2-Column Inputs: Phone & Email */}
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}
                    className="contact-form-row"
                  >
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px', color: '#334155' }}>
                        {t.formPhone}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="08xxxxxxxxxx / +62..."
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.92rem',
                          outline: 'none',
                          background: '#FFFFFF'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px', color: '#334155' }}>
                        {t.formEmail}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="nama@perusahaan.com"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.92rem',
                          outline: 'none',
                          background: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px', color: '#334155' }}>
                      {t.formMessage}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder={isId
                        ? 'Tuliskan ukuran bore/stroke, tekanan kerja (bar), jenis fluida, suhu kerja, atau keterangan drawing yang ingin dibuat...'
                        : 'Specify cylinder bore/stroke, working pressure (bar), fluid type, operating temperature, or custom drawing fabrication requirements...'}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                        outline: 'none',
                        resize: 'vertical',
                        background: '#FFFFFF'
                      }}
                    />
                  </div>

                  {submitError && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#DC2626',
                      fontSize: '0.88rem'
                    }}>
                      ⚠️ {submitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-belsa-primary"
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      fontSize: '0.95rem',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.75 : 1
                    }}
                  >
                    <span>{isSubmitting ? (isId ? 'Mengirim Penawaran...' : 'Sending RFQ...') : t.formSubmit}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>

                  {/* Trust Micro-Badges */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    paddingTop: '6px',
                    borderTop: '1px solid #F1F5F9',
                    fontSize: '0.78rem',
                    color: '#64748B'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {isId ? 'Dibalas pada hari kerja' : 'Response within 24h'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {isId ? 'Drawing Dijaga Kerahasiaannya' : 'NDA & Drawing Privacy'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {isId ? 'Konsultasi Teknis Gratis' : 'Free Engineering Advice'}
                    </span>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Physical Plant & Engineering Trust Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Workshop Facade Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--belsa-border)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img
                    src="/images/facility_workshop_facade.webp"
                    alt="Fasilitas Workshop PT. Rafitama Millenial Wahyudi"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: 'rgba(15, 23, 42, 0.88)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E' }} />
                    {isId ? 'Workshop Produksi' : 'In-House Fabrication Plant'}
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--belsa-red)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {isId ? 'Workshop & Fabrikasi' : 'Fabrication & Workshop Facility'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--belsa-dark)', margin: '4px 0 10px' }}>
                    Workshop Sunrise Bizpark (Pasar Kemis)
                  </h3>
                  <p style={{ color: 'var(--belsa-gray)', fontSize: '0.92rem', lineHeight: 1.65, margin: '0 0 8px' }}>
                    Kawasan Pergudangan Sunrise Bizpark, Jl. Raya Prabu Siliwangi Km 3,5, Pasar Kemis, Tangerang
                  </p>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {isId
                      ? 'Tempat pengerjaan bubut dan CNC, honing tabung, perakitan seal kit, dan pengujian tekanan silinder.'
                      : 'Equipped with heavy C6240B lathes, Mazak CNC turning, tube honing, seal assembly, and 400 Bar hydrostatic test bench.'}
                  </p>

                  <a
                    href="https://share.google/Bmp0bpSGATTe2clDr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-belsa-outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      fontSize: '0.88rem',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                    <span>{isId ? 'Buka Peta Workshop (Google Maps)' : 'Directions to Workshop (Google Maps)'}</span>
                  </a>
                </div>
              </div>

              {/* Head Office Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--belsa-border)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--belsa-red)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {isId ? 'Kantor Pusat' : 'Corporate Head Office'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--belsa-dark)', margin: '4px 0 10px' }}>
                  Head Office Gading Serpong
                </h3>
                <p style={{ color: 'var(--belsa-gray)', fontSize: '0.92rem', lineHeight: 1.65, margin: '0 0 8px' }}>
                  Jl. Scientia Garden T/07, Scientia Boulevard, Gading Serpong, Kab. Tangerang – Banten 15334
                </p>
                <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                  {isId
                    ? 'Kantor manajemen, tim sales teknis, pembahasan drawing dan spesifikasi, serta administrasi kontrak dan tender.'
                    : 'Corporate management center, technical sales consultations, CAD drawing reviews, and B2B procurement contract administration.'}
                </p>

                <a
                  href="https://www.google.com/maps/place/Nabel+Sakha+Building/@-6.259055,106.6080465,1346m/data=!3m1!1e3!4m6!3m5!1s0x2e69fc750c1499af:0x6a880c03d8ec12b1!8m2!3d-6.2589089!4d106.6079929!16s%2Fg%2F119vrtf59?entry=ttu&g_ep=EgoyMDI2MTEwMS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-belsa-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    fontSize: '0.88rem',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>{isId ? 'Buka Peta Head Office (Google Maps)' : 'Directions to Head Office (Google Maps)'}</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. Full-Width Interactive Location Maps Canvas Card */}
      <section style={{ marginBottom: '60px' }}>
        <div className="belsa-container">
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--belsa-border)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header: Title, Address & Interactive Tab Switcher */}
            <div className="contact-map-header" style={{
              padding: '24px 28px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="belsa-brand-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                    {isId ? 'Peta & Akses Lokasi' : 'Live Maps & Navigation'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '3px 10px', borderRadius: '6px' }}>
                    {isId ? 'Navigasi Aktif' : 'GPS Active'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--belsa-dark)', margin: 0, lineHeight: 1.2 }}>
                  {activeMapTab === 'workshop'
                    ? (isId ? 'Titik Lokasi Workshop & Pabrik Fabrikasi BELSA' : 'BELSA Manufacturing Plant & Workshop')
                    : (isId ? 'Titik Lokasi Kantor Pusat (Head Office)' : 'BELSA Corporate Head Office')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
                  {activeMapTab === 'workshop'
                    ? 'Kawasan Pergudangan Sunrise Bizpark, Jl. Raya Prabu Siliwangi Km 3,5, Pasar Kemis, Tangerang'
                    : 'Jl. Scientia Garden T/07, Scientia Boulevard, Gading Serpong, Kab. Tangerang – Banten 15334'}
                </p>
              </div>

              {/* Location Switcher Tabs */}
              <div style={{
                display: 'inline-flex',
                background: '#F1F5F9',
                padding: '4px',
                borderRadius: '12px',
                gap: '4px',
                width: 'auto'
              }} className="contact-tab-buttons">
                <button
                  type="button"
                  onClick={() => handleMapTabChange('workshop')}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeMapTab === 'workshop' ? '#FFFFFF' : 'transparent',
                    color: activeMapTab === 'workshop' ? 'var(--belsa-red)' : '#64748B',
                    fontWeight: activeMapTab === 'workshop' ? 800 : 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: activeMapTab === 'workshop' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📍</span>
                  <span>{isId ? 'Workshop Pasar Kemis' : 'Pasar Kemis Workshop'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMapTabChange('office')}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeMapTab === 'office' ? '#FFFFFF' : 'transparent',
                    color: activeMapTab === 'office' ? 'var(--belsa-red)' : '#64748B',
                    fontWeight: activeMapTab === 'office' ? 800 : 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: activeMapTab === 'office' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🏢</span>
                  <span>{isId ? 'Head Office Gading Serpong' : 'Gading Serpong HO'}</span>
                </button>
              </div>
            </div>

            {/* Google Maps Full Width Embed Canvas */}
            <div className="contact-map-frame" style={{ position: 'relative', width: '100%', height: '380px', background: '#F1F5F9', overflow: 'hidden' }}>
              {isMapLoading && (
                <div
                  className="belsa-image-skeleton"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animation: 'belsaSpin 0.9s linear infinite' }}
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, letterSpacing: '0.02em' }}>
                    {isId ? 'Memuat Peta Lokasi...' : 'Loading Location Map...'}
                  </span>
                </div>
              )}
              <iframe
                key={activeMapTab}
                title={activeMapTab === 'workshop' ? 'Titik Maps Workshop BELSA' : 'Titik Maps Head Office BELSA'}
                src={
                  activeMapTab === 'workshop'
                    ? 'https://maps.google.com/maps?q=-6.178381069208916,106.56286069510205+(Workshop+PT+Rafitama+Millenial+Wahyudi)&t=&z=16&ie=UTF8&iwloc=&output=embed'
                    : 'https://maps.google.com/maps?q=-6.2589089,106.6079929+(Nabel+Sakha+Building)&t=&z=17&ie=UTF8&iwloc=&output=embed'
                }
                width="100%"
                height="100%"
                onLoad={() => setIsMapLoading(false)}
                style={{
                  border: 0,
                  display: 'block',
                  opacity: isMapLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease-out'
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Map Footer Bar with Freight Info and Navigation Button */}
            <div className="contact-map-footer" style={{
              padding: '18px 28px',
              background: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>🚛</span>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                  {activeMapTab === 'workshop'
                    ? (isId ? 'Akses ekspedisi truk kontainer 20ft & 40ft melalui Tol Jakarta-Merak (Exit Tol Cikupa / Pasar Kemis).' : 'Accessible for 20ft & 40ft container freight trucks via Jakarta-Merak Toll (Cikupa Exit).')
                    : (isId ? 'Lokasi strategis di Gading Serpong, dekat pusat bisnis dan akses tol Jakarta-Tangerang.' : 'Located strategically in Gading Serpong commercial hub with direct toll access.')}
                </span>
              </div>

              <a
                href={
                  activeMapTab === 'workshop'
                    ? 'https://maps.app.goo.gl/CPFtJNBygVUNbXiQ9'
                    : 'https://www.google.com/maps/place/Nabel+Sakha+Building/@-6.259055,106.6080465,1346m/data=!3m1!1e3!4m6!3m5!1s0x2e69fc750c1499af:0x6a880c03d8ec12b1!8m2!3d-6.2589089!4d106.6079929!16s%2Fg%2F119vrtf59?entry=ttu&g_ep=EgoyMDI2MTEwMS4wIKXMDSoASAFQAw%3D%3D'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-belsa-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>{isId ? 'Buka Navigasi di Google Maps' : 'Open Navigation in Maps'} &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Fast-Track Consultation Banner */}
      <section>
        <div className="belsa-container">
          <div
            className="belsa-dark-cta-banner belsa-reveal"
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              borderRadius: '20px',
              padding: '40px 36px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '28px',
              flexWrap: 'wrap',
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.15)'
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38BDF8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                {isId ? 'Konsultasi Drawing' : 'Fast-Track CAD Drawing Consultation'}
              </span>
              <h3 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.7rem)', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>
                {isId
                  ? 'Punya File Drawing (DWG / DXF / PDF) atau Spesifikasi Mesin?'
                  : 'Have CAD Drawings (DWG / DXF / PDF) or Machinery Specs?'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.65 }}>
                {isId
                  ? 'Kirim file drawing atau foto sample komponen ke WhatsApp tim teknis BELSA. Kami akan menghitung kebutuhan teknisnya dan menyiapkan penawaran.'
                  : 'Send your CAD drawings or physical sample photos directly to our engineering WhatsApp for technical load calculations and fast RFQ turnaround.'}
              </p>
            </div>

            <div className="belsa-dark-cta-btns" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/6281119168752?text=Halo%20tim%20teknis%20BELSA%2C%20saya%20ingin%20mengirimkan%20file%20drawing%20CAD%20dan%20spesifikasi%20untuk%20estimasi%20penawaran."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-belsa-primary belsa-btn-sheen"
                style={{
                  padding: '14px 24px',
                  fontSize: '0.94rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none'
                }}
              >
                <span>{isId ? 'Kirim Drawing via WhatsApp' : 'Submit CAD via WhatsApp'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>

              <Link
                href="/calculator"
                className="btn-belsa-outline"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  padding: '14px 22px',
                  fontSize: '0.94rem',
                  textDecoration: 'none'
                }}
              >
                <span>{isId ? 'Kalkulator Silinder' : 'Cylinder Calculator'} &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Styles for Contact Page */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .contact-main-split-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .contact-form-box {
            padding: 22px 16px !important;
            border-radius: 16px !important;
          }
          .contact-form-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .contact-map-header {
            padding: 18px 16px !important;
          }
          .contact-tab-buttons {
            width: 100% !important;
          }
          .contact-tab-buttons button {
            flex: 1 !important;
            justify-content: center !important;
            padding: 8px 10px !important;
            font-size: 0.78rem !important;
          }
          .contact-map-frame {
            height: 280px !important;
          }
          .contact-map-footer {
            padding: 16px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .contact-map-footer a {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </main>
  );
}
