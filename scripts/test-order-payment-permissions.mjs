import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const baseUrl = process.env.ORDER_PERMISSION_TEST_URL || 'http://127.0.0.1:3033';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const orderNumber = `LOCAL-PERM-${Date.now()}`;
const roleSlugs = [`local_orders_edit_${suffix}`, `local_orders_pay_${suffix}`];
const users = [];
let roles = [];
let orderId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createStaff(role, permissions) {
  const user = await prisma.user.create({
    data: {
      email: `local-order-permission-${role.slug}@example.invalid`,
      name: 'Local order permission check',
      passwordHash: 'not-used',
      roleId: role.id,
    },
  });
  users.push(user);
  const token = await new SignJWT({
    user: {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      roleId: role.id,
      role: role.slug,
      roleSlug: role.slug,
      roleVersion: role.version,
      roleStatus: role.status,
      permissions,
      sessionVersion: user.sessionVersion,
      mustChangePassword: false,
    },
  }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
  return token;
}

async function patchPayment(id, token) {
  const response = await fetch(`${baseUrl}/api/admin/orders`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(token ? { Cookie: `hab_session=${token}` } : {}) },
    body: JSON.stringify({ id, paymentStatus: 'PAID' }),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

async function run() {
  const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : '';
  const appHost = new URL(baseUrl).hostname;
  assert(['localhost', '127.0.0.1', '::1'].includes(dbHost), 'Safety stop: only local PostgreSQL is allowed.');
  assert(['localhost', '127.0.0.1', '::1'].includes(appHost), 'Safety stop: only a local app URL is allowed.');
  assert(process.env.JWT_SECRET?.length >= 32, 'Local JWT_SECRET is missing or too short.');

  try {
    roles.push(await prisma.role.create({ data: { name: 'Temporary order editor without payment rights', slug: roleSlugs[0], permissions: ['orders:view', 'orders:edit'] } }));
    roles.push(await prisma.role.create({ data: { name: 'Temporary order payment verifier', slug: roleSlugs[1], permissions: ['orders:view', 'orders:edit', 'orders:payment'] } }));
    const editorToken = await createStaff(roles[0], ['orders:view', 'orders:edit']);
    const paymentToken = await createStaff(roles[1], ['orders:view', 'orders:edit', 'orders:payment']);

    const order = await prisma.order.create({ data: {
      orderNumber,
      customerType: 'GUEST',
      customerName: 'Temporary local order permission test',
      customerEmail: `local-order-${suffix}@example.invalid`,
      shippingAddress: { fullName: 'Local Test', street: 'Test only', city: 'Thimphu', country: 'Bhutan' },
      shippingFeeUSD: 0,
      paymentMethod: 'BANK',
      paymentStatus: 'PENDING',
      orderStatus: 'PROCESSING',
      totalUSD: 1,
      totalPaidCurrency: 84,
      items: [],
    } });
    orderId = order.id;

    const anonymous = await patchPayment(orderId, null);
    assert(anonymous.response.status === 401, `Anonymous payment write returned ${anonymous.response.status}, expected 401.`);

    const editor = await patchPayment(orderId, editorToken);
    assert(editor.response.status === 403, `orders:edit-only payment write returned ${editor.response.status}, expected 403.`);
    assert((await prisma.order.findUnique({ where: { id: orderId } })).paymentStatus === 'PENDING', 'Denied payment edit changed the order.');

    const verifier = await patchPayment(orderId, paymentToken);
    assert(verifier.response.ok && verifier.body.success, `orders:payment write failed: ${verifier.body.error || verifier.response.status}.`);
    assert((await prisma.order.findUnique({ where: { id: orderId } })).paymentStatus === 'PAID', 'Authorized payment state was not persisted.');

    console.log('PASS: anonymous payment write 401; orders:edit-only 403 with no state change; orders:payment permitted and persisted PAID.');
  } finally {
    const cleanupErrors = [];
    if (orderId) await prisma.order.deleteMany({ where: { id: orderId } }).catch((error) => cleanupErrors.push(error));
    const actorIds = users.map((user) => user.id);
    if (actorIds.length) await prisma.auditLog.deleteMany({ where: { actorId: { in: actorIds } } }).catch((error) => cleanupErrors.push(error));
    if (users.length) await prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } }).catch((error) => cleanupErrors.push(error));
    if (roles.length) await prisma.role.deleteMany({ where: { id: { in: roles.map((role) => role.id) } } }).catch((error) => cleanupErrors.push(error));
    await prisma.$disconnect();
    if (cleanupErrors.length) {
      cleanupErrors.forEach((error) => console.error('Test cleanup failed:', error.message));
      process.exitCode = 1;
    }
  }
}

run().catch((error) => {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
});
