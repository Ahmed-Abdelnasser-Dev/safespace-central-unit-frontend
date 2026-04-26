import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Edit User Modal
 * Security: Validates permissions before allowing edits
 */
function EditAccountInfoModal({ isOpen, onClose, onSubmit, userData, isAdmin = false }) {
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    nationalId: '',
    employeeId: '',
    role: '',
    roleName: '',
  });

  const [errors, setErrors] = useState({});

  // Load user data when modal opens
  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        userId: userData.id || '',
        email: userData.email || '',
        nationalId: userData.nationalId || '',
        employeeId: userData.employeeId || '',
        role: userData.role?.id ? String(userData.role.id) : '',
        roleName: userData.role?.name || '',
      });
    }
  }, [userData, isOpen]);

  // Security: Validate email format
  // const validateEmail = (email) => {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Security: Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!isAdmin && !formData.nationalId) newErrors.nationalId = 'National ID is required';
    if (isAdmin && !formData.role) {newErrors.role = 'Role is required';}
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const updateData = {
        email: formData.email,
      };
      
      // Only admin can update role — send as integer roleId
      if (isAdmin && formData.role) {
        updateData.roleId = parseInt(formData.role, 10);
      }
      
      if (onSubmit) {
        await onSubmit(updateData);
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-slideUp">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-safe-border">
          <h2 className="text-xl font-bold text-safe-text-dark">Edit Account Information</h2>
          <p className="text-sm text-safe-text-gray mt-1">Update user account details</p>
        </div>


        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
            
            {/* Warning message */}
            <div className="p-4 bg-safe-accent/10 border border-safe-accent/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <span className="text-xs font-bold text-safe-dark/70 mb-1">Warning: </span>
                  <span className="text-xs text-safe-text-gray">
                    Changing these fields will immediately affect the user's access permissions.
                  </span>
                </div>
              </div>
            </div>

            {/* User ID (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                User ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.userId}
                  disabled
                  className="w-full px-4 py-2.5 bg-safe-bg border border-safe-border rounded-lg text-safe-text-gray cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                Email Address 
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.anderson@agency.safeg.gov"
                  className={`w-full px-4 py-2.5 bg-safe-bg border rounded-lg text-safe-text-dark placeholder-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 transition-colors ${
                    errors.email ? 'border-safe-danger' : 'border-safe-border'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-safe-danger flex items-center gap-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* National ID (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                National ID
              </label>
              <div className="relative">

                <input
                  type="text"
                  value={formData.nationalId}
                  disabled
                  className="w-full px-4 py-2.5 bg-safe-bg border border-safe-border rounded-lg text-safe-text-gray cursor-not-allowed"
                />
              </div>

            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-safe-text-dark mb-2">
                Role 
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full px-4 py-2.5 bg-safe-bg border rounded-lg text-safe-text-dark focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 transition-colors cursor-pointer ${
                  errors.role ? 'border-safe-danger' : 'border-safe-border'
                }`}
              >
                <option value="">Select role...</option>
                <option value="1">System Administrator</option>
                <option value="2">Emergency Dispatcher</option>
                <option value="3">Road Observer</option>
                <option value="4">Node Maintenance Crew</option>
              </select>
              {formData.roleName && (
                <p className="mt-1 text-xs text-safe-text-gray">
                  Current role: <span className="font-medium text-safe-text-dark capitalize">{formData.roleName.replace(/_/g, ' ')}</span>
                </p>
              )}
              {errors.role && (
                <p className="mt-1.5 text-xs text-safe-danger flex items-center gap-1">
                  {errors.role}
                </p>
              )}
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
              <FontAwesomeIcon icon="save" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAccountInfoModal;