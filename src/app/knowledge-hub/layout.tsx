import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Hub & Panduan Teknis Silinder Hidrolik & Pneumatik | BELSA',
  description:
    'Pusat referensi dan panduan teknis manufaktur silinder hidrolik, pneumatik standar ISO 15552, rumus teknik Barlow, material seal, dan tips troubleshooting sistem hidrolik industri.',
  keywords: [
    'knowledge hub hidrolik pneumatik',
    'panduan silinder hidrolik',
    'standar silinder iso 15552',
    'rumus barlow pipa honing',
    'material seal hidrolik nbr fkm viton',
    'troubleshooting silinder hidrolik bocor',
    'belsa engineering knowledge'
  ],
  alternates: {
    canonical: '/knowledge-hub',
  },
  openGraph: {
    title: 'Knowledge Hub & Panduan Teknis Hidrolik Pneumatik | BELSA',
    description:
      'Artikel teknis, panduan pemilihan komponen, dan rumus kalkulasi engineering dari tim teknis PT. Rafitama Millenial Wahyudi (BELSA).',
    url: 'https://belsa.id/knowledge-hub',
    images: ['/images/prod_cylinder_clean.webp'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
        { '@type': 'ListItem', position: 2, name: 'Knowledge Hub', item: 'https://belsa.id/knowledge-hub' },
      ],
    },
    {
      '@type': 'CollectionPage',
      name: 'BELSA Engineering Knowledge Hub & Panduan Teknis',
      url: 'https://belsa.id/knowledge-hub',
      description:
        'Pusat referensi dan panduan teknis manufaktur silinder hidrolik, pneumatik standar ISO 15552, rumus teknik Barlow, material seal, dan tips troubleshooting sistem hidrolik industri.',
    },
  ],
};

export default function KnowledgeHubLayout({ children }: { children: React.ReactNode }) {
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
