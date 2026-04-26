/**
 * Centralized API configuration
 *
 * Single source of truth for API base URLs across the frontend.
 * Uses VITE_API_URL from environment, falling back to localhost for development.
 *
 * @module lib/apiConfig
 */

const toWebSocketUrl = (value) =>
	value.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:');

const normalizeApiUrl = (value) => {
	const trimmed = value.replace(/\/+$/, '');
	return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Full API URL including /api path, e.g. "http://localhost:5000/api" */
export const API_URL = normalizeApiUrl(rawApiUrl);

/** Server root without /api suffix, e.g. "http://localhost:5000" */
export const API_BASE_URL = API_URL.replace(/\/api$/, '');

/** Socket.IO origin, e.g. "http://localhost:5000" */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

/** Raw websocket base for node video feed, e.g. "ws://localhost:5000" */
export const NODE_VIDEO_WS_URL =
	import.meta.env.VITE_NODE_VIDEO_WS_URL ||
	import.meta.env.VITE_WS_URL ||
	toWebSocketUrl(API_BASE_URL);
