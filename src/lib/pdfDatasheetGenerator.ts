import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { BelsaProductSeries } from '@/data/belsaCatalogueFull';
import { formatProductImageUrl } from '@/lib/imageUtils';

export interface GeneratePdfOptions {
  product: BelsaProductSeries;
  activeModelCode?: string;
  selectedOptions?: Record<string, string>;
  dynamicSlots?: Record<number, string>;
  lang?: 'id' | 'en';
}

const CIRCLED_NUMBERS: Record<number, string> = {
  1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤',
  6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨', 10: '⑩',
  11: '⑪', 12: '⑫', 13: '⑬', 14: '⑭', 15: '⑮',
  16: '⑯', 17: '⑰', 18: '⑱', 19: '⑲', 20: '⑳'
};

const COLUMN_LABEL_MAP_EN: Record<string, string> = {
  'kode': 'Code',
  'code': 'Code',
  'deskripsi': 'Description',
  'keterangan': 'Description',
  'penjelasan': 'Description',
  'description': 'Description',
  'simbol': 'Symbol',
  'symbol': 'Symbol',
  'tipe': 'Type',
  'type': 'Type',
  'model': 'Model',
  'material': 'Material',
  'max temp': 'Max Temp',
  'suhu': 'Max Temp',
  'ukuran port': 'Port Size',
  'port': 'Port Size',
  'tipe ulir': 'Thread Type',
  'tipe pemasangan': 'Mounting Style',
  'mounting style': 'Mounting Style',
  'tipe bodi': 'Body Type',
  'voltase': 'Voltage',
  'tegangan': 'Voltage',
  'cushion': 'Cushion',
  'magnet': 'Magnet',
  'stroke': 'Stroke (mm)',
  'bore size': 'Bore Size (mm)',
  'ukuran tabung': 'Bore Size (mm)',
  'flow direction': 'Flow Direction',
  'seal material': 'Seal Material',
  'working pressure': 'Pressure',
  'tekanan': 'Pressure',
  'fluid': 'Medium'
};

const COLUMN_LABEL_MAP_ID: Record<string, string> = {
  'kode': 'Kode',
  'code': 'Kode',
  'deskripsi': 'Deskripsi',
  'keterangan': 'Deskripsi',
  'penjelasan': 'Deskripsi',
  'description': 'Deskripsi',
  'type description': 'Deskripsi Tipe',
  'simbol': 'Simbol',
  'symbol': 'Simbol',
  'tipe': 'Tipe',
  'type': 'Tipe',
  'model': 'Model',
  'material': 'Material',
  'max temp': 'Suhu Maks',
  'suhu': 'Suhu Maks',
  'ukuran port': 'Ukuran Port',
  'port': 'Ukuran Port',
  'port size': 'Ukuran Port',
  'thread': 'Ulir (Thread)',
  'thread (g)': 'Ulir (G)',
  'mounting style': 'Tipe Mounting',
  'voltage': 'Tegangan',
  'voltase': 'Tegangan',
  'pressure': 'Tekanan',
  'working pressure': 'Tekanan Kerja',
};

/**
 * Clean subtitle text by removing parenthesized file paths and metadata
 */
export function cleanSubTitle(text?: string): string {
  if (!text) return '';
  return text.replace(/\s*\([^)]*\)/g, '').trim();
}

/**
 * Clean HTO title to remove leading numbers/symbols and unwanted parentheticals
 */
export function cleanHtoTitle(title?: string): string {
  if (!title) return '';
  let t = title.replace(/^[\u2460-\u2473\u24ea-\u24ff#\$\d\s\.\-\–\—\(\)]+/, '').trim();
  t = t.replace(/\s*\((?!(?:mm|inch|in\.|npt|bar|psi|cm|g)\b)[^)]*\)/gi, '').trim();
  return t || title;
}

function cleanColumnLabel(label: string, lang: 'id' | 'en'): string {
  if (!label) return lang === 'id' ? 'Deskripsi' : 'Description';
  const lower = label.toLowerCase().trim();
  if (lang === 'id' && COLUMN_LABEL_MAP_ID[lower]) return COLUMN_LABEL_MAP_ID[lower];
  if (lang === 'en' && COLUMN_LABEL_MAP_EN[lower]) return COLUMN_LABEL_MAP_EN[lower];
  return cleanHtoTitle(label) || label;
}

/**
 * Bilingual technical term normalizer so HTO tables have 100% consistent language
 */
function localizeHtoText(text: string, lang: 'id' | 'en'): string {
  if (!text) return '-';
  let out = text.trim();

  if (lang === 'en') {
    const idToEn: [RegExp, string][] = [
      [/^Standar Pabrik$/i, 'Factory Standard'],
      [/^Standar Katalog$/i, 'Catalog Standard'],
      [/^Standar$/i, 'Standard'],
      [/^Tanpa Cincin Magnet$/i, 'Without Magnet Ring'],
      [/^Dilengkapi Cincin Magnet$/i, 'With Built-in Magnet Ring'],
      [/^Tabung Aluminium Ringan$/i, 'Light Aluminum Tube'],
      [/^Tabung Aluminium$/i, 'Aluminum Tube'],
      [/^Tabung Baja$/i, 'Steel Tube'],
      [/^Tabung Stainless Steel$/i, 'Stainless Steel Tube'],
      [/^Steel Cover Khusus$/i, 'Special Heavy-Duty Steel Cover'],
      [/^Tekanan Rendah 5 kgf\/cm²$/i, 'Low Friction (5 kgf/cm²)'],
      [/^Tekanan Rendah 25 kgf\/cm²$/i, 'Medium Pressure (25 kgf/cm²)'],
      [/^Tekanan Rendah/i, 'Low Pressure'],
      [/^Kaki Flange LB$/i, 'Foot Bracket (LB)'],
      [/^Kaki Flange/i, 'Foot Bracket'],
      [/^Flange Depan\s*\(Rod\)$/i, 'Front Head Flange (Rod End)'],
      [/^Flange Belakang\s*\(Head\)$/i, 'Rear Cap Flange (Head End)'],
      [/^Flange Depan$/i, 'Front Flange'],
      [/^Flange Belakang$/i, 'Rear Flange'],
      [/^Trunnion Tengah TC$/i, 'Center Trunnion (TC)'],
      [/^Trunnion Depan TA$/i, 'Front Trunnion (TA)'],
      [/^Trunnion Belakang TB$/i, 'Rear Trunnion (TB)'],
      [/^Trunnion Tengah$/i, 'Center Trunnion'],
      [/^Trunnion Depan$/i, 'Front Trunnion'],
      [/^Trunnion Belakang$/i, 'Rear Trunnion'],
      [/^Tanpa Bellows$/i, 'Without Rod Bellows'],
      [/^Mur Ujung Batang\s*\(1\s*pcs\)$/i, 'Rod End Nut (1 pc)'],
      [/^Mur Ujung Batang$/i, 'Rod End Nut'],
      [/^Knuckle Tunggal\s*\(I\)$/i, 'Single Knuckle Joint (I-Type)'],
      [/^Knuckle Ganda\s*\(Y\)$/i, 'Double Knuckle Y-Joint (Y-Type)'],
      [/^2 Buah Switch$/i, '2 Switches Included'],
      [/^1 Buah Switch$/i, '1 Switch Included'],
      [/^Lebih dari 2 pcs$/i, 'More than 2 Switches (Specify N)'],
      [/^Silinder Tandem$/i, 'Tandem Cylinder'],
      [/^Tahan Suhu Panas$/i, 'Heat Resistant Viton Seals'],
      [/^Batang Stainless SUS$/i, 'SUS304 Stainless Steel Piston Rod'],
      [/\s+dan\s+/gi, ' & '],
    ];
    for (const [regex, replacement] of idToEn) {
      out = out.replace(regex, replacement);
    }
  } else {
    const enToId: [RegExp, string][] = [
      [/^Single Rod \(Standard\)$/i, 'Single Rod (Standar)'],
      [/^Standard Cover Material$/i, 'Material Cover Standar'],
      [/^Standard Non-lubricated$/i, 'Standar Tanpa Pelumasan'],
      [/^Standard Specification$/i, 'Spesifikasi Standar'],
      [/^Custom Made Solution BELSA$/i, 'Pesanan Khusus (Custom BELSA)'],
      [/^None$/i, 'Tanpa Switch'],
    ];
    for (const [regex, replacement] of enToId) {
      out = out.replace(regex, replacement);
    }
  }

  return out;
}

/**
 * Localize HTO Block Header Title
 */
function localizeBlockTitle(title: string, lang: 'id' | 'en'): string {
  const cleaned = cleanHtoTitle(title);
  if (lang === 'en') return cleaned;

  const mapId: Record<string, string> = {
    'series': 'Seri Produk (Series)',
    'cover material': 'Material Cover',
    'lubrication': 'Pelumasan (Lubrication)',
    'magnet': 'Opsi Magnet',
    'mounting style': 'Tipe Mounting',
    'tube material': 'Material Tabung',
    'bore size (mm)': 'Ukuran Bore (mm)',
    'bore size': 'Ukuran Bore (mm)',
    'cylinder stroke (mm)': 'Panjang Stroke (mm)',
    'stroke (mm)': 'Panjang Stroke (mm)',
    'bellows': 'Pelindung Batang (Bellows)',
    'rod end attachment': 'Aksesoris Ujung Rod',
    'auto switch model': 'Tipe Auto Switch',
    'auto switch': 'Tipe Auto Switch',
    'number of auto switches': 'Jumlah Auto Switch',
    'special order': 'Opsi Khusus (Special Order)',
    'custom specification': 'Spesifikasi Kustom',
    'seal material': 'Material Seal',
    'rod end thread': 'Ulir Ujung Rod',
  };
  return mapId[cleaned.toLowerCase()] || cleaned;
}

/**
 * Extract image as Base64 data URI safely:
 * - For local "/images/..." assets, ALWAYS fetch directly from same-origin browser first (never cross-contaminate with proxy cache)
 * - For remote URLs (Google Drive / external), use "/api/image-proxy" with a unique cache-buster
 */
async function getImageAsBase64(imageUrl: string, fallbackDomSelector?: string): Promise<string> {
  if (typeof window === 'undefined' || !imageUrl) return '';
  if (imageUrl.startsWith('data:image')) return imageUrl;

  const isLocalAsset =
    imageUrl.startsWith('/') ||
    imageUrl.startsWith(window.location.origin);

  // 1. For local assets (like /images/logo.webp), fetch directly from same-origin
  if (isLocalAsset) {
    try {
      const res = await fetch(imageUrl, { cache: 'force-cache' });
      if (res.ok) {
        const blob = await res.blob();
        const b64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(blob);
        });
        if (b64.startsWith('data:image')) return b64;
      }
    } catch {
      // fall through
    }
  }

  // 2. For external URLs (or if direct local fetch failed), use server-side image proxy with unique cache key
  try {
    const hashKey = encodeURIComponent(imageUrl.slice(-24));
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}&_k=${hashKey}&_t=${Date.now()}`;
    const res = await fetch(proxyUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.dataUri && data.dataUri.startsWith('data:image')) {
        return data.dataUri;
      }
    }
  } catch {
    // fall through
  }

  // 3. Fallback: extract from already-rendered DOM image element if available
  if (fallbackDomSelector) {
    try {
      const el = document.querySelector(fallbackDomSelector) as HTMLImageElement | null;
      if (el && el.naturalWidth > 0) {
        const c = document.createElement('canvas');
        c.width = el.naturalWidth;
        c.height = el.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(el, 0, 0);
          const dataUrl = c.toDataURL('image/png');
          if (dataUrl.startsWith('data:image')) return dataUrl;
        }
      }
    } catch {
      // ignore tainted canvas
    }
  }

  return imageUrl;
}

/**
 * Render a crisp numbered badge (1..20) matching the web catalogue's outlined circle style (①..⑳)
 * Uses inline SVG with exact cap-height geometry so digits are 100% centered and never clipped in html2canvas.
 */
function renderSlotNumberBadge(num: number, size: 'sm' | 'md' = 'md'): string {
  const dim = size === 'sm' ? 16 : 18;
  const fontSize = num >= 10 ? 9.4 : 11.2;
  // Exact half-cap-height centering for digits (capHeight ≈ 0.72 * fontSize around cy = 10)
  const textY = (10 + fontSize * 0.36).toFixed(2);
  return `
    <svg width="${dim}" height="${dim}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="display: block; flex-shrink: 0;">
      <circle cx="10" cy="10" r="8.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.65" />
      <text x="10" y="${textY}" text-anchor="middle" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${fontSize}">${num}</text>
    </svg>
  `;
}

/**
 * Render a code pill inside table cells with true vertical centering
 */
function renderCodePill(code: string, isSelected: boolean, compact = false, spacious = false): string {
  const bg = isSelected ? '#dc2626' : '#f1f5f9';
  const color = isSelected ? '#ffffff' : '#0f172a';
  const border = isSelected ? '1px solid #dc2626' : '1px solid #cbd5e1';
  const fontSize = spacious ? (compact ? '8.2px' : '8.5px') : (compact ? '7.8px' : '8px');
  const minW = spacious ? (compact ? '26px' : '28px') : (compact ? '24px' : '26px');
  const pillH = spacious ? '19px' : (compact ? '17px' : '18px');
  return `<span style="display: inline-flex; align-items: center; justify-content: center; min-width: ${minW}; height: ${pillH}; padding: 0 5px; border-radius: 4px; background: ${bg}; color: ${color}; border: ${border}; font-weight: 800; font-size: ${fontSize}; line-height: 1; box-sizing: border-box; vertical-align: middle;"><span style="display: inline-block; line-height: 1;">${code || 'Nil'}</span></span>`;
}

/**
 * Render an individual HTO Block Card (supports 'table', 'chips', and 'stroke_matrix')
 */
function renderBlockCard(
  block: any,
  selectedCode: string | undefined,
  lang: 'id' | 'en',
  maxStrokeFallback?: number,
  density: 'spacious' | 'medium' | 'compact' = 'compact'
): string {
  const isSpacious = density === 'spacious';
  const isMedium = density === 'medium';
  const normSelected = selectedCode !== undefined && selectedCode !== null ? String(selectedCode).trim() : '';

  const isRowSelected = (code?: string) => {
    const c = (code ?? '').trim();
    if (normSelected === '' || normSelected === 'Nil' || normSelected === '—') {
      return c === '' || c.toLowerCase() === 'nil';
    }
    return c === normSelected;
  };

  const blockTitle = localizeBlockTitle(block.title || '', lang);
  const slotNum = Number(block.slotIndex) || 1;
  const numBadge = renderSlotNumberBadge(slotNum, 'md');

  let bodyHtml = '';
  let selectedSummaryLabel = '';

  if (block.displayType === 'chips') {
    const chips: (string | number)[] = block.chipValues || [];
    selectedSummaryLabel = normSelected ? `Ø${normSelected} mm` : '';
    const chipH = isSpacious ? '24px' : '21px';
    bodyHtml = `
      <div style="padding: ${isSpacious ? '9px 10px' : '7px 8px'}; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; align-content: center; flex: 1;">
        ${chips.map((chip) => {
          const sel = String(chip).trim() === normSelected;
          const bg = sel ? '#dc2626' : '#f8fafc';
          const color = sel ? '#ffffff' : '#0f172a';
          const border = sel ? '1.5px solid #dc2626' : '1px solid #cbd5e1';
          return `
            <div style="flex: 1 0 48px; height: ${chipH}; display: inline-flex; align-items: center; justify-content: center; border-radius: 5px; border: ${border}; background: ${bg}; color: ${color}; font-size: ${isSpacious ? '9.5px' : '9px'}; font-weight: 800; padding: 0 6px; line-height: 1; letter-spacing: 0.01em; box-sizing: border-box;">
              <span style="display: inline-block; line-height: 1;">Ø${chip}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (block.displayType === 'stroke_matrix') {
    const strokes: (string | number)[] = block.standardStrokes || [];
    const maxStk = block.maxStroke || maxStrokeFallback || 2000;
    const isCustomSelected =
      normSelected !== '' &&
      normSelected !== '—' &&
      !strokes.some((s) => String(s).trim() === normSelected);

    selectedSummaryLabel = normSelected ? `${normSelected} mm` : '';
    const stkH = isSpacious ? '22px' : '19px';

    bodyHtml = `
      <div style="padding: ${isSpacious ? '8px 10px' : '6px 8px'}; display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: ${isSpacious ? '5px' : '4px'}; margin-bottom: 6px;">
          ${strokes.map((stk) => {
            const sel = String(stk).trim() === normSelected;
            const bg = sel ? '#dc2626' : '#f8fafc';
            const color = sel ? '#ffffff' : '#334155';
            const border = sel ? '1.5px solid #dc2626' : '1px solid #cbd5e1';
            return `
              <div style="height: ${stkH}; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; border: ${border}; background: ${bg}; color: ${color}; font-size: ${isSpacious ? '9px' : '8.5px'}; font-weight: 800; padding: 0 2px; line-height: 1; box-sizing: border-box;">
                <span style="display: inline-block; line-height: 1;">${stk}</span>
              </div>
            `;
          }).join('')}
        </div>
        <div style="border-top: 1px dashed #cbd5e1; padding: 4px 0 2px 0; display: flex; align-items: center; justify-content: space-between; font-size: ${isSpacious ? '8.5px' : '8px'}; color: #475569; line-height: 1.2;">
          <span>
            <strong>${lang === 'id' ? 'Stroke Kustom' : 'Custom Stroke'}:</strong>
            ${lang === 'id' ? `Tersedia hingga maks. ${maxStk} mm` : `Available up to max. ${maxStk} mm`}
          </span>
          ${isCustomSelected ? `
            <span style="display: inline-flex; align-items: center; justify-content: center; height: 18px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; font-weight: 800; padding: 0 6px; border-radius: 4px; line-height: 1;">
              <span style="display: inline-block; line-height: 1;">${lang === 'id' ? 'Dipilih' : 'Selected'}: ${normSelected} mm</span>
            </span>
          ` : ''}
        </div>
      </div>
    `;
  } else {
    // Table displayType
    const visibleColumns = (block.columns || []).filter((c: any) => {
      const normLabel = (c.label || '').toLowerCase().trim();
      const normId = (c.id || '').toLowerCase().trim();
      return !(
        normId === 'code' ||
        normLabel === 'kode' ||
        normLabel === 'code' ||
        normLabel === 'symbol' ||
        normLabel === 'simbol' ||
        normId === 'symbol'
      );
    });

    const rows: any[] = block.rows || [];
    const codeColLabel = lang === 'id' ? 'Kode' : 'Code';

    // Find active row description for header badge summary
    const activeRow = rows.find((r) => isRowSelected(r.code));
    if (activeRow) {
      selectedSummaryLabel = activeRow.code || 'Nil';
    }

    const subTableFont = isSpacious ? '8.6px' : isMedium ? '8.4px' : '8.2px';
    const singleTableFont = isSpacious ? '9px' : isMedium ? '8.6px' : '8.4px';
    const subCellPad = isSpacious ? '3.5px 5px' : isMedium ? '3px 4px' : '2.5px 4px';
    const singleCellPad = isSpacious ? '4px 6px' : isMedium ? '3.2px 5px' : '2.5px 5px';
    const thPad = isSpacious ? '4px 5px' : '3px 4px';

    // Split tables with > 5 rows into 2 side-by-side compact sub-tables when there is only 1 description column
    if (rows.length > 5 && visibleColumns.length <= 1) {
      const mid = Math.ceil(rows.length / 2);
      const leftRows = rows.slice(0, mid);
      const rightRows = rows.slice(mid);
      const colHeader = visibleColumns.length > 0 ? cleanColumnLabel(visibleColumns[0].label, lang) : (lang === 'id' ? 'Deskripsi' : 'Description');

      const renderSubTable = (subRows: any[]) => `
        <table style="width: 100%; height: 100%; border-collapse: collapse; font-size: ${subTableFont};">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 700;">
              <th style="padding: ${thPad}; text-align: left; width: 44px; vertical-align: middle;">${codeColLabel}</th>
              <th style="padding: ${thPad}; text-align: left; vertical-align: middle;">${colHeader}</th>
            </tr>
          </thead>
          <tbody>
            ${subRows.map((r, idx) => {
              const sel = isRowSelected(r.code);
              const rawVal = visibleColumns.length > 0
                ? (r.values?.[visibleColumns[0].id] || r.description || r.label || '-')
                : (r.description || r.label?.replace(/^[^-]+-\s*/, '') || '-');
              const val = localizeHtoText(rawVal, lang);
              const bg = sel ? '#fee2e2' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc');
              const textColor = sel ? '#991b1b' : '#334155';
              return `
                <tr style="background: ${bg}; border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: ${subCellPad}; vertical-align: middle; width: 44px;">
                    ${renderCodePill(r.code || 'Nil', sel, true, isSpacious)}
                  </td>
                  <td style="padding: ${subCellPad}; color: ${textColor}; font-weight: ${sel ? '700' : '500'}; vertical-align: middle; line-height: 1.25;">
                    ${val}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: ${isSpacious ? '4px 7px' : '3px 6px'}; flex: 1; align-items: stretch;">
          <div style="display: flex; flex-direction: column; height: 100%;">${renderSubTable(leftRows)}</div>
          <div style="border-left: 1px solid #e2e8f0; padding-left: 6px; display: flex; flex-direction: column; height: 100%;">${renderSubTable(rightRows)}</div>
        </div>
      `;
    } else {
      // Standard single table inside card (supports 1 or multiple visible columns)
      bodyHtml = `
        <div style="padding: ${isSpacious ? '4px 7px' : '3px 6px'}; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <table style="width: 100%; height: 100%; border-collapse: collapse; font-size: ${singleTableFont};">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 700;">
                <th style="padding: ${thPad}; text-align: left; width: 52px; vertical-align: middle;">${codeColLabel}</th>
                ${visibleColumns.length > 0 ? visibleColumns.map((c: any) => `
                  <th style="padding: ${thPad}; text-align: left; vertical-align: middle;">${cleanColumnLabel(c.label, lang)}</th>
                `).join('') : `
                  <th style="padding: ${thPad}; text-align: left; vertical-align: middle;">${lang === 'id' ? 'Deskripsi' : 'Description'}</th>
                `}
              </tr>
            </thead>
            <tbody>
              ${rows.map((r: any, idx: number) => {
                const sel = isRowSelected(r.code);
                const bg = sel ? '#fee2e2' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc');
                const textColor = sel ? '#991b1b' : '#334155';
                return `
                  <tr style="background: ${bg}; border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: ${singleCellPad}; vertical-align: middle; width: 52px;">
                      ${renderCodePill(r.code || 'Nil', sel, false, isSpacious)}
                    </td>
                    ${visibleColumns.length > 0 ? visibleColumns.map((c: any) => {
                      const rawCell = r.values?.[c.id] || r.label || '-';
                      return `
                        <td style="padding: ${singleCellPad}; color: ${textColor}; font-weight: ${sel ? '700' : '500'}; vertical-align: middle; line-height: 1.25;">
                          ${localizeHtoText(rawCell, lang)}
                        </td>
                      `;
                    }).join('') : `
                      <td style="padding: ${singleCellPad}; color: ${textColor}; font-weight: ${sel ? '700' : '500'}; vertical-align: middle; line-height: 1.25;">
                        ${localizeHtoText(r.label || '-', lang)}
                      </td>
                    `}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  return `
    <div style="border: 1px solid #cbd5e1; border-radius: 7px; background: #ffffff; overflow: hidden; display: flex; flex-direction: column; height: 100%;">
      <div style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; padding: ${isSpacious ? '5px 10px' : '4px 8px'}; min-height: ${isSpacious ? '28px' : '25px'}; display: flex; align-items: center; justify-content: space-between; gap: 6px; box-sizing: border-box;">
        <div style="display: inline-flex; align-items: center; gap: 6px;">
          ${numBadge}
          <span style="font-size: ${isSpacious ? '9.6px' : '9px'}; font-weight: 800; color: #0f172a; letter-spacing: 0.02em; line-height: 1; display: inline-block;">${blockTitle}</span>
        </div>
        ${selectedSummaryLabel ? `
          <span style="display: inline-flex; align-items: center; justify-content: center; height: ${isSpacious ? '18px' : '16px'}; font-size: ${isSpacious ? '8px' : '7.5px'}; font-weight: 800; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 0 6px; line-height: 1; box-sizing: border-box;">
            <span style="display: inline-block; line-height: 1;">${selectedSummaryLabel}</span>
          </span>
        ` : ''}
      </div>
      ${bodyHtml}
    </div>
  `;
}

/**
 * High-Definition Standard A4 Official Technical Datasheet PDF Generator
 */
export async function generateProductDatasheetPdf({
  product,
  activeModelCode,
  selectedOptions = {},
  dynamicSlots = {},
  lang = 'id',
}: GeneratePdfOptions) {
  if (typeof window === 'undefined') return;

  const formattedProdImgUrl = formatProductImageUrl(product.image);

  // Fetch official BELSA logo directly from same-origin & product image via proxy/DOM
  const [logoBase64, prodImgBase64] = await Promise.all([
    getImageAsBase64('/images/logo.webp', 'img[alt="BELSA Official Logo"]'),
    getImageAsBase64(formattedProdImgUrl, '#belsa-catalog-sheet img:not([alt="BELSA Official Logo"])')
  ]);

  const hto = product.htoConfig;
  const rawBlocks = [...(hto?.blocks || [])].sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));
  const totalSlots = hto?.totalSlots || rawBlocks.length || 1;
  const slots = Array.from({ length: totalSlots }, (_, i) => i + 1);
  const isManySlots = totalSlots >= 10;

  // Adaptive layout density based on number of HTO blocks so there is no large white void on 8-block series
  const density: 'spacious' | 'medium' | 'compact' =
    rawBlocks.length <= 8 ? 'spacious' : rawBlocks.length <= 10 ? 'medium' : 'compact';
  const isSpacious = density === 'spacious';

  // Resolve active value for each slot
  const getSlotValue = (slotIdx: number): string => {
    if (dynamicSlots && dynamicSlots[slotIdx] !== undefined) {
      return dynamicSlots[slotIdx];
    }
    const block = rawBlocks.find((b) => b.slotIndex === slotIdx);
    if (block && selectedOptions[block.id] !== undefined && selectedOptions[block.id] !== '—') {
      return selectedOptions[block.id];
    }
    if (hto?.defaultSlotValues && hto.defaultSlotValues[slotIdx] !== undefined) {
      return hto.defaultSlotValues[slotIdx];
    }
    if (slotIdx === 1) {
      return hto?.codePrefix || product.code;
    }
    return block?.rows?.[0]?.code ?? '';
  };

  // Build How to Order Sequence Bar
  const slotDelimiters = hto?.slotDelimiters;
  const defaultSep = hto?.separator ?? '-';

  const readableSlotBreakdown = slots
    .map((slotNum) => {
      const v = getSlotValue(slotNum);
      return v && String(v).trim() !== '' && String(v).trim().toLowerCase() !== 'nil'
        ? String(v).trim()
        : null;
    })
    .filter(Boolean)
    .join(' - ');

  const slotBoxHeight = isManySlots ? '21px' : isSpacious ? '24px' : '22px';

  const howToOrderBarHtml = `
    <div style="margin-bottom: ${isSpacious ? '10px' : '8px'};">
      <div style="background: #dc2626; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; height: ${isSpacious ? '22px' : '20px'}; padding: 0 14px; border-radius: 7px 7px 0 0; font-weight: 800; font-size: ${isSpacious ? '9.5px' : '9px'}; letter-spacing: 0.03em; line-height: 1; box-sizing: border-box;">
        <span style="display: inline-block; line-height: 1;">How to Order</span>
      </div>
      <div style="border: 1.5px solid #fca5a5; border-radius: 0 8px 8px 8px; background: #fffafa; padding: ${isSpacious ? '9px 12px' : '7px 10px'};">
        <div style="display: flex; align-items: flex-start; justify-content: center; gap: ${isManySlots ? '3px' : isSpacious ? '6px' : '5px'}; flex-wrap: nowrap;">
          ${slots.map((slotNum) => {
            const val = getSlotValue(slotNum);
            let delimiterAfter = '';
            if (slotNum < totalSlots) {
              if (slotDelimiters) {
                delimiterAfter = slotDelimiters[slotNum] !== undefined ? slotDelimiters[slotNum] : '';
              } else if (defaultSep) {
                delimiterAfter = defaultSep.trim();
              }
            }
            const hasVal = val !== undefined && val !== null && String(val).trim() !== '';
            return `
              <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
                <div style="display: inline-flex; align-items: center; justify-content: center; min-width: ${isManySlots ? '28px' : isSpacious ? '38px' : '36px'}; height: ${slotBoxHeight}; padding: 0 ${isManySlots ? '5px' : '8px'}; border-radius: 5px; background: #ffffff; border: ${hasVal ? '1.5px solid #dc2626' : '1px solid #fca5a5'}; color: ${hasVal ? '#dc2626' : '#94a3b8'}; font-size: ${isManySlots ? '8.5px' : isSpacious ? '10px' : '9.5px'}; font-weight: 800; text-align: center; line-height: 1; box-sizing: border-box;">
                  <span style="display: inline-block; line-height: 1;">${hasVal ? val : 'Nil'}</span>
                </div>
                <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center;">
                  ${renderSlotNumberBadge(slotNum, 'sm')}
                </div>
              </div>
              ${delimiterAfter && delimiterAfter.trim() !== '' ? `
                <div style="height: ${slotBoxHeight}; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; color: #dc2626; padding: 0 1px; flex-shrink: 0; line-height: 1;">
                  <span style="display: inline-block; line-height: 1;">${delimiterAfter}</span>
                </div>
              ` : ''}
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Select clean features list in active language
  const featureList = (lang === 'id' ? product.features?.id : product.features?.en) || product.features?.id || product.features?.en || [];
  const subTitleText = cleanSubTitle(lang === 'id' ? product.subTitle?.id : product.subTitle?.en) || cleanSubTitle(product.subTitle?.id);

  // Create offscreen host container
  const host = document.createElement('div');
  host.id = 'belsa-pdf-export-host';
  host.style.cssText = 'position: fixed; top: 0; left: -9999px; z-index: -9999; pointer-events: none; background: #ffffff;';

  // Calibrate baseWidth to block density so A4 target height matches content naturally
  const baseWidth = rawBlocks.length <= 6 ? 730 : rawBlocks.length <= 8 ? 765 : rawBlocks.length <= 10 ? 800 : 820;
  const page = document.createElement('div');
  page.style.cssText = `
    width: ${baseWidth}px;
    box-sizing: border-box;
    padding: ${isSpacious ? '20px 26px 16px 26px' : '18px 26px 15px 26px'};
    background: #ffffff;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
  `;

  page.innerHTML = `
    <style>
      img[src^="data:image/gif;base64,R0lGODlhAQAB"] {
        display: inline !important;
        width: 1px !important;
        height: 2px !important;
        max-width: none !important;
        vertical-align: baseline !important;
      }
    </style>
    <!-- 1. Official Datasheet Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: ${isSpacious ? '10px' : '9px'};">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">
            ${product.series}
          </h1>
          <span style="display: inline-flex; align-items: center; justify-content: center; height: 20px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; background: #fee2e2; color: #dc2626; padding: 0 8px; border-radius: 4px; letter-spacing: 0.05em; line-height: 1; box-sizing: border-box;">
            <span style="display: inline-block; line-height: 1;">${product.category}</span>
          </span>
          <span style="display: inline-flex; align-items: center; justify-content: center; height: 20px; font-size: 8px; font-weight: 700; background: #f1f5f9; color: #475569; padding: 0 7px; border-radius: 4px; line-height: 1; box-sizing: border-box;">
            <span style="display: inline-block; line-height: 1;">ISO 9001:2015</span>
          </span>
        </div>
        <div style="font-size: 10.5px; color: #475569; font-weight: 600; margin-top: 3px;">
          ${subTitleText}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right;">
        <img src="${logoBase64}" alt="BELSA Official Logo" style="height: 40px; width: auto; max-width: 180px; object-fit: contain; display: block;" />
        <div style="font-size: 8.5px; font-weight: 800; color: #334155; margin-top: 2px; letter-spacing: 0.02em;">
          PT. Rafitama Millenial Wahyudi
        </div>
      </div>
    </div>

    <!-- 2. Top Showcase: 3D Product Image + Key Specifications -->
    <div style="display: grid; grid-template-columns: 170px 1fr; gap: 14px; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: ${isSpacious ? '9px 12px' : '8px 12px'}; margin-bottom: ${isSpacious ? '10px' : '9px'};">
      <div style="height: ${isSpacious ? '100px' : '92px'}; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; padding: 4px;">
        <img src="${prodImgBase64}" alt="${product.series}" style="max-height: ${isSpacious ? '90px' : '82px'}; max-width: 155px; object-fit: contain; display: block;" />
      </div>
      <div>
        <div style="font-size: ${isSpacious ? '10.5px' : '10px'}; font-weight: 800; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em;">
          ${lang === 'id' ? 'Fitur & Spesifikasi Utama' : 'Key Features & Specifications'}
        </div>
        <ul style="margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr; gap: ${isSpacious ? '3.5px' : '2.5px'};">
          ${featureList.map((f: string) => `
            <li style="display: flex; align-items: flex-start; gap: 6px; font-size: ${isSpacious ? '9px' : '8.6px'}; color: #334155; line-height: 1.35;">
              <span style="color: #16a34a; font-weight: 900; font-size: 9px; line-height: 1.2;">✓</span>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>

    <!-- 3. How To Order Sequence Bar -->
    ${howToOrderBarHtml}

    <!-- 4. Sequential 2-Column HTO Specification Matrix (Strict 1 -> 2 -> 3 -> 4 Order) -->
    <div style="flex: ${rawBlocks.length >= 5 ? '1' : '0 0 auto'}; display: grid; grid-template-columns: 1fr 1fr; gap: ${isSpacious ? '9px 11px' : '7px 10px'}; align-items: stretch; margin-bottom: ${isSpacious ? '11px' : '10px'};">
      ${rawBlocks.map((b) => {
        const selVal = getSlotValue(b.slotIndex);
        return renderBlockCard(b, selVal, lang, product.maxStroke, density);
      }).join('')}
    </div>

    <!-- 5. Bottom Summary: Print-Friendly Configured Model Code & Official Footer -->
    <div style="margin-top: auto; padding-top: 2px;">
      <div style="display: grid; grid-template-columns: 1.25fr 0.95fr; gap: 10px; align-items: stretch; margin-bottom: 7px;">
        <!-- Print-Friendly Model Code Box -->
        <div style="border: 1.5px solid #0f172a; border-left: 5px solid #dc2626; border-radius: 7px; background: #f8fafc; padding: 6px 12px 8px 12px; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 7.4px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em;">
            ${lang === 'id' ? 'KODE PEMESANAN MODEL (CONFIGURED MODEL CODE):' : 'CONFIGURED ORDERING MODEL CODE:'}
          </div>
          <div style="font-size: 14.5px; font-weight: 900; color: #0f172a; letter-spacing: 0.03em; margin-top: 1px; line-height: 1.2;">
            ${activeModelCode || product.code}
          </div>
          ${readableSlotBreakdown ? `
            <div style="font-size: 7.6px; font-weight: 700; color: #dc2626; margin-top: 2px; letter-spacing: 0.02em;">
              ${lang === 'id' ? 'Rincian Slot:' : 'Slot Breakdown:'} ${readableSlotBreakdown}
            </div>
          ` : ''}
        </div>

        <!-- Workshop & Custom Engineering Note -->
        <div style="border: 1px solid #fecdd3; border-radius: 7px; background: #fff1f2; padding: 6px 10px 8px 10px; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 7.8px; font-weight: 800; color: #9f1239; margin-bottom: 1.5px;">
            ${lang === 'id' ? 'LAYANAN CUSTOM & FABRIKASI CNC BELSA:' : 'BELSA CNC CUSTOM FABRICATION & SUPPORT:'}
          </div>
          <div style="font-size: 7.4px; color: #475569; line-height: 1.35;">
            ${lang === 'id'
              ? 'Menerima fabrikasi silinder bore/stroke khusus sesuai drawing atau sampel, pembuatan seal kit, dan perbaikan overhaul.'
              : 'Custom cylinder bore/stroke manufacturing per drawing or sample, precision seal kits, and full hydraulic overhaul services.'}
          </div>
        </div>
      </div>

      <!-- Official Letterhead Footer -->
      <div style="border-top: 1.5px solid #cbd5e1; padding-top: 5px; display: flex; align-items: center; justify-content: space-between; font-size: 7.8px; color: #475569;">
        <div>
          <strong>PT. Rafitama Millenial Wahyudi</strong> • Hotline/WA: +62 811-1916-8752 • Email: sales@rafitama.com • <strong>www.belsa.id</strong>
        </div>
        <div style="font-weight: 800; color: #dc2626;">
          BELSA Fluid Power Systems • Official Technical Datasheet
        </div>
      </div>
    </div>
  `;

  host.appendChild(page);
  document.body.appendChild(host);

  try {
    // Wait for all images inside offscreen page to decode
    const imgs = Array.from(page.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
      })
    );

    await new Promise((r) => requestAnimationFrame(r));

    // Proportional Standard A4 Fitting (210mm x 297mm = 1 : 1.4142857)
    const A4_RATIO = 297 / 210;
    let currentWidth = baseWidth;
    let naturalHeight = page.scrollHeight;
    let targetA4Height = Math.round(currentWidth * A4_RATIO);

    // If a 14-block series is taller than base A4 height, proportionally widen container so aspect ratio matches A4 1:1.414
    if (naturalHeight > targetA4Height) {
      currentWidth = Math.min(1040, Math.ceil(naturalHeight / A4_RATIO));
      page.style.width = `${currentWidth}px`;
      await new Promise((r) => requestAnimationFrame(r));
      naturalHeight = page.scrollHeight;
      targetA4Height = Math.round(currentWidth * A4_RATIO);
    }

    const finalRenderHeight = Math.max(naturalHeight, targetA4Height);
    page.style.minHeight = `${finalRenderHeight}px`;

    const canvas = await html2canvas(page, {
      scale: 2.2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: currentWidth,
      height: finalRenderHeight,
      windowWidth: currentWidth,
      windowHeight: finalRenderHeight,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // Always output Standard A4 Portrait (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const renderedRatio = canvas.height / canvas.width;

    if (renderedRatio <= A4_RATIO * 1.02) {
      // Fits cleanly on 1 Standard A4 sheet
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
    } else {
      // Fit proportionally inside A4 with minimal centered margin if ultra-tall
      const fitW = pageHeightMm / renderedRatio;
      const offsetX = (pageWidthMm - fitW) / 2;
      pdf.addImage(imgData, 'PNG', offsetX, 0, fitW, pageHeightMm, undefined, 'FAST');
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `BELSA_Datasheet_${product.code || 'Catalog'}_${dateStr}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF datasheet:', error);
  } finally {
    if (document.body.contains(host)) {
      document.body.removeChild(host);
    }
  }
}
