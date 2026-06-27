# Feature: map

**Status:** Completed
**Path:** `src/features/map/`
**Redux slice:** Reads from `nodes` slice + `cameras` slice; local state for dialogs; Socket.IO
**Access:** All roles

---

## Purpose

The primary operational map view for the Road Observer role. Shows all nodes on a MapLibre map, displays KPI summary cards (nodes + cameras), filters nodes/cameras in the right rail, and is the entry point for the incident review workflow (opens `AccidentDialog` on socket events). Nodes and cameras each have a detail dialog with a live video stream.

---

## Files

```
src/features/map/
  pages/
    MapOverviewPage.jsx      — Main map page; fetches nodes + cameras; handles filter state
  components/
    FilterTabs.jsx           — Filter chip bar: All / Online / Offline / Active
    KPICards.jsx             — KPI summary cards (nodes online/offline/pending + cameras online/offline)
    MapView.jsx              — MapLibre GL map with node markers (adapts tile style to theme)
    NodesList.jsx            — Right-rail list of nodes AND cameras, grouped by status
    NodeDetailDialog.jsx     — Node detail overlay (specs, WebSocket live stream)
    CameraDetailDialog.jsx   — Camera detail overlay (live CCTV stream via useStreamSocket)
    NotificationPanel.jsx    — Global notification panel (rendered by AppTopBar bell; not instantiated here)
```

---

## Data flow

```
Redux (nodes slice)
  → MapView reads node list + selectedNodeId to render markers
  → NodesList reads nodes array

Redux (cameras slice — fetchCameras dispatched in MapOverviewPage)
  → NodesList reads cameras array for the camera rail section
  → KPICards reads cameras for online/offline count

Socket.IO events (socketService.js)
  → 'incident-assigned'   → set selectedIncident + open AccidentDialog
  → 'accident-detected'   → same as above (new unassigned detection)
  → 'decision-confirmed'  → show success toast + close dialog

Node click (from NodesList)
  → opens NodeDetailDialog with the selected node
  → NodeDetailDialog opens its own WebSocket to stream-service

Camera click (from NodesList)
  → opens CameraDetailDialog with the selected camera
  → CameraDetailDialog uses useStreamSocket for the live feed

AccidentDialog (from features/incidents/)
  → imported and rendered here when dialogOpen=true
```

---

## FilterTabs

Real, working filter chips for the right-rail node list and map view. Four options:

| Chip | Filters |
|------|---------|
| All | Shows all nodes |
| Online | `status === 'ONLINE'` |
| Offline | `status === 'OFFLINE'` |
| Active | Nodes with recent incident activity |

Each chip shows its count from the current node list. `activeFilter` state lives in `MapOverviewPage` and is passed down to both `MapView` (drives marker highlight) and `NodesList` (drives list filtering).

---

## KPI Cards

`KPICards` renders two groups of stat tiles:
1. **Nodes:** Online, Offline, Pending Review, Reviewed Today (from `observerAPI.getStats()` — degrades to `—` if unavailable)
2. **Cameras:** Online, Offline (from `state.cameras.cameras`)

All tiles use the shared `StatCard` component for visual consistency with admin and dashboard.

---

## Right Rail — NodesList

Two-section layout:

```
NODES (filtered by activeFilter)
  ├─ Online section (node rows — larger tiles)
  └─ Offline section

CAMERAS
  ├─ Active section (status === 'ONLINE')
  └─ Inactive section
```

Clicking a node row opens `NodeDetailDialog`. Clicking a camera row opens `CameraDetailDialog`.

---

## NodeDetailDialog

Opened when a node is clicked in the right rail. Two-panel layout:
- **Left:** Live video feed via a dedicated WebSocket to the stream-service (`WS /ws/nodes?client=dashboard`). Shows CONNECTING / LIVE / OFFLINE badge based on WS state.
- **Right:** Node specs — name, IP, location, speed limit, frame rate, resolution, status.

Protocol: JSON text frames. On open, sends `{ type: 'dashboard_subscribe', nodeIds: [nodeId] }`. Receives `{ type: 'video_frame', nodeId, frameData: '<base64>' }`. See `backend-integration-dashboard.md` §12 for the full spec.

---

## CameraDetailDialog

Opened when a camera is clicked in the right rail. Renders the same live CCTV stream as the Cameras page, using `useStreamSocket` with the camera's ID. Shows camera metadata (name, location, status) alongside the stream.

---

## Map library

MapLibre GL via `react-map-gl` (`react-map-gl/maplibre`). Tile style adapts to the app theme via `src/hooks/useMapStyle.js`:
- Dark mode → CARTO `dark_all` tiles
- Light mode → CARTO `rastertiles/voyager` tiles

Node markers are custom React overlays positioned on lat/lng from the nodes slice.

---

## Known issues

None. FilterTabs are fully functional. The `observerAPI.getStats()` call degrades gracefully when the endpoint is not yet implemented.
