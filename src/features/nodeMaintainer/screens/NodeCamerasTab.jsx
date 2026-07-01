import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCameras } from '../../cameras/cameraSlice';
import { selectSelectedNode } from '../nodesSlice';
import { canManageCameras } from '@/shared/utils/roleUtils';
import CameraFeed from '../../cameras/components/CameraFeed.jsx';
import CameraFormModal from '../../cameras/components/CameraFormModal.jsx';
import DeleteCameraModal from '../../cameras/components/DeleteCameraModal.jsx';
import Button from '@/components/ui/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function NodeCamerasTab() {
  const dispatch = useDispatch();
  const node = useSelector(selectSelectedNode);
  const { cameras, loading } = useSelector((s) => s.cameras);
  const { user } = useSelector((s) => s.auth);
  const canManage = canManageCameras(user?.role?.name);

  const [showForm, setShowForm] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [cameraToDelete, setCameraToDelete] = useState(null);

  useEffect(() => {
    if (cameras.length === 0) dispatch(fetchCameras());
  }, [dispatch, cameras.length]);

  if (!node) return <div className="p-5 text-sm text-safe-text-muted">Select a node</div>;

  const nodeCameras = cameras.filter((c) => c.nodeId === node.id);

  const handleAdd = () => { setEditingCamera(null); setShowForm(true); };
  const handleEdit = (cam) => { setEditingCamera(cam); setShowForm(true); };
  const handleDelete = (cam) => setCameraToDelete(cam);

  return (
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-safe-text-primary">
            Cameras
            <span className="ml-1.5 text-[10px] font-normal text-safe-text-muted">
              ({nodeCameras.length})
            </span>
          </p>
          <p className="text-[10px] text-safe-text-muted mt-0.5">Cameras assigned to {node.id}</p>
        </div>
        {canManage && (
          <Button variant="outline" size="sm" icon="plus" onClick={handleAdd}>
            Add Camera
          </Button>
        )}
      </div>

      {loading && nodeCameras.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-safe-blue-btn border-t-transparent rounded-full animate-spin" />
        </div>
      ) : nodeCameras.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-safe-text-muted">
          <FontAwesomeIcon icon="camera" className="text-2xl opacity-40" />
          <p className="text-xs">No cameras assigned to this node.</p>
          {canManage && (
            <button onClick={handleAdd} className="text-xs text-safe-blue hover:underline mt-1">
              Add one now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {nodeCameras.map((cam) => (
            <CameraFeed
              key={cam.id}
              camera={cam}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      <CameraFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingCamera(null); }}
        mode={editingCamera ? 'edit' : 'create'}
        camera={editingCamera}
        defaultNodeId={node.id}
      />

      <DeleteCameraModal
        isOpen={!!cameraToDelete}
        onClose={() => setCameraToDelete(null)}
        camera={cameraToDelete}
      />
    </div>
  );
}
