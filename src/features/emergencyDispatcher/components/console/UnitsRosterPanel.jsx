import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UnitStatusBadge from '../badges/UnitStatusBadge';
import { getUnitTypeIcon, getUnitTypeLabel } from '../../utils/caseFormatters';

const STATUS_GROUPS = [
  { key: 'available',  label: 'Available',  dot: 'bg-safe-success' },
  { key: 'en_route',   label: 'En Route',   dot: 'bg-safe-info' },
  { key: 'on_scene',   label: 'On Scene',   dot: 'bg-safe-orange' },
  { key: 'off_duty',   label: 'Off Duty',   dot: 'bg-safe-text-muted/50' },
];

function UnitRow({ unit, onCenterOnUnit }) {
  return (
    <button
      type="button"
      onClick={() => onCenterOnUnit?.(unit.id)}
      aria-label={`Center map on ${unit.name}, ${getUnitTypeLabel(unit.unitType)}, ${unit.status.replace('_', ' ')}`}
      className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-safe-gray-light/30 transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-safe-blue/40"
    >
      <div className="w-6 h-6 rounded-md bg-safe-gray-light/40 flex items-center justify-center flex-shrink-0">
        <FontAwesomeIcon icon={getUnitTypeIcon(unit.unitType)} className="text-safe-text-muted text-[10px]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-safe-text-primary truncate leading-tight">{unit.name}</p>
        <p className="text-[10px] text-safe-text-muted/75 truncate">{getUnitTypeLabel(unit.unitType)}</p>
      </div>
      <UnitStatusBadge status={unit.status} />
    </button>
  );
}

function StatusGroup({ group, units, onCenterOnUnit }) {
  if (units.length === 0) return null;

  return (
    <div>
      <div className="px-3 py-1.5 flex items-center gap-2 sticky top-0 bg-safe-gray z-10">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${group.dot}`} />
        <span className="text-[10px] font-semibold text-safe-text-muted uppercase tracking-wider">
          {group.label}
        </span>
        <span className="ml-auto font-mono text-[10px] text-safe-text-muted/60">{units.length}</span>
      </div>
      <div className="divide-y divide-safe-gray-light">
        {units.map((unit) => (
          <UnitRow key={unit.id} unit={unit} onCenterOnUnit={onCenterOnUnit} />
        ))}
      </div>
    </div>
  );
}

export default function UnitsRosterPanel({ units, onCenterOnUnit }) {
  const grouped = useMemo(() => {
    return STATUS_GROUPS.map((group) => ({
      group,
      units: units.filter((u) => u.status === group.key),
    }));
  }, [units]);

  const availableCount = grouped.find((g) => g.group.key === 'available')?.units.length ?? 0;
  const totalActive = units.filter((u) => u.status !== 'off_duty').length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-safe-gray">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-safe-gray-light flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-safe-text-primary">Units</h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-safe-success font-mono font-semibold">{availableCount} avail</span>
            <span className="text-safe-border text-xs">/</span>
            <span className="text-[11px] text-safe-text-muted font-mono">{totalActive} active</span>
          </div>
        </div>
      </div>

      {/* Roster list */}
      <div className="flex-1 overflow-y-auto">
        {grouped.map(({ group, units: groupUnits }) => (
          <StatusGroup
            key={group.key}
            group={group}
            units={groupUnits}
            onCenterOnUnit={onCenterOnUnit}
          />
        ))}

        {units.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center px-4">
            <FontAwesomeIcon icon="truck-medical" className="text-2xl text-safe-text-muted/25 mb-2" />
            <p className="text-sm text-safe-text-muted/50">No units available</p>
          </div>
        )}
      </div>

      {/* Footer legend */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-safe-gray-light flex flex-wrap gap-x-3 gap-y-1">
        {STATUS_GROUPS.map((g) => (
          <div key={g.key} className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
            <span className="text-[10px] text-safe-text-muted/55">{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
