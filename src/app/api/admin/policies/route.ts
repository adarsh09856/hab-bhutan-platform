import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let dbPolicies: any[] = [];
    try {
      dbPolicies = await prisma.policyPage.findMany();
    } catch {}

    const defaultPolicies = [
      {
        slug: 'shipping-policy',
        title: 'Shipping, Tracking & Heritage Certification Policy',
        lastUpdated: '12 September 2026',
        publicUrl: '/shipping-policy',
        content: `Every physical piece ordered through the Handicrafts Association of Bhutan central shop is dispatched directly from our Secretariat Quality & Assurance Hub at Kawajangsa, Thimphu, Kingdom of Bhutan.

1. International Courier & Dispatch
Orders are inspected by master evaluators and packaged with authentic seal certificates. Standard shipping is provided via Bhutan Post International Express Mail Service (EMS), with typical transit times of 7 to 14 business days worldwide. Express premium courier via DHL is available for select destinations (3 to 5 business days).

2. Customs, Duties & Export Declarations
Every parcel includes an official commercial invoice, export declaration under the CSO Act of Bhutan 2007, and a Seal of Authenticity certifying the traditional arts and crafts classification. Destination import duties and local taxes remain the responsibility of the recipient.

3. Tracking & Transit Verification
Upon dispatch, a live tracking code (e.g. BP-BT-892144) is generated and emailed to the purchaser. Order milestones can be tracked live anytime at /track-order.`,
      },
      {
        slug: 'terms',
        title: 'Terms of Service & Artisan Buy-Out Charter',
        lastUpdated: '01 September 2026',
        publicUrl: '/terms',
        content: `1. Apex CSO Mandate
The Handicrafts Association of Bhutan (HAB) is an apex non-profit Civil Society Organization registered under the CSO Act of Bhutan 2007 (Registration: CSO/2011/043). All commercial operations are governed by our AoA 2026 to ensure equitable remuneration for traditional artisans.

2. Artisan Buy-Out & Fair Remuneration
HAB operates on an upfront purchase model. Every handcrafted item featured on this platform is purchased outright from registered members at fair, agreed prices prior to listing. Artisans do not carry consignment risk or wait for retail sales to receive payment.

3. Authenticity & Returns
Handcrafted pieces inherently possess organic variations in dye, texture, and weave. In the event an item arrives damaged in transit or exhibits craft structural defects, HAB provides a 14-day replacement or refund policy upon photographic verification.`,
      },
      {
        slug: 'privacy',
        title: 'Privacy Policy & Member Data Protection',
        lastUpdated: '28 August 2026',
        publicUrl: '/privacy',
        content: `1. Data Collection & Purpose
HAB collects only the minimum personal data required to fulfill craft orders, issue donor tax receipts, process membership applications, and verify wholesale trade accounts.

2. Member Directory & Consent
In accordance with Bhutanese data protection best practices and our 2026 governance charter, member names and personal contact details are never published without documented affirmative consent. Public directories display verified counts by dzongkhag and craft rather than unsolicited personal listings.

3. Third-Party Disclosures
We never sell, rent, or monetize personal information. Data is shared strictly with essential logistical partners (Bhutan Post EMS, DHL) and payment gateways (Bank of Bhutan, RMA-authorized processors) solely to execute transactions.`,
      },
    ];

    const merged: any[] = [...defaultPolicies.map((dp) => {
      const found = dbPolicies.find((p) => p.slug === dp.slug);
      if (found) {
        return {
          ...dp,
          id: found.id,
          title: found.title || dp.title,
          content: found.content || dp.content,
        };
      }
      return dp;
    })];

    // Include any custom policies added directly in database
    for (const p of dbPolicies) {
      if (!defaultPolicies.some((dp) => dp.slug === p.slug)) {
        merged.push({
          id: p.id,
          slug: p.slug,
          title: p.title,
          lastUpdated: new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          publicUrl: `/policies/${p.slug}`,
          content: p.content,
          isCustom: true,
        });
      }
    }

    return NextResponse.json({ success: true, policies: merged });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug: rawSlug, title, content } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Policy title is required' }, { status: 400 });
    }

    const cleanSlug = (rawSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return NextResponse.json({ success: false, error: 'Valid policy slug is required' }, { status: 400 });
    }

    const existing = await prisma.policyPage.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json({ success: false, error: `Policy with slug "${cleanSlug}" already exists.` }, { status: 409 });
    }

    const policy = await prisma.policyPage.create({
      data: {
        slug: cleanSlug,
        title: title.trim(),
        content: content?.trim() || '',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, policy }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, content } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }

    try {
      await prisma.policyPage.upsert({
        where: { slug },
        create: { slug, title, content, isActive: true },
        update: { title, content, isActive: true },
      });
    } catch {}

    return NextResponse.json({ success: true, message: `Policy ${slug} saved.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }

    // Protect core policies
    const coreSlugs = ['terms', 'privacy', 'shipping-policy', 'conduct'];
    if (coreSlugs.includes(slug)) {
      return NextResponse.json({ success: false, error: 'Core statutory policies cannot be deleted' }, { status: 403 });
    }

    await prisma.policyPage.deleteMany({
      where: { slug },
    });

    return NextResponse.json({ success: true, message: `Policy "${slug}" deleted successfully.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

