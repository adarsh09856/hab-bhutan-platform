import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/search', 'Search HAB', 'Search the HAB website for crafts, traders, publications, programmes and news.', { noIndex: true });
export default function SearchLayout({ children }: { children: React.ReactNode }) { return children; }
