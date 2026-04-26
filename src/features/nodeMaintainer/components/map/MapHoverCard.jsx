import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Card from '@/components/ui/Card';
import { getNodeStatusColors, laneStatusConfig, normalizeLaneStatus } from './mapUtils';

function MapHoverCard({ node, position }) {
  if (!node || !position) return null;
  const statusColors = getNodeStatusColors(node.status || 'warning');

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, calc(-100% - 12px))'
      }}
    >
      <Card className="relative border-[#e5e7eb] shadow-xl max-w-[300px] min-w-[240px]">
        <div className="px-4 pt-4 pb-3 border-b border-[#e5e7eb] bg-gradient-to-r from-[#f7f8f9] to-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: statusColors.dot }}
              />
              <h4 className="font-bold text-[#101828] text-sm">
                {node.name}
              </h4>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: statusColors.badgeBg,
                color: statusColors.badgeText
              }}
            >
              {(node.status || 'warning').toUpperCase()}
            </span>
          </div>
          <p className="text-[#6a7282] text-xs mt-2 leading-relaxed">
            {node.location?.address || 'Unknown location'}
          </p>
        </div>

        <div className="px-4 py-3">
          {node.roadRules?.lanes?.length > 0 && (
            <div className="mb-3">
              <div className="text-[#6a7282] text-xs font-medium mb-2">
                Lanes ({node.roadRules.lanes.length})
              </div>
              <div className="flex gap-2 flex-wrap">
                {node.roadRules.lanes.map((lane) => {
                  const laneStatusKey = normalizeLaneStatus(lane.status);
                  const laneStatus = laneStatusConfig[laneStatusKey];

                  return (
                    <span
                      key={lane.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium"
                      style={{ backgroundColor: laneStatus.bg }}
                    >
                      <FontAwesomeIcon
                        icon={laneStatus.icon}
                        className="w-3 h-3"
                        style={{ color: laneStatus.color }}
                      />
                      <span className="text-[#101828]">
                        {lane.name || `Lane ${lane.id}`}
                      </span>
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: laneStatus.color }}
                      >
                        {laneStatus.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {node.roadRules?.speedLimit > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-[#e5e7eb]">
              <span className="text-[#6a7282] text-xs font-medium">Speed Limit</span>
              <span className="font-bold text-[#101828] text-sm">
                {node.roadRules.speedLimit} km/h
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default MapHoverCard;
