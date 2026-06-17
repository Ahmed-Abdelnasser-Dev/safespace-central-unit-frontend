/**
 * Severity / status / type → Badge variant + human label mappings.
 *
 * Centralizes the "state, not decoration" color vocabulary documented in
 * DESIGN.md: every non-neutral color maps to a real system state. Badge
 * variants are constrained to the shared <Badge> primitive's API
 * (neutral | success | danger | info | accent) — there is no separate
 * "warning" variant, so MEDIUM severity and in-progress states intentionally
 * borrow `accent`.
 */

const NEUTRAL_FALLBACK = { variant: 'neutral' };

function titleCase(value) {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const SEVERITY_STYLES = {
  HIGH: { variant: 'danger', label: 'High' },
  MEDIUM: { variant: 'accent', label: 'Medium' },
  LOW: { variant: 'info', label: 'Low' },
};

export function getSeverityStyle(severity) {
  return SEVERITY_STYLES[severity] ?? { ...NEUTRAL_FALLBACK, label: severity };
}

const UNIT_STATUS_STYLES = {
  available: { variant: 'success', label: 'Available' },
  en_route: { variant: 'info', label: 'En Route' },
  on_scene: { variant: 'accent', label: 'On Scene' },
  off_duty: { variant: 'neutral', label: 'Off Duty' },
};

export function getUnitStatusStyle(status) {
  return UNIT_STATUS_STYLES[status] ?? { ...NEUTRAL_FALLBACK, label: titleCase(status ?? 'unknown') };
}

const ASSIGNMENT_STATUS_STYLES = {
  notified: { variant: 'neutral', label: 'Notified' },
  en_route: { variant: 'info', label: 'En Route' },
  on_scene: { variant: 'accent', label: 'On Scene' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
};

export function getAssignmentStatusStyle(status) {
  return ASSIGNMENT_STATUS_STYLES[status] ?? { ...NEUTRAL_FALLBACK, label: titleCase(status ?? 'unknown') };
}

const CASE_STATUS_STYLES = {
  queued:       { variant: 'neutral', label: 'Queued' },
  acknowledged: { variant: 'info',    label: 'Acknowledged' },
  active:       { variant: 'info',    label: 'Active' },
  escalated:    { variant: 'accent',  label: 'Escalated' },
  resolved:     { variant: 'success', label: 'Resolved' },
  false_alarm:  { variant: 'neutral', label: 'False Alarm' },
  closed:       { variant: 'neutral', label: 'Closed' },
};

export function getCaseStatusStyle(status) {
  return CASE_STATUS_STYLES[status] ?? { ...NEUTRAL_FALLBACK, label: titleCase(status ?? 'unknown') };
}

const UNIT_TYPE_META = {
  ambulance: { label: 'Ambulance', icon: 'truck-medical' },
  police: { label: 'Police', icon: 'shield-halved' },
  fire: { label: 'Fire', icon: 'fire-flame-curved' },
  civil_protection: { label: 'Civil Protection', icon: 'hard-hat' },
};

export function getUnitTypeLabel(unitType) {
  return UNIT_TYPE_META[unitType]?.label ?? titleCase(unitType ?? 'unknown');
}

export function getUnitTypeIcon(unitType) {
  return UNIT_TYPE_META[unitType]?.icon ?? 'circle-question';
}

/**
 * Human label for a case's emergency/incident type, regardless of caseType.
 * @param {{ caseType: 'sos' | 'incident', emergencyType?: string, incidentType?: string }} caseRecord
 */
export function getCaseTypeLabel(caseRecord) {
  const key = caseRecord.caseType === 'incident' ? caseRecord.incidentType : caseRecord.emergencyType;
  return titleCase(key ?? 'unknown');
}

/**
 * Human "time since" label for a live counter (e.g. "5 min ago").
 * @param {string} isoTimestamp
 * @param {number} [nowMs] — injectable for tests; defaults to Date.now()
 */
export function timeSince(isoTimestamp, nowMs = Date.now()) {
  const elapsedMs = nowMs - Date.parse(isoTimestamp);
  const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));

  if (elapsedMinutes < 1) return 'just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `${elapsedHours} hr ago`;
}
