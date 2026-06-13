import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateUserProfile, fetchCurrentUser } from '@/features/auth/authSlice';
import { showSuccess, showError } from '@/utils/toast';
import { userAPI } from '@/services/api';
import { formatEgyptianPhone, formatEgyptianNID } from '@/utils/egyptianValidation';
import ProfileHeroCard from './ProfileHeroCard';
import PersonalInfoCard from './PersonalInfoCard';
import AccountInfoCard from './AccountInfoCard';
import RecentActivityCard from './RecentActivityCard';
import SecuritySettingsCard from './SecuritySettingsCard';
import EditPersonalInfoModal from './EditPersonalInfoModal';
import EditAccountInfoModal from '@/features/admin/components/EditAccountInfoModal';
import ChangePasswordModal from './ChangePasswordModal';
import { API_BASE_URL } from '@/lib/apiConfig';

function Profile({ onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, mustChangePassword } = useSelector((state) => state.auth);

  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(
    location.state?.mustChangePassword === true
  );
  const [passwordJustChanged, setPasswordJustChanged] = useState(false);

  // Prevent navigation away when mustChangePassword is true
  useEffect(() => {
    if (!mustChangePassword && !location.state?.mustChangePassword) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [mustChangePassword, location.state]);

  const isAdmin = user?.role?.name === 'admin';

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }

    try {
      await userAPI.updatePhoto(file);
      dispatch(fetchCurrentUser());
      showSuccess('Profile photo updated successfully');
    } catch (error) {
      console.error('Photo upload error:', error);
      showError('Failed to update profile photo');
    }
  };

  const handlePersonalInfoSubmit = async (updatedData) => {
    try {
      await dispatch(updateUserProfile(updatedData)).unwrap();
      showSuccess('Personal information updated successfully');
      setIsPersonalModalOpen(false);
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      showError(error || 'Failed to update personal information');
    }
  };

  const handleAccountInfoSubmit = async (updatedData) => {
    try {
      await userAPI.updateUser(user.id, updatedData);
      showSuccess('Account information updated successfully');
      setIsAccountModalOpen(false);
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to update account information');
    }
  };

  const handlePasswordModalClose = async () => {
    setIsPasswordModalOpen(false);
    if (mustChangePassword || location.state?.mustChangePassword) {
      await dispatch(fetchCurrentUser()).unwrap();
      setPasswordJustChanged(true);
      navigate('/profile', { replace: true, state: {} });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-safe-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safe-blue-btn mx-auto mb-4"></div>
          <p className="text-safe-text-gray">Loading profile...</p>
        </div>
      </div>
    );
  }

  const photoUrl = user.profilePhotoUrl
    ? user.profilePhotoUrl.startsWith('http')
      ? user.profilePhotoUrl
      : `${API_BASE_URL}${user.profilePhotoUrl}`
    : null;

  const profile = {
    fullName: user.fullName || 'Not set',
    username: user.username || user.email?.split('@')[0] || 'user',
    avatar: user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user.email?.[0]?.toUpperCase() || 'U',
    role: user.role?.name || 'User',
    location: user.officeLocation || 'Not set',
    email: user.email,
    phone: user.phone ? formatEgyptianPhone(user.phone) : 'Not set',
    memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown',
    phoneNumber: user.phone ? formatEgyptianPhone(user.phone) : 'Not set',
    birthDate: user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'Not set',
    gender: user.gender || 'Not set',
    department: user.department || 'Not set',
    officeLocation: user.officeLocation || 'Not set',
    address: user.address || 'Not set',
    userId: user.employeeId || user.id,
    nationalId: user.nationalId ? formatEgyptianNID(user.nationalId) : 'Not set',
  };

  const recentActivity = [
    {
      id: 1, icon: 'circle-user', iconColor: 'text-safe-green', iconBg: 'bg-safe-white',
      title: 'Logged in',
      subtitle: user.lastLoginAt
        ? `${new Date(user.lastLoginAt).toLocaleString()} • ${profile.officeLocation}`
        : 'No login history'
    },
    {
      id: 2, icon: 'pen-to-square', iconColor: 'text-safe-blue-btn', iconBg: 'bg-safe-white',
      title: 'Updated profile information',
      subtitle: user.updatedAt && user.createdAt && new Date(user.updatedAt).getTime() - new Date(user.createdAt).getTime() > 5000
        ? `${new Date(user.updatedAt).toLocaleString()} • ${profile.officeLocation}`
        : 'No updates yet'
    },
    {
      id: 3, icon: 'lock', iconColor: 'text-safe-accent', iconBg: 'bg-safe-white',
      title: 'Password changed',
      subtitle: user.passwordChangedAt
        ? `${new Date(user.passwordChangedAt).toLocaleDateString()} • ${profile.officeLocation}`
        : user.mustChangePassword ? 'Password change required' : 'Default password — please change it'
    }
  ];

  const showMustChangePasswordBanner = (mustChangePassword || location.state?.mustChangePassword) && !isPasswordModalOpen;

  return (
    <div className="flex-1 overflow-y-auto bg-safe-bg p-7 space-y-5">

      {/* Banners */}
      {showMustChangePasswordBanner && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-4 flex items-center gap-4">
          <FontAwesomeIcon icon="triangle-exclamation" className="text-yellow-500 text-lg flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">Password Change Required</p>
            <p className="text-xs text-yellow-700 mt-0.5">You must change your password before continuing.</p>
          </div>
          <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 text-xs font-semibold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors flex-shrink-0">
            Change Now
          </button>
        </div>
      )}

      {passwordJustChanged && !mustChangePassword && (
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-4 flex items-start gap-3">
          <FontAwesomeIcon icon="circle-info" className="text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900">Password Updated Successfully!</h4>
            <p className="text-sm text-blue-700 mt-1">Please continue and complete your profile details below.</p>
          </div>
          <button type="button" onClick={() => setPasswordJustChanged(false)} className="text-blue-600 hover:text-blue-800 transition-colors">
            <FontAwesomeIcon icon="xmark" className="text-lg" />
          </button>
        </div>
      )}

      {/* Cards */}
      <ProfileHeroCard profile={profile} photoUrl={photoUrl} onPhotoUpload={handlePhotoUpload} />

      <div className="grid grid-cols-2 gap-5">
        <PersonalInfoCard profile={profile} onEdit={() => setIsPersonalModalOpen(true)} />
        <AccountInfoCard profile={profile} isAdmin={isAdmin} onEdit={() => setIsAccountModalOpen(true)} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <RecentActivityCard activities={recentActivity} />
        <SecuritySettingsCard onChangePassword={() => setIsPasswordModalOpen(true)} onLogout={onLogout} />
      </div>

      {/* Modals */}
      <EditPersonalInfoModal isOpen={isPersonalModalOpen} onClose={() => setIsPersonalModalOpen(false)} userData={user} onSubmit={handlePersonalInfoSubmit} />
      <EditAccountInfoModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} userData={user} onSubmit={handleAccountInfoSubmit} isAdmin={isAdmin} />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={handlePasswordModalClose} isMandatory={!!(mustChangePassword || location.state?.mustChangePassword)} />
    </div>
  );
}

export default Profile;
