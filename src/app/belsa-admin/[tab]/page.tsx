import BelsaAdminPage from '../page';

export async function generateStaticParams() {
  return [
    { tab: 'daftar-produk' },
    { tab: 'tambah-produk' },
    { tab: 'edit-produk' },
    { tab: 'kelola-artikel' },
    { tab: 'products' },
    { tab: 'editor' },
    { tab: 'edit' },
    { tab: 'articles' },
    { tab: 'artikel' }
  ];
}

export default function AdminTabPage() {
  return <BelsaAdminPage />;
}
