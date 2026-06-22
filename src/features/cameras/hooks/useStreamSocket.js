import { useEffect, useRef, useState } from 'react';

/**
 * Manages WebSocket connection to receive JPEG frames and draw to a canvas.
 * @param {string} cameraId
 * @param {import('react').RefObject<HTMLCanvasElement>} canvasRef
 */
export function useStreamSocket(cameraId, canvasRef) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState('connecting');
  const statusRef = useRef('connecting');
  const [fps, setFps] = useState(0);
  const [lastFrameAt, setLastFrameAt] = useState(null);

  const updateStatus = (newStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  };

  const frameCountRef = useRef(0);
  const lastSecRef = useRef(Date.now());

  useEffect(() => {
    if (!cameraId) return;

    let isMounted = true;
    let ws = null;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // If an explicit absolute ws URL is set, use it directly.
      // Otherwise (including the DMZ same-origin mode) use the current origin
      // with /stream-service prefix — nginx strips the prefix and proxies to
      // the stream-service on port 4001.
      const envWs = import.meta.env.VITE_NODE_VIDEO_WS_URL;
      const baseUrl = (envWs && /^wss?:\/\//i.test(envWs))
        ? envWs
        : `${protocol}//${window.location.host}/stream-service`;

      ws = new WebSocket(`${baseUrl}/stream/${cameraId}`);
      wsRef.current = ws;
      
      ws.binaryType = 'blob';

      ws.onopen = () => {
        if (isMounted) updateStatus('connecting'); // wait for first frame
      };

      ws.onmessage = async (event) => {
        if (!isMounted) return;

        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') {
              updateStatus('connecting');
            } else if (data.type === 'error') {
              updateStatus('error');
            } else if (data.type === 'stopped') {
              updateStatus('stopped');
            }
          } catch (e) {
            console.error('Failed to parse WS text message', e);
          }
          return;
        }

        // Draw binary frame data
        if (event.data instanceof Blob) {
          if (statusRef.current !== 'live') updateStatus('live');
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
          updateStatus('stopped');
          setFps(0);
        }
      };

      ws.onerror = (err) => {
        if (isMounted) {
          updateStatus('error');
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
          updateStatus('error');
          setFps(0);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [lastFrameAt, status]);

  return { status, fps, lastFrameAt };
}
