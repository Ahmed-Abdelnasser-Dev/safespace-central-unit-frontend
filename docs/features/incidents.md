# Feature: incidents

**Status:** Completed
**Path:** `src/features/incidents/`
**Redux slice:** None — Socket.IO emit + local state in `AccidentDialog`
**Access:** All roles (surfaced via map page; dialog triggered by socket events)

---

## Purpose

Incident review and response. Operators review AI-analyzed collision detections, compare AI verdict with node-reported data, optionally override parameters (speed limit, lane config), then confirm or reject the incident. The decision is emitted back to the Central Unit and dispatched to the affected node.

---

## Files

```
src/features/incidents/
  components/
    AccidentDialog.jsx            — Main incident review dialog (full implementation)
    ActionCard.jsx                — Confirm / Reject action buttons
    cards/
      AiAnalysisCard.jsx          — AI confidence score + analysis display
      DecisionCard.jsx            — Node-reported decision data
      FinalDecisionCard.jsx       — Summary of the operator's final decision
    layout/
      AccidentDialogHeader.jsx    — Dialog header (incident ID, timestamp, close)
    media/
      AccidentMediaArea.jsx       — Media display container
      AccidentPolygonDialog.jsx   — Lane polygon viewer overlay on incident image
      MediaCarousel.jsx           — Image/video carousel for incident media
      PolygonOverlay.jsx          — SVG polygon overlay for lane visualization
    override/
      OverridePanel.jsx           — Speed limit + lane config override controls
  hooks/
    useOverrideState.js           — State management for the override panel
  services/
    incidentDecisionService.js    — POST /accident-decision (uses raw axios — see bugs)
```

---

## How it works

`AccidentDialog` is not routed to a page — it is opened by `MapOverviewPage` when a socket event fires:

```
Socket.IO → 'incident-assigned' or 'accident-detected'
  → MapOverviewPage sets local state: selectedIncident + dialogOpen=true
  → <AccidentDialog incident={selectedIncident} onClose={...} />
```

### Dialog content
1. **Header** — incident ID, location, timestamp
2. **Media area** — `MediaCarousel` showing photos/video from the detection node
3. **AI Analysis card** — YOLOv8 confidence score, detected objects, AI verdict
4. **Decision card** — node-reported speed, lane assignments at time of detection
5. **Override panel** — operator can override speed limit and lane configuration before confirming (optional)
6. **Action card** — `CONFIRM` / `REJECT` buttons

### Confirm/reject flow

```js
// incidentDecisionService.js
POST /accident-decision {
  incidentId,
  decision: 'CONFIRMED' | 'MODIFIED' | 'REJECTED',
  overrides: { speedLimit?, laneConfig? }  // only if operator modified values
}
```

After submission, `socketService.emitAdminAccidentResponse` is also called to push the decision back over the socket channel.

---

## Known issues

| # | Issue |
|---|-------|
| [Bug #9](../bugs.md) | `incidentDecisionService.js` uses raw `axios` bypassing the auth refresh interceptor |
