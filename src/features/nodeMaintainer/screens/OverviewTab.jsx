/**
 * Overview Tab
 *
 * Comprehensive dashboard showing:
 * - Live camera feed (16:9 aspect ratio)
 * - Health metrics (CPU, Memory, Network, Storage)
 * - Road status (lanes and speed limit)
 * - Node information (install date, heartbeat, IP, coordinates)
 *
 * @component
 */

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from '@/lib/apiConfig';
import { selectSelectedNode } from "../nodesSlice";
import { useNodeVideoFeed } from "@/hooks/useNodeVideoFeed";
import SectionHeader from "../components/layout/SectionHeader";
import NodeInfoRow from "../components/ui/NodeInfoRow";

/**
 * Format uptime seconds into human-readable string
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime (e.g., "2h 34m 12s")
 */
function formatUptime(seconds) {
  if (!seconds || seconds === 0) return "0s";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(" ");
}

export default function OverviewTab() {
  const node = useSelector(selectSelectedNode);
  const { currentFrame, lastSnapshot, isConnected } = useNodeVideoFeed();
  const [displayImage, setDisplayImage] = useState(null);
  const feedRef = useRef(null);
  // Always use 640x640 for node camera
  const [feedSize] = useState({ width: 640, height: 640 });

  // Determine what to display: live frame, snapshot, or placeholder
  useEffect(() => {
    if (currentFrame && currentFrame.frameData) {
      // Display live video frame (base64)
      setDisplayImage(`data:image/jpeg;base64,${currentFrame.frameData}`);
    } else if (lastSnapshot && lastSnapshot.snapshotPath) {
      // Display last snapshot from incident
      const baseUrl = API_BASE_URL;
      setDisplayImage(`${baseUrl}${lastSnapshot.snapshotPath}`);
    }
  }, [currentFrame, lastSnapshot]);

  if (!node) return null;

  // No need to observe or update size, always fixed at 640x640

  return (
    <div className="p-[12px] sm:p-[14px] md:p-[16px] lg:p-[18px] xl:p-[20px] space-y-[14px] sm:space-y-[16px] md:space-y-[18px] lg:space-y-[20px] h-full overflow-y-auto">
      {/* ===== SECTION 1: CAMERA FEED ===== */}
      <div className="space-y-[8px] sm:space-y-[10px] md:space-y-[12px]">
        <h4 className="text-base font-bold text-safe-text-primary">Live Camera Feed</h4>

        <div
          ref={feedRef}
          className="relative bg-[#1a1a1a] rounded-[6px] sm:rounded-[7px] md:rounded-[8px] overflow-hidden w-full max-w-[640px] mx-auto"
          style={{ aspectRatio: '1 / 1', minHeight: '320px', maxHeight: '640px' }}
        >
          {displayImage ? (
            <img 
              src={displayImage} 
              alt="Live camera feed" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#111827]">
              <span className="text-sm text-white/70">
                {isConnected ? 'Waiting for video feed...' : 'Live stream not connected'}
              </span>
            </div>
          )}

          {/* LIVE Badge */}
          <div
            className="absolute bg-[#fb2c36] rounded-[3px] flex items-center gap-[6px] px-[8px] py-[4px]"
            style={{ top: "12px", left: "12px" }}
          >
            <div
              className={`bg-white rounded-full ${isConnected && node.status === 'online' ? 'animate-pulse' : 'opacity-40'}`}
              style={{ width: "4px", height: "4px" }}
            />
            <span className="text-xs font-bold text-white">
              {isConnected && node.status === 'online' ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Resolution Info */}
          {displayImage && (
            <div
              className="absolute bg-black bg-opacity-80 rounded-[3px] px-[8px] py-[4px]"
              style={{ bottom: "12px", left: "12px" }}
            >
              <span className="text-[10px] text-white font-normal">
                {node.nodeSpecs.cameraResolution || '1920×1080'} @ {node.health.currentFps?.toFixed(1) || 0} FPS
              </span>
            </div>
          )}

          {/* Incident Overlay (when snapshot is from incident) */}
          {lastSnapshot && lastSnapshot.incidentType && (
            <div
              className="absolute bg-red-600 bg-opacity-90 rounded-[3px] px-[10px] py-[6px]"
              style={{ top: "12px", right: "12px" }}
            >
              <span className="text-white font-bold text-xs uppercase">
                {lastSnapshot.incidentType} - {(lastSnapshot.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}

          {/* Polygon Overlay */}
          {displayImage && node.lanePolygons?.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${feedSize.width} ${feedSize.height}`}
              preserveAspectRatio="none"
            >
              {node.lanePolygons.map((poly) => {
                const baseWidth = poly.baseWidth || feedSize.width;
                const baseHeight = poly.baseHeight || feedSize.height;
                const scaleX = baseWidth ? feedSize.width / baseWidth : 1;
                const scaleY = baseHeight ? feedSize.height / baseHeight : 1;
                const points = (poly.points || [])
                  .map((p) => {
                    const x = typeof p?.x === 'number' ? p.x : (Array.isArray(p) ? p[0] : null);
                    const y = typeof p?.y === 'number' ? p.y : (Array.isArray(p) ? p[1] : null);
                    if (typeof x !== 'number' || typeof y !== 'number') return null;
                    return `${x * scaleX},${y * scaleY}`;
                  })
                  .filter(Boolean)
                  .join(' ');

                if (!points) return null;

                return (
                  <g key={poly.id}>
                    <polygon
                      points={points}
                      fill="rgba(59, 130, 246, 0.15)"
                      stroke="rgba(59, 130, 246, 0.9)"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* ===== SECTION 2: NODE INFORMATION ===== */}
      <SectionHeader title="Node Information" showDivider={true} />

      <div className="bg-safe-gray rounded-[6px] sm:rounded-[7px] md:rounded-[8px] p-[12px] sm:p-[14px] md:p-[16px] border border-safe-gray-light space-y-[8px] sm:space-y-[10px] md:space-y-[12px]">
          <div className="border-b border-safe-gray-light">
            <NodeInfoRow label="Install Date" value={node.createdAt ? new Date(node.createdAt).toLocaleDateString() : 'Not available'} />
          </div>

          <div className="border-b border-safe-gray-light">
            <NodeInfoRow label="Last Heartbeat" value={node.lastHeartbeat ? new Date(node.lastHeartbeat).toLocaleString() : 'Not available'} />
          </div>

          <div className="border-b border-safe-gray-light">
            <NodeInfoRow label="Uptime" value={formatUptime(node.uptimeSec || 0)} />
          </div>

        <div className="border-b border-safe-gray-light">
          <NodeInfoRow label="IP Address" value={node.nodeSpecs.ipAddress} />
        </div>

        <div className="border-b border-safe-gray-light">
          <NodeInfoRow label="Firmware Version" value={node.firmwareVersion || 'unknown'} />
        </div>

        <div className="border-b border-safe-gray-light">
          <NodeInfoRow label="AI Model Version" value={node.modelVersion || 'unknown'} />
        </div>

        <NodeInfoRow
          label="Coordinates"
          value={`${node.location.latitude?.toFixed(4)}, ${node.location.longitude?.toFixed(4)}`}
        />
      </div>
    </div>
  );
}
