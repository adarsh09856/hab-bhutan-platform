import { NextRequest, NextResponse } from 'next/server';
import { validatePublicUpload } from '@/lib/upload-validation';
import { storePaymentProof } from '@/lib/payment-proof-storage';
import { checkDurableRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const limit = await checkDurableRateLimit(`payment-proof-upload:${ip}`, 30, 3600);
    if (!limit.success) return NextResponse.json({ error: 'Too many proof uploads. Please try again later.' }, { status: 429 });
    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WebP, GIF or PDF documents are accepted.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = validatePublicUpload(buffer, file.type);
    if (!ext) {
      return NextResponse.json(
        { error: 'The uploaded file content does not match its declared image or PDF type.' },
        { status: 400 }
      );
    }
    const publicUrl = await storePaymentProof(buffer, ext);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: publicUrl.split('/').pop(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
