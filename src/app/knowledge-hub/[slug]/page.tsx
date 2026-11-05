import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEFAULT_ARTICLES, ArticleItem } from '@/data/articlesData';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';
import { formatProductImageUrl } from '@/lib/imageUtils';
import ArticleDetailClient from './ArticleDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchLiveArticles(): Promise<ArticleItem[]> {
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_articles`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    const rows = Array.isArray(json) ? json : json.data || [];

    if (Array.isArray(rows) && rows.length > 0) {
      const map = new Map<string, ArticleItem>();

      DEFAULT_ARTICLES.forEach((a) => {
        map.set(a.slug, a);
      });

      rows.forEach((r: any, idx: number) => {
        if (!r.titleId || r.titleId === 'Test' || r.id === 'test') return;

        const matchDefault = DEFAULT_ARTICLES.find(
          (d) =>
            d.id === r.id ||
            d.slug === r.id ||
            d.slug === r.slug ||
            d.title.id === r.titleId
        );

        const resolvedSlug =
          r.slug ||
          r[''] ||
          (matchDefault ? matchDefault.slug : r.id || `artikel-${idx + 1}`);
        const resolvedId = r.id || (matchDefault ? matchDefault.id : `art_${idx + 1}`);

        const item: ArticleItem = {
          id: resolvedId,
          slug: resolvedSlug,
          category: r.category || (matchDefault ? matchDefault.category : 'Teknik Industri'),
          author: r.author || (matchDefault ? matchDefault.author : 'Tim Engineering BELSA'),
          title: {
            id: r.titleId || r.title || (matchDefault ? matchDefault.title.id : ''),
            en: r.titleEn || r.title || (matchDefault ? matchDefault.title.en : ''),
          },
          summary: {
            id: r.summaryId || r.summary || (matchDefault ? matchDefault.summary.id : ''),
            en: r.summaryEn || r.summary || (matchDefault ? matchDefault.summary.en : ''),
          },
          content: {
            id: r.contentId || r.content || (matchDefault ? matchDefault.content.id : ''),
            en: r.contentEn || r.content || (matchDefault ? matchDefault.content.en : ''),
          },
          date: r.date
            ? typeof r.date === 'string' && r.date.includes('T')
              ? r.date.slice(0, 10)
              : String(r.date).slice(0, 10)
            : matchDefault
            ? matchDefault.date
            : new Date().toISOString().slice(0, 10),
          readTime: r.readTime || (matchDefault ? matchDefault.readTime : '5 min baca'),
          image: r.imageUrl || r.image || (matchDefault ? matchDefault.image : '/images/belsa_og_logo.png'),
          tags: r.tags
            ? typeof r.tags === 'string'
              ? r.tags.split(',').map((t: string) => t.trim())
              : r.tags
            : matchDefault
            ? matchDefault.tags
            : ['Teknik'],
        };

        map.set(resolvedSlug, item);
      });

      return Array.from(map.values());
    }
  } catch {
    // Fallback to DEFAULT_ARTICLES
  }

  return DEFAULT_ARTICLES;
}

export async function generateStaticParams() {
  const articles = await fetchLiveArticles();
  return articles.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const articles = await fetchLiveArticles();
  const article =
    articles.find((a) => a.slug === slug || a.id === slug) ||
    DEFAULT_ARTICLES.find((a) => a.slug === slug || a.id === slug);

  if (!article) {
    return {
      title: 'Artikel Rekayasa Industri | BELSA Knowledge Hub',
      description: 'Panduan teknis silinder hidrolik, pneumatik, dan komponen industri.',
      alternates: { canonical: '/knowledge-hub' },
    };
  }

  const title = article.title.id || article.title.en;
  const description = article.summary.id || article.summary.en;
  const formattedImg = formatProductImageUrl(article.image);
  const imgUrl = formattedImg.startsWith('http')
    ? formattedImg
    : `https://belsa.id${formattedImg.startsWith('/') ? '' : '/'}${formattedImg}`;

  return {
    title: `${title} | Engineering Knowledge Hub`,
    description,
    alternates: {
      canonical: `/knowledge-hub/${article.slug}`,
    },
    openGraph: {
      title: `${title} | BELSA`,
      description,
      url: `https://belsa.id/knowledge-hub/${article.slug}`,
      siteName: 'BELSA Hydraulic & Pneumatic',
      images: [
        {
          url: imgUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'id_ID',
      type: 'article',
      publishedTime: article.date,
      authors: [article.author || 'Tim Engineering BELSA'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imgUrl],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const articles = await fetchLiveArticles();
  const article =
    articles.find((a) => a.slug === slug || a.id === slug) ||
    DEFAULT_ARTICLES.find((a) => a.slug === slug || a.id === slug);

  if (!article) {
    notFound();
  }

  return <ArticleDetailClient initialArticle={article} initialArticles={articles} />;
}
