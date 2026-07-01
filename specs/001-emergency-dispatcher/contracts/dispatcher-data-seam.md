# Contract: `useDispatcherData` data-access seam

This feature has no external HTTP/WebSocket interface in this phase (UI shell only).
The internal contract that matters is the **hook interface** every page/component
consumes — `src/features/emergencyDispatcher/hooks/useDispatcherData.js`. This contract
is what the future Redux-slice + API + socket implementation must satisfy unchanged, so
consuming components require no rework when the real backend lands.

## Return shape

```ts
{
  // data
  cases: Case[],                 // see data-model.md
  units: EmergencyUnit[],
  selectedCase: Case | null,
  assignments: DispatchAssignment[],   // all assignments for selectedCase
  selectedUnitIds: string[],     // currently checked in NearestUnitsPanel
  unitFilter: { types: UnitType[], availableOnly: boolean },

  // status
  loading: boolean,
  error: string | null,

  // actions — all immutable; each returns void and updates state synchronously
  // (the real implementation will make these async; callers must not assume
  // synchronous completion beyond "the UI optimistically reflects the change")
  selectCase(caseId: string): void,
  selectUnit(unitId: string): void,
  deselectUnit(unitId: string): void,
  clearSelectedUnits(): void,
  setUnitFilter(filter: Partial<UnitFilter>): void,

  dispatchUnits(caseId: string, unitIds: string[]): void,
  cancelAssignment(assignmentId: string): void,
  updateAssignmentStatus(assignmentId: string, status: AssignmentStatus): void,

  addNote(caseId: string, content: string): void,
  escalateCase(caseId: string): void,
  closeCase(caseId: string): void,
}
```

## Behavioral guarantees (must hold for both the mock and the future real implementation)

1. **`dispatchUnits`** creates one `DispatchAssignment` per unit id (status `notified`),
   sets each unit's `status` to `en_route` ... wait: per data-model, dispatch starts at
   `notified`; the *unit* itself moves to `en_route` only once the assignment progresses
   past `notified` — see note below. It always also appends one `system` `CaseNote`
   summarizing which units were dispatched (FR-013).
2. **`cancelAssignment`** is only callable when the assignment's status is `notified` or
   `en_route`; it sets the assignment to `cancelled` and returns the linked unit to
   `available` (FR-011).
3. **`updateAssignmentStatus`** enforces forward-only transitions
   (`notified → en_route → on_scene → completed`); reaching `completed` returns the
   linked unit to `available` (FR-012).
4. **`closeCase`** force-transitions every non-terminal assignment on that case to
   `completed`, returns every involved unit to `available`, sets the case `status` to
   `closed`, and appends a `system` note (FR-016).
5. **`escalateCase`** sets a case-level escalation flag/status and appends a `system`
   note (FR-015); it does not otherwise change case `status`.
6. **`addNote`** appends a `dispatcher`-authored `CaseNote` with the current timestamp
   (FR-013).
7. Every mutating action is **immutable** — callers receive new array/object references,
   never mutated originals (Constitution Principle II).

**Note on unit status vs. assignment status**: the spec's example timeline shows a unit
moving to "EN ROUTE" immediately upon dispatch (Section 6, example UI). This phase
therefore treats `dispatchUnits` as also moving the unit's own `status` to `en_route`
immediately (skipping a separately-surfaced unit-level "notified" state), while the
*assignment* record still starts at `notified` and is advanced explicitly by
`updateAssignmentStatus` to `en_route`/`on_scene`/`completed`. This reconciles FR-010
("track... through notified, en route...") with the unit-marker map needing an
immediate visual change on dispatch. Document this explicitly if the real backend
models it differently when the swap happens.

## Swap path (not built this phase, documented for the next one)

Replace the hook body only:
- `cases`/`units`/`assignments` ← `useSelector` against a new `dispatcherSlice.js`
  (mirrors `src/features/nodeMaintainer/nodesSlice.js`: thunks + `extraReducers` +
  selectors, registered in `src/app/store.js`).
- Mutating actions ← `dispatch(...)` thunks calling new methods on
  `src/services/api.js` (a new `dispatcherAPI`/`emergencyUnitsAPI` namespace using the
  shared `api` client — never raw axios, per Constitution Principle IV).
- Live updates ← new `socketService.js` listeners (`unit_location_update`,
  `unit_status_change`, `dispatch_confirmed`, reusing existing `sos_received`/
  `incident-assigned`), wired via a hook modeled on `useNodeHeartbeat.js`.

No consuming component (`CaseListPage`, `CaseDetailPage`, or any child component) should
need to change for this swap, because they only ever call `useDispatcherData()`.
