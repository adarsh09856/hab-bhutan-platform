import assert from 'node:assert/strict';
import fs from 'node:fs';
import credentialRotation from './lib/admin-credential-rotation.cjs';

const update = credentialRotation.buildAdminPasswordUpdate('bcrypt-hash-only');
assert.deepEqual(update, {
  passwordHash: 'bcrypt-hash-only',
  sessionVersion: { increment: 1 },
});

const rotate = fs.readFileSync(new URL('./rotate-credentials.mjs', import.meta.url), 'utf8');
const reset = fs.readFileSync(new URL('./reset-admin.js', import.meta.url), 'utf8');
const prismaSeed = fs.readFileSync(new URL('../prisma/seed.ts', import.meta.url), 'utf8');
const clientSeed = fs.readFileSync(new URL('./seed-client-data.mjs', import.meta.url), 'utf8');
const runtimeTests = fs.readFileSync(new URL('./runtime-verify.mjs', import.meta.url), 'utf8');
for (const [label, source] of [['rotation utility', rotate], ['reset utility', reset]]) {
  assert.match(source, /buildAdminPasswordUpdate\(passwordHash\)/, `${label} must persist only the hash and DB session-version change`);
  assert.doesNotMatch(source, /writeFileSync|ADMIN_PASSWORD\s*=|JWT_SECRET\s*=|\.env/, `${label} must not persist passwords or edit runtime secrets`);
  assert.doesNotMatch(source, /twoFactorEnabled\s*:\s*false|twoFactorSecret\s*:\s*null/, `${label} must preserve existing 2FA configuration`);
}
assert.doesNotMatch(reset, /deleteMany\s*\(/, 'Admin reset must not delete rate limits, navigation, slides, or unrelated records');
for (const [label, source] of [['Prisma seed', prismaSeed], ['client-data seed', clientSeed]]) {
  assert.doesNotMatch(source, /ArtisanMember2026!/, `${label} must not contain a fixed member password`);
  assert.match(source, /promptNewPassword/, `${label} must obtain a new account password interactively`);
  assert.match(source, /passwordHash:\s*member(?:Password)?Hash/, `${label} must persist a hash for a newly created user`);
}
assert.match(clientSeed, /process\.env\.NODE_ENV\s*===\s*'production'.*?prisma\.user\.count\(\)/s, 'Client-data seed must stop before writes on an initialized production database');
const fixedCredentialMarkers = [
  ['Artisan', 'Member', '2026!'].join(''),
  ['Admin', 'Secure', '2026!'].join(''),
  ['Bhutan', 'Crafts', '2026!'].join(''),
];
for (const marker of fixedCredentialMarkers) {
  assert.equal(runtimeTests.includes(marker), false, 'Runtime verification must not retain fixed account passwords');
}

console.log('PASS: maintenance and seed tools use interactive passwords, store only hashes in DB, revoke sessions by DB version, and preserve 2FA/unrelated records.');
