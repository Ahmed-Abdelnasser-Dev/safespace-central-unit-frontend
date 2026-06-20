/**
 * MapOverviewPage — Road Observer Monitoring Console
 *
 * Dark-canvas control-room view that replaces the old light-themed mock page.
 * Real data sources:
 *  - nodes: Redux `nodes` slice (GET /nodes, 30 s refresh)
 *  - observer stats: observerAPI.getStats() (reviewed today, pending — degrades gracefully)
 *  - notifications: notificationsSlice (socket-live + backend-persisted)
 *  - incidents: socket events (incident-assigned, accident-detected)
 *
 * @module features/map/pages/MapOverviewPage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import MapHeader from '../components/MapHeader.jsx';
import FilterChips from '../components/FilterTabs.jsx';
import MapView from '../components/MapView.jsx';
import KPICards from '../components/KPICards.jsx';
import NodesList, { NodeDetailDialog } from '../components/NodesList.jsx';
import NotificationPanel from '../components/NotificationPanel.jsx';
import AccidentDialog from '@/features/incidents/components/AccidentDialog.jsx';

import { fetchNodes } from '@/features/nodeMaintainer/nodesSlice.js';
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
  const { unreadCount } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);

  // ── local state ──
  const [filter, setFilter] = useState('all');
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Active incidents accumulated this session (cleared on page unmount)
  const [activeIncidents, setActiveIncidents] = useState([]); // array of incident payloads
  const [showAccident, setShowAccident] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);

  // Node detail dialog (opened from map popover or node rail)
  const [detailNode, setDetailNode] = useState(null);

  // Decision toast
  const [decisionToast, setDecisionToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Observer stats (fails gracefully — backend endpoint may not exist yet)
  const [observerStats, setObserverStats] = useState({ reviewedToday: null, pendingReview: null });

  // ── data fetching ─────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    try {
      await dispatch(fetchNodes());
      setLastRefresh(new Date());
    } catch (_) { /* nodes error surfaced via Redux */ }

    try {
      const stats = await observerAPI.getStats();
      setObserverStats({
        reviewedToday: stats.reviewedToday ?? null,
        pendingReview: stats.pendingReview ?? null,
      });
    } catch (_) { /* observer stats endpoint not yet available — show — */ }

    // Load persisted notification history
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
      // Add to live notification feed
      dispatch(addLiveNotification(buildNotificationFromIncident(payload, 'incident_assigned')));
      // Accumulate for filter count
      setActiveIncidents((prev) => [...prev, payload]);
      // Open AccidentDialog if no active one
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

  const onlineNodes = nodes.filter((n) => n.status === 'online');
  const offlineNodes = nodes.filter((n) => n.status !== 'online');
  const activeIncidentNodeIds = activeIncidents.map((i) => i.nodeId).filter(Boolean);

  const filterCounts = {
    all: nodes.length,
    online: onlineNodes.length,
    offline: offlineNodes.length,
    active: activeIncidentNodeIds.length,
  };

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleCloseAccident = () => { setShowAccident(false); setCurrentIncident(null); };

  const handleDecisionMade = (decision) => {
    // Remove the resolved incident from active incidents
    setActiveIncidents((prev) =>
      prev.filter((i) => i.incidentId !== decision.incidentId)
    );
    setShowAccident(false);
    setCurrentIncident(null);
  };

  const handleSelectNode = (node) => {
    setFocusedNodeId(node.id);
    // Reset after flyTo fires to allow re-selecting
    setTimeout(() => setFocusedNodeId(null), 2000);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden bg-safe-dark">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <MapHeader
        observerName={user?.fullName ?? null}
        unreadCount={unreadCount}
        notifOpen={notifPanelOpen}
        onToggleNotif={() => setNotifPanelOpen((o) => !o)}
        isLoading={nodesLoading}
        onRefresh={fetchAll}
        lastRefresh={lastRefresh}
        nodesOnline={onlineNodes.length}
        nodesOffline={offlineNodes.length}
      />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left: KPI strip + filter chips + map */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* KPI strip — compact, inline above map */}
          <div className="flex-shrink-0 px-4 pt-3 pb-2">
            <KPICards
              nodesOnline={onlineNodes.length}
              nodesOffline={offlineNodes.length}
              pendingReview={observerStats.pendingReview}
              reviewedToday={observerStats.reviewedToday}
              loading={nodesLoading && nodes.length === 0}
            />
          </div>
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

        {/* Right: node status rail — full height */}
        <NodesList
          nodes={nodes}
          filter={filter}
          activeIncidentNodeIds={activeIncidentNodeIds}
          onSelectNode={handleSelectNode}
          loading={nodesLoading && nodes.length === 0}
        />
      </div>

      {/* ── Notification panel (fixed dropdown) ──────────────────────────── */}
      <NotificationPanel
        open={notifPanelOpen}
        onClose={() => setNotifPanelOpen(false)}
      />

      {/* ── Node detail dialog (from map popover or node rail) ───────────── */}
      {detailNode && (
        <NodeDetailDialog node={detailNode} onClose={() => setDetailNode(null)} />
      )}

      {/* ── AccidentDialog ────────────────────────────────────────────────── */}
      <AccidentDialog
        open={showAccident}
        onClose={handleCloseAccident}
        onDecision={handleDecisionMade}
        incident={currentIncident}
      />

      {/* ── Decision toast ────────────────────────────────────────────────── */}
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
              icon={decisionToast.status === 'CONFIRMED' ? 'circle-check' : decisionToast.status === 'MODIFIED' ? 'pen-to-square' : 'ban'}
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
