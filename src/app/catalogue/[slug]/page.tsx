import { redirect } from 'next/navigation';

export default async function CatalogueSlugPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/catalogue?series=${encodeURIComponent(slug)}`);
}
