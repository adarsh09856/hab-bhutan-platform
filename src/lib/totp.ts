import crypto from 'crypto';

// Base32 alphabet (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate a cryptographically secure 20-byte base32 secret for TOTP.
 */
export function generateTotpSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generate a 6-digit TOTP code for a given timestamp and secret (RFC 6238).
 */
export function generateTotpCode(secret: string, timeSlice?: number): string {
  const time = timeSlice !== undefined ? timeSlice : Math.floor(Date.now() / 1000 / 30);
  const secretBytes = base32Decode(secret);

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));

  const hmac = crypto.createHmac('sha1', secretBytes);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

/**
 * Verify a user-supplied 6-digit code with window drift (+/- 1 time step = 30s).
 */
export function verifyTotpCode(code: string, secret: string, window = 1): boolean {
  if (!code || code.length !== 6) return false;
  const currentTimeSlice = Math.floor(Date.now() / 1000 / 30);

  for (let i = -window; i <= window; i++) {
    const generated = generateTotpCode(secret, currentTimeSlice + i);
    if (crypto.timingSafeEqual(Buffer.from(code), Buffer.from(generated))) {
      return true;
    }
  }
  return false;
}

/**
 * Generate an otpauth:// URI for authenticator app enrollment (Google Authenticator, Microsoft Authenticator, 1Password).
 */
export function getTotpUri(email: string, secret: string, issuer = 'HAB Bhutan Secretariat'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate 8 cryptographically secure single-use backup codes.
 */
export function generateBackupCodes(count = 8): { plaintextCodes: string[]; hashedCodes: string[] } {
  const plaintextCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = `${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    plaintextCodes.push(code);
    hashedCodes.push(hash);
  }

  return { plaintextCodes, hashedCodes };
}

/**
 * Verify and consume a single-use backup code. Returns remaining hashed codes if valid, or null if invalid.
 */
export function verifyAndConsumeBackupCode(code: string, hashedCodes: string[]): string[] | null {
  const clean = code.trim().toUpperCase();
  const hash = crypto.createHash('sha256').update(clean).digest('hex');

  const idx = hashedCodes.indexOf(hash);
  if (idx === -1) return null;

  const remaining = [...hashedCodes];
  remaining.splice(idx, 1);
  return remaining;
}
