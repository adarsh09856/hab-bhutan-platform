/** Repair only known legacy footer destinations; otherwise the saved Admin URL is authoritative. */
export function resolveFooterHref(label: string, href: string): string {
  const text = (label || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const path = (href || '').trim().toLowerCase();

  if (/^\/membership#login(?:\/)?$/i.test(path)) return '/login';
  if (/^\/members(?:[/?#]|$)/i.test(path)) return '/traders';
  // Trader-specific links can point to an enquiry or a dedicated account flow.
  if (/\btrader\b/.test(text) && /\b(?:apply|application|register|login|sign in)\b/.test(text)) return href;
  if (/^(?:apply(?: to join(?: hab)?| for (?:membership|a trader|trader accreditation))?|register(?: as (?:a )?(?:member|cluster|trader))?|become a member|trader application)$/.test(text)) {
    const query = /^\/membership\/apply(?:\/)?(?:\?|$)/i.test(path) && href.includes('?')
      ? href.slice(href.indexOf('?'))
      : '';
    return `/membership/apply${query}`;
  }
  if (/^(?:member|trader)?\s*login$/.test(text) || /^sign in(?: to (?:your )?(?:member|trader) account)?$/.test(text)) return '/login';
  if (/^(?:directory by category|find a member|members directory)$/.test(text)) return '/traders';

  const canonicalByLabel = [
    [/about hab|^about us$/, '/about'], [/mandate|aoa/, '/mandate'], [/ethic/, '/code-of-ethics'],
    [/strategic/, '/strategic-plan'], [/board|trustee/, '/board-of-trustees'], [/secretariat/, '/secretariat'],
    [/programme/, '/programmes'], [/project/, '/projects'], [/apply to join/, '/membership/apply'],
    [/membership/, '/membership'], [/news|event/, '/news'], [/^contact us$|^contact$|^contact hab$/, '/contact'],
    [/wholesale|bulk order/, '/wholesale'], [/e-shop|^shop$|product/, '/shop'],
    [/shipping|delivery/, '/shipping-policy'], [/return|refund/, '/returns-policy'], [/custom|dut/, '/customs-policy'],
    [/track.*order/, '/track-order'], [/directory|^members$/, '/traders'], [/annual report/, '/annual-reports'],
    [/audited account/, '/audited-accounts'], [/publication|download|report/, '/publications'],
    [/cluster|outlet|member shop/, '/outlets'], [/member login/, '/login'], [/tender|vacanc/, '/tenders'],
    [/privacy/, '/privacy'], [/term/, '/terms'], [/^donate$|donation/, '/donate'],
  ] as const;
  const canonical = canonicalByLabel.find(([pattern]) => pattern.test(text))?.[1];
  if (!canonical || path === canonical) return href;

  const legacyTargets: Record<string, string[]> = {
    '/mandate': ['/about#mandate'],
    '/code-of-ethics': ['/about#ethics'],
    '/strategic-plan': ['/publications'],
    '/board-of-trustees': ['/about#board', '/about#governance'],
    '/secretariat': ['/about#secretariat', '/about#contact', '/about#governance'],
    '/projects': ['/about'],
    '/annual-reports': ['/publications'],
    '/audited-accounts': ['/publications'],
    '/tenders': ['/news'],
    '/shipping-policy': ['/about#support'],
    '/returns-policy': ['/about#support', '/shipping-policy#returns'],
    '/customs-policy': ['/about#support', '/shipping-policy#duty'],
    '/outlets': ['/shop'],
  };
  return legacyTargets[canonical]?.includes(path) ? canonical : href;
}
