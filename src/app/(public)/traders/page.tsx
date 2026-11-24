import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import TraderDirectory from '@/components/public/TraderDirectory';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Accredited Traders · HAB', description: 'Find current HAB-accredited handicraft traders by name, craft and location.' };

export default async function TradersPage() {
  let traders: any[] = [];
  let unavailable = false;
  try {
    traders = await prisma.traderRecord.findMany({ where: { isVisible: true, expiresAt: { gt: new Date() } }, orderBy: [{ sortOrder: 'asc' }, { shopName: 'asc' }] });
  } catch { unavailable = true; }
  return <main id="main"><section className="section relative" data-hab-section="traders">
    <SectionEditBadge label="Accredited Traders" studioHref="/admin/traders" />
    <p className="crumbs"><Link href="/">Home</Link> / Accredited traders</p>
    <div className="section__head"><div><p className="eyebrow eyebrow--accent">Find a shop</p><h1 className="display display--page">Accredited traders</h1><p className="section__lede">Current retail traders accredited by the Handicrafts Association of Bhutan.</p></div></div>
    {unavailable ? <p role="status">The trader directory is temporarily unavailable.</p> : traders.length === 0 ? <div className="shopempty"><h2 className="shopempty__title">No trader listings are published yet</h2><p className="shopempty__body">The Secretariat manages accredited trader listings.</p></div> : <TraderDirectory traders={traders.map((trader) => ({ ...trader, craftKeys: Array.isArray(trader.craftKeys) ? trader.craftKeys.filter((item: unknown): item is string => typeof item === 'string') : [], productPhotoUrls: Array.isArray(trader.productPhotoUrls) ? trader.productPhotoUrls.filter((item: unknown): item is string => typeof item === 'string') : [] }))} />}
  </section></main>;
}
