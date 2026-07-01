import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * User Management action bar — refresh button only.
 * Search lives in UserManagementButtons (content area).
 * Title lives in AppTopBar.
 * Phase 3: migrate refresh to PageActions and delete this component.
 */
function UserManagementHeader({ onRefresh }) {
  return (
    <div className="bg-safe-sidebar border-b border-safe-border px-6 py-3 flex items-center justify-end gap-3 flex-shrink-0">
      <button
        onClick={onRefresh}
        title="Refresh"
        className="w-9 h-9 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors"
      >
        <FontAwesomeIcon icon="rotate" className="text-sm" />
      </button>
    </div>
  );
}

export default UserManagementHeader;
