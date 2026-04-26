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

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from '@/lib/apiConfig';
import { selectSelectedNode } from "../nodesSlice";
import { useNodeVideoFeed } from "@/hooks/useNodeVideoFeed";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrochip,
  faMemory,
  faWifi,
  faDatabase,
  faCircleCheck,
  faCircleXmark,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import MetricCard from "../components/cards/MetricCard";
import SectionHeader from "../components/layout/SectionHeader";
import NodeInfoRow from "../components/ui/NodeInfoRow";
import ListItem from "../components/lists/ListItem";
import RoadStatusDisplay from "../components/sections/RoadStatusDisplay";
import { typography, fontFamily } from "../styles/typography";

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
  const [feedSize, setFeedSize] = useState({ width: 640, height: 640 });

  if (!node) return null;

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

  // No need to observe or update size, always fixed at 640x640


  // Sample lane data
  const lanes = node?.roadRules?.lanes || [];
  const speedLimit = node?.roadRules?.speedLimit || 120;


  const laneStatusIcons = {
    open: { icon: faCircleCheck, color: "#22c55e", bg: "#e8f5e9", label: "Open" },
    blocked: { icon: faCircleXmark, color: "#d63e4d", bg: "#fee2e2", label: "Blocked" },
    right: { icon: faArrowRight, color: "#247cff", bg: "#e3f2fd", label: "Right" },
    left: { icon: faArrowLeft, color: "#247cff", bg: "#e3f2fd", label: "Left" },
  };

  // Convert laneStatusIcons object to array format for RoadStatusDisplay
  const laneStatusOptions = Object.entries(laneStatusIcons).map(([value, data]) => ({
    value,
    ...data
  }));

  return (
    <div className="p-[12px] sm:p-[14px] md:p-[16px] lg:p-[18px] xl:p-[20px] space-y-[14px] sm:space-y-[16px] md:space-y-[18px] lg:space-y-[20px] h-full overflow-y-auto">
      {/* ===== SECTION 1: CAMERA FEED ===== */}
      <div className="space-y-[8px] sm:space-y-[10px] md:space-y-[12px]">
        <h4
          className="font-bold text-[#101828]"
          style={{
            fontSize: 'clamp(14px, 1.5vw, 18px)',
            fontFamily,
          }}
        >
          Live Camera Feed
        </h4>

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
              <span
                className="text-white/70"
                style={{ fontSize: 'clamp(12px, 1.2vw, 14px)', fontFamily }}
              >
                {isConnected ? 'Waiting for video feed...' : 'Live stream not connected'}
              </span>
            </div>
          )}

          {/* LIVE Badge */}
          <div
            className="absolute bg-[#fb2c36] rounded-[3px] flex items-center gap-[6px] px-[8px] py-[4px] shadow-md"
            style={{ top: "12px", left: "12px" }}
          >
            <div
              className={`bg-white rounded-full ${isConnected && node.status === 'online' ? 'animate-pulse' : 'opacity-40'}`}
              style={{ width: "4px", height: "4px" }}
            />
            <span
              className="text-white font-bold"
              style={{
                ...typography.labelSmall,
                fontFamily,
              }}
            >
              {isConnected && node.status === 'online' ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Resolution Info */}
          {displayImage && (
            <div
              className="absolute bg-black bg-opacity-80 rounded-[3px] px-[8px] py-[4px] shadow-md"
              style={{ bottom: "12px", left: "12px" }}
            >
              <span
                className="text-white font-normal"
                style={{
                  ...typography.caption,
                  fontFamily,
                }}
              >
                {node.nodeSpecs.cameraResolution || '1920×1080'} @ {node.health.currentFps?.toFixed(1) || 0} FPS
              </span>
            </div>
          )}

          {/* Incident Overlay (when snapshot is from incident) */}
          {lastSnapshot && lastSnapshot.incidentType && (
            <div
              className="absolute bg-red-600 bg-opacity-90 rounded-[3px] px-[10px] py-[6px] shadow-lg"
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

      {/* ===== SECTION 2: HEALTH METRICS ===== */}
      <SectionHeader title="Health Metrics" showDivider={true} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[8px] sm:gap-[10px] md:gap-[12px] lg:gap-[14px]">
        <MetricCard
          label="CPU"
          value={node.health.cpu}
          unit="%"
          icon={faMicrochip}
          color="#3b82f6"
        />
        <MetricCard
          label="Memory"
          value={node.health.memory}
          unit="%"
          icon={faMemory}
          color="#f97316"
        />
        <MetricCard
          label="Network"
          value={node.health.network}
          unit="%"
          icon={faWifi}
          color="#22c55e"
        />
        <MetricCard
          label="Storage"
          value={node.health.storage}
          unit="%"
          icon={faDatabase}
          color="#a78bfa"
        />
      </div>

      {/* ===== SECTION 3: ROAD STATUS ===== */}
      <SectionHeader title="Road Status" showDivider={true} />

      <RoadStatusDisplay
        roadName={node.location?.address || node.name}
        speedLimit={speedLimit}
        lanes={lanes}
        laneStatusOptions={laneStatusOptions}
      />

      {/* ===== SECTION 4: NODE INFORMATION ===== */}
      <SectionHeader title="Node Information" showDivider={true} />

      <div className="bg-[#f7f8f9] rounded-[6px] sm:rounded-[7px] md:rounded-[8px] p-[12px] sm:p-[14px] md:p-[16px] border border-[#e5e7eb] space-y-[8px] sm:space-y-[10px] md:space-y-[12px]">
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <NodeInfoRow label="Install Date" value={node.createdAt ? new Date(node.createdAt).toLocaleDateString() : 'Not available'} />
          </div>

          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <NodeInfoRow label="Last Heartbeat" value={node.lastHeartbeat ? new Date(node.lastHeartbeat).toLocaleString() : 'Not available'} />
          </div>

          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <NodeInfoRow label="Uptime" value={formatUptime(node.uptimeSec || 0)} />
          </div>

        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <NodeInfoRow label="IP Address" value={node.nodeSpecs.ipAddress} />
        </div>

        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <NodeInfoRow label="Firmware Version" value={node.firmwareVersion || 'unknown'} />
        </div>

        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
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
