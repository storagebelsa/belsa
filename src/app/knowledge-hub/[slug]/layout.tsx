import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { DEFAULT_ARTICLES, ArticleItem } from '@/data/articlesData';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

function findArticle(slug: string): ArticleItem | undefined {
  const local = DEFAULT_ARTICLES.find((a) => a.slug === slug);
  if (local) return local;

  try {
    const fPath = path.join('/tmp', 'articlesOverrides.json');
    if (fs.existsSync(fPath)) {
      const arr: ArticleItem[] = JSON.parse(fs.readFileSync(fPath, 'utf-8'));
      return arr.find((a) => a.slug === slug);
    }
  } catch {}

  return undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);

  if (!article) {
    return {
      title: 'Artikel Rekayasa Industri | BELSA Knowledge Hub',
      description: 'Panduan teknis manufaktur silinder hidrolik, pneumatik, valve, dan selang industri dari PT. Rafitama Millenial Wahyudi (BELSA).'
    };
  }

  const title = `${article.title.id} | BELSA Engineering Knowledge Hub`;
  const description = article.summary.id;
  const url = `https://belsa.id/knowledge-hub/${slug}`;

  const rawImg = article.image || '/images/belsa_og_logo.png';
  const ogImageUrl = rawImg.startsWith('http')
    ? rawImg
    : `https://belsa.id${rawImg.startsWith('/') ? rawImg : `/${rawImg}`}`;

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
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title.id,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ArticleLayout({ params, children }: Props) {
  const { slug } = await params;
  const article = findArticle(slug);

  const rawImg = article?.image || '/images/belsa_og_logo.png';
  const ogImageUrl = rawImg.startsWith('http')
    ? rawImg
    : `https://belsa.id${rawImg.startsWith('/') ? rawImg : `/${rawImg}`}`;

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
        image: ogImageUrl,
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
            url: 'https://belsa.id/images/belsa_og_logo.png',
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
