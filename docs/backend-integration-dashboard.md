# Backend Integration — Dashboard & Remaining Screens

> **Sibling docs:** [`backend-integration.md`](./backend-integration.md) (auth, users, nodes, cameras)  
> and [`backend-integration-emergency-dispatcher.md`](./backend-integration-emergency-dispatcher.md)
>
> **Status legend:** `exists` = working today | `change` = endpoint exists but needs addition/correction | `add` = greenfield, not yet implemented

This document captures every data need uncovered during the design-unification audit
(Phases 3–5). For each need: method/path, expected request, expected response, and
delivery mechanism (REST vs WebSocket).

---

## 1. Dashboard KPI Summary

**Status: `add`** — no `/dashboard/summary` endpoint exists today.

The Dashboard page renders four KPI tiles from `MOCK_STATS_TOP`:
- Active Users
- Incidents Today
- System Health
- Alerts (24h)

### Proposed contract

```
GET /api/dashboard/summary
Auth: session cookie (any role)
```

**Response**
```json
{
  "data": {
    "activeUsers": 1289,
    "incidentsToday": 7,
    "systemHealth": "operational",
    "alerts24h": 23,
    "updatedAt": "2026-06-25T14:00:00.000Z"
  }
}
```

`systemHealth` enum: `"operational" | "degraded" | "outage"`

**Frontend usage:** `DashboardPage.jsx` KPI grid (replaces `MOCK_STATS_TOP`).

---

## 2. Hourly Metrics (Charts)

**Status: `change`** — `GET /api/metrics/hourly` exists. `metricsAPI.getHourly` is the
frontend caller (currently zero callers). Response shape needs confirmation.

### Existing call

```js
metricsAPI.getHourly(type, startDate, endDate, unit?)
// type: 'user_activity' | 'alerts'
```

```
GET /api/metrics/hourly?type=user_activity&startDate=<ISO>&endDate=<ISO>
Auth: session cookie (any role)
```

### Expected response (confirm this shape is what the backend returns)

```json
{
  "data": {
    "labels": ["00:00", "01:00", "02:00", "..."],
    "data":   [12, 8, 5, "..."]
  }
}
```

`labels` are human-readable hour strings; `data` is the parallel count array.

**Frontend usage:** `ChartWrapper.jsx` — User Activity chart (`type=user_activity`) and
Alert Frequency chart (`type=alerts`).

**If the response shape is different**, update `ChartWrapper.jsx` lines 72–73 where
`result?.labels` and `result?.data` are destructured.

---

## 3. Performance Metrics (Dashboard tiles)

**Status: `add`** — no endpoint exists today. Dashboard renders `MOCK_PERFORMANCE`:
API Latency, Message Queue Lag, Uptime, Geo Events/min.

### Proposed contract (fold into `/dashboard/summary` or separate endpoint)

Option A: add to the summary endpoint above:
```json
{
  "data": {
    "...summary fields...",
    "performance": {
      "apiLatencyMs": 124,
      "messageQueueLag": "normal",
      "uptimeDays": 12,
      "geoEventsPerMin": 341
    }
  }
}
```

Option B: separate `GET /api/dashboard/performance` endpoint.

---

## 4. Recent Alerts (Live Feed)

**Status: `add`** — no alerts REST endpoint or WebSocket event exists today.

### REST (initial load)

```
GET /api/alerts?limit=10&sort=desc
Auth: session cookie (any role)
```

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "High vibration detected",
      "severity": "critical",
      "nodeId": "NODE-001",
      "occurredAt": "2026-06-25T13:45:00.000Z",
      "read": false
    }
  ],
  "meta": { "total": 42, "unread": 5 }
}
```

`severity` enum: `"critical" | "warning" | "info"`

### WebSocket (live updates)

```
Event: "alert:new"
Payload: { id, title, severity, nodeId, occurredAt }
```

**Frontend usage:** `DashboardPage.jsx` "Recent Alerts" card (replaces hardcoded list).
Socket subscription goes in a `useEffect` in `DashboardPage` or a dedicated slice.

---

## 5. Dispatcher — Assignments Hydration

**Status: `change`** — `GET /api/dispatcher/cases/:id` exists but does not return
active assignments in its response. `dispatcherSlice.js` lines 24–31 document this gap.

### Required addition

Extend the case detail response to include active assignments:

```json
{
  "data": {
    "id": "uuid",
    "status": "active",
    "...other case fields...",
    "assignments": [
      {
        "id": "uuid",
        "unitId": "uuid",
        "unit": { "id": "uuid", "name": "Unit 7", "type": "ambulance" },
        "status": "en_route",
        "assignedAt": "2026-06-25T13:00:00.000Z"
      }
    ]
  }
}
```

**Frontend usage:** `dispatcherSlice.js` `normalizeCase()` — currently fabricates an
empty `assignments: []`. Once hydrated, the Assignments panel in the dispatch console
will show real units.

---

## 6. Dispatcher — Nearest Units (Decision)

**Status: `exists`** — `GET /api/dispatcher/units/nearest` is implemented on the backend
and `dispatcherAPI.nearestUnits` is in `api.js`. However, `NearestUnitsPanel` currently
ranks units client-side (Haversine, all units fetched) rather than calling this endpoint.

### Decision needed

| Option | Trade-off |
|--------|-----------|
| **Wire to `/units/nearest`** | Accurate server-side ranking; requires lat/lng from incident |
| **Keep client-side ranking** | No latency cost; already works; may diverge from server ranking |

**Recommendation:** wire to `/units/nearest` when incident coordinates are available
(payload has `node.latitude`/`node.longitude`). Fall back to client-side ranking when
coordinates are absent.

### Call signature (when wiring)

```js
dispatcherAPI.nearestUnits({
  lat: incident.node.latitude,
  lng: incident.node.longitude,
  excludeOffDuty: true,
  limit: 10
})
```

---

## 7. Node Telemetry Fields

**Status: `change`** — `GET /api/nodes` exists. `nodesSlice.js` `normalizeNode()`
fabricates default values for fields that may not exist in the real API response:

```js
speedLimit:   node.roadRules?.speedLimit   ?? 120,
ip:           node.ip                      ?? '192.168.1.100',
frameRate:    node.frameRate               ?? 30,
resolution:   node.resolution             ?? '1920x1080',
```

### Confirmation request

Verify that the `GET /api/nodes` and `GET /api/nodes/:id` responses include:

| Field | Location in payload | Type |
|-------|---------------------|------|
| `roadRules.speedLimit` | `node.roadRules.speedLimit` | number (km/h) |
| `ip` | `node.ip` | string |
| `frameRate` | `node.frameRate` | number (fps) |
| `resolution` | `node.resolution` | string (`"1920x1080"`) |

If any field is absent from the backend response, either add it or remove the
corresponding frontend display from `NodeConfigTab.jsx`.

---

## 8. Observer Stats

**Status: `add` (partially)** — `GET /api/observer/me/stats` is called by `MapOverviewPage`
but the endpoint may not be implemented. The page degrades gracefully (shows `—`).

### Expected response (confirm or implement)

```
GET /api/observer/me/stats
Auth: session cookie (road_observer role)
```

```json
{
  "data": {
    "reviewedToday": 12,
    "avgReviewTimeSec": 47,
    "pendingReview": 3
  }
}
```

**Frontend usage:** `MapOverviewPage.jsx` → `KPICards` (`pendingReview`, `reviewedToday`).

---

## 9. Greenfield — Messages

**Status: `add`** — no endpoint exists; page shows "Coming Soon".

### Proposed contract

```
GET    /api/messages?page=1&limit=20
POST   /api/messages          { recipientId, subject, body }
PATCH  /api/messages/:id/read
DELETE /api/messages/:id
```

**WebSocket:** `"message:new"` event → push to inbox without polling.

**Response shape (list)**
```json
{
  "data": [
    { "id": "uuid", "from": { "id", "name", "role" }, "subject": "", "preview": "", "read": false, "sentAt": "" }
  ],
  "meta": { "total": 0, "unread": 0 }
}
```

---

## 10. Greenfield — Reports

**Status: `add`** — no endpoint exists; page shows "Coming Soon".

### Proposed contract

```
GET  /api/reports?type=incident&from=<ISO>&to=<ISO>&format=json
GET  /api/reports/export?type=incident&from=<ISO>&to=<ISO>&format=csv
```

`type` enum: `"incident" | "node_health" | "dispatcher_activity"`

Export endpoint returns a `Content-Disposition: attachment` CSV/PDF stream.

---

## 11. Greenfield — Settings

**Status: `add`** — no endpoint exists; page shows "Coming Soon".

### Proposed contract

```
GET   /api/settings/system   → { theme, alertThresholds, retentionDays, ... }
PATCH /api/settings/system   body: partial settings object (admin only)
```

Separate from user preferences (handled via `PATCH /api/users/me`).

---

## 12. Node Detail Live Stream (WebSocket)

**Status: `add`** — the `NodeDetailDialog` (Road Observer screen) now opens a dedicated
WebSocket to the stream-service to show a live camera feed for any detection node. This
endpoint does not yet exist on the stream-service.

### Context

When the Road Observer clicks a node in the right-side rail, a detail dialog opens.
The left half of the dialog shows a live video feed from the node's onboard camera.
The frontend opens a WebSocket directly to the stream-service (not via Socket.IO).

### Required endpoint

```
WS /ws/nodes?client=dashboard
```

This lives on the stream-service (port 4001), not the backend (port 5000).

### Protocol (JSON text frames, both directions)

**Client → Server (subscribe):**
```json
{ "type": "dashboard_subscribe", "nodeIds": ["<nodeId>"] }
```

Send immediately after the WebSocket `open` event. `nodeIds` is always an array; the
dialog subscribes to exactly one node at a time. The server should begin streaming frames
for the requested node IDs.

**Server → Client (video frame):**
```json
{
  "type": "video_frame",
  "nodeId": "<nodeId>",
  "frameData": "<base64-encoded JPEG string>"
}
```

- `frameData` is a raw base64 string (no `data:image/jpeg;base64,` prefix — the frontend
  adds the prefix itself).
- The server should send frames at whatever rate the node produces them (typically 10–30
  fps). The frontend renders each frame immediately using an `<img>` element.
- If the node goes offline, close the WebSocket; the frontend will show an "Offline" badge.

### DMZ deployment — nginx routing

The existing `/stream-service/` nginx location handles this automatically **if**
`VITE_NODE_VIDEO_WS_URL` is set at build time:

```env
# In your build .env for DMZ production
VITE_NODE_VIDEO_WS_URL=ws://<DMZ_IP>/stream-service
```

With this value the frontend constructs:
```
ws://<DMZ_IP>/stream-service/ws/nodes?client=dashboard
```

nginx strips the `/stream-service/` prefix and forwards to:
```
ws://STREAM_HOST:4001/ws/nodes?client=dashboard
```

**If `VITE_NODE_VIDEO_WS_URL` is left unset** (the default), the frontend uses the API
base URL, producing `ws://<DMZ_IP>/ws/nodes` — a path that has no nginx proxy rule and
will return 404. **Always set this variable in production.**

### Status codes / lifecycle

| State | Meaning |
|-------|---------|
| WS connecting | Frontend shows "CONNECTING" badge |
| First `video_frame` received | Frontend shows "LIVE" badge |
| WS closed or error | Frontend shows "OFFLINE" badge |

The frontend closes the WebSocket when the dialog is closed (React `useEffect` cleanup).

---

## Summary Table

| # | Endpoint | Status | Priority |
|---|----------|--------|----------|
| 1 | `GET /api/dashboard/summary` | `add` | High |
| 2 | `GET /api/metrics/hourly` | `change` (confirm shape) | High |
| 3 | Dashboard performance metrics | `add` (fold into #1) | Medium |
| 4 | `GET /api/alerts` + `alert:new` socket | `add` | High |
| 5 | Assignments in `GET /api/dispatcher/cases/:id` | `change` | Medium |
| 6 | `/api/dispatcher/units/nearest` wiring | `exists` (decision) | Low |
| 7 | Node telemetry fields in `/api/nodes` | `change` (confirm) | Medium |
| 8 | `GET /api/observer/me/stats` | `add` | Low |
| 9 | Messages CRUD + socket | `add` | Low |
| 10 | Reports export | `add` | Low |
| 11 | `GET/PATCH /api/settings/system` | `add` | Low |
| 12 | `WS /ws/nodes` node live stream (stream-service) | `add` | High |
