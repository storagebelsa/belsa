import type { Metadata } from 'next';
import { INITIAL_CATALOGUE } from '@/data/initialCatalogue';
import { fetchLiveCatalogue, findLiveProductBySlug } from '@/lib/catalogueServer';
import { resolveOgImageUrl } from '@/lib/imageUtils';
import { CatalogueView } from '../page';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const list = await fetchLiveCatalogue().catch(() => INITIAL_CATALOGUE);
  return list
    .filter((item) => Boolean(item.slug))
    .map((item) => ({
      slug: item.slug as string,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await findLiveProductBySlug(slug);

  if (!product) {
    return {
      title: 'Spesifikasi Produk & Katalog Teknis',
      description: 'Katalog teknis silinder hidrolik, silinder pneumatik, dan komponen industri BELSA.',
      alternates: { canonical: '/catalogue' },
    };
  }

  const cleanSubId = product.subTitle?.id?.replace(/\s*\([^)]*\)/g, '').trim() || product.category;
  const cleanSubEn = product.subTitle?.en?.replace(/\s*\([^)]*\)/g, '').trim() || product.category;
  const featSnippet = (product.features?.id || [])
    .slice(0, 3)
    .map((f) => f.replace(/^[-•*]\s*/, '').replace(/\.$/, '').trim())
    .join(', ');

  const title = `${product.series} - ${cleanSubId} (${product.category})`;
  const description = `Spesifikasi teknis, tabel kode pemesanan (How to Order), dan unduh PDF Datasheet ${product.series} (${cleanSubId} / ${cleanSubEn}) dari BELSA. Fitur: ${featSnippet || 'Standar Industri ISO 9001:2015'}.`;
  const imgUrl = resolveOgImageUrl(product.image);

  return {
    title,
    description,
    keywords: [
      product.series,
      `belsa ${product.code}`,
      cleanSubId,
      cleanSubEn,
      product.category,
      `datasheet ${product.series}`,
      'katalog belsa hydraulic pneumatic'
    ],
    alternates: {
      canonical: `/catalogue/${product.slug}`,
    },
    openGraph: {
      title: `${title} | BELSA Hydraulic & Pneumatic`,
      description,
      url: `https://belsa.id/catalogue/${product.slug}`,
      images: [imgUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | BELSA Hydraulic & Pneumatic`,
      description,
      images: [imgUrl],
    },
  };
}

export default async function CatalogueSlugPage({ params }: Props) {
  const { slug } = await params;
  const product = await findLiveProductBySlug(slug);
  const cleanSubId = product?.subTitle?.id?.replace(/\s*\([^)]*\)/g, '').trim() || '';
  const imgUrl = resolveOgImageUrl(product?.image);

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
              { '@type': 'ListItem', position: 2, name: 'Katalog Teknis', item: 'https://belsa.id/catalogue' },
              {
                '@type': 'ListItem',
                position: 3,
                name: `${product.series} (${cleanSubId})`,
                item: `https://belsa.id/catalogue/${product.slug}`,
              },
            ],
          },
          {
            '@type': 'Product',
            name: `BELSA ${product.series} - ${cleanSubId}`,
            sku: product.code,
            mpn: product.code,
            category: product.category,
            image: imgUrl,
            description: `${product.series} (${cleanSubId}). ${(product.features?.id || []).join(' ')}`,
            brand: {
              '@type': 'Brand',
              name: 'BELSA',
            },
            manufacturer: {
              '@type': 'Organization',
              name: 'PT. Rafitama Millenial Wahyudi',
              url: 'https://belsa.id',
            },
            url: `https://belsa.id/catalogue/${product.slug}`,
            offers: {
              '@type': 'Offer',
              url: `https://belsa.id/catalogue/${product.slug}`,
              priceCurrency: 'IDR',
              availability: 'https://schema.org/InStock',
              seller: {
                '@type': 'Organization',
                name: 'BELSA (PT. Rafitama Millenial Wahyudi)',
              },
            },
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CatalogueView initialSeriesSlug={slug} initialProduct={product} />
    </>
  );
}
