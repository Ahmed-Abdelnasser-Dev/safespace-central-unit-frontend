import PageHeader from '@/components/layout/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function SettingsPage() {
  return (
    <div className="min-h-full bg-safe-dark text-safe-text-primary p-6">
      <PageHeader
        title="Settings"
        description="System configuration and preferences"
        icon="gear"
      />
      <div className="flex items-center justify-center mt-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-safe-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon="gear" className="text-2xl text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-safe-text-primary mb-2">Coming Soon</h2>
          <p className="text-sm text-safe-text-muted">
            System settings and configuration options will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
