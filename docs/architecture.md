# Architecture (As-Built)

This documents the actual architecture of the codebase as it exists today, grounded in code exploration. See [target-architecture.md](./target-architecture.md) for the intended end-state.

---

## Theming

**Single source of truth:** `src/index.css` defines adaptive `safe-*` color tokens as RGB triplets in `:root` (light values) and `.dark` (dark values). `tailwind.config.js` maps those CSS vars to Tailwind tokens using the `rgb(var(--color-*) / <alpha-value>)` format so opacity modifiers work (e.g. `bg-safe-blue/10`).

**Toggle:** `src/contexts/ThemeContext.jsx` adds/removes `.dark` on `<html>` and persists to `localStorage['safespace-theme']`. Default is **dark**. `index.html` has an inline pre-paint script that reads localStorage before first render to prevent FOUC.

**Token rules:**
- Use `text-safe-text-primary` and `text-safe-text-muted` for all text on adaptive surfaces.
- Surface tokens (`safe-dark`, `safe-gray`, etc.) are **never** used as text colors — they are background/border values.
- `text-white` is only valid on fixed non-adaptive backgrounds (blue/red buttons, dark gradients, video viewfinders).
- Never use raw Tailwind grays (`text-gray-400`, etc.) or raw hex (`text-[#...]`) in JSX `className` strings.
- See `DESIGN.md §2` and `docs/design.md` for the full adaptive token table and WCAG contrast verification.

---

## State management

Redux Toolkit is the only state library. The store (`src/app/store.js`) registers **three slices**:

| Slice key | File | What it holds |
|-----------|------|--------------|
| `auth` | `src/features/auth/authSlice.js` | `user`, `isAuthenticated`, `loading`, `loadingRefresh`, `error`, `mustChangePassword`, `mfaRequired`, `pendingMfaUserId` |
| `cameras` | `src/features/cameras/cameraSlice.js` | `cameras[]`, `loading`, `submitting`, `error` |
| `nodes` | `src/features/nodeMaintainer/nodesSlice.js` | `nodes{}` (normalized by id), `selectedNodeId`, `currentTab`, `isLoading`, `error` |

All other features (admin, dashboard, incidents, map, profile) manage state via local `useState` and direct API calls. **There is no RTK Query or TanStack Query.** No Redux middleware customization, no persistence library (user profile is manually cached in `sessionStorage`).

---

## HTTP layer

### Primary Axios instance — `src/services/api.js`

- `baseURL`: `API_URL` (from `src/lib/apiConfig.js`)
- `Content-Type: application/json`, `withCredentials: true` (sends HTTP-only cookies automatically)
- **Request interceptor**: no-op (Bearer header removed; cookies flow automatically)
- **Response interceptor (401 handling)**: on 401, unless already retried or on an auth endpoint, posts `${API_URL}/auth/refresh` → retries original request once. On refresh failure: clears `sessionStorage.user` and hard-redirects to `/sign-in`. Auth endpoints excluded from refresh: `login`, `refresh`, `logout`, `mfa/verify`, `change-password`.
- **Response unwrapping**: backend wraps payloads as `{ data: { data: ... } }`; methods return `response.data.data`.

API namespaces in this file:
- `authAPI` — login, refresh, logout, verifyMFA, changePassword
- `userAPI` — getMe, updateMe, updatePhoto (multipart), listUsers, getUser, createUser, updateUser, deactivateUser, reactivateUser, deleteUser
- `activityLogsAPI` — getLogs(params)
- `metricsAPI` — getHourly(type, startDate, endDate, unit)

### Stream service Axios instance — `src/services/streamApi.js`

Separate instance for the camera stream microservice. No interceptors, no credentials. Base URL: `/stream-service` in dev (Vite proxy always active for this path), `VITE_NODE_VIDEO_WS_URL` origin in prod.

Methods: `getCameras`, `getCamera`, `getCameraById`, `createCamera`, `updateCamera`, `deleteCamera`, `startCamera`, `stopCamera`, `getHealth`.

### ⚠️ Inconsistency: raw axios calls bypassing the interceptor

Two modules use raw `axios` directly rather than the configured instance:

| File | Calls | Risk |
|---|---|---|
| `src/features/nodeMaintainer/nodesSlice.js` | `GET /nodes`, `POST /nodes/register`, `PATCH /nodes/:id`, `DELETE /nodes/:id` | No 401 → refresh → retry; no `withCredentials` |
| `src/features/incidents/services/incidentDecisionService.js` | `POST /accident-decision` | Same |

These will silently fail on token expiry instead of auto-refreshing. See [bugs.md](./bugs.md).

---

## Routing

Defined in `src/App.jsx` using React Router v6 with v7 future flags enabled. All pages are lazy-loaded via `React.lazy` + `Suspense`.

### Route structure

```
/ (root)
├── /sign-in              (public)
├── /two-factor           (public)
├── /forgot-password      (public)
├── /check-email          (public)
├── /all-set              (public)
└── / (ProtectedRoute → AppLayout)
    ├── index            → RoleRedirect (getDefaultPath from navigation.js)
    ├── /map             — all roles
    ├── /dashboard       — admin, emergency_dispatcher
    ├── /user-management — admin
    ├── /activity-logs   — admin
    ├── /node-maintainer — admin, node_maintenance_crew
    ├── /profile         — all authenticated
    ├── /system-test     — admin
    ├── /settings        — admin
    ├── /alerts          — admin, emergency_dispatcher
    ├── /reports         — admin, road_observer
    ├── /messages        — admin, emergency_dispatcher
    ├── /cameras         — all roles
    └── * → / or /sign-in
```

### ProtectedRoute (`src/components/ProtectedRoute.jsx`)

Reads `state.auth`. Behavior:
1. Shows loader while `loading || loadingRefresh`
2. Redirects to `/sign-in` if not authenticated
3. Redirects to `/profile` if `mustChangePassword` (unless already there)
4. If `allowedRoles` prop set: checks `user.role.name` → renders inline "Access Denied" if no match

### Layout (`src/components/layout/AppLayout.jsx`)

Flex shell: `Sidebar` (74px icon rail, role-aware nav links) + `<main><Outlet/></main>`. Nav items come from `getNavItems(roleName)` in `src/config/navigation.js`.

There is no `RoleShell` component — role routing is handled through per-route `allowedRoles` on `ProtectedRoute`.

---

## Auth flow

Cookie-based session. The frontend **never handles tokens** — `safespace_access_token` and `safespace_refresh_token` are HTTP-only cookies set by the backend.

```
App mount
  → dispatch(refreshSession())           # POST /auth/refresh (silent)
  → loadingRefresh = true (gates render)
  → on success: user stored in Redux + sessionStorage
  → on failure: redirect to /sign-in

Login flow (SignInPage)
  → dispatch(loginUser(email, password, rememberMe))
  → branch on response:
    a) mustChangePassword → store user, set flag → ProtectedRoute forces /profile
    b) mfaRequired → stash pendingMfaUserId in sessionStorage → navigate /two-factor
    c) success → store user → RoleRedirect to role default path

2FA flow (TwoFactorAuthPage)
  → dispatch(verifyMFACode(userId, code, rememberMe))
  → on success → store user → navigate /

Page reload
  → sessionStorage.user rehydrates isAuthenticated synchronously
  → refreshSession() validates/renews cookie in background
```

Auth slice exports: `clearError`, `setUser`, `clearAuth` sync actions; `loginUser`, `refreshSession`, `fetchCurrentUser`, `logoutUser`, `verifyMFACode`, `updateUserProfile` thunks.

---

## Realtime — three channels

The app has **three independent real-time connections**:

### 1. Socket.IO — `src/services/socketService.js`

- Connects to `SOCKET_URL`, `withCredentials: true`
- Transport: **polling only** (`transports: ['polling']`) — WebSocket upgrade disabled
- Reconnection: up to 10 attempts
- **Incoming events**: `incident-assigned`, `accident-detected`, `node_heartbeat`, `node_config_update`
- **Outgoing events**: `admin_accident_response` (incident confirm/reject)
- **Consumers**: `MapOverviewPage`, `DashboardPage`, `AccidentDialog`, `useNodeHeartbeat` hook

The socket is **not managed in Redux** — it's a singleton module imported directly. No Redux WebSocket middleware exists.

### 2. Native WebSocket — node video feed (`src/hooks/useNodeVideoFeed.js`)

- URL: `NODE_VIDEO_WS_URL/ws/nodes?client=dashboard`
- Auto-reconnects after 3 s
- Sends `dashboard_subscribe { nodeIds: [selectedNodeId] }` on connect
- Handles: `video_frame` (base64 JPEG), `node_snapshot`, `subscribed`
- Returns `{ currentFrame, lastSnapshot, isConnected }`

### 3. Native WebSocket — camera stream (`src/features/cameras/hooks/useStreamSocket.js`)

- URL: `/stream-service/stream/:cameraId` (dev via Vite proxy) or derived from `VITE_NODE_VIDEO_WS_URL` (prod)
- Receives binary Blob frames (JPEG), draws to Canvas via `createImageBitmap`
- Tracks FPS and detects stale streams (>5 s without frame → error state)
- Also handles JSON control messages: `connected`, `error`, `stopped`

---

## App startup sequence

`main.jsx` → `App.jsx` → on mount:
1. `dispatch(refreshSession())` — silent session rehydration
2. `useNodeHeartbeat()` — binds socket heartbeat listener → `updateNodeFromHeartbeat`
3. `useHeartbeatTimeout()` — runs every 10 s, marks nodes offline if heartbeat > 60 s stale → `markNodeOffline`

All route components are lazy-loaded. A full-screen spinner renders until `loadingRefresh` completes.
