import { MetadataRoute } from 'next';
import { BELSA_CATALOGUE_FULL } from '@/data/belsaCatalogueFull';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belsa.co.id';
  const currentDate = new Date().toISOString();

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
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
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
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
    priority: 0.88,
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

  // 4. Engineering Calculator Tools
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
    priority: 0.85,
  }));

  // 5. All Active Catalogue Products (99 products)
  const catalogueRoutes: MetadataRoute.Sitemap = BELSA_CATALOGUE_FULL.map((item) => ({
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
