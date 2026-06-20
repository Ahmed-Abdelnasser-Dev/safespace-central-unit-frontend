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
    socket = io(SOCKET_URL, {
      withCredentials: true,
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

// ── Emergency Dispatcher realtime events ──────────────────────────────────────
// All events arrive on the `dispatcher:global` room (joined automatically on
// connection when the authenticated user has the emergency_dispatcher role).
// `dispatcher:assigned` additionally arrives on `dispatcher:{userId}`.

/**
 * A new case entered the dispatcher queue (Road Observer approved SOS/incident).
 * Payload: partial Case object (no PII — fetch full case via getCase for PII).
 * @param {Function} callback
 */
export function onCaseNew(callback) {
  getSocket().on('case:new', callback);
}
export function offCaseNew(callback) {
  getSocket().off('case:new', callback);
}

/**
 * A case was modified (status change, new note, dispatcher assigned, units dispatched…).
 * Payload: partial Case — always includes `id`, `status`, and any changed fields.
 * @param {Function} callback
 */
export function onCaseUpdated(callback) {
  getSocket().on('case:updated', callback);
}
export function offCaseUpdated(callback) {
  getSocket().off('case:updated', callback);
}

/**
 * A field unit's GPS position was updated.
 * Payload: { unitId, latitude, longitude, lastLocationAt }
 * @param {Function} callback
 */
export function onUnitLocation(callback) {
  getSocket().on('unit:location', callback);
}
export function offUnitLocation(callback) {
  getSocket().off('unit:location', callback);
}

/**
 * A field unit's operational status changed.
 * Payload: { unitId, status }
 * @param {Function} callback
 */
export function onUnitStatus(callback) {
  getSocket().on('unit:status', callback);
}
export function offUnitStatus(callback) {
  getSocket().off('unit:status', callback);
}

/**
 * An assignment's status changed.
 * Payload: full Assignment object { id, caseId, unitId, status, dispatchedAt, assignedBy }
 * @param {Function} callback
 */
export function onAssignmentUpdated(callback) {
  getSocket().on('assignment:updated', callback);
}
export function offAssignmentUpdated(callback) {
  getSocket().off('assignment:updated', callback);
}

/**
 * A case was routed to this specific dispatcher (personal room event).
 * Payload: { caseId }
 * @param {Function} callback
 */
export function onDispatcherAssigned(callback) {
  getSocket().on('dispatcher:assigned', callback);
}
export function offDispatcherAssigned(callback) {
  getSocket().off('dispatcher:assigned', callback);
}
