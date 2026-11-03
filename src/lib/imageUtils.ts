/**
 * Utility functions for product images and cloud storage formatting.
 */

export function formatProductImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '/images/prod_cylinder_clean.webp';
  const trimmed = url.trim();
  if (!trimmed) return '/images/prod_cylinder_clean.webp';

  // Check for Google Drive file link: /file/d/{ID}
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) {
    return `https://lh3.googleusercontent.com/d/${matchFile[1]}`;
  }

  // Check for Google Drive open/uc link: id={ID}
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
  }

  return trimmed;
}
