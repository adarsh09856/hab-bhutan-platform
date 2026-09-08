import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/rbac';
import { generateTotpSecret, getTotpUri } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required for 2FA setup.' },
        { status: 401 }
      );
    }

    const secret = generateTotpSecret();
    const uri = getTotpUri(session.email, secret, 'HAB Bhutan Secretariat');

    return NextResponse.json({
      success: true,
      secret,
      uri,
      instructions: 'Enter this secret key in your authenticator app or scan the enrollment URI.',
    });
  } catch (err: any) {
    console.error('Error generating 2FA setup:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error generating 2FA setup.' },
      { status: 500 }
    );
  }
}
