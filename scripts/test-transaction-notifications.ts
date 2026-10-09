import assert from 'node:assert/strict';
import net from 'node:net';
import nodemailer from 'nodemailer';
import { NextRequest } from 'next/server';
import { createSessionToken } from '../src/lib/rbac';
import { PATCH as updateOrder } from '../src/app/api/admin/orders/route';
import { POST as submitOrder } from '../src/app/api/orders/route';
import prisma from '../src/lib/prisma';
import { sendEmail, sendOrderConfirmationEmail, sendMembershipStatusEmail } from '../src/lib/email-service';
import { notifySubmission, notifyOrderUpdate, notifyDonationStatus, orderNotificationEvents } from '../src/lib/transaction-notifications';
import { resolveBankTransferConfig } from '../src/lib/payments';

async function main() {
  // All database methods used by the sender are replaced before invoking it.
  // SMTP binds only to loopback, captures messages in memory and never relays.
  const captured: string[] = [];
  const memoryOnly = process.argv.includes('--memory');
  const originalTransport = nodemailer.createTransport;
  if (memoryOnly) {
    // Restricted environments can still test the real MIME renderer without
    // opening a socket. This does not prove SMTP connectivity or inbox delivery.
    (nodemailer as any).createTransport = (options: any) => {
      assert.equal(options.host, '127.0.0.1');
      const transport = originalTransport({ streamTransport: true, buffer: true, newline: 'windows' });
      return { sendMail: async (message: any) => {
        if (message.to.startsWith('reject@')) throw new Error('Test transport rejected recipient');
        const rendered = await transport.sendMail(message);
        captured.push(rendered.message.toString());
        return { ...rendered, accepted: [message.to] };
      } };
    };
  }
  const audit: any[] = [];
  const sockets = new Set<net.Socket>();
  const server = net.createServer(socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.write('220 localhost test sink\r\n');
    let pending = '';
    let dataMode = false;
    let message = '';
    socket.on('data', chunk => {
      pending += chunk.toString();
      let end;
      while ((end = pending.indexOf('\r\n')) >= 0) {
        const line = pending.slice(0, end);
        pending = pending.slice(end + 2);
        if (dataMode) {
          if (line === '.') { captured.push(message); message = ''; dataMode = false; socket.write('250 accepted\r\n'); }
          else message += line + '\r\n';
        } else if (/^(EHLO|HELO)/i.test(line)) socket.write('250 localhost\r\n');
        else if (/^DATA/i.test(line)) { dataMode = true; socket.write('354 send data\r\n'); }
        else if (/^QUIT/i.test(line)) socket.end('221 bye\r\n');
        else if (/^RCPT TO:.*reject@/i.test(line)) socket.write('550 rejected for test\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  if (!memoryOnly) await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = memoryOnly ? 2525 : (server.address() as net.AddressInfo).port;
  const savedFind = prisma.siteSetting.findUnique;
  const savedAudit = prisma.auditLog.create;
  const smtp = { host: '127.0.0.1', port, secure: false, fromEmail: 'hab@example.invalid', fromName: 'HAB test' };
  const smtpEnv = ['SMTP_USER', 'SMTP_PASS', 'SMTP_SECURE'] as const;
  const oldEnv = smtpEnv.map(key => process.env[key]);
  smtpEnv.forEach(key => delete process.env[key]);
  (prisma.siteSetting as any).findUnique = async () => ({
    emailSettings: smtp, officialEmail: 'staff@example.invalid', emailTemplates: {},
    checkoutBankName: 'Local test bank', checkoutAccountTitle: 'HAB local test', checkoutAccountNumber: 'TEST-ONLY',
    paymentGateways: { bob: { accountNumber: 'LOCAL-BOB' }, bnb: { accountNumber: 'LOCAL-BNB' } },
  });
  (prisma.auditLog as any).create = async ({ data }: any) => { audit.push(data); return data; };
  try {
    const missing = await sendEmail({ to: 'buyer@example.invalid', subject: 'test', body: 'test', customConfig: {} });
    assert.equal(missing.success, false);
    assert.equal(captured.length, 0);
    assert.equal(audit.at(-1).action, 'EMAIL_DISPATCH_FAILED');

    for (const kind of ['membership', 'wholesale', 'quote', 'contact', 'donation'] as const) {
      const before: number = captured.length;
      const result = await notifySubmission({ kind, name: 'Test <Applicant>', email: 'buyer@example.invalid', id: `test-${kind}`, reference: 'HAB-LOCAL', siteUrl: 'http://localhost' });
      assert.equal(result.customer.success, true);
      assert.equal(result.staff.success, true);
      assert.equal(captured.length, before + 2, `${kind} sends applicant and staff notices`);
    }
    const order = { id: 'test-order', orderNumber: 'HAB-LOCAL-1', orderStatus: 'PENDING_PAYMENT', paymentStatus: 'PENDING', customerEmail: 'buyer@example.invalid', customerName: 'Test Buyer', totalUSD: 12, paymentMethod: 'BANK' };
    await sendOrderConfirmationEmail({ order, customerEmail: order.customerEmail, customerName: order.customerName, siteUrl: 'http://localhost' });
    assert.match(captured.at(-1)!.replace(/=\r\n/g, ''), /not a payment receipt/);
    const paid = { ...order, paymentStatus: 'PAID', orderStatus: 'PAID' };
    assert.deepEqual(orderNotificationEvents(order, paid), ['payment_paid']);
    await notifyOrderUpdate(order, paid);
    assert.match(captured.at(-1)!, /confirmed your payment/);
    const count = captured.length;
    assert.equal(await notifyOrderUpdate(paid, paid), null);
    assert.equal(captured.length, count, 'Saving an unchanged status sends no new email');
    assert.deepEqual(orderNotificationEvents(paid, { paymentStatus: 'REFUNDED', orderStatus: 'REFUNDED' }), ['payment_refunded']);
    await sendMembershipStatusEmail({ application: { id: 'test-member', applicantName: 'Test Registered Name', email: 'buyer@example.invalid' }, status: 'UNDER_REVIEW' });
    assert.match(captured.at(-1)!, /Test Registered Name/);
    assert.match(captured.at(-1)!, /reviewing your membership/);
    const rejected = await sendEmail({ to: 'reject@example.invalid', subject: 'rejection', body: 'test', customConfig: smtp });
    assert.equal(rejected.success, false);
    assert.equal(audit.at(-1).action, 'EMAIL_DISPATCH_FAILED');
    assert.ok(audit.some(item => item.action === 'EMAIL_DISPATCH_ACCEPTED'));

    assert.equal(resolveBankTransferConfig(null).enabled, false);
    assert.equal(resolveBankTransferConfig({}).accountNumber, '');
    const configured = { checkoutBankName: 'Test bank', checkoutAccountTitle: 'HAB test', checkoutAccountNumber: 'TEST-ONLY', paymentGateways: { bank: { accountNumber: 'OLD-TEST' } } };
    assert.equal(resolveBankTransferConfig(configured).enabled, true);
    assert.equal(resolveBankTransferConfig(configured).accountNumber, 'TEST-ONLY');
    assert.equal(resolveBankTransferConfig({ ...configured, paymentGateways: { bank: { enabled: false } } }).enabled, false);
    const donation = { id: 'test-donation', status: 'COMPLETED', donorEmail: 'donor@example.invalid', donorName: 'Test Donor', receiptNumber: 'LOCAL-DON', amountUSD: 5 };
    assert.equal((await notifyDonationStatus('PENDING', donation))?.success, true);
    assert.match(captured.at(-1)!.replace(/=\r\n/g, ''), /confirmed your donation/);
    assert.equal(await notifyDonationStatus('COMPLETED', donation), null);

    const oldCount = prisma.rateLimitAttempt.count;
    const oldAttempt = prisma.rateLimitAttempt.create;
    const oldPrune = prisma.rateLimitAttempt.deleteMany;
    const oldFx = prisma.fxRateRecord.findFirst;
    (prisma.rateLimitAttempt as any).count = async () => 0;
    (prisma.rateLimitAttempt as any).create = async () => ({});
    (prisma.rateLimitAttempt as any).deleteMany = async () => ({ count: 0 });
    (prisma.fxRateRecord as any).findFirst = async () => ({ rate: 84, isManualOverride: true, fetchedAt: new Date() });
    try {
      const submit = (extra: Record<string, unknown>) => submitOrder(new NextRequest('http://localhost/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items: [{ code: 'TEST-ONLY', quantity: 1 }], paymentMethod: 'BANK', currency: 'USD', ...extra }) }));
      const noRef = await submit({});
      assert.equal(noRef.status, 400);
      assert.match((await noRef.json()).error, /bank transfer reference/);
      const noProof = await submit({ mBOBTransactionRef: 'LOCAL-REF' });
      assert.equal(noProof.status, 400);
      assert.match((await noProof.json()).error, /receipt/);
      const externalProof = await submit({ mBOBTransactionRef: 'LOCAL-REF', proofUrl: 'https://example.invalid/proof.pdf' });
      assert.equal(externalProof.status, 400);
      const missingProof = await submit({ mBOBTransactionRef: 'LOCAL-REF', proofUrl: '/uploads/hab-does-not-exist-local.pdf' });
      assert.equal(missingProof.status, 400);
      assert.match((await missingProof.json()).error, /not found/);
    } finally {
      (prisma.rateLimitAttempt as any).count = oldCount;
      (prisma.rateLimitAttempt as any).create = oldAttempt;
      (prisma.rateLimitAttempt as any).deleteMany = oldPrune;
      (prisma.fxRateRecord as any).findFirst = oldFx;
    }

    // Exercise the public checkout handler against an in-memory catalogue and
    // transaction. Client-supplied price/name must never become order totals.
    const priorCount = prisma.rateLimitAttempt.count;
    const priorAttempt = prisma.rateLimitAttempt.create;
    const priorFx = prisma.fxRateRecord.findFirst;
    const priorTransaction = prisma.$transaction;
    const priorRandom = Math.random;
    Math.random = () => 0.5;
    let available = true;
    let inventory = 2;
    let txWrites = 0;
    let failDatabase = false;
    let savedOrder: any = null;
    (prisma.rateLimitAttempt as any).count = async () => 0;
    (prisma.rateLimitAttempt as any).create = async () => ({});
    (prisma.fxRateRecord as any).findFirst = async () => ({ rate: 84, isManualOverride: true, fetchedAt: new Date() });
    (prisma as any).$transaction = async (operation: any) => {
      if (failDatabase) throw new Error('Test database unavailable');
      return operation({
        product: {
          findMany: async () => available ? [{ id: 'product-local', code: 'LOCAL-01', name: 'Actual catalogue item', priceUSD: 38 }] : [],
          updateMany: async ({ where }: any) => {
            if (inventory < where.stock.gte) return { count: 0 };
            inventory -= where.stock.gte;
            txWrites++;
            return { count: 1 };
          },
        },
        order: { create: async ({ data }: any) => {
          savedOrder = { ...data, id: 'order-local', createdAt: new Date() };
          return savedOrder;
        } },
      });
    };
    const attempt = (items: any[]) => submitOrder(new NextRequest('http://localhost/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      items, paymentMethod: 'COD', currency: 'USD', customerName: 'Local Buyer', email: 'buyer@example.invalid', shippingAddress: { street: 'Local test only' },
    }) }));
    try {
      const original = [{ code: 'LOCAL-01', name: 'Forged name', priceUsd: 0.01, quantity: 1 }];
      assert.equal((await submitOrder(new NextRequest('http://localhost/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items: original, paymentMethod: 'COD', currency: 'EUR', customerName: 'Local Buyer', email: 'buyer@example.invalid', shippingAddress: { street: 'Local test only' } }) }))).status, 400);
      assert.equal((await submitOrder(new NextRequest('http://localhost/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items: original, paymentMethod: 'COD', currency: 'USD', customerName: 'Local Buyer', email: 'invalid', shippingAddress: { street: 'Local test only' } }) }))).status, 400);
      available = false;
      assert.equal((await attempt(original)).status, 400);
      assert.equal(txWrites, 0);
      available = true;
      assert.equal((await attempt([{ ...original[0], quantity: 3 }])).status, 400);
      assert.equal(inventory, 2);
      assert.equal((await attempt([original[0], original[0]])).status, 400);
      failDatabase = true;
      assert.equal((await attempt(original)).status, 503);
      assert.equal(txWrites, 0);
      failDatabase = false;
      const accepted = await attempt(original);
      assert.equal(accepted.status, 200);
      const acceptedJson = await accepted.json();
      assert.equal(acceptedJson.order.subtotalUsd, 38);
      assert.equal(savedOrder.items[0].name, 'Actual catalogue item');
      assert.equal(savedOrder.items[0].priceUSD, 38);
      assert.equal(inventory, 1);
      assert.equal(txWrites, 1);
    } finally {
      (prisma.rateLimitAttempt as any).count = priorCount;
      (prisma.rateLimitAttempt as any).create = priorAttempt;
      (prisma.fxRateRecord as any).findFirst = priorFx;
      (prisma as any).$transaction = priorTransaction;
      Math.random = priorRandom;
    }
    const originalUser = prisma.user.findUnique;
    const originalOrderFind = prisma.order.findUnique;
    const originalOrderUpdate = prisma.order.update;
    let stored = { ...order, orderItems: [], trackingNumber: null as string | null };
    let permissions = ['orders:edit', 'orders:payment', 'orders:fulfill'];
    (prisma.user as any).findUnique = async () => ({ id: 'staff-test', email: 'staff@example.invalid', name: 'Test Staff', status: 'ACTIVE', sessionVersion: 1, role: { id: 'role-test', slug: 'staff_operator', version: 1, status: 'ACTIVE', permissions } });
    (prisma.order as any).findUnique = async () => ({ ...stored });
    (prisma.order as any).update = async ({ data }: any) => { stored = { ...stored, ...data }; return { ...stored }; };
    try {
      const token = await createSessionToken({ id: 'staff-test', sessionVersion: 1 });
      const patch = (body: any, signedIn = true) => updateOrder(new NextRequest('http://localhost/api/admin/orders', { method: 'PATCH', headers: { 'content-type': 'application/json', ...(signedIn ? { cookie: `hab_session=${token}` } : {}) }, body: JSON.stringify({ id: order.id, ...body }) }));
      assert.equal((await patch({ paymentStatus: 'PAID' }, false)).status, 401);
      permissions = ['orders:edit'];
      assert.equal((await patch({ paymentStatus: 'PAID' })).status, 403);
      assert.equal(stored.paymentStatus, 'PENDING');
      permissions = ['orders:edit', 'orders:payment', 'orders:fulfill'];
      const confirmation = await patch({ paymentStatus: 'PAID' });
      assert.equal(confirmation.status, 200);
      const confirmationBody = await confirmation.json();
      assert.equal(confirmationBody.order.orderStatus, 'PAID');
      assert.equal(confirmationBody.emailDelivery.success, true);
      const paidMailCount: number = captured.length;
      assert.equal((await patch({ paymentStatus: 'PAID' })).status, 200);
      assert.equal(captured.length, paidMailCount, 'Repeated payment save sends no new notice');
      assert.equal((await patch({ orderStatus: 'SHIPPED', trackingNumber: 'LOCAL-TRACK' })).status, 200);
      const shippedMailCount: number = captured.length;
      assert.equal((await patch({ internalNotes: 'Staff-only test note' })).status, 200);
      assert.equal(captured.length, shippedMailCount, 'Editing staff notes must not resend the shipping email');
      assert.equal((await patch({ trackingNumber: 'LOCAL-CORRECTED' })).status, 200);
      assert.equal(captured.length, shippedMailCount + 1, 'Corrected tracking number is sent to the customer');
    } finally {
      (prisma.user as any).findUnique = originalUser;
      (prisma.order as any).findUnique = originalOrderFind;
      (prisma.order as any).update = originalOrderUpdate;
    }
    console.log(`PASS: ${captured.length} emails captured by ${memoryOnly ? 'in-memory MIME transport (SMTP connectivity UNVERIFIED)' : 'loopback SMTP'}; submission pairs, pending/confirmed payment copy, status deduplication, member name, rejection, missing SMTP, saved bank settings, and Admin order-handler authorization/confirmation/shipping transitions checked. No external mail or database writes.`);
  } finally {
    (prisma.siteSetting as any).findUnique = savedFind;
    (prisma.auditLog as any).create = savedAudit;
    nodemailer.createTransport = originalTransport;
    smtpEnv.forEach((key, index) => { if (oldEnv[index] === undefined) delete process.env[key]; else process.env[key] = oldEnv[index]; });
    sockets.forEach(socket => socket.destroy());
    if (server.listening) await new Promise<void>(resolve => server.close(() => resolve()));
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
