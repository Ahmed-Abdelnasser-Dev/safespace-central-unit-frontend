import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';

function DecisionCard({
  originalSpeedLimit = 80,
  newSpeedLimit = 80,
  originalLaneStates = [],
  newLaneStates = [],
  laneNames = [],
  statusConfig = {},
  finalSpeedLimit = 80,
  finalLaneStates = []
}) {
  // Ensure all arrays are valid and same length
  const safeOriginalStates = Array.isArray(originalLaneStates) ? originalLaneStates : [];
  const safeNewStates = Array.isArray(newLaneStates) ? newLaneStates : [];
  const safeFinalStates = Array.isArray(finalLaneStates) && finalLaneStates.length > 0 ? finalLaneStates : safeNewStates;
  const safeLaneNames = Array.isArray(laneNames) ? laneNames : [];
  const maxLength = Math.max(safeOriginalStates.length, safeNewStates.length, safeFinalStates.length, safeLaneNames.length);
  
  // Pad arrays to same length if needed
  const paddedOriginalStates = Array.from({ length: maxLength }, (_, i) => safeOriginalStates[i] || 'open');
  const paddedAiStates = Array.from({ length: maxLength }, (_, i) => safeNewStates[i] || 'open');
  const paddedFinalStates = Array.from({ length: maxLength }, (_, i) => safeFinalStates[i] || 'open');
  const paddedLaneNames = Array.from({ length: maxLength }, (_, i) => safeLaneNames[i] || `Lane ${i + 1}`);
  
  const aiSpeedReduction = originalSpeedLimit - newSpeedLimit;
  const finalSpeedReduction = originalSpeedLimit - finalSpeedLimit;
  const isModified = finalSpeedLimit !== newSpeedLimit || paddedFinalStates.some((state, i) => state !== paddedAiStates[i]);
  
  // Return early if no data
  if (maxLength === 0) {
    return (
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px]">
        <div className="py-[20px] text-center text-[13px] text-[#9ca3af]">
          No decision data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[8px] overflow-hidden">
      

      <div className="p-[16px]">
        <div className="grid grid-cols-2 gap-[16px]">
          {/* AI Suggestion Column */}
          <div className="space-y-[12px]">
            <div className="flex items-center gap-[8px] pb-[8px] border-b border-[#e5e7eb]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#3b82f6]" />
              <h4 className="text-[12px] font-semibold text-[#3b82f6] uppercase tracking-wide">
                AI Suggests
              </h4>
            </div>
            
            {/* Speed Limit */}
            <div>
              <div className="text-[11px] text-[#6b7280] mb-[4px]">Speed Limit</div>
              <div className="flex items-baseline gap-[6px]">
                <span className="text-[24px] font-bold text-[#111827]">{newSpeedLimit}</span>
                <span className="text-[14px] text-[#6b7280]">km/h</span>
                {aiSpeedReduction > 0 && (
                  <span className="text-[12px] font-medium text-[#ef4444] ml-[4px]">
                    -{aiSpeedReduction}
                  </span>
                )}
              </div>
            </div>
            
            {/* Lanes */}
            <div>
              <div className="text-[11px] text-[#6b7280] mb-[6px]">Lanes</div>
              <div className="space-y-[6px]">
                {paddedLaneNames.map((name, i) => {
                  const aiState = paddedAiStates[i];
                  const currentState = paddedOriginalStates[i];
                  const hasChanged = currentState !== aiState;
                  const aiConfig = statusConfig[aiState] || { icon: faCircleCheck, color: '#22c55e', bg: '#dcfce7' };
                  
                  return (
                    <div key={i} className="flex items-center gap-[8px]">
                      <span className="text-[12px] text-[#6b7280] w-[60px] flex-shrink-0">
                        {name}
                      </span>
                      <div className={`flex items-center gap-[6px] flex-1 px-[10px] py-[6px] rounded-[6px] ${
                        hasChanged ? 'bg-[#eff6ff] border border-[#3b82f6]' : 'bg-[#f9fafb]'
                      }`}>
                        <div 
                          className="w-[20px] h-[20px] rounded-[4px] flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: aiConfig.bg }}
                        >
                          <FontAwesomeIcon icon={aiConfig.icon} style={{ color: aiConfig.color, width: '10px', height: '10px' }} />
                        </div>
                        <span className={`text-[13px] capitalize ${
                          hasChanged ? 'font-semibold text-[#111827]' : 'text-[#6b7280]'
                        }`}>
                          {aiState}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Final Decision Column */}
          <div className="space-y-[12px]">
            <div className="flex items-center gap-[8px] pb-[8px] border-b border-[#e5e7eb]">
              <FontAwesomeIcon icon={faCircleCheck} className="text-[#10b981]" size="sm" />
              <h4 className="text-[12px] font-semibold text-[#10b981] uppercase tracking-wide">
                Final Decision
              </h4>
            </div>
            
            {/* Speed Limit */}
            <div>
              <div className="text-[11px] text-[#6b7280] mb-[4px]">Speed Limit</div>
              <div className="flex items-baseline gap-[6px]">
                <span className="text-[24px] font-bold text-[#111827]">{finalSpeedLimit}</span>
                <span className="text-[14px] text-[#6b7280]">km/h</span>
                {finalSpeedReduction > 0 && (
                  <span className="text-[12px] font-medium text-[#ef4444] ml-[4px]">
                    -{finalSpeedReduction}
                  </span>
                )}
                {finalSpeedLimit !== newSpeedLimit && (
                  <span className="text-[11px] font-medium text-[#10b981] bg-[#d1fae5] px-[6px] py-[2px] rounded ml-[4px]">
                    Edited
                  </span>
                )}
              </div>
            </div>
            
            {/* Lanes */}
            <div>
              <div className="text-[11px] text-[#6b7280] mb-[6px]">Lanes</div>
              <div className="space-y-[6px]">
                {paddedLaneNames.map((name, i) => {
                  const finalState = paddedFinalStates[i];
                  const aiState = paddedAiStates[i];
                  const wasModified = finalState !== aiState;
                  const finalConfig = statusConfig[finalState] || { icon: faCircleCheck, color: '#22c55e', bg: '#dcfce7' };
                  
                  return (
                    <div key={i} className="flex items-center gap-[8px]">
                      <span className="text-[12px] text-[#6b7280] w-[60px] flex-shrink-0">
                        {name}
                      </span>
                      <div className={`flex items-center gap-[6px] flex-1 px-[10px] py-[6px] rounded-[6px] ${
                        wasModified ? 'bg-[#d1fae5] border border-[#10b981]' : 'bg-[#f9fafb]'
                      }`}>
                        <div 
                          className="w-[20px] h-[20px] rounded-[4px] flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: finalConfig.bg }}
                        >
                          <FontAwesomeIcon icon={finalConfig.icon} style={{ color: finalConfig.color, width: '10px', height: '10px' }} />
                        </div>
                        <span className="text-[13px] font-semibold capitalize text-[#111827]">
                          {finalState}
                        </span>
                        {wasModified && (
                          <span className="ml-auto text-[10px] font-medium text-[#10b981] bg-white px-[6px] py-[2px] rounded">
                            Edited
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecisionCard;
