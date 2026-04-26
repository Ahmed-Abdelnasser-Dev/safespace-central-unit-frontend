import PageHeader from '@/components/layout/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function AlertsPage() {
  return (
    <div className="min-h-full bg-safe-dark text-white p-6">
      <PageHeader
        title="Alerts"
        description="Real-time system alerts and notifications"
        icon="bell"
      />
      <div className="flex items-center justify-center mt-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-safe-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon="bell" className="text-2xl text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Coming Soon</h2>
          <p className="text-sm text-gray-400">
            Alert management and notification center will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AlertsPage;
