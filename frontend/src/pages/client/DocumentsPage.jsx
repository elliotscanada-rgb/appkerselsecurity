import React, { useState, useEffect, useCallback } from 'react';
import {
  FaBox,
  FaFileAlt,
  FaDownload,
  FaSpinner,
  FaExclamationCircle,
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFile,
  FaSearch,
  FaInbox,
} from 'react-icons/fa';
import UserNavBar from '../../components/common/UserNavBar';
import { documentApi, consignmentApi } from '../../services/assetApi';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getFileIcon(fileName) {
  if (!fileName) return <FaFile className="text-gray-400" />;
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return <FaFilePdf className="text-red-400" />;
  if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-400" />;
  if (['xls', 'xlsx'].includes(ext)) return <FaFileExcel className="text-green-400" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
    return <FaFileImage className="text-purple-400" />;
  return <FaFile className="text-gray-400" />;
}

function getDocumentTypeLabel(type) {
  const map = {
    receipt:               'Consignment Receipt',
    valuation_certificate: 'Valuation Certificate',
    agreement:             'Consignment Agreement',
    delivery_confirmation: 'Delivery Confirmation',
    identity:              'Identity Document',
    insurance:             'Insurance Document',
    customs:               'Customs / Export Document',
    other:                 'Other',
    // legacy keys
    invoice:               'Invoice',
    contract:              'Contract',
    certificate:           'Certificate',
    appraisal:             'Appraisal',
  };
  return map[type] || type;
}

// Badge colour for the document "scope" pill
function scopeBadge(doc) {
  if (doc.consignment) {
    return { label: doc.consignment_number || 'Consignment', cls: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40' };
  }
  return { label: 'Account Document', cls: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40' };
}

// ─────────────────────────────────────────────────────────────────────────────
// DocumentsPage
// ─────────────────────────────────────────────────────────────────────────────

const FILTER_ALL        = 'all';
const FILTER_ACCOUNT    = 'account';     // client-scoped (no consignment)
const FILTER_CONSIGNMENT = 'consignment'; // tied to a consignment

const DocumentsPage = () => {
  const [allDocuments, setAllDocuments]   = useState([]);
  const [consignments, setConsignments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [scopeFilter, setScopeFilter]     = useState(FILTER_ALL);
  const [consignFilter, setConsignFilter] = useState('all'); // filter by consignment number

  // ── Fetch everything once ─────────────────────────────────────────────── //
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both in parallel
      const [docsData, consignData] = await Promise.all([
        documentApi.getMyDocuments().catch(() => null),
        consignmentApi.getMyConsignments().catch(() => []),
      ]);

      // Normalise documents
      let docs = [];
      if (Array.isArray(docsData)) docs = docsData;
      else if (docsData?.results) docs = docsData.results;

      // If getMyDocuments isn't implemented yet, fall back to per-consignment
      if (docs.length === 0 && Array.isArray(consignData) && consignData.length > 0) {
        const perConsignment = await Promise.all(
          consignData.map(c =>
            documentApi.getConsignmentDocuments(c.id).catch(() => [])
          )
        );
        docs = perConsignment.flat();
      }

      setAllDocuments(docs);
      setConsignments(Array.isArray(consignData) ? consignData : []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived / filtered list ───────────────────────────────────────────── //
  const filtered = allDocuments.filter(doc => {
    // scope filter
    if (scopeFilter === FILTER_ACCOUNT && doc.consignment) return false;
    if (scopeFilter === FILTER_CONSIGNMENT && !doc.consignment) return false;

    // per-consignment filter
    if (consignFilter !== 'all' && doc.consignment_number !== consignFilter) return false;

    // text search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        doc.file_name?.toLowerCase().includes(q) ||
        doc.document_type?.toLowerCase().includes(q) ||
        doc.description?.toLowerCase().includes(q) ||
        doc.consignment_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Unique consignment numbers for the filter dropdown
  const consignmentNumbers = [
    ...new Set(allDocuments.map(d => d.consignment_number).filter(Boolean)),
  ];

  // ── Download handler ──────────────────────────────────────────────────── //
  const handleDownload = (doc) => {
    const url = doc.file_url || doc.file_path || doc.file;
    if (url) window.open(url, '_blank');
    else alert('File URL not available');
  };

  // ─────────────────────────────────────────────────────────────────────── //

  if (loading) {
    return (
      <>
        <UserNavBar />
        <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-cyan-400 mx-auto mb-4" />
            <p className="text-lg text-gray-400">Loading your documents…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavBar />
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-1 flex items-center gap-3">
              <FaFileAlt className="text-cyan-400" />
              My Documents
            </h1>
            <p className="text-gray-400 text-sm">
              All documents sent to your account — both account-level and consignment-specific.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <FaExclamationCircle className="text-red-400 text-xl shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Summary pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { label: 'All Documents',       filter: FILTER_ALL,         count: allDocuments.length,                              icon: <FaFolder /> },
              { label: 'Account Documents',   filter: FILTER_ACCOUNT,     count: allDocuments.filter(d => !d.consignment).length,  icon: <FaInbox /> },
              { label: 'Consignment Docs',    filter: FILTER_CONSIGNMENT, count: allDocuments.filter(d =>  d.consignment).length,  icon: <FaBox /> },
            ].map(({ label, filter, count, icon }) => (
              <button
                key={filter}
                onClick={() => setScopeFilter(filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition ${
                  scopeFilter === filter
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {icon} {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  scopeFilter === filter ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + consignment filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5">
              <FaSearch className="text-gray-500 text-sm" />
              <input
                type="text"
                placeholder="Search file name, type, description…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent flex-1 outline-none text-gray-100 text-sm placeholder-gray-500"
              />
            </div>
            {consignmentNumbers.length > 0 && (
              <select
                value={consignFilter}
                onChange={e => setConsignFilter(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="all">All Consignments</option>
                {consignmentNumbers.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            )}
          </div>

          {/* Documents grid */}
          {filtered.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
              <FaFileAlt className="text-5xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 font-semibold">
                {allDocuments.length === 0
                  ? 'No documents have been uploaded to your account yet.'
                  : 'No documents match your current filters.'}
              </p>
              {allDocuments.length === 0 && (
                <p className="text-gray-600 text-sm mt-2">
                  Documents uploaded by the admin will appear here automatically.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(doc => {
                const badge = scopeBadge(doc);
                return (
                  <div
                    key={doc.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-cyan-500/50 transition flex flex-col gap-3"
                  >
                    {/* Top: icon + name */}
                    <div className="flex items-start gap-3">
                      <div className="text-4xl mt-0.5 shrink-0">{getFileIcon(doc.file_name)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm leading-tight break-words line-clamp-2">
                          {doc.file_name || 'Document'}
                        </h3>
                        {/* Scope badge */}
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Type + description */}
                    <div>
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{doc.description}</p>
                      )}
                    </div>

                    {/* Download */}
                    <button
                      onClick={() => handleDownload(doc)}
                      className="mt-auto w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 text-sm transition"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DocumentsPage;
