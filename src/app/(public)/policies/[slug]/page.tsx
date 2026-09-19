import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { PolicyContentRenderer } from '@/components/policy/PolicyContentRenderer';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export const dynamic = 'force-dynamic';

interface PolicyRouteProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

const DEFAULT_POLICIES: Record<string, { title: string; lede: string; content: string }> = {
  'shipping-policy': {
    title: 'Shipping, Tracking & Heritage Certification Policy',
    lede: 'How orders placed with the Handicrafts Association of Bhutan are packed, shipped, charged, duty-cleared and returned.',
    content: `Every physical piece ordered through the Handicrafts Association of Bhutan central shop is dispatched directly from our Secretariat Quality & Assurance Hub at Kawajangsa, Thimphu, Kingdom of Bhutan.

## 1. International Courier & Dispatch
Orders are inspected by master evaluators and packaged with authentic seal certificates. Standard shipping is provided via Bhutan Post International Express Mail Service (EMS), with typical transit times of 7 to 14 business days worldwide. Express premium courier via DHL is available for select destinations (3 to 5 business days).

## 2. Customs, Duties & Export Declarations
Every parcel includes an official commercial invoice, export declaration under the CSO Act of Bhutan 2007, and a Seal of Authenticity certifying the traditional arts and crafts classification. Destination import duties and local taxes remain the responsibility of the recipient.

## 3. Tracking & Transit Verification
Upon dispatch, a live tracking code is generated and emailed to the purchaser. Order milestones can be tracked live anytime via the Track Order portal.

## 4. Returns & Refunds
Handcrafted pieces inherently possess organic variations in dye, texture, and weave. In the event an item arrives damaged in transit or exhibits craft structural defects, HAB provides a 14-day replacement or refund policy upon photographic verification.`,
  },
  'terms': {
    title: 'Terms of Service & Artisan Buy-Out Charter',
    lede: 'The statutory terms on which the Handicrafts Association of Bhutan provides this website, sells craft works, and admits member artisans.',
    content: `## 1. Apex CSO Mandate
The Handicrafts Association of Bhutan (HAB) is an apex non-profit Civil Society Organization registered under the CSO Act of Bhutan 2007 (Registration: CSO/2011/043). All commercial operations are governed by our AoA 2026 to ensure equitable remuneration for traditional artisans.

## 2. Artisan Buy-Out & Fair Remuneration
HAB operates on an upfront purchase model. Every handcrafted item featured on this platform is purchased outright from registered members at fair, agreed prices prior to listing. Artisans do not carry consignment risk or wait for retail sales to receive payment.

## 3. Authenticity & Returns
Handcrafted pieces inherently possess organic variations in dye, texture, and weave. In the event an item arrives damaged in transit or exhibits craft structural defects, HAB provides a 14-day replacement or refund policy upon photographic verification.

## 4. Intellectual Property & Cultural Heritage
All indigenous motifs, patterns, and traditional craft documentation published on this website are protected cultural heritage assets of the Kingdom of Bhutan and registered members of HAB. Unauthorized automated bulk extraction, commercial resale, or misleading derivation is strictly prohibited.`,
  },
  'privacy': {
    title: 'Privacy Policy & Member Data Protection',
    lede: 'How member records, donor receipts, purchaser details, and personal communications are protected under Bhutanese data governance standards.',
    content: `## 1. Data Collection & Purpose
HAB collects only the minimum personal data required to fulfill craft orders, issue donor tax receipts, process membership applications, and verify wholesale trade accounts.

## 2. Member Directory & Consent
In accordance with Bhutanese data protection best practices and our 2026 governance charter, member names and personal contact details are never published without documented affirmative consent. Public directories display verified counts by dzongkhag and craft rather than unsolicited personal listings.

## 3. Third-Party Disclosures & Security
We never sell, rent, or monetize personal information. Data is shared strictly with essential logistical partners (Bhutan Post EMS, DHL) and payment gateways (Bank of Bhutan, RMA-authorized processors) solely to execute transactions. All communication sessions are secured with high-grade TLS encryption.`,
  },
};

async function getPolicy(slug: string) {
  const cleanSlug = slug.toLowerCase().trim();

  try {
    const dbPolicy = await prisma.policyPage.findUnique({
      where: { slug: cleanSlug },
    });

    if (dbPolicy) {
      return {
        slug: dbPolicy.slug,
        title: dbPolicy.title,
        content: dbPolicy.content,
        updatedAt: dbPolicy.updatedAt,
        isCustom: true,
      };
    }
  } catch (err) {
    console.error('Error fetching policy page:', err);
  }

  // Fallback to statutory default policies
  if (DEFAULT_POLICIES[cleanSlug]) {
    const def = DEFAULT_POLICIES[cleanSlug];
    return {
      slug: cleanSlug,
      title: def.title,
      content: def.content,
      lede: def.lede,
      updatedAt: new Date(),
      isCustom: false,
    };
  }

  // Also check if slug is 'shipping' alias for 'shipping-policy'
  if (cleanSlug === 'shipping' && DEFAULT_POLICIES['shipping-policy']) {
    const def = DEFAULT_POLICIES['shipping-policy'];
    return {
      slug: 'shipping-policy',
      title: def.title,
      content: def.content,
      lede: def.lede,
      updatedAt: new Date(),
      isCustom: false,
    };
  }

  return null;
}

export async function generateMetadata({ params }: PolicyRouteProps): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const policy = await getPolicy(resolved.slug);

  if (!policy) {
    return { title: 'Policy Not Found · HAB' };
  }

  return {
    title: `${policy.title} · Handicrafts Association of Bhutan`,
    description: `Official statutory policy of the Handicrafts Association of Bhutan governed by the CSO Act 2007.`,
  };
}

export default async function DynamicPolicyPage({ params }: PolicyRouteProps) {
  const resolved = await Promise.resolve(params);
  const slug = resolved.slug;

  if (!slug) {
    notFound();
  }

  const policy = await getPolicy(slug);

  if (!policy) {
    notFound();
  }

  const lastReviewed = policy.updatedAt
    ? new Date(policy.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'September 2026';

  // Extract headings for sticky on-page nav if present
  const lines = policy.content.split('\n');
  const headings = lines
    .filter((l) => l.trim().startsWith('## '))
    .map((l) => {
      const headingText = l.trim().replace(/^##\s+/, '');
      const anchorId = headingText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return { text: headingText, id: anchorId };
    });

  return (
    <main id="main">
      <section className="section relative" data-hab-section="policy-detail">
        <SectionEditBadge
          label="Policies Studio"
          studioHref="/admin/policies"
          className="top-3 right-3 sm:right-6"
        />

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/policies">Policies</Link> / <span>{policy.title}</span>
        </p>

        <h1 className="display display--page">{policy.title}</h1>
        <p className="lede">
          Official statutory charter and policy governed under the Civil Society Organizations Act of Bhutan 2007.
          Last reviewed {lastReviewed}.
        </p>
      </section>

      <section className="section section--last">
        <div className="policy">
          {headings.length > 0 && (
            <nav className="policy__nav" aria-label="On this page">
              {headings.map((h) => (
                <a key={h.id} href={`#${h.id}`}>
                  {h.text}
                </a>
              ))}
            </nav>
          )}

          <div className="policy__body">
            <PolicyContentRenderer content={policy.content} />
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Verified Statutory Document · Registration CSO/2011/043</span>
          </div>
          <Link
            href="/policies"
            className="text-[#8B2E24] hover:underline font-semibold flex items-center gap-1"
          >
            ← View All Statutory Policies &amp; Charters
          </Link>
        </div>
      </section>
    </main>
  );
}
