import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UNIT_TYPES = [
  { value: 'ambulance', label: 'Ambulance', icon: 'truck-medical' },
  { value: 'police', label: 'Police', icon: 'shield-halved' },
  { value: 'fire', label: 'Fire', icon: 'fire-extinguisher' },
  { value: 'civil_protection', label: 'Rescue', icon: 'person-falling-burst' },
];

function MapControls({
  unitFilter,
  onFilterChange,
  showRings,
  onToggleRings,
  onZoomToIncident,
  onZoomToAllUnits,
  onZoomIn,
  onZoomOut,
}) {
  function toggleType(type) {
    const nextTypes = unitFilter.types.includes(type)
      ? unitFilter.types.filter((t) => t !== type)
      : [...unitFilter.types, type];
    onFilterChange({ types: nextTypes });
  }

  const btnBase =
    'h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none';
  const btnActive = 'bg-safe-blue text-safe-text-primary shadow-sm';
  const btnInactive = 'bg-safe-gray-light/40 text-safe-text-muted hover:bg-safe-gray-light/30 hover:text-safe-text-primary';
  const iconBtn =
    'w-8 h-8 flex items-center justify-center rounded-lg text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/30 transition-all duration-150';

  return (
    <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 pointer-events-none min-w-0">
      {/* Filter bar — glass pill; min-w-0 lets it shrink so zoom controls always stay visible */}
      <div className="min-w-0 flex-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-safe-dark/90 backdrop-blur-sm border border-safe-gray-light rounded-xl shadow-xl pointer-events-auto overflow-x-auto scrollbar-none">
        <FontAwesomeIcon icon="filter" className="text-[9px] text-safe-text-muted/60 flex-shrink-0" />

        {UNIT_TYPES.map((type) => {
          const isActive = unitFilter.types.includes(type.value);
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => toggleType(type.value)}
              className={`${btnBase} ${isActive ? btnActive : btnInactive} flex-shrink-0`}
            >
              <FontAwesomeIcon icon={type.icon} className="text-[10px]" />
              {type.label}
            </button>
          );
        })}

        <div className="w-px h-5 bg-safe-gray-light/50 flex-shrink-0 mx-0.5" />

        <button
          type="button"
          onClick={() => onFilterChange({ availableOnly: !unitFilter.availableOnly })}
          className={`${btnBase} ${unitFilter.availableOnly ? btnActive : btnInactive} flex-shrink-0`}
        >
          <FontAwesomeIcon icon="circle-check" className="text-[10px]" />
          Available
        </button>

        <button
          type="button"
          onClick={() => onToggleRings(!showRings)}
          className={`${btnBase} ${showRings ? btnActive : btnInactive} flex-shrink-0`}
        >
          <FontAwesomeIcon icon="circle-radiation" className="text-[10px]" />
          Rings
        </button>
      </div>

      {/* Map action buttons — glass pill */}
      <div className="flex items-center bg-safe-dark/90 backdrop-blur-sm border border-safe-gray-light rounded-xl shadow-xl pointer-events-auto flex-shrink-0 overflow-hidden divide-x divide-safe-gray-light">
        <button type="button" onClick={onZoomIn} title="Zoom in" className={iconBtn}>
          <FontAwesomeIcon icon="plus" className="text-xs" />
        </button>
        <button type="button" onClick={onZoomOut} title="Zoom out" className={iconBtn}>
          <FontAwesomeIcon icon="minus" className="text-xs" />
        </button>
        <button type="button" onClick={onZoomToIncident} title="Center on incident" className={iconBtn}>
          <FontAwesomeIcon icon="location-crosshairs" className="text-xs" />
        </button>
        <button type="button" onClick={onZoomToAllUnits} title="Fit all units" className={iconBtn}>
          <FontAwesomeIcon icon="expand" className="text-xs" />
        </button>
      </div>
    </div>
  );
}

export default MapControls;
