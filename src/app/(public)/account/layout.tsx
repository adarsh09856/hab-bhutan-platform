import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/account', 'Your account', 'Manage your HAB e-shop account, orders and saved details.', { noIndex: true });
export default function AccountLayout({ children }: { children: React.ReactNode }) { return children; }
