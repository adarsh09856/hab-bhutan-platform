import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, revokeAllUserSessions, getClientIp } from '@/lib/rbac';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to revoke sessions.' },
        { status: 401 }
      );
    }

    let targetUserId = session.id;
    try {
      const body = await req.json();
      if (body.userId && body.userId !== session.id) {
        // Only Super Admin can revoke other users' sessions
        if (!session.permissions.includes('*') && !session.permissions.includes('users:edit')) {
          return NextResponse.json(
            { success: false, error: 'Permission denied. Cannot revoke sessions of another account.' },
            { status: 403 }
          );
        }
        targetUserId = body.userId;
      }
    } catch {
      // Body not provided, defaults to self-revocation
    }

    const ip = getClientIp(req);
    const updatedUser = await revokeAllUserSessions(targetUserId, session, ip);

    const response = NextResponse.json({
      success: true,
      message: `All active sessions for ${updatedUser.email} have been revoked.`,
      sessionVersion: updatedUser.sessionVersion,
    });

    // If revoking own sessions, clear session cookie immediately
    if (targetUserId === session.id) {
      response.cookies.delete('hab_session');
    }

    return response;
  } catch (err: any) {
    console.error('Error revoking sessions:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error revoking sessions.' },
      { status: 500 }
    );
  }
}
