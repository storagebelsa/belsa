import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belsa.co.id';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BELSA - Produsen Silinder Hidrolik & Pneumatik | PT. Rafitama Millenial Wahyudi',
    template: '%s | BELSA Hydraulic & Pneumatic'
  },
  description: 'Produsen silinder hidrolik, silinder pneumatik, power pack, selang hidrolik, dan process valve di Tangerang. Bersertifikat ISO 9001:2015.',
  keywords: [
    'silinder hidrolik',
    'hydraulic cylinder indonesia',
    'silinder pneumatik',
    'pneumatic cylinder',
    'belsa hydraulic',
    'PT Rafitama Millenial Wahyudi',
    'selang hidrolik',
    'process valve',
    'custom cylinder'
  ],
  authors: [{ name: 'PT. Rafitama Millenial Wahyudi', url: siteUrl }],
  creator: 'BELSA Hydraulic Pneumatic',
  publisher: 'PT. Rafitama Millenial Wahyudi',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteUrl,
    siteName: 'BELSA Fluid Power Solutions',
    title: 'BELSA - Hydraulic and Pneumatic Cylinder Manufacturer',
    description: 'Fabrikasi silinder hidrolik dan pneumatik, perakitan selang hidrolik, dan process valve. Bersertifikat ISO 9001:2015.',
    images: [
      {
        url: '/images/prod_cylinder_clean.webp',
        width: 1200,
        height: 630,
        alt: 'BELSA Hydraulic and Pneumatic Cylinder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BELSA - Hydraulic & Pneumatic Cylinder Manufacturer',
    description: 'Silinder hidrolik, silinder pneumatik, selang hidrolik, dan process valve dari Tangerang.',
    images: ['/images/prod_cylinder_clean.webp'],
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
};

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BELSA (PT. Rafitama Millenial Wahyudi)',
  url: siteUrl,
  logo: `${siteUrl}/images/Favicon.webp`,
  description: 'Produsen silinder hidrolik, silinder pneumatik, power pack, selang hidrolik, dan process valve di Indonesia.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jl. Scientia Garden T/07, Scientia Boulevard, Gading Serpong',
    addressLocality: 'Kab. Tangerang',
    addressRegion: 'Banten',
    postalCode: '15334',
    addressCountry: 'ID'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-811-1916-8752',
    contactType: 'sales & technical support',
    areaServed: 'ID',
    availableLanguage: ['Indonesian', 'English']
  }
};

import { LanguageProvider } from '@/context/LanguageContext';
import { RfqProvider } from '@/context/RfqContext';
import RfqDrawer from '@/components/RfqDrawer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body>
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
