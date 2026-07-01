/**
 * MapOverviewPage — Road Observer Monitoring Console
 *
 * Dark-canvas control-room view.
 * Real data sources:
 *  - nodes:         Redux `nodes` slice (GET /nodes, 30 s refresh)
 *  - cameras:       Redux `cameras` slice (GET /cameras via streamApi)
 *  - observer stats: observerAPI.getStats() (reviewed today, pending — degrades gracefully)
 *  - notifications:  notificationsSlice (socket-live + backend-persisted)
 *  - incidents:      socket events (incident-assigned, accident-detected)
 *
 * Notification UI: relies solely on the global bell in AppTopBar — the old
 * duplicate map-pin "Map Alerts" button has been removed.
 *
 * @module features/map/pages/MapOverviewPage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PageActions from '@/components/ui/PageActions.jsx';
import SearchInput from '@/components/ui/SearchInput.jsx';
import FilterChips from '../components/FilterTabs.jsx';
import MapView from '../components/MapView.jsx';
import KPICards from '../components/KPICards.jsx';
import NodesList from '../components/NodesList.jsx';
import { NodeDetailDialog } from '../components/NodeDetailDialog.jsx';
import AccidentDialog from '@/features/incidents/components/AccidentDialog.jsx';

import { fetchNodes } from '@/features/nodeMaintainer/nodesSlice.js';
import { fetchCameras } from '@/features/cameras/cameraSlice.js';
import { fetchNotifications, addLiveNotification } from '@/features/notifications/notificationsSlice.js';
import { observerAPI } from '@/services/api.js';
import {
  initSocket, getSocket,
  onIncidentAssigned, offIncidentAssigned,
  onAccidentDetected, offAccidentDetected,
} from '@/services/socketService.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function buildNotificationFromIncident(payload, type = 'incident_assigned') {
  const severity = payload?.ai?.severity ?? payload?.severity ?? null;
  return {
    id: `live-${Date.now()}-${Math.random()}`,
    type,
    title: type === 'incident_assigned' ? 'Incident Assigned' : 'Accident Detected',
    message: [
      payload?.node?.name ?? payload?.nodeId ?? 'Unknown node',
      payload?.ai?.accidentType ?? '',
      severity != null ? `severity ${severity}/5` : '',
    ].filter(Boolean).join(' · '),
    severity: severity >= 4 ? 'HIGH' : severity >= 2 ? 'MEDIUM' : 'LOW',
    timestamp: payload?.timestamp ?? new Date().toISOString(),
    read: false,
    payload,
  };
}

// ── component ─────────────────────────────────────────────────────────────────

function MapOverviewPage() {
  const dispatch = useDispatch();
  const { nodes, isLoading: nodesLoading } = useSelector((state) => state.nodes);
  // cameras might be null/non-array if stream service returns unexpected data
  const cameras = useSelector((state) => Array.isArray(state.cameras.cameras) ? state.cameras.cameras : []);

  // ── local state ──
  const [filter, setFilter] = useState('all');
  const [focusedNodeId, setFocusedNodeId] = useState(null);

  const [activeIncidents, setActiveIncidents] = useState([]);
  const [showAccident, setShowAccident] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);

  const [detailNode, setDetailNode] = useState(null);

  const [decisionToast, setDecisionToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Observer stats (fails gracefully)
  const [observerStats, setObserverStats] = useState({ reviewedToday: null, pendingReview: null });

  // ── data fetching ─────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    try { await dispatch(fetchNodes()); } catch (_) { /* nodes error surfaced via Redux */ }
    try { await dispatch(fetchCameras()); } catch (_) { /* cameras error surfaced via Redux */ }

    try {
      const stats = await observerAPI.getStats();
      setObserverStats({
        reviewedToday: stats.reviewedToday ?? null,
        pendingReview: stats.pendingReview ?? null,
      });
    } catch (_) { /* observer stats endpoint not yet available */ }

    dispatch(fetchNotifications({ limit: 30 }));
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── socket ────────────────────────────────────────────────────────────────

  useEffect(() => {
    initSocket();
    const socket = getSocket();

    const handleIncident = (payload) => {
      dispatch(addLiveNotification(buildNotificationFromIncident(payload, 'incident_assigned')));
      setActiveIncidents((prev) => [...prev, payload]);
      if (!currentIncident) {
        setCurrentIncident(payload);
        setShowAccident(true);
      }
    };

    const handleDecision = (data) => {
      dispatch(addLiveNotification(buildNotificationFromIncident(data, 'decision_confirmed')));
      setDecisionToast(data);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setDecisionToast(null), 5000);
    };

    onIncidentAssigned(handleIncident);
    onAccidentDetected(handleIncident);
    socket.on('decision-confirmed', handleDecision);

    return () => {
      offIncidentAssigned(handleIncident);
      offAccidentDetected(handleIncident);
      socket.off('decision-confirmed', handleDecision);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []); // intentionally empty — socket handlers are stable

  // ── derived values ───────────────────────────────────────────────────────

  const onlineNodes  = nodes.filter((n) => n.status === 'online');
  const offlineNodes = nodes.filter((n) => n.status !== 'online');
  const activeIncidentNodeIds = activeIncidents.map((i) => i.nodeId).filter(Boolean);

  const onlineCameras  = cameras.filter((c) => c.status === 'ONLINE');
  const offlineCameras = cameras.filter((c) => c.status !== 'ONLINE');

  const filterCounts = {
    all:     nodes.length,
    online:  onlineNodes.length,
    offline: offlineNodes.length,
    active:  activeIncidentNodeIds.length,
  };

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleCloseAccident = () => { setShowAccident(false); setCurrentIncident(null); };

  const handleDecisionMade = (decision) => {
    setActiveIncidents((prev) =>
      prev.filter((i) => i.incidentId !== decision.incidentId)
    );
    setShowAccident(false);
    setCurrentIncident(null);
  };

  const handleSelectNode = (node) => {
    setFocusedNodeId(node.id);
    setTimeout(() => setFocusedNodeId(null), 2000);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden bg-safe-dark">

      {/* Page actions → AppTopBar slot (no duplicate notification button) */}
      <PageActions>
        <SearchInput placeholder="Search locations, units, incidents..." width="260px" />
        <button
          onClick={fetchAll}
          disabled={nodesLoading}
          title="Refresh"
          className="w-9 h-9 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors disabled:opacity-50"
        >
          <FontAwesomeIcon icon="rotate" className={`text-sm ${nodesLoading ? 'animate-spin' : ''}`} />
        </button>
      </PageActions>

      {/* KPI strip */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <KPICards
          nodesOnline={onlineNodes.length}
          nodesOffline={offlineNodes.length}
          pendingReview={observerStats.pendingReview}
          reviewedToday={observerStats.reviewedToday}
          camerasOnline={cameras.length ? onlineCameras.length : null}
          camerasOffline={cameras.length ? offlineCameras.length : null}
          loading={nodesLoading && nodes.length === 0}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left: filter chips + map */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <FilterChips
            activeFilter={filter}
            onFilterChange={setFilter}
            counts={filterCounts}
          />
          <div className="flex-1 min-h-0">
            <MapView
              nodes={nodes}
              filter={filter}
              activeIncidentNodeIds={activeIncidentNodeIds}
              focusedNodeId={focusedNodeId}
              onViewNodeDetails={setDetailNode}
            />
          </div>
        </div>

        {/* Right: node + camera status rail */}
        <NodesList
          nodes={nodes}
          cameras={cameras}
          filter={filter}
          activeIncidentNodeIds={activeIncidentNodeIds}
          onSelectNode={handleSelectNode}
          loading={nodesLoading && nodes.length === 0}
        />
      </div>

      {/* Node detail dialog */}
      {detailNode && (
        <NodeDetailDialog node={detailNode} onClose={() => setDetailNode(null)} />
      )}

      {/* AccidentDialog */}
      <AccidentDialog
        open={showAccident}
        onClose={handleCloseAccident}
        onDecision={handleDecisionMade}
        incident={currentIncident}
      />

      {/* Decision toast */}
      {decisionToast && (
        <div className="fixed top-4 right-4 z-40 animate-fadeIn pointer-events-none">
          <div className={`px-5 py-3.5 rounded-xl shadow-xl border-l-4 flex items-center gap-3 ${
            decisionToast.status === 'CONFIRMED'
              ? 'bg-safe-gray border-safe-green text-safe-text-primary'
              : decisionToast.status === 'MODIFIED'
              ? 'bg-safe-gray border-safe-blue text-safe-text-primary'
              : 'bg-safe-gray border-safe-danger text-safe-text-primary'
          }`}>
            <FontAwesomeIcon
              icon={
                decisionToast.status === 'CONFIRMED' ? 'circle-check'
                : decisionToast.status === 'MODIFIED' ? 'pen-to-square'
                : 'ban'
              }
              className={
                decisionToast.status === 'CONFIRMED' ? 'text-safe-green'
                : decisionToast.status === 'MODIFIED' ? 'text-safe-blue'
                : 'text-safe-danger'
              }
            />
            <div>
              <p className="text-sm font-semibold">Decision {decisionToast.status}</p>
              <p className="text-xs text-safe-text-muted">{decisionToast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapOverviewPage;
