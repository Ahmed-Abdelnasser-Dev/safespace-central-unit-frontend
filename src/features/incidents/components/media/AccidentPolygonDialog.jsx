import { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import { computeFitCanvasSize, scalePolygonPoints } from '../../utils/polygonScaling.js';

/**
 * AccidentPolygonDialog - Styled dialog for viewing accident polygons
 * Matches Node Maintainer's PolygonEditorDialog UI (view-only)
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {object} props.accidentPolygon
 * @param {array} props.nodePolygons
 * @param {string} props.imageUrl
 */
function AccidentPolygonDialog({ open, onClose, accidentPolygon, nodePolygons = [], imageUrl }) {
  const canvasRef = useRef();
  // Aspect ratio of the canvas box, derived from the loaded image, so the
  // wrapper div (and its border) follows the real image shape instead of
  // being forced into a square.
  const [canvasRatio, setCanvasRatio] = useState(1);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      // Preserve the image's natural aspect ratio instead of stretching it
      // into a fixed 640x640 square.
      const { width, height } = computeFitCanvasSize(img.naturalWidth, img.naturalHeight);
      canvas.width = width;
      canvas.height = height;
      setCanvasRatio(width / height);
      ctx.drawImage(img, 0, 0, width, height);
      drawPolygons(ctx, width, height);
    };
    // eslint-disable-next-line
  }, [open, accidentPolygon, nodePolygons, imageUrl]);

  const drawPolygons = (ctx, baseWidth, baseHeight) => {
    // Draw node polygons
    (nodePolygons || []).forEach((polygon) => {
      const points = scalePolygonPoints(polygon, baseWidth, baseHeight);
      if (!points.length) return;
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(96, 165, 250, 0.08)';
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
    // Draw accident polygon
    const accidentPoints = scalePolygonPoints(accidentPolygon, baseWidth, baseHeight);
    if (accidentPoints.length) {
      ctx.beginPath();
      accidentPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-safe-border">
          <h2 className="text-lg font-semibold text-safe-text-dark">
            Accident Polygon Viewer
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-safe-bg rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon="xmark" className="text-lg text-safe-text-gray" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="relative w-full max-w-[640px] mx-auto border-2 border-dashed border-safe-border rounded-lg bg-black" style={{ aspectRatio: `${canvasRatio} / 1`, minHeight: '320px', maxHeight: '640px' }}>
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-lg" />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">Polygon Info:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Red: Detected accident area</li>
                <li>Blue: Node lane polygons</li>
                <li>Polygons are scaled to the image</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-safe-border bg-safe-bg">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AccidentPolygonDialog;
