import { useState, useEffect, useCallback } from 'react';

/**
 * Track the projected screen position of a hovered node.
 * @param {React.RefObject} mapRef
 * @param {object|null} node
 * @returns {{x: number, y: number} | null}
 */
export default function useMapHoverPosition(mapRef, node) {
  const [hoverPosition, setHoverPosition] = useState(null);

  const updateHoverPosition = useCallback(() => {
    if (!node || !mapRef.current) return;
    const { latitude, longitude } = node.location || {};
    if (latitude == null || longitude == null) return;
    const map = mapRef.current.getMap();
    const point = map.project([longitude, latitude]);
    setHoverPosition({ x: point.x, y: point.y });
  }, [mapRef, node]);

  useEffect(() => {
    if (!node || !mapRef.current) {
      setHoverPosition(null);
      return;
    }

    const map = mapRef.current.getMap();
    const handleMove = () => updateHoverPosition();
    updateHoverPosition();
    map.on('move', handleMove);
    return () => map.off('move', handleMove);
  }, [mapRef, node, updateHoverPosition]);

  return hoverPosition;
}
