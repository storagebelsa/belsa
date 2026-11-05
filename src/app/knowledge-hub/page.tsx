'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { DEFAULT_ARTICLES, ArticleItem } from '@/data/articlesData';

export default function KnowledgeHubPage() {
  const { lang } = useLanguage();
  const isId = lang === 'id';

  const [articles, setArticles] = useState<ArticleItem[]>(DEFAULT_ARTICLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Live fetch from /api/articles (merges default articles, Google Sheets articles, and admin overrides)
  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setArticles(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['all', ...Array.from(set)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = selectedTag === 'all' || art.category === selectedTag;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        art.title[lang].toLowerCase().includes(q) ||
        art.summary[lang].toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [articles, selectedTag, searchQuery, lang]);

  return (
    <main style={{ padding: '50px 0 80px', background: '#FAFAFA' }}>
      
      {/* 1. Page Header matching BELSA standard */}
      <section className="belsa-page-header">
        <div className="belsa-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
            <span
              style={{
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
                gap: '6px',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Engineering Knowledge Hub
            </span>
            <span
              style={{
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {articles.length} Panduan Teknis
            </span>
          </div>

          <h1 className="heading-hero" style={{ maxWidth: '920px', margin: '0 auto 16px', lineHeight: 1.25 }}>
            {isId ? (
              <>
                Pusat Rekayasa & Panduan Teknis <span style={{ color: 'var(--belsa-red)' }}>Silinder, Selang & Valve</span>
              </>
            ) : (
              <>
                Industrial Engineering <span style={{ color: 'var(--belsa-red)' }}>Knowledge & Technical Guides</span>
              </>
            )}
          </h1>

          <p className="subhead" style={{ maxWidth: '780px', margin: '0 auto' }}>
            {isId
              ? 'Kumpulan artikel standar manufaktur, formula kalkulasi teknik, solusi kebocoran, dan panduan interchangeability komponen otomatisasi pabrik.'
              : 'Technical standards, ISO dimension breakdowns, Barlow pressure formulas, and preventive maintenance guides for factory machinery.'}
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '540px', margin: '28px auto 0', position: 'relative' }}>
            <input
              type="text"
              placeholder={isId ? 'Cari panduan teknis, standar ISO, atau kata kunci...' : 'Search guides, ISO standards, or keywords...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 20px 13px 44px',
                borderRadius: '12px',
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            />
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '1rem' }}>
              🔍
            </span>
          </div>
        </div>
      </section>

      {/* 2. Category Filter Pills */}
      <section style={{ padding: '0 0 32px 0' }}>
        <div className="belsa-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 20px' }}>
          {categories.map((cat) => {
            const isSelected = selectedTag === cat;
            const label = cat === 'all' ? (isId ? 'Semua Kategori' : 'All Categories') : cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedTag(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: isSelected ? '1px solid var(--belsa-red)' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isSelected ? 'var(--belsa-red)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  boxShadow: isSelected ? '0 4px 12px rgba(220, 38, 38, 0.2)' : '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Articles Grid */}
      <section style={{ padding: '10px 0 60px' }}>
        <div className="belsa-container" style={{ padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
            {filteredArticles.map((art) => (
              <div
                key={art.slug}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                {/* Thumbnail Image */}
                <div style={{ position: 'relative', height: '200px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                  <Image
                    src={art.image}
                    alt={art.title[lang]}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    style={{ objectFit: 'contain', padding: '20px' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backdropFilter: 'blur(4px)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {art.category}
                  </span>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#64748B', marginBottom: '12px' }}>
                    <span>📅 {art.date}</span>
                    <span>•</span>
                    <span>⏱️ {art.readTime}</span>
                  </div>

                  <h2 style={{ fontSize: '1.22rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                    <Link
                      href={`/knowledge-hub/${art.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                    >
                      {art.title[lang]}
                    </Link>
                  </h2>

                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 18px 0', flex: 1 }}>
                    {art.summary[lang]}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {art.tags.slice(0, 3).map((t) => (
                      <span key={t} style={{ fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '3px 9px', borderRadius: '4px', fontWeight: 500 }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Direct Link to Dedicated Slug Page (NO POPUP) */}
                  <Link
                    href={`/knowledge-hub/${art.slug}`}
                    className="btn-belsa-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                    }}
                  >
                    {isId ? 'Baca Panduan Lengkap' : 'Read Full Guide'} &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: '1.05rem', margin: 0 }}>
                {isId ? 'Tidak ada artikel yang cocok dengan pencarian Anda.' : 'No articles matched your search query.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Bottom Engineering Consultation Banner */}
      <section style={{ padding: '0 0 40px' }}>
        <div className="belsa-container" style={{ padding: '0 20px' }}>
          <div
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '40px 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#FDBA74', letterSpacing: '0.04em' }}>
                {isId ? 'Dukungan Rekayasa & Fabrikasi' : 'Custom Engineering & Fabrication'}
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '8px 0 10px', letterSpacing: '-0.02em' }}>
                {isId ? 'Punya Spesifikasi atau Problem Mesin Khusus?' : 'Have Bespoke Technical Specifications?'}
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                {isId
                  ? 'Tim teknis PT. Rafitama Millenial Wahyudi siap membantu perhitungan kapasitas silinder, pemilihan selang, dan pembuatan unit custom di workshop Tangerang.'
                  : 'Our engineering workshop in Tangerang assists with custom hydraulic cylinder design, seal kit selection, and pressure line crimping.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/contact-us" className="btn-belsa-primary">
                {isId ? 'Hubungi Tim Teknis' : 'Contact Engineering'} &rarr;
              </Link>
              <Link
                href="/calculator"
                className="btn-belsa-outline"
                style={{ color: '#FFFFFF', borderColor: '#334155' }}
              >
                {isId ? 'Kalkulator Silinder' : 'Cylinder Calculator'}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
