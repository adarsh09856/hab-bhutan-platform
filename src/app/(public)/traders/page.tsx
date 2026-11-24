import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';

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
    {unavailable ? <p role="status">The trader directory is temporarily unavailable.</p> : traders.length === 0 ? <div className="shopempty"><h2 className="shopempty__title">No trader listings are published yet</h2><p className="shopempty__body">The Secretariat manages accredited trader listings.</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {traders.map((trader) => <article key={trader.id} className="card overflow-hidden">
        <Link href={`/traders/${encodeURIComponent(trader.slug)}`} className="block">
          {(trader.bannerUrl || (Array.isArray(trader.productPhotoUrls) && trader.productPhotoUrls[0])) && <div className="relative aspect-[4/3] bg-stone-100"><Image src={trader.bannerUrl || trader.productPhotoUrls[0]} alt={trader.shopName} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /></div>}
          <div className="p-5"><p className="eyebrow eyebrow--accent">{trader.town}, {trader.dzongkhag}</p><h2 className="display display--panel">{trader.shopName}</h2><p className="mt-2 text-sm">{trader.shortDescription}</p><span className="link-accent mt-4 inline-block">View trader details →</span></div>
        </Link>
      </article>)}
    </div>}
  </section></main>;
}
