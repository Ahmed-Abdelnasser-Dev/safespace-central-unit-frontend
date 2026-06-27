# Safe Space Central Unit Dashboard — Documentation Index

This folder is the source of truth for the current state of the project. Update it as features land.

## How to navigate

| Doc | When to read |
|-----|-------------|
| [system-context.md](./system-context.md) | Understand where this dashboard fits in the full Safe Space system |
| [project-overview.md](./project-overview.md) | Quick summary: purpose, status, commands |
| [architecture.md](./architecture.md) | How the app is actually built (state, routing, auth, realtime, HTTP) |
| [techstack.md](./techstack.md) | Exact dependencies, versions, build config, env vars |
| [design-system.md](./design-system.md) | Design system: color tokens, typography, spacing, elevation, responsive layout, z-index |
| [roles-and-responsibilities.md](./roles-and-responsibilities.md) | The 4 operator roles, route access matrix, RBAC logic |
| [target-architecture.md](./target-architecture.md) | Intended end-state (Overview 2) vs what's built today + gap analysis |
| [plan.md](./plan.md) | Completed / remaining / not-started work items |
| [bugs.md](./bugs.md) | Catalogued bugs with file:line — check before touching any of the named areas |
| [features/](./features/) | Per-feature deep-dives (status, files, data flow, known issues) |

## Backend integration docs

| Doc | Audience |
|-----|---------|
| [backend-integration.md](./backend-integration.md) | DMZ deployment: CORS, cookies, nginx proxy, env vars, socket events |
| [backend-integration-dashboard.md](./backend-integration-dashboard.md) | Endpoint contracts for dashboard, map, dispatcher, stream-service |
| [backend-integration-emergency-dispatcher.md](./backend-integration-emergency-dispatcher.md) | Dispatcher-specific REST + socket contracts |

## Feature docs

| Feature | Status |
|---------|--------|
| [auth.md](./features/auth.md) | Completed (partial: forgot-password flow is a UI stub) |
| [admin.md](./features/admin.md) | Completed |
| [cameras.md](./features/cameras.md) | Completed (role-gate bug, see bugs.md) |
| [dashboard.md](./features/dashboard.md) | Completed (KPI top row uses real Redux data; performance/alerts still mock) |
| [incidents.md](./features/incidents.md) | Completed |
| [map.md](./features/map.md) | Completed (filter chips, camera rail, NodeDetailDialog, CameraDetailDialog) |
| [emergencyDispatcher.md](./features/emergencyDispatcher.md) | Completed UI shell (mock data; backend seam ready) |
| [node-maintainer.md](./features/node-maintainer.md) | Completed (most built-out feature) |
| [profile.md](./features/profile.md) | Completed |
| [system-test.md](./features/system-test.md) | Partial (broken on mount, see bugs.md) |
| [placeholders.md](./features/placeholders.md) | Not started (alerts, messages, reports, settings) |
