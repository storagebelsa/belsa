import { MetadataRoute } from 'next';
import { BELSA_CATALOGUE_FULL } from '@/data/belsaCatalogueFull';

const DELETED_SERIES_IDS = new Set([
  'diverter_valve', 'bsp', 'cl_series', 'npp-nhpu', 'bhreb_20es_1',
  'd_nipple', 'double_nipple', 'fitting', 'r1at', 'r2at', 'rejseries',
  'bwe_series', 'tubing', 'rotary'
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belsa.id';
  const baseUrl = rawBaseUrl.replace(/belsa\.co\.id/i, 'belsa.id').replace(/\/$/, '');
  const currentDate = new Date().toISOString();

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/catalogue`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // 2. Product Category Landing Pages (3 Core Pillars)
  const categorySlugs = [
    'silinder-hidrolik-pneumatik',
    'selang-hidrolik-industri',
    'process-valve',
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. Project Case Study Pages
  const projectSlugs = [
    'pt-ykk-ap-indonesia',
    'pt-the-master-steel-mfc-proyek-1',
    'pt-the-master-steel-mfc-proyek-2',
    'pt-elangperdana-tyre-industry',
    'pt-jx-nippon-oil-energy',
    'pt-sumi-rubber-indonesia-dunlop',
  ];

  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.82,
  }));

  // 4. Engineering Calculator Tools (Direct 200 OK Pages)
  const calculatorTools = [
    'pressure',
    'thickness',
    'bolt',
    'weight',
    'torque',
  ];

  const calculatorRoutes: MetadataRoute.Sitemap = calculatorTools.map((tool) => ({
    url: `${baseUrl}/calculator/${tool}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.88,
  }));

  // 5. All Active Catalogue Products (Filtered against deleted items, Direct 200 OK Pages)
  const activeCatalogue = BELSA_CATALOGUE_FULL.filter(
    (item) => !DELETED_SERIES_IDS.has(item.id) && Boolean(item.slug)
  );

  const catalogueRoutes: MetadataRoute.Sitemap = activeCatalogue.map((item) => ({
    url: `${baseUrl}/catalogue/${item.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...projectRoutes,
    ...calculatorRoutes,
    ...catalogueRoutes,
  ];
}
