import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portofolio Proyek & Studi Kasus Industri (Baja, Otomotif, Ekstrusi, Energi)',
  description:
    'Rekam jejak proyek fabrikasi silinder hidrolik dan pneumatik BELSA di berbagai pabrik besar Indonesia: PT YKK AP, PT The Master Steel, Dunlop (Sumi Rubber), JX Nippon Oil, dan Elangperdana Tyre.',
  keywords: [
    'proyek silinder hidrolik indonesia',
    'studi kasus silinder industri',
    'fabrikasi silinder pabrik baja',
    'silinder hidrolik pabrik ban',
    'portofolio PT Rafitama Millenial Wahyudi'
  ],
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    title: 'Portofolio Proyek & Studi Kasus Industri | BELSA Hydraulic & Pneumatic',
    description:
      'Dokumentasi implementasi silinder hidrolik dan pneumatik heavy-duty BELSA pada sektor peleburan baja, manufaktur ban, ekstrusi aluminium, dan energi.',
    url: 'https://belsa.id/projects',
    images: ['/images/projects/project_ykk_ap.webp'],
  },
};

const jsonLdProjects = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
    { '@type': 'ListItem', position: 2, name: 'Proyek', item: 'https://belsa.id/projects' },
  ],
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProjects) }}
      />
      {children}
    </>
  );
}
