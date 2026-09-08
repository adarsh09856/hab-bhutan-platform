import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let setting = await prisma.membershipSetting.findUnique({ where: { id: 'default' } });
    if (!setting) {
      setting = await prisma.membershipSetting.create({
        data: {
          id: 'default',
          activeDuesBTN: 1200,
          associateDuesBTN: 2500,
          institutionalDuesBTN: 10000,
          bankName: 'Bank of Bhutan (BoB)',
          accountNumber: '200847291038',
          accountTitle: 'Handicrafts Association of Bhutan',
          mbobQrUrl: '/images/mbob_qr_placeholder.png',
        },
      });
    }
    return NextResponse.json({ success: true, setting });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
