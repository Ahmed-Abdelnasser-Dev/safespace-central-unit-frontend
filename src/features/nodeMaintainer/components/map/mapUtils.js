import { faCircleCheck, faCircleXmark, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export const laneStatusConfig = {
  open: { icon: faCircleCheck, color: '#22c55e', bg: '#e8f5e9', label: 'Open' },
  blocked: { icon: faCircleXmark, color: '#d63e4d', bg: '#fee2e2', label: 'Blocked' },
  right: { icon: faArrowRight, color: '#247cff', bg: '#e3f2fd', label: 'Right' },
  left: { icon: faArrowLeft, color: '#247cff', bg: '#e3f2fd', label: 'Left' }
};

const NODE_STATUS_COLORS = {
  online: {
    dot: '#4caf50',
    badgeBg: '#e8f5e9',
    badgeText: '#22c55e'
  },
  offline: {
    dot: '#e83e3e',
    badgeBg: '#fee2e2',
    badgeText: '#d63e4d'
  },
  warning: {
    dot: '#ffd333',
    badgeBg: '#fff3e0',
    badgeText: '#ff9800'
  }
};

/**
 * Normalize a lane status value to one of the supported keys.
 * @param {string} status
 * @returns {string}
 */
export function normalizeLaneStatus(status) {
  if (laneStatusConfig[status]) return status;
  if (status === 'active') return 'open';
  if (status === 'closed') return 'blocked';
  if (status === 'warning') return 'blocked';
  return 'open';
}

/**
 * Get color tokens for a node status.
 * @param {string} status
 * @returns {{dot: string, badgeBg: string, badgeText: string}}
 */
export function getNodeStatusColors(status) {
  return NODE_STATUS_COLORS[status] || NODE_STATUS_COLORS.warning;
}
