type CatalogVisibilityRecord = { code?: unknown; name?: unknown; status?: unknown };

/** Hide test fixtures from public product reads without altering their saved admin records. */
export function isPublicCatalogProduct(product: CatalogVisibilityRecord): boolean {
  const code = String(product.code || '').trim();
  const name = String(product.name || '').trim();
  return String(product.status || '').toUpperCase() === 'PUBLISHED'
    && !/^SKU-TEST-/i.test(code)
    && !/\bautomated\s+test\b/i.test(name);
}
