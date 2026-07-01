import { useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';

const INITIAL_STATE = {
  id: '',
  address: '',
  latitude: '',
  longitude: '',
  speedLimit: '',
  ipAddress: '',
};

export default function AddNodeModal({ isOpen, onClose, onSubmit, existingNodeIds }) {
  const [newNode, setNewNode] = useState(INITIAL_STATE);
  const [formError, setFormError] = useState('');

  const updateField = (field) => (event) => {
    setNewNode((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setNewNode(INITIAL_STATE);
    setFormError('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleCreate = () => {
    const trimmedId = newNode.id.trim();
    const trimmedAddress = newNode.address.trim();
    const lat = Number(newNode.latitude);
    const lon = Number(newNode.longitude);
    const speedLimit = Number(newNode.speedLimit) || 80;

    if (!trimmedId) { setFormError('Node ID is required.'); return; }
    if (existingNodeIds.some((id) => id.toLowerCase() === trimmedId.toLowerCase())) {
      setFormError('Node ID already exists.'); return;
    }
    if (!trimmedAddress) { setFormError('Location address is required.'); return; }
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setFormError('Latitude must be between -90 and 90.'); return;
    }
    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      setFormError('Longitude must be between -180 and 180.'); return;
    }

    onSubmit({
      nodeId: trimmedId,
      location: { latitude: lat, longitude: lon, address: trimmedAddress },
      nodeSpecs: {
        cameraResolution: '1920x1080',
        frameRate: 30,
        ipAddress: newNode.ipAddress.trim() || '192.168.1.200',
        bandwidth: '100 Mbps',
        detectionSensitivity: 70,
        minObjectSize: 50,
      },
      firmwareVersion: '1.0.0',
      modelVersion: 'yolov8n-2026.01',
    });
    resetForm();
  };

  return (
    <Modal bare open={isOpen} onClose={handleClose} size="md">
      <div className="bg-safe-gray border border-safe-gray-light rounded-2xl overflow-hidden">
        <div className="px-8 py-6">
          <h3 className="text-safe-text-primary font-bold text-xl">Add New Node</h3>
          <p className="text-safe-text-muted text-sm mt-1">Create a node and jump to configuration.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-safe-text-primary">Node ID</label>
              <Input value={newNode.id} onChange={updateField('id')} placeholder="NODE-006" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-safe-text-primary">IP Address</label>
              <Input value={newNode.ipAddress} onChange={updateField('ipAddress')} placeholder="192.168.1.200" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-safe-text-primary">Location Address</label>
              <Input value={newNode.address} onChange={updateField('address')} placeholder="Highway A1, Exit 23B" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-safe-text-primary">Latitude</label>
              <Input value={newNode.latitude} onChange={updateField('latitude')} placeholder="30.0131" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-safe-text-primary">Longitude</label>
              <Input value={newNode.longitude} onChange={updateField('longitude')} placeholder="32.5498" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-safe-text-primary">Speed Limit (km/h)</label>
              <Input value={newNode.speedLimit} onChange={updateField('speedLimit')} placeholder="80" />
            </div>
          </div>

          {formError && (
            <div className="mt-4 rounded-lg bg-safe-danger/10 border border-safe-danger/20 px-4 py-3 text-safe-danger text-sm">
              {formError}
            </div>
          )}
        </div>
        <Modal.Footer>
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleCreate}>Create and Configure</Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
}
