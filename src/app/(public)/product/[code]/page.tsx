'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CRAFTS } from '@/lib/data';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import ProductQuickEdit from '@/components/public/ProductQuickEdit';
import { preparePolicyHtml } from '@/lib/policy-html';
import { productHref, shopCraftHref } from '@/lib/product-routes';
import { canPurchaseProduct, normalizeProductAvailability } from '@/lib/product-availability';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fmt, alt } = useCurrency();
  const { addToCart } = useCart();

  const routeCode = (params.code as string) || '';
  // Next exposes an encoded slash in a single dynamic segment as "%2F".
  // Decode once here before re-encoding the API URL, otherwise slash SKUs are
  // sent as "%252F" and the API searches for the encoded text literally.
  let code = routeCode;
  try { code = decodeURIComponent(routeCode); } catch { /* keep malformed codes intact for a clean not-found response */ }

  const [product, setProduct] = useState<any | null>(null);
  const [craft, setCraft] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<'missing' | 'unavailable'>('missing');
  const [activeThumb, setActiveThumb] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setProduct(null);
    setRelated([]);
    setCraft(null);
    setActiveThumb(0);
    setQuantity(1);

    fetch(`/api/products/${encodeURIComponent(code)}`, { cache: 'no-store' })
      .then((r) => {
        if (r.status === 404) throw new Error('missing');
        if (!r.ok) throw new Error('unavailable');
        return r.json();
      })
      .then((data) => {
        if (data?.product) {
          const p = data.product;
          setProduct({
            code: p.code,
            name: p.name,
            priceUSD: Number(p.priceUSD ?? p.price ?? 0),
            stock: Number(p.stock ?? 0),
            availability: normalizeProductAvailability(p.availability, Number(p.stock ?? 0)),
            craftKey: p.craftKey || '',
            craft_name: p.craft?.name ? `${p.craft.name} · ${p.craft.english}` : p.craftKey,
            maker: typeof p.maker === 'object' ? (p.maker?.name || '') : (p.maker || ''),
            maker_avatar: typeof p.maker === 'object' ? (p.maker?.portraitUrl || '') : '',
            region: p.region || p.dzongkhag || '',
            description: p.description || p.desc || '',
            size: p.size || '',
            weight: p.weight || '',
            materials: p.materials || p.material || '',
            care: p.care || '',
            lead: p.lead || '',
            image_path: p.image_path || p.imageUrl || '/assets/photos/image-unavailable.svg',
            gallery: p.gallery,
            images: p.images,
            maker_blurb: p.maker?.bio || '',
            maker_since: p.maker?.joinYear ? String(p.maker.joinYear) : '',
          });

          const foundCraft = CRAFTS.find((c) => c.key === p.craftKey);
          if (foundCraft) setCraft(foundCraft);

          if (data.related && Array.isArray(data.related) && data.related.length > 0) {
            setRelated(data.related);
          }
        } else throw new Error('unavailable');
      })
      .catch((error) => setLoadError(error?.message === 'missing' ? 'missing' : 'unavailable'))
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') setActiveThumb((index) => (index - 1 + galleryImages.length) % galleryImages.length);
      if (event.key === 'ArrowRight') setActiveThumb((index) => (index + 1) % galleryImages.length);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const handleAddToCart = () => {
    if (product && canPurchaseProduct(product.availability, product.stock, quantity)) {
      addToCart(product.code, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product && canPurchaseProduct(product.availability, product.stock, quantity)) {
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
          <p className="crumbs"><Link href="/">Home</Link> / <Link href="/shop">E-shop</Link> / {loadError === 'missing' ? 'Product not found' : 'Catalogue unavailable'}</p>
          <div className="shopempty" style={{ display: 'block', margin: '40px auto', maxWidth: '600px', textAlign: 'center' }}>
            <h2 className="shopempty__title">{loadError === 'missing' ? 'Piece not in catalogue' : 'Catalogue temporarily unavailable'}</h2>
            <p className="shopempty__body">{loadError === 'missing' ? <>The craft piece with code &quot;{code}&quot; is not currently listed.</> : 'Please refresh shortly. Your basket has not been changed.'}</p>
            <div className="actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--accent" href="/shop">Browse the e-shop</Link>
              <Link className="btn btn--outline" href="/contact">Contact Secretariat</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const primaryImg = product.image_path || (product.images && product.images[0]?.url) || '/assets/photos/image-unavailable.svg';

  // Build authentic gallery images without cross-craft photo bleeding
  let galleryImages: string[] = [];
  if (Array.isArray(product.gallery) && product.gallery.length > 0 && product.gallery[0].startsWith('/')) {
    galleryImages = product.gallery;
  } else if (Array.isArray(product.images) && product.images.length > 0) {
    galleryImages = product.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean);
  }

  if (galleryImages.length === 0) {
    galleryImages = [primaryImg];
  }

  return (
    <main id="main">

      {/* 1. Breadcrumbs & Product Detail */}
      <section className="section relative" data-hab-section="product-detail">
        <SectionEditBadge
          label={`Quick Edit: ${product.name}`}
          studioHref="/admin/products"
          sectionType="products"
          onEdit={() => setEditorOpen(true)}
        />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href={shopCraftHref(product.craftKey)}>
            <span aria-hidden="true">←</span> Back to {craft ? craft.name : 'E-shop'}
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/shop">E-shop</Link> / <Link href={shopCraftHref(product.craftKey)}>{craft ? craft.name : product.craftKey}</Link> / <span>{product.code}</span>
        </p>

        <div className="proddetail">

          {/* Left Column: Gallery & Thumbnails */}
          <div>
            <div className="gallery" id="prodMain" data-hab-gallery="product" data-hab-gallery-id={product.code}>
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
                  <button
                    type="button"
                    className="absolute inset-0 block h-full w-full cursor-zoom-in border-0 bg-transparent p-0"
                    onClick={() => { setActiveThumb(i); setLightboxScale(1); setLightboxOpen(true); }}
                    aria-label={`Enlarge ${product.name}, photo ${i + 1}`}
                  ><img
                    src={src}
                    alt={src === '/images/crafts/thagzo.jpg' ? 'Illustrative photograph of Bhutanese weaving' : `${product.name} view ${i + 1}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/assets/photos/image-unavailable.svg';
                    }}
                  /></button>
                </div>
              ))}
            </div>

              {galleryImages.length > 1 && (
              <>
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
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/assets/photos/image-unavailable.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="gallery__hint">Click a photo to enlarge.</p>
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
              Approx. {alt(product.priceUSD)}
            </p>

            <p className="eyebrow eyebrow--muted eyebrow--sm" role="status" aria-live="polite">
              {product.availability === 'MADE_TO_ORDER'
                ? 'Made to order'
                : product.availability === 'SOLD_OUT' || product.stock <= 0
                  ? 'Sold out'
                  : 'In stock'}
              {product.availability === 'MADE_TO_ORDER' && product.lead ? ` · ${product.lead}` : ''}
            </p>

            {product.description && <div className="prodbuy__desc" id="prodDesc" dangerouslySetInnerHTML={{ __html: preparePolicyHtml(String(product.description), { inheritTypography: true }).html }} />}

            <div className="prodbuy__actions">
              <label className="visually-hidden" htmlFor="prodQty">Quantity</label>
              <input
                className="input prodbuy__qty"
                id="prodQty"
                type="number"
                min="1"
                max={product.availability === 'MADE_TO_ORDER' ? 20 : Math.max(1, Math.min(20, product.stock))}
                value={quantity}
                disabled={product.availability !== 'IN_STOCK' || product.stock <= 0}
                onChange={(e) => setQuantity(Math.min(Math.max(1, product.availability === 'MADE_TO_ORDER' ? 20 : Math.min(20, product.stock)), Math.max(1, parseInt(e.target.value) || 1)))}
              />
              <button
                className="btn btn--accent prodbuy__add"
                type="button"
                id="prodAdd"
                onClick={handleAddToCart}
                disabled={!canPurchaseProduct(product.availability, product.stock, quantity)}
              >
                {product.availability === 'MADE_TO_ORDER' ? 'Add made-to-order to basket' : product.availability === 'SOLD_OUT' || product.stock <= 0 ? 'Sold out' : 'Add to basket'}
              </button>
              <button
                className="btn btn--outline"
                type="button"
                id="prodBuy"
                onClick={handleBuyNow}
                disabled={!canPurchaseProduct(product.availability, product.stock, quantity)}
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
              {([
                ['Dimensions', product.size],
                ['Weight', product.weight],
                ['Materials', product.materials],
                ['Care instructions', product.care],
                ['Dispatch & Lead', product.lead],
              ] as const).filter(([, value]) => value).map(([label, value]) => (
                <div className="deeplist__row" key={label}>
                  <dt className="deeplist__key">{label}</dt>
                  <dd className="deeplist__val">{value}</dd>
                </div>
              ))}
            </dl>

            {craft && (
              <Link className="link-accent" id="prodCraftLink" href={`/craft/${craft.key}`} style={{ display: 'inline-block', marginTop: '18px' }}>
                About this craft →
              </Link>
            )}

            {/* Maker Accreditation Card */}
            {product.maker && <div className="makerpanel" id="prodMakerPanel" style={{ marginTop: '24px' }}>
              <span className="makerpanel__avatar" style={{ overflow: 'hidden' }}>
                {product.maker_avatar
                  ? <img src={product.maker_avatar} alt={product.maker} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : product.maker.slice(0, 1)}
              </span>
              <span className="makerpanel__body">
                <span className="eyebrow eyebrow--muted eyebrow--sm">Made by</span>
                <span className="makerpanel__name" id="prodMaker">{product.maker}</span>
                {(product.region || product.maker_since) && <span className="makerpanel__meta" id="prodMakerMeta">{[product.region, product.maker_since && `Member since ${product.maker_since}`].filter(Boolean).join(' · ')}</span>}
                {product.maker_blurb && <span className="makerpanel__blurb clamp-2" id="prodMakerBlurb">{product.maker_blurb}</span>}
              </span>
              <span className="makerpanel__go" id="prodMakerLink">✓</span>
            </div>}

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
              <span>ecure payment</span>
            </h3>
            <p className="assurance__body">Pay by mBoB or bank transfer. HAB confirms every payment.</p>
          </div>
        </div>
      </section>

      {/* 3. Related Products */}
      <section className="section section--last" id="prodRelatedSection">
        <div className="section__head">
          <h2 className="display display--sub" id="prodRelatedTitle">More from this craft</h2>
          <Link className="btn btn--ink btn--sm" id="prodRelatedAll" href={shopCraftHref(product.craftKey)}>
            Shop the category →
          </Link>
        </div>

        {related.length > 0 ? (
        <div className="grid grid--4" id="prodRelated">
          {related.slice(0, 4).map((rp: any) => (
            <article key={rp.code} data-hab-record-key={`product:${rp.code}`} className="card product">
              <Link className="product__shot" href={productHref(rp.code)}>
                <figure className="frame frame--square">
                  <img
                    src={rp.image_path || rp.imageUrl || '/assets/photos/image-unavailable.svg'}
                    alt={rp.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = '/assets/photos/image-unavailable.svg'; }}
                  />
                </figure>
                <span className="product__ref">{rp.code}</span>
              </Link>
              <div className="card__body">
                <p className="eyebrow eyebrow--accent eyebrow--sm">{rp.craft_name || rp.craftKey}</p>
                <h3 className="card__title clamp-2">
                  <Link href={productHref(rp.code)}>{rp.name}</Link>
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
        ) : (
          <p className="section__lede" id="prodRelatedEmpty">
            There are no other published products in this craft yet.
          </p>
        )}
      </section>
      
      {lightboxOpen && (
        <div role="dialog" aria-modal="true" aria-label={`${product.name} photo viewer`} onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(18,14,12,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close photo viewer" style={{ position: 'absolute', right: 18, top: 14, color: 'white', fontSize: 30, background: 'transparent', border: 0, cursor: 'pointer' }}>×</button>
          {galleryImages.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); setActiveThumb((activeThumb - 1 + galleryImages.length) % galleryImages.length); setLightboxScale(1); }} aria-label="Previous photo" style={{ position: 'absolute', left: 14, top: '50%', color: 'white', fontSize: 34, background: 'transparent', border: 0, cursor: 'pointer' }}>‹</button>}
          <img src={galleryImages[activeThumb] || primaryImg} alt={`${product.name} enlarged view ${activeThumb + 1}`} onClick={(event) => event.stopPropagation()} onWheel={(event) => { event.preventDefault(); setLightboxScale((scale) => Math.min(4, Math.max(1, scale + (event.deltaY < 0 ? 0.2 : -0.2)))); }} style={{ maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain', transform: `scale(${lightboxScale})`, transition: 'transform .12s ease', touchAction: 'pinch-zoom' }} />
          <div onClick={(event) => event.stopPropagation()} style={{ position: 'absolute', bottom: 16, display: 'flex', alignItems: 'center', gap: 12, color: 'white' }}>
            <button type="button" onClick={() => setLightboxScale((scale) => Math.max(1, scale - 0.25))} aria-label="Zoom out" style={{ color: 'white', background: '#33261F', border: '1px solid #fff8', borderRadius: 8, padding: '8px 13px' }}>−</button>
            <span>{Math.round(lightboxScale * 100)}%</span>
            <button type="button" onClick={() => setLightboxScale((scale) => Math.min(4, scale + 0.25))} aria-label="Zoom in" style={{ color: 'white', background: '#33261F', border: '1px solid #fff8', borderRadius: 8, padding: '8px 13px' }}>+</button>
            {galleryImages.length > 1 && <span>{activeThumb + 1} / {galleryImages.length}</span>}
          </div>
          {galleryImages.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); setActiveThumb((activeThumb + 1) % galleryImages.length); setLightboxScale(1); }} aria-label="Next photo" style={{ position: 'absolute', right: 14, top: '50%', color: 'white', fontSize: 34, background: 'transparent', border: 0, cursor: 'pointer' }}>›</button>}
        </div>
      )}

      <ProductQuickEdit
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        code={code}
      />
    </main>
  );
}
