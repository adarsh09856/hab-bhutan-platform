import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

const pg = new EmbeddedPostgres({
  databaseDir: path.join(process.cwd(), '.db_data'),
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  persistent: true,
});

import fs from 'fs';

const dbDir = path.join(process.cwd(), '.db_data');
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

console.log('Postgres is ready on localhost:5432!');
