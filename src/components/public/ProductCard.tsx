'use client';

import React from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  code: string;
  name: string;
  priceUSD: number;
  craftKey: string;
  region: string;
  maker: string;
  stock?: number;
}

export default function ProductCard({
  code,
  name,
  priceUSD,
  craftKey,
  region,
  maker,
  stock = 12,
}: ProductCardProps) {
  const { fmt } = useCurrency();
  const { addToCart } = useCart();
  const isOutOfStock = stock <= 0;

  return (
    <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] overflow-hidden flex flex-col hover:border-[#CFC0AC] transition-colors duration-150 group">
      <Link href={`/product/${code}`} className="block relative aspect-square ph-light border-b border-[#E4DDD1] flex items-center justify-center">
        <span className="font-mono text-[10.5px] text-[#86745F] bg-[#FFFCF8] px-[10px] py-[5px] rounded-[5px] border border-[#E4DDD1]">
          {code}
        </span>
        {isOutOfStock && (
          <div className="absolute top-3 right-3 bg-[#33261F] text-white font-mono text-[10px] uppercase px-2 py-1 rounded">
            Out of stock
          </div>
        )}
      </Link>

      <div className="p-[15px_16px_16px] flex flex-col gap-1 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8B2E24]">
          {craftKey}
        </div>
        <Link
          href={`/product/${code}`}
          className="font-figtree font-semibold text-[15.5px] text-[#33261F] hover:text-[#8B2E24] transition-colors line-clamp-2"
        >
          {name}
        </Link>
        <div className="text-[13.5px] text-[#6B5A4C] font-lora">
          {maker} · {region}
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
            {isOutOfStock ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
