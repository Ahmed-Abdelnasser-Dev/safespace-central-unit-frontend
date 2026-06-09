# Feature: cameras

**Status:** Completed (role-gate bug hides manage buttons — see bugs)
**Path:** `src/features/cameras/`
**Redux slice:** `cameraSlice.js` — registered in store as `cameras`
**Access:** All roles (`admin`, `emergency_dispatcher`, `road_observer`, `node_maintenance_crew`)

---

## Purpose

CCTV camera management: view live streams, add/edit/delete camera configs, start/stop streams.

---

## Files

```
src/features/cameras/
  pages/
    CameraFeedsPage.jsx      — Main camera page (list + stream view)
  components/
    CameraCard.jsx           — Single camera card with stream preview + actions
    CameraFeed.jsx           — Live stream display (canvas-based)
    CameraFormModal.jsx      — Add / edit camera form modal
    CameraGrid.jsx           — Grid layout for camera cards
    CameraStatusBadge.jsx    — Online/offline/error status indicator
    DeleteCameraModal.jsx    — Confirm-delete modal
  hooks/
    useStreamSocket.js       — Native WebSocket client for live JPEG stream frames
  cameraSlice.js             — Redux slice
```

---

## Redux state shape (`state.cameras`)

```js
{
  cameras: [],           // array of camera objects
  loading: boolean,      // fetch in progress
  submitting: boolean,   // create/update/delete in progress
  error: string | null,
}
```

---

## Thunks

| Thunk | API call | Service |
|-------|---------|---------|
| `fetchCameras()` | `GET /stream-service/cameras` | `streamApi.getCameras()` |
| `createCamera(data)` | `POST /stream-service/cameras` | `streamApi.createCamera(data)` |
| `updateCamera({ id, ...data })` | `PATCH /stream-service/cameras/:id` | `streamApi.updateCamera(id, data)` |
| `deleteCamera(id)` | `DELETE /stream-service/cameras/:id` | `streamApi.deleteCamera(id)` |

Camera CRUD goes through `src/services/streamApi.js` (separate Axios instance for the stream microservice), **not** the primary `api.js` instance.

---

## Live streaming — `useStreamSocket.js`

Hook that manages a native WebSocket connection to the camera stream endpoint:
- Dev: `/stream-service/stream/:cameraId` (via Vite proxy, strips prefix)
- Prod: derived from `VITE_NODE_VIDEO_WS_URL`
- Receives binary Blob frames (JPEG), draws to a `<canvas>` element via `createImageBitmap`
- Tracks FPS counter
- Stale stream detection: if no frame arrives in 5 s, sets error state
- JSON control messages handled: `connected`, `error`, `stopped`

---

## Page behavior

`CameraFeedsPage` has two views:
1. **Live view** — `CameraGrid` showing all camera cards with live stream preview
2. **Manage view** — list with edit/delete actions + "Add Camera" button

The manage view and camera action buttons are shown only to roles that `canManageCameras()`. Due to **Bug #2**, this check always returns false.

---

## Known issues

| # | Issue |
|---|-------|
| [Bug #2](../bugs.md) | `CameraFeedsPage.jsx:15` — reads `state.auth.operator.role` (path doesn't exist); manage buttons never appear |
| [Bug #6](../bugs.md) | `roleUtils.js` uses `ADMINISTRATOR`/`NODE_MAINTAINER` — must be fixed alongside Bug #2 |
