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
      <div className="bg-safe-sidebar border border-safe-gray-light rounded-[8px] lg:rounded-[10px] xl:rounded-[13.684px] px-[14px] lg:px-[16px] xl:px-[20px] py-[12px] lg:py-[14px] xl:py-[15px] flex-shrink-0">
        <div className="flex items-center justify-between mb-[8px] lg:mb-[10px]">
          <div className="flex items-center gap-[6px] lg:gap-[8px] min-w-0 flex-wrap">
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: selectedNode.status === 'online' ? '#4caf50' : '#d63e4d'
              }}
            />
            <h2
              className="font-bold text-safe-text-primary truncate"
              style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', fontFamily: 'Arimo, sans-serif' }}
            >
              {selectedNode.id}
            </h2>
            <span
              className={`px-[10px] lg:px-[12px] py-[3px] lg:py-4px] rounded-[4px] lg:rounded-[6px] font-medium flex-shrink-0 ${
                selectedNode.status === 'online'
                  ? 'bg-[#e8f5e9] text-[#4caf50]'
                  : 'bg-[#fce4ec] text-[#d63e4d]'
              }`}
              style={{ fontSize: 'clamp(10px, 1.2vw, 11px)', fontFamily: 'Arimo, sans-serif' }}
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

        <p
          className="text-safe-text-muted mb-[12px] lg:mb-[14px] xl:mb-[15px] font-normal truncate"
          style={{ fontSize: 'clamp(11px, 1.1vw, 12px)', fontFamily: 'Arimo, sans-serif' }}
        >
          {selectedNode.location.address}
        </p>

        {/* Video Feed */}
        {selectedNode.videoFeedUrl && (
          <div className="mb-[12px] lg:mb-[14px] xl:mb-[15px]">
            <p className="text-xs font-semibold text-safe-text-muted uppercase tracking-wide mb-2">Live Video Feed</p>
            <VideoFeedPlayer
              videoFeedUrl={selectedNode.videoFeedUrl}
              nodeId={selectedNode.id}
              status={selectedNode.status}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-[6px] lg:gap-[8px] overflow-x-auto -mx-[14px] lg:-mx-[16px] xl:-mx-[20px] px-[14px] lg:px-[16px] xl:px-[20px] pb-[4px]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-[12px] lg:px-[14px] py-[6px] lg:py-[8px] rounded-[6px] lg:rounded-[8px] flex items-center gap-[4px] lg:gap-[6px] whitespace-nowrap font-medium transition-all duration-200 flex-shrink-0 ${
                currentTab === tab.id
                  ? 'bg-safe-blue text-white'
                  : 'bg-safe-gray text-safe-text-muted hover:bg-safe-gray-light/50'
              }`}
              style={{ fontSize: 'clamp(10px, 1vw, 11px)', fontFamily: 'Arimo, sans-serif' }}
            >
              <FontAwesomeIcon icon={tab.icon} style={{ width: '10px', height: '10px' }} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-safe-sidebar border border-safe-gray-light rounded-[8px] lg:rounded-[10px] xl:rounded-[13.684px] overflow-y-auto min-h-0">
        {renderTabContent()}
      </div>
    </div>
  );
}
