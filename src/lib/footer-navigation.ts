/** Resolve legacy CMS footer URLs to the route promised by each standard label. */
export function resolveFooterHref(label: string, href: string): string {
  const text = (label || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const path = (href || '').trim().toLowerCase();

  if (text.includes('about hab') || text === 'about us') return '/about';
  if (text.includes('mandate') || text.includes('aoa')) return '/mandate';
  if (text.includes('ethic')) return '/code-of-ethics';
  if (text.includes('strategic')) return '/strategic-plan';
  if (text.includes('board') || text.includes('trustee')) return '/board-of-trustees';
  if (text.includes('secretariat')) return '/secretariat';
  if (text.includes('programme')) return '/programmes';
  if (text.includes('project')) return '/projects';
  if (text.includes('apply to join')) return '/membership/apply';
  if (text.includes('membership')) return '/membership';
  if (text.includes('news') || text.includes('event')) return '/news';
  if (text === 'contact us' || text === 'contact' || text === 'contact hab') return '/contact';
  if (text.includes('wholesale') || text.includes('bulk order')) return '/wholesale';
  if (text.includes('e-shop') || text === 'shop' || text.includes('product')) return '/shop';
  if (text.includes('shipping') || text.includes('delivery')) return '/shipping-policy';
  if (text.includes('return') || text.includes('refund')) return '/returns-policy';
  if (text.includes('custom') || text.includes('dut')) return '/customs-policy';
  if (text.includes('track') && text.includes('order')) return '/track-order';
  if (text.includes('directory') || text === 'members') return '/members';
  if (text.includes('annual report')) return '/annual-reports';
  if (text.includes('audited account')) return '/audited-accounts';
  if (text.includes('publication') || text.includes('download') || text.includes('report')) return '/publications';
  if (text.includes('cluster') || text.includes('outlet') || text.includes('member shop')) return '/outlets';
  if (text.includes('member login')) return '/login';
  if (text.includes('tender') || text.includes('vacanc')) return '/tenders';
  if (text.includes('privacy')) return '/privacy';
  if (text.includes('term')) return '/terms';
  if (text === 'donate' || text.includes('donation')) return '/donate';

  if (path.startsWith('/shipping-policy#returns')) return '/returns-policy';
  if (path.startsWith('/shipping-policy#duty')) return '/customs-policy';
  if (path.startsWith('/about#mandate')) return '/mandate';
  if (path.startsWith('/about#ethics')) return '/code-of-ethics';
  if (path.startsWith('/about#board') || path.startsWith('/about#governance')) return '/board-of-trustees';
  if (path.startsWith('/about#secretariat') || path.startsWith('/about#contact')) return '/secretariat';
  if (path.startsWith('/about#support')) return '/shipping-policy';
  return href;
}
