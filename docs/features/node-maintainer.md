# Feature: node-maintainer

**Status:** Completed — the most fully built feature in the codebase
**Path:** `src/features/nodeMaintainer/`
**Redux slice:** `nodesSlice.js` — registered in store as `nodes`
**Access:** `admin`, `node_maintenance_crew`

---

## Purpose

Full lifecycle management of physical Raspberry Pi detection nodes: register, view, configure, monitor health, manage lane polygons, and dispatch commands.

---

## Files

```
src/features/nodeMaintainer/
  pages/
    NodeMaintainerPage.jsx         — Main page (map + node list + detail panel)
  screens/                         — Tab content panels
    OverviewTab.jsx                — Node summary: status, last heartbeat, location
    RoadConfigTab.jsx              — Road/lane configuration
    NodeConfigTab.jsx              — Node device configuration
    HealthTab.jsx                  — Health metrics + charts
    PolygonsTab.jsx                — Lane polygon viewer/editor
    SpeedLimitConfig.jsx           — Speed limit settings
  components/
    cards/                         — Stat cards, info cards, heartbeat cards
    charts/                        — Health metric charts (Chart.js)
    forms/                         — Lane form fields
    grids/                         — Node grid layout components
    layout/                        — Panel layout, tab bar
    lists/                         — Node list, lane list
    map/                           — Node map markers + popups
    modals/
      AddNodeModal.jsx             — Register new node
      EditNodeModal.jsx            — Edit node config
      AddLaneModal.jsx             — Add lane to road config
      DeleteLaneModal.jsx          — Delete lane with confirm
      PolygonEditorDialog.jsx      — Canvas-based polygon editor
      FullScreenMapDialog.jsx      — Full-screen map view
    sections/                      — Section wrappers
    ui/                            — Feature-local UI components
    VideoFeedPlayer.jsx            — Live node video feed (uses useNodeVideoFeed hook)
  hooks/                           — Feature hooks (if any)
  styles/
    typography.js                  — Local typography constants
  nodesSlice.js                    — Redux slice
  nodesSlice.test.js               — Unit tests (the ONLY test file in features/)
```

---

## Redux state shape (`state.nodes`)

```js
{
  nodes: {                   // normalized map: id → node object
    [nodeId]: {
      id, name, location, status, lastHeartbeat,
      roadRules: { lanes: [] },
      lanePolygons: [],
      health: {},
      ...
    }
  },
  selectedNodeId: string | null,
  currentTab: string,        // which detail tab is active
  isLoading: boolean,
  error: string | null,
}
```

---

## Thunks

| Thunk | API call | Note |
|-------|---------|------|
| `fetchNodes()` | `GET ${API_URL}/nodes` | ⚠️ Raw axios — bypasses interceptor |
| `registerNode(data)` | `POST ${API_URL}/nodes/register` | ⚠️ Raw axios |
| `updateNodePolygons(id, polygons)` | `PATCH ${API_URL}/nodes/:id` | ⚠️ Raw axios |
| `updateNode(id, updates)` | `PATCH ${API_URL}/nodes/:id` | ⚠️ Raw axios |
| `deleteNode(id)` | `DELETE ${API_URL}/nodes/:id` | ⚠️ Raw axios |

All five use raw `axios` with `API_URL` from `lib/apiConfig.js`. They bypass the auth refresh interceptor in `src/services/api.js`. See [Bug #9](../bugs.md).

---

## Sync reducers (selection)

- `addNode(node)` — normalizes and adds: ensures `roadRules.lanes` and `lanePolygons` arrays exist
- `selectNode(nodeId)` / `deselectNode()`
- `setCurrentTab(tab)`
- `addLane(lane)` / `removeLane(laneId)` / `updateLane(lane)`
- `addPolygon(polygon)` / `updatePolygon(polygon)` / `removePolygon(polygonId)`
- `updateNodeFromHeartbeat(heartbeatData)` — updates health, lastHeartbeat, status
- `markNodeOffline(nodeId)` — sets status to 'offline'
- `setNodeHealth(data)` / `setNodeConfig(data)`

---

## Selectors

- `selectAllNodes` — array of all nodes
- `selectSelectedNode` — currently selected node object
- `selectNodeById(id)` — specific node by id

---

## Polygon editor

`PolygonEditorDialog` uses the native Canvas 2D API to let maintainers draw lane boundary polygons on a satellite/map image. Polygons are stored per-lane in `lanePolygons` in the slice and synced to the backend via `updateNodePolygons`.

---

## Video feed (`VideoFeedPlayer`)

Uses `useNodeVideoFeed` hook (from `src/hooks/`):
- Native WebSocket to `NODE_VIDEO_WS_URL/ws/nodes?client=dashboard`
- Sends `dashboard_subscribe { nodeIds: [selectedNodeId] }` on connect
- Receives `video_frame` (base64 JPEG), renders to an `<img>` tag
- Auto-reconnects after 3 s

---

## Tests — `nodesSlice.test.js`

The only feature test file. Covers:
1. `addNode` normalizer — sparse node gets `roadRules.lanes: []` and `lanePolygons: []`
2. `addLane` — works when `roadRules.lanes` is missing/undefined

This is the only test in the entire codebase. Coverage: ~2 reducer cases out of dozens.

---

## Known issues

| # | Issue |
|---|-------|
| [Bug #8](../bugs.md) | `nodesSlice.js:361` — `console.error` used as info log (cosmetic) |
| [Bug #9](../bugs.md) | All thunks use raw `axios` — bypass auth refresh interceptor |
