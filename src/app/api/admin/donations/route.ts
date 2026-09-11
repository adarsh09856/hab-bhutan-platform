import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff =
    user.roleSlug === 'super_admin' ||
    user.roleSlug === 'staff_operator' ||
    user.permissions?.includes('*') ||
    user.permissions?.includes('reports:view');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const pillarKey = searchParams.get('pillarKey');
    const status = searchParams.get('status');

    const where: any = {};
    if (pillarKey) where.pillarKey = pillarKey;
    if (status) where.status = status;

    const donations = await prisma.donationRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pillar: {
          select: { title: true, key: true },
        },
      },
    });

    const totalUSD = donations.reduce((sum, d) => sum + (d.status === 'COMPLETED' ? d.amountUSD : 0), 0);

    return NextResponse.json({ success: true, donations, totalUSD });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch donations' }, { status: 500 });
  }
}
