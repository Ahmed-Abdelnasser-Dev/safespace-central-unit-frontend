# Safe Space — Central Unit Dashboard

Operator-facing web interface for the Safe Space AI-powered highway accident detection and emergency response system.

Built as a graduation project at **Suez Canal University, Faculty of Engineering** (Computer Engineering Department), supervised by **Dr. Samar Awad**.

---

## Overview

Safe Space automates the full pipeline from on-site collision detection to emergency dispatch. This dashboard is the **only human interface to the system's operational core** — operators use it to monitor live detections, review AI-analyzed incidents, manage highway nodes, and coordinate emergency responses.

```
Detection Nodes (YOLOv8-nano)                    Mobile App (Flutter)
  Raspberry Pi 5 + GPS + Camera                  Public user reports + SOS
         |                                                  |
         | REST + WebSocket                        RabbitMQ |
         v                                                  v
  ┌─────────────────────────────────────────────────────────┐
  │              Central Unit Backend (Node.js)              │
  │   7-stage Decision Pipeline · PostgreSQL · TimescaleDB   │
  │   RabbitMQ · Socket.IO · YOLOv8-large (GPU VM)          │
  └─────────────────────────────┬───────────────────────────┘
                                │ REST + Socket.IO
                                v
                   ┌────────────────────────┐
                   │   This Dashboard       │
                   │   React 18 + Vite SPA  │
                   └────────────────────────┘
```

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Framework | React 18 + Vite 7 |
| State | Redux Toolkit (3 slices: auth, cameras, nodes) |
| Routing | React Router v6 |
| Styling | Tailwind CSS (custom `safe-*` design tokens) |
| HTTP | Axios (cookie-based auth, auto-refresh interceptor) |
| Realtime | Socket.IO client + native WebSocket (video feeds) |
| Maps | MapLibre GL via react-map-gl |
| Charts | Chart.js + chartjs-adapter-date-fns |
| Icons | FontAwesome (solid) + Bootstrap Icons |
| Testing | Vitest + Testing Library |
| Deployment | Docker + Nginx, GitHub Actions → EC2 |

---

## Operator Roles

The dashboard serves four operator roles, each with its own nav and page set:

| Role | Primary Workflow |
|------|----------------|
| **Administrator** | User management, system config, full incident and node access, audit logs |
| **Emergency Dispatcher** | Live dashboard charts, SOS cases, alerts, messaging |
| **Road Observer** | Map view, incident review and confirm/reject, reports |
| **Node Maintenance Crew** | Node map, health monitoring, lane polygon editor, remote config |

---

## Features

| Feature | Status |
|---------|--------|
| Authentication (login, MFA, session refresh) | Complete |
| User management + activity logs | Complete |
| Camera feeds (CRUD, live stream) | Complete |
| Live dashboard charts (incident + heartbeat) | Complete |
| Incident review (AI analysis, override, confirm/reject) | Complete |
| Map overview with node markers | Complete |
| Node management (CRUD, health tabs, polygon editor) | Complete |
| Operator profile | Complete |
| System connectivity test | Partial |
| Alerts, Messages, Reports, Settings | Not started |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running instance of the Central Unit backend (or `.env` pointing to one)

### Installation

```bash
git clone <repo-url>
cd safespace-central-unit-frontend
npm install
```

### Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Full API base URL including `/api` | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server origin | derived from `VITE_API_URL` |
| `VITE_NODE_VIDEO_WS_URL` | WebSocket base for node video feeds | derived from `VITE_API_URL` |
| `VITE_ENABLE_DEV_PROXY` | Set `true` to proxy `/api` and `/socket.io` through Vite | `false` |
| `VITE_DEV_PROXY_TARGET` | Proxy destination | `http://localhost:5000` |

### Development

```bash
npm run dev        # Dev server at http://localhost:4000
```

### Build

```bash
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
```

### Tests

```bash
npx vitest         # Run test suite
```

---

## Project Structure

```
src/
  app/store.js              Redux store (auth, cameras, nodes slices)
  features/<name>/          Feature modules — pages, components, slice, hooks
  components/layout/        AppLayout, Sidebar, PageHeader
  components/ui/            Shared UI primitives (Button, Card, Modal, Input, ...)
  services/api.js           Primary Axios client + all API namespaces
  services/streamApi.js     Axios client for the camera stream microservice
  services/socketService.js Socket.IO singleton
  lib/apiConfig.js          URL constants from env vars
  config/navigation.js      Role-based nav items and default paths
  hooks/                    App-root hooks (heartbeat, video feed, geolocation)
  utils/                    Helpers (toast, Egyptian field validation)
  designSystem.js           Design token constants
  App.jsx                   Router, lazy routes, startup session refresh
  main.jsx                  Entry point

docs/                       Project documentation and feature specs
```

---

## Architecture Notes

- **Auth** is cookie-based. The frontend never handles tokens — HTTP-only cookies are managed entirely by the browser. On 401, the Axios interceptor automatically attempts a silent refresh before retrying the original request.
- **Realtime** uses three channels: Socket.IO (polling) for incident events and node heartbeats; native WebSocket for node video feeds; native WebSocket for camera stream frames drawn to canvas.
- **State** is split: Redux holds auth session, camera list, and node list. All other features use local component state with direct Axios calls.

See [`docs/architecture.md`](./docs/architecture.md) for full details.

---

## Deployment

GitHub Actions triggers on push to `main`: SSH into EC2, run `docker compose up --build`. The app is served as a static SPA via Nginx.

See `.github/workflows/deploy.yml` and `nginx.conf` for configuration.

---

## Documentation

Full project documentation lives in [`docs/`](./docs/):

- [`docs/architecture.md`](./docs/architecture.md) — State, routing, auth, realtime, HTTP layer
- [`docs/roles-and-responsibilities.md`](./docs/roles-and-responsibilities.md) — Role access matrix and RBAC enforcement
- [`docs/features/`](./docs/features/) — Per-feature breakdown with status and data flow
- [`docs/plan.md`](./docs/plan.md) — Completed, remaining, and not-started work
- [`docs/bugs.md`](./docs/bugs.md) — Known issues with file and line references
- [`docs/target-architecture.md`](./docs/target-architecture.md) — Intended end-state and migration roadmap
- [`docs/system-context.md`](./docs/system-context.md) — Full Safe Space system overview

---

## Academic Context

**Institution:** Suez Canal University, Faculty of Engineering, Computer Engineering Department  
**Type:** Graduation project  
**Supervisor:** Dr. Samar Awad
