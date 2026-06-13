import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { userAPI } from '@/services/api';
import UsersTable from '@/components/ui/UsersTable';
import EditAccountInfoModal from './EditAccountInfoModal';
import ResetPasswordModal from './ResetPasswordModal';
import { showSuccess, showError } from '@/utils/toast';
import { API_BASE_URL } from '@/lib/apiConfig';

/**
 * User Management Table
 * Displays all users with actions using base Table component
 */
function UserManagementTable({ users = [], loading = false, onRefresh, onPageChange, currentPage = 1 }) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const getPhotoUrl = (user) => {
    if (!user.profilePhotoUrl) return null;
    return user.profilePhotoUrl.startsWith('http')
      ? user.profilePhotoUrl
      : `${API_BASE_URL}${user.profilePhotoUrl}`;
  };

  // Define table columns
  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      sortable: true
    },
    {
      key: 'created',
      label: 'Created',
      sortable: true
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      stopPropagation: true,
      headerClass: 'text-right'
    }
  ];

  const handleEditClick = async (user) => {
  try {
    // Fetch full user by ID (includes nationalId, role, employeeId, etc.)
    const fullUser = await userAPI.getUser(user.id);
    setSelectedUser(fullUser);
    setIsModalOpen(true);
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    showError('Failed to load user details');
  }
};


  const handleModalClose = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (updatedData) => {
    try {
      await userAPI.updateUser(selectedUser.id, updatedData);
      showSuccess('User updated successfully');
      handleModalClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeactivate = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    const actionText = user.isActive ? 'deactivated' : 'activated';
    
    if (confirm(`Are you sure you want to ${action} ${user.fullName || user.email}?`)) {
      try {
        if (user.isActive) {
          await userAPI.deactivateUser(user.id);
        } else {
          await userAPI.reactivateUser(user.id);
        }
        showSuccess(`User ${actionText} successfully`);
        if (onRefresh) onRefresh();
      } catch (error) {
        showError(`Failed to ${action} user`);
      }
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.fullName || user.email}?\nThis action cannot be undone.`)) return;
    try {
      await userAPI.deleteUser(user.id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to delete user:', error);
      showError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Get user initials for avatar
  const getInitials = (user) => {
    if (user.fullName) {
      const names = user.fullName.split(' ');
      return names.length >= 2 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : names[0][0].toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  };

  // Format last active time
  const formatLastActive = (lastLoginAt) => {
    if (!lastLoginAt) return 'Never';
    const date = new Date(lastLoginAt);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Format join date
  const formatJoinDate = (createdAt) => {
    if (!createdAt) return 'Unknown';
    return new Date(createdAt).toLocaleDateString();
  };

  // Custom cell renderer
  const renderCell = (user, column) => {
    switch (column.key) {
      case 'name': {
        const photoUrl = getPhotoUrl(user);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-safe-blue-btn text-white flex items-center justify-center font-semibold text-sm overflow-hidden flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={user.fullName || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                style={{ display: photoUrl ? 'none' : 'flex' }}
                className="w-full h-full items-center justify-center"
              >
                {getInitials(user)}
              </span>
            </div>
            <div>
              <p className="font-medium text-safe-text-dark">{user.fullName || user.username || 'Unknown User'}</p>
              <p className="text-xs text-safe-text-gray">{user.email}</p>
            </div>
          </div>
        );
      }

      case 'role':
        return (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon="shield" className="text-sm text-safe-blue/80" />
            <span className="text-sm text-safe-text-dark">{user.role?.name || 'User'}</span>
          </div>
        );

      case 'status':
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
            user.isActive 
              ? 'bg-safe-green/10 text-safe-green' 
              : 'bg-safe-text-gray/10 text-safe-text-gray'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        );

      case 'lastActive':
        return (
          <div>
            <p className="text-sm text-safe-text-dark">{formatLastActive(user.lastLoginAt)}</p>
            <p className="text-xs text-safe-text-gray flex items-center gap-1 mt-0.5">
              <FontAwesomeIcon icon="calendar-check" className="text-xs" />
              Joined {formatJoinDate(user.createdAt)}
            </p>
          </div>
        );

      case 'created':
        return <span className="text-sm text-safe-text-dark">{formatJoinDate(user.createdAt)}</span>;

      case 'actions':
        return (
          <div className={`flex items-center gap-2 ${
          column.key === 'actions' ? 'justify-end' : ''}`}>
            <button
              onClick={() => handleEditClick(user)}
              className="px-3 py-1.5 text-xs font-medium text-safe-text-dark bg-safe-bg hover:bg-safe-border/50 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setResetTarget(user)}
              title="Reset password"
              className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              Reset Password
            </button>
            <button
              onClick={() => handleDeactivate(user)}
              className="px-3 py-1.5 text-xs font-medium text-safe-text-dark bg-safe-bg hover:bg-safe-border/50 rounded-lg transition-colors min-w-[80px] text-center"
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => handleDelete(user)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-safe-danger hover:bg-safe-danger/90 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        );

      default:
        return user[column.key];
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="mt-6 bg-white rounded-xl border border-safe-border p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safe-blue-btn mx-auto mb-4"></div>
          <p className="text-safe-text-gray">Loading users...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-xl border border-safe-border p-8">
        <div className="text-center">
          <FontAwesomeIcon icon="users" className="text-4xl text-safe-text-gray mb-4" />
          <p className="text-safe-text-dark font-medium">No users found</p>
          <p className="text-sm text-safe-text-gray mt-1">Try adjusting your search filters</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6">
        <UsersTable
          columns={columns}
          data={users}
          renderCell={renderCell}
        />
      </div>
      
      <EditAccountInfoModal
        isOpen={isModalOpen}
        userData={selectedUser}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        isAdmin={true}
      />

      <ResetPasswordModal
        isOpen={!!resetTarget}
        user={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </>
  );
}

export default UserManagementTable;