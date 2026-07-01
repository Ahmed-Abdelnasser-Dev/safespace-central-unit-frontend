import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * StatCard — the canonical stat/KPI tile for the Safe Space system.
 *
 * Matches the admin UserManagementCards visual vocabulary:
 *   bg-safe-sidebar, rounded-xl, p-6, border border-safe-border
 *   label (muted, top-left) · icon (colored, top-right)
 *   big value · small trend/sub-label
 *
 * @param {string}         label       - Card title (e.g. "Total Users")
 * @param {string|number}  value       - Primary value to display
 * @param {string}         [trend]     - Sub-label beneath the value
 * @param {string}         [icon]      - FontAwesome icon name
 * @param {string}         [iconColor] - Tailwind text-* color class for the icon
 * @param {string}         [className] - Extra wrapper classes
 * @param {'default'|'compact'} [size] - 'compact' reduces padding for tight contexts
 */
function StatCard({ label, value, trend, icon, iconColor = 'text-safe-blue-btn', className = '', size = 'default' }) {
  const padding = size === 'compact' ? 'p-4' : 'p-6';
  const valueSize = size === 'compact' ? 'text-2xl' : 'text-3xl';

  return (
    <div className={`bg-safe-sidebar rounded-xl ${padding} border border-safe-border relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm font-semibold text-safe-text-gray">
          {label}
        </div>
        {icon && (
          <div className="text-2xl px-2 py-1">
            <FontAwesomeIcon icon={icon} className={iconColor} />
          </div>
        )}
      </div>

      <div className={`${valueSize} font-bold text-safe-text-primary mb-5`}>
        {value ?? '—'}
      </div>

      {trend != null && (
        <div className="text-xs text-safe-text-gray">
          {trend}
        </div>
      )}
    </div>
  );
}

export default StatCard;
