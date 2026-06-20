import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


/**
 * Create New User Modal
 * Security: All inputs validated, passwords handled securely
 */
function CreateUserModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: '',
    nationalId: '',
    roleId: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Security: Generate secure random password
  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < 16; i++) {
      password += charset[array[i] % charset.length];
    }
    
    setFormData(prev => ({ ...prev, password }));
  };

  // Security: Validate email format
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

  // Security: Comprehensive form validation
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
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
        password: formData.password,
      };
      
      if (onSubmit) {
        onSubmit(submitData);
      }
      
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      nationalId: '',
      roleId: '',
      password: ''
    });
    setErrors({});
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
          <p className="text-sm text-safe-text-gray mt-1">Employee ID will be auto-generated based on role</p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                Email Address <span className="text-safe-danger">*</span>
              </label>
              <div className="relative">
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
              </div>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                Temporary Password <span className="text-safe-danger">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    readOnly
                    placeholder="Click Generate to create secure password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={`w-full pl-4 pr-10 py-2.5 bg-safe-bg border rounded-lg text-safe-text-dark focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 transition-colors ${
                      errors.password ? 'border-safe-danger' : 'border-safe-border'
                    }`}
                  />
                  {formData.password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-safe-text-gray hover:text-safe-text-dark transition-colors"
                    >
                      <FontAwesomeIcon icon={showPassword ? 'eye-slash' : 'eye'} className="text-sm" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-4 py-2.5 bg-safe-bg border border-safe-border text-safe-text-dark font-medium rounded-lg hover:bg-safe-bg/80 transition-colors whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-safe-danger flex items-center gap-1">
                  <FontAwesomeIcon icon="exclamation-triangle" className="text-[10px]" />
                  {errors.password}
                </p>
              )}
              {formData.password && !errors.password && (
                <div className="mt-3 p-3 bg-safe-green/10 border border-safe-green/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon="shield-halved" className="text-safe-green mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-safe-green mb-1">Secure Password Generated</p>
                      <p className="text-xs text-safe-text-gray">
                        Send this password securely to the user. They will be required to change it on first login.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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