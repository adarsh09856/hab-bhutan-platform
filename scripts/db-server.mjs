import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

const pg = new EmbeddedPostgres({
  databaseDir: process.env.HAB_TEST_DATABASE_DIR || path.join(process.cwd(), '.db_data'),
  port: Number(process.env.HAB_TEST_DATABASE_PORT || 5432),
  user: 'postgres',
  password: 'postgres',
  persistent: true,
});

import fs from 'fs';

const dbDir = process.env.HAB_TEST_DATABASE_DIR || path.join(process.cwd(), '.db_data');
const isInitialized = fs.existsSync(path.join(dbDir, 'PG_VERSION'));

if (!isInitialized) {
  console.log('Initializing embedded postgres...');
  try {
    await pg.initialise();
  } catch (e) {
    console.log('Initialise note:', e.message);
  }
} else {
  console.log('Database directory already initialized.');
}
console.log('Starting embedded postgres on port 5432...');
await pg.start();

try {
  await pg.createDatabase('hab_platform');
  console.log('Database hab_platform created!');
} catch (e) {
  console.log('Database hab_platform already exists or note:', e.message);
}

console.log(`Postgres is ready on localhost:${process.env.HAB_TEST_DATABASE_PORT || 5432}!`);

// Stop the embedded server cleanly when its wrapper session is interrupted.
let shuttingDown = false;
const keepAlive = setInterval(() => {}, 1000 * 60 * 60);
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  clearInterval(keepAlive);
  console.log('Stopping embedded PostgreSQL...');
  try {
    await pg.stop();
    console.log('Embedded PostgreSQL stopped cleanly.');
    process.exitCode = 0;
  } catch (error) {
    console.error('Could not stop embedded PostgreSQL cleanly:', error);
    process.exitCode = 1;
  }
}
process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
