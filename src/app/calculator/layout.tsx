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
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Bagaimana rumus menghitung tekanan kerja (Bar) dan gaya dorong (Ton) silinder hidrolik?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Gaya dorong silinder hidrolik dihitung dengan rumus F = P × A, di mana luas penampang piston A = (π / 4) × ID². Dalam satuan praktis industri: Tekanan (Bar) = (Beban Kg × 9,80665 × 10) / Luas Piston (cm²).',
          },
        },
        {
          '@type': 'Question',
          name: 'Bagaimana cara menghitung ketebalan minimum pipa silinder hidrolik (Honed Tube) dan batas oversize honing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ketebalan minimum dinding tabung silinder dihitung menggunakan Rumus Barlow: t_min = (P × OD) / (2 × σ_allow + P) dengan Safety Factor standar ≥ 2,13 untuk material STKM13C atau ST52.',
          },
        },
        {
          '@type': 'Question',
          name: 'Berapa torsi pengencangan baut tie-rod silinder hidrolik Grade 8.8, 10.9, dan 12.9?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Torsi pengencangan baut tie-rod ditentukan oleh ukuran ulir metrik (M6 hingga M64), kelas kekuatan baut (Grade 8.8, 10.9, atau 12.9), serta rentang tekanan kerja silinder (di bawah 10 Bar, 10–35 Bar, atau di atas 35 Bar).',
          },
        },
      ],
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
