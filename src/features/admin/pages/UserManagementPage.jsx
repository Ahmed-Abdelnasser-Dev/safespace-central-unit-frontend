import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { userAPI } from '@/services/api';
import { showError } from '@/utils/toast';
import PageActions from '@/components/ui/PageActions';
import UserManagementCards from '../components/UserManagementCards';
import UserManagementButtons from '../components/UserManagementButtons';
import UserManagementTable from '../components/UserManagementTable';
import UserActivityTable from '../components/UserActivityTable';

/**
 * UserManagementPage — hosts both the User Management tab and the Activity Logs tab.
 * Switching between tabs is in-place (no route navigation), so the cards and tab bar
 * stay mounted and the URL stays the same.
 *
 * @param {'users'|'activity'} [initialTab] — allows deep-linking from sidebar
 */
function UserManagementPage({ initialTab = 'users' }) {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.name === 'admin';

  const [tab, setTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    if (tab === 'users') fetchUsers();
  }, [filters, tab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { isActive: filters.status === 'active' }),
      };
      const data = await userAPI.listUsers(params);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showError('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center bg-safe-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-safe-text-dark mb-4">Access Denied</h2>
          <p className="text-safe-text-gray">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-safe-bg overflow-hidden">
      <PageActions>
        <button
          onClick={tab === 'users' ? fetchUsers : undefined}
          disabled={loading && tab === 'users'}
          title="Refresh"
          className="w-9 h-9 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors"
        >
          <FontAwesomeIcon
            icon="rotate"
            className={`text-sm ${loading && tab === 'users' ? 'animate-spin' : ''}`}
          />
        </button>
      </PageActions>

      <div className="flex-1 overflow-y-auto mt-6 mx-7">
        {/* Stats cards — always visible in both tabs */}
        <UserManagementCards />

        {/* In-place tab bar */}
        <UserManagementButtons
          activeTab={tab}
          onTabChange={setTab}
          onSearch={(search) => setFilters((prev) => ({ ...prev, search, page: 1 }))}
          onRoleFilter={(role) => setFilters((prev) => ({ ...prev, role, page: 1 }))}
          onStatusFilter={(status) => setFilters((prev) => ({ ...prev, status, page: 1 }))}
          currentFilters={filters}
          onUserCreated={fetchUsers}
        />

        {/* Content — swaps based on active tab */}
        {tab === 'users' ? (
          <UserManagementTable
            users={users}
            loading={loading}
            onRefresh={fetchUsers}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            currentPage={filters.page}
            currentUserId={user?.id}
          />
        ) : (
          <UserActivityTable />
        )}
      </div>
    </div>
  );
}

export default UserManagementPage;
