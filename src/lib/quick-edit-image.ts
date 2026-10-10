/** Prevent an old responsive candidate from overriding a newly saved image. */
export function applyQuickEditImage(
  image: { getAttribute(name: string): string | null; setAttribute(name: string, value: string): void; removeAttribute(name: string): void },
  src: string,
) {
  if (!src) return;
  if (image.getAttribute('srcset') !== null) image.removeAttribute('srcset');
  if (image.getAttribute('sizes') !== null) image.removeAttribute('sizes');
  if (image.getAttribute('src') !== src) image.setAttribute('src', src);
}

/** Keep same-site image overrides portable between local, staging, and production hosts. */
export function normalizeQuickEditImageSource(src: string, baseUrl: string): string {
  if (!src) return src;
  try {
    const base = new URL(baseUrl);
    const resolved = new URL(src, base);
    if (resolved.origin === base.origin) return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    // Preserve unusual but valid URLs for the normal server-side URL validation.
  }
  return src;
}
