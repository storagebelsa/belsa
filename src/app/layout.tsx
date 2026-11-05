import type { Metadata } from 'next';
import { Barlow } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import { LanguageProvider } from '@/context/LanguageContext';
import { RfqProvider } from '@/context/RfqContext';
import RfqDrawer from '@/components/RfqDrawer';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
  display: 'swap',
});

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belsa.id';
const siteUrl = rawSiteUrl.replace(/belsa\.co\.id/i, 'belsa.id').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BELSA - Produsen Silinder Hidrolik & Pneumatik Indonesia | PT. Rafitama Millenial Wahyudi',
    template: '%s | BELSA Hydraulic & Pneumatic'
  },
  description:
    'Manufaktur silinder hidrolik, silinder pneumatik standar ISO 15552 & custom, hydraulic power unit (HPU), selang hidrolik industri, dan process valve di Tangerang, Indonesia. Bersertifikat ISO 9001:2015.',
  keywords: [
    'silinder hidrolik',
    'pabrik silinder hidrolik indonesia',
    'hydraulic cylinder indonesia',
    'silinder pneumatik',
    'pneumatic cylinder iso 15552',
    'custom hydraulic cylinder tangerang',
    'belsa hydraulic pneumatic',
    'PT Rafitama Millenial Wahyudi',
    'selang hidrolik industri',
    'hydraulic hose assembly',
    'process valve industri',
    'hydraulic power pack'
  ],
  authors: [{ name: 'PT. Rafitama Millenial Wahyudi', url: siteUrl }],
  creator: 'BELSA Hydraulic & Pneumatic',
  publisher: 'PT. Rafitama Millenial Wahyudi',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    url: siteUrl,
    siteName: 'BELSA Hydraulic & Pneumatic',
    title: 'BELSA - Manufaktur Silinder Hidrolik & Pneumatik Indonesia',
    description:
      'Fabrikasi silinder hidrolik & pneumatik standar maupun custom, perakitan selang hidrolik bertekanan tinggi, dan penyediaan process valve industri. Bersertifikat ISO 9001:2015.',
    images: [
      {
        url: 'https://belsa.id/images/belsa_og_logo.png',
        width: 1200,
        height: 630,
        alt: 'BELSA Hydraulic and Pneumatic - PT. Rafitama Millenial Wahyudi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BELSA - Produsen Silinder Hidrolik & Pneumatik Indonesia',
    description:
      'Fabrikasi silinder hidrolik, silinder pneumatik, selang hidrolik, dan process valve di Tangerang. Bersertifikat ISO 9001:2015.',
    images: ['https://belsa.id/images/belsa_og_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/Favicon.webp',
    shortcut: '/images/Favicon.webp',
    apple: '/images/Favicon.webp',
  },
  verification: {
    google: 'fiEHPS8ETTJPlFnJ0BOi6gRsEGGivqPO6ipFGEQMPao',
  },
};

const jsonLdRoot = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'BELSA (PT. Rafitama Millenial Wahyudi)',
      alternateName: ['BELSA Hydraulic Pneumatic', 'PT. Rafitama Millenial Wahyudi'],
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo_clean.webp`,
        width: 400,
        height: 120,
      },
      image: `${siteUrl}/images/prod_cylinder_clean.webp`,
      description:
        'Produsen silinder hidrolik, silinder pneumatik, hydraulic power unit, selang hidrolik industri, dan process valve bersertifikat ISO 9001:2015 di Indonesia.',
      foundingDate: '2017',
      sameAs: [
        'https://rafitama.com',
        'https://www.instagram.com/nabelsakha/',
        'https://id.linkedin.com/company/rafitamawahyudi',
        'https://www.youtube.com/@nabelsakhagroup',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nabel Sakha Building, Jl. Scientia Garden T/07, Scientia Boulevard, Gading Serpong',
        addressLocality: 'Kab. Tangerang',
        addressRegion: 'Banten',
        postalCode: '15334',
        addressCountry: 'ID',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+62-811-1916-8752',
          contactType: 'sales & technical support',
          email: 'sales@belsa.id',
          areaServed: 'ID',
          availableLanguage: ['Indonesian', 'English'],
        },
      ],
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${siteUrl}/#localbusiness`,
      name: 'BELSA Hydraulic & Pneumatic - PT. Rafitama Millenial Wahyudi',
      image: `${siteUrl}/images/prod_cylinder_clean.webp`,
      url: siteUrl,
      telephone: '+62-811-1916-8752',
      email: 'sales@belsa.id',
      priceRange: '$$$',
      hasMap: 'https://www.google.com/maps/place/Nabel+Sakha+Building/@-6.2589089,106.6079929,17z',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -6.2589089,
        longitude: 106.6079929,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nabel Sakha Building, Jl. Scientia Garden T/07, Scientia Boulevard, Gading Serpong',
        addressLocality: 'Kab. Tangerang',
        addressRegion: 'Banten',
        postalCode: '15334',
        addressCountry: 'ID',
      },
      department: [
        {
          '@type': 'LocalBusiness',
          name: 'Workshop & Pabrik Fabrikasi BELSA (PT. Rafitama Millenial Wahyudi)',
          telephone: '+62-811-1916-8752',
          hasMap: 'https://maps.app.goo.gl/CPFtJNBygVUNbXiQ9',
          geo: {
            '@type': 'GeoCoordinates',
            latitude: -6.178381,
            longitude: 106.562861,
          },
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Kawasan Pergudangan Sunrise Bizpark, Jl. Raya Prabu Siliwangi Km 3,5, Pasar Kemis',
            addressLocality: 'Kab. Tangerang',
            addressRegion: 'Banten',
            postalCode: '15560',
            addressCountry: 'ID',
          },
        },
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:30',
          closes: '17:00',
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'BELSA Hydraulic & Pneumatic',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: ['id-ID', 'en-US'],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={barlow.variable}>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-KV0FKPNW9K"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KV0FKPNW9K', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var nf = document.querySelector('script[data-nf-variant]');
                  if (nf) nf.remove();
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRoot) }}
        />
      </head>
      <body className={barlow.className}>
        <div id="nl-badge-frame" style={{ display: 'none' }} aria-hidden="true" />
        <div id="nl-hud-frame" style={{ display: 'none' }} aria-hidden="true" />
        <LanguageProvider>
          <RfqProvider>
            <Header />
            {children}
            <Footer />
            <WhatsAppWidget />
            <RfqDrawer />
          </RfqProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
