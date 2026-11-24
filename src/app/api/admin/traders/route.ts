import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserForAnyPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { sendEmail } from '@/lib/email-service';
import { generateExcelCsv } from '@/lib/spreadsheet';

export const dynamic = 'force-dynamic';
const permissions = ['content:view', 'content:edit'] as const;
const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stringList = (value: unknown) => Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 30) : [];
function normalize(body: any) {
  const shopName = String(body.shopName || '').trim();
  const registrationNumber = String(body.registrationNumber || '').trim();
  const expiresAt = new Date(body.expiresAt);
  if (!shopName || !registrationNumber || !body.dzongkhag || !body.town || !body.address || !body.shortDescription || !body.description || Number.isNaN(expiresAt.getTime())) throw new Error('Shop name, registration number, location, descriptions and a valid expiry date are required.');
  return {
    shopName, registrationNumber,
    slug: slugify(String(body.slug || shopName)),
    ownerName: body.ownerName?.trim() || null,
    dzongkhag: String(body.dzongkhag).trim(), town: String(body.town).trim(), address: String(body.address).trim(),
    mapUrl: body.mapUrl?.trim() || null, openingHours: body.openingHours?.trim() || null,
    shortDescription: String(body.shortDescription).trim(), description: String(body.description).trim(),
    craftKeys: stringList(body.craftKeys), productTypes: stringList(body.productTypes), productPhotoUrls: stringList(body.productPhotoUrls),
    bannerUrl: body.bannerUrl?.trim() || null, expiresAt,
    isVisible: body.isVisible !== false, verifiedSince: body.verifiedSince ? Number(body.verifiedSince) : null,
    sortOrder: Number(body.sortOrder) || 0,
  };
}

export async function GET(req: NextRequest) {
  const user = await getSessionUserForAnyPermission(req, [...permissions]);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const traders = await prisma.traderRecord.findMany({ orderBy: [{ sortOrder: 'asc' }, { shopName: 'asc' }] });
    const expired = traders.filter((trader) => trader.isVisible && trader.expiresAt <= new Date() && !trader.expiryNoticeSentAt);
    if (expired.length) {
      const result = await sendEmail({
        to: 'officehab@gmail.com', subject: `HAB trader accreditation expired (${expired.length})`,
        body: `The following public trader listing(s) have expired and are now hidden from the public directory:\n\n${expired.map((trader) => `${trader.shopName} · ${trader.registrationNumber} · expired ${trader.expiresAt.toISOString().slice(0, 10)}`).join('\n')}\n\nReview the records in Admin → Accredited Traders.`,
        templateKey: 'trader_expiry_notice', auditEntityType: 'TraderRecord', auditEntityId: expired.map((trader) => trader.id).join(','),
      });
      if (result.success) await prisma.traderRecord.updateMany({ where: { id: { in: expired.map((trader) => trader.id) }, expiryNoticeSentAt: null }, data: { expiryNoticeSentAt: new Date() } });
    }
    return NextResponse.json({ success: true, traders }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message || 'Could not load traders.' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserForAnyPermission(req, ['content:create', 'content:edit']);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const data = normalize(await req.json());
    const trader = await prisma.traderRecord.create({ data });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'TRADER_CREATED', entityType: 'TraderRecord', entityId: trader.id, details: { shopName: trader.shopName } });
    return NextResponse.json({ success: true, trader }, { status: 201 });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message || 'Could not create trader.' }, { status: 400 }); }
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUserForAnyPermission(req, ['content:edit']);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ success: false, error: 'Trader id is required.' }, { status: 400 });
    const data = normalize(body);
    const trader = await prisma.traderRecord.update({ where: { id: String(body.id) }, data });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'TRADER_UPDATED', entityType: 'TraderRecord', entityId: trader.id, details: { shopName: trader.shopName } });
    return NextResponse.json({ success: true, trader });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message || 'Could not update trader.' }, { status: 400 }); }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUserForAnyPermission(req, ['content:delete', 'content:edit']);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'Trader id is required.' }, { status: 400 });
  try {
    const trader = await prisma.traderRecord.delete({ where: { id } });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'TRADER_DELETED', entityType: 'TraderRecord', entityId: trader.id, details: { shopName: trader.shopName } });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message || 'Could not delete trader.' }, { status: 400 }); }
}
