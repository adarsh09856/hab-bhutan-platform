import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';

const VIEW_PERMISSIONS = new Set(['orders:view', 'orders:fulfill', 'donations:view', 'applications:view', 'members:view']);

export async function paymentProofViewerStatus(req: NextRequest): Promise<200 | 401 | 403 | 503> {
  const session = await getSessionUser(req);
  if (!session) return 401;
  try {
    const account = await prisma.user.findUnique({ where: { id: session.id }, include: { role: true } });
    if (!account || account.status !== 'ACTIVE' || account.role.status !== 'ACTIVE' ||
      (session.sessionVersion && session.sessionVersion < account.sessionVersion)) return 403;
    const permissions = account.role.permissions as string[];
    return Array.isArray(permissions) && (permissions.includes('*') || permissions.some((p) => VIEW_PERMISSIONS.has(p))) ? 200 : 403;
  } catch { return 503; }
}
