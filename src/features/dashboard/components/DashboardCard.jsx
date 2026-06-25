import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function DashboardCard({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-safe-gray-light/40 border border-safe-gray-light rounded-xl p-5 flex flex-col gap-3 shadow-card ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-safe-blue tracking-wide uppercase">{title}</h3>
        {icon && <FontAwesomeIcon icon={icon} className="text-safe-blue-light text-lg" />}
      </div>
      {children}
    </div>
  );
}

export default DashboardCard;
