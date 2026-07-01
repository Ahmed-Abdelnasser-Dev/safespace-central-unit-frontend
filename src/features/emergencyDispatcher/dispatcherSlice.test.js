/**
 * dispatcherSlice unit tests
 *
 * Tests the slice's pure reducer logic:
 *   - Socket-event reducers (caseNew, caseUpdated, unitStatus, unitLocation,
 *     assignmentUpserted, dispatcherAssigned)
 *   - UI reducers (selectUnit, deselectUnit, clearSelectedUnits, setUnitFilter,
 *     dismissAssignment) — immutability and correct updates
 *   - Key extraReducers fulfilled handlers for async thunks
 *     (dispatchUnitsThunk, cancelAssignmentThunk, updateAssignmentStatusThunk,
 *      addNoteThunk, setCaseStatusThunk, fetchInitialData, selectCaseThunk)
 *
 * Style mirrors src/features/nodeMaintainer/nodesSlice.test.js:
 *   - Pure reducer calls, no React/DOM, no API mocking
 *   - Import describe/expect/it from vitest
 *   - Tests co-located with the slice
 */

import { describe, expect, it } from 'vitest';
import reducer, {
  selectUnit,
  deselectUnit,
  clearSelectedUnits,
  setUnitFilter,
  dismissAssignment,
  caseNew,
  caseUpdated,
  unitLocation,
  unitStatus,
  assignmentUpserted,
  dispatcherAssigned,
  fetchInitialData,
  selectCaseThunk,
  dispatchUnitsThunk,
  cancelAssignmentThunk,
  updateAssignmentStatusThunk,
  addNoteThunk,
  setCaseStatusThunk,
} from './dispatcherSlice';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeCase(overrides = {}) {
  return {
    id: 'case-1',
    caseType: 'sos',
    severity: 'HIGH',
    status: 'queued',
    latitude: 30.6,
    longitude: 32.27,
    receivedAt: new Date().toISOString(),
    isUnread: true,
    assignedDispatcherId: null,
    assignmentIds: [],
    attachments: [],
    notes: [],
    emergencyType: 'ROAD_ACCIDENT',
    victim: null,
    medicalProfile: null,
    emergencyContacts: [],
    incidentType: null,
    confidence: null,
    affectedLanes: null,
    nodeLabel: null,
    ...overrides,
  };
}

function makeUnit(overrides = {}) {
  return {
    id: 'unit-1',
    name: 'Ambulance Unit 1',
    unitType: 'ambulance',
    status: 'available',
    stationId: 'station-1',
    homeBase: { name: 'Central Hospital', latitude: 30.598, longitude: 32.269 },
    currentLatitude: 30.598,
    currentLongitude: 32.269,
    lastLocationAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeAssignment(overrides = {}) {
  return {
    id: 'assign-1',
    caseId: 'case-1',
    unitId: 'unit-1',
    status: 'notified',
    dispatchedAt: new Date().toISOString(),
    assignedBy: 'user-1',
    ...overrides,
  };
}

function makeSession() {
  return { id: 'dispatcher-uuid', name: 'Mohamed Hassan', shiftStart: new Date().toISOString() };
}

/** Build a slice state with one case, one unit, one station. */
function stateWithData() {
  return reducer(undefined, fetchInitialData.fulfilled(
    {
      session: makeSession(),
      cases: [makeCase()],
      units: [makeUnit()],
      stations: [{ id: 'station-1', name: 'Central Hospital', shortName: 'CH', stationType: 'ambulance', latitude: 30.598, longitude: 32.269 }],
    },
    'req-1'
  ));
}

/** Build a state with an active assignment. */
function stateWithAssignment() {
  const base = stateWithData();
  return reducer(base, dispatchUnitsThunk.fulfilled(
    { caseId: 'case-1', unitIds: ['unit-1'], assignments: [makeAssignment()] },
    'req-2'
  ));
}

// ── Initial state ─────────────────────────────────────────────────────────────

describe('dispatcherSlice — initial state', () => {
  it('starts idle with empty collections', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.status).toBe('idle');
    expect(state.cases).toEqual([]);
    expect(state.units).toEqual([]);
    expect(state.stations).toEqual([]);
    expect(state.assignments).toEqual([]);
    expect(state.selectedCaseId).toBeNull();
    expect(state.selectedUnitIds).toEqual([]);
    expect(state.pendingAssignment).toBeNull();
    expect(state.error).toBeNull();
  });
});

// ── fetchInitialData ───────────────────────────────────────────────────────────

describe('fetchInitialData thunk extraReducers', () => {
  it('pending sets status to loading and clears error', () => {
    const state = reducer(undefined, fetchInitialData.pending('req-1'));
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('fulfilled populates session, cases, units, stations and sets status to succeeded', () => {
    const payload = {
      session: makeSession(),
      cases: [makeCase()],
      units: [makeUnit()],
      stations: [{ id: 'station-1', name: 'Central Hospital', shortName: 'CH', stationType: 'ambulance', latitude: 30.598, longitude: 32.269 }],
    };
    const state = reducer(undefined, fetchInitialData.fulfilled(payload, 'req-1'));
    expect(state.status).toBe('succeeded');
    expect(state.session).toEqual(payload.session);
    expect(state.cases).toHaveLength(1);
    expect(state.units).toHaveLength(1);
    expect(state.stations).toHaveLength(1);
    expect(state.error).toBeNull();
  });

  it('rejected sets status to failed and records error', () => {
    const state = reducer(undefined, fetchInitialData.rejected(null, 'req-1', undefined, 'Server error'));
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Server error');
  });

  it('does not mutate the previous state object', () => {
    const before = reducer(undefined, { type: '@@INIT' });
    const after = reducer(before, fetchInitialData.fulfilled(
      { session: makeSession(), cases: [], units: [], stations: [] },
      'req-1'
    ));
    expect(before).not.toBe(after);
    expect(before.cases).toEqual([]);
  });

  it('preserves detail fields (notes, victim) when refreshing the case list', () => {
    // Simulate: detail was already fetched → case has notes
    const detailCase = { ...makeCase(), id: 'case-1', notes: [{ id: 'n1', content: 'Test note' }], victim: { fullName: 'Alice' } };
    const withDetail = reducer(undefined, fetchInitialData.fulfilled(
      { session: makeSession(), cases: [detailCase], units: [], stations: [] },
      'req-1'
    ));
    // Now simulate a list refresh that returns the case without notes (list response)
    const listCase = { ...makeCase(), id: 'case-1', status: 'active' };
    const after = reducer(withDetail, fetchInitialData.fulfilled(
      { session: makeSession(), cases: [listCase], units: [], stations: [] },
      'req-2'
    ));
    expect(after.cases[0].notes).toEqual([{ id: 'n1', content: 'Test note' }]);
    expect(after.cases[0].victim).toEqual({ fullName: 'Alice' });
    expect(after.cases[0].status).toBe('active'); // list field is still updated
  });
});

// ── UI reducers ───────────────────────────────────────────────────────────────

describe('selectUnit / deselectUnit / clearSelectedUnits', () => {
  it('selectUnit adds a unitId to the selection set', () => {
    const state = reducer(undefined, selectUnit('unit-1'));
    expect(state.selectedUnitIds).toEqual(['unit-1']);
  });

  it('selectUnit is idempotent — re-adding a selected id is a no-op', () => {
    let state = reducer(undefined, selectUnit('unit-1'));
    state = reducer(state, selectUnit('unit-1'));
    expect(state.selectedUnitIds).toEqual(['unit-1']);
  });

  it('deselectUnit removes a unitId', () => {
    let state = reducer(undefined, selectUnit('unit-1'));
    state = reducer(state, selectUnit('unit-2'));
    state = reducer(state, deselectUnit('unit-1'));
    expect(state.selectedUnitIds).toEqual(['unit-2']);
  });

  it('clearSelectedUnits empties the selection', () => {
    let state = reducer(undefined, selectUnit('unit-1'));
    state = reducer(state, selectUnit('unit-2'));
    state = reducer(state, clearSelectedUnits());
    expect(state.selectedUnitIds).toEqual([]);
  });

  it('does not mutate the original selectedUnitIds array', () => {
    const before = reducer(undefined, { type: '@@INIT' });
    const originalArr = before.selectedUnitIds;
    const after = reducer(before, selectUnit('unit-1'));
    expect(after.selectedUnitIds).not.toBe(originalArr);
    expect(originalArr).toEqual([]);
  });
});

describe('setUnitFilter', () => {
  it('merges partial filter updates without replacing unrelated keys', () => {
    let state = reducer(undefined, setUnitFilter({ availableOnly: true }));
    expect(state.unitFilter).toEqual({ types: [], availableOnly: true });

    state = reducer(state, setUnitFilter({ types: ['ambulance'] }));
    expect(state.unitFilter).toEqual({ types: ['ambulance'], availableOnly: true });
  });
});

describe('dismissAssignment', () => {
  it('clears pendingAssignment', () => {
    // Inject a pending assignment via the dispatcherAssigned socket reducer
    let state = reducer(undefined, dispatcherAssigned({ caseId: 'case-1' }));
    expect(state.pendingAssignment).toEqual({ caseId: 'case-1' });

    state = reducer(state, dismissAssignment());
    expect(state.pendingAssignment).toBeNull();
  });
});

// ── Socket-event reducers ─────────────────────────────────────────────────────

describe('caseNew', () => {
  it('prepends a new case to the cases list', () => {
    const base = stateWithData();
    const newCase = makeCase({ id: 'case-2', severity: 'MEDIUM' });
    const state = reducer(base, caseNew(newCase));

    expect(state.cases[0].id).toBe('case-2');
    expect(state.cases).toHaveLength(2);
  });

  it('deduplicates — does not add a case already in the list', () => {
    const base = stateWithData();
    const duplicate = makeCase({ id: 'case-1' }); // same id as existing
    const state = reducer(base, caseNew(duplicate));
    expect(state.cases).toHaveLength(1);
  });

  it('does not mutate the original cases array', () => {
    const base = stateWithData();
    const originalCases = base.cases;
    const state = reducer(base, caseNew(makeCase({ id: 'case-3' })));
    expect(state.cases).not.toBe(originalCases);
    expect(originalCases).toHaveLength(1);
  });
});

describe('caseUpdated', () => {
  it('shallow-merges a partial update into the matching case by id', () => {
    const base = stateWithData();
    const state = reducer(base, caseUpdated({ id: 'case-1', status: 'acknowledged' }));
    const updated = state.cases.find((c) => c.id === 'case-1');
    expect(updated.status).toBe('acknowledged');
    // Untouched fields remain
    expect(updated.severity).toBe('HIGH');
  });

  it('ignores updates for unknown case ids', () => {
    const base = stateWithData();
    const state = reducer(base, caseUpdated({ id: 'case-unknown', status: 'closed' }));
    expect(state.cases).toHaveLength(1);
    expect(state.cases[0].id).toBe('case-1');
  });

  it('does not mutate the original case object', () => {
    const base = stateWithData();
    const originalCase = base.cases[0];
    reducer(base, caseUpdated({ id: 'case-1', status: 'acknowledged' }));
    expect(originalCase.status).toBe('queued');
  });
});

describe('unitLocation', () => {
  it('updates currentLatitude, currentLongitude and lastLocationAt for the matching unit', () => {
    const base = stateWithData();
    const now = new Date().toISOString();
    const state = reducer(base, unitLocation({ unitId: 'unit-1', latitude: 30.61, longitude: 32.28, lastLocationAt: now }));
    const unit = state.units.find((u) => u.id === 'unit-1');
    expect(unit.currentLatitude).toBe(30.61);
    expect(unit.currentLongitude).toBe(32.28);
    expect(unit.lastLocationAt).toBe(now);
  });

  it('does not affect other units', () => {
    const base = stateWithData();
    // Add a second unit first
    const stateWithTwo = { ...base, units: [...base.units, makeUnit({ id: 'unit-2', currentLatitude: 30.5 })] };
    const state = reducer(stateWithTwo, unitLocation({ unitId: 'unit-1', latitude: 30.61, longitude: 32.28, lastLocationAt: new Date().toISOString() }));
    const unit2 = state.units.find((u) => u.id === 'unit-2');
    expect(unit2.currentLatitude).toBe(30.5);
  });
});

describe('unitStatus', () => {
  it('updates the operational status of the matching unit', () => {
    const base = stateWithData();
    const state = reducer(base, unitStatus({ unitId: 'unit-1', status: 'en_route' }));
    expect(state.units.find((u) => u.id === 'unit-1').status).toBe('en_route');
  });

  it('does not mutate the original units array', () => {
    const base = stateWithData();
    const original = base.units;
    reducer(base, unitStatus({ unitId: 'unit-1', status: 'en_route' }));
    expect(original[0].status).toBe('available');
  });
});

describe('assignmentUpserted', () => {
  it('appends an assignment not yet in the list', () => {
    const base = stateWithData(); // no assignments
    const state = reducer(base, assignmentUpserted(makeAssignment()));
    expect(state.assignments).toHaveLength(1);
    expect(state.assignments[0].id).toBe('assign-1');
  });

  it('merges updates for an existing assignment by id', () => {
    const base = stateWithAssignment();
    expect(base.assignments[0].status).toBe('notified');

    const state = reducer(base, assignmentUpserted(makeAssignment({ status: 'en_route' })));
    expect(state.assignments).toHaveLength(1); // not duplicated
    expect(state.assignments[0].status).toBe('en_route');
  });

  it('does not mutate the original assignments array', () => {
    const base = stateWithData();
    const original = base.assignments;
    reducer(base, assignmentUpserted(makeAssignment()));
    expect(original).toEqual([]);
  });
});

describe('dispatcherAssigned', () => {
  it('sets pendingAssignment to { caseId }', () => {
    const base = stateWithData();
    const state = reducer(base, dispatcherAssigned({ caseId: 'case-1' }));
    expect(state.pendingAssignment).toEqual({ caseId: 'case-1' });
  });

  it('marks the assignedDispatcherId on the matched case using the session id', () => {
    const base = stateWithData(); // session.id = 'dispatcher-uuid'
    const state = reducer(base, dispatcherAssigned({ caseId: 'case-1' }));
    const theCase = state.cases.find((c) => c.id === 'case-1');
    expect(theCase.assignedDispatcherId).toBe('dispatcher-uuid');
  });
});

// ── dispatchUnitsThunk ────────────────────────────────────────────────────────

describe('dispatchUnitsThunk.fulfilled', () => {
  it('appends new assignments, marks units en_route, links ids to case, clears selection', () => {
    const base = { ...stateWithData(), selectedUnitIds: ['unit-1'] };
    const assignments = [makeAssignment()];

    const state = reducer(base, dispatchUnitsThunk.fulfilled(
      { caseId: 'case-1', unitIds: ['unit-1'], assignments },
      'req'
    ));

    expect(state.assignments).toHaveLength(1);
    expect(state.assignments[0].status).toBe('notified');
    expect(state.units.find((u) => u.id === 'unit-1').status).toBe('en_route');
    expect(state.cases.find((c) => c.id === 'case-1').assignmentIds).toContain('assign-1');
    expect(state.cases.find((c) => c.id === 'case-1').status).toBe('active');
    expect(state.selectedUnitIds).toEqual([]);
  });

  it('does not duplicate assignment ids already on the case', () => {
    const base = stateWithData();
    // First dispatch
    const after1 = reducer(base, dispatchUnitsThunk.fulfilled(
      { caseId: 'case-1', unitIds: ['unit-1'], assignments: [makeAssignment()] },
      'req-1'
    ));
    // Dispatch again (server gives same assignment — shouldn't duplicate)
    const after2 = reducer(after1, dispatchUnitsThunk.fulfilled(
      { caseId: 'case-1', unitIds: ['unit-1'], assignments: [makeAssignment()] },
      'req-2'
    ));
    const theCase = after2.cases.find((c) => c.id === 'case-1');
    expect([...new Set(theCase.assignmentIds)].length).toBe(theCase.assignmentIds.length);
  });
});

// ── cancelAssignmentThunk ─────────────────────────────────────────────────────

describe('cancelAssignmentThunk.fulfilled', () => {
  it('upserts the cancelled assignment and frees the unit', () => {
    const base = stateWithAssignment();
    // Unit should be en_route after dispatch
    expect(base.units.find((u) => u.id === 'unit-1').status).toBe('en_route');

    const cancelled = makeAssignment({ status: 'cancelled' });
    const state = reducer(base, cancelAssignmentThunk.fulfilled(cancelled, 'req'));

    expect(state.assignments.find((a) => a.id === 'assign-1').status).toBe('cancelled');
    expect(state.units.find((u) => u.id === 'unit-1').status).toBe('available');
  });
});

// ── updateAssignmentStatusThunk ───────────────────────────────────────────────

describe('updateAssignmentStatusThunk.fulfilled', () => {
  it('merges the updated assignment and frees unit on completed', () => {
    const base = stateWithAssignment();
    const completed = makeAssignment({ status: 'completed' });

    const state = reducer(base, updateAssignmentStatusThunk.fulfilled(completed, 'req'));
    expect(state.assignments[0].status).toBe('completed');
    expect(state.units.find((u) => u.id === 'unit-1').status).toBe('available');
  });

  it('does not free the unit for intermediate statuses (en_route, on_scene)', () => {
    const base = stateWithAssignment();
    const enRoute = makeAssignment({ status: 'en_route' });

    const state = reducer(base, updateAssignmentStatusThunk.fulfilled(enRoute, 'req'));
    expect(state.units.find((u) => u.id === 'unit-1').status).toBe('en_route'); // already set by dispatch
  });
});

// ── addNoteThunk ──────────────────────────────────────────────────────────────

describe('addNoteThunk.fulfilled', () => {
  it('appends the returned note to the correct case', () => {
    const base = stateWithData();
    const note = { id: 'note-1', authorType: 'dispatcher', authorId: 'dispatcher-uuid', content: 'Victim stable.', createdAt: new Date().toISOString() };

    const state = reducer(base, addNoteThunk.fulfilled({ caseId: 'case-1', note }, 'req'));
    const theCase = state.cases.find((c) => c.id === 'case-1');
    expect(theCase.notes).toHaveLength(1);
    expect(theCase.notes[0].content).toBe('Victim stable.');
  });

  it('deduplicates — does not append a note already present (e.g. from case:updated socket)', () => {
    const base = stateWithData();
    const note = { id: 'note-1', authorType: 'dispatcher', authorId: 'dispatcher-uuid', content: 'Victim stable.', createdAt: new Date().toISOString() };
    // First append via socket (simulated by injecting the note directly)
    const withNote = { ...base, cases: base.cases.map((c) => c.id === 'case-1' ? { ...c, notes: [note] } : c) };

    const state = reducer(withNote, addNoteThunk.fulfilled({ caseId: 'case-1', note }, 'req'));
    expect(state.cases.find((c) => c.id === 'case-1').notes).toHaveLength(1);
  });
});

// ── setCaseStatusThunk ────────────────────────────────────────────────────────

describe('setCaseStatusThunk.fulfilled', () => {
  it('merges the returned case (with updated status) into the list', () => {
    const base = stateWithData();
    const resolved = makeCase({ id: 'case-1', status: 'resolved' });

    const state = reducer(base, setCaseStatusThunk.fulfilled(resolved, 'req'));
    expect(state.cases.find((c) => c.id === 'case-1').status).toBe('resolved');
  });

  it('does not mutate the original cases array', () => {
    const base = stateWithData();
    const original = base.cases;
    reducer(base, setCaseStatusThunk.fulfilled(makeCase({ id: 'case-1', status: 'closed' }), 'req'));
    expect(original[0].status).toBe('queued');
  });
});

// ── selectCaseThunk ───────────────────────────────────────────────────────────

describe('selectCaseThunk', () => {
  it('pending sets selectedCaseId and marks case acknowledged + unread cleared', () => {
    const base = stateWithData();
    const state = reducer(base, selectCaseThunk.pending('req', 'case-1'));

    expect(state.selectedCaseId).toBe('case-1');
    const theCase = state.cases.find((c) => c.id === 'case-1');
    expect(theCase.isUnread).toBe(false);
    expect(theCase.status).toBe('acknowledged');
  });

  it('fulfilled merges full case (with notes + attachments) into the list', () => {
    const base = stateWithData();
    // Set selectedCaseId first via pending
    const pending = reducer(base, selectCaseThunk.pending('req', 'case-1'));
    // Simulate fulfilled with full case including notes
    const fullCase = makeCase({ id: 'case-1', status: 'acknowledged', notes: [{ id: 'n1', authorType: 'system', content: 'Case received', createdAt: new Date().toISOString() }] });
    const state = reducer(pending, selectCaseThunk.fulfilled({ caseId: 'case-1', fullCase }, 'req'));

    const theCase = state.cases.find((c) => c.id === 'case-1');
    expect(theCase.notes).toHaveLength(1);
    expect(theCase.notes[0].id).toBe('n1');
  });
});
