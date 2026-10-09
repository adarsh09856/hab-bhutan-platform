import { normalizeWholesaleTiers } from '@/lib/wholesale-terms-normalize';

type SavedTerms = {
  moq: number;
  leadTime?: string | null;
  tiers: unknown;
  customisation?: string | null;
  isActive: boolean;
};

/** Returns only explicitly configured, valid B2B pricing; never derives a wholesale price from retail. */
export function resolveWholesaleOffer(saved: SavedTerms | null | undefined, legacy: unknown) {
  const raw: any = saved ? {
    moq: saved.moq,
    lead_time: saved.leadTime || '',
    tiers: saved.tiers,
    customisation: saved.customisation || '',
    is_active: saved.isActive,
  } : legacy;
  if (!raw || raw.is_active === false || !Array.isArray(raw.tiers) || raw.tiers.length === 0) return null;
  const moq = Number(raw.moq);
  const tiers = normalizeWholesaleTiers(raw.tiers);
  if (!Number.isSafeInteger(moq) || moq < 1 || tiers.some(([minimum, price]: number[]) =>
    !Number.isSafeInteger(minimum) || minimum < moq || !Number.isFinite(price) || price < 0
  )) return null;
  tiers.sort((a: number[], b: number[]) => a[0] - b[0]);
  if (tiers.some((tier: number[], index: number) => index > 0 && tier[0] <= tiers[index - 1][0])) return null;
  return {
    moq,
    lead_time: String(raw.lead_time || raw.lead || ''),
    tiers,
    customisation: String(raw.customisation || raw.custom || ''),
    is_active: true,
  };
}
