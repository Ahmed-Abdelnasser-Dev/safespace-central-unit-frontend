import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import SearchInput from '@/components/ui/SearchInput.jsx';

export default function NodeMaintainerHeader({ onAddNode }) {
  return (
    <div className="bg-safe-sidebar border-b border-safe-border px-6 py-3 flex items-center justify-end gap-3 flex-shrink-0">
      <SearchInput placeholder="Search nodes, locations..." width="280px" />
      <Button variant="primary" size="sm" icon="plus" onClick={onAddNode}>
        Add Node
      </Button>
      <button
        title="Refresh"
        className="w-9 h-9 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors"
      >
        <FontAwesomeIcon icon="arrows-rotate" className="text-sm" />
      </button>
    </div>
  );
}
