import axios from 'axios';

// When running under Vite Dev Server, use the configured relative proxy endpoint to avoid CORS issues.
// In production, you would typically use the full URL or an ingress reverse proxy mapping.
// Force cache-bust (1)
const isDev = import.meta.env.DEV;
const STREAM_HTTP_URL = isDev
  ? '/stream-service'
  : (import.meta.env.VITE_NODE_VIDEO_WS_URL 
      ? import.meta.env.VITE_NODE_VIDEO_WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')
      : '/stream-service');

const api = axios.create({
  baseURL: STREAM_HTTP_URL,
});

export const streamApi = {
  getCameras: async () => {
    const response = await api.get('/cameras');
    return response.data;
  },
  getCameraById: async (id) => {
    const response = await api.get(`/cameras/${id}`);
    return response.data;
  },
  getCamera: async (id) => {
    const response = await api.get(`/cameras/${id}`);
    return response.data;
  },
  createCamera: async (data) => {
    const response = await api.post('/cameras', data);
    return response.data;
  },
  updateCamera: async (id, data) => {
    const response = await api.put(`/cameras/${id}`, data);
    return response.data;
  },
  deleteCamera: async (id) => {
    const response = await api.delete(`/cameras/${id}`);
    return response.data;
  },
  startCamera: async (id) => {
    const response = await api.post(`/cameras/${id}/start`);
    return response.data;
  },
  stopCamera: async (id) => {
    const response = await api.post(`/cameras/${id}/stop`);
    return response.data;
  },
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};
