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
  let initialUtility: {
    loaded: boolean;
    tickerMessages: { text: string; dzText?: string; text_dz?: string; link?: string }[];
    secretaryPhone: string;
    secretaryEmail: string;
    topBarContactMode: 'PHONE_ONLY' | 'EMAIL_ONLY' | 'BOTH' | 'OFF';
    visible: boolean;
  } = {
    loaded: false,
    tickerMessages: [],
    secretaryPhone: '+975-2-338089',
    secretaryEmail: 'officehab@gmail.com',
    topBarContactMode: 'PHONE_ONLY',
    visible: true,
  };

  try {
    const navigation = await prisma.navigationItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { menuType: true, column: true, label: true, href: true, parent: true },
    });
    initialHeader = navigation
      .filter((item) => item.menuType === 'HEADER' && !item.parent)
      .map((item) => ({ label: item.label, href: resolveFooterHref(item.label, item.href) }));

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

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
      select: {
        announcementText: true,
        announcementLink: true,
        isAnnouncementOn: true,
        secretaryPhone: true,
        secretaryEmail: true,
        trustBadges: true,
      },
    });
    if (setting) {
      const badges = setting.trustBadges && typeof setting.trustBadges === 'object' && !Array.isArray(setting.trustBadges)
        ? setting.trustBadges as Record<string, unknown>
        : {};
      const configuredMessages = Array.isArray(badges.tickerMessages)
        ? badges.tickerMessages.filter((item): item is { text: string; dzText?: string; text_dz?: string; link?: string } =>
            Boolean(item && typeof item === 'object' && typeof (item as { text?: unknown }).text === 'string'))
        : [];
      const defaultMessages = [
        { text: setting.announcementText || 'CSO/2011/043 · Handicrafts Association of Bhutan', dzText: 'CSO/2011/043 · འབྲུག་གི་ལག་བཟོ་ཚོགས་པ', link: setting.announcementLink || '/about' },
        { text: 'Apex CSO Supporting 7,500+ Rural Artisans Across 20 Dzongkhags', dzText: 'རྫོང་ཁག་ ༢༠ གི་ གྲོང་གསེབ་ལག་བཟོ་པ་ཚུ་ལུ་རྒྱབ་སྐྱོར་འབད་མི་ དབུ་འཁྲིད་ཚོགས་པ', link: '/about' },
        { text: 'Official Secretariat Hotline: +975-2-338089 · Thimphu', dzText: 'གཞུང་འབྲེལ་དྲུང་ཆེའི་ཡིག་ཚང་བརྒྱུད་འཕྲིན: +975-2-338089 · ཐིམ་ཕུག', link: '/contact' },
        { text: 'Track Orders Worldwide with Authentic Craft Certification', dzText: 'ངོ་མ་ཨིན་པའི་ལག་ཁྱེར་དང་བཅས་ འཛམ་གླིང་ཡོངས་ལུ་ བཀའ་རྒྱའི་རྗེས་འདེད', link: '/track-order' },
      ];
      const tickerMessages = configuredMessages.length ? configuredMessages : defaultMessages;
      const contactMode = badges.topBarContactMode;
      initialUtility = {
        loaded: true,
        tickerMessages,
        secretaryPhone: setting.secretaryPhone || '+975-2-338089',
        secretaryEmail: setting.secretaryEmail || 'officehab@gmail.com',
        topBarContactMode: ['PHONE_ONLY', 'EMAIL_ONLY', 'BOTH', 'OFF'].includes(String(contactMode))
          ? contactMode as 'PHONE_ONLY' | 'EMAIL_ONLY' | 'BOTH' | 'OFF'
          : 'PHONE_ONLY',
        visible: setting.isAnnouncementOn,
      };
    }
  } catch {
    // Keep the utility bar's safe defaults and client fallback if settings are unavailable.
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F4F0E7] text-[#33261F] overflow-x-clip">
      <AdminLiveBar />
      <UtilityBar initialSettings={initialUtility} />
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

