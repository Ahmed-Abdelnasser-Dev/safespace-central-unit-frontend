/**
 * Default emergency-unit-type selection per case/emergency type.
 *
 * Mirrors the dispatch-set logic from the approved design brief (§12 Default
 * Dispatch Set), itself an echo of the existing Central Unit SOS intake
 * logic. Pre-selection picks the nearest *available* unit of each required
 * type; the dispatcher can always override before confirming (FR-008).
 */

const UNSPECIFIED_SET = ['ambulance', 'police', 'civil_protection'];

const SOS_TYPE_TO_UNITS = {
  MEDICAL: ['ambulance'],
  FIRE: ['ambulance', 'fire'],
  POLICE: ['ambulance', 'police'],
  ROAD_ACCIDENT: ['ambulance', 'police', 'civil_protection'],
  UNSPECIFIED: UNSPECIFIED_SET,
};

const INCIDENT_TYPE_TO_UNITS = {
  COLLISION: ['ambulance', 'police', 'civil_protection'],
  STOPPED_VEHICLE: ['police'],
  ROAD_HAZARD: ['police', 'civil_protection'],
  UNSPECIFIED: UNSPECIFIED_SET,
};

/**
 * Returns the list of unit types that should be pre-selected for a case.
 * Unrecognized/missing types fall back to the same set as UNSPECIFIED —
 * "send everything relevant" is the safer default than "send nothing".
 *
 * @param {{ caseType: 'sos' | 'incident', emergencyType?: string, incidentType?: string }} caseRecord
 * @returns {string[]} unit types, e.g. ['ambulance', 'police']
 */
export function getDefaultUnitTypes(caseRecord) {
  const table = caseRecord.caseType === 'incident' ? INCIDENT_TYPE_TO_UNITS : SOS_TYPE_TO_UNITS;
  const key = caseRecord.caseType === 'incident' ? caseRecord.incidentType : caseRecord.emergencyType;
  return table[key] ?? UNSPECIFIED_SET;
}

/**
 * Given units already ranked nearest-first (e.g. via haversine.rankByDistance),
 * picks the nearest *available* unit of each type required for this case.
 * If no available unit of a required type exists, that type is simply
 * skipped — the dispatcher sees the gap and can still dispatch what exists.
 *
 * @param {{ id: string, unitType: string, status: string }[]} rankedUnits
 * @param {{ caseType: 'sos' | 'incident', emergencyType?: string, incidentType?: string }} caseRecord
 * @returns {string[]} unit ids to pre-select
 */
export function selectDefaultUnitIds(rankedUnits, caseRecord) {
  const requiredTypes = getDefaultUnitTypes(caseRecord);

  return requiredTypes.reduce((selectedIds, unitType) => {
    const nearestAvailable = rankedUnits.find(
      (unit) => unit.unitType === unitType && unit.status === 'available' && !selectedIds.includes(unit.id)
    );
    return nearestAvailable ? [...selectedIds, nearestAvailable.id] : selectedIds;
  }, []);
}
