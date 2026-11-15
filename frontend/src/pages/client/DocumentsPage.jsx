import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaChartLine,
  FaTruck,
  FaFileAlt,
  FaBell,
  FaUser,
  FaDownload,
  FaSpinner,
  FaExclamationCircle,
  FaFolder,
  FaFileInvoice,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFile,
  FaSearch,
  FaCalendar,
} from 'react-icons/fa';
import UserNavBar from '../../components/common/UserNavBar';
import { documentApi, consignmentApi } from '../../services/assetApi';

const DocumentsPage = () => {
  const [consignments, setConsignments] = useState([]);
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConsignments();
  }, []);

  useEffect(() => {
    if (selectedConsignment) {
      fetchDocuments(selectedConsignment.id);
    }
  }, [selectedConsignment]);

  const fetchConsignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await consignmentApi.getMyConsignments();
      
      if (data && Array.isArray(data)) {
        setConsignments(data);
        if (data.length > 0) {
          setSelectedConsignment(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching consignments:', err);
      setError(err.message || 'Failed to load consignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (consignmentId) => {
    try {
      setLoadingDocs(true);
      const data = await documentApi.getConsignmentDocuments(consignmentId);
      
      if (data && Array.isArray(data)) {
        setDocuments(data);
      } else if (data?.results) {
        setDocuments(data.results);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      if (doc.file) {
        // Open file in new tab
        window.open(doc.file, '_blank');
      } else {
        await documentApi.downloadDocument(doc.id);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document');
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFile className="text-gray-400" />;
    
    const ext = fileName.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'pdf':
        return <FaFilePdf className="text-red-400" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-400" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="text-purple-400" />;
      default:
        return <FaFile className="text-gray-400" />;
    }
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      invoice: 'Invoice',
      receipt: 'Receipt',
      contract: 'Contract',
      certificate: 'Certificate',
      appraisal: 'Appraisal',
      insurance: 'Insurance',
      customs: 'Customs Document',
      other: 'Other',
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredDocuments = documents.filter(doc => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      doc.description?.toLowerCase().includes(search) ||
      doc.document_type?.toLowerCase().includes(search) ||
      doc.file_name?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <>
        <UserNavBar />
        <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-cyan-400 mx-auto mb-4" />
            <p className="text-lg text-gray-400">Loading documents...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavBar />
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FaFileAlt className="text-cyan-400" />
              My Documents
            </h1>
            <p className="text-gray-400">
              Access all documents related to your consignments
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <FaExclamationCircle className="text-red-400 text-xl" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Consignment List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaFolder className="text-cyan-400" />
                  Consignments
                </h3>

                {consignments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">
                    No consignments found
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {consignments.map((consignment) => (
                      <div
                        key={consignment.id}
                        onClick={() => setSelectedConsignment(consignment)}
                        className={`p-3 rounded-lg border cursor-pointer transition ${
                          selectedConsignment?.id === consignment.id
                            ? 'bg-cyan-900/30 border-cyan-500/50'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <p className="font-semibold text-white text-sm mb-1">
                          {consignment.consignment_number}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {consignment.item_name}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            consignment.status === 'completed'
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-blue-900/50 text-blue-400'
                          }`}>
                            {consignment.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Documents List */}
            <div className="lg:col-span-3 space-y-4">
              {selectedConsignment ? (
                <>
                  {/* Consignment Info Card */}
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {selectedConsignment.consignment_number}
                        </h2>
                        <p className="text-gray-400">{selectedConsignment.item_name}</p>
                      </div>
                      <span className="px-3 py-1 rounded text-sm font-semibold bg-cyan-900/30 text-cyan-400 border border-cyan-500/50">
                        {documents.length} Document{documents.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-3">
                      <FaSearch className="text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent w-full outline-none text-gray-100 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Documents Grid */}
                  {loadingDocs ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                      <FaSpinner className="animate-spin text-3xl text-cyan-400 mx-auto mb-3" />
                      <p className="text-gray-400">Loading documents...</p>
                    </div>
                  ) : filteredDocuments.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                      <FaFileAlt className="text-4xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">
                        {searchTerm ? 'No documents match your search' : 'No documents available for this consignment'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-cyan-500/50 transition"
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">
                              {getFileIcon(doc.file_name || doc.file)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-white font-semibold truncate">
                                    {doc.file_name || 'Document'}
                                  </h3>
                                  <p className="text-xs text-cyan-400 font-semibold">
                                    {getDocumentTypeLabel(doc.document_type)}
                                  </p>
                                </div>
                              </div>

                              {doc.description && (
                                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                  {doc.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <FaCalendar />
                                  {formatDate(doc.uploaded_at || doc.created_at)}
                                </span>
                                {doc.uploaded_by_name && (
                                  <span>By: {doc.uploaded_by_name}</span>
                                )}
                              </div>

                              <button
                                onClick={() => handleDownload(doc)}
                                className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm"
                              >
                                <FaDownload />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                  <FaFolder className="text-4xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a consignment to view documents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentsPage;
