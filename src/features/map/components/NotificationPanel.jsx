import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { markRead, markAllRead } from '@/features/notifications/notificationsSlice.js';

const TYPE_CONFIG = {
  incident_assigned: {
    icon: 'exclamation-triangle',
    iconColor: 'text-safe-accent',
    iconBg: 'bg-safe-accent/15',
    defaultTitle: 'Incident Assigned',
  },
  accident_detected: {
    icon: 'triangle-exclamation',
    iconColor: 'text-safe-danger',
    iconBg: 'bg-safe-danger/15',
    defaultTitle: 'Accident Detected',
  },
  decision_confirmed: {
    icon: 'circle-check',
    iconColor: 'text-safe-green',
    iconBg: 'bg-safe-green/15',
    defaultTitle: 'Decision Confirmed',
  },
};

function timeSince(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * NotificationPanel — fixed dropdown from the bell button.
 *
 * Uses a fixed overlay + panel so it can't be clipped by the header's overflow context.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 */
function NotificationPanel({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  const { items, unreadCount, loading } = useSelector((state) => state.notifications);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleMarkAllRead = () => dispatch(markAllRead());
  const handleMarkRead = (id) => dispatch(markRead(id));
  const handleViewAll = () => { onClose?.(); navigate('/incident-history'); };

  return (
    <>
      {/* Transparent backdrop — click outside to close */}
      <div
        className="fixed inset-0 z-40"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className="fixed top-16 right-4 z-50 w-96 bg-safe-gray border border-safe-gray-light rounded-xl shadow-xl overflow-hidden flex flex-col"
        style={{ maxHeight: '480px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-safe-gray-light">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon="bell" className="text-safe-text-muted text-sm" />
            <span className="text-sm font-semibold text-safe-text-primary">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-safe-accent/20 text-safe-accent px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] text-safe-blue hover:text-safe-blue-light transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && items.length === 0 && (
            <div className="px-4 py-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-safe-gray-light/50 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-safe-gray-light/50 rounded animate-pulse" />
                    <div className="h-2.5 w-full bg-safe-gray-light/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="py-12 text-center">
              <FontAwesomeIcon icon="bell" className="text-safe-text-muted text-2xl mb-3" />
              <p className="text-xs text-safe-text-muted">No notifications yet</p>
              <p className="text-[11px] text-safe-text-muted/60 mt-1">Incidents assigned to you will appear here</p>
            </div>
          )}

          {items.map((item) => {
            const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.incident_assigned;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMarkRead(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-safe-gray-light text-left hover:bg-safe-gray-light/30 transition-colors ${
                  !item.read ? 'bg-safe-blue/5' : ''
                }`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <FontAwesomeIcon icon={cfg.icon} className={`${cfg.iconColor} text-sm`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium leading-snug ${item.read ? 'text-safe-text-muted' : 'text-safe-text-primary'}`}>
                      {item.title || cfg.defaultTitle}
                    </p>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-safe-blue flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-[11px] text-safe-text-muted mt-0.5 leading-snug line-clamp-2">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-safe-text-muted/60 font-mono mt-1">
                    {timeSince(item.timestamp)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-safe-gray-light bg-safe-sidebar/50">
          <button
            type="button"
            onClick={handleViewAll}
            className="w-full text-center text-xs font-medium text-safe-blue hover:text-safe-blue-light transition-colors"
          >
            View full incident history →
          </button>
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
