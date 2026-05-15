import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Create New User Modal
 *
 * The backend auto-generates a secure temporary password on user creation.
 * We do NOT send a password from here — that was the bug causing a mismatch
 * between what was shown in the modal and what was actually set by the backend.
 */
function CreateUserModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: '',
    nationalId: '',
    roleId: '',
  });

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
        // No password — backend generates it and returns it as tempPassword
      };

      if (onSubmit) {
        onSubmit(submitData);
      }

      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ email: '', nationalId: '', roleId: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-slideUp">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-safe-border">
          <h2 className="text-xl font-bold text-safe-text-dark">Create New User</h2>
          <p className="text-sm text-safe-text-gray mt-1">
            A secure temporary password will be auto-generated and shown once after creation.
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

            {/* Password info notice */}
            <div className="p-3 bg-safe-blue-btn/5 border border-safe-blue-btn/20 rounded-lg flex items-start gap-2">
              <FontAwesomeIcon icon="shield-halved" className="text-safe-blue-btn mt-0.5 flex-shrink-0" />
              <p className="text-xs text-safe-text-gray">
                A cryptographically secure temporary password will be generated automatically by the system.
                It will be shown to you <strong className="text-safe-text-dark">once</strong> after the user is created — copy and share it securely with the user.
              </p>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-8 py-5 bg-safe-bg/40 border-t border-safe-border rounded-b-xl flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-medium text-safe-text-dark bg-white border border-safe-border hover:bg-safe-bg rounded-lg transition-colors"
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