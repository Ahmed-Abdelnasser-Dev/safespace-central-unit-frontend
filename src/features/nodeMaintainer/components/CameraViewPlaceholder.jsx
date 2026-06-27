/**
 * CameraViewPlaceholder — temporary stub; replaced in Task 8 (Phase 4)
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CameraViewPlaceholder({ searchQuery }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <FontAwesomeIcon icon="video" className="text-safe-text-muted text-4xl mb-3" />
        <p className="text-sm font-medium text-safe-text-primary mb-1">Camera Management</p>
        <p className="text-xs text-safe-text-muted">Loading camera interface…</p>
        {searchQuery && (
          <p className="text-xs text-safe-text-muted mt-2">Search: "{searchQuery}"</p>
        )}
      </div>
    </div>
  );
}
