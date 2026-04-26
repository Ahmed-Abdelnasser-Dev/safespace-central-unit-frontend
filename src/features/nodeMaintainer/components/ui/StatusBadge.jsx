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
      bg: 'bg-[#e8f5e9]',
      text: 'text-[#4caf50]',
      label: 'online'
    },
    offline: {
      bg: 'bg-[#fee2e2]',
      text: 'text-[#d63e4d]',
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
