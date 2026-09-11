const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
  const newPassword = process.argv[2] || 'HabAdminProduction2026!#';
  const email = 'admin@handicraftsbhutan.org';
  const hash = bcrypt.hashSync(newPassword, 12);

  console.log('Resetting admin password for:', email);

  try {
    await prisma.rateLimitAttempt.deleteMany({});
    console.log('Cleared all rate-limit locks.');
  } catch (e) {
    console.log('Rate-limit table skipped.');
  }

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
  console.log('SUCCESS: Admin credentials updated!');
  console.log('Email:    ' + email);
  console.log('Password: ' + newPassword);
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
