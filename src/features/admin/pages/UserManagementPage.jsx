import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { userAPI } from '@/services/api';
import { showError } from '@/utils/toast';
import UserManagementHeader from '../components/UserManagementHeader';
import UserManagementCards from '../components/UserManagementCards';
import UserManagementButtons from '../components/UserManagementButtons';
import UserManagementTable from '../components/UserManagementTable';

function UserManagementPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.name === 'admin';

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
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && {
          isActive: filters.status === 'active',
        }),
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
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg border border-safe-border/50">
          <div className="w-16 h-16 rounded-full bg-safe-danger/10 flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-exclamation-circle text-safe-danger text-3xl" />
          </div>
          <h2 className="font-display text-2xl font-bold text-safe-text-dark mb-2">Access Denied</h2>
          <p className="text-safe-text-gray font-light max-w-xs mx-auto">You don&apos;t have permission to view this page. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-safe-bg overflow-hidden">
      <UserManagementHeader
        title="System Administration"
        description="Manage users, roles, and system settings"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl">
          <UserManagementCards />

          <UserManagementButtons
            onSearch={(search) => setFilters((prev) => ({ ...prev, search, page: 1 }))}
            onRoleFilter={(role) => setFilters((prev) => ({ ...prev, role, page: 1 }))}
            onStatusFilter={(status) => setFilters((prev) => ({ ...prev, status, page: 1 }))}
            currentFilters={filters}
          />

          <UserManagementTable
            users={users}
            loading={loading}
            onRefresh={fetchUsers}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            currentPage={filters.page}
          />
        </div>
      </div>
    </div>
  );
}

export default UserManagementPage;
