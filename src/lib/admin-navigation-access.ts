// UI visibility follows the existing API permissions. API handlers remain the authority.
export interface AdminAccessUser {
  roleSlug: string;
  permissions: string[];
}

const routePermissions: Record<string, string[]> = {
  '/admin': ['reports:view'],
  '/admin/pages': ['content:view'],
  '/admin/pages/home': ['content:edit'],
  '/admin/pages/about': ['content:edit'],
  '/admin/pages/live-content': ['content:edit'],
  '/admin/pages/sections': ['content:view'],
  '/admin/pages/governance-cards': ['content:view'],
  '/admin/navigation': ['content:view'],
  '/admin/menus': ['content:view'],
  '/admin/hero': ['content:view'],
  '/admin/media': ['content:view', 'content:edit'],
  '/admin/content': ['content:view'],
  '/admin/events': ['content:view', 'content:edit'],
  '/admin/tenders': ['content:view', 'content:edit'],
  '/admin/programmes': ['content:view'],
  '/admin/projects': ['content:view'],
  '/admin/publications': ['content:view'],
  '/admin/members': ['members:view'],
  '/admin/applications': ['applications:view'],
  '/admin/membership-categories': ['members:view'],
  '/admin/membership-settings': ['members:view', 'dues:view', 'members:verify'],
  '/admin/crafts': ['content:view', 'content:edit', 'products:view', 'products:review'],
  '/admin/honours': ['content:view', 'content:edit'],
  '/admin/products': ['products:view'],
  '/admin/clusters-outlets': ['content:view', 'content:edit'],
  '/admin/orders': ['orders:view'],
  '/admin/pos': ['orders:create'],
  '/admin/wholesale': ['members:view', 'orders:fulfill'],
  '/admin/trade': ['products:view'],
  '/admin/payments': ['orders:view'],
  '/admin/reports': ['reports:view'],
  '/admin/site-settings': ['content:edit'],
  '/admin/localization': ['content:edit'],
  '/admin/styling': ['content:edit'],
  '/admin/policies': ['content:view'],
  '/admin/inquiries': ['content:view'],
  '/admin/donate-settings': ['content:view'],
  '/admin/donations': ['donations:view'],
  '/admin/users': ['users:view'],
  '/admin/recycle-bin': ['content:edit'],
  '/admin/settings': ['content:edit'],
};

export function hasAdminPermission(user: AdminAccessUser | null, permission: string): boolean {
  return Boolean(user && (user.permissions.includes('*') || user.permissions.includes(permission)));
}

export function canOpenAdminRoute(user: AdminAccessUser | null, href: string): boolean {
  if (!user) return false;
  const [path, query] = href.split('?');
  if (path === '/admin/pages' && new URLSearchParams(query).get('new') === '1') {
    return hasAdminPermission(user, 'content:create');
  }
  const route = Object.keys(routePermissions)
    .filter((route) => path === route || (route !== '/admin' && path.startsWith(`${route}/`)))
    .sort((a, b) => b.length - a.length)[0];
  if (!route) return false;
  // These APIs also restrict settings access to the existing operational roles.
  if (['/admin/site-settings', '/admin/localization', '/admin/styling', '/admin/settings', '/admin/pages/home', '/admin/pages/about'].includes(route)
    && !['super_admin', 'staff_operator'].includes(user.roleSlug.toLowerCase())) return false;
  return routePermissions[route].some((permission) => hasAdminPermission(user, permission));
}
