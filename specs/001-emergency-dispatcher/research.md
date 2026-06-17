# Phase 0 Research: Emergency Dispatcher Dashboard

No `[NEEDS CLARIFICATION]` markers remained in the Technical Context — the approved
design brief (`/home/nasser/.claude/plans/emergency-dispatcher-dashboard-bright-sphinx.md`)
and a prior `AskUserQuestion` round already resolved the stack-reconciliation decisions.
This document records those decisions in the Decision/Rationale/Alternatives format for
traceability, plus a few implementation-detail choices made during planning.

## Decision: Map library — MapLibre GL + react-map-gl

**Rationale**: The source spec named React-Leaflet, but this repository has zero
Leaflet dependencies and already standardizes on MapLibre via `react-map-gl/maplibre`
(`src/features/map/components/MapView.jsx`, `src/features/nodeMaintainer/components/map/MapNodeMarker.jsx`).
Reusing the established pattern avoids a second mapping stack, duplicate marker logic,
and an unnecessary new dependency. Confirmed explicitly with the user.

**Alternatives considered**: React-Leaflet (the spec's literal suggestion) — rejected,
introduces a redundant dependency and a divergent marker/control API from the rest of
the app for no functional gain.

## Decision: Dark basemap tiles

**Rationale**: `MapView.jsx`'s existing OSM raster style is light (`#f0f4f8`-toned),
which clashes with the fixed dark `safe-*` theme this feature must live in. CARTO's
free dark-matter raster tile set (`{s}.basemaps.cartocdn.com/dark_nolabels` or
`dark_all`, attribution required) drops in via the same `mapStyle` raster-source shape
already used in `MapView.jsx`, with no new dependency.

**Alternatives considered**: Keep the light OSM style and overlay a dark CSS filter —
rejected, degrades label/tile legibility and is a hack rather than a real dark basemap.
Vector MapLibre dark style — rejected for this phase, would require shipping/hosting a
full vector style spec; raster keeps parity with the existing simple raster approach.

## Decision: State/data architecture — local seam now, Redux-shaped for later

**Rationale**: Per user decision, this phase ships a complete UI shell only; no backend
endpoints exist yet (`/api/emergency-units`, `/api/dispatch`, new socket events are all
unbuilt). A single hook, `useDispatcherData`, holds mock fixtures in a `useReducer`
(immutable transitions) and returns exactly the shape a future `dispatcherSlice.js` +
`api.js` namespace + `socketService.js` events would provide. This keeps the swap to a
hook-body replacement with no consuming-component changes.

**Alternatives considered**: Build the real `dispatcherSlice.js` now against a mocked
API layer (e.g. MSW) — rejected per user decision; adds infrastructure (mock server)
for endpoints whose real shape isn't finalized yet, while the simpler local-seam
hook achieves the same "fully interactive" requirement with less throwaway code.

## Decision: Nearest-unit ranking — pure Haversine function

**Rationale**: The spec (and the absent `shared/utils/haversine.js` it references)
calls for straight-line nearest-unit ranking. Haversine great-circle distance is the
standard, dependency-free formula for this at city/highway scale and needs no mapping
library involvement — it's pure arithmetic, which also makes it trivially unit-testable
per Constitution Principle III.

**Alternatives considered**: Routed/driving distance (e.g. via a routing API) — out of
scope; no such service exists in this repo or spec, and straight-line ranking is what
the spec explicitly asks for ("computed using Haversine").

## Decision: Simulated live movement — optional mock event ticker

**Rationale**: Spec edge cases and User Story 2 require units to show live status/
position changes. Without a real socket, a small interval-driven ticker inside the
mock-data layer (Phase 3, optional/flagged) nudges en-route units' coordinates toward
the case location and probabilistically advances assignment status, so the live-tracking
UI has something real to render and test against.

**Alternatives considered**: Fully static mock data with manual-only status changes —
rejected as the sole mechanism because it leaves the "live update" visual behavior
(animated marker movement, automatic status badges) unverified; manual advance remains
available regardless as the primary, deterministic interaction.

## Decision: Test scope under Constitution Principle III

**Rationale**: The repo has Vitest installed but no jsdom/Testing-Library config or
`test` npm script (confirmed in `docs/plan.md`'s "Not started" list and `vite.config.js`).
Rather than bundling unrelated test-infrastructure setup into this feature, this phase
ships real unit tests for every pure-logic module it adds — `haversine.js`,
`dispatchDefaults.js`, `caseFormatters.js`, and the data-seam reducer's transition
functions — runnable today via `npx vitest` with zero new config. Component/RTL tests
remain the pre-existing, separately tracked gap.

**Alternatives considered**: Add jsdom + Testing Library config now and write component
tests too — rejected as out-of-scope scope creep for this feature; flagged instead as a
natural follow-up once a feature actually needs it project-wide.
