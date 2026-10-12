const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { promptNewPassword } = require('./lib/secure-password.cjs');
const { buildAdminPasswordUpdate } = require('./lib/admin-credential-rotation.cjs');

const prisma = new PrismaClient();

async function resetAdmin() {
  const email = 'admin@handicraftsbhutan.org';
  const newPassword = await promptNewPassword({ label: `Enter a new database password for ${email}`, minLength: 14 });
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const user = await prisma.$transaction(async (tx) => {
    let account = await tx.user.findUnique({ where: { email } });
    const existingAccount = Boolean(account);
    if (account) {
      account = await tx.user.update({
        where: { id: account.id },
        data: buildAdminPasswordUpdate(passwordHash),
      });
    } else {
      const latestSuperAdminRole = await tx.role.findFirst({
        where: { slug: 'super_admin' },
        orderBy: { version: 'desc' },
      });
      let superAdminRole = latestSuperAdminRole?.status === 'ACTIVE' ? latestSuperAdminRole : null;
      if (!superAdminRole) {
        superAdminRole = await tx.role.create({
          data: {
            name: 'Super Admin',
            slug: 'super_admin',
            version: (latestSuperAdminRole?.version || 0) + 1,
            status: 'ACTIVE',
            permissions: ['*'],
          },
        });
      }
      account = await tx.user.create({
        data: {
          email,
          name: 'HAB Secretariat Admin',
          passwordHash,
          roleId: superAdminRole.id,
          status: 'ACTIVE',
          mustChangePassword: false,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorType: 'STAFF',
        actorId: account.id,
        actorIdentifier: email,
        actorIp: null,
        action: 'ADMIN_PASSWORD_RESET',
        entityType: 'User',
        entityId: account.id,
        details: { resetAt: new Date().toISOString(), sessionsRevoked: existingAccount },
      },
    });
    return account;
  });

  console.log(`Admin password hash updated in the database for ${user.email}.`);
  console.log('Existing account status, role, two-factor settings, and unrelated records were preserved.');
  console.log('Existing sessions were invalidated using the database session version. Plaintext was not saved or printed.');
}

resetAdmin()
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
