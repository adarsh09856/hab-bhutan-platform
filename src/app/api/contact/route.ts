import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { checkDurableRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate limit: 5 submissions per 15 min per IP
    const rl = await checkDurableRateLimit(`contact:${ip}`, 5, 15 * 60);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Too many inquiries submitted. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required.' }, { status: 400 });
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ success: false, error: 'Subject is required.' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message body is required.' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        status: 'NEW',
      },
    });

    await logAudit({
      actorType: 'GUEST',
      actorId: inquiry.id,
      actorIdentifier: inquiry.email,
      actorIp: ip,
      action: 'INQUIRY_SUBMITTED',
      entityType: 'Inquiry',
      entityId: inquiry.id,
      details: { subject: inquiry.subject },
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been submitted successfully to the HAB Secretariat.',
      inquiryId: inquiry.id,
    });
  } catch (err: any) {
    console.error('Contact submission error:', err);
    return NextResponse.json({ success: false, error: 'Failed to submit inquiry.' }, { status: 500 });
  }
}
