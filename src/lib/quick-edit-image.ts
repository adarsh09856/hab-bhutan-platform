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
