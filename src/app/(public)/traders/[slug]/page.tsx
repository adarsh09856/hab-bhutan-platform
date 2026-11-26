import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import ProductCard from '@/components/public/ProductCard';
import { normalizeProductImages } from '@/lib/product-image-fallbacks';
import { bhutanDayStartUtc } from '@/lib/trader-expiry';
import { PUBLIC_PRODUCT_CARD_MAKER_SELECT, toPublicProductCardMaker } from '@/lib/public-product-maker';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
async function findTrader(slug: string) {
  return prisma.traderRecord.findFirst({
    where: { slug, isVisible: true, expiresAt: { gte: bhutanDayStartUtc() } },
    include: { products: { where: { status: 'PUBLISHED' }, include: { maker: { select: PUBLIC_PRODUCT_CARD_MAKER_SELECT } }, orderBy: { createdAt: 'desc' }, take: 12 } },
  });
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trader = await findTrader(slug).catch(() => null);
  return trader ? {
    title: `${trader.shopName} · Accredited Traders · HAB`,
    description: trader.shortDescription,
    alternates: { canonical: `https://hab.touratbhutan.info/traders/${encodeURIComponent(trader.slug)}` },
  } : { title: 'Trader not found · HAB', robots: { index: false, follow: false } };
}
export default async function TraderDetailPage({ params }: Props) {
  const { slug } = await params;
  const trader = await findTrader(slug).catch(() => null);
  if (!trader) notFound();
  const photos = Array.isArray(trader.productPhotoUrls) ? trader.productPhotoUrls.filter((value): value is string => typeof value === 'string' && !!value) : [];
  const crafts = Array.isArray(trader.craftKeys) ? trader.craftKeys.filter((value): value is string => typeof value === 'string') : [];
  const productTypes = Array.isArray(trader.productTypes) ? trader.productTypes.filter((value): value is string => typeof value === 'string') : [];
  return <main id="main"><section className="section relative" data-hab-section="trader-detail"><SectionEditBadge label="Accredited Trader" studioHref="/admin/traders" />
    <p className="crumbs"><Link href="/">Home</Link> / <Link href="/traders">Accredited traders</Link> / {trader.shopName}</p>
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div>{trader.bannerUrl ? <div className="relative aspect-[4/3] rounded-2xl overflow-hidden"><Image src={trader.bannerUrl} alt={trader.shopName} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div> : <div className="frame frame--square" aria-label="No trader photograph available" />}
        {photos.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">{photos.slice(0, 8).map((src, index) => <div key={`${src}-${index}`} className="relative aspect-square rounded-xl overflow-hidden"><Image src={src} alt={`${trader.shopName} product ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 16vw" className="object-cover" /></div>)}</div>}</div>
      <div><p className="eyebrow eyebrow--accent">HAB-accredited trader</p><h1 className="display display--page">{trader.shopName}</h1><p className="lede">{trader.shortDescription}</p>{trader.quote && <blockquote className="mt-5 border-l-2 border-[#8B2E24] pl-4 font-lora text-lg italic text-[#6B5A4C]">“{trader.quote}”</blockquote>}<div className="longread mt-6"><p className="longread__body">{trader.description}</p></div>
        <dl className="craftfacts mt-6"><div className="craftfacts__cell"><dt className="craftfacts__key">Location</dt><dd className="craftfacts__val">{[trader.address, trader.town, trader.dzongkhag].filter(Boolean).join(', ')}</dd></div><div className="craftfacts__cell"><dt className="craftfacts__key">HAB registration</dt><dd className="craftfacts__val">{trader.registrationNumber}</dd></div>{trader.verifiedSince && <div className="craftfacts__cell"><dt className="craftfacts__key">HAB Verified since</dt><dd className="craftfacts__val">{trader.verifiedSince}</dd></div>}{trader.openingHours && <div className="craftfacts__cell"><dt className="craftfacts__key">Opening hours</dt><dd className="craftfacts__val">{trader.openingHours}</dd></div>}{crafts.length > 0 && <div className="craftfacts__cell"><dt className="craftfacts__key">Crafts</dt><dd className="craftfacts__val">{crafts.join(', ')}</dd></div>}{productTypes.length > 0 && <div className="craftfacts__cell"><dt className="craftfacts__key">Product types</dt><dd className="craftfacts__val">{productTypes.join(', ')}</dd></div>}</dl>
        {trader.mapUrl && <p className="mt-5"><a className="btn btn--outline" href={trader.mapUrl} target="_blank" rel="noopener noreferrer">Open map →</a></p>}
        <div className="actions mt-6 flex flex-wrap gap-3">
          <Link className="btn btn--accent" href={`/contact?topic=trader-introduction&trader=${encodeURIComponent(trader.slug)}`}>Request an introduction</Link>
          <Link className="btn btn--outline" href={`/contact?topic=wholesale-quote&trader=${encodeURIComponent(trader.slug)}`}>Request a wholesale quote</Link>
          <Link className="btn btn--outline" href="/shop">Browse HAB crafts</Link>
        </div></div>
    </div>
    {trader.products.length > 0 && <section className="mt-12"><div className="section__head"><div><p className="eyebrow eyebrow--accent">From this trader</p><h2 className="display display--sub">Available products</h2></div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{trader.products.map((product) => { const images = normalizeProductImages(product.code, product.craftKey, product.images); const maker = toPublicProductCardMaker(product.maker); return <ProductCard key={product.id} code={product.code} name={product.name} priceUSD={product.priceUSD} craftKey={product.craftKey} region={product.region} maker={maker?.name || trader.shopName} stock={product.stock} availability={product.availability} imageUrl={images.imageUrl} images={images.images} />; })}</div></section>}
    <p className="mt-10"><Link href="/traders" className="link-accent">← Back to accredited traders</Link></p>
  </section></main>;
}
