const galleryMarker = /<!--\s*HAB_GALLERY:\s*(\[[\s\S]*?\])\s*-->/;

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

export function packOutletGallery(note: string | null, images: string[]): string | null {
  const clean = cleanOutletGalleryMarker(note || '');
  const urls = images.slice(0, 24).map(url => url.trim());
  if (!urls.some(Boolean)) return clean || null;
  const marker = `<!-- HAB_GALLERY: ${JSON.stringify(urls)} -->`;
  return clean ? `${clean}\n${marker}` : marker;
}
