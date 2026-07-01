# Tasks: Emergency Dispatcher Dashboard

**Input**: Design documents from `/specs/001-emergency-dispatcher/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/dispatcher-data-seam.md, quickstart.md

**Tests**: Included. Constitution Principle III ("Test Coverage Is a Tracked Debt, Not
an Afterthought — NON-NEGOTIABLE") requires real tests for every pure-logic module this
feature adds. Per `research.md`'s scope decision, that means unit tests for
`haversine.js`, `dispatchDefaults.js`, `caseFormatters.js`, and the `useDispatcherData`
reducer's transition logic — run via `npx vitest`, no new jsdom/RTL config required.
Presentational components are not unit-tested in this phase (the pre-existing,
separately tracked gap in `docs/plan.md`); they're verified via the `quickstart.md`
browser walkthrough instead.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Single-project web frontend. All paths are relative to the repository root, primarily
under `src/features/emergencyDispatcher/` and `src/shared/utils/`, per `plan.md`'s
Project Structure.

---

## Phase 1: Setup

**Purpose**: Feature scaffolding and the minimal app-shell touch points needed before
any story-specific code exists.

- [X] T001 Create the `src/features/emergencyDispatcher/` folder skeleton
  (`pages/`, `components/`, `components/badges/`, `hooks/`, `data/`, `utils/`) per
  `plan.md`'s Project Structure.
- [X] T002 [P] Register new FontAwesome icons (`headset`, `truck-medical`, `car`,
  `fire`, `people-roof`, `location-dot`, `phone`, `route`, `filter`, `xmark`,
  `circle-check`, `clock`, `up-right-from-square`) in `src/icons.js`.
- [X] T003 [P] Add a `Cases` nav item (`{ label: 'Cases', icon: 'headset', path: '/cases' }`)
  to the `emergency_dispatcher` and `admin` `navItems`, and set
  `emergency_dispatcher.defaultPath` to `/cases`, in `src/config/navigation.js`.
- [X] T004 [P] Add lazy-loaded routes `path="cases"` → `CaseListPage` and
  `path="cases/:caseType/:caseId"` → `CaseDetailPage`, each wrapped in
  `ProtectedRoute allowedRoles={['admin','emergency_dispatcher']}`, in `src/App.jsx`.

**Checkpoint**: App shell can route to (still-empty) Cases pages for the dispatcher role.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared data, logic, and primitives every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Write failing unit tests for great-circle distance and nearest-first
  ranking in `src/shared/utils/haversine.test.js` (known coordinate pairs → expected
  km; identical points → ~0).
- [X] T006 [P] Implement `src/shared/utils/haversine.js` to make T005 pass.
- [X] T007 [P] Create SOS-case and incident mock fixtures (realistic Ismailia-highway
  coordinates, full range of severities/statuses/edge cases per `data-model.md`'s Case
  entity, including at least one case with no medical profile and one with no victim
  phone) in `src/features/emergencyDispatcher/data/mockCases.js`.
- [X] T008 [P] Create emergency-unit mock fixtures (mix of types/statuses, some
  `off_duty`, positioned near the mock cases, per `data-model.md`'s EmergencyUnit
  entity) in `src/features/emergencyDispatcher/data/mockUnits.js`.
- [X] T009 [P] Write failing unit tests for default-unit-type selection per case/
  emergency type (the type→units table from the design brief, e.g. Medical→Ambulance,
  Road accident→Ambulance+Police+Civil Protection) in
  `src/features/emergencyDispatcher/data/dispatchDefaults.test.js`.
- [X] T010 [P] Implement `src/features/emergencyDispatcher/data/dispatchDefaults.js` to
  make T009 pass (FR-008).
- [X] T011 [P] Write failing unit tests for severity/status/unit-type → token+label
  formatting in `src/features/emergencyDispatcher/utils/caseFormatters.test.js`.
- [X] T012 [P] Implement `src/features/emergencyDispatcher/utils/caseFormatters.js` to
  make T011 pass, mapping every enum value from `data-model.md` to a `safe-*` Tailwind
  token and a display label (no raw hex, per Constitution Principle II / DESIGN.md).
- [X] T013 Write failing unit tests for the `useDispatcherData` seam's core state and
  transitions — `selectCase`, `selectUnit`/`deselectUnit`/`clearSelectedUnits`,
  `setUnitFilter`, and `dispatchUnits` (including the immutability guarantee and the
  unit-status-on-dispatch behavior documented in `contracts/dispatcher-data-seam.md`) —
  in `src/features/emergencyDispatcher/hooks/useDispatcherData.test.js`.
- [X] T014 Implement the core of `src/features/emergencyDispatcher/hooks/useDispatcherData.js`
  to make T013 pass: a `useReducer`-backed hook seeded from T007/T008's fixtures,
  returning the shape defined in `contracts/dispatcher-data-seam.md` (depends on T006,
  T007, T008, T013).
- [X] T015 [P] Build `SeverityBadge`, `UnitStatusBadge`, and `CaseTypeBadge` in
  `src/features/emergencyDispatcher/components/badges/`, using `caseFormatters` (T012)
  and the existing `Badge`/`Tag` primitives — no new styling primitives.

**Checkpoint**: Foundation ready — mock data, ranking logic, the data seam, and shared
badges all exist and are tested. User story implementation can now begin.

---

## Phase 3: User Story 1 - Triage a case and dispatch the nearest units (Priority: P1) 🎯 MVP

**Goal**: A dispatcher can open the case list, open a case, see ranked nearby emergency
units on a live map with a sensible default selection, and dispatch them after explicit
confirmation.

**Independent Test**: Open a case from the list, confirm the map shows ranked nearby
units with a default selection, override the selection, confirm dispatch — and see the
dispatch reflected as an active assignment with a logged system note. Delivers the
core "help is on the way" value with no dependency on US2/US3.

### Implementation for User Story 1

- [X] T016 [P] [US1] Build `CaseListTabs` (SOS Cases / Incidents tabs with unread-count
  badges, FR-001/FR-003) in `src/features/emergencyDispatcher/components/CaseListTabs.jsx`.
- [X] T017 [P] [US1] Build `CaseCard` (SOS and incident row variants; severity/type
  badges via T015; unread visual state; no side-stripe borders per DESIGN.md) in
  `src/features/emergencyDispatcher/components/CaseCard.jsx`.
- [X] T018 [US1] Build `CaseListPage` (loading skeleton / empty / error / populated
  states per FR-017, newest-first sort per FR-001, new-case entrance animation with a
  `prefers-reduced-motion` fallback) composing `CaseListTabs` + `CaseCard` +
  `useDispatcherData`, in `src/features/emergencyDispatcher/pages/CaseListPage.jsx`
  (depends on T014, T016, T017).
- [X] T019 [P] [US1] Build `CaseInfoPanel` (severity/type badges, live "time since
  received" counter) in `src/features/emergencyDispatcher/components/CaseInfoPanel.jsx`.
- [X] T020 [P] [US1] Build `VictimProfilePanel` (identification, collapsible medical
  profile with explicit "No medical profile on file" empty state, emergency contacts,
  `tel:` links, explicit "no phone on file" state — FR-004) in
  `src/features/emergencyDispatcher/components/VictimProfilePanel.jsx`.
- [X] T021 [P] [US1] Build `IncidentInfoPanel` (type, detection confidence, affected
  lanes, detection source — FR-005) in
  `src/features/emergencyDispatcher/components/IncidentInfoPanel.jsx`.
- [X] T022 [P] [US1] Build `UnitMarker` (type icon + status color per
  `caseFormatters`/T012) and `UnitPopover` (name, status, distance, ETA on click) in
  `src/features/emergencyDispatcher/components/UnitMarker.jsx` and
  `src/features/emergencyDispatcher/components/UnitPopover.jsx`.
- [X] T023 [P] [US1] Build `MapControls` (unit-type/status filters, zoom-to-incident,
  zoom-to-all-units, distance-ring toggle) in
  `src/features/emergencyDispatcher/components/MapControls.jsx`.
- [X] T024 [US1] Build `DispatchMap` — MapLibre/`react-map-gl` dark raster basemap
  (per `research.md`), controlled `viewState` auto-centered on the case location,
  incident pin, `UnitMarker`s, `MapControls` — in
  `src/features/emergencyDispatcher/components/DispatchMap.jsx` (depends on T022,
  T023; FR-006).
- [X] T025 [US1] Build `NearestUnitsPanel` — Haversine-ranked (T006) available-units
  list, default selection from `dispatchDefaults` (T010), dispatcher-overridable
  checkboxes via the existing `Checkbox` primitive, Dispatch button disabled at zero
  selection — in `src/features/emergencyDispatcher/components/NearestUnitsPanel.jsx`
  (depends on T006, T010, T014; FR-007, FR-008, FR-009).
- [X] T026 [US1] Build `DispatchConfirmModal` (lists selected units, confirms via
  `useDispatcherData().dispatchUnits`, uses the real `Modal` `open`/`size` API) in
  `src/features/emergencyDispatcher/components/DispatchConfirmModal.jsx` (depends on
  T014, T025; FR-009).
- [X] T027 [US1] Build `CaseDetailPage` — 3-column layout at `≥xl`
  (info | map | dispatch), map-first stacked layout below `xl` — composing
  `CaseInfoPanel`/`VictimProfilePanel`/`IncidentInfoPanel`, `DispatchMap`,
  `NearestUnitsPanel`, and `DispatchConfirmModal` — in
  `src/features/emergencyDispatcher/pages/CaseDetailPage.jsx` (depends on T019–T026).
- [X] T028 [US1] Wire `CaseListPage` row clicks to navigate to
  `/cases/:caseType/:caseId` rendering `CaseDetailPage`, and confirm `selectCase` is
  called on mount, in `src/App.jsx` / `CaseListPage.jsx` / `CaseDetailPage.jsx`
  (depends on T004, T018, T027).

**Checkpoint**: User Story 1 is fully functional and independently testable —
`quickstart.md` scenarios 1–3 all pass.

---

## Phase 4: User Story 2 - Track dispatched units through to resolution (Priority: P2)

**Goal**: The dispatcher can see live status of every unit dispatched to a case and
cancel or complete assignments as the response progresses.

**Independent Test**: Dispatch units (reusing US1), then advance/cancel their status
from the case detail screen and confirm the displayed status — and the unit's
availability elsewhere — updates accordingly.

### Implementation for User Story 2

- [X] T029 [US2] Extend `useDispatcherData` with `cancelAssignment` (only from
  `notified`/`en_route`, returns the unit to `available`) and
  `updateAssignmentStatus` (forward-only `notified → en_route → on_scene → completed`,
  returns the unit to `available` on `completed`), with tests added to
  `useDispatcherData.test.js` before the implementation change, in
  `src/features/emergencyDispatcher/hooks/useDispatcherData.js` (depends on T014;
  FR-010, FR-011, FR-012).
- [X] T030 [P] [US2] Build `ActiveAssignmentsPanel` (per-unit status badge via T015,
  "Cancel Dispatch" while `en_route`, "Mark Completed" while `on_scene`) in
  `src/features/emergencyDispatcher/components/ActiveAssignmentsPanel.jsx` (depends on
  T029).
- [X] T031 [US2] Integrate `ActiveAssignmentsPanel` into `CaseDetailPage`'s dispatch
  column, below `NearestUnitsPanel`, reflecting `assignments` from `useDispatcherData`
  in `src/features/emergencyDispatcher/pages/CaseDetailPage.jsx` (depends on T027,
  T030).

**Checkpoint**: User Stories 1 AND 2 both work independently — `quickstart.md`
scenario 4 passes.

---

## Phase 5: User Story 3 - Coordinate case follow-through and closure (Priority: P3)

**Goal**: The dispatcher can log notes, call back the victim, escalate, and close a
case, with every action recorded in its activity history.

**Independent Test**: On any open case, add a note, open the callback flow, escalate,
and close the case — confirm the case's history reflects each action and closing
resolves all open assignments.

### Implementation for User Story 3

- [X] T032 [US3] Extend `useDispatcherData` with `addNote` (timestamped, appended to
  `case.notes`), `escalateCase` (sets the escalated flag + system note), and
  `closeCase` (force-completes every non-terminal assignment on the case, returns
  involved units to `available`, sets case status `closed`, system note), with tests
  added to `useDispatcherData.test.js` before the implementation change, in
  `src/features/emergencyDispatcher/hooks/useDispatcherData.js` (depends on T029;
  FR-013, FR-015, FR-016).
- [X] T033 [P] [US3] Build `CaseNotesPanel` (note input + chronological timeline,
  visually distinguishing dispatcher-authored vs. system-logged entries — FR-013) in
  `src/features/emergencyDispatcher/components/CaseNotesPanel.jsx` (depends on T032).
- [X] T034 [P] [US3] Build `CallbackModal` (victim phone number, `tel:` link, outcome
  field that calls `addNote` on submit, explicit "no phone on file" state — FR-014) in
  `src/features/emergencyDispatcher/components/CallbackModal.jsx` (depends on T032).
- [X] T035 [US3] Build `CaseActionsBar` (Escalate, Call Back, Close — each with a
  confirm step; Close's confirm copy states that all active assignments will be marked
  completed — FR-015, FR-016) in
  `src/features/emergencyDispatcher/components/CaseActionsBar.jsx` (depends on T032,
  T034).
- [X] T036 [US3] Integrate `CaseNotesPanel` (full-width, below the 3-column layout) and
  `CaseActionsBar` (sticky) into `CaseDetailPage` in
  `src/features/emergencyDispatcher/pages/CaseDetailPage.jsx` (depends on T027, T033,
  T035).

**Checkpoint**: All user stories are independently functional — `quickstart.md`
scenario 5 passes; the full spec is satisfied.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and documentation across all three stories.

- [X] T037 [P] Add an optional mock event ticker (interval-driven, behind a flag) that
  nudges `en_route` units' coordinates and probabilistically advances assignment status,
  in `src/features/emergencyDispatcher/hooks/useDispatcherData.js` (per `research.md`'s
  simulated-live-movement decision).
- [X] T038 [P] Add `prefers-reduced-motion` alternatives for every animation introduced
  in this feature (case-list entrance, marker movement, unread/live pulse indicators)
  across `src/features/emergencyDispatcher/components/`.
- [X] T039 Run an Impeccable `polish`/`audit`/`harden` pass on the full feature: verify
  ≥4.5:1 contrast, visible focus states, and correct layout at `sm`/`md`/`lg`/`xl`
  breakpoints.
- [X] T040 [P] Update `docs/plan.md` (move Emergency Dispatcher from "Not started" to
  "Completed") and add `docs/features/emergencyDispatcher.md`, per Constitution
  Principle I.
- [X] T041 Run `npx vitest run src/shared/utils/haversine.test.js` and
  `npx vitest run src/features/emergencyDispatcher` (all tests from T005, T009, T011,
  T013, T029, T032 must pass) and `npm run build`; fix any failures before considering
  the feature done.
- [X] T042 Execute every scenario in `quickstart.md` end-to-end in the browser
  (`npm run dev`, sign in as `emergency_dispatcher`) and confirm each passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Foundational; extends the seam and the
  `CaseDetailPage` built in US1 (T027), but is independently testable once US1 exists.
- **User Story 3 (Phase 5)**: Depends on Foundational and on US2's seam extension
  (T029 → T032 chain), and integrates into `CaseDetailPage` (T027), but is
  independently testable once US1+US2 exist.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each Phase

- Tests are written and must fail before their corresponding implementation task
  (T005→T006, T009→T010, T011→T012, T013→T014, and the test-then-extend pattern in
  T029 and T032).
- Data/logic before components; components before page composition; page composition
  before route wiring.

### Parallel Opportunities

- T002, T003, T004 (Setup) can run in parallel — different files.
- T005, T007, T008, T009, T011 (Foundational tests/fixtures with no
  cross-dependencies) can run in parallel.
- T015 can run in parallel with the seam work (T013/T014) once T012 is done.
- Within US1: T016, T017 in parallel; then T019, T020, T021, T022, T023 in parallel
  (all independent presentational components) before T024/T025 combine them.
- T030 (US2) and T033/T034 (US3) are each parallelizable within their own phase.

---

## Parallel Example: Foundational Phase

```bash
# Launch independent foundational tests/fixtures together:
Task: "Write failing unit tests for haversine in src/shared/utils/haversine.test.js"
Task: "Create SOS-case and incident mock fixtures in .../data/mockCases.js"
Task: "Create emergency-unit mock fixtures in .../data/mockUnits.js"
Task: "Write failing unit tests for dispatchDefaults in .../data/dispatchDefaults.test.js"
Task: "Write failing unit tests for caseFormatters in .../utils/caseFormatters.test.js"
```

## Parallel Example: User Story 1 presentational components

```bash
Task: "Build CaseInfoPanel in .../components/CaseInfoPanel.jsx"
Task: "Build VictimProfilePanel in .../components/VictimProfilePanel.jsx"
Task: "Build IncidentInfoPanel in .../components/IncidentInfoPanel.jsx"
Task: "Build UnitMarker + UnitPopover in .../components/UnitMarker.jsx, UnitPopover.jsx"
Task: "Build MapControls in .../components/MapControls.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1).
3. **STOP and VALIDATE**: run `quickstart.md` scenarios 1–3, run `npx vitest`.
4. This is a demoable MVP: a dispatcher can triage and dispatch.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → validate → demo (MVP).
3. User Story 2 → validate (`quickstart.md` scenario 4) → demo.
4. User Story 3 → validate (`quickstart.md` scenario 5) → demo.
5. Polish (Phase 6) → ship.

Each increment matches a phase in the originally approved design brief
(`/home/nasser/.claude/plans/emergency-dispatcher-dashboard-bright-sphinx.md`): Phase 1
there ≈ Setup+Foundational+US1's list half; Phase 2 there ≈ US1's detail/dispatch half;
Phase 3 there ≈ US2+US3+Polish here.

## Notes

- [P] tasks touch different files with no unmet dependency.
- Commit after each task or logical group, per repository convention
  (`feat|fix|refactor|docs|test: description`).
- Every test task must be observed failing before its implementation task lands,
  per Constitution Principle III.
- Avoid: vague tasks, same-file conflicts marked `[P]`, and cross-story dependencies
  that would break a story's independent testability.
