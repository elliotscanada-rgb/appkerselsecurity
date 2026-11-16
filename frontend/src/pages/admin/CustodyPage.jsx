import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaUsers, FaUserTie, FaBox, FaCoins, FaTruck, FaWarehouse, 
  FaShieldAlt, FaFileAlt, FaHistory, FaPlus, FaArrowRight, FaClock, 
  FaUser, FaMapMarkerAlt, FaCheck, FaSpinner, FaExclamationTriangle 
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { API_BASE_URL } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const CustodyPage = () => {
  const [custodyRecords, setCustodyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [formData, setFormData] = useState({
    consignment_id: '',
    new_custodian: '',
    new_location: '',
    notes: ''
  });

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

  // Fetch custody records
  useEffect(() => {
    const fetchCustodyRecords = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('kestrel_token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/custody/records/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCustodyRecords(Array.isArray(data) ? data : data.results || []);
        } else {
          setError('Failed to fetch custody records');
        }
      } catch (err) {
        console.error('Error fetching custody records:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustodyRecords();
  }, []);

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    
    if (!formData.new_custodian || !formData.new_location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = sessionStorage.getItem('kestrel_token');
      
      const response = await fetch(`${API_BASE_URL}/custody/transfer/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consignment_id: formData.consignment_id,
          new_custodian: formData.new_custodian,
          new_location: formData.new_location,
          notes: formData.notes
        })
      });

      if (response.ok) {
        alert('Custody transfer recorded successfully');
        setShowNewTransferModal(false);
        setFormData({ consignment_id: '', new_custodian: '', new_location: '', notes: '' });
        // Refresh the list
        window.location.reload();
      } else {
        alert('Failed to record custody transfer');
      }
    } catch (err) {
      console.error('Error recording transfer:', err);
      alert('Error: ' + err.message);
    }
  };

  // Group custody records by consignment for chain visualization
  const groupByCustodyChain = (records) => {
    const chains = {};
    records.forEach(record => {
      const key = record.consignment_id;
      if (!chains[key]) {
        chains[key] = [];
      }
      chains[key].push(record);
    });
    return chains;
  };

  const custodyChains = groupByCustodyChain(custodyRecords);

  return (
    <Layout menuItems={menuItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-kestrel-gold mb-2">Custody Chain Management</h1>
            <p className="text-gray-400">Track and manage item custody transfers and handlers</p>
          </div>
          <button
            onClick={() => setShowNewTransferModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Record Transfer
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-kestrel-gold mb-2">{custodyRecords.length}</div>
              <p className="text-gray-400">Total Transfers</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">{Object.keys(custodyChains).length}</div>
              <p className="text-gray-400">Items Tracked</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{custodyRecords.length > 0 ? (custodyRecords.length / Object.keys(custodyChains).length).toFixed(1) : 0}</div>
              <p className="text-gray-400">Avg Transfers per Item</p>
            </div>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border border-red-700/50">
            <div className="flex items-center gap-2 text-red-300">
              <FaExclamationTriangle />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <div className="flex items-center justify-center gap-2 py-12">
              <FaSpinner className="animate-spin" />
              <p className="text-gray-400">Loading custody records...</p>
            </div>
          </Card>
        )}

        {/* Custody Chains View */}
        {!loading && custodyRecords.length > 0 && (
          <div className="space-y-4">
            {Object.entries(custodyChains).map(([consignmentId, records]) => (
              <Card key={consignmentId}>
                <div className="space-y-4">
                  {/* Chain Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
                    <FaShieldAlt className="text-kestrel-gold text-xl" />
                    <div>
                      <h3 className="font-bold text-white">Consignment #{consignmentId}</h3>
                      <p className="text-xs text-gray-400">{records.length} custody transfer(s)</p>
                    </div>
                  </div>

                  {/* Chain Timeline */}
                  <div className="space-y-3">
                    {records.map((record, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline connector */}
                        {idx < records.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-kestrel-gold/50 to-transparent" />
                        )}

                        {/* Timeline item */}
                        <div className="flex gap-4 items-start">
                          {/* Timeline dot */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-kestrel-gold/20 border-2 border-kestrel-gold flex items-center justify-center flex-shrink-0">
                              {idx === records.length - 1 ? (
                                <FaCheck className="text-kestrel-gold" />
                              ) : (
                                <FaClock className="text-kestrel-gold text-sm" />
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 bg-gray-800/50 rounded-lg p-3">
                            {/* Step number */}
                            <div className="inline-block bg-kestrel-gold/20 text-kestrel-gold text-xs px-2 py-1 rounded mb-2">
                              Step {idx + 1}
                            </div>

                            {/* Transfer details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <FaUser className="text-blue-400" />
                                <span className="text-gray-300">
                                  {record.previous_custodian_name ? `${record.previous_custodian_name} → ${record.new_custodian_name}` : 'Custody Transfer'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <FaMapMarkerAlt className="text-emerald-400" />
                                <span className="text-gray-300">
                                  {record.previous_location} <FaArrowRight className="inline mx-1 text-gray-500" /> {record.new_location}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <FaClock />
                                {formatDate(record.transfer_date, 'PPp')}
                              </div>

                              {record.notes && (
                                <div className="bg-gray-900/50 rounded p-2 text-xs text-gray-400 italic">
                                  "{record.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chain Summary */}
                  <div className="bg-gradient-to-r from-kestrel-gold/10 to-transparent rounded-lg p-3 text-xs text-gray-300">
                    <span className="font-semibold">Chain complete:</span> Item transferred through {records.length} handler(s) from start to current location
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && custodyRecords.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <FaShieldAlt className="text-4xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No custody transfers recorded yet</p>
              <p className="text-sm text-gray-500">Record the first custody transfer to begin tracking the chain of custody</p>
            </div>
          </Card>
        )}
      </div>

      {/* New Transfer Modal */}
      {showNewTransferModal && (
        <Modal
          isOpen={showNewTransferModal}
          onClose={() => setShowNewTransferModal(false)}
          title="Record Custody Transfer"
          size="medium"
        >
          <form onSubmit={handleSubmitTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Consignment <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.consignment_id}
                onChange={(e) => setFormData({ ...formData, consignment_id: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                required
              >
                <option value="">Select a consignment...</option>
                {/* Options would be populated from API */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                New Custodian (Staff) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.new_custodian}
                onChange={(e) => setFormData({ ...formData, new_custodian: e.target.value })}
                placeholder="Enter staff member name"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                New Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.new_location}
                onChange={(e) => setFormData({ ...formData, new_location: e.target.value })}
                placeholder="Enter new location (e.g., Vault A, Transit Center)"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any relevant notes about this transfer..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                rows="3"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Record Transfer
              </button>
              <button
                type="button"
                onClick={() => setShowNewTransferModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
};

export default CustodyPage;
