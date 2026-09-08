import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/rbac';

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets, images, and API routes to bypass edge redirect logic
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return applySecurityHeaders(NextResponse.next());
  }

  // 1. Staff Sign In Page Handling (/admin/login)
  if (pathname === '/admin/login') {
    const token = req.cookies.get('hab_session')?.value;
    if (token) {
      const sessionUser = await verifyToken(token);
      const isStaff = sessionUser && (
        sessionUser.roleSlug === 'super_admin' ||
        sessionUser.roleSlug === 'staff_operator' ||
        sessionUser.roleSlug === 'trustee_viewer' ||
        sessionUser.permissions?.includes('*') ||
        sessionUser.permissions?.includes('orders:view') ||
        sessionUser.permissions?.includes('applications:view')
      );
      // If already signed in as staff, redirect directly to admin dashboard
      if (isStaff) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin', req.url)));
      }
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // 2. Protect all other /admin routes exclusively for authenticated staff
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('hab_session')?.value;

    if (!token) {
      const adminLoginUrl = new URL('/admin/login', req.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(adminLoginUrl));
    }

    // Lightweight edge-compatible JWT verification via jose
    const sessionUser = await verifyToken(token);

    if (!sessionUser) {
      const adminLoginUrl = new URL('/admin/login', req.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      adminLoginUrl.searchParams.set('reason', 'session_expired');
      const response = NextResponse.redirect(adminLoginUrl);
      response.cookies.delete('hab_session');
      return applySecurityHeaders(response);
    }

    // Enforce role check: Non-staff (e.g. member/artisan) cannot access /admin
    const isStaff = sessionUser.roleSlug === 'super_admin' ||
                    sessionUser.roleSlug === 'staff_operator' ||
                    sessionUser.roleSlug === 'trustee_viewer' ||
                    sessionUser.permissions?.includes('*') ||
                    sessionUser.permissions?.includes('orders:view') ||
                    sessionUser.permissions?.includes('applications:view');

    if (!isStaff) {
      const adminLoginUrl = new URL('/admin/login', req.url);
      adminLoginUrl.searchParams.set('reason', 'unauthorized_staff');
      return applySecurityHeaders(NextResponse.redirect(adminLoginUrl));
    }

    return applySecurityHeaders(NextResponse.next());
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
