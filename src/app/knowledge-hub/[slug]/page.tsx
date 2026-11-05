'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { DEFAULT_ARTICLES, ArticleItem } from '@/data/articlesData';

interface Props {
  params: Promise<{ slug: string }>;
}

// Markdown Formatter for Article Body
function renderRichContent(rawText: string) {
  if (!rawText) return null;

  const lines = rawText.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#0F172A', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        return (
          <Link
            key={i}
            href={linkMatch[2]}
            style={{ color: 'var(--belsa-red)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {linkMatch[1]}
          </Link>
        );
      }
      return part;
    });
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div
            key={`code-${idx}`}
            style={{
              background: '#0F172A',
              color: '#F8FAFC',
              fontFamily: 'monospace',
              fontSize: '0.92rem',
              padding: '16px 20px',
              borderRadius: '10px',
              margin: '18px 0',
              overflowX: 'auto',
              borderLeft: '4px solid var(--belsa-red)',
              lineHeight: 1.55,
            }}
          >
            {codeBuffer.join('\n')}
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} style={{ height: '10px' }} />);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${idx}`}
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.015em',
            marginTop: '28px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ width: '4px', height: '20px', background: 'var(--belsa-red)', borderRadius: '2px', display: 'inline-block' }} />
          {trimmed.replace('### ', '')}
        </h3>
      );
      continue;
    }

    if (/^[0-9]+\.\s+/.test(trimmed)) {
      elements.push(
        <div
          key={`num-${idx}`}
          style={{
            paddingLeft: '20px',
            marginBottom: '10px',
            color: '#334155',
            lineHeight: 1.75,
            fontSize: '1rem',
          }}
        >
          {formatInline(trimmed)}
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('- ')) {
      elements.push(
        <div
          key={`bullet-${idx}`}
          style={{
            paddingLeft: '20px',
            marginBottom: '8px',
            color: '#334155',
            lineHeight: 1.7,
            fontSize: '0.98rem',
            display: 'flex',
            gap: '10px',
          }}
        >
          <span style={{ color: 'var(--belsa-red)', fontWeight: 'bold' }}>•</span>
          <div>{formatInline(trimmed.slice(2))}</div>
        </div>
      );
      continue;
    }

    elements.push(
      <p
        key={`p-${idx}`}
        style={{
          color: '#334155',
          fontSize: '1.02rem',
          lineHeight: 1.8,
          margin: '0 0 14px 0',
        }}
      >
        {formatInline(line)}
      </p>
    );
  }

  return elements;
}

export default function ArticleDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { lang } = useLanguage();
  const isId = lang === 'id';

  const [articles, setArticles] = useState<ArticleItem[]>(DEFAULT_ARTICLES);
  const [copied, setCopied] = useState(false);

  // Fetch live articles (to support custom articles added from admin/sheets)
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

  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    // If not found in default list, try initial fallback before 404
    const fallback = DEFAULT_ARTICLES.find((a) => a.slug === slug);
    if (!fallback) {
      notFound();
    }
  }

  const currentArticle = article || DEFAULT_ARTICLES.find((a) => a.slug === slug)!;
  const relatedArticles = articles
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  const title = currentArticle.title[lang];
  const summary = currentArticle.summary[lang];
  const content = currentArticle.content[lang];

  const waConsultUrl = `https://wa.me/6281119168752?text=${encodeURIComponent(
    isId
      ? `Halo tim teknik BELSA, saya membaca artikel "${title}" di website belsa.id dan ingin berkonsultasi mengenai spesifikasi untuk mesin pabrik kami.`
      : `Hello BELSA engineering team, I read your article "${title}" on belsa.id and would like to consult about our industrial requirements.`
  )}`;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main style={{ padding: '40px 0 80px', background: '#FAFAFA' }}>
      <div className="belsa-container" style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumb Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748B', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            {isId ? 'Beranda' : 'Home'}
          </Link>
          <span>/</span>
          <Link href="/knowledge-hub" style={{ color: '#64748B', textDecoration: 'none' }}>
            Knowledge Hub
          </Link>
          <span>/</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>
            {currentArticle.category}
          </span>
        </nav>

        {/* Article Header Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '36px 36px 32px', marginBottom: '28px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
              {currentArticle.category}
            </span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              📅 {currentArticle.date}
            </span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              ⏱️ {currentArticle.readTime}
            </span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              ✍️ {currentArticle.author || 'Tim Engineering BELSA'}
            </span>
          </div>

          <h1 className="heading-hero" style={{ fontSize: '2.1rem', lineHeight: 1.3, marginBottom: '16px', textAlign: 'left' }}>
            {title}
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.65, margin: '0 0 24px 0' }}>
            {summary}
          </p>

          {/* Social Share & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {currentArticle.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    background: '#F1F5F9',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 500,
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href={waConsultUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: '#25D366',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span>💬</span> WhatsApp Tim Teknis
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  color: '#0F172A',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                }}
              >
                {copied ? '✓ Tersalin' : '🔗 Salin Tautan'}
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image Banner */}
        {currentArticle.image && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '340px',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              marginBottom: '32px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <Image
              src={currentArticle.image}
              alt={title}
              fill
              sizes="(max-width: 1040px) 100vw, 1040px"
              priority
              style={{ objectFit: 'contain', padding: '24px' }}
            />
          </div>
        )}

        {/* Main Content Layout with Content & Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px', alignItems: 'start' }} className="belsa-article-grid">
          
          {/* Article Main Text */}
          <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '36px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            {renderRichContent(content)}

            {/* End of Article Notice */}
            <div style={{ marginTop: '36px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', borderLeft: '4px solid var(--belsa-red)' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
                {isId ? 'Konsultasi Rekayasa Silinder & Selang Industri' : 'Industrial Cylinder & Hose Engineering Support'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
                {isId
                  ? 'PT. Rafitama Millenial Wahyudi melayani fabrikasi silinder hidrolik & pneumatik custom, perakitan selang crimping, dan pengadaan valve industri dengan garansi pabrik.'
                  : 'PT. Rafitama Millenial Wahyudi provides custom hydraulic & pneumatic fabrication, high-pressure hose crimping, and genuine industrial valves with full warranty.'}
              </p>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
            
            {/* CTA Box */}
            <div style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px -4px rgba(15,23,42,0.2)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#FDBA74', letterSpacing: '0.04em' }}>
                {isId ? 'Bantuan Teknis' : 'Engineering Desk'}
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '8px 0 10px', lineHeight: 1.35 }}>
                {isId ? 'Punya Gambar CAD atau Sampel Rusak?' : 'Need CAD Custom Sizing or Breakdown Repair?'}
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#94A3B8', lineHeight: 1.55, marginBottom: '18px' }}>
                {isId
                  ? 'Diskusikan kebutuhan silinder hidrolik custom atau penggantian emergency dengan tim workshop kami.'
                  : 'Discuss bespoke cylinder design or emergency seal kit turnaround with our factory engineers.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={waConsultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-belsa-primary"
                  style={{ width: '100%', textAlign: 'center', padding: '10px 14px', fontSize: '0.86rem' }}
                >
                  WhatsApp Tim Teknis &rarr;
                </a>
                <Link
                  href="/calculator"
                  className="btn-belsa-outline"
                  style={{ width: '100%', textAlign: 'center', padding: '10px 14px', fontSize: '0.86rem', color: '#FFFFFF', borderColor: '#334155' }}
                >
                  Buka Kalkulator Silinder
                </Link>
              </div>
            </div>

            {/* Back to Hub Button */}
            <Link
              href="/knowledge-hub"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              &larr; {isId ? 'Semua Panduan Knowledge Hub' : 'All Knowledge Hub Guides'}
            </Link>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--belsa-red)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isId ? 'Rekomendasi Lainnya' : 'Recommended Reading'}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '4px 0 0 0' }}>
                {isId ? 'Panduan Rekayasa Terkait' : 'Related Engineering Guides'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px' }}>
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/knowledge-hub/${rel.slug}`}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--belsa-red)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {rel.category}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4, margin: '0 0 8px 0', flex: 1 }}>
                    {rel.title[lang]}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748B', marginTop: '10px' }}>
                    <span>⏱️ {rel.readTime}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--belsa-red)', fontWeight: 600 }}>
                      {isId ? 'Baca Panduan' : 'Read Guide'} &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .belsa-article-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
