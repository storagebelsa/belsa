import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.resolve('reports/mobile-audit');

// Ensure output directories exist
fs.mkdirSync(path.join(OUTPUT_DIR, 'screenshots'), { recursive: true });

const TARGET_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Catalogue-Root', path: '/catalogue' },
  { name: 'Catalogue-B4WE', path: '/catalogue?series=b4we' },
  { name: 'Catalogue-B4WE6', path: '/catalogue?series=b4we6' },
  { name: 'Catalogue-B4WE10', path: '/catalogue?series=b4we10' },
  { name: 'Catalogue-B4WRP', path: '/catalogue?series=b4wrp' },
  { name: 'Catalogue-BV150', path: '/catalogue?series=bv150' },
  { name: 'Catalogue-BZW-DM', path: '/catalogue?series=bzw-dm' },
  { name: 'Catalogue-DV175F', path: '/catalogue?series=dv175f' },
  { name: 'About-Us', path: '/about-us' },
  { name: 'Contact-Us', path: '/contact-us' }
];

const DEVICES = [
  { name: 'iPhone-14', ...devices['iPhone 14'] },
  { name: 'Pixel-7', ...devices['Pixel 7'] }
];

async function runAudit() {
  console.log(`\n📱 Memulai Mobile UI Audit di ${BASE_URL}...`);
  console.log(`📁 Hasil laporan & screenshot disimpan di: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const reportResults = [];

  for (const target of TARGET_PAGES) {
    console.log(`\n🔍 Memeriksa Halaman: ${target.name} (${target.path})`);

    for (const dev of DEVICES) {
      const context = await browser.newContext({
        ...dev,
        bypassCSP: true
      });
      const page = await context.newPage();

      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') pageErrors.push(msg.text());
      });

      const fullUrl = `${BASE_URL}${target.path}`;
      const result = {
        pageName: target.name,
        path: target.path,
        device: dev.name,
        viewport: `${dev.viewport.width}x${dev.viewport.height}`,
        url: fullUrl,
        overflowingElements: [],
        smallTouchTargets: [],
        errors: [],
        screenshotPath: ''
      };

      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 20000 });
        // Allow client hydration and smooth layout settle
        await page.waitForTimeout(1000);

        // 1. Audit: Horizontal Overflow (Penyebab layar HP bisa digeser ke kanan-kiri)
        const overflowData = await page.evaluate(() => {
          const vw = window.innerWidth;
          const rootScrollWidth = document.documentElement.scrollWidth;
          const bodyScrollWidth = document.body ? document.body.scrollWidth : 0;
          const hasOverflow = rootScrollWidth > vw || bodyScrollWidth > vw;

          const offenders = [];
          if (hasOverflow) {
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              // Jika ada elemen yang lewat dari batas kanan layar > 2px
              if (rect.right > vw + 2) {
                const tag = el.tagName.toLowerCase();
                const id = el.id ? `#${el.id}` : '';
                const classes = el.className && typeof el.className === 'string'
                  ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
                  : '';
                const text = (el.innerText || '').slice(0, 30).replace(/\s+/g, ' ').trim();
                offenders.push({
                  selector: `${tag}${id}${classes}`,
                  text: text ? `"${text}"` : '',
                  right: Math.round(rect.right),
                  overflowByPx: Math.round(rect.right - vw)
                });
              }
            }
          }

          return {
            hasOverflow,
            viewportWidth: vw,
            scrollWidth: Math.max(rootScrollWidth, bodyScrollWidth),
            offenders: offenders.slice(0, 5) // ambil max 5 yang paling mencolok
          };
        });

        result.hasOverflow = overflowData.hasOverflow;
        result.overflowData = overflowData;
        if (overflowData.hasOverflow) {
          result.overflowingElements = overflowData.offenders;
        }

        // 2. Audit: Touch Targets (< 32px considered too hard to tap on mobile)
        const smallTargets = await page.evaluate(() => {
          const interactive = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
          const issues = [];

          for (const el of interactive) {
            // Abaikan elemen tersembunyi
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;

            // Di bawah 32px sangat rawan salah pencet di layar sentuh
            if (rect.width < 32 || rect.height < 32) {
              const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').slice(0, 25).trim();
              issues.push({
                tag: el.tagName.toLowerCase(),
                text: text ? `"${text}"` : '<tanpa teks>',
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              });
            }
          }
          return issues.slice(0, 5);
        });

        result.smallTouchTargets = smallTargets;
        result.errors = pageErrors;

        // 3. Take Full-Page Mobile Screenshot
        const screenshotFileName = `${target.name.toLowerCase()}-${dev.name.toLowerCase()}.png`;
        const screenshotFullPath = path.join(OUTPUT_DIR, 'screenshots', screenshotFileName);
        await page.screenshot({ path: screenshotFullPath, fullPage: true });
        result.screenshotPath = `screenshots/${screenshotFileName}`;

        console.log(`  ✓ [${dev.name}] Status: OK | Overflow: ${result.hasOverflow ? '⚠️ YA (' + overflowData.scrollWidth + 'px vs ' + overflowData.viewportWidth + 'px)' : '✅ Bersih'}`);

      } catch (err) {
        console.error(`  ✗ [${dev.name}] Gagal: ${err.message}`);
        result.errors.push(err.message);
      } finally {
        await context.close();
      }

      reportResults.push(result);
    }
  }

  await browser.close();

  // Generate Markdown Summary Report
  const mdReport = generateMarkdownReport(reportResults);
  const reportPath = path.join(OUTPUT_DIR, 'REPORT.md');
  fs.writeFileSync(reportPath, mdReport, 'utf-8');

  console.log(`\n========================================`);
  console.log(`🎉 Audit Selesai! Laporan dibuat di:`);
  console.log(`📄 ${reportPath}`);
  console.log(`🖼️  ${path.join(OUTPUT_DIR, 'screenshots')}`);
  console.log(`========================================\n`);
}

function generateMarkdownReport(results) {
  let md = `# 📱 Laporan Hasil Audit Mobile UI BELSA\n\n`;
  md += `Audit dilakukan otomatis menggunakan **Playwright** untuk mengevaluasi responsivitas, overflow layout, dan ukuran tombol pada perangkat HP.\n\n`;
  md += `* **Waktu Audit:** ${new Date().toLocaleString('id-ID')}\n`;
  md += `* **Target Server:** \`${BASE_URL}\`\n\n`;

  md += `## 📊 Ringkasan Hasil\n\n`;
  md += `| Halaman | Device | Viewport | Horizontal Overflow | Touch Target Kecil | Screenshot |\n`;
  md += `| :--- | :--- | :--- | :---: | :---: | :--- |\n`;

  for (const r of results) {
    const overflowBadge = r.hasOverflow ? `⚠️ **BOCOR (${r.overflowData.scrollWidth}px)**` : `✅ Aman`;
    const touchBadge = r.smallTouchTargets.length > 0 ? `⚠️ ${r.smallTouchTargets.length} tombol < 32px` : `✅ Standar`;
    const screenshotLink = r.screenshotPath ? `[Lihat Foto](${r.screenshotPath})` : `-`;
    md += `| **${r.pageName}** | ${r.device} | ${r.viewport} | ${overflowBadge} | ${touchBadge} | ${screenshotLink} |\n`;
  }

  md += `\n---\n\n## 🛠️ Detail Masalah per Halaman\n\n`;

  for (const r of results) {
    if (r.hasOverflow || r.smallTouchTargets.length > 0 || r.errors.length > 0) {
      md += `### 📱 ${r.pageName} (${r.device})\n`;
      md += `* **URL:** \`${r.url}\`\n`;

      if (r.hasOverflow) {
        md += `* **⚠️ Horizontal Overflow Ditemukan:** Lebar konten (\`${r.overflowData.scrollWidth}px\`) melebihi layar HP (\`${r.overflowData.viewportWidth}px\`).\n`;
        md += `  * *Elemen yang keluar layar:*\n`;
        for (const off of r.overflowingElements) {
          md += `    - \`${off.selector}\` ${off.text} (Keluar sebesar \`${off.overflowByPx}px\`)\n`;
        }
      }

      if (r.smallTouchTargets.length > 0) {
        md += `* **⚠️ Tombol Terlalu Kecil (< 32px):**\n`;
        for (const st of r.smallTouchTargets) {
          md += `    - Elemen \`<${st.tag}>\` ${st.text}: Ukuran \`${st.width}x${st.height}px\`\n`;
        }
      }

      if (r.errors.length > 0) {
        md += `* **❌ Error di Console/Halaman:**\n`;
        for (const e of r.errors) {
          md += `    - \`${e}\`\n`;
        }
      }

      md += `\n`;
    }
  }

  return md;
}

runAudit().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
