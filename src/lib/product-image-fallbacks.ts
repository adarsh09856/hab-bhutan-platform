type ProductImage = { url: string; role: string; [key: string]: unknown };

const KNOWN_PRODUCT_IMAGES: Record<string, string> = {
  // These bundled photographs have been visually checked against their SKUs.
  // For other bundled names, a filename match alone is not reliable proof.
  sad03: '/assets/photos/product-sad03.jpg',
  ftb04: '/assets/photos/product-ftb04.jpg',
  mas01: '/assets/photos/product-mas01.jpg',
  hhb01: '/assets/photos/product-hhb01.jpg',
  cam01: '/assets/photos/product-cam01.jpg',
  gaki: '/assets/photos/product-gaki.jpg',
  gaki01: '/assets/photos/product-gaki.jpg',
};

// These files exist and return HTTP 200, but visual review confirms that the
// bundled image depicts a different item (or is generic stock photography).
// Keep the files untouched; do not present them as evidence for these SKUs.
// Genuine product uploads and other non-bundled image URLs remain eligible.
const KNOWN_MISMATCHED_IMAGES = new Set([
  '/assets/photos/product-cus02.jpg', // generic unadorned pillow, not the appliqué cover
  '/assets/photos/product-dap02.jpg', // unrelated living-room interior
  '/assets/photos/product-dez01.jpg', // paper texture only, not the paper set
  '/assets/photos/product-dez07.jpg', // same paper texture, not the notebook
  '/assets/photos/product-hhb10.jpg', // branded retail handbag, not HAB's product
  '/assets/photos/product-kis02.jpg', // unrelated person holding a folder
  '/assets/photos/product-lha01.jpg', // unrelated European painter
  '/assets/photos/product-lha08.jpg', // same unrelated European painter
  '/assets/photos/product-lud01.jpg', // unrelated handheld bag, not laundry basket
  '/assets/photos/product-par06.jpg', // ritual mask, not slate relief
  '/assets/photos/product-pho03.jpg', // unrelated living-room interior
  '/assets/photos/product-tro04.jpg', // same generic earrings as TRO09, not brooch
  '/assets/photos/product-tro09.jpg', // generic earrings, not a Bhutanese betel box
  '/assets/photos/product-tsh11.jpg', // same basket as FTB04, not a floor mat
]);

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
  const matchingProductImage = `/assets/photos/product-${code.toLowerCase()}.jpg`;
  const productPhotos = usable.filter((image) =>
    !/^\/assets\/photos\/product-[^/]+\.jpg$/i.test(image.url)
    || image.url.toLowerCase() === matchingProductImage && !KNOWN_MISMATCHED_IMAGES.has(image.url.toLowerCase())
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
