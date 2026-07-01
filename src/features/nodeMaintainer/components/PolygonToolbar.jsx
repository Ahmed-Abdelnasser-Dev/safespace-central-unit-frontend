import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';

export default function PolygonToolbar({
  toolMode,
  setToolMode,
  selectedPointIndex,
  setSelectedPointIndex,
  undoCount,
  redoCount,
  pointsCount,
  onUndo,
  onRedo,
  onClear,
  onDeletePoint,
}) {
  return (
    <div className="w-full lg:w-[64px] bg-safe-gray border border-safe-gray-light rounded-lg p-2 flex flex-col gap-2 items-center">
      <Button
        variant={toolMode === 'draw' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => { setToolMode('draw'); setSelectedPointIndex(null); }}
        title="Add point"
        aria-label="Add point"
      >
        <FontAwesomeIcon icon="plus" />
      </Button>
      <Button
        variant={toolMode === 'edit' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setToolMode('edit')}
        title="Move points"
        aria-label="Move points"
      >
        <FontAwesomeIcon icon="arrows-up-down-left-right" />
      </Button>
      <div className="w-full h-px bg-safe-gray-light" />
      <Button variant="ghost" size="sm" onClick={onUndo} disabled={undoCount === 0} title="Undo" aria-label="Undo">
        <FontAwesomeIcon icon="rotate-left" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onRedo} disabled={redoCount === 0} title="Redo" aria-label="Redo">
        <FontAwesomeIcon icon="rotate-right" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear} disabled={pointsCount === 0} title="Clear points" aria-label="Clear points">
        <FontAwesomeIcon icon="broom" />
      </Button>
      <div className="w-full h-px bg-safe-gray-light" />
      <Button variant="ghost" size="sm" onClick={onDeletePoint} disabled={selectedPointIndex === null} title="Delete selected point" aria-label="Delete selected point">
        <FontAwesomeIcon icon="trash" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setSelectedPointIndex(null)} title="Clear selection" aria-label="Clear selection">
        <FontAwesomeIcon icon="circle-xmark" />
      </Button>
    </div>
  );
}
