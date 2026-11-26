'use client';

import React from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { productHref } from '@/lib/product-routes';
import { productCardImageUrl } from '@/lib/product-image-fallbacks';

export interface ProductCardProps {
  code: string;
  slug?: string | null;
  name: string;
  priceUSD: number;
  craftKey: string;
  region: string;
  maker: string;
  stock?: number;
  availability?: string;
  imageUrl?: string;
  images?: any;
}

export default function ProductCard({
  code,
  slug,
  name,
  priceUSD,
  craftKey,
  region,
  maker,
  stock = 0,
  availability = stock > 0 ? 'IN_STOCK' : 'SOLD_OUT',
  imageUrl,
  images,
}: ProductCardProps) {
  const { fmt } = useCurrency();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const isMadeToOrder = availability === 'MADE_TO_ORDER';
  const isOutOfStock = availability === 'SOLD_OUT' || (availability !== 'MADE_TO_ORDER' && stock <= 0);

  const resolvedImage =
    imageUrl || 
    (Array.isArray(images) && images[0]?.url) || 
    (images && typeof images === 'object' && images.url) || 
    '/assets/photos/image-unavailable.svg';
  const resolvedInitialImage = productCardImageUrl(String(resolvedImage));

  const [imgSrc, setImgSrc] = React.useState(resolvedInitialImage);

  React.useEffect(() => {
    setImgSrc(resolvedInitialImage);
  }, [resolvedInitialImage]);

  return (
    <div data-hab-record-key={`product:${code}`} className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] overflow-hidden flex flex-col hover:border-[#CFC0AC] transition-all duration-200 group shadow-xs hover:shadow-md">
      <Link href={productHref(code, slug)} data-cms-img data-hab-gallery="product" data-hab-gallery-id={code} data-hab-gallery-view="card" className="block relative aspect-square bg-[#F5EFE6] border-b border-[#E4DDD1] overflow-hidden">
        <img
          src={imgSrc}
          alt={imgSrc.includes('/assets/photos/image-unavailable.svg') ? `Photo unavailable for ${name}` : name}
          loading="lazy"
          className="transition-transform duration-500 ease-out group-hover:scale-105 w-full h-full object-cover object-center"
          onError={() => {
            const placeholder = '/assets/photos/image-unavailable.svg';
            if (imgSrc === placeholder) return;
            setImgSrc(imgSrc === resolvedInitialImage && imgSrc !== resolvedImage ? resolvedImage : placeholder);
          }}
        />
        <div className="absolute top-3 right-3 z-10 bg-[#33261F] text-white font-mono text-[10px] uppercase px-2 py-1 rounded shadow-sm">
          {isMadeToOrder ? 'Made to order' : isOutOfStock ? t('shop.out_of_stock', 'Out of stock') : t('shop.in_stock', 'In stock')}
        </div>
      </Link>

      <div className="p-[15px_16px_16px] flex flex-col gap-1 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8B2E24]">
          {craftKey}
        </div>
        <div className="break-all font-mono text-[10px] text-[#6B5A4C]">{code}</div>
        <Link
          href={productHref(code, slug)}
          className="font-figtree font-semibold text-[15.5px] text-[#33261F] hover:text-[#8B2E24] transition-colors line-clamp-2"
        >
          {name}
        </Link>
        <div className="text-[13.5px] text-[#6B5A4C] font-lora">
          {[maker, region].filter(Boolean).join(' · ')}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="font-figtree font-bold text-[16px] text-[#33261F]">
            {fmt(priceUSD)}
          </div>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isOutOfStock) addToCart(code);
            }}
            className={`font-figtree text-[13px] font-semibold px-3 py-[7px] rounded-[6px] border transition-colors ${
              isOutOfStock
                ? 'border-[#E4DDD1] text-[#A8947F] cursor-not-allowed bg-transparent'
                : 'border-[#33261F] text-[#33261F] hover:bg-[#33261F] hover:text-[#F4F0E7] cursor-pointer'
            }`}
          >
            {isOutOfStock ? t('shop.out_of_stock', 'Out of stock') : isMadeToOrder ? 'Order' : t('shop.add_to_cart', 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
}
