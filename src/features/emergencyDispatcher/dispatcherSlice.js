/**
 * Dispatcher Slice
 *
 * Redux Toolkit slice for the Emergency Dispatcher feature.
 * Replaces the previous mock-data useReducer + ticker simulation in
 * DispatcherProvider.jsx with real REST calls (dispatcherAPI) and
 * Socket.IO realtime event reducers.
 *
 * State shape
 * -----------
 * session        — DispatcherSession | null      (from GET /dispatcher/me)
 * cases          — Case[]                         (from GET /dispatcher/cases + sockets)
 * units          — EmergencyUnit[]                (from GET /dispatcher/units + sockets)
 * stations       — Station[]                      (from GET /dispatcher/stations)
 * assignments    — Assignment[]                   (from POST .../assignments + assignment:updated)
 * selectedCaseId — string | null                  (UI-only)
 * selectedUnitIds— string[]                       (UI-only, for dispatch selection)
 * unitFilter     — { types: string[], availableOnly: boolean }
 * pendingAssignment — { caseId: string } | null   (from dispatcher:assigned socket)
 * status         — 'idle' | 'loading' | 'succeeded' | 'failed'
 * error          — string | null
 *
 * Note on assignments
 * -------------------
 * The backend has no GET /assignments endpoint. Assignment objects are
 * hydrated from two sources only:
 *   1. POST /cases/:id/assignments response (new assignments on dispatch)
 *   2. assignment:updated socket events (status changes from field units / cascades)
 * Pre-existing active cases loaded on startup will NOT have populated Assignment
 * objects until a socket event arrives — the UI handles this gracefully by showing
 * an empty assignments panel in that scenario.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dispatcherAPI } from '@/services/api';

// ── Error normaliser ──────────────────────────────────────────────────────────

function extractError(error) {
  return (
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    'An unexpected error occurred'
  );
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  session: null,
  cases: [],
  units: [],
  stations: [],
  assignments: [],
  selectedCaseId: null,
  selectedUnitIds: [],
  unitFilter: { types: [], availableOnly: false },
  pendingAssignment: null,
  incomingCase: null, // Full Case from case:new; drives the global new-incident alert dialog
  status: 'idle',
  error: null,
};

// ── Async thunks ──────────────────────────────────────────────────────────────

/**
 * Load initial data in parallel: session info, cases list, units, stations.
 * Drives the top-level loading/error state shown in the console.
 */
export const fetchInitialData = createAsyncThunk(
  'dispatcher/fetchInitialData',
  async (_, { rejectWithValue }) => {
    try {
      const [sessionResult, casesResult, units, stations] = await Promise.all([
        dispatcherAPI.getSession(),
        dispatcherAPI.listCases({ status: 'queued,acknowledged,active,escalated', limit: 100 }),
        dispatcherAPI.listUnits(),
        dispatcherAPI.listStations(),
      ]);
      return { session: sessionResult, cases: casesResult.cases, units, stations };
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

/**
 * Select a case: set selectedCaseId, fetch full case detail (notes + attachments),
 * and acknowledge it (idempotent — safe to call even if already acknowledged).
 */
export const selectCaseThunk = createAsyncThunk(
  'dispatcher/selectCase',
  async (caseId, { rejectWithValue }) => {
    try {
      // Fire acknowledge concurrently with full fetch; both resolve to a Case.
      // We use the full-case response (which includes notes) as the source of truth.
      const [fullCase] = await Promise.all([
        dispatcherAPI.getCase(caseId),
        dispatcherAPI.acknowledgeCase(caseId).catch(() => null), // non-fatal if already acked
      ]);
      return { caseId, fullCase };
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

/**
 * Dispatch one or more units to a case.
 * Returns the newly-created Assignment array.
 */
export const dispatchUnitsThunk = createAsyncThunk(
  'dispatcher/dispatchUnits',
  async ({ caseId, unitIds }, { rejectWithValue }) => {
    try {
      const assignments = await dispatcherAPI.assignUnits(caseId, unitIds);
      return { caseId, unitIds, assignments };
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

/**
 * Cancel an in-progress assignment.
 */
export const cancelAssignmentThunk = createAsyncThunk(
  'dispatcher/cancelAssignment',
  async (assignmentId, { rejectWithValue }) => {
    try {
      const assignment = await dispatcherAPI.cancelAssignment(assignmentId);
      return assignment;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

/**
 * Advance an assignment status (forward-only).
 */
export const updateAssignmentStatusThunk = createAsyncThunk(
  'dispatcher/updateAssignmentStatus',
  async ({ assignmentId, status }, { rejectWithValue }) => {
    try {
      const assignment = await dispatcherAPI.updateAssignmentStatus(assignmentId, status);
      return assignment;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

/**
 * Add a dispatcher note to a case.
 */
export const addNoteThunk = createAsyncThunk(
  'dispatcher/addNote',
  async ({ caseId, content }, { rejectWithValue }) => {
    try {
      const note = await dispatcherAPI.addNote(caseId, content);
      return { caseId, note };
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

/**
 * Generic case-status mutation used by escalateCase, resolveCase,
 * markFalseAlarm, and closeCase. The server cascades assignments and units.
 */
export const setCaseStatusThunk = createAsyncThunk(
  'dispatcher/setCaseStatus',
  async ({ caseId, status }, { rejectWithValue }) => {
    try {
      const updatedCase = await dispatcherAPI.setCaseStatus(caseId, status);
      return updatedCase;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Upsert an assignment by id (immutable). */
function upsertAssignment(assignments, incoming) {
  const idx = assignments.findIndex((a) => a.id === incoming.id);
  if (idx === -1) return [...assignments, incoming];
  return assignments.map((a) => (a.id === incoming.id ? { ...a, ...incoming } : a));
}

/** Shallow-merge a partial case update by id. */
function mergeCaseById(cases, partial) {
  return cases.map((c) => (c.id === partial.id ? { ...c, ...partial } : c));
}

// Fields only returned by GET /cases/:id — preserve them when refreshing the list.
const DETAIL_FIELDS = ['notes', 'attachments', 'victim', 'medicalProfile', 'emergencyContacts'];

/**
 * Merge a fresh case list into existing state.
 * List fields (status, severity, etc.) are updated from the fresh list.
 * Detail fields already fetched via selectCaseThunk are preserved.
 * New cases not yet in state are appended.
 */
function mergeListIntoCases(existing, fresh) {
  const existingMap = new Map(existing.map((c) => [c.id, c]));
  return fresh.map((newCase) => {
    const prev = existingMap.get(newCase.id);
    if (!prev) return newCase;
    const preserved = {};
    for (const field of DETAIL_FIELDS) {
      if (field in prev) preserved[field] = prev[field];
    }
    return { ...newCase, ...preserved };
  });
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const dispatcherSlice = createSlice({
  name: 'dispatcher',
  initialState,
  reducers: {
    // ── UI-only reducers (no API calls) ──────────────────────────────────────

    selectUnit(state, action) {
      if (!state.selectedUnitIds.includes(action.payload)) {
        state.selectedUnitIds = [...state.selectedUnitIds, action.payload];
      }
    },
    deselectUnit(state, action) {
      state.selectedUnitIds = state.selectedUnitIds.filter((id) => id !== action.payload);
    },
    clearSelectedUnits(state) {
      state.selectedUnitIds = [];
    },
    setUnitFilter(state, action) {
      state.unitFilter = { ...state.unitFilter, ...action.payload };
    },
    dismissAssignment(state) {
      state.pendingAssignment = null;
    },

    // ── Socket-event reducers ────────────────────────────────────────────────

    /**
     * case:new — a new case entered the queue.
     * Prepend to list only if not already present (dedup guard); merge if the
     * case arrived via both the REST poll and the socket event.
     * Also sets incomingCase to drive the global new-incident alert dialog for
     * ALL connected dispatchers in the dispatcher:global room.
     */
    caseNew(state, action) {
      const incoming = action.payload;
      const existingIdx = state.cases.findIndex((c) => c.id === incoming.id);
      if (existingIdx === -1) {
        state.cases = [incoming, ...state.cases];
      } else {
        // Case arrived via both REST poll and socket — merge, preserving detail fields
        state.cases = state.cases.map((c, i) =>
          i === existingIdx ? { ...c, ...incoming } : c
        );
      }
      // Drive the global alert dialog for every dispatcher in dispatcher:global
      state.incomingCase = incoming;
    },

    /**
     * dismissIncomingCase — called when the dispatcher closes the new-incident dialog.
     */
    dismissIncomingCase(state) {
      state.incomingCase = null;
    },

    /**
     * case:updated — shallow-merge partial case update by id.
     * If the case isn't in our local list yet (shouldn't happen normally), ignore it.
     * Clears incomingCase if the updated case has reached a terminal status — prevents
     * the new-incident dialog from lingering after the case is resolved elsewhere.
     */
    caseUpdated(state, action) {
      const partial = action.payload;
      if (state.cases.some((c) => c.id === partial.id)) {
        state.cases = mergeCaseById(state.cases, partial);
      }
      const TERMINAL = ['resolved', 'closed', 'false_alarm'];
      if (
        state.incomingCase?.id === partial.id &&
        partial.status &&
        TERMINAL.includes(partial.status)
      ) {
        state.incomingCase = null;
      }
    },

    /**
     * unit:location — update unit GPS position.
     * Payload: { unitId, latitude, longitude, lastLocationAt }
     */
    unitLocation(state, action) {
      const { unitId, latitude, longitude, lastLocationAt } = action.payload;
      state.units = state.units.map((u) =>
        u.id === unitId
          ? { ...u, currentLatitude: latitude, currentLongitude: longitude, lastLocationAt }
          : u
      );
    },

    /**
     * unit:status — update unit operational status.
     * Payload: { unitId, status }
     */
    unitStatus(state, action) {
      const { unitId, status } = action.payload;
      state.units = state.units.map((u) =>
        u.id === unitId ? { ...u, status } : u
      );
    },

    /**
     * assignment:updated — upsert assignment by id.
     * Payload: full Assignment object.
     */
    assignmentUpserted(state, action) {
      state.assignments = upsertAssignment(state.assignments, action.payload);
    },

    /**
     * dispatcher:assigned — a case was routed to this dispatcher.
     * Payload: { caseId }
     * Set pendingAssignment (drives NewAssignmentModal) and mark the case.
     */
    dispatcherAssigned(state, action) {
      const { caseId } = action.payload;
      state.pendingAssignment = { caseId };
      state.cases = state.cases.map((c) =>
        c.id === caseId ? { ...c, assignedDispatcherId: state.session?.id ?? null } : c
      );
    },
  },

  extraReducers: (builder) => {
    // ── fetchInitialData ────────────────────────────────────────────────────
    builder.addCase(fetchInitialData.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchInitialData.fulfilled, (state, action) => {
      const { session, cases, units, stations } = action.payload;
      state.status = 'succeeded';
      state.session = session;
      state.cases = mergeListIntoCases(state.cases, cases);
      state.units = units;
      state.stations = stations;
      state.error = null;
    });
    builder.addCase(fetchInitialData.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Failed to load dispatcher data';
    });

    // ── selectCaseThunk ─────────────────────────────────────────────────────
    builder.addCase(selectCaseThunk.pending, (state, action) => {
      // Optimistically set selectedCaseId from the thunk arg so the map
      // highlights immediately without waiting for the network round-trip.
      state.selectedCaseId = action.meta.arg;
      // Mark unread cleared + status acknowledged locally while we wait
      state.cases = state.cases.map((c) =>
        c.id === action.meta.arg
          ? { ...c, isUnread: false, status: c.status === 'queued' ? 'acknowledged' : c.status }
          : c
      );
    });
    builder.addCase(selectCaseThunk.fulfilled, (state, action) => {
      const { caseId, fullCase } = action.payload;
      // Merge full case (with notes + attachments) into the list
      if (state.cases.some((c) => c.id === caseId)) {
        state.cases = mergeCaseById(state.cases, fullCase);
      } else {
        state.cases = [fullCase, ...state.cases];
      }
    });
    // selectCaseThunk rejection is non-fatal; selection stays, case data stays.

    // ── dispatchUnitsThunk ──────────────────────────────────────────────────
    builder.addCase(dispatchUnitsThunk.fulfilled, (state, action) => {
      const { caseId, unitIds, assignments } = action.payload;
      // Append new assignments
      const newAssignmentIds = assignments.map((a) => a.id);
      state.assignments = [...state.assignments, ...assignments];
      // Mark units en_route (server also emits unit:status events, but optimistic update improves feel)
      state.units = state.units.map((u) => (unitIds.includes(u.id) ? { ...u, status: 'en_route' } : u));
      // Link assignment IDs to the case and update status
      state.cases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const mergedIds = [...new Set([...(c.assignmentIds ?? []), ...newAssignmentIds])];
        return {
          ...c,
          assignmentIds: mergedIds,
          status: ['queued', 'acknowledged', 'escalated'].includes(c.status) ? 'active' : c.status,
          isUnread: false,
        };
      });
      // Clear unit selection
      state.selectedUnitIds = [];
    });

    // ── cancelAssignmentThunk ───────────────────────────────────────────────
    builder.addCase(cancelAssignmentThunk.fulfilled, (state, action) => {
      state.assignments = upsertAssignment(state.assignments, action.payload);
      // Server also emits unit:status, but optimistically free the unit
      const assignment = action.payload;
      if (assignment.status === 'cancelled') {
        state.units = state.units.map((u) =>
          u.id === assignment.unitId ? { ...u, status: 'available' } : u
        );
      }
    });

    // ── updateAssignmentStatusThunk ─────────────────────────────────────────
    builder.addCase(updateAssignmentStatusThunk.fulfilled, (state, action) => {
      state.assignments = upsertAssignment(state.assignments, action.payload);
      // Free unit when assignment completed
      const assignment = action.payload;
      if (assignment.status === 'completed') {
        state.units = state.units.map((u) =>
          u.id === assignment.unitId ? { ...u, status: 'available' } : u
        );
      }
    });

    // ── addNoteThunk ────────────────────────────────────────────────────────
    builder.addCase(addNoteThunk.fulfilled, (state, action) => {
      const { caseId, note } = action.payload;
      state.cases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const existingNotes = c.notes ?? [];
        // Deduplicate by id in case case:updated socket already appended it
        if (existingNotes.some((n) => n.id === note.id)) return c;
        return { ...c, notes: [...existingNotes, note] };
      });
    });

    // ── setCaseStatusThunk ──────────────────────────────────────────────────
    builder.addCase(setCaseStatusThunk.fulfilled, (state, action) => {
      const updatedCase = action.payload;
      state.cases = mergeCaseById(state.cases, updatedCase);
      // Server emits case:updated + assignment:updated × N + unit:status × N;
      // those socket events will reconcile assignments + units automatically.
    });
  },
});

export const {
  selectUnit,
  deselectUnit,
  clearSelectedUnits,
  setUnitFilter,
  dismissAssignment,
  caseNew,
  dismissIncomingCase,
  caseUpdated,
  unitLocation,
  unitStatus,
  assignmentUpserted,
  dispatcherAssigned,
} = dispatcherSlice.actions;

export default dispatcherSlice.reducer;
