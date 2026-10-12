const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { promptNewPassword } = require('./lib/secure-password.cjs');
const { resetAdminPasswordInDatabase } = require('./lib/admin-credential-rotation.cjs');

const prisma = new PrismaClient();

async function resetAdmin() {
  const email = 'admin@handicraftsbhutan.org';
  const newPassword = await promptNewPassword({ label: `Enter a new database password for ${email}`, minLength: 14 });
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await resetAdminPasswordInDatabase(prisma, { email, passwordHash, name: 'HAB Secretariat Admin' });

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
