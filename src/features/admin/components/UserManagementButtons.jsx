import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { userAPI } from '@/services/api';
import CreateUserModal from './CreateUserModal';
import { showSuccess, showError } from '@/utils/toast';

/**
 * UserManagementButtons — tab bar + search/filter/create row for the admin page.
 *
 * Props:
 *   activeTab      — 'users' | 'activity'
 *   onTabChange    — callback(tab: string) — switches tab in-place, no navigation
 *   onSearch       — callback(search: string) — users-tab only
 *   onRoleFilter   — callback(role: string) — users-tab only
 *   onStatusFilter — callback(status: string) — users-tab only
 *   currentFilters — current filter state (for dropdown labels)
 *   onUserCreated  — callback() — triggers a refresh on the users tab after creation
 */
function UserManagementButtons({
  activeTab = 'users',
  onTabChange,
  onSearch,
  onRoleFilter,
  onStatusFilter,
  currentFilters = {},
  onUserCreated,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [createdUserPassword, setCreatedUserPassword] = useState(null);
  const [createdUserEmail, setCreatedUserEmail] = useState('');
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false);
  const [welcomeEmailRequested, setWelcomeEmailRequested] = useState(true);

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'emergency_dispatcher', label: 'Emergency Dispatcher' },
    { value: 'road_observer', label: 'Road Observer' },
    { value: 'node_maintenance_crew', label: 'Node Maintenance Crew' },
  ];
  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onSearch?.(value);
    }, 500);
  };

  const handleCreateUser = async (data) => {
    try {
      const result = await userAPI.createUser(data);
      setIsModalOpen(false);
      setWelcomeEmailRequested(data.sendWelcomeEmail !== false);
      if (result && result.tempPassword) {
        setCreatedUserEmail(result.email || data.email);
        setCreatedUserPassword(result.tempPassword);
        setWelcomeEmailSent(!!result.welcomeEmailSent);
        if (data.sendWelcomeEmail !== false && result.welcomeEmailSent) {
          showSuccess(`User created — welcome email sent to ${result.email || data.email}`);
        } else if (data.sendWelcomeEmail !== false && !result.welcomeEmailSent) {
          showError('User created, but the welcome email could not be sent — share the password below manually');
        }
      } else {
        showSuccess('User created successfully');
      }
      onSearch?.(searchTerm);
      onUserCreated?.();
    } catch (error) {
      console.error('Failed to create user:', error);
      showError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const getRoleLabel = () => {
    if (!currentFilters.role || currentFilters.role === 'all') return 'All Roles';
    const role = roles.find((r) => r.value === currentFilters.role);
    return role ? role.label : 'All Roles';
  };

  const getStatusLabel = () => {
    const status = statuses.find((s) => s.value === currentFilters.status);
    return status ? status.label : 'All Status';
  };

  const tabs = [
    { id: 'users', label: 'User Management' },
    { id: 'activity', label: 'Activity Logs' },
  ];

  return (
    <div>
      {/* ── In-place tab bar ─────────────────────────────────────────────── */}
      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange?.(t.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 shadow-sm transition-colors ${
              activeTab === t.id
                ? 'bg-safe-blue text-white'
                : 'bg-safe-white text-safe-text-gray hover:bg-safe-bg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Search / filter / create row (users tab only) ─────────────────── */}
      {activeTab === 'users' && (
        <div className="flex pt-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <FontAwesomeIcon
                icon="magnifying-glass"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-safe-text-gray text-sm"
              />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-11 pr-4 py-2.5 w-[340px] rounded-lg border border-safe-border bg-safe-dark text-sm text-safe-text-primary placeholder:text-safe-text-muted focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn"
              />
            </div>

            {/* Role filter */}
            <div className="relative">
              <button
                onClick={() => { setShowRoleDropdown(!showRoleDropdown); setShowStatusDropdown(false); }}
                className="text-sm pl-3 pr-3 py-2.5 w-[150px] rounded-lg border bg-safe-white border-safe-border flex items-center justify-between gap-2 text-safe-text-gray hover:bg-safe-bg transition-colors"
              >
                <span className="truncate">{getRoleLabel()}</span>
                <FontAwesomeIcon icon="angle-down" className="text-xs flex-shrink-0" />
              </button>
              {showRoleDropdown && (
                <div className="absolute top-full mt-1 w-[200px] bg-safe-sidebar border border-safe-border rounded-lg z-10">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => { onRoleFilter?.(role.value); setShowRoleDropdown(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-safe-text-gray hover:bg-safe-bg transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status filter */}
            <div className="relative">
              <button
                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowRoleDropdown(false); }}
                className="text-sm pl-3 pr-3 py-2.5 w-[150px] rounded-lg border bg-safe-white border-safe-border flex items-center justify-between gap-2 text-safe-text-gray hover:bg-safe-bg transition-colors"
              >
                <span className="truncate">{getStatusLabel()}</span>
                <FontAwesomeIcon icon="angle-down" className="text-xs flex-shrink-0" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full mt-1 w-[150px] bg-safe-sidebar border border-safe-border rounded-lg z-10">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => { onStatusFilter?.(status.value); setShowStatusDropdown(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-safe-text-gray hover:bg-safe-bg transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 text-white shadow-sm bg-safe-blue hover:bg-safe-blue/90 transition-colors"
            >
              <FontAwesomeIcon icon="user-plus" />
              Create New Account
            </button>
          </div>
        </div>
      )}

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* Temp Password Reveal Modal */}
      {createdUserPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-safe-sidebar rounded-xl border border-safe-gray-light w-full max-w-md mx-4 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-safe-green/10 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon="user-check" className="text-safe-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-safe-text-dark">User Created Successfully</h3>
                <p className="text-xs text-safe-text-gray">
                  {welcomeEmailRequested
                    ? (welcomeEmailSent
                      ? 'A welcome email with these credentials was sent to the user'
                      : 'Welcome email failed to send — share this password with the user manually')
                    : 'Share this temporary password with the user securely'}
                </p>
              </div>
            </div>

            {welcomeEmailRequested && (
              <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs font-medium ${
                welcomeEmailSent
                  ? 'bg-safe-green/10 text-safe-green'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}>
                <FontAwesomeIcon icon={welcomeEmailSent ? 'check-circle' : 'triangle-exclamation'} />
                {welcomeEmailSent ? 'Welcome email delivered' : 'Welcome email not delivered'}
              </div>
            )}

            <div className="bg-safe-bg rounded-lg p-4 mb-4">
              <p className="text-xs text-safe-text-gray mb-1">Email</p>
              <p className="text-sm font-medium text-safe-text-dark">{createdUserEmail}</p>
            </div>

            <div className="bg-safe-bg rounded-lg p-4 mb-5">
              <p className="text-xs text-safe-text-gray mb-1">Temporary Password</p>
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm font-mono font-bold text-safe-text-dark break-all">{createdUserPassword}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdUserPassword);
                    showSuccess('Password copied to clipboard');
                  }}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-safe-blue-btn text-white rounded-lg hover:bg-safe-blue-btn/90 transition-colors"
                >
                  <FontAwesomeIcon icon="copy" className="mr-1" />
                  Copy
                </button>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-5">
              <p className="text-xs text-yellow-800">
                <FontAwesomeIcon icon="triangle-exclamation" className="mr-1" />
                This password will not be shown again. The user must change it on first login.
              </p>
            </div>

            <button
              onClick={() => { setCreatedUserPassword(null); setCreatedUserEmail(''); setWelcomeEmailSent(false); }}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-safe-blue-btn hover:bg-safe-blue-btn/90 rounded-lg transition-colors"
            >
              I&apos;ve Saved the Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementButtons;
