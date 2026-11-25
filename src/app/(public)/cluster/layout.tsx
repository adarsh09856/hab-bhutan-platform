import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/cluster', 'Artisan cluster route', 'This legacy route forwards visitors to the matching HAB artisan cluster.', { noIndex: true });
export default function LegacyClusterLayout({ children }: { children: React.ReactNode }) { return children; }
