import React from 'react';
import '@/styles/client-hab.css';
import prisma from '@/lib/prisma';
import { resolveFooterHref } from '@/lib/footer-navigation';
import AdminLiveBar from '@/components/public/AdminLiveBar';
import UtilityBar from '@/components/public/UtilityBar';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import AskHabAssistant from '@/components/public/AskHabAssistant';
import DesignTweaks from '@/components/public/DesignTweaks';
import PolicyModal from '@/components/public/PolicyModal';
import UniversalPageQuickEdit from '@/components/public/UniversalPageQuickEdit';
import PublicPageBlocks from '@/components/public/PublicPageBlocks';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialHeader: { label: string; href: string }[] | null = null;
  let initialFooter: { title: string; links: { label: string; href: string }[] }[] | null = null;

  try {
    const navigation = await prisma.navigationItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { menuType: true, column: true, label: true, href: true, parent: true },
    });
    initialHeader = navigation
      .filter((item) => item.menuType === 'HEADER' && !item.parent)
      .map((item) => ({ label: item.label, href: item.href }));

    const footerColumns = new Map<string, { label: string; href: string }[]>();
    for (const item of navigation.filter((entry) => entry.menuType === 'FOOTER')) {
      const title = item.column || 'General';
      const links = footerColumns.get(title) || [];
      links.push({ label: item.label, href: resolveFooterHref(item.label, item.href) });
      footerColumns.set(title, links);
    }
    initialFooter = Array.from(footerColumns, ([title, links]) => ({ title, links }));
  } catch {
    // Client fetches retain their existing safe defaults when navigation storage is unavailable.
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F4F0E7] text-[#33261F] overflow-x-clip">
      <AdminLiveBar />
      <UtilityBar />
      <Header initialNavigation={initialHeader} />
      <div className="hab-public-shell flex-1 w-full overflow-x-clip">{children}<PublicPageBlocks /></div>
      <Footer initialNavigation={initialFooter} />
      <AskHabAssistant />
      <DesignTweaks />
      <PolicyModal />
      <UniversalPageQuickEdit />
    </div>
  );
}

