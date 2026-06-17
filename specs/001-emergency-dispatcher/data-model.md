# Phase 1 Data Model: Emergency Dispatcher Dashboard

Entities as they exist in this UI-shell phase (mock fixtures + local reducer state).
Field names/shapes are chosen to match what the real backend (per the source spec) will
eventually send, so the future Redux/API swap requires no field renaming.

## Case (discriminated union: SOS | Incident)

Common fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string (uuid) | |
| `caseType` | `'sos' \| 'incident'` | discriminator |
| `severity` | `'HIGH' \| 'MEDIUM' \| 'LOW'` | drives `SeverityBadge` color |
| `status` | `'received' \| 'active' \| 'escalated' \| 'closed'` | |
| `latitude`, `longitude` | number | case location |
| `receivedAt` | ISO datetime string | drives "time since" live counter |
| `isUnread` | boolean | list unread indicator (FR-003) |
| `notes` | `CaseNote[]` | chronological, newest last (rendered newest-first) |
| `assignmentIds` | string[] | `DispatchAssignment.id` values linked to this case |

SOS-only fields:

| Field | Type | Notes |
|---|---|---|
| `emergencyType` | `'ROAD_ACCIDENT' \| 'MEDICAL' \| 'FIRE' \| 'POLICE' \| 'UNSPECIFIED'` | drives default unit selection (FR-008) |
| `victim.fullName`, `victim.nationalId`, `victim.dob`, `victim.phone` | string | `victim.phone` may be absent — render "no phone on file" |
| `medicalProfile` | `{ bloodType, conditions[], medications[], allergies[], notes } \| null` | `null` → "No medical profile on file" (FR-004) |
| `emergencyContacts` | `{ name, relationship, phone }[]` | may be empty array |

Incident-only fields:

| Field | Type | Notes |
|---|---|---|
| `incidentType` | `'COLLISION' \| 'STOPPED_VEHICLE' \| 'ROAD_HAZARD' \| 'UNSPECIFIED'` | drives default unit selection |
| `confidence` | number 0–1 | detection confidence (FR-005) |
| `affectedLanes` | string[] | e.g. `['L1','L2']` |
| `nodeLabel` | string | e.g. "Highway Node 07 — Km 42 Ismailia" |

**Validation rules**: `severity`, `status`, `caseType` are closed enums — UI must
render every defined value, never fall through silently. `receivedAt` must always be
present (drives FR-002/SC-002 triage legibility). For SOS cases, `victim.fullName` is
required; `victim.phone`, `medicalProfile`, `emergencyContacts` may be absent/empty and
must render an explicit empty state (FR-004, edge case).

**State transitions** (`status`): `received → active` (on first open/acknowledge) →
`escalated` (FR-015, one-way flag, case stays otherwise active) → `closed` (FR-016,
terminal; only reachable with explicit confirmation, per Edge Cases).

## Emergency Unit

| Field | Type | Notes |
|---|---|---|
| `id` | string (uuid) | |
| `name` | string | e.g. "Ambulance Unit 3" |
| `unitType` | `'ambulance' \| 'police' \| 'fire' \| 'civil_protection'` | drives `UnitMarker` icon |
| `status` | `'available' \| 'en_route' \| 'on_scene' \| 'off_duty'` | drives marker color + `UnitStatusBadge` |
| `homeBase.name`, `homeBase.latitude`, `homeBase.longitude` | string/number | rendered as a muted marker |
| `currentLatitude`, `currentLongitude` | number | live position |
| `lastLocationAt` | ISO datetime string | |

**Validation rules**: `status` is a closed enum; `off_duty` units must never appear in
`NearestUnitsPanel`'s selectable list (only `available` units are dispatchable, per
FR-007/FR-008). A unit assigned to an active `DispatchAssignment` is, by construction,
not `available` — the seam must keep these in sync as a single invariant (closing or
cancelling an assignment is the only way a unit returns to `available`, per FR-011/012/016).

## Dispatch Assignment

| Field | Type | Notes |
|---|---|---|
| `id` | string (uuid) | |
| `caseId` | string | references `Case.id` |
| `unitId` | string | references `EmergencyUnit.id` |
| `status` | `'notified' \| 'en_route' \| 'on_scene' \| 'completed' \| 'cancelled'` | FR-010 |
| `dispatchedAt` | ISO datetime string | |
| `assignedBy` | string | dispatcher operator name/id, for the activity log entry |

**State transitions**: `notified → en_route → on_scene → completed` (forward only).
`cancelled` is reachable only from `notified`/`en_route` (Edge Cases: cancellation must
only be offered before arrival — FR-011). `completed`/`cancelled` are terminal; reaching
either returns the linked `EmergencyUnit.status` to `available` (FR-011, FR-012).
`CloseCase` (FR-016) force-transitions every non-terminal assignment on a case straight
to `completed`.

## Case Note

| Field | Type | Notes |
|---|---|---|
| `id` | string (uuid) | |
| `caseId` | string | |
| `authorType` | `'dispatcher' \| 'system'` | distinguishes typed notes from auto-logged events (FR-013) |
| `content` | string | free text for dispatcher notes; templated summary for system events (e.g. "Ambulance Unit 3, Police Unit 7 dispatched") |
| `createdAt` | ISO datetime string | |

**Validation rules**: every dispatch, status change, escalation, and closure MUST
append a `system` note (FR-013, FR-015) — this is how the activity-history acceptance
scenarios (User Story 3, Scenario 1) are satisfied without a separate audit-log entity
in this phase.

## Relationships

```
Case 1 ──── * DispatchAssignment ──── 1 EmergencyUnit
Case 1 ──── * CaseNote
```

A `Case` has zero or more `DispatchAssignment`s; each assignment links exactly one
`EmergencyUnit`. A unit may have at most one *active* (non-terminal) assignment at a
time across all cases — enforced by the seam, not the UI (the UI simply won't offer an
already-engaged unit in `NearestUnitsPanel`).
