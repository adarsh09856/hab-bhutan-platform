export const HERO_PHOTOS = [
  '/assets/photos/hero-1-weaving.jpg',
  '/assets/photos/hero-2-punakha.jpg',
  '/assets/photos/hero-3-clay.jpg',
  '/assets/photos/hero-4-textiles.jpg',
  '/assets/photos/hero-5-desho.jpg',
] as const;

export function fallbackHeroPhoto(index: number) {
  return HERO_PHOTOS[((index % HERO_PHOTOS.length) + HERO_PHOTOS.length) % HERO_PHOTOS.length];
}
