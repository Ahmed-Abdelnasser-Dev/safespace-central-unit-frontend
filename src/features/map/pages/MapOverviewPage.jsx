import { useState, useEffect } from 'react';
import MapHeader from '../components/MapHeader.jsx';
import FilterTabs from '../components/FilterTabs.jsx';
import MapView from '../components/MapView.jsx';
import AccidentDialog from '@/features/incidents/components/AccidentDialog.jsx';
import NodesList from '../components/NodesList.jsx';
import KPICards from '../components/KPICards.jsx';
import { initSocket, getSocket, onIncidentAssigned, offIncidentAssigned, onAccidentDetected, offAccidentDetected } from '@/services/socketService.js';

function MapOverviewPage() {
  const [showAccident, setShowAccident] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [decisionNotification, setDecisionNotification] = useState(null);

  useEffect(() => {
    initSocket();

    const handleAccident = (incidentData) => {
      // Backend guarantees we won't get another incident while busy, 
      // but just incase, defensive programming here:
      if (showAccident || currentIncident) return; 

      setCurrentIncident(incidentData);
      setShowAccident(true);
    };

    const handleDecisionConfirmed = (decisionData) => {
      setDecisionNotification(decisionData);
      const timer = setTimeout(() => setDecisionNotification(null), 5000);
      return () => clearTimeout(timer);
    };

    onIncidentAssigned(handleAccident);
    onAccidentDetected(handleAccident);
    const socket = getSocket();
    socket.on('decision-confirmed', handleDecisionConfirmed);

    return () => {
      offIncidentAssigned(handleAccident);
      offAccidentDetected(handleAccident);
      socket.off('decision-confirmed', handleDecisionConfirmed);
    };
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-safe-bg">
      {/* Header */}
      <MapHeader />

      {/* Decision Notification Toast */}
      {decisionNotification && (
        <div className="fixed top-4 right-4 z-40 animate-fadeIn">
          <div className={`px-6 py-4 rounded-lg shadow-lg border-l-4 text-white ${
            decisionNotification.status === 'CONFIRMED'
              ? 'bg-green-600 border-green-400'
              : decisionNotification.status === 'MODIFIED'
              ? 'bg-blue-600 border-blue-400'
              : 'bg-red-600 border-red-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {decisionNotification.status === 'CONFIRMED' ? '✅' :
                 decisionNotification.status === 'MODIFIED' ? '✏️' : '❌'}
              </div>
              <div>
                <p className="font-bold text-sm">Decision {decisionNotification.status}</p>
                <p className="text-xs opacity-90">{decisionNotification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left section */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-shrink-0">
            <FilterTabs activeTab="call-emergency" />
          </div>

          <div className="flex-1 flex flex-col relative min-h-0 p-4 gap-4">
            <div className="flex-1">
              <MapView />
              <AccidentDialog
                open={showAccident}
                onClose={() => setShowAccident(false)}
                onDecision={(decision) => {
                  setShowAccident(false);
                  setCurrentIncident(null);
                }}
                incident={currentIncident}
              />
            </div>

            <div className="flex-shrink-0">
              <KPICards />
            </div>
          </div>
        </div>

        {/* Right section */}
        <NodesList />
      </div>
    </div>
  );
}

export default MapOverviewPage;
