import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

const pg = new EmbeddedPostgres({
  databaseDir: path.join(process.cwd(), '.db_data'),
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  persistent: true,
});

console.log('Initializing embedded postgres...');
await pg.initialise();
console.log('Starting embedded postgres on port 5432...');
await pg.start();

try {
  await pg.createDatabase('hab_platform');
  console.log('Database hab_platform created!');
} catch (e) {
  console.log('Database hab_platform already exists or note:', e.message);
}

console.log('Postgres is ready on localhost:5432!');
