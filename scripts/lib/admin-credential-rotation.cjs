function buildAdminPasswordUpdate(passwordHash) {
  return {
    passwordHash,
    sessionVersion: { increment: 1 },
  };
}

async function rotateAdminPasswordInDatabase(prisma, email, passwordHash) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { email },
      data: buildAdminPasswordUpdate(passwordHash),
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
}

async function resetAdminPasswordInDatabase(prisma, { email, passwordHash, name }) {
  return prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email } });
    const existingAccount = Boolean(user);
    if (user) {
      user = await tx.user.update({
        where: { id: user.id },
        data: buildAdminPasswordUpdate(passwordHash),
      });
    } else {
      const latestRole = await tx.role.findFirst({
        where: { slug: 'super_admin' },
        orderBy: { version: 'desc' },
      });
      const role = latestRole?.status === 'ACTIVE' ? latestRole : await tx.role.create({
        data: {
          name: 'Super Admin',
          slug: 'super_admin',
          version: (latestRole?.version || 0) + 1,
          status: 'ACTIVE',
          permissions: ['*'],
        },
      });
      user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          roleId: role.id,
          status: 'ACTIVE',
          mustChangePassword: false,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: email,
        actorIp: null,
        action: 'ADMIN_PASSWORD_RESET',
        entityType: 'User',
        entityId: user.id,
        details: { resetAt: new Date().toISOString(), sessionsRevoked: existingAccount },
      },
    });
    return user;
  });
}

module.exports = {
  buildAdminPasswordUpdate,
  rotateAdminPasswordInDatabase,
  resetAdminPasswordInDatabase,
};
