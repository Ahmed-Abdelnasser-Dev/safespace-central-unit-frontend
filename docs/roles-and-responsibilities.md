# Roles and Responsibilities

---

## Canonical role names

Role names are lowercase snake_case strings coming from `user.role.name` in the JWT/session. These are the only correct strings — use them exactly in code:

| Role name (canonical) | Human label |
|---|---|
| `admin` | Administrator |
| `emergency_dispatcher` | Emergency Dispatcher |
| `road_observer` | Road Observer |
| `node_maintenance_crew` | Node Maintenance Crew |

> ⚠️ **Known inconsistency:** `src/shared/utils/roleUtils.js` uses `ADMINISTRATOR` and `NODE_MAINTAINER` (uppercase, different names). These **do not match** the canonical strings above and cause the camera management buttons to always be hidden. See [bugs.md](./bugs.md) — Bug #6.

---

## Route access matrix

| Route | admin | emergency_dispatcher | road_observer | node_maintenance_crew |
|-------|:---:|:---:|:---:|:---:|
| `/map` | ✅ | ✅ | ✅ | ✅ |
| `/cameras` | ✅ | ✅ | ✅ | ✅ |
| `/profile` | ✅ | ✅ | ✅ | ✅ |
| `/dashboard` | ✅ | ✅ | — | — |
| `/alerts` | ✅ | ✅ | — | — |
| `/messages` | ✅ | ✅ | — | — |
| `/reports` | ✅ | — | ✅ | — |
| `/node-maintainer` | ✅ | — | — | ✅ |
| `/user-management` | ✅ | — | — | — |
| `/activity-logs` | ✅ | — | — | — |
| `/system-test` | ✅ | — | — | — |
| `/settings` | ✅ | — | — | — |

---

## Default path per role

Defined in `src/config/navigation.js` → `getDefaultPath(roleName)`. Used by `RoleRedirect` on `/` and fallback nav.

| Role | Default path |
|------|-------------|
| `admin` | `/dashboard` |
| `emergency_dispatcher` | `/dashboard` |
| `road_observer` | `/map` |
| `node_maintenance_crew` | `/node-maintainer` |
| (any unknown role) | `/map` |

---

## Role workflows

### admin
Full system access. Manages users (`/user-management`), reviews audit logs (`/activity-logs`), accesses all features. Also enters the incident override flow via the map (incident `AccidentDialog`).

### emergency_dispatcher
Primary focus: `/dashboard` (live charts + incident stats) and `/messages` (real-time comms). Receives `incident-assigned` via socket. Placeholder: `/alerts`.

### road_observer
Driven by incidents. Lands on `/map`. When an incident is assigned (via socket `incident-assigned`), the `AccidentDialog` opens. Reviews AI analysis, confirms or rejects. Incidents are private per observer (no shared queue visible). Also has `/reports` access.

### node_maintenance_crew
Lands on `/node-maintainer`. Manages physical nodes: view map, drill into node detail tabs (Overview, Health, Road Config, Node Config, Polygons), register/edit/delete nodes, configure lanes and lane polygons via Canvas editor.

---

## How RBAC is enforced

1. **Route level** (`src/App.jsx`): each protected route receives an `allowedRoles` array prop.
2. **ProtectedRoute** (`src/components/ProtectedRoute.jsx`): checks `user.role.name` against `allowedRoles`; renders inline "Access Denied" if not permitted.
3. **Nav items** (`src/config/navigation.js`): `getNavItems(roleName)` returns only the nav links for that role — the Sidebar never shows links to inaccessible routes.
4. **Component-level gates**: some features have inline role checks (e.g., camera manage buttons). These currently use the broken `roleUtils.js` — see [bugs.md](./bugs.md).

---

## Navigation config — `src/config/navigation.js`

`ROLE_NAV_CONFIG` object keyed by role name:

```js
{
  admin: {
    defaultPath: '/dashboard',
    navItems: [
      { label: 'Dashboard', icon: 'gauge', path: '/dashboard' },
      { label: 'Map', icon: 'map', path: '/map' },
      { label: 'Node Maintainer', icon: 'server', path: '/node-maintainer' },
      { label: 'Cameras', icon: 'camera', path: '/cameras' },
      { label: 'User Management', icon: 'users', path: '/user-management' },
      { label: 'Activity Logs', icon: 'list', path: '/activity-logs' },
      { label: 'Alerts', icon: 'bell', path: '/alerts' },
      { label: 'Reports', icon: 'chart-bar', path: '/reports' },
      { label: 'Messages', icon: 'comment', path: '/messages' },
      { label: 'Settings', icon: 'gear', path: '/settings' },
      { label: 'System Test', icon: 'vial', path: '/system-test' },
    ]
  },
  emergency_dispatcher: { … },
  road_observer: { … },
  node_maintenance_crew: { … },
}
```

(Exact nav items per role are in the source file — listing here by structure.)
