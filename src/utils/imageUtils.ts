/**
 * Helper to process image URLs safely.
 * Returns the image URL directly. The app's <img> tags use referrerPolicy="no-referrer"
 * to allow direct loading of external image hosts like PostImage.
 */
export function getOptimizedImageUrl(url?: string): string {
  if (!url) return '';
  return url.trim();
}
