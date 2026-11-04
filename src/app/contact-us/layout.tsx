import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hubungi Kami - Konsultasi Teknis & Permintaan Penawaran (RFQ) Silinder Hidrolik',
  description:
    'Hubungi tim sales engineer PT. Rafitama Millenial Wahyudi (BELSA) di Kelapa Dua, Tangerang untuk konsultasi desain silinder custom, perbaikan (repair), maupun permintaan penawaran harga.',
  keywords: [
    'kontak belsa hydraulic',
    'alamat PT Rafitama Millenial Wahyudi',
    'sales silinder hidrolik tangerang',
    'pesan custom silinder hidrolik',
    'nomor telepon belsa'
  ],
  alternates: {
    canonical: '/contact-us',
  },
  openGraph: {
    title: 'Hubungi Tim Sales & Engineering BELSA | PT. Rafitama Millenial Wahyudi',
    description:
      'Kirim spesifikasi, drawing, atau kebutuhan silinder hidrolik & pneumatik Anda. Kantor & Workshop di Tangerang, Banten.',
    url: 'https://belsa.id/contact-us',
    images: ['/images/prod_cylinder_clean.webp'],
  },
};

const jsonLdContact = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://belsa.id' },
        { '@type': 'ListItem', position: 2, name: 'Kontak Kami', item: 'https://belsa.id/contact-us' },
      ],
    },
    {
      '@type': 'ContactPage',
      name: 'Hubungi BELSA (PT. Rafitama Millenial Wahyudi)',
      url: 'https://belsa.id/contact-us',
      description: 'Halaman kontak resmi, lokasi kantor & workshop, serta formulir konsultasi teknis BELSA.',
    },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdContact) }}
      />
      {children}
    </>
  );
}
