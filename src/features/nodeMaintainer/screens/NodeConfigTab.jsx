/**
 * Node Configuration Tab Screen
 * 
 * Configure camera, network, and detection parameters
 * 
 * @component
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSelectedNode, updateNodeSpecs, updateNodeStatus, persistNodeSpecs, persistNodeStatus } from '../nodesSlice';
import SectionLabel from '../components/forms/SectionLabel';
import ConfigCard from '../components/cards/ConfigCard';
import FormField from '../components/forms/FormField';
import PrimaryButton from '../components/forms/PrimaryButton';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '@/components/ui/Button.jsx';

function NodeConfigTab() {
  const dispatch = useDispatch();
  const node = useSelector(selectSelectedNode);
  const [specs, setSpecs] = useState(node?.nodeSpecs || {});
  const [hasChanges, setHasChanges] = useState(false);

  if (!node) return <div>Select a node</div>;

  const handleInputChange = (key, value) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveConfig = () => {
    setHasChanges(false);
    // Optimistic update in Redux
    dispatch(updateNodeSpecs({ nodeId: node.id, specs }));
    // Then persist to API
    dispatch(persistNodeSpecs(node.id));
  };

  const handleToggleStatus = () => {
    const nextStatus = node.status === 'online' ? 'offline' : 'online';
    dispatch(updateNodeStatus({ nodeId: node.id, status: nextStatus }));
    dispatch(persistNodeStatus(node.id));
  };

  const configSections = [
    {
      title: 'Camera Settings',
      icon: 'camera',
      fields: [
        { label: 'Resolution', key: 'cameraResolution', type: 'text' },
        { label: 'Frame Rate (FPS)', key: 'frameRate', type: 'number', min: 1, max: 120 },
      ],
    },
    {
      title: 'Network Settings',
      icon: 'wifi',
      fields: [
        { label: 'IP Address', key: 'ipAddress', type: 'text' },
        { label: 'Bandwidth', key: 'bandwidth', type: 'text' },
      ],
    },
    {
      title: 'Detection Parameters',
      icon: 'crosshairs',
      fields: [
        { label: 'Sensitivity (%)', key: 'detectionSensitivity', type: 'number', min: 0, max: 100 },
        { label: 'Min Object Size (px)', key: 'minObjectSize', type: 'number', min: 10, max: 500 },
      ],
    },
  ];

  return (
    <div className="p-[20px] space-y-[20px]">
      <div className="space-y-[12px]">
        <SectionLabel text="Node Status" icon="power-off" />
        <ConfigCard>
          <div className="flex flex-wrap items-center justify-between gap-[12px]">
            <div className="flex items-center gap-[10px]">
              <span className="text-xs text-safe-text-muted">Current</span>
              <StatusBadge status={node.status} />
            </div>
            <Button
              variant={node.status === 'online' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleToggleStatus}
            >
              {node.status === 'online' ? 'Deactivate Node' : 'Activate Node'}
            </Button>
          </div>
        </ConfigCard>
      </div>

      {configSections.map(section => (
        <div key={section.title} className="space-y-[12px]">
          <SectionLabel text={section.title} icon={section.icon} />

          <ConfigCard>
            {section.fields.map(field => (
              <FormField
                key={field.key}
                label={field.label}
                value={specs[field.key] || (field.type === 'number' ? 0 : '')}
                onChange={(value) => handleInputChange(field.key, value)}
                type={field.type}
                min={field.min}
                max={field.max}
              />
            ))}
          </ConfigCard>
        </div>
      ))}

      {/* System Information (Read-only) */}
      <div className="space-y-[12px]">
        <SectionLabel text="System Information" icon="microchip" />
        <ConfigCard>
          <div className="space-y-[8px]">
            <div className="flex justify-between items-center py-[8px] border-b border-safe-gray-light">
              <span className="text-xs text-safe-text-muted">Firmware Version</span>
              <span className="text-sm font-medium text-safe-text-primary">{node.firmwareVersion || 'unknown'}</span>
            </div>
            <div className="flex justify-between items-center py-[8px] border-b border-safe-gray-light">
              <span className="text-xs text-safe-text-muted">AI Model Version</span>
              <span className="text-sm font-medium text-safe-text-primary">{node.modelVersion || 'unknown'}</span>
            </div>
            <div className="flex justify-between items-center py-[8px]">
              <span className="text-xs text-safe-text-muted">Uptime</span>
              <span className="text-sm font-medium text-safe-text-primary">
                {node.uptimeSec ? `${Math.floor(node.uptimeSec / 3600)}h ${Math.floor((node.uptimeSec % 3600) / 60)}m` : '0m'}
              </span>
            </div>
          </div>
        </ConfigCard>
      </div>

      {/* Save Button */}
      <PrimaryButton
        onClick={handleSaveConfig}
        disabled={!hasChanges}
        icon="floppy-disk"
        text="Save Configuration"
      />
    </div>
  );
}

export default NodeConfigTab;
