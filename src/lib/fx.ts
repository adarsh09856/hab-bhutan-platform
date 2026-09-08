import prisma from './prisma';
import { logAudit } from './audit';
import { SessionUser } from './rbac';

export interface FxRateResult {
  rate: number;
  status: 'FRESH' | 'STALE' | 'MANUAL_OVERRIDE';
  source: string;
  fetchedAt: Date;
  blocked: boolean;
  message?: string;
  isCriticalStale?: boolean;
  isManualOverride?: boolean;
  stalenessHours?: number;
}

export const FX_CONFIG = {
  DEFAULT_RATE: 84.0,
  FRESH_HOURS: 24,
  CRITICAL_HOURS: 72,
};

const FRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000;      // 24 hours
const STALE_CEILING_MS = 72 * 60 * 60 * 1000;        // 72 hours hard ceiling

export async function getCurrentFxRate(options?: { simulateOffline?: boolean }): Promise<FxRateResult> {
  // Check for an active manual override first
  const manualOverride = await prisma.fxRateRecord.findFirst({
    where: { isManualOverride: true },
    orderBy: { fetchedAt: 'desc' },
  });

  if (manualOverride) {
    return {
      rate: manualOverride.rate,
      status: 'MANUAL_OVERRIDE',
      source: 'MANUAL_OVERRIDE',
      fetchedAt: manualOverride.fetchedAt,
      blocked: false,
      isCriticalStale: false,
      isManualOverride: true,
      stalenessHours: 0,
      message: 'Using verified Administrative Manual Override rate.',
    };
  }

  // Fetch latest automated record
  let latest = await prisma.fxRateRecord.findFirst({
    where: { isManualOverride: false },
    orderBy: { fetchedAt: 'desc' },
  });

  const now = new Date().getTime();

  // If missing or older than 24 hours, attempt background refresh (unless external feed offline simulation requested)
  if (!latest || (now - latest.fetchedAt.getTime() > FRESH_THRESHOLD_MS)) {
    if (!options?.simulateOffline) {
      const refreshed = await refreshFxRateFromSource();
      if (refreshed) {
        latest = refreshed;
      }
    }
  }

  if (!latest) {
    // Hardcoded bootstrap default (USD/BTN 84.0 based on initial peg parity); replaced on first automated sync
    return {
      rate: 84.0,
      status: 'FRESH',
      source: 'SEED_INITIAL',
      fetchedAt: new Date(),
      blocked: false,
      isCriticalStale: false,
      isManualOverride: false,
      stalenessHours: 0,
      message: 'Bootstrap default exchange rate active until first live sync.',
    };
  }

  const ageMs = now - latest.fetchedAt.getTime();
  const stalenessHours = Math.floor(ageMs / (60 * 60 * 1000));

  if (ageMs <= FRESH_THRESHOLD_MS) {
    return {
      rate: latest.rate,
      status: 'FRESH',
      source: latest.source,
      fetchedAt: latest.fetchedAt,
      blocked: false,
      isCriticalStale: false,
      isManualOverride: false,
      stalenessHours,
    };
  } else if (ageMs <= STALE_CEILING_MS) {
    return {
      rate: latest.rate,
      status: 'STALE',
      source: latest.source,
      fetchedAt: latest.fetchedAt,
      blocked: false,
      isCriticalStale: false,
      isManualOverride: false,
      stalenessHours,
      message: 'Warning: Exchange rate cache is over 24 hours old. RMA feed refresh pending.',
    };
  } else {
    // Hard ceiling breached (> 72h)
    return {
      rate: latest.rate,
      status: 'STALE',
      source: latest.source,
      fetchedAt: latest.fetchedAt,
      blocked: true,
      isCriticalStale: true,
      isManualOverride: false,
      stalenessHours,
      message: 'Critical: RMA exchange rate is over 72 hours old. BTN checkout temporarily blocked until verified by secretariat.',
    };
  }
}

export async function getEffectiveFxRate(options?: { simulateOffline?: boolean }): Promise<FxRateResult> {
  return getCurrentFxRate(options);
}

export async function refreshFxRateFromSource() {
  try {
    let rate: number | null = null;
    let source = 'INR_PEG_PROXY';

    try {
      if (process.env.SIMULATE_FX_FEED_OFFLINE === 'true') {
        throw new Error('Simulated external RMA feed offline connection failure');
      }
      // BTN is pegged 1:1 to INR; we do not have a direct RMA feed integration, so we read India's USD rate as a proxy.
      // If the peg is ever adjusted or a real RMA API becomes available, this needs to be replaced with a direct source —
      // do not assume this proxy is permanent.
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && typeof data.rates.INR === 'number') {
          rate = Number(data.rates.INR);
          source = 'INR_PEG_PROXY';
        }
      }
    } catch (fetchErr: any) {
      console.warn('External FX feed unavailable:', fetchErr?.message || fetchErr);
    }

    // Fail-closed invariant: If external feed failed, do NOT create a fake "FRESH" record.
    // Return null so the existing cached record ages towards STALE (24h) and CRITICAL_STALE / BLOCKED (72h).
    if (!rate) {
      return null;
    }

    const record = await prisma.fxRateRecord.create({
      data: {
        rate,
        source,
        status: 'FRESH',
        isManualOverride: false,
        notes: 'Automated 24h currency sync via open USD/INR exchange rate (BTN:INR 1:1 peg)',
      },
    });

    await logAudit({
      actorType: 'SYSTEM',
      actorIdentifier: 'fx-rate-sync-cron',
      action: 'FX_RATE_AUTOMATED_SYNC',
      entityType: 'FxRateRecord',
      entityId: record.id,
      details: { rate, source },
    });

    return record;
  } catch (error) {
    console.error('Failed to sync FX rate:', error);
    return null;
  }
}

export async function setManualFxOverride(
  param1: number | { rate: number; notes: string; actor: SessionUser; clientIp?: string },
  notes?: string,
  actorId?: string,
  clientIp?: string
) {
  let rate: number;
  let memo: string;
  let actorIdent = actorId || 'admin-system';
  let ip = clientIp;

  if (typeof param1 === 'object') {
    rate = param1.rate;
    memo = param1.notes;
    actorIdent = param1.actor.email;
    ip = param1.clientIp;
  } else {
    rate = param1;
    memo = notes || 'Administrative manual override';
  }

  const record = await prisma.fxRateRecord.create({
    data: {
      rate,
      source: 'MANUAL_OVERRIDE',
      status: 'MANUAL_OVERRIDE',
      isManualOverride: true,
      notes: memo,
    },
  });

  await logAudit({
    actorType: 'STAFF',
    actorId: actorId || null,
    actorIdentifier: actorIdent,
    actorIp: ip || null,
    action: 'FX_RATE_MANUAL_OVERRIDE',
    entityType: 'FxRateRecord',
    entityId: record.id,
    details: { rate, notes: memo },
  });

  return record;
}

export async function clearManualFxOverride(actor: SessionUser, clientIp?: string) {
  await prisma.fxRateRecord.deleteMany({
    where: { isManualOverride: true },
  });

  await logAudit({
    actorType: 'STAFF',
    actorId: actor.id,
    actorIdentifier: actor.email,
    actorIp: clientIp,
    action: 'FX_RATE_MANUAL_OVERRIDE_CLEARED',
    entityType: 'FxRateRecord',
    entityId: 'ALL',
  });
}

export function formatPrice(usdAmount: number, currency: 'USD' | 'BTN', fxRate: number): string {
  if (currency === 'USD') {
    return '$' + usdAmount.toLocaleString();
  }
  return 'Nu. ' + Math.round(usdAmount * fxRate).toLocaleString();
}

export function formatAltPrice(usdAmount: number, currency: 'USD' | 'BTN', fxRate: number): string {
  if (currency === 'USD') {
    return 'Nu. ' + Math.round(usdAmount * fxRate).toLocaleString();
  }
  return '$' + usdAmount.toLocaleString();
}
