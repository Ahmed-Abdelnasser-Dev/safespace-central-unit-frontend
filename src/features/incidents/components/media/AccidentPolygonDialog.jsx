import { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import Modal from '@/components/ui/Modal.jsx';

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

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      // Always use 640x640 for canvas and polygons
      canvas.width = 640;
      canvas.height = 640;
      ctx.drawImage(img, 0, 0, 640, 640);
      drawPolygons(ctx, 640, 640);
    };
    // eslint-disable-next-line
  }, [open, accidentPolygon, nodePolygons, imageUrl]);

  const drawPolygons = (ctx, baseWidth, baseHeight) => {
    // Draw node polygons
    (nodePolygons || []).forEach((polygon) => {
      if (!polygon?.points?.length) return;
      ctx.beginPath();
      polygon.points.forEach((p, i) => {
        const x = (p.x / (polygon.baseWidth || baseWidth)) * baseWidth;
        const y = (p.y / (polygon.baseHeight || baseHeight)) * baseHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(96, 165, 250, 0.08)';
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
    // Draw accident polygon
    if (accidentPolygon?.points?.length) {
      ctx.beginPath();
      accidentPolygon.points.forEach((p, i) => {
        const x = (p.x / (accidentPolygon.baseWidth || baseWidth)) * baseWidth;
        const y = (p.y / (accidentPolygon.baseHeight || baseHeight)) * baseHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header title="Accident Polygon Viewer" onClose={onClose} />
      <Modal.Content className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-[640px] mx-auto border-2 border-dashed border-safe-gray-light rounded-lg bg-black" style={{ aspectRatio: '1 / 1', minHeight: '320px', maxHeight: '640px' }}>
            <canvas ref={canvasRef} width={640} height={640} className="absolute inset-0 w-full h-full rounded-lg" />
          </div>
          <div className="p-3 bg-safe-blue/10 rounded-lg text-sm text-safe-blue">
            <p className="font-medium mb-1">Polygon Info:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Red: Detected accident area</li>
              <li>Blue: Node lane polygons</li>
              <li>Polygons are scaled to the image</li>
            </ul>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AccidentPolygonDialog;
