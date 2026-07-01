import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Create New User Modal
 *
 * Admin can either type a temporary password for the new user, or let the
 * backend auto-generate a secure one. Either way, the password is emailed
 * to the new user as part of their welcome email (toggleable).
 */
function CreateUserModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: '',
    nationalId: '',
    roleId: '',
    tempPassword: '',
  });
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 14; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
  };

  const handleToggleAutoGenerate = (checked) => {
    setAutoGenerate(checked);
    if (checked) {
      handleInputChange('tempPassword', '');
    }
  };

  const handleFillGenerated = () => {
    handleInputChange('tempPassword', generateRandomPassword());
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.nationalId) {
      newErrors.nationalId = 'National ID is required';
    } else if (formData.nationalId.length !== 14) {
      newErrors.nationalId = 'National ID must be 14 digits';
    } else if (!/^\d{14}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'National ID must contain only digits';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }

    if (!autoGenerate) {
      if (!formData.tempPassword) {
        newErrors.tempPassword = 'Enter a temporary password or switch to auto-generate';
      } else if (formData.tempPassword.length < 8) {
        newErrors.tempPassword = 'Password must be at least 8 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData = {
        email: formData.email,
        nationalId: formData.nationalId,
        roleId: parseInt(formData.roleId, 10),
        sendWelcomeEmail,
        // Only send a password if the admin typed one — otherwise backend generates it
        ...(!autoGenerate && formData.tempPassword ? { tempPassword: formData.tempPassword } : {}),
      };

      if (onSubmit) {
        onSubmit(submitData);
      }

      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ email: '', nationalId: '', roleId: '', tempPassword: '' });
    setErrors({});
    setAutoGenerate(true);
    setSendWelcomeEmail(true);
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-safe-sidebar rounded-xl border border-safe-gray-light w-full max-w-2xl mx-4 animate-slideUp">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-safe-border">
          <h2 className="text-xl font-bold text-safe-text-dark">Create New User</h2>
          <p className="text-sm text-safe-text-gray mt-1">
            Set a temporary password, or let the system generate one for you.
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                Email Address <span className="text-safe-danger">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@agency.safeg.gov"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full px-4 py-2.5 bg-safe-bg border rounded-lg text-safe-text-dark placeholder-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 transition-colors ${
                  errors.email ? 'border-safe-danger' : 'border-safe-border'
                }`}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-safe-danger flex items-center gap-1">
                  <FontAwesomeIcon icon="exclamation-triangle" className="text-[10px]" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                National ID <span className="text-safe-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => handleInputChange('nationalId', e.target.value.replace(/\D/g, ''))}
                placeholder="14-digit national ID"
                maxLength={14}
                aria-invalid={!!errors.nationalId}
                aria-describedby={errors.nationalId ? 'nationalId-error' : undefined}
                className={`w-full px-4 py-2.5 bg-safe-bg border rounded-lg text-safe-text-dark placeholder-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 transition-colors ${
                  errors.nationalId ? 'border-safe-danger' : 'border-safe-border'
                }`}
              />
              {errors.nationalId && (
                <p id="nationalId-error" className="mt-1.5 text-xs text-safe-danger flex items-center gap-1">
                  <FontAwesomeIcon icon="exclamation-triangle" className="text-[10px]" />
                  {errors.nationalId}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                Role <span className="text-safe-danger">*</span>
              </label>
              <select
                value={formData.roleId}
                onChange={(e) => handleInputChange('roleId', e.target.value)}
                aria-invalid={!!errors.roleId}
                aria-describedby={errors.roleId ? 'roleId-error' : undefined}
                className={`w-full px-4 py-2.5 bg-safe-bg border rounded-lg text-safe-text-dark focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 transition-colors cursor-pointer ${
                  errors.roleId ? 'border-safe-danger' : 'border-safe-border'
                }`}
              >
                <option value="">Select role...</option>
                <option value="1">System Administrator</option>
                <option value="2">Emergency Dispatcher</option>
                <option value="3">Road Observer</option>
                <option value="4">Node Maintenance Crew</option>
              </select>
              {errors.roleId && (
                <p id="roleId-error" className="mt-1.5 text-xs text-safe-danger flex items-center gap-1">
                  <FontAwesomeIcon icon="exclamation-triangle" className="text-[10px]" />
                  {errors.roleId}
                </p>
              )}
            </div>

            {/* Temporary Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-safe-text-dark">
                  Temporary Password {!autoGenerate && <span className="text-safe-danger">*</span>}
                </label>
                <label className="flex items-center gap-2 text-xs text-safe-text-gray cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(e) => handleToggleAutoGenerate(e.target.checked)}
                    className="rounded border-safe-border text-safe-blue-btn focus:ring-safe-blue-btn/30"
                  />
                  Auto-generate
                </label>
              </div>

              {autoGenerate ? (
                <div className="px-4 py-2.5 bg-safe-bg border border-dashed border-safe-border rounded-lg text-sm text-safe-text-gray italic">
                  A secure password will be generated automatically
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.tempPassword}
                      onChange={(e) => handleInputChange('tempPassword', e.target.value)}
                      placeholder="Enter a temporary password (min 8 characters)"
                      aria-invalid={!!errors.tempPassword}
                      aria-describedby={errors.tempPassword ? 'tempPassword-error' : undefined}
                      className={`w-full px-4 py-2.5 pr-28 bg-safe-bg border rounded-lg text-safe-text-dark placeholder-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 transition-colors ${
                        errors.tempPassword ? 'border-safe-danger' : 'border-safe-border'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="px-2 py-1.5 text-xs text-safe-text-gray hover:text-safe-text-dark transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <FontAwesomeIcon icon={showPassword ? 'eye-slash' : 'eye'} />
                      </button>
                      <button
                        type="button"
                        onClick={handleFillGenerated}
                        className="px-2.5 py-1.5 text-xs font-medium bg-white border border-safe-border rounded-md text-safe-text-gray hover:bg-safe-bg transition-colors"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  {errors.tempPassword && (
                    <p id="tempPassword-error" className="mt-1.5 text-xs text-safe-danger flex items-center gap-1">
                      <FontAwesomeIcon icon="exclamation-triangle" className="text-[10px]" />
                      {errors.tempPassword}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Send welcome email toggle */}
            <label className="flex items-start gap-3 p-3 bg-safe-blue-btn/5 border border-safe-blue-btn/20 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                className="mt-0.5 rounded border-safe-border text-safe-blue-btn focus:ring-safe-blue-btn/30"
              />
              <span className="text-xs text-safe-text-gray">
                <span className="font-medium text-safe-text-dark block mb-0.5">Send welcome email</span>
                The new user will receive their login email and temporary password by email, with a link to sign in.
                The user must change this password on first login.
              </span>
            </label>

          </div>

          {/* Modal Footer */}
          <div className="px-8 py-5 bg-safe-bg/40 border-t border-safe-border rounded-b-xl flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-medium text-safe-text-primary bg-safe-gray border border-safe-gray-light hover:bg-safe-gray-light/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-safe-blue-btn hover:bg-safe-blue-btn/90 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon="user-plus" />
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;