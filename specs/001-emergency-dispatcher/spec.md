# Feature Specification: Emergency Dispatcher Dashboard

**Feature Branch**: `001-emergency-dispatcher`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Emergency Dispatcher dashboard — a UI shell (no real backend yet) for the emergency_dispatcher role. Two screens: a Case List page showing SOS cases and node-detected incidents in tabs, and a Case Detail page (3-column: case/victim info, live map of emergency units, dispatch panel) where a dispatcher finds the nearest available emergency units (ambulance/police/fire/civil protection) via Haversine distance ranking, selects and dispatches them, tracks live status (notified/en_route/on_scene/completed/cancelled), logs timestamped notes, calls back the victim, escalates, and closes the case. All data is served by mock fixtures behind a single data-access hook seam (no Redux slice, API, or socket wiring yet — that's a documented future swap). Reuses the existing safe-* dark theme design system and the existing MapLibre/react-map-gl map pattern (no React-Leaflet)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Triage a case and dispatch the nearest units (Priority: P1)

An emergency dispatcher sees a new SOS case or detected incident appear in their case
list, opens it, reviews the victim/incident details and the live map of emergency
units, and dispatches the most appropriate nearby unit(s) to the scene.

**Why this priority**: This is the core job of the role — without it, nothing else in
the feature has a reason to exist. It is also the only step that must happen for every
single case, regardless of how the case later resolves.

**Independent Test**: Can be fully tested by opening a case from the list, confirming
the map shows ranked nearby units with a sensible default selection, overriding that
selection, and confirming dispatch — delivering the value of "the right help is now on
the way" without needing any of the later tracking/notes/closure behavior.

**Acceptance Scenarios**:

1. **Given** the case list contains at least one open SOS case and one open incident,
   **When** the dispatcher opens the list, **Then** both case types are visible (in
   their respective tab) with severity, type, and time-since-received shown for each.
2. **Given** a case is open, **When** the dispatcher views the detail screen, **Then**
   the case location is shown on a map alongside emergency units ranked nearest-first by
   distance from the case, each labeled with its type and current availability.
3. **Given** a case is open and at least one unit is available, **When** the dispatcher
   reviews the nearest-units list, **Then** a default set of unit types appropriate to
   the case's emergency type is already pre-selected.
4. **Given** units are selected, **When** the dispatcher chooses to dispatch, **Then**
   the system requires an explicit confirmation step before any unit is marked as
   assigned to the case.
5. **Given** a dispatch is confirmed, **When** the dispatcher returns to the case
   detail, **Then** the dispatched units appear as active assignments and a record of
   the dispatch is added to the case's activity history.

---

### User Story 2 - Track dispatched units through to resolution (Priority: P2)

While a case is open, the dispatcher monitors the status of every unit dispatched to
it — from notified, to en route, to on scene — and can cancel a dispatch that's no
longer needed or mark a unit as having completed its part of the response.

**Why this priority**: Once help is dispatched (P1), the dispatcher's next
responsibility is making sure it actually gets there and knowing when it has. This is
the situational-awareness loop that runs for the full lifetime of an active case.

**Independent Test**: Can be tested independently by dispatching units (reusing P1),
then advancing/cancelling their status from the case detail screen and confirming the
displayed status and the unit's availability elsewhere update accordingly — delivering
the value of "the dispatcher always knows where the response stands."

**Acceptance Scenarios**:

1. **Given** one or more units are dispatched to a case, **When** the dispatcher views
   the case detail, **Then** each unit's current status (notified, en route, on scene)
   is visible and distinguishable at a glance.
2. **Given** a unit is en route, **When** the dispatcher cancels that dispatch, **Then**
   the unit is removed from the case's active assignments and becomes available for
   other cases again.
3. **Given** a unit is on scene, **When** the dispatcher marks it completed, **Then** the
   unit's assignment is closed out and the unit becomes available for other cases again.

---

### User Story 3 - Coordinate case follow-through and closure (Priority: P3)

Throughout a case, the dispatcher records notes about what's happening, can call the
victim back to check on or update them, can escalate the case to an administrator if it
needs higher-level attention, and ultimately closes the case once it's resolved.

**Why this priority**: This is the documentation and wrap-up layer around the
core dispatch-and-track loop (P1/P2). It matters for accountability and handoff but a
dispatcher can already do their primary job (P1+P2) without it.

**Independent Test**: Can be tested independently on any open case by adding a note,
opening the callback flow, escalating, and closing the case — confirming the case's
history reflects each action and that closing resolves all open assignments.

**Acceptance Scenarios**:

1. **Given** a case is open, **When** the dispatcher adds a note, **Then** the note
   appears immediately in the case's chronological activity history with a timestamp.
2. **Given** a case has a reachable victim phone number, **When** the dispatcher uses
   the callback action, **Then** they can view the number, initiate a call through their
   device, and record the outcome as a note.
3. **Given** an open case, **When** the dispatcher escalates it, **Then** the case is
   flagged as escalated and the action is recorded in its history.
4. **Given** an open case with one or more active unit assignments, **When** the
   dispatcher closes the case, **Then** they must confirm the action, all of that case's
   active assignments are marked completed, and the involved units become available
   again.

---

### Edge Cases

- What happens when a case has no available units of any required type within a
  reasonable range? The dispatcher must still be able to see that no good match exists
  and dispatch whatever is available, or none at all, rather than being blocked.
- What happens when a brand-new case arrives while the dispatcher already has a case
  open? The list must reflect it (e.g. an unread indicator) without disrupting the case
  currently being worked.
- What happens when the dispatcher tries to close a case that still has units en route
  or on scene? The system must make the consequence (all active assignments are force-
  completed) clear before the close is confirmed.
- What happens when an SOS case has no medical profile, no emergency contacts, or no
  phone number on file? The relevant section must say so plainly rather than appearing
  broken or blank.
- What happens when the case list or the unit list is empty (no open cases / no units
  registered at all)? Each must show a clear, explanatory empty state rather than a bare
  blank area.
- What happens when the dispatcher attempts to dispatch with zero units selected? The
  dispatch action must be unavailable until at least one unit is selected.
- What happens when a dispatcher tries to cancel a unit that has already reached "on
  scene" or "completed"? Cancellation must only be offered while it's still a meaningful
  action (i.e., before the unit has arrived).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all open SOS cases and incidents in a single
  dispatcher-facing list, separated into SOS and Incident views, sorted with the most
  recently received case first.
- **FR-002**: System MUST visually communicate each case's severity and current status
  in the list without requiring the dispatcher to open it.
- **FR-003**: System MUST indicate which cases in the list are new/unacknowledged,
  distinct from cases the dispatcher has already opened.
- **FR-004**: Opening an SOS case MUST show: severity, emergency type, time since
  received, location, victim identification, medical profile (or an explicit
  "none on file" indicator), and emergency contacts.
- **FR-005**: Opening a node-detected incident MUST show: severity, type, confidence in
  the detection, time since detection, location, and affected lanes.
- **FR-006**: System MUST display a live map centered on the case's location, showing
  every emergency unit's approximate position, type, and current status (available, en
  route, on scene, off duty).
- **FR-007**: System MUST rank available emergency units by proximity to the case
  location, nearest first.
- **FR-008**: System MUST pre-select a default set of unit types appropriate to the
  case's emergency type, while still allowing the dispatcher to add or remove any
  individual unit before dispatching.
- **FR-009**: System MUST require an explicit confirmation step before any unit is
  dispatched, and the dispatch action MUST be unavailable when no unit is selected.
- **FR-010**: Once dispatched, system MUST track each unit's assignment through the
  states notified, en route, on scene, completed, or cancelled, and reflect the current
  state to the dispatcher at all times.
- **FR-011**: Dispatcher MUST be able to cancel a unit's dispatch while it is still en
  route, returning that unit to available status.
- **FR-012**: Dispatcher MUST be able to mark an on-scene unit's assignment as completed,
  returning that unit to available status.
- **FR-013**: Dispatcher MUST be able to add a free-text note to a case at any time;
  every note MUST be timestamped and appear in the case's chronological activity
  history alongside automatically logged events (e.g. dispatch, status changes).
- **FR-014**: Dispatcher MUST be able to view the victim's phone number for a case and
  initiate a callback through their own device, then record the outcome of that contact
  as a note on the case.
- **FR-015**: Dispatcher MUST be able to escalate an open case, which MUST be recorded
  in the case's activity history.
- **FR-016**: Dispatcher MUST be able to close an open case only after confirming the
  action; closing MUST mark every active assignment on that case as completed and
  return the involved units to available status.
- **FR-017**: System MUST present an explanatory empty state whenever a list (cases or
  nearby units) has nothing to show, rather than an unexplained blank area.

### Key Entities

- **Case**: A unit of work the dispatcher must act on — either an SOS request from a
  member of the public or a node-detected incident. Carries severity, type, location,
  time received, current status, and (for SOS) victim identification, medical profile,
  and emergency contacts.
- **Emergency Unit**: A real-world response asset (ambulance, police, fire, or civil
  protection) with a type, current status (available, en route, on scene, off duty), and
  an approximate current location.
- **Dispatch Assignment**: The link between one emergency unit and one case, created
  when the dispatcher confirms a dispatch. Carries its own status (notified, en route,
  on scene, completed, cancelled) independent of the case's own status.
- **Case Note**: A timestamped entry in a case's activity history — either typed by the
  dispatcher or logged automatically by the system in response to an action (dispatch,
  status change, escalation, closure).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A dispatcher can go from opening a new case to confirming a dispatch of
  appropriate units in under 30 seconds.
- **SC-002**: Every case in the list communicates its severity and status clearly
  enough that a dispatcher can triage priority without opening any case detail.
- **SC-003**: A dispatcher can determine the live status of every unit assigned to a
  case without leaving the case detail screen.
- **SC-004**: Closing a case never leaves a unit incorrectly shown as still engaged —
  100% of units involved in a closed case return to an available state.
- **SC-005**: A first-time dispatcher can complete the full case lifecycle (open case →
  dispatch → track to completion → close) without external instructions, using only
  on-screen labels and confirmations.

## Assumptions

- This phase delivers a fully interactive, realistic experience using representative
  mock data; connecting the interface to a live cases/units service, real push
  notifications, and real-time device location updates is a separate, later integration
  effort and is out of scope here.
- The set of operator roles and the emergency-dispatcher role's access to this surface
  already exist; no new permission model is introduced by this feature.
- "Callback" means the dispatcher views the victim's number and places the call through
  their own device or phone system; the feature itself does not place or carry the
  call, only records that it happened and its outcome.
- Emergency unit types are limited to ambulance, police, fire, and civil protection, and
  case types are limited to SOS requests and node-detected incidents, matching what's
  already defined elsewhere in the system.
- Unit positions update live during this phase via simulated movement rather than real
  device telemetry; the on-screen behavior (live-moving markers, status changes) is
  representative of the eventual real-data experience.
