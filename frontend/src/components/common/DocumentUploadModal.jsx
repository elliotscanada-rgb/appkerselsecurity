import React, { useState, useEffect } from 'react';
import { FaFileUpload, FaTimes, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { documentApi } from '../../services/assetApi';

/**
 * DocumentUploadModal - Reusable modal for uploading documents with description
 * Used by admins to upload documents for consignments or clients
 * 
 * Props:
 * - consignmentId: (optional) Upload to specific consignment
 * - clientId: (optional) Upload to specific client
 * Note: Either consignmentId OR clientId must be provided
 */
const DocumentUploadModal = ({ isOpen, onClose, consignmentId, clientId, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    document_type: 'invoice',
    description: '',
    file: null,
  });
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Document type options
  const documentTypes = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'contract', label: 'Contract' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'appraisal', label: 'Appraisal' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'customs', label: 'Customs Document' },
    { value: 'identification', label: 'ID Document' },
    { value: 'proof_of_ownership', label: 'Proof of Ownership' },
    { value: 'other', label: 'Other' },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        document_type: 'invoice',
        description: '',
        file: null,
      });
      setFileName('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, file });
      setFileName(file.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description');
      return;
    }

    if (!consignmentId && !clientId) {
      setError('Either Consignment ID or Client ID is required');
      return;
    }

    try {
      setUploading(true);

      // Create FormData for multipart upload
      const uploadData = new FormData();
      
      // Add either consignment or client ID
      if (consignmentId) {
        uploadData.append('consignment', consignmentId);
      } else if (clientId) {
        uploadData.append('client', clientId);
      }
      
      uploadData.append('document_type', formData.document_type);
      uploadData.append('description', formData.description);
      uploadData.append('file', formData.file);

      // Upload document using appropriate API method
      let result;
      if (clientId) {
        result = await documentApi.uploadClientDocument(uploadData);
      } else {
        result = await documentApi.uploadDocument(uploadData);
      }

      console.log('Document uploaded successfully:', result);
      setSuccess(true);

      // Close modal after brief delay
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaFileUpload className="text-cyan-400" />
            Upload Document
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-white transition disabled:opacity-50"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-900/40 border border-green-500/50 rounded-lg flex items-center gap-3">
            <FaCheckCircle className="text-green-400 text-xl" />
            <p className="text-green-300 font-semibold">Document uploaded successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-900/40 border border-red-500/50 rounded-lg flex items-center gap-3">
            <FaExclamationCircle className="text-red-400 text-xl" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Document Type <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              disabled={uploading}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition disabled:opacity-50"
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter document description..."
              rows={3}
              disabled={uploading}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition resize-none disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Brief description of the document and its purpose
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              File <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed rounded-lg transition cursor-pointer ${
                  uploading
                    ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50'
                    : 'border-gray-600 bg-gray-800 hover:border-cyan-400 hover:bg-gray-700'
                }`}
              >
                <FaFileUpload className="text-3xl text-gray-400" />
                <div className="text-center">
                  {fileName ? (
                    <>
                      <p className="text-white font-semibold">{fileName}</p>
                      <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300 font-semibold">Click to upload file</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG, XLSX (Max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Reference Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {consignmentId ? 'Consignment ID' : 'Client ID'}
            </p>
            <p className="text-white font-semibold">
              {consignmentId || clientId || 'Not specified'}
            </p>
            {consignmentId && clientId && (
              <p className="text-xs text-yellow-400 mt-2">
                Note: Document will be attached to consignment
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || success}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Uploading...
                </>
              ) : success ? (
                <>
                  <FaCheckCircle />
                  Uploaded
                </>
              ) : (
                <>
                  <FaFileUpload />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
