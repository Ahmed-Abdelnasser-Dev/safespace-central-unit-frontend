import { useSelector } from 'react-redux';
import { selectSelectedNode } from '../nodesSlice';
import VideoFeedPlayer from '../components/VideoFeedPlayer.jsx';
import SectionHeader from '../components/layout/SectionHeader';
import NodeInfoRow from '../components/ui/NodeInfoRow';

function formatUptime(seconds) {
  if (!seconds || seconds === 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  return parts.join(' ');
}

export default function OverviewTab() {
  const node = useSelector(selectSelectedNode);
  if (!node) return null;

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">

      {/* ── Live feed (16:9) ─────────────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-safe-text-muted uppercase tracking-wide mb-2">
          Live Camera Feed
        </h4>
        <VideoFeedPlayer
          nodeId={node.id}
          status={node.status}
          polygons={node.lanePolygons || []}
        />
      </div>

      {/* ── Node information ──────────────────────────────────────── */}
      <SectionHeader title="Node Information" showDivider={true} />

      <div className="bg-safe-gray rounded-lg p-4 border border-safe-gray-light space-y-2">
        <div className="border-b border-safe-gray-light">
          <NodeInfoRow
            label="Install Date"
            value={node.createdAt ? new Date(node.createdAt).toLocaleDateString() : 'Not available'}
          />
        </div>
        <div className="border-b border-safe-gray-light">
          <NodeInfoRow
            label="Last Heartbeat"
            value={node.lastHeartbeat ? new Date(node.lastHeartbeat).toLocaleString() : 'Not available'}
          />
        </div>
        <div className="border-b border-safe-gray-light">
          <NodeInfoRow label="Uptime" value={formatUptime(node.uptimeSec || 0)} />
        </div>
        <div className="border-b border-safe-gray-light">
          <NodeInfoRow label="IP Address" value={node.nodeSpecs?.ipAddress} />
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
