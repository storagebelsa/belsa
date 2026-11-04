const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const tsContent = fs.readFileSync(path.join(rootDir, 'src/data/belsaCatalogueFull.ts'), 'utf8');

const deleted = new Set([
  'diverter_valve', 'bsp', 'cl_series', 'npp-nhpu', 'bhreb_20es_1',
  'd_nipple', 'double_nipple', 'fitting', 'r1at', 'r2at', 'rejseries',
  'bwe_series', 'tubing', 'rotary'
]);

const itemRegex = /"id":\s*"([^"]+)",\s*"slug":\s*"([^"]+)"/g;
const slugs = [];
let m;
while ((m = itemRegex.exec(tsContent)) !== null) {
  if (!deleted.has(m[1]) && m[2]) {
    slugs.push(m[2]);
  }
}

const baseUrl = 'https://belsa.id';
const lastmod = new Date().toISOString().split('T')[0];

const urls = [
  { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${baseUrl}/products`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${baseUrl}/catalogue`, priority: '0.95', changefreq: 'weekly' },
  { loc: `${baseUrl}/projects`, priority: '0.85', changefreq: 'monthly' },
  { loc: `${baseUrl}/calculator`, priority: '0.9', changefreq: 'monthly' },
  { loc: `${baseUrl}/about-us`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${baseUrl}/contact-us`, priority: '0.8', changefreq: 'monthly' },
  ...['silinder-hidrolik-pneumatik', 'selang-hidrolik-industri', 'process-valve'].map((s) => ({
    loc: `${baseUrl}/products/${s}`,
    priority: '0.9',
    changefreq: 'weekly',
  })),
  ...[
    'pt-ykk-ap-indonesia',
    'pt-the-master-steel-mfc-proyek-1',
    'pt-the-master-steel-mfc-proyek-2',
    'pt-elangperdana-tyre-industry',
    'pt-jx-nippon-oil-energy',
    'pt-sumi-rubber-indonesia-dunlop',
  ].map((s) => ({
    loc: `${baseUrl}/projects/${s}`,
    priority: '0.82',
    changefreq: 'monthly',
  })),
  ...['pressure', 'thickness', 'bolt', 'weight', 'torque'].map((s) => ({
    loc: `${baseUrl}/calculator/${s}`,
    priority: '0.88',
    changefreq: 'monthly',
  })),
  ...slugs.map((s) => ({
    loc: `${baseUrl}/catalogue/${s}`,
    priority: '0.85',
    changefreq: 'weekly',
  })),
];

const sitemapXml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n` +
        `    <loc>${u.loc}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        `    <priority>${u.priority}</priority>\n` +
        `  </url>`
    )
    .join('\n') +
  `\n</urlset>\n`;

const sitemapIndexXml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `  <sitemap>\n` +
  `    <loc>https://belsa.id/sitemap.xml</loc>\n` +
  `    <lastmod>${lastmod}</lastmod>\n` +
  `  </sitemap>\n` +
  `</sitemapindex>\n`;

const robotsTxt =
  `User-agent: *\n` +
  `Allow: /\n` +
  `Disallow: /belsa-admin\n` +
  `Disallow: /api/\n\n` +
  `Sitemap: https://belsa.id/sitemap.xml\n` +
  `Sitemap: https://belsa.id/sitemap_index.xml\n`;

fs.writeFileSync(path.join(rootDir, 'public/sitemap.xml'), sitemapXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public/sitemap_index.xml'), sitemapIndexXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public/robots.txt'), robotsTxt, 'utf8');

const appSitemap = path.join(rootDir, 'src/app/sitemap.ts');
const appRobots = path.join(rootDir, 'src/app/robots.ts');
if (fs.existsSync(appSitemap)) fs.unlinkSync(appSitemap);
if (fs.existsSync(appRobots)) fs.unlinkSync(appRobots);

console.log(`Generated static sitemap.xml (${urls.length} URLs), sitemap_index.xml, and robots.txt in public/`);
