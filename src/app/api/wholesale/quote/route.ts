import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { SERVER_WHOLESALE_TERMS } from '@/lib/wholesale-terms.server';
import { resolveWholesaleOffer } from '@/lib/wholesale-offer';

export const dynamic = 'force-dynamic';
const jwtKey = new TextEncoder().encode(process.env.JWT_SECRET || '122e08790446e8ac0439219e4e508d8904792f81a061eacb8e58333a31261d46');

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('hab_wholesale_session')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Sign in with an approved wholesale account before requesting a quote.' }, { status: 401 });
    let buyerId = '';
    try {
      const { payload } = await jwtVerify(token, jwtKey);
      buyerId = String((payload.wholesaleBuyer as any)?.id || '');
    } catch {
      return NextResponse.json({ success: false, error: 'Your wholesale session expired. Please sign in again.' }, { status: 401 });
    }
    const buyer = await prisma.wholesaleBuyer.findFirst({ where: { id: buyerId, status: 'ACTIVE' } });
    if (!buyer) return NextResponse.json({ success: false, error: 'An active approved wholesale account is required.' }, { status: 403 });

    const body = await request.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (!rawItems.length || rawItems.length > 50) return NextResponse.json({ success: false, error: 'Add between 1 and 50 products to your quote basket.' }, { status: 400 });
    const seen = new Set<string>();
    const normalized = rawItems.map((item: any) => {
      const code = String(item?.code || '').trim().toUpperCase();
      const quantity = Number(item?.quantity);
      if (!code || seen.has(code) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) throw new Error('Each product must be listed once with a valid positive quantity.');
      seen.add(code);
      return { code, quantity };
    });

    const products = await prisma.product.findMany({
      where: { code: { in: normalized.map((item: any) => item.code) }, status: 'PUBLISHED' },
      include: { wholesaleTerms: true },
    });
    if (products.length !== normalized.length) return NextResponse.json({ success: false, error: 'One or more selected products are no longer available.' }, { status: 400 });
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { wholesaleTerms: true } });
    const legacyTerms: Record<string, any> = {
      ...SERVER_WHOLESALE_TERMS,
      ...((setting?.wholesaleTerms as Record<string, any> | null) || {}),
    };
    let total = 0;
    const lines = normalized.map(({ code, quantity }: any) => {
      const product = products.find((entry) => entry.code === code)!;
      const terms = resolveWholesaleOffer(product.wholesaleTerms, legacyTerms[code]);
      if (!terms) throw new Error(`${code} is not currently available for wholesale quotes.`);
      const moq = Number(terms.moq || 1);
      if (quantity < moq) throw new Error(`${code} requires a minimum wholesale quantity of ${moq}.`);
      const tiers = Array.isArray(terms?.tiers) ? terms.tiers : [];
      const sorted = tiers.filter((tier: any) => Array.isArray(tier) && Number.isFinite(Number(tier[0])) && Number.isFinite(Number(tier[1])))
        .sort((a: any, b: any) => Number(a[0]) - Number(b[0]));
      const applicable = sorted.filter((tier: any) => quantity >= Number(tier[0]));
      if (sorted.length === 0) throw new Error(`${code} is not currently available for wholesale quotes.`);
      const unitPrice = Number((applicable.at(-1) || sorted[0])[1]);
      total += unitPrice * quantity;
      return `- [${code}] ${product.name}: ${quantity} units @ $${unitPrice.toFixed(2)} = $${(unitPrice * quantity).toFixed(2)} USD`;
    });
    const units = normalized.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const destination = String(body.destination || '').trim().slice(0, 160);
    const requiredDate = String(body.requiredDate || '').trim().slice(0, 40);
    const notes = String(body.notes || '').trim().slice(0, 4000);
    const subject = `Wholesale Quotation Request: ${buyer.companyName} (${units} units · $${total.toFixed(2)} USD)`;
    const message = [
      'WHOLESALE QUOTATION INTAKE',
      `Buyer / Company: ${buyer.companyName}`,
      `Contact: ${buyer.contactName} <${buyer.email}>`,
      `Phone: ${buyer.phone || 'Not provided'}`,
      `Destination country: ${destination || 'Not specified'}`,
      `Required delivery date: ${requiredDate || 'Flexible'}`,
      `Total units: ${units}`,
      `Indicative goods value (FOB Thimphu): $${total.toFixed(2)} USD`,
      'Requested line items:', ...lines,
      notes ? `Customisation / packaging notes: ${notes}` : '',
    ].filter(Boolean).join('\n');
    const inquiry = await prisma.inquiry.create({ data: {
      name: buyer.contactName,
      email: buyer.email,
      phone: buyer.phone || null,
      subject,
      message,
      status: 'NEW',
    } });
    return NextResponse.json({ success: true, inquiryId: inquiry.id }, { status: 201 });
  } catch (error: any) {
    const message = error?.message || '';
    if (message.includes('minimum wholesale quantity') || message.includes('no longer available') || message.includes('not currently available') || message.includes('listed once')) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    console.error('Wholesale quote submission failed:', error);
    return NextResponse.json({ success: false, error: 'Could not submit the quote request. Please try again or contact the trade desk.' }, { status: 503 });
  }
}
