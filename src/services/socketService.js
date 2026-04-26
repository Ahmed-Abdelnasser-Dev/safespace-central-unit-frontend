/**
 * Socket.IO Client Service
 * Manages real-time connection to backend for accident notifications
 */
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../lib/apiConfig';

let socket = null;

/**
 * Initialize Socket.IO connection
 */
export function initSocket() {
  if (!socket) {
    const accessToken = sessionStorage.getItem('accessToken');
    socket = io(SOCKET_URL, {
      auth: {
        token: accessToken
      },
      transports: ['polling'],
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on('connect_error', (err) => {
      console.error('🔴 Socket connection error:', err.message, err);
    });
  }
  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

/**
 * Listen for accident assignments
 * @param {Function} callback - handler for assigned accident data
 */
export function onIncidentAssigned(callback) {
  const s = getSocket();
  s.on('incident-assigned', callback);
}

/**
 * Remove accident assignment listener
 * @param {Function} callback
 */
export function offIncidentAssigned(callback) {
  const s = getSocket();
  s.off('incident-assigned', callback);
}

/**
 * Listen for accident detection events
 * @param {Function} callback - handler for accident data
 */
export function onAccidentDetected(callback) {
  const s = getSocket();
  s.on('accident-detected', callback);
}

/**
 * Remove accident detection listener
 * @param {Function} callback
 */
export function offAccidentDetected(callback) {
  const s = getSocket();
  s.off('accident-detected', callback);
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Emit admin accident response to backend (to node)
 * @param {object} response - The response object to send
 */
export function emitAdminAccidentResponse(response) {
  const s = getSocket();
  s.emit('admin_accident_response', response);
}

/**
 * Listen for node heartbeat events
 * @param {Function} callback - handler for heartbeat data
 */
export function onNodeHeartbeat(callback) {
  const s = getSocket();
  s.on('node_heartbeat', callback);
}

/**
 * Remove node heartbeat listener
 * @param {Function} callback
 */
export function offNodeHeartbeat(callback) {
  const s = getSocket();
  s.off('node_heartbeat', callback);
}

/**
 * Listen for node config update events
 * @param {Function} callback - handler for config update data
 */
export function onNodeConfigUpdate(callback) {
  const s = getSocket();
  s.on('node_config_update', callback);
}

/**
 * Remove node config update listener
 * @param {Function} callback
 */
export function offNodeConfigUpdate(callback) {
  const s = getSocket();
  s.off('node_config_update', callback);
}
