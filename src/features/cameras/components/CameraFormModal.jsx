import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCamera, updateCamera } from '../cameraSlice';
import { fetchNodes } from '@/features/nodeMaintainer/nodesSlice';
import Modal from '@/components/ui/Modal';
import { showSuccess } from '@/utils/toast';

const EMPTY_FORM = { name: '', rtspUrl: '', location: '', nodeId: '' };

export default function CameraFormModal({ isOpen, onClose, mode, camera, defaultNodeId }) {
  const dispatch = useDispatch();
  const { submitting } = useSelector((s) => s.cameras);
  const nodes = useSelector((s) => s.nodes.nodes);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);

  // Populate / reset the form whenever the modal opens or the target changes
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (mode === 'edit' && camera) {
      setFormData({
        name:     camera.name     || '',
        rtspUrl:  '',
        location: camera.location || '',
        nodeId:   camera.nodeId   || '',
      });
    } else {
      setFormData({ ...EMPTY_FORM, nodeId: defaultNodeId || '' });
    }
  }, [isOpen, mode, camera, defaultNodeId]);

  // Load nodes for the dropdown if they haven't been fetched yet
  useEffect(() => {
    if (isOpen && nodes.length === 0) dispatch(fetchNodes());
  }, [isOpen, nodes.length, dispatch]);

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'create') {
        const payload = { ...formData };
        if (!payload.nodeId) delete payload.nodeId;
        await dispatch(createCamera(payload)).unwrap();
        showSuccess(`Camera "${formData.name}" added`);
      } else {
        const payload = { ...formData };
        if (!payload.rtspUrl) delete payload.rtspUrl;   // keep existing URL if blank
        if (!payload.nodeId) delete payload.nodeId;
        await dispatch(updateCamera({ id: camera.id, data: payload })).unwrap();
        showSuccess(`Camera "${formData.name}" updated`);
      }
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to save camera');
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="sm">
      <Modal.Header title={mode === 'create' ? 'Add Camera' : 'Edit Camera'} onClose={onClose} />

      <form onSubmit={handleSubmit}>
        <Modal.Content className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-safe-text-muted mb-1">Name *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={set('name')}
              placeholder="Camera name"
              className="w-full bg-safe-dark border border-safe-gray-light rounded-lg px-3 py-2 text-sm text-safe-text-primary placeholder-safe-text-muted/40 focus:outline-none focus:border-safe-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-safe-text-muted mb-1">
              RTSP URL {mode === 'edit' && <span className="font-normal opacity-60">(leave blank to keep existing)</span>}
              {mode === 'create' && ' *'}
            </label>
            <input
              type="password"
              required={mode === 'create'}
              value={formData.rtspUrl}
              onChange={set('rtspUrl')}
              placeholder={mode === 'edit' ? '••••••••' : 'rtsp://192.168.1.x/stream'}
              className="w-full bg-safe-dark border border-safe-gray-light rounded-lg px-3 py-2 text-sm text-safe-text-primary placeholder-safe-text-muted/40 focus:outline-none focus:border-safe-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-safe-text-muted mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={set('location')}
              placeholder="e.g. Gate 3, Northbound lane"
              className="w-full bg-safe-dark border border-safe-gray-light rounded-lg px-3 py-2 text-sm text-safe-text-primary placeholder-safe-text-muted/40 focus:outline-none focus:border-safe-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-safe-text-muted mb-1">Node</label>
            <select
              value={formData.nodeId}
              onChange={set('nodeId')}
              className="w-full bg-safe-dark border border-safe-gray-light rounded-lg px-3 py-2 text-sm text-safe-text-primary focus:outline-none focus:border-safe-blue"
            >
              <option value="">Unassigned</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name || node.id}
                </option>
              ))}
            </select>
          </div>
        </Modal.Content>

        <Modal.Footer>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-safe-text-muted hover:text-safe-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium bg-safe-blue text-white rounded-lg hover:bg-safe-blue/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : mode === 'create' ? 'Add Camera' : 'Save Changes'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
