import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/login', 'Member and customer login', 'Sign in to your HAB member or customer account.', { noIndex: true });
export default function LoginLayout({ children }: { children: React.ReactNode }) { return children; }
