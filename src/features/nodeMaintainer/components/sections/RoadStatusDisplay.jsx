/**
 * Road Status Display Component
 * 
 * Visual display panel showing road name, speed limit, and lane statuses
 * Used in RoadConfigTab and MapOverview
 * 
 * @component
 * @param {string} roadName - Road/node name or address
 * @param {number} speedLimit - Current speed limit in km/h
 * @param {Array} lanes - Array of lane objects with id, name, type, status
 * @param {Array} laneStatusOptions - Status configuration (icon, color, bg, label)
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function RoadStatusDisplay({ 
  roadName, 
  speedLimit, 
  lanes = [], 
  laneStatusOptions 
}) {
  const fontFamily = 'Arimo, sans-serif';

  return (
    <div className="rounded-[8px] sm:rounded-[10px] lg:rounded-[12px] border border-[#e5e7eb] bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1220] p-[12px] sm:p-[14px] md:p-[16px] lg:p-[18px]">
      {/* Header: Road Name + Speed Limit */}
      <div className="flex flex-wrap items-center justify-between gap-[8px] sm:gap-[10px] lg:gap-[12px]">
        <div className="space-y-[2px] sm:space-y-[3px] lg:space-y-[4px]">
          <p
            className="text-white/70 font-semibold"
            style={{ fontSize: "clamp(11px, 1.1vw, 13px)", fontFamily }}
          >
            Road
          </p>
          <p
            className="text-white font-bold"
            style={{ fontSize: "clamp(14px, 1.8vw, 22px)", fontFamily }}
          >
            {roadName}
          </p>
        </div>
        <div className="flex items-center gap-[6px] sm:gap-[8px] px-[10px] sm:px-[12px] lg:px-[14px] py-[8px] lg:py-[10px] rounded-full bg-white/10 border border-white/15 flex-shrink-0">
          <span
            className="text-white/70 font-semibold"
            style={{ fontSize: "clamp(11px, 1.1vw, 13px)", fontFamily }}
          >
            Speed
          </span>
          <span
            className="text-white font-bold"
            style={{ fontSize: "clamp(16px, 2vw, 22px)", fontFamily }}
          >
            {speedLimit}
          </span>
          <span
            className="text-white/70"
            style={{ fontSize: "clamp(11px, 1vw, 14px)", fontFamily }}
          >
            km/h
          </span>
        </div>
      </div>

      {/* Lanes Display */}
      <div className="mt-[12px] sm:mt-[14px] lg:mt-[16px] flex flex-row gap-[8px] justify-center sm:gap-[10px] lg:gap-[12px] overflow-x-auto pb-[4px]">
        {lanes.length > 0 ? (
          lanes.map((lane) => {
            const status =
              laneStatusOptions.find((opt) => opt.value === lane.status) ||
              laneStatusOptions[0];
            return (
              <div
                key={lane.id}
                className="rounded-[8px] sm:rounded-[10px] lg:rounded-[12px] border border-white/10 bg-white/5 px-[10px] sm:px-[12px] lg:px-[14px] py-[12px] sm:py-[14px] lg:py-[16px] transition-all hover:border-white/20 hover:bg-white/8 flex-shrink-0 w-[120px] sm:w-[140px] lg:w-[160px]"
              >
                <div className="grid grid-cols-1 gap-[8px] sm:gap-[10px] lg:gap-[12px]">
                  {/* Status Icon */}
                  <div className="rounded-[6px] sm:rounded-[8px] lg:rounded-[10px] border border-white/10 bg-white/5 px-[8px] sm:px-[10px] py-[10px] sm:py-[12px] text-center transition-all">
                    <div
                      className="mx-auto mb-[8px] sm:mb-[10px] rounded-full flex items-center justify-center"
                      style={{
                        width: "clamp(40px, 8vw, 52px)",
                        height: "clamp(40px, 8vw, 52px)",
                        backgroundColor: status.bg,
                        color: status.color,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={status.icon}
                        style={{
                          width: "clamp(16px, 3vw, 24px)",
                          height: "clamp(16px, 3vw, 24px)",
                        }}
                      />
                    </div>
                    <span
                      className="text-white/80 block font-medium"
                      style={{
                        fontSize: "clamp(10px, 1vw, 12px)",
                        fontFamily,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Lane Name & Type */}
                  <div className="rounded-[6px] sm:rounded-[8px] lg:rounded-[10px] border border-white/10 bg-white/5 px-[8px] sm:px-[10px] py-[10px] sm:py-[12px] text-center transition-all">
                    <span
                      className="text-white font-bold block"
                      style={{
                        fontSize: "clamp(12px, 1.3vw, 16px)",
                        fontFamily,
                      }}
                    >
                      {lane.name}
                    </span>
                    <span
                      className="text-white/70 block mt-[6px] sm:mt-[8px]"
                      style={{
                        fontSize: "clamp(10px, 1vw, 12px)",
                        fontFamily,
                      }}
                    >
                      {lane.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[8px] border border-white/10 bg-white/5 px-[10px] sm:px-[12px] py-[8px] sm:py-[10px]">
            <p
              className="text-white/70"
              style={{ fontSize: "clamp(11px, 1vw, 14px)", fontFamily }}
            >
              No lanes configured
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoadStatusDisplay;
