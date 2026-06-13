# Target Architecture (Overview 2)

This document captures the **intended end-state** of the Central Unit Dashboard as originally specified. Compare against [architecture.md](./architecture.md) to understand the gap.

---

## Intended stack

| Concern | Target | Current (as-built) | Gap |
|---|---|---|---|
| Server state | TanStack Query | Redux thunks + raw axios | Full migration |
| UI kit | shadcn/ui | Custom `src/components/ui/` primitives | Replace or layer shadcn on top |
| Maps | React-Leaflet (OpenStreetMap) | MapLibre GL via `react-map-gl/maplibre` | Swap map library |
| Auth token | JWT access token in Redux memory; refresh token in httpOnly cookie | Cookie session only (no token in JS memory) | Auth layer redesign |
| Roles | 5 (adds Data Analyst) | 4 (no Data Analyst) | Implement 5th role |
| i18n | i18next, Arabic + English, RTL layout | None (English only, LTR) | Full i18n layer |
| Messaging | Rocket.Chat embedded (slide-in overlay) | None | Rocket.Chat integration |
| Realtime | Single persistent WebSocket per session in Redux middleware | socket.io (polling) + 2 native WS hooks | Unify + promote to middleware |
| State split | TanStack Query (server) / Redux (auth + WS + notifs + locale) / useState (UI) | Redux (all server state) / useState (UI) | Adopt TQ, slim Redux |

---

## Target role set (5 roles)

| Role | Purpose |
|------|---------|
| Administrator | System overview, operator management, system config, CCTV config, full incident/SOS, audit logs |
| Node Maintainer | Node map, detail panels, heartbeat history, remote command dispatch, lane polygon editor (Canvas) |
| Road Observer | Waiting screen (idle) / incident review panel + map side-by-side (active). Round-robin assignment, incidents private per observer |
| Emergency Dispatcher | SOS case list by received time, case detail, medical profile card, dispatch panel, case notes |
| **Data Analyst** *(not started)* | KPI cards, Recharts charts (line/donut/bar), hotspot heatmap, node performance table, report builder (PDF/CSV export) |

---

## Target state management split

```
TanStack Query   ←→  all server data (incidents, nodes, SOS, analytics)
                      handles caching, refetch, loading/error
Redux Toolkit    ←→  auth session (JWT in memory), WebSocket instance + status,
                      notification list + unread count, active locale
useState/useReducer ← local UI state (forms, modals, Canvas drawing)
```

This strict split does not exist today — Redux holds both auth and node/camera server data; other features use ad-hoc local state.

---

## Target auth model

- JWT **access token** stored in Redux memory (never localStorage)
- Refresh token in **httpOnly cookie**
- Silent refresh on page load (already partially implemented)
- 401 → interceptor attempts refresh → failure → logout (interceptor exists; token storage differs)
- ProtectedRoute reads Redux auth state; wrong role redirects to own home (implemented)

Current difference: the app uses purely cookie-based auth — the frontend never sees any token. In the target model, the access token would live in Redux memory.

---

## Target realtime model

Single persistent WebSocket per session, managed inside a **Redux middleware** (`websocketMiddleware.js`). Incoming events dispatch Redux actions. No per-component socket connections.

Current state: three separate channels, all managed in modules/hooks outside Redux (socket.io singleton, two native WS hooks).

---

## Target folder structure (RBAC-first)

```
src/features/
  admin/        — Administrator layout + pages
  nodeMaintainer/
  roadObserver/
  dispatcher/
  dataAnalyst/  ← not started
```

Each role gets its own layout, sidebar, and page set. A `RoleShell.jsx` reads role from JWT in Redux and renders the correct layout.

Current state: a single shared `AppLayout` + `Sidebar` with role-filtered nav items. No per-role layouts or `RoleShell`.

---

## Target Rocket.Chat integration

- Self-hosted Rocket.Chat in Docker on the Central Unit cluster
- Embedded as a **slide-in overlay** (persistent icon in all role layouts)
- The backend posts system messages via a `safespace-bot` account into role-specific channels:
  - `#administrators`, `#node-maintainers`, `#road-observers`, `#emergency-dispatchers`, `#data-analysts`
- Every operator action written simultaneously to Rocket.Chat (human-readable) and `audit_logs` table (structured)

Current state: none of this exists in the dashboard.

---

## Target audit trail

Every operator action:
1. Written to Rocket.Chat channel as a system message (via backend bot)
2. Written to `audit_logs` PostgreSQL table (structured, queryable by Admin + Data Analyst)

Current state: the backend has an `activity_logs` table; the dashboard reads it in `ActivityLogsPage`. The Rocket.Chat side does not exist.

---

## Migration priority order (suggested)

1. **Fix existing bugs** — highest ROI, no architectural commitment (see [bugs.md](./bugs.md))
2. **Complete partial features** — system-test, forgot-password, dashboard KPIs
3. **Implement not-started features** — alerts, messages, reports, settings pages
4. **Data Analyst role** — new role with analytics pages
5. **i18n** — Arabic/English + RTL
6. **TanStack Query migration** — replace thunks in nodes/cameras/admin features
7. **Rocket.Chat integration** — requires backend setup first
8. **JWT-in-memory auth** — requires backend auth changes
9. **React-Leaflet / shadcn migrations** — optional; assess actual benefit vs churn
