import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { validateEgyptianPhone } from '@/utils/egyptianValidation';

/**
 * Edit Personal Information Modal
 * Security: Client-side validation (server must re-validate)
 */
function EditPersonalInfoModal({ isOpen, onClose, onSubmit, userData }) {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    birthdate: '',
    gender: '',
    department: '',
    officeLocation: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  // Load user data when modal opens
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        username: userData.username || '',
        phone: userData.phone || '',
        birthdate: userData.birthdate || '',
        gender: userData.gender || '',
        department: userData.department || '',
        officeLocation: userData.officeLocation || '',
        address: userData.address || ''
      });
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const { valid, error: phoneError } = validateEgyptianPhone(formData.phone);
      if (!valid) newErrors.phone = phoneError;
    }
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.officeLocation) newErrors.officeLocation = 'Office location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      if (onSubmit) {
        onSubmit(formData);
      }

      handleClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-safe-sidebar rounded-xl border border-safe-gray-light w-full max-w-2xl mx-4 animate-slideUp">

        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-safe-gray-light">
          <h2 className="text-xl font-bold text-safe-text-primary">
            Edit Personal Information
          </h2>
          <p className="text-sm text-safe-text-muted mt-1">
            Update your personal profile details
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto">

            {/* Admin-only note */}
            <div className="p-4 bg-safe-blue-btn/10 border border-safe-blue-btn/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <span className="text-xs font-bold text-safe-text-primary/70 mb-1">Note: </span>
                  <span className="text-xs text-safe-text-muted">
                    Email address and user role can only be modified by an administrator.
                  </span>
                </div>
              </div>
            </div>


            {/* Full Name */}
            <InputField
              label="Full Name"
              value={formData.fullName}
              error={errors.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />

            {/* Username */}
            <InputField
              label="Username"
              value={formData.username}
              error={errors.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />

            {/* Phone Number */}
            <InputField
              label="Phone Number"
              value={formData.phone}
              error={errors.phone}
              placeholder="01X XXXX XXXX"
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-safe-text-primary mb-2">
                Birth Date
              </label>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                className="w-full px-4 py-2.5 bg-safe-gray border border-safe-gray-light text-safe-text-primary rounded-lg focus:ring-2 focus:ring-safe-blue-btn/30"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-safe-text-primary mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-2.5 bg-safe-gray border border-safe-gray-light text-safe-text-primary rounded-lg cursor-pointer focus:ring-2 focus:ring-safe-blue-btn/30"
              >
                <option value="">Select gender...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            {/* Department */}
            <InputField
              label="Department"
              value={formData.department}
              error={errors.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
            />

            {/* Office Location */}
            <InputField
              label="Office Location"
              value={formData.officeLocation}
              error={errors.officeLocation}
              onChange={(e) => handleInputChange('officeLocation', e.target.value)}
            />

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-safe-text-primary mb-2">
                Address
              </label>
              <textarea
                rows="3"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2.5 bg-safe-gray border border-safe-gray-light text-safe-text-primary rounded-lg resize-none focus:ring-2 focus:ring-safe-blue-btn/30"
              />
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-8 py-5 bg-safe-gray/40 border-t border-safe-gray-light rounded-b-xl flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-medium text-safe-text-primary bg-safe-sidebar border border-safe-gray-light hover:bg-safe-gray rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-safe-blue-btn hover:bg-safe-blue-btn/90 rounded-lg flex items-center gap-2"
            >
              <FontAwesomeIcon icon="save" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Reusable Input Field ── */
function InputField({ label, value, error, onChange, placeholder = '' }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-safe-text-primary mb-2">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full px-4 py-2.5 bg-safe-gray border rounded-lg text-safe-text-primary focus:ring-2 focus:ring-safe-blue-btn/30 ${
          error ? 'border-safe-danger' : 'border-safe-gray-light'
        }`}
      />
      {error && <p id={errorId} className="mt-1.5 text-xs text-safe-danger">{error}</p>}
    </div>
  );
}

export default EditPersonalInfoModal;
