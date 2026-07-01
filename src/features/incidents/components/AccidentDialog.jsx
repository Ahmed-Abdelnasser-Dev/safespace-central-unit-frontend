import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import Card from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import AccidentDialogHeader from './layout/AccidentDialogHeader.jsx';
import AiAnalysisCard from './cards/AiAnalysisCard.jsx';
import DecisionCard from './cards/DecisionCard.jsx';
import OverridePanel from './override/OverridePanel.jsx';
import AccidentMediaArea from './media/AccidentMediaArea.jsx';
import { emitAdminAccidentResponse } from '@/services/socketService.js';
import { showError } from '@/utils/toast';
import { useOverrideState } from '../hooks/useOverrideState';

/**
 * AccidentDialog – Displays incoming accident with AI Analysis and Decision Results
 * 
 * Flow: Node → AI Module → Decision Module → Dashboard (this component) → Admin Decision → Node
 * 
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onDecision
 * @param {object} props.incident
 */
function AccidentDialog({ open, onClose, incident, onDecision }) {
  // Initialize with AI Decision module's recommendations (not node defaults)
  const initialSpeedLimit = incident?.decision?.speedLimit
    || incident?.node?.defaultSpeedLimit
    || incident?.speedLimit
    || 40;
  const initialLaneCount = incident?.node?.defaultLaneCount
    || incident?.node?.defaultLaneConfiguration?.length
    || (incident?.decision?.laneConfiguration ? incident.decision.laneConfiguration.split(',').length : 3);
  const initialLaneConfig = Array.from({ length: initialLaneCount }, (_, index) => {
    // Prioritize AI decision over node defaults
    if (incident?.decision?.laneConfiguration) {
      return incident.decision.laneConfiguration.split(',')[index]?.trim().toLowerCase() || 'open';
    }
    const nodeDefault = incident?.node?.defaultLaneConfiguration?.[index]?.state;
    if (nodeDefault) {
      return nodeDefault.toLowerCase();
    }
    return 'open';
  });
  const initialActions = incident?.decision?.actions || ['REDUCE_SPEED_LIMIT'];
  
  const [selected, setSelected] = useState(initialActions);
  const [speedLimit, setSpeedLimit] = useState(initialSpeedLimit);
  const [laneConfiguration, setLaneConfiguration] = useState(initialLaneConfig);
  const [decisionType, setDecisionType] = useState('CONFIRMED');

  const override = useOverrideState({
    initialSpeedLimit,
    initialLaneConfig,
    setSpeedLimit,
    setLaneConfiguration,
    setDecisionType,
    getDefaultLaneCount: () =>
      incident?.node?.defaultLaneCount
      || incident?.node?.defaultLaneConfiguration?.length
      || override.tempLaneConfig.length
      || 3,
  });

  // Update state when incident changes
  useEffect(() => {
    if (incident) {
      const laneCount = incident?.node?.defaultLaneCount
        || incident?.node?.defaultLaneConfiguration?.length
        || (incident?.decision?.laneConfiguration ? incident.decision.laneConfiguration.split(',').length : 3);
      const parsedConfig = incident.decision?.laneConfiguration
        ? incident.decision.laneConfiguration.split(',').map(s => s.trim().toLowerCase())
        : [];
      // Prioritize AI decision over node defaults
      const configStates = Array.from({ length: laneCount }, (_, idx) => {
        if (parsedConfig[idx]) {
          return parsedConfig[idx];
        }
        const nodeDefault = incident?.node?.defaultLaneConfiguration?.[idx]?.state;
        return nodeDefault ? nodeDefault.toLowerCase() : 'open';
      });
      const configState = configStates[0] || 'open';
      // Use AI decision speedLimit as the initial final decision
      const aiSpeedLimit = incident.decision?.speedLimit || incident?.node?.defaultSpeedLimit || 40;
      setSpeedLimit(aiSpeedLimit);
      setLaneConfiguration(configStates);
      setSelected(incident.decision?.actions || []);
      setDecisionType('CONFIRMED');
      override.reset(aiSpeedLimit, configStates);
    }
  }, [incident, initialLaneCount]);

  const handleConfirm = async () => {
    try {
      const hasModifications = 
        speedLimit !== initialSpeedLimit || 
        JSON.stringify(laneConfiguration) !== JSON.stringify(initialLaneConfig) ||
        JSON.stringify(selected) !== JSON.stringify(initialActions);

      const finalDecisionType = hasModifications ? 'MODIFIED' : 'CONFIRMED';

      const blockedLanes = laneConfiguration
        .map((state, idx) => (state === 'blocked' ? idx + 1 : null))
        .filter(Boolean);

      // Ensure laneConfiguration is a proper array
      const finalLaneConfiguration = Array.isArray(laneConfiguration) ? laneConfiguration : [];

      // Ensure accidentPolygon includes baseWidth/baseHeight
      let accidentPolygon = incident?.accidentPolygon;
      if (accidentPolygon) {
        // Try to get image resolution from mediaList
        const image = incident?.mediaList?.find(m => m.type === 'image');
        if (image && (!accidentPolygon.baseWidth || !accidentPolygon.baseHeight)) {
          // If image metadata is available, set baseWidth/baseHeight
          // Assume image object has width/height properties (if not, fallback to 640)
          accidentPolygon = {
            ...accidentPolygon,
            baseWidth: image.width || 640,
            baseHeight: image.height || 640
          };
        }
      }

      const response = {
        incidentId: incident?.incidentId || '',
        nodeId: incident?.nodeId,
        isAccident: true,
        status: finalDecisionType,
        actions: selected,
        speedLimit: Number(speedLimit),
        blockedLanes,
        laneStates: finalLaneConfiguration,
        laneConfiguration: finalLaneConfiguration.join(','),
        accidentPolygon,
        message: `Admin ${finalDecisionType.toLowerCase()} - ${selected.length} actions`,
        timestamp: new Date().toISOString(),
      };

      emitAdminAccidentResponse(response);
      onDecision?.(response);
    } catch (e) {
      console.error('Confirm error', e);
      showError(`Error: ${e.message}`);
    } finally {
      onClose?.();
    }
  };

  const handleCancel = async () => {
    try {
      const response = {
        incidentId: incident?.incidentId || '',
        nodeId: incident?.nodeId,
        isAccident: false,
        status: 'REJECTED',
        actions: [],
        message: 'Admin rejected incident',
        timestamp: new Date().toISOString(),
      };

      emitAdminAccidentResponse(response);
      onDecision?.(response);
    } catch (e) {
      console.error('Reject error', e);
      showError(`Error: ${e.message}`);
    } finally {
      onClose?.();
    }
  };

  const timeString = incident?.timestamp ? new Date(incident.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
  
  // Extract AI analysis data
  const aiData = incident?.ai || {};
  const decisionData = incident?.decision || {};
  const nodeData = incident?.node || {};
  
  // Get actual values from node or decision data
  const defaultSpeedLimit = nodeData.defaultSpeedLimit || decisionData.originalSpeedLimit || 80;
  const defaultLaneCount = nodeData.defaultLaneCount
    || nodeData.defaultLaneConfiguration?.length
    || (decisionData.laneConfiguration ? decisionData.laneConfiguration.split(',').length : initialLaneCount || 3);
  
  const laneNames = Array.from({ length: defaultLaneCount }, (_, index) => {
    const nodeName = nodeData.defaultLaneConfiguration?.[index]?.name;
    return nodeName || `Lane ${index + 1}`;
  });
  
  // Parse lane configuration (e.g., "open,blocked,right,left")
  const laneConfigStr = decisionData.laneConfiguration || '';
  const parsedDecisionConfig = laneConfigStr
    ? laneConfigStr.split(',').map(s => s.trim().toLowerCase())
    : [];
  const laneConfigStates = Array.from(
    { length: defaultLaneCount },
    (_, idx) => parsedDecisionConfig[idx] || 'open'
  );

  const originalLaneStates = Array.from({ length: defaultLaneCount }, (_, idx) => {
    const nodeDefault = nodeData.defaultLaneConfiguration?.[idx]?.state;
    return nodeDefault ? nodeDefault.toLowerCase() : 'open';
  });
  
  // Lane status configuration matching node maintainer design
  const statusConfig = {
    open:    { icon: faCircleCheck, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)',   label: 'Open' },
    blocked: { icon: faCircleXmark, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)',   label: 'Blocked' },
    right:   { icon: faArrowRight,  color: '#3b7cff', bg: 'rgba(59, 124, 255, 0.15)',  label: 'Right' },
    left:    { icon: faArrowLeft,   color: '#3b7cff', bg: 'rgba(59, 124, 255, 0.15)',  label: 'Left' },
  };

  return (
    <Modal bare open={open} onClose={onClose} size="2xl">
      <Card className="overflow-hidden flex flex-col max-h-[90vh]">
        <AccidentDialogHeader incident={incident} timeString={timeString} />

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-[20px] py-[16px] space-y-[16px] bg-safe-gray">
          
          {/* Top Row: Image + Override */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[16px]">
            <div>
              <AccidentMediaArea incident={incident} />
            </div>

            <OverridePanel
              overrideOpen={override.overrideOpen}
              setOverrideOpen={override.setOverrideOpen}
              defaultLaneCount={defaultLaneCount}
              laneNames={laneNames}
              tempLaneConfig={override.tempLaneConfig}
              setTempLaneConfig={override.setTempLaneConfig}
              laneConfigStates={laneConfigStates}
              statusConfig={statusConfig}
              tempSpeedLimit={override.tempSpeedLimit}
              setTempSpeedLimit={override.setTempSpeedLimit}
              defaultSpeedLimit={defaultSpeedLimit}
              handleSaveOverride={override.handleSaveOverride}
              handleCancelOverride={override.handleCancelOverride}
            />
          </div>

          {/* AI Analysis */}
          <AiAnalysisCard aiData={aiData} />
          
          {/* Decision Comparison */}
          <DecisionCard
            originalSpeedLimit={defaultSpeedLimit}
            newSpeedLimit={decisionData.speedLimit || defaultSpeedLimit}
            originalLaneStates={originalLaneStates}
            newLaneStates={laneConfigStates}
            laneNames={laneNames}
            statusConfig={statusConfig}
            finalSpeedLimit={speedLimit}
            finalLaneStates={laneConfiguration}
          />
        </div>

        {/* Footer */}
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-bold text-[13px] border-safe-border hover:bg-safe-gray-light/50"
          >
            <FontAwesomeIcon icon="ban" className="w-3.5 h-3.5" />
            Reject
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-bold text-[13px] bg-green-600 hover:bg-green-700"
          >
            <FontAwesomeIcon icon="check" className="w-3.5 h-3.5" />
            Confirm & Send
          </Button>
        </Modal.Footer>
      </Card>
    </Modal>
  );
}

export default AccidentDialog;
