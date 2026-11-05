'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';

interface ArticleItem {
  id: string;
  slug: string;
  category: string;
  title: { id: string; en: string };
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
1. **Interchangeability (Dapat Dipertukarkan Langsung)**: Silinder dengan standar ISO 15552 memiliki pitch baut dudukan (mounting hole centers), diameter rod, dan ulir rod yang identik di seluruh dunia. Artinya, silinder seri BELSA ACI/BMC dapat langsung menggantikan silinder brand internasional seperti SMC CP96/C96, Festo DNC/DSBC, atau Parker P1D tanpa perlu mengubah bracket mesin Anda.
2. **Profile Tube dengan Sensor Groove**: Tabung silinder dilengkapi celah sensor magnetik terintegrasi, memudahkan pemasangan auto-switch reed/solid-state tanpa bracket tambahan yang menonjol.
3. **Cushioning Udara Kedua Sisi**: Dilengkapi adjustable cushion needle dengan seal peredam benturan kinetik di akhir langkah (stroke), memperpanjang usia pakai seal piston.

### Cara Membaca Kode Pemesanan (How to Order):
Pada seri BELSA ACI, kode dipecah menjadi beberapa slot:
- **Slot 1: Seri Silinder** (ACI = Profile ISO 15552)
- **Slot 2: Tipe Dudukan Mounting** (FA = Flange depan, LB = Foot mounting, CA/CB = Clevis)
- **Slot 3: Ukuran Bore** (Contoh: 100 = Ø100 mm)
- **Slot 4: Panjang Stroke** (Contoh: 400 = 400 mm)
- **Slot 5 & 6: Material Rod & Seal** (STS304 Stainless, Seal Viton tahan panas)

Untuk menghitung gaya dorong silinder ISO 15552 pada tekanan pabrik Anda, gunakan [Kalkulator Silinder BELSA](/calculator).`,
      en: `The ISO 15552 international standard (succeeding the previous ISO 6431 standard) establishes universal mounting dimensions, standard bore diameters (Ø32 mm up to Ø320 mm), and operating pressure ratings for industrial pneumatic profile cylinders.

### Why is ISO 15552 Critical for Plant Engineering?
1. **Global Interchangeability (100% Direct Drop-in)**: Pneumatic cylinders conforming to ISO 15552 share identical mounting hole centers, rod diameters, thread pitches, and pin dimensions worldwide. This means BELSA ACI and BMC series profile cylinders can directly replace international brands such as SMC CP96/C96, Festo DNC/DSBC, and Parker P1D without needing any bracket or machine modifications.
2. **Profile Aluminum Barrel with Integrated Sensor Slots**: The extrusion profile incorporates clean recessed grooves on multiple faces for flush-mounted magnetic reed and solid-state sensors, eliminating protruding sensor brackets.
3. **Dual-End Adjustable Air Cushioning**: Both front and rear end-caps feature adjustable needle valves and elastomeric cushion seals that absorb kinetic impact at stroke ends, significantly extending piston seal operational life.

### How to Decode the Order Code (How to Order):
Taking the BELSA ACI series as an example, the model code is structured systematically:
- **Code Segment 1: Cylinder Series** (ACI = Profile ISO 15552 Standard)
- **Code Segment 2: Mounting Configuration** (FA = Front Flange, LB = Foot Brackets, CA/CB = Rear Clevis)
- **Code Segment 3: Piston Bore Diameter** (e.g. 100 = Ø100 mm)
- **Code Segment 4: Stroke Length** (e.g. 400 = 400 mm travel)
- **Code Segment 5 & 6: Rod Material & Seal Options** (STS304 Stainless Rod, High-Temp Viton FKM seals)

To calculate cylinder thrust output and air consumption for your plant operating pressure, use the [BELSA Pneumatic & Hydraulic Calculator](/calculator).`
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
      en: `Hydraulic cylinder barrels (seamless honed tubes) must reliably withstand extreme internal fluid pressures exerting continuous outward radial tension (hoop stress). Failing to calculate adequate wall thickness can result in tube swelling, internal bypass leakage, or catastrophic rupture under hydraulic pressure spikes.

### Barlow Formula for Cylindrical Pressure Vessels:
The industry-standard Barlow formula used by fluid power design engineers is:
\`\`\`
t_min = (P × OD) / (2 × σ_allow + P)
\`\`\`
Where:
- **P**: Maximum design working pressure or test pressure (Bar / MPa)
- **OD**: Tube outer diameter in mm
- **σ_allow**: Material allowable tensile stress = Yield Strength (Re) / Safety Factor
- **Safety Factor**: Recommended minimum 2.15 to 3.0 for heavy industrial and mobile machinery applications

### Standard Material Characteristics at BELSA:
- **DIN 2391 / EN 10305-1 Grade E355 (ST52 / ST52.4 BK+S)**:
  - Yield Strength (Re): ≥ 520 N/mm²
  - Tensile Strength (Rm): ≥ 600 N/mm²
  - Internal Bore Roughness: Ra ≤ 0.4 µm (H8 Tolerance precision honed)
  - Exceptional endurance against dynamic seal friction and pressure spikes up to 350 Bar.

Calculate your exact tube wall thickness and safety margin instantly using the [BELSA Barlow Formula Calculator](/calculator).`
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
      en: `More than 80% of hydraulic cylinder fluid leakage is directly attributable to improper seal material selection relative to fluid temperature, lubricant type, or rod velocity.

### Comparison of the 3 Primary Industrial Seal Materials:

1. **Polyurethane (PU / TPU)**:
   - **Pressure Rating**: Superior (withstands up to 400 Bar without anti-extrusion backup rings).
   - **Mechanical Wear Resistance**: Highest among elastomeric seals, resilient against abrasive grit.
   - **Operating Temperature Range**: -30°C to +90°C.
   - **Primary Application**: Dynamic piston seals and U-cup rod seals for standard industrial machinery and earthmoving equipment.

2. **Nitrile Butadiene Rubber (NBR)**:
   - **Pressure Rating**: Moderate (up to 160 Bar when paired with backup rings).
   - **Fluid Compatibility**: Exceptional with petroleum-based mineral oils, water, and greases.
   - **Operating Temperature Range**: -25°C to +100°C.
   - **Primary Application**: Static O-rings, standard pneumatic cylinders, and elastomer wiper dust seals.

3. **Fluoroelastomer (FKM / Viton®)**:
   - **Temperature Capability**: Outstanding (continuous duty up to +200°C).
   - **Chemical Resistance**: Immune to synthetic lubricants, phosphate esters (Skydrol), acids, and industrial chemicals.
   - **Trade-off**: Lower mechanical tear resistance compared to PU under extreme pressure cycling.
   - **Primary Application**: Cylinders in steel rolling mills, glass manufacturing, boilers, foundries, and chemical processing plants.

At BELSA, every cylinder series (such as BMG140, BMG210, and ACI) offers an optional factory-installed FKM (Viton) seal kit upgrade directly selectable in the model code.`
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
      en: `Hydraulic cylinder leakage degrades mechanical efficiency, contaminates production environments, wastes expensive hydraulic oil, and risks catastrophic factory breakdown downtime.

### 1. External Leakage (Fluid Weeping or Dripping at the Piston Rod)
- **Root Causes**:
  - Scoring or micro-pitting on the hard chrome rod surface caused by airborne contaminants bypassing a worn wiper seal.
  - Rod deflection or bending caused by uncorrected lateral side loading.
  - Rod seal embrittlement or hardening from oil operating temperatures exceeding material limits.
- **Remedies**:
  - Re-chrome and precision-grind the rod back to ISO f7 tolerance.
  - Upgrade rod seals to high-temperature FKM or dual-lip polyurethane configurations.

### 2. Internal Leakage (Piston Bypass Drift)
- **Symptom**: The cylinder fails to hold its position and slowly creeps or drifts under load even when directional valves are locked in neutral.
- **Root Causes**:
  - Longitudinal scoring on the inner honed tube wall caused by metallic wear debris circulating in the oil.
  - Piston seal rupture, extrusion, or permanent compression set from dry friction.
- **Remedies**:
  - Perform bore boroscope inspection. For deep scores, the BELSA workshop performs precision re-honing or replaces the tube with new ST52 honed stock.
  - Flush the circuit and install BELSA pressure line filters to maintain particulate cleanliness below ISO 4406 standards.

For emergency overhaul consultation or bespoke replacement cylinders, reach our engineering team via [Contact Us](/contact-us).`
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
      en: `Selecting hydraulic hose assemblies solely by inside diameter (ID) is a critical error. Dynamic working pressure, peak impulse surges, and minimum bend radii must all be factored into the engineering specification.

### Industry Hose Construction Classifications:
1. **SAE 100 R1AT (1SN)**:
   - Construction: Single high-tensile steel wire braid reinforcement.
   - Application: Low-to-medium pressure return lines and auxiliary pilot circuits (up to 225 Bar for small bores).
   - Key Advantage: High flexibility, compact outer diameter, and tight bend radius.
2. **SAE 100 R2AT (2SN)**:
   - Construction: Two braids of high-tensile steel wire.
   - Application: The universal standard for primary plant machinery and mobile hydraulic circuits (up to 400 Bar).
3. **EN 856 4SP & 4SH (Multi-Spiral Steel Wire)**:
   - Construction: Four alternating spiral layers of heavy-gauge high-tensile steel wire.
   - Application: Heavy-duty circuits subjected to severe pressure spikes and repetitive shock loading, such as forging presses, rock crushers, injection molding machines, and mining equipment.
   - Key Advantage: Unmatched resistance to impulse fatigue over millions of operational pressure cycles.

The BELSA workshop supplies custom crimped hydraulic hose assemblies complete with certified hydrostatic test pressure reports. Explore our full line at [Industrial Hydraulic Hoses](/products/selang-hidrolik-industri).`
    },
    date: '2026-10-22',
    readTime: '4 min baca',
    image: '/images/prod_hose_clean.webp',
    tags: ['Selang Hidrolik', 'Fittings', 'Tekanan Tinggi', 'SAE 100']
  }
];

// Rich Markdown Text Formatter
function renderRichContent(rawText: string) {
  if (!rawText) return null;

  // Split into blocks by double newlines or triple backticks
  const lines = rawText.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const formatInline = (text: string) => {
    // Replace **bold**
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
            style={{ color: '#C2410C', fontWeight: 600, textDecoration: 'underline' }}
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
        // End code block
        elements.push(
          <div
            key={`code-${idx}`}
            style={{
              background: '#0F172A',
              color: '#F8FAFC',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              padding: '14px 18px',
              borderRadius: '8px',
              margin: '14px 0',
              overflowX: 'auto',
              borderLeft: '4px solid #EA580C',
              lineHeight: 1.5
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
      elements.push(<div key={`sp-${idx}`} style={{ height: '8px' }} />);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${idx}`}
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.01em',
            marginTop: '22px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ width: '4px', height: '18px', background: '#C2410C', borderRadius: '2px', display: 'inline-block' }} />
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
            paddingLeft: '18px',
            marginBottom: '8px',
            color: '#334155',
            lineHeight: 1.7,
            fontSize: '0.96rem'
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
            paddingLeft: '18px',
            marginBottom: '6px',
            color: '#334155',
            lineHeight: 1.65,
            fontSize: '0.95rem',
            display: 'flex',
            gap: '8px'
          }}
        >
          <span style={{ color: '#EA580C', fontWeight: 'bold' }}>•</span>
          <div>{formatInline(trimmed.slice(2))}</div>
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={`p-${idx}`}
        style={{
          color: '#334155',
          fontSize: '0.98rem',
          lineHeight: 1.75,
          margin: '0 0 10px 0'
        }}
      >
        {formatInline(line)}
      </p>
    );
  }

  return elements;
}

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
        art.category.toLowerCase().includes(q);
      return matchTag && matchQuery;
    });
  }, [articles, selectedTag, searchQuery, lang]);

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Hero Header */}
      <section style={{ background: '#0F172A', color: '#FFFFFF', padding: '70px 0 50px 0', borderBottom: '1px solid #1E293B' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600, color: '#FDBA74', marginBottom: '18px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C' }}></span>
              {isId ? 'Engineering Knowledge Hub & Panduan Teknis' : 'Engineering Knowledge Hub & Technical Guides'}
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.2, margin: '0 0 16px 0' }}>
              {isId
                ? 'Pusat Rekayasa Silinder, Selang & Valve Industri'
                : 'Pneumatics, Hydraulics & Industrial Process Knowledge'}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
              {isId
                ? 'Kumpulan artikel standar manufaktur, formula kalkulasi teknik, solusi kebocoran, dan panduan interchangeability komponen otomatisasi pabrik.'
                : 'Technical references, ISO engineering standards, Barlow formula calculations, and component maintenance guides.'}
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ marginTop: '36px', maxWidth: '580px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={isId ? 'Cari panduan, standar ISO, atau kata kunci...' : 'Search guides, ISO standards, or keywords...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px 14px 44px',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  background: '#1E293B',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                🔍
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tag Filters */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                background: selectedTag === tag ? '#0F172A' : '#F1F5F9',
                color: selectedTag === tag ? '#FFFFFF' : '#475569',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section style={{ padding: '50px 0 80px 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '28px' }}>
            {filteredArticles.map((art) => (
              <article
                key={art.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* Thumbnail Image */}
                <div style={{ position: 'relative', height: '190px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                  <Image
                    src={art.image}
                    alt={art.title[lang]}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    style={{ objectFit: 'contain', padding: '16px' }}
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
                    }}
                  >
                    {art.category}
                  </span>
                </div>

                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#64748B', marginBottom: '10px' }}>
                    <span>📅 {art.date}</span>
                    <span>•</span>
                    <span>⏱️ {art.readTime}</span>
                  </div>

                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                    {art.title[lang]}
                  </h2>

                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 16px 0', flex: 1 }}>
                    {art.summary[lang]}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    {art.tags.slice(0, 3).map((t) => (
                      <span key={t} style={{ fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveArticleModal(art)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      background: '#FFF7ED',
                      color: '#C2410C',
                      border: '1px solid #FFEDD5',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isId ? 'Baca Selengkapnya' : 'Read Full Article'} &rarr;
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>
                {isId ? 'Tidak ada artikel yang cocok dengan pencarian Anda.' : 'No articles matched your search query.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Article Detail Reading Modal */}
      {activeArticleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveArticleModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              padding: '36px 32px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Category & Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#C2410C',
                  background: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  padding: '4px 12px',
                  borderRadius: '6px',
                }}
              >
                {activeArticleModal.category}
              </span>
              <button
                type="button"
                onClick={() => setActiveArticleModal(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.35, marginBottom: '14px', letterSpacing: '-0.02em' }}>
              {activeArticleModal.title[lang]}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.84rem', color: '#64748B', marginBottom: '22px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', flexWrap: 'wrap' }}>
              <span>📅 {activeArticleModal.date}</span>
              <span>⏱️ {activeArticleModal.readTime}</span>
              <span>✍️ Tim Engineering BELSA</span>
            </div>

            {/* Featured Image Banner */}
            {activeArticleModal.image && (
              <div style={{ position: 'relative', width: '100%', height: '260px', background: '#F8FAFC', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
                <Image
                  src={activeArticleModal.image}
                  alt={activeArticleModal.title[lang]}
                  fill
                  sizes="(max-width: 820px) 100vw, 820px"
                  style={{ objectFit: 'contain', padding: '20px' }}
                />
              </div>
            )}

            {/* Rendered Rich Content */}
            <div style={{ marginBottom: '24px' }}>
              {renderRichContent(activeArticleModal.content[lang])}
            </div>

            {/* Footer with Tags and Action */}
            <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {activeArticleModal.tags.map((t) => (
                  <span key={t} style={{ fontSize: '0.78rem', color: '#64748B', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: '6px' }}>
                    #{t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveArticleModal(null)}
                className="btn-belsa-primary"
                style={{ padding: '10px 24px', fontSize: '0.9rem', cursor: 'pointer' }}
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
