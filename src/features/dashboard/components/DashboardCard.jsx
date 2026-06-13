import { shadows } from '@/designSystem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function DashboardCard({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-safe-gray-light/30 border border-safe-gray-light/40 rounded-xl p-6 flex flex-col gap-4 ${shadows.card} hover:${shadows.lg} transition-all duration-300 hover:border-safe-gray-light/60 group ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-safe-blue-light tracking-wide uppercase letter-spacing-0.5">{title}</h3>
        {icon && (
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-safe-blue/10 group-hover:bg-safe-blue/20 transition-colors duration-200">
            <FontAwesomeIcon icon={icon} className="text-safe-blue text-sm" />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

export default DashboardCard;
