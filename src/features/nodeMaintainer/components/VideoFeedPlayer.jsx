/**
 * VideoFeedPlayer Component
 * Displays video feed from a node with streaming support
 */

import React, { useRef, useEffect, useState } from 'react';

/**
 * VideoFeedPlayer - Displays MJPEG or HLS video stream from node
 * @param {Object} props - Component props
 * @param {string} props.videoFeedUrl - URL of the video feed (MJPEG, HLS, or RTSP)
 * @param {string} props.nodeId - Node identifier for fallback display
 * @param {string} props.status - Node status (online/offline)
 */
function VideoFeedPlayer({ videoFeedUrl, nodeId, status = 'offline' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!videoFeedUrl) {
      setError('No video feed URL configured');
      setLoading(false);
      return;
    }

    // For MJPEG streams, use img tag which automatically refreshes
    if (videoFeedUrl.includes('mjpeg') || videoFeedUrl.endsWith('.jpg')) {
      const img = imgRef.current;
      if (img) {
        const timestamp = new Date().getTime();
        img.src = `${videoFeedUrl}?t=${timestamp}`;
        img.onload = () => setLoading(false);
        img.onerror = () => {
          setError('Failed to load video feed');
          setLoading(false);
        };

        // Refresh MJPEG stream periodically
        const refreshInterval = setInterval(() => {
          const newTimestamp = new Date().getTime();
          img.src = `${videoFeedUrl}?t=${newTimestamp}`;
        }, 1000 / 30); // 30 FPS

        return () => clearInterval(refreshInterval);
      }
    } else {
      // For other stream types, show placeholder
      setLoading(false);
    }
  }, [videoFeedUrl]);

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
      {/* Video Stream Container */}
      {videoFeedUrl ? (
        <>
          {/* MJPEG/Image Stream */}
          <img
            ref={imgRef}
            alt={`Video feed from ${nodeId}`}
            className="w-full h-full object-contain"
          />

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
              <p className="text-white text-sm text-center px-4">{error}</p>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                status === 'online'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-200' : 'bg-red-200'}`} />
              {status === 'online' ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
        </>
      ) : (
        /* No Video Feed */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <p className="text-gray-400 text-sm mb-1">No Video Feed</p>
          <p className="text-gray-600 text-xs">Camera URL not configured</p>
        </div>
      )}
    </div>
  );
}

export default VideoFeedPlayer;
