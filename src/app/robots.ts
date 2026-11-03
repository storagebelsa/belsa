import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belsa.co.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/belsa-admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
