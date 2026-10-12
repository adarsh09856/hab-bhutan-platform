const galleryMarker = /<!--\s*HAB_GALLERY:\s*(\[[\s\S]*?\])\s*-->/;

export const PUNAKHA_REFERENCE_GALLERY = [
  '/assets/photos/hero-4-textiles.jpg',
  '/assets/photos/hero-1-weaving.jpg',
  '/assets/photos/hero-5-desho.jpg',
];

export function hasOutletGalleryMarker(note: string | null | undefined): boolean {
  return galleryMarker.test(note || '');
}

export function displayOutletGallery(key: string | undefined, savedImages: string[], configured = false): string[] {
  return key === 'punakha-market' && !configured && savedImages.length === 0
    ? [...PUNAKHA_REFERENCE_GALLERY]
    : savedImages;
}

export function readOutletGallery(note: string | null | undefined): string[] {
  const match = note?.match(galleryMarker);
  if (!match) return [];
  try {
    const urls = JSON.parse(match[1]);
    return Array.isArray(urls) ? urls.slice(0, 24).map(url =>
      typeof url === 'string' && (/^\/[^/]/.test(url) || /^https:\/\//.test(url)) ? url : '') : [];
  } catch {
    return [];
  }
}

export function cleanOutletGalleryMarker(note: string): string {
  return note.replace(galleryMarker, '').trim();
}

export function packOutletGallery(note: string | null, images: string[], configured = true): string | null {
  const clean = cleanOutletGalleryMarker(note || '');
  const urls = images.slice(0, 24).map(url => url.trim());
  if (!configured) return clean || null;
  const marker = `<!-- HAB_GALLERY: ${JSON.stringify(urls)} -->`;
  return clean ? `${clean}\n${marker}` : marker;
}
