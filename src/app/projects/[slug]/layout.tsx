import type { Metadata } from 'next';
import { translations } from '@/lib/translations';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

const PROJECT_IMAGES: Record<string, string> = {
  'pt-ykk-ap-indonesia': '/images/projects/project_ykk_ap.webp',
  'pt-the-master-steel-mfc-proyek-1': '/images/projects/project_mastersteel_1.webp',
  'pt-the-master-steel-mfc-proyek-2': '/images/projects/project_mastersteel_2.webp',
  'pt-elangperdana-tyre-industry': '/images/projects/project_elangperdana.webp',
  'pt-jx-nippon-oil-energy': '/images/projects/project_jx_nippon.webp',
  'pt-sumi-rubber-indonesia-dunlop': '/images/projects/project_sumirubber_dunlop.webp',
};

export async function generateStaticParams() {
  return [
    { slug: 'pt-ykk-ap-indonesia' },
    { slug: 'pt-the-master-steel-mfc-proyek-1' },
    { slug: 'pt-the-master-steel-mfc-proyek-2' },
    { slug: 'pt-elangperdana-tyre-industry' },
    { slug: 'pt-jx-nippon-oil-energy' },
    { slug: 'pt-sumi-rubber-indonesia-dunlop' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = translations.id.projectsPage.projectsList.find((p) => p.slug === slug);
  const image = PROJECT_IMAGES[slug] || '/images/projects/project_ykk_ap.webp';

  if (!project) {
    return {
      title: 'Studi Kasus Proyek Industri',
      description: 'Dokumentasi proyek fabrikasi silinder hidrolik dan pneumatik BELSA di industri Indonesia.',
      alternates: { canonical: `/projects/${slug}` },
    };
  }

  const title = `Studi Kasus ${project.title} - ${project.category}`;
  const description = `${project.desc} Solusi teknis BELSA: ${project.solution}`;

  return {
    title,
    description,
    keywords: [
      project.title,
      project.category,
      'studi kasus silinder hidrolik',
      'proyek belsa hydraulic',
      'custom hydraulic cylinder indonesia'
    ],
    alternates: {
      canonical: `/projects/${slug}`,
    },
    openGraph: {
      type: 'article',
      title: `${title} | BELSA`,
      description,
      url: `https://belsa.id/projects/${slug}`,
      images: [image],
    },
  };
}

export default async function ProjectDetailLayout({ params, children }: Props) {
  const { slug } = await params;
  const project = translations.id.projectsPage.projectsList.find((p) => p.slug === slug);
  const image = PROJECT_IMAGES[slug] || '/images/projects/project_ykk_ap.webp';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
          { '@type': 'ListItem', position: 2, name: 'Proyek', item: 'https://belsa.id/projects' },
          {
            '@type': 'ListItem',
            position: 3,
            name: project ? `${project.title} (${project.category})` : slug,
            item: `https://belsa.id/projects/${slug}`,
          },
        ],
      },
      ...(project
        ? [
            {
              '@type': 'Article',
              headline: `Studi Kasus ${project.title} - ${project.category}`,
              description: project.desc,
              image: `https://belsa.id${image}`,
              author: {
                '@type': 'Organization',
                name: 'BELSA (PT. Rafitama Millenial Wahyudi)',
                url: 'https://belsa.id',
              },
              publisher: {
                '@type': 'Organization',
                name: 'BELSA Hydraulic & Pneumatic',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://belsa.id/images/logo.webp',
                },
              },
              mainEntityOfPage: `https://belsa.id/projects/${slug}`,
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
