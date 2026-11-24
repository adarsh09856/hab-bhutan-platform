/** Canonical public product URL. Legacy HAB SKUs may contain `/`. */
export function productHref(code: string): string {
  return `/product/${encodeURIComponent(code.trim())}`;
}

export function shopCraftHref(craftKey: string): string {
  return `/shop/${encodeURIComponent(craftKey.trim())}`;
}
