import { Marker } from 'react-map-gl/maplibre';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TYPE_CONFIG = {
  sos: {
    icon: 'phone',
    bgColor: '#ef4444',     // safe-danger
    ringColor: 'rgba(239,68,68,0.35)',
  },
  incident: {
    icon: 'triangle-exclamation',
    bgColor: '#fb923c',     // safe-orange
    ringColor: 'rgba(251,146,60,0.35)',
  },
};

const SEVERITY_SCALE = { HIGH: 1, MEDIUM: 0.88, LOW: 0.76 };

export default function CaseMarker({ caseRecord, isSelected, isMapHighlighted, onClick }) {
  const cfg = TYPE_CONFIG[caseRecord.caseType] ?? TYPE_CONFIG.incident;
  const scale = SEVERITY_SCALE[caseRecord.severity] ?? 0.88;
  const size = Math.round(34 * scale);

  return (
    <Marker
      longitude={caseRecord.longitude}
      latitude={caseRecord.latitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(caseRecord.id);
      }}
    >
      <div className="flex flex-col items-center cursor-pointer group" aria-label={`Case ${caseRecord.id}`}>
        {/* Outer ring — shown when selected or map-highlighted */}
        {(isSelected || isMapHighlighted) && (
          <div
            className="absolute rounded-full animate-pulse-glow motion-reduce:animate-none"
            style={{
              width: size + 14,
              height: size + 14,
              top: -7,
              backgroundColor: 'transparent',
              border: `2px solid ${cfg.bgColor}`,
              opacity: 0.7,
            }}
          />
        )}

        {/* Unread pulse ring */}
        {caseRecord.isUnread && (
          <span
            className="absolute rounded-full opacity-60 animate-ping motion-reduce:animate-none"
            style={{ width: size + 8, height: size + 8, top: -4, backgroundColor: cfg.bgColor }}
          />
        )}

        {/* Main dot */}
        <div
          className="relative flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform duration-150 group-hover:scale-110 motion-reduce:group-hover:scale-100"
          style={{ width: size, height: size, backgroundColor: cfg.bgColor }}
        >
          <FontAwesomeIcon icon={cfg.icon} className="text-white" style={{ fontSize: size * 0.4 }} />
        </div>

        {/* Pin stem */}
        <div className="w-0.5 h-2.5" style={{ backgroundColor: cfg.bgColor, marginTop: -1 }} />
      </div>
    </Marker>
  );
}
