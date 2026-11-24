'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { preparePolicyHtml } from '@/lib/policy-html';

type TradeProduct = {
  code: string;
  name: string;
  craftKey: string;
  craft?: { name?: string; english?: string } | null;
  maker?: { name?: string; dzongkhag?: string } | null;
  region?: string;
  description?: string;
  image_path?: string;
  images?: Array<{ url?: string } | string>;
  terms: { moq: number; lead_time?: string; tiers: number[][]; customisation?: string };
};

export default function WholesaleProductDetail({ code }: { code: string }) {
  const [product, setProduct] = useState<TradeProduct | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'login' | 'missing' | 'error'>('loading');
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const auth = await fetch('/api/wholesale/auth', { cache: 'no-store', credentials: 'include', signal: controller.signal });
        const authData = await auth.json();
        if (!authData?.authenticated) { setState('login'); return; }
        const response = await fetch('/api/trade', { cache: 'no-store', credentials: 'include', signal: controller.signal });
        if (response.status === 401 || response.status === 403) { setState('login'); return; }
        if (!response.ok) throw new Error('Wholesale catalogue is unavailable.');
        const data = await response.json();
        const found = (data.products || []).find((item: TradeProduct) => item.code.toUpperCase() === code.toUpperCase());
        if (!found?.terms) { setState('missing'); return; }
        setProduct(found);
        setQuantity(found.terms.moq);
        setState('ready');
      } catch (error) {
        if (!controller.signal.aborted) setState('error');
      }
    };
    load();
    return () => controller.abort();
  }, [code]);

  const images = useMemo(() => {
    const saved = (product?.images || []).map((image) => typeof image === 'string' ? image : image.url || '').filter(Boolean);
    const all = [product?.image_path || '', ...saved].filter(Boolean);
    return Array.from(new Set(all.length ? all : ['/assets/photos/image-unavailable.svg']));
  }, [product]);

  const unitPrice = useMemo(() => {
    const eligible = (product?.terms.tiers || []).filter(([minimum]) => quantity >= minimum).sort((a, b) => b[0] - a[0]);
    return eligible[0]?.[1] ?? product?.terms.tiers?.[0]?.[1] ?? 0;
  }, [product, quantity]);

  const addToQuote = () => {
    if (!product) return;
    try {
      const current = JSON.parse(localStorage.getItem('hab_quote_basket') || '{}');
      localStorage.setItem('hab_quote_basket', JSON.stringify({ ...current, [product.code]: quantity }));
      setAdded(true);
    } catch {
      setAdded(false);
    }
  };

  return (
    <main id="main">
      <section className="section section--narrow">
        <p className="crumbs"><Link href="/">Home</Link> / <Link href="/wholesale">Wholesale</Link> / <Link href="/wholesale/shop">Trade catalogue</Link> / {code}</p>
        {state === 'loading' && <p role="status">Loading trade product…</p>}
        {state === 'login' && <div className="shopempty"><h1 className="shopempty__title">Approved trade account required</h1><p className="shopempty__body">Sign in to view wholesale product details and trade terms.</p><Link className="btn btn--accent" href={`/wholesale/login?returnTo=${encodeURIComponent(`/wholesale/product/${code}`)}`}>Sign in to wholesale</Link></div>}
        {state === 'missing' && <div className="shopempty"><h1 className="shopempty__title">Trade product unavailable</h1><p className="shopempty__body">This item is no longer enabled for wholesale.</p><Link className="btn btn--outline" href="/wholesale/shop">Back to trade catalogue</Link></div>}
        {state === 'error' && <p role="alert">The wholesale catalogue could not be loaded. Refresh the page or return to the trade catalogue.</p>}
        {state === 'ready' && product && <>
          <div className="proddetail">
            <div>
              <div className="gallery" aria-label={`${product.name} product photographs`}>
                <img src={images[imageIndex] || images[0]} alt={`${product.name} view ${imageIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(event) => { (event.currentTarget as HTMLImageElement).src = '/assets/photos/image-unavailable.svg'; }} />
              </div>
              {images.length > 1 && <div className="gallery__thumbs" aria-label="Product views">
                {images.map((src, index) => <button type="button" key={`${src}-${index}`} aria-label={`Show product view ${index + 1}`} aria-pressed={index === imageIndex} onClick={() => setImageIndex(index)}><img src={src} alt="" /></button>)}
              </div>}
            </div>
            <div className="prodbuy">
              <p className="eyebrow eyebrow--accent">{product.craft?.name || product.craftKey}{product.craft?.english ? ` · ${product.craft.english}` : ''}</p>
              <h1 className="display display--prod">{product.name}</h1>
              <p className="prodbuy__price">${Number(unitPrice).toFixed(2)} <span className="text-sm font-normal">per unit at {quantity}+ units</span></p>
              <p className="prodbuy__alt">Estimated merchandise total: ${(Number(unitPrice) * quantity).toFixed(2)} USD</p>
              <p className="card__meta">{[product.maker?.name, product.region || product.maker?.dzongkhag].filter(Boolean).join(' · ')}</p>
              {product.description && <div className="prodbuy__desc" dangerouslySetInnerHTML={{ __html: preparePolicyHtml(String(product.description), { inheritTypography: true }).html }} />}
              <dl className="deeplist">
                <div className="deeplist__row"><dt className="deeplist__key">Minimum order</dt><dd className="deeplist__val">{product.terms.moq} units</dd></div>
                {product.terms.lead_time && <div className="deeplist__row"><dt className="deeplist__key">Lead time</dt><dd className="deeplist__val">{product.terms.lead_time}</dd></div>}
                {product.terms.customisation && <div className="deeplist__row"><dt className="deeplist__key">Made to order</dt><dd className="deeplist__val">{product.terms.customisation}</dd></div>}
              </dl>
              <div className="wstiers"><span className="wstiers__label">Unit price by quantity</span>{product.terms.tiers.map(([minimum, price]) => <span className="wstier" key={`${minimum}-${price}`}><span className="wstier__q">{minimum}+ units</span><span className="wstier__p">${Number(price).toFixed(2)} / unit</span></span>)}</div>
              <div className="prodbuy__actions">
                <label className="visually-hidden" htmlFor="trade-product-quantity">Quantity</label>
                <input id="trade-product-quantity" className="input prodbuy__qty" type="number" min={product.terms.moq} step="1" value={quantity} onChange={(event) => setQuantity(Math.max(product.terms.moq, Number(event.target.value) || product.terms.moq))} />
                <button type="button" className="btn btn--accent prodbuy__add" onClick={addToQuote}>Add to quote basket</button>
              </div>
              {added && <p role="status">Added to your quote basket.</p>}
              <div className="actions"><Link className="btn btn--outline" href="/wholesale/shop">Continue shopping</Link><Link className="btn btn--ink" href="/wholesale/cart">Open quote basket</Link></div>
            </div>
          </div>
        </>}
      </section>
    </main>
  );
}
