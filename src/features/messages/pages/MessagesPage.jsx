import PageHeader from '@/components/layout/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function MessagesPage() {
  return (
    <div className="min-h-full bg-safe-dark text-white p-6">
      <PageHeader
        title="Messages"
        description="Communication and dispatch messaging"
        icon="envelope"
      />
      <div className="flex items-center justify-center mt-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-safe-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon="envelope" className="text-2xl text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Coming Soon</h2>
          <p className="text-sm text-gray-400">
            Integrated messaging and dispatch communication will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
