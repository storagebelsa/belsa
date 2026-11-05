'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';

interface ArticleItem {
  id: string;
  slug: string;
  title: { id: string; en: string };
  category: string;
  summary: { id: string; en: string };
  content: { id: string; en: string };
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

const DEFAULT_ARTICLES: ArticleItem[] = [
  {
    id: 'iso-15552-guide',
    slug: 'panduan-standar-silinder-iso-15552',
    category: 'Pneumatic Cylinder',
    title: {
      id: 'Panduan Lengkap Standar Silinder ISO 15552: Cara Membaca Kode & Dimensi Mounting',
      en: 'Complete Guide to ISO 15552 Pneumatic Cylinders: Code Decoding & Mounting Dimensions'
    },
    summary: {
      id: 'Memahami standar internasional ISO 15552 untuk silinder profil pneumatik, aturan interchangeability antar-brand (Festo, SMC, Parker), dan cara membaca blok kode pemesanan secara presisi.',
      en: 'A comprehensive technical overview of ISO 15552 pneumatic profile cylinders, brand interchangeability, and precision model code breakdown.'
    },
    content: {
      id: `Standar ISO 15552 (menggantikan standar terdahulu ISO 6431) adalah standar internasional paling umum yang mengatur dimensi pemasangan (mounting dimensions), ukuran bore (Ø32 mm hingga Ø320 mm), serta tekanan operasional silinder profil pneumatik.

### Mengapa Standar ISO 15552 Sangat Penting Bagi Industri?
1. **Interchangeability (Dapat Dipertukarkan)**: Silinder dengan standar ISO 15552 memiliki pitch baut dudukan (mounting hole centers), diameter rod, dan ulir rod yang identik di seluruh dunia. Artinya, silinder seri BELSA ACI/BMC dapat langsung menggantikan silinder brand internasional seperti SMC CP96/C96, Festo DNC/DSBC, atau Parker P1D tanpa perlu mengubah bracket mesin Anda.
2. **Profile Tube dengan Sensor Groove**: Tabung silinder dilengkapi celah sensor magnetik terintegrasi, memudahkan pemasangan auto-switch reed/solid-state tanpa bracket tambahan yang menonjol.
3. **Cushioning Udara Kedua Sisi**: Dilengkapi adjustable cushion needle dengan seal peredam benturan kinetik di akhir langkah (stroke), memperpanjang usia pakai seal piston.

### Cara Membaca Kode Pemesanan (How to Order):
Pada seri BELSA ACI, kode dipecah menjadi beberapa slot:
- Slot 1: Seri Silinder (ACI = Profile ISO 15552)
- Slot 2: Tipe Dudukan Mounting (FA = Flange depan, LB = Foot mounting, CA/CB = Clevis)
- Slot 3: Ukuran Bore (Contoh: 100 = Ø100 mm)
- Slot 4: Panjang Stroke (Contoh: 400 = 400 mm)
- Slot 5 & 6: Material Rod & Seal (STS304 Stainless, Seal Viton tahan panas)

Untuk menghitung gaya dorong silinder ISO 15552 pada tekanan pabrik Anda, gunakan [Kalkulator Silinder BELSA](/calculator).`,
      en: `ISO 15552 standard defines interchangeability for pneumatic profile cylinders across international industrial machinery. BELSA ACI series provides 100% drop-in compatibility for Festo, SMC, and Parker profile cylinders.`
    },
    date: '2026-11-04',
    readTime: '5 min baca',
    image: '/images/prod_cylinder_clean.webp',
    tags: ['Pneumatik', 'ISO 15552', 'How to Order', 'Bore & Stroke']
  },
  {
    id: 'barlow-formula-honing',
    slug: 'rumus-barlow-ketebalan-pipa-honing-hidrolik',
    category: 'Hydraulic Engineering',
    title: {
      id: 'Rumus Barlow: Perhitungan Ketebalan Dinding Tabung Pipa Honed ST52 Silinder Hidrolik',
      en: 'Barlow Formula: Calculating Wall Thickness for ST52 Honed Hydraulic Tubes'
    },
    summary: {
      id: 'Panduan teknis menghitung ketebalan minimum pipa seamless honed tube, safety factor tegangan luluh (yield strength), dan batas toleransi pembesaran (oversize) saat rekondisi silinder.',
      en: 'Engineering calculation guide for seamless honed tube wall thickness using Barlow formula and standard yield strength safety factors.'
    },
    content: {
      id: `Tabung silinder hidrolik (Honed Tube) menahan tekanan fluida bertekanan tinggi yang bekerja ke arah radial ke luar (hoop stress). Kegagalan menghitung ketebalan dinding dapat menyebabkan tabung menggelembung (swelling) atau pecah saat terjadi lonjakan tekanan (pressure shock).

### Rumus Barlow untuk Tabung Bertekanan:
Rumus standar Barlow yang digunakan oleh insinyur hidrolik adalah:
\`\`\`
t_min = (P × OD) / (2 × σ_allow + P)
\`\`\`
Di mana:
- **P**: Tekanan kerja maksimal atau tekanan uji (Bar / MPa)
- **OD**: Diameter luar tabung (Outer Diameter) dalam mm
- **σ_allow**: Tegangan tarik izin material (Allowable Stress) = Tegangan Luluh (Yield Strength) / Safety Factor
- **Safety Factor**: Direkomendasikan minimal 2.15 hingga 3.0 untuk operasional industri berat

### Karakteristik Material Tabung Standar BELSA:
- **DIN 2391 / EN 10305-1 Grade E355 (ST52 / ST52.4 BK+S)**:
  - Yield Strength (Re): ≥ 520 N/mm²
  - Tensile Strength (Rm): ≥ 600 N/mm²
  - Kekasaran Dinding Dalam: Ra ≤ 0.4 µm (H8 Tolerance)
  - Sangat tahan terhadap gesekan piston seal dan tekanan kejut hingga 350 Bar.

Anda dapat menghitung ketebalan pipa honing dan mengecek batas keamanan secara instan di [Kalkulator Barlow BELSA](/calculator).`,
      en: `Barlow formula calculates the required minimum wall thickness of honed hydraulic cylinder tubes based on internal pressure, diameter, and allowable stress of ST52/E355 steel.`
    },
    date: '2026-11-03',
    readTime: '6 min baca',
    image: '/images/prod_cylinder_clean.webp',
    tags: ['Hidrolik', 'Rumus Barlow', 'Honed Tube', 'Kalkulasi Teknik']
  },
  {
    id: 'seal-materials-guide',
    slug: 'material-seal-hidrolik-nbr-pu-viton-fkm',
    category: 'Seal Kit & Materials',
    title: {
      id: 'Perbandingan Karakteristik Seal NBR, Polyurethane (PU), dan FKM (Viton) pada Suhu & Tekanan Ekstrem',
      en: 'Comparing NBR, Polyurethane (PU), and FKM (Viton) Seals in Extreme Temperature and Pressure'
    },
    summary: {
      id: 'Memilih material seal yang tepat untuk rod seal, piston seal, dan wiper pada silinder hidrolik dan pneumatik guna mencegah kebocoran akibat suhu panas dan gesekan tinggi.',
      en: 'How to select the right seal material for hydraulic and pneumatic cylinders to prevent leaks caused by high operating temperatures and mechanical friction.'
    },
    content: {
      id: `Kebocoran oli pada silinder hidrolik lebih dari 80% disebabkan oleh pemilihan material seal yang tidak cocok dengan suhu fluida, jenis pelumas, atau kecepatan gesek rod.

### Perbandingan 3 Material Seal Utama:

1. **Polyurethane (PU / TPU)**:
   - **Ketahanan Tekanan**: Sangat tinggi (mampu menahan hingga 400 Bar tanpa backup ring).
   - **Ketahanan Gesek (Wear Resistance)**: Paling baik dibanding karet konvensional.
   - **Suhu Operasional**: -30°C hingga +90°C.
   - **Aplikasi Terbaik**: Piston seal dan U-cup rod seal silinder hidrolik standar alat berat dan mesin pabrik.

2. **Nitrile Butadiene Rubber (NBR)**:
   - **Ketahanan Tekanan**: Sedang (hingga 160 Bar dengan backup ring).
   - **Kompatibilitas Fluida**: Sangat baik dengan oli mineral berbasis minyak bumi, air, dan gemuk.
   - **Suhu Operasional**: -25°C hingga +100°C.
   - **Aplikasi Terbaik**: O-ring statis, silinder pneumatik standar, dan wiper dust seal.

3. **Fluoroelastomer (FKM / Viton®)**:
   - **Ketahanan Suhu**: Luar biasa tinggi (tahan hingga +200°C berkelanjutan).
   - **Ketahanan Kimia**: Kebal terhadap oli sintetis agresif, ester fosfat (skydrol), dan bahan kimia industri.
   - **Kelemahan**: Ketahanan gesek mekanis lebih rendah dibanding PU pada tekanan sangat tinggi.
   - **Aplikasi Terbaik**: Silinder industri peleburan baja (steel mill), pabrik kaca, boiler, dan industri kimia.

Di BELSA, semua seri silinder (seperti BMG140, BMG210, dan ACI) menyediakan opsi upgrade seal FKM (Viton) tahan panas secara langsung pada kode pemesanan.`,
      en: `Choosing between PU, NBR, and Viton/FKM seal kits depends on hydraulic fluid operating temperatures and maximum line pressure.`
    },
    date: '2026-11-01',
    readTime: '4 min baca',
    image: '/images/prod_cylinder_clean.webp',
    tags: ['Seal Kit', 'Viton', 'Polyurethane', 'Maintenance']
  },
  {
    id: 'hydraulic-troubleshooting-leak',
    slug: 'penyebab-silinder-hidrolik-bocor-cara-mengatasi',
    category: 'Troubleshooting & Maintenance',
    title: {
      id: 'Penyebab Utama Kebocoran Silinder Hidrolik & Solusi Perbaikan Overhaul',
      en: 'Primary Causes of Hydraulic Cylinder Leakage & Overhaul Repair Solutions'
    },
    summary: {
      id: 'Identifikasi gejala kebocoran eksternal (rod seal bocor) vs kebocoran internal (drift/piston seal bypass) dan langkah rekondisi silinder hidrolik pabrik.',
      en: 'Troubleshooting external rod leaks and internal piston bypass drift on industrial hydraulic cylinders with overhaul guidelines.'
    },
    content: {
      id: `Silinder hidrolik yang mengalami kebocoran menyebabkan penurunan efisiensi mesin, pemborosan oli, bahaya keselamatan kerja, dan risiko terhentinya lini produksi pabrik (downtime).

### 1. Kebocoran Eksternal (Oli Menetes di Rod Silinder)
- **Penyebab**:
  - Goresan atau pitting pada batang piston rod akibat debu tajam yang lolos dari wiper seal.
  - Bending (kelurusan rod bengkok) akibat beban samping (side load).
  - Seal rod mengeras atau getas karena suhu oli melebihi batas desain.
- **Solusi**:
  - Lakukan hard chrome re-plating dan grinding rod ke toleransi f7.
  - Ganti rod seal kit dengan material bertoleransi suhu lebih tinggi.

### 2. Kebocoran Internal (Bypass / Piston Drift)
- **Gejala**: Silinder tidak mampu menahan beban dan perlahan turun sendiri (drift) meskipun valve kontrol dalam posisi terkunci.
- **Penyebab**:
  - Dinding tabung pipa honing tergores akibat partikel gram logam dalam oli.
  - Seal piston robek atau aus akibat gesekan kering.
- **Solusi**:
  - Lakukan inspeksi visual ke dalam tabung silinder. Jika goresan dalam, workshop BELSA dapat melakukan re-honing atau mengganti tube dengan ST52 baru.
  - Kuras oli dan pasang filter hidrolik BELSA untuk memastikan kontaminasi partikel di bawah standar ISO 4406.

Untuk konsultasi rekondisi atau pembuatan silinder pengganti darurat, hubungi tim teknis di [Kontak Kami](/contact-us).`,
      en: `Learn how to diagnose internal piston bypass vs external rod seal leakage, and professional cylinder overhaul best practices.`
    },
    date: '2026-10-28',
    readTime: '5 min baca',
    image: '/images/prod_cylinder_clean.webp',
    tags: ['Troubleshooting', 'Maintenance', 'Overhaul', 'Silinder Hidrolik']
  },
  {
    id: 'hydraulic-hose-selection',
    slug: 'panduan-memilih-selang-hidrolik-sae-100-r1-r2-4sp',
    category: 'Hose & Fittings',
    title: {
      id: 'Klasifikasi Selang Hidrolik SAE 100 R1AT, R2AT, 4SP, dan 4SH Sesuai Tekanan Kerja',
      en: 'Classification of Hydraulic Hoses SAE 100 R1AT, R2AT, 4SP, and 4SH by Working Pressure'
    },
    summary: {
      id: 'Panduan standar kawat anyam (wire braid) vs spiral kawat baja (wire spiral) pada selang hidrolik bertekanan tinggi untuk mencegah ledakan selang (hose bursting).',
      en: 'Technical guide on selecting wire braid vs wire spiral high pressure hydraulic hoses to prevent catastrophic bursting under extreme pressure.'
    },
    content: {
      id: `Memilih selang hidrolik tidak boleh hanya berdasarkan diameter dalam (ID). Tekanan kerja dinamis (Dynamic Working Pressure) dan siklus impuls lonjakan tekanan harus dihitung secara teliti.

### Klasifikasi Konstruksi Selang Hidrolik:
1. **SAE 100 R1AT (1SN)**:
   - Konstruksi: 1 lapis anyaman kawat baja tarik tinggi (Single Wire Braid).
   - Penggunaan: Saluran tekanan rendah hingga sedang (hingga 225 Bar pada ukuran kecil).
   - Kelebihan: Sangat lentur, radius belok (bend radius) kecil.
2. **SAE 100 R2AT (2SN)**:
   - Konstruksi: 2 lapis anyaman kawat baja (Double Wire Braid).
   - Penggunaan: Standar umum saluran utama mesin pabrik dan alat konstruksi (hingga 400 Bar).
3. **EN 856 4SP & 4SH (Multi-Spiral)**:
   - Konstruksi: 4 lapis spiral kawat baja berkekuatan tinggi berselang-seling.
   - Penggunaan: Saluran dengan impuls tekanan kejut ekstrem (surge pressure), seperti mesin press hidrolik besar, crusher, dan injeksi plastik.
   - Kelebihan: Tahan terhadap kelelahan impuls (impulse fatigue) hingga jutaan siklus kerja.

Workshop BELSA menyediakan perakitan selang hidrolik lengkap dengan crimping fitting presisi dan pengetesan uji hidrostatik. Kunjungi katalog selang di [Selang Hidrolik Industri](/products/selang-hidrolik-industri).`,
      en: `A technical guide on wire braided R1/R2 and multi-spiral 4SP/4SH hydraulic hoses designed for heavy impulse pressure applications.`
    },
    date: '2026-10-22',
    readTime: '4 min baca',
    image: '/images/prod_hose_clean.webp',
    tags: ['Selang Hidrolik', 'Fittings', 'Tekanan Tinggi', 'SAE 100']
  }
];

export default function KnowledgeHubPage() {
  const { lang } = useLanguage();
  const isId = lang === 'id';

  const [articles, setArticles] = useState<ArticleItem[]>(DEFAULT_ARTICLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Semua');
  const [activeArticleModal, setActiveArticleModal] = useState<ArticleItem | null>(null);

  // Optional live fetch from Google Sheets if user creates a sheet tab for articles
  useEffect(() => {
    const fetchSheetArticles = async () => {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_articles`);
        const json = await res.json();
        const rows = Array.isArray(json) ? json : json.data || [];
        if (Array.isArray(rows) && rows.length > 0) {
          const parsed: ArticleItem[] = rows.map((r: any, idx: number) => ({
            id: r.id || `art_${idx + 1}`,
            slug: r.slug || `artikel-${idx + 1}`,
            category: r.category || 'Teknik Industri',
            title: { id: r.titleId || r.title || 'Artikel Teknik', en: r.titleEn || r.title || 'Technical Article' },
            summary: { id: r.summaryId || r.summary || '', en: r.summaryEn || r.summary || '' },
            content: { id: r.contentId || r.content || '', en: r.contentEn || r.content || '' },
            date: r.date || new Date().toISOString().slice(0, 10),
            readTime: r.readTime || '5 min baca',
            image: r.imageUrl || r.image || '/images/prod_cylinder_clean.webp',
            tags: r.tags ? r.tags.split(',').map((t: string) => t.trim()) : ['Teknik']
          }));
          // Combine sheet articles on top of cornerstone articles
          setArticles([...parsed, ...DEFAULT_ARTICLES]);
        }
      } catch {
        // Fallback silently to comprehensive default articles
      }
    };
    fetchSheetArticles();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.tags.forEach((t) => set.add(t)));
    return ['Semua', ...Array.from(set)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchTag = selectedTag === 'Semua' || art.tags.includes(selectedTag);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        art.title[lang].toLowerCase().includes(q) ||
        art.summary[lang].toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q));
      return matchTag && matchQuery;
    });
  }, [articles, selectedTag, searchQuery, lang]);

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Banner */}
      <section style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', padding: '60px 0 45px' }}>
        <div className="belsa-container" style={{ textAlign: 'center' }}>
          <span className="belsa-page-eyebrow" style={{ display: 'inline-block', marginBottom: '10px' }}>
            {isId ? 'Referensi Engineering & Manufaktur' : 'Engineering & Manufacturing Reference'}
          </span>
          <h1 className="heading-hero" style={{ fontSize: '2.4rem', color: '#0f172a', marginBottom: '14px', letterSpacing: '-0.02em' }}>
            BELSA <span style={{ color: 'var(--belsa-red)' }}>Knowledge Hub</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            {isId
              ? 'Pusat panduan teknis mendalam tentang silinder hidrolik & pneumatik, standar ISO 15552, rumus Barlow, material seal, dan solusi troubleshooting sistem otomasi pabrik.'
              : 'Technical guides, engineering calculations, ISO standards, and troubleshooting solutions for industrial hydraulic and pneumatic power systems.'}
          </p>

          {/* Search Box */}
          <div style={{ maxWidth: '540px', margin: '0 auto', position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isId ? 'Cari panduan teknis (misal: ISO 15552, Barlow, Viton)...' : 'Search technical guides (e.g. ISO 15552, Barlow, Seals)...'}
              style={{
                width: '100%',
                padding: '14px 20px 14px 44px',
                borderRadius: '14px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                background: '#ffffff'
              }}
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: '16px', top: '15px' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </section>

      {/* Filter Tabs by Tag */}
      <section style={{ padding: '24px 0 16px' }}>
        <div className="belsa-container">
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
            {allTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '24px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: active ? '1.5px solid var(--belsa-red)' : '1px solid #cbd5e1',
                    background: active ? '#fef2f2' : '#ffffff',
                    color: active ? 'var(--belsa-red)' : '#475569',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section style={{ padding: '10px 0 40px' }}>
        <div className="belsa-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {filteredArticles.map((art) => (
              <article
                key={art.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ padding: '24px 24px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--belsa-red)', background: '#fee2e2', padding: '3px 9px', borderRadius: '6px' }}>
                      {art.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                      {art.readTime}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, margin: '6px 0 10px', letterSpacing: '-0.01em' }}>
                    {art.title[lang]}
                  </h2>

                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, flex: 1 }}>
                    {art.summary[lang]}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px' }}>
                    {art.tags.slice(0, 3).map((t) => (
                      <span key={t} style={{ fontSize: '0.74rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 24px', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {art.date}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveArticleModal(art)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--belsa-red)',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isId ? 'Baca Selengkapnya' : 'Read Article'} &rarr;
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                {isId ? 'Tidak ada artikel yang cocok dengan pencarian Anda.' : 'No articles match your search criteria.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Tools & CTAs */}
      <section style={{ padding: '20px 0' }}>
        <div className="belsa-container">
          <div style={{ background: '#0f172a', borderRadius: '20px', padding: '36px 32px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ color: '#fca5a5', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Engineering Calculator Suite
              </span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '6px 0 8px', color: '#ffffff' }}>
                {isId ? 'Butuh Perhitungan Cepat Gaya Dorong & Tebal Pipa?' : 'Need Instant Hydraulic Cylinder Force & Tube Sizing?'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.94rem', margin: 0, maxWidth: '580px', lineHeight: 1.6 }}>
                {isId
                  ? 'Gunakan 5 kalkulator teknis BELSA gratis: Hitung tekanan kerja (Bar), beban dorong (Ton), ketebalan pipa honing ST52, keamanan baut tie-rod, dan torsi pengencangan.'
                  : 'Explore 5 free engineering calculation tools built for hydraulic engineers and industrial designers.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/calculator" className="btn-belsa-primary" style={{ padding: '12px 28px' }}>
                {isId ? 'Buka Kalkulator Teknik' : 'Open Engineering Calculator'} &rarr;
              </Link>
              <Link href="/catalogue" className="btn-belsa-outline" style={{ padding: '12px 24px', borderColor: '#475569', color: '#ffffff' }}>
                {isId ? 'Buka Katalog 103 Seri' : 'Explore 103 Series Catalogue'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Detailed Reading View */}
      {activeArticleModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActiveArticleModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '760px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '36px 32px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--belsa-red)', background: '#fee2e2', padding: '3px 10px', borderRadius: '6px' }}>
                {activeArticleModal.category}
              </span>
              <button
                type="button"
                onClick={() => setActiveArticleModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                ✕
              </button>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.35, marginBottom: '12px' }}>
              {activeArticleModal.title[lang]}
            </h1>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.82rem', color: '#64748b', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <span>📅 {activeArticleModal.date}</span>
              <span>⏱️ {activeArticleModal.readTime}</span>
              <span>✍️ Tim Engineering BELSA</span>
            </div>

            <div style={{ color: '#334155', fontSize: '0.98rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {activeArticleModal.content[lang]}
            </div>

            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {activeArticleModal.tags.map((t) => (
                  <span key={t} style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 9px', borderRadius: '6px' }}>
                    #{t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveArticleModal(null)}
                className="btn-belsa-primary"
                style={{ padding: '10px 24px', fontSize: '0.88rem' }}
              >
                {isId ? 'Tutup Artikel' : 'Close Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
