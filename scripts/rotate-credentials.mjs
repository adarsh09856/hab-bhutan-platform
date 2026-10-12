import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import passwordPrompt from './lib/secure-password.cjs';
import credentialRotation from './lib/admin-credential-rotation.cjs';

const prisma = new PrismaClient();

async function rotateAdminPassword() {
  const email = 'admin@handicraftsbhutan.org';
  const newPassword = await passwordPrompt.promptNewPassword({
    label: `Enter a new database password for ${email}`,
    minLength: 14,
  });
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { email },
      data: credentialRotation.buildAdminPasswordUpdate(passwordHash),
    });
    await tx.auditLog.create({
      data: {
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: email,
        actorIp: null,
        action: 'ADMIN_PASSWORD_ROTATED',
        entityType: 'User',
        entityId: user.id,
        details: { rotatedAt: new Date().toISOString(), sessionsRevoked: true },
      },
    });
    return user;
  });

  console.log(`[SUCCESS] Password hash updated in the database for ${updatedUser.email}.`);
  console.log('[SUCCESS] Existing sessions revoked using the database session version.');
  console.log('[SUCCESS] Existing account status, role, and two-factor settings were preserved.');
  console.log('[SUCCESS] Audit entry recorded. Plaintext password was not saved or printed.');
}

rotateAdminPassword()
  .catch(err => {
    console.error('Rotation failed:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
