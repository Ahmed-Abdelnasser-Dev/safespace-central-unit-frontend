import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

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
  // Return early if no data
  if (maxLength === 0) {
    return (
      <div className="bg-safe-sidebar border border-safe-border rounded-lg p-4">
        <div className="py-5 text-center text-sm text-safe-text-muted">
          No decision data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-safe-sidebar border border-safe-border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* AI Suggestion Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-safe-border">
              <div className="w-1.5 h-1.5 rounded-full bg-safe-blue" />
              <h4 className="text-[12px] font-semibold text-safe-blue uppercase tracking-wide">
                AI Suggests
              </h4>
            </div>

            {/* Speed Limit */}
            <div>
              <div className="text-[11px] text-safe-text-muted mb-1">Speed Limit</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-safe-text-primary">{newSpeedLimit}</span>
                <span className="text-sm text-safe-text-muted">km/h</span>
                {aiSpeedReduction > 0 && (
                  <span className="text-[12px] font-medium text-safe-danger ml-1">
                    -{aiSpeedReduction}
                  </span>
                )}
              </div>
            </div>

            {/* Lanes */}
            <div>
              <div className="text-[11px] text-safe-text-muted mb-1.5">Lanes</div>
              <div className="space-y-1.5">
                {paddedLaneNames.map((name, i) => {
                  const aiState = paddedAiStates[i];
                  const currentState = paddedOriginalStates[i];
                  const hasChanged = currentState !== aiState;
                  const aiConfig = statusConfig[aiState] || { icon: faCircleCheck, color: 'rgb(var(--color-safe-success))', bg: 'rgba(var(--color-safe-success), 0.12)' };

                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[12px] text-safe-text-muted w-[60px] flex-shrink-0">
                        {name}
                      </span>
                      <div className={`flex items-center gap-1.5 flex-1 px-2.5 py-1.5 rounded-md ${
                        hasChanged ? 'bg-safe-blue/10 border border-safe-blue' : 'bg-safe-gray'
                      }`}>
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: aiConfig.bg }}
                        >
                          <FontAwesomeIcon icon={aiConfig.icon} style={{ color: aiConfig.color, width: '10px', height: '10px' }} />
                        </div>
                        <span className={`text-[13px] capitalize ${
                          hasChanged ? 'font-semibold text-safe-text-primary' : 'text-safe-text-muted'
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
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-safe-border">
              <FontAwesomeIcon icon={faCircleCheck} className="text-safe-success" size="sm" />
              <h4 className="text-[12px] font-semibold text-safe-success uppercase tracking-wide">
                Final Decision
              </h4>
            </div>

            {/* Speed Limit */}
            <div>
              <div className="text-[11px] text-safe-text-muted mb-1">Speed Limit</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-safe-text-primary">{finalSpeedLimit}</span>
                <span className="text-sm text-safe-text-muted">km/h</span>
                {finalSpeedReduction > 0 && (
                  <span className="text-[12px] font-medium text-safe-danger ml-1">
                    -{finalSpeedReduction}
                  </span>
                )}
                {finalSpeedLimit !== newSpeedLimit && (
                  <span className="text-[11px] font-medium text-safe-success bg-safe-success/15 px-1.5 py-0.5 rounded ml-1">
                    Edited
                  </span>
                )}
              </div>
            </div>

            {/* Lanes */}
            <div>
              <div className="text-[11px] text-safe-text-muted mb-1.5">Lanes</div>
              <div className="space-y-1.5">
                {paddedLaneNames.map((name, i) => {
                  const finalState = paddedFinalStates[i];
                  const aiState = paddedAiStates[i];
                  const wasModified = finalState !== aiState;
                  const finalConfig = statusConfig[finalState] || { icon: faCircleCheck, color: 'rgb(var(--color-safe-success))', bg: 'rgba(var(--color-safe-success), 0.12)' };

                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[12px] text-safe-text-muted w-[60px] flex-shrink-0">
                        {name}
                      </span>
                      <div className={`flex items-center gap-1.5 flex-1 px-2.5 py-1.5 rounded-md ${
                        wasModified ? 'bg-safe-success/10 border border-safe-success' : 'bg-safe-gray'
                      }`}>
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: finalConfig.bg }}
                        >
                          <FontAwesomeIcon icon={finalConfig.icon} style={{ color: finalConfig.color, width: '10px', height: '10px' }} />
                        </div>
                        <span className="text-[13px] font-semibold capitalize text-safe-text-primary">
                          {finalState}
                        </span>
                        {wasModified && (
                          <span className="ml-auto text-[10px] font-medium text-safe-success bg-safe-success/15 px-1.5 py-0.5 rounded">
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
