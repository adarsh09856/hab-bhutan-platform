import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { POST } from '../src/app/api/admin/payments/route';

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
    card: { enabled: false, secretKey: 'preserved-secret', webhookSecret: 'preserved-webhook' },
  };
  let saved: any;

  try {
    (prisma.user as any).findUnique = async () => ({
      id: 'payment-test-user', email: 'payment-test@example.invalid', name: 'Payment test',
      status: 'ACTIVE', sessionVersion: 1,
      role: { id: 'payment-test-role', slug: 'super_admin', status: 'ACTIVE', version: 1, permissions: ['orders:edit'] },
    });
    (prisma.siteSetting as any).findUnique = async () => ({ paymentGateways: existingGateways });
    (prisma.siteSetting as any).upsert = async (args: any) => { saved = args.update.paymentGateways; return {}; };
    (prisma.auditLog as any).create = async () => ({ id: 'mock-audit' });

    const token = await createSessionToken({ id: 'payment-test-user', email: 'payment-test@example.invalid', roleSlug: 'super_admin', permissions: ['orders:edit'] });
    const req = new NextRequest('http://localhost/api/admin/payments', {
      method: 'POST',
      headers: { Cookie: `hab_session=${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card: { enabled: false, secretKey: 'sk_test_••••••••', webhookSecret: 'whsec_••••••••' },
        cod: { enabled: true, instructions: 'Updated COD instructions' },
        mbob: { enabled: true, accountTitle: 'Test account' },
        bank: { enabled: true, bankName: 'Test bank', accountTitle: 'Test title', accountNumber: '0000', instructions: 'Transfer instructions' },
      }),
    });

    const response = await POST(req);
    assert.equal(response.status, 200);
    assert.deepEqual(saved.localization, existingGateways.localization);
    assert.deepEqual(saved.styling, existingGateways.styling);
    assert.deepEqual(saved.bnb, existingGateways.bnb);
    assert.equal(saved.card.secretKey, existingGateways.card.secretKey, 'masked secret is retained');
    assert.equal(saved.card.webhookSecret, existingGateways.card.webhookSecret, 'masked webhook secret is retained');
    assert.equal(saved.cod.instructions, 'Updated COD instructions');
    assert.equal(saved.bank.bankName, 'Test bank');
    console.log('PASS: payment settings update preserves unrelated settings and masked secrets (in-memory Prisma mocks; no database writes).');
  } finally {
    (prisma.user as any).findUnique = originals.user;
    (prisma.siteSetting as any).findUnique = originals.setting;
    (prisma.siteSetting as any).upsert = originals.upsert;
    (prisma.auditLog as any).create = originals.audit;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
