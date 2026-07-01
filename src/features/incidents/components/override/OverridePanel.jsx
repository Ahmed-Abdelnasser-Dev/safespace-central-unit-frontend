import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function OverridePanel({
  overrideOpen,
  setOverrideOpen,
  defaultLaneCount,
  laneNames,
  tempLaneConfig,
  setTempLaneConfig,
  laneConfigStates,
  statusConfig,
  tempSpeedLimit,
  setTempSpeedLimit,
  defaultSpeedLimit,
  handleSaveOverride,
  handleCancelOverride
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-bold text-[13px] sm:text-[14px] text-safe-text-gray uppercase tracking-[0.4px]">Override Configuration</h4>
      <div className="border-2 border-safe-orange rounded-lg overflow-hidden bg-safe-orange/5">
        <div className="w-full flex items-center justify-between px-3 py-2.5 bg-safe-orange/20 font-bold text-[13px] sm:text-[14px]">
          <span className="flex items-center gap-2 text-safe-orange">
            <FontAwesomeIcon icon="exclamation" className="w-3 h-3 text-orange-600" />
            Override
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={overrideOpen}
              onChange={e => setOverrideOpen(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-[36px] h-[18px] bg-safe-border rounded-full peer peer-checked:bg-safe-blue-btn transition-colors"></div>
            <div className="absolute left-[2px] top-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform peer-checked:translate-x-[18px]"></div>
          </label>
        </div>

        {overrideOpen && (
          <div className="border-t border-safe-orange/20 p-3 space-y-3 bg-safe-gray">
            <div className="space-y-2.5">
              {Array.from({ length: defaultLaneCount }).map((_, idx) => {
                const currentState = tempLaneConfig[idx] || laneConfigStates[idx] || 'open';
                const states = ['open', 'blocked', 'left', 'right'];

                return (
                  <div key={idx} className="space-y-1.5">
                    <label className="font-bold text-[11px] sm:text-[12px] text-safe-text-primary block">{laneNames[idx] || `Lane ${idx + 1}`}</label>
                    <div className="grid grid-cols-4 gap-1">
                      {states.map(state => {
                        const config = statusConfig[state];
                        return (
                          <button
                            key={state}
                            onClick={() => {
                              const nextConfig = [...tempLaneConfig];
                              nextConfig[idx] = state;
                              setTempLaneConfig(nextConfig);
                            }}
                            className={`py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-[3px] border ${
                              currentState === state
                                ? 'border-2 border-safe-blue-btn text-white'
                                : 'bg-safe-gray border border-safe-border text-safe-text-muted hover:bg-safe-gray-light/50'
                            }`}
                            style={{
                              backgroundColor: currentState === state ? config.color : undefined
                            }}
                          >
                            <FontAwesomeIcon
                              icon={config.icon}
                              className="w-3 h-3"
                            />
                            <span>{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 border-t border-safe-border pt-2.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-[12px] sm:text-[13px] text-safe-text-primary">New Speed Limit</label>
                <span className="px-2 py-0.5 rounded-sm font-bold text-[11px] bg-safe-danger/10 text-safe-danger">{tempSpeedLimit} km/h</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={tempSpeedLimit}
                onChange={e => setTempSpeedLimit(parseInt(e.target.value))}
                className="w-full accent-safe-blue-btn cursor-pointer"
              />
              <p className="text-[11px] text-safe-text-gray">Default: {defaultSpeedLimit} km/h</p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-safe-border">
              <button
                onClick={handleSaveOverride}
                className="flex-1 px-3 py-2 bg-safe-blue-btn text-white rounded-md font-bold text-[12px] sm:text-[13px] hover:bg-safe-blue-btn/80 transition-colors flex items-center justify-center gap-1.5"
              >
                <FontAwesomeIcon icon="save" className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={handleCancelOverride}
                className="flex-1 px-3 py-2 bg-safe-gray text-safe-text-primary rounded-md font-bold text-[12px] sm:text-[13px] border border-safe-border hover:bg-safe-gray-light/50 transition-colors flex items-center justify-center gap-1.5"
              >
                <FontAwesomeIcon icon="times" className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {!overrideOpen && (
          <div className="border-t border-safe-orange/20 p-3 bg-safe-gray">
            <div className="text-[12px] text-safe-text-gray">Override is off. Toggle to edit lane states and speed.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverridePanel;
