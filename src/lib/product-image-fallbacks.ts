type ProductImage = { url: string; role: string; [key: string]: unknown };

const KNOWN_PRODUCT_IMAGES: Record<string, string> = {
  lha01: '/assets/photos/product-lha01.jpg',
  sad03: '/assets/photos/product-sad03.jpg',
  tro04: '/assets/photos/product-tro04.jpg',
  ftb04: '/assets/photos/product-ftb04.jpg',
  dap02: '/assets/photos/product-dap02.jpg',
  mas01: '/assets/photos/product-mas01.jpg',
  dez01: '/assets/photos/product-dez01.jpg',
  cus02: '/assets/photos/product-cus02.jpg',
  hhb01: '/assets/photos/product-hhb01.jpg',
  hhb10: '/assets/photos/product-hhb10.jpg',
  lud01: '/assets/photos/product-lud01.jpg',
  cam01: '/assets/photos/product-cam01.jpg',
  kis02: '/assets/photos/product-kis02.jpg',
  pho03: '/assets/photos/product-pho03.jpg',
  dez07: '/assets/photos/product-dez07.jpg',
  tro09: '/assets/photos/product-tro09.jpg',
  par06: '/assets/photos/product-par06.jpg',
  lha08: '/assets/photos/product-lha08.jpg',
  tsh11: '/assets/photos/product-tsh11.jpg',
  gaki: '/assets/photos/product-gaki.jpg',
  gaki01: '/assets/photos/product-gaki.jpg',
};

const CRAFT_FALLBACKS: Record<string, string> = {
  thagzo: '/assets/photos/product-sad03.jpg',
  shagzo: '/assets/photos/product-dap02.jpg',
  troezo: '/assets/photos/product-tro04.jpg',
  tshazo: '/assets/photos/product-ftb04.jpg',
  lhazo: '/assets/photos/product-lha01.jpg',
  parzo: '/assets/photos/product-mas01.jpg',
  dezo: '/assets/photos/product-dez01.jpg',
  tshemzo: '/assets/photos/product-cus02.jpg',
  garzo: '/assets/photos/product-tro04.jpg',
  jinzo: '/assets/photos/hero-3-clay.jpg',
};

function isUnusableImageUrl(url: unknown): boolean {
  return typeof url !== 'string' || !url.trim() || /placeholder|parotaktshang/i.test(url);
}

export function normalizeProductImages(code: string, craftKey: string, rawImages: unknown) {
  const fallbackUrl = KNOWN_PRODUCT_IMAGES[code.toLowerCase()]
    || CRAFT_FALLBACKS[craftKey.toLowerCase()]
    || '/assets/photos/product-hhb01.jpg';
  const source = Array.isArray(rawImages) ? rawImages : [];
  const usable: ProductImage[] = source.flatMap((item: any) => {
    const record = typeof item === 'string' ? { url: item, role: 'primary' } : item;
    if (!record || isUnusableImageUrl(record.url)) return [];
    return [{ ...record, url: record.url.trim(), role: String(record.role || 'gallery') }];
  });
  const expectedProductImage = KNOWN_PRODUCT_IMAGES[code.toLowerCase()];
  const productPhotos = expectedProductImage
    ? usable.filter((image) => !/^\/assets\/photos\/product-[^/]+\.jpg$/i.test(image.url) || image.url === expectedProductImage)
    : usable;
  const primary = productPhotos.find((image) => image.role.toLowerCase() === 'primary') || productPhotos[0];
  const images = primary
    ? [
        { ...primary, role: 'primary' },
        ...productPhotos.filter((image) => image !== primary),
      ]
    : [{ url: fallbackUrl, role: 'primary' }];

  return { imageUrl: images[0].url, images };
}
