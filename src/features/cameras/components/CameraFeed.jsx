import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CameraStatusBadge from './CameraStatusBadge';
import { useStreamSocket } from '../hooks/useStreamSocket';

export default function CameraFeed({ camera, onEdit, onDelete, canManage }) {
  const canvasRef = useRef(null);
  const { status, fps } = useStreamSocket(camera.id, canvasRef);

  return (
    <div className="bg-safe-gray rounded-xl overflow-hidden border border-safe-gray-light flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-safe-dark/50">
        <div className="flex items-center gap-3 min-w-0">
          <CameraStatusBadge status={status} />
          <h3 className="text-safe-text-primary font-medium truncate">{camera.name}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {canManage && (
            <>
              <button
                onClick={() => onEdit?.(camera)}
                title="Edit camera"
                className="p-1.5 rounded text-safe-text-muted hover:text-safe-blue hover:bg-white/5 transition-colors"
              >
                <FontAwesomeIcon icon="pen-to-square" className="text-xs" />
              </button>
              <button
                onClick={() => onDelete?.(camera)}
                title="Delete camera"
                className="p-1.5 rounded text-safe-text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <FontAwesomeIcon icon="trash" className="text-xs" />
              </button>
            </>
          )}
          <span className="text-xs text-safe-text-muted font-mono">{camera.id}</span>
        </div>
      </div>

      {/* Video Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {status !== 'live' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-safe-dark/80 z-10">
            {status === 'connecting' && <span className="text-safe-blue animate-pulse">Establishing connection...</span>}
            {status === 'error'      && <span className="text-red-400">Stream interrupted</span>}
            {status === 'stopped'    && <span className="text-safe-text-muted">Stream offline</span>}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ display: status === 'live' ? 'block' : 'none' }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-safe-dark/50 flex items-center justify-between text-xs text-safe-text-muted font-mono border-t border-safe-gray-light">
        <span>{fps} FPS</span>
        {canvasRef.current && canvasRef.current.width > 0 && (
          <span>{canvasRef.current.width}×{canvasRef.current.height}</span>
        )}
      </div>
    </div>
  );
}
