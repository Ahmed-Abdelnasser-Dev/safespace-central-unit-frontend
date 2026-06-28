import PageHeader from '@/components/layout/PageHeader';
import CameraGrid from '../components/CameraGrid';
import CameraCard from '../components/CameraCard';
import CameraFormModal from '../components/CameraFormModal';
import DeleteCameraModal from '../components/DeleteCameraModal';
import { fetchCameras } from '../cameraSlice';
import { canManageCameras } from '@/shared/utils/roleUtils';

function CameraFeedsPage() {
  const dispatch = useDispatch();
  const role = useSelector(state => state.auth?.user?.role?.name);
  const canManage = role ? canManageCameras(role) : false;
  
  const { cameras } = useSelector(state => state.cameras);
  const [viewMode, setViewMode] = useState('live'); // 'live' | 'manage'
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedCamera, setSelectedCamera] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCameras());
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
    <div className="min-h-full bg-safe-dark text-safe-text-primary p-6">
      <PageHeader
        title="Camera Feeds"
        description="Live camera monitoring from detection nodes"
        icon="video"
      />
      <div className="flex items-center justify-center mt-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-safe-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon="video" className="text-2xl text-safe-text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-safe-text-primary mb-2">Coming Soon</h2>
          <p className="text-sm text-safe-text-muted">
            Live camera feeds from all detection nodes will be available here.
          </p>
        </div>
      </div>
      
      {viewMode === 'live' ? (
        <CameraGrid onEdit={handleEdit} onDelete={handleDelete} canManage={canManage} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cameras.length === 0 ? (
            <div className="col-span-4 text-center text-gray-400 py-16">
              No cameras registered yet.
              {canManage && <span> Click <strong>Add Camera</strong> to add one.</span>}
            </div>
          ) : (
            cameras.map(cam => (
              <CameraCard key={cam.id} camera={cam} onEdit={handleEdit} onDelete={handleDelete} canManage={canManage} />
            ))
          )}
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
