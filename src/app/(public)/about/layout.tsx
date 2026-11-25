import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/about', 'About HAB', 'Learn about the Handicrafts Association of Bhutan, its history, mandate and work with Bhutanese craftspeople.');
export default function AboutLayout({ children }: { children: React.ReactNode }) { return children; }
