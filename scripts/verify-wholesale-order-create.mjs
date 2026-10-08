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
const permissions = ['orders:view', 'orders:create', 'orders:edit', 'products:view', 'products:edit', 'products:delete'];
let role;
let actor;
let buyer;
let product;
const createdOrderIds = [];
const createdInquiryIds = [];

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

async function tradeRequest(token, payload) {
  const response = await fetch(`${baseUrl}/api/admin/trade`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', Cookie: `hab_session=${token}` },
    body: JSON.stringify(payload),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

async function getTradeAdmin(token) {
  const response = await fetch(`${baseUrl}/api/admin/trade`, {
    headers: { Cookie: `hab_session=${token}` },
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

    const privateCatalog = await fetch(`${baseUrl}/api/trade`);
    assert(privateCatalog.status === 401, 'anonymous visitors cannot read wholesale price data');

    const termsSaved = await tradeRequest(token, {
      action: 'save_terms',
      payload: { productCode: code, terms: { moq: 2, lead_time: '2 weeks', tiers: [[2, 60], [5, 50]], customisation: 'Test only', is_active: true } },
    });
    assert(termsSaved.response.ok && termsSaved.body.success, `Admin could not save product wholesale terms: ${termsSaved.body.error || termsSaved.response.status}`);
    const persistedTerms = await prisma.wholesaleProductTerms.findUnique({ where: { productId: product.id } });
    assert(persistedTerms?.moq === 2 && JSON.stringify(persistedTerms.tiers) === JSON.stringify([[2, 60], [5, 50]]), 'Admin pricing was not persisted exactly.');

    const invalidTerms = await tradeRequest(token, {
      action: 'save_terms',
      payload: { productCode: code, terms: { moq: 5, lead_time: '2 weeks', tiers: [[10, 50], [8, 40]], is_active: true } },
    });
    assert(invalidTerms.response.status === 400, 'out-of-order quantity tiers must be rejected');
    assert((await prisma.wholesaleProductTerms.findUnique({ where: { productId: product.id } })).moq === 2, 'invalid terms changed saved prices');

    const termsUpdated = await tradeRequest(token, {
      action: 'save_terms',
      payload: { productCode: code, terms: { moq: 2, lead_time: '3 weeks', tiers: [[2, 58], [5, 48]], customisation: 'Updated test only', is_active: true } },
    });
    assert(termsUpdated.response.ok && termsUpdated.body.success, `Admin could not update product wholesale terms: ${termsUpdated.body.error || termsUpdated.response.status}`);
    const adminRead = await getTradeAdmin(token);
    const adminProduct = adminRead.body.products?.find((item) => item.code === code);
    assert(adminRead.response.ok && adminProduct?.terms?.tiers?.[0]?.[1] === 58, 'Admin could not read the saved product wholesale terms.');

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

    const belowMoq = await request(token, {
      customerType: 'WHOLESALE', wholesaleBuyerId: buyer.id,
      customerName: 'test', customerEmail: buyerEmail,
      shippingAddress: {}, shippingMethod: 'EMS', paymentMethod: 'BANK',
      paymentStatus: 'PENDING', orderStatus: 'PROCESSING', items: [{ code, quantity: 1 }],
    });
    assert(belowMoq.response.status === 400, 'order below the saved product MOQ must be rejected');

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
    assert(saved.orderItems.length === 1 && saved.orderItems[0].priceUSD === 58, 'Server did not apply the configured wholesale quantity-tier price.');
    assert(await prisma.product.findUnique({ where: { id: product.id } }).then((item) => item.stock === 8), 'Successful order did not decrement stock by the ordered quantity.');

    const listed = await fetch(`${baseUrl}/api/admin/orders`, { headers: { Cookie: `hab_session=${token}` } });
    const listing = await listed.json();
    assert(listed.ok && listing.orders?.some((order) => order.id === saved.id), 'Created wholesale order was not visible in the admin order list.');
    assert(listing.wholesaleBuyers?.some((record) => record.id === buyer.id), 'Active wholesale buyer options were not returned for the order form.');

    const buyerToken = await new SignJWT({ wholesaleBuyer: { id: buyer.id } })
      .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));
    const buyerCatalog = await fetch(`${baseUrl}/api/trade`, { headers: { Cookie: `hab_wholesale_session=${buyerToken}` } });
    const buyerCatalogBody = await buyerCatalog.json();
    const catalogProduct = buyerCatalogBody.products?.find((item) => item.code === code);
    assert(buyerCatalog.ok && catalogProduct?.terms?.tiers?.[0]?.[1] === 58, 'Approved buyer catalogue did not return the saved private wholesale tier.');

    const quoteMoq = await fetch(`${baseUrl}/api/wholesale/quote`, {
      method: 'POST', headers: { 'content-type': 'application/json', Cookie: `hab_wholesale_session=${buyerToken}` },
      body: JSON.stringify({ items: [{ code, quantity: 1 }], buyerName: 'Forged name', buyerEmail: 'forged@example.invalid' }),
    });
    assert(quoteMoq.status === 400, 'quote endpoint must enforce the server-stored minimum quantity');
    const quoteRes = await fetch(`${baseUrl}/api/wholesale/quote`, {
      method: 'POST', headers: { 'content-type': 'application/json', Cookie: `hab_wholesale_session=${buyerToken}` },
      body: JSON.stringify({ items: [{ code, quantity: 2 }], buyerName: 'Forged name', buyerEmail: 'forged@example.invalid', destination: 'Bhutan' }),
    });
    const quoteBody = await quoteRes.json();
    assert(quoteRes.status === 201 && quoteBody.success, `Approved buyer quote submission failed: ${quoteBody.error || quoteRes.status}`);
    createdInquiryIds.push(quoteBody.inquiryId);
    const quoteRecord = await prisma.inquiry.findUnique({ where: { id: quoteBody.inquiryId } });
    assert(quoteRecord?.email === buyer.email && quoteRecord.name === buyer.contactName, 'Quote trusted forged buyer identity instead of the approved account.');
    assert(quoteRecord.message.includes('$58.00 = $116.00 USD'), 'Quote total did not use the saved product unit tier and requested quantity.');

    const termsDeleted = await tradeRequest(token, { action: 'delete_terms', payload: { productCode: code } });
    assert(termsDeleted.response.ok && !(await prisma.wholesaleProductTerms.findUnique({ where: { productId: product.id } })), 'Admin could not remove product-specific wholesale terms.');

    console.log('PASS: Admin product wholesale terms create/read/update/delete; bad-tier rejection; anonymous price privacy; approved-buyer catalogue and quote submission; server-side buyer identity, MOQ and tier pricing; wholesale order and inventory verified locally.');
  } finally {
    if (createdOrderIds.length) await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } }).catch(() => {});
    if (createdInquiryIds.length) await prisma.inquiry.deleteMany({ where: { id: { in: createdInquiryIds } } }).catch(() => {});
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
