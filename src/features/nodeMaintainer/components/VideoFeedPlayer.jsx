import { useRef } from 'react';
import { useStreamSocket } from '@/features/cameras/hooks/useStreamSocket';
import CameraStatusBadge from '@/features/cameras/components/CameraStatusBadge';

/**
 * @param {{ nodeId: string, streamUrl: string|null, status: string }} props
 */
export default function VideoFeedPlayer({ nodeId, streamUrl, status }) {
  const canvasRef = useRef(null);

  // Derive camera ID from streamUrl when provided, otherwise fall back to nodeId
  const cameraId = streamUrl
    ? streamUrl.split('/stream/').pop()
    : nodeId;

  const { status: wsStatus, fps } = useStreamSocket(
    status === 'offline' ? null : cameraId,
    canvasRef
  );

  if (!nodeId) return null;

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
      {wsStatus !== 'live' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm">
          {wsStatus === 'connecting' && <span className="animate-pulse">Connecting to stream…</span>}
          {wsStatus === 'error'      && <span className="text-red-400">Stream error</span>}
          {wsStatus === 'stopped'    && <span className="text-gray-400">Stream offline</span>}
          {!cameraId                 && <span className="text-gray-500">No feed configured</span>}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ display: wsStatus === 'live' ? 'block' : 'none' }}
      />
      <div className="absolute top-2 right-2">
        <CameraStatusBadge status={wsStatus} />
      </div>
      {wsStatus === 'live' && (
        <span className="absolute bottom-2 right-2 text-xs text-white/60 font-mono">
          {fps} FPS
        </span>
      )}
    </div>
  );
}
