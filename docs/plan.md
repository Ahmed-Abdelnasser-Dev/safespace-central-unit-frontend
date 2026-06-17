# Project Plan

Status as of 2026-06-09. Update this file as work lands.

---

## Completed

### Core infrastructure
- [x] Cookie-based authentication (login, session refresh, logout)
- [x] MFA two-factor auth flow
- [x] Must-change-password enforcement
- [x] Role-based routing + `ProtectedRoute`
- [x] `AppLayout` + `Sidebar` with role-aware nav
- [x] App-root session rehydration on page load
- [x] Socket.IO integration (`socketService.js`) for incidents + heartbeats
- [x] Native WebSocket for node video feed (`useNodeVideoFeed.js`)
- [x] Native WebSocket + Canvas rendering for camera streams (`useStreamSocket.js`)
- [x] URL config (`lib/apiConfig.js`) — single source of env vars
- [x] Node heartbeat timeout (offline detection every 10s, 60s threshold)
- [x] ErrorBoundary

### Features
- [x] **auth** — Sign in, 2FA, change-password flow, session refresh
- [x] **admin** — User management (CRUD, filters, pagination) + Activity logs
- [x] **cameras** — Camera list, CRUD modals, live stream view, start/stop
- [x] **dashboard** — Socket-driven charts (heartbeat + accident series), date range controls, hourly metrics API integration
- [x] **incidents** — `AccidentDialog`: AI analysis, decision comparison, admin override, confirm/reject dispatch
- [x] **map** — `MapOverviewPage` with MapLibre, node markers, KPI cards, incident dialog trigger
- [x] **node-maintainer** — Full node management: map, detail tabs (Overview/Health/Road Config/Node Config/Polygons), CRUD, lane polygon editor, video feed player
- [x] **profile** — Profile view, change password, edit personal info, photo upload, recent activity
- [x] **emergency-dispatcher** — Case list (SOS + incidents, tabs, unread badges), case detail (3-col map/info/dispatch layout), nearest-units panel with Haversine ranking, dispatch confirm modal, live assignment tracking, notes timeline, callback modal, escalate/close actions. Mock-data UI shell — backend seam ready for swap (see `docs/features/emergencyDispatcher.md`)

---

## Remaining (partial or buggy — needs work)

### Bug fixes (see [bugs.md](./bugs.md) for details)
- [ ] `CheckYourEmailPage.jsx:42` — stray literal text ` font-semibold` rendered on page
- [ ] `CameraFeedsPage.jsx:15` — reads wrong Redux path (`operator.role` vs `user.role`); camera manage buttons never show for any role
- [ ] `SystemTestPage.jsx:73` — `useState` used instead of `useEffect` for on-mount test run
- [ ] `SystemTestPage.jsx:137-139` — malformed JSX around backend-status block
- [ ] `roleUtils.js` — role names `ADMINISTRATOR`/`NODE_MAINTAINER` don't match canonical `admin`/`node_maintenance_crew`
- [ ] Raw `axios` in `nodesSlice.js` and `incidentDecisionService.js` bypasses auth refresh interceptor — move to `api` instance with `withCredentials`

### Incomplete features
- [ ] **Forgot password flow** — `ForgotPasswordPage` submits no API call; no `forgotPassword` method in `api.js`; `CheckYourEmailPage`/`YouAreAllSetPage` show hardcoded `example@gmail.com` instead of real user email
- [ ] **Dashboard KPIs** — `statsTop` cards (active users, incidents today, API latency) and "Recent Alerts" list are hardcoded mock data; need to connect to real backend endpoints
- [ ] **2FA resend code** — "Resend Code" button has no `onClick` handler (non-functional)
- [ ] **npm test script** — no `test` script in `package.json`; no vitest config in `vite.config.js`; `jest-dom` has no setup file
- [ ] **nodesSlice.js:361** — `console.error` used as an info log; should be `console.log` or removed

---

## Not started

### Placeholder features (all render "Coming Soon")
- [ ] **alerts** — `src/features/alerts/pages/AlertsPage.jsx` — real-time alert feed for admin + dispatcher
- [ ] **messages** — `src/features/messages/pages/MessagesPage.jsx` — messaging interface
- [ ] **reports** — `src/features/reports/pages/ReportsPage.jsx` — report builder (PDF/CSV)
- [ ] **settings** — `src/features/settings/pages/SettingsPage.jsx` — system configuration

### New role
- [ ] **Data Analyst role** — 5th role from target architecture. Pages: KPI dashboard, Recharts charts (line/donut/bar), hotspot heatmap, node performance table, report builder, PDF/CSV export. Requires new Redux/nav config entry and protected routes.

### Internationalization
- [ ] **i18n** — i18next + react-i18next, Arabic + English translations, RTL layout support. No foundation exists today.

### Messaging integration
- [ ] **Rocket.Chat** — Self-hosted embed as slide-in overlay (persistent icon in all layouts). Requires backend Rocket.Chat Docker setup + bot account + role channels.

### Test coverage
- [ ] Unit tests for UI primitives (`src/components/ui/`)
- [ ] Unit tests for utilities (`egyptianValidation.js`, `roleUtils.js`)
- [ ] Unit tests for hooks (`useGeolocation`, `useHeartbeatTimeout`, `useNodeVideoFeed`)
- [ ] Component tests for key pages (at minimum: SignInPage, UserManagementPage, CameraFeedsPage)
- [ ] Set up vitest config, `test` npm script, jest-dom setup file

### Optional architectural migrations (see [target-architecture.md](./target-architecture.md))
- [ ] TanStack Query for server data (replace thunks in nodes, cameras, admin)
- [ ] JWT-in-Redux-memory auth (requires backend changes)
- [ ] shadcn/ui adoption
- [ ] React-Leaflet swap (currently MapLibre — assess if worth the churn)
- [ ] Unified WebSocket Redux middleware (replace 3 separate channels)
