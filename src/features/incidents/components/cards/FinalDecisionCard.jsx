import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faPaperPlane, faGaugeHigh, faRoad, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

function FinalDecisionCard({ speedLimit = 80, laneConfiguration = [], laneNames = [], statusConfig = {} }) {
  const hasLanes = Array.isArray(laneConfiguration) && laneConfiguration.length > 0;
  const safeLaneNames = Array.isArray(laneNames) ? laneNames : [];
  const safeLaneConfig = Array.isArray(laneConfiguration) ? laneConfiguration : [];
  const maxLength = Math.max(safeLaneNames.length, safeLaneConfig.length);

  // Pad arrays to ensure they match
  const paddedLaneNames = Array.from({ length: maxLength }, (_, i) => safeLaneNames[i] || `Lane ${i + 1}`);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faCheckCircle} className="text-safe-success text-sm" />
        <h4 className="font-bold text-sm text-safe-text-primary">Final Decision</h4>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-safe-success/15 text-safe-success flex items-center gap-1">
          <FontAwesomeIcon icon={faPaperPlane} className="text-[8px]" />
          TO NODE
        </span>
      </div>
      <div className="p-4 border-2 border-safe-success/30 rounded-xl bg-safe-success/5 space-y-3 shadow-sm">
        {/* Speed Limit */}
        <div className="bg-safe-sidebar rounded-lg p-3.5 border border-safe-success/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faGaugeHigh} className="text-safe-success text-xs" />
            <span className="text-[11px] font-semibold text-safe-success uppercase tracking-wide">Speed Limit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[28px] font-bold text-safe-text-primary">{speedLimit}</span>
            <span className="text-sm font-semibold text-safe-text-muted">km/h</span>
          </div>
        </div>

        {/* Lane Configuration */}
        {hasLanes ? (
          <div className="bg-safe-sidebar rounded-lg p-3.5 border border-safe-success/20 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <FontAwesomeIcon icon={faRoad} className="text-safe-success text-xs" />
              <span className="text-[11px] font-semibold text-safe-success uppercase tracking-wide">Lane Configuration</span>
            </div>
            <div className="flex gap-2.5 justify-center flex-wrap">
              {safeLaneConfig.map((state, i) => {
                const config = statusConfig[state] || statusConfig.open || { icon: faCircleCheck, color: '#22c55e', bg: '#dcfce7' };
                return (
                  <div key={i} className="text-center">
                    <div
                      className="flex items-center justify-center w-[50px] h-[50px] rounded-lg border-2 border-safe-success/40 shadow-md transition-transform hover:scale-105"
                      style={{ backgroundColor: config.bg }}
                    >
                      <FontAwesomeIcon
                        icon={config.icon}
                        style={{ color: config.color, width: '20px', height: '20px' }}
                      />
                    </div>
                    <p className="text-[11px] text-safe-text-primary mt-1.5 font-bold">
                      {paddedLaneNames[i] || `Lane ${i + 1}`}
                    </p>
                    <p className="text-[9px] text-safe-text-muted capitalize font-medium">
                      {state}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-safe-sidebar rounded-lg p-3.5 border border-safe-success/20 text-sm text-safe-text-muted text-center">
            No lane configuration available
          </div>
        )}

        {/* Action Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-safe-success/20">
          <div className="w-1.5 h-1.5 bg-safe-success rounded-full animate-pulse" />
          <span className="text-[11px] font-semibold text-safe-success uppercase tracking-wide">Ready to Deploy</span>
        </div>
      </div>
    </div>
  );
}

export default FinalDecisionCard;
