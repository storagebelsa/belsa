import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator Teknik Silinder Hidrolik (Tekanan, Tebal Pipa Honing, Baut Tie-Rod & Torsi)',
  description:
    'Kalkulator engineering gratis untuk menghitung tekanan & gaya dorong silinder hidrolik (Ton/Bar), ketebalan pipa honing (Barlow Formula), keamanan baut tie-rod, torsi baut, dan berat material baja.',
  keywords: [
    'kalkulator silinder hidrolik',
    'rumus gaya dorong silinder hidrolik',
    'hydraulic cylinder calculator',
    'perhitungan ketebalan pipa honing',
    'barlow formula hydraulic tube',
    'kalkulator kekuatan baut tie rod',
    'tabel torsi pengencangan baut'
  ],
  alternates: {
    canonical: '/calculator',
  },
  openGraph: {
    title: 'Kalkulator Engineering Silinder Hidrolik & Material | BELSA',
    description:
      '5 alat bantu hitung teknis untuk engineer: Tekanan & Beban Silinder, Tebal Tube Honing, Safety Factor Baut Tie-Rod, Berat Baja/Rod, dan Torsi Baut.',
    url: 'https://belsa.id/calculator',
    images: ['/images/prod_cylinder_clean.webp'],
  },
};

const jsonLdCalculator = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
        { '@type': 'ListItem', position: 2, name: 'Kalkulator Teknik', item: 'https://belsa.id/calculator' },
      ],
    },
    {
      '@type': 'WebApplication',
      name: 'BELSA Hydraulic Cylinder Engineering Calculator Suite',
      url: 'https://belsa.id/calculator',
      applicationCategory: 'EngineeringApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
      },
      description:
        'Kalkulator teknik interaktif untuk menghitung gaya dorong & tekanan silinder hidrolik, ketebalan pipa seamless honed, faktor keamanan baut tie-rod, berat material, dan torsi pengencangan baut.',
    },
  ],
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCalculator) }}
      />
      {children}
    </>
  );
}
