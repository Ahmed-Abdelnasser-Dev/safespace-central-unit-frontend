/**
 * Reusable Status Badge Component
 * 
 * Displays status with background color and icon
 * Used for online/offline status indicators
 * 
 * @component
 * @param {string} status - Status type: 'online' or 'offline'
 * @param {string} className - Additional CSS classes
 */

function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    online: {
      bg: 'bg-safe-success/15',
      text: 'text-safe-success',
      label: 'online'
    },
    offline: {
      bg: 'bg-safe-danger/15',
      text: 'text-safe-danger',
      label: 'offline'
    }
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <span 
      className={`font-medium px-[8px] py-[3px] rounded-[4px] ${config.bg} ${config.text} ${className}`}
      style={{ 
        fontSize: 'clamp(10px, 1.1vw, 11px)',
        lineHeight: '13.671px',
        fontFamily: 'Arimo, sans-serif'
      }}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
