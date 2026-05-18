import { useEffect, useRef, useState } from 'react';

/**
 * Manages WebSocket connection to receive JPEG frames and draw to a canvas.
 * @param {string} cameraId
 * @param {import('react').RefObject<HTMLCanvasElement>} canvasRef
 */
export function useStreamSocket(cameraId, canvasRef) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState('connecting');
  const [fps, setFps] = useState(0);
  const [lastFrameAt, setLastFrameAt] = useState(null);

  const frameCountRef = useRef(0);
  const lastSecRef = useRef(Date.now());

  useEffect(() => {
    if (!cameraId) return;

    let isMounted = true;
    let ws = null;

    const connect = () => {
      // Force cache-bust (1)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const isDev = import.meta.env.DEV;
      const baseUrl = isDev
        ? `${protocol}//${window.location.host}/stream-service`
        : (import.meta.env.VITE_NODE_VIDEO_WS_URL || 'ws://localhost:4001');

      ws = new WebSocket(`${baseUrl}/stream/${cameraId}`);
      wsRef.current = ws;
      
      ws.binaryType = 'blob';

      ws.onopen = () => {
        if (isMounted) setStatus('connecting'); // wait for first frame
      };

      ws.onmessage = async (event) => {
        if (!isMounted) return;

        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') {
              setStatus('connecting');
            } else if (data.type === 'error') {
              setStatus('error');
            } else if (data.type === 'stopped') {
              setStatus('stopped');
            }
          } catch (e) {
            console.error('Failed to parse WS text message', e);
          }
          return;
        }

        // Draw binary frame data
        if (event.data instanceof Blob) {
          if (status !== 'live') setStatus('live');
          setLastFrameAt(new Date());

          try {
            const bitmap = await createImageBitmap(event.data);
            if (canvasRef.current && isMounted) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              
              if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
              }
              
              ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

              // FPS calculation
              frameCountRef.current += 1;
              const now = Date.now();
              if (now - lastSecRef.current >= 1000) {
                setFps(frameCountRef.current);
                frameCountRef.current = 0;
                lastSecRef.current = now;
              }
            }
          } catch (err) {
            // Context/decoder might throw if corrupted
            console.error('Error drawing image bitmap:', err);
          }
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          setStatus('stopped');
          setFps(0);
        }
      };

      ws.onerror = (err) => {
        if (isMounted) {
          setStatus('error');
          setFps(0);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
    };
  }, [cameraId, canvasRef]);

  // Detect stale stream
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFrameAt && status === 'live') {
        if (Date.now() - lastFrameAt.getTime() > 5000) {
          setStatus('error');
          setFps(0);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [lastFrameAt, status]);

  return { status, fps, lastFrameAt };
}
