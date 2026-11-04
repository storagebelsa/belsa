import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

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
