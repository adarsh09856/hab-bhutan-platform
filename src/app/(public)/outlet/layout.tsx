import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/outlet', 'HAB outlet route', 'This legacy route forwards visitors to the matching HAB retail outlet.', { noIndex: true });
export default function LegacyOutletLayout({ children }: { children: React.ReactNode }) { return children; }
