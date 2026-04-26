import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook encapsulating polygon editor canvas interaction logic:
 * drawing, editing, undo/redo, and point management.
 */
export default function usePolygonEditor(initialPoints = []) {
  const [points, setPoints] = useState(initialPoints);
  const [toolMode, setToolMode] = useState('draw');
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragStartPointsRef = useRef(null);

  const pushUndo = useCallback((pts) => {
    setUndoStack((prev) => [...prev, pts]);
    setRedoStack([]);
  }, []);

  const getCanvasCoords = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const findNearestPoint = (x, y, radius = 10) => {
    let nearestIndex = null;
    let nearestDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist <= radius && dist < nearestDist) {
        nearestIndex = idx;
        nearestDist = dist;
      }
    });
    return nearestIndex;
  };

  const handleCanvasClick = (e) => {
    if (toolMode !== 'draw') return;
    const { x, y } = getCanvasCoords(e, e.currentTarget);
    pushUndo(points);
    setPoints([...points, { x, y }]);
  };

  const handleMouseDown = (e) => {
    if (toolMode !== 'edit') return;
    const { x, y } = getCanvasCoords(e, e.currentTarget);
    const idx = findNearestPoint(x, y);
    if (idx === null) return;
    setSelectedPointIndex(idx);
    setIsDragging(true);
    dragStartPointsRef.current = points;
    dragOffsetRef.current = { x: points[idx].x - x, y: points[idx].y - y };
  };

  const handleMouseMove = (e) => {
    if (toolMode !== 'edit' || !isDragging || selectedPointIndex === null) return;
    const canvas = e.currentTarget;
    const { x, y } = getCanvasCoords(e, canvas);
    const nextPoints = [...points];
    nextPoints[selectedPointIndex] = {
      x: Math.max(0, Math.min(canvas.width, x + dragOffsetRef.current.x)),
      y: Math.max(0, Math.min(canvas.height, y + dragOffsetRef.current.y)),
    };
    setPoints(nextPoints);
  };

  const handleMouseUp = () => {
    if (toolMode !== 'edit') return;
    setIsDragging(false);
    if (dragStartPointsRef.current) {
      const startPoints = dragStartPointsRef.current;
      const changed = startPoints.some((p, idx) => p.x !== points[idx]?.x || p.y !== points[idx]?.y);
      if (changed) pushUndo(startPoints);
    }
    dragStartPointsRef.current = null;
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack((prev) => [...prev, points]);
    setPoints(previous);
    setSelectedPointIndex(null);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack((prev) => [...prev, points]);
    setPoints(next);
    setSelectedPointIndex(null);
  };

  const handleClear = () => {
    if (points.length === 0) return;
    pushUndo(points);
    setPoints([]);
    setSelectedPointIndex(null);
  };

  const handleDeletePoint = () => {
    if (selectedPointIndex === null) return;
    pushUndo(points);
    setPoints(points.filter((_, idx) => idx !== selectedPointIndex));
    setSelectedPointIndex(null);
  };

  const drawPolygon = (ctx) => {
    if (points.length === 0) return;
    ctx.strokeStyle = 'rgb(59, 130, 246)';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    if (points.length > 2) { ctx.closePath(); ctx.fill(); }
    ctx.stroke();

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    points.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = idx === selectedPointIndex ? 'rgb(16, 185, 129)' : 'rgb(59, 130, 246)';
      ctx.fill();
      ctx.stroke();
    });
  };

  return {
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
  };
}
