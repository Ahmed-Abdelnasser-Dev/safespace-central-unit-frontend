import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NodeDetailDialog } from './NodeDetailDialog';
import { CameraDetailDialog } from './CameraDetailDialog';

/**
 * Derives visual config for a lane tile.
 * Exported so NodeDetailDialog can reuse it without circular imports.
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

// ── Rail filter tabs ─────────────────────────────────────────────────────────

const RAIL_FILTERS = [
  { id: 'all',     label: 'All',     icon: 'layer-group' },
  { id: 'nodes',   label: 'Nodes',   icon: 'map-pin' },
  { id: 'cameras', label: 'Cameras', icon: 'video' },
];

function RailFilterTabs({ value, onChange }) {
  return (
    <div className="flex-shrink-0 px-3 py-2 border-b border-safe-gray-light bg-safe-gray">
      <div className="flex gap-1">
        {RAIL_FILTERS.map((f) => {
          const active = f.id === value;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                active
                  ? 'bg-safe-blue text-white shadow-sm'
                  : 'text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/40'
              }`}
            >
              <FontAwesomeIcon icon={f.icon} className="text-[9px]" />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ dot, label, count }) {
  return (
    <div className="px-3 py-2 flex items-center gap-2 sticky top-0 bg-safe-gray z-10 border-b border-safe-gray-light">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <span className="text-[10px] font-bold text-safe-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="ml-auto font-mono text-[10px] text-safe-text-muted/60 bg-safe-gray-light/40 px-1.5 py-0.5 rounded">
        {count}
      </span>
    </div>
  );
}

// ── Node row ─────────────────────────────────────────────────────────────────

function NodeRow({ node, activeIncidentNodeIds = [], onSelect, onViewDetails }) {
  const isOnline = node.status === 'online';
  const hasIncident = activeIncidentNodeIds.includes(node.id);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(node)}
      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-safe-gray-light/30 transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-safe-blue/40 text-left group"
    >
      {/* Status icon */}
      <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        hasIncident ? 'bg-safe-accent/15' : isOnline ? 'bg-safe-green/15' : 'bg-safe-danger/15'
      }`}>
        <FontAwesomeIcon
          icon="map-pin"
          className={`text-xs ${hasIncident ? 'text-safe-accent' : isOnline ? 'text-safe-green' : 'text-safe-danger'}`}
        />
        {hasIncident && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-safe-accent rounded-full border-2 border-safe-gray" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-safe-text-primary truncate leading-tight">{node.name}</p>
        <p className="text-xs text-safe-text-muted/75 truncate mt-0.5">{node.streetName || 'Unknown location'}</p>
      </div>

      {/* Actions (revealed on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onViewDetails?.(node); }}
          className="w-7 h-7 flex items-center justify-center text-safe-text-muted hover:text-safe-blue hover:bg-safe-blue/10 rounded-lg transition-all"
          aria-label={`View details for ${node.name}`}
          title="View details & stream"
        >
          <FontAwesomeIcon icon="play-circle" className="text-xs" />
        </button>
        <FontAwesomeIcon
          icon="compass"
          className="text-safe-text-muted/50 text-xs"
        />
      </div>
    </button>
  );
}

// ── Camera row ───────────────────────────────────────────────────────────────

function CameraRow({ camera, onViewDetails }) {
  const isOnline = camera.status === 'ONLINE';
  const name = camera.name || camera.cameraId || `Camera ${camera.id}`;
  const location = camera.location || camera.streetName || 'Unknown location';

  return (
    <button
      type="button"
      onClick={() => onViewDetails?.(camera)}
      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-safe-gray-light/30 transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-safe-teal/40 text-left group"
    >
      {/* Status icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isOnline ? 'bg-safe-teal/15' : 'bg-safe-orange/15'
      }`}>
        <FontAwesomeIcon
          icon={isOnline ? 'video' : 'video-slash'}
          className={`text-xs ${isOnline ? 'text-safe-teal' : 'text-safe-orange'}`}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-safe-text-primary truncate leading-tight">{name}</p>
        <p className="text-xs text-safe-text-muted/75 truncate mt-0.5">{location}</p>
      </div>

      {/* Play hint (revealed on hover) */}
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <div className="w-7 h-7 flex items-center justify-center text-safe-text-muted hover:text-safe-teal hover:bg-safe-teal/10 rounded-lg transition-all">
          <FontAwesomeIcon icon="play-circle" className="text-xs" />
        </div>
      </div>
    </button>
  );
}

// ── Main NodesList ────────────────────────────────────────────────────────────

/**
 * NodesList — right-side rail showing detection nodes and CCTV cameras.
 *
 * Rail filter tabs let the observer focus on Nodes only, Cameras only, or All.
 * Clicking a node row flies the map to it; clicking the play icon opens the
 * live stream dialog. Clicking a camera row opens the camera stream dialog.
 */
function NodesList({
  nodes = [],
  cameras = [],
  filter = 'all',
  activeIncidentNodeIds = [],
  onSelectNode,
  loading = false,
}) {
  const [railFilter, setRailFilter] = useState('all');
  const [detailNode, setDetailNode] = useState(null);
  const [detailCamera, setDetailCamera] = useState(null);

  // Derived node lists (respecting the MAP filter from the chip bar)
  const onlineNodes  = nodes.filter((n) => n.status === 'online');
  const offlineNodes = nodes.filter((n) => n.status !== 'online');

  const visibleOnline  = filter === 'offline' ? [] : onlineNodes;
  const visibleOffline = filter === 'online'  ? [] : offlineNodes;

  // Camera lists
  const onlineCameras  = cameras.filter((c) => c.status === 'ONLINE');
  const offlineCameras = cameras.filter((c) => c.status !== 'ONLINE');

  const showNodes   = railFilter === 'all' || railFilter === 'nodes';
  const showCameras = railFilter === 'all' || railFilter === 'cameras';

  // ── loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <aside className="w-80 bg-safe-gray border-l border-safe-gray-light flex flex-col overflow-hidden">
        <RailFilterTabs value={railFilter} onChange={setRailFilter} />
        <div className="flex-1 py-2 space-y-px">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3">
              <div className="w-8 h-8 rounded-lg bg-safe-gray-light/40 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 bg-safe-gray-light/50 rounded animate-pulse" />
                <div className="h-2.5 w-36 bg-safe-gray-light/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  const hasNodes   = nodes.length > 0;
  const hasCameras = cameras.length > 0;

  if (!hasNodes && !hasCameras) {
    return (
      <aside className="w-80 bg-safe-gray border-l border-safe-gray-light flex flex-col overflow-hidden">
        <RailFilterTabs value={railFilter} onChange={setRailFilter} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <FontAwesomeIcon icon="server" className="text-safe-text-muted/25 text-2xl mb-2" />
            <p className="text-xs text-safe-text-muted/50">No devices registered</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className="w-80 bg-safe-gray border-l border-safe-gray-light flex flex-col overflow-hidden">
        <RailFilterTabs value={railFilter} onChange={setRailFilter} />

        <div className="flex-1 overflow-y-auto">

          {/* ── Detection Nodes ──────────────────────────────────────── */}
          {showNodes && hasNodes && (
            <>
              {visibleOnline.length > 0 && (
                <div>
                  <SectionHeader dot="bg-safe-green" label="Active Nodes" count={onlineNodes.length} />
                  <div className="divide-y divide-safe-gray-light/60">
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

              {visibleOffline.length > 0 && (
                <div>
                  <SectionHeader dot="bg-safe-danger" label="Inactive Nodes" count={offlineNodes.length} />
                  <div className="divide-y divide-safe-gray-light/60">
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

              {visibleOnline.length === 0 && visibleOffline.length === 0 && hasNodes && (
                <div className="px-3 py-5 text-center">
                  <p className="text-xs text-safe-text-muted/50">No nodes match current map filter</p>
                </div>
              )}
            </>
          )}

          {/* ── CCTV Cameras ─────────────────────────────────────────── */}
          {showCameras && hasCameras && (
            <>
              {onlineCameras.length > 0 && (
                <div className={showNodes && hasNodes ? 'border-t border-safe-gray-light' : ''}>
                  <SectionHeader dot="bg-safe-teal" label="Cameras Live" count={onlineCameras.length} />
                  <div className="divide-y divide-safe-gray-light/60">
                    {onlineCameras.map((cam) => (
                      <CameraRow key={cam.id} camera={cam} onViewDetails={setDetailCamera} />
                    ))}
                  </div>
                </div>
              )}

              {offlineCameras.length > 0 && (
                <div className={(showNodes && hasNodes) || onlineCameras.length > 0 ? 'border-t border-safe-gray-light' : ''}>
                  <SectionHeader dot="bg-safe-orange" label="Cameras Offline" count={offlineCameras.length} />
                  <div className="divide-y divide-safe-gray-light/60">
                    {offlineCameras.map((cam) => (
                      <CameraRow key={cam.id} camera={cam} onViewDetails={setDetailCamera} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty state when rail filter shows nothing */}
          {((railFilter === 'nodes' && !hasNodes) || (railFilter === 'cameras' && !hasCameras)) && (
            <div className="px-3 py-8 text-center">
              <FontAwesomeIcon
                icon={railFilter === 'cameras' ? 'video-slash' : 'map-pin'}
                className="text-safe-text-muted/25 text-xl mb-2"
              />
              <p className="text-xs text-safe-text-muted/50">
                No {railFilter === 'cameras' ? 'cameras' : 'nodes'} registered
              </p>
            </div>
          )}

        </div>
      </aside>

      {/* Dialogs */}
      {detailNode && (
        <NodeDetailDialog
          node={detailNode}
          activeIncidentNodeIds={activeIncidentNodeIds}
          onClose={() => setDetailNode(null)}
        />
      )}

      {detailCamera && (
        <CameraDetailDialog
          camera={detailCamera}
          onClose={() => setDetailCamera(null)}
        />
      )}
    </>
  );
}

export default NodesList;
