# Safe Space — Backend Integration Guide

**For the backend team.** This document describes exactly what the backend must do to integrate with the DMZ frontend deployment. Read it in full before starting — all sections are required.

---

## Architecture overview

```
 Browser
   │  http://<DMZ_IP>:80
   ▼
 DMZ VM  (nginx reverse proxy + React SPA)
   │  forwards to backend:5000 and stream-service:4001
   ▼
 Backend VM  (central-unit backend + stream-service + PostgreSQL)
```

The browser **never talks to the backend VM directly**. All traffic goes through the DMZ nginx. This means:

- The origin the browser sends in every request is `http://<DMZ_IP>` — not `localhost` and not the backend VM's IP.
- Cookies are set on `http://<DMZ_IP>`.
- Any URL the backend sends to the browser (e.g. links to uploaded images) must use `http://<DMZ_IP>` as the base — not the backend's own IP.

---

## 1. Required environment variable changes

Open the backend `.env` file and update these three values. Replace `<DMZ_IP>` with the actual IP address of the DMZ VM (e.g. `192.168.122.74`).

```env
# The origin the browser connects from — used for CORS and cookie policy
FRONTEND_URL=http://<DMZ_IP>

# Comma-separated list of origins allowed by CORS
ALLOWED_ORIGINS=http://<DMZ_IP>

# Public base URL for building absolute media URLs (uploads, snapshots, etc.)
# Must be browser-reachable — i.e. the DMZ origin, not the backend's own IP
BACKEND_PUBLIC_URL=http://<DMZ_IP>
```

After editing, **restart the backend service**.

### Why `BACKEND_PUBLIC_URL` matters

The backend constructs absolute URLs for uploaded files (incident photos, node snapshots, profile pictures) and sends them to the dashboard. If this is set to the backend's own IP (e.g. `http://192.168.122.51:5000`), those URLs will point to a host the browser cannot reach. Setting it to the DMZ origin routes the browser through the nginx `/uploads/` proxy, which the browser can reach.

---

## 2. CORS requirements

The frontend sends `withCredentials: true` on every request (required for cookie-based auth). This imposes strict CORS rules:

- `Access-Control-Allow-Origin` must be the **exact DMZ origin** — not `*` (wildcard is forbidden with credentials)
- `Access-Control-Allow-Credentials: true` must be set
- `Access-Control-Allow-Methods` must include `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers` must include `Content-Type, Authorization, Cookie`

Setting `FRONTEND_URL` and `ALLOWED_ORIGINS` to the DMZ IP in the backend env (step 1) should be sufficient if the backend's CORS middleware reads those values. Confirm the backend is not hardcoding `localhost` anywhere in its CORS config.

---

## 3. Cookie requirements (HTTP-only deployment)

This deployment runs over plain HTTP (no TLS). Auth cookies must be configured to work without HTTPS:

- **Do not set the `Secure` flag** on cookies when `NODE_ENV=production` if the origin is HTTP. A `Secure` cookie over HTTP will silently be rejected by the browser.
- `SameSite=Lax` is correct for this setup (same-origin requests via the proxy).
- `HttpOnly=true` should remain set.

---

## 4. Network / firewall

The backend VM must accept **inbound TCP connections from the DMZ VM** on these ports:

| Port | Service |
|------|---------|
| `5000` | Central-unit backend (REST API + Socket.IO) |
| `4001` | Stream-service (video WebSocket + camera REST) |

No other VM (including the host machine / LAN) should be able to reach ports `5000` or `4001` directly. Only the DMZ VM should have access.

If the backend VM has `ufw` active, run:
```bash
sudo ufw allow from <DMZ_VM_IP> to any port 5000 proto tcp
sudo ufw allow from <DMZ_VM_IP> to any port 4001 proto tcp
```

---

## 5. What the DMZ nginx proxies

The nginx on the DMZ VM forwards these paths to the backend. The backend must have all of these working:

| Proxied path | Forwards to | Notes |
|---|---|---|
| `/api/*` | `backend:5000/api/*` | All REST endpoints |
| `/socket.io/*` | `backend:5000/socket.io/*` | Socket.IO (polling + WS upgrade) |
| `/uploads/*` | `backend:5000/uploads/*` | Static media files |
| `/stream-service/*` | `stream-service:4001/*` | Prefix stripped — `/stream-service/cameras` → `stream-service:4001/cameras` |

The stream-service must be running as a **separate process on port 4001** on the same VM as the backend (or a different VM — update `STREAM_HOST` in the frontend `.env` accordingly).

---

## 6. API endpoints the frontend calls

All calls go to `POST/GET/PATCH/DELETE /api/<path>`. The frontend expects these route groups to exist:

| Group | Prefix |
|---|---|
| Authentication | `/api/auth/*` (login, logout, refresh, forgot-password) |
| Users | `/api/users/*` |
| Activity logs | `/api/activity-logs/*` |
| Nodes | `/api/nodes/*` |
| Cameras | `/api/cameras/*` |
| Incidents | `/api/incidents/*` |
| Accident decisions | `/api/accident-decision` and `/api/decisions/*` |
| Dispatcher | `/api/dispatcher/*` |
| Observer | `/api/observer/*` |
| Notifications | `/api/notifications/*` |
| Metrics / KPIs | `/api/metrics/*` (or equivalent) |
| Health | `/api/health` |

---

## 7. Socket.IO events the frontend listens for

The frontend connects to Socket.IO at the root namespace on `http://<DMZ_IP>/socket.io/`. It uses **polling transport** (`transports: ['polling']`). The backend must support polling (in addition to WebSocket).

Events the frontend subscribes to:

| Event | Payload |
|---|---|
| `accident-detected` | Accident data object |
| `incident-assigned` | Assignment data object |
| `case:new` | Partial Case object (no PII) |
| `case:updated` | Partial Case (always includes `id`, `status`) |
| `unit:location` | `{ unitId, latitude, longitude, lastLocationAt }` |
| `unit:status` | `{ unitId, status }` |
| `assignment:updated` | Full Assignment object |
| `dispatcher:assigned` | `{ caseId }` |
| `node_heartbeat` | Heartbeat data |
| `node_config_update` | Config update data |

Events the frontend emits:

| Event | Payload |
|---|---|
| `admin_accident_response` | Admin response object |

---

## 8. Stream-service requirements

The stream-service must:
- Run on **port 4001**
- Expose `GET /cameras` and `GET /cameras/:id` (REST)
- Expose `WS /stream/:cameraId` (WebSocket — sends **binary** JPEG frames for CCTV cameras)
- Expose `WS /ws/nodes?client=dashboard` (WebSocket — sends **JSON** frames for detection node cameras, see below)
- Expose `GET /health`

### Camera stream — `WS /stream/:cameraId`

The CCTV camera video player connects via WebSocket to `/stream-service/stream/:cameraId`,
which the DMZ nginx strips to `/stream/:cameraId` and forwards to `stream-service:4001`.
The stream-service sends raw binary JPEG frames; no envelope format.

### Node stream — `WS /ws/nodes?client=dashboard`

The Road Observer node detail dialog connects to `/stream-service/ws/nodes?client=dashboard`
(nginx strips the prefix to `/ws/nodes`). This endpoint uses **JSON text frames**:

**Client → Server on connect:**
```json
{ "type": "dashboard_subscribe", "nodeIds": ["<nodeId>"] }
```

**Server → Client per frame:**
```json
{ "type": "video_frame", "nodeId": "<nodeId>", "frameData": "<base64-JPEG>" }
```

`frameData` is a plain base64 string (no data URI prefix). The frontend renders it as
`<img src="data:image/jpeg;base64,{frameData}">`.

For this to work in DMZ mode, the build `.env` must set:
```env
VITE_NODE_VIDEO_WS_URL=ws://<DMZ_IP>/stream-service
```

See `backend-integration-dashboard.md` §12 for full routing details.

---

## 9. Verification checklist

After making the changes above, verify end-to-end:

- [ ] Open `http://<DMZ_IP>` in a browser — the login page loads
- [ ] Log in with a valid account — no CORS errors in the browser console, cookie is set on `http://<DMZ_IP>`
- [ ] Dashboard loads with live data — KPI cards, map markers visible
- [ ] Socket.IO connects — check the browser Network tab for a successful `/socket.io/` request
- [ ] An incident or node triggers a real-time event — the dashboard updates without a page reload
- [ ] Open the Cameras page — a camera feed renders (validates the `/stream-service/stream/:cameraId` WS proxy)
- [ ] Open the Road Observer, click a node in the right rail — the node detail dialog opens and shows a live feed or "CONNECTING" badge (validates the `/stream-service/ws/nodes` WS proxy)
- [ ] Open the Profile page and upload a photo — it saves and loads back correctly (validates `/uploads/` proxy)
- [ ] Inspect any image URL in the browser — it must start with `http://<DMZ_IP>`, not the backend's IP
