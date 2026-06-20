import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '@/components/ui/Modal.jsx';
import Card from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';
import { typography, fontFamily } from '../styles/typography';

export default function AddLaneModal({ isOpen, onClose, onConfirm, laneStatusOptions, defaultName, defaultType }) {
  const [laneName, setLaneName] = useState(defaultName || '');
  const [laneType, setLaneType] = useState(defaultType || '');
  const [laneStatus, setLaneStatus] = useState('open');

  // Sync defaults when modal opens
  if (isOpen && laneName === '' && defaultName) {
    setLaneName(defaultName);
    setLaneType(defaultType || 'Custom Lane');
    setLaneStatus('open');
  }

  const handleConfirm = () => {
    onConfirm({
      name: laneName.trim(),
      type: laneType.trim(),
      status: laneStatus,
    });
    setLaneName('');
    setLaneType('');
    setLaneStatus('open');
  };

  const handleClose = () => {
    setLaneName('');
    setLaneType('');
    setLaneStatus('open');
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose} size="md">
      <Card className="bg-safe-gray border border-safe-gray-light rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-safe-gray-light">
          <h3 className="text-safe-text-primary font-bold" style={{ ...typography.heading2, fontFamily }}>
            Add New Lane
          </h3>
          <p className="text-safe-text-muted mt-2" style={{ ...typography.bodySmall, fontFamily }}>
            Define lane name, type, and status.
          </p>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div>
            <label className="text-safe-text-primary font-semibold block mb-2" style={{ ...typography.label, fontFamily }}>
              Lane Name
            </label>
            <Input value={laneName} onChange={(e) => setLaneName(e.target.value)} placeholder="Lane 4" />
          </div>

          <div>
            <label className="text-safe-text-primary font-semibold block mb-2" style={{ ...typography.label, fontFamily }}>
              Lane Type
            </label>
            <Input value={laneType} onChange={(e) => setLaneType(e.target.value)} placeholder="Custom Lane" />
          </div>

          <div>
            <label className="text-safe-text-primary font-semibold block mb-3" style={{ ...typography.label, fontFamily }}>
              Lane Status
            </label>
            <div className="flex flex-wrap gap-3">
              {laneStatusOptions.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setLaneStatus(status.value)}
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                    laneStatus === status.value
                      ? 'border-[#247cff] bg-[#247cff]/10 text-[#247cff]'
                      : 'border-safe-gray-light text-safe-text-muted hover:bg-safe-gray-light/50'
                  }`}
                  style={{ ...typography.bodySmall, fontFamily }}
                >
                  <FontAwesomeIcon icon={status.icon} style={{ width: '14px', height: '14px', color: status.color }} />
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Modal.Footer>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm}>Add Lane</Button>
        </Modal.Footer>
      </Card>
    </Modal>
  );
}
