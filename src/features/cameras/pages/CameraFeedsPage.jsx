import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '@/components/layout/PageHeader';
import CameraGrid from '../components/CameraGrid';
import CameraFormModal from '../components/CameraFormModal';
import DeleteCameraModal from '../components/DeleteCameraModal';
import { fetchCameras } from '../cameraSlice';
import { canManageCameras } from '@/shared/utils/roleUtils';

function CameraFeedsPage() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth?.user?.role?.name);
  const canManage = role ? canManageCameras(role) : false;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCameras());
  }, [dispatch]);

  const handleAdd = () => {
    setFormMode('create');
    setSelectedCamera(null);
    setIsFormOpen(true);
  };

  const handleEdit = (camera) => {
    setFormMode('edit');
    setSelectedCamera(camera);
    setIsFormOpen(true);
  };

  const handleDelete = (camera) => {
    setSelectedCamera(camera);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-full bg-safe-dark text-safe-text-primary p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Camera Feeds"
          description="Live camera monitoring from detection nodes"
          icon="video"
        />
        {canManage && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-safe-blue text-white rounded-lg text-sm font-medium hover:bg-safe-blue/90 transition-colors"
          >
            <FontAwesomeIcon icon="plus" />
            Add Camera
          </button>
        )}
      </div>

      <CameraGrid onEdit={handleEdit} onDelete={handleDelete} canManage={canManage} />

      <CameraFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
        camera={selectedCamera}
      />

      <DeleteCameraModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        camera={selectedCamera}
      />
    </div>
  );
}

export default CameraFeedsPage;
