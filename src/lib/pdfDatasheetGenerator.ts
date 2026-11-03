import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { BelsaProductSeries } from '@/data/belsaCatalogueFull';

interface GeneratePdfOptions {
  product: BelsaProductSeries;
  activeModelCode?: string;
  selectedOptions?: Record<string, string>;
  lang?: 'id' | 'en';
}

const CIRCLED_NUMBERS: Record<number, string> = {
  1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤',
  6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨', 10: '⑩',
  11: '⑪', 12: '⑫', 13: '⑬', 14: '⑭', 15: '⑮',
  16: '⑯', 17: '⑰', 18: '⑱', 19: '⑲', 20: '⑳'
};

const COLUMN_LABEL_MAP: Record<string, string> = {
  'kode': 'Code',
  'code': 'Code',
  'deskripsi': 'Description',
  'description': 'Description',
  'simbol': 'Symbol',
  'symbol': 'Symbol',
  'ukuran port': 'Port Size',
  'tipe ulir': 'Thread Type',
  'tipe pemasangan': 'Mounting Style',
  'mounting style': 'Mounting Style',
  'tipe bodi': 'Body Type',
  'voltase': 'Voltage',
  'cushion': 'Cushion',
  'magnet': 'Magnet',
  'stroke': 'Stroke (mm)',
  'bore size': 'Bore Size (mm)',
  'ukuran tabung': 'Bore Size (mm)',
  'flow direction': 'Flow Direction',
  'seal material': 'Seal Material',
  'working pressure': 'Pressure',
  'fluid': 'Medium'
};

/**
 * Clean subtitle text by removing parenthesized file paths and metadata
 */
export function cleanSubTitle(text?: string): string {
  if (!text) return '';
  return text.replace(/\s*\([^)]*\)/g, '').trim();
}

/**
 * Clean HTO title to ensure pure English without Indonesian translations or mojibake
 */
export function cleanHtoTitle(title?: string): string {
  if (!title) return '';
  let t = title.replace(/^[\u2460-\u2473\u24ea\u24eb\u24ec\u24ed\u24ee\u24ef\u24f0\u24f1\u24f2\u24f3\u24f4\u24f5\u24f6\u24f7\u24f8\u24f9\u24fa\u24fb\u24fc\u24fd\u24fe\u24ff#\$\d\s\.\-\–\—\(\)]+/, '').trim();
  t = t.replace(/\s*\((?!(?:mm|inch|in\.|npt|bar|psi|cm)\b)[^)]*\)/gi, '').trim();
  return t || title;
}

function cleanColumnLabel(label: string): string {
  if (!label) return 'Description';
  const lower = label.toLowerCase().trim();
  if (COLUMN_LABEL_MAP[lower]) return COLUMN_LABEL_MAP[lower];
  return cleanHtoTitle(label) || label;
}

/**
 * Extract image as Base64 data URI safely using multiple progressive fallback strategies:
 * 1. Return immediately if already data URI
 * 2. Fetch through Next.js server-side /api/image-proxy (bypasses all CORS & cross-origin taint issues)
 * 3. Direct same-origin fetch + FileReader
 * 4. Canvas extraction from live DOM element
 */
async function getImageAsBase64(imageUrl: string, selector?: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  if (!imageUrl) return '';

  if (imageUrl.startsWith('data:image')) {
    return imageUrl;
  }

  // Strategy 1: Server-side Image Proxy (100% reliable for both local static files and Google Drive / remote CDN images)
  try {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.dataUri && data.dataUri.startsWith('data:image')) {
        return data.dataUri;
      }
    }
  } catch (e) {
    // continue to next strategy
  }

  // Strategy 2: Direct same-origin fetch (works for all /images/... static files in browser)
  try {
    const res = await fetch(imageUrl);
    if (res.ok) {
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
      if (base64 && base64.startsWith('data:image')) {
        return base64;
      }
    }
  } catch (e) {
    // continue to next strategy
  }

  // Strategy 3: Try to grab from already-decoded image element from live DOM
  if (selector) {
    try {
      const el = document.querySelector(selector) as HTMLImageElement | null;
      if (el && el.naturalWidth > 0) {
        const c = document.createElement('canvas');
        c.width = el.naturalWidth;
        c.height = el.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(el, 0, 0);
          const dataUrl = c.toDataURL('image/png');
          if (dataUrl && dataUrl.startsWith('data:image')) {
            return dataUrl;
          }
        }
      }
    } catch (e) {
      // tainted canvas or crossOrigin error
    }
  }

  return imageUrl;
}

/**
 * Render individual HTO card with comfortable 9px font and clean column widths
 */
function renderBlockCard(block: any, selectedCode?: string): string {
  const isSelected = (code: string) => code === selectedCode;

  const visibleColumns = (block.columns || []).filter((c: any) => {
    const normLabel = (c.label || '').toLowerCase().trim();
    const normId = (c.id || '').toLowerCase().trim();
    return !(normId === 'code' || normLabel === 'kode' || normLabel === 'code' || normLabel === 'symbol' || normLabel === 'simbol' || normId === 'symbol');
  });

  const colHeader = visibleColumns.length > 0 ? cleanColumnLabel(visibleColumns[0].label) : 'Description';
  const rows = block.rows || [];

  let tableHtml = '';
  if (rows.length > 8) {
    const mid = Math.ceil(rows.length / 2);
    const leftRows = rows.slice(0, mid);
    const rightRows = rows.slice(mid);

    const renderSub = (subRows: any[]) => `
      <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; color: #475569; font-weight: 700; text-transform: uppercase;">
            <th style="padding: 4px 6px; text-align: left; width: 32%; vertical-align: middle; line-height: 1.2;">Code</th>
            <th style="padding: 4px 6px; text-align: left; width: 68%; vertical-align: middle; line-height: 1.2;">${colHeader}</th>
          </tr>
        </thead>
        <tbody>
          ${subRows.map((r, idx) => {
            const sel = isSelected(r.code);
            let val = visibleColumns.length > 0 ? (r.values?.[visibleColumns[0].id] || r.description || r.label || '-') : (r.description || r.label?.replace(/^[^-]+-\s*/, '') || '-');
            val = val.replace(/\s*dan\s*/gi, ' & ');
            const bg = sel ? '#fee2e2' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc');
            const color = sel ? '#dc2626' : '#1e293b';
            const weight = sel ? '800' : '500';
            return `
              <tr style="background: ${bg}; border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px 6px; font-weight: ${sel ? '900' : '700'}; color: ${color}; white-space: nowrap; vertical-align: middle; line-height: 1.3;">${r.code}</td>
                <td style="padding: 4px 6px; color: ${color}; font-weight: ${weight}; white-space: nowrap; vertical-align: middle; line-height: 1.3;">${val}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    tableHtml = `
      <div style="display: flex; gap: 8px; padding: 4px 6px;">
        <div style="flex: 1;">${renderSub(leftRows)}</div>
        <div style="flex: 1; border-left: 1.5px solid #e2e8f0; padding-left: 8px;">${renderSub(rightRows)}</div>
      </div>
    `;
  } else {
    tableHtml = `
      <div style="padding: 4px 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; color: #475569; font-weight: 700; text-transform: uppercase;">
              <th style="padding: 4px 8px; text-align: left; width: 28%; vertical-align: middle; line-height: 1.2;">Code</th>
              <th style="padding: 4px 8px; text-align: left; width: 72%; vertical-align: middle; line-height: 1.2;">${colHeader}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r: any, idx: number) => {
              const sel = isSelected(r.code);
              let val = visibleColumns.length > 0 ? (r.values?.[visibleColumns[0].id] || r.description || r.label || '-') : (r.description || r.label?.replace(/^[^-]+-\s*/, '') || '-');
              val = val.replace(/\s*dan\s*/gi, ' & ');
              const bg = sel ? '#fee2e2' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc');
              const color = sel ? '#dc2626' : '#1e293b';
              const weight = sel ? '800' : '500';
              return `
                <tr style="background: ${bg}; border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 4px 8px; font-weight: ${sel ? '900' : '700'}; color: ${color}; white-space: nowrap; vertical-align: middle; line-height: 1.3;">${r.code}</td>
                  <td style="padding: 4px 8px; color: ${color}; font-weight: ${weight}; vertical-align: middle; line-height: 1.3;">${val}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; background: #ffffff; overflow: hidden; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="background: #f1f5f9; border-bottom: 1.5px solid #cbd5e1; padding: 4.5px 8px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 13px; font-weight: 900; color: #0f172a; line-height: 1;">${CIRCLED_NUMBERS[block.slotIndex] || `(${block.slotIndex})`}</span>
        <span style="font-size: 10px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em;">${cleanHtoTitle(block.title)}</span>
      </div>
      ${tableHtml}
    </div>
  `;
}

/**
 * High-definition Catalog Datasheet PDF Generator (1 Lembar Lengkap).
 * Constructs a single, dense, perfectly balanced A4 page rendered via html2canvas & jsPDF.
 */
export async function generateProductDatasheetPdf({
  product,
  activeModelCode,
  selectedOptions = {},
  lang = 'id',
}: GeneratePdfOptions) {
  if (typeof window === 'undefined') return;

  // Direct Live Web Sheet Capture (Exact 1:1 match with web display)
  const sheet = document.getElementById('belsa-catalog-sheet');
  if (sheet) {
    // 1. Hide interactive web action buttons
    const buttonsToHide = sheet.querySelectorAll('.pdf-hide-buttons');
    const prevButtonDisplays: string[] = [];
    buttonsToHide.forEach((b) => {
      const el = b as HTMLElement;
      prevButtonDisplays.push(el.style.display);
      el.style.display = 'none';
    });

    // 2. Hide any floating elements (e.g. WhatsApp button, chat bubbles)
    const floatingElements = document.querySelectorAll('a[href*="wa.me"], button[title*="WhatsApp"], .belsa-floating-wa');
    const prevFloatingDisplays: string[] = [];
    floatingElements.forEach((el) => {
      const h = el as HTMLElement;
      prevFloatingDisplays.push(h.style.display);
      h.style.display = 'none';
    });

    // 3. Hide skeleton loading overlays & ensure images are fully visible
    const skeletons = sheet.querySelectorAll('.belsa-image-skeleton');
    skeletons.forEach((s) => ((s as HTMLElement).style.display = 'none'));
    sheet.querySelectorAll('img').forEach((img) => {
      img.style.opacity = '1';
    });

    // 4. Pre-convert all images in sheet (including product 3D image and logo) to Base64 data URI to prevent CORS drops
    const imagesToRestore: { img: HTMLImageElement; originalSrc: string }[] = [];
    const prodImgs = sheet.querySelectorAll('img');
    await Promise.all(
      Array.from(prodImgs).map(async (img) => {
        const el = img as HTMLImageElement;
        const src = el.src;
        if (src && !src.startsWith('data:image')) {
          try {
            const b64 = await getImageAsBase64(src);
            if (b64 && b64.startsWith('data:image')) {
              imagesToRestore.push({ img: el, originalSrc: src });
              el.src = b64;
              await new Promise<void>((resolve) => {
                if (el.complete && el.naturalWidth > 0) return resolve();
                el.onload = () => resolve();
                el.onerror = () => resolve();
              });
            }
          } catch (e) {
            // keep original if proxy fails
          }
        }
      })
    );

    // 5. Expand all scrollable table containers so every single row is rendered cleanly without scrollbars
    const modifiedElements: { el: HTMLElement; prevMaxHeight: string; prevOverflow: string; prevOverflowY: string }[] = [];
    sheet.querySelectorAll('div').forEach((d) => {
      const el = d as HTMLElement;
      const comp = window.getComputedStyle(el);
      if (el.style.maxHeight || comp.overflowY === 'auto' || comp.overflowY === 'scroll') {
        modifiedElements.push({
          el,
          prevMaxHeight: el.style.maxHeight,
          prevOverflow: el.style.overflow,
          prevOverflowY: el.style.overflowY,
        });
        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
        el.style.overflowY = 'visible';
      }
    });

    // 6. Convert CSS multi-column container to greedy-height-balanced flex 2-columns (prevents html2canvas column bugs)
    const columnsEl = Array.from(sheet.querySelectorAll('div')).find((d) => {
      const s = window.getComputedStyle(d);
      return (s.columnCount && s.columnCount !== 'auto' && s.columnCount !== '1') || (s.columns && s.columns.includes('2'));
    }) as HTMLElement | undefined;

    let originalColumnsCss = '';
    let originalCards: HTMLElement[] = [];
    if (columnsEl) {
      originalColumnsCss = columnsEl.style.cssText;
      originalCards = Array.from(columnsEl.children) as HTMLElement[];
      const cardHeights = originalCards.map((c) => c.getBoundingClientRect().height || 100);

      columnsEl.style.columns = 'unset';
      columnsEl.style.columnCount = 'unset';
      columnsEl.style.display = 'flex';
      columnsEl.style.gap = '16px';
      columnsEl.style.alignItems = 'flex-start';

      const col1 = document.createElement('div');
      col1.id = 'pdf-export-col1';
      col1.style.flex = '1';
      col1.style.display = 'flex';
      col1.style.flexDirection = 'column';
      col1.style.gap = '16px';

      const col2 = document.createElement('div');
      col2.id = 'pdf-export-col2';
      col2.style.flex = '1';
      col2.style.display = 'flex';
      col2.style.flexDirection = 'column';
      col2.style.gap = '16px';

      let col1H = 0;
      let col2H = 0;
      originalCards.forEach((card, idx) => {
        const h = cardHeights[idx];
        if (col1H <= col2H) {
          col1.appendChild(card);
          col1H += h;
        } else {
          col2.appendChild(card);
          col2H += h;
        }
      });

      columnsEl.innerHTML = '';
      columnsEl.appendChild(col1);
      columnsEl.appendChild(col2);
    }

    // 7. Add official company letterhead footer at the bottom of the sheet
    let tempFooter = document.getElementById('pdf-temp-footer');
    if (!tempFooter) {
      tempFooter = document.createElement('div');
      tempFooter.id = 'pdf-temp-footer';
      tempFooter.style.cssText = 'margin-top: 24px; padding-top: 14px; border-top: 1.5px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; color: #64748b; font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      tempFooter.innerHTML = '<div><strong>PT. Rafitama Millenial Wahyudi</strong> • Hotline: +62 811-1916-8752 • Email: sales@rafitama.com • www.belsa.co.id</div><div style="font-weight: 800; color: #dc2626;">BELSA Fluid Power Systems • Official Technical Datasheet</div>';
      sheet.appendChild(tempFooter);
    }

    try {
      // Allow browser frame to recalculate expanded layouts
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210; // Standard A4 width in mm
      const pdfHeight = Math.round((canvas.height * pdfWidth) / canvas.width);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
        compress: true,
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `BELSA_Datasheet_${product.code || 'Catalog'}_${dateStr}.pdf`;
      pdf.save(filename);
      return;
    } catch (err) {
      console.error('Direct sheet capture failed, fallback to template generator:', err);
    } finally {
      // Restore DOM state immediately
      buttonsToHide.forEach((b, idx) => {
        (b as HTMLElement).style.display = prevButtonDisplays[idx];
      });
      floatingElements.forEach((el, idx) => {
        (el as HTMLElement).style.display = prevFloatingDisplays[idx];
      });
      skeletons.forEach((s) => ((s as HTMLElement).style.display = ''));
      imagesToRestore.forEach(({ img, originalSrc }) => {
        img.src = originalSrc;
      });
      modifiedElements.forEach(({ el, prevMaxHeight, prevOverflow, prevOverflowY }) => {
        el.style.maxHeight = prevMaxHeight;
        el.style.overflow = prevOverflow;
        el.style.overflowY = prevOverflowY;
      });
      if (columnsEl && originalCards.length > 0) {
        columnsEl.innerHTML = '';
        originalCards.forEach((c) => columnsEl.appendChild(c));
        columnsEl.style.cssText = originalColumnsCss;
      }
      if (tempFooter && sheet.contains(tempFooter)) {
        sheet.removeChild(tempFooter);
      }
    }
  }

  // --- Fallback Offscreen Generator ---
  const defaultProdImg = product.image || '/images/prod_cylinder_clean.webp';
  const [logoBase64, prodImgBase64] = await Promise.all([
    getImageAsBase64('/images/logo.png', 'img[alt="BELSA Official Logo"]'),
    getImageAsBase64(defaultProdImg, '#belsa-catalog-sheet img:not([alt="BELSA Official Logo"])')
  ]);

  const hto = product.htoConfig;
  const blocks = hto?.blocks || [];
  const totalSlots = hto?.totalSlots || blocks.length || 1;
  const slots = Array.from({ length: totalSlots }, (_, i) => i + 1);

  // Distribute blocks into 2 balanced columns
  const col1Blocks: any[] = [];
  const col2Blocks: any[] = [];

  if (blocks.length <= 4) {
    const mid = Math.ceil(blocks.length / 2);
    col1Blocks.push(...blocks.slice(0, mid));
    col2Blocks.push(...blocks.slice(mid));
  } else if (blocks.length === 8) {
    // Standard pneumatic/hydraulic cylinder 8-block layout:
    // Col 1: Series (0), Mounting Style (1), Rod Material (4), Seals Material (5)
    // Col 2: Tube Size (2), Stroke (3), Adjustable Stroke (6), Special Order (7)
    // This pairs short tables with tall tables for equal height on both columns!
    col1Blocks.push(blocks[0], blocks[1], blocks[4], blocks[5]);
    col2Blocks.push(blocks[2], blocks[3], blocks[6], blocks[7]);
  } else {
    // Dynamic weight balancing based on row count
    let col1Weight = 0;
    let col2Weight = 0;
    blocks.forEach((block) => {
      const weight = Math.max(3, (block.rows?.length || 1) > 8 ? Math.ceil((block.rows?.length || 1) / 2) : (block.rows?.length || 1));
      if (col1Weight <= col2Weight) {
        col1Blocks.push(block);
        col1Weight += weight + 4;
      } else {
        col2Blocks.push(block);
        col2Weight += weight + 4;
      }
    });
  }

  // How to Order sequence bar - with 100% visible, unclipped circled numbers
  const howToOrderBar = `
    <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 12px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: #dc2626; color: #ffffff; font-size: 9.5px; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.05em; display: inline-block; line-height: 1.2;">HOW TO ORDER</span>
          <span style="font-size: 9.5px; font-weight: 700; color: #64748b;">Model Code Sequence & Specification Guide</span>
        </div>
      </div>
      <div style="display: flex; align-items: flex-start; gap: 6px; overflow: visible; flex-wrap: nowrap;">
        ${slots.map((slotIdx) => {
          const block = blocks.find(b => b.slotIndex === slotIdx);
          const selVal = block ? (selectedOptions[block.id] || block.rows?.[0]?.code || '') : '';
          const slotDelims = hto?.slotDelimiters as Record<string, string> | undefined;
          const delimiter = slotDelims?.[String(slotIdx)] || slotDelims?.[slotIdx as unknown as string] || (slotIdx < slots.length ? '-' : '');
          return `
            <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
              <div style="min-width: 44px; height: 28px; padding: 0 6px; border: 1.5px solid #cbd5e1; border-radius: 6px; background: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 900; color: #dc2626; box-shadow: 0 1px 2px rgba(0,0,0,0.02); white-space: nowrap;">
                ${selVal || '-'}
              </div>
              <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 3px; line-height: 1; text-align: center;">
                ${CIRCLED_NUMBERS[slotIdx] || `(${slotIdx})`}
              </div>
            </div>
            ${delimiter ? `
              <div style="height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; color: #dc2626; padding: 0 2px; flex-shrink: 0;">
                ${delimiter}
              </div>
            ` : ''}
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Create temporary host container in DOM
  const host = document.createElement('div');
  host.id = 'belsa-pdf-export-host';
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.zIndex = '-99999';
  host.style.pointerEvents = 'none';
  host.style.opacity = '1';
  host.style.background = '#ffffff';

  // Standard A4 dimensions in px at 96 DPI: 794px x 1123px
  const page = document.createElement('div');
  page.style.cssText = `
    width: 794px;
    height: 1123px;
    box-sizing: border-box;
    padding: 18px 28px 12px 28px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    font-family: 'Barlow', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
  `;

  page.innerHTML = `
    <!-- 1. Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 7px; margin-bottom: 8px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <h1 style="font-size: 23px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">
            ${product.series}
          </h1>
          <span style="font-size: 9.5px; font-weight: 800; text-transform: uppercase; background: #fee2e2; color: #dc2626; padding: 2.5px 8px; border-radius: 5px; letter-spacing: 0.05em;">
            ${product.category}
          </span>
        </div>
        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">
          ${cleanSubTitle(product.subTitle?.[lang] || product.subTitle?.id || product.subTitle?.en)}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end;">
        <img src="${logoBase64}" style="height: 48px; width: auto; max-width: 210px; object-fit: contain; display: block;" />
        <div style="font-size: 9px; font-weight: 800; color: #475569; margin-top: 2px; letter-spacing: 0.02em;">
          PT. Rafitama Millenial Wahyudi
        </div>
      </div>
    </div>

    <!-- 2. Product Presentation & Specifications Matrix -->
    <div style="display: flex; gap: 14px; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 12px; margin-bottom: 8px;">
      <div style="width: 150px; height: 100px; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 7px; display: flex; align-items: center; justify-content: center; padding: 5px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <img src="${prodImgBase64}" style="max-height: 90px; max-width: 140px; object-fit: contain; display: block;" />
      </div>
      <div style="flex: 1;">
        <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <span>Fitur & Spesifikasi</span>
          <span style="font-size: 8.5px; font-weight: 700; color: #dc2626; background: #fef2f2; padding: 1px 5px; border-radius: 3px;">ISO 15552 Standard</span>
        </div>
        <ul style="margin: 0; padding-left: 0; list-style: none;">
          ${(product.features?.[lang] || product.features?.id || product.features?.en || []).slice(0, 4).map((f: string) => `
            <li style="display: flex; align-items: flex-start; gap: 6px; font-size: 9px; color: #334155; margin-bottom: 2.5px; line-height: 1.3;">
              <span style="color: #16a34a; font-weight: 900; font-size: 10px; line-height: 1;">✓</span>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>

    <!-- 3. How To Order Sequence Bar -->
    ${howToOrderBar}

    <!-- 4. Balanced 2-Column Specifications Matrix -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: start; margin-bottom: 8px;">
      <!-- Column 1 -->
      <div>
        ${col1Blocks.map(b => renderBlockCard(b, selectedOptions[b.id])).join('')}
      </div>
      <!-- Column 2 -->
      <div>
        ${col2Blocks.map(b => renderBlockCard(b, selectedOptions[b.id])).join('')}
      </div>
    </div>

    <!-- 5. Bottom Section: Configured Model, Workshop Note, and Official Company Footer -->
    <div style="margin-top: auto;">
      <!-- Configured Model Summary Box -->
      <div style="background: #0f172a; border-radius: 8px; padding: 8px 14px; color: #ffffff; margin-bottom: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 8px; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">
          KODE PEMESANAN / ORDERING MODEL CODE:
        </div>
        <div style="font-size: 19px; font-weight: 900; color: #38bdf8; letter-spacing: 0.04em; margin-top: 2px;">
          ${activeModelCode || product.code}
        </div>
        <div style="font-size: 8px; color: #cbd5e1; margin-top: 1px;">
          Kode disusun dari pilihan How to Order. Mohon konfirmasi ke tim sales sebelum memesan.
        </div>
      </div>

      <!-- Workshop Customization Note -->
      <div style="background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 7px; padding: 6px 12px; margin-bottom: 6px;">
        <div style="font-size: 8.5px; font-weight: 800; color: #9f1239; margin-bottom: 1.5px;">
          PESANAN KHUSUS & KONSULTASI TEKNIS:
        </div>
        <div style="font-size: 8px; color: #475569; line-height: 1.35;">
          Workshop PT. Rafitama Millenial Wahyudi menerima pembuatan silinder dengan stroke dan bore khusus serta penggantian seal kit. Kirimkan drawing atau sample untuk mendapatkan penawaran.
        </div>
      </div>

      <!-- Official Company Letterhead Footer -->
      <div style="border-top: 1.5px solid #e2e8f0; padding-top: 5px; display: flex; align-items: center; justify-content: space-between; font-size: 8px; color: #64748b;">
        <div>
          <strong>PT. Rafitama Millenial Wahyudi</strong> • Hotline: +62 811-1916-8752 • Email: sales@rafitama.com • www.belsa.co.id
        </div>
        <div style="font-weight: 800; color: #dc2626;">
          BELSA Fluid Power Systems • Official Technical Datasheet
        </div>
      </div>
    </div>
  `;

  host.appendChild(page);
  document.body.appendChild(host);

  // Ensure all images inside page are fully loaded before capturing
  const images = Array.from(page.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });
    })
  );

  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

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
