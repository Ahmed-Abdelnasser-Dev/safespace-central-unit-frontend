import PageHeader from '@/components/layout/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function MessagesPage() {
  return (
    <div className="min-h-full bg-safe-dark text-white p-8">
      <PageHeader
        title="Messages & Dispatch"
        description="Integrated messaging and dispatch communication center"
        icon="envelope"
      />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
        <div className="text-center max-w-md animate-slideUp">
          <div className="w-20 h-20 bg-gradient-to-br from-safe-blue/20 to-safe-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-safe-blue/30">
            <FontAwesomeIcon icon="envelope" className="text-4xl text-safe-blue/60" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">Coming Soon</h2>
          <p className="text-base text-safe-text-gray/80 font-light leading-relaxed">
            Integrated messaging and dispatch communication will be available here.
          </p>
          
          <div className="mt-8 space-y-2 text-sm text-safe-text-gray/70 font-light">
            <p>✓ Real-time messaging</p>
            <p>✓ Dispatch coordination</p>
            <p>✓ Message history</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
