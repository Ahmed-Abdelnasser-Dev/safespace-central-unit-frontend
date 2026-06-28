import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCamera, updateCamera } from '../cameraSlice';
import Modal from '@/components/ui/Modal';
import { showSuccess, showError } from '@/utils/toast';

export default function CameraFormModal({ isOpen, onClose, mode, camera, defaultNodeId }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector(state => state.cameras);
  const nodes = useSelector(state => state.nodes?.nodes || []);
  
  const [formData, setFormData] = useState({
    name: '',
    rtspUrl: '',
    location: '',
    nodeId: ''
  });

  useEffect(() => {
    if (mode === 'edit' && camera) {
      setFormData({
        name: camera.name || '',
        rtspUrl: '', // Leave blank placeholder logic
        location: camera.location || '',
        nodeId: camera.nodeId || ''
      });
    } else {
      setFormData({ name: '', rtspUrl: '', location: '', nodeId: defaultNodeId || '' });
    }
  }, [mode, camera, isOpen, defaultNodeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await dispatch(createCamera(formData)).unwrap();
        showSuccess(`Camera ${formData.name} added successfully`);
      } else {
        const updateData = { ...formData };
        if (!updateData.rtspUrl) delete updateData.rtspUrl;
        await dispatch(updateCamera({ id: camera.id, data: updateData })).unwrap();
        showSuccess(`Camera ${formData.name} updated`);
      }
      onClose();
    } catch (err) {
      showError(typeof err === 'string' ? err : 'Failed to save camera');
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <div className="bg-safe-gray border border-safe-gray-light rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-safe-gray-light">
          <h3 className="text-safe-text-primary font-bold text-lg">
            {mode === 'create' ? 'Add Camera' : 'Edit Camera'}
          </h3>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div>
              <label className="block text-sm text-safe-text-muted mb-1">Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-safe-dark border border-safe-gray-light rounded p-2 text-safe-text-primary" />
            </div>
            <div>
              <label className="block text-sm text-safe-text-muted mb-1">RTSP URL</label>
              <input type="password" required={mode === 'create'} placeholder={mode === 'edit' ? 'Leave blank to keep existing URL' : ''} value={formData.rtspUrl} onChange={e => setFormData({...formData, rtspUrl: e.target.value})} className="w-full bg-safe-dark border border-safe-gray-light rounded p-2 text-safe-text-primary" />
            </div>
            <div>
              <label className="block text-sm text-safe-text-muted mb-1">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-safe-dark border border-safe-gray-light rounded p-2 text-safe-text-primary" />
            </div>
            <div>
              <label className="block text-sm text-safe-text-muted mb-1">Node (Association)</label>
              <select value={formData.nodeId} onChange={e => setFormData({...formData, nodeId: e.target.value})} className="w-full bg-safe-dark border border-safe-gray-light rounded p-2 text-safe-text-primary">
                <option value="">Unassigned</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.name || `Node ${node.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-safe-text-muted hover:text-safe-text-primary">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-safe-blue text-safe-text-primary rounded hover:bg-blue-600 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
