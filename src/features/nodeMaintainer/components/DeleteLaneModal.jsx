import Modal from '@/components/ui/Modal.jsx';
import Card from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
export default function DeleteLaneModal({ lane, onClose, onConfirm }) {
  return (
    <Modal open={!!lane} onClose={onClose} size="md">
      <Card className="bg-safe-gray border border-safe-gray-light rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-safe-gray-light">
          <h3 className="text-xl font-bold text-safe-text-primary">Delete Lane</h3>
          <p className="text-sm text-safe-text-muted mt-2">This action cannot be undone.</p>
        </div>

        <div className="px-8 py-6">
          <p className="text-sm text-safe-text-primary">
            Are you sure you want to delete <strong>{lane?.name}</strong>?
          </p>
        </div>

        <Modal.Footer>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </Modal.Footer>
      </Card>
    </Modal>
  );
}
