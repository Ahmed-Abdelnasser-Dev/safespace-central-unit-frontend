# Feature: dashboard

**Status:** Completed (KPI cards and recent alerts contain mock data — not connected to real API)
**Path:** `src/features/dashboard/`
**Redux slice:** None — local state + `metricsAPI` + Socket.IO
**Access:** `admin`, `emergency_dispatcher`

---

## Purpose

Live operational dashboard with real-time charts for incident trends and node heartbeats, plus KPI summary cards.

---

## Files

```
src/features/dashboard/
  pages/
    DashboardPage.jsx        — Main dashboard page
  components/
    ChartWrapper.jsx         — Chart.js chart container with time-series rendering
    DashboardCard.jsx        — Single KPI card (metric + label + trend indicator)
    GridSection.jsx          — Grid layout section
    LayoutContainer.jsx      — Page layout wrapper
    StatBlock.jsx            — Compact stat display block
  utils/
    format.js                — Date/number formatting helpers for charts
```

---

## Data flow

### Live charts (real data)
- Two Chart.js line charts rendered via `ChartWrapper`:
  1. **Heartbeat series** — node heartbeat counts over time
  2. **Accident series** — detection events over time
- Data sourced via two paths:
  1. **Socket.IO** — live incoming `accident-detected` / `node_heartbeat` events appended to chart datasets in real-time
  2. **Backfill on mount** — `metricsAPI.getHourly(type, startDate, endDate, unit)` → `GET /metrics/hourly`
- Date range selector and granularity (hour/day/week) controls exist; changing them triggers a new `getHourly` call.

### KPI cards (hardcoded mock data — Bug #7)
`statsTop` array is hardcoded in the component:
- "Active Users: 1289"
- "Incidents Today: 7"
- "API Latency: 124ms"
- (and similar)

These are **not connected to the backend**. Will show stale/wrong numbers to operators.

### Recent Alerts (hardcoded mock data — Bug #7)
Static `<li>` list items with no dynamic content.

---

## Known issues

| # | Issue |
|---|-------|
| [Bug #7](../bugs.md) | KPI cards (`statsTop`) and "Recent Alerts" are hardcoded — need real API endpoints |

## What's needed to complete this feature

1. Backend needs to expose a stats endpoint (or extend `metricsAPI`) for: active operators, incidents today, system health metrics.
2. `DashboardPage` should replace the hardcoded `statsTop` with `useEffect` + API calls.
3. "Recent Alerts" list should be driven by the `alerts` feature data (not yet implemented).
