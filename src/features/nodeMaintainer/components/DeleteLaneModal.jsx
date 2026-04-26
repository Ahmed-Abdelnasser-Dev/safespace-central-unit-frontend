import Modal from '@/components/ui/Modal.jsx';
import Card from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import { typography, fontFamily } from '../styles/typography';

export default function DeleteLaneModal({ lane, onClose, onConfirm }) {
  return (
    <Modal open={!!lane} onClose={onClose} size="md">
      <Card className="bg-white rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-[#e5e7eb]">
          <h3 className="text-[#101828] font-bold" style={{ ...typography.heading2, fontFamily }}>
            Delete Lane
          </h3>
          <p className="text-[#6a7282] mt-2" style={{ ...typography.bodySmall, fontFamily }}>
            This action cannot be undone.
          </p>
        </div>

        <div className="px-8 py-6">
          <p className="text-[#101828]" style={{ ...typography.body, fontFamily }}>
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
