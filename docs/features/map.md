# Feature: map

**Status:** Completed
**Path:** `src/features/map/`
**Redux slice:** None — reads from `nodes` slice; local state for incident dialog; Socket.IO
**Access:** All roles

---

## Purpose

The primary operational map view. Shows all nodes on a MapLibre map, displays KPI summary cards, and is the entry point for the incident review workflow (opens `AccidentDialog` on socket events).

---

## Files

```
src/features/map/
  pages/
    MapOverviewPage.jsx      — Main map page
  components/
    FilterTabs.jsx           — Tab bar for filtering map view
    KPICards.jsx             — KPI summary cards above the map
    MapHeader.jsx            — Page header
    MapView.jsx              — MapLibre GL map with node markers
    NodesList.jsx            — Sidebar list of nodes
```

---

## Data flow

```
Redux (nodes slice)
  → MapView reads node list + selectedNodeId to render markers

Socket.IO events (socketService.js)
  → 'incident-assigned'     → set selectedIncident + open AccidentDialog
  → 'accident-detected'     → same as above (new unassigned detection)
  → 'decision-confirmed'    → show success toast + close dialog

AccidentDialog (from features/incidents/)
  → imported and rendered here when dialogOpen=true
```

---

## Map library

MapLibre GL via `react-map-gl` (`react-map-gl/maplibre`). Tile source is OpenStreetMap-compatible. Node markers are rendered as custom React overlays positioned on lat/lng coordinates from the nodes slice.

Note: the target architecture specifies React-Leaflet; this uses MapLibre. See [target-architecture.md](../target-architecture.md).

---

## KPI cards

`KPICards` component displays summary metrics above the map (total nodes, active nodes, incident counts). Source of data: combination of nodes slice state + socket events. Unlike the dashboard KPIs, these are driven from real Redux state.

---

## FilterTabs

Currently has `activeTab="call-emergency"` hardcoded. The tab switching behavior may not be fully interactive — verify in the component if tab switching affects map/list filtering.

---

## Known issues

None critical. The `activeTab` hardcoding may limit tab interactivity but does not break core functionality.
