import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const baseUrl = process.env.WHOLESALE_ORDER_TEST_URL || 'http://127.0.0.1:3001';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const buyerEmail = `local-wholesale-${suffix}@example.invalid`;
const roleSlug = `local_wholesale_order_${suffix.replace(/[^a-z0-9]/gi, '_')}`;
const code = `LOCAL-WH-${Date.now()}`;
const permissions = ['orders:view', 'orders:create'];
let role;
let actor;
let buyer;
let product;
const createdOrderIds = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createToken() {
  return new SignJWT({
    user: {
      id: actor.id, userId: actor.id, email: actor.email, name: actor.name,
      roleId: role.id, role: role.slug, roleSlug: role.slug,
      roleVersion: role.version, roleStatus: role.status, permissions,
      sessionVersion: actor.sessionVersion, mustChangePassword: false,
    },
  }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

async function request(token, payload) {
  const response = await fetch(`${baseUrl}/api/admin/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Cookie: `hab_session=${token}` },
    body: JSON.stringify(payload),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

async function run() {
  const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : '';
  const appHost = new URL(baseUrl).hostname;
  assert(['localhost', '127.0.0.1', '::1'].includes(dbHost), 'Safety stop: only a local PostgreSQL database is allowed.');
  assert(['localhost', '127.0.0.1', '::1'].includes(appHost), 'Safety stop: only a loopback app URL is allowed.');
  assert(process.env.JWT_SECRET?.length >= 32, 'Local JWT_SECRET is missing or too short.');

  try {
    const craft = await prisma.craft.findFirst({ select: { key: true } });
    assert(craft, 'No craft exists in the local test database.');
    role = await prisma.role.create({ data: { name: 'Temporary wholesale order test', slug: roleSlug, permissions } });
    actor = await prisma.user.create({
      data: { email: `local-wholesale-actor-${suffix}@example.invalid`, name: 'Local wholesale order test', passwordHash: 'not-used', roleId: role.id },
    });
    buyer = await prisma.wholesaleBuyer.create({
      data: {
        username: `local_wh_${suffix.replace(/[^a-z0-9]/gi, '').slice(-18)}`,
        passwordHash: await bcrypt.hash('local-only-test-password', 4),
        companyName: 'Local wholesale order verification', contactName: 'Local test only',
        email: buyerEmail, country: 'Bhutan', discountTier: 25, status: 'ACTIVE',
      },
    });
    product = await prisma.product.create({
      data: {
        code, name: 'Local wholesale order test item', priceUSD: 100, craftKey: craft.key,
        region: 'Local test only', description: 'Temporary item for a loopback API test.',
        images: [], stock: 10, status: 'PUBLISHED',
      },
    });
    const token = await createToken();

    const paidAttempt = await request(token, {
      customerType: 'WHOLESALE', wholesaleBuyerId: buyer.id,
      customerName: 'forged name ignored', customerEmail: 'forged@example.invalid',
      shippingAddress: {}, shippingMethod: 'EMS', paymentMethod: 'BANK',
      paymentStatus: 'PAID', orderStatus: 'PROCESSING',
      items: [{ code, quantity: 2, priceUSD: 0.01 }],
    });
    assert(paidAttempt.response.status === 403, `Unverified paid creation should be denied (HTTP ${paidAttempt.response.status}).`);
    assert(await prisma.product.findUnique({ where: { id: product.id } }).then((item) => item.stock === 10), 'Denied paid attempt changed inventory.');

    const walkInAttempt = await request(token, {
      customerType: 'WHOLESALE', wholesaleBuyerId: buyer.id,
      customerName: 'test', customerEmail: buyerEmail,
      shippingAddress: {}, shippingMethod: 'WALK_IN', paymentMethod: 'BANK',
      paymentStatus: 'PENDING', orderStatus: 'PROCESSING', items: [{ code, quantity: 1 }],
    });
    assert(walkInAttempt.response.status === 400, 'Wholesale walk-in checkout should be rejected.');

    const created = await request(token, {
      customerType: 'WHOLESALE', wholesaleBuyerId: buyer.id,
      customerName: 'forged name ignored', customerEmail: 'forged@example.invalid',
      shippingAddress: { city: 'Thimphu', country: 'Bhutan' }, shippingMethod: 'EMS',
      paymentMethod: 'BANK', paymentStatus: 'PENDING', orderStatus: 'PROCESSING',
      items: [{ code, quantity: 2, priceUSD: 0.01 }],
    });
    assert(created.response.ok && created.body.success, `Order create failed: ${created.body.error || created.response.status}.`);
    createdOrderIds.push(created.body.order.id);
    const saved = await prisma.order.findUnique({
      where: { id: created.body.order.id },
      include: { orderItems: true, wholesaleBuyer: true },
    });
    assert(saved?.customerType === 'WHOLESALE' && saved.wholesaleBuyerId === buyer.id, 'Order is not linked as a wholesale buyer order.');
    assert(saved.customerName === buyer.companyName && saved.customerEmail === buyer.email, 'Order accepted forged customer identity instead of stored buyer details.');
    assert(saved.orderItems.length === 1 && saved.orderItems[0].priceUSD === 75, 'Server did not apply the stored 25% discount to the retail price.');
    assert(await prisma.product.findUnique({ where: { id: product.id } }).then((item) => item.stock === 8), 'Successful order did not decrement stock by the ordered quantity.');

    const listed = await fetch(`${baseUrl}/api/admin/orders`, { headers: { Cookie: `hab_session=${token}` } });
    const listing = await listed.json();
    assert(listed.ok && listing.orders?.some((order) => order.id === saved.id), 'Created wholesale order was not visible in the admin order list.');
    assert(listing.wholesaleBuyers?.some((record) => record.id === buyer.id), 'Active wholesale buyer options were not returned for the order form.');

    console.log('PASS: wholesale order is linked to its buyer; account discount overrides forged client price; inventory decrements; unpaid/paid permission boundary and walk-in rejection verified locally.');
  } finally {
    if (createdOrderIds.length) await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } }).catch(() => {});
    if (product) await prisma.product.deleteMany({ where: { id: product.id } }).catch(() => {});
    if (buyer) await prisma.wholesaleBuyer.deleteMany({ where: { id: buyer.id } }).catch(() => {});
    if (actor) await prisma.auditLog.deleteMany({ where: { actorId: actor.id } }).catch(() => {});
    if (actor) await prisma.user.deleteMany({ where: { id: actor.id } }).catch(() => {});
    if (role) await prisma.role.deleteMany({ where: { id: role.id } }).catch(() => {});
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
});
