import { useEffect, useRef, useCallback } from 'react';

/**
 * Auto-center the map on a selected node or the first online node.
 * @param {React.RefObject} mapRef
 * @param {Array} nodes
 * @param {string | null} selectedNodeId
 */
export default function useMapAutoCenter(mapRef, nodes, selectedNodeId) {
  const lastFlyToNodeIdRef = useRef(null);

  const flyToNode = useCallback((node) => {
    if (!node?.location || !mapRef.current) return;
    const { latitude, longitude } = node.location;
    if (latitude == null || longitude == null) return;
    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      duration: 1000
    });
    lastFlyToNodeIdRef.current = node.id;
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef.current || nodes.length === 0) return;

    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    if (selectedNode?.id) {
      if (lastFlyToNodeIdRef.current !== selectedNode.id) {
        flyToNode(selectedNode);
      }
      return;
    }

    const fallbackNode =
      nodes.find((node) => node.status === 'online') ||
      nodes.find((node) => node.status !== 'online');
    if (fallbackNode && lastFlyToNodeIdRef.current !== fallbackNode.id) {
      flyToNode(fallbackNode);
    }
  }, [nodes, selectedNodeId, flyToNode, mapRef]);
}
