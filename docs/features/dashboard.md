# Feature: dashboard

**Status:** Completed (top KPI row uses real Redux data; performance metrics and recent alerts still mock)
**Path:** `src/features/dashboard/`
**Redux slice:** None — local state + `metricsAPI` + Redux (nodes, cameras, users)
**Access:** `admin`, `emergency_dispatcher`

---

## Purpose

Live operational dashboard with real-time charts for incident trends and node heartbeats, plus KPI summary cards showing system-wide health at a glance.

---

## Files

```
src/features/dashboard/
  pages/
    DashboardPage.jsx        — Main dashboard page (full-width admin-style layout)
  components/
    ChartWrapper.jsx         — Chart.js chart container with time-series rendering
    DashboardCard.jsx        — Legacy card component (superseded by StatCard for KPI tiles)
    GridSection.jsx          — Grid layout section
    LayoutContainer.jsx      — Legacy layout wrapper (bypassed by current page)
    StatBlock.jsx            — Compact stat display block

src/components/ui/
  StatCard.jsx               — Shared KPI stat tile used by admin, dashboard, and map
```

---

## Data flow

### Top KPI row (real data)

Four `StatCard` tiles in the top row pull real Redux data:

| Tile | Source |
|------|--------|
| Total Users | `userAPI.listUsers({ limit: 1000 })` — fetched on mount |
| Nodes Online | `state.nodes.nodes` filtered by `status === 'ONLINE'` |
| Cameras Online | `state.cameras.cameras` filtered by `status === 'ONLINE'` (dispatch `fetchCameras()` on mount) |
| Active Users | Derived from user list (active status) |

### Performance metrics row (mock data — pending)

Four tiles with hardcoded values: API Latency, Message Queue Lag, Uptime, Geo Events/min. Needs `GET /api/dashboard/summary` (see `backend-integration-dashboard.md` §1, §3).

### Live charts (real data via metricsAPI)

Two Chart.js line charts rendered via `ChartWrapper`:
1. **Heartbeat series** — node heartbeat counts over time
2. **Accident series** — detection events over time

Data sourced via two paths:
1. **Socket.IO** — live `accident-detected` / `node_heartbeat` events appended in real-time
2. **Backfill on mount** — `metricsAPI.getHourly(type, startDate, endDate, unit)` → `GET /metrics/hourly`

Date range selector and granularity (hour/day/week) controls exist; changing them triggers a new `getHourly` call.

### Recent Alerts (mock data — pending)

Static hardcoded list. Needs `GET /api/alerts` + `"alert:new"` socket event (see `backend-integration-dashboard.md` §4).

---

## Known issues

| # | Issue |
|---|-------|
| [Bug #7](../bugs.md) | Performance metrics row and Recent Alerts are still hardcoded mock data |

## What's needed to complete this feature

1. Backend `GET /api/dashboard/summary` endpoint for performance metrics (API latency, uptime, etc.).
2. Backend `GET /api/alerts` endpoint + `"alert:new"` socket event for the Recent Alerts card.
3. Wire `metricsAPI.getHourly` response shape confirmation (see `backend-integration-dashboard.md` §2).
