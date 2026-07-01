/**
 * Polygon Editor Dialog
 *
 * Modal dialog for drawing lane polygons on a camera feed.
 * Uses the system Modal component for consistent light/dark-mode styling.
 *
 * @component
 */

import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateNodePolygons } from '../nodesSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '@/components/ui/Modal.jsx';
import Button from '@/components/ui/Button.jsx';
import { showError } from '@/utils/toast';
import PolygonToolbar from './PolygonToolbar.jsx';
import usePolygonEditor from './usePolygonEditor.js';
import VideoFeedPlayer from './VideoFeedPlayer.jsx';

function PolygonEditorDialog({ node, polygon, onClose }) {
  const dispatch = useDispatch();
  const canvasRef = useRef();

  const normalizePoints = (pts) =>
    (pts || [])
      .map((p) => {
        if (typeof p?.x === 'number' && typeof p?.y === 'number') return p;
        if (Array.isArray(p) && p.length >= 2) return { x: p[0], y: p[1] };
        return null;
      })
      .filter(Boolean);

  const [polygonName, setPolygonName] = useState(polygon?.name || 'Lane Polygon');

  const {
    points,
    toolMode,
    setToolMode,
    selectedPointIndex,
    setSelectedPointIndex,
    undoStack,
    redoStack,
    drawPolygon,
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleUndo,
    handleRedo,
    handleClear,
    handleDeletePoint,
  } = usePolygonEditor(normalizePoints(polygon?.points));

  /* ── Canvas rendering ─────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    canvas.width = 640;
    canvas.height = 640;
    
    ctx.clearRect(0, 0, 640, 640);

    // Filter out the current polygon being edited
    const otherPolygons = (node.lanePolygons || []).filter(
      (p) => p.id !== polygon?.id && !p.isEmpty && p.points?.length >= 3
    );

    drawPolygon(ctx, otherPolygons);
  }, [points, drawPolygon, node.lanePolygons, polygon?.id]);

  /* ── Save ─────────────────────────────────────────────────────────── */
  const handleSave = () => {
    if (points.length < 3) {
      showError('Polygon must have at least 3 points');
      return;
    }

    const newPolygon = {
      id: polygon?.id || `poly-${Date.now()}`,
      name: polygonName,
      laneNumber: polygon?.laneNumber,
      type: 'lane',
      points,
      baseWidth: 640,
      baseHeight: 640,
      isEmpty: false,
    };

    const existingPolygons = node.lanePolygons || [];
    const existingIndex = existingPolygons.findIndex((p) => p.id === polygon?.id);
    const updatedPolygons =
      existingIndex >= 0
        ? existingPolygons.map((p, i) => (i === existingIndex ? newPolygon : p))
        : [...existingPolygons, newPolygon];

    dispatch(updateNodePolygons({ nodeId: node.id, lanePolygons: updatedPolygons }));
    onClose();
  };

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <Modal open={!!node} onClose={onClose} size="lg">
      <Modal.Header title={`Polygon Editor — ${node?.id}`} onClose={onClose} />

      <Modal.Content className="space-y-4">
        {/* Polygon name */}
        <div>
          <label className="block text-xs font-medium text-safe-text-muted mb-1">
            Polygon Name
          </label>
          <input
            type="text"
            value={polygonName}
            onChange={(e) => setPolygonName(e.target.value)}
            className="w-full px-3 py-2 bg-safe-gray border border-safe-gray-light text-safe-text-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-safe-blue/20 placeholder-safe-text-muted/40"
          />
        </div>

        {/* Editor area */}
        <div className="flex flex-col lg:flex-row gap-4">
          <PolygonToolbar
            toolMode={toolMode}
            setToolMode={setToolMode}
            selectedPointIndex={selectedPointIndex}
            setSelectedPointIndex={setSelectedPointIndex}
            undoCount={undoStack.length}
            redoCount={redoStack.length}
            pointsCount={points.length}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onDeletePoint={handleDeletePoint}
          />

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <FontAwesomeIcon
                icon={toolMode === 'edit' ? 'location-dot' : 'pen'}
                className="text-safe-blue text-sm"
              />
              <span className="text-sm font-medium text-safe-text-primary">
                {toolMode === 'edit'
                  ? 'Drag points to move them'
                  : `Click to draw polygon points (${points.length})`}
              </span>
            </div>

            {/* Canvas wrapper — aspect-ratio 1:1, video feed is always dark */}
            <div
              className="relative w-full max-w-[640px] mx-auto border-2 border-dashed border-safe-gray-light rounded-lg bg-black overflow-hidden"
              style={{ aspectRatio: '1 / 1', minHeight: '280px', maxHeight: '480px' }}
            >
              <div className="absolute inset-0 opacity-80 pointer-events-none">
                <VideoFeedPlayer
                  nodeId={node.id}
                  status={node.status}
                  stretch={true}
                />
              </div>
              <canvas
                ref={canvasRef}
                width={640}
                height={640}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`absolute inset-0 w-full h-full rounded-lg ${
                  toolMode === 'edit' ? 'cursor-move' : 'cursor-crosshair'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-safe-blue/10 border border-safe-blue/20 rounded-lg text-sm text-safe-blue">
          <p className="font-medium mb-1">How to draw:</p>
          <ul className="text-xs space-y-1 list-disc list-inside text-safe-blue/80">
            <li>Click on the image to add polygon points</li>
            <li>Switch to <strong>Move Points</strong> mode to reposition existing points</li>
            <li>A minimum of 3 points is required to save a polygon</li>
            <li>Use <strong>Undo</strong> to remove the last point added</li>
            <li>Use <strong>Clear</strong> to start over from scratch</li>
          </ul>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={points.length < 3}
        >
          <FontAwesomeIcon icon="floppy-disk" className="mr-1.5" />
          Save Polygon
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PolygonEditorDialog;
