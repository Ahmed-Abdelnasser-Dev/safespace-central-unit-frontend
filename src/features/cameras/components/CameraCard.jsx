import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CameraStatusBadge from './CameraStatusBadge';

export default function CameraCard({ camera, onEdit, onDelete, canManage }) {
  // Simple relative time formatter
  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-safe-gray rounded-xl overflow-hidden shadow-lg border border-safe-gray-light p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-safe-text-primary font-medium mb-1">{camera.name}</h3>
          <p className="text-sm text-safe-text-muted">
            <FontAwesomeIcon icon="map-marker-alt" className="mr-2" />
            {camera.location || 'No location set'}
          </p>
          <p className="text-xs text-safe-text-muted mt-1">
            Node: {camera.nodeId || 'Unassigned'}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(camera)} className="p-2 text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light rounded" aria-label="Edit">
              <FontAwesomeIcon icon="edit" />
            </button>
            <button onClick={() => onDelete(camera)} className="p-2 text-safe-text-muted hover:text-red-500 hover:bg-safe-gray-light rounded" aria-label="Delete">
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-safe-gray-light pt-3">
        <CameraStatusBadge status={camera.status === 'ONLINE' ? 'live' : (camera.status === 'ERROR' ? 'error' : 'offline')} />
        <span className="text-xs text-safe-text-muted">
          Last seen: {timeAgo(camera.lastSeenAt)}
        </span>
      </div>
    </div>
  );
}
