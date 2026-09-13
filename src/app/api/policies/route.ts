import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const policy = await prisma.policyPage.findUnique({
        where: { slug },
      });
      if (!policy) {
        return NextResponse.json({ success: false, error: 'Policy not found.' }, { status: 404 });
      }
      const res = NextResponse.json({ success: true, policy });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');
      return res;
    }

    const policies = await prisma.policyPage.findMany({
      where: { isActive: true },
    });

    const res = NextResponse.json({ success: true, policies });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (err: any) {
    console.error('Error fetching policies:', err);
    const res = NextResponse.json({ success: false, error: 'Failed to retrieve policy.' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}
