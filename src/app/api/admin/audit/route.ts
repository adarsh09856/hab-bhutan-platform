import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac';
import { queryAuditLogs } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'AUDIT_VIEW');

    const searchParams = req.nextUrl.searchParams;
    const actorType = searchParams.get('actorType') as any;
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const logs = await queryAuditLogs({
      actorType: actorType && actorType !== 'ALL' ? actorType : undefined,
      action,
      entityType,
      limit
    });

    return NextResponse.json({
      success: true,
      logs
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
