# Backend Integration — Node Maintainer

This document describes every API endpoint and realtime event the Node Maintainer redesign calls. For each call, status **✅ Implemented** means the frontend already calls it and expects the response shape below. Status **⚠️ Not yet implemented** means the UI has graceful degradation today but the full experience requires the endpoint.

---

## Auth Model

All calls to the main backend go through the authenticated axios client (`src/services/api.js`). This client:
- Sends `withCredentials: true` (HttpOnly session cookie)
- On `401` silently calls `POST /api/auth/refresh`; on refresh failure redirects to `/sign-in`

All calls to the stream-service go through `src/services/streamApi.js`:
- Also sends `withCredentials: true`
- On `502/503/504` or network error, throws a typed `StreamServiceUnavailableError` — the UI shows "Camera service unavailable" rather than crashing

Role required for all node maintainer routes: `node_maintenance_crew` or `admin`.

---

## 1. Node CRUD (main backend — `/api/nodes`)

### 1.1 List all nodes
```
GET /api/nodes
Auth: cookie
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "NODE-001",
      "name": "Highway A1 — Exit 23B",
      "status": "online",
      "location": {
        "latitude": 30.0131,
        "longitude": 32.5498,
        "address": "Highway A1, Exit 23B, Ismailia"
      },
      "nodeSpecs": {
        "cameraResolution": "1920x1080",
        "frameRate": 30,
        "ipAddress": "192.168.1.200",
        "bandwidth": "100 Mbps",
        "detectionSensitivity": 70,
        "minObjectSize": 50
      },
      "firmwareVersion": "1.0.0",
      "modelVersion": "yolov8n-2026.01",
      "videoFeedUrl": "http://192.168.1.200/stream",
      "roadRules": {
        "speedLimit": 80,
        "lanes": [
          { "id": 1, "name": "Lane 1", "type": "standard", "status": "open" }
        ]
      },
      "lanePolygons": [
        {
          "id": "poly-001",
          "name": "Lane 1",
          "laneNumber": 1,
          "type": "lane",
          "points": [{ "x": 100, "y": 200 }, { "x": 300, "y": 200 }],
          "baseWidth": 640,
          "baseHeight": 640,
          "isEmpty": false
        }
      ],
      "health": {
        "cpu": 34,
        "memory": 52,
        "network": 80,
        "storage": 45,
        "temperature": 42,
        "currentFps": 29.8
      },
      "lastHeartbeat": "2026-01-15T10:30:00Z",
      "uptimeSec": 86400,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Errors:**
- `401` — Not authenticated (auto-refresh triggered)
- `403` — Role not permitted

---

### 1.2 Register a new node ⚠️ Partial
```
POST /api/nodes/register
Auth: cookie
Content-Type: application/json
```

**Request body** (sent by the 5-step creation wizard):
```json
{
  "nodeId": "NODE-007",
  "name": "Highway A2 — Junction 4",
  "location": {
    "latitude": 30.0455,
    "longitude": 32.5812,
    "address": "Highway A2, Junction 4, Ismailia"
  },
  "nodeSpecs": {
    "cameraResolution": "1920x1080",
    "frameRate": 30,
    "ipAddress": "192.168.1.207",
    "bandwidth": "100 Mbps",
    "detectionSensitivity": 70,
    "minObjectSize": 50
  },
  "firmwareVersion": "1.0.0",
  "modelVersion": "yolov8n-2026.01",
  "videoFeedUrl": "http://192.168.1.207/stream",
  "roadRules": {
    "speedLimit": 80,
    "lanes": [
      { "id": 1, "name": "Lane 1", "type": "standard", "status": "open" }
    ]
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { /* same shape as list item */ }
}
```

**Errors:**
- `400` — Missing required fields (nodeId, location.latitude, location.longitude, location.address)
- `409` — nodeId already in use
- `401/403` — Auth

> **Note:** The frontend currently calls `POST /api/nodes/register`. If your backend uses a different path (e.g. `POST /api/nodes`), update `src/services/api.js:registerNode`.

---

### 1.3 Update a node
```
PATCH /api/nodes/:nodeId
Auth: cookie
Content-Type: application/json
```

This is a partial update. Any combination of these top-level fields may be sent:

```json
{
  "name": "Updated Name",
  "status": "offline",
  "location": { "address": "Updated Address" },
  "nodeSpecs": { "detectionSensitivity": 80 },
  "roadRules": {
    "speedLimit": 100,
    "lanes": [ { "id": 1, "name": "Lane 1", "type": "standard", "status": "blocked" } ]
  },
  "lanePolygons": [ /* full polygon array replacement */ ],
  "firmwareVersion": "1.1.0"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { /* updated full node */ }
}
```

**Errors:**
- `404` — Node not found
- `400` — Invalid field values

> The frontend uses this single `PATCH` endpoint for multiple operations: editing node metadata, saving road config (speedLimit + lanes), updating polygons, toggling node status, and saving specs. The backend should do a deep merge (not replace) for nested objects like `nodeSpecs` and `roadRules`.

---

### 1.4 Delete a node
```
DELETE /api/nodes/:nodeId
Auth: cookie
```

**Response 200:**
```json
{ "success": true }
```

**Errors:**
- `404` — Node not found
- `403` — Only admin or node_maintenance_crew

---

## 2. Health History ⚠️ Not yet implemented

```
GET /api/nodes/:nodeId/health-history?range=24h
Auth: cookie
```

Range values: `1h`, `6h`, `24h`, `7d`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cpu":         { "labels": ["10:00", "10:05", "10:10"], "values": [34, 38, 41] },
    "memory":      { "labels": ["10:00", "10:05", "10:10"], "values": [52, 53, 55] },
    "network":     { "labels": ["10:00", "10:05", "10:10"], "values": [80, 75, 82] },
    "storage":     { "labels": ["10:00", "10:05", "10:10"], "values": [45, 45, 46] },
    "temperature": { "labels": ["10:00", "10:05", "10:10"], "values": [42, 43, 42] },
    "fps":         { "labels": ["10:00", "10:05", "10:10"], "values": [29.8, 30.0, 29.5] }
  }
}
```

Labels are human-readable time strings matching the requested range granularity (minutes for `1h`/`6h`, hours for `24h`, days for `7d`).

**Graceful degradation:** If this endpoint returns `404`, `501`, or `405`, the frontend shows "Awaiting telemetry" empty states in the Health tab. No console error is emitted.

> **Priority: HIGH** — The Health tab's historical charts are empty until this endpoint exists.

---

## 3. Geocoding Proxy ⚠️ Not yet implemented

These endpoints let the browser look up addresses without making direct calls to external geocoders (which would be blocked from the DMZ).

### 3.1 Forward geocode (text → coordinates)
```
GET /api/geocode?q=Highway+A1+Junction+4
Auth: cookie (optional — proxied call, but keep auth for rate limiting)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "latitude": 30.0455,
    "longitude": 32.5812,
    "displayName": "Highway A1, Junction 4, Ismailia, Egypt"
  }
}
```

### 3.2 Reverse geocode (coordinates → address)
```
GET /api/reverse-geocode?lat=30.0455&lng=32.5812
Auth: cookie
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "address": "Highway A1, Junction 4, Ismailia, Egypt"
  }
}
```

**Graceful degradation:** Both return `null` from the frontend's perspective when the endpoint is `404`/`501`/`405`. The node creation wizard shows the address as a manual text field; the map pin still works without it.

> **Priority: MEDIUM** — The Location step of the node creation wizard already works via manual address entry. Geocoding is an enhancement.

---

## 4. Camera API (stream-service — `/stream-service/cameras`)

All camera calls go to the **stream-service** container, proxied through nginx at `/stream-service`. The stream-service uses the same HttpOnly cookie for auth.

### 4.1 List cameras ✅
```
GET /stream-service/cameras
Auth: cookie
```

**Response 200:**
```json
[
  {
    "id": "cam-001",
    "name": "Cam A1-North",
    "nodeId": "NODE-001",
    "location": "Highway A1, Exit 23B",
    "status": "ONLINE",
    "rtspUrl": "[REDACTED]",
    "lastSeenAt": "2026-01-15T10:30:00Z"
  }
]
```

> `status` values: `"ONLINE"`, `"OFFLINE"`, `"ERROR"`. The frontend maps these to live/offline/error badge states.

### 4.2 Create camera ✅
```
POST /stream-service/cameras
Auth: cookie
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Cam A1-South",
  "rtspUrl": "rtsp://192.168.1.200/stream1",
  "location": "Highway A1, South approach",
  "nodeId": "NODE-001"
}
```

**Response 201:** Full camera object (same shape as list item, with `id` assigned).

### 4.3 Update camera ✅
```
PUT /stream-service/cameras/:id
Auth: cookie
Content-Type: application/json
```

**Request:** Same fields as create. `rtspUrl` is optional on update (omit to keep existing).

**Response 200:** Updated camera object.

### 4.4 Delete camera ✅
```
DELETE /stream-service/cameras/:id
Auth: cookie
```

**Response 200:** `{ "success": true }` or empty body.

### 4.5 Start stream
```
POST /stream-service/cameras/:id/start
Auth: cookie
```

**Response 200:** `{ "status": "started" }`

### 4.6 Stop stream
```
POST /stream-service/cameras/:id/stop
Auth: cookie
```

**Response 200:** `{ "status": "stopped" }`

### 4.7 Stream-service health check
```
GET /stream-service/health
Auth: not required
```

**Response 200:** `{ "status": "ok" }`

**Note on errors:** Any `502/503/504` or network error from the stream-service is caught and shown as "Camera service unavailable" — not a browser console error.

---

## 5. Real-Time Events (Socket.IO)

### 5.1 `node_heartbeat`

Emitted by the backend every 5–30 seconds per active node. The frontend dispatches `updateNodeFromHeartbeat` which merges this payload into Redux state.

**Payload:**
```json
{
  "nodeId": "NODE-001",
  "status": "online",
  "timestamp": "2026-01-15T10:30:00Z",
  "uptimeSec": 86400,
  "firmwareVersion": "1.0.0",
  "modelVersion": "yolov8n-2026.01",
  "health": {
    "cpu": 34,
    "memory": 52,
    "network": 80,
    "storage": 45,
    "temperature": 42,
    "currentFps": 29.8
  },
  "ipAddress": "192.168.1.200",
  "videoFeedUrl": "http://192.168.1.200/stream",
  "latitude": 30.0131,
  "longitude": 32.5498,
  "speedLimit": 80,
  "lanes": [
    { "id": 1, "name": "Lane 1", "type": "standard", "status": "open" }
  ]
}
```

> All fields except `nodeId` and `timestamp` are optional — send only what has changed. The frontend does a safe merge.

### 5.2 `node_config_update`

Emitted when a node's configuration changes from the server side (not from this UI). The frontend subscribes via `socketService.onNodeConfigUpdate`.

**Payload:** Same shape as `node_heartbeat` — a partial node update. The Redux reducer does a safe merge.

---

## 6. Not-Yet-Implemented Endpoints (Priority List)

| Priority | Endpoint | Blocks |
|----------|----------|--------|
| HIGH | `GET /api/nodes/:id/health-history?range=` | Health tab charts (currently shows empty state) |
| MEDIUM | `GET /api/geocode?q=` | Location picker address search |
| MEDIUM | `GET /api/reverse-geocode?lat=&lng=` | Pin-drop address auto-fill |
| LOW | Camera status events (socket) | Real-time camera status updates (currently polled on page load only) |

---

## 7. Node Data Shape Reference

The frontend's `normalizeNode` function (in `nodesSlice.js`) maps backend responses to this internal shape. Your API must return fields matching this table:

| Frontend field | Backend field | Notes |
|---|---|---|
| `node.id` | `id` or `nodeId` | The unique identifier (e.g. `"NODE-001"`) |
| `node.name` | `name` | Display name |
| `node.status` | `status` | `"online"` \| `"offline"` \| `"warning"` |
| `node.location.latitude` | `location.latitude` | Float |
| `node.location.longitude` | `location.longitude` | Float |
| `node.location.address` | `location.address` | Human-readable string |
| `node.health.cpu` | `health.cpu` | 0–100 (%) |
| `node.health.memory` | `health.memory` | 0–100 (%) |
| `node.health.network` | `health.network` | 0–100 (%) |
| `node.health.storage` | `health.storage` | 0–100 (%) |
| `node.health.temperature` | `health.temperature` | Degrees Celsius |
| `node.health.currentFps` | `health.currentFps` | Float |
| `node.nodeSpecs.ipAddress` | `nodeSpecs.ipAddress` | |
| `node.nodeSpecs.cameraResolution` | `nodeSpecs.cameraResolution` | e.g. `"1920x1080"` |
| `node.nodeSpecs.frameRate` | `nodeSpecs.frameRate` | Integer fps |
| `node.nodeSpecs.detectionSensitivity` | `nodeSpecs.detectionSensitivity` | 0–100 |
| `node.nodeSpecs.minObjectSize` | `nodeSpecs.minObjectSize` | Pixels |
| `node.roadRules.speedLimit` | `roadRules.speedLimit` | km/h |
| `node.roadRules.lanes` | `roadRules.lanes` | Array of lane objects |
| `node.lanePolygons` | `lanePolygons` | Array of polygon objects |
| `node.firmwareVersion` | `firmwareVersion` | Semver string |
| `node.modelVersion` | `modelVersion` | e.g. `"yolov8n-2026.01"` |
| `node.videoFeedUrl` | `videoFeedUrl` | HTTP or RTSP URL |
| `node.lastHeartbeat` | `lastHeartbeat` | ISO 8601 timestamp |
| `node.uptimeSec` | `uptimeSec` | Seconds as integer |
| `node.createdAt` | `createdAt` | ISO 8601 timestamp |

---

*Document generated for the Node Maintainer redesign (branch: main). Update when new endpoints are added.*
