import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumber } from '../utils/format';

function StatBlock({ label, value, trend, positive }) {
  return (
    <div className="flex items-center justify-between text-xs p-3 rounded-lg border border-safe-gray-light/20 bg-safe-dark/20 group hover:bg-safe-dark/40 hover:border-safe-gray-light/40 transition-all duration-200">
      <div className="flex flex-col gap-1.5">
        <span className="text-safe-text-gray/70 font-medium uppercase tracking-wide text-[10px]">{label}</span>
        <span className="text-base font-bold text-white">{formatNumber(value)}</span>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1.5 font-semibold px-2 py-1 rounded-md transition-all duration-200 ${positive ? 'bg-safe-success/15 text-safe-success' : 'bg-safe-danger/15 text-safe-danger'}`}>
          <FontAwesomeIcon icon={positive ? 'arrow-up' : 'arrow-down'} className="text-xs" />
          <span className="text-xs">{trend}%</span>
        </div>
      )}
    </div>
  );
}

export default StatBlock;
