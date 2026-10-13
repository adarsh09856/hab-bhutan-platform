import assert from 'node:assert/strict';
import { smtpConnectionOptions } from '../src/lib/smtp-options';
assert.deepEqual(smtpConnectionOptions({ port: 587, secure: true }), { port: 587, secure: false, requireTLS: true });
assert.deepEqual(smtpConnectionOptions({ port: 465, secure: false }), { port: 465, secure: true, requireTLS: false });
assert.deepEqual(smtpConnectionOptions({}), { port: 587, secure: false, requireTLS: true });
assert.deepEqual(smtpConnectionOptions({ port: 2525, secure: true }), { port: 2525, secure: true, requireTLS: false });
assert.deepEqual(smtpConnectionOptions({ port: 2525, secure: false }), { port: 2525, secure: false, requireTLS: false });
console.log('PASS: standard SMTP ports use the correct TLS protocol; custom ports retain their configured mode.');
