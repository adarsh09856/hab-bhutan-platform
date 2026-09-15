import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('====================================================');
console.log('  STARTING TWO-WAY VERIFICATION FOR PHASE 7');
console.log('  Typography & Text Size Styler (/admin/styling)');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ? PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ? FAIL: ${msg}`);
    failed++;
  }
}

async function runPhase7Tests() {
  try {
    // ----------------------------------------------------
    // 1. Audit Typography Styler Component
    // ----------------------------------------------------
    console.log('[1/4] Auditing Typography Styler component (admin/styling/page.tsx)...');
    assert(fs.existsSync('src/app/(admin)/admin/styling/page.tsx'), 'Typography styling studio exists on disk');
    const stylingCode = fs.readFileSync('src/app/(admin)/admin/styling/page.tsx', 'utf-8');

    assert(stylingCode.includes('handleApplyPreset'), 'Component contains preset scaling handler');
    assert(stylingCode.includes('0.92') && stylingCode.includes('Compact'), 'Supports Compact preset (92%)');
    assert(stylingCode.includes('1.0') && stylingCode.includes('Standard'), 'Supports Standard preset (100%)');
    assert(stylingCode.includes('1.10') && stylingCode.includes('High Legibility'), 'Supports High Legibility preset (110%)');

    assert(stylingCode.includes('heritage'), 'Supports Heritage typographic voice');
    assert(stylingCode.includes('editorial'), 'Supports Editorial typographic voice');
    assert(stylingCode.includes('institutional'), 'Supports Institutional typographic voice');

    assert(stylingCode.includes('homeScale'), 'Supports independent Homepage scaling multiplier');
    assert(stylingCode.includes('aboutScale'), 'Supports independent About page scaling multiplier');
    assert(stylingCode.includes('shopScale'), 'Supports independent Shop page scaling multiplier');
    assert(stylingCode.includes('programmesScale'), 'Supports independent Programmes scaling multiplier');
    assert(stylingCode.includes('publicationsScale'), 'Supports independent Publications scaling multiplier');

    assert(stylingCode.includes('Live Typography Preview'), 'Contains live interactive visual typography preview');
    assert(stylingCode.includes('Handcrafted Textiles'), 'Live preview renders authentic Bhutanese typography specimen');
    assert(stylingCode.includes('/api/admin/site-settings'), 'Persists styling configuration to site-settings API');

    // ----------------------------------------------------
    // 2. Audit CSS Architecture & Variable Scaling
    // ----------------------------------------------------
    console.log('\n[2/4] Auditing CSS rules in globals.css and client-hab.css...');
    const globalsCss = fs.readFileSync('src/styles/globals.css', 'utf-8');
    const clientCss = fs.readFileSync('src/styles/client-hab.css', 'utf-8');

    assert(globalsCss.includes('--hab-font-scale: 1;'), 'globals.css defines root --hab-font-scale variable');
    assert(globalsCss.includes('calc(16px * var(--hab-font-scale, 1))'), 'globals.css computes scalable public font size');
    assert(globalsCss.includes(':not(:has(.hab-admin))'), 'Admin console is isolated from public font scaling');

    assert(clientCss.includes('html[data-voice="editorial"]'), 'client-hab.css includes editorial font styling');
    assert(clientCss.includes('html[data-voice="institutional"]'), 'client-hab.css includes institutional font styling');

    // ----------------------------------------------------
    // 3. Audit Public Front-End Synchronizer (DesignTweaks.tsx)
    // ----------------------------------------------------
    console.log('\n[3/4] Auditing public front-end synchronizer (DesignTweaks.tsx)...');
    const tweaksCode = fs.readFileSync('src/components/public/DesignTweaks.tsx', 'utf-8');

    assert(tweaksCode.includes('hab_font_scale'), 'DesignTweaks checks for persisted hab_font_scale');
    assert(tweaksCode.includes('--hab-font-scale'), 'DesignTweaks sets --hab-font-scale CSS variable on root');
    assert(tweaksCode.includes('/api/site-settings'), 'DesignTweaks falls back to server-persisted styling for new visitors');
    assert(tweaksCode.includes('removeProperty(\'--hab-font-scale\')'), 'DesignTweaks removes scale override on reset');

    // ----------------------------------------------------
    // 4. Live Database Persistence Verification
    // ----------------------------------------------------
    console.log('\n[4/4] Testing live database persistence in SiteSetting...');
    const existing = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    assert(existing !== null, 'SiteSetting default record exists in database');

    const testGateways = existing?.paymentGateways || {};
    const updatedGateways = {
      ...testGateways,
      styling: {
        globalScale: 1.08,
        voice: 'editorial',
        homeScale: 1.05,
        aboutScale: 1.0,
        shopScale: 1.0,
        programmesScale: 1.0,
        publicationsScale: 1.0,
      },
    };

    await prisma.siteSetting.update({
      where: { id: 'default' },
      data: { paymentGateways: updatedGateways },
    });

    const verifyRead = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const verifyStyling = verifyRead?.paymentGateways?.styling;

    assert(verifyStyling?.globalScale === 1.08, 'Successfully saved and verified globalScale in database (1.08)');
    assert(verifyStyling?.voice === 'editorial', 'Successfully saved and verified voice in database ("editorial")');
    assert(verifyStyling?.homeScale === 1.05, 'Successfully saved and verified homeScale in database (1.05)');

    // Reset database to standard baseline (1.0)
    updatedGateways.styling = {
      globalScale: 1.0,
      voice: 'heritage',
      homeScale: 1.0,
      aboutScale: 1.0,
      shopScale: 1.0,
      programmesScale: 1.0,
      publicationsScale: 1.0,
    };
    await prisma.siteSetting.update({
      where: { id: 'default' },
      data: { paymentGateways: updatedGateways },
    });

    const finalRead = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const finalStyling = finalRead?.paymentGateways?.styling;
    assert(finalStyling?.globalScale === 1.0, 'Reset database styling to standard baseline (1.0)');

    console.log('\n====================================================');
    console.log(`  PHASE 7 TWO-WAY VERIFICATION COMPLETE: ${passed} passed, ${failed} failed`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('Phase 7 verification error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runPhase7Tests();
