import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { dispatcherReducer, createInitialState } from '../hooks/useDispatcherData';

export const CURRENT_DISPATCHER = {
  id: 'dispatcher-001',
  name: 'Mohamed Hassan',
  shiftStart: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
};

const TICKER_INTERVAL_MS = 2000;
// ~1 new case every 90s at 2s ticks
const NEW_CASE_PROBABILITY = 0.022;
// ~1 assignment alert every 3 min
const ASSIGN_PROBABILITY = 0.011;

const EMERGENCY_TYPES = ['ROAD_ACCIDENT', 'MEDICAL', 'UNSPECIFIED'];
const INCIDENT_TYPES = ['COLLISION', 'STOPPED_VEHICLE', 'ROAD_HAZARD'];
const SEVERITIES = ['HIGH', 'MEDIUM', 'LOW'];
const SEVERITY_WEIGHTS = [0.25, 0.5, 0.25];

function weightedRandom(weights) {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return i;
  }
  return weights.length - 1;
}

let _liveSeq = 1;
function generateNewCase() {
  const seq = _liveSeq++;
  const id = `case-live-${Date.now()}-${seq}`;
  const isSOS = Math.random() < 0.55;
  const severity = SEVERITIES[weightedRandom(SEVERITY_WEIGHTS)];
  const latitude = 30.545 + Math.random() * 0.09;
  const longitude = 32.2 + Math.random() * 0.13;
  const now = new Date().toISOString();

  if (isSOS) {
    return {
      id,
      caseType: 'sos',
      severity,
      status: 'queued',
      latitude,
      longitude,
      receivedAt: now,
      isUnread: true,
      notes: [{ id: `${id}-n1`, caseId: id, authorType: 'system', content: 'New SOS received via mobile app', createdAt: now }],
      assignmentIds: [],
      emergencyType: EMERGENCY_TYPES[Math.floor(Math.random() * EMERGENCY_TYPES.length)],
      attachments: [],
      victim: { fullName: 'Unknown Caller', nationalId: null, dob: null, phone: null },
      medicalProfile: null,
      emergencyContacts: [],
    };
  }
  return {
    id,
    caseType: 'incident',
    severity,
    status: 'queued',
    latitude,
    longitude,
    receivedAt: now,
    isUnread: true,
    notes: [{ id: `${id}-n1`, caseId: id, authorType: 'system', content: 'AI detection: incident at highway node', createdAt: now }],
    assignmentIds: [],
    incidentType: INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)],
    confidence: 0.68 + Math.random() * 0.28,
    affectedLanes: ['L1', 'L2', 'L3'].slice(0, 1 + Math.floor(Math.random() * 2)),
    nodeLabel: `Highway Node ${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')} — Auto-detected`,
    attachments: [],
  };
}

function extendedInitialState() {
  return {
    ...createInitialState(),
    pendingAssignment: null,
  };
}

function extendedReducer(state, action) {
  const { pendingAssignment, ...baseState } = state;

  switch (action.type) {
    case 'ADD_CASE':
      return { ...state, cases: [action.caseRecord, ...state.cases] };

    case 'ASSIGN_CASE_TO_DISPATCHER': {
      const updatedCases = state.cases.map((c) =>
        c.id === action.caseId ? { ...c, assignedDispatcherId: CURRENT_DISPATCHER.id } : c
      );
      return { ...state, cases: updatedCases, pendingAssignment: { caseId: action.caseId } };
    }

    case 'DISMISS_ASSIGNMENT':
      return { ...state, pendingAssignment: null };

    case 'TICKER_TICK': {
      const nextBase = dispatcherReducer(baseState, action);
      let nextState = { ...nextBase, pendingAssignment };

      if (Math.random() < NEW_CASE_PROBABILITY) {
        const newCase = generateNewCase();
        nextState = { ...nextState, cases: [newCase, ...nextState.cases] };
      }

      if (!nextState.pendingAssignment && Math.random() < ASSIGN_PROBABILITY) {
        const eligible = nextState.cases.filter(
          (c) => !c.assignedDispatcherId && ['queued', 'acknowledged'].includes(c.status)
        );
        if (eligible.length > 0) {
          const target = eligible[Math.floor(Math.random() * eligible.length)];
          nextState = {
            ...nextState,
            cases: nextState.cases.map((c) =>
              c.id === target.id ? { ...c, assignedDispatcherId: CURRENT_DISPATCHER.id } : c
            ),
            pendingAssignment: { caseId: target.id },
          };
        }
      }

      return nextState;
    }

    default:
      return { ...dispatcherReducer(baseState, action), pendingAssignment };
  }
}

export const DispatcherContext = createContext(null);

export function useDispatcherContext() {
  const ctx = useContext(DispatcherContext);
  if (!ctx) throw new Error('useDispatcherContext must be used inside DispatcherProvider');
  return ctx;
}

export function DispatcherProvider({ children }) {
  const [state, dispatch] = useReducer(extendedReducer, undefined, extendedInitialState);

  useEffect(() => {
    const id = window.setInterval(() => dispatch({ type: 'TICKER_TICK' }), TICKER_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const selectedCase = useMemo(
    () => state.cases.find((c) => c.id === state.selectedCaseId) ?? null,
    [state.cases, state.selectedCaseId]
  );

  const assignments = useMemo(
    () => state.assignments.filter((a) => a.caseId === state.selectedCaseId),
    [state.assignments, state.selectedCaseId]
  );

  const assignedToMe = useMemo(
    () => state.cases.filter((c) => c.assignedDispatcherId === CURRENT_DISPATCHER.id),
    [state.cases]
  );

  const selectCase = useCallback((caseId) => dispatch({ type: 'SELECT_CASE', caseId }), []);
  const selectUnit = useCallback((unitId) => dispatch({ type: 'SELECT_UNIT', unitId }), []);
  const deselectUnit = useCallback((unitId) => dispatch({ type: 'DESELECT_UNIT', unitId }), []);
  const clearSelectedUnits = useCallback(() => dispatch({ type: 'CLEAR_SELECTED_UNITS' }), []);
  const setUnitFilter = useCallback((filter) => dispatch({ type: 'SET_UNIT_FILTER', filter }), []);
  const dispatchUnits = useCallback((caseId, unitIds) => dispatch({ type: 'DISPATCH_UNITS', caseId, unitIds }), []);
  const cancelAssignment = useCallback((assignmentId) => dispatch({ type: 'CANCEL_ASSIGNMENT', assignmentId }), []);
  const updateAssignmentStatus = useCallback((assignmentId, status) => dispatch({ type: 'UPDATE_ASSIGNMENT_STATUS', assignmentId, status }), []);
  const addNote = useCallback((caseId, content) => dispatch({ type: 'ADD_NOTE', caseId, content }), []);
  const escalateCase = useCallback((caseId) => dispatch({ type: 'ESCALATE_CASE', caseId }), []);
  const resolveCase = useCallback((caseId) => dispatch({ type: 'RESOLVE_CASE', caseId }), []);
  const markFalseAlarm = useCallback((caseId) => dispatch({ type: 'MARK_FALSE_ALARM', caseId }), []);
  const closeCase = useCallback((caseId) => dispatch({ type: 'CLOSE_CASE', caseId }), []);
  const dismissAssignment = useCallback(() => dispatch({ type: 'DISMISS_ASSIGNMENT' }), []);

  const value = useMemo(() => ({
    cases: state.cases,
    units: state.units,
    selectedCase,
    assignments,
    allAssignments: state.assignments,
    selectedUnitIds: state.selectedUnitIds,
    unitFilter: state.unitFilter,
    pendingAssignment: state.pendingAssignment,
    loading: false,
    error: null,
    currentDispatcher: CURRENT_DISPATCHER,
    assignedToMe,
    selectCase,
    selectUnit,
    deselectUnit,
    clearSelectedUnits,
    setUnitFilter,
    dispatchUnits,
    cancelAssignment,
    updateAssignmentStatus,
    addNote,
    escalateCase,
    resolveCase,
    markFalseAlarm,
    closeCase,
    dismissAssignment,
  }), [
    state.cases, state.units, state.assignments, state.selectedUnitIds, state.unitFilter,
    state.pendingAssignment, selectedCase, assignments, assignedToMe,
    selectCase, selectUnit, deselectUnit, clearSelectedUnits, setUnitFilter,
    dispatchUnits, cancelAssignment, updateAssignmentStatus, addNote,
    escalateCase, resolveCase, markFalseAlarm, closeCase, dismissAssignment,
  ]);

  return <DispatcherContext.Provider value={value}>{children}</DispatcherContext.Provider>;
}
