import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/event', 'HAB event route', 'This legacy route forwards visitors to the matching HAB event.', { noIndex: true });
export default function LegacyEventLayout({ children }: { children: React.ReactNode }) { return children; }
