import React, { useState, useEffect } from 'react';
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
  FaSearch,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaEye,
  FaFilter,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import { auditApi } from '../../services/assetApi';

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterResourceType, setFilterResourceType] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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

  const ACTIONS = ['create', 'read', 'update', 'delete', 'login', 'logout', 'download'];
  const RESOURCE_TYPES = ['user', 'client', 'consignment', 'shipment', 'audit', 'document'];

  // Fetch audit logs on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auditApi.getLogs({ limit: 100 });
      if (response && Array.isArray(response)) {
        setLogs(response);
      } else if (response && response.results) {
        setLogs(response.results);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      const matchesSearch =
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesResourceType = filterResourceType === 'all' || log.resource_type === filterResourceType;

      return matchesSearch && matchesAction && matchesResourceType;
    });
  };

  const getActionBadge = (action) => {
    const actionColors = {
      'create': 'bg-green-900/30 text-green-400',
      'read': 'bg-blue-900/30 text-blue-400',
      'update': 'bg-orange-900/30 text-orange-400',
      'delete': 'bg-red-900/30 text-red-400',
      'login': 'bg-cyan-900/30 text-cyan-400',
      'logout': 'bg-gray-900/30 text-gray-400',
      'download': 'bg-purple-900/30 text-purple-400',
    };
    return actionColors[action] || 'bg-gray-900/30 text-gray-400';
  };

  const getActionIcon = (action) => {
    const icons = {
      'create': '➕',
      'read': '👁️',
      'update': '✏️',
      'delete': '🗑️',
      'login': '🔓',
      'logout': '🔒',
      'download': '⬇️',
    };
    return icons[action] || '•';
  };

  const filteredLogs = getFilteredLogs();
  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = logs.filter(log => log.timestamp?.substring(0, 10) === today);

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">
          Audit Logs
        </h1>
        <p className="text-gray-400">
          View all system activities and user actions
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <FaExclamationCircle className="text-red-400 text-xl" />
          <div className="flex-1">
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-800 rounded px-3 py-2">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by user, action, resource, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent w-full outline-none text-gray-100"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-gray-100 cursor-pointer flex-1"
          >
            <option value="all">All Actions</option>
            {ACTIONS.map(action => (
              <option key={action} value={action}>{action.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={filterResourceType}
            onChange={(e) => setFilterResourceType(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-gray-100 cursor-pointer flex-1"
          >
            <option value="all">All Resource Types</option>
            {RESOURCE_TYPES.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>

          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 text-white rounded font-semibold transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 mb-1 text-sm">Total Logs</p>
          <p className="text-2xl font-bold text-kestrel-gold">{logs.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 mb-1 text-sm">Today's Activity</p>
          <p className="text-2xl font-bold text-blue-400">{todaysLogs.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 mb-1 text-sm">Create Actions</p>
          <p className="text-2xl font-bold text-green-400">{logs.filter(l => l.action === 'create').length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 mb-1 text-sm">Delete Actions</p>
          <p className="text-2xl font-bold text-red-400">{logs.filter(l => l.action === 'delete').length}</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-kestrel-gold mx-auto mb-4" />
            <p className="text-gray-400">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FaHistory className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Resource</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">IP Address</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-3 text-gray-300 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-gray-300 text-sm">{log.user_email || 'System'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${getActionBadge(log.action)}`}>
                        <span>{getActionIcon(log.action)}</span>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-300 text-sm">{log.resource_type}</td>
                    <td className="px-6 py-3 text-gray-300 text-sm truncate max-w-xs">{log.description || '—'}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs font-mono">{log.ip_address || 'N/A'}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetails(true);
                        }}
                        className="p-2 text-kestrel-gold hover:bg-kestrel-gold/20 rounded transition"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Audit Log Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Timestamp</p>
                <p className="text-white font-semibold">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">User</p>
                  <p className="text-white font-semibold">{selectedLog.user_email || 'System'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Action</p>
                  <div className={`px-3 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${getActionBadge(selectedLog.action)}`}>
                    <span>{getActionIcon(selectedLog.action)}</span>
                    {selectedLog.action}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Resource Type</p>
                  <p className="text-white font-semibold">{selectedLog.resource_type}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Resource ID</p>
                  <p className="text-white font-semibold">{selectedLog.resource_id || '—'}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Description</p>
                <p className="text-white">{selectedLog.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">IP Address</p>
                  <p className="text-white font-mono text-sm">{selectedLog.ip_address || 'N/A'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">User Agent</p>
                  <p className="text-white font-mono text-sm truncate">{selectedLog.user_agent || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.changes && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Changes</p>
                  <pre className="text-white text-xs bg-gray-900 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AuditPage;
