# Tech Stack

Actual dependencies from `package.json` (versions verified from lock file).

---

## Core framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | DOM renderer |
| `vite` | ^7.3.1 | Build tool + dev server |

---

## State & data

| Package | Version | Purpose |
|---------|---------|---------|
| `@reduxjs/toolkit` | ^2.0.1 | Redux state management (3 slices) |
| `react-redux` | ^9.0.4 | React bindings for Redux |
| `axios` | ^1.6.2 | HTTP client (primary + stream service instances) |
| `socket.io-client` | ^4.6.1 | Socket.IO for incidents/heartbeats (polling only) |

Note: No RTK Query, TanStack Query, SWR, or React Query. Server data fetching is hand-rolled thunks + direct axios calls.

---

## Routing & navigation

| Package | Version | Purpose |
|---------|---------|---------|
| `react-router-dom` | ^6.21.1 | Client-side routing (v7 future flags enabled) |

---

## Maps

| Package | Version | Purpose |
|---------|---------|---------|
| `maplibre-gl` | ^3.6.2 | Open-source map rendering engine |
| `react-map-gl` | ^7.1.7 | React bindings (`react-map-gl/maplibre`) |

Tile source is OpenStreetMap-compatible. Note: the target architecture specifies React-Leaflet; the current code uses MapLibre.

---

## Charts

| Package | Version | Purpose |
|---------|---------|---------|
| `chart.js` | ^4.5.1 | Chart rendering (line charts for dashboard) |
| `chartjs-adapter-date-fns` | ^3.0.0 | Time-series axis adapter |

Note: the target architecture specifies Recharts; the current code uses Chart.js.

---

## Icons

| Package | Version | Purpose |
|---------|---------|---------|
| `@fortawesome/fontawesome-svg-core` | ^6.5.1 | FontAwesome core |
| `@fortawesome/free-solid-svg-icons` | ^6.5.1 | ~90 solid icons registered in `src/icons.js` |
| `@fortawesome/react-fontawesome` | ^0.2.0 | React component wrapper |
| `bootstrap-icons` | ^1.13.1 | CSS icon font (imported in `main.jsx`; used for some UI icons) |

---

## UI & UX

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.4.0 | Utility-first CSS (custom `safe-*` palette) |
| `postcss` | ^8.4.33 | CSS transforms |
| `autoprefixer` | ^10.4.16 | Vendor prefixes |
| `react-hot-toast` | ^2.6.0 | Toast notifications |

No shadcn/ui, no Radix UI, no Headless UI. UI primitives are hand-built in `src/components/ui/`.

---

## Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^3.22.4 | **Installed but unused in source** — dead dependency |

Actual validation: manual checks in form handlers + `src/utils/egyptianValidation.js`.

---

## Animation

| Package | Version | Purpose |
|---------|---------|---------|
| `gsap` | ^3.12.4 | **Installed but unused in source** — dead dependency |

Animations in use are CSS-only via Tailwind custom utilities in `src/index.css`.

---

## Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | ^4.0.18 | Test runner |
| `@testing-library/react` | ^14.1.2 | Component testing utilities (installed, effectively unused) |
| `@testing-library/jest-dom` | ^6.2.0 | Custom matchers (installed, no setup file configured) |
| `@testing-library/user-event` | ^14.5.2 | User event simulation (installed, unused) |
| `jsdom` | ^24.0.0 | Browser simulation environment |

⚠️ No `test` script in `package.json`. Run tests with `npx vitest`. No vitest config block in `vite.config.js`. No setup file — `jest-dom` is never imported. Effective test coverage: **one Redux reducer unit test** (`src/features/nodeMaintainer/nodesSlice.test.js`).

---

## Build configuration — `vite.config.js`

- Dev port: **4000**
- Path alias: `@` → `./src`
- Manual chunk splitting: `vendor-react`, `vendor-redux`, `vendor-icons`, `vendor-map` (maplibre-gl)
- **Dev proxy:**
  - `/stream-service` — always proxied to `VITE_NODE_VIDEO_WS_URL` origin or `http://localhost:4001`; WebSocket enabled; prefix stripped.
  - `/api` — proxied only when `VITE_ENABLE_DEV_PROXY === 'true'`
  - `/socket.io` — same condition as `/api`; WebSocket enabled
  - `/uploads` — same condition as `/api`
  - All proxy to `VITE_DEV_PROXY_TARGET` (default `http://localhost:5000`)

---

## Tailwind configuration — `tailwind.config.js`

Extends theme with:
- Custom `safe-*` color palette (see [design.md](./design.md))
- Custom shadows: `card`, `sm`, `lg`, `xl`
- `borderRadius.xl: 1rem`
- Font families: `sans = Poppins`, `display = DM Sans`, `mono = Space Mono`
- No plugins, no `darkMode` config

---

## Deployment

Container-based. `Dockerfile` + `nginx.conf` present in project root. GitHub Actions → EC2 → `docker compose up --build`. Nginx serves the built SPA and handles SPA fallback routing.
