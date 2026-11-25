import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/membership/apply', 'Apply for HAB membership', 'Submit an application to join the Handicrafts Association of Bhutan.', { noIndex: true });
export default function MembershipApplyLayout({ children }: { children: React.ReactNode }) { return children; }
