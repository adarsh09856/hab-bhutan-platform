import nextEnv from '@next/env';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);
const host = process.env.ADMIN_LOGOUT_TEST_URL || 'http://127.0.0.1:3033';
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) throw new Error('Safety stop: this verification only permits localhost.');
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) throw new Error('Local JWT_SECRET is missing or too short.');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const token = await new SignJWT({ user: {
  id: 'local-logout-verification',
  userId: 'local-logout-verification',
  email: 'logout-verification@example.invalid',
  name: 'Local Logout Verification',
  role: 'super_admin',
  roleSlug: 'super_admin',
  permissions: ['*'],
  sessionVersion: 1,
} }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m').sign(new TextEncoder().encode(secret));

try {
  const before = await fetch(`${host}/admin`, { headers: { Cookie: `hab_session=${token}` }, redirect: 'manual', cache: 'no-store' });
  assert(before.status === 200, `Valid local staff session could not access Admin (${before.status}).`);

  const signout = await fetch(`${host}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: `hab_session=${token}` },
    redirect: 'manual',
    cache: 'no-store',
  });
  const signoutBody = await signout.json().catch(() => ({}));
  const setCookie = signout.headers.get('set-cookie') || '';
  assert(signout.ok && signoutBody.success, `Logout endpoint failed (${signout.status}).`);
  assert(/hab_session=;/.test(setCookie) && /max-age=0/i.test(setCookie), 'Logout did not expire the HAB session cookie.');
  assert(/no-store/i.test(signout.headers.get('cache-control') || ''), 'Logout response is missing no-store cache protection.');

  const after = await fetch(`${host}/admin`, { redirect: 'manual', cache: 'no-store' });
  const redirectLocation = after.headers.get('location');
  assert(after.status === 307 && redirectLocation && new URL(redirectLocation, host).pathname === '/admin/login', `Admin remained accessible after logout (HTTP ${after.status}; redirect ${redirectLocation || 'missing'}).`);
  console.log('PASS: local staff session reaches Admin; logout expires hab_session; a request without that cookie is redirected back to staff login.');
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
}
