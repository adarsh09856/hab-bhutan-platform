import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Find member record linked to this user email or user id
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { memberProfile: { include: { craft: true } }, role: true },
  });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    success: true,
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role.name,
    },
    member: dbUser.memberProfile || null,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { memberProfile: true },
  });

  if (!dbUser || !dbUser.memberProfile) {
    return NextResponse.json({ error: 'No associated artisan profile found' }, { status: 404 });
  }

  const body = await req.json();
  const { name, bio, dzongkhag, portraitUrl, businessLicense, cidNumber, craftKey } = body;

  try {
    const updated = await prisma.member.update({
      where: { id: dbUser.memberProfile.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(dzongkhag !== undefined && { dzongkhag: dzongkhag.trim() }),
        ...(portraitUrl !== undefined && { portraitUrl: portraitUrl?.trim() || null }),
        ...(businessLicense !== undefined && { businessLicense: businessLicense?.trim() || null }),
        ...(cidNumber !== undefined && { cidNumber: cidNumber?.trim() }),
        ...(craftKey !== undefined && { craftKey }),
      },
      include: { craft: true },
    });

    await logAudit({
      actorType: 'MEMBER',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'ARTISAN_PROFILE_UPDATED',
      entityType: 'Member',
      entityId: updated.id,
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Profile update failed' }, { status: 500 });
  }
}