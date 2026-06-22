import { useDispatch, useSelector } from 'react-redux';
import { deleteCamera } from '../cameraSlice';
import Modal from '@/components/ui/Modal';
import { showSuccess, showError } from '@/utils/toast';

export default function DeleteCameraModal({ isOpen, onClose, camera }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector(state => state.cameras);

  const handleDelete = async () => {
    if (!camera) return;
    try {
      await dispatch(deleteCamera(camera.id)).unwrap();
      showSuccess(`Camera ${camera.name} removed`);
      onClose();
    } catch (err) {
      showError(err || 'Failed to delete camera');
    }
  };

  if (!isOpen || !camera) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Camera">
      <div className="space-y-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <p className="text-safe-text-primary">
          Are you sure you want to delete <span className="font-semibold text-safe-text-primary">{camera.name}</span>?
        </p>
        <p className="text-red-400 text-sm">
          Warning: The live stream will be terminated immediately.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-safe-text-muted hover:text-safe-text-primary">Cancel</button>
          <button onClick={handleDelete} disabled={submitting} className="px-4 py-2 bg-red-600 text-safe-text-primary rounded hover:bg-red-700 disabled:opacity-50">
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
