import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const baseUrl = process.env.HAB_TEST_BASE_URL || 'http://127.0.0.1:3035';
const hostname = new URL(baseUrl).hostname;
if (!['127.0.0.1', 'localhost', '::1'].includes(hostname)) {
  throw new Error('This verification may only call a loopback/local app; no live accounts are touched.');
}

const dataDirectory = path.join(process.cwd(), '.data');
const dataFile = path.join(dataDirectory, 'wholesale-buyers.json');
const hadFile = existsSync(dataFile);
const originalBytes = hadFile ? readFileSync(dataFile) : null;
let originals;
try {
  originals = hadFile ? JSON.parse(originalBytes.toString('utf8')) : [];
} catch {
  throw new Error('Refusing to run: the local wholesale fallback data file is not valid JSON.');
}
if (!Array.isArray(originals)) throw new Error('Refusing to run: local wholesale fallback data is not a list.');

const testPassword = `Verify-${randomUUID()}-Only`;
const makeBuyer = async (status) => ({
  id: `local-test-${randomUUID()}`,
  username: `verify_${randomUUID().replaceAll('-', '').slice(0, 14)}`,
  passwordHash: await bcrypt.hash(testPassword, 4),
  companyName: 'Local verification account',
  contactName: 'Test only',
  email: `verify-${randomUUID()}@example.invalid`,
  phone: null,
  country: 'Bhutan',
  city: 'Thimphu',
  discountTier: 15,
  status,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

let activeBuyer;
let pendingBuyer;
try {
  activeBuyer = await makeBuyer('ACTIVE');
  pendingBuyer = await makeBuyer('PENDING');
  mkdirSync(dataDirectory, { recursive: true });
  writeFileSync(dataFile, JSON.stringify([...originals, activeBuyer, pendingBuyer], null, 2));

  const unauth = await fetch(`${baseUrl}/api/wholesale/auth`);
  assert.equal(unauth.status, 200, 'session check responds successfully');
  assert.equal((await unauth.json()).authenticated, false, 'no cookie is not authenticated');

  const badPassword = await fetch(`${baseUrl}/api/wholesale/auth`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: activeBuyer.username, password: 'incorrect-password' }),
  });
  assert.equal(badPassword.status, 401, 'invalid password is rejected');

  const pending = await fetch(`${baseUrl}/api/wholesale/auth`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: pendingBuyer.username, password: testPassword }),
  });
  assert.equal(pending.status, 403, 'pending account cannot sign in');

  const login = await fetch(`${baseUrl}/api/wholesale/auth`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: activeBuyer.email, password: testPassword }),
  });
  assert.equal(login.status, 200, 'active buyer can sign in with registered email');
  const loginBody = await login.json();
  assert.equal(loginBody.success, true);
  assert.equal(loginBody.buyer.username, activeBuyer.username);
  const cookie = login.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie?.startsWith('hab_wholesale_session='), 'login sets the wholesale session cookie');

  const session = await fetch(`${baseUrl}/api/wholesale/auth`, { headers: { cookie } });
  assert.equal((await session.json()).authenticated, true, 'session cookie remains valid');

  const logout = await fetch(`${baseUrl}/api/wholesale/auth`, { method: 'DELETE', headers: { cookie } });
  assert.equal(logout.status, 200, 'logout succeeds');
  const afterLogout = await fetch(`${baseUrl}/api/wholesale/auth`, { headers: { cookie: logout.headers.get('set-cookie')?.split(';')[0] || '' } });
  assert.equal((await afterLogout.json()).authenticated, false, 'logout clears the session cookie');

  console.log('PASS: invalid password denied; pending buyer denied; active email login, session persistence, and logout verified locally.');
} finally {
  if (hadFile) writeFileSync(dataFile, originalBytes);
  else if (existsSync(dataFile)) rmSync(dataFile);
}
