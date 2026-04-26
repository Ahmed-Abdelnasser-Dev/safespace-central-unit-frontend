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
    <div className="space-y-[10px]">
      <div className="flex items-center gap-[8px]">
        <FontAwesomeIcon icon={faCheckCircle} className="text-[#16a34a] text-[14px]" />
        <h4 className="font-bold text-[14px] sm:text-[15px] text-[#101828]">Final Decision</h4>
        <span className="ml-auto text-[10px] font-semibold px-[8px] py-[2px] rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center gap-[4px]">
          <FontAwesomeIcon icon={faPaperPlane} className="text-[8px]" />
          TO NODE
        </span>
      </div>
      <div className="p-[16px] border-2 border-[#bbf7d0] rounded-[12px] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] space-y-[14px] shadow-sm">
        {/* Speed Limit */}
        <div className="bg-white rounded-[10px] p-[14px] border border-[#d1fae5] shadow-sm">
          <div className="flex items-center gap-[8px] mb-[8px]">
            <FontAwesomeIcon icon={faGaugeHigh} className="text-[#16a34a] text-[12px]" />
            <span className="text-[11px] font-semibold text-[#166534] uppercase tracking-wide">Speed Limit</span>
          </div>
          <div className="flex items-center gap-[8px]">
            <span className="text-[28px] font-bold text-[#101828]">{speedLimit}</span>
            <span className="text-[14px] font-semibold text-[#6a7282]">km/h</span>
          </div>
        </div>

        {/* Lane Configuration */}
        {hasLanes ? (
          <div className="bg-white rounded-[10px] p-[14px] border border-[#d1fae5] shadow-sm">
            <div className="flex items-center gap-[8px] mb-[10px]">
              <FontAwesomeIcon icon={faRoad} className="text-[#16a34a] text-[12px]" />
              <span className="text-[11px] font-semibold text-[#166534] uppercase tracking-wide">Lane Configuration</span>
            </div>
            <div className="flex gap-[10px] justify-center flex-wrap">
              {safeLaneConfig.map((state, i) => {
                const config = statusConfig[state] || statusConfig.open || { icon: faCircleCheck, color: '#22c55e', bg: '#dcfce7' };
                return (
                  <div key={i} className="text-center">
                    <div 
                      className="flex items-center justify-center w-[50px] h-[50px] rounded-[10px] border-2 border-[#16a34a] shadow-md transition-transform hover:scale-105"
                      style={{ backgroundColor: config.bg }}
                    >
                      <FontAwesomeIcon
                        icon={config.icon}
                        style={{
                          color: config.color,
                          width: '20px',
                          height: '20px'
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-[#101828] mt-[6px] font-bold">
                      {paddedLaneNames[i] || `Lane ${i + 1}`}
                    </p>
                    <p className="text-[9px] text-[#6a7282] capitalize font-medium">
                      {state}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] p-[14px] border border-[#d1fae5] text-[12px] text-[#6a7282] text-center">
            No lane configuration available
          </div>
        )}

        {/* Action Indicator */}
        <div className="flex items-center justify-center gap-[8px] pt-[8px] border-t border-[#bbf7d0]">
          <div className="w-[6px] h-[6px] bg-[#16a34a] rounded-full animate-pulse" />
          <span className="text-[11px] font-semibold text-[#166534] uppercase tracking-wide">Ready to Deploy</span>
        </div>
      </div>
    </div>
  );
}

export default FinalDecisionCard;
