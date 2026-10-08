import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveFooterHref } from '@/lib/footer-navigation';

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
          href: resolveFooterHref(item.label, item.href),
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
