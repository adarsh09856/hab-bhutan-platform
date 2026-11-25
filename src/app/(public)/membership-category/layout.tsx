import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/membership-category', 'HAB membership category', 'Choose a Handicrafts Association of Bhutan membership category.', { noIndex: true });
export default function MembershipCategoryLayout({ children }: { children: React.ReactNode }) { return children; }
