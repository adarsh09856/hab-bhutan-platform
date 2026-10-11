import type { OutletData } from './client-data';

type OutletTextKey = 'name' | 'place' | 'note' | 'description' | 'hours' | 'stalls' | 'payment';

const dzongkhaKeys: Record<OutletTextKey, keyof OutletData> = {
  name: 'name_dz',
  place: 'place_dz',
  note: 'note_dz',
  description: 'description_dz',
  hours: 'hours_dz',
  stalls: 'stalls_dz',
  payment: 'payment_dz',
};

export function resolveOutletText(outlet: Partial<OutletData>, language: 'en' | 'dz', key: OutletTextKey): string {
  if (language === 'dz') {
    const translation = outlet[dzongkhaKeys[key]];
    if (typeof translation === 'string' && translation.trim()) return translation;
  }

  const english = outlet[key];
  return typeof english === 'string' ? english : '';
}
