import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '@/services/api';
import CreateUserModal from './CreateUserModal';
import { showSuccess, showError } from '@/utils/toast';

            <button type="button" className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 text-white shadow-sm bg-safe-blue">
 * Search Bar and filters for users management
 */

function UserManagementButtons({ onSearch, onRoleFilter, onStatusFilter, currentFilters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const roles = [
        { value: 'all', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'emergency_dispatcher', label: 'Emergency Dispatcher' },
        { value: 'road_observer', label: 'Road Observer' },
        { value: 'node_maintenance_crew', label: 'Node Maintenance Crew' }
    ];
    const statuses = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Debounce search - call parent after user stops typing
        if (window.searchTimeout) clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            onSearch(value);
        }, 500);
    };

    const [createdUserPassword, setCreatedUserPassword] = useState(null);
    const [createdUserEmail, setCreatedUserEmail] = useState('');

    const handleCreateUser = async (data) => {
        try {
            const result = await userAPI.createUser(data);
            setIsModalOpen(false);
            // Show the temp password that the backend generated
            if (result && result.tempPassword) {
                setCreatedUserEmail(result.email || data.email);
                setCreatedUserPassword(result.tempPassword);
            } else {
                showSuccess('User created successfully');
            }
            onSearch(searchTerm);
        } catch (error) {
            console.error('Failed to create user:', error);
            showError(error.response?.data?.message || 'Failed to create user');
        }
    };

    const getRoleLabel = () => {
        if (!currentFilters.role || currentFilters.role === 'all') return 'All Roles';
        const role = roles.find(r => r.value === currentFilters.role);
        return role ? role.label : 'All Roles';
    };

    const getStatusLabel = () => {
        const status = statuses.find(s => s.value === currentFilters.status);
        return status ? status.label : 'All Status';
    };

    return (
        <div>
          {/* navigation buttons */}
          <div>
              {/* Buttons */}
              <div className="mt-6 flex gap-2">
                <button className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 text-white shadow-sm bg-safe-blue">
                    User Management
                </button>
                <Link 
                    to="/activity-logs"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 text-safe-text-gray shadow-sm bg-safe-white hover:bg-safe-bg transition-colors"
                >
                    Activity Logs
                </Link>
              </div>
          </div>
          
          <div className='flex pt-6 '>
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                <button type="button"
                        icon="magnifying-glass" 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-safe-text-gray text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Search by name, email or ID..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-11 pr-4 py-2.5 w-[340px] rounded-lg border border-safe-border text-sm text-safe-text-dark placeholder:text-safe-text-gray focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn"
                    />
                </div>

                {/* Role Dropdown */}
                <div className="relative">
                    <button 
                        type="button"
                        onClick={() => {
                            setShowRoleDropdown(!showRoleDropdown);
                            setShowStatusDropdown(false);
                        }}
                        className="text-sm pl-3 pr-3 py-2.5 w-[150px] rounded-lg border bg-safe-white border-safe-border flex items-center justify-between gap-2 text-safe-text-gray hover:bg-safe-bg transition-colors"
                    >
                        <span className="truncate">{getRoleLabel()}</span>
                        <FontAwesomeIcon icon="angle-down" className="text-xs flex-shrink-0" />
                    </button>
                    {showRoleDropdown && (
                        <div className="absolute top-full mt-1 w-[200px] bg-white border border-safe-border rounded-lg shadow-lg z-10">
                            {roles.map((role) => (
                                <button
                                    type="button"
                                    key={role.value}
                                    onClick={() => {
                                        onRoleFilter(role.value);
                                        setShowRoleDropdown(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-safe-text-gray hover:bg-safe-bg transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                    <button 
                        type="button"
                        onClick={() => {
                            setShowStatusDropdown(!showStatusDropdown);
                            setShowRoleDropdown(false);
                        }}
                        className="text-sm pl-3 pr-3 py-2.5 w-[150px] rounded-lg border bg-safe-white border-safe-border flex items-center justify-between gap-2 text-safe-text-gray hover:bg-safe-bg transition-colors"
                    >
                        <span className="truncate">{getStatusLabel()}</span>
                        <FontAwesomeIcon icon="angle-down" className="text-xs flex-shrink-0" />
                    </button>
                    {showStatusDropdown && (
                        <div className="absolute top-full mt-1 w-[150px] bg-white border border-safe-border rounded-lg shadow-lg z-10">
                            {statuses.map((status) => (
                                <button
                                    type="button"
                                    key={status.value}
                                    onClick={() => {
                                        onStatusFilter(status.value);
                                        setShowStatusDropdown(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-safe-text-gray hover:bg-safe-bg transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <div className='ml-auto'>
                {/* Create new Account */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 text-white shadow-sm bg-safe-blue hover:bg-safe-blue/90 transition-colors"
                >
                    <FontAwesomeIcon icon="user-plus" />
                    Create New Account
                </button>
            </div>
          </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateUser}
            />

            {/* Temp Password Reveal Modal */}
            {createdUserPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-safe-green/10 flex items-center justify-center flex-shrink-0">
                                <FontAwesomeIcon icon="user-check" className="text-safe-green" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-safe-text-dark">User Created Successfully</h3>
                                <p className="text-xs text-safe-text-gray">Share this temporary password with the user securely</p>
                            </div>
                        </div>

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
                            onClick={() => { setCreatedUserPassword(null); setCreatedUserEmail(''); }}
                            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-safe-blue-btn hover:bg-safe-blue-btn/90 rounded-lg transition-colors"
                        >
                            I've Saved the Password
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagementButtons;