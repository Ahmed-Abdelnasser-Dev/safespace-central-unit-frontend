# Implementation Plan: Emergency Dispatcher Dashboard

**Branch**: `001-emergency-dispatcher` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-emergency-dispatcher/spec.md`

## Summary

Build a production-quality, fully interactive **UI shell** for the Emergency Dispatcher
role: a Case List page (SOS cases + node incidents, tabbed) and a Case Detail page
(case/victim info, live map of emergency units, dispatch panel, active assignments,
notes timeline, and case actions). The feature is driven entirely by **mock fixtures
behind a single data-access hook seam** (`useDispatcherData`) — no Redux slice, API
namespace, or socket wiring is added in this phase; the seam's shape is designed so that
swap is mechanical later. Reuses the existing `safe-*` dark-theme design system
(documented in `PRODUCT.md`/`DESIGN.md`) and the existing MapLibre + `react-map-gl` map
pattern (no React-Leaflet, per the approved design brief at
`/home/nasser/.claude/plans/emergency-dispatcher-dashboard-bright-sphinx.md`).

## Technical Context

**Language/Version**: JavaScript (JSX), React 18, Node 18+/ESM, Vite dev/build tooling.

**Primary Dependencies**: React 18, React Router v6, Redux Toolkit (seam mirrors its
shape only — no slice added this phase), Tailwind CSS (`safe-*` tokens),
`react-map-gl`/`maplibre-gl` (dark raster basemap), `@fortawesome/react-fontawesome`.
No new dependency is introduced.

**Storage**: N/A this phase — mock fixtures held in local component state
(`useReducer`, immutable updates). Future phase: REST via `src/services/api.js` +
Socket.IO via `src/services/socketService.js`, per `docs/system-context.md`.

**Testing**: Vitest (already a devDependency, run via `npx vitest` — no `test` npm
script exists project-wide). This feature ships real unit tests for every pure-logic
module it adds (Haversine distance/ranking, dispatch-default selection, status/severity
formatters, the data-seam's reducer transitions). No jsdom/Testing-Library config exists
in the repo yet (tracked separately in `docs/plan.md` under "Test coverage" — not
expanded in this feature to avoid unrelated scope creep); component-level tests remain
that pre-existing, separately tracked gap.

**Target Platform**: Web — desktop-first operator dashboard (ops-room monitors),
responsive down to tablet width per the approved 3-column → stacked layout breakpoint.

**Project Type**: Single-project web frontend feature module — no new package, no
backend in this repo.

**Performance Goals**: List and map interactions feel instant (<100ms perceived input
response) at realistic mock volumes (0–50 cases, 0–20 units); map marker position
updates animate smoothly without layout thrash.

**Constraints**: `safe-*` Tailwind tokens only (no raw hex in JSX); MapLibre +
`react-map-gl` only (no React-Leaflet); no new state-management or UI-component
library; immutable state updates throughout; `prefers-reduced-motion` alternative for
every animation.

**Scale/Scope**: 2 pages, ~12 components, 1 custom hook (data seam), 2 new shared
utility modules, 3 build phases (see Architecture in the source design brief).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance |
|---|---|
| I. Documentation-Grounded Development | Checked `docs/plan.md` and `docs/bugs.md` before planning — this feature touches no area listed there (cameras, nodesSlice, roleUtils, etc.); it adds a net-new feature folder. Plan commits to updating `docs/plan.md` ("Not started" → move Emergency Dispatcher work into "Completed") and adding `docs/features/emergencyDispatcher.md` once built, in the same change. |
| II. Established Conventions | Feature folder is `src/features/emergencyDispatcher/` (camelCase, matches `nodeMaintainer`/`systemTest`); components PascalCase; `@/` alias; `safe-*` tokens only; immutable updates. **No new Redux slice is added this phase** — this is a deliberate, user-approved scope decision (UI-shell-first), not a deviation from the slice convention: the seam hook is designed to be replaced by a real `dispatcherSlice.js` with no component-level churn, documented explicitly in the plan's Architecture section. |
| III. Test Coverage (NON-NEGOTIABLE) | Every pure-logic module added ships a real Vitest unit test before the phase containing it is considered done: `haversine.js`, `dispatchDefaults.js`, `caseFormatters.js`, and the `useDispatcherData` reducer's transition logic. `npx vitest` must pass before each phase closes. |
| IV. Security & Secrets | No new secrets. No raw `axios` usage is introduced (no HTTP calls exist yet in this phase). The documented future swap explicitly calls out routing all real requests through `src/services/api.js`, never raw axios, and using canonical lowercase role strings rather than the known-broken `roleUtils.js` constants. |
| V. Small, Cohesive Files | Feature structure is deliberately many small files (~12 components, each single-purpose) over a few large ones; non-component modules (`hooks/`, `data/`, `utils/`) are camelCase and grouped by purpose. |

No violations requiring justification — Complexity Tracking table is empty/omitted.

## Project Structure

### Documentation (this feature)

```text
specs/001-emergency-dispatcher/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/             # Phase 1 output (data-seam hook contract)
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

```text
src/features/emergencyDispatcher/
├── pages/
│   ├── CaseListPage.jsx
│   └── CaseDetailPage.jsx
├── components/
│   ├── CaseCard.jsx
│   ├── CaseListTabs.jsx
│   ├── CaseInfoPanel.jsx
│   ├── VictimProfilePanel.jsx
│   ├── IncidentInfoPanel.jsx
│   ├── DispatchMap.jsx
│   ├── UnitMarker.jsx
│   ├── UnitPopover.jsx
│   ├── MapControls.jsx
│   ├── NearestUnitsPanel.jsx
│   ├── DispatchConfirmModal.jsx
│   ├── ActiveAssignmentsPanel.jsx
│   ├── CaseNotesPanel.jsx
│   ├── CaseActionsBar.jsx
│   ├── CallbackModal.jsx
│   └── badges/
│       ├── SeverityBadge.jsx
│       ├── UnitStatusBadge.jsx
│       └── CaseTypeBadge.jsx
├── hooks/
│   └── useDispatcherData.js        # the data-access seam — see contracts/dispatcher-data-seam.md
├── data/
│   ├── mockCases.js
│   ├── mockUnits.js
│   └── dispatchDefaults.js
└── utils/
    └── caseFormatters.js

src/shared/utils/
├── haversine.js                    # NEW — referenced by spec but absent from repo
└── haversine.test.js               # NEW — first real unit test under shared/utils

src/App.jsx                         # + 2 lazy routes, ProtectedRoute(allowedRoles)
src/config/navigation.js            # + 'Cases' nav item, emergency_dispatcher defaultPath
src/icons.js                        # + new FontAwesome icon registrations
```

**Structure Decision**: Single-project web frontend; new feature module under
`src/features/emergencyDispatcher/` following the existing camelCase feature-folder
convention (`nodeMaintainer`, `systemTest`), plus one new cross-feature utility under
`src/shared/utils/` and the minimal touch points required to route to and navigate into
the new pages (`App.jsx`, `navigation.js`, `icons.js`). No backend/ directory exists or
is added — this repository is frontend-only.

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*
