import { describe, expect, it } from 'vitest';
import { createInitialState, dispatcherReducer } from './useDispatcherData';

function buildState() {
  return createInitialState({
    cases: [
      {
        id: 'case-1',
        caseType: 'sos',
        severity: 'HIGH',
        status: 'received',
        emergencyType: 'ROAD_ACCIDENT',
        latitude: 30.6,
        longitude: 32.27,
        receivedAt: new Date().toISOString(),
        isUnread: true,
        notes: [],
        assignmentIds: [],
      },
    ],
    units: [
      { id: 'unit-1', unitType: 'ambulance', status: 'available', currentLatitude: 30.6, currentLongitude: 32.27 },
      { id: 'unit-2', unitType: 'police', status: 'available', currentLatitude: 30.6, currentLongitude: 32.27 },
      { id: 'unit-3', unitType: 'ambulance', status: 'off_duty', currentLatitude: 30.6, currentLongitude: 32.27 },
    ],
  });
}

describe('dispatcherReducer — selection', () => {
  it('selecting a case marks it read and moves status from received to active', () => {
    const state = buildState();
    const next = dispatcherReducer(state, { type: 'SELECT_CASE', caseId: 'case-1' });

    expect(next.selectedCaseId).toBe('case-1');
    const selected = next.cases.find((c) => c.id === 'case-1');
    expect(selected.isUnread).toBe(false);
    expect(selected.status).toBe('active');
  });

  it('does not mutate the original state object', () => {
    const state = buildState();
    const originalCase = state.cases[0];

    dispatcherReducer(state, { type: 'SELECT_CASE', caseId: 'case-1' });

    expect(state.cases[0]).toBe(originalCase);
    expect(originalCase.isUnread).toBe(true);
  });

  it('selectUnit / deselectUnit / clearSelectedUnits manage the selection set immutably', () => {
    let state = buildState();
    state = dispatcherReducer(state, { type: 'SELECT_UNIT', unitId: 'unit-1' });
    state = dispatcherReducer(state, { type: 'SELECT_UNIT', unitId: 'unit-2' });
    expect(state.selectedUnitIds).toEqual(['unit-1', 'unit-2']);

    state = dispatcherReducer(state, { type: 'SELECT_UNIT', unitId: 'unit-1' }); // re-selecting is a no-op
    expect(state.selectedUnitIds).toEqual(['unit-1', 'unit-2']);

    state = dispatcherReducer(state, { type: 'DESELECT_UNIT', unitId: 'unit-1' });
    expect(state.selectedUnitIds).toEqual(['unit-2']);

    state = dispatcherReducer(state, { type: 'CLEAR_SELECTED_UNITS' });
    expect(state.selectedUnitIds).toEqual([]);
  });

  it('setUnitFilter merges into the existing filter rather than replacing it', () => {
    let state = buildState();
    state = dispatcherReducer(state, { type: 'SET_UNIT_FILTER', filter: { availableOnly: true } });
    expect(state.unitFilter).toEqual({ types: [], availableOnly: true });

    state = dispatcherReducer(state, { type: 'SET_UNIT_FILTER', filter: { types: ['ambulance'] } });
    expect(state.unitFilter).toEqual({ types: ['ambulance'], availableOnly: true });
  });
});

describe('dispatcherReducer — dispatchUnits', () => {
  it('creates one notified assignment per unit, moves units to en_route, links the case, and logs a system note', () => {
    const state = buildState();
    const next = dispatcherReducer(state, {
      type: 'DISPATCH_UNITS',
      caseId: 'case-1',
      unitIds: ['unit-1', 'unit-2'],
    });

    expect(next.assignments).toHaveLength(2);
    next.assignments.forEach((assignment) => {
      expect(assignment.caseId).toBe('case-1');
      expect(assignment.status).toBe('notified');
    });

    const unit1 = next.units.find((u) => u.id === 'unit-1');
    const unit2 = next.units.find((u) => u.id === 'unit-2');
    expect(unit1.status).toBe('en_route');
    expect(unit2.status).toBe('en_route');

    const updatedCase = next.cases.find((c) => c.id === 'case-1');
    expect(updatedCase.assignmentIds).toHaveLength(2);
    expect(updatedCase.notes.some((note) => note.authorType === 'system')).toBe(true);

    expect(next.selectedUnitIds).toEqual([]);
  });

  it('does not mutate the original state, units array, or case array', () => {
    const state = buildState();
    const originalUnits = state.units;
    const originalCases = state.cases;

    dispatcherReducer(state, { type: 'DISPATCH_UNITS', caseId: 'case-1', unitIds: ['unit-1'] });

    expect(state.units).toBe(originalUnits);
    expect(state.cases).toBe(originalCases);
    expect(state.units.find((u) => u.id === 'unit-1').status).toBe('available');
  });
});

describe('dispatcherReducer — cancelAssignment / updateAssignmentStatus', () => {
  function dispatchedState() {
    const state = buildState();
    return dispatcherReducer(state, { type: 'DISPATCH_UNITS', caseId: 'case-1', unitIds: ['unit-1'] });
  }

  it('cancelAssignment returns the unit to available and marks the assignment cancelled', () => {
    const state = dispatchedState();
    const assignmentId = state.assignments[0].id;

    const next = dispatcherReducer(state, { type: 'CANCEL_ASSIGNMENT', assignmentId });

    expect(next.assignments.find((a) => a.id === assignmentId).status).toBe('cancelled');
    expect(next.units.find((u) => u.id === 'unit-1').status).toBe('available');
  });

  it('updateAssignmentStatus enforces forward-only transitions', () => {
    const state = dispatchedState();
    const assignmentId = state.assignments[0].id;

    // notified -> en_route -> on_scene -> completed is fine
    let next = dispatcherReducer(state, { type: 'UPDATE_ASSIGNMENT_STATUS', assignmentId, status: 'en_route' });
    expect(next.assignments.find((a) => a.id === assignmentId).status).toBe('en_route');

    next = dispatcherReducer(next, { type: 'UPDATE_ASSIGNMENT_STATUS', assignmentId, status: 'on_scene' });
    expect(next.assignments.find((a) => a.id === assignmentId).status).toBe('on_scene');

    next = dispatcherReducer(next, { type: 'UPDATE_ASSIGNMENT_STATUS', assignmentId, status: 'completed' });
    expect(next.assignments.find((a) => a.id === assignmentId).status).toBe('completed');
    expect(next.units.find((u) => u.id === 'unit-1').status).toBe('available');

    // a backward/invalid transition from a terminal state is a no-op
    const stuck = dispatcherReducer(next, { type: 'UPDATE_ASSIGNMENT_STATUS', assignmentId, status: 'en_route' });
    expect(stuck.assignments.find((a) => a.id === assignmentId).status).toBe('completed');
  });
});

describe('dispatcherReducer — addNote / escalateCase / closeCase', () => {
  it('addNote appends a dispatcher-authored, timestamped note', () => {
    const state = buildState();
    const next = dispatcherReducer(state, { type: 'ADD_NOTE', caseId: 'case-1', content: 'Victim is stable.' });

    const note = next.cases.find((c) => c.id === 'case-1').notes.at(-1);
    expect(note.authorType).toBe('dispatcher');
    expect(note.content).toBe('Victim is stable.');
    expect(typeof note.createdAt).toBe('string');
  });

  it('escalateCase sets the case status to escalated and logs a system note', () => {
    const state = buildState();
    const next = dispatcherReducer(state, { type: 'ESCALATE_CASE', caseId: 'case-1' });

    const escalated = next.cases.find((c) => c.id === 'case-1');
    expect(escalated.status).toBe('escalated');
    expect(escalated.notes.some((note) => note.authorType === 'system')).toBe(true);
  });

  it('closeCase force-completes every active assignment, frees the units, and closes the case', () => {
    let state = buildState();
    state = dispatcherReducer(state, { type: 'DISPATCH_UNITS', caseId: 'case-1', unitIds: ['unit-1', 'unit-2'] });

    const next = dispatcherReducer(state, { type: 'CLOSE_CASE', caseId: 'case-1' });

    expect(next.cases.find((c) => c.id === 'case-1').status).toBe('closed');
    next.assignments.forEach((assignment) => expect(assignment.status).toBe('completed'));
    expect(next.units.find((u) => u.id === 'unit-1').status).toBe('available');
    expect(next.units.find((u) => u.id === 'unit-2').status).toBe('available');
  });
});
