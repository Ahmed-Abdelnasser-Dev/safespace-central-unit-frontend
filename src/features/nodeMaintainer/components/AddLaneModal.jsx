import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '@/components/ui/Modal.jsx';
import Card from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';
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
    <Modal bare open={isOpen} onClose={handleClose} size="md">
      <Card className="bg-safe-gray border border-safe-gray-light rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-safe-gray-light">
          <h3 className="text-xl font-bold text-safe-text-primary">Add New Lane</h3>
          <p className="text-sm text-safe-text-muted mt-2">Define lane name, type, and status.</p>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div>
            <label className="text-xs font-semibold text-safe-text-primary block mb-2 tracking-wide uppercase">
              Lane Name
            </label>
            <Input value={laneName} onChange={(e) => setLaneName(e.target.value)} placeholder="Lane 4" />
          </div>

          <div>
            <label className="text-xs font-semibold text-safe-text-primary block mb-2 tracking-wide uppercase">
              Lane Type
            </label>
            <Input value={laneType} onChange={(e) => setLaneType(e.target.value)} placeholder="Custom Lane" />
          </div>

          <div>
            <label className="text-xs font-semibold text-safe-text-primary block mb-3 tracking-wide uppercase">
              Lane Status
            </label>
            <div className="flex flex-wrap gap-3">
              {laneStatusOptions.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setLaneStatus(status.value)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center gap-2 ${
                    laneStatus === status.value
                      ? 'border-safe-blue bg-safe-blue/10 text-safe-blue'
                      : 'border-safe-gray-light text-safe-text-muted hover:bg-safe-gray-light/50'
                  }`}
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
