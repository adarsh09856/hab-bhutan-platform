import assert from 'node:assert/strict';
import fs from 'node:fs';
import credentialRotation from './lib/admin-credential-rotation.cjs';

const update = credentialRotation.buildAdminPasswordUpdate('bcrypt-hash-only');
assert.deepEqual(update, {
  passwordHash: 'bcrypt-hash-only',
  sessionVersion: { increment: 1 },
});

function memoryPrisma(initialUser = null, initialRole = null) {
  const state = { user: initialUser ? { ...initialUser } : null, role: initialRole, audits: [], calls: [] };
  const tx = {
    user: {
      findUnique: async ({ where }) => state.user?.email === where.email ? { ...state.user } : null,
      update: async ({ where, data }) => {
        assert.equal(state.user?.id, where.id || state.user.id);
        state.calls.push('user.update');
        state.user = {
          ...state.user,
          passwordHash: data.passwordHash,
          sessionVersion: state.user.sessionVersion + data.sessionVersion.increment,
        };
        return { ...state.user };
      },
      create: async ({ data }) => {
        state.calls.push('user.create');
        state.user = { id: 'new-admin', sessionVersion: 1, twoFactorEnabled: false, ...data };
        return { ...state.user };
      },
    },
    role: {
      findFirst: async () => state.role ? { ...state.role } : null,
      create: async ({ data }) => {
        state.calls.push('role.create');
        state.role = { id: 'super-admin-v2', ...data };
        return { ...state.role };
      },
    },
    auditLog: {
      create: async ({ data }) => { state.audits.push(data); return data; },
    },
  };
  return { state, $transaction: async (callback) => callback(tx) };
}

const existingAccount = {
  id: 'existing-admin', email: 'admin@example.invalid', passwordHash: 'old-hash', sessionVersion: 4,
  status: 'SUSPENDED', roleId: 'custom-role', mustChangePassword: true,
  twoFactorEnabled: true, twoFactorSecret: 'preserve-existing-secret',
};
const rotationDb = memoryPrisma(existingAccount);
const rotated = await credentialRotation.rotateAdminPasswordInDatabase(rotationDb, existingAccount.email, 'new-bcrypt-hash');
assert.equal(rotated.passwordHash, 'new-bcrypt-hash');
assert.equal(rotated.sessionVersion, 5);
for (const key of ['status', 'roleId', 'mustChangePassword', 'twoFactorEnabled', 'twoFactorSecret']) {
  assert.equal(rotated[key], existingAccount[key], `Rotation changed existing account field ${key}`);
}
assert.deepEqual(rotationDb.state.calls, ['user.update'], 'Rotation touched records outside the account row');
assert.equal(rotationDb.state.audits.length, 1);
assert.equal(rotationDb.state.audits[0].details.sessionsRevoked, true);

const resetDb = memoryPrisma(existingAccount);
const resetResult = await credentialRotation.resetAdminPasswordInDatabase(resetDb, {
  email: existingAccount.email, name: 'HAB Secretariat Admin', passwordHash: 'reset-bcrypt-hash',
});
assert.equal(resetResult.passwordHash, 'reset-bcrypt-hash');
assert.equal(resetResult.sessionVersion, 5);
for (const key of ['status', 'roleId', 'mustChangePassword', 'twoFactorEnabled', 'twoFactorSecret']) {
  assert.equal(resetResult[key], existingAccount[key], `Reset changed existing account field ${key}`);
}
assert.deepEqual(resetDb.state.calls, ['user.update'], 'Reset changed unrelated roles or records for an existing account');
assert.equal(resetDb.state.audits[0].details.sessionsRevoked, true);

const createDb = memoryPrisma(null, { id: 'old-super-admin', slug: 'super_admin', version: 1, status: 'RETIRED' });
const created = await credentialRotation.resetAdminPasswordInDatabase(createDb, {
  email: 'admin@example.invalid', name: 'HAB Secretariat Admin', passwordHash: 'first-bcrypt-hash',
});
assert.equal(created.passwordHash, 'first-bcrypt-hash');
assert.equal(created.roleId, 'super-admin-v2');
assert.deepEqual(createDb.state.calls, ['role.create', 'user.create']);
assert.equal(createDb.state.audits[0].details.sessionsRevoked, false);

const rotate = fs.readFileSync(new URL('./rotate-credentials.mjs', import.meta.url), 'utf8');
const reset = fs.readFileSync(new URL('./reset-admin.js', import.meta.url), 'utf8');
const prismaSeed = fs.readFileSync(new URL('../prisma/seed.ts', import.meta.url), 'utf8');
const clientSeed = fs.readFileSync(new URL('./seed-client-data.mjs', import.meta.url), 'utf8');
const runtimeTests = fs.readFileSync(new URL('./runtime-verify.mjs', import.meta.url), 'utf8');
for (const [label, source] of [['rotation utility', rotate], ['reset utility', reset]]) {
  assert.match(source, /(?:rotate|reset)AdminPasswordInDatabase/, `${label} must use the tested DB credential helper`);
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

console.log('PASS: credential rotation/reset transaction behavior, account preservation/session revocation, first-admin role creation, seed safety, and no-plaintext persistence.');
