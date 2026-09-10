'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CRAFTS } from '@/lib/data';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/public/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fmt, alt } = useCurrency();
  const { addToCart } = useCart();

  const code = (params.code as string) || '';

  const [product, setProduct] = React.useState<any | null>(null);
  const [craft, setCraft] = React.useState<any | null>(null);
  const [makerMember, setMakerMember] = React.useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/products/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.product) {
          const p = data.product;
          setProduct({
            ...p,
            desc: p.description || p.desc || p.material,
            price: p.priceUSD || p.price,
            maker: typeof p.maker === 'object' ? p.maker?.name : p.maker,
          });
          if (p.craft) {
            setCraft(p.craft);
          } else if (p.craftKey) {
            setCraft(CRAFTS.find((c) => c.key === p.craftKey) || null);
          }
          if (p.maker) setMakerMember(p.maker);
        }
        if (data?.related && data.related.length > 0) {
          setRelatedProducts(data.related);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [code]);

  const handleBuyNow = () => {
    if (product) {
      addToCart(product.code);
      router.push('/basket');
    }
  };

  if (loading) {
    return (
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/3] bg-slate-100 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-slate-100 rounded animate-pulse" />
            <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-24 w-full bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-24 text-center">
        <div className="max-w-md mx-auto bg-[#FFFCF8] border border-[#E4DDD1] rounded-2xl p-8">
          <h2 className="font-marcellus text-2xl text-[#33261F] mb-3">Product Not Found</h2>
          <p className="font-lora text-sm text-[#6B5A4C] mb-6">
            The craft piece with code &quot;{code}&quot; could not be located or may have been rotated out of the active catalog.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#8B2E24] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6E241C] transition-colors"
          >
            Browse E-Shop Catalog →
          </Link>
        </div>
      </main>
    );
  }

  const safeCraft = craft || { key: product.craftKey || 'thagzo', name: 'Traditional Craft', english: 'Bhutanese Heritage' };

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6 sm:mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/shop" className="hover:underline">E-shop</Link> /{' '}
        <Link href={`/shop/${safeCraft.key}`} className="hover:underline">{safeCraft.name}</Link> /{' '}
        <span>{product.code}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-start mb-16 sm:mb-24">
        {/* Left: Gallery */}
        <div className="grid grid-cols-2 gap-3">
          <div data-cms-img className="col-span-2 aspect-[4/3] rounded-[12px] bg-[#F5EFE6] border border-[#E4DDD1] overflow-hidden relative shadow-sm">
            <img
              src={`/images/products/${product.code.toLowerCase()}.jpg`}
              alt={`${product.name} — ${product.code}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 z-10 font-mono text-[11px] text-[#33261F] bg-[#FFFCF8]/90 backdrop-blur-sm px-2.5 py-1 rounded-[5px] border border-[#E4DDD1]">
              {product.code} · Primary angle
            </span>
          </div>
          <div data-cms-img className="aspect-square rounded-[12px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden relative">
            <img
              src={`/images/crafts/${safeCraft.key}.jpg`}
              alt={`${safeCraft.name} tradition`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-2.5 left-2.5 z-10 font-mono text-[10px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-2 py-0.5 rounded">
              {safeCraft.english} detail
            </span>
          </div>
          <div data-cms-img className="aspect-square rounded-[12px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden relative">
            <img
              src="/images/training_workshop.jpg"
              alt="Artisan studio in Bhutan"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-2.5 left-2.5 z-10 font-mono text-[10px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-2 py-0.5 rounded">
              Workshop context
            </span>
          </div>
        </div>

        {/* Right: Buy Column */}
        <div className="flex flex-col">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8B2E24] mb-2">
            {safeCraft.name} · {safeCraft.english}
          </div>
          <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[38px] font-normal leading-[1.08] text-[#33261F] mb-3">
            {product.name}
          </h1>

          <div className="mb-6">
            <div className="font-figtree font-bold text-2xl sm:text-[26px] text-[#33261F]">
              {fmt(product.price)}
            </div>
            <div className="font-lora text-xs sm:text-[13.5px] text-[#6B5A4C]">
              {alt(product.price)} · duties and local taxes payable on arrival
            </div>
          </div>

          <p className="font-lora text-sm sm:text-base lg:text-[16.5px] leading-[1.6] text-[#4A3C33] mb-6 sm:mb-8">
            {product.desc}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              type="button"
              onClick={() => addToCart(product.code)}
              className="flex-1 font-figtree font-semibold text-center text-[15px] bg-[#8B2E24] text-white p-3.5 sm:p-4 rounded-[9px] hover:bg-[#6E241C] transition-colors cursor-pointer"
            >
              Add to basket
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="font-figtree font-semibold text-center text-[15px] border border-[#33261F] text-[#33261F] px-6 py-3.5 sm:py-4 rounded-[9px] hover:bg-[#33261F] hover:text-white transition-colors cursor-pointer"
            >
              Buy now
            </button>
          </div>

          {/* Spec Table */}
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] divide-y divide-[#EFE9DE] mb-8">
            <div className="flex justify-between p-3 sm:p-[13px_16px] text-xs sm:text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Reference</span>
              <span className="font-mono text-xs sm:text-[13px] text-[#33261F]">{product.code}</span>
            </div>
            <div className="flex justify-between p-3 sm:p-[13px_16px] text-xs sm:text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Craft</span>
              <Link href={`/craft/${safeCraft.key}`} className="font-figtree text-[#8B2E24] hover:underline font-semibold">
                {safeCraft.name} · {safeCraft.english} →
              </Link>
            </div>
            <div className="flex justify-between p-3 sm:p-[13px_16px] text-xs sm:text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Origin</span>
              <span className="font-figtree text-[#33261F]">{product.region}, Bhutan</span>
            </div>
            <div className="flex justify-between p-3 sm:p-[13px_16px] text-xs sm:text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Made by</span>
              <span className="font-figtree text-[#33261F]">{product.maker}</span>
            </div>
            <div className="flex justify-between p-3 sm:p-[13px_16px] text-xs sm:text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Lead time</span>
              <span className="font-figtree text-[#33261F]">Ships in 2 working days</span>
            </div>
          </div>

          {/* Maker Card */}
          <Link
            href={`/members/${encodeURIComponent(product.maker)}`}
            className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-4 sm:p-[18px] flex items-center gap-4 hover:border-[#33261F] transition-colors group"
          >
            <div data-cms-avatar className="w-12 h-12 sm:w-[54px] sm:h-[54px] rounded-full bg-[#E8E1D4] border border-[#E4DDD1] flex-none overflow-hidden relative">
              <img
                src={`/images/crafts/${safeCraft.key}.jpg`}
                alt={product.maker}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B5A4C]">
                Made by
              </div>
              <div className="font-figtree font-semibold text-sm sm:text-[16px] text-[#33261F] group-hover:text-[#8B2E24] transition-colors truncate">
                {product.maker}
              </div>
              <div className="font-lora text-xs sm:text-[13.5px] text-[#6B5A4C] truncate">
                {product.region} · HAB verified member
              </div>
            </div>
            <span className="text-[#8B2E24] text-[18px] group-hover:translate-x-1 transition-transform flex-none">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Related Products */}
      <section className="border-t border-[#E4DDD1] pt-10 sm:pt-14">
        <h2 className="font-marcellus text-2xl sm:text-[30px] font-normal text-[#33261F] mb-6 sm:mb-8">
          More from {safeCraft.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-[22px]">
          {relatedProducts.map((p) => (
            <ProductCard
              key={p.code}
              code={p.code}
              name={p.name}
              priceUSD={p.price}
              craftKey={p.craftKey}
              region={p.region}
              maker={p.maker}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
