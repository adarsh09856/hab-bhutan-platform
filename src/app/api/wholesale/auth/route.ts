import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { SignJWT, jwtVerify } from 'jose';
import { getAllFallbackWholesaleBuyers } from '@/lib/wholesale-store';

export const dynamic = 'force-dynamic';

const secretString = process.env.JWT_SECRET || '122e08790446e8ac0439219e4e508d8904792f81a061eacb8e58333a31261d46';
const JWT_SECRET = new TextEncoder().encode(secretString);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Look up WholesaleBuyer by username or email
    let buyer: any = null;
    try {
      buyer = await prisma.wholesaleBuyer.findFirst({
        where: {
          OR: [
            { username: { equals: cleanUsername, mode: 'insensitive' } },
            { email: { equals: cleanUsername, mode: 'insensitive' } },
          ],
        },
      });
    } catch (dbErr) {
      console.warn('[wholesale/auth] DB query failed, falling back to local store:', dbErr);
    }

    if (!buyer) {
      const fallbackBuyers = getAllFallbackWholesaleBuyers();
      buyer = fallbackBuyers.find(
        (b) =>
          b.username?.toLowerCase() === cleanUsername ||
          b.email?.toLowerCase() === cleanUsername
      ) || null;
    }

    if (!buyer) {
      return NextResponse.json(
        { success: false, error: 'Invalid wholesale username or password.' },
        { status: 401 }
      );
    }

    if (buyer.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: `Your wholesale account is currently ${buyer.status.toLowerCase()}. Please contact the Secretariat desk at officehab@gmail.com.`,
        },
        { status: 403 }
      );
    }

    // Verify password hash (or fallback plaintext match if local testing)
    let isValid = false;
    if (buyer.passwordHash) {
      try {
        isValid = await bcrypt.compare(password, buyer.passwordHash);
      } catch {
        isValid = buyer.passwordHash === password;
      }
    } else {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid wholesale username or password.' },
        { status: 401 }
      );
    }

    // Record login timestamp
    try {
      await prisma.wholesaleBuyer.update({
        where: { id: buyer.id },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      // Non-blocking
    }

    // Create Wholesale session JWT
    const token = await new SignJWT({
      wholesaleBuyer: {
        id: buyer.id,
        username: buyer.username,
        companyName: buyer.companyName,
        contactName: buyer.contactName,
        email: buyer.email,
        discountTier: buyer.discountTier,
        status: buyer.status,
      },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    try {
      await logAudit({
        actorType: 'GUEST',
        actorIdentifier: buyer.email,
        action: 'WHOLESALE_BUYER_LOGIN',
        entityType: 'WholesaleBuyer',
        entityId: buyer.id,
        details: { username: buyer.username, company: buyer.companyName },
      });
    } catch {
      // Non-blocking
    }

    const response = NextResponse.json({
      success: true,
      buyer: {
        id: buyer.id,
        username: buyer.username,
        companyName: buyer.companyName,
        contactName: buyer.contactName,
        email: buyer.email,
        discountTier: buyer.discountTier,
      },
    });

    // Set HTTP-only wholesale cookie
    response.cookies.set('hab_wholesale_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('hab_wholesale_session')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const buyerSession = payload.wholesaleBuyer as any;

    if (!buyerSession) {
      return NextResponse.json({ authenticated: false });
    }

    let buyer: any = null;
    try {
      buyer = await prisma.wholesaleBuyer.findUnique({
        where: { id: buyerSession.id },
        select: {
          id: true,
          username: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          country: true,
          city: true,
          discountTier: true,
          status: true,
        },
      });
    } catch {
      // DB offline
    }

    if (!buyer) {
      const fallbackBuyers = getAllFallbackWholesaleBuyers();
      buyer = fallbackBuyers.find((b) => b.id === buyerSession.id) || null;
    }

    if (!buyer || buyer.status !== 'ACTIVE') {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      buyer,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('hab_wholesale_session');
  return response;
}
