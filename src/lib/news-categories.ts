export const NEWS_CATEGORIES = ['Programs', 'Artisan Support', 'Events', 'Publications', 'Projects', 'Vacancies', 'Announcements'] as const;
export const NEWS_NOTICE_CATEGORIES = ['Vacancies', 'Announcements'] as const;
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
