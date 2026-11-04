import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Produk & Konfigurator Kode Pemesanan (How to Order) Silinder & Valve',
  description:
    'Katalog teknis interaktif 89+ seri produk BELSA: Silinder Pneumatik, Silinder Hidrolik, Water Cylinder, Hydraulic Valve, Power Pack, dan Hose. Susun kode model dan unduh PDF Datasheet A4.',
  keywords: [
    'katalog silinder hidrolik',
    'katalog silinder pneumatik belsa',
    'how to order hydraulic cylinder',
    'datasheet silinder hidrolik pdf',
    'konfigurator kode silinder',
    'katalog valve hidrolik'
  ],
  alternates: {
    canonical: '/catalogue',
  },
  openGraph: {
    title: 'Katalog Teknis Interaktif & Datasheet PDF | BELSA Hydraulic & Pneumatic',
    description:
      'Pilih seri silinder atau valve, susun kode model pemesanan secara interaktif (How to Order), dan unduh lembar spesifikasi teknis (PDF Datasheet A4).',
    url: 'https://belsa.id/catalogue',
    images: ['/images/prod_cylinder_clean.webp'],
  },
};

const jsonLdCatalogue = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
    { '@type': 'ListItem', position: 2, name: 'Katalog Teknis', item: 'https://belsa.id/catalogue' },
  ],
};

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCatalogue) }}
      />
      {children}
    </>
  );
}
