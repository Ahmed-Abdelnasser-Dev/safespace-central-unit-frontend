import { Marker } from 'react-map-gl/maplibre';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getUnitTypeIcon } from '../utils/caseFormatters';

// Same semantic-state color vocabulary as caseFormatters' Badge variants
// (success/info/accent/neutral), expressed as marker-dot hex since MapLibre
// markers render outside Tailwind's class pipeline.
const STATUS_DOT_COLOR = {
  available: '#10b981', // safe-success
  en_route: '#0ea5e9', // safe-info
  on_scene: '#ff6b35', // safe-accent
  off_duty: '#64748b', // safe-text-gray
};

/**
 * A single emergency unit marker on the DispatchMap — type icon inside a
 * status-colored dot. `isHomeBase` renders a smaller, muted variant for a
 * unit's home base location.
 */
function UnitMarker({ unit, isHomeBase = false, isSelected = false, onSelect }) {
  const latitude = isHomeBase ? unit.homeBase.latitude : unit.currentLatitude;
  const longitude = isHomeBase ? unit.homeBase.longitude : unit.currentLongitude;
  if (latitude == null || longitude == null) return null;

  const color = isHomeBase ? '#64748b' : STATUS_DOT_COLOR[unit.status] ?? '#64748b';
  const size = isHomeBase ? 22 : 32;

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onSelect?.(unit.id);
      }}
    >
      <div
        className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:scale-100 ${
          isSelected ? 'scale-125 motion-reduce:ring-2 motion-reduce:ring-white' : 'hover:scale-110'
        } ${isHomeBase ? 'opacity-60' : ''}`}
        style={{ width: size, height: size, backgroundColor: color }}
        role="button"
        aria-label={`${unit.name}${isHomeBase ? ' home base' : ''}`}
      >
        <FontAwesomeIcon icon={getUnitTypeIcon(unit.unitType)} className="text-safe-text-primary" style={{ fontSize: size * 0.45 }} />
      </div>
    </Marker>
  );
}

export default UnitMarker;
