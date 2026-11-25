import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/wholesale/login', 'Wholesale account login', 'Sign in to your HAB wholesale buyer account.', { noIndex: true });
export default function WholesaleLoginLayout({ children }: { children: React.ReactNode }) { return children; }
