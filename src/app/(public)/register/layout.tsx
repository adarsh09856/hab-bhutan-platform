import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/register', 'Apply to join HAB', 'Start an application to become a member of the Handicrafts Association of Bhutan.', { noIndex: true });
export default function RegisterLayout({ children }: { children: React.ReactNode }) { return children; }
