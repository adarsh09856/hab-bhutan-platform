import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Staff session required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided in request.' }, { status: 400 });
    }

    // Validate MIME type & file extension
    const validMimes = [
      // Images
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml',
      // Documents & PDFs
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/octet-stream' // fallback
    ];

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'];
    const fileExt = file.name && file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || '' : '';

    if (!validMimes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file format. Please upload a PDF, Word document, Excel spreadsheet, or standard image (JPG/PNG).' },
        { status: 400 }
      );
    }

    // Max file size: 30MB
    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowable limit of 30MB.' },
        { status: 400 }
      );
    }

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Determine clean extension
    let ext = fileExt || 'bin';
    if (file.type === 'application/pdf') ext = 'pdf';
    else if (file.type === 'image/jpeg') ext = 'jpg';
    else if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';
    else if (file.type === 'image/gif') ext = 'gif';
    else if (file.type === 'image/svg+xml') ext = 'svg';
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ext = 'docx';
    else if (file.type === 'application/msword') ext = 'doc';

    const safeBaseName = (file.name || 'product')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const filename = `${safeBaseName}_${uniqueSuffix}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    try {
      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        action: 'MEDIA_IMAGE_UPLOADED',
        entityType: 'MediaUpload',
        entityId: filename,
        details: { filename, size: file.size, type: file.type, url: publicUrl },
      });
    } catch {
      // Audit non-blocking
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error occurred during file upload.' },
      { status: 500 }
    );
  }
}
