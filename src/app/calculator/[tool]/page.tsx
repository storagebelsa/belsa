import type { Metadata } from 'next';
import { CalculatorView, CalculatorTab } from '../page';

interface Props {
  params: Promise<{ tool: string }>;
}

const TOOL_ALIAS_MAP: Record<string, CalculatorTab> = {
  // Pressure & Load
  'pressure': 'pressure',
  'pressure-load': 'pressure',
  'tekanan': 'pressure',
  'beban': 'pressure',
  'tekanan-beban': 'pressure',
  'tekanan-beban-silinder': 'pressure',

  // Tube Thickness & Honing
  'thickness': 'thickness',
  'tube': 'thickness',
  'honing': 'thickness',
  'tube-thickness': 'thickness',
  'tebal-tube': 'thickness',
  'ketebalan-pipa-honing': 'thickness',

  // Bolt Force Safety
  'bolt': 'bolt',
  'tie-rod': 'bolt',
  'baut': 'bolt',
  'bolt-force': 'bolt',
  'kekuatan-baut': 'bolt',
  'kekuatan-baut-tie-rod': 'bolt',

  // Material Weight
  'weight': 'weight',
  'mass': 'weight',
  'berat': 'weight',
  'massa': 'weight',
  'material-weight': 'weight',
  'berat-material': 'weight',

  // Bolt Tightening Torque
  'torque': 'torque',
  'torsi': 'torque',
  'bolt-torque': 'torque',
  'torsi-baut': 'torque',
  'torsi-pengencangan-baut': 'torque',
};

const TOOL_SEO: Record<
  CalculatorTab,
  {
    name: string;
    title: string;
    description: string;
    keywords: string[];
  }
> = {
  pressure: {
    name: 'Kalkulator Tekanan & Gaya Dorong Silinder',
    title: 'Kalkulator Tekanan Kerja (Bar) & Gaya Dorong (Ton) Silinder Hidrolik',
    description:
      'Hitung tekanan kerja (Bar/kgf/cm²) atau kapasitas beban dorong (Ton) silinder hidrolik berdasarkan diameter bore (ID Tube) secara akurat beserta rekomendasi seri silinder BELSA.',
    keywords: [
      'kalkulator gaya dorong silinder hidrolik',
      'rumus tekanan silinder hidrolik',
      'hydraulic cylinder force calculator',
      'konversi ton ke bar silinder hidrolik'
    ],
  },
  thickness: {
    name: 'Kalkulator Ketebalan Pipa Honing (Tube Thickness)',
    title: 'Kalkulator Ketebalan Pipa Seamless Honed Silinder Hidrolik (Rumus Barlow)',
    description:
      'Hitung ketebalan dinding minimum pipa silinder hidrolik (STKM13C, ST52, Aluminium 6061-T6) menggunakan Rumus Barlow beserta analisa Safety Factor dan tekanan maksimum.',
    keywords: [
      'kalkulator ketebalan pipa hidrolik',
      'rumus barlow pipa silinder',
      'honed tube wall thickness calculator',
      'pipa stkm13c st52 silinder hidrolik'
    ],
  },
  bolt: {
    name: 'Kalkulator Kekuatan Baut Tie-Rod & Flange Silinder',
    title: 'Kalkulator Kekuatan & Safety Factor Baut Tie-Rod Silinder Hidrolik',
    description:
      'Evaluasi keamanan (Safety Factor), tegangan tarik aktual (MPa), dan jumlah baut tie-rod / flange silinder hidrolik untuk baut Grade 8.8, 10.9, 12.9, dan S45C.',
    keywords: [
      'kalkulator baut tie rod silinder',
      'perhitungan kekuatan baut hidrolik',
      'tie rod stress calculator hydraulic cylinder',
      'safety factor baut grade 8.8 10.9 12.9'
    ],
  },
  weight: {
    name: 'Kalkulator Berat Material Baja (As Rod, Pipa Tube & Plat)',
    title: 'Kalkulator Berat Material Silinder Hidrolik (Hard Chrome Rod, Honed Tube & Plat Baja)',
    description:
      'Hitung estimasi berat (kg) untuk material bulat pejal (As Rod Hard Chrome), pipa berongga (Honed Tube), dan plat baja fabrikasi silinder hidrolik.',
    keywords: [
      'kalkulator berat besi as bulat',
      'kalkulator berat pipa baja',
      'kalkulator berat plat besi',
      'estimasi berat silinder hidrolik'
    ],
  },
  torque: {
    name: 'Tabel & Kalkulator Torsi Pengencangan Baut (M6–M64)',
    title: 'Tabel & Kalkulator Torsi Pengencangan Baut Silinder Hidrolik (Nm, kgf·m, ft·lbs)',
    description:
      'Panduan nilai torsi pengencangan baut metrik (M6 hingga M64) untuk Grade 8.8, 10.9, dan 12.9 pada aplikasi silinder pneumatik & hidrolik tekanan tinggi.',
    keywords: [
      'tabel torsi pengencangan baut',
      'kalkulator torsi baut m12 m16 m20',
      'bolt tightening torque chart hydraulic',
      'konversi torsi nm ke kgfm'
    ],
  },
};

export async function generateStaticParams() {
  return [
    { tool: 'pressure' },
    { tool: 'thickness' },
    { tool: 'bolt' },
    { tool: 'weight' },
    { tool: 'torque' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const normalizedKey = tool.toLowerCase().trim();
  const targetTool: CalculatorTab = TOOL_ALIAS_MAP[normalizedKey] || 'pressure';
  const seo = TOOL_SEO[targetTool];

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `/calculator/${targetTool}`,
    },
    openGraph: {
      title: `${seo.title} | BELSA`,
      description: seo.description,
      url: `https://belsa.id/calculator/${targetTool}`,
      images: ['/images/prod_cylinder_clean.webp'],
    },
  };
}

export default async function CalculatorToolPage({ params }: Props) {
  const { tool } = await params;
  const normalizedKey = tool.toLowerCase().trim();
  const targetTool: CalculatorTab = TOOL_ALIAS_MAP[normalizedKey] || 'pressure';
  const seo = TOOL_SEO[targetTool];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
          { '@type': 'ListItem', position: 2, name: 'Kalkulator Teknik', item: 'https://belsa.id/calculator' },
          {
            '@type': 'ListItem',
            position: 3,
            name: seo.name,
            item: `https://belsa.id/calculator/${targetTool}`,
          },
        ],
      },
      {
        '@type': 'WebApplication',
        name: `${seo.name} - BELSA`,
        description: seo.description,
        url: `https://belsa.id/calculator/${targetTool}`,
        applicationCategory: 'EngineeringApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'IDR',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CalculatorView initialTool={targetTool} />
    </>
  );
}
