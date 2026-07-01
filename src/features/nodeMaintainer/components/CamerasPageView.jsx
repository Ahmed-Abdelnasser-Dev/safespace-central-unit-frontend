import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCameras } from '../../cameras/cameraSlice';
import { canManageCameras } from '@/shared/utils/roleUtils';
import CameraFeed from '../../cameras/components/CameraFeed.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CamerasPageView({ searchQuery = '', onEdit, onDelete }) {
  const dispatch = useDispatch();
  const { cameras, loading, error } = useSelector((s) => s.cameras);
  const { user } = useSelector((s) => s.auth);
  const canManage = canManageCameras(user?.role?.name);

  useEffect(() => {
    dispatch(fetchCameras());
  }, [dispatch]);

  const filtered = cameras.filter((cam) => {
    const q = (searchQuery || '').toLowerCase();
    if (!q) return true;
    return (
      (cam.name || '').toLowerCase().includes(q) ||
      (cam.location || '').toLowerCase().includes(q) ||
      (cam.nodeId || '').toLowerCase().includes(q)
    );
  });

  if (loading && cameras.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-safe-blue-btn border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-safe-text-muted">Loading cameras…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <FontAwesomeIcon icon="triangle-exclamation" className="text-safe-orange text-3xl mb-3" />
          <p className="text-sm font-medium text-safe-text-primary mb-1">Camera service unavailable</p>
          <p className="text-xs text-safe-text-muted">Unable to connect to the stream service. Check your connection and try again.</p>
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon="video" className="text-safe-text-muted text-3xl mb-3 opacity-40" />
          <p className="text-sm font-medium text-safe-text-primary mb-1">
            {cameras.length === 0 ? 'No cameras configured' : 'No cameras match your search'}
          </p>
          <p className="text-xs text-safe-text-muted">
            {cameras.length === 0 ? 'Add a camera to get started.' : `No results for "${searchQuery}"`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {filtered.map((cam) => (
          <CameraFeed
            key={cam.id}
            camera={cam}
            onEdit={onEdit}
            onDelete={onDelete}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}
