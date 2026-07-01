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
  const retryDelayRef = useRef(3000);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    retryDelayRef.current = 3000;

    const connect = () => {
      if (!isMountedRef.current) return;
      try {
        const ws = new WebSocket(buildNodeVideoUrl(NODE_VIDEO_WS_URL));
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMountedRef.current) return;
          retryDelayRef.current = 3000;
          setIsConnected(true);

          if (selectedNodeId) {
            ws.send(JSON.stringify({
              type: 'dashboard_subscribe',
              nodeIds: [selectedNodeId],
            }));
          }
        };

        ws.onmessage = (event) => {
          if (!isMountedRef.current) return;
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = () => {
          if (isMountedRef.current) setIsConnected(false);
        };

        ws.onclose = () => {
          if (!isMountedRef.current) return;
          setIsConnected(false);
          // Exponential backoff: 3s → 6s → 12s → … capped at 30s
          const delay = retryDelayRef.current;
          retryDelayRef.current = Math.min(delay * 2, 30000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    connect();

    return () => {
      isMountedRef.current = false;
      clearTimeout(reconnectTimeoutRef.current);
      const ws = wsRef.current;
      if (ws) {
        // Avoid "closed before established" browser warning
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws.close();
        } else {
          ws.close();
        }
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
