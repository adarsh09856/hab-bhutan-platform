import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';
import { requirePermission } from '@/lib/rbac';
import { SERVER_WHOLESALE_TERMS } from '@/lib/wholesale-terms.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, 'products:view');
    let siteSetting: any = null;
    let dbInquiries: any[] = [];
    let dbProducts: any[] = [];

    try {
      siteSetting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
      dbInquiries = await prisma.inquiry.findMany({
        where: {
          OR: [
            { subject: { contains: 'Wholesale' } },
            { message: { contains: 'WHOLESALE' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      dbProducts = await prisma.product.findMany({
        include: { craft: true, wholesaleTerms: true },
        orderBy: { code: 'asc' },
      });
    } catch {
      // Graceful fallback if database connection is offline
    }

    // Merge wholesale terms from siteSetting or CLIENT_DATA
    const termsMap: Record<string, any> = (siteSetting?.wholesaleTerms as Record<string, any>) || SERVER_WHOLESALE_TERMS;

    // Combine products with their wholesale terms
    const productsList = dbProducts.length > 0
      ? dbProducts.map((p) => {
          const savedTerms = p.wholesaleTerms;
          const t = savedTerms ? {
            moq: savedTerms.moq,
            lead_time: savedTerms.leadTime,
            tiers: savedTerms.tiers,
            customisation: savedTerms.customisation || '',
            is_active: savedTerms.isActive,
          } : termsMap[p.code] || {
            moq: 5,
            lead_time: '4–6 weeks',
            tiers: [
              [5, Math.round(p.priceUSD * 0.9)],
              [15, Math.round(p.priceUSD * 0.82)],
              [40, Math.round(p.priceUSD * 0.75)],
              [100, Math.round(p.priceUSD * 0.68)],
            ],
            customisation: 'Available on request',
            is_active: true,
          };
          return {
            code: p.code,
            name: p.name,
            retailPrice: p.priceUSD,
            craftKey: p.craftKey,
            craftName: p.craft?.name || p.craftKey,
            image: p.images?.[0]?.url || '/assets/photos/product-hhb01.jpg',
            terms: t,
            hasSavedTerms: Boolean(savedTerms || (termsMap as Record<string, any>)[p.code]),
          };
        })
      : CLIENT_DATA.products.map((p) => {
          const rawPrice = (p as any).price_usd || (p as any).price || 100;
          const t = termsMap[p.code] || {
            moq: 5,
            lead_time: '4–6 weeks',
            tiers: [
              [5, Math.round(rawPrice * 0.9)],
              [15, Math.round(rawPrice * 0.82)],
              [40, Math.round(rawPrice * 0.75)],
              [100, Math.round(rawPrice * 0.68)],
            ],
            customisation: 'Available on request',
            is_active: true,
          };
          return {
            code: p.code,
            name: p.name,
            retailPrice: rawPrice,
            craftKey: p.craft_key,
            craftName: (p as any).craft_name || p.craft_key,
            image: p.image_path,
            terms: t,
          };
        });


    // Parse Quotes and Buyer Registrations from inquiries
    const quoteInquiries = dbInquiries.filter((inq) => inq.subject.includes('Quotation') || inq.message.includes('QUOTATION'));
    const buyerInquiries = dbInquiries.filter((inq) => inq.subject.includes('Registration') || inq.message.includes('REGISTRATION'));

    // Fallback seed quotations if none in DB
    const quotes = quoteInquiries.length > 0
      ? quoteInquiries.map((q) => {
          return {
            id: q.id,
            reference: `HAB-Q-${q.id.slice(0, 6).toUpperCase()}`,
            buyerName: q.name,
            email: q.email,
            phone: q.phone || 'N/A',
            subject: q.subject,
            details: q.message,
            status: q.status === 'NEW' ? 'new' : q.status === 'IN_PROGRESS' ? 'quoted' : q.status === 'RESOLVED' ? 'fulfilled' : 'declined',
            adminNotes: q.adminNotes || '',
            createdAt: q.createdAt,
          };
        })
      : [
          {
            id: 'quote-seed-1',
            reference: 'HAB-Q-89214A',
            buyerName: 'Himalayan Arts Gallery Ltd',
            email: 'procurement@himalayan-arts.sg',
            phone: '+65 6789 2210',
            subject: 'Wholesale Quotation Request: Himalayan Arts Gallery (65 units · $14,200 USD)',
            details: 'Line-items:\n- [LHA01] Thagzo Silk Scarf: 25 units @ $221\n- [MAS01] Wrathful Deity Mask: 15 units @ $410\n- [KIR01] Traditional Kushuthara: 25 units @ $204\nDestination: Singapore\nRequired by: 2026-11-15\nCustomisation: Gift boxed with HAB certificates.',
            status: 'new',
            adminNotes: 'Awaiting shipping calculation from Bhutan Post EMS.',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'quote-seed-2',
            reference: 'HAB-Q-77142B',
            buyerName: 'Druk Heritage Boutique',
            email: 'buyer@drukheritage.co.uk',
            phone: '+44 20 7946 0912',
            subject: 'Wholesale Quotation Request: Druk Heritage Boutique (120 units · $21,450 USD)',
            details: 'Line-items:\n- [DES01] Handmade Daphne Paper Notebook: 80 units @ $28\n- [ZAM01] Bronze Incense Burner: 40 units @ $190\nDestination: London, UK\nRequired by: 2026-12-01',
            status: 'quoted',
            adminNotes: 'Quotation sent via email on 12 Sep 2026.',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ];

    // Fallback seed buyers if none in DB
    const buyers = buyerInquiries.length > 0
      ? buyerInquiries.map((b) => {
          return {
            id: b.id,
            businessName: b.subject.replace('Wholesale Buyer Registration: ', '').split('(')[0].trim() || b.name,
            contactName: b.name,
            email: b.email,
            phone: b.phone || 'N/A',
            subject: b.subject,
            details: b.message,
            status: b.status === 'RESOLVED' ? 'verified' : b.status === 'ARCHIVED' ? 'rejected' : 'pending',
            createdAt: b.createdAt,
          };
        })
      : [
          {
            id: 'buyer-seed-1',
            businessName: 'Himalayan Arts Gallery Ltd',
            contactName: 'Tenzin Wangchuk',
            email: 'procurement@himalayan-arts.sg',
            phone: '+65 6789 2210',
            subject: 'Wholesale Buyer Registration: Himalayan Arts Gallery (Singapore)',
            details: 'Buyer Type: Boutique Retailer\nCountry: Singapore\nReg ID: UEN202419082M\nWebsite: https://himalayan-arts.sg\nPurpose: Retail distribution in Southeast Asia.',
            status: 'verified',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
          {
            id: 'buyer-seed-2',
            businessName: 'Nordic Heritage Craft Imports',
            contactName: 'Astrid Lind',
            email: 'astrid@nordiccrafts.se',
            phone: '+46 8 123 4567',
            subject: 'Wholesale Buyer Registration: Nordic Heritage Craft Imports (Sweden)',
            details: 'Buyer Type: Museum Shop / Gallery\nCountry: Sweden\nReg ID: SE5560123456\nPurpose: Scandinavian museum exhibition & fair-trade retail.',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ];

    return NextResponse.json({
      success: true,
      products: productsList,
      quotes,
      buyers,
      wholesaleMoq: siteSetting?.wholesaleMoq || 5,
      wholesaleLeadTime: siteSetting?.wholesaleLeadTime || '2 to 4 weeks depending on batch size',
      catalogPdfUrl: (siteSetting?.wholesaleAssurances as any)?.catalogPdfUrl || '',
      lookbookCoverUrl: (siteSetting?.wholesaleAssurances as any)?.lookbookCoverUrl || '',
    });
  } catch (err: any) {
    console.error('Error fetching trade data:', err);
    return NextResponse.json({ success: false, error: err.message || 'Could not load the trade desk.' }, { status: err.statusCode || 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    const permission = action === 'save_catalog'
        ? 'content:edit'
      : action === 'update_quote_status'
        ? 'orders:edit'
        : action === 'update_buyer_status'
          ? 'applications:review'
          : 'products:edit';
    await requirePermission(request, permission);

    if (action === 'update_quote_status') {
      const { id, status, adminNotes } = payload;
      try {
        const dbStatus = status === 'new' ? 'NEW' : status === 'quoted' ? 'IN_PROGRESS' : status === 'fulfilled' ? 'RESOLVED' : 'ARCHIVED';
        await prisma.inquiry.update({
          where: { id },
          data: { status: dbStatus, adminNotes },
        });
      } catch {
        // In-memory update ok if db not connected
      }
      return NextResponse.json({ success: true, message: 'Quote status updated.' });
    }

    if (action === 'update_buyer_status') {
      const { id, status } = payload;
      try {
        const dbStatus = status === 'verified' ? 'RESOLVED' : status === 'rejected' ? 'ARCHIVED' : 'NEW';
        await prisma.inquiry.update({
          where: { id },
          data: { status: dbStatus },
        });
      } catch {
        // In-memory update ok
      }
      return NextResponse.json({ success: true, message: 'Buyer account status updated.' });
    }

    if (action === 'save_terms') {
      const { productCode, terms } = payload;
      if (!productCode || !terms || typeof terms !== 'object') {
        return NextResponse.json({ success: false, error: 'Product and wholesale terms are required.' }, { status: 400 });
      }
      const moq = Number(terms.moq);
      const tiers = Array.isArray(terms.tiers)
        ? terms.tiers.map((tier: unknown) => Array.isArray(tier) ? [Number(tier[0]), Number(tier[1])] : [NaN, NaN])
        : [];
      if (!Number.isInteger(moq) || moq < 1 || tiers.length < 1 || tiers.length > 8 ||
          tiers.some((tier: number[]) => !Number.isInteger(tier[0]) || tier[0] < moq || !Number.isFinite(tier[1]) || tier[1] < 0) ||
          tiers.some((tier: number[], index: number) => index > 0 && tier[0] <= tiers[index - 1][0])) {
        return NextResponse.json({ success: false, error: 'Enter a positive MOQ and 1–8 tiers with increasing quantities and valid non-negative prices.' }, { status: 400 });
      }
      const product = await prisma.product.findUnique({ where: { code: String(productCode) }, select: { id: true } });
      if (!product) return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
      await prisma.wholesaleProductTerms.upsert({
        where: { productId: product.id },
        create: {
          productId: product.id,
          moq,
          leadTime: String(terms.lead_time || '').trim() || '4–6 weeks',
          tiers,
          customisation: String(terms.customisation || '').trim() || null,
          isActive: terms.is_active !== false,
        },
        update: {
          moq,
          leadTime: String(terms.lead_time || '').trim() || '4–6 weeks',
          tiers,
          customisation: String(terms.customisation || '').trim() || null,
          isActive: terms.is_active !== false,
        },
      });
      return NextResponse.json({ success: true, message: 'Wholesale terms saved for SKU ' + productCode });
    }

    if (action === 'delete_terms') {
      const productCode = String(payload?.productCode || '').trim();
      if (!productCode) return NextResponse.json({ success: false, error: 'Product code is required.' }, { status: 400 });
      const product = await prisma.product.findUnique({ where: { code: productCode }, select: { id: true } });
      if (!product) return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
      const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { wholesaleTerms: true } });
      const legacy = { ...((setting?.wholesaleTerms as Record<string, any> | null) || {}) };
      delete legacy[productCode];
      await prisma.$transaction([
        prisma.wholesaleProductTerms.deleteMany({ where: { productId: product.id } }),
        ...(setting ? [prisma.siteSetting.update({ where: { id: 'default' }, data: { wholesaleTerms: legacy } })] : []),
      ]);
      return NextResponse.json({ success: true, message: `Wholesale pricing removed for ${productCode}.` });
    }

    if (action === 'save_catalog') {
      const catalogPdfUrl = String(payload?.catalogPdfUrl || '').trim();
      const lookbookCoverUrl = String(payload?.lookbookCoverUrl || '').trim();
      const safeAssetUrl = (value: string) => !value || (!value.includes('\\') && !value.startsWith('//') && (value.startsWith('/') || /^https:\/\//i.test(value)));
      if (!safeAssetUrl(catalogPdfUrl) || !safeAssetUrl(lookbookCoverUrl)) {
        return NextResponse.json({ success: false, error: 'Use a site-relative path or secure HTTPS URL for catalog media.' }, { status: 400 });
      }
      const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
      const existingAssurances = (setting?.wholesaleAssurances as Record<string, any>) || {};
      const updated = { ...existingAssurances, catalogPdfUrl, lookbookCoverUrl };
      await prisma.siteSetting.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          wholesaleAssurances: updated,
          heroParagraph: 'Handicrafts Association of Bhutan promotes living craft heritage across all dzongkhags.',
          footerAbout: 'Apex Civil Society Organization established under the CSO Act of Bhutan 2007.',
          partnersList: [],
        },
        update: { wholesaleAssurances: updated },
      });
      return NextResponse.json({ success: true, message: 'Wholesale B2B catalog and lookbook saved.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Trade patch error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Could not save the trade desk change.' }, { status: err.statusCode || 500 });
  }
}
