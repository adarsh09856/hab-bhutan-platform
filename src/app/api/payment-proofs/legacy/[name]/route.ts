import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { paymentProofViewerStatus } from '@/lib/payment-proof-access';

export const dynamic = 'force-dynamic';

const LEGACY_NAME = /^(?:hab|slip)-\d{13}-\d{4}\.(?:jpg|png|webp|gif|pdf)$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const accessStatus = await paymentProofViewerStatus(req);
  if (accessStatus !== 200) return new NextResponse(accessStatus === 401 ? 'Authentication required' : 'Access denied', { status: accessStatus });
  const { name } = await params;
  if (!LEGACY_NAME.test(name)) return new NextResponse('File not found', { status: 404 });
  const filePath = path.join(process.cwd(), '.data', 'private-uploads', 'payment-proofs', 'legacy', name);
  try {
    const bytes = await readFile(filePath);
    const ext = path.extname(name).slice(1).toLowerCase();
    const types: Record<string, string> = {
      jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', pdf: 'application/pdf',
    };
    return new NextResponse(bytes, { headers: {
      'Content-Type': types[ext],
      'Content-Disposition': `inline; filename="payment-proof.${ext}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error: any) {
    return new NextResponse(error?.code === 'ENOENT' ? 'File not found' : 'Proof temporarily unavailable', { status: error?.code === 'ENOENT' ? 404 : 503 });
  }
}
