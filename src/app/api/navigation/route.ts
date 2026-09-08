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
  { id: 'f-1', column: 'Organization', label: 'About HAB', href: '/about', sortOrder: 1, isActive: true },
  { id: 'f-2', column: 'Organization', label: 'Our Mandate & AoA', href: '/about#mandate', sortOrder: 2, isActive: true },
  { id: 'f-3', column: 'Organization', label: 'Code of Ethics', href: '/about#ethics', sortOrder: 3, isActive: true },
  { id: 'f-4', column: 'Organization', label: 'Strategic Plan', href: '/publications', sortOrder: 4, isActive: true },
  { id: 'f-5', column: 'Organization', label: 'Contact secretariat', href: '/about#contact', sortOrder: 5, isActive: true },

  { id: 'f-6', column: 'Shop & support', label: 'E-shop', href: '/shop', sortOrder: 1, isActive: true },
  { id: 'f-7', column: 'Shop & support', label: 'Shipping & delivery', href: '/about#support', sortOrder: 2, isActive: true },
  { id: 'f-8', column: 'Shop & support', label: 'Returns', href: '/about#support', sortOrder: 3, isActive: true },
  { id: 'f-9', column: 'Shop & support', label: 'Track your order', href: '/track-order', sortOrder: 4, isActive: true },
  { id: 'f-10', column: 'Shop & support', label: 'Duty & customs', href: '/about#support', sortOrder: 5, isActive: true },

  { id: 'f-11', column: 'Members', label: 'Directory by category', href: '/members', sortOrder: 1, isActive: true },
  { id: 'f-12', column: 'Members', label: 'Publications', href: '/publications', sortOrder: 2, isActive: true },
  { id: 'f-13', column: 'Members', label: 'Member shops', href: '/shop', sortOrder: 3, isActive: true },
  { id: 'f-14', column: 'Members', label: 'Apply to join', href: '/membership/apply', sortOrder: 4, isActive: true },

  { id: 'f-15', column: 'Governance', label: 'Board of Trustees', href: '/about#governance', sortOrder: 1, isActive: true },
  { id: 'f-16', column: 'Governance', label: 'Secretariat', href: '/about#governance', sortOrder: 2, isActive: true },
  { id: 'f-17', column: 'Governance', label: 'Annual reports', href: '/publications', sortOrder: 3, isActive: true },
  { id: 'f-18', column: 'Governance', label: 'Audited accounts', href: '/publications', sortOrder: 4, isActive: true },
  { id: 'f-19', column: 'Governance', label: 'Tenders & vacancies', href: '/news', sortOrder: 5, isActive: true },
];

export async function GET() {
  try {
    const items = await prisma.navigationItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (items.length === 0) {
      // Return defaults if database not yet seeded
      const footerGrouped: Record<string, any[]> = {};
      DEFAULT_FOOTER_COLUMNS.forEach((item) => {
        const col = item.column || 'General';
        if (!footerGrouped[col]) footerGrouped[col] = [];
        footerGrouped[col].push(item);
      });

      return NextResponse.json({
        success: true,
        header: DEFAULT_HEADER_LINKS,
        footer: footerGrouped,
      });
    }

    const header = items.filter((i) => i.menuType === 'HEADER');
    const footerItems = items.filter((i) => i.menuType === 'FOOTER');

    const footer: Record<string, any[]> = {};
    footerItems.forEach((item) => {
      const col = item.column || 'General';
      if (!footer[col]) footer[col] = [];
      footer[col].push(item);
    });

    return NextResponse.json({
      success: true,
      header,
      footer,
    });
  } catch (err: any) {
    const footerGrouped: Record<string, any[]> = {};
    DEFAULT_FOOTER_COLUMNS.forEach((item) => {
      const col = item.column || 'General';
      if (!footerGrouped[col]) footerGrouped[col] = [];
      footerGrouped[col].push(item);
    });

    return NextResponse.json({
      success: true,
      header: DEFAULT_HEADER_LINKS,
      footer: footerGrouped,
      fallback: true,
    });
  }
}
