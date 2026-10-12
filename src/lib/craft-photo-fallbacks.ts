const REFERENCE_CRAFT_PHOTOS: Readonly<Record<string, string>> = Object.freeze({
  dezo: '/assets/photos/hero-5-desho.jpg',
  jinzo: '/assets/photos/hero-3-clay.jpg',
  parzo: '/images/crafts/parzo.jpg',
  tshazo: '/images/crafts/tshazo.jpg',
  thagzo: '/images/crafts/thagzo.jpg',
});

const UNAVAILABLE_IMAGE = /(?:^|\/)image-unavailable\.svg(?:[?#].*)?$/i;

/** Prefer an explicitly saved Admin photo; otherwise use only reference-approved bundled photos. */
export function resolveCraftPhoto(craftKey: string, savedUrl?: string | null): string | null {
  const saved = typeof savedUrl === 'string' ? savedUrl.trim() : '';
  if (saved && !UNAVAILABLE_IMAGE.test(saved)) return saved;
  return REFERENCE_CRAFT_PHOTOS[craftKey] ?? null;
}
