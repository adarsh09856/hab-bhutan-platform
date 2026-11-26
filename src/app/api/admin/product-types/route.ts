import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { PRODUCT_TYPES } from '@/lib/product-type';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function names(values: unknown): string[] {
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === 'string' && Boolean(value.trim())) : [];
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'products:view');
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
    const config = (setting?.trustBadges as any)?.productTypes;
    return NextResponse.json({ success: true, options: Array.isArray(config) ? names(config) : [...PRODUCT_TYPES] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requirePermission(req, 'products:edit');
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    const next = typeof body.newName === 'string' ? body.newName.trim().replace(/\s+/g, ' ') : '';
    if (!['add', 'rename', 'remove'].includes(body.action) || !name || name.length > 80 || /[<>\u0000-\u001f]/.test(name) ||
        (body.action === 'rename' && (!next || next.length > 80 || /[<>\u0000-\u001f]/.test(next)))) {
      return NextResponse.json({ success: false, error: 'Enter a valid product type of up to 80 characters.' }, { status: 400 });
    }
    const options = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "SiteSetting" WHERE id = 'default' FOR UPDATE`;
      const setting = await tx.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
      if (!setting) throw Object.assign(new Error('Save site settings first.'), { statusCode: 409 });
      const badges = setting.trustBadges && typeof setting.trustBadges === 'object' && !Array.isArray(setting.trustBadges) ? setting.trustBadges : {};
      let list = Array.isArray((badges as any).productTypes) ? names((badges as any).productTypes) : [...PRODUCT_TYPES] as string[];
      const existing = list.find(value => value.toLowerCase() === name.toLowerCase());
      if (body.action !== 'add' && !existing) throw Object.assign(new Error('This product type no longer exists. Reload the editor.'), { statusCode: 409 });
      const replacement = body.action === 'rename' ? next : name;
      if (body.action !== 'remove' && list.some(value => value.toLowerCase() === replacement.toLowerCase() && value !== existing)) {
        throw Object.assign(new Error('A product type with that name already exists.'), { statusCode: 409 });
      }
      if (body.action === 'add' && !existing) list.push(name);
      if (body.action === 'rename') {
        list = list.map(value => value === existing ? next : value);
        await tx.product.updateMany({ where: { productType: { equals: existing!, mode: 'insensitive' } }, data: { productType: next } });
      }
      if (body.action === 'remove') list = list.filter(value => value !== existing);
      await tx.siteSetting.update({ where: { id: 'default' }, data: { trustBadges: { ...badges, productTypes: list } } });
      return list;
    });
    await logAudit({ actorType: 'STAFF', actorId: actor.id, actorIdentifier: actor.email, action: 'PRODUCT_TYPES_UPDATED', entityType: 'SiteSetting', entityId: 'default', details: { action: body.action, name, newName: next } });
    return NextResponse.json({ success: true, options });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Could not update product types.' }, { status: error.statusCode || 500 });
  }
}
