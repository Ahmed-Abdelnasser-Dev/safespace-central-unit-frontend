import { Marker } from 'react-map-gl/maplibre';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const STATION_CONFIG = {
  ambulance:        { color: '#10b981', icon: 'truck-medical',      typeLabel: 'Medical' },
  police:           { color: '#3b7cff', icon: 'shield-halved',      typeLabel: 'Police' },
  fire:             { color: '#fb923c', icon: 'fire-flame-curved',  typeLabel: 'Fire' },
  civil_protection: { color: '#8b5cf6', icon: 'hard-hat',           typeLabel: 'Civil' },
};

export default function StationMarker({ station }) {
  const cfg = STATION_CONFIG[station.stationType] ?? { color: '#64748b', icon: 'house-chimney', typeLabel: 'Station' };
  const label = station.shortName ?? station.name;

  return (
    <Marker longitude={station.longitude} latitude={station.latitude} anchor="bottom">
      <div
        className="flex flex-col items-center cursor-default select-none"
        title={station.name}
        aria-label={`${station.name} — ${cfg.typeLabel} station`}
        role="img"
      >
        {/* Building badge — rectangular, clearly ≠ UnitMarker circles */}
        <div
          className="rounded overflow-hidden shadow-lg"
          style={{
            border: `1px solid ${cfg.color}40`,
            minWidth: 72,
          }}
        >
          {/* Colored top strip identifies station type */}
          <div style={{ height: 3, backgroundColor: cfg.color }} />
          {/* Content row */}
          <div
            className="flex items-center gap-1.5 px-2 py-1"
            style={{ backgroundColor: 'rgba(18, 24, 38, 0.94)' }}
          >
            <FontAwesomeIcon
              icon={cfg.icon}
              style={{ color: cfg.color, fontSize: 8, flexShrink: 0 }}
            />
            <span
              className="text-safe-text-primary leading-none whitespace-nowrap"
              style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}
            >
              {label}
            </span>
          </div>
        </div>
        {/* Pin stem */}
        <div style={{ width: 1, height: 8, backgroundColor: cfg.color, opacity: 0.65 }} />
        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: cfg.color }} />
      </div>
    </Marker>
  );
}
