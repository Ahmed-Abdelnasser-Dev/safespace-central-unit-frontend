import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import VideoFeedPlayer from './VideoFeedPlayer.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'eye' },
  { id: 'lanes', label: 'Lanes', icon: 'road' },
  { id: 'health', label: 'Health', icon: 'heart-pulse' },
  { id: 'config', label: 'Config', icon: 'gear' },
  { id: 'cameras', label: 'Cameras', icon: 'camera' },
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
    <div className="flex-1 flex flex-col gap-3 lg:gap-4 overflow-hidden min-w-0">
      {/* Node Header */}
      <div className="bg-safe-sidebar border border-safe-gray-light rounded-xl px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                selectedNode.status === 'online' ? 'bg-safe-success' : 'bg-safe-danger'
              }`}
            />
            <h2 className="text-sm font-bold text-safe-text-primary truncate">
              {selectedNode.id}
            </h2>
            <span
              className={`px-2.5 py-0.5 text-xs rounded font-medium flex-shrink-0 ${
                selectedNode.status === 'online'
                  ? 'bg-safe-success/15 text-safe-success'
                  : 'bg-safe-danger/15 text-safe-danger'
              }`}
            >
              {selectedNode.status}
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={onEdit} className="!px-3 !py-1.5" title="Edit node settings" disabled={isEditing}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete} className="!px-3 !py-1.5" title="Delete node" disabled={isDeleting}>
              Delete
            </Button>
          </div>
        </div>

        <p className="text-xs text-safe-text-muted mb-3 font-normal truncate">
          {selectedNode.location.address}
        </p>

        {selectedNode.videoFeedUrl && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-safe-text-muted uppercase tracking-wide mb-2">Live Video Feed</p>
            <VideoFeedPlayer
              videoFeedUrl={selectedNode.videoFeedUrl}
              nodeId={selectedNode.id}
              status={selectedNode.status}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 whitespace-nowrap font-medium transition-all duration-200 flex-shrink-0 ${
                currentTab === tab.id
                  ? 'bg-safe-blue text-white'
                  : 'bg-safe-gray text-safe-text-muted hover:bg-safe-gray-light/50'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-safe-sidebar border border-safe-gray-light rounded-xl overflow-y-auto min-h-0">
        {renderTabContent()}
      </div>
    </div>
  );
}
