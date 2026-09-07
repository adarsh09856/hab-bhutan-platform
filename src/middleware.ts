import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/rbac';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect admin and portal paths
  const isAdminRoute = pathname.startsWith('/admin');
  const isPortalRoute = pathname.startsWith('/portal');

  if (!isAdminRoute && !isPortalRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get('hab_session')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Lightweight edge-compatible JWT decode & signature check via jose
  const sessionUser = await verifyToken(token);

  if (!sessionUser) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('reason', 'session_expired');
    const response = NextResponse.redirect(loginUrl);
    // Clear stale cookie
    response.cookies.delete('hab_session');
    return response;
  }

  // Role routing enforcement
  if (isAdminRoute && sessionUser.roleSlug === 'member') {
    // Member attempting to access staff CRM -> redirect to member portal
    return NextResponse.redirect(new URL('/portal', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
};
