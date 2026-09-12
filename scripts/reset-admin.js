const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_HEADER_LINKS = [
  { label: 'About Us', href: '/about', parent: null, sortOrder: 1, menuType: 'HEADER', isActive: true },
  { label: 'Programmes', href: '/programmes', parent: null, sortOrder: 2, menuType: 'HEADER', isActive: true },
  { label: 'Projects', href: '/projects', parent: null, sortOrder: 3, menuType: 'HEADER', isActive: true },
  { label: 'News & Events', href: '/news', parent: null, sortOrder: 4, menuType: 'HEADER', isActive: true },
  { label: 'Directory by category', href: '/members', parent: 'members', sortOrder: 5, menuType: 'HEADER', isActive: true },
  { label: 'Publications & downloads', href: '/publications', parent: 'members', sortOrder: 6, menuType: 'HEADER', isActive: true },
  { label: 'Member shops & outlets', href: '/shop', parent: 'members', sortOrder: 7, menuType: 'HEADER', isActive: true },
];

const DEFAULT_FOOTER_COLUMNS = [
  { column: 'Organization', label: 'About HAB', href: '/about', sortOrder: 1, menuType: 'FOOTER', isActive: true },
  { column: 'Organization', label: 'Our Mandate & AoA', href: '/about#mandate', sortOrder: 2, menuType: 'FOOTER', isActive: true },
  { column: 'Organization', label: 'Code of Ethics', href: '/about#ethics', sortOrder: 3, menuType: 'FOOTER', isActive: true },
  { column: 'Organization', label: 'Strategic Plan', href: '/publications', sortOrder: 4, menuType: 'FOOTER', isActive: true },
  { column: 'Organization', label: 'Contact secretariat', href: '/about#contact', sortOrder: 5, menuType: 'FOOTER', isActive: true },

  { column: 'Shop & support', label: 'E-shop', href: '/shop', sortOrder: 1, menuType: 'FOOTER', isActive: true },
  { column: 'Shop & support', label: 'Shipping & delivery', href: '/about#support', sortOrder: 2, menuType: 'FOOTER', isActive: true },
  { column: 'Shop & support', label: 'Returns', href: '/about#support', sortOrder: 3, menuType: 'FOOTER', isActive: true },
  { column: 'Shop & support', label: 'Track your order', href: '/track-order', sortOrder: 4, menuType: 'FOOTER', isActive: true },
  { column: 'Shop & support', label: 'Duty & customs', href: '/about#support', sortOrder: 5, menuType: 'FOOTER', isActive: true },

  { column: 'Members', label: 'Directory by category', href: '/members', sortOrder: 1, menuType: 'FOOTER', isActive: true },
  { column: 'Members', label: 'Publications', href: '/publications', sortOrder: 2, menuType: 'FOOTER', isActive: true },
  { column: 'Members', label: 'Member shops', href: '/shop', sortOrder: 3, menuType: 'FOOTER', isActive: true },
  { column: 'Members', label: 'Apply to join', href: '/membership/apply', sortOrder: 4, menuType: 'FOOTER', isActive: true },

  { column: 'Governance', label: 'Board of Trustees', href: '/about#governance', sortOrder: 1, menuType: 'FOOTER', isActive: true },
  { column: 'Governance', label: 'Secretariat', href: '/about#governance', sortOrder: 2, menuType: 'FOOTER', isActive: true },
  { column: 'Governance', label: 'Annual reports', href: '/publications', sortOrder: 3, menuType: 'FOOTER', isActive: true },
  { column: 'Governance', label: 'Audited accounts', href: '/publications', sortOrder: 4, menuType: 'FOOTER', isActive: true },
  { column: 'Governance', label: 'Tenders & vacancies', href: '/news', sortOrder: 5, menuType: 'FOOTER', isActive: true },
];

async function resetAdmin() {
  const newPassword = process.argv[2] || 'HabAdminProduction2026!#';
  const email = 'admin@handicraftsbhutan.org';
  const hash = bcrypt.hashSync(newPassword, 12);

  console.log('1. Resetting admin password for:', email);

  try {
    await prisma.rateLimitAttempt.deleteMany({});
    console.log('  ✓ Cleared all rate-limit locks.');
  } catch (e) {
    console.log('  - Rate-limit table skipped.');
  }

  // 2. Clean up test navigation items & restore canonical navigation menu
  console.log('2. Restoring canonical navigation menu...');
  try {
    await prisma.navigationItem.deleteMany({
      where: {
        OR: [
          { label: { contains: 'Test' } },
          { label: { contains: 'test' } },
          { href: '/test-nav' },
        ],
      },
    });

    const existingNavCount = await prisma.navigationItem.count();
    if (existingNavCount < 10) {
      await prisma.navigationItem.deleteMany({});
      for (const item of [...DEFAULT_HEADER_LINKS, ...DEFAULT_FOOTER_COLUMNS]) {
        await prisma.navigationItem.create({ data: item });
      }
      console.log('  ✓ Cleaned up test items and seeded 26 canonical navigation links.');
    } else {
      console.log('  ✓ Navigation items verified.');
    }
  } catch (e) {
    console.warn('  - Navigation cleanup warning:', e.message);
  }

  // 3. Clean up test hero slides
  console.log('3. Cleaning up test hero slides...');
  try {
    await prisma.heroSlide.deleteMany({
      where: {
        OR: [
          { caption: { contains: 'Test' } },
          { caption: { contains: 'Preserving Living Heritage' } },
        ],
      },
    });
    console.log('  ✓ Cleaned up test hero slides.');
  } catch (e) {
    console.warn('  - Hero slide cleanup warning:', e.message);
  }

  // 4. Ensure Super Admin role & user
  console.log('4. Configuring Super Admin credentials...');
  let superAdminRole = await prisma.role.findFirst({
    where: { slug: 'super_admin' },
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        name: 'Super Admin',
        slug: 'super_admin',
        version: 1,
        status: 'ACTIVE',
        permissions: ['*'],
      },
    });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      status: 'ACTIVE',
      mustChangePassword: false,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      roleId: superAdminRole.id,
    },
    create: {
      email,
      name: 'HAB Secretariat Admin',
      passwordHash: hash,
      roleId: superAdminRole.id,
      status: 'ACTIVE',
      mustChangePassword: false,
      twoFactorEnabled: false,
    },
  });

  console.log('====================================================');
  console.log('SUCCESS: Admin credentials & Platform restored!');
  console.log('Email:    ' + email);
  console.log('Password: ' + newPassword);
  console.log('Role:     ' + superAdminRole.name);
  console.log('====================================================');
}

resetAdmin()
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
