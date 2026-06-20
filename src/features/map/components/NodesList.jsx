import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Derives visual config for a lane tile.
 * Status takes priority: closed/blocked shows ban regardless of direction type.
 * Direction comes from lane.type ("Right Turn", "Left Turn", "Main Lane").
 */
export function getLaneCfg(lane) {
  const status = (lane.status || 'open').toLowerCase();
  const type = (lane.type || '').toLowerCase();
  if (status === 'closed' || status === 'blocked') {
    return { icon: 'ban',         color: 'text-safe-danger', bg: 'bg-safe-danger/10', border: 'border-safe-danger/20', label: 'Closed' };
  }
  if (type.includes('right')) {
    return { icon: 'arrow-right', color: 'text-safe-blue',   bg: 'bg-safe-blue/10',   border: 'border-safe-blue/20',   label: 'Right' };
  }
  if (type.includes('left')) {
    return { icon: 'arrow-left',  color: 'text-safe-blue',   bg: 'bg-safe-blue/10',   border: 'border-safe-blue/20',   label: 'Left' };
  }
  return { icon: 'arrow-up',    color: 'text-safe-green',  bg: 'bg-safe-green/10',  border: 'border-safe-green/20',  label: 'Open' };
}

/** Full-screen node config dialog — opens when user clicks the info button on a row. */
export function NodeDetailDialog({ node, onClose }) {
  if (!node) return null;
  const isOnline = node.status === 'online';

  // node.lanes is the authoritative list (all lanes + real statuses).
  // node.roadRules.lanes may only contain a subset — use it only as fallback.
  const speedLimit = node.speedLimit ?? node.roadRules?.speedLimit ?? null;
  const lanes = node.lanes || node.roadRules?.lanes || [];
  const lat = node.location?.latitude ?? node.latitude;
  const lng = node.location?.longitude ?? node.longitude;
  const address = node.location?.address || node.streetName || 'Unknown location';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label={`Node details: ${node.name}`}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div className="w-full max-w-sm bg-safe-gray border border-safe-gray-light rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-safe-gray-light">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isOnline ? 'bg-safe-green/15' : 'bg-safe-danger/15'
            }`}>
              <FontAwesomeIcon icon="map-pin" className={`text-sm ${isOnline ? 'text-safe-green' : 'text-safe-danger'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-safe-text-primary truncate">{node.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-safe-green' : 'bg-safe-danger'}`} />
                <span className={`text-[11px] font-medium ${isOnline ? 'text-safe-green' : 'text-safe-danger'}`}>
                  {isOnline ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/50 rounded-lg transition-all flex-shrink-0"
              aria-label="Close"
            >
              <FontAwesomeIcon icon="xmark" className="text-sm" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Location */}
            <div>
              <p className="text-[10px] font-semibold text-safe-text-muted uppercase tracking-wider mb-2">Location</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <FontAwesomeIcon icon="location-dot" className="text-safe-text-muted text-xs mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-safe-text-primary leading-snug">{address}</p>
                </div>
                {lat != null && lng != null && (
                  <div className="flex items-center gap-2.5">
                    <FontAwesomeIcon icon="crosshairs" className="text-safe-text-muted text-xs flex-shrink-0" />
                    <p className="text-[11px] text-safe-text-muted font-mono tabular-nums">
                      {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-safe-gray-light" />

            {/* Road configuration */}
            <div>
              <p className="text-[10px] font-semibold text-safe-text-muted uppercase tracking-wider mb-2">Road Configuration</p>
              <div className={`grid gap-3 mb-3 ${speedLimit && lanes.length ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {speedLimit != null && (
                  <div className="bg-safe-sidebar rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FontAwesomeIcon icon="gauge-high" className="text-safe-text-muted text-[10px]" />
                      <p className="text-[10px] text-safe-text-muted uppercase tracking-wide">Speed Limit</p>
                    </div>
                    <p className="text-lg font-bold text-safe-text-primary tabular-nums">
                      {speedLimit}
                      <span className="text-xs text-safe-text-muted ml-1 font-normal">km/h</span>
                    </p>
                  </div>
                )}
                {lanes.length > 0 && (
                  <div className="bg-safe-sidebar rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FontAwesomeIcon icon="road" className="text-safe-text-muted text-[10px]" />
                      <p className="text-[10px] text-safe-text-muted uppercase tracking-wide">Lanes</p>
                    </div>
                    <p className="text-lg font-bold text-safe-text-primary tabular-nums">
                      {lanes.length}
                      <span className="text-xs text-safe-text-muted ml-1 font-normal">total</span>
                    </p>
                  </div>
                )}
              </div>

              {lanes.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-safe-text-muted uppercase tracking-wider mb-2">Lane Status</p>
                  <div className="flex gap-2">
                    {lanes.map((lane, i) => {
                      const cfg = getLaneCfg(lane);
                      return (
                        <div
                          key={lane.id ?? i}
                          className={`flex-1 min-w-0 flex flex-col items-center gap-1.5 py-3 px-1.5 rounded-xl border ${cfg.bg} ${cfg.border}`}
                        >
                          <FontAwesomeIcon icon={cfg.icon} className={`text-lg ${cfg.color}`} />
                          <p className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</p>
                          <p className="text-[9px] text-safe-text-muted truncate w-full text-center px-1">
                            {lane.name || `L${i + 1}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!speedLimit && !lanes.length && (
                <p className="text-xs text-safe-text-muted text-center py-2">No configuration available</p>
              )}
            </div>

            <div className="border-t border-safe-gray-light" />

            {/* Technical */}
            <div>
              <p className="text-[10px] font-semibold text-safe-text-muted uppercase tracking-wider mb-2">Technical</p>
              <div className="flex items-center gap-2.5">
                <FontAwesomeIcon icon="fingerprint" className="text-safe-text-muted text-xs flex-shrink-0" />
                <p className="text-[11px] text-safe-text-muted font-mono break-all">
                  {node.id || node.nodeId || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-safe-gray-light">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-safe-text-muted hover:text-safe-text-primary bg-safe-sidebar hover:bg-safe-gray-light/40 border border-safe-gray-light rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Single node row in the status rail. */
function NodeRow({ node, activeIncidentNodeIds = [], onSelect, onViewDetails }) {
  const isOnline = node.status === 'online';
  const hasIncident = activeIncidentNodeIds.includes(node.id);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(node)}
      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-safe-gray-light/30 transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-safe-blue/40 text-left group"
    >
      {/* Status icon */}
      <div className={`relative w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
        hasIncident ? 'bg-safe-accent/15' : isOnline ? 'bg-safe-green/15' : 'bg-safe-danger/15'
      }`}>
        <FontAwesomeIcon
          icon="map-pin"
          className={`text-[10px] ${hasIncident ? 'text-safe-accent' : isOnline ? 'text-safe-green' : 'text-safe-danger'}`}
        />
        {hasIncident && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-safe-accent rounded-full border border-safe-gray" />
        )}
      </div>

      {/* Name + address */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-safe-text-primary truncate leading-tight">{node.name}</p>
        <p className="text-[10px] text-safe-text-muted/75 truncate">{node.streetName || 'Unknown location'}</p>
      </div>

      {/* Controls — revealed on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onViewDetails?.(node); }}
          className="w-6 h-6 flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/50 rounded transition-all"
          aria-label={`View details for ${node.name}`}
          title="View details"
        >
          <FontAwesomeIcon icon="circle-info" className="text-[10px]" />
        </button>
        <FontAwesomeIcon
          icon="compass"
          className="text-safe-text-muted/60 text-[10px]"
          title="Click row to fly to node"
        />
      </div>
    </button>
  );
}

/** Section header — matches UnitsRosterPanel's StatusGroup header style. */
function SectionHeader({ dot, label, count }) {
  return (
    <div className="px-3 py-1.5 flex items-center gap-2 sticky top-0 bg-safe-gray z-10 border-b border-safe-gray-light">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <span className="text-[10px] font-semibold text-safe-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="ml-auto font-mono text-[10px] text-safe-text-muted/60">{count}</span>
    </div>
  );
}

/**
 * NodesList — real-data node status rail.
 *
 * @param {object}   props
 * @param {Array}    props.nodes                — normalized node objects from Redux
 * @param {string}   props.filter               — 'all' | 'online' | 'offline' | 'active'
 * @param {string[]} props.activeIncidentNodeIds — node IDs with active incidents
 * @param {Function} props.onSelectNode          — callback(node) → page calls map.flyTo
 * @param {boolean}  props.loading              — show skeletons
 */
function NodesList({ nodes = [], filter = 'all', activeIncidentNodeIds = [], onSelectNode, loading = false }) {
  const [detailNode, setDetailNode] = useState(null);

  const onlineNodes = nodes.filter((n) => n.status === 'online');
  const offlineNodes = nodes.filter((n) => n.status !== 'online');

  const visibleOnline = filter === 'offline' ? [] : onlineNodes;
  const visibleOffline = filter === 'online' ? [] : offlineNodes;

  if (loading) {
    return (
      <aside className="w-64 bg-safe-gray border-l border-safe-gray-light flex flex-col overflow-hidden">
        <div className="px-3 py-1.5 border-b border-safe-gray-light">
          <div className="h-3 w-28 bg-safe-gray-light/50 rounded animate-pulse" />
        </div>
        <div className="flex-1 py-2 space-y-px">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-6 h-6 rounded-md bg-safe-gray-light/40 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-24 bg-safe-gray-light/50 rounded animate-pulse" />
                <div className="h-2 w-32 bg-safe-gray-light/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (!nodes.length) {
    return (
      <aside className="w-64 bg-safe-gray border-l border-safe-gray-light flex items-center justify-center">
        <div className="text-center px-6">
          <FontAwesomeIcon icon="server" className="text-safe-text-muted/25 text-2xl mb-2" />
          <p className="text-xs text-safe-text-muted/50">No nodes registered</p>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className="w-64 bg-safe-gray border-l border-safe-gray-light flex flex-col overflow-hidden">
        {/* Active (online) nodes */}
        {visibleOnline.length > 0 && (
          <div className="flex flex-col overflow-hidden flex-1">
            <SectionHeader dot="bg-safe-green" label="Active Nodes" count={onlineNodes.length} />
            <div className="overflow-y-auto divide-y divide-safe-gray-light flex-1">
              {visibleOnline.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  activeIncidentNodeIds={activeIncidentNodeIds}
                  onSelect={onSelectNode}
                  onViewDetails={setDetailNode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inactive (offline) nodes */}
        {visibleOffline.length > 0 && (
          <div className="flex-1 flex flex-col overflow-hidden border-t border-safe-gray-light">
            <SectionHeader dot="bg-safe-danger" label="Inactive Nodes" count={offlineNodes.length} />
            <div className="flex-1 overflow-y-auto divide-y divide-safe-gray-light">
              {visibleOffline.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  activeIncidentNodeIds={activeIncidentNodeIds}
                  onSelect={onSelectNode}
                  onViewDetails={setDetailNode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Both hidden (e.g. filter='active' with no active incidents) */}
        {visibleOnline.length === 0 && visibleOffline.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-safe-text-muted/50">No nodes match filter</p>
          </div>
        )}
      </aside>

      {/* Detail dialog — rendered as a portal-style overlay */}
      {detailNode && (
        <NodeDetailDialog node={detailNode} onClose={() => setDetailNode(null)} />
      )}
    </>
  );
}

export default NodesList;
