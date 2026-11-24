import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserForAnyPermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getSessionUserForAnyPermission(req, ['reports:view', 'products:view', 'content:view']);
  if (!user) return NextResponse.json({ success: false, error: 'Not authorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, roleSlug: user.roleSlug, permissions: user.permissions } }, { headers: { 'Cache-Control': 'no-store' } });
}
