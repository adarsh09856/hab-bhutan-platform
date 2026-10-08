/** Repair only known legacy footer destinations; otherwise the saved Admin URL is authoritative. */
export function resolveFooterHref(label: string, href: string): string {
  const text = (label || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const path = (href || '').trim().toLowerCase();

  const canonicalByLabel = [
    [/about hab|^about us$/, '/about'], [/mandate|aoa/, '/mandate'], [/ethic/, '/code-of-ethics'],
    [/strategic/, '/strategic-plan'], [/board|trustee/, '/board-of-trustees'], [/secretariat/, '/secretariat'],
    [/programme/, '/programmes'], [/project/, '/projects'], [/apply to join/, '/membership/apply'],
    [/membership/, '/membership'], [/news|event/, '/news'], [/^contact us$|^contact$|^contact hab$/, '/contact'],
    [/wholesale|bulk order/, '/wholesale'], [/e-shop|^shop$|product/, '/shop'],
    [/shipping|delivery/, '/shipping-policy'], [/return|refund/, '/returns-policy'], [/custom|dut/, '/customs-policy'],
    [/track.*order/, '/track-order'], [/directory|^members$/, '/members'], [/annual report/, '/annual-reports'],
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
