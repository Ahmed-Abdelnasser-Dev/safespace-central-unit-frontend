import axios from 'axios';

const isDev = import.meta.env.DEV;
const STREAM_HTTP_URL = isDev
  ? '/stream-service'
  : (import.meta.env.VITE_NODE_VIDEO_WS_URL
      ? import.meta.env.VITE_NODE_VIDEO_WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')
      : '/stream-service');

const api = axios.create({
  baseURL: STREAM_HTTP_URL,
  withCredentials: true,
});

// Typed error so callers can distinguish "service unavailable" from other errors
export class StreamServiceUnavailableError extends Error {
  constructor(cause) {
    super('Camera stream service is unavailable');
    this.name = 'StreamServiceUnavailableError';
    this.cause = cause;
  }
}

const handleStreamError = (error) => {
  // Network error or 502/503/504 = service unavailable — don't throw unhandled
  if (!error.response || [502, 503, 504].includes(error.response?.status)) {
    throw new StreamServiceUnavailableError(error);
  }
  throw error;
};

export const streamApi = {
  getCameras: async () => {
    try {
      const response = await api.get('/cameras');
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
  getCameraById: async (id) => {
    try {
      const response = await api.get(`/cameras/${id}`);
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
  getCamera: async (id) => {
    try {
      const response = await api.get(`/cameras/${id}`);
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
  createCamera: async (data) => {
    try {
      const response = await api.post('/cameras', data);
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
  updateCamera: async (id, data) => {
    try {
      const response = await api.put(`/cameras/${id}`, data);
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
  deleteCamera: async (id) => {
    try {
      const response = await api.delete(`/cameras/${id}`);
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
  startCamera: async (id) => {
    try {
      const response = await api.post(`/cameras/${id}/start`);
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
  stopCamera: async (id) => {
    try {
      const response = await api.post(`/cameras/${id}/stop`);
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
  getHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) { handleStreamError(error); }
  },
};
