import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:5000';
  const enableProxy = env.VITE_ENABLE_DEV_PROXY === 'true';

  const streamHttpUrl = env.VITE_NODE_VIDEO_WS_URL 
    ? env.VITE_NODE_VIDEO_WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')
    : 'http://localhost:4001';

  // Added allowedHosts: true to bypass Ngrok blocking
  const server = { 
    port: 4000,
    allowedHosts: true 
  };

  if (enableProxy) {
    server.proxy = {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/socket.io': {
        target: proxyTarget,
        ws: true,
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/stream-service': {
        target: streamHttpUrl,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/stream-service/, ''),
        headers: {
          Origin: streamHttpUrl,
        }
      }
    };
  } else {
    server.proxy = {
      '/stream-service': {
        target: streamHttpUrl,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/stream-service/, ''),
        headers: {
          Origin: streamHttpUrl,
        }
      }
    };
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
            'vendor-icons': [
              '@fortawesome/fontawesome-svg-core',
              '@fortawesome/free-solid-svg-icons',
              '@fortawesome/react-fontawesome',
            ],
            'vendor-map': ['maplibre-gl'],
          },
        },
      },
    },
    server,
  };
});