import { Popup } from 'react-map-gl/maplibre';
import UnitStatusBadge from './badges/UnitStatusBadge';
import { getUnitTypeLabel } from '../utils/caseFormatters';

const ASSUMED_AVERAGE_SPEED_KMH = 50;

function estimateEtaMinutes(distanceKm) {
  return Math.max(1, Math.round((distanceKm / ASSUMED_AVERAGE_SPEED_KMH) * 60));
}

/**
 * Popover shown when a unit marker is clicked — name, type, status,
 * distance, and a rough ETA (straight-line distance / an assumed average
 * speed; there is no routing service in this system, see research.md).
 */
function UnitPopover({ unit, distanceKm, onClose }) {
  if (unit.currentLatitude == null || unit.currentLongitude == null) return null;

  return (
    <Popup
      longitude={unit.currentLongitude}
      latitude={unit.currentLatitude}
      anchor="bottom"
      onClose={onClose}
      closeButton
      closeOnClick={false}
      className="emergency-dispatcher-unit-popover"
    >
      <div className="min-w-[190px]">
        <p className="text-sm font-semibold text-safe-text-primary mb-0.5">{unit.name}</p>
        <p className="text-xs text-safe-text-muted mb-2">{getUnitTypeLabel(unit.unitType)}</p>
        <UnitStatusBadge status={unit.status} />
        {typeof distanceKm === 'number' && (
          <p className="text-xs text-safe-text-muted mt-2 font-mono">
            {distanceKm.toFixed(1)} km · ~{estimateEtaMinutes(distanceKm)} min ETA
          </p>
        )}
        {unit.homeBase?.name && (
          <p className="text-[10px] text-safe-text-muted/50 mt-1.5 flex items-center gap-1">
            <span>⌂</span> {unit.homeBase.name}
          </p>
        )}
      </div>
    </Popup>
  );
}

export default UnitPopover;
