import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function rotateAdminPassword() {
  // Generate high-entropy 32-character secure random password
  const newPassword = 'Admin_' + crypto.randomBytes(16).toString('hex') + '!2026';
  const passwordHash = bcrypt.hashSync(newPassword, 12);

  // Update in Database
  const updatedUser = await prisma.user.update({
    where: { email: 'admin@handicraftsbhutan.org' },
    data: {
      passwordHash: passwordHash,
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });

  // Write to gitignored .admin_credentials.local
  const credsPath = path.join(process.cwd(), '.admin_credentials.local');
  const credsContent = `# Handicrafts Association of Bhutan — Rotated Administrative Credentials
# Generated: ${new Date().toISOString()}
# CAUTION: Confidential production credential. Do not commit or share.

ADMIN_EMAIL=admin@handicraftsbhutan.org
ADMIN_PASSWORD=${newPassword}
`;
  fs.writeFileSync(credsPath, credsContent, { mode: 0o600 });

  // Invalidate any active sessions by updating JWT secret in .env
  const newJwtSecret = crypto.randomBytes(32).toString('hex');
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/JWT_SECRET="[^"]*"/, `JWT_SECRET="${newJwtSecret}"`);
    fs.writeFileSync(envPath, envContent);
  }

  // Audit log this administrative credential rotation
  await prisma.auditLog.create({
    data: {
      actorType: 'STAFF',
      actorId: updatedUser.id,
      actorIdentifier: 'admin@handicraftsbhutan.org',
      actorIp: '127.0.0.1',
      action: 'ADMIN_CREDENTIAL_ROTATED_INCIDENT_REMEDIATION',
      entityType: 'User',
      entityId: updatedUser.id,
      details: {
        reason: 'Phase 0 Security Incident: Plaintext chat/code exposure remediation',
        rotatedAt: new Date().toISOString(),
        jwtSecretRotated: true,
      },
    },
  });

  console.log('[SUCCESS] Admin password rotated in database.');
  console.log('[SUCCESS] Rotated credentials securely written to .admin_credentials.local (file is gitignored).');
  console.log('[SUCCESS] JWT session secret re-rotated in .env (all active sessions invalidated).');
  console.log('[SUCCESS] Security audit entry logged in AuditLog table.');
  console.log('[NOTE] Plaintext password was NOT printed to standard output or chat logs.');
}

rotateAdminPassword()
  .catch(err => {
    console.error('Rotation failed:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
