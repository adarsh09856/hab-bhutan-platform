import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');
    const policies = await prisma.policyPage.findMany({
      orderBy: { slug: 'asc' },
    });
    return NextResponse.json({ success: true, policies });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error fetching policies.' }, { status: err.statusCode || 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { slug, title, content, isActive } = body;

    if (!slug || !title || !content) {
      return NextResponse.json({ success: false, error: 'Slug, title, and content are required.' }, { status: 400 });
    }

    const policy = await prisma.policyPage.upsert({
      where: { slug },
      update: {
        title,
        content,
        isActive: isActive !== undefined ? isActive : true,
      },
      create: {
        slug,
        title,
        content,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'POLICY_UPDATED',
      entityType: 'PolicyPage',
      entityId: policy.id,
      details: { slug, title },
    });

    return NextResponse.json({ success: true, policy });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error saving policy.' }, { status: err.statusCode || 500 });
  }
}
