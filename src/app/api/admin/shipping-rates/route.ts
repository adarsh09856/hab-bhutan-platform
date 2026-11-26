import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthError, getSessionUserForAnyPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { EMPTY_SHIPPING_RATE_TABLE, validateShippingRateTable } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

async function canManage(req: NextRequest) {
  const user = await getSessionUserForAnyPermission(req, ['content:edit']);
  return user && ['super_admin', 'staff_operator'].includes(String(user.roleSlug || '').toLowerCase()) ? user : null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await canManage(req);
    if (!user) return NextResponse.json({ success: false, error: 'Content edit permission is required.' }, { status: 403 });
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
    if (!setting) return NextResponse.json({ success: false, error: 'Site settings are not initialized.' }, { status: 503 });
    const trust = setting.trustBadges && typeof setting.trustBadges === 'object' && !Array.isArray(setting.trustBadges)
      ? setting.trustBadges as Record<string, unknown>
      : {};
    const parsed = validateShippingRateTable(trust.shippingRates);
    return NextResponse.json({ success: true, rateTable: parsed.value || EMPTY_SHIPPING_RATE_TABLE });
  } catch (error: any) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    console.error('Could not read shipping rate settings:', error);
    return NextResponse.json({ success: false, error: 'Could not load shipping rates.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await canManage(req);
    if (!user) return NextResponse.json({ success: false, error: 'Content edit permission is required.' }, { status: 403 });
    const body = await req.json();
    const validation = validateShippingRateTable(body?.rateTable);
    if (!validation.value) return NextResponse.json({ success: false, error: validation.error || 'Shipping rates are invalid.' }, { status: 400 });

    // Update only the shippingRates JSON key atomically. Other trustBadges data
    // remains intact even when another editor saves unrelated content nearby.
    const updated = await prisma.$executeRaw`
      UPDATE "SiteSetting"
      SET "trustBadges" = COALESCE("trustBadges", '{}'::jsonb) || jsonb_build_object('shippingRates', ${JSON.stringify(validation.value)}::jsonb),
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = 'default'
    `;
    if (updated !== 1) return NextResponse.json({ success: false, error: 'Site settings are not initialized.' }, { status: 503 });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'SHIPPING_RATES_UPDATED',
      entityType: 'SiteSetting',
      entityId: 'default',
      details: { zoneCount: validation.value.zones.length },
    });
    return NextResponse.json({ success: true, rateTable: validation.value });
  } catch (error: any) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    console.error('Could not save shipping rate settings:', error);
    return NextResponse.json({ success: false, error: 'Could not save shipping rates.' }, { status: 500 });
  }
}
