/**
 * DispatcherProvider
 *
 * Orchestrates the Emergency Dispatcher feature:
 *   - Dispatches fetchInitialData on mount (REST: session, cases, units, stations).
 *   - Subscribes to Socket.IO dispatcher events for real-time updates.
 *   - Assembles the identical seam value that all consumer components expect via
 *     useDispatcherData() — shape is the contract; the implementation behind it changed.
 *
 * Previous implementation used a local useReducer + setInterval ticker simulation.
 * That has been fully replaced by this Redux-backed, socket-wired version.
 */

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInitialData,
  selectCaseThunk,
  dispatchUnitsThunk,
  cancelAssignmentThunk,
  updateAssignmentStatusThunk,
  addNoteThunk,
  setCaseStatusThunk,
  selectUnit,
  deselectUnit,
  clearSelectedUnits,
  setUnitFilter,
  dismissAssignment,
  dismissIncomingCase,
  caseNew,
  caseUpdated,
  unitLocation,
  unitStatus,
  assignmentUpserted,
  dispatcherAssigned,
} from '../dispatcherSlice';
import {
  initSocket,
  onCaseNew,
  offCaseNew,
  onCaseUpdated,
  offCaseUpdated,
  onUnitLocation,
  offUnitLocation,
  onUnitStatus,
  offUnitStatus,
  onAssignmentUpdated,
  offAssignmentUpdated,
  onDispatcherAssigned,
  offDispatcherAssigned,
} from '@/services/socketService';

export const DispatcherContext = createContext(null);

export function useDispatcherContext() {
  const ctx = useContext(DispatcherContext);
  if (!ctx) throw new Error('useDispatcherContext must be used inside DispatcherProvider');
  return ctx;
}

export function DispatcherProvider({ children }) {
  const dispatch = useDispatch();
  const sliceState = useSelector((state) => state.dispatcher);

  // ── Bootstrap: fetch initial data + wire socket events on mount ──────────

  useEffect(() => {
    dispatch(fetchInitialData());

    // Ensure socket is initialised (singleton — safe to call multiple times)
    initSocket();

    // Socket event handlers — each dispatches the matching slice reducer
    const handleCaseNew        = (payload) => dispatch(caseNew(payload));
    const handleCaseUpdated    = (payload) => dispatch(caseUpdated(payload));
    const handleUnitLocation   = (payload) => dispatch(unitLocation(payload));
    const handleUnitStatus     = (payload) => dispatch(unitStatus(payload));
    const handleAssignment     = (payload) => dispatch(assignmentUpserted(payload));
    const handleDispAssigned   = (payload) => dispatch(dispatcherAssigned(payload));

    onCaseNew(handleCaseNew);
    onCaseUpdated(handleCaseUpdated);
    onUnitLocation(handleUnitLocation);
    onUnitStatus(handleUnitStatus);
    onAssignmentUpdated(handleAssignment);
    onDispatcherAssigned(handleDispAssigned);

    return () => {
      offCaseNew(handleCaseNew);
      offCaseUpdated(handleCaseUpdated);
      offUnitLocation(handleUnitLocation);
      offUnitStatus(handleUnitStatus);
      offAssignmentUpdated(handleAssignment);
      offDispatcherAssigned(handleDispAssigned);
    };
  }, [dispatch]);

  // ── Derived values ───────────────────────────────────────────────────────

  const selectedCase = useMemo(
    () => sliceState.cases.find((c) => c.id === sliceState.selectedCaseId) ?? null,
    [sliceState.cases, sliceState.selectedCaseId]
  );

  const assignments = useMemo(
    () => sliceState.assignments.filter((a) => a.caseId === sliceState.selectedCaseId),
    [sliceState.assignments, sliceState.selectedCaseId]
  );

  const assignedToMe = useMemo(
    () => sliceState.cases.filter((c) => c.assignedDispatcherId === sliceState.session?.id),
    [sliceState.cases, sliceState.session]
  );

  // ── Bound action callbacks ───────────────────────────────────────────────

  const selectCase = useCallback(
    (caseId) => dispatch(selectCaseThunk(caseId)),
    [dispatch]
  );
  const selectUnitCb = useCallback(
    (unitId) => dispatch(selectUnit(unitId)),
    [dispatch]
  );
  const deselectUnitCb = useCallback(
    (unitId) => dispatch(deselectUnit(unitId)),
    [dispatch]
  );
  const clearSelectedUnitsCb = useCallback(
    () => dispatch(clearSelectedUnits()),
    [dispatch]
  );
  const setUnitFilterCb = useCallback(
    (filter) => dispatch(setUnitFilter(filter)),
    [dispatch]
  );
  const dispatchUnits = useCallback(
    (caseId, unitIds) => dispatch(dispatchUnitsThunk({ caseId, unitIds })),
    [dispatch]
  );
  const cancelAssignment = useCallback(
    (assignmentId) => dispatch(cancelAssignmentThunk(assignmentId)),
    [dispatch]
  );
  const updateAssignmentStatus = useCallback(
    (assignmentId, status) => dispatch(updateAssignmentStatusThunk({ assignmentId, status })),
    [dispatch]
  );
  const addNote = useCallback(
    (caseId, content) => dispatch(addNoteThunk({ caseId, content })),
    [dispatch]
  );
  const escalateCase = useCallback(
    (caseId) => dispatch(setCaseStatusThunk({ caseId, status: 'escalated' })),
    [dispatch]
  );
  const resolveCase = useCallback(
    (caseId) => dispatch(setCaseStatusThunk({ caseId, status: 'resolved' })),
    [dispatch]
  );
  const markFalseAlarm = useCallback(
    (caseId) => dispatch(setCaseStatusThunk({ caseId, status: 'false_alarm' })),
    [dispatch]
  );
  const closeCase = useCallback(
    (caseId) => dispatch(setCaseStatusThunk({ caseId, status: 'closed' })),
    [dispatch]
  );
  const dismissAssignmentCb = useCallback(
    () => dispatch(dismissAssignment()),
    [dispatch]
  );
  const dismissIncomingCaseCb = useCallback(
    () => dispatch(dismissIncomingCase()),
    [dispatch]
  );

  // ── Context value (identical seam shape — consumers unchanged) ───────────

  const value = useMemo(
    () => ({
      // Data
      cases: sliceState.cases,
      units: sliceState.units,
      stations: sliceState.stations,
      selectedCase,
      assignments,
      allAssignments: sliceState.assignments,
      selectedUnitIds: sliceState.selectedUnitIds,
      unitFilter: sliceState.unitFilter,
      pendingAssignment: sliceState.pendingAssignment,
      incomingCase: sliceState.incomingCase,
      // Status (replaces hardcoded false/null from mock era)
      loading: sliceState.status === 'loading',
      error: sliceState.error,
      // Session (replaces hardcoded CURRENT_DISPATCHER)
      currentDispatcher: sliceState.session,
      assignedToMe,
      // Actions
      selectCase,
      selectUnit: selectUnitCb,
      deselectUnit: deselectUnitCb,
      clearSelectedUnits: clearSelectedUnitsCb,
      setUnitFilter: setUnitFilterCb,
      dispatchUnits,
      cancelAssignment,
      updateAssignmentStatus,
      addNote,
      escalateCase,
      resolveCase,
      markFalseAlarm,
      closeCase,
      dismissAssignment: dismissAssignmentCb,
      dismissIncomingCase: dismissIncomingCaseCb,
    }),
    [
      sliceState.cases,
      sliceState.units,
      sliceState.stations,
      sliceState.assignments,
      sliceState.selectedUnitIds,
      sliceState.unitFilter,
      sliceState.pendingAssignment,
      sliceState.incomingCase,
      sliceState.status,
      sliceState.error,
      sliceState.session,
      selectedCase,
      assignments,
      assignedToMe,
      selectCase,
      selectUnitCb,
      deselectUnitCb,
      clearSelectedUnitsCb,
      setUnitFilterCb,
      dispatchUnits,
      cancelAssignment,
      updateAssignmentStatus,
      addNote,
      escalateCase,
      resolveCase,
      markFalseAlarm,
      closeCase,
      dismissAssignmentCb,
      dismissIncomingCaseCb,
    ]
  );

  return (
    <DispatcherContext.Provider value={value}>
      {children}
    </DispatcherContext.Provider>
  );
}
