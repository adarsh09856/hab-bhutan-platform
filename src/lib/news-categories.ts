export const NEWS_CATEGORIES = ['Programs', 'Artisan Support', 'Events', 'Publications', 'Projects', 'Vacancies', 'Announcements'] as const;
export const NEWS_NOTICE_CATEGORIES = ['Vacancies', 'Announcements'] as const;
export const NEWS_SUBCATEGORIES = ['Field Report', 'Press Release', 'Artisan Feature', 'Secretariat Notice', 'Training Milestone', 'Exhibition Report'] as const;
export type NewsNoticeCategory = typeof NEWS_NOTICE_CATEGORIES[number];

export function normalizeNewsCategory(value: unknown): string {
  const name = typeof value === 'string' ? value.trim() : '';
  if (/^vacanc(?:y|ies)$/i.test(name)) return 'Vacancies';
  if (/^announcements?$/i.test(name)) return 'Announcements';
  return name;
}

export function newsCategoryPath(category: NewsNoticeCategory): string {
  return `/news/${category.toLowerCase()}`;
}

export function mergeNewsOptions(...groups: readonly unknown[][]): string[] {
  const values = new Map<string, string>();
  for (const group of groups) for (const value of group) {
    if (typeof value !== 'string') continue;
    const label = value.trim().replace(/\s+/g, ' ');
    if (label && !values.has(label.toLocaleLowerCase())) values.set(label.toLocaleLowerCase(), label);
  }
  return [...values.values()];
}
