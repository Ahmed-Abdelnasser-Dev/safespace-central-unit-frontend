import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '@/components/layout/PageHeader';
import CameraGrid from '../components/CameraGrid';
import CameraCard from '../components/CameraCard';
import CameraFormModal from '../components/CameraFormModal';
import DeleteCameraModal from '../components/DeleteCameraModal';
import { fetchCameras } from '../cameraSlice';
import { fetchNodes } from '@/features/nodeMaintainer/nodesSlice';
import { canManageCameras } from '@/shared/utils/roleUtils';

function CameraFeedsPage() {
  const dispatch = useDispatch();
  const role = useSelector(state => state.auth?.operator?.role);
  const canManage = role ? canManageCameras(role) : false;
  
  const { cameras } = useSelector(state => state.cameras);
  const [viewMode, setViewMode] = useState('live'); // 'live' | 'manage'
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedCamera, setSelectedCamera] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCameras());
    dispatch(fetchNodes());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCameras());
  };

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
    <div className="min-h-full bg-safe-dark text-white p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <PageHeader
            title="Camera Feeds"
            description="Live camera monitoring from detection nodes across your network"
            icon="video"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-safe-gray rounded-lg p-1 border border-safe-gray-light">
            <button 
              onClick={() => setViewMode('live')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'live' ? 'bg-safe-blue text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FontAwesomeIcon icon="video" className="mr-2" /> Live
            </button>
            <button 
              onClick={() => setViewMode('manage')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'manage' ? 'bg-safe-blue text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FontAwesomeIcon icon="list" className="mr-2" /> Manage
            </button>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-safe-gray hover:bg-safe-gray-light text-white rounded-lg transition-colors border border-safe-gray-light"
          >
            <FontAwesomeIcon icon="sync-alt" />
            <span>Refresh</span>
          </button>
          
          {canManage && (
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-safe-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon="plus" />
              <span>Add Camera</span>
            </button>
          )}
        </div>
      </div>
      
      {viewMode === 'live' ? (
        <CameraGrid onEdit={handleEdit} onDelete={handleDelete} canManage={canManage} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cameras.map(cam => (
             <CameraCard key={cam.id} camera={cam} onEdit={handleEdit} onDelete={handleDelete} canManage={canManage} />
          ))}
        </div>
      )}

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
