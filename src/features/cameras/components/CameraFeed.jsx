import { useRef } from 'react';
import CameraStatusBadge from './CameraStatusBadge';
import { useStreamSocket } from '../hooks/useStreamSocket';

export default function CameraFeed({ camera }) {
  const canvasRef = useRef(null);
  const { status, fps } = useStreamSocket(camera.id, canvasRef);

  return (
    <div className="bg-safe-gray rounded-xl overflow-hidden border border-safe-gray-light flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-safe-dark/50">
        <div className="flex items-center gap-3">
          <CameraStatusBadge status={status} />
          <h3 className="text-safe-text-primary font-medium">{camera.name}</h3>
        </div>
        <span className="text-xs text-safe-text-muted font-mono">{camera.id}</span>
      </div>

      {/* Video Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {status !== 'live' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-safe-dark/80 z-10">
             {status === 'connecting' && <span className="text-safe-blue animate-pulse">Establishing connection...</span>}
             {status === 'error' && <span className="text-red-400">Stream interrupted</span>}
             {status === 'stopped' && <span className="text-safe-text-muted">Stream offline</span>}
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-contain"
          style={{ display: status === 'live' ? 'block' : 'none' }}
        />
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 bg-safe-dark/50 flex items-center justify-between text-xs text-safe-text-muted font-mono border-t border-safe-gray-light">
        <span>{fps} FPS</span>
        {canvasRef.current && canvasRef.current.width > 0 && (
          <span>{canvasRef.current.width}×{canvasRef.current.height}</span>
        )}
      </div>
    </div>
  );
}
