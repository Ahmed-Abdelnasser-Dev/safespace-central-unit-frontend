import PageHeader from '@/components/layout/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CameraFeedsPage() {
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
    </div>
  );
}

export default CameraFeedsPage;
