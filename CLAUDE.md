# Safe Space Frontend

## Documentation

The `docs/` folder is the source of truth for current project state. Update it when features land.

| Doc | Purpose |
|-----|---------|
| [`docs/README.md`](./docs/README.md) | Doc index — start here |
| [`docs/architecture.md`](./docs/architecture.md) | As-built: state management, routing, auth, realtime, HTTP layer |
| [`docs/roles-and-responsibilities.md`](./docs/roles-and-responsibilities.md) | 4 operator roles, route access matrix, RBAC logic |
| [`docs/features/`](./docs/features/) | Per-feature deep-dives (status, files, data flow, known issues) |
| [`docs/plan.md`](./docs/plan.md) | Completed / remaining / not-started — check before planning work |
| [`docs/bugs.md`](./docs/bugs.md) | Known bugs with file:line — check before modifying named areas |
| [`docs/target-architecture.md`](./docs/target-architecture.md) | Intended end-state (Overview 2) vs current + migration priority |
| [`docs/design.md`](./docs/design.md) | safe-* color tokens, UI primitives, typography, animations |
| [`docs/techstack.md`](./docs/techstack.md) | Exact deps + versions, build config, env vars |
| [`docs/system-context.md`](./docs/system-context.md) | Full Safe Space system (3 layers) — where this dashboard fits |

**Key facts not obvious from the code:**
- Zod and gsap are installed but unused (dead dependencies).
- Only 3 Redux slices: `auth`, `cameras`, `nodes`. Other features use local state.
- `nodesSlice.js` and `incidentDecisionService.js` use raw axios, bypassing the auth interceptor.
- `roleUtils.js` uses wrong role name strings — camera manage buttons are always hidden.
- Test coverage is effectively zero (one reducer unit test).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | JavaScript (JSX) |
| Framework | React 18 + Vite |
| State | Redux Toolkit |
| Routing | React Router v6 |
| Styling | Tailwind CSS (custom `safe-*` tokens) |
| HTTP | Axios (`src/services/api.js`) |
| Realtime | Socket.IO client + WebSocket (video feeds) |
| Maps | MapLibre GL + react-map-gl |
| Charts | Chart.js |
| Validation | Zod |
| Testing | Vitest + Testing Library |

## Project Structure

```
src/
  app/store.js          — Redux store (nodes, auth, cameras slices)
  features/<name>/      — Feature modules (pages, components, slice, hooks)
  components/           — Shared layout (AppLayout, Sidebar, ProtectedRoute)
  components/ui/        — Reusable UI primitives (Button, Card, Modal, Input…)
  services/api.js       — Axios client + all API calls (auth/user/nodes/cameras)
  services/socketService.js — Socket.IO connection
  lib/apiConfig.js      — Single source of truth for API/socket URLs
  config/navigation.js  — Nav items and role-based default routes
  hooks/                — Global custom hooks (heartbeat, geolocation, video feed)
  shared/utils/         — Cross-feature utilities (roleUtils)
  utils/                — Misc helpers (toast, egyptianValidation)
  designSystem.js       — Design token constants
  icons.js              — FontAwesome icon registration
```

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| `auth` | Completed | Forgot-password has no API call (Bug #5) |
| `admin` | Completed | User management + activity logs |
| `cameras` | Completed | Role-gate bug hides manage buttons (Bug #2, #6) |
| `dashboard` | Completed | KPI cards show mock data (Bug #7) |
| `incidents` | Completed | AccidentDialog: AI analysis, override, confirm/reject |
| `map` | Completed | MapLibre map, node markers, KPI cards |
| `nodeMaintainer` | Completed | Full node CRUD, polygon editor, health tabs |
| `profile` | Completed | View, edit, change password, photo upload |
| `systemTest` | Partial | Wrong hook + malformed JSX (Bugs #3, #4) |
| `alerts`, `messages`, `reports`, `settings` | Not started | "Coming Soon" stubs |

See [`docs/features/`](./docs/features/) for per-feature detail.

## Code Style

- Files: PascalCase for components (`CameraCard.jsx`), camelCase for utils/hooks/slices
- Imports: use `@/` alias for `src/` (e.g. `@/services/api`)
- State: use Redux slices for server data; local `useState` for UI-only state
- Colors: use Tailwind `safe-*` tokens — never raw hex values in JSX
- No mutation: spread/Object.assign for state updates

## Auth

Cookie-based. `api.js` sends `withCredentials: true`. On 401 it auto-refreshes via `POST /api/auth/refresh`; on failure it redirects to `/sign-in`. Four roles: `admin`, `emergency_dispatcher`, `road_observer`, `node_maintenance_crew`.

## Env Vars

```
VITE_API_URL           # Full API base including /api
VITE_SOCKET_URL        # Socket.IO origin
VITE_NODE_VIDEO_WS_URL # WebSocket base for video feeds
VITE_ENABLE_DEV_PROXY  # Set true to proxy /api + /socket.io via Vite
VITE_DEV_PROXY_TARGET  # Target for proxy (default: http://localhost:5000)
```

## Commands

```bash
npm run dev       # Dev server on :4000
npm run build     # Production build → dist/
npm run preview   # Preview production build
npx vitest        # Run tests
```

## Testing

**Current state:** One reducer unit test — `src/features/nodeMaintainer/nodesSlice.test.js`. Effective coverage ~0%.
No `test` script in `package.json` — run tests directly with `npx vitest`. No vitest config block and no jest-dom setup file yet.
Target: 80% coverage. Use Vitest + Testing Library.

## Deployment

GitHub Actions on push to `main` → SSH into EC2, `docker compose up --build`. See `.github/workflows/deploy.yml`.

## Conventions

- Commit format: `feat|fix|refactor|docs|test|chore: description`
- No hardcoded secrets — all secrets via env vars
- Add new API methods in `src/services/api.js` under the relevant namespace
- Add new Redux state as a new slice in `src/features/<name>/<name>Slice.js` and register in `src/app/store.js`
