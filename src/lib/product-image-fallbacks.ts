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
  pho03: '/assets/photos/product-pho03.jpg',
  dez07: '/assets/photos/product-dez07.jpg',
  tro09: '/assets/photos/product-tro09.jpg',
  par06: '/assets/photos/product-par06.jpg',
  lha08: '/assets/photos/product-lha08.jpg',
  tsh11: '/assets/photos/product-tsh11.jpg',
  gaki: '/assets/photos/product-gaki.jpg',
  gaki01: '/assets/photos/product-gaki.jpg',
};

// This bundled file depicts an unrelated person with a folder, not the
// Kisuthara textile. Keep it on disk for review, but never present it as
// product evidence. A genuine image uploaded in Admin remains eligible.
const KNOWN_MISMATCHED_IMAGES = new Set(['/assets/photos/product-kis02.jpg']);

function isUnusableImageUrl(url: unknown): boolean {
  return typeof url !== 'string' || !url.trim() || /placeholder|parotaktshang/i.test(url)
    || KNOWN_MISMATCHED_IMAGES.has(url.trim().toLowerCase());
}

export function normalizeProductImages(code: string, craftKey: string, rawImages: unknown) {
  const source = Array.isArray(rawImages) ? rawImages : [];
  // An intentionally empty image list must stay empty of product photography:
  // deleting a photo in Admin should not resurrect a bundled legacy image.
  const fallbackUrl = source.length > 0
    ? KNOWN_PRODUCT_IMAGES[code.toLowerCase()] || '/assets/photos/image-unavailable.svg'
    : '/assets/photos/image-unavailable.svg';
  const usable: ProductImage[] = source.flatMap((item: any) => {
    const record = typeof item === 'string' ? { url: item, role: 'primary' } : item;
    if (!record || isUnusableImageUrl(record.url)) return [];
    return [{ ...record, url: record.url.trim(), role: String(record.role || 'gallery') }];
  });
  const expectedProductImage = KNOWN_PRODUCT_IMAGES[code.toLowerCase()];
  const productPhotos = usable.filter((image) =>
    !/^\/assets\/photos\/product-[^/]+\.jpg$/i.test(image.url)
    || Boolean(expectedProductImage && image.url === expectedProductImage)
  );
  const primary = productPhotos.find((image) => image.role.toLowerCase() === 'primary') || productPhotos[0];
  const images = primary
    ? [
        { ...primary, role: 'primary' },
        ...productPhotos.filter((image) => image !== primary),
      ]
    : [{ url: fallbackUrl, role: 'primary' }];

  return { imageUrl: images[0].url, images };
}
