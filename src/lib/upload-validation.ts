const FILE_SIGNATURES: Record<string, { extension: string; matches: (bytes: Uint8Array) => boolean }> = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (bytes) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    matches: (bytes) => bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte),
  },
  'image/webp': {
    extension: 'webp',
    matches: (bytes) => bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP',
  },
  'image/gif': {
    extension: 'gif',
    matches: (bytes) => bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(String.fromCharCode(...bytes.slice(0, 6))),
  },
  'application/pdf': {
    extension: 'pdf',
    matches: (bytes) => bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-',
  },
};

/** Return a safe canonical extension only when MIME and file signature agree. */
export function validatePublicUpload(bytes: Uint8Array, claimedMime: string): string | null {
  const signature = FILE_SIGNATURES[claimedMime];
  return signature?.matches(bytes) ? signature.extension : null;
}
