import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaMapMarkerAlt,
  FaClock,
  FaTruck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaArrowRight,
  FaCalendar,
  FaCube,
  FaWeight,
  FaCoins,
  FaShieldAlt,
  FaFileAlt,
  FaPhone,
  FaEnvelope,
  FaCopy,
  FaDownload,
  FaSpinner,
  FaExclamationCircle,
} from 'react-icons/fa';
import LocationMap from '../../components/common/LocationMap';
import UserNavBar from '../../components/common/UserNavBar';
import { assetApi, shipmentApi } from '../../services/assetApi';

/**
 * CLIENT TRACKING DASHBOARD
 * Displays real-time asset tracking after payment is complete and shipment is authorized
 * 
 * Data fetched from Django backend API
 */

const ClientTrackingDashboard = () => {
  const [consignments, setConsignments] = useState([]);
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount and poll every 30 seconds
  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(fetchData, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both consignments and shipments
      const [consignmentsRes, shipmentsRes] = await Promise.all([
        assetApi.getMyConsignments(),
        shipmentApi.getShipments(),
      ]);

      if (consignmentsRes && Array.isArray(consignmentsRes)) {
        setConsignments(consignmentsRes);
        if (consignmentsRes.length > 0) setSelectedConsignment(consignmentsRes[0]);
      }

      if (shipmentsRes && Array.isArray(shipmentsRes)) {
        setShipments(shipmentsRes);
        if (shipmentsRes.length > 0) setSelectedShipment(shipmentsRes[0]);
      } else if (shipmentsRes?.results) {
        setShipments(shipmentsRes.results);
        if (shipmentsRes.results.length > 0) setSelectedShipment(shipmentsRes.results[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsignments = fetchData;

  // Filter consignments based on search and status - prioritize ones with active shipments
  const filteredConsignments = consignments.filter(c => {
    const matchesSearch = 
      c.consignment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.item_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort: in_transit first, then completed, then others
    const priority = { 'in_transit': 0, 'completed': 1 };
    return (priority[a.status] ?? 2) - (priority[b.status] ?? 2);
  });

  const getStatusColor = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50',
      'received': 'bg-blue-900/30 text-blue-400 border-blue-500/50',
      'under_verification': 'bg-orange-900/30 text-orange-400 border-orange-500/50',
      'verification_passed': 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50',
      'approved': 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50',
      'in_secure_storage': 'bg-indigo-900/30 text-indigo-400 border-indigo-500/50',
      'in_transit': 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50',
      'completed': 'bg-green-900/30 text-green-400 border-green-500/50',
      'delivered': 'bg-green-900/30 text-green-400 border-green-500/50',
    };
    return statusMap[status] || 'bg-gray-900/30 text-gray-400 border-gray-500/50';
  };

  const getStatusDisplay = (status) => {
    const statusDisplay = {
      'pending': 'Pending',
      'received': 'Received',
      'under_verification': 'Under Verification',
      'verification_passed': 'Verification Passed',
      'verification_failed': 'Verification Failed',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'in_secure_storage': 'In Storage',
      'on_hold': 'On Hold',
      'withdrawal_requested': 'Withdrawal Requested',
      'released': 'Released',
      'in_transit': 'In Transit',
      'completed': 'Completed',
      'delivered': 'Delivered',
    };
    return statusDisplay[status] || status;
  };

  const canViewTracking = (consignment) => {
    // Client can view tracking if they have shipments and payment is complete
    return consignment.shipments && consignment.shipments.length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-400 mx-auto mb-4" />
          <p className="text-lg text-gray-400">Loading your shipments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 flex items-center gap-4">
            <FaExclamationCircle className="text-3xl text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Shipments</h2>
              <p className="text-gray-300">{error}</p>
              <button 
                onClick={fetchConsignments}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white font-semibold transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
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
              <FaTruck className="text-cyan-400" />
              Track Your Shipments
            </h1>
            <p className="text-gray-400">
              Real-time tracking of your assets. View detailed information about your consignments and shipments.
            </p>
          </div>

          {/* Active Shipments Banner */}
          {shipments.length > 0 && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {shipments.slice(0, 3).map((shipment) => (
                <div
                  key={shipment.id}
                  className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-xl p-4 cursor-pointer hover:border-cyan-400/50 transition"
                  onClick={() => {
                    // Find matching consignment
                    const match = consignments.find(c => c.id === (shipment.consignment?.id || shipment.consignment));
                    if (match) setSelectedConsignment(match);
                    setSelectedShipment(shipment);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">Active Shipment</p>
                      <p className="text-sm font-bold text-white">{shipment.shipment_number}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      shipment.status === 'delivered' ? 'bg-green-900/50 text-green-400' :
                      shipment.status === 'in_transit' ? 'bg-cyan-900/50 text-cyan-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {shipment.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FaTruck className="text-cyan-400" />
                    <span>{shipment.origin} → {shipment.destination}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 capitalize">
                    {shipment.transport_mode} transport
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Shipment List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search Bar */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 mb-4">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search shipments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent w-full outline-none text-gray-100 placeholder-gray-500"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 cursor-pointer appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <FaChevronDown className="absolute right-2 top-3 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Shipment Cards */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredConsignments.length === 0 ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center text-gray-400">
                    <FaBox className="text-3xl mx-auto mb-2 opacity-50" />
                    <p>No shipments found</p>
                  </div>
                ) : (
                  filteredConsignments.map((consignment) => (
                    <div
                      key={consignment.id}
                      onClick={() => {
                        setSelectedConsignment(consignment);
                        setShowDetails(true);
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedConsignment?.id === consignment.id
                          ? 'bg-cyan-900/30 border-cyan-500/50'
                          : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white text-sm">
                          {consignment.consignment_number}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(consignment.status)}`}>
                          {getStatusDisplay(consignment.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{consignment.item_name}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>${consignment.declared_value}</span>
                        <span>{consignment.received_date?.substring(0, 10)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel - Details and Map */}
            <div className="lg:col-span-3 space-y-6">
              {selectedConsignment ? (
                <>
                  {/* Map Section */}
                  {canViewTracking(selectedConsignment) && (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                      <div className="h-96">
                        <LocationMap shipment={selectedConsignment.shipments?.[0]} />
                      </div>
                    </div>
                  )}

                  {/* Consignment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                        <FaBox /> Consignment Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500">Reference</p>
                          <p className="text-white font-semibold">{selectedConsignment.consignment_number}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Item</p>
                          <p className="text-white">{selectedConsignment.item_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="text-white">{selectedConsignment.category_display || selectedConsignment.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Value</p>
                          <p className="text-cyan-400 font-semibold">
                            ${selectedConsignment.declared_value} {selectedConsignment.declared_value_currency}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    {selectedConsignment.shipments && selectedConsignment.shipments.length > 0 && (
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                          <FaTruck /> Shipment Details
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-gray-500">Shipment #</p>
                            <p className="text-white font-semibold">{selectedConsignment.shipments[0].shipment_number}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Transport Mode</p>
                            <p className="text-white capitalize">{selectedConsignment.shipments[0].transport_mode_display || selectedConsignment.shipments[0].transport_mode}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">From → To</p>
                            <p className="text-white">{selectedConsignment.shipments[0].origin} → {selectedConsignment.shipments[0].destination}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <p className={`font-semibold ${selectedConsignment.shipments[0].status === 'delivered' ? 'text-green-400' : 'text-cyan-400'}`}>
                              {getStatusDisplay(selectedConsignment.shipments[0].status)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  {selectedConsignment.history && selectedConsignment.history.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                        <FaClock /> Tracking Timeline
                      </h3>
                      <div className="space-y-4">
                        {selectedConsignment.history.map((event, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-cyan-400 mt-1.5"></div>
                              {index < selectedConsignment.history.length - 1 && (
                                <div className="w-0.5 h-12 bg-gray-700 mt-2"></div>
                              )}
                            </div>
                            <div className="pb-4">
                              <p className="text-white font-semibold">{event.event_type_display}</p>
                              <p className="text-gray-400 text-sm">{event.timestamp_formatted}</p>
                              {event.description && (
                                <p className="text-gray-500 text-sm mt-1">{event.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                  <FaBox className="text-4xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a shipment to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientTrackingDashboard;
