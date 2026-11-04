import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Produk Silinder Hidrolik, Silinder Pneumatik, Selang Hidrolik & Process Valve',
  description:
    'Jelajahi 3 lini produk utama BELSA: Silinder Hidrolik & Pneumatik (standar ISO & custom), Perakitan Selang Hidrolik Industri (Hose Assembly), serta Process & Hydraulic Valve.',
  keywords: [
    'produk silinder hidrolik',
    'silinder pneumatik belsa',
    'selang hidrolik industri',
    'hydraulic hose assembly',
    'process valve industri',
    'hydraulic directional valve'
  ],
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Lini Produk Industri BELSA - Silinder, Selang Hidrolik & Process Valve',
    description:
      'Solusi lengkap aktuator silinder hidrolik & pneumatik, hose assembly tekanan tinggi, dan katup kontrol industri untuk pabrik di Indonesia.',
    url: 'https://belsa.id/products',
    images: ['/images/prod_cylinder_clean.webp'],
  },
};

const jsonLdProducts = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
    { '@type': 'ListItem', position: 2, name: 'Produk', item: 'https://belsa.id/products' },
  ],
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProducts) }}
      />
      {children}
    </>
  );
}
