// Existing reference photographs used by the public site before the media
// fallback regression. Saved uploads always take precedence at call sites.
export const outletImages: Record<string, string> = {
  'punakha-market': '/images/outlets/punakha.jpg',
  'thimphu-outlet': '/images/outlets/thimphu.jpg',
  'paro-airport': '/images/outlets/paro.jpg',
  'bumthang-outlet': '/images/outlets/bumthang.jpg',
};

export const clusterImages: Record<string, string> = {
  khoma: '/assets/photos/hero-1-weaving.jpg',
  kheng: '/assets/photos/hero-4-textiles.jpg',
  trashiyangtse: '/assets/photos/hero-5-desho.jpg',
  chumey: '/assets/photos/hero-3-clay.jpg',
  jungshi: '/assets/photos/hero-2-punakha.jpg',
  'zorig-thimphu': '/assets/photos/about-hab.jpg',
};

const newsImages: Record<string, string> = {
  'trade-facilitation-desk-autumn': '/images/programs/trade.jpg',
  'natural-dye-training-lhuentse': '/images/programs/dye_training.jpg',
  'craft-bazaar-clock-tower': '/assets/photos/hero-2-punakha.jpg',
  'annual-report-2025': '/assets/photos/hero-5-desho.jpg',
  'product-innovation-lab': '/images/programs/design_lab.jpg',
};

export function referenceNewsImage(slug: string = ''): string | undefined {
  return newsImages[slug];
}
