import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { validatePublicUpload } from '@/lib/upload-validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Limit size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Accept common document and image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only images (JPG, PNG, WebP) or PDF documents are accepted as payment slips' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'slips');
    await mkdir(uploadsDir, { recursive: true });

    const ext = validatePublicUpload(buffer, file.type);
    if (!ext) {
      return NextResponse.json(
        { error: 'The uploaded file content does not match its declared image or PDF type.' },
        { status: 400 }
      );
    }
    const cleanFileName = `slip-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
    const filePath = join(uploadsDir, cleanFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/slips/${cleanFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: cleanFileName,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Payment slip upload failed' },
      { status: 500 }
    );
  }
}
