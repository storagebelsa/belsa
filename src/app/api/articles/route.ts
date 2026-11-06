import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_ARTICLES, ArticleItem } from '@/data/articlesData';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';
import { isAuthorizedAdmin } from '@/lib/adminAuth';

import os from 'os';

const LOCAL_OVERRIDES_FILE = path.join(process.cwd(), 'src', 'data', 'articlesOverrides.json');
const TMP_OVERRIDES_FILE = path.join(os.tmpdir(), 'articlesOverrides.json');

function getLocalOverrides(): ArticleItem[] {
  try {
    if (fs.existsSync(LOCAL_OVERRIDES_FILE)) {
      const data = fs.readFileSync(LOCAL_OVERRIDES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading local articles overrides:', err);
  }
  try {
    if (fs.existsSync(TMP_OVERRIDES_FILE)) {
      const data = fs.readFileSync(TMP_OVERRIDES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading tmp articles overrides:', err);
  }
  return [];
}

function saveLocalOverrides(articles: ArticleItem[]): boolean {
  let savedLocal = false;
  try {
    const dir = path.dirname(LOCAL_OVERRIDES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_OVERRIDES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
    savedLocal = true;
  } catch {
    // Read-only filesystem in serverless production
  }

  try {
    fs.writeFileSync(TMP_OVERRIDES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Error saving articles overrides to tmp:', err);
    return savedLocal;
  }
}

export async function GET() {
  try {
    let sheetArticles: ArticleItem[] = [];

    // Try fetching from Google Sheets
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_articles`, { cache: 'no-store' });
      const json = await res.json();
      const rows = Array.isArray(json) ? json : json.data || [];
      if (Array.isArray(rows) && rows.length > 0) {
        sheetArticles = rows.map((r: any, idx: number) => {
          const matchDefault = DEFAULT_ARTICLES.find(
            (d) =>
              d.id === r.id ||
              d.slug === r.id ||
              d.slug === r.slug ||
              d.slug === r[''] ||
              (d.title.id && d.title.id === r.titleId)
          );

          const resolvedSlug =
            r.slug ||
            r[''] ||
            (matchDefault ? matchDefault.slug : (r.id && !String(r.id).startsWith('art_') ? r.id : `artikel-${idx + 1}`));

          const resolvedId = r.id || (matchDefault ? matchDefault.id : `art_${idx + 1}`);

          return {
            id: resolvedId,
            slug: resolvedSlug,
            category: r.category || 'Teknik Industri',
            author: r.author || 'Tim Engineering BELSA',
            title: { id: r.titleId || r.title || 'Artikel Teknik', en: r.titleEn || r.title || 'Technical Article' },
            summary: { id: r.summaryId || r.summary || '', en: r.summaryEn || r.summary || '' },
            content: { id: r.contentId || r.content || '', en: r.contentEn || r.content || '' },
            date: r.date ? (typeof r.date === 'string' && r.date.includes('T') ? r.date.slice(0, 10) : String(r.date).slice(0, 10)) : new Date().toISOString().slice(0, 10),
            readTime: r.readTime || '5 min baca',
            image: r.imageUrl || r.image || '/images/belsa_og_logo.png',
            tags: r.tags ? (typeof r.tags === 'string' ? r.tags.split(',').map((t: string) => t.trim()) : r.tags) : ['Teknik']
          };
        });
      }
    } catch {
      // Ignore sheet fetch error
    }

    const localOverrides = getLocalOverrides();

    // Map by slug or id: default -> sheet -> localOverrides
    const map = new Map<string, ArticleItem>();
    DEFAULT_ARTICLES.forEach((a) => map.set(a.slug, a));
    sheetArticles.forEach((a) => {
      // Filter out dummy/test rows
      if (a.title.id && a.title.id !== 'Test' && a.id !== 'test') {
        map.set(a.slug, a);
      }
    });
    localOverrides.forEach((a) => {
      if (a.title.id && a.title.id !== 'Test' && a.id !== 'test') {
        map.set(a.slug, a);
      }
    });

    const finalArticles = Array.from(map.values());

    return NextResponse.json({ success: true, data: finalArticles });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Autentikasi Admin diperlukan.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, article, slug } = body;

    const currentOverrides = getLocalOverrides();
    const map = new Map<string, ArticleItem>();
    DEFAULT_ARTICLES.forEach((a) => map.set(a.slug, a));
    currentOverrides.forEach((a) => map.set(a.slug, a));

    if (action === 'save' && article) {
      map.set(article.slug, article);
      const updatedList = Array.from(map.values());
      saveLocalOverrides(updatedList);

      // Forward to Google Apps Script if supported
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'save_article',
            article
          })
        });
      } catch (gasErr) {
        console.warn('Google Script sync notice:', gasErr);
      }

      return NextResponse.json({ success: true, data: updatedList });
    }

    if (action === 'delete' && slug) {
      map.delete(slug);
      const updatedList = Array.from(map.values());
      saveLocalOverrides(updatedList);

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'delete_article',
            slug
          })
        });
      } catch (gasErr) {
        console.warn('Google Script sync notice:', gasErr);
      }

      return NextResponse.json({ success: true, data: updatedList });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
