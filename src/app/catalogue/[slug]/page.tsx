import type { Metadata } from 'next';
import { BELSA_CATALOGUE_FULL, BelsaProductSeries } from '@/data/belsaCatalogueFull';
import { formatProductImageUrl } from '@/lib/imageUtils';
import { CatalogueView } from '../page';

interface Props {
  params: Promise<{ slug: string }>;
}

const DELETED_SERIES_IDS = new Set([
  'diverter_valve', 'bsp', 'cl_series', 'npp-nhpu', 'bhreb_20es_1',
  'd_nipple', 'double_nipple', 'fitting', 'r1at', 'r2at', 'rejseries',
  'bwe_series', 'tubing', 'rotary', 'bzw'
]);

function findProductBySlug(slug: string): BelsaProductSeries | undefined {
  const s = decodeURIComponent(slug).toLowerCase().trim();
  return BELSA_CATALOGUE_FULL.find(
    (item) =>
      !DELETED_SERIES_IDS.has(item.id) &&
      (item.slug?.toLowerCase() === s ||
        item.id.toLowerCase() === s ||
        item.code.toLowerCase() === s ||
        item.series.toLowerCase() === s)
  );
}

export async function generateStaticParams() {
  return BELSA_CATALOGUE_FULL.filter(
    (item) => !DELETED_SERIES_IDS.has(item.id) && Boolean(item.slug)
  ).map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);

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
  const formattedImg = formatProductImageUrl(product.image);
  const imgUrl = formattedImg.startsWith('/') ? `https://belsa.id${formattedImg}` : formattedImg;

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
  };
}

export default async function CatalogueSlugPage({ params }: Props) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  const cleanSubId = product?.subTitle?.id?.replace(/\s*\([^)]*\)/g, '').trim() || '';
  const formattedImg = formatProductImageUrl(product?.image);
  const imgUrl = formattedImg.startsWith('/')
    ? `https://belsa.id${formattedImg}`
    : formattedImg;

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
