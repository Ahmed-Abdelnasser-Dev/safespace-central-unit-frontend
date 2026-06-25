/**
 * Role-based navigation configuration.
 * Maps each backend role to its navigation items and default landing page.
 */

/**
 * Per-route page configuration consumed by AppTopBar.
 * title   — shown as the page heading in the top bar.
 * section — optional breadcrumb prefix (e.g. "Administration > Activity Logs").
 *
 * For dynamic routes (e.g. /cases/:id), AppTopBar falls back to the nearest
 * prefix match.
 */
export const PAGE_CONFIG = {
  '/user-management':  { title: 'User Management',   section: 'Administration' },
  '/activity-logs':    { title: 'Activity Logs',     section: 'Administration' },
  '/dashboard':        { title: 'Dashboard',         section: null },
  '/road-observer':    { title: 'Live Monitoring',   section: null },
  '/cases':            { title: 'Dispatch Console',  section: null },
  '/node-maintainer':  { title: 'Node Maintainer',   section: null },
  '/cameras':          { title: 'Camera Feeds',      section: null },
  '/reports':          { title: 'Reports',           section: null },
  '/settings':         { title: 'Settings',          section: null },
  '/alerts':           { title: 'Alerts',            section: null },
  '/messages':         { title: 'Messages',          section: null },
  '/profile':          { title: 'Profile',           section: null },
  '/incident-history': { title: 'Incident History',  section: null },
  '/system-test':      { title: 'System Test',       section: null },
};

/**
 * Resolve page config for a given pathname (including dynamic segments).
 * Falls back to the longest matching static prefix.
 */
export function getPageConfig(pathname) {
  if (PAGE_CONFIG[pathname]) return PAGE_CONFIG[pathname];
  const match = Object.keys(PAGE_CONFIG)
    .filter((p) => pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];
  return PAGE_CONFIG[match] ?? { title: '', section: null };
}

export const ROLE_NAV_CONFIG = {
  admin: {
    defaultPath: '/user-management',
    navItems: [
      { label: 'User Management', icon: 'users', path: '/user-management' },
      { label: 'Activity Logs', icon: 'clipboard-list', path: '/activity-logs' },
      { label: 'Dashboard', icon: 'chart-line', path: '/dashboard' },
      { label: 'Map Overview', icon: 'map', path: '/road-observer' },
      { label: 'Cases', icon: 'headset', path: '/cases' },
      { label: 'Node Maintainer', icon: 'server', path: '/node-maintainer' },
      { label: 'Camera Feeds', icon: 'video', path: '/cameras' },
      { label: 'Reports', icon: 'file-lines', path: '/reports' },
      { label: 'Settings', icon: 'gear', path: '/settings' },
    ],
  },
  emergency_dispatcher: {
    defaultPath: '/cases',
    navItems: [
      { label: 'Dispatch', icon: 'headset', path: '/cases' },
      { label: 'Map Overview', icon: 'map', path: '/road-observer' },
      { label: 'Dashboard', icon: 'chart-line', path: '/dashboard' },
      { label: 'Alerts', icon: 'bell', path: '/alerts' },
      { label: 'Camera Feeds', icon: 'video', path: '/cameras' },
      { label: 'Messages', icon: 'envelope', path: '/messages' },
    ],
  },
  road_observer: {
    defaultPath: '/road-observer',
    navItems: [
      { label: 'Live Monitoring', icon: 'satellite-dish', path: '/road-observer' },
      { label: 'Incident History', icon: 'clipboard-list', path: '/incident-history' },
      { label: 'Reports', icon: 'file-lines', path: '/reports' },
      { label: 'Camera Feeds', icon: 'video', path: '/cameras' },
    ],
  },
  node_maintenance_crew: {
    defaultPath: '/node-maintainer',
    navItems: [
      { label: 'Node Maintainer', icon: 'server', path: '/node-maintainer' },
    ],
  },
};

/**
 * Get the default redirect path for a given role.
 * @param {string} roleName - The role name from the backend.
 * @returns {string} The default path for the role.
 */
export function getDefaultPath(roleName) {
  return ROLE_NAV_CONFIG[roleName]?.defaultPath || '/road-observer';
}

/**
 * Get navigation items for a given role.
 * @param {string} roleName - The role name from the backend.
 * @returns {Array} The navigation items for the role.
 */
export function getNavItems(roleName) {
  return ROLE_NAV_CONFIG[roleName]?.navItems || [];
}
