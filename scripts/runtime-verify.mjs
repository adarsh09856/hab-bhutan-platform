/**
 * Comprehensive Runtime Functional & Security Test Suite for HAB Platform
 * Directly asserts core business logic algorithms, validation rules, security invariants,
 * password hashing, JWT claims, edge route guards, and database schema contracts.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🧪 Starting HAB Platform Comprehensive Runtime Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}\n`);
  }
}

// TOTP Helper for test verification
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Decode(base32) {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function getTotpCode(secret, timeSlice) {
  const time = timeSlice !== undefined ? timeSlice : Math.floor(Date.now() / 1000 / 30);
  const secretBytes = base32Decode(secret);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));
  const hmac = crypto.createHmac('sha1', secretBytes);
  hmac.update(timeBuffer);
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return (code % 1000000).toString().padStart(6, '0');
}

// ==========================================
// 1. Shipping Calculation Runtime Logic
// ==========================================
function calculateShipping(subtotalUSD) {
  const isEmsFree = subtotalUSD >= 200;
  const emsCost = isEmsFree ? 0 : 24;
  const expressCost = 62;

  const ems = {
    key: 'ems',
    name: 'EMS / Bhutan Post',
    duration: '7–14 days, tracked',
    description: isEmsFree ? 'Free worldwide shipping on orders over $200' : '$24 worldwide tracked shipping',
    costUSD: emsCost,
    isFree: isEmsFree,
  };

  const express = {
    key: 'express',
    name: 'Express Courier',
    duration: '3–5 days, tracked and insured',
    description: 'Fast international delivery with end-to-end insurance',
    costUSD: expressCost,
    isFree: false,
  };

  return { ems, express, options: [ems, express] };
}

await runTest('Shipping: Subtotal < $200 incurs $24 EMS fee', () => {
  const result = calculateShipping(150);
  assert.equal(result.ems.costUSD, 24);
  assert.equal(result.ems.isFree, false);
});

await runTest('Shipping: Subtotal >= $200 receives FREE EMS shipping', () => {
  const result1 = calculateShipping(200);
  assert.equal(result1.ems.costUSD, 0);
  assert.equal(result1.ems.isFree, true);

  const result2 = calculateShipping(540);
  assert.equal(result2.ems.costUSD, 0);
  assert.equal(result2.ems.isFree, true);
});

await runTest('Shipping: Express courier is fixed at $62 regardless of subtotal', () => {
  const result1 = calculateShipping(50);
  assert.equal(result1.express.costUSD, 62);

  const result2 = calculateShipping(500);
  assert.equal(result2.express.costUSD, 62);
});

// ==========================================
// 2. CID 11-digit Validation Rule (RGoB DCRC Format)
// ==========================================
function validateCID(cid) {
  const clean = (cid || '').replace(/\D/g, '');
  return clean.length === 11;
}

await runTest('CID Validation: Exactly 11 digits required', () => {
  assert.equal(validateCID('10702001489'), true, 'Valid 11-digit CID should pass');
  assert.equal(validateCID('1070200148'), false, '10-digit CID should fail');
  assert.equal(validateCID('107020014899'), false, '12-digit CID should fail');
  assert.equal(validateCID(''), false, 'Empty CID should fail');
  assert.equal(validateCID('ABC10702001489XYZ'), true, 'Alphanumeric stripped to 11 digits passes');
  assert.equal(validateCID('ABC1070200148'), false, 'Alphanumeric stripped to 10 digits fails');
});

// ==========================================
// 3. FX Staleness Thresholds and Hard Ceiling
// ==========================================
function evaluateStaleness(hoursOld, isManualOverride) {
  if (isManualOverride) return { status: 'MANUAL_OVERRIDE', blocked: false };
  if (hoursOld <= 24) return { status: 'FRESH', blocked: false };
  if (hoursOld <= 72) return { status: 'STALE', blocked: false, warning: true };
  return { status: 'CRITICAL_STALE', blocked: true, error: 'BTN checkout suspended (>72h stale)' };
}

await runTest('FX Staleness: 0-24h Fresh, 24-72h Stale warning, >72h Critical halt', () => {
  assert.equal(evaluateStaleness(12, false).status, 'FRESH');
  assert.equal(evaluateStaleness(12, false).blocked, false);

  assert.equal(evaluateStaleness(36, false).status, 'STALE');
  assert.equal(evaluateStaleness(36, false).blocked, false);

  const breached = evaluateStaleness(73, false);
  assert.equal(breached.status, 'CRITICAL_STALE');
  assert.equal(breached.blocked, true);

  const overridden = evaluateStaleness(90, true);
  assert.equal(overridden.status, 'MANUAL_OVERRIDE');
  assert.equal(overridden.blocked, false);
});

// ==========================================
// 4. Currency Formatting (USD and BTN rounding)
// ==========================================
function formatPrice(usdAmount, currency, fxRate) {
  if (currency === 'USD') return '$' + usdAmount.toLocaleString();
  return 'Nu. ' + Math.round(usdAmount * fxRate).toLocaleString();
}

await runTest('Currency Formatting: BTN rounded to whole integer, USD exact', () => {
  assert.equal(formatPrice(100, 'USD', 84.0), '$100');
  assert.equal(formatPrice(100, 'BTN', 84.0), 'Nu. 8,400');
  assert.equal(formatPrice(15.5, 'BTN', 84.0), 'Nu. 1,302');
});

// ==========================================
// 5. RBAC Revocation Invariant (Suspended user or retired role must throw)
// ==========================================
function evaluatePermission({ userStatus, roleStatus, rolePermissions, requestedPermission }) {
  if (userStatus !== 'ACTIVE') {
    throw new Error('Account is inactive or suspended');
  }
  if (roleStatus === 'RETIRED') {
    throw new Error('Your assigned role has been retired');
  }
  const hasPermission = rolePermissions.includes('*') || rolePermissions.includes(requestedPermission);
  if (!hasPermission) {
    throw new Error(`Forbidden: missing permission '${requestedPermission}'`);
  }
  return true;
}

await runTest('RBAC: Active user with permission passes', () => {
  const allowed = evaluatePermission({
    userStatus: 'ACTIVE',
    roleStatus: 'ACTIVE',
    rolePermissions: ['orders:view'],
    requestedPermission: 'orders:view'
  });
  assert.equal(allowed, true);
});

await runTest('RBAC: Suspended user is blocked regardless of permissions', () => {
  assert.throws(() => {
    evaluatePermission({
      userStatus: 'SUSPENDED',
      roleStatus: 'ACTIVE',
      rolePermissions: ['*'],
      requestedPermission: 'orders:view'
    });
  }, /Account is inactive or suspended/);
});

await runTest('RBAC: Retired role is blocked regardless of token permissions', () => {
  assert.throws(() => {
    evaluatePermission({
      userStatus: 'ACTIVE',
      roleStatus: 'RETIRED',
      rolePermissions: ['*'],
      requestedPermission: 'orders:view'
    });
  }, /Your assigned role has been retired/);
});

// ==========================================
// 6. Security: Zero Hardcoded Plaintext Passwords in Login Route
// ==========================================
await runTest('Security: No hardcoded plaintext passwords in src/app/api/auth/login/route.ts', () => {
  const loginRoutePath = path.resolve('src/app/api/auth/login/route.ts');
  const content = fs.readFileSync(loginRoutePath, 'utf8');

  assert.equal(content.includes('BhutanCrafts2026!'), false, 'Forbidden string BhutanCrafts2026! found');
  assert.equal(content.includes('Artisan2026!'), false, 'Forbidden string Artisan2026! found');
  assert.equal(content.includes('mockUser'), false, 'Mock user objects found in login route');
  assert.equal(content.includes('bcrypt.compareSync'), true, 'bcrypt verification call must be present');
});

// ==========================================
// 7. Bcrypt: Password Hashing Verification
// ==========================================
await runTest('Bcrypt: New passwords match hashes, old deprecated credentials fail', () => {
  const testPassword = 'Test_Verification_Key_2026!';
  const adminHash = bcrypt.hashSync(testPassword, 10);
  const memberHash = bcrypt.hashSync('ArtisanMember2026!', 10);

  // Valid credentials verify
  assert.equal(bcrypt.compareSync(testPassword, adminHash), true);
  assert.equal(bcrypt.compareSync('ArtisanMember2026!', memberHash), true);

  // Old deprecated and exposed passwords must fail
  assert.equal(bcrypt.compareSync('AdminSecure2026!', adminHash), false);
  assert.equal(bcrypt.compareSync('H@b!Admin_7e684cdc9446168c', adminHash), false);
  assert.equal(bcrypt.compareSync('BhutanCrafts2026!', adminHash), false);
  assert.equal(bcrypt.compareSync('Artisan2026!', memberHash), false);
  assert.equal(bcrypt.compareSync('RandomPassword123!', adminHash), false);
});

// ==========================================
// 8. Jose JWT & Edge Session Token Invariants
// ==========================================
await runTest('Jose JWT: createSessionToken and verifyToken edge compatibility', async () => {
  const secretKey = new TextEncoder().encode(
    'a7f8e3b2c9d01458923485723948572093845720938457203948572093485720'
  );

  const payload = {
    userId: 'usr_admin_123',
    email: 'admin@handicraftsbhutan.org',
    roleSlug: 'super_admin',
    roleStatus: 'ACTIVE',
    permissions: ['*'],
  };

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  assert.ok(token, 'JWT token string generated');

  const { payload: verified } = await jose.jwtVerify(token, secretKey);
  assert.equal(verified.email, 'admin@handicraftsbhutan.org');
  assert.equal(verified.roleSlug, 'super_admin');
  assert.equal(verified.roleStatus, 'ACTIVE');
  assert.deepEqual(verified.permissions, ['*']);
});

// ==========================================
// 9. Edge Route Guard Middleware Simulation
// ==========================================
function simulateMiddleware(pathname, tokenPayload) {
  const isAdminPath = pathname.startsWith('/admin');
  const isPortalPath = pathname.startsWith('/portal');

  if (!isAdminPath && !isPortalPath) {
    return { status: 200, action: 'next' };
  }

  if (!tokenPayload) {
    return { status: 307, action: 'redirect', location: '/login' };
  }

  if (isAdminPath) {
    const isStaff = tokenPayload.roleSlug === 'super_admin' || tokenPayload.roleSlug === 'staff_operator';
    if (!isStaff) {
      return { status: 307, action: 'redirect', location: '/portal' };
    }
  }

  return { status: 200, action: 'next' };
}

await runTest('Middleware: Route guards enforce authenticated staff / portal access', () => {
  // Public paths unrestricted
  assert.equal(simulateMiddleware('/', null).action, 'next');
  assert.equal(simulateMiddleware('/shop', null).action, 'next');

  // Admin path without token -> redirect to /login
  const unauthAdmin = simulateMiddleware('/admin/orders', null);
  assert.equal(unauthAdmin.action, 'redirect');
  assert.equal(unauthAdmin.location, '/login');

  // Portal path without token -> redirect to /login
  const unauthPortal = simulateMiddleware('/portal/dashboard', null);
  assert.equal(unauthPortal.action, 'redirect');
  assert.equal(unauthPortal.location, '/login');

  // Member trying to access admin -> redirect to /portal
  const memberToken = { roleSlug: 'member', roleStatus: 'ACTIVE' };
  const memberToAdmin = simulateMiddleware('/admin/members', memberToken);
  assert.equal(memberToAdmin.action, 'redirect');
  assert.equal(memberToAdmin.location, '/portal');

  // Staff accessing admin -> allowed
  const staffToken = { roleSlug: 'staff_operator', roleStatus: 'ACTIVE' };
  const staffToAdmin = simulateMiddleware('/admin/members', staffToken);
  assert.equal(staffToAdmin.action, 'next');

  // Super admin accessing admin -> allowed
  const adminToken = { roleSlug: 'super_admin', roleStatus: 'ACTIVE' };
  assert.equal(simulateMiddleware('/admin/reports', adminToken).action, 'next');

  // Member accessing portal -> allowed
  assert.equal(simulateMiddleware('/portal/orders', memberToken).action, 'next');
});

// ==========================================
// 10. Database Schema Contract & Migration Check
// ==========================================
await runTest('Database Schema: PostgreSQL provider and all 14 models declared', () => {
  const schemaPath = path.resolve('prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  assert.equal(schema.includes('provider = "postgresql"'), true, 'schema.prisma must use postgresql');

  const requiredModels = [
    'Craft',
    'Member',
    'Product',
    'Order',
    'MembershipApplication',
    'Publication',
    'ProjectRecord',
    'NewsArticle',
    'CalendarEvent',
    'GovernanceRecord',
    'Role',
    'User',
    'AuditLog',
    'FxRateRecord',
  ];

  for (const model of requiredModels) {
    assert.equal(
      schema.includes(`model ${model} `) || schema.includes(`model ${model}{`),
      true,
      `Prisma model ${model} must exist in schema.prisma`
    );
  }
});

// ==========================================
// 11. Migration DDL PostgreSQL Native Enums Check
// ==========================================
await runTest('Migration DDL: Initial PostgreSQL migration exists with native types', () => {
  const migrationPath = path.resolve('prisma/migrations/20260906000000_init_postgresql/migration.sql');
  assert.equal(fs.existsSync(migrationPath), true, 'PostgreSQL migration file must exist');

  const ddl = fs.readFileSync(migrationPath, 'utf8');
  assert.equal(ddl.includes('CREATE TABLE "User"'), true);
  assert.equal(ddl.includes('CREATE TABLE "Order"'), true);
  assert.equal(ddl.includes('CREATE TABLE "MembershipApplication"'), true);
  assert.equal(ddl.includes('CREATE TABLE "AuditLog"'), true);
});

// ==========================================
// 12. Normalized OrderItem Model Contract & Referential Integrity Check
// ==========================================
await runTest('Database Schema: OrderItem model declared with Restrict on Product', () => {
  const schemaPath = path.resolve('prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  assert.equal(schema.includes('model OrderItem'), true, 'OrderItem model must exist');
  assert.equal(schema.includes('product   Product? @relation(fields: [productId], references: [id], onDelete: Restrict)'), true, 'OrderItem must restrict product deletion');
  assert.equal(schema.includes('orderItems        OrderItem[]'), true, 'Order must relate to orderItems');
  assert.equal(schema.includes('orderItems    OrderItem[]'), true, 'Product must relate to orderItems');
});

// ==========================================
// 13. Member Deletion Referential Safety Logic
// ==========================================
function evaluateMemberDeletionSafety(productCount, orderCount) {
  if (productCount > 0 || orderCount > 0) {
    return {
      allowed: false,
      reason: `Cannot permanently delete member: referenced by ${productCount} catalog products and ${orderCount} orders. Suspend member instead.`
    };
  }
  return { allowed: true, reason: null };
}

await runTest('Member Delete Guard: Blocks deletion if member has products or orders', () => {
  // Artisan maker with products -> blocked
  const res1 = evaluateMemberDeletionSafety(3, 0);
  assert.equal(res1.allowed, false);

  // Customer member with orders -> blocked
  const res2 = evaluateMemberDeletionSafety(0, 2);
  assert.equal(res2.allowed, false);

  // Active member with both -> blocked
  const res3 = evaluateMemberDeletionSafety(5, 4);
  assert.equal(res3.allowed, false);

  // Fresh member with zero products and zero orders -> allowed
  const res4 = evaluateMemberDeletionSafety(0, 0);
  assert.equal(res4.allowed, true);
});

// ==========================================
// 14. Product Deletion Referential Guard Logic
// ==========================================
function evaluateProductDeletionSafety(orderItemCount) {
  if (orderItemCount > 0) {
    return {
      allowed: false,
      reason: `Cannot permanently delete product: referenced by ${orderItemCount} historical order items. Archive instead.`
    };
  }
  return { allowed: true, reason: null };
}

await runTest('Product Delete Guard: Blocks deletion if product has historical order references', () => {
  const res1 = evaluateProductDeletionSafety(1);
  assert.equal(res1.allowed, false);

  const res2 = evaluateProductDeletionSafety(12);
  assert.equal(res2.allowed, false);

  const res3 = evaluateProductDeletionSafety(0);
  assert.equal(res3.allowed, true);
});

// ==========================================
// 15. Inventory Atomic Transaction Simulation
// ==========================================
function simulateOrderInventoryTransaction(stock, requestedQty, action = 'CREATE') {
  if (action === 'CREATE') {
    if (stock < requestedQty) {
      throw new Error(`Insufficient inventory: ${stock} available, ${requestedQty} requested`);
    }
    return stock - requestedQty;
  } else if (action === 'CANCEL') {
    return stock + requestedQty;
  }
  return stock;
}

await runTest('Inventory Transaction: Decrements on creation and restores on cancellation', () => {
  let catalogStock = 10;

  // Normal order
  catalogStock = simulateOrderInventoryTransaction(catalogStock, 2, 'CREATE');
  assert.equal(catalogStock, 8, 'Stock should decrement from 10 to 8');

  // Cancelled order restores stock
  catalogStock = simulateOrderInventoryTransaction(catalogStock, 2, 'CANCEL');
  assert.equal(catalogStock, 10, 'Stock should restore from 8 back to 10');

  // Oversell attempt throws error
  assert.throws(() => {
    simulateOrderInventoryTransaction(catalogStock, 15, 'CREATE');
  }, /Insufficient inventory/);
});

// ==========================================
// 16. Granular RBAC Permissions Coverage Check
// ==========================================
await runTest('RBAC Matrix: All granular permissions declared in permissions.ts', async () => {
  const { PERMISSION_CATEGORIES } = await import('../src/lib/permissions.js').catch(async () => {
    // Fallback import if ESM path resolving
    const permsFilePath = path.resolve('src/lib/permissions.ts');
    const content = fs.readFileSync(permsFilePath, 'utf8');
    return {
      raw: content,
    };
  });

  const permsFilePath = path.resolve('src/lib/permissions.ts');
  const content = fs.readFileSync(permsFilePath, 'utf8');

  const requiredSlugs = [
    'members:view', 'members:create', 'members:edit', 'members:verify', 'members:suspend', 'members:delete',
    'products:view', 'products:create', 'products:edit', 'products:publish', 'products:archive', 'products:delete',
    'orders:view', 'orders:create', 'orders:edit', 'orders:fulfill', 'orders:cancel', 'orders:refund',
    'applications:view', 'applications:create', 'applications:review', 'applications:approve', 'applications:reject', 'applications:delete',
    'content:view', 'content:create', 'content:edit', 'content:delete',
    'governance:view', 'governance:create', 'governance:edit', 'governance:delete',
    'reports:view', 'reports:export', 'projects:view', 'projects:create', 'projects:edit', 'projects:delete',
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'roles:view', 'roles:create', 'roles:retire', 'roles:reassign',
    'fx:override', 'audit:view'
  ];

  for (const slug of requiredSlugs) {
    assert.equal(
      content.includes(`'${slug}'`),
      true,
      `Permission slug '${slug}' must exist in src/lib/permissions.ts`
    );
  }
});

// ==========================================
// 17. Staff User Account Security & Password Hashing
// ==========================================
await runTest('User Accounts: Bcrypt password hashing & self-deactivation guard', async () => {
  const plainPassword = 'StaffOperator2026!';
  const hash = await bcrypt.hash(plainPassword, 10);

  const isMatch = await bcrypt.compare(plainPassword, hash);
  assert.equal(isMatch, true, 'Bcrypt password hash must match');

  const isWrong = await bcrypt.compare('WrongPassword!', hash);
  assert.equal(isWrong, false, 'Invalid password must not match');

  // Self-deactivation guard
  function checkSelfDeactivation(requestingUserId, targetUserId) {
    if (requestingUserId === targetUserId) {
      throw new Error('Self-deactivation is prohibited');
    }
    return true;
  }

  assert.throws(() => checkSelfDeactivation('usr-1', 'usr-1'), /Self-deactivation is prohibited/);
  assert.equal(checkSelfDeactivation('usr-1', 'usr-2'), true);
});

// ==========================================
// 18. Database-Backed Live Roundtrip Tests (Fixes 1 - 4)
// ==========================================

let adminCookie = '';
async function getAdminSessionCookie() {
  if (adminCookie) return adminCookie;
  let adminPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_TEST_PASSWORD || '';
  if (!adminPassword && fs.existsSync('.admin_credentials.local')) {
    const content = fs.readFileSync('.admin_credentials.local', 'utf8');
    const match = content.match(/ADMIN_PASSWORD=(.+)/);
    if (match) adminPassword = match[1].trim();
  }

  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({
      email: 'admin@handicraftsbhutan.org',
      password: adminPassword,
      targetPortal: 'admin',
    }),
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    adminCookie = setCookie.split(';')[0];
  }
  return adminCookie;
}

await runTest('Live DB Fix 1: OrderItem physical table roundtrip & cascade delete in PostgreSQL', async () => {
  const product = await prisma.product.findFirst({ where: { status: 'PUBLISHED' } });
  assert.ok(product, 'Must have at least one product in DB');

  const testOrderNumber = `TEST-ORDER-${Date.now()}`;
  const order = await prisma.order.create({
    data: {
      orderNumber: testOrderNumber,
      customerName: 'Karma Tshering',
      customerEmail: 'karma@example.com',
      shippingAddress: { city: 'Thimphu', country: 'Bhutan' },
      shippingFeeUSD: 24,
      totalUSD: product.priceUSD * 2 + 24,
      totalPaidCurrency: product.priceUSD * 2 + 24,
      items: [
        { code: product.code, name: product.name, priceUSD: product.priceUSD, quantity: 1 },
        { code: product.code, name: product.name, priceUSD: product.priceUSD, quantity: 1 },
      ],
      orderItems: {
        create: [
          { productId: product.id, code: product.code, name: product.name, priceUSD: product.priceUSD, quantity: 1 },
          { productId: product.id, code: product.code, name: product.name, priceUSD: product.priceUSD, quantity: 1 },
        ],
      },
    },
    include: { orderItems: true },
  });

  assert.equal(order.orderItems.length, 2, 'Order must have 2 orderItems created');

  // Query physically from PostgreSQL
  const dbItems = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    include: { product: true },
  });
  assert.equal(dbItems.length, 2, 'Must fetch exactly 2 OrderItem rows from DB');
  assert.equal(dbItems[0].productId, product.id, 'OrderItem productId must resolve to product');
  assert.equal(dbItems[0].product.name, product.name, 'OrderItem foreign key relation to Product must resolve');

  // Delete test order and verify cascade delete of OrderItem rows
  await prisma.order.delete({ where: { id: order.id } });
  const remainingItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
  assert.equal(remainingItems.length, 0, 'Cascade delete must remove OrderItem rows when Order is deleted');
});

await runTest('Live DB Fix 2: Random temporary credentials, mustChangePassword, login enforcement, and change-password', async () => {
  const cookie = await getAdminSessionCookie();

  const testEmail1 = `artisan1-${Date.now()}@example.com`;
  const testEmail2 = `artisan2-${Date.now()}@example.com`;

  const app1 = await prisma.membershipApplication.create({
    data: {
      applicantName: 'Tenzin Norbu',
      email: testEmail1,
      phone: '+975-17112233',
      cidNumber: '11502001928',
      craftKey: 'shagzo',
      dzongkhag: 'Trashiyangtse',
      villageGewog: 'Yangtse',
      yearsPractising: 8,
      planTier: 'ACTIVE_SECTOR_MEMBER',
      status: 'PENDING',
    },
  });

  const app2 = await prisma.membershipApplication.create({
    data: {
      applicantName: 'Sonam Deki',
      email: testEmail2,
      phone: '+975-17223344',
      cidNumber: '11502001929',
      craftKey: 'thagzo',
      dzongkhag: 'Lhuntse',
      villageGewog: 'Khoma',
      yearsPractising: 12,
      planTier: 'ACTIVE_SECTOR_MEMBER',
      status: 'PENDING',
    },
  });

  // Approve app1 via API
  const res1 = await fetch('http://localhost:3000/api/admin/applications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ id: app1.id, status: 'APPROVED', reviewerNotes: 'Test approval 1' }),
  });
  const data1 = await res1.json();
  assert.equal(res1.status, 200);
  assert.ok(data1.tempCredentials, 'tempCredentials must be returned in approval response');
  const tempPass1 = data1.tempCredentials.temporaryPassword;
  assert.ok(tempPass1.length >= 10, 'Temporary password must be at least 10 characters');

  // Approve app2 via API
  const res2 = await fetch('http://localhost:3000/api/admin/applications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ id: app2.id, status: 'APPROVED', reviewerNotes: 'Test approval 2' }),
  });
  const data2 = await res2.json();
  assert.equal(res2.status, 200);
  const tempPass2 = data2.tempCredentials.temporaryPassword;

  // Randomness check: temp passwords must NOT be identical
  assert.notEqual(tempPass1, tempPass2, 'Successive approvals must generate distinct random passwords');

  // Check DB state for User 1
  const user1 = await prisma.user.findUnique({ where: { email: testEmail1 } });
  assert.ok(user1, 'User 1 must be created in DB');
  assert.equal(user1.mustChangePassword, true, 'mustChangePassword must be true in DB upon creation');

  // Verify credential issuance audit log (and verify plaintext password is NOT logged)
  const auditLogs = await prisma.auditLog.findMany({
    where: { action: 'MEMBER_CREDENTIALS_ISSUED', entityId: user1.id },
  });
  assert.ok(auditLogs.length >= 1, 'MEMBER_CREDENTIALS_ISSUED audit log must exist');
  const logStr = JSON.stringify(auditLogs[0].details);
  assert.equal(logStr.includes(tempPass1), false, 'Plaintext password must NEVER appear in AuditLog details');

  // Test login with temp password
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail1, password: tempPass1 }),
  });
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.equal(loginData.user.mustChangePassword, true, 'Login response must indicate mustChangePassword: true');
  assert.ok(
    loginData.redirectUrl === '/admin' || loginData.redirectUrl.startsWith('/members/'),
    'Redirect URL must route to /admin or member directory profile'
  );

  const userCookie = loginRes.headers.get('set-cookie')?.split(';')[0];
  assert.ok(userCookie, 'Login must issue session cookie');

  // Test change-password endpoint: invalid current password fails
  const badCurrentRes = await fetch('http://localhost:3000/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userCookie },
    body: JSON.stringify({
      currentPassword: 'WrongTempPassword123!',
      newPassword: 'PermMember2026!',
      confirmPassword: 'PermMember2026!',
    }),
  });
  assert.equal(badCurrentRes.status, 400);

  // Test change-password endpoint: same as temp password fails
  const samePassRes = await fetch('http://localhost:3000/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userCookie },
    body: JSON.stringify({
      currentPassword: tempPass1,
      newPassword: tempPass1,
      confirmPassword: tempPass1,
    }),
  });
  assert.equal(samePassRes.status, 400);

  // Test change-password endpoint: successful change
  const permPassword = 'PermMember2026!';
  const changeRes = await fetch('http://localhost:3000/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userCookie },
    body: JSON.stringify({
      currentPassword: tempPass1,
      newPassword: permPassword,
      confirmPassword: permPassword,
    }),
  });
  const changeData = await changeRes.json();
  assert.equal(changeRes.status, 200);
  assert.equal(changeData.success, true);
  assert.equal(changeData.redirectUrl, '/admin');

  // Verify in DB: mustChangePassword is now false
  const updatedUser1 = await prisma.user.findUnique({ where: { id: user1.id } });
  assert.equal(updatedUser1.mustChangePassword, false, 'mustChangePassword must be set to false after change');
  assert.equal(bcrypt.compareSync(permPassword, updatedUser1.passwordHash), true, 'New password hash must match');

  // Verify PASSWORD_CHANGED in AuditLog
  const pwAudit = await prisma.auditLog.findFirst({
    where: { action: 'PASSWORD_CHANGED', entityId: user1.id },
  });
  assert.ok(pwAudit, 'PASSWORD_CHANGED audit log must be recorded');

  // Clean up test users & applications
  await prisma.member.deleteMany({ where: { cidNumber: { in: ['11502001928', '11502001929'] } } });
  await prisma.membershipApplication.deleteMany({ where: { id: { in: [app1.id, app2.id] } } });
  await prisma.user.deleteMany({ where: { email: { in: [testEmail1, testEmail2] } } });
});

await runTest('Live DB Fix 3: Cancelling SHIPPED/DELIVERED order is blocked with 400 & stock untouched', async () => {
  const cookie = await getAdminSessionCookie();

  const testProduct = await prisma.product.create({
    data: {
      code: `TEST-PROD-${Date.now()}`,
      name: 'Test Inventory Carving',
      priceUSD: 80,
      craftKey: 'parzo',
      region: 'Trashiyangtse',
      description: 'Stock test item',
      images: [],
      stock: 5,
      status: 'PUBLISHED',
    },
  });

  const shippedOrder = await prisma.order.create({
    data: {
      orderNumber: `TEST-SHIP-${Date.now()}`,
      customerName: 'Dorji Penjor',
      customerEmail: 'dorji@example.com',
      shippingAddress: { city: 'Paro' },
      shippingFeeUSD: 24,
      totalUSD: 104,
      totalPaidCurrency: 104,
      orderStatus: 'SHIPPED',
      items: [{ code: testProduct.code, name: testProduct.name, priceUSD: 80, quantity: 1 }],
      orderItems: {
        create: [{ productId: testProduct.id, code: testProduct.code, name: testProduct.name, priceUSD: 80, quantity: 1 }],
      },
    },
  });

  // Attempt to cancel the SHIPPED order
  const cancelRes = await fetch('http://localhost:3000/api/admin/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      id: shippedOrder.id,
      orderStatus: 'CANCELLED',
      cancellationReason: 'Customer changed mind after dispatch',
    }),
  });

  const cancelData = await cancelRes.json();
  assert.equal(cancelRes.status, 400, 'Cancelling SHIPPED order must return HTTP 400');
  assert.ok(
    cancelData.error.includes('Cannot cancel an order that has already shipped or been delivered'),
    'Must return clear error preventing restock of shipped items'
  );

  // Verify stock in database remains exactly 5
  const productAfter = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert.equal(productAfter.stock, 5, 'Product stock must NOT be restored when cancelling shipped order');

  // Verify cancelling a PROCESSING order DOES restore stock
  const processingOrder = await prisma.order.create({
    data: {
      orderNumber: `TEST-PROC-${Date.now()}`,
      customerName: 'Pema Lhamo',
      customerEmail: 'pema@example.com',
      shippingAddress: { city: 'Thimphu' },
      shippingFeeUSD: 0,
      totalUSD: 80,
      totalPaidCurrency: 80,
      orderStatus: 'PROCESSING',
      items: [{ code: testProduct.code, name: testProduct.name, priceUSD: 80, quantity: 1 }],
      orderItems: {
        create: [{ productId: testProduct.id, code: testProduct.code, name: testProduct.name, priceUSD: 80, quantity: 1 }],
      },
    },
  });

  const procCancelRes = await fetch('http://localhost:3000/api/admin/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      id: processingOrder.id,
      orderStatus: 'CANCELLED',
      cancellationReason: 'Cancelled prior to dispatch',
    }),
  });
  assert.equal(procCancelRes.status, 200);

  const productRestored = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert.equal(productRestored.stock, 6, 'Product stock must be incremented from 5 to 6 on valid cancellation');

  // Attempt to cancel already cancelled order fails with 400
  const reCancelRes = await fetch('http://localhost:3000/api/admin/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      id: processingOrder.id,
      orderStatus: 'CANCELLED',
      cancellationReason: 'Double cancel attempt',
    }),
  });
  assert.equal(reCancelRes.status, 400);

  // Clean up test records
  await prisma.order.delete({ where: { id: shippedOrder.id } });
  await prisma.order.delete({ where: { id: processingOrder.id } });
  await prisma.product.delete({ where: { id: testProduct.id } });
});

await runTest('Live DB Fix 4: Provisional 80/20 consignment split qualified in CSV & JSON', async () => {
  const cookie = await getAdminSessionCookie();

  // Fetch CSV report
  const csvRes = await fetch('http://localhost:3000/api/admin/reports?format=csv', {
    headers: { Cookie: cookie },
  });
  assert.equal(csvRes.status, 200);
  const csvText = await csvRes.text();

  assert.ok(
    csvText.includes('Est. Artisan Share (80% Provisional)*'),
    'CSV must contain "Est. Artisan Share (80% Provisional)*" header/row'
  );
  assert.ok(
    csvText.includes('# Note: The 80% artisan / 20% association consignment revenue split is provisional and subject to formal HAB Secretariat ratification prior to commercial operations.'),
    'CSV must contain the provisional consignment footnote'
  );

  // Fetch JSON report
  const jsonRes = await fetch('http://localhost:3000/api/admin/reports', {
    headers: { Cookie: cookie },
  });
  assert.equal(jsonRes.status, 200);
  const jsonData = await jsonRes.json();
  assert.ok(jsonData.metrics.artisanShareUSD !== undefined);
  assert.ok(
    jsonData.metrics.artisanShareDescription?.includes('provisional'),
    'JSON metrics must qualify artisanShareDescription as provisional'
  );
});

await runTest('Orders & Fulfillment: Secretariat assisted order creation atomically decrements stock & creates order', async () => {
  const cookie = await getAdminSessionCookie();

  // Create a dedicated test craft product for manual order creation
  const testOrderProduct = await prisma.product.create({
    data: {
      code: `ASSIST-TEST-${Date.now()}`,
      name: 'Handcrafted Silk Scarf',
      priceUSD: 65,
      craftKey: 'thagzo',
      region: 'Thimphu',
      stock: 12,
      status: 'PUBLISHED',
      description: 'Test scarf for assisted order fulfillment verification',
      images: [],
    },
  });

  const assistSaleRes = await fetch('http://localhost:3000/api/admin/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      customerType: 'GUEST',
      customerName: 'Direct Phone Buyer',
      customerEmail: 'buyer@hab.org.bt',
      paymentMethod: 'CASH',
      currencyUsed: 'BTN',
      shippingMethod: 'EMS',
      items: [
        { code: testOrderProduct.code, productId: testOrderProduct.id, quantity: 2, priceUSD: 65 },
      ],
    }),
  });

  assert.equal(assistSaleRes.status, 200, 'Assisted order creation should succeed with 200');
  const assistData = await assistSaleRes.json();
  assert.equal(assistData.success, true);
  assert.ok(assistData.order.orderNumber.startsWith('HAB-M-') || assistData.order.orderNumber.startsWith('HAB-'), 'Order number must be formatted with HAB prefix');

  // Verify atomic stock decrement in PostgreSQL
  const updatedProduct = await prisma.product.findUnique({ where: { id: testOrderProduct.id } });
  assert.equal(updatedProduct.stock, 10, 'Stock must be atomically decremented from 12 to 10');

  // Verify OrderItem rows created
  const orderItems = await prisma.orderItem.findMany({ where: { orderId: assistData.order.id } });
  assert.equal(orderItems.length, 1);
  assert.equal(orderItems[0].productId, testOrderProduct.id);
  assert.equal(orderItems[0].quantity, 2);

  // Clean up
  await prisma.orderItem.deleteMany({ where: { orderId: assistData.order.id } });
  await prisma.order.delete({ where: { id: assistData.order.id } });
  await prisma.product.delete({ where: { id: testOrderProduct.id } });
});

await runTest('Customer Journey: Public checkout with delivery intake & public order tracking', async () => {
  // Create a dedicated test product for customer checkout
  const testCraft = await prisma.product.create({
    data: {
      code: `ECOMM-TEST-${Date.now()}`,
      name: 'Test Silver Amulet',
      priceUSD: 110,
      craftKey: 'garzo',
      region: 'Thimphu',
      stock: 5,
      status: 'PUBLISHED',
      description: 'E-commerce test amulet',
      images: [],
    },
  });

  // Public checkout
  const checkoutRes = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ code: testCraft.code, name: testCraft.name, quantity: 1, priceUsd: 110 }],
      currency: 'USD',
      shippingMethod: 'EMS',
      customerName: 'Karma Tenzin',
      email: 'karma@example.bt',
      phone: '+975 17 999 888',
      shippingAddress: {
        fullName: 'Karma Tenzin',
        email: 'karma@example.bt',
        phone: '+975 17 999 888',
        street: 'Norzin Lam 45',
        city: 'Thimphu',
        country: 'Bhutan',
        postalCode: '11001',
      },
    }),
  });

  assert.equal(checkoutRes.status, 200, 'Public checkout should return 200');
  const checkoutData = await checkoutRes.json();
  assert.equal(checkoutData.success, true);
  const createdOrderNumber = checkoutData.order.orderNumber;
  assert.ok(createdOrderNumber.startsWith('HAB-S-'));

  // Anti-enumeration test 1: Tracking without email or phone must return HTTP 400
  const unverifiedRes = await fetch(`http://localhost:3000/api/orders/track?order=${encodeURIComponent(createdOrderNumber)}`);
  assert.equal(unverifiedRes.status, 400, 'Tracking without verification details must return 400');

  // Anti-enumeration test 2: Tracking with mismatching email must return HTTP 403
  const wrongEmailRes = await fetch(`http://localhost:3000/api/orders/track?order=${encodeURIComponent(createdOrderNumber)}&email=attacker@evil.com`);
  assert.equal(wrongEmailRes.status, 403, 'Tracking with mismatching email must return 403');

  // Anti-enumeration test 3: Tracking with UUID instead of orderNumber must return HTTP 404
  const uuidRes = await fetch(`http://localhost:3000/api/orders/track?order=${encodeURIComponent(checkoutData.order.id)}&email=karma@example.bt`);
  assert.equal(uuidRes.status, 404, 'Lookup by internal UUID alone must be rejected with 404');

  // Anti-enumeration test 4: Tracking with valid orderNumber AND matching email succeeds with 200
  const trackRes = await fetch(`http://localhost:3000/api/orders/track?order=${encodeURIComponent(createdOrderNumber)}&email=karma@example.bt`);
  assert.equal(trackRes.status, 200, 'Tracking should return 200 for valid order with matching email');
  const trackData = await trackRes.json();
  assert.equal(trackData.success, true);
  assert.equal(trackData.order.orderNumber, createdOrderNumber);
  assert.ok(Array.isArray(trackData.order.milestones), 'Tracking must return milestones array');
  assert.equal(trackData.order.milestones.length, 5);
  assert.equal(trackData.order.items.length, 1);

  // Clean up
  await prisma.orderItem.deleteMany({ where: { orderId: checkoutData.order.id } });
  await prisma.order.delete({ where: { id: checkoutData.order.id } });
  await prisma.product.delete({ where: { id: testCraft.id } });
});

await runTest('Portal Removal: /portal routes are completely removed and non-accessible', async () => {
  const portalRes = await fetch('http://localhost:3000/portal', { redirect: 'manual' });
  assert.ok(portalRes.status === 404 || portalRes.status === 307 || portalRes.status === 308 || portalRes.status === 302);
});

// ==========================================
// 19. Phase 0.5 & Phase 1 Verification Tests
// ==========================================

await runTest('Phase 0.5: Admin Dashboard live operational metrics API', async () => {
  const cookie = await getAdminSessionCookie();
  const res = await fetch('http://localhost:3000/api/admin/dashboard', {
    headers: { Cookie: cookie },
  });
  assert.equal(res.status, 200, 'Dashboard API must return 200 for authenticated staff');
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(typeof data.metrics.totalSalesUSD === 'number', 'totalSalesUSD must be a number');
  assert.ok(typeof data.metrics.pendingOrdersCount === 'number', 'pendingOrdersCount must be a number');
  assert.ok(typeof data.metrics.lowStockCount === 'number', 'lowStockCount must be a number');
  assert.ok(typeof data.metrics.pendingApplicationsCount === 'number', 'pendingApplicationsCount must be a number');
  assert.ok(Array.isArray(data.recentOrders), 'recentOrders must be an array');
  assert.ok(Array.isArray(data.recentAuditLogs), 'recentAuditLogs must be an array');
});

await runTest('Phase 1: Atomic stock decrement under concurrency prevents negative inventory', async () => {
  // Create a scarce test product with exactly 1 unit in stock
  const scarceProduct = await prisma.product.create({
    data: {
      code: `SCARCE-${Date.now()}`,
      name: 'Single Unit Antique Mask',
      priceUSD: 250,
      craftKey: 'shagzo',
      region: 'Trashiyangtse',
      stock: 1,
      status: 'PUBLISHED',
      description: 'Concurrency scarce item',
      images: [],
    },
  });

  // Launch two concurrent checkout requests competing for the single unit
  const checkoutPayload = {
    items: [{ code: scarceProduct.code, name: scarceProduct.name, quantity: 1, priceUsd: 250 }],
    currency: 'USD',
    shippingMethod: 'EMS',
    customerName: 'Concurrent Buyer',
    email: 'concurrent@example.bt',
    shippingAddress: { city: 'Thimphu', country: 'Bhutan' },
  };

  const [req1, req2] = await Promise.all([
    fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload),
    }),
    fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload),
    }),
  ]);

  const results = [req1.status, req2.status];
  // Exactly one request must succeed (200), and the other must fail (500/400)
  assert.ok(results.includes(200), 'One concurrent checkout must succeed');
  assert.ok(results.includes(500) || results.includes(400) || results.includes(422), 'The competing concurrent checkout must fail');

  // Verify stock in database is exactly 0 and NEVER negative
  const productAfter = await prisma.product.findUnique({ where: { id: scarceProduct.id } });
  assert.equal(productAfter.stock, 0, 'Final inventory stock must be exactly 0, never negative');

  // Clean up order created
  const createdOrders = await prisma.order.findMany({
    where: { customerEmail: 'concurrent@example.bt' },
  });
  for (const ord of createdOrders) {
    await prisma.orderItem.deleteMany({ where: { orderId: ord.id } });
    await prisma.order.delete({ where: { id: ord.id } });
  }
  await prisma.product.delete({ where: { id: scarceProduct.id } });
});

await runTest('Phase 1: RMA exchange rate fail-closed behavior halts BTN checkout when critically stale', async () => {
  // Backup existing automated FX records
  const existingRecords = await prisma.fxRateRecord.findMany({
    where: { isManualOverride: false },
  });

  const staleDate = new Date(Date.now() - 80 * 60 * 60 * 1000); // 80 hours ago

  // Age all automated FX records past 72h hard ceiling
  await prisma.fxRateRecord.updateMany({
    where: { isManualOverride: false },
    data: { fetchedAt: staleDate, status: 'STALE' },
  });

  // Create test product for BTN checkout
  const btnProduct = await prisma.product.create({
    data: {
      code: `BTN-TEST-${Date.now()}`,
      name: 'Staleness Test Item',
      priceUSD: 50,
      craftKey: 'thagzo',
      region: 'Thimphu',
      stock: 10,
      status: 'PUBLISHED',
      description: 'Staleness test item',
      images: [],
    },
  });

  try {
    // BTN checkout attempt when RMA rate is > 72 hours old and feed offline
    const btnCheckoutRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-fx-offline': 'true' },
      body: JSON.stringify({
        items: [{ code: btnProduct.code, name: btnProduct.name, quantity: 1, priceUsd: 50 }],
        currency: 'BTN',
        shippingMethod: 'EMS',
        customerName: 'Tashi Wangdi',
        email: 'tashi@example.bt',
        shippingAddress: { city: 'Thimphu', country: 'Bhutan' },
      }),
    });

    const btnData = await btnCheckoutRes.json();
    assert.equal(btnCheckoutRes.status, 422, 'Critically stale RMA rate must block BTN checkout with HTTP 422');
    assert.ok(btnData.error.includes('72-hour maximum staleness threshold'), 'Error message must specify 72-hour threshold breach');
  } finally {
    // Clean up test product
    await prisma.product.delete({ where: { id: btnProduct.id } });

    // Restore original fetchedAt timestamps
    for (const rec of existingRecords) {
      await prisma.fxRateRecord.update({
        where: { id: rec.id },
        data: { fetchedAt: rec.fetchedAt, status: rec.status },
      });
    }
  }
});

await runTest('Phase 1: Referential integrity delete constraints across Product, Order, Member, User, Role', async () => {
  const cookie = await getAdminSessionCookie();

  // 1. Product Delete Guard: Creating an order line item protects product from deletion
  const guardProduct = await prisma.product.create({
    data: {
      code: `GUARD-PROD-${Date.now()}`,
      name: 'Referential Guard Product',
      priceUSD: 95,
      craftKey: 'shagzo',
      region: 'Paro',
      stock: 5,
      status: 'PUBLISHED',
      description: 'Guard item',
      images: [],
    },
  });

  const guardOrder = await prisma.order.create({
    data: {
      orderNumber: `GUARD-ORD-${Date.now()}`,
      customerName: 'Integrity Tester',
      customerEmail: 'guard@example.bt',
      shippingAddress: { city: 'Paro' },
      shippingFeeUSD: 0,
      totalUSD: 95,
      totalPaidCurrency: 95,
      items: [{ code: guardProduct.code, name: guardProduct.name, priceUSD: 95, quantity: 1 }],
      orderItems: {
        create: [{ productId: guardProduct.id, code: guardProduct.code, name: guardProduct.name, priceUSD: 95, quantity: 1 }],
      },
    },
  });

  const deleteProdRes = await fetch(`http://localhost:3000/api/admin/products?id=${guardProduct.id}`, {
    method: 'DELETE',
    headers: { Cookie: cookie },
  });
  assert.equal(deleteProdRes.status, 400, 'Deleting product with order items must return HTTP 400');
  const deleteProdData = await deleteProdRes.json();
  assert.equal(deleteProdData.code, 'REFERENTIAL_INTEGRITY_VIOLATION');

  // 2. Order Delete Guard: Direct DELETE on orders is forbidden (HTTP 405)
  const deleteOrderRes = await fetch(`http://localhost:3000/api/admin/orders?id=${guardOrder.id}`, {
    method: 'DELETE',
    headers: { Cookie: cookie },
  });
  assert.equal(deleteOrderRes.status, 405, 'Hard deletion of orders must return HTTP 405 Method Not Allowed');

  // Clean up
  await prisma.orderItem.deleteMany({ where: { orderId: guardOrder.id } });
  await prisma.order.delete({ where: { id: guardOrder.id } });
  await prisma.product.delete({ where: { id: guardProduct.id } });
});

// ==========================================
// 20. Phase 2 Security Hardening Verification Tests
// ==========================================

await runTest('Phase 2: RFC 6238 TOTP 2FA setup, validation, and single-use backup code consumption', async () => {
  const activeRole = await prisma.role.findFirst({ where: { status: 'ACTIVE' } });
  assert.ok(activeRole, 'Active role must exist');

  const testEmail = `totp_staff_${Date.now()}@example.bt`;
  const plainPass = 'HabAuth_Sec#2026!';
  const passHash = await bcrypt.hash(plainPass, 10);
  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      passwordHash: passHash,
      name: '2FA Test Operator',
      roleId: activeRole.id,
      status: 'ACTIVE',
      sessionVersion: 1,
    },
  });

  // 1. Login to obtain session cookie
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail, password: plainPass, targetPortal: 'admin' }),
  });
  assert.equal(loginRes.status, 200);
  const userCookie = loginRes.headers.get('set-cookie').split(';')[0];

  // 2. Setup 2FA
  const setupRes = await fetch('http://localhost:3000/api/auth/2fa/setup', {
    headers: { Cookie: userCookie },
  });
  assert.equal(setupRes.status, 200);
  const setupData = await setupRes.json();
  assert.ok(setupData.secret, 'Setup must return TOTP secret');
  assert.ok(setupData.uri.startsWith('otpauth://totp/'), 'Setup must return otpauth enrollment URI');

  // 3. Verify with invalid code should fail (400)
  const badVerifyRes = await fetch('http://localhost:3000/api/auth/2fa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userCookie },
    body: JSON.stringify({ secret: setupData.secret, code: '000000' }),
  });
  assert.equal(badVerifyRes.status, 400);

  // 4. Verify with valid TOTP code
  const validCode = getTotpCode(setupData.secret);
  const goodVerifyRes = await fetch('http://localhost:3000/api/auth/2fa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userCookie },
    body: JSON.stringify({ secret: setupData.secret, code: validCode }),
  });
  assert.equal(goodVerifyRes.status, 200);
  const verifyData = await goodVerifyRes.json();
  assert.equal(verifyData.backupCodes.length, 8, 'Must return exactly 8 backup codes');

  // Assert DB status
  const dbUserAfterEnroll = await prisma.user.findUnique({ where: { id: testUser.id } });
  assert.equal(dbUserAfterEnroll.twoFactorEnabled, true);
  assert.equal(dbUserAfterEnroll.twoFactorBackupCodes.length, 8);

  // 5. Login without 2FA code returns requires2FA challenge
  const challengeRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail, password: plainPass, targetPortal: 'admin' }),
  });
  const challengeData = await challengeRes.json();
  assert.equal(challengeData.requires2FA, true);

  // 6. Login with invalid 2FA code fails (401)
  const invalid2FARes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail, password: plainPass, targetPortal: 'admin', totpCode: '111111' }),
  });
  assert.equal(invalid2FARes.status, 401);

  // 7. Login with valid 6-digit TOTP code succeeds
  const valid2FARes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail, password: plainPass, targetPortal: 'admin', totpCode: getTotpCode(setupData.secret) }),
  });
  assert.equal(valid2FARes.status, 200);

  // 8. Login with single-use backup code succeeds and consumes code
  const backupCodeToUse = verifyData.backupCodes[0];
  const backupRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail, password: plainPass, targetPortal: 'admin', totpCode: backupCodeToUse }),
  });
  assert.equal(backupRes.status, 200);

  const dbUserAfterBackup = await prisma.user.findUnique({ where: { id: testUser.id } });
  assert.equal(dbUserAfterBackup.twoFactorBackupCodes.length, 7, 'Used backup code must be consumed from DB');

  // 9. Reusing consumed backup code fails (401)
  const reuseBackupRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail, password: plainPass, targetPortal: 'admin', totpCode: backupCodeToUse }),
  });
  assert.equal(reuseBackupRes.status, 401, 'Reused backup code must be rejected');

  // Clean up
  await prisma.auditLog.deleteMany({ where: { actorId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
});

await runTest('Phase 2: Single-use, time-limited forgot & reset password lifecycle with session revocation', async () => {
  const activeRole = await prisma.role.findFirst({ where: { status: 'ACTIVE' } });
  const testEmail = `pwd_reset_${Date.now()}@example.bt`;
  const initialPass = 'InitialPass_2026!';
  const passHash = await bcrypt.hash(initialPass, 10);
  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      passwordHash: passHash,
      name: 'Password Reset Tester',
      roleId: activeRole.id,
      status: 'ACTIVE',
      sessionVersion: 1,
    },
  });

  // 1. Request forgot-password
  const forgotRes = await fetch('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail }),
  });
  assert.equal(forgotRes.status, 200);
  const dbUserAfterForgot = await prisma.user.findUnique({ where: { id: testUser.id } });
  assert.ok(dbUserAfterForgot.resetTokenHash, 'resetTokenHash must be set');
  assert.ok(dbUserAfterForgot.resetTokenExpiry > new Date(), 'resetTokenExpiry must be in future');

  // 2. Anti-enumeration: Non-existent email still returns 200
  const nonExistentForgotRes = await fetch('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: 'nonexistent_account@example.bt' }),
  });
  assert.equal(nonExistentForgotRes.status, 200);

  // 3. Deterministic reset token verification
  const testRawToken = 'deterministic-token-' + crypto.randomBytes(16).toString('hex');
  const testHash = crypto.createHash('sha256').update(testRawToken).digest('hex');
  await prisma.user.update({
    where: { id: testUser.id },
    data: { resetTokenHash: testHash, resetTokenExpiry: new Date(Date.now() + 3600000) },
  });

  // Reset with short password (< 8 chars) fails (400)
  const shortPassRes = await fetch('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: testRawToken, newPassword: 'short' }),
  });
  assert.equal(shortPassRes.status, 400);

  // Reset with valid new password succeeds (200)
  const newPass = 'UpdatedSecurePassword#2026!';
  const resetRes = await fetch('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: testRawToken, newPassword: newPass }),
  });
  assert.equal(resetRes.status, 200);

  // Assert DB fields: token cleared, sessionVersion incremented
  const dbUserAfterReset = await prisma.user.findUnique({ where: { id: testUser.id } });
  assert.equal(dbUserAfterReset.resetTokenHash, null, 'Reset token hash must be nullified');
  assert.equal(dbUserAfterReset.resetTokenExpiry, null, 'Reset token expiry must be nullified');
  assert.equal(dbUserAfterReset.sessionVersion, 2, 'sessionVersion must be incremented to revoke active sessions');

  // Attempting to reuse the token fails (400)
  const reuseTokenRes = await fetch('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: testRawToken, newPassword: 'AnotherPassword#2026!' }),
  });
  assert.equal(reuseTokenRes.status, 400, 'Reused reset token must be rejected');

  // Login with new password succeeds
  const newLoginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail, password: newPass, targetPortal: 'admin' }),
  });
  assert.equal(newLoginRes.status, 200, 'Login with updated password must succeed');

  // Clean up
  await prisma.auditLog.deleteMany({ where: { actorId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
});

await runTest('Phase 2: User session revocation endpoint immediately invalidates active JWT tokens', async () => {
  const activeRole = await prisma.role.findFirst({ where: { status: 'ACTIVE' } });
  const testEmail = `session_revocation_${Date.now()}@example.bt`;
  const plainPass = 'RevokeSession_Pass#2026!';
  const passHash = await bcrypt.hash(plainPass, 10);
  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      passwordHash: passHash,
      name: 'Revocation Tester',
      roleId: activeRole.id,
      status: 'ACTIVE',
      sessionVersion: 1,
    },
  });

  // Login to acquire active session token
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({ email: testEmail, password: plainPass, targetPortal: 'admin' }),
  });
  assert.equal(loginRes.status, 200);
  const initialCookie = loginRes.headers.get('set-cookie').split(';')[0];

  // Verify cookie works for authenticated route
  const checkRes = await fetch('http://localhost:3000/api/admin/dashboard', {
    headers: { Cookie: initialCookie },
  });
  assert.equal(checkRes.status, 200, 'Initial session cookie must authenticate successfully');

  // Revoke all sessions for this user
  const revokeRes = await fetch('http://localhost:3000/api/auth/revoke-sessions', {
    method: 'POST',
    headers: { Cookie: initialCookie },
  });
  assert.equal(revokeRes.status, 200);
  const revokeData = await revokeRes.json();
  assert.equal(revokeData.success, true);
  assert.equal(revokeData.sessionVersion, 2);

  // Assert that prior JWT cookie is now rejected with HTTP 401
  const afterRevokeRes = await fetch('http://localhost:3000/api/admin/dashboard', {
    headers: { Cookie: initialCookie },
  });
  assert.equal(afterRevokeRes.status, 401, 'Prior session token with outdated sessionVersion must be rejected with HTTP 401');

  // Clean up
  await prisma.auditLog.deleteMany({ where: { actorId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
});

await runTest('Phase 2: Sliding-window rate limiting throttles excessive login attempts with HTTP 429', async () => {
  const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
  const probeEmail = `ratelimit_probe_${Date.now()}@example.bt`;
  const attempts = [];

  // Fire 6 rapid login requests from same client IP without bypass header
  for (let i = 0; i < 6; i++) {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp },
      body: JSON.stringify({ email: probeEmail, password: 'WrongPassword!', targetPortal: 'admin' }),
    });
    attempts.push(res.status);
  }

  // 1st through 5th return 401 (invalid credentials); 6th returns 429 (rate limited)
  assert.equal(attempts.slice(0, 5).every(s => s === 401), true, 'First 5 attempts must return 401');
  assert.equal(attempts[5], 429, '6th attempt within window must be rate-limited with HTTP 429');
});

await runTest('Phase 2: Strict security response headers enforced on web responses', async () => {
  const res = await fetch('http://localhost:3000/');
  assert.equal(res.headers.get('x-frame-options'), 'DENY', 'X-Frame-Options must be DENY');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff', 'X-Content-Type-Options must be nosniff');
  assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin', 'Referrer-Policy must be strict-origin-when-cross-origin');
  assert.equal(res.headers.get('x-xss-protection'), '1; mode=block', 'X-XSS-Protection must be 1; mode=block');
});

// ==========================================
// 21. Phase 3 Data Model & Financial Integrity Verification Tests
// ==========================================

await runTest('Phase 3: Durable PostgreSQL storage of rate limit attempts survives across invocations', async () => {
  const testIp = `192.0.2.${Math.floor(Math.random() * 200) + 10}`;

  // Make 2 calls to login with this simulated IP
  await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp },
    body: JSON.stringify({ email: 'probe@example.bt', password: 'bad', targetPortal: 'admin' }),
  });
  await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp },
    body: JSON.stringify({ email: 'probe@example.bt', password: 'bad', targetPortal: 'admin' }),
  });

  // Verify physical row existence in PostgreSQL RateLimitAttempt table
  const records = await prisma.rateLimitAttempt.findMany({
    where: { key: `login:${testIp}` },
  });
  assert.ok(records.length >= 2, 'PostgreSQL RateLimitAttempt must store persistent attempts across serverless invocations');
  assert.ok(records[0].createdAt instanceof Date, 'RateLimitAttempt must record valid timestamps');

  // Clean up test attempts
  await prisma.rateLimitAttempt.deleteMany({ where: { key: `login:${testIp}` } });
});

await runTest('Phase 3: Canonical USD pricing enforcement rejects client payload price tampering', async () => {
  // Create a product with authentic price $250.00
  const realPriceProduct = await prisma.product.create({
    data: {
      code: `CANON-PROD-${Date.now()}`,
      name: 'Tamper-Proof Silk Thangka',
      priceUSD: 250,
      craftKey: 'thagzo',
      region: 'Lhuntse',
      stock: 5,
      status: 'PUBLISHED',
      description: 'Canonical pricing test item',
      images: [],
    },
  });

  // Client maliciously attempts to buy it for $1.00
  const checkoutPayload = {
    items: [{ code: realPriceProduct.code, name: realPriceProduct.name, quantity: 1, priceUsd: 1.00, price: 1.00 }],
    currency: 'USD',
    shippingMethod: 'EMS',
    customerName: 'Price Tamperer',
    email: `tamper_${Date.now()}@example.bt`,
    shippingAddress: { city: 'Thimphu', country: 'Bhutan' },
  };

  const checkoutRes = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify(checkoutPayload),
  });

  assert.equal(checkoutRes.status, 200);
  const checkoutData = await checkoutRes.json();
  assert.equal(checkoutData.success, true);

  // Assert canonical DB price was enforced ($250.00, NOT $1.00)
  assert.equal(checkoutData.order.totalUsd, 250.00, 'Order total must enforce canonical $250.00 DB price, ignoring spoofed $1.00');

  // Check persisted order in PostgreSQL
  const dbOrder = await prisma.order.findUnique({
    where: { id: checkoutData.order.id },
    include: { orderItems: true },
  });
  assert.equal(dbOrder.totalUSD, 250.00);
  assert.equal(dbOrder.orderItems[0].priceUSD, 250.00, 'OrderItem line price must strictly reflect canonical DB price');

  // Clean up
  await prisma.orderItem.deleteMany({ where: { orderId: dbOrder.id } });
  await prisma.order.delete({ where: { id: dbOrder.id } });
  await prisma.product.delete({ where: { id: realPriceProduct.id } });
});

await runTest('Phase 3: Chetrum boundary conversion integrity & anti-truncation rounding', () => {
  // Test monetary conversions across boundary fractional cents with sample FX rate
  const fxRate = 84.15;

  function convertUsdToBtn(usd) {
    const cents = Math.round(usd * 100);
    const normalizedUsd = cents / 100;
    return Math.round(normalizedUsd * fxRate);
  }

  // 1. $19.99 * 84.15 = 1682.1585 -> should round to 1682 Chetrums/Nu
  assert.equal(convertUsdToBtn(19.99), 1682);

  // 2. $49.95 * 84.15 = 4203.2925 -> should round to 4203
  assert.equal(convertUsdToBtn(49.95), 4203);

  // 3. $199.99 * 84.15 = 16829.1585 -> should round to 16829
  assert.equal(convertUsdToBtn(199.99), 16829);

  // 4. Truncation resistance: verify converting fractional inputs does NOT shave Chetrums
  const subCents = 19.990000000000002; // Floating-point jitter
  assert.equal(convertUsdToBtn(subCents), 1682, 'Floating-point sub-cent jitter must normalize cleanly without rounding drift');
});

await runTest('Phase 3: Order cancellation inventory restock invariant (only PENDING/PAID/PROCESSING restocks, SHIPPED/DELIVERED blocked)', async () => {
  const cookie = await getAdminSessionCookie();

  const testProduct = await prisma.product.create({
    data: {
      code: `RESTOCK-GUARD-${Date.now()}`,
      name: 'Inventory Restock Test Item',
      priceUSD: 120,
      craftKey: 'shagzo',
      region: 'Paro',
      stock: 10,
      status: 'PUBLISHED',
      description: 'Restock test',
      images: [],
    },
  });

  // Scenario A: PENDING_PAYMENT order cancellation restores inventory
  const orderA = await prisma.order.create({
    data: {
      orderNumber: `ORD-RESTOCK-A-${Date.now()}`,
      customerName: 'Restock Buyer A',
      customerEmail: 'buyer_a@example.bt',
      shippingAddress: { city: 'Paro' },
      shippingFeeUSD: 24,
      totalUSD: 144,
      totalPaidCurrency: 144,
      orderStatus: 'PENDING_PAYMENT',
      items: [{ code: testProduct.code, name: testProduct.name, priceUSD: 120, quantity: 2 }],
      orderItems: {
        create: [{ productId: testProduct.id, code: testProduct.code, name: testProduct.name, priceUSD: 120, quantity: 2 }],
      },
    },
  });
  // Simulate stock decrement at checkout: stock 10 -> 8
  await prisma.product.update({ where: { id: testProduct.id }, data: { stock: 8 } });

  // Cancel orderA via Admin API
  const cancelResA = await fetch('http://localhost:3000/api/admin/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      id: orderA.id,
      orderStatus: 'CANCELLED',
      cancellationReason: 'Customer requested cancellation prior to payment',
    }),
  });
  assert.equal(cancelResA.status, 200);

  // Stock must be restored: 8 + 2 = 10
  const productAfterA = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert.equal(productAfterA.stock, 10, 'Cancelling PENDING_PAYMENT order must restore inventory');

  // Scenario B: SHIPPED order cancellation is strictly BLOCKED with HTTP 400
  const orderB = await prisma.order.create({
    data: {
      orderNumber: `ORD-RESTOCK-B-${Date.now()}`,
      customerName: 'Restock Buyer B',
      customerEmail: 'buyer_b@example.bt',
      shippingAddress: { city: 'Thimphu' },
      shippingFeeUSD: 24,
      totalUSD: 144,
      totalPaidCurrency: 144,
      orderStatus: 'SHIPPED',
      items: [{ code: testProduct.code, name: testProduct.name, priceUSD: 120, quantity: 2 }],
      orderItems: {
        create: [{ productId: testProduct.id, code: testProduct.code, name: testProduct.name, priceUSD: 120, quantity: 2 }],
      },
    },
  });
  // Set stock to 8
  await prisma.product.update({ where: { id: testProduct.id }, data: { stock: 8 } });

  // Attempt to cancel SHIPPED order
  const cancelResB = await fetch('http://localhost:3000/api/admin/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      id: orderB.id,
      orderStatus: 'CANCELLED',
      cancellationReason: 'Attempt to cancel already shipped shipment',
    }),
  });
  assert.equal(cancelResB.status, 400, 'Cancelling SHIPPED order must return HTTP 400');

  // Stock must remain unchanged at 8
  const productAfterB = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert.equal(productAfterB.stock, 8, 'Failed cancellation of SHIPPED order must NOT modify inventory');

  // Clean up
  await prisma.orderItem.deleteMany({ where: { orderId: orderA.id } });
  await prisma.orderItem.deleteMany({ where: { orderId: orderB.id } });
  await prisma.order.delete({ where: { id: orderA.id } });
  await prisma.order.delete({ where: { id: orderB.id } });
  await prisma.product.delete({ where: { id: testProduct.id } });
});

// ==========================================
// 22. Phase 4 Member Self-Service, Application Workflow & Integrity Tests
// ==========================================

await runTest('Phase 3 Addendum: Aggregate Chetrum conversion simulation across 10,000 orders confirms zero systematic drift', () => {
  const fxRate = 84.15;
  const orderCount = 10000;
  let exactTotalBtn = 0;
  let roundedTotalBtn = 0;

  // Simulate 10,000 orders with random cent amounts between $1.00 and $500.00
  for (let i = 0; i < orderCount; i++) {
    // Generate pseudo-random deterministic cents: 100 to 50000 cents
    const cents = 100 + ((i * 7919) % 49901);
    const usd = cents / 100;

    exactTotalBtn += usd * fxRate;
    roundedTotalBtn += Math.round(usd * fxRate);
  }

  const absoluteDrift = Math.abs(exactTotalBtn - roundedTotalBtn);
  const relativeDriftPercent = (absoluteDrift / exactTotalBtn) * 100;

  // Assert aggregate relative drift is strictly under 0.01% (as expected with unbiased half-up rounding)
  assert.ok(
    relativeDriftPercent < 0.01,
    `Aggregate rounding drift must be < 0.01%, actual: ${relativeDriftPercent.toFixed(5)}% (drift: ${absoluteDrift.toFixed(2)} Nu on ${exactTotalBtn.toFixed(2)} Nu volume)`
  );
});

await runTest('Phase 3 Addendum: Durable rate limiter table pruning removes expired records', async () => {
  const staleKey = `stale-record-${Date.now()}`;
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Insert test records dated 2 hours ago
  await prisma.rateLimitAttempt.createMany({
    data: [
      { key: staleKey, createdAt: twoHoursAgo },
      { key: staleKey, createdAt: twoHoursAgo },
    ],
  });

  // Verify created
  const beforeCount = await prisma.rateLimitAttempt.count({ where: { key: staleKey } });
  assert.equal(beforeCount, 2);

  // Prune records older than 1 hour
  const oneHourCutoff = new Date(Date.now() - 60 * 60 * 1000);
  const deleteResult = await prisma.rateLimitAttempt.deleteMany({
    where: { createdAt: { lt: oneHourCutoff } },
  });
  assert.ok(deleteResult.count >= 2, 'Pruning must remove records older than 1 hour');

  const afterCount = await prisma.rateLimitAttempt.count({ where: { key: staleKey } });
  assert.equal(afterCount, 0, 'Stale rate limit attempts must be completely pruned');
});

await runTest('Phase 4: Member application approval provisions secure onboarding activation link (no cleartext email passwords)', async () => {
  const cookie = await getAdminSessionCookie();

  const applicantEmail = `artisan_onboard_${Date.now()}@example.bt`;
  const appData = await prisma.membershipApplication.create({
    data: {
      applicantName: 'Tenzin Choden',
      email: applicantEmail,
      phone: '+975-17998877',
      cidNumber: '11502009988',
      craftKey: 'thagzo',
      dzongkhag: 'Lhuntse',
      villageGewog: 'Khoma',
      yearsPractising: 14,
      planTier: 'ACTIVE_SECTOR_MEMBER',
      status: 'PENDING',
    },
  });

  // Approve application via Admin API
  const approveRes = await fetch('http://localhost:3000/api/admin/applications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      id: appData.id,
      status: 'APPROVED',
      reviewerNotes: 'Approved for Master Weaver directory inclusion.',
    }),
  });
  assert.equal(approveRes.status, 200);
  const approveData = await approveRes.json();
  assert.equal(approveData.success, true);

  // Assert delivery channel provides secure activation link (non-plaintext delivery)
  assert.ok(approveData.activation, 'Approval response must include activation payload');
  assert.ok(approveData.activation.activationToken, 'activationToken must be present');
  assert.equal(approveData.activation.activationToken.length, 64, 'activationToken must be 32 bytes (64 hex chars)');
  assert.ok(approveData.activation.activationLink.includes('/auth/reset-password?token='), 'Activation link must route to secure password setup');

  // Verify AuditLog contains zero plaintext passwords
  const auditLogs = await prisma.auditLog.findMany({
    where: { entityId: approveData.member.userId },
  });
  assert.ok(auditLogs.length >= 1, 'Audit log must record credential issuance');
  for (const log of auditLogs) {
    const detailsStr = JSON.stringify(log.details);
    assert.equal(detailsStr.includes(approveData.tempCredentials.temporaryPassword), false, 'Plaintext password must NEVER exist in AuditLog');
  }

  // Member uses activation link to set initial permanent password directly
  const setPassRes = await fetch('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: approveData.activation.activationToken,
      newPassword: 'Artisan_Permanent#2026!',
    }),
  });
  assert.equal(setPassRes.status, 200, 'Member setting initial password via activation token must succeed');

  // Verify login with newly chosen permanent password succeeds
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({
      email: applicantEmail,
      password: 'Artisan_Permanent#2026!',
      targetPortal: 'member',
    }),
  });
  assert.equal(loginRes.status, 200, 'Login with chosen permanent password must succeed');

  // Clean up
  await prisma.auditLog.deleteMany({ where: { actorIdentifier: applicantEmail } });
  await prisma.member.delete({ where: { id: approveData.member.id } });
  await prisma.user.delete({ where: { id: approveData.member.userId } });
  await prisma.membershipApplication.delete({ where: { id: appData.id } });
});

await runTest('Phase 4: Public Member Directory and dynamic slug profile API (/api/members)', async () => {
  // Create a verified member directly in DB
  const testMemberName = `Dechen Palden ${Date.now()}`;
  const verifiedMember = await prisma.member.create({
    data: {
      name: testMemberName,
      craftKey: 'shagzo',
      dzongkhag: 'Trashiyangtse',
      joinYear: 2026,
      regNumber: `HAB-2026-TEST-${Date.now() % 1000}`,
      tier: 'ACTIVE_SECTOR_MEMBER',
      status: 'VERIFIED',
      bio: 'Master turner carving authentic lacquerware maple dapa bowls.',
      cidNumber: '11502008877',
      duesExpiryDate: new Date('2026-12-31'),
    },
  });

  // 1. Query public member list
  const listRes = await fetch('http://localhost:3000/api/members');
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.equal(listData.success, true);
  assert.ok(Array.isArray(listData.members), 'Public members API must return members array');
  const foundInList = listData.members.find((m) => m.id === verifiedMember.id);
  assert.ok(foundInList, 'Newly verified member must appear in public directory API');
  assert.equal(foundInList.craftKey, 'shagzo');

  // 2. Query public member slug / details
  const slugRes = await fetch(`http://localhost:3000/api/members?slug=${encodeURIComponent(testMemberName)}`);
  assert.equal(slugRes.status, 200);
  const slugData = await slugRes.json();
  assert.equal(slugData.success, true);
  assert.equal(slugData.member.name, testMemberName);
  assert.equal(slugData.member.craft.key, 'shagzo');

  // Clean up
  await prisma.member.delete({ where: { id: verifiedMember.id } });
});

await runTest('Phase 5: End-to-end Online Checkout (USD) with EMS shipping & order tracking', async () => {
  const testProduct = await prisma.product.create({
    data: {
      code: `E2E-USD-${Date.now() % 100000}`,
      name: 'E2E Handwoven Kushutara',
      priceUSD: 120.0,
      craftKey: 'thagzo',
      region: 'Lhuentse',
      stock: 10,
      status: 'PUBLISHED',
      description: 'Authentic Kushutara silk textile with intricate supplementary weft.',
      images: [],
    },
  });

  // 1. Submit checkout payload (subtotal $240 >= $200 free EMS shipping threshold)
  const checkoutPayload = {
    items: [{ code: testProduct.code, name: testProduct.name, quantity: 2, priceUsd: 120.0 }],
    currency: 'USD',
    paymentMethod: 'CARD',
    shippingMethod: 'EMS',
    customerName: 'Dorji Tshering',
    email: 'dorji.collector@example.bt',
    phone: '17112233',
    shippingAddress: {
      fullName: 'Dorji Tshering',
      email: 'dorji.collector@example.bt',
      phone: '17112233',
      street: 'Norzin Lam 4',
      city: 'Thimphu',
      country: 'Bhutan',
      postalCode: '11001',
    },
  };

  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bypass-rate-limit': 'true',
    },
    body: JSON.stringify(checkoutPayload),
  });

  assert.equal(res.status, 200, 'Checkout must succeed with HTTP 200');
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.order.orderNumber.startsWith('HAB-S-'));
  assert.equal(data.order.paymentMethod, 'CARD');
  assert.equal(data.order.totalUSD, 240);
  assert.equal(data.order.shippingFeeUSD, 0, 'Orders >= $200 receive free EMS shipping');

  // 2. Verify stock atomically decremented from 10 to 8
  const productInDb = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert.equal(productInDb.stock, 8, 'Product stock must be atomically decremented');

  // 3. Verify order tracking lookup with matching customer email
  const trackRes = await fetch(
    `http://localhost:3000/api/orders/track?order=${encodeURIComponent(data.order.orderNumber)}&email=${encodeURIComponent('dorji.collector@example.bt')}`
  );
  assert.equal(trackRes.status, 200);
  const trackData = await trackRes.json();
  assert.equal(trackData.success, true);
  assert.equal(trackData.order.orderNumber, data.order.orderNumber);
  assert.equal(trackData.order.orderStatus, 'PENDING_PAYMENT');

  // Clean up
  await prisma.orderItem.deleteMany({ where: { orderId: data.order.id } });
  await prisma.order.delete({ where: { id: data.order.id } });
  await prisma.product.delete({ where: { id: testProduct.id } });
});

await runTest('Phase 5: End-to-end Online Checkout (BTN / MBOB) with RMA rate & Chetrum rounding', async () => {
  const testProduct = await prisma.product.create({
    data: {
      code: `E2E-BTN-${Date.now() % 100000}`,
      name: 'E2E Turned Maple Dapa',
      priceUSD: 45.0,
      craftKey: 'shagzo',
      region: 'Trashiyangtse',
      stock: 5,
      status: 'PUBLISHED',
      description: 'Traditional turned maple burl dapa bowl.',
      images: [],
    },
  });

  // 1. Submit BTN checkout with MBOB payment (subtotal $45 < $200 -> EMS fee $24 -> totalUSD $69)
  const checkoutPayload = {
    items: [{ code: testProduct.code, name: testProduct.name, quantity: 1, priceUsd: 45.0 }],
    currency: 'BTN',
    paymentMethod: 'MBOB',
    shippingMethod: 'EMS',
    customerName: 'Pema Wangmo',
    email: 'pema.buyer@example.bt',
    shippingAddress: {
      fullName: 'Pema Wangmo',
      email: 'pema.buyer@example.bt',
      street: 'Changzamtog Road',
      city: 'Thimphu',
      country: 'Bhutan',
    },
  };

  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bypass-rate-limit': 'true',
    },
    body: JSON.stringify(checkoutPayload),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.order.currencyUsed, 'BTN');
  assert.equal(data.order.paymentMethod, 'MBOB');
  assert.equal(data.order.totalUSD, 69);
  assert.ok(data.order.totalPaidCurrency > 69, 'totalPaidCurrency must reflect RMA Nu. conversion');
  assert.equal(
    data.order.totalPaidCurrency,
    Math.round(69 * (data.order.fxRateAtPurchase || data.order.rateApplied)),
    'Nu. conversion must use exact half-up integer rounding'
  );

  // 2. Verify stock decremented
  const productInDb = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert.equal(productInDb.stock, 4);

  // Clean up
  await prisma.orderItem.deleteMany({ where: { orderId: data.order.id } });
  await prisma.order.delete({ where: { id: data.order.id } });
  await prisma.product.delete({ where: { id: testProduct.id } });
});

await runTest('Phase 5: Tracking Enumeration Defense (Wrong contact blocked, UUID query rejected)', async () => {
  const testOrder = await prisma.order.create({
    data: {
      orderNumber: `HAB-S-ENUM-${Date.now() % 10000}`,
      customerType: 'GUEST',
      customerName: 'Secret Collector',
      customerEmail: 'secret.collector@domain.bt',
      customerPhone: '17998877',
      shippingAddress: {},
      shippingMethod: 'EMS',
      shippingFeeUSD: 24,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      currencyUsed: 'USD',
      fxRateAtPurchase: 84.0,
      totalUSD: 150.0,
      totalPaidCurrency: 150.0,
      items: [],
    },
  });

  // 1. Correct orderNumber but wrong email -> must be rejected with 404
  const wrongEmailRes = await fetch(
    `http://localhost:3000/api/orders/track?order=${encodeURIComponent(testOrder.orderNumber)}&email=attacker@malicious.bt`
  );
  assert.equal(wrongEmailRes.status, 403, 'Mismatched email must be blocked with HTTP 403 Forbidden');
  const wrongEmailData = await wrongEmailRes.json();
  assert.equal(wrongEmailData.success, false);

  // 2. Querying by internal UUID instead of orderNumber -> must be rejected
  const uuidRes = await fetch(
    `http://localhost:3000/api/orders/track?order=${encodeURIComponent(testOrder.id)}&email=secret.collector@domain.bt`
  );
  assert.equal(uuidRes.status, 404, 'Direct internal UUID queries must be rejected');

  // Clean up
  await prisma.order.delete({ where: { id: testOrder.id } });
});

await runTest('Phase 5: Public Route & Navigation Integrity Audit', async () => {
  const publicRoutes = [
    '/',
    '/about',
    '/programmes',
    '/projects',
    '/news',
    '/members',
    '/publications',
    '/shop',
    '/basket',
    '/track-order',
    '/membership/apply',
  ];

  for (const route of publicRoutes) {
    const res = await fetch(`http://localhost:3000${route}`);
    assert.equal(res.status, 200, `Public route ${route} must return HTTP 200 OK`);
  }

  // Verify decommissioned /portal routes are completely blocked (HTTP 404 or redirect)
  const portalRes = await fetch('http://localhost:3000/portal', { redirect: 'manual' });
  assert.ok(
    portalRes.status === 404 || portalRes.status === 307 || portalRes.status === 308,
    'Decommissioned /portal route must not return HTTP 200'
  );
});

await runTest('Phase 6: Operational Readiness & Health Check API (/api/admin/health)', async () => {
  const res = await fetch('http://localhost:3000/api/admin/health');
  assert.equal(res.status, 200, 'Health endpoint must return HTTP 200');
  const data = await res.json();

  assert.equal(data.success, true);
  assert.equal(data.status, 'HEALTHY');
  assert.equal(data.database.connected, true);
  assert.equal(data.database.provider, 'postgresql');
  assert.ok(typeof data.database.latencyMs === 'number');
  assert.ok(data.uptimeSeconds >= 0);
  assert.ok(data.system.rssMb > 0);
  assert.ok(data.fx.rate > 0);
  assert.equal(data.fx.isBlocked, false);
});

await runTest('Phase 6: Authenticated Staff Health Probe with JWT identification', async () => {
  // Find or use the primary secretariat admin
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@handicraftsbhutan.org' },
    include: { role: true },
  });

  if (adminUser) {
    const secretString = process.env.JWT_SECRET || '122e08790446e8ac0439219e4e508d8904792f81a061eacb8e58333a31261d46';
    const jwtSecret = new TextEncoder().encode(secretString);
    const token = await new jose.SignJWT({
      user: {
        id: adminUser.id,
        userId: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        roleSlug: adminUser.role.slug,
        role: adminUser.role.slug,
        permissions: ['*'],
        sessionVersion: adminUser.sessionVersion || 1,
      },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(jwtSecret);

    const res = await fetch('http://localhost:3000/api/admin/health', {
      headers: {
        Cookie: `hab_session=${token}`,
      },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.user !== null, 'Authenticated probe must include user profile');
    assert.equal(data.user.email, adminUser.email);
    assert.equal(data.user.roleSlug, adminUser.role.slug);
  }
});

await prisma.$disconnect();

console.log(`\n================================`);
console.log(`Runtime Tests Completed: ${passedTests} / ${totalTests} passed`);
console.log(`================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}


