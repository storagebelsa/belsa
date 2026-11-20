import { BelsaCategory, BelsaProductSeries } from '@/data/belsaCatalogueFull';
import { INITIAL_CATALOGUE } from '@/data/initialCatalogue';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';
import { HtoConfig } from '@/types/hto';

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Fetches live catalogue rows from Google Sheets (with ISR caching)
 * and merges them onto INITIAL_CATALOGUE so SSR, SSG, and OG metadata
 * always reflect the latest edits saved from /belsa-admin.
 */
export async function fetchLiveCatalogue(): Promise<BelsaProductSeries[]> {
  const baseList: BelsaProductSeries[] = INITIAL_CATALOGUE.map((item) => ({ ...item }));

  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_items`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return baseList;

    const json = await res.json();
    const rows = Array.isArray(json) ? json : json?.data || [];
    if (!Array.isArray(rows) || rows.length === 0) return baseList;

    for (let idx = 0; idx < rows.length; idx++) {
      const r: any = rows[idx];
      const sCode = String(r.series || '').trim();
      if (!sCode) continue;

      const sSlug = String(r.slug || '').trim() || normalizeSlug(sCode);
      const sSlugLower = sSlug.toLowerCase();
      const sCodeLower = sCode.toLowerCase();

      let hto: HtoConfig | undefined;
      if (r.htoConfig) {
        try {
          const parsed = typeof r.htoConfig === 'string' ? JSON.parse(r.htoConfig) : r.htoConfig;
          if (parsed && typeof parsed === 'object') {
            hto = parsed;
          }
        } catch {
          // ignore malformed htoConfig
        }
      }

      const sheetImage = String(r.imageUrl || r.image || '').trim();
      const existingIdx = baseList.findIndex(
        (item) =>
          item.slug?.toLowerCase() === sSlugLower ||
          item.code.toLowerCase() === sCodeLower ||
          item.id.toLowerCase() === sCodeLower ||
          item.id.toLowerCase() === `custom_${sCodeLower}`
      );

      if (existingIdx !== -1) {
        const prev = baseList[existingIdx];
        baseList[existingIdx] = {
          ...prev,
          category: (r.category as BelsaCategory) || prev.category,
          subTitle: r.name
            ? { id: String(r.name), en: prev.subTitle?.en || String(r.name) }
            : prev.subTitle,
          image: sheetImage || prev.image,
          features: r.tagline
            ? {
                id: [String(r.tagline)],
                en: r.taglineEn ? [String(r.taglineEn)] : prev.features?.en || [String(r.tagline)],
              }
            : prev.features,
          htoConfig: hto && Array.isArray(hto.blocks) && hto.blocks.length > 0 ? hto : prev.htoConfig,
        };
      } else {
        baseList.push({
          id: `custom_${sCodeLower}`,
          slug: sSlug,
          series: sCode.toLowerCase().endsWith('series') ? sCode : `${sCode} Series`,
          code: sCode,
          category: (r.category as BelsaCategory) || 'Air Cylinder',
          subTitle: {
            id: r.name || 'Silinder Khusus BELSA',
            en: r.name || 'BELSA Custom Cylinder',
          },
          image: sheetImage || '/images/prod_cylinder_clean.webp',
          symbolType: 'none',
          features: {
            id: [r.tagline || 'Dibuat sesuai spesifikasi pesanan.'],
            en: [r.taglineEn || 'Custom manufactured according to exact customer requirements.'],
          },
          boreSizes: r.boreSizes
            ? String(r.boreSizes)
                .split(',')
                .map((s: string) => parseInt(s.trim(), 10))
                .filter((n: number) => !isNaN(n))
            : [40, 50, 63, 80, 100],
          standardStrokes: r.standardStrokes
            ? String(r.standardStrokes)
                .split(',')
                .map((s: string) => parseInt(s.trim(), 10))
                .filter((n: number) => !isNaN(n))
            : [25, 50, 75, 100, 150, 200, 250, 300, 500],
          maxStroke: parseInt(r.maxStroke, 10) || 2000,
          htoConfig: hto || {
            codePrefix: sCode,
            separator: '-',
            totalSlots: 8,
            blocks: [],
          },
        });
      }
    }
  } catch {
    // Graceful fallback to INITIAL_CATALOGUE
  }

  return baseList;
}

export async function findLiveProductBySlug(slug: string): Promise<BelsaProductSeries | undefined> {
  const s = decodeURIComponent(slug).toLowerCase().trim();
  const list = await fetchLiveCatalogue();
  return list.find(
    (item) =>
      item.slug?.toLowerCase() === s ||
      item.id.toLowerCase() === s ||
      item.code.toLowerCase() === s ||
      item.series.toLowerCase() === s
  );
}
