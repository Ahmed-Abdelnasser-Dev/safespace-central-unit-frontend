import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CameraStatusBadge({ status }) {
  let colorClass = 'bg-safe-gray text-safe-text-muted';
  let icon = 'circle-minus';
  let label = 'Offline';

  if (status === 'live') {
    colorClass = 'bg-green-500/20 text-green-400';
    icon = 'circle';
    label = 'Live';
  } else if (status === 'connecting') {
    colorClass = 'bg-yellow-500/20 text-yellow-400';
    icon = 'spinner';
    label = 'Connecting';
  } else if (status === 'error') {
    colorClass = 'bg-red-500/20 text-red-400';
    icon = 'exclamation-circle';
    label = 'Error';
  }

  return (
    <div className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${colorClass}`}>
      <FontAwesomeIcon icon={icon} className={status === 'connecting' ? 'animate-spin' : ''} />
      <span>{label}</span>
    </div>
  );
}
