import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import {
  getAllFallbackWholesaleBuyers,
  saveFallbackWholesaleBuyer,
  updateFallbackWholesaleBuyerStatus,
  deleteFallbackWholesaleBuyer,
} from '@/lib/wholesale-store';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff =
    user.roleSlug === 'super_admin' ||
    user.roleSlug === 'staff_operator' ||
    user.permissions?.includes('*') ||
    user.permissions?.includes('members:view') ||
    user.permissions?.includes('orders:fulfill');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let dbBuyers: any[] = [];
    try {
      dbBuyers = await prisma.wholesaleBuyer.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          country: true,
          city: true,
          taxId: true,
          discountTier: true,
          status: true,
          notes: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (dbErr: any) {
      console.warn('[admin/wholesale] DB read error, using fallback:', dbErr.message);
    }

    const fallbackBuyers = getAllFallbackWholesaleBuyers();
    const existingIds = new Set(dbBuyers.map((b) => b.id));
    const existingEmails = new Set(dbBuyers.map((b) => b.email?.toLowerCase()));
    const merged = [...dbBuyers];

    for (const fb of fallbackBuyers) {
      if (!existingIds.has(fb.id) && !existingEmails.has(fb.email?.toLowerCase())) {
        merged.push({
          ...fb,
          createdAt: new Date(fb.createdAt),
          updatedAt: new Date(fb.updatedAt),
        });
      }
    }

    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, buyers: merged });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch wholesale buyers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      username,
      password,
      companyName,
      contactName,
      email,
      phone,
      country = 'Bhutan',
      city,
      taxId,
      discountTier = 20,
      status = 'ACTIVE',
      notes,
    } = body;

    if (!username || !password || !companyName || !contactName || !email) {
      return NextResponse.json(
        { error: 'username, password, companyName, contactName, and email are required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check unique constraints
    const existing = await prisma.wholesaleBuyer.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A wholesale buyer with this username or email already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const buyer = await prisma.wholesaleBuyer.create({
      data: {
        username: cleanUsername,
        passwordHash,
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        email: cleanEmail,
        phone: phone ? String(phone).trim() : null,
        country: country.trim(),
        city: city ? String(city).trim() : null,
        taxId: taxId ? String(taxId).trim() : null,
        discountTier: Number(discountTier) || 20,
        status: status.toUpperCase(),
        notes: notes ? String(notes).trim() : null,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'WHOLESALE_BUYER_CREATED',
      entityType: 'WholesaleBuyer',
      entityId: buyer.id,
      details: { username: buyer.username, companyName: buyer.companyName },
    });

    return NextResponse.json({
      success: true,
      buyer: {
        id: buyer.id,
        username: buyer.username,
        companyName: buyer.companyName,
        contactName: buyer.contactName,
        email: buyer.email,
        discountTier: buyer.discountTier,
        status: buyer.status,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create buyer' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, password, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'Buyer id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (rest.username) updateData.username = rest.username.trim().toLowerCase();
    if (rest.companyName) updateData.companyName = rest.companyName.trim();
    if (rest.contactName) updateData.contactName = rest.contactName.trim();
    if (rest.email) updateData.email = rest.email.trim().toLowerCase();
    if (rest.phone !== undefined) updateData.phone = rest.phone ? String(rest.phone).trim() : null;
    if (rest.country) updateData.country = rest.country.trim();
    if (rest.city !== undefined) updateData.city = rest.city ? String(rest.city).trim() : null;
    if (rest.taxId !== undefined) updateData.taxId = rest.taxId ? String(rest.taxId).trim() : null;
    if (rest.discountTier !== undefined) updateData.discountTier = Number(rest.discountTier);
    if (rest.status) updateData.status = rest.status.toUpperCase();
    if (rest.notes !== undefined) updateData.notes = rest.notes ? String(rest.notes).trim() : null;

    // Reset password if provided
    if (password && password.trim()) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    let updated: any = null;
    try {
      updated = await prisma.wholesaleBuyer.update({
        where: { id },
        data: updateData,
      });
    } catch (dbErr: any) {
      console.warn('[admin/wholesale] DB update error, checking fallback store:', dbErr.message);
    }

    if (rest.status) {
      updateFallbackWholesaleBuyerStatus(id, rest.status);
    }

    if (!updated) {
      const fb = getAllFallbackWholesaleBuyers().find((b) => b.id === id);
      if (fb) {
        return NextResponse.json({ success: true, buyer: fb });
      }
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'WHOLESALE_BUYER_UPDATED',
      entityType: 'WholesaleBuyer',
      entityId: updated.id,
      details: {
        username: updated.username,
        status: updated.status,
        passwordReset: Boolean(password),
      },
    });

    return NextResponse.json({ success: true, buyer: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update buyer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Buyer id is required' }, { status: 400 });
    }

    try {
      await prisma.wholesaleBuyer.delete({
        where: { id },
      });
    } catch (dbErr: any) {
      console.warn('[admin/wholesale] DB delete error:', dbErr.message);
    }

    deleteFallbackWholesaleBuyer(id);

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'WHOLESALE_BUYER_DELETED',
      entityType: 'WholesaleBuyer',
      entityId: id,
      details: { id },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete buyer' }, { status: 500 });
  }
}
