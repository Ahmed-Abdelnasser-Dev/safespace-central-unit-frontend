import { useCallback, useMemo, useReducer } from 'react';
import { useContext } from 'react';
import { DispatcherContext } from '../context/DispatcherProvider';
import { mockCases } from '../data/mockCases';
import { mockUnits } from '../data/mockUnits';

/**
 * The Emergency Dispatcher data-access seam.
 *
 * State is now hosted in DispatcherProvider (a React context wrapping the
 * dispatcher route subtree). This hook is a thin consumer of that context so
 * every panel on the console and the case-detail page share one source of truth.
 *
 * The pure reducer functions below (`dispatcherReducer`, `createInitialState`)
 * remain exported so they can be unit-tested without React or the provider.
 *
 * Future swap path: replace DispatcherProvider's reducer + ticker with a real
 * dispatcherSlice.js + api.js + socket wiring — consumers (this hook) stay
 * unchanged because the context shape is the contract.
 */

function generateId(prefix) {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${uuid}`;
}

export function createInitialState({ cases = mockCases, units = mockUnits } = {}) {
  return {
    cases,
    units,
    selectedCaseId: null,
    assignments: [],
    selectedUnitIds: [],
    unitFilter: { types: [], availableOnly: false },
  };
}

function systemNote(caseId, content) {
  return {
    id: generateId('note'),
    caseId,
    authorType: 'system',
    content,
    createdAt: new Date().toISOString(),
  };
}

function updateCase(cases, caseId, updater) {
  return cases.map((c) => (c.id === caseId ? updater(c) : c));
}

function updateUnit(units, unitId, updater) {
  return units.map((u) => (u.id === unitId ? updater(u) : u));
}

function updateAssignment(assignments, assignmentId, updater) {
  return assignments.map((a) => (a.id === assignmentId ? updater(a) : a));
}

const ASSIGNMENT_FORWARD_TRANSITIONS = {
  notified: 'en_route',
  en_route: 'on_scene',
  on_scene: 'completed',
};

const NON_TERMINAL_ASSIGNMENT_STATUSES = ['notified', 'en_route', 'on_scene'];

const TICKER_STEP_FRACTION = 0.04;
const TICKER_ADVANCE_PROBABILITY = 0.06;

export function dispatcherReducer(state, action) {
  switch (action.type) {
    case 'SELECT_CASE': {
      return {
        ...state,
        selectedCaseId: action.caseId,
        cases: updateCase(state.cases, action.caseId, (c) => ({
          ...c,
          isUnread: false,
          status: c.status === 'queued' ? 'acknowledged' : c.status,
        })),
      };
    }

    case 'SELECT_UNIT': {
      if (state.selectedUnitIds.includes(action.unitId)) return state;
      return { ...state, selectedUnitIds: [...state.selectedUnitIds, action.unitId] };
    }

    case 'DESELECT_UNIT':
      return { ...state, selectedUnitIds: state.selectedUnitIds.filter((id) => id !== action.unitId) };

    case 'CLEAR_SELECTED_UNITS':
      return { ...state, selectedUnitIds: [] };

    case 'SET_UNIT_FILTER':
      return { ...state, unitFilter: { ...state.unitFilter, ...action.filter } };

    case 'DISPATCH_UNITS': {
      const { caseId, unitIds } = action;
      const newAssignments = unitIds.map((unitId) => ({
        id: generateId('assignment'),
        caseId,
        unitId,
        status: 'notified',
        dispatchedAt: new Date().toISOString(),
        assignedBy: 'dispatcher',
      }));
      const unitNames = unitIds
        .map((unitId) => state.units.find((u) => u.id === unitId)?.name)
        .filter(Boolean)
        .join(', ');
      return {
        ...state,
        assignments: [...state.assignments, ...newAssignments],
        units: state.units.map((u) => (unitIds.includes(u.id) ? { ...u, status: 'en_route' } : u)),
        cases: updateCase(state.cases, caseId, (c) => ({
          ...c,
          assignmentIds: [...c.assignmentIds, ...newAssignments.map((a) => a.id)],
          status: ['queued', 'acknowledged', 'escalated'].includes(c.status) ? 'active' : c.status,
          notes: [...c.notes, systemNote(caseId, `${unitNames} dispatched`)],
        })),
        selectedUnitIds: [],
      };
    }

    case 'CANCEL_ASSIGNMENT': {
      const assignment = state.assignments.find((a) => a.id === action.assignmentId);
      if (!assignment || !['notified', 'en_route'].includes(assignment.status)) return state;
      return {
        ...state,
        assignments: updateAssignment(state.assignments, action.assignmentId, (a) => ({ ...a, status: 'cancelled' })),
        units: updateUnit(state.units, assignment.unitId, (u) => ({ ...u, status: 'available' })),
      };
    }

    case 'UPDATE_ASSIGNMENT_STATUS': {
      const assignment = state.assignments.find((a) => a.id === action.assignmentId);
      if (!assignment) return state;
      if (ASSIGNMENT_FORWARD_TRANSITIONS[assignment.status] !== action.status) return state;
      const nextUnits = action.status === 'completed'
        ? updateUnit(state.units, assignment.unitId, (u) => ({ ...u, status: 'available' }))
        : state.units;
      return {
        ...state,
        assignments: updateAssignment(state.assignments, action.assignmentId, (a) => ({ ...a, status: action.status })),
        units: nextUnits,
      };
    }

    case 'ADD_NOTE':
      return {
        ...state,
        cases: updateCase(state.cases, action.caseId, (c) => ({
          ...c,
          notes: [...c.notes, { id: generateId('note'), caseId: action.caseId, authorType: 'dispatcher', content: action.content, createdAt: new Date().toISOString() }],
        })),
      };

    case 'ESCALATE_CASE':
      return {
        ...state,
        cases: updateCase(state.cases, action.caseId, (c) => ({
          ...c,
          status: 'escalated',
          notes: [...c.notes, systemNote(action.caseId, 'Case escalated to supervisor')],
        })),
      };

    case 'RESOLVE_CASE': {
      const { caseId } = action;
      const unitIdsToFree = state.assignments
        .filter((a) => a.caseId === caseId && NON_TERMINAL_ASSIGNMENT_STATUSES.includes(a.status))
        .map((a) => a.unitId);
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.caseId === caseId && NON_TERMINAL_ASSIGNMENT_STATUSES.includes(a.status) ? { ...a, status: 'completed' } : a
        ),
        units: state.units.map((u) => (unitIdsToFree.includes(u.id) ? { ...u, status: 'available' } : u)),
        cases: updateCase(state.cases, caseId, (c) => ({
          ...c,
          status: 'resolved',
          notes: [...c.notes, systemNote(caseId, 'Case marked as resolved')],
        })),
      };
    }

    case 'MARK_FALSE_ALARM': {
      const { caseId } = action;
      const unitIdsToFree = state.assignments
        .filter((a) => a.caseId === caseId && NON_TERMINAL_ASSIGNMENT_STATUSES.includes(a.status))
        .map((a) => a.unitId);
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.caseId === caseId && NON_TERMINAL_ASSIGNMENT_STATUSES.includes(a.status) ? { ...a, status: 'cancelled' } : a
        ),
        units: state.units.map((u) => (unitIdsToFree.includes(u.id) ? { ...u, status: 'available' } : u)),
        cases: updateCase(state.cases, caseId, (c) => ({
          ...c,
          status: 'false_alarm',
          notes: [...c.notes, systemNote(caseId, 'Marked as false alarm by dispatcher')],
        })),
      };
    }

    case 'CLOSE_CASE': {
      const { caseId } = action;
      const unitIdsToFree = state.assignments
        .filter((a) => a.caseId === caseId && NON_TERMINAL_ASSIGNMENT_STATUSES.includes(a.status))
        .map((a) => a.unitId);
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.caseId === caseId && NON_TERMINAL_ASSIGNMENT_STATUSES.includes(a.status) ? { ...a, status: 'completed' } : a
        ),
        units: state.units.map((u) => (unitIdsToFree.includes(u.id) ? { ...u, status: 'available' } : u)),
        cases: updateCase(state.cases, caseId, (c) => ({
          ...c,
          status: 'closed',
          notes: [...c.notes, systemNote(caseId, 'Case closed by dispatcher')],
        })),
      };
    }

    case 'TICKER_TICK': {
      let nextUnits = state.units;
      let nextAssignments = state.assignments;
      state.assignments
        .filter((a) => a.status === 'en_route')
        .forEach((assignment) => {
          const caseRecord = state.cases.find((c) => c.id === assignment.caseId);
          const unit = nextUnits.find((u) => u.id === assignment.unitId);
          if (!caseRecord || !unit) return;
          const dLat = caseRecord.latitude - unit.currentLatitude;
          const dLon = caseRecord.longitude - unit.currentLongitude;
          nextUnits = updateUnit(nextUnits, unit.id, (u) => ({
            ...u,
            currentLatitude: u.currentLatitude + dLat * TICKER_STEP_FRACTION,
            currentLongitude: u.currentLongitude + dLon * TICKER_STEP_FRACTION,
          }));
          if (Math.random() < TICKER_ADVANCE_PROBABILITY) {
            nextAssignments = updateAssignment(nextAssignments, assignment.id, (a) => ({ ...a, status: 'on_scene' }));
          }
        });
      nextUnits = nextUnits.map((unit) => {
        if (unit.status !== 'available' || !unit.homeBase) return unit;
        const dLat = unit.homeBase.latitude - unit.currentLatitude;
        const dLon = unit.homeBase.longitude - unit.currentLongitude;
        if (Math.abs(dLat) < 0.0001 && Math.abs(dLon) < 0.0001) return unit;
        return {
          ...unit,
          currentLatitude: unit.currentLatitude + dLat * TICKER_STEP_FRACTION,
          currentLongitude: unit.currentLongitude + dLon * TICKER_STEP_FRACTION,
        };
      });
      if (nextUnits === state.units && nextAssignments === state.assignments) return state;
      return { ...state, units: nextUnits, assignments: nextAssignments };
    }

    default:
      return state;
  }
}

/**
 * Thin context consumer — reads from DispatcherProvider.
 * Falls back to a local reducer when called outside the provider (tests / legacy).
 */
export function useDispatcherData() {
  const ctx = useContext(DispatcherContext);
  if (ctx) return ctx;

  // Fallback: standalone reducer (used outside a DispatcherProvider — e.g. tests).
  // This path is not used in production since App.jsx wraps all dispatcher routes
  // in DispatcherProvider, but keeping it prevents hard crashes in isolated tests.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [state, dispatch] = useReducer(dispatcherReducer, undefined, createInitialState);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const selectedCase = useMemo(() => state.cases.find((c) => c.id === state.selectedCaseId) ?? null, [state.cases, state.selectedCaseId]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const assignments = useMemo(() => state.assignments.filter((a) => a.caseId === state.selectedCaseId), [state.assignments, state.selectedCaseId]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const selectCase = useCallback((caseId) => dispatch({ type: 'SELECT_CASE', caseId }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const selectUnit = useCallback((unitId) => dispatch({ type: 'SELECT_UNIT', unitId }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const deselectUnit = useCallback((unitId) => dispatch({ type: 'DESELECT_UNIT', unitId }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clearSelectedUnits = useCallback(() => dispatch({ type: 'CLEAR_SELECTED_UNITS' }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setUnitFilter = useCallback((filter) => dispatch({ type: 'SET_UNIT_FILTER', filter }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dispatchUnits = useCallback((caseId, unitIds) => dispatch({ type: 'DISPATCH_UNITS', caseId, unitIds }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const cancelAssignment = useCallback((assignmentId) => dispatch({ type: 'CANCEL_ASSIGNMENT', assignmentId }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateAssignmentStatus = useCallback((assignmentId, status) => dispatch({ type: 'UPDATE_ASSIGNMENT_STATUS', assignmentId, status }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const addNote = useCallback((caseId, content) => dispatch({ type: 'ADD_NOTE', caseId, content }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const escalateCase = useCallback((caseId) => dispatch({ type: 'ESCALATE_CASE', caseId }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resolveCase = useCallback((caseId) => dispatch({ type: 'RESOLVE_CASE', caseId }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const markFalseAlarm = useCallback((caseId) => dispatch({ type: 'MARK_FALSE_ALARM', caseId }), []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const closeCase = useCallback((caseId) => dispatch({ type: 'CLOSE_CASE', caseId }), []);

  return {
    cases: state.cases, units: state.units, selectedCase, assignments,
    allAssignments: state.assignments, selectedUnitIds: state.selectedUnitIds,
    unitFilter: state.unitFilter, pendingAssignment: null,
    loading: false, error: null, currentDispatcher: null, assignedToMe: [],
    selectCase, selectUnit, deselectUnit, clearSelectedUnits, setUnitFilter,
    dispatchUnits, cancelAssignment, updateAssignmentStatus, addNote,
    escalateCase, resolveCase, markFalseAlarm, closeCase,
    dismissAssignment: () => {},
  };
}
