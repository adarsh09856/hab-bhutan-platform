import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { MemberStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'members:view');

    const members = await prisma.member.findMany({
      include: {
        craft: true,
        products: {
          select: { id: true, code: true, name: true, priceUSD: true },
        },
        orders: {
          select: { id: true, orderNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (err: any) {
    console.error('Error fetching admin members:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching members.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let session = await requirePermission(req, 'members:create');
    const body = await req.json();
    const {
      name,
      craftKey,
      dzongkhag,
      joinYear,
      regNumber,
      tier,
      status,
      bio,
      portraitUrl,
      cidNumber,
      businessLicense,
      duesExpiryDate,
    } = body;

    if (!name || !craftKey || !dzongkhag || !cidNumber) {
      return NextResponse.json(
        { success: false, error: 'Name, craft category, dzongkhag, and CID number are required.' },
        { status: 400 }
      );
    }

    const requestedStatus = String(status || 'PENDING').toUpperCase();
    if (!['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].includes(requestedStatus)) {
      return NextResponse.json(
        { success: false, error: 'Choose a valid member status.' },
        { status: 400 }
      );
    }
    // Creating a profile must not silently publish it. Explicit verification
    // requires the separate review permission, even for a user who can create.
    if (requestedStatus === 'VERIFIED') {
      session = await requirePermission(req, 'members:verify');
    }

    const cleanCID = String(cidNumber).replace(/\D/g, '');
    if (cleanCID.length !== 11) {
      return NextResponse.json(
        { success: false, error: 'Bhutan Citizenship ID (CID) must be exactly 11 digits.' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    const generatedReg = regNumber || `HAB-M-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    const expiry = duesExpiryDate
      ? new Date(duesExpiryDate)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const newMember = await prisma.member.create({
      data: {
        name,
        craftKey,
        dzongkhag,
        joinYear: joinYear ? parseInt(joinYear, 10) : currentYear,
        regNumber: generatedReg,
        tier: tier || 'ACTIVE_SECTOR_MEMBER',
        status: requestedStatus as MemberStatus,
        bio: bio || '',
        portraitUrl: portraitUrl || null,
        cidNumber: cleanCID,
        businessLicense: businessLicense || null,
        village: String(body.village || '').trim() || null,
        phone: String(body.phone || '').trim() || null,
        email: String(body.email || '').trim().toLowerCase() || null,
        duesExpiryDate: expiry,
      },
      include: { craft: true, products: true },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'MEMBER_CREATED',
      entityType: 'Member',
      entityId: newMember.id,
      details: {
        name: newMember.name,
        regNumber: newMember.regNumber,
        craftKey: newMember.craftKey,
        tier: newMember.tier,
      },
    });

    return NextResponse.json({
      success: true,
      member: newMember,
    });
  } catch (err: any) {
    console.error('Error creating member:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error creating member.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status: requestedStatus, notes, ...editFields } = body;
    const status = requestedStatus == null ? requestedStatus : String(requestedStatus).toUpperCase();

    if (status && !['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].includes(String(status).toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Choose a valid member status.' },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member id is required.' },
        { status: 400 }
      );
    }

    const previous = await prisma.member.findUnique({
      where: { id },
      include: { craft: true },
    });
    if (!previous) {
      return NextResponse.json(
        { success: false, error: 'Member not found.' },
        { status: 404 }
      );
    }

    let session;
    const isStatusOnly = status && Object.keys(editFields).length === 0;

    if (isStatusOnly) {
      if (status === 'VERIFIED') {
        session = await requirePermission(req, 'members:verify');
      } else if (status === 'SUSPENDED') {
        session = await requirePermission(req, 'members:suspend');
      } else {
        session = await requirePermission(req, 'members:edit');
      }
    } else {
      session = await requirePermission(req, 'members:edit');
      if (status === 'VERIFIED' && previous.status !== 'VERIFIED') {
        await requirePermission(req, 'members:verify');
      }
      if (status === 'SUSPENDED' && previous.status !== 'SUSPENDED') {
        await requirePermission(req, 'members:suspend');
      }
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (editFields.name !== undefined) updateData.name = editFields.name;
    if (editFields.craftKey !== undefined) updateData.craftKey = editFields.craftKey;
    if (editFields.dzongkhag !== undefined) updateData.dzongkhag = editFields.dzongkhag;
    if (editFields.joinYear !== undefined) updateData.joinYear = parseInt(editFields.joinYear, 10);
    if (editFields.tier !== undefined) updateData.tier = editFields.tier;
    if (editFields.bio !== undefined) updateData.bio = editFields.bio;
    if (editFields.portraitUrl !== undefined) updateData.portraitUrl = editFields.portraitUrl;
    if (editFields.businessLicense !== undefined) updateData.businessLicense = editFields.businessLicense;
    if (editFields.village !== undefined) updateData.village = String(editFields.village || '').trim() || null;
    if (editFields.phone !== undefined) updateData.phone = String(editFields.phone || '').trim() || null;
    if (editFields.email !== undefined) updateData.email = String(editFields.email || '').trim().toLowerCase() || null;
    if (editFields.duesExpiryDate !== undefined) updateData.duesExpiryDate = new Date(editFields.duesExpiryDate);
    if (editFields.cidNumber !== undefined) {
      const cleanCID = String(editFields.cidNumber).replace(/\D/g, '');
      if (cleanCID.length !== 11) {
        return NextResponse.json(
          { success: false, error: 'Bhutan Citizenship ID (CID) must be exactly 11 digits.' },
          { status: 400 }
        );
      }
      updateData.cidNumber = cleanCID;
    }

    const updated = await prisma.member.update({
      where: { id },
      data: updateData,
      include: { craft: true, products: true },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: isStatusOnly ? `MEMBER_STATUS_CHANGED_${status}` : 'MEMBER_PROFILE_UPDATED',
      entityType: 'Member',
      entityId: id,
      details: {
        previous: {
          name: previous.name,
          status: previous.status,
          craftKey: previous.craftKey,
          dzongkhag: previous.dzongkhag,
        },
        updated: updateData,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      member: updated,
    });
  } catch (err: any) {
    console.error('Error updating member:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating member.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'members:delete');
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // query param was empty, body not JSON
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member id is required for deletion.' },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        products: { select: { id: true } },
        orders: { select: { id: true } },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found.' },
        { status: 404 }
      );
    }

    // Comprehensive referential safety check: both maker of products AND buyer of orders
    const productCount = member.products.length;
    const orderCount = member.orders.length;

    if (productCount > 0 || orderCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot permanently delete member '${member.name}'. This member is referenced by ${productCount} catalog product(s) and ${orderCount} order(s). To preserve data integrity and historical records, change member status to SUSPENDED instead.`,
          code: 'REFERENTIAL_INTEGRITY_VIOLATION',
          details: { productCount, orderCount },
        },
        { status: 400 }
      );
    }

    await prisma.member.delete({ where: { id } });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'MEMBER_DELETED',
      entityType: 'Member',
      entityId: id,
      details: {
        name: member.name,
        regNumber: member.regNumber,
        cidNumber: member.cidNumber,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Member '${member.name}' permanently deleted.`,
    });
  } catch (err: any) {
    console.error('Error deleting member:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error deleting member.' },
      { status: err.statusCode || 500 }
    );
  }
}
