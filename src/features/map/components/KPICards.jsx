import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const METRICS_CONFIG = [
  {
    id: 'online',
    icon: 'server',
    iconBg: 'bg-safe-green/15',
    iconColor: 'text-safe-green',
    valueColor: 'text-safe-green',
    label: 'Nodes Online',
    emptyValue: '—',
  },
  {
    id: 'offline',
    icon: 'exclamation-triangle',
    iconBg: 'bg-safe-danger/15',
    iconColor: 'text-safe-danger',
    valueColor: 'text-safe-danger',
    label: 'Nodes Offline',
    emptyValue: '—',
  },
  {
    id: 'pending',
    icon: 'circle-dot',
    iconBg: 'bg-safe-accent/15',
    iconColor: 'text-safe-accent',
    valueColor: 'text-safe-accent',
    label: 'Pending Review',
    emptyValue: '—',
  },
  {
    id: 'reviewed',
    icon: 'circle-check',
    iconBg: 'bg-safe-blue/15',
    iconColor: 'text-safe-blue',
    valueColor: 'text-safe-blue',
    label: 'Reviewed Today',
    emptyValue: '—',
  },
];

/**
 * KPICards — status strip for the Road Observer monitoring console.
 *
 * @param {Object}  props
 * @param {number}  props.nodesOnline   — count of online nodes (from Redux)
 * @param {number}  props.nodesOffline  — count of offline nodes (from Redux)
 * @param {number}  [props.pendingReview]   — pending incidents (observer API)
 * @param {number}  [props.reviewedToday]   — reviewed today (observer API)
 * @param {boolean} props.loading       — show skeletons while fetching
 */
function KPICards({
  nodesOnline = 0,
  nodesOffline = 0,
  pendingReview,
  reviewedToday,
  loading = false,
}) {
  const values = {
    online: nodesOnline,
    offline: nodesOffline,
    pending: pendingReview,
    reviewed: reviewedToday,
  };

  return (
    <div className="flex gap-2">
      {METRICS_CONFIG.map((metric) => {
        const value = values[metric.id];
        const isUnavailable = value === undefined || value === null;

        return (
          <div
            key={metric.id}
            className="flex-1 min-w-0 bg-safe-gray border border-safe-gray-light rounded-lg px-3 py-2 flex items-center gap-2.5"
          >
            <div className={`w-7 h-7 ${metric.iconBg} rounded-md flex items-center justify-center flex-shrink-0`}>
              <FontAwesomeIcon icon={metric.icon} className={`${metric.iconColor} text-xs`} />
            </div>

            <div className="min-w-0">
              {loading ? (
                <>
                  <div className="h-4 w-8 bg-safe-gray-light/50 rounded animate-pulse mb-0.5" />
                  <div className="h-2.5 w-16 bg-safe-gray-light/40 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <div className={`text-base font-bold leading-none tabular-nums ${isUnavailable ? 'text-safe-text-muted' : metric.valueColor}`}>
                    {isUnavailable ? metric.emptyValue : value}
                  </div>
                  <div className="text-[10px] text-safe-text-muted leading-none mt-0.5 truncate">
                    {metric.label}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KPICards;
