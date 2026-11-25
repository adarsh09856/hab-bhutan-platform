import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/news-post', 'HAB news article route', 'This legacy route forwards visitors to the selected HAB news article.', { noIndex: true });
export default function LegacyNewsPostLayout({ children }: { children: React.ReactNode }) { return children; }
