import type { Metadata } from 'next';
import { DEFAULT_ARTICLES, ArticleItem } from '@/data/articlesData';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';
import KnowledgeHubClient from './KnowledgeHubClient';

export const metadata: Metadata = {
  title: 'Engineering Knowledge Hub | Panduan & Standar Teknis Silinder Industri BELSA',
  description:
    'Pusat referensi teknik industri: perhitungan kekuatan silinder, rumus Barlow tebal tabung honed tube ST52, standar mounting ISO 15552, dan panduan interchangeability silinder hidrolik & pneumatik.',
  alternates: {
    canonical: '/knowledge-hub',
  },
  openGraph: {
    title: 'Engineering Knowledge Hub | BELSA Hydraulic & Pneumatic',
    description:
      'Pusat referensi teknik industri: perhitungan kekuatan silinder, rumus Barlow tebal tabung honed tube ST52, standar mounting ISO 15552, dan panduan praktis.',
    url: 'https://belsa.id/knowledge-hub',
    siteName: 'BELSA',
    images: [
      {
        url: 'https://belsa.id/images/belsa_og_logo.png',
        width: 1200,
        height: 630,
        alt: 'BELSA Engineering Knowledge Hub',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

async function getArticles(): Promise<ArticleItem[]> {
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_articles`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    const rows = Array.isArray(json) ? json : json.data || [];

    if (Array.isArray(rows) && rows.length > 0) {
      const map = new Map<string, ArticleItem>();

      // Seed with DEFAULT_ARTICLES
      DEFAULT_ARTICLES.forEach((a) => {
        map.set(a.slug, a);
      });

      // Merge Google Sheets data
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
    // Fallback directly to DEFAULT_ARTICLES if Google Sheets fails or times out
  }

  return DEFAULT_ARTICLES;
}

export default async function KnowledgeHubPage() {
  const articles = await getArticles();
  return <KnowledgeHubClient initialArticles={articles} />;
}
