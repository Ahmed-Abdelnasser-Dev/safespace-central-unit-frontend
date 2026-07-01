import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStreamSocket } from '@/features/cameras/hooks/useStreamSocket';
import { fetchCameras } from '@/features/cameras/cameraSlice';
import CameraStatusBadge from '@/features/cameras/components/CameraStatusBadge';

/**
 * @param {{ nodeId: string, polygons: Array }} props
 */
export default function VideoFeedPlayer({ nodeId, polygons = [], stretch = false }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const dispatch = useDispatch();

  const { cameras, loading: camerasLoading } = useSelector((s) => s.cameras);

  useEffect(() => {
    if (cameras.length === 0 && !camerasLoading) dispatch(fetchCameras());
  }, [cameras.length, camerasLoading, dispatch]);

  // The stream-service identifies streams by the camera's own id (e.g. "cam-001"),
  // not the node id — look up the camera assigned to this node via the cameras
  // slice, the same way CameraFeed does for the Cameras tab.
  const camera = cameras.find((c) => c.nodeId === nodeId);
  const activeCameraId = camera?.id ?? null;

  const { status: wsStatus, fps } = useStreamSocket(activeCameraId, canvasRef);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Update canvas size for drawing polygons correctly
  useEffect(() => {
    if (wsStatus === 'live' && canvasRef.current) {
      const updateSize = () => {
        setCanvasSize({
          width: canvasRef.current.width || 640,
          height: canvasRef.current.height || 640,
        });
      };
      // Check periodically as JSMpeg might resize canvas
      const interval = setInterval(updateSize, 1000);
      updateSize();
      return () => clearInterval(interval);
    }
  }, [wsStatus]);

  // Draw polygons on overlay canvas
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !polygons || polygons.length === 0) return;
    
    const ctx = overlay.getContext('2d');
    const { width, height } = overlay;
    ctx.clearRect(0, 0, width, height);

    polygons.forEach((polygon) => {
      if (!polygon.points || polygon.points.length < 3) return;
      
      const baseWidth = polygon.baseWidth || width;
      const baseHeight = polygon.baseHeight || height;

      ctx.beginPath();
      polygon.points.forEach((p, i) => {
        const x = (p.x / baseWidth) * width;
        const y = (p.y / baseHeight) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
  }, [polygons, canvasSize]);

  if (!nodeId) return null;

  return (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden ${stretch ? 'h-full' : 'aspect-video'}`}>
      {wsStatus !== 'live' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm z-10">
          {!activeCameraId && <span className="text-gray-500">No feed configured</span>}
          {activeCameraId && wsStatus === 'connecting' && <span className="animate-pulse">Connecting to stream…</span>}
          {activeCameraId && wsStatus === 'error'      && <span className="text-red-400">Stream error</span>}
          {activeCameraId && wsStatus === 'stopped'    && <span className="text-gray-400">Stream offline</span>}
        </div>
      )}
      
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${stretch ? 'object-fill' : 'object-contain'}`}
          style={{ display: wsStatus === 'live' ? 'block' : 'none' }}
        />
        <canvas
          ref={overlayRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={`absolute inset-0 w-full h-full pointer-events-none ${stretch ? 'object-fill' : 'object-contain'}`}
          style={{ display: wsStatus === 'live' ? 'block' : 'none' }}
        />
      </div>

      <div className="absolute top-2 right-2 z-20">
        <CameraStatusBadge status={wsStatus} />
      </div>
      {wsStatus === 'live' && (
        <span className="absolute bottom-2 right-2 text-xs text-white/60 font-mono z-20">
          {fps} FPS
        </span>
      )}
    </div>
  );
}
