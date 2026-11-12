import React, { useState } from 'react';
import {
  FaTimes,
  FaMapMarkerAlt,
  FaCamera,
  FaUpload,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { locationApi } from '../../services/assetApi';

const LocationUpdateModal = ({ asset, shipment, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    location_type: 'IN_TRANSIT',
    location_name: '',
    city: '',
    country: '',
    port_airport: '',
    coordinates_lat: '',
    coordinates_lng: '',
    status: 'IN_TRANSIT',
    description: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const locationTypes = [
    { value: 'ORIGIN', label: 'Origin' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'PORT', label: 'Port/Airport' },
    { value: 'CUSTOMS', label: 'Customs Clearance' },
    { value: 'WAREHOUSE', label: 'Warehouse' },
    { value: 'DESTINATION', label: 'Destination' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Photo size must be less than 10MB');
        return;
      }

      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates_lat: position.coords.latitude.toFixed(8),
            coordinates_lng: position.coords.longitude.toFixed(8),
          }));
        },
        (err) => {
          setError('Unable to get current location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!asset) {
      setError('No asset selected');
      return;
    }

    if (!formData.location_name || !formData.city || !formData.country) {
      setError('Location name, city, and country are required');
      return;
    }

    if (!formData.coordinates_lat || !formData.coordinates_lng) {
      setError('Coordinates are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create location update
      const locationData = {
        shipment_id: shipment?.id,
        location_type: formData.location_type,
        location_name: formData.location_name,
        city: formData.city,
        country: formData.country,
        port_airport: formData.port_airport,
        coordinates_lat: parseFloat(formData.coordinates_lat),
        coordinates_lng: parseFloat(formData.coordinates_lng),
        status: formData.status,
        description: formData.description,
      };

      const response = await locationApi.addLocation(asset.asset_id, locationData);

      if (response.success) {
        setSuccess(true);

        // Upload photo if provided
        if (photoFile && response.data && response.data.id) {
          await locationApi.uploadLocationPhoto(response.data.id, photoFile);
        }

        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      location_type: 'IN_TRANSIT',
      location_name: '',
      city: '',
      country: '',
      port_airport: '',
      coordinates_lat: '',
      coordinates_lng: '',
      status: 'IN_TRANSIT',
      description: '',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-gray-800 rounded-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaMapMarkerAlt className="text-cyan-400" />
            Update Asset Location
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400 text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-400">
              <FaCheck className="text-lg" />
              <span>Location updated successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
              <FaExclamationTriangle className="text-lg" />
              <span>{error}</span>
            </div>
          )}

          {/* Asset Info */}
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">Asset</p>
            <p className="text-white font-semibold">{asset?.assetName}</p>
            <p className="text-xs text-gray-500">{asset?.assetRef}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Location Type *
              </label>
              <select
                name="location_type"
                value={formData.location_type}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {locationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleInputChange}
                placeholder="e.g., Mombasa Port, Nairobi Warehouse"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* City and Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Mombasa"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g., Kenya"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Port/Airport */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Port/Airport (Optional)
              </label>
              <input
                type="text"
                name="port_airport"
                value={formData.port_airport}
                onChange={handleInputChange}
                placeholder="e.g., KMBT (Mombasa), JKIA (Nairobi)"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Coordinates */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Coordinates *
              </label>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <input
                  type="number"
                  name="coordinates_lat"
                  value={formData.coordinates_lat}
                  onChange={handleInputChange}
                  placeholder="Latitude"
                  step="0.00000001"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="number"
                  name="coordinates_lng"
                  value={formData.coordinates_lng}
                  onChange={handleInputChange}
                  placeholder="Longitude"
                  step="0.00000001"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <FaMapMarkerAlt className="text-xs" />
                Use Current Location (GPS)
              </button>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="IN_TRANSIT">In Transit</option>
                <option value="CUSTOMS">Customs Clearance</option>
                <option value="STORAGE">Storage</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add any additional notes about this location update..."
                rows="3"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Evidence Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-cyan-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FaCamera className="text-gray-500 text-2xl" />
                  <span className="text-sm text-gray-400">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG, WebP (Max 10MB)
                  </span>
                </label>
              </div>

              {/* Photo Preview */}
              {photoPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Preview</p>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="mt-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaUpload className="text-sm" />
            {loading ? 'Updating...' : 'Update Location'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationUpdateModal;
