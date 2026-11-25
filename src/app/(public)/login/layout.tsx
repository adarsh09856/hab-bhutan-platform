import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/login', 'Member and trader login', 'Sign in to your HAB member or trader account.', { noIndex: true });
export default function LoginLayout({ children }: { children: React.ReactNode }) { return children; }
