/** Prefer the saved product slug while retaining a URL for legacy records. */
export function productHref(code: string, slug?: string | null): string {
  return `/product/${encodeURIComponent(slug?.trim() || code.trim())}`;
}

export function shopCraftHref(craftKey: string): string {
  return `/shop/${encodeURIComponent(craftKey.trim())}`;
}
