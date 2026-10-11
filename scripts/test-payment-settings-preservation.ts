import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { GET as getAdminPayments, POST } from '../src/app/api/admin/payments/route';
import { GET as getPublicPayments } from '../src/app/api/payment-methods/route';
import { GET as getPublicSiteSettings } from '../src/app/api/site-settings/route';
import { PUT as updateAdminSiteSettings } from '../src/app/api/admin/site-settings/route';

async function main() {
  const originals = {
    user: prisma.user.findUnique,
    setting: prisma.siteSetting.findUnique,
    upsert: prisma.siteSetting.upsert,
    audit: prisma.auditLog.create,
  };
  const existingGateways = {
    localization: { primaryLanguage: 'dz', enabled: true },
    styling: { theme: 'hab-cream' },
    bnb: { enabled: true, accountTitle: 'Saved BNB settings' },
    bob: { qrUrl: '/uploads/old-mbob-qr.png', accountTitle: 'Saved BoB settings' },
    card: { enabled: false, secretKey: 'preserved-secret', webhookSecret: 'preserved-webhook' },
  };
  let saved: any;

  try {
    (prisma.user as any).findUnique = async () => ({
      id: 'payment-test-user', email: 'payment-test@example.invalid', name: 'Payment test',
      status: 'ACTIVE', sessionVersion: 1,
      role: { id: 'payment-test-role', slug: 'super_admin', status: 'ACTIVE', version: 1, permissions: ['orders:edit', 'orders:view'] },
    });
    (prisma.siteSetting as any).findUnique = async () => ({ paymentGateways: saved || existingGateways });
    (prisma.siteSetting as any).upsert = async (args: any) => {
      saved = args.update.paymentGateways;
      return { ...args.update, paymentGateways: saved };
    };
    (prisma.auditLog as any).create = async () => ({ id: 'mock-audit' });

    const token = await createSessionToken({ id: 'payment-test-user', email: 'payment-test@example.invalid', roleSlug: 'super_admin', permissions: ['orders:edit'] });
    const req = new NextRequest('http://localhost/api/admin/payments', {
      method: 'POST',
      headers: { Cookie: `hab_session=${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card: { enabled: false, secretKey: 'sk_test_••••••••', webhookSecret: 'whsec_••••••••' },
        cod: { enabled: true, instructions: 'Updated COD instructions' },
        mbob: { enabled: true, accountTitle: 'Test account', qrImageUrl: '/uploads/new-mbob-qr.png' },
        bank: { enabled: true, bankName: 'Test bank', accountTitle: 'Test title', accountNumber: '0000', instructions: 'Transfer instructions' },
      }),
    });

    const response = await POST(req);
    assert.equal(response.status, 200);
    assert.deepEqual(saved.localization, existingGateways.localization);
    assert.deepEqual(saved.styling, existingGateways.styling);
    assert.deepEqual(saved.bnb, existingGateways.bnb);
    assert.equal(saved.mbob.qrImageUrl, '/uploads/new-mbob-qr.png');
    assert.equal(saved.bob.qrUrl, '/uploads/new-mbob-qr.png', 'Admin Payments synchronizes the Donate Settings QR value');
    assert.equal(saved.card.secretKey, existingGateways.card.secretKey, 'masked secret is retained');
    assert.equal(saved.card.webhookSecret, existingGateways.card.webhookSecret, 'masked webhook secret is retained');
    assert.equal(saved.cod.instructions, 'Updated COD instructions');
    assert.equal(saved.bank.bankName, 'Test bank');

    const adminGet = await getAdminPayments(new NextRequest('http://localhost/api/admin/payments', { headers: { Cookie: `hab_session=${token}` } }));
    assert.equal((await adminGet.json()).gateways.mbob.qrImageUrl, '/uploads/new-mbob-qr.png');

    const donateSave = await updateAdminSiteSettings(new NextRequest('http://localhost/api/admin/site-settings', {
      method: 'PUT',
      headers: { Cookie: `hab_session=${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bobQrUrl: '/uploads/from-donate-settings.png' }),
    }));
    assert.equal(donateSave.status, 200);
    assert.equal(saved.mbob.qrImageUrl, '/uploads/from-donate-settings.png', 'Donate Settings updates the canonical mBoB QR URL');
    assert.equal(saved.bob.qrUrl, '/uploads/from-donate-settings.png', 'Donate Settings retains the legacy QR field in sync');

    const adminAfterDonate = await getAdminPayments(new NextRequest('http://localhost/api/admin/payments', { headers: { Cookie: `hab_session=${token}` } }));
    assert.equal((await adminAfterDonate.json()).gateways.mbob.qrImageUrl, '/uploads/from-donate-settings.png');
    const publicPaymentGet = await getPublicPayments();
    assert.equal((await publicPaymentGet.json()).methods.mbob.qrImageUrl, '/uploads/from-donate-settings.png');
    const publicSiteSettingsGet = await getPublicSiteSettings();
    assert.equal((await publicSiteSettingsGet.json()).setting.bobQrUrl, '/uploads/from-donate-settings.png');
    console.log('PASS: QR saves from either Admin editor persist consistently through both public payment APIs; unrelated settings/secrets remain intact (in-memory Prisma mocks; no database writes).');
  } finally {
    (prisma.user as any).findUnique = originals.user;
    (prisma.siteSetting as any).findUnique = originals.setting;
    (prisma.siteSetting as any).upsert = originals.upsert;
    (prisma.auditLog as any).create = originals.audit;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
