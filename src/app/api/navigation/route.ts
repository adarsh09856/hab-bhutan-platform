import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_HEADER_LINKS = [
  { id: 'h-1', label: 'About Us', href: '/about', parent: null, sortOrder: 1, isActive: true },
  { id: 'h-2', label: 'Programmes', href: '/programmes', parent: null, sortOrder: 2, isActive: true },
  { id: 'h-3', label: 'Projects', href: '/projects', parent: null, sortOrder: 3, isActive: true },
  { id: 'h-4', label: 'News & Events', href: '/news', parent: null, sortOrder: 4, isActive: true },
  { id: 'h-5', label: 'Directory by category', href: '/members', parent: 'members', sortOrder: 5, isActive: true },
  { id: 'h-6', label: 'Publications & downloads', href: '/publications', parent: 'members', sortOrder: 6, isActive: true },
  { id: 'h-7', label: 'Member shops & outlets', href: '/shop', parent: 'members', sortOrder: 7, isActive: true },
];

const DEFAULT_FOOTER_COLUMNS = [
  { id: 'f-1', column: 'Association', label: 'About HAB', href: '/about', sortOrder: 1, isActive: true },
  { id: 'f-2', column: 'Association', label: 'Programmes', href: '/programmes', sortOrder: 2, isActive: true },
  { id: 'f-3', column: 'Association', label: 'Projects', href: '/projects', sortOrder: 3, isActive: true },
  { id: 'f-4', column: 'Association', label: 'Membership', href: '/membership', sortOrder: 4, isActive: true },
  { id: 'f-5', column: 'Association', label: 'News & events', href: '/news', sortOrder: 5, isActive: true },
  { id: 'f-6', column: 'Association', label: 'Contact us', href: '/contact', sortOrder: 6, isActive: true },

  { id: 'f-7', column: 'Shop & support', label: 'E-shop', href: '/shop', sortOrder: 1, isActive: true },
  { id: 'f-8', column: 'Shop & support', label: 'Wholesale & bulk orders', href: '/wholesale', sortOrder: 2, isActive: true },
  { id: 'f-9', column: 'Shop & support', label: 'Shipping & delivery', href: '/shipping-policy', sortOrder: 3, isActive: true },
  { id: 'f-10', column: 'Shop & support', label: 'Returns', href: '/returns-policy', sortOrder: 4, isActive: true },
  { id: 'f-11', column: 'Shop & support', label: 'Track your order', href: '/track-order', sortOrder: 5, isActive: true },
  { id: 'f-12', column: 'Shop & support', label: 'Duty & customs', href: '/customs-policy', sortOrder: 6, isActive: true },

  { id: 'f-13', column: 'Members', label: 'Directory by category', href: '/members', sortOrder: 1, isActive: true },
  { id: 'f-14', column: 'Members', label: 'Publications', href: '/publications', sortOrder: 2, isActive: true },
  { id: 'f-15', column: 'Members', label: 'Member shops & clusters', href: '/outlets', sortOrder: 3, isActive: true },
  { id: 'f-16', column: 'Members', label: 'Member login', href: '/login', sortOrder: 4, isActive: true },
  { id: 'f-17', column: 'Members', label: 'Apply to join', href: '/register', sortOrder: 5, isActive: true },

  { id: 'f-18', column: 'Governance', label: 'Board of Trustees', href: '/board-of-trustees', sortOrder: 1, isActive: true },
  { id: 'f-19', column: 'Governance', label: 'Secretariat', href: '/secretariat', sortOrder: 2, isActive: true },
  { id: 'f-20', column: 'Governance', label: 'Annual reports', href: '/annual-reports', sortOrder: 3, isActive: true },
  { id: 'f-21', column: 'Governance', label: 'Audited accounts', href: '/audited-accounts', sortOrder: 4, isActive: true },
  { id: 'f-22', column: 'Governance', label: 'Tenders & vacancies', href: '/tenders', sortOrder: 5, isActive: true },
  { id: 'f-23', column: 'Governance', label: 'Terms of service', href: '/terms', sortOrder: 6, isActive: true },
  { id: 'f-24', column: 'Governance', label: 'Privacy policy', href: '/privacy', sortOrder: 7, isActive: true },
];

function sanitizeHref(label: string, href: string): string {
  const l = (label || '').toLowerCase();
  const h = (href || '').toLowerCase();

  // Older footer entries were saved with /about as a generic placeholder.
  // Resolve those entries by their visible label so they open their own page.
  if (h === '/about' || h.startsWith('/about#')) {
    if (l.includes('mandate') || l.includes('aoa')) return '/mandate';
    if (l.includes('ethic')) return '/code-of-ethics';
    if (l.includes('strategic')) return '/strategic-plan';
    if (l.includes('board') || l.includes('trustee')) return '/board-of-trustees';
    if (l.includes('secretariat')) return '/secretariat';
    if (l.includes('programme')) return '/programmes';
    if (l.includes('project')) return '/projects';
    if (l.includes('apply to join')) return '/membership/apply';
    if (l.includes('membership')) return '/membership';
    if (l.includes('news') || l.includes('event')) return '/news';
    if (l.includes('contact')) return '/contact';
    if (l.includes('wholesale') || l.includes('bulk order')) return '/wholesale';
    if (l.includes('shop') || l.includes('product')) return '/shop';
    if (l.includes('shipping') || l.includes('delivery')) return '/shipping-policy';
    if (l.includes('return') || l.includes('refund')) return '/returns-policy';
    if (l.includes('custom') || l.includes('dut')) return '/customs-policy';
    if (l.includes('track') && l.includes('order')) return '/track-order';
    if (l.includes('directory') || l.trim() === 'members') return '/members';
    if (l.includes('publication') || l.includes('download')) return '/publications';
    if (l.includes('cluster') || l.includes('outlet')) return '/outlets';
    if (l.includes('login')) return '/login';
    if (l.includes('annual report')) return '/annual-reports';
    if (l.includes('audited account')) return '/audited-accounts';
    if (l.includes('tender') || l.includes('vacanc')) return '/tenders';
    if (l.includes('privacy')) return '/privacy';
    if (l.includes('term')) return '/terms';
  }

  // Mandate & AoA
  if (l.includes('mandate') || l.includes('aoa') || h.includes('#mandate')) return '/mandate';

  // Ethics
  if (l.includes('ethic') || h.includes('#ethics')) return '/code-of-ethics';

  // Strategic plan
  if (l.includes('strategic') || h.includes('strategic')) return '/strategic-plan';

  // Secretariat / Contact secretariat
  if (l.includes('contact secretariat') || l === 'secretariat' || h.includes('#secretariat') || h.includes('#contact')) return '/secretariat';

  // Board
  if (h.includes('#board') || l.includes('board of trustees') || l === 'board' || h.includes('#governance')) return '/board-of-trustees';

  // Shipping & delivery
  if ((l.includes('shipping') || l.includes('delivery')) && !l.includes('return')) return '/shipping-policy';

  // Returns & refunds
  if (h.includes('#returns') || l.includes('return') || l.includes('refund') || (h.includes('#support') && l.includes('return'))) return '/returns-policy';

  // Duties & customs
  if (h.includes('#duty') || l.includes('duty') || l.includes('custom') || (h.includes('#support') && (l.includes('duty') || l.includes('custom')))) return '/customs-policy';

  // Annual reports & audited accounts
  if (h.includes('kind=annual') || l.includes('annual report')) return '/annual-reports';
  if (h.includes('kind=audited') || l.includes('audited account')) return '/audited-accounts';

  // Direct checks on legacy /about#... links
  if (h.startsWith('/about#')) {
    if (h.includes('mandate')) return '/mandate';
    if (h.includes('ethics')) return '/code-of-ethics';
    if (h.includes('contact')) return '/secretariat';
    if (h.includes('support')) {
      if (l.includes('return')) return '/returns-policy';
      if (l.includes('custom') || l.includes('dut')) return '/customs-policy';
      return '/shipping-policy';
    }
    if (h.includes('governance')) return '/board-of-trustees';
    return '/about';
  }

  return href;
}

export async function GET() {
  try {
    const items = await prisma.navigationItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const customHeader = items.filter((i) => i.menuType === 'HEADER');
    const header: any[] = customHeader;

    const footerItems = items.filter((i) => i.menuType === 'FOOTER');
    const footer: Record<string, any[]> = {};
    footerItems.forEach((item) => {
        const col = item.column || 'General';
        if (!footer[col]) footer[col] = [];
        footer[col].push({
          ...item,
          href: sanitizeHref(item.label, item.href),
        });
    });

    const res = NextResponse.json({
      success: true,
      header,
      footer,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Navigation is temporarily unavailable.' }, { status: 503 });
  }
}
