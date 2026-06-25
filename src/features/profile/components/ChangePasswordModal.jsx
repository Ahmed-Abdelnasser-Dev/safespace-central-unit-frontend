import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { showSuccess, showError } from '@/utils/toast';
import { fetchCurrentUser } from '@/features/auth/authSlice';
import PasswordInput from './PasswordInput.jsx';
import PasswordStrengthSection from './PasswordStrengthSection.jsx';

/**
 * Change Password Modal
 * Allows users to update their password with validation
 */
function ChangePasswordModal({ isOpen, onClose, isMandatory = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validatePassword = (password) => {
    const errs = [];
    if (password.length < 8) errs.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errs.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errs.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) errs.push('Password must contain at least one number');
    if (!/[!@#$%^&*]/.test(password)) errs.push('Password must contain at least one special character (!@#$%^&*)');
    return errs;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) newErrors.newPassword = passwordErrors[0];
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      await dispatch(fetchCurrentUser()).unwrap();
      showSuccess('Password changed successfully! Redirecting...');
      handleClose();
      navigate('/map', { replace: true });
    } catch (error) {
      console.error('Password change error:', error);
      if (error.response?.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        showError(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const getPasswordStrength = (password) => {
    const errs = validatePassword(password);
    if (!password) return { strength: 0, label: '', color: '' };
    if (errs.length === 0) return { strength: 100, label: 'Strong', color: 'text-safe-green' };
    if (errs.length <= 2) return { strength: 60, label: 'Medium', color: 'text-yellow-500' };
    return { strength: 30, label: 'Weak', color: 'text-safe-danger' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-safe-sidebar rounded-xl border border-safe-gray-light max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-safe-text-primary">Change Password</h3>
            <p className="text-xs text-safe-text-muted mt-1">
              {isMandatory ? 'You must set a new password to continue' : 'Update your account password'}
            </p>
          </div>
          {!isMandatory && (
            <button onClick={handleClose} className="text-safe-text-muted hover:text-safe-text-primary transition-colors">
              <FontAwesomeIcon icon="xmark" className="text-xl" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Current Password *"
            value={formData.currentPassword}
            onChange={(v) => handleInputChange('currentPassword', v)}
            error={errors.currentPassword}
            placeholder="Enter current password"
            showPassword={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
          />

          <div>
            <PasswordInput
              label="New Password *"
              value={formData.newPassword}
              onChange={(v) => handleInputChange('newPassword', v)}
              error={errors.newPassword}
              placeholder="Enter new password"
              showPassword={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
            />
            <PasswordStrengthSection
              password={formData.newPassword}
              strength={passwordStrength}
            />
          </div>

          <PasswordInput
            label="Confirm New Password *"
            value={formData.confirmPassword}
            onChange={(v) => handleInputChange('confirmPassword', v)}
            error={errors.confirmPassword}
            placeholder="Confirm new password"
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <div className="flex gap-3 pt-4">
            {!isMandatory && (
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-safe-text-primary bg-safe-gray border border-safe-gray-light rounded-lg hover:bg-safe-gray-light/50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-safe-blue-btn rounded-lg hover:bg-safe-blue-btn/90 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;