import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { POST as upload } from '../src/app/api/upload/route';
import { POST as uploadDonationSlip } from '../src/app/api/donations/upload/route';
import { validatePublicUpload } from '../src/lib/upload-validation';

const samples: Array<{ mime: string; bytes: number[]; extension: string }> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff, 0x00], extension: 'jpg' },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], extension: 'png' },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], extension: 'webp' },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], extension: 'gif' },
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46, 0x2d], extension: 'pdf' },
];

for (const sample of samples) {
  assert.equal(validatePublicUpload(Uint8Array.from(sample.bytes), sample.mime), sample.extension, `${sample.mime} signature accepted with canonical extension`);
}

const htmlSvg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
assert.equal(validatePublicUpload(htmlSvg, 'image/png'), null, 'SVG/HTML payload rejected when labeled as PNG');
assert.equal(validatePublicUpload(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]), 'image/png'), null, 'truncated PNG rejected');
assert.equal(validatePublicUpload(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]), 'image/jpeg'), null, 'MIME/signature mismatch rejected');
assert.equal(validatePublicUpload(htmlSvg, 'image/svg+xml'), null, 'unsupported SVG MIME rejected');

async function exerciseEndpoint(name: string, handler: (request: NextRequest) => Promise<Response>) {
  const hostileForm = new FormData();
  hostileForm.append('file', new Blob([htmlSvg], { type: 'image/png' }), 'payload.svg');
  const hostileResponse = await handler(new NextRequest(`http://localhost/api/${name}`, { method: 'POST', body: hostileForm }));
  assert.equal(hostileResponse.status, 400, `${name} rejects an SVG body disguised as PNG`);

  const validPngSignature = Uint8Array.from(samples.find((sample) => sample.mime === 'image/png')!.bytes);
  const validForm = new FormData();
  validForm.append('file', new Blob([validPngSignature], { type: 'image/png' }), 'attacker.svg');
  const validResponse = await handler(new NextRequest(`http://localhost/api/${name}`, { method: 'POST', body: validForm }));
  assert.equal(validResponse.status, 200, `${name} accepts valid PNG signature`);
  const result = await validResponse.json() as { url?: string; fileName?: string };
  const filename = result.fileName || result.url?.split('/').pop();
  assert.ok(filename?.endsWith('.png'), `${name} derives .png extension from content type, not submitted .svg suffix`);
  const relativePath = name === 'donations/upload' ? join('public', 'uploads', 'slips', filename!) : join('public', 'uploads', filename!);
  await unlink(join(process.cwd(), relativePath));
}

async function main() {
  await exerciseEndpoint('upload', upload);
  await exerciseEndpoint('donations/upload', uploadDonationSlip);
  console.log(`Public upload checks passed: ${samples.length} supported signatures, 4 malformed/mismatched cases, both HTTP handlers rejected disguised SVGs, canonical extensions verified, and test files removed.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
