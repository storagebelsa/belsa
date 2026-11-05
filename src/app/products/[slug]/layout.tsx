import type { Metadata } from 'next';
import { BELSA_CATALOGUE_FULL } from '@/data/belsaCatalogueFull';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

const DELETED_SERIES_IDS = new Set([
  'diverter_valve', 'bsp', 'cl_series', 'npp-nhpu', 'bhreb_20es_1',
  'd_nipple', 'double_nipple', 'fitting', 'r1at', 'r2at', 'rejseries',
  'bwe_series', 'tubing', 'rotary'
]);

const CATEGORY_MAP: Record<string, string[]> = {
  'silinder-hidrolik-pneumatik': ['Air Cylinder', 'Hydraulic Cylinder', 'Water Cylinder'],
  'selang-hidrolik-industri': ['Hose, Fittings & Pipe Accessories'],
  'process-valve': ['Industrial & Hydraulic Valve', 'Industrial Brake & Clutch'],
};

const CATEGORY_FAQ: Record<string, { q: string; a: string }[]> = {
  'silinder-hidrolik-pneumatik': [
    {
      q: 'Berapa kapasitas tekanan kerja silinder hidrolik dan pneumatik BELSA?',
      a: 'Silinder pneumatik BELSA (standar ISO 15552 seperti seri BMB, BMC, ACI) bekerja pada tekanan hingga 10 Bar, sedangkan silinder hidrolik BELSA (seri BMG70, BMG140, BMG180, BMG210, BHS, BKP) tersedia untuk tekanan kerja 70 Bar hingga 350 Bar.',
    },
    {
      q: 'Apakah BELSA melayani fabrikasi silinder hidrolik custom sesuai drawing atau sample?',
      a: 'Ya, workshop PT. Rafitama Millenial Wahyudi (BELSA) di Tangerang melayani fabrikasi silinder hidrolik dan pneumatik custom menggunakan Honed Tube ST52/STKM13C, Hard Chrome Rod f7, dan seal kit NOK/Parker/Hallite sesuai drawing CAD maupun sample fisik.',
    },
    {
      q: 'Apakah silinder BELSA kompatibel menggantikan silinder brand SMC, Festo, atau Parker?',
      a: 'Ya, silinder pneumatik profil BELSA mengikuti standar internasional ISO 15552 dengan dimensi mounting, pitch baut, dan ulir rod yang 100% interchangeable langsung dengan brand SMC CP96, Festo DNC/DSBC, dan Parker P1D.',
    },
    {
      q: 'Berapa lama estimasi pengerjaan (lead time) untuk silinder hidrolik custom?',
      a: 'Untuk silinder custom baru berkisar antara 7 hingga 21 hari kerja tergantung ketersediaan material dan kompleksitas mounting. Untuk kebutuhan perbaikan darurat (emergency plant breakdown) dan seal kit replacement, kami menyediakan layanan jalur cepat.',
    },
    {
      q: 'Apakah setiap silinder BELSA dilengkapi garansi dan sertifikat uji tekanan?',
      a: 'Ya, setiap unit silinder BELSA melalui pengujian tekanan uji hidrostatik 1.5x tekanan kerja di test stand workshop kami dan disertifikasi sesuai standar manajemen mutu ISO 9001:2015 serta bergaransi resmi.',
    },
  ],
  'selang-hidrolik-industri': [
    {
      q: 'Tipe selang hidrolik apa saja yang dirakit di workshop BELSA?',
      a: 'BELSA menyediakan perakitan dan crimping selang hidrolik bertekanan tinggi tipe 1SN, 2SN, 4SP, dan 4SH (seri BHH), flexible metal hose (BMH), rotary joint (BRJ), dan quick coupling ISO 7241 (BQC) lengkap dengan sertifikat uji hidrostatik.',
    },
    {
      q: 'Berapa tekanan kerja maksimal (Working Pressure) selang hidrolik BELSA?',
      a: 'Tekanan kerja selang hidrolik BELSA berkisar dari 100 Bar hingga di atas 450 Bar tergantung diameter dalam (ID) dan konstruksi kawat (wire braid vs multi-spiral steel wire).',
    },
    {
      q: 'Apakah bisa memesan rakitan selang hidrolik langsung jadi (Hose Assembly) sesuai kebutuhan panjang dan fitting?',
      a: 'Ya, kami melayani perakitan hose assembly custom dengan pilihan fitting BSP, NPT, JIC, Metric, maupun Flange SAE Code 61/62 yang di-crimping menggunakan mesin presisi bersertifikat.',
    },
    {
      q: 'Apakah selang hidrolik BELSA tahan terhadap oli panas dan cuaca luar ruangan?',
      a: 'Selang hidrolik BELSA menggunakan karet sintetis tahan oli abrasi tinggi dan ozon, dengan temperatur kerja operasional -40°C hingga +100°C (tersedia tipe khusus hingga +135°C).',
    },
  ],
  'process-valve': [
    {
      q: 'Jenis katup industri (process & hydraulic valve) apa saja yang tersedia di BELSA?',
      a: 'BELSA menyediakan Directional Solenoid Valve Cetop/ISO (B4WE6, B4WE10), Modular Valve, Proportional Valve, Ball Valve, Butterfly Valve, dan Pneumatic Rotary Actuator untuk otomasi pabrik.',
    },
    {
      q: 'Apakah solenoid valve hidrolik BELSA kompatibel dengan standar subplate CETOP / ISO 4401?',
      a: 'Ya, Directional Valve BELSA seri B4WE6 mengikuti standar CETOP 03 (ISO 4401-03) dan B4WE10 mengikuti standar CETOP 05 (ISO 4401-05), sehingga dapat langsung menggantikan valve Yuken, Rexroth, atau Vickers.',
    },
    {
      q: 'Pilihan voltase kumparan (coil) apa saja yang tersedia untuk solenoid valve BELSA?',
      a: 'Kumparan solenoid valve BELSA tersedia dalam voltase DC 24V, AC 110V, dan AC 220V dengan proteksi IP65 dan lampu indikator LED.',
    },
    {
      q: 'Apakah katup industri BELSA memiliki garansi resmi pabrik?',
      a: 'Semua unit katup hidrolik dan process valve BELSA dijamin keasliannya dan dilengkapi garansi operasional pabrik terhadap cacat produksi.',
    },
  ],
};

const CATEGORY_SEO: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    image: string;
    name: string;
  }
> = {
  'silinder-hidrolik-pneumatik': {
    name: 'Silinder Hidrolik & Pneumatik',
    title: 'Silinder Hidrolik & Pneumatik (Standar ISO & Custom Fabrikasi)',
    description:
      'Daftar lengkap 25+ seri silinder hidrolik (70–300 bar, Tie-Rod, Welded, Mill Type, Compact) dan silinder pneumatik standar ISO 15552 produksi BELSA Indonesia.',
    keywords: [
      'silinder hidrolik',
      'silinder pneumatik',
      'silinder iso 15552',
      'hydraulic cylinder 210 bar',
      'tie rod cylinder',
      'welded hydraulic cylinder',
      'custom cylinder indonesia'
    ],
    image: '/images/prod_cylinder_clean.webp',
  },
  'selang-hidrolik-industri': {
    name: 'Selang Hidrolik Industri & Fitting',
    title: 'Selang Hidrolik Industri (Hydraulic Hose Assembly) & Fitting Tekanan Tinggi',
    description:
      'Perakitan selang hidrolik industri bertekanan tinggi (SAE 100 R1AT, R2AT, 4SP, 4SH), flexible metal hose, kompensator, dan fitting hidrolik presisi dari BELSA.',
    keywords: [
      'selang hidrolik',
      'hydraulic hose assembly',
      'fitting hidrolik',
      'flexible metal hose',
      'selang tekanan tinggi',
      'crimping selang hidrolik tangerang'
    ],
    image: '/images/prod_hose_clean.webp',
  },
  'process-valve': {
    name: 'Process Valve & Hydraulic Valve',
    title: 'Process Valve, Solenoid Valve, Directional & Pressure Control Valve Industri',
    description:
      'Katalog lengkap katup industri BELSA: Solenoid Valve, Directional Control Valve, Modular Valve, Proportional Valve, Ball Valve, Butterfly Valve, dan Pneumatic Actuator.',
    keywords: [
      'process valve',
      'hydraulic solenoid valve',
      'directional control valve',
      'modular valve hidrolik',
      'pneumatic actuator valve',
      'katup hidrolik industri'
    ],
    image: '/images/prod_valve_clean_solenoid.webp',
  },
};

export async function generateStaticParams() {
  return [
    { slug: 'silinder-hidrolik-pneumatik' },
    { slug: 'selang-hidrolik-industri' },
    { slug: 'process-valve' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seo = CATEGORY_SEO[slug] || {
    name: 'Kategori Produk BELSA',
    title: 'Produk Komponen Hidrolik & Pneumatik Industri',
    description: 'Spesifikasi teknis komponen silinder hidrolik, pneumatik, selang hidrolik, dan process valve BELSA.',
    keywords: ['belsa hydraulic pneumatic', 'komponen hidrolik industri'],
    image: '/images/prod_cylinder_clean.webp',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title: `${seo.title} | BELSA`,
      description: seo.description,
      url: `https://belsa.id/products/${slug}`,
      images: [seo.image],
    },
  };
}

export default async function ProductCategoryLayout({ params, children }: Props) {
  const { slug } = await params;
  const seo = CATEGORY_SEO[slug];
  const catNames = CATEGORY_MAP[slug] || [];
  const seriesItems = BELSA_CATALOGUE_FULL.filter(
    (item) => !DELETED_SERIES_IDS.has(item.id) && catNames.includes(item.category)
  );
  const faqs = CATEGORY_FAQ[slug] || [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
          { '@type': 'ListItem', position: 2, name: 'Produk', item: 'https://belsa.id/products' },
          {
            '@type': 'ListItem',
            position: 3,
            name: seo?.name || slug,
            item: `https://belsa.id/products/${slug}`,
          },
        ],
      },
      ...(seo
        ? [
            {
              '@type': 'CollectionPage',
              name: seo.title,
              description: seo.description,
              url: `https://belsa.id/products/${slug}`,
              primaryImageOfPage: `https://belsa.id${seo.image}`,
            },
          ]
        : []),
      ...(seriesItems.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: `Daftar Seri ${seo?.name || 'Produk BELSA'}`,
              numberOfItems: seriesItems.length,
              itemListElement: seriesItems.map((item, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: `${item.series} (${item.subTitle?.id || item.category})`,
                url: `https://belsa.id/catalogue/${item.slug || item.id}`,
              })),
            },
          ]
        : []),
      ...(faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: f.a,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
