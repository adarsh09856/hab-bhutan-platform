'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getCraftByKey } from '@/lib/client-data';
import { useCurrency } from '@/context/CurrencyContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { toMemberProfileView, toMemberProductViews } from '@/lib/member-profile-view';

export default function MemberProfilePage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const decodedName = decodeURIComponent(rawSlug || '');
  const { fmt } = useCurrency();

  const [member, setMember] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<'not-found' | 'unavailable' | null>(null);

  useEffect(() => {
    if (!decodedName) {
      setProfileError('not-found');
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setProfileError(null);
    fetch(`/api/members?slug=${encodeURIComponent(decodedName)}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.member) {
          setMember(null);
          setProducts([]);
          setProfileError(response.status === 404 ? 'not-found' : 'unavailable');
          return;
        }
        const record = data.member;
        setMember(toMemberProfileView(record));
        setProducts(toMemberProductViews(record.products || [], record));
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setMember(null);
          setProducts([]);
          setProfileError('unavailable');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [decodedName]);

  if (loading) {
    return <main id="main"><section className="section"><p className="eyebrow eyebrow--muted">Loading member profile…</p></section></main>;
  }

  if (!member) {
    const notFound = profileError === 'not-found';
    return (
      <main id="main">
        <section className="section">
          <p className="crumbs"><Link href="/">Home</Link> / <Link href="/members">Members</Link></p>
          <div className="shopempty" style={{ display: 'block', margin: '40px auto', maxWidth: '600px', textAlign: 'center' }}>
            <h1 className="shopempty__title">{notFound ? 'Member profile not found' : 'Member profile unavailable'}</h1>
            <p className="shopempty__body">{notFound ? 'This profile is not in the public verified-member directory.' : 'The member directory could not be reached. Please try again shortly.'}</p>
            <Link className="btn btn--accent" href="/members">Browse verified members</Link>
          </div>
        </section>
      </main>
    );
  }

  const craft = getCraftByKey(member.craft_key) || {
    name: 'Craft',
    english: 'Traditional craft',
    key: member.craft_key || 'thagzo',
  };

  const portraitImg = member.portraitUrl;

  return (
    <main id="main">
      {/* 1. Breadcrumb & Member Hero */}
      <section className="section relative" data-hab-section="member-profile">
        <SectionEditBadge label="Members Studio" studioHref="/admin/members" />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href="/members">
            <span aria-hidden="true">←</span> Back to Members
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/members">Members</Link> / <span>{member.name}</span>
        </p>

        <div className="memberhero">
          <figure className="frame frame--square has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
            {portraitImg ? <Image
              src={portraitImg}
              alt={member.name}
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              style={{ objectFit: 'cover' }}
            /> : <span aria-label={`${member.name} portrait not provided`} className="flex h-full w-full items-center justify-center text-4xl font-semibold">{member.name.slice(0, 1)}</span>}
          </figure>

          <div>
            <div className="memberitem__tags" style={{ marginBottom: 16 }}>
              <span className="tag">{craft.name}</span>
              <span className="tag tag--verified">HAB verified</span>
            </div>
            <h1 className="display display--page">{member.name}</h1>
            {(member.dzongkhag || member.member_since) && <p className="card__meta" style={{ fontSize: 16, margin: '0 0 24px' }}>
              {[member.dzongkhag, member.member_since && `Member since ${member.member_since}`].filter(Boolean).join(' · ')}
            </p>}
            {member.blurb && <p className="lede">{member.blurb}</p>}

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
                    {p.image_path && <Image
                      src={p.image_path || '/assets/photos/product-sad03.jpg'}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />}
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

    </main>
  );
}
