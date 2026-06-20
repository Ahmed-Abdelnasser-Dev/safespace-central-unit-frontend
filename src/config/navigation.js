/**
 * Role-based navigation configuration.
 * Maps each backend role to its navigation items and default landing page.
 */

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
