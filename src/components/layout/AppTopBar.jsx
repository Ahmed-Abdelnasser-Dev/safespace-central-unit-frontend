import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getPageConfig } from '@/config/navigation';
import { useTopBarActions } from '@/contexts/PageConfigContext';
import { markAllRead } from '@/features/notifications/notificationsSlice';

function NotificationDropdown({ notifications, unreadCount, onMarkAllRead, onClose }) {
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const severityColor = (n) => {
    if (n.severity === 'critical' || n.severity === 'high') return 'text-safe-danger';
    if (n.severity === 'warning' || n.severity === 'medium') return 'text-safe-orange';
    return 'text-safe-info';
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-safe-sidebar border border-safe-border rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-safe-border">
        <span className="text-sm font-semibold text-safe-text-primary">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-safe-blue hover:text-safe-blue-light transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-safe-text-muted text-center py-8">No notifications</p>
        ) : (
          notifications.slice(0, 15).map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-safe-border/50 hover:bg-safe-gray transition-colors cursor-pointer ${!n.read ? 'bg-safe-blue/5' : ''}`}
            >
              <FontAwesomeIcon
                icon="circle-exclamation"
                className={`mt-0.5 flex-shrink-0 text-sm ${severityColor(n)}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-safe-text-primary truncate">{n.title}</p>
                <p className="text-xs text-safe-text-muted line-clamp-2 mt-0.5">{n.message}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-safe-blue flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-safe-border">
        <button
          onClick={() => { navigate('/alerts'); onClose(); }}
          className="text-xs text-safe-blue hover:text-safe-blue-light transition-colors w-full text-center"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}

/**
 * AppTopBar — unified page header rendered by AppLayout for every authenticated route.
 *
 * Left:   page title + optional section breadcrumb (from navigation.js PAGE_CONFIG).
 * Center: page-specific actions slot (populated via <PageActions> inside each page).
 * Right:  notifications bell with unread count.
 */
function AppTopBar() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const actions = useTopBarActions();
  const { items: notifications, unreadCount } = useSelector((s) => s.notifications);
  const [showNotifs, setShowNotifs] = useState(false);

  const { title, section } = getPageConfig(pathname);

  function handleMarkAllRead() {
    dispatch(markAllRead());
  }

  return (
    <header className="h-16 flex-shrink-0 flex items-center px-6 gap-4 bg-safe-sidebar border-b border-safe-border">
      {/* Left: section breadcrumb + page title */}
      <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
        {section && (
          <>
            <span className="text-xs text-safe-text-muted truncate hidden sm:block">{section}</span>
            <FontAwesomeIcon
              icon="chevron-right"
              className="text-safe-text-muted text-[9px] hidden sm:block flex-shrink-0"
            />
          </>
        )}
        <h1 className="text-sm font-semibold text-safe-text-primary truncate">{title}</h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Center-right: page-specific action buttons */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}

      {/* Far right: notifications */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowNotifs((v) => !v)}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-safe-text-muted hover:bg-safe-gray hover:text-safe-text-primary transition-colors"
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <FontAwesomeIcon icon="bell" className="text-base" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-safe-danger rounded-full animate-pulse-glow" />
          )}
        </button>

        {showNotifs && (
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
            onClose={() => setShowNotifs(false)}
          />
        )}
      </div>
    </header>
  );
}

export default AppTopBar;
