import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/projects', 'HAB projects', 'Explore current and completed projects led or supported by the Handicrafts Association of Bhutan.');
export default function ProjectsLayout({ children }: { children: React.ReactNode }) { return children; }
