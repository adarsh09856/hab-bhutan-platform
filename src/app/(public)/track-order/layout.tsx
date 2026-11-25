import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/track-order', 'Track an e-shop order', 'Check the status and delivery progress of an HAB e-shop order.', { noIndex: true });
export default function TrackOrderLayout({ children }: { children: React.ReactNode }) { return children; }
