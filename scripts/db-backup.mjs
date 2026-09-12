/**
 * PostgreSQL Database Backup Routine for HAB Platform
 * Exports all database tables to timestamped JSON / SQL archives in .backups/
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), '.backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`[BACKUP] Starting HAB database backup: ${timestamp}...`);

  const dbUrl = process.env.DATABASE_URL || '';
  const sqlBackupFile = path.join(backupDir, `hab_backup_${timestamp}.sql`);
  const jsonBackupFile = path.join(backupDir, `hab_snapshot_${timestamp}.json`);

  // Attempt standard pg_dump if available in PATH
  let pgDumpSuccess = false;
  try {
    if (dbUrl) {
      execSync(`pg_dump "${dbUrl}" -F p -f "${sqlBackupFile}"`, { stdio: 'pipe' });
      console.log(`  ✓ Native pg_dump saved to: ${sqlBackupFile}`);
      pgDumpSuccess = true;
    }
  } catch (err) {
    console.log('  ℹ️ Native pg_dump utility not found in PATH, executing full Prisma model snapshot...');
  }

  // Create full structured JSON snapshot of all models
  try {
    const modelNames = [
      'craft', 'member', 'product', 'order', 'orderItem',
      'membershipApplication', 'publication', 'projectRecord',
      'newsArticle', 'calendarEvent', 'governanceRecord', 'role',
      'user', 'auditLog', 'fxRateRecord', 'heroSlide',
      'siteSetting', 'navigationItem', 'programmePillar',
      'membershipSetting', 'inquiry', 'policyPage', 'clusterRecord',
      'outletRecord', 'eventRecord', 'supportPillar', 'honourRecord',
      'membershipCategory', 'donationRecord'
    ];

    const data = {};
    let totalRecords = 0;
    for (const model of modelNames) {
      if (prisma[model] && typeof prisma[model].findMany === 'function') {
        const records = await prisma[model].findMany();
        data[model] = records;
        totalRecords += records.length;
      }
    }

    const snapshot = {
      meta: {
        timestamp,
        version: '1.0.0',
        tableCount: Object.keys(data).length,
        totalRecords,
      },
      data,
    };

    fs.writeFileSync(jsonBackupFile, JSON.stringify(snapshot, null, 2), 'utf-8');
    console.log(`  ✓ Prisma structured snapshot saved to: ${jsonBackupFile}`);
    console.log(`[BACKUP] Backup completed successfully at ${new Date().toISOString()}.\n`);
  } catch (err) {
    console.error('  ✗ Error capturing Prisma snapshot:', err.message);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

runBackup().catch((e) => {
  console.error('[BACKUP FAILED]', e);
  process.exit(1);
});
