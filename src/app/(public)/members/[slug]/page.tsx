'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CLIENT_DATA, getCraftByKey } from '@/lib/client-data';
import { useCurrency } from '@/context/CurrencyContext';

export default function MemberProfilePage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const decodedName = decodeURIComponent(rawSlug || '');
  const { fmt } = useCurrency();

  const [member, setMember] = useState<any>(() => {
    return (
      (CLIENT_DATA.members || []).find(
        (m: any) => m.name.toLowerCase() === decodedName.toLowerCase()
      ) ||
      (CLIENT_DATA.recognised || []).find(
        (m: any) => m.name.toLowerCase() === decodedName.toLowerCase()
      ) || {
        name: decodedName || 'Karma Wangchuk',
        craft_key: 'thagzo',
        dzongkhag: 'Lhuentse',
        member_since: 2018,
        blurb:
          'Practising traditional backstrap weaving in Khoma. Specialising in intricate Kishuthara silk-on-cotton patterning with natural plant dyes.',
      }
    );
  });

  const [products, setProducts] = useState<any[]>(() => {
    return CLIENT_DATA.products.filter(
      (p) => p.craft_key === (member?.craft_key || 'thagzo')
    ).slice(0, 4);
  });

  useEffect(() => {
    if (!decodedName) return;
    fetch(`/api/members?slug=${encodeURIComponent(decodedName)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.member) {
          setMember({
            name: d.member.name,
            craft_key: d.member.craftKey,
            dzongkhag: d.member.dzongkhag,
            member_since: d.member.joinYear || 2020,
            blurb: d.member.bio || member.blurb,
          });
        }
      })
      .catch(() => {});

    fetch(`/api/products?craft=${encodeURIComponent(member?.craft_key || 'thagzo')}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.products && Array.isArray(d.products) && d.products.length > 0) {
          setProducts(
            d.products.slice(0, 4).map((p: any) => ({
              code: p.code,
              name: p.name,
              craft_key: p.craftKey || p.craft_key,
              region: p.region || member.dzongkhag,
              maker: p.maker?.name || p.maker || member.name,
              price_usd: p.priceUSD || p.price,
              image_path: p.images?.[0]?.url || '/assets/photos/product-sad03.jpg',
            }))
          );
        }
      })
      .catch(() => {});
  }, [decodedName, member?.craft_key]);

  const craft = getCraftByKey(member.craft_key) || {
    name: 'Craft',
    english: 'Traditional craft',
    key: member.craft_key || 'thagzo',
  };

  const cluster = CLIENT_DATA.clusters.find((c) => c.craft_key === craft.key) || CLIENT_DATA.clusters[0];

  return (
    <main id="main">
      {/* 1. Breadcrumb & Member Hero */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/members">Members</Link> / <span>{member.name}</span>
        </p>

        <div className="memberhero">
          <figure className="frame frame--square has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
            <Image
              src="/assets/photos/hero-1-weaving.jpg"
              alt={member.name}
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              style={{ objectFit: 'cover' }}
            />
          </figure>

          <div>
            <div className="memberitem__tags" style={{ marginBottom: 16 }}>
              <span className="tag">{craft.name}</span>
              <span className="tag tag--verified">HAB verified</span>
            </div>
            <h1 className="display display--page">{member.name}</h1>
            <p className="card__meta" style={{ fontSize: 16, margin: '0 0 24px' }}>
              {member.dzongkhag} · Member since {member.member_since || 2021}
            </p>
            <p className="lede">{member.blurb || member.bio}</p>

            <div className="actions" style={{ marginTop: 24 }}>
              <Link className="btn btn--accent" href={`/shop?craft=${craft.key}`}>
                Shop this craft →
              </Link>
              <Link className="btn btn--outline" href={`/craft/${craft.key}`}>
                About this craft →
              </Link>
              <Link className="btn btn--text" href="/contact?topic=wholesale">
                Request a wholesale quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Products Section */}
      {products.length > 0 && (
        <section className="section" id="memberProductsSection">
          <div className="section__head">
            <h2 className="display display--sub">In the HAB shop</h2>
            <Link className="link-accent" href="/shop">
              All products →
            </Link>
          </div>

          <div className="grid grid--4" id="memberProducts" data-cms-repeat>
            {products.map((p) => (
              <article key={p.code} className="card product" data-cms-item data-code={p.code}>
                <Link className="product__shot" href={`/product/${p.code}`}>
                  <figure className="frame frame--square has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={p.image_path || '/assets/photos/product-sad03.jpg'}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </figure>
                  <span className="product__ref">{p.code}</span>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{craft.name}</p>
                  <h3 className="card__title clamp-2">
                    <Link href={`/product/${p.code}`}>{p.name}</Link>
                  </h3>
                  <p className="card__meta clamp-1">
                    {p.maker} · {p.region}
                  </p>
                  <div className="card__foot">
                    <span className="price">{fmt(p.price_usd)}</span>
                    <Link className="btn btn--outline btn--xs" href={`/product/${p.code}`}>
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 3. Associated Cluster */}
      {cluster && (
        <section className="section section--last" id="memberClusterSection">
          <div className="panel">
            <p className="eyebrow eyebrow--accent">Cluster</p>
            <h2 className="display display--panel">{cluster.name}</h2>
            <p className="panel__body">{cluster.summary}</p>
            <Link className="btn btn--ink" href={`/clusters/${cluster.key}`}>
              Read the cluster story →
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
