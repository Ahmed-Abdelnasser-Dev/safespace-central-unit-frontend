# Feature: emergency-dispatcher

**Status:** Completed (UI shell — mock data, no backend wired yet)
**Path:** `src/features/emergencyDispatcher/`
**Redux slice:** None — state lives in `useDispatcherData` hook (`useReducer`-backed seam)
**Access:** `emergency_dispatcher` and `admin` roles only (route guard via `ProtectedRoute`)

---

## Purpose

Gives emergency dispatchers a single screen to triage incoming SOS requests and
automatically-detected highway incidents, dispatch the nearest emergency units (ranked
by Haversine great-circle distance), track unit status through to on-scene completion,
log notes and callbacks, escalate, and close cases.

---

## User Stories

| Story | Description |
|-------|-------------|
| US1 | Triage a case and dispatch the nearest units (MVP) |
| US2 | Track dispatched units through to resolution |
| US3 | Coordinate case follow-through and closure |

---

## Files

```
src/features/emergencyDispatcher/
  pages/
    CaseListPage.jsx            — Tabbed SOS/Incidents list; newest-first; skeleton/empty/error states
    CaseDetailPage.jsx          — 3-column layout (info | map | dispatch) at ≥xl; stacked below xl
  components/
    CaseListTabs.jsx            — Tab switcher with unread-count badges
    CaseCard.jsx                — Dense list row; unread ring+pulse; no side-stripe border
    CaseInfoPanel.jsx           — Severity/type/status badges + live "time since received" counter
    VictimProfilePanel.jsx      — Identification, collapsible medical profile, emergency contacts, tel: links
    IncidentInfoPanel.jsx       — Type, detection confidence, affected lanes, source
    DispatchMap.jsx             — MapLibre dark-matter basemap; incident pin; unit markers; route lines
    UnitMarker.jsx              — Type icon + status-color dot; home-base variant
    UnitPopover.jsx             — Name, status, distance, ETA on unit click
    MapControls.jsx             — Unit type/status filters; zoom-to-incident; zoom-to-all; distance rings
    NearestUnitsPanel.jsx       — Haversine-ranked unit list; default selection from dispatchDefaults; Dispatch button
    DispatchConfirmModal.jsx    — Confirm step before dispatch; lists selected units
    ActiveAssignmentsPanel.jsx  — Per-assignment status badge; Cancel / Mark Completed actions
    CaseNotesPanel.jsx          — Free-text note input + chronological timeline (dispatcher vs system entries)
    CallbackModal.jsx           — Victim phone + tel: link + outcome field → logged as note
    CaseActionsBar.jsx          — Escalate / Call Back / Close, each with a confirm step
    badges/
      SeverityBadge.jsx         — HIGH/MEDIUM/LOW → safe-* Badge variant
      UnitStatusBadge.jsx       — available/en_route/on_scene/off_duty → safe-* Badge variant
      CaseTypeBadge.jsx         — sos/incident + emergencyType label
  hooks/
    useDispatcherData.js        — useReducer seam; all state transitions; optional mock ticker
    useDispatcherData.test.js   — 38 unit tests covering all reducer actions
  data/
    mockCases.js                — Realistic Ismailia-highway SOS + incident fixtures
    mockUnits.js                — Ambulance/police/civil-protection fixtures (mix of statuses)
    dispatchDefaults.js         — emergencyType → recommended unit types mapping
    dispatchDefaults.test.js    — Unit tests for default-unit-type selection
  utils/
    caseFormatters.js           — Enum → safe-* token + display label (severity, status, unit type)
    caseFormatters.test.js      — Unit tests for all formatters

src/shared/utils/
  haversine.js                  — Great-circle distance + rankByDistance
  haversine.test.js             — Unit tests for distance calculation and ranking
```

---

## How it works

### Routing

```
/cases                          → CaseListPage  (emergency_dispatcher, admin)
/cases/:caseType/:caseId        → CaseDetailPage (emergency_dispatcher, admin)
```

Both routes are lazy-loaded and wrapped in `ProtectedRoute`.

### Data seam

`useDispatcherData` is the single source of truth for this feature. It is a
`useReducer`-backed hook seeded from mock fixtures (`mockCases`, `mockUnits`). The
returned shape and all action signatures are documented in
`specs/001-emergency-dispatcher/contracts/dispatcher-data-seam.md`.

When the backend is ready, the hook body is replaced with a `dispatcherSlice.js` +
`api.js` namespace + socket event wiring — no consuming component changes.

### Case list flow

```
CaseListPage
  → useDispatcherData() → cases[]
  → CaseListTabs (SOS / Incidents tabs, unread counts)
  → CaseCard[] (sorted newest-first)
  → navigate('/cases/:caseType/:caseId') on click
```

### Case detail flow

```
CaseDetailPage (mounts → selectCase(caseId))
  Left column:  CaseInfoPanel + VictimProfilePanel | IncidentInfoPanel + CaseNotesPanel
  Center:       DispatchMap (dark basemap, incident pin, unit markers, route lines)
  Right column: CaseActionsBar + NearestUnitsPanel + ActiveAssignmentsPanel
```

### Dispatch flow

```
NearestUnitsPanel
  → rankByDistance(units, caseLocation)          (haversine.js)
  → defaultUnitTypes = getDefaultUnitTypes(emergencyType)  (dispatchDefaults.js)
  → auto-selects matching available units
  → dispatcher toggles checkboxes
  → "Dispatch" → DispatchConfirmModal → confirm
  → useDispatcherData().dispatchUnits(caseId, unitIds)
  → assignments created (status: 'notified'); units marked 'en_route'
  → system note logged: "<unit names> dispatched"
```

### Assignment lifecycle

```
notified → en_route → on_scene → completed   (forward-only via updateAssignmentStatus)
notified | en_route → cancelled              (via cancelAssignment)
```

On `completed` or `cancelled`, the unit's status returns to `available`.

`closeCase` force-completes all non-terminal assignments and frees all involved units.

### Mock ticker (optional)

`useDispatcherData` starts an interval (2 s) that fires `TICKER_TICK` actions. Each tick:
- Nudges `en_route` units' coordinates 4 % of the way toward the case location.
- Has a 6 % probability of advancing each `en_route` assignment to `on_scene`.

Disable by passing `{ enableTicker: false }` to `useDispatcherData()`.

---

## Known issues / future work

| # | Issue |
|---|-------|
| — | No real backend (by design for this phase) — see `specs/001-emergency-dispatcher/research.md` |
| — | Component-level RTL tests not written (pre-existing project-wide gap; pure-logic unit tests cover all reducer transitions) |
| — | Mock ticker uses `Math.random()` — determinism not guaranteed in tests; ticker is not activated in test files |
