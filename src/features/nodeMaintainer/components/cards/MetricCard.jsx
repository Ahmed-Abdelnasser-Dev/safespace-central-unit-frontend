import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function MetricCard({ label, value, unit, icon, color = '#3b82f6', trend = null, trendColor = null }) {
  return (
    <div className="p-3 bg-safe-gray rounded-lg border border-safe-gray-light transition-colors duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-normal text-safe-text-muted">{label}</span>
        {icon && <FontAwesomeIcon icon={icon} style={{ color, width: '14px', height: '14px' }} />}
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
        <span className="text-xs text-safe-text-muted">{unit}</span>
        {trend && (
          <span className="ml-auto text-xs font-bold" style={{ color: trendColor }}>{trend}</span>
        )}
      </div>
      <div className="w-full h-1.5 bg-safe-gray-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default MetricCard;
