# Safe Space — System Context

Safe Space is an AI-powered highway accident detection and emergency response system, built as a graduation project at **Suez Canal University, Faculty of Engineering (Computer Engineering Department)**, supervised by **Dr. Samar Awad**.

**This dashboard is the only human interface to the system's operational core.** Operators interact with this React SPA to monitor detections, review incidents, manage infrastructure, and dispatch responses.

---

## Three-layer architecture

```
┌──────────────────────────────────────────────────────────┐
│  DETECTION LAYER                                          │
│  Raspberry Pi 5 nodes along highways                     │
│  • YOLOv8-nano on-device inference                       │
│  • GPS + ESP32 + SIM + camera                            │
│  • POST detection events to Central Unit (REST)          │
│  • Auth: API key + mTLS client cert (both required)      │
│  • Receive commands back via persistent WebSocket        │
└─────────────────────────┬────────────────────────────────┘
                          │ REST + WebSocket
┌─────────────────────────▼────────────────────────────────┐
│  CENTRAL UNIT (Internal Layer)                            │
│  Node.js/Express monolith, Clean Architecture            │
│  7-stage Decision Server pipeline:                        │
│    receive → deduplicate → correlate → rule-check        │
│    → AI verify → classify → act                          │
│  Dual detection sources: nodes (YOLOv8-nano)             │
│    + CCTV cameras (YOLOv8-large on dedicated GPU VM)     │
│  Exposes REST APIs → consumed by this dashboard          │
│  Pushes real-time events → socket.io → this dashboard    │
│  VM cluster: Firewall, DMZ, Nginx, Backend, AI/GPU,      │
│    Database (PostgreSQL + TimescaleDB), RabbitMQ         │
└────────────┬───────────────────────────────┬─────────────┘
             │ RabbitMQ                       │ RabbitMQ
┌────────────▼────────────┐    ┌─────────────▼────────────┐
│  MOBILE APP SERVER      │    │  THIS DASHBOARD (you are │
│  (Azure, separate repo) │    │  here)                    │
│  • SMS OTP auth (JWT    │    │  React 18 + Vite SPA      │
│    RS256)               │    │  Operator roles:          │
│  • GPS sync             │    │    admin                  │
│  • FCM push notifs      │    │    emergency_dispatcher   │
│  • User incident reports│    │    road_observer          │
│  • SOS requests         │    │    node_maintenance_crew  │
│  Flutter mobile app     │    └───────────────────────────┘
└─────────────────────────┘
```

---

## Key RabbitMQ exchanges (Central Unit ↔ Mobile App Server)

| Exchange | Direction | Purpose |
|----------|-----------|---------|
| `user.report.submitted` | Mobile → Central Unit | Public user incident reports |
| `user.report.verdict` | Central Unit → Mobile | Verdict on user reports |
| `incident.verified` | Central Unit → Mobile | Verified incident alerts → FCM push |
| `sos.submitted` | Mobile → Central Unit | SOS cases for Emergency Dispatchers |
| `cctv.detection` | AI/GPU VM → Central Unit | CCTV-sourced detection events |

---

## How this dashboard connects to the Central Unit

- **REST API** — `src/services/api.js` (Axios). Base URL: `VITE_API_URL`. Cookie-based auth (`withCredentials: true`).
- **Socket.IO** — `src/services/socketService.js`. Connects to `VITE_SOCKET_URL`. Receives `incident-assigned`, `accident-detected`, `node_heartbeat`, `node_config_update`.
- **Native WebSocket (node video)** — `src/hooks/useNodeVideoFeed.js`. `VITE_NODE_VIDEO_WS_URL/ws/nodes?client=dashboard`. Base64 JPEG frames.
- **Stream service** — `src/services/streamApi.js` (separate Axios instance). Camera CRUD + start/stop. Native WebSocket for live MJPEG stream in `src/features/cameras/hooks/useStreamSocket.js`.

---

## Central Unit backend features (server-side counterpart)

These backend feature modules power what this dashboard exposes. Understanding them helps when debugging API behavior:

| Backend feature | Powers dashboard feature |
|---|---|
| `auth` | Login, MFA, session |
| `operators` | User management, presence |
| `nodes` | Node Maintainer map + detail panels |
| `detection` | Decision Server → incident events |
| `incidents` | Incident queue, assignment, override |
| `cctv` | Camera config + stream |
| `sos` | Emergency Dispatcher cases |
| `analytics` | Data Analyst KPIs (not yet built in dashboard) |
| `notifications` | WebSocket push to this dashboard |
