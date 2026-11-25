import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/project', 'HAB project route', 'This legacy route forwards visitors to the selected HAB project.', { noIndex: true });
export default function LegacyProjectLayout({ children }: { children: React.ReactNode }) { return children; }
