import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/publications', 'Reports and publications', 'Browse HAB reports, publications, policy documents and sector resources.');
export default function PublicationsLayout({ children }: { children: React.ReactNode }) { return children; }
