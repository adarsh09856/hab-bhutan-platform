function buildAdminPasswordUpdate(passwordHash) {
  return {
    passwordHash,
    sessionVersion: { increment: 1 },
  };
}

module.exports = { buildAdminPasswordUpdate };
