export function getWholesaleJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('Wholesale authentication is not configured securely.');
  }
  return new TextEncoder().encode(secret);
}
