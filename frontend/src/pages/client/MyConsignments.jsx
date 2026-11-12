import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaChartLine,
  FaTruck,
  FaFileAlt,
  FaBell,
  FaUser,
  FaEye,
  FaSearch,
  FaFilter,
  FaHistory,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import HistoryTimeline from '../../components/common/HistoryTimeline';
import { formatCurrency, formatDate, formatWeight } from '../../utils/formatters';
import { STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS } from '../../utils/constants';
import { consignmentApi } from '../../services/assetApi';

const MyConsignments = () => {
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = [
    { path: '/client/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { path: '/client/consignments', label: 'My Consignments', icon: <FaBox /> },
    { path: '/client/tracking', label: 'Track Packages', icon: <FaTruck /> },
    { path: '/client/documents', label: 'Documents', icon: <FaFileAlt /> },
    { divider: true },
    { path: '/client/notifications', label: 'Notifications', icon: <FaBell /> },
    { path: '/client/profile', label: 'Profile', icon: <FaUser /> },
  ];

  // Fetch consignments from API on mount and periodically
  useEffect(() => {
    const fetchConsignments = async () => {
      try {
        setError(null);
        const response = await consignmentApi.getMyConsignments();
        // Response is a list directly from the API
        let rawConsignments = [];
        if (Array.isArray(response)) {
          rawConsignments = response;
        } else if (response && response.data) {
          rawConsignments = response.data;
        } else if (response && response.results) {
          rawConsignments = response.results;
        } else {
          rawConsignments = [];
        }

        // Normalize consignments data
        const normalized = rawConsignments.map(c => ({
          // API fields
          id: c.id,
          consignment_number: c.consignment_number,
          item_name: c.item_name,
          category_display: c.category_display,
          declared_value: parseFloat(c.declared_value || 0),
          total_value: parseFloat(c.total_value || c.declared_value || 0),
          status: c.status,
          status_display: c.status_display,
          received_date: c.received_date,
          current_location: c.current_location,
          shipment_count: c.shipment_count || 0,
          image_url: c.image_url,
          total_charges: c.total_charges || 0,
          service_charges: Array.isArray(c.service_charges) 
            ? c.service_charges.map(charge => ({
                type: charge.charge_type_display || charge.charge_type,
                amount: parseFloat(charge.amount || 0),
                status: 'charged',
                description: charge.description,
                chargedBy: charge.charged_by_name,
                createdAt: charge.created_at
              }))
            : [],

          // Mapped fields for component compatibility
          itemName: c.item_name || 'Unknown Item',
          consignmentNumber: c.consignment_number || 'N/A',
          category: c.category_display || 'Other',
          declaredValue: parseFloat(c.declared_value || 0),
          assessedValue: parseFloat(c.total_value || c.declared_value || 0),
          receivedDate: c.received_date || new Date().toISOString(),
          storageLocation: c.current_location || 'Secure Storage',
          charges: Array.isArray(c.service_charges) 
            ? c.service_charges.map(charge => ({
                type: charge.charge_type_display || charge.charge_type,
                amount: parseFloat(charge.amount || 0),
                status: 'charged',
                description: charge.description,
                chargedBy: charge.charged_by_name,
                createdAt: charge.created_at
              }))
            : []
        }));

        setConsignments(normalized);
      } catch (err) {
        console.error('Failed to fetch consignments:', err);
        if (!consignments.length) {
          setError(err.message || 'Failed to load consignments');
        }
      }
    };

    setLoading(true);
    fetchConsignments();
    setLoading(false);
    
    // Set up polling to refresh data every 10 seconds for real-time charge updates
    const pollInterval = setInterval(fetchConsignments, 10000);
    
    return () => clearInterval(pollInterval);
  }, []);

  const handleViewDetails = (consignment) => {
    setSelectedConsignment(consignment);
    setShowDetailsModal(true);
  };

  const calculateTotalCharges = (charges = []) => {
    return charges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
  };

  const calculatePendingCharges = (charges = []) => {
    return charges
      .filter((charge) => charge.status === 'pending')
      .reduce((sum, charge) => sum + (charge.amount || 0), 0);
  };

  const filteredConsignments = consignments.filter((c) => {
    const matchesSearch =
      (c.consignmentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.itemName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-kestrel-gold">My Consignments</h1>
        <p className="text-gray-400 mt-2">Track your gold and valuables</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-kestrel-gold mb-4 mx-auto" />
            <p className="text-gray-400">Loading consignments...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 bg-red-900/30 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-300">
            <FaExclamationTriangle className="inline mr-2" />
            Error: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-400 hover:text-red-300 underline text-sm"
          >
            Try reloading the page
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && consignments.length === 0 && !error && (
        <div className="text-center py-12">
          <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No consignments yet</p>
          <p className="text-sm text-gray-500">Your consignments will appear here once submitted</p>
        </div>
      )}

      {/* Content - Filters & List */}
      {!loading && consignments.length > 0 && (
        <>
          {/* Filters Card */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by consignment number or item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="under_verification">Under Verification</option>
                  <option value="verification_passed">Verification Passed</option>
                  <option value="approved">Approved</option>
                  <option value="in_secure_storage">In Secure Storage</option>
                  <option value="withdrawal_requested">Withdrawal Requested</option>
                  <option value="in_transit">In Transit</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Consignments List */}
          <div className="space-y-4">
            {filteredConsignments.length > 0 ? (
              filteredConsignments.map((consignment) => {
                const totalCharges = calculateTotalCharges(consignment.charges);
                const pendingCharges = calculatePendingCharges(consignment.charges);

                return (
                  <Card key={consignment.id} className="hover-lift">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Item Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {consignment.itemName || 'N/A'}
                          </h3>
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${STATUS_COLORS[consignment.status] || 'bg-gray-700 text-gray-300'}`}>
                            {STATUS_LABELS[consignment.status] || consignment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">
                          <strong className="text-gray-300">Consignment #:</strong> {consignment.consignmentNumber}
                        </p>
                        <p className="text-sm text-gray-400 mb-1">
                          <strong className="text-gray-300">Category:</strong> {CATEGORY_LABELS[consignment.category] || consignment.category}
                        </p>
                        <p className="text-sm text-gray-400">
                          <strong className="text-gray-300">Received:</strong> {formatDate(consignment.receivedDate)}
                        </p>
                      </div>

                      {/* Middle: Values */}
                      <div className="flex-1 bg-gray-800 p-4 rounded-lg border border-gray-700/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Declared Value</p>
                            <p className="text-lg font-bold text-white">
                              {formatCurrency(consignment.declaredValue || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Assessed Value</p>
                            <p className="text-lg font-bold text-kestrel-gold">
                              {formatCurrency(consignment.assessedValue || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Total Charges</p>
                            <p className="text-sm font-semibold text-gray-300">
                              {formatCurrency(totalCharges)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Pending Charges</p>
                            <p className="text-sm font-semibold text-red-400">
                              {formatCurrency(pendingCharges)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div>
                        <button
                          onClick={() => handleViewDetails(consignment)}
                          className="bg-kestrel-gold hover:bg-kestrel-gold/90 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FaEye />
                          View Details
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card>
                <p className="text-center text-gray-500 py-12">No consignments found matching your criteria</p>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedConsignment && showDetailsModal && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedConsignment(null);
          }}
          title="Consignment Details"
          size="large"
        >
          <div className="space-y-6">
            {/* Item Information */}
            <div>
              <h4 className="text-lg font-semibold text-kestrel-gold mb-3 border-b border-gray-700 pb-2">
                Item Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Consignment Number</p>
                  <p className="font-semibold text-white">{selectedConsignment.consignmentNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Item Name</p>
                  <p className="font-semibold text-white">{selectedConsignment.itemName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="font-semibold text-white">{CATEGORY_LABELS[selectedConsignment.category] || selectedConsignment.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Quantity</p>
                  <p className="font-semibold text-white">{selectedConsignment.quantity || 0} pieces</p>
                </div>
              </div>
            </div>

            {/* Valuation */}
            <div>
              <h4 className="text-lg font-semibold text-kestrel-gold mb-3 border-b border-gray-700 pb-2">
                Valuation
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-900/30 border border-blue-700/40 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Declared Value</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(selectedConsignment.declaredValue || 0)}
                  </p>
                </div>
                <div className="bg-green-900/30 border border-green-700/40 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Assessed Value</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(selectedConsignment.assessedValue || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Charges Breakdown */}
            {selectedConsignment.charges && selectedConsignment.charges.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-kestrel-gold mb-3 border-b border-gray-700 pb-2">
                  Charges Breakdown
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-kestrel-gold">Charge Type</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-kestrel-gold">Amount</th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-kestrel-gold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedConsignment.charges.map((charge, index) => (
                        <tr key={index} className="border-t border-gray-700">
                          <td className="px-4 py-3 text-gray-300">{charge.type}</td>
                          <td className="px-4 py-3 text-right font-semibold text-white">
                            {formatCurrency(charge.amount || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                charge.status === 'paid'
                                  ? 'bg-green-900/30 text-green-400'
                                  : 'bg-yellow-900/30 text-yellow-400'
                              }`}
                            >
                              {charge.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-600 font-bold bg-gray-800">
                        <td className="px-4 py-3 text-white">Total Charges</td>
                        <td className="px-4 py-3 text-right text-kestrel-gold">
                          {formatCurrency(calculateTotalCharges(selectedConsignment.charges))}
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                      <tr className="border-t border-gray-700 font-semibold text-red-400">
                        <td className="px-4 py-3">Pending Charges</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(calculatePendingCharges(selectedConsignment.charges))}
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Status & History */}
            {selectedConsignment.statusHistory && selectedConsignment.statusHistory.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-kestrel-gold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
                  <FaHistory className="text-kestrel-gold" /> Status History
                </h4>
                <HistoryTimeline
                  history={
                    selectedConsignment.statusHistory
                      ? selectedConsignment.statusHistory.map((h, i) => ({
                          id: i,
                          event_type: 'status_change',
                          event_type_display: STATUS_LABELS[h.status] || h.status,
                          description: h.staff ? `Actioned by ${h.staff}` : '',
                          performed_by_name: h.staff || null,
                          timestamp_formatted: h.date,
                        }))
                      : []
                  }
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default MyConsignments;
