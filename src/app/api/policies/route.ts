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
      return NextResponse.json({ success: true, policy });
    }

    const policies = await prisma.policyPage.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({ success: true, policies });
  } catch (err: any) {
    console.error('Error fetching policies:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve policy.' }, { status: 500 });
  }
}
