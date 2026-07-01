import StatCard from '@/components/ui/StatCard';

/**
 * KPICards — compact status tiles for the Road Observer monitoring console.
 * Uses the shared StatCard component (compact variant) so the visual vocabulary
 * matches Admin and Dashboard.
 *
 * @param {number}  props.nodesOnline     — online nodes (from Redux)
 * @param {number}  props.nodesOffline    — offline nodes (from Redux)
 * @param {number}  [props.pendingReview] — pending observer reviews (observer API)
 * @param {number}  [props.reviewedToday] — reviewed today (observer API)
 * @param {number}  [props.camerasOnline] — online cameras (cameras slice)
 * @param {number}  [props.camerasOffline]— offline cameras (cameras slice)
 * @param {boolean} props.loading         — show skeletons while fetching
 */
function KPICards({
  nodesOnline = 0,
  nodesOffline = 0,
  pendingReview,
  reviewedToday,
  camerasOnline,
  camerasOffline,
  loading = false,
}) {
  const tiles = [
    {
      id: 'online',
      icon: 'server',
      iconColor: 'text-safe-green',
      label: 'Nodes Online',
      value: loading ? '...' : String(nodesOnline),
      trend: nodesOnline > 0 ? 'active' : 'none active',
    },
    {
      id: 'offline',
      icon: 'triangle-exclamation',
      iconColor: 'text-safe-danger',
      label: 'Nodes Offline',
      value: loading ? '...' : String(nodesOffline),
      trend: nodesOffline > 0 ? 'require attention' : 'all healthy',
    },
    {
      id: 'cameras-online',
      icon: 'video',
      iconColor: 'text-safe-teal',
      label: 'Cameras Live',
      value: camerasOnline == null ? '—' : String(camerasOnline),
      trend: camerasOnline != null ? 'feeds active' : 'unavailable',
    },
    {
      id: 'cameras-offline',
      icon: 'video-slash',
      iconColor: 'text-safe-orange',
      label: 'Cameras Offline',
      value: camerasOffline == null ? '—' : String(camerasOffline),
      trend: camerasOffline != null ? (camerasOffline > 0 ? 'require attention' : 'all feeds live') : 'unavailable',
    },
    {
      id: 'pending',
      icon: 'circle-dot',
      iconColor: 'text-safe-accent',
      label: 'Pending Review',
      value: pendingReview == null ? '—' : String(pendingReview),
      trend: 'incidents awaiting',
    },
    {
      id: 'reviewed',
      icon: 'circle-check',
      iconColor: 'text-safe-blue-btn',
      label: 'Reviewed Today',
      value: reviewedToday == null ? '—' : String(reviewedToday),
      trend: 'decisions made',
    },
  ];

  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((tile) => (
        <StatCard
          key={tile.id}
          label={tile.label}
          value={tile.value}
          trend={tile.trend}
          icon={tile.icon}
          iconColor={tile.iconColor}
          size="compact"
        />
      ))}
    </div>
  );
}

export default KPICards;
