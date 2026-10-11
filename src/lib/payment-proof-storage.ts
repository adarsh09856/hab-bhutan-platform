import { randomUUID } from 'crypto';
import { mkdir, stat, writeFile } from 'fs/promises';
import path from 'path';

export const PAYMENT_PROOF_PREFIX = '/api/payment-proofs/';
const PRIVATE_PROOFS_DIR = path.join(process.cwd(), '.data', 'private-uploads', 'payment-proofs');
const PROOF_NAME = /^[a-f0-9-]{36}\.(?:jpg|png|webp|gif|pdf)$/;

export function paymentProofPath(name: string): string | null {
  return PROOF_NAME.test(name) ? path.join(PRIVATE_PROOFS_DIR, name) : null;
}

export async function storePaymentProof(buffer: Buffer, ext: string): Promise<string> {
  if (!/^(?:jpg|png|webp|gif|pdf)$/.test(ext)) throw new Error('Unsupported payment proof format');
  await mkdir(PRIVATE_PROOFS_DIR, { recursive: true, mode: 0o700 });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(PRIVATE_PROOFS_DIR, name), buffer, { flag: 'wx', mode: 0o600 });
  return `${PAYMENT_PROOF_PREFIX}${name}`;
}

export async function paymentProofExists(url: string): Promise<boolean> {
  let filePaths: string[] = [];
  if (url.startsWith(PAYMENT_PROOF_PREFIX)) {
    const filePath = paymentProofPath(url.slice(PAYMENT_PROOF_PREFIX.length));
    if (filePath) filePaths = [filePath];
  } else {
    const legacy = url.match(/^\/uploads\/(?:slips\/)?((?:hab|slip)-\d{13}-\d{4}\.(?:jpg|png|webp|gif|pdf))$/i);
    if (legacy) filePaths = [
      path.join(PRIVATE_PROOFS_DIR, 'legacy', legacy[1]),
      path.join(process.cwd(), 'public', url.slice(1)),
    ];
  }
  for (const filePath of filePaths) {
    try { if ((await stat(filePath)).isFile()) return true; } catch { /* Try the next preserved legacy location. */ }
  }
  return false;
}
