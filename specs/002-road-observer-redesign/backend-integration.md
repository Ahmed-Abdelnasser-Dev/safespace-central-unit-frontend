# Backend Integration: Road Observer Redesign

Feature: `002-road-observer-redesign`
Frontend status: **implemented** (see `src/features/map/`, `src/features/incidents/`, `src/features/notifications/`)
Backend status: **pending** — all 7 sections below are new or extended endpoints required for end-to-end integration.

---

## Summary of what the frontend already does

| Area | Behaviour without backend |
|---|---|
| KPI strip — Nodes Online/Offline | ✅ Works now (from `GET /nodes`, already live) |
| KPI strip — Pending Review / Reviewed Today | Shows `—` skeleton until `GET /observer/me/stats` returns |
| Node rail / map markers | ✅ Works now (from `GET /nodes`) |
| Notification bell — live events | ✅ Works now (socket `incident-assigned`, `decision-confirmed`) |
| Notification panel — persisted history | Shows empty state until `GET /notifications` returns |
| Incident History page | Shows error banner until `GET /incidents/history` returns |
| Incident detail modal | Shows empty fields until `GET /incidents/:id` returns |

The frontend degrades gracefully — no mock data, no crashes. Each section below unblocks the next tier of functionality.

---

## 1. Observer Stats Endpoint

**Priority:** HIGH — powers 2 of 4 KPI cards.

```
GET /observer/me/stats
Authorization: cookie session (road_observer role only; also allow admin)
```

### Response
```json
{
  "success": true,
  "data": {
    "reviewedToday": 5,
    "avgReviewTimeSec": 47,
    "pendingReview": 2
  }
}
```

### Implementation notes
- `reviewedToday`: count of incidents where `reviewedBy = current user` AND `reviewedAt >= today 00:00 UTC`.
- `avgReviewTimeSec`: average of `reviewedAt - assignedAt` (in seconds) for incidents reviewed today. Return `null` if none.
- `pendingReview`: incidents assigned to this observer where `status = 'pending'`. Return `0` if none.
- Cache for 30 s (the frontend polls on a 30 s interval).

---

## 2. Incident History (List)

**Priority:** HIGH — powers the Incident History page.

```
GET /incidents/history
Authorization: cookie session (road_observer sees own incidents; admin sees all)
```

### Query params
| Param | Type | Default | Description |
|---|---|---|---|
| `status` | `confirmed\|modified\|rejected\|pending` | — | Filter by decision status |
| `severity` | `HIGH\|MEDIUM\|LOW` | — | Filter by AI severity |
| `page` | integer | 1 | Pagination page |
| `limit` | integer | 20 | Items per page |

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nodeId": "NODE-001",
      "nodeLabel": "Kafr El-Sheikh North Gate",
      "severity": "HIGH",
      "status": "confirmed",
      "aiConfidence": 0.92,
      "location": {
        "lat": 31.1107,
        "lng": 30.9388,
        "address": "Road 61, km 14, Kafr El-Sheikh"
      },
      "occurredAt": "2026-06-20T09:15:00Z",
      "reviewedAt": "2026-06-20T09:15:47Z",
      "decision": {
        "speedLimit": 60,
        "laneConfiguration": "open,blocked,open",
        "actions": ["REDUCE_SPEED_LIMIT", "BLOCK_LANE"]
      }
    }
  ],
  "meta": {
    "total": 47,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### RBAC
- `road_observer`: only sees incidents where `assignedTo = current user`.
- `admin`: sees all incidents with optional `observerId` query param to scope.

---

## 3. Incident Detail

**Priority:** MEDIUM — powers the detail modal on the History page.

```
GET /incidents/:id
Authorization: cookie session (road_observer scoped to own; admin unrestricted)
```

### Response
Same as the incident object above, **plus** the full `ai` block (same shape as the existing `AccidentDialog` receives from the socket `incident-assigned` event):

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nodeId": "NODE-001",
    "nodeLabel": "Kafr El-Sheikh North Gate",
    "severity": "HIGH",
    "status": "confirmed",
    "aiConfidence": 0.92,
    "location": { "lat": 31.1107, "lng": 30.9388, "address": "..." },
    "occurredAt": "2026-06-20T09:15:00Z",
    "reviewedAt": "2026-06-20T09:15:47Z",
    "decision": { ... },
    "ai": {
      "accidentType": "rear_end",
      "severity": 4,
      "confidence": 0.92,
      "injuryRisk": "high"
    },
    "mediaList": [
      { "type": "image", "url": "https://...", "width": 1280, "height": 720 }
    ],
    "accidentPolygon": {
      "points": [...],
      "baseWidth": 1280,
      "baseHeight": 720
    }
  }
}
```

---

## 4. Notifications (Persisted)

**Priority:** HIGH — powers the notification bell history.

### List
```
GET /notifications
Authorization: cookie session (scoped to authenticated user)
```

| Param | Type | Default | Description |
|---|---|---|---|
| `unread` | boolean | — | If `true`, return only unread |
| `page` | integer | 1 | |
| `limit` | integer | 30 | |

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "incident_assigned",
      "title": "Incident Assigned",
      "message": "NODE-001 · rear_end · severity 4/5",
      "severity": "HIGH",
      "timestamp": "2026-06-20T09:15:00Z",
      "read": false,
      "payload": { /* original incident socket data */ }
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 30,
    "unreadCount": 3
  }
}
```

### Mark single read
```
PATCH /notifications/:id/read
Body: {}
Response: 204 No Content
```

### Mark all read
```
PATCH /notifications/read-all
Body: {}
Response: 204 No Content
```

### Implementation notes
- Create a `Notification` model: `id`, `userId (FK)`, `type`, `title`, `message`, `severity`, `timestamp`, `read (bool, default false)`, `payload (JSON)`.
- When the backend emits `incident-assigned` to a socket room, also persist a notification row for the target user.
- When the backend emits `decision-confirmed`, persist a notification row for the observer who made the decision.
- Index on `(userId, read, timestamp)` for fast unread count queries.
- `unreadCount` in `meta` must always reflect the true unread count for the user (not just the current page).

---

## 5. Socket Payload Contract

The frontend builds live notification items and populates the `AccidentDialog` directly from socket payloads. The following fields **must** be present on `incident-assigned` and `accident-detected` events:

```ts
interface IncidentPayload {
  incidentId: string;        // used by AccidentDialog for submit
  nodeId: string;            // used for map marker highlight
  timestamp: string;         // ISO string — notification timestamp
  node: {
    name: string;            // node display name
    defaultSpeedLimit: number;
    defaultLaneCount: number;
    defaultLaneConfiguration: Array<{ id: number; name: string; state: string }>;
  };
  ai: {
    accidentType: string;    // e.g. "rear_end"
    severity: number;        // 1–5
    confidence: number;      // 0–1
    injuryRisk?: 'low' | 'medium' | 'high';
  };
  decision: {
    speedLimit: number;
    laneConfiguration: string;   // comma-separated, e.g. "open,blocked,open"
    actions: string[];
    originalSpeedLimit: number;
  };
  mediaList?: Array<{ type: 'image' | 'video'; url: string; width?: number; height?: number }>;
  accidentPolygon?: {
    points: Array<{ x: number; y: number }>;
    baseWidth?: number;
    baseHeight?: number;
  };
}
```

`decision-confirmed` payload (existing, no change needed):
```ts
interface DecisionConfirmedPayload {
  incidentId: string;
  status: 'CONFIRMED' | 'MODIFIED' | 'REJECTED';
  message: string;
}
```

---

## 6. Nodes RBAC

**Priority:** MUST confirm before going live.

The frontend now calls `GET /nodes` for the road observer role (for the map + KPI counts). This endpoint currently exists but its RBAC must allow `road_observer`:

- `GET /nodes` — confirm `road_observer` is in the allowed roles list.
- Only `status`, `name`, `streetName`, `latitude`, `longitude`, `nodeId` are needed for the map/rail. If the full node payload is sensitive, add a lightweight `GET /nodes?fields=status,name,streetName,lat,lng` variant.

---

## 7. Route Rename

The frontend route has been renamed: **`/map` → `/road-observer`**.

A React `<Navigate>` redirect is in place at `/map` → `/road-observer` for backward compatibility.

Backend checklist:
- [ ] Confirm no backend routes, deep links, email templates, or webhook callbacks reference the old `/map` path.
- [ ] Confirm no socket room names are keyed on the route path.
- [ ] Update `road_observer.defaultPath` in any backend-managed role config to `/road-observer`.
- [ ] If there is a `/api/roles` or `/api/config` endpoint that returns the default path, update it there too.

---

## API surface summary

| Endpoint | Method | Status |
|---|---|---|
| `GET /observer/me/stats` | GET | 🔴 New |
| `GET /incidents/history` | GET | 🔴 New |
| `GET /incidents/:id` | GET | 🔴 New (or extend existing) |
| `GET /notifications` | GET | 🔴 New |
| `PATCH /notifications/:id/read` | PATCH | 🔴 New |
| `PATCH /notifications/read-all` | PATCH | 🔴 New |
| `GET /nodes` | GET | 🟡 Confirm RBAC for road_observer |
| Socket `incident-assigned` | — | 🟡 Confirm payload contract |
| Socket `decision-confirmed` | — | ✅ Already correct |
