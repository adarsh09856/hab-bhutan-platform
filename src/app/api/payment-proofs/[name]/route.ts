import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { paymentProofViewerStatus } from '@/lib/payment-proof-access';
import { paymentProofPath } from '@/lib/payment-proof-storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const accessStatus = await paymentProofViewerStatus(req);
  if (accessStatus !== 200) return new NextResponse(accessStatus === 401 ? 'Authentication required' : 'Access denied', { status: accessStatus });

  try {
    const { name } = await params;
    const filePath = paymentProofPath(name);
    if (!filePath) return new NextResponse('File not found', { status: 404 });
    const bytes = await readFile(filePath).catch(() => null);
    if (!bytes) return new NextResponse('File not found', { status: 404 });
    const ext = path.extname(filePath).slice(1);
    const contentType: Record<string, string> = {
      jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', pdf: 'application/pdf',
    };
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType[ext] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="payment-proof.${ext}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Proof temporarily unavailable', { status: 503 });
  }
}
