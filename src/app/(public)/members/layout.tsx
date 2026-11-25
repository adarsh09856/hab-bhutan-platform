import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/members', 'HAB trader directory route', 'The public member directory has moved to the HAB accredited trader directory.', { noIndex: true });
export default function LegacyMembersLayout({ children }: { children: React.ReactNode }) { return children; }
