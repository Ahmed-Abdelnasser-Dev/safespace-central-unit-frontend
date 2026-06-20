import { useSelector } from 'react-redux';
import CameraFeed from './CameraFeed';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CameraGrid({ onEdit, onDelete, canManage }) {
  const { cameras, loading, error } = useSelector(state => state.cameras);

  if (loading && cameras.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-safe-blue mx-auto mb-3" />
        <p className="text-gray-400">Loading camera feeds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <FontAwesomeIcon icon="exclamation-triangle" className="text-3xl text-red-500 mb-2" />
        <h3 className="text-red-500 font-medium mb-1">Failed to load cameras</h3>
        <p className="text-red-400/80 text-sm">{error}</p>
      </div>
    );
  }

  if (cameras.length === 0) {
    return (
      <div className="bg-safe-gray rounded-xl p-12 text-center border border-safe-gray-light">
        <FontAwesomeIcon icon="video-slash" className="text-4xl text-gray-500 mb-3" />
        <h3 className="text-safe-text-primary text-lg font-medium mb-1">No Cameras found</h3>
        <p className="text-gray-400 text-sm">No cameras are currently configured in the stream service.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      {cameras.map(cam => (
        <div key={cam.id} className="relative group">
           <CameraFeed camera={cam} />
           {canManage && (
             <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded">
                <button onClick={() => onEdit(cam)} className="p-1.5 text-safe-text-primary hover:text-safe-blue">
                  <FontAwesomeIcon icon="edit" />
                </button>
                <button onClick={() => onDelete(cam)} className="p-1.5 text-safe-text-primary hover:text-red-500">
                  <FontAwesomeIcon icon="trash" />
                </button>
             </div>
           )}
        </div>
      ))}
    </div>
  );
}
