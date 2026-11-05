import { Metadata } from 'next';
import { DEFAULT_ARTICLES } from '@/data/articlesData';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = DEFAULT_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: 'Artikel Rekayasa Industri | BELSA Knowledge Hub',
      description: 'Panduan teknis manufaktur silinder hidrolik, pneumatik, valve, dan selang industri dari PT. Rafitama Millenial Wahyudi (BELSA).'
    };
  }

  const title = `${article.title.id} | BELSA Engineering Knowledge Hub`;
  const description = article.summary.id;
  const url = `https://belsa.id/knowledge-hub/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: article.date,
      authors: ['PT. Rafitama Millenial Wahyudi', 'Tim Engineering BELSA'],
      tags: article.tags,
      images: [
        {
          url: article.image.startsWith('http') ? article.image : `https://belsa.id${article.image}`,
          width: 1200,
          height: 630,
          alt: article.title.id,
        },
      ],
    },
  };
}

export default async function ArticleLayout({ params, children }: Props) {
  const { slug } = await params;
  const article = DEFAULT_ARTICLES.find((a) => a.slug === slug);

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: 'https://belsa.id',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Knowledge Hub',
        item: 'https://belsa.id/knowledge-hub',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article ? article.title.id : 'Artikel',
        item: `https://belsa.id/knowledge-hub/${slug}`,
      },
    ],
  };

  const articleSchema = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title.id,
        description: article.summary.id,
        image: article.image.startsWith('http') ? article.image : `https://belsa.id${article.image}`,
        datePublished: article.date,
        dateModified: article.date,
        author: {
          '@type': 'Organization',
          name: 'Tim Engineering BELSA',
          url: 'https://belsa.id',
        },
        publisher: {
          '@type': 'Organization',
          name: 'PT. Rafitama Millenial Wahyudi',
          logo: {
            '@type': 'ImageObject',
            url: 'https://belsa.id/images/belsa_logo.webp',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://belsa.id/knowledge-hub/${slug}`,
        },
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {children}
    </>
  );
}
