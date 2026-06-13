import PageHeader from '@/components/layout/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function AlertsPage() {
  return (
    <div className="min-h-full bg-safe-dark text-white p-8">
      <PageHeader
        title="Alerts & Notifications"
        description="Real-time system alerts, warnings, and critical notifications"
        icon="bell"
      />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
        <div className="text-center max-w-md animate-slideUp">
          <div className="w-20 h-20 bg-gradient-to-br from-safe-blue/20 to-safe-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-safe-blue/30">
            <FontAwesomeIcon icon="bell" className="text-4xl text-safe-blue/60" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">Coming Soon</h2>
          <p className="text-base text-safe-text-gray/80 font-light leading-relaxed">
            Alert management and notification center will be available here. Real-time system warnings and critical events.
          </p>
          
          {/* Placeholder features */}
          <div className="mt-8 space-y-2 text-sm text-safe-text-gray/70 font-light">
            <p>✓ Real-time alerts</p>
            <p>✓ Alert filtering & search</p>
            <p>✓ Notification preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertsPage;
