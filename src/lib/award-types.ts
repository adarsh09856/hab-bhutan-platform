const AWARD_TYPE_LABELS: Record<string, string> = {
  RoyalSeal: 'Master Craftsperson',
  NationalMaster: 'National Craft Award',
  Authenticity: 'Seal of Authenticity',
  'Enterprise of the Year': 'Enterprise of the Year',
  'Young Artisan Award': 'Young Artisan Award',
};

export function awardTypeLabel(value: string | null | undefined): string {
  const awardType = value?.trim();
  return awardType ? AWARD_TYPE_LABELS[awardType] || awardType : 'Master Craftsperson';
}
