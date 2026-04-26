/**
 * useNodeVideoFeed Hook
 * 
 * WebSocket hook for receiving real-time video frames and snapshots from detection nodes.
 * Manages connection to /ws/nodes endpoint with dashboard client type.
 * 
 * @module hooks/useNodeVideoFeed
 */

import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedNodeId } from '../features/nodeMaintainer/nodesSlice';
import { NODE_VIDEO_WS_URL } from '../lib/apiConfig';

const buildNodeVideoUrl = (baseUrl) => {
  const url = new URL(baseUrl);
  if (!url.pathname.includes('/ws/nodes')) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/ws/nodes`;
  }
  url.searchParams.set('client', 'dashboard');
  return url.toString();
};

/**
 * Hook for managing node video feed via WebSocket
 * 
 * @returns {Object} { currentFrame, isConnected, lastSnapshot }
 */
export function useNodeVideoFeed() {
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const connect = () => {
      try {
        const ws = new WebSocket(buildNodeVideoUrl(NODE_VIDEO_WS_URL));
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);

          // Subscribe to specific node updates if one is selected
          if (selectedNodeId) {
            ws.send(JSON.stringify({
              type: 'dashboard_subscribe',
              nodeIds: [selectedNodeId],
            }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update subscription when selected node changes
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && selectedNodeId) {
      wsRef.current.send(JSON.stringify({
        type: 'dashboard_subscribe',
        nodeIds: [selectedNodeId],
      }));
    }
  }, [selectedNodeId]);

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = (message) => {
    const { type, nodeId } = message;

    // Only process messages for the currently selected node
    if (selectedNodeId && nodeId !== selectedNodeId) {
      return;
    }

    switch (type) {
      case 'video_frame':
        // Update current frame (base64 encoded JPEG)
        setCurrentFrame({
          frameData: message.frameData,
          timestamp: message.timestamp,
          frameId: message.frameId,
          nodeId: message.nodeId,
        });
        break;

      case 'node_snapshot':
        // Snapshot from incident detection
        setLastSnapshot({
          snapshotPath: message.snapshotPath,
          filename: message.filename,
          incidentType: message.incidentType,
          confidence: message.confidence,
          timestamp: message.timestamp,
          incidentId: message.incidentId,
          nodeId: message.nodeId,
        });
        break;

      case 'subscribed':
        break;

      default:
        // Ignore other message types
        break;
    }
  };

  return {
    currentFrame,      // { frameData, timestamp, frameId, nodeId }
    lastSnapshot,      // { snapshotPath, filename, incidentType, confidence, timestamp }
    isConnected,       // boolean
  };
}
