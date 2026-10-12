import { execSync } from 'child_process';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';

// Phases 2, 6, 7 and 8 create, update, or delete records. Never allow the
// master runner to inherit the developer's .env DATABASE_URL implicitly.
const testDatabaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
if (process.env.DATABASE_URL !== testDatabaseUrl) {
  throw new Error('Safety stop: DATABASE_URL must exactly match the isolated TEST_DATABASE_URL before running the master verifier.');
}

const testScripts = [
  { phase: 'Phase 1: Admin Light Theme Guarantee', script: 'scripts/test-phase-1.mjs' },
  { phase: 'Phase 2: Universal Components (FileUpload & RichText)', script: 'scripts/test-phase-2.mjs' },
  { phase: 'Phase 3: Public Site HTML Alignment (Image 1, 2, Badges)', script: 'scripts/test-phase-3.mjs' },
  { phase: 'Phase 4: WordPress-Style Admin Navigation & Pages Hub', script: 'scripts/test-phase-4.mjs' },
  { phase: 'Phase 5: Live Front-End Visual Edit Mode', script: 'scripts/test-phase-5.mjs' },
  { phase: 'Phase 6: 10 Page Studios with Live Database CRUD Cycles', script: 'scripts/test-phase-6.mjs' },
  { phase: 'Phase 7: Typography & Text Size Styler', script: 'scripts/test-phase-7.mjs' },
  { phase: 'Phase 8: End-to-End Build & Compilation Verification', script: 'scripts/test-phase-8.mjs' },
];

console.log('================================================================');
console.log('       HAB BHUTAN PLATFORM — MASTER TWO-WAY VERIFICATION        ');
console.log('================================================================\n');

let totalPassed = 0;
let totalFailed = 0;

for (const { phase, script } of testScripts) {
  console.log(`>>> RUNNING ${phase} (${script})...`);
  try {
    const output = execSync(`node ${script}`, {
      encoding: 'utf-8',
      env: {
        ...process.env,
        TEST_DATABASE_URL: testDatabaseUrl,
        DATABASE_URL: testDatabaseUrl,
      },
    });
    console.log(output);
    totalPassed++;
  } catch (err) {
    console.error(`FAILED ${phase}:`, err.stdout || err.message);
    totalFailed++;
  }
}

console.log('================================================================');
console.log(`MASTER VERIFICATION SUMMARY: ${totalPassed}/${testScripts.length} phases passed (${totalFailed} failed)`);
console.log('================================================================\n');

process.exit(totalFailed > 0 ? 1 : 0);
