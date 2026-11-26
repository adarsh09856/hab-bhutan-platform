import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { preparePolicyHtml } from '@/lib/policy-html';
import { productHref, shopCraftHref } from '@/lib/product-routes';
import { awardTypeLabel } from '@/lib/award-types';
import { resolvedHonourSlug } from '@/lib/honour-slugs';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
async function lookup(slug: string) {
  const all = await prisma.honourRecord.findMany({ where: { isActive: true } });
  return all.find((h) => resolvedHonourSlug(h) === slug) || null;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const honour = await lookup(slug).catch(() => null);
  return honour ? { title: `${honour.name} · HAB Recognition`, description: honour.shortDescription || honour.citation } : { title: 'Recognition profile · HAB' };
}
export default async function HonourDetailPage({ params }: Props) {
  const { slug } = await params; const honour = await lookup(slug).catch(() => null); if (!honour) notFound();
  const works = Array.isArray(honour.workPhotos) ? honour.workPhotos.filter((item): item is string => typeof item === 'string').slice(0, 6) : [];
  const products = honour.makerMemberId ? await prisma.product.findMany({
    where: { makerMemberId: honour.makerMemberId, status: 'PUBLISHED' },
    select: { code: true, name: true, slug: true },
    orderBy: [{ name: 'asc' }, { code: 'asc' }],
  }) : [];

  return <main id="main"><section className="section relative" data-hab-section="honour-detail"><SectionEditBadge label="Honours Studio" studioHref="/admin/honours"/><p className="crumbs"><Link href="/">Home</Link> / <Link href="/masters">Accreditations &amp; awards</Link> / {honour.name}</p>
    <div className="grid md:grid-cols-[minmax(240px,0.8fr)_1.2fr] gap-8 items-start">{honour.portraitUrl ? <div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image src={honour.portraitUrl} alt={honour.name} fill priority sizes="(max-width: 768px) 100vw, 40vw" className="object-cover"/></div> : <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eee5d8]" role="img" aria-label="Portrait not provided"/>}
      <div><p className="eyebrow eyebrow--accent">{honour.title}</p><h1 className="display display--page">{honour.name}</h1><p className="lede">{awardTypeLabel(honour.awardType)} · {honour.yearAwarded}</p><p className="lede">{honour.shortDescription || honour.citation}</p><dl className="craftfacts mt-6"><div className="craftfacts__cell"><dt className="craftfacts__key">Craft</dt><dd className="craftfacts__val">{honour.craft}</dd></div><div className="craftfacts__cell"><dt className="craftfacts__key">Dzongkhag</dt><dd className="craftfacts__val">{honour.dzongkhag}</dd></div>{honour.practisingSince && <div className="craftfacts__cell"><dt className="craftfacts__key">Practising since</dt><dd className="craftfacts__val">{honour.practisingSince}</dd></div>}</dl><div className="actions mt-6"><Link className="btn btn--accent btn--sm" href={products.length ? '#awardee-products' : shopCraftHref(honour.craft)}>{products.length ? 'See their products in the shop' : 'Shop this craft'}</Link><Link className="btn btn--outline btn--sm" href="/masters">{'Back to all awardees'}</Link></div></div>
    </div><article className="longread mt-10"><div><p className="eyebrow eyebrow--accent">Recognition</p><h2 className="display display--sub">The story</h2></div><div className="longread__body" dangerouslySetInnerHTML={{ __html: preparePolicyHtml(honour.story || honour.citation) }}/></article>
    {works.length > 0 && <section className="mt-10"><h2 className="display display--sub mb-5">Work and practice</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{works.map((src, index) => <div key={`${src}-${index}`} className="relative aspect-square rounded-xl overflow-hidden"><Image src={src} alt={`${honour.name} craft work ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 30vw" className="object-cover"/></div>)}</div></section>}
    {products.length > 0 && (
      <section id="awardee-products" className="mt-10 scroll-mt-36">
        <h2 className="display display--sub mb-5">Products by {honour.name}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <li key={product.code}>
              <Link className="link-accent" href={productHref(product.code, product.slug)}>{product.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    )}
  </section></main>;
}
