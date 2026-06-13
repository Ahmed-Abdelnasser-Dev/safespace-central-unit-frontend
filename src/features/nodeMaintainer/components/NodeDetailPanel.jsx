import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import VideoFeedPlayer from './VideoFeedPlayer.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'eye' },
  { id: 'roadConfig', label: 'Road Configuration', icon: 'road' },
  { id: 'nodeConfig', label: 'Node Configuration', icon: 'gear' },
  { id: 'health', label: 'Health', icon: 'heart-pulse' },
  { id: 'polygons', label: 'Polygons', icon: 'map' },
];

export default function NodeDetailPanel({
  selectedNode,
  currentTab,
  onTabChange,
  onEdit,
  onDelete,
  isEditing,
  isDeleting,
  renderTabContent,
}) {
  return (
    <div className="flex-1 flex flex-col gap-[12px] lg:gap-[16px] xl:gap-[20px] overflow-hidden min-w-0">
      {/* Node Header with Status */}
      <div className="bg-white rounded-xl p-6 border border-safe-border/50 shadow-card hover:shadow-lg transition-all duration-300 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: selectedNode.status === 'online' ? '#10b981' : '#ef4444'
              }}
            />
            <h2 className="font-semibold text-safe-text-dark truncate text-lg">
              {selectedNode.id}
            </h2>
            <span
              className={`px-3 py-1 rounded-lg font-medium flex-shrink-0 text-xs ${
                selectedNode.status === 'online'
                  ? 'bg-safe-green/10 text-safe-green'
                  : 'bg-safe-danger/10 text-safe-danger'
              }`}
            >
              {selectedNode.status}
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={onEdit} title="Edit node settings" disabled={isEditing}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete} title="Delete node" disabled={isDeleting}>
              Delete
            </Button>
          </div>
        </div>

        <p className="text-safe-text-gray/80 mb-4 font-light text-sm truncate">
          {selectedNode.location.address}
        </p>

        {/* Video Feed */}
        {selectedNode.videoFeedUrl && (
          <div className="mb-4">
            <p className="text-xs font-bold text-safe-text-dark uppercase tracking-wider mb-2">Live Video Feed</p>
            <VideoFeedPlayer
              videoFeedUrl={selectedNode.videoFeedUrl}
              nodeId={selectedNode.id}
              status={selectedNode.status}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto px-0 pb-2 -mx-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap font-semibold text-sm transition-all duration-200 flex-shrink-0 ${
                currentTab === tab.id
                  ? 'bg-safe-blue text-white shadow-md'
                  : 'bg-safe-gray/5 text-safe-text-gray hover:bg-safe-gray/10'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-white rounded-xl p-6 border border-safe-border/50 shadow-card overflow-y-auto min-h-0">
        {renderTabContent()}
      </div>
    </div>
  );
}
