import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isSupportedShippingCountry } from '@/lib/countries';
import { aggregateOrderWeightKg, calculateShippingForDestination, EMPTY_SHIPPING_RATE_TABLE, validateShippingRateTable } from '@/lib/shipping';
import { isPublicCatalogProduct } from '@/lib/public-catalog-visibility';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const country = String(body?.country || '').trim();
    if (!isSupportedShippingCountry(country)) return NextResponse.json({ success: false, error: 'Select a supported destination country.' }, { status: 400 });
    if (!Array.isArray(body?.items) || body.items.length < 1 || body.items.length > 50) {
      return NextResponse.json({ success: false, error: 'The basket must contain between 1 and 50 products.' }, { status: 400 });
    }
    const quantities = new Map<string, number>();
    for (const item of body.items) {
      const code = String(item?.code || '').trim().toUpperCase();
      const quantity = Number(item?.quantity);
      if (!code || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000 || quantities.has(code)) {
        return NextResponse.json({ success: false, error: 'The basket contains an invalid product or quantity.' }, { status: 400 });
      }
      quantities.set(code, quantity);
    }

    const [products, setting] = await Promise.all([
      prisma.product.findMany({
        where: { code: { in: [...quantities.keys()] }, status: 'PUBLISHED' },
        select: { code: true, name: true, priceUSD: true, weight: true, status: true, availability: true },
      }),
      prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } }),
    ]);
    if (products.length !== quantities.size || products.some((product) => !isPublicCatalogProduct(product))) {
      return NextResponse.json({ success: false, error: 'A product is no longer available. Refresh your basket.' }, { status: 409 });
    }
    const byCode = new Map(products.map((product) => [product.code.toUpperCase(), product]));
    const pricedItems = [...quantities].map(([code, quantity]) => ({ product: byCode.get(code)!, quantity }));
    const subtotalCents = pricedItems.reduce((sum, line) => sum + Math.round(line.product.priceUSD * 100) * line.quantity, 0);
    if (!Number.isSafeInteger(subtotalCents)) return NextResponse.json({ success: false, error: 'The basket total is outside the supported range.' }, { status: 400 });
    const orderWeightKg = aggregateOrderWeightKg(pricedItems.map(({ product, quantity }) => ({ weight: product.weight, quantity })));
    const trust = setting?.trustBadges && typeof setting.trustBadges === 'object' && !Array.isArray(setting.trustBadges)
      ? setting.trustBadges as Record<string, unknown>
      : {};
    const rateTable = validateShippingRateTable(trust.shippingRates).value || EMPTY_SHIPPING_RATE_TABLE;
    const eligibleForFreeEms = pricedItems.every(({ product }) => String(product.availability || '').toUpperCase() !== 'MADE_TO_ORDER');
    const rates = calculateShippingForDestination(subtotalCents / 100, country, orderWeightKg, rateTable, eligibleForFreeEms);
    const usesLegacyFallback = [rates.ems, rates.express].some((option) => option.rateSource === 'legacy-fallback');
    const weightMissing = orderWeightKg === null;
    return NextResponse.json({
      success: true,
      rates,
      orderWeightKg,
      usesLegacyFallback,
      message: weightMissing
        ? 'A product weight is missing or is not written with an explicit g/kg unit. The existing $24 EMS / $62 Express flat fallback is being used.'
        : usesLegacyFallback
          ? 'A destination and weight tariff is not configured for every selected service or weight band. The existing $24 EMS / $62 Express flat fallback remains in use until HAB enters carrier-approved rates.'
          : '',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Could not calculate shipping quote:', error);
    return NextResponse.json({ success: false, error: 'Could not calculate shipping. Refresh your basket and try again.' }, { status: 503 });
  }
}
