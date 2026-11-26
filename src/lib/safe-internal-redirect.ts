const REDIRECT_BASE = 'https://hab-internal.invalid';

/** Return a same-origin path only; reject protocol-relative and backslash URLs. */
export function safeInternalRedirect(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;

  try {
    const url = new URL(value, REDIRECT_BASE);
    if (url.origin !== REDIRECT_BASE) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
