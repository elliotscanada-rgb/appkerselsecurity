import React, { useState, useEffect, useRef } from 'react';
import {
  FaChartLine,
  FaUsers,
  FaUserTie,
  FaBox,
  FaCoins,
  FaTruck,
  FaWarehouse,
  FaShieldAlt,
  FaFileAlt,
  FaHistory,
  FaUpload,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFile,
  FaDownload,
  FaTrash,
  FaSearch,
  FaCloudUploadAlt,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { clientApi, documentApi } from '../../services/assetApi';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES = [
  { value: 'receipt',               label: 'Consignment Receipt' },
  { value: 'valuation_certificate', label: 'Valuation Certificate' },
  { value: 'agreement',             label: 'Consignment Agreement' },
  { value: 'delivery_confirmation', label: 'Delivery Confirmation' },
  { value: 'identity',              label: 'Identity Document' },
  { value: 'insurance',             label: 'Insurance Document' },
  { value: 'customs',               label: 'Customs / Export Document' },
  { value: 'other',                 label: 'Other Document' },
];

function fileIcon(fileName) {
  if (!fileName) return <FaFile className="text-gray-400" />;
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return <FaFilePdf className="text-red-400" />;
  if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-400" />;
  if (['xls', 'xlsx'].includes(ext)) return <FaFileExcel className="text-green-400" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
    return <FaFileImage className="text-purple-400" />;
  return <FaFile className="text-gray-400" />;
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ClientDocumentUpload — self-contained sub-component
// ─────────────────────────────────────────────────────────────────────────────

const ClientDocumentUpload = () => {
  const [clients, setClients]           = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [documents, setDocuments]       = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingDocs, setLoadingDocs]   = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);

  // Upload form state
  const [docType, setDocType]           = useState('other');
  const [description, setDescription]  = useState('');
  const [file, setFile]                 = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const fileInputRef                    = useRef(null);

  // ── Load clients ──────────────────────────────────────────────────────── //
  useEffect(() => {
    const load = async () => {
      setLoadingClients(true);
      try {
        const res = await clientApi.getClients();
        setClients(Array.isArray(res) ? res : res.results || []);
      } catch (e) {
        setError('Failed to load clients: ' + e.message);
      } finally {
        setLoadingClients(false);
      }
    };
    load();
  }, []);

  // ── Load documents for selected client ───────────────────────────────── //
  useEffect(() => {
    if (!selectedClient) { setDocuments([]); return; }
    const load = async () => {
      setLoadingDocs(true);
      try {
        const res = await documentApi.getClientDocuments(selectedClient.id);
        setDocuments(Array.isArray(res) ? res : res.results || []);
      } catch {
        setDocuments([]);
      } finally {
        setLoadingDocs(false);
      }
    };
    load();
  }, [selectedClient]);

  // ── Filtered client list ──────────────────────────────────────────────── //
  const filteredClients = clients.filter(c => {
    const q = clientSearch.toLowerCase();
    return (
      c.client_number?.toLowerCase().includes(q) ||
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  // ── File drop helpers ─────────────────────────────────────────────────── //
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  // ── Upload ────────────────────────────────────────────────────────────── //
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedClient) { setError('Please select a client first.'); return; }
    if (!file)           { setError('Please choose a file to upload.'); return; }

    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('client', selectedClient.id);
      fd.append('document_type', docType);
      fd.append('description', description);
      fd.append('file', file);

      const uploaded = await documentApi.uploadClientDocument(fd);
      setDocuments(prev => [uploaded, ...prev]);
      setSuccess(`"${file.name}" uploaded to ${selectedClient.full_name}'s account.`);
      setFile(null);
      setDescription('');
      setDocType('other');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────── //
  const handleDelete = async (docId, docName) => {
    if (!window.confirm(`Delete "${docName}"?`)) return;
    try {
      await documentApi.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setSuccess('Document deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
        <FaCloudUploadAlt className="text-cyan-400 text-2xl" />
        <div>
          <h2 className="text-xl font-bold text-white">Client Document Upload</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Select a client, then upload documents that will appear on their Documents page.
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: client picker ──────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search clients…"
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {loadingClients ? (
            <div className="flex justify-center py-6">
              <FaSpinner className="animate-spin text-cyan-400 text-xl" />
            </div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {filteredClients.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No clients found</p>
              ) : filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left px-3 py-3 rounded-lg border transition text-sm ${
                    selectedClient?.id === client.id
                      ? 'bg-cyan-900/30 border-cyan-500/60 text-white'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  <p className="font-semibold truncate">{client.full_name || client.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{client.client_number}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: upload form + documents list ──────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Alerts */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-center gap-3">
              <FaExclamationCircle className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300 flex-1">{error}</p>
              <button onClick={() => setError(null)}><FaTimes className="text-red-400" /></button>
            </div>
          )}
          {success && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 flex items-center gap-3">
              <FaCheckCircle className="text-green-400 shrink-0" />
              <p className="text-sm text-green-300 flex-1">{success}</p>
              <button onClick={() => setSuccess(null)}><FaTimes className="text-green-400" /></button>
            </div>
          )}

          {/* Upload form — only shown when a client is selected */}
          {selectedClient ? (
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-sm font-semibold text-white">
                  Uploading to: {selectedClient.full_name}
                  <span className="text-gray-400 font-normal ml-2">({selectedClient.client_number})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Document Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {DOCUMENT_TYPES.map(dt => (
                      <option key={dt.value} value={dt.value}>{dt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Description <span className="text-gray-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief description…"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  dragOver
                    ? 'border-cyan-400 bg-cyan-900/20'
                    : file
                    ? 'border-green-500/60 bg-green-900/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                {file ? (
                  <>
                    <div className="text-3xl">{fileIcon(file.name)}</div>
                    <p className="text-sm font-semibold text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute top-2 right-2 p-1 bg-red-700 hover:bg-red-600 rounded text-white"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </>
                ) : (
                  <>
                    <FaUpload className="text-2xl text-gray-500" />
                    <p className="text-sm text-gray-400">
                      <span className="text-cyan-400 font-semibold">Click</span> or drag &amp; drop a file here
                    </p>
                    <p className="text-xs text-gray-600">PDF, Word, Excel, Images — max 20 MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold text-white text-sm flex items-center justify-center gap-2 transition"
              >
                {uploading ? (
                  <><FaSpinner className="animate-spin" /> Uploading…</>
                ) : (
                  <><FaUpload /> Upload Document</>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FaUsers className="text-4xl text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Select a client on the left to upload a document.</p>
            </div>
          )}

          {/* Existing documents for this client */}
          {selectedClient && (
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <FaFileAlt className="text-cyan-400" />
                  Documents for {selectedClient.full_name}
                </h3>
                {documents.length > 0 && (
                  <span className="text-xs bg-cyan-900/40 text-cyan-300 border border-cyan-700/40 px-2 py-0.5 rounded-full">
                    {documents.length}
                  </span>
                )}
              </div>

              {loadingDocs ? (
                <div className="flex justify-center py-6">
                  <FaSpinner className="animate-spin text-cyan-400" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5"
                    >
                      <div className="text-xl shrink-0">{fileIcon(doc.file_name)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="text-cyan-400">{doc.document_type_display}</span>
                          {doc.description && <span className="truncate">— {doc.description}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-gray-700 hover:bg-cyan-700 rounded text-gray-300 hover:text-white transition"
                            title="Download"
                          >
                            <FaDownload className="text-xs" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id, doc.file_name)}
                          className="p-1.5 bg-gray-700 hover:bg-red-700 rounded text-gray-300 hover:text-white transition"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboard
// ─────────────────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { heading: true, label: 'Management' },
    { path: '/admin/clients', label: 'Clients', icon: <FaUsers /> },
    { path: '/admin/staff', label: 'Staff', icon: <FaUserTie /> },
    { path: '/admin/consignments', label: 'Consignments', icon: <FaBox /> },
    { path: '/admin/valuations', label: 'Valuations', icon: <FaCoins /> },
    { heading: true, label: 'Operations' },
    { path: '/admin/logistics', label: 'Logistics', icon: <FaTruck /> },
    { path: '/admin/custody', label: 'Custody', icon: <FaShieldAlt /> },
    { path: '/admin/storage', label: 'Storage', icon: <FaWarehouse /> },
    { divider: true },
    { path: '/admin/reports', label: 'Reports', icon: <FaFileAlt /> },
    { path: '/admin/audit', label: 'Audit Logs', icon: <FaHistory /> },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token =
          sessionStorage.getItem('kestrel_token') ||
          sessionStorage.getItem('access_token');

        if (!token) {
          setStats(getDefaultStats());
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/consignments/statistics/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const byStatus = data.by_status || {};
          setStats({
            totalClients: 0,
            totalConsignments: data.total_consignments || 0,
            totalValue: parseFloat(data.total_declared_value || 0),
            inStorage: byStatus['in_secure_storage']?.count || 0,
            inTransit: byStatus['in_transit']?.count || 0,
            pendingApprovals: byStatus['pending_approval']?.count || 0,
            inVerification: byStatus['under_verification']?.count || 0,
            verified: byStatus['verified']?.count || 0,
            rejected: byStatus['rejected']?.count || 0,
            completedConsignments: byStatus['completed']?.count || 0,
            totalChargesPaid: 0,
            chargesPending: 0,
          });
        } else {
          setStats(getDefaultStats());
        }
      } catch {
        setStats(getDefaultStats());
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const getDefaultStats = () => ({
    totalClients: 0, totalConsignments: 0, totalValue: 0,
    inStorage: 0, inTransit: 0, pendingApprovals: 0,
    inVerification: 0, verified: 0, rejected: 0,
    completedConsignments: 0, totalChargesPaid: 0, chargesPending: 0,
  });

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Complete overview of Kestrel Security operations</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading statistics…</p>
        </div>
      ) : stats ? (
        <>
          {/* ── Stat cards row 1 ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Clients"       value={stats.totalClients}            icon={<FaUsers size={24} />}    color="blue"   />
            <StatCard title="Total Consignments"  value={stats.totalConsignments}        icon={<FaBox size={24} />}      color="purple" />
            <StatCard title="Total Value"         value={formatCurrency(stats.totalValue)} icon={<FaCoins size={24} />}  color="gold"   />
            <StatCard title="In Storage"          value={stats.inStorage}               icon={<FaWarehouse size={24} />} color="green" />
            <StatCard title="In Transit"          value={stats.inTransit}               icon={<FaTruck size={24} />}    color="orange" />
            <StatCard title="Pending Approvals"   value={stats.pendingApprovals}         icon={<FaShieldAlt size={24} />} color="red"  />
          </div>

          {/* ── Stat cards row 2 ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Under Verification"  value={stats.inVerification}           icon={<FaBox size={24} />}      color="yellow" />
            <StatCard title="Verified & Approved" value={stats.verified}                 icon={<FaShieldAlt size={24} />} color="green" />
            <StatCard title="Rejected"            value={stats.rejected}                 icon={<FaBox size={24} />}      color="red"    />
            <StatCard title="Completed"           value={stats.completedConsignments}    icon={<FaBox size={24} />}      color="teal"   />
          </div>

          {/* ── Financial Overview ── */}
          <Card title="Financial Overview" className="mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-green-900/30 border border-green-700/40 p-6 rounded-lg">
                <p className="text-green-400 text-sm font-semibold uppercase">Charges Paid</p>
                <p className="text-3xl font-bold text-green-300 mt-2">
                  {formatCurrency(stats.totalChargesPaid)}
                </p>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-700/40 p-6 rounded-lg">
                <p className="text-yellow-400 text-sm font-semibold uppercase">Charges Pending</p>
                <p className="text-3xl font-bold text-yellow-300 mt-2">
                  {formatCurrency(stats.chargesPending)}
                </p>
              </div>
            </div>
          </Card>

          {/* ── Status distribution + 13-status tracker ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card title="Asset Status Distribution">
              <div className="space-y-3">
                {[
                  { label: 'In Secure Storage',   value: stats.inStorage,              color: 'bg-blue-500'   },
                  { label: 'In Transit',           value: stats.inTransit,              color: 'bg-orange-500' },
                  { label: 'Under Verification',   value: stats.inVerification,         color: 'bg-yellow-500' },
                  { label: 'Pending Approvals',    value: stats.pendingApprovals,       color: 'bg-red-500'    },
                  { label: 'Completed',            value: stats.completedConsignments,  color: 'bg-green-500'  },
                ].map(({ label, value, color }) => {
                  const pct = stats.totalConsignments > 0
                    ? Math.round((value / stats.totalConsignments) * 100)
                    : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{label}</span>
                        <span className="font-semibold text-white">
                          {value} <span className="text-gray-500 text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="13-Status Tracking System">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700/50">
                <p className="text-sm text-gray-300 mb-3">
                  All consignments are tracked through 13 distinct statuses:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-kestrel-gold">
                  {[
                    'Pending', 'Received', 'Under Verification', 'Verification Passed',
                    'Verification Failed', 'Approved', 'Rejected', 'In Secure Storage',
                    'On Hold', 'Withdrawal Requested', 'Released', 'In Transit', 'Completed',
                  ].map(s => <div key={s}>✓ {s}</div>)}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Each status change is recorded with timestamp and responsible staff member.
                </p>
              </div>
            </Card>
          </div>

          {/* ── Client Document Upload ── */}
          <ClientDocumentUpload />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load statistics</p>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
