import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/member', 'HAB member route', 'This legacy route forwards visitors to the current HAB directory.', { noIndex: true });
export default function LegacyMemberLayout({ children }: { children: React.ReactNode }) { return children; }
