/**
 * Reusable Metric Card Component
 * 
 * Displays a single metric with icon, value, unit, and progress bar
 * Used consistently across OverviewTab, HealthTab
 * 
 * @component
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { typography, fontFamily } from '../../styles/typography';

function MetricCard({ 
  label, 
  value, 
  unit, 
  icon, 
  color = 'rgb(59, 130, 246)',
  trend = null,
  trendColor = null 
}) {
  return (
    <div className="p-[10px] sm:p-[11px] md:p-[12px] lg:p-[14px] bg-safe-gray rounded-[6px] sm:rounded-[7px] md:rounded-[8px] border border-safe-gray-light transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-[8px] sm:mb-[9px] md:mb-[10px]">
        <span className="font-normal text-safe-text-muted" style={{ fontSize: 'clamp(11px, 1vw, 13px)', fontFamily }}>
          {label}
        </span>
        {icon && (
          <FontAwesomeIcon icon={icon} style={{ color, width: 'clamp(14px, 2vw, 18px)', height: 'clamp(14px, 2vw, 18px)' }} />
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-[4px] sm:gap-[5px] md:gap-[6px] mb-[8px] sm:mb-[9px] md:mb-[10px]">
        <span className="font-bold" style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', color, fontFamily }}>
          {value}
        </span>
        <span className="text-safe-text-muted" style={{ fontSize: 'clamp(11px, 1vw, 12px)', fontFamily }}>
          {unit}
        </span>
        {trend && (
          <span className="ml-auto font-bold" style={{ fontSize: 'clamp(10px, 1vw, 12px)', color: trendColor, fontFamily }}>
            {trend}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-safe-gray-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export default MetricCard;
