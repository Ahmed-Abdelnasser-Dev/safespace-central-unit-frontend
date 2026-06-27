import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStreamSocket } from '@/features/cameras/hooks/useStreamSocket';

// ── Live camera stream panel ──────────────────────────────────────────────────

function CameraStreamPanel({ camera }) {
  const canvasRef = useRef(null);
  const { status, fps } = useStreamSocket(camera.id, canvasRef);
  const isLive = status === 'live';

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {!isLive && (
        <div className="flex flex-col items-center justify-center text-center px-6 gap-3 absolute inset-0">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <FontAwesomeIcon icon="video" className="text-white/25 text-2xl" />
          </div>
          <div>
            <p className="text-white/60 text-sm font-medium">
              {status === 'connecting' ? 'Connecting to stream…' : 'Stream offline'}
            </p>
            <p className="text-white/30 text-xs mt-0.5">
              {status === 'connecting'
                ? 'Establishing WebSocket connection'
                : 'Camera may be offline or stream service unreachable'}
            </p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ display: isLive ? 'block' : 'none' }}
      />

      {/* Status badge */}
      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm border ${
        isLive
          ? 'bg-safe-green/80 border-safe-green/40 text-white'
          : status === 'connecting'
          ? 'bg-black/60 border-white/10 text-white/50'
          : 'bg-safe-danger/70 border-safe-danger/40 text-white'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLive ? 'bg-white animate-pulse' : 'bg-white/30'}`} />
        {isLive ? 'LIVE' : status === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
      </div>

      {/* FPS badge */}
      {isLive && fps > 0 && (
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-[10px] font-mono text-white/80 border border-white/10">
          {fps} FPS
          {canvasRef.current?.width > 0 && (
            <span className="ml-1.5 text-white/40">
              {canvasRef.current.width}×{canvasRef.current.height}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Info section wrappers ─────────────────────────────────────────────────────

function InfoSection({ title, children }) {
  return (
    <div className="px-4 py-3 space-y-2">
      <p className="text-[10px] font-bold text-safe-text-muted uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-2.5">
      {icon && <FontAwesomeIcon icon={icon} className="text-safe-text-muted/60 text-xs mt-0.5 flex-shrink-0 w-3" />}
      <div className="flex-1 min-w-0">
        {label && <p className="text-[10px] text-safe-text-muted/70 mb-0.5">{label}</p>}
        <p className={`text-xs text-safe-text-primary leading-snug ${mono ? 'font-mono break-all' : ''}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────

export function CameraDetailDialog({ camera, onClose }) {
  if (!camera) return null;

  const isOnline = camera.status === 'ONLINE';
  const name = camera.name || camera.cameraId || `Camera ${camera.id}`;
  const location = camera.location || camera.streetName || null;

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
        aria-label={`Camera: ${name}`}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-2xl bg-safe-sidebar border border-safe-gray-light rounded-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[85vh]">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-safe-gray-light flex-shrink-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isOnline ? 'bg-safe-teal/15' : 'bg-safe-orange/15'
            }`}>
              <FontAwesomeIcon
                icon={isOnline ? 'video' : 'video-slash'}
                className={`text-sm ${isOnline ? 'text-safe-teal' : 'text-safe-orange'}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-safe-text-primary truncate">{name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-safe-teal' : 'bg-safe-orange'}`} />
                  <span className={`text-[11px] font-semibold ${isOnline ? 'text-safe-teal' : 'text-safe-orange'}`}>
                    {isOnline ? 'Live' : 'Offline'}
                  </span>
                </div>
                <span className="text-[11px] text-safe-text-muted/60 font-mono">{camera.id}</span>
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

          {/* Body */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* Left: Live stream */}
            <div className="flex-1 bg-black min-w-0" style={{ minHeight: '240px' }}>
              <CameraStreamPanel camera={camera} />
            </div>

            {/* Right: Info panels */}
            <div className="w-72 flex-shrink-0 border-l border-safe-gray-light overflow-y-auto divide-y divide-safe-gray-light">

              {/* Status */}
              <InfoSection title="Status">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  isOnline
                    ? 'bg-safe-teal/5 border-safe-teal/20'
                    : 'bg-safe-orange/5 border-safe-orange/20'
                }`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-safe-teal animate-pulse' : 'bg-safe-orange'}`} />
                  <span className={`text-xs font-semibold ${isOnline ? 'text-safe-teal' : 'text-safe-orange'}`}>
                    {isOnline ? 'Camera Online' : 'Camera Offline'}
                  </span>
                </div>
              </InfoSection>

              {/* Location */}
              {location && (
                <InfoSection title="Location">
                  <InfoRow icon="location-dot" value={location} />
                </InfoSection>
              )}

              {/* Camera Info */}
              <InfoSection title="Camera Details">
                <InfoRow icon="fingerprint" label="Camera ID" value={camera.id} mono />
                {camera.cameraId && camera.cameraId !== camera.id && (
                  <InfoRow icon="tag" label="Camera Code" value={camera.cameraId} mono />
                )}
                {camera.type && <InfoRow icon="video" label="Type" value={camera.type} />}
                {camera.resolution && <InfoRow icon="expand" label="Resolution" value={camera.resolution} mono />}
                {camera.nodeId && <InfoRow icon="map-pin" label="Linked Node" value={camera.nodeId} mono />}
              </InfoSection>

              {/* Stream service note */}
              <InfoSection title="Stream">
                <p className="text-[11px] text-safe-text-muted/70 leading-relaxed">
                  {isOnline
                    ? 'Live stream available via WebSocket. Feed starts within a few seconds of opening.'
                    : 'Camera is currently offline. No stream available. Check connectivity or power supply.'}
                </p>
              </InfoSection>

            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 px-5 py-3 border-t border-safe-gray-light flex-shrink-0 bg-safe-bg/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-safe-text-muted hover:text-safe-text-primary bg-safe-sidebar hover:bg-safe-gray-light/60 border border-safe-border rounded-lg transition-all"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default CameraDetailDialog;
