import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StatusBadge from '@/components/ui/StatusBadge';

export default function NodeCard({ node, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(node.id)}
      className={`w-full rounded-xl border text-left transition-all duration-200 ${
        isSelected
          ? 'bg-safe-blue/10 border-safe-blue'
          : 'bg-safe-gray border-transparent hover:bg-safe-gray-light/50'
      }`}
    >
      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                node.status === 'online' ? 'bg-safe-success' : 'bg-safe-danger'
              }`}
            />
            <span className="text-sm font-bold text-safe-text-primary truncate">
              {node.id}
            </span>
          </div>
          <StatusBadge status={node.status} className="ml-2" />
        </div>

        <p className="text-xs text-safe-text-muted mb-1.5 truncate">
          {node.location.address}
        </p>

        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon="microchip" className="text-safe-text-muted text-[10px]" />
            <span className="text-xs text-safe-text-muted">{node.health.cpu}%</span>
          </div>
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon="temperature-half" className="text-safe-text-muted text-[10px]" />
            <span className="text-xs text-safe-text-muted">{node.health.temperature}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon="wifi" className="text-safe-text-muted text-[10px]" />
            <span className="text-xs text-safe-text-muted">{node.health.network}%</span>
          </div>
        </div>
      </div>
    </button>
  );
}
