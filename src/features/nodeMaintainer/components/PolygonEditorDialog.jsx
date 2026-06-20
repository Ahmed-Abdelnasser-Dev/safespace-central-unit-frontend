/**
 * Polygon Editor Dialog
 * 
 * Modal dialog for drawing lane polygons on camera feed
 * 
 * @component
 */

import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { API_BASE_URL } from '@/lib/apiConfig';
import { updateNodePolygons } from '../nodesSlice';
import { useNodeVideoFeed } from '@/hooks/useNodeVideoFeed';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import { showError } from '@/utils/toast';
import PolygonToolbar from './PolygonToolbar.jsx';
import usePolygonEditor from './usePolygonEditor.js';

function PolygonEditorDialog({ node, polygon, onClose }) {
  const dispatch = useDispatch();
  const canvasRef = useRef();
  const { currentFrame, lastSnapshot } = useNodeVideoFeed();

  const normalizePoints = (pts) => (pts || []).map((p) => {
    if (typeof p?.x === 'number' && typeof p?.y === 'number') return p;
    if (Array.isArray(p) && p.length >= 2) return { x: p[0], y: p[1] };
    return null;
  }).filter(Boolean);

  const [polygonName, setPolygonName] = useState(polygon?.name || 'Lane Polygon');

  const {
    points, toolMode, setToolMode, selectedPointIndex, setSelectedPointIndex,
    undoStack, redoStack, drawPolygon,
    handleCanvasClick, handleMouseDown, handleMouseMove, handleMouseUp,
    handleUndo, handleRedo, handleClear, handleDeletePoint,
  } = usePolygonEditor(normalizePoints(polygon?.points));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    const baseUrl = API_BASE_URL;

    if (currentFrame?.frameData) {
      img.src = `data:image/jpeg;base64,${currentFrame.frameData}`;
    } else if (lastSnapshot?.snapshotPath) {
      img.src = `${baseUrl}${lastSnapshot.snapshotPath}`;
    } else {
      img.src = 'https://images.unsplash.com/photo-1489496900549-f21edf41dd20?w=640&h=640&fit=crop';
    }

    img.onload = () => {
      canvas.width = 640;
      canvas.height = 640;
      ctx.drawImage(img, 0, 0, 640, 640);
      drawPolygon(ctx);
    };

    img.onerror = () => {
      canvas.width = 640;
      canvas.height = 640;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 640, 640);
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Click to draw polygon points', 320, 320);
      drawPolygon(ctx);
    };
  }, [points, currentFrame, lastSnapshot, drawPolygon]);

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

    const updatedPolygons = polygon?.id
      ? node.lanePolygons.map((p) => (p.id === polygon.id ? newPolygon : p))
      : [...(node.lanePolygons || []), newPolygon];

    dispatch(updateNodePolygons({ nodeId: node.id, lanePolygons: updatedPolygons }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-safe-gray border border-safe-gray-light rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-safe-gray-light">
          <h2 className="text-lg font-semibold text-safe-text-primary">
            Polygon Editor - {node.id}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-safe-gray-light rounded-lg transition-colors">
            <FontAwesomeIcon icon="xmark" className="text-lg text-safe-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-safe-text-primary mb-1 block">Polygon Name</label>
            <input
              type="text"
              value={polygonName}
              onChange={(e) => setPolygonName(e.target.value)}
              className="w-full px-3 py-2 bg-safe-gray border border-safe-gray-light text-safe-text-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-safe-blue/20"
            />
          </div>

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
                <FontAwesomeIcon icon={toolMode === 'edit' ? 'location-dot' : 'pen'} className="text-safe-blue text-sm" />
                <label className="text-sm font-medium text-safe-text-primary">
                  {toolMode === 'edit' ? 'Drag points to move them' : `Click to draw polygon points (${points.length})`}
                </label>
              </div>
              <div
                className="relative w-full max-w-[640px] mx-auto border-2 border-dashed border-safe-gray-light rounded-lg bg-black"
                style={{ aspectRatio: '1 / 1', minHeight: '320px', maxHeight: '640px' }}
              >
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={640}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`absolute inset-0 w-full h-full rounded-lg ${toolMode === 'edit' ? 'cursor-move' : 'cursor-crosshair'}`}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-safe-blue/10 border border-safe-blue/20 rounded-lg text-sm text-safe-blue">
            <p className="font-medium mb-1">How to draw:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Click on the image to add polygon points</li>
              <li>Switch to Move Points to reposition points</li>
              <li>Minimum 3 points required to create a polygon</li>
              <li>Use Undo to remove the last point</li>
              <li>Use Clear to start over</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-safe-gray-light bg-safe-gray">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={points.length < 3}>
            <FontAwesomeIcon icon="floppy-disk" className="mr-1" />
            Save Polygon
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PolygonEditorDialog;
