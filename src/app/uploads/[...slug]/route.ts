import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  ico: 'image/x-icon',
  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    if (!slug || slug.length === 0) {
      return new NextResponse('File not specified', { status: 400 });
    }

    // Sanitize and prevent directory traversal
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const requestedPath = path.resolve(uploadsDir, ...slug);

    if (!requestedPath.startsWith(uploadsDir)) {
      return new NextResponse('Access denied', { status: 403 });
    }

    if (!fs.existsSync(requestedPath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stat = await fs.promises.stat(requestedPath);
    if (!stat.isFile()) {
      return new NextResponse('Not a file', { status: 400 });
    }

    const ext = path.extname(requestedPath).toLowerCase().replace('.', '');
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const fileBuffer = await fs.promises.readFile(requestedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Last-Modified': stat.mtime.toUTCString(),
      },
    });
  } catch (error: any) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
