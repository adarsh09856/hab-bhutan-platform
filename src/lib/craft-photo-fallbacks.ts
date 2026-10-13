const REFERENCE_CRAFT_PHOTOS: Readonly<Record<string, string>> = Object.freeze({
  shingzo: '/images/crafts/shingzo.jpg',
  dozo: '/images/crafts/dozo.jpg',
  lhazo: '/assets/photos/product-lha01.jpg',
  lugzo: '/images/crafts/lugzo.jpg',
  garzo: '/images/crafts/garzo.jpg',
  troezo: '/images/crafts/troezo.jpg',
  tshemzo: '/assets/photos/product-cus02.jpg',
  shagzo: '/assets/photos/product-dap02.jpg',
  dezo: '/assets/photos/hero-5-desho.jpg',
  jinzo: '/assets/photos/hero-3-clay.jpg',
  parzo: '/images/crafts/parzo.jpg',
  tshazo: '/images/crafts/tshazo.jpg',
  thagzo: '/images/crafts/thagzo.jpg',
});

const UNAVAILABLE_IMAGE = /(?:^|\/)image-unavailable\.svg(?:[?#].*)?$/i;

/** Preserve the supplied design assets when no Admin photo has been saved. */
export function resolveCraftPhoto(craftKey: string, savedUrl?: string | null): string | null {
  const saved = typeof savedUrl === 'string' ? savedUrl.trim() : '';
  if (saved && !UNAVAILABLE_IMAGE.test(saved)) return saved;
  return REFERENCE_CRAFT_PHOTOS[craftKey] ?? null;
}
