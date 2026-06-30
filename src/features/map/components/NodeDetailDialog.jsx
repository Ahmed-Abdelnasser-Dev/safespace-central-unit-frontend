import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getLaneCfg } from './NodesList';
import VideoFeedPlayer from '@/features/nodeMaintainer/components/VideoFeedPlayer';

// ── Info section wrappers ────────────────────────────────────────────────────

function InfoSection({ title, children }) {
  return (
    <div className="px-4 py-3 space-y-2">
      <p className="text-[10px] font-bold text-safe-text-muted uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, mono = false, className = '' }) {
  return (
    <div className="flex items-start gap-2.5">
      {icon && <FontAwesomeIcon icon={icon} className="text-safe-text-muted/60 text-xs mt-0.5 flex-shrink-0 w-3" />}
      <div className="flex-1 min-w-0">
        {label && <p className="text-[10px] text-safe-text-muted/70 mb-0.5">{label}</p>}
        <p className={`text-xs text-safe-text-primary leading-snug ${mono ? 'font-mono break-all' : ''} ${className}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Main dialog ──────────────────────────────────────────────────────────────

export function NodeDetailDialog({ node, onClose, activeIncidentNodeIds = [] }) {
  const navigate = useNavigate();
  if (!node) return null;

  const isOnline = node.status === 'online';
  const hasIncident = activeIncidentNodeIds.includes(node.id);

  const speedLimit = node.speedLimit ?? node.roadRules?.speedLimit ?? null;
  const lanes = node.lanes || node.roadRules?.lanes || [];
  const lat = node.location?.latitude ?? node.latitude;
  const lng = node.location?.longitude ?? node.longitude;
  const address = node.location?.address || node.streetName || 'Unknown location';
  const coordStr = lat != null && lng != null
    ? `${Number(lat).toFixed(5)}° N,  ${Number(lng).toFixed(5)}° E`
    : null;
  const mapsUrl = lat != null && lng != null
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : null;

  const lastSeen = node.lastHeartbeatAt ?? node.updatedAt ?? null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Node details: ${node.name}`}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-2xl bg-safe-sidebar border border-safe-gray-light rounded-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[85vh]">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-safe-gray-light flex-shrink-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              hasIncident ? 'bg-safe-accent/15' : isOnline ? 'bg-safe-green/15' : 'bg-safe-danger/15'
            }`}>
              <FontAwesomeIcon
                icon={hasIncident ? 'triangle-exclamation' : 'map-pin'}
                className={`text-sm ${hasIncident ? 'text-safe-accent' : isOnline ? 'text-safe-green' : 'text-safe-danger'}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-safe-text-primary truncate">{node.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isOnline ? 'bg-safe-green' : 'bg-safe-danger'
                  }`} />
                  <span className={`text-[11px] font-semibold ${isOnline ? 'text-safe-green' : 'text-safe-danger'}`}>
                    {isOnline ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {hasIncident && (
                  <span className="text-[10px] font-semibold text-safe-accent bg-safe-accent/10 px-2 py-0.5 rounded-full">
                    Active Incident
                  </span>
                )}
                <span className="text-[11px] text-safe-text-muted/60 font-mono">{node.id}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/60 rounded-lg transition-all flex-shrink-0"
              aria-label="Close"
            >
              <FontAwesomeIcon icon="xmark" />
            </button>
          </div>

          {/* Body — stream + info side by side */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* Left: Live stream */}
            <div className="flex-1 bg-black min-w-0 p-2">
              <VideoFeedPlayer
                nodeId={node.id}
                streamUrl={node.streamUrl ?? null}
                status={node.status}
              />
            </div>

            {/* Right: Info panels (scrollable) */}
            <div className="w-72 flex-shrink-0 border-l border-safe-gray-light overflow-y-auto divide-y divide-safe-gray-light">

              {/* Location */}
              <InfoSection title="Location">
                <InfoRow icon="location-dot" value={address} />
                {coordStr && <InfoRow icon="crosshairs" value={coordStr} mono />}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-safe-blue hover:text-safe-blue/80 transition-colors mt-1"
                  >
                    <FontAwesomeIcon icon="arrow-up-right-from-square" className="text-[9px]" />
                    Open in Google Maps
                  </a>
                )}
              </InfoSection>

              {/* Road Configuration */}
              {(speedLimit != null || lanes.length > 0) && (
                <InfoSection title="Road Configuration">
                  <div className={`grid gap-2 ${speedLimit != null && lanes.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {speedLimit != null && (
                      <div className="bg-safe-bg rounded-lg p-2.5 border border-safe-border">
                        <div className="flex items-center gap-1 mb-1">
                          <FontAwesomeIcon icon="gauge-high" className="text-safe-text-muted text-[9px]" />
                          <p className="text-[9px] text-safe-text-muted uppercase tracking-wide">Limit</p>
                        </div>
                        <p className="text-base font-bold text-safe-text-primary tabular-nums">
                          {speedLimit}
                          <span className="text-[9px] text-safe-text-muted ml-0.5 font-normal">km/h</span>
                        </p>
                      </div>
                    )}
                    {lanes.length > 0 && (
                      <div className="bg-safe-bg rounded-lg p-2.5 border border-safe-border">
                        <div className="flex items-center gap-1 mb-1">
                          <FontAwesomeIcon icon="road" className="text-safe-text-muted text-[9px]" />
                          <p className="text-[9px] text-safe-text-muted uppercase tracking-wide">Lanes</p>
                        </div>
                        <p className="text-base font-bold text-safe-text-primary tabular-nums">
                          {lanes.length}
                          <span className="text-[9px] text-safe-text-muted ml-0.5 font-normal">total</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {lanes.length > 0 && (
                    <div className="flex gap-1.5 mt-1">
                      {lanes.map((lane, i) => {
                        const cfg = getLaneCfg(lane);
                        return (
                          <div
                            key={lane.id ?? i}
                            className={`flex-1 min-w-0 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border ${cfg.bg} ${cfg.border}`}
                          >
                            <FontAwesomeIcon icon={cfg.icon} className={`text-sm ${cfg.color}`} />
                            <p className={`text-[9px] font-semibold ${cfg.color}`}>{cfg.label}</p>
                            <p className="text-[8px] text-safe-text-muted truncate w-full text-center">
                              {lane.name || `L${i + 1}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </InfoSection>
              )}

              {/* Health / Technical */}
              <InfoSection title="Technical">
                <InfoRow icon="fingerprint" label="Node ID" value={node.id || node.nodeId || '—'} mono />
                {lastSeen && (
                  <InfoRow
                    icon="clock"
                    label="Last heartbeat"
                    value={new Date(lastSeen).toLocaleString()}
                  />
                )}
                {node.ip && <InfoRow icon="network-wired" label="IP Address" value={node.ip} mono />}
                {node.firmwareVersion && <InfoRow icon="microchip" label="Firmware" value={node.firmwareVersion} />}
              </InfoSection>

            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 px-5 py-3 border-t border-safe-gray-light flex-shrink-0 bg-safe-bg/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-safe-text-muted hover:text-safe-text-primary bg-safe-sidebar hover:bg-safe-gray-light/60 border border-safe-border rounded-lg transition-all"
            >
              Close
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => { onClose(); navigate('/node-maintainer'); }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-safe-blue bg-safe-blue/10 hover:bg-safe-blue/15 border border-safe-blue/20 rounded-lg transition-all"
            >
              <FontAwesomeIcon icon="arrow-up-right-from-square" className="text-[10px]" />
              Manage Node
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default NodeDetailDialog;
