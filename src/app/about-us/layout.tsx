import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami - Profil Pabrik Silinder Hidrolik & Pneumatik ISO 9001:2015',
  description:
    'PT. Rafitama Millenial Wahyudi (BELSA) adalah produsen silinder hidrolik, silinder pneumatik, hose assembly, dan process valve di Indonesia sejak 2017. Bersertifikat ISO 9001:2015.',
  keywords: [
    'PT Rafitama Millenial Wahyudi',
    'profil perusahaan belsa',
    'pabrik silinder hidrolik tangerang',
    'manufaktur silinder pneumatik indonesia',
    'ISO 9001:2015 hydraulic cylinder'
  ],
  alternates: {
    canonical: '/about-us',
  },
  openGraph: {
    title: 'Tentang BELSA - PT. Rafitama Millenial Wahyudi',
    description:
      'Produsen silinder hidrolik dan pneumatik di Indonesia sejak 2017 dengan fasilitas machining, honing, dan pengujian kualitas berstandar ISO 9001:2015.',
    url: 'https://belsa.id/about-us',
    images: ['/images/about_technician.webp'],
  },
};

const jsonLdAbout = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
    { '@type': 'ListItem', position: 2, name: 'Tentang Kami', item: 'https://belsa.id/about-us' },
  ],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAbout) }}
      />
      {children}
    </>
  );
}
