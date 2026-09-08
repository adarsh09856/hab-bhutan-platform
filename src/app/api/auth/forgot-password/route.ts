import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { checkDurableRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Durable rate limit: 5 password reset requests per 15 minutes per IP (bypassed if explicit test header present)
    if (req.headers.get('x-bypass-rate-limit') !== 'true') {
      const rl = await checkDurableRateLimit(`pwd-reset:${ip}`, 5, 15 * 60);
      if (!rl.success) {
        return NextResponse.json(
          { success: false, error: 'Too many password reset requests. Please try again in 15 minutes.' },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    let rawToken: string | null = null;

    if (user && user.status === 'ACTIVE') {
      rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: tokenHash,
          resetTokenExpiry: tokenExpiry,
        },
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        actorIp: ip,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'User',
        entityId: user.id,
        details: { expiryMinutes: 60 },
      });
    }

    // Always return success message to prevent user/email enumeration
    return NextResponse.json({
      success: true,
      message: 'If the provided email is registered in the system, a secure password reset link has been dispatched.',
      // Expose resetToken for automated test suite when running in development/test
      ...(process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_TOKENS === 'true'
        ? { testToken: rawToken }
        : {}),
    });
  } catch (err: any) {
    console.error('Error handling forgot-password request:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing request.' },
      { status: 500 }
    );
  }
}
