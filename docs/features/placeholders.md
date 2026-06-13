# Placeholder Features (Not Started)

Four features exist only as "Coming Soon" pages. Each renders a static card with a checklist of planned capabilities.

---

## alerts

**File:** `src/features/alerts/pages/AlertsPage.jsx`
**Access:** `admin`, `emergency_dispatcher`

A real-time alert feed — shows system alerts (node offline, missed heartbeat, detection threshold exceeded, etc.) as they arrive via socket or polling.

Planned capabilities (from the Coming Soon card):
- Real-time alert feed
- Severity filtering (critical / warning / info)
- Acknowledge / dismiss actions
- Alert history

**What's needed:**
- Backend: `GET /alerts` endpoint + socket `alert_triggered` event
- Redux slice or TanStack Query hook for alert state
- Notification badge integration (unread count)

---

## messages

**File:** `src/features/messages/pages/MessagesPage.jsx`
**Access:** `admin`, `emergency_dispatcher`

Operator messaging interface. In the target architecture, this would be the entry point for the embedded Rocket.Chat overlay (see [target-architecture.md](../target-architecture.md)).

Currently: "Coming Soon" placeholder. No Rocket.Chat integration exists.

**What's needed:**
- Decide on approach: Rocket.Chat embed vs custom messaging
- If Rocket.Chat: backend Docker setup + bot account + role channels + iframe embed
- If custom: backend messaging endpoints + Redux state + WebSocket delivery

---

## reports

**File:** `src/features/reports/pages/ReportsPage.jsx`
**Access:** `admin`, `road_observer`

Report builder for incident data, node performance, and analytics output. In the target architecture, this overlaps with the Data Analyst role's report builder.

Planned capabilities (from the Coming Soon card):
- Date range filters
- Report type selection (incidents, node health, performance)
- PDF and CSV export

**What's needed:**
- Backend: `GET /analytics/report` or similar with export support
- Report builder UI (form for parameters → trigger export)
- PDF generation: likely client-side (jsPDF) or server-generated

---

## settings

**File:** `src/features/settings/pages/SettingsPage.jsx`
**Access:** `admin`

System configuration panel for Administrator: CCTV stream config, detection thresholds, notification settings, system parameters.

**What's needed:**
- Backend: `GET /settings` + `PATCH /settings` endpoints per config category
- Form-based UI with sections per configuration area
- Potentially tabbed layout (CCTV / Detection / Notifications / System)
