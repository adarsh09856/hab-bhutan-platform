import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentFxRate } from '@/lib/fx';
import { getSessionUser } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  let dbConnected = false;
  let dbLatencyMs = 0;

  const startTime = Date.now();
  try {
    // Perform genuine lightweight database ping
    await prisma.$queryRaw`SELECT 1 as ping`;
    dbConnected = true;
    dbLatencyMs = Date.now() - startTime;
  } catch (dbError) {
    console.error('Database health ping failed:', dbError);
    dbConnected = false;
  }

  let fxInfo;
  try {
    fxInfo = await getCurrentFxRate();
  } catch (fxError) {
    fxInfo = {
      rate: 84.0,
      status: 'STALE',
      source: 'FALLBACK',
      stalenessHours: 999,
      blocked: false,
    };
  }

  const uptimeSeconds = Math.round(process.uptime());
  const mem = process.memoryUsage();
  const sessionUser = await getSessionUser(req);
  let activeUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    roleSlug: string;
    permissions: string[];
  } | null = null;
  if (sessionUser && dbConnected) {
    try {
      const account = await prisma.user.findUnique({ where: { id: sessionUser.id }, include: { role: true } });
      if (account?.status === 'ACTIVE' && account.role.status === 'ACTIVE'
        && (!sessionUser.sessionVersion || sessionUser.sessionVersion >= account.sessionVersion)
        && (!sessionUser.roleId || sessionUser.roleId === account.roleId)
        && (!sessionUser.roleVersion || sessionUser.roleVersion === account.role.version)) {
        activeUser = {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role.slug,
          roleSlug: account.role.slug,
          permissions: Array.isArray(account.role.permissions) ? account.role.permissions as string[] : [],
        };
      }
    } catch (error) {
      console.error('Health account check failed:', error);
    }
  }

  const isHealthy = dbConnected;
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      success: isHealthy,
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      database: {
        connected: dbConnected,
        latencyMs: dbLatencyMs,
        provider: 'postgresql',
      },
      system: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      },
      fx: {
        rate: fxInfo.rate,
        status: fxInfo.status,
        source: fxInfo.source,
        stalenessHours: fxInfo.stalenessHours || 0,
        isBlocked: fxInfo.blocked,
      },
      user: activeUser,
    },
    { status: statusCode }
  );
}
