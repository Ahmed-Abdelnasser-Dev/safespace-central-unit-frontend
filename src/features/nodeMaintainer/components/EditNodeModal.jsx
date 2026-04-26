/**
 * EditNodeModal Component
 * Modal for editing node properties (name, IP, location, etc.)
 */

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

/**
 * EditNodeModal - Form for editing node configuration
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {function} props.onClose - Callback when modal closes
 * @param {function} props.onSave - Callback when form is submitted
 * @param {Object} props.node - Node data to edit
 * @param {boolean} props.isLoading - Loading state during save
 * @param {string} props.error - Error message if save failed
 */
function EditNodeModal({ isOpen, onClose, onSave, node, isLoading = false, error = null }) {
  const [formData, setFormData] = useState({
    name: '',
    nodeId: '',
    ipAddress: '',
    address: '',
    latitude: 0,
    longitude: 0,
    videoFeedUrl: '',
  });

  // Initialize form with node data
  useEffect(() => {
    if (node) {
      const location = node.location || {};
      setFormData({
        name: node.name || '',
        nodeId: node.nodeId || node.id || '',
        ipAddress: node.ipAddress || '',
        address: location.address || node.streetName || '',
        latitude: typeof node.latitude === 'number' ? node.latitude : (location.latitude || 0),
        longitude: typeof node.longitude === 'number' ? node.longitude : (location.longitude || 0),
        videoFeedUrl: node.videoFeedUrl || '',
      });
    }
  }, [node, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      name: formData.name,
      ipAddress: formData.ipAddress,
      videoFeedUrl: formData.videoFeedUrl,
      streetName: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      location: {
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
    });
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Node Configuration</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <span className="text-lg font-semibold">x</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="e.g., Highway-01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node ID
                </label>
                <input
                  type="text"
                  name="nodeId"
                  value={formData.nodeId}
                  onChange={handleChange}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="safe-space-node-001"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="e.g., Main Street"
                />
              </div>
            </div>
          </div>

          {/* Location & Network */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Location & Network</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="192.168.1.100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Feed URL
                </label>
                <input
                  type="url"
                  name="videoFeedUrl"
                  value={formData.videoFeedUrl}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="http://192.168.1.100:8080/mjpeg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  disabled={isLoading}
                  step="0.000001"
                  min="-90"
                  max="90"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  disabled={isLoading}
                  step="0.000001"
                  min="-180"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>



          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default EditNodeModal;
