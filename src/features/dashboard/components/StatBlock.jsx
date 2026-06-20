import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function StatBlock({ label, value, trend, positive }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex flex-col">
        <span className="text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-white mt-1">{value}</span>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 ${positive ? 'text-safe-success' : 'text-safe-danger'}`}>
          <FontAwesomeIcon icon={positive ? 'arrow-up' : 'arrow-down'} />
          <span>{trend}%</span>
        </div>
      )}
    </div>
  );
}

export default StatBlock;
