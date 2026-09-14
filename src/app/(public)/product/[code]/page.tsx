'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CRAFTS } from '@/lib/data';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';

const PRODUCT_SPECS: Record<string, { size: string; weight: string; materials: string; care: string; lead: string }> = {
  LHA01: { size: "61 × 43 cm image, 96 × 66 cm mounted", weight: "0.9 kg", materials: "Cotton canvas, mineral pigment, gold leaf, silk brocade", care: "Keep out of direct sun; roll, never fold", lead: "Ships in 2 working days" },
  SAD03: { size: "46 × 34 × 12 cm", weight: "1.4 kg", materials: "Yathra sheep wool, leather straps, cotton lining", care: "Dry clean or spot clean only", lead: "Ships in 2 working days" },
  TRO04: { size: "7.5 × 5 cm, pin 4 cm", weight: "62 g", materials: "Hand-chased 92.5 silver", care: "Polish with a soft cloth", lead: "Ships in 2 working days" },
  FTB04: { size: "28 cm diameter × 14 cm", weight: "340 g", materials: "Split bamboo, natural dye", care: "Wipe dry; avoid prolonged soaking", lead: "Ships in 2 working days" },
  DAP02: { size: "18 cm diameter × 11 cm with lid", weight: "480 g", materials: "Maple burl, natural lacquer", care: "Hand wash, do not soak", lead: "Ships in 2 working days" },
  MAS01: { size: "32 × 24 × 16 cm", weight: "1.1 kg", materials: "Seasoned hardwood, mineral pigment", care: "Dust with a dry brush", lead: "Ships in 3 working days" },
  DEZ01: { size: "50 × 70 cm sheets, set of ten", weight: "260 g", materials: "Daphne bhola bark", care: "Store flat, away from damp", lead: "Ships in 2 working days" },
  CUS02: { size: "45 × 45 cm cover, no insert", weight: "290 g", materials: "Raw silk, cotton backing", care: "Dry clean recommended", lead: "Ships in 2 working days" },
  HHB01: { size: "30 × 24 × 8 cm", weight: "420 g", materials: "Backstrap-loom cotton, wooden handle", care: "Spot clean", lead: "Ships in 2 working days" },
  HHB10: { size: "28 × 22 cm", weight: "380 g", materials: "Silk-cotton blend, brass clasp", care: "Spot clean", lead: "Ships in 2 working days" },
  LUD01: { size: "42 cm diameter × 52 cm", weight: "1.6 kg", materials: "Cane, reinforced rim", care: "Keep dry", lead: "Ships in 4 working days" },
  CAM01: { size: "24 × 17 × 11 cm", weight: "540 g", materials: "Quilted cotton, water-resistant liner", care: "Spot clean", lead: "Ships in 2 working days" },
  KIS02: { size: "250 × 130 cm, untailored", weight: "1.2 kg", materials: "Reeled and raw silk, natural dye", care: "Specialist dry clean only", lead: "Made to order, 4 weeks" },
  PHO03: { size: "9 cm diameter × 8 cm", weight: "180 g", materials: "Figured burl, natural lacquer", care: "Hand wash, do not soak", lead: "Ships in 2 working days" },
  DEZ07: { size: "A5, 60 leaves", weight: "310 g", materials: "Desho paper, cotton thread", care: "Store away from damp", lead: "Ships in 2 working days" },
  TRO09: { size: "11 × 7 × 5 cm", weight: "310 g", materials: "92.5 silver, drawn-wire filigree", care: "Polish with a soft cloth", lead: "Ships in 3 working days" },
  PAR06: { size: "30 × 22 × 3 cm", weight: "2.3 kg", materials: "Local slate", care: "Wipe with a damp cloth", lead: "Ships in 4 working days" },
  LHA08: { size: "40 × 28 cm", weight: "700 g", materials: "Primed board, mineral pigment", care: "Keep out of direct sun", lead: "Ships in 2 working days" },
  TSH11: { size: "120 × 80 cm", weight: "1.1 kg", materials: "Split bamboo, cane binding", care: "Keep dry; roll to store", lead: "Ships in 3 working days" },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fmt, alt } = useCurrency();
  const { addToCart } = useCart();

  const code = (params.code as string) || '';

  const [product, setProduct] = useState<any | null>(null);
  const [craft, setCraft] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThumb, setActiveThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!code) return;
    setLoading(true);

    fetch(`/api/products/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.product) {
          const p = data.product;
          const codeUpper = (p.code || '').toUpperCase();
          const spec = PRODUCT_SPECS[codeUpper] || {};

          setProduct({
            code: p.code,
            name: p.name,
            priceUSD: p.priceUSD || p.price || 0,
            craftKey: p.craftKey || 'thagzo',
            craft_name: p.craft?.name ? `${p.craft.name} · ${p.craft.english}` : p.craftKey,
            maker: typeof p.maker === 'object' ? p.maker?.name : (p.maker || 'Verified Member'),
            region: p.region || p.dzongkhag || 'Bhutan',
            description: p.description || p.desc || 'Handcrafted by registered members of the Handicrafts Association of Bhutan using traditional techniques and locally sourced materials.',
            size: p.size || spec.size || '30 × 24 × 8 cm',
            weight: p.weight || spec.weight || '420 g',
            materials: p.materials || spec.materials || p.material || 'Naturally dyed local materials',
            care: p.care || spec.care || 'Spot clean or gentle hand wash; do not soak',
            lead: p.lead || spec.lead || 'Ships in 2 working days with EMS tracking and craft certificate',
            image_path: p.image_path || p.imageUrl || `/assets/photos/product-${p.code.toLowerCase()}.jpg`,
            gallery: p.gallery,
            images: p.images,
            maker_blurb: p.maker?.bio || 'Registered artisan practicing traditional craft heritage under the Handicrafts Association of Bhutan.',
            maker_since: p.maker?.memberSince || '2015',
          });

          const foundCraft = CRAFTS.find((c) => c.key === p.craftKey);
          if (foundCraft) setCraft(foundCraft);

          if (data.related && Array.isArray(data.related) && data.related.length > 0) {
            setRelated(data.related);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [code]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.code, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      handleAddToCart();
      router.push('/basket');
    }
  };

  if (loading) {
    return (
      <main id="main">
        <section className="section">
          <p className="crumbs"><Link href="/">Home</Link> / <Link href="/shop">E-shop</Link> / Loading...</p>
          <div className="proddetail">
            <div className="frame frame--square" style={{ minHeight: '380px' }} />
            <div>
              <p className="eyebrow eyebrow--muted">Loading piece details...</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main id="main">
        <section className="section">
          <p className="crumbs"><Link href="/">Home</Link> / <Link href="/shop">E-shop</Link> / Product not found</p>
          <div className="shopempty" style={{ display: 'block', margin: '40px auto', maxWidth: '600px', textAlign: 'center' }}>
            <h2 className="shopempty__title">Piece not in catalogue</h2>
            <p className="shopempty__body">The craft piece with code &quot;{code}&quot; is not currently listed.</p>
            <div className="actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--accent" href="/shop">Browse the e-shop</Link>
              <Link className="btn btn--outline" href="/contact">Contact Secretariat</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const craftFallbacks: Record<string, string[]> = {
    thagzo: ['/assets/photos/product-sad03.jpg', '/assets/photos/product-hhb01.jpg', '/assets/photos/hero-4-textiles.jpg'],
    shagzo: ['/assets/photos/product-dap02.jpg', '/assets/photos/hero-3-clay.jpg', '/assets/photos/hero-2-punakha.jpg'],
    troezo: ['/assets/photos/product-tro04.jpg', '/assets/photos/hero-1-weaving.jpg', '/assets/photos/product-cam01.jpg'],
    tshazo: ['/assets/photos/product-ftb04.jpg', '/assets/photos/product-lud01.jpg', '/assets/photos/hero-2-punakha.jpg'],
    lhazo: ['/assets/photos/product-lha01.jpg', '/assets/photos/hero-1-weaving.jpg', '/assets/photos/about-hab.jpg'],
    parzo: ['/assets/photos/product-mas01.jpg', '/assets/photos/hero-3-clay.jpg', '/assets/photos/product-ftb04.jpg'],
    dezo: ['/assets/photos/product-dez01.jpg', '/assets/photos/hero-5-desho.jpg', '/assets/photos/about-hab.jpg'],
    tshemzo: ['/assets/photos/product-cus02.jpg', '/assets/photos/product-cam01.jpg', '/assets/photos/hero-4-textiles.jpg'],
    garzo: ['/assets/photos/product-tro04.jpg', '/assets/photos/hero-1-weaving.jpg', '/assets/photos/product-cam01.jpg'],
    jinzo: ['/assets/photos/hero-3-clay.jpg', '/assets/photos/product-mas01.jpg', '/assets/photos/hero-2-punakha.jpg'],
  };

  const fallbacks = craftFallbacks[product.craftKey] || ['/assets/photos/product-hhb01.jpg', '/assets/photos/product-sad03.jpg', '/assets/photos/product-dap02.jpg'];
  const primaryImg = product.image_path || (product.images && product.images[0]?.url) || fallbacks[0];

  const galleryImages: string[] = Array.isArray(product.gallery) && product.gallery.length >= 3
    ? product.gallery
    : [
        primaryImg,
        (product.images && product.images[1]?.url) || fallbacks[1] || fallbacks[0],
        (product.images && product.images[2]?.url) || fallbacks[2] || fallbacks[0],
      ];

  return (
    <main id="main">

      {/* 1. Breadcrumbs & Product Detail */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/shop">E-shop</Link> / <Link href="/wholesale">Wholesale &amp; bulk orders</Link> / <Link href={`/shop?craft=${product.craftKey}`}>{craft ? craft.name : product.craftKey}</Link> / <span>{product.code}</span>
        </p>

        <div className="proddetail">

          {/* Left Column: Gallery & Thumbnails */}
          <div>
            <div className="gallery" id="prodMain">
              {galleryImages.map((src, i) => (
                <div
                  key={i}
                  className={`gallery__slide ${activeThumb === i ? 'is-on' : ''}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: activeThumb === i ? 1 : 0,
                    transition: 'opacity .35s ease',
                    pointerEvents: activeThumb === i ? 'auto' : 'none',
                    zIndex: activeThumb === i ? 1 : 0,
                  }}
                >
                  <img
                    src={src}
                    alt={`${product.name} view ${i + 1}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/photos/product-hhb01.jpg';
                    }}
                  />
                </div>
              ))}
              <figcaption className="frame__caption gallery__cap" id="prodMainCap">
                {product.name} — View {activeThumb + 1} of {galleryImages.length}
              </figcaption>
            </div>

            <div className="gallery__thumbs" id="prodThumbs">
              {galleryImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`gallery__thumb ${activeThumb === i ? 'is-on' : ''}`}
                  onClick={() => setActiveThumb(i)}
                  aria-label={`View photograph ${i + 1}`}
                  style={{
                    position: 'relative',
                    width: '88px',
                    height: '66px',
                    borderRadius: '9px',
                    border: activeThumb === i ? '2px solid var(--accent)' : '1px solid var(--line)',
                    overflow: 'hidden',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                  }}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/photos/product-hhb01.jpg';
                    }}
                  />
                  <span className="gallery__thumbcap" style={{ position: 'relative', zIndex: 2 }}>{i + 1}</span>
                </button>
              ))}
            </div>
            <p className="gallery__hint">Three views. Look before you add to the basket.</p>
          </div>

          {/* Right Column: Purchasing & Specifications */}
          <div className="prodbuy">
            <p className="eyebrow eyebrow--accent" id="prodCraft">
              {craft ? `${craft.name} · ${craft.english}` : product.craft_name}
            </p>

            <h1 className="display display--prod" id="prodName">
              {product.name}
            </h1>

            <p className="prodbuy__price" id="prodPrice">
              {fmt(product.priceUSD)}
            </p>
            <p className="prodbuy__alt" id="prodAlt">
              Approx. {alt(product.priceUSD)} · EMS tracked delivery included on qualifying orders
            </p>

            <p className="prodbuy__desc" id="prodDesc">
              {product.description}
            </p>

            <div className="prodbuy__actions">
              <label className="visually-hidden" htmlFor="prodQty">Quantity</label>
              <input
                className="input prodbuy__qty"
                id="prodQty"
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button
                className="btn btn--accent prodbuy__add"
                type="button"
                id="prodAdd"
                onClick={handleAddToCart}
              >
                Add to basket
              </button>
              <button
                className="btn btn--outline"
                type="button"
                id="prodBuy"
                onClick={handleBuyNow}
              >
                Buy now
              </button>
            </div>

            <p className="eyebrow eyebrow--muted eyebrow--sm" style={{ marginTop: '30px' }}>
              Specifications
            </p>
            <dl className="deeplist" id="prodSpecs" style={{ marginTop: '12px' }}>
              <div className="deeplist__row">
                <dt className="deeplist__key">Reference</dt>
                <dd className="deeplist__val">{product.code}</dd>
              </div>
              <div className="deeplist__row">
                <dt className="deeplist__key">Dimensions</dt>
                <dd className="deeplist__val">{product.size}</dd>
              </div>
              <div className="deeplist__row">
                <dt className="deeplist__key">Weight</dt>
                <dd className="deeplist__val">{product.weight}</dd>
              </div>
              <div className="deeplist__row">
                <dt className="deeplist__key">Materials</dt>
                <dd className="deeplist__val">{product.materials}</dd>
              </div>
              <div className="deeplist__row">
                <dt className="deeplist__key">Care instructions</dt>
                <dd className="deeplist__val">{product.care}</dd>
              </div>
              <div className="deeplist__row">
                <dt className="deeplist__key">Dispatch &amp; Lead</dt>
                <dd className="deeplist__val">{product.lead}</dd>
              </div>
            </dl>

            {craft && (
              <Link className="link-accent" id="prodCraftLink" href={`/craft/${craft.key}`} style={{ display: 'inline-block', marginTop: '18px' }}>
                About this craft →
              </Link>
            )}

            {/* Maker Accreditation Card */}
            <div className="makerpanel" id="prodMakerPanel" style={{ marginTop: '24px' }}>
              <span className="makerpanel__avatar" style={{ overflow: 'hidden' }}>
                <img
                  src="/assets/photos/hero-1-weaving.jpg"
                  alt={product.maker}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                />
              </span>
              <span className="makerpanel__body">
                <span className="eyebrow eyebrow--muted eyebrow--sm">Made by</span>
                <span className="makerpanel__name" id="prodMaker">{product.maker}</span>
                <span className="makerpanel__meta" id="prodMakerMeta">{product.region} · Member since {product.maker_since}</span>
                <span className="makerpanel__blurb clamp-2" id="prodMakerBlurb">{product.maker_blurb}</span>
              </span>
              <span className="makerpanel__go" id="prodMakerLink">✓</span>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Assurance Strip */}
      <section className="section section--tight">
        <div className="assurance">
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">T</span>
              <span>racked Origin</span>
            </h3>
            <p className="assurance__body">Materials, makers, and worldwide shipping are 100% traceable.</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">R</span>
              <span>egistered Chain</span>
            </h3>
            <p className="assurance__body">Every artisan, supplier, and input is strictly verified.</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">U</span>
              <span>pfront &amp; Fair</span>
            </h3>
            <p className="assurance__body">Pre-paid artisan pricing cuts out unethical markups.</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">E</span>
              <span>ncrypted Escrow</span>
            </h3>
            <p className="assurance__body">Bulletproof 3-D Secure, mBoB, and bank transfers.</p>
          </div>
        </div>
      </section>

      {/* 3. Related Products */}
      <section className="section section--last" id="prodRelatedSection">
        <div className="section__head">
          <h2 className="display display--sub" id="prodRelatedTitle">More from this craft</h2>
          <Link className="btn btn--ink btn--sm" id="prodRelatedAll" href={`/shop?craft=${product.craftKey}`}>
            Shop the category →
          </Link>
        </div>

        <div className="grid grid--4" id="prodRelated">
          {(related.length > 0 ? related : [
            { code: 'SAD03', name: 'Yathra Wool Saddle Bag', craft_name: 'Thagzo · Weaving', maker: 'Chumey Yathra House', priceUSD: 120, image_path: '/assets/photos/product-sad03.jpg' },
            { code: 'TRO04', name: 'Hand-Chased Silver Koma Clasp Pair', craft_name: 'Troezo · Silver & Gold', maker: 'Zorig Silversmiths', priceUSD: 92, image_path: '/assets/photos/product-cam01.jpg' },
            { code: 'FTB04', name: 'Two-Tier Bangchung Basket', craft_name: 'Tshazo · Cane & Bamboo', maker: 'Kheng Bamboo Collective', priceUSD: 34, image_path: '/assets/photos/product-lud01.jpg' },
            { code: 'LHA01', name: 'Guru Rinpoche Mineral-Pigment Thangka', craft_name: 'Lhazo · Painting', maker: 'Sonam Thangka Studio', priceUSD: 260, image_path: '/assets/photos/product-hhb01.jpg' },
          ]).slice(0, 4).map((rp: any) => (
            <article key={rp.code} className="card product">
              <Link className="product__shot" href={`/product/${rp.code}`}>
                <figure className="frame frame--square">
                  <img
                    src={rp.image_path || rp.imageUrl || '/assets/photos/product-hhb01.jpg'}
                    alt={rp.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/product-hhb01.jpg'; }}
                  />
                </figure>
                <span className="product__ref">{rp.code}</span>
              </Link>
              <div className="card__body">
                <p className="eyebrow eyebrow--accent eyebrow--sm">{rp.craft_name || rp.craftKey}</p>
                <h3 className="card__title clamp-2">
                  <Link href={`/product/${rp.code}`}>{rp.name}</Link>
                </h3>
                <p className="card__meta clamp-1">{typeof rp.maker === 'object' ? rp.maker?.name : rp.maker}</p>
                <div className="card__foot">
                  <span className="price">{fmt(rp.priceUSD || rp.price || 0)}</span>
                  <button
                    className="btn btn--outline btn--xs"
                    type="button"
                    onClick={() => addToCart(rp.code)}
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </main>
  );
}
