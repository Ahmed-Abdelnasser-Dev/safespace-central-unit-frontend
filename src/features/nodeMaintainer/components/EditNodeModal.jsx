import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LocationPicker from './wizard/LocationPicker.jsx';

const INPUT_CLS =
  'w-full px-3 py-2.5 border border-safe-gray-light rounded-lg text-sm text-safe-text-primary bg-safe-gray focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20 transition-all duration-200 disabled:opacity-60 placeholder:text-safe-text-muted/50';

const LABEL_CLS = 'block text-xs font-medium text-safe-text-muted mb-1.5 tracking-wide';

function SectionHeader({ icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded bg-safe-blue/10 flex items-center justify-center flex-shrink-0">
        <FontAwesomeIcon icon={icon} className="text-safe-blue text-xs" />
      </div>
      <p className="text-sm font-semibold text-safe-text-primary">{children}</p>
    </div>
  );
}

function EditNodeModal({ isOpen, onClose, onSave, node, isLoading = false, error = null }) {
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    address: '',
    latitude: '',
    longitude: '',
    videoFeedUrl: '',
  });

  useEffect(() => {
    if (node && isOpen) {
      const location = node.location || {};
      setFormData({
        name: node.name || '',
        ipAddress: node.ipAddress || '',
        address: location.address || node.streetName || '',
        latitude: typeof node.latitude === 'number' ? node.latitude : (location.latitude ?? ''),
        longitude: typeof node.longitude === 'number' ? node.longitude : (location.longitude ?? ''),
        videoFeedUrl: node.videoFeedUrl || '',
      });
    }
  }, [node, isOpen]);

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const setCoords = (lat, lng) =>
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      ipAddress: formData.ipAddress,
      videoFeedUrl: formData.videoFeedUrl,
      streetName: formData.address,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      location: {
        address: formData.address,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
      },
    });
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-safe-gray border border-safe-gray-light rounded-2xl w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-safe-gray-light">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-safe-blue/10 flex items-center justify-center">
              <FontAwesomeIcon icon="pen" className="text-safe-blue text-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold text-safe-text-primary">Edit Node</h2>
              {node && (
                <p className="text-xs text-safe-text-muted mt-0.5">{node.id}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon="xmark" className="text-base" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-5 flex items-start gap-3 p-3 bg-safe-danger/10 border border-safe-danger/20 rounded-lg">
            <FontAwesomeIcon icon="circle-exclamation" className="text-safe-danger mt-0.5 flex-shrink-0" />
            <p className="text-sm text-safe-danger">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Identity */}
          <div>
            <SectionHeader icon="id-badge">Identity</SectionHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={LABEL_CLS}>Node Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={set('name')}
                  disabled={isLoading}
                  placeholder="e.g., Highway-North-01"
                  className={INPUT_CLS}
                />
              </div>
              <div className="col-span-2">
                <label className={LABEL_CLS}>Location Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={set('address')}
                  disabled={isLoading}
                  placeholder="e.g., Ring Road — KM 42"
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <SectionHeader icon="location-dot">Coordinates</SectionHeader>
            <div className="mb-3 rounded-lg overflow-hidden border border-safe-gray-light">
              <LocationPicker
                lat={parseFloat(formData.latitude) || null}
                lng={parseFloat(formData.longitude) || null}
                onChange={setCoords}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Latitude</label>
                <input
                  type="number"
                  value={formData.latitude}
                  onChange={set('latitude')}
                  disabled={isLoading}
                  step="0.000001"
                  min="-90"
                  max="90"
                  placeholder="30.0131"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Longitude</label>
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={set('longitude')}
                  disabled={isLoading}
                  step="0.000001"
                  min="-180"
                  max="180"
                  placeholder="32.5498"
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </div>

          {/* Network */}
          <div>
            <SectionHeader icon="wifi">Network</SectionHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>IP Address</label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={set('ipAddress')}
                  disabled={isLoading}
                  placeholder="192.168.1.100"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Video Feed URL</label>
                <input
                  type="url"
                  value={formData.videoFeedUrl}
                  onChange={set('videoFeedUrl')}
                  disabled={isLoading}
                  placeholder="http://192.168.1.100:8080/mjpeg"
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-safe-gray-light bg-safe-sidebar/50 rounded-b-2xl">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={isLoading ? null : 'floppy-disk'}
            onClick={handleSubmit}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default EditNodeModal;
