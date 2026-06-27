/**
 * ActivityLogsPage — thin wrapper so the /activity-logs sidebar route still works.
 * Renders UserManagementPage pre-opened on the "activity" tab so the user lands
 * directly on the Activity Logs view without any route flash.
 */
import UserManagementPage from './UserManagementPage';

function ActivityLogsPage() {
  return <UserManagementPage initialTab="activity" />;
}

export default ActivityLogsPage;
