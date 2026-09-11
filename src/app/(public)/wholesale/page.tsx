import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA, getCountsByCraft } from '@/lib/client-data';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Wholesale & Bulk Orders · Handicrafts Association of Bhutan',
  description: 'Trade pricing, minimum order quantities and made-to-order Bhutanese handicraft for retailers, hotels, designers and distributors.',
};

const FLOW_STEPS = [
  { title: 'Browse', desc: 'Category, then product. The catalogue is the same one the retail shop uses.' },
  { title: 'Quantity', desc: 'Set quantities against the MOQ. Tier pricing applies automatically.' },
  { title: 'Quote basket', desc: 'Collect several products into one basket rather than checking out.' },
  { title: 'HAB review', desc: 'The trade desk confirms availability with the producing members.' },
  { title: 'Quotation', desc: 'Formal quote with freight, lead time and payment terms.' },
  { title: 'Order & tracking', desc: 'Production, quality control in Thimphu, then shipment with tracking.' },
];

export default async function WholesalePage() {
  let siteSettings: any = null;
  let dbProducts: any[] = [];
  try {
    siteSettings = await prisma.siteSetting.findFirst();
    dbProducts = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { craft: true },
    });
  } catch {}

  const craftCounts = getCountsByCraft();
  const previewProducts = dbProducts.length > 0
    ? dbProducts.map((p) => ({
        code: p.code,
        name: p.name,
        craft_key: p.craft?.slug || p.category?.toLowerCase() || 'thangka',
        craft_name: p.craft?.nameEnglish || p.craft?.nameBhutanese || 'Zorig Chusum',
        maker: p.artisan || p.originDzongkhag || 'Master Artisan',
        region: p.originDzongkhag || 'Bhutan',
        image_path: p.images?.[0] || '/assets/photos/product-sad03.jpg',
      }))
    : CLIENT_DATA.products.slice(0, 8);

  const assurances = (siteSettings?.wholesaleAssurances && Array.isArray(siteSettings.wholesaleAssurances) && siteSettings.wholesaleAssurances.length > 0)
    ? siteSettings.wholesaleAssurances
    : CLIENT_DATA.wholesaleAssurance;

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/shop">E-shop</Link> / Wholesale &amp; bulk orders
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Trade &amp; bulk purchasing</p>
            <p className="shopswitch">
              Buying a single piece? <Link href="/shop">Visit the retail shop →</Link>
            </p>
            <h1 className="display display--page">Wholesale &amp; Bulk Orders</h1>
            <p className="lede">
              HAB supplies Bhutanese handicraft at trade terms to retailers, hotels, designers, institutions and distributors.
              You contract with the association; we manage the makers, the quality control and the shipping.
            </p>
            <p className="section__lede">
              Trade prices, minimum order quantities (typical MOQ {siteSettings?.wholesaleMoq || 10} units, lead time {siteSettings?.wholesaleLeadTime || '2 to 4 weeks'}) are shown to verified buyers only. Registration takes a few minutes and is reviewed by the secretariat.
            </p>
          </div>
          <div className="panel panel--accent">
            <p className="eyebrow eyebrow--onaccent">Verified buyers</p>
            <h2 className="display display--panel display--onaccent">Access trade pricing</h2>
            <p className="panel__body panel__body--onaccent">
              See wholesale prices, MOQs, bulk tiers, lead times and made-to-order options across the whole catalogue, and build a quote basket.
            </p>
            <div className="actions">
              <Link className="btn btn--light" href="/wholesale/register">
                Register as a wholesale buyer
              </Link>
              <Link className="btn btn--ghost" href="/wholesale/shop">
                Wholesale buyer login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Assurance Grid */}
      <section className="section section--tight">
        <div className="assurance assurance--5">
          {assurances.map((item: any, idx: number) => {
            const letter = item.letter || item.title?.charAt(0) || '✓';
            const restTitle = item.title && item.letter ? item.title.slice(item.letter.length) : (item.title || '');
            return (
              <div key={idx} className="assurance__cell">
                <h3 className="assurance__title">
                  <span className="assurance__initial">{letter}</span>
                  <span>{restTitle}</span>
                </h3>
                <p className="assurance__body">{item.body || item.description || ''}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Wholesale by Craft Category */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Zorig Chusum</p>
            <h2 className="display display--sub">Wholesale by craft category</h2>
            <p className="section__lede">
              The same thirteen crafts and the same catalogue as the retail shop. Browse freely; trade terms appear once your account is verified.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/shop">
            Retail shop →
          </Link>
        </div>
        <div className="countgrid">
          {CLIENT_DATA.crafts.map((c, idx) => {
            const count = craftCounts[c.key] || 0;
            return (
              <Link key={c.key} className="countcard" href={`/wholesale/shop?craft=${c.key}`}>
                <span className="countcard__badge">
                  {String(idx + 1).padStart(2, '0')}/13
                </span>
                <div className="countcard__body">
                  <h3 className="countcard__title">{c.name}</h3>
                  <span className="countcard__en">{c.english}</span>
                </div>
                <div className="countcard__links">
                  <span className="countcard__link">
                    {count > 0 ? 'View wholesale range →' : 'Made to commission →'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Product Catalog Preview */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">The catalogue</p>
            <h2 className="display display--sub">General product browsing</h2>
            <p className="section__lede">
              Product photography, descriptions and craft provenance are shared with the retail shop. Wholesale prices are hidden until you are verified.
            </p>
          </div>
          <Link className="btn btn--outline btn--sm" href="/wholesale/register">
            Unlock trade pricing →
          </Link>
        </div>
        <div className="grid grid--4">
          {previewProducts.map((p) => {
            const craft = CLIENT_DATA.crafts.find((c) => c.key === p.craft_key);
            const terms = CLIENT_DATA.wholesaleTerms[p.code];
            const imgSrc = p.image_path ? `/${p.image_path.replace(/^\/+/, '')}` : '/assets/photos/product-sad03.jpg';

            return (
              <article key={p.code} className="card product">
                <Link className="product__shot" href={`/product/${p.code}`}>
                  <div className="frame frame--square" style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={imgSrc}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <span className="product__ref">{p.code}</span>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{craft?.name || 'Zorig Chusum'}</p>
                  <h3 className="card__title clamp-2">
                    <Link href={`/product/${p.code}`}>{p.name}</Link>
                  </h3>
                  <p className="card__meta clamp-1">{p.maker} · {p.region}</p>
                  <div className="card__foot">
                    <span className="tradelock">
                      {terms ? `MOQ ${terms.moq} · price on account` : 'Price on account'}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <p className="eyebrow eyebrow--accent">How it works</p>
        <h2 className="display display--sub" style={{ marginBottom: 26 }}>
          From enquiry to delivery
        </h2>
        <div className="flowsteps">
          {FLOW_STEPS.map((step, idx) => (
            <div key={idx} className="flowstep">
              <span className="flowstep__n">{String(idx + 1).padStart(2, '0')}</span>
              <h3 className="flowstep__t">{step.title}</h3>
              <p className="flowstep__d">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Band */}
      <section className="section section--last">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Ready to order at volume?</h2>
            <p className="ctaband__body">
              Register your business, and the secretariat will verify it and open your trade account. Existing buyers can sign in to see pricing and build a quote basket.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/wholesale/register">
              Register as a buyer
            </Link>
            <Link className="btn btn--ghost" href="/contact?topic=wholesale">
              Talk to the trade desk
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
