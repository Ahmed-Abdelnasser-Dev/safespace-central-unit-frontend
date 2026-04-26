/**
 * Heartbeat Timeout Hook
 * 
 * Monitors all nodes and detects when heartbeats are stale (> 60 seconds).
 * Automatically marks nodes as offline and resets health metrics.
 * 
 * NOTE: This hook should be called at the root App level to persist across navigation.
 * 
 * @module hooks/useHeartbeatTimeout
 */

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllNodes, markNodeOffline } from '../features/nodeMaintainer/nodesSlice';

const HEARTBEAT_TIMEOUT_MS = 60000; // 60 seconds
const CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

/**
 * Detects stale heartbeats and marks nodes offline
 * 
 * Runs a timer that checks all nodes every 10 seconds.
 * If a node hasn't sent a heartbeat in 60+ seconds, it's marked offline.
 */
export function useHeartbeatTimeout() {
  const nodes = useSelector(selectAllNodes);
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up interval - use a dedicated function that reads from state closure
    let intervalId;
    
    const checkHeartbeats = () => {
      const now = Date.now();

      nodes.forEach((node) => {
        // Skip if already offline
        if (node.status === 'offline') return;

        // Skip if no heartbeat ever received
        if (!node.lastHeartbeat) return;

        const lastHeartbeatTime = new Date(node.lastHeartbeat).getTime();
        const timeSinceLastHeartbeat = now - lastHeartbeatTime;

        // If heartbeat is stale, mark offline
        if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
          dispatch(markNodeOffline({ nodeId: node.id }));
        }
      });
    };

    // Start interval to periodically check heartbeats
    intervalId = setInterval(checkHeartbeats, CHECK_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [nodes, dispatch]);
}
