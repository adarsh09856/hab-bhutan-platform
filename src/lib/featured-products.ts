export interface CodedProduct {
  code: string;
}

/** Resolve the homepage's saved manual product order without falling back to
 * automatic products when a saved SKU is no longer public. */
export function selectFeaturedProducts<T extends CodedProduct>(
  codes: unknown,
  products: T[],
  limit = 8,
): { manual: boolean; products: T[] } {
  const selectedCodes = Array.isArray(codes)
    ? [...new Set(codes.filter((code): code is string => typeof code === 'string' && code.trim().length > 0).map((code) => code.trim()))].slice(0, limit)
    : [];
  if (selectedCodes.length === 0) return { manual: false, products: [] };

  const byCode = new Map(products.map((product) => [product.code, product]));
  return {
    manual: true,
    products: selectedCodes.map((code) => byCode.get(code)).filter((product): product is T => Boolean(product)),
  };
}
