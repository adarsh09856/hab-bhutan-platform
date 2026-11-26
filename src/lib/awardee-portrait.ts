/** Inherited site illustrations do not identify the awardee. */
export function awardeePortrait(value?: string | null): string {
  const url = value?.trim() || '';
  return /\/assets\/photos\/(?:hero-[^/]+|about-hab\.jpg)(?:[?#].*)?$/i.test(url) ? '' : url;
}
