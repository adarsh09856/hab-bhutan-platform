import prisma from './prisma';

export interface LogAuditParams {
  actorType: 'STAFF' | 'MEMBER' | 'GUEST' | 'SYSTEM';
  actorId?: string | null;
  actorIdentifier?: string;
  actorIp?: string | null;
  ipAddress?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export async function logAudit(params: LogAuditParams) {
  try {
    const actorIdentifier = params.actorIdentifier || params.actorId || 'anonymous';
    const actorIp = params.actorIp || params.ipAddress || null;
    const details = params.details || params.metadata || {};

    return await prisma.auditLog.create({
      data: {
        actorType: params.actorType,
        actorId: params.actorId || null,
        actorIdentifier,
        actorIp,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error, params);
    return null;
  }
}

export async function queryAuditLogs(filter?: {
  actorType?: 'STAFF' | 'MEMBER' | 'GUEST' | 'SYSTEM';
  action?: string;
  entityType?: string;
  limit?: number;
}) {
  try {
    const where: any = {};
    if (filter?.actorType) where.actorType = filter.actorType;
    if (filter?.action) where.action = { contains: filter.action, mode: 'insensitive' };
    if (filter?.entityType) where.entityType = filter.entityType;

    return await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter?.limit || 50,
    });
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    return [];
  }
}
