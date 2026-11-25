import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/news', 'News and events', 'Browse HAB news, vacancy notices, announcements and upcoming events.');
export default function NewsLayout({ children }: { children: React.ReactNode }) { return children; }
