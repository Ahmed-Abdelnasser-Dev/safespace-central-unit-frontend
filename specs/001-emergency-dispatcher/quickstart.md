# Quickstart: Emergency Dispatcher Dashboard

Validation guide for the UI-shell phase. No backend/env setup is required beyond the
existing dev server — this feature has no new external dependencies.

## Prerequisites

- `npm install` already run for this repo.
- A signed-in session with the `emergency_dispatcher` role (or `admin`, which also has
  access per the route's `allowedRoles`). Use whatever existing dev/test account or
  auth bypass the project already relies on for local sign-in.

## Run

```bash
npm run dev   # serves on http://localhost:4000
```

Navigate to `http://localhost:4000/cases` (or sign in and use the **Cases** sidebar
item — added to the `emergency_dispatcher` nav).

## Validation scenarios

Each maps directly to an acceptance scenario in `spec.md`.

### 1. Triage the list (User Story 1, Scenario 1)
- Land on `/cases`. Confirm both **SOS Cases** and **Incidents** tabs are present, each
  showing severity, type, and "time since received" per case.
- Confirm at least one case shows an unread indicator distinct from already-opened
  cases.
- Confirm an empty tab (if mock data has none) shows an explanatory empty state, not a
  blank area (FR-017).

### 2. Open a case and review nearby units (User Story 1, Scenarios 2–3)
- Click into a case. Confirm the map centers on the case location and shows ranked
  emergency units (nearest first) with type + status visible per unit.
- Confirm `NearestUnitsPanel` has a sensible default selection already checked, based on
  the case's emergency/incident type (FR-008).

### 3. Dispatch units (User Story 1, Scenarios 4–5)
- Toggle the unit selection, then trigger Dispatch. Confirm a confirmation step is
  required before anything is marked dispatched (FR-009), and that the Dispatch action
  is disabled with zero units selected.
- After confirming, check `ActiveAssignmentsPanel` shows the new assignment(s) and that
  a system note recording the dispatch appears in the notes timeline (FR-013).

### 4. Track to resolution (User Story 2)
- With a unit `en_route`, cancel its assignment; confirm it disappears from active
  assignments and the unit becomes selectable again in `NearestUnitsPanel` on another
  case (FR-011).
- With a unit `on_scene`, mark it completed; confirm the same return-to-available
  behavior (FR-012).

### 5. Notes, callback, escalate, close (User Story 3)
- Add a free-text note; confirm it appears immediately, timestamped, in the timeline
  (FR-013).
- Open the callback action on an SOS case with a victim phone number; confirm the number
  is shown and an outcome can be logged as a note (FR-014). On a case with no phone on
  file, confirm this is stated explicitly rather than blank.
- Escalate the case; confirm a system note records it (FR-015).
- Close the case with at least one active assignment; confirm the confirmation step
  states the consequence, and afterward every involved unit shows `available` again
  (FR-016, SC-004).

## Automated checks

```bash
npx vitest run src/shared/utils/haversine.test.js
npx vitest run src/features/emergencyDispatcher
```

Both must pass before any phase (per the build-phase breakdown in `tasks.md`) is
considered complete, per Constitution Principle III.

```bash
npm run build   # must complete with no errors
```
