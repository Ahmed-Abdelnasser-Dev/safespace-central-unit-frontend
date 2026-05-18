import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '@/components/layout/PageHeader';
import CameraGrid from '../components/CameraGrid';
import { fetchCameras } from '../cameraSlice';

function CameraFeedsPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCameras());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCameras());
  };

  return (
    <div className="min-h-full bg-safe-dark text-white p-8">
      <div className="flex justify-between items-start mb-8">
        <PageHeader
          title="Camera Feeds"
          description="Live camera monitoring from detection nodes across your network"
          icon="video"
        />
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-safe-gray hover:bg-safe-gray-light text-white rounded-lg transition-colors border border-safe-gray-light"
        >
          <FontAwesomeIcon icon="sync-alt" />
          <span>Refresh</span>
        </button>
      </div>
      
      <CameraGrid />
    </div>
  );
}

export default CameraFeedsPage;
