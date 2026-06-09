# Project Overview

## What is this?

The **Safe Space Central Unit Dashboard** is the operator-facing web interface for the Central Unit backend. It is a React 18 + Vite SPA that gives four operator roles a real-time view of highway incidents, node infrastructure, camera feeds, and system health.

It is the **only human interface to the system's operational core** — no mobile app, no CLI, no other frontend.

---

## Status snapshot (as of 2026-06-09)

| Category | Count | Details |
|---|---|---|
| Features completed | 8 | auth, admin, cameras, dashboard, incidents, map, node-maintainer, profile |
| Features partial | 1 | system-test (broken on mount, malformed JSX) |
| Features not started | 4 | alerts, messages, reports, settings (all "Coming Soon" stubs) |
| Operator roles implemented | 4 of 5 | admin, emergency_dispatcher, road_observer, node_maintenance_crew (Data Analyst not started) |
| Known bugs | 9 | See [bugs.md](./bugs.md) |
| Test coverage | ~0% | One Redux reducer unit test; no component/integration/E2E tests |

---

## Operator roles

| Role | Primary purpose |
|------|----------------|
| `admin` | Full system access: user management, config, all features |
| `emergency_dispatcher` | SOS cases, dashboard charts, alerts |
| `road_observer` | Incident review + map (incident-driven workflow) |
| `node_maintenance_crew` | Node map, health monitoring, configuration, polygon editor |

---

## Commands

```bash
# Dev server — http://localhost:4000
npm run dev

# Production build → dist/
npm run build

# Preview production build
npm run preview

# Run tests (note: no "test" script in package.json, run vitest directly)
npx vitest
```

---

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_URL` | Full API base including `/api` | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO origin | derived from `VITE_API_URL` |
| `VITE_NODE_VIDEO_WS_URL` | WebSocket base for node video feeds | derived from `VITE_API_URL` |
| `VITE_ENABLE_DEV_PROXY` | Set `true` to proxy `/api` + `/socket.io` via Vite | (unset = false) |
| `VITE_DEV_PROXY_TARGET` | Proxy destination | `http://localhost:5000` |

See `.env.example` for a filled template.

---

## Deployment

GitHub Actions on push to `main` → SSH into EC2 → `docker compose up --build`. See `.github/workflows/deploy.yml`. The SPA is containerized and served by Nginx (`nginx.conf` in root).

---

## Repository layout

```
src/
  app/store.js              Redux store (3 slices: auth, cameras, nodes)
  features/<name>/          Feature modules (pages, components, slice, hooks)
  components/layout/        AppLayout, Sidebar, PageHeader
  components/ui/            Reusable UI primitives (8 components)
  components/               ProtectedRoute, ErrorBoundary
  services/api.js           Primary Axios client + all API namespaces
  services/streamApi.js     Separate Axios client for the stream microservice
  services/socketService.js Socket.IO singleton
  lib/apiConfig.js          URL config (VITE_* env vars → exported constants)
  config/navigation.js      Role-based nav items + default paths
  hooks/                    App-root hooks (heartbeat, video feed, geolocation)
  shared/utils/             Cross-feature utilities (roleUtils — has naming bug)
  utils/                    Helpers (toast wrappers, Egyptian field validation)
  designSystem.js           Design token constants (advisory, not enforced)
  icons.js                  FontAwesome icon registration (~90 solid icons)
  App.jsx                   Router + lazy routes + startup session refresh
  main.jsx                  Entry point (StrictMode, Redux Provider, ErrorBoundary)

docs/                       Project documentation (you are here)
```
