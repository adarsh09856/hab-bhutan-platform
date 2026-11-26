'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CRAFTS } from '@/lib/data';

const PRODUCT_TYPES = ['Textiles', 'Clothing & accessories', 'Home & living', 'Jewellery', 'Art & decor', 'Paper & stationery', 'Food & gifts', 'Other'] as const;

type TraderCard = {
  id: string; slug: string; shopName: string; dzongkhag: string; town: string;
  shortDescription: string; craftKeys: string[]; productTypes: string[]; bannerUrl: string | null; productPhotoUrls?: string[];
};

export default function TraderDirectory({ traders, initialQuery = '' }: { traders: TraderCard[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [dzongkhag, setDzongkhag] = useState('');
  const [craft, setCraft] = useState('');
  const [productType, setProductType] = useState('');
  const [limit, setLimit] = useState(12);
  const dzongkhags = useMemo(() => [...new Set(traders.map((item) => item.dzongkhag).filter(Boolean))].sort(), [traders]);
  const crafts = useMemo(() => [...new Set(traders.flatMap((item) => item.craftKeys || []).filter(Boolean))].sort(), [traders]);
  const craftLabel = (key: string) => {
    const normalized = key.trim().toLowerCase();
    const craft = CRAFTS.find((item) => [item.key, item.id, item.name, item.english].some((value) => value.toLowerCase() === normalized));
    return craft ? `${craft.name} · ${craft.english}` : key;
  };
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return traders.filter((item) => (!dzongkhag || item.dzongkhag === dzongkhag)
      && (!craft || item.craftKeys.some((key) => key.toLowerCase() === craft.toLowerCase()))
      && (!productType || (item.productTypes || []).some((type) => type.toLowerCase() === productType.toLowerCase()))
      && (!needle || [item.shopName, item.town, item.dzongkhag, item.shortDescription, ...item.craftKeys.flatMap((key) => [key, craftLabel(key)]), ...(item.productTypes || [])].some((value) => String(value || '').toLowerCase().includes(needle))));
  }, [traders, query, dzongkhag, craft, productType]);

  return <>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6" role="search" aria-label="Search accredited traders">
      <label className="sr-only" htmlFor="trader-search">Search traders</label>
      <input id="trader-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(12); }} placeholder="Search by shop, town or craft" className="w-full rounded-lg border border-[#D9CBB9] bg-white px-4 py-3" />
      <label className="sr-only" htmlFor="trader-dzongkhag">Filter by dzongkhag</label>
      <select id="trader-dzongkhag" value={dzongkhag} onChange={(event) => { setDzongkhag(event.target.value); setLimit(12); }} className="rounded-lg border border-[#D9CBB9] bg-white px-3 py-3"><option value="">All dzongkhags</option>{dzongkhags.map((place) => <option key={place}>{place}</option>)}</select>
      <label className="sr-only" htmlFor="trader-craft">Filter by craft</label>
      <select id="trader-craft" value={craft} onChange={(event) => { setCraft(event.target.value); setLimit(12); }} className="rounded-lg border border-[#D9CBB9] bg-white px-3 py-3"><option value="">All crafts</option>{crafts.map((item) => <option key={item}>{item}</option>)}</select>
      <label className="sr-only" htmlFor="trader-product-type">Filter by product type</label>
      <select id="trader-product-type" value={productType} onChange={(event) => { setProductType(event.target.value); setLimit(12); }} className="rounded-lg border border-[#D9CBB9] bg-white px-3 py-3"><option value="">All product types</option>{PRODUCT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
    </div>
    <p className="text-sm text-[#6B5A4C] mb-4" aria-live="polite">{filtered.length} accredited {filtered.length === 1 ? 'trader' : 'traders'}</p>
    {filtered.length === 0 ? <div className="shopempty"><h2 className="shopempty__title">{traders.length ? 'No matching trader listings' : 'No trader listings are published yet'}</h2><p className="shopempty__body">{traders.length ? 'Try changing your search or filters.' : 'The Secretariat manages accredited trader listings.'}</p></div> : <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.slice(0, limit).map((trader) => {
          const photo = trader.bannerUrl;
          return <article key={trader.id} className="card overflow-hidden">
            <Link href={`/traders/${encodeURIComponent(trader.slug)}`} className="block h-full">
              <div className="relative aspect-[4/3] bg-[#eee5d8]">{photo ? <Image src={photo} alt={`${trader.shopName} shop`} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-sm text-[#806d5b]">Shop photo not provided</span>}</div>
              <div className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="eyebrow eyebrow--accent">{trader.town}, {trader.dzongkhag}</p><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">HAB Verified</span></div><h2 className="display display--panel">{trader.shopName}</h2><p className="mt-2 text-sm">{trader.shortDescription}</p>{trader.craftKeys?.length > 0 && <p className="mt-3 text-xs text-[#6B5A4C]">Crafts: {trader.craftKeys.map(craftLabel).join(', ')}</p>}{trader.productTypes?.length > 0 && <p className="mt-2 text-xs text-[#6B5A4C]">Products: {trader.productTypes.join(', ')}</p>}<span className="link-accent mt-4 inline-block">View trader details →</span></div>
            </Link>
          </article>;
        })}
      </div>
      {limit < filtered.length && <div className="text-center mt-8"><button type="button" className="btn btn--outline" onClick={() => setLimit((value) => value + 12)}>Load 12 more</button></div>}
    </>}
  </>;
}
