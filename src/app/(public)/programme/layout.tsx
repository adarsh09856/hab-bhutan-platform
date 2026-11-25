import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/programme', 'HAB programme route', 'This legacy route forwards visitors to the selected HAB programme.', { noIndex: true });
export default function LegacyProgrammeLayout({ children }: { children: React.ReactNode }) { return children; }
