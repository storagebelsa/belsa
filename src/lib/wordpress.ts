export const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://belsa.id';

export async function fetchWordPressPage(slug: string) {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/pages?slug=${slug}`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds (ISR)
    });
    if (!res.ok) return null;
    const pages = await res.json();
    return pages.length > 0 ? pages[0] : null;
  } catch (error) {
    console.error(`Failed to fetch WP page for slug: ${slug}`, error);
    return null;
  }
}
