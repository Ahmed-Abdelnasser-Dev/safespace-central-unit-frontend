import { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Checkbox from '@/components/ui/Checkbox.jsx';
import Button from '@/components/ui/Button.jsx';
import UnitStatusBadge from './badges/UnitStatusBadge.jsx';
import DispatchConfirmModal from './DispatchConfirmModal.jsx';
import { rankByDistance } from '@/shared/utils/haversine.js';
import { selectDefaultUnitIds } from '../data/dispatchDefaults.js';
import { getUnitTypeIcon } from '../utils/caseFormatters.js';

const UNIT_COORDS = (unit) => ({ latitude: unit.currentLatitude, longitude: unit.currentLongitude });
const NON_TERMINAL = ['notified', 'en_route', 'on_scene'];

function NearestUnitsPanel({
  caseRecord,
  units,
  selectedUnitIds,
  assignments,
  onSelectUnit,
  onDeselectUnit,
  onClearSelectedUnits,
  onDispatch,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);

  const rankedUnits = useMemo(() => {
    if (!caseRecord) return [];
    return rankByDistance(
      units.filter((u) => u.status !== 'off_duty'),
      { latitude: caseRecord.latitude, longitude: caseRecord.longitude },
      UNIT_COORDS
    );
  }, [units, caseRecord]);

  const clearRef = useRef(onClearSelectedUnits);
  const selectRef = useRef(onSelectUnit);
  useEffect(() => { clearRef.current = onClearSelectedUnits; });
  useEffect(() => { selectRef.current = onSelectUnit; });

  useEffect(() => {
    if (!caseRecord?.id) return;
    clearRef.current();
    selectDefaultUnitIds(rankedUnits, caseRecord).forEach((id) => selectRef.current(id));
  }, [caseRecord?.id, rankedUnits]);

  const activelyDispatchedUnitIds = useMemo(
    () => new Set(assignments.filter((a) => NON_TERMINAL.includes(a.status)).map((a) => a.unitId)),
    [assignments]
  );

  const visibleUnits = useMemo(() => {
    if (selectedOnly) return rankedUnits.filter((u) => selectedUnitIds.includes(u.id));
    return rankedUnits;
  }, [rankedUnits, selectedOnly, selectedUnitIds]);

  const selectedUnits = rankedUnits.filter((u) => selectedUnitIds.includes(u.id));

  const handleConfirm = () => {
    onDispatch(caseRecord.id, selectedUnitIds);
    setConfirmOpen(false);
    setSelectedOnly(false);
  };

  if (!caseRecord) return null;

  const hasSelection = selectedUnitIds.length > 0;

  return (
    <div className="flex flex-col bg-safe-gray border border-safe-gray-light rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-safe-gray-light flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-safe-text-primary">Nearest Units</h3>
        <div className="flex items-center gap-2">
          {hasSelection && (
            <button
              type="button"
              onClick={() => setSelectedOnly((v) => !v)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-150 ${
                selectedOnly
                  ? 'bg-safe-blue text-safe-text-primary'
                  : 'bg-safe-gray-light/40 text-white/60 hover:bg-safe-gray-light/30 hover:text-safe-text-primary'
              }`}
            >
              <FontAwesomeIcon icon="check-square" className="mr-1.5 text-[10px]" />
              Selected ({selectedUnitIds.length})
            </button>
          )}
          {rankedUnits.length > 0 && !selectedOnly && (
            <span className="text-xs text-safe-text-muted">{rankedUnits.length} in range</span>
          )}
        </div>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {visibleUnits.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <FontAwesomeIcon icon="truck-medical" className="text-2xl text-safe-text-muted/40 mb-2" />
            <p className="text-safe-text-muted text-sm">
              {selectedOnly ? 'No units selected' : 'No units in range'}
            </p>
            {selectedOnly && (
              <button
                type="button"
                className="text-xs text-safe-blue hover:underline mt-1"
                onClick={() => setSelectedOnly(false)}
              >
                Show all units
              </button>
            )}
          </div>
        ) : (
          <ul role="list" className="divide-y divide-safe-border/20">
            {visibleUnits.map((unit) => {
              const rankIndex = rankedUnits.findIndex((u) => u.id === unit.id);
              const isAlreadyDispatched = activelyDispatchedUnitIds.has(unit.id);
              const isAvailable = unit.status === 'available';
              const isCheckable = isAvailable && !isAlreadyDispatched;
              const isSelected = isCheckable && selectedUnitIds.includes(unit.id);
              const etaMin = Math.max(1, Math.round((unit.distanceKm / 50) * 60));

              return (
                <li
                  key={unit.id}
                  className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${
                    isSelected ? 'bg-safe-blue/8' : ''
                  } ${!isCheckable ? 'opacity-50' : 'cursor-pointer hover:bg-safe-gray-light/30'}`}
                  onClick={
                    isCheckable
                      ? () => (isSelected ? onDeselectUnit(unit.id) : onSelectUnit(unit.id))
                      : undefined
                  }
                >
                  {isCheckable ? (
                    <Checkbox
                      surface="dark"
                      checked={isSelected}
                      onChange={(val) => (val ? onSelectUnit(unit.id) : onDeselectUnit(unit.id))}
                    />
                  ) : (
                    <div className="w-[44px] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-safe-text-muted/50 w-4 flex-shrink-0">
                        {rankIndex + 1}
                      </span>
                      <FontAwesomeIcon
                        icon={getUnitTypeIcon(unit.unitType)}
                        className="text-safe-text-muted text-[11px] flex-shrink-0"
                      />
                      <span className="text-sm font-medium text-safe-text-primary truncate">{unit.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 pl-6">
                      <UnitStatusBadge status={unit.status} />
                      <span className="text-xs text-safe-text-muted font-mono">
                        {unit.distanceKm.toFixed(1)} km · ~{etaMin} min
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="px-4 py-3 border-t border-safe-gray-light bg-safe-gray-light/20 flex-shrink-0">
        <Button
          variant="primary"
          className="w-full"
          disabled={!hasSelection}
          onClick={() => setConfirmOpen(true)}
        >
          {hasSelection ? (
            <>
              <FontAwesomeIcon icon="truck-medical" className="mr-2" />
              Dispatch {selectedUnitIds.length} Unit{selectedUnitIds.length !== 1 ? 's' : ''}
            </>
          ) : (
            'Select units to dispatch'
          )}
        </Button>
      </div>

      <DispatchConfirmModal
        open={confirmOpen}
        selectedUnits={selectedUnits}
        caseRecord={caseRecord}
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default NearestUnitsPanel;
