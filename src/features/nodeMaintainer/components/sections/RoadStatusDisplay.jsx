import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function RoadStatusDisplay({ roadName, speedLimit, lanes = [], laneStatusOptions }) {
  return (
    <div className="rounded-xl border border-safe-border bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1220] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs text-white/70 font-semibold">Road</p>
          <p className="text-lg font-bold text-white">{roadName}</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/15 flex-shrink-0">
          <span className="text-xs text-white/70 font-semibold">Speed</span>
          <span className="text-xl font-bold text-white">{speedLimit}</span>
          <span className="text-xs text-white/70">km/h</span>
        </div>
      </div>

      <div className="mt-4 flex flex-row gap-2.5 justify-center overflow-x-auto pb-1">
        {lanes.length > 0 ? (
          lanes.map((lane) => {
            const status = laneStatusOptions.find((opt) => opt.value === lane.status) || laneStatusOptions[0];
            return (
              <div
                key={lane.id}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3.5 transition-all hover:border-white/20 flex-shrink-0 w-[130px]"
              >
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-3 text-center">
                    <div
                      className="w-11 h-11 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: status.bg, color: status.color }}
                    >
                      <FontAwesomeIcon icon={status.icon} className="text-base" />
                    </div>
                    <span className="text-[10px] text-white/80 block font-medium">{status.label}</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-3 text-center">
                    <span className="text-sm font-bold text-white block">{lane.name}</span>
                    <span className="text-[10px] text-white/70 block mt-1.5">{lane.type}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-xs text-white/70">No lanes configured</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoadStatusDisplay;
