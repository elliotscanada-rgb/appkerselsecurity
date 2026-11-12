import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaChartLine,
  FaTruck,
  FaFileAlt,
  FaBell,
  FaUser,
  FaFilter,
  FaChevronDown,
  FaShieldAlt,
  FaEye,
  FaHistory,
  FaCoins,
  FaExclamationTriangle,
  FaArrowRight,
  FaSpinner,
  FaSync,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import CollectionShippingModal from '../../components/common/CollectionShippingModal';
import StatusTimeline from '../../components/common/StatusTimeline';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, formatWeight } from '../../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS, CATEGORY_LABELS, CONSIGNMENT_STATUS, DELIVERY_METHOD } from '../../utils/constants';
import { consignmentApi } from '../../services/assetApi';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch consignments from API on component mount and periodically
  useEffect(() => {
    const fetchConsignments = async () => {
      try {
        setError(null);
        const response = await consignmentApi.getMyConsignments();
        // Response is a list directly from the API
        if (Array.isArray(response)) {
          setAssets(response);
        } else if (response && response.data) {
          setAssets(response.data);
        } else if (response && response.results) {
          setAssets(response.results);
        } else {
          setAssets([]);
        }
      } catch (err) {
        console.error('Failed to fetch consignments:', err);
        if (!assets.length) {  // Only set error if we don't have any data yet
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

  // Menu items for client sidebar
  const menuItems = [
    { path: '/client/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { path: '/client/consignments', label: 'My Consignments', icon: <FaBox /> },
    { path: '/client/tracking', label: 'Track Packages', icon: <FaTruck /> },
    { path: '/client/documents', label: 'Documents', icon: <FaFileAlt /> },
    { divider: true },
    { path: '/client/notifications', label: 'Notifications', icon: <FaBell /> },
    { path: '/client/profile', label: 'Profile', icon: <FaUser /> },
  ];

  // Map API response to component's expected format
  const normalizeAssets = (rawAssets) => {
    if (!Array.isArray(rawAssets)) return [];
    return rawAssets.map(asset => {
      // Map service charges to charges format
      const charges = Array.isArray(asset.service_charges) 
        ? asset.service_charges.map(charge => ({
            type: charge.charge_type_display || charge.charge_type,
            amount: parseFloat(charge.amount || 0),
            status: charge.status || (asset.status === 'completed' ? 'paid' : 'pending'),
            description: charge.description,
            chargedBy: charge.charged_by_name,
            createdAt: charge.created_at
          }))
        : [];
      
      return {
        // API fields - ALL DATA FROM BACKEND
        id: asset.id,
        consignment_number: asset.consignment_number,
        item_name: asset.item_name,
        category: asset.category,
        category_display: asset.category_display,
        description: asset.description || '',
        quantity: asset.quantity || 1,
        weight: asset.weight || 0,
        weight_unit: asset.weight_unit || 'kg',
        purity: asset.purity || 100,
        declared_value: parseFloat(asset.declared_value || 0),
        declared_value_currency: asset.declared_value_currency || 'USD',
        total_value: parseFloat(asset.total_value || asset.declared_value || 0),
        status: asset.status,
        status_display: asset.status_display,
        current_location: asset.current_location || 'Secure Storage',
        received_date: asset.received_date,
        received_by_name: asset.received_by_name || 'N/A',
        shipment_count: asset.shipment_count || 0,
        image: asset.image,
        image_url: asset.image_url,
        service_charges: asset.service_charges || [],
        total_charges: asset.total_charges || 0,
        
        // Mapped/fallback fields for component compatibility (camelCase aliases)
        name: asset.item_name || 'Unknown Item',
        consignmentNumber: asset.consignment_number || 'N/A',
        imageUrl: asset.image_url || null,
        storageLocation: asset.current_location || 'Secure Storage',
        storageUnit: 'Box',
        weightUnit: asset.weight_unit || 'kg',
        declaredValue: parseFloat(asset.declared_value || 0),
        assessedValue: parseFloat(asset.total_value || asset.declared_value || 0),
        receivedDate: asset.received_date || new Date().toISOString(),
        charges: charges  // Mapped from service_charges
      };
    });
  };

  // Normalize assets when they change
  const normalizedAssets = normalizeAssets(assets) || [];


  const handleViewDetails = (asset) => {
    setSelectedAsset(asset);
    setShowDetailsModal(true);
  };

  const handleViewHistory = (asset) => {
    setSelectedAsset(asset);
    setShowStatusHistory(true);
  };

  const handleOpenDeliveryChoice = (asset) => {
    setSelectedAsset(asset);
    setShowDeliveryModal(true);
  };

  const handleDeliveryConfirm = (method, asset) => {
    // Update asset status based on delivery method
    const newStatus = method === 'collection' 
      ? DELIVERY_METHOD.COLLECTION_SCHEDULED 
      : DELIVERY_METHOD.SHIPPING_SCHEDULED;
    
    setAssets(assets.map(a => 
      a.id === asset.id ? { ...a, status: newStatus } : a
    ));
    
    // TODO: Send API call to backend with delivery method choice
    console.log(`Delivery method confirmed: ${method} for asset ${asset.consignmentNumber}`);
  };

  const calculateTotalCharges = (charges) => {
    if (!charges || !Array.isArray(charges)) return 0;
    return charges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
  };

  const calculatePendingCharges = (charges) => {
    if (!charges || !Array.isArray(charges)) return 0;
    return charges.filter(c => c.status !== 'paid').reduce((sum, c) => sum + (c.amount || 0), 0);
  };

  // Filter and sort logic
  const filteredAssets = normalizedAssets
    .filter(asset => filterCategory === 'all' || (asset.category_display || asset.category) === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.received_date || b.receivedDate || 0) - new Date(a.received_date || a.receivedDate || 0);
      if (sortBy === 'value') return (parseFloat(b.total_value || b.declared_value || 0)) - (parseFloat(a.total_value || a.declared_value || 0));
      if (sortBy === 'name') return (a.item_name || a.name || '').localeCompare(b.item_name || b.name || '');
      return 0;
    });

  return (
    <Layout menuItems={menuItems}>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-kestrel-gold mb-4 mx-auto" />
            <p className="text-gray-400">Loading your consignments...</p>
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
      {!loading && normalizedAssets.length === 0 && !error && (
        <div className="text-center py-12">
          <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No consignments yet</p>
          <p className="text-sm text-gray-500">Your consignments will appear here once submitted</p>
        </div>
      )}

      {/* Content */}
      {!loading && normalizedAssets.length > 0 && (
        <>
          {/* Header Section - Balanced Banner with Better Colors */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-kestrel-gold/30 rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl" style={{ boxShadow: '0 0 40px rgba(212,175,55,0.1)' }}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-white">
                Your collection, organised.
              </h1>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
                Welcome back, {user?.first_name || user?.email?.split('@')[0] || 'there'}
              </p>
              <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-400 text-xs sm:text-sm">Total Assets</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-kestrel-gold">{normalizedAssets.length}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-400 text-xs sm:text-sm">Total Value</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{formatCurrency(normalizedAssets.reduce((sum, a) => sum + (parseFloat(a.total_value || a.declared_value || 0)), 0))}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-400 text-xs sm:text-sm">In Storage</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-400">{normalizedAssets.filter(a => a.status === 'in_secure_storage').length}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-400 text-xs sm:text-sm">Pending</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-400">{normalizedAssets.filter(a => ['pending', 'under_verification'].includes(a.status)).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
                <FaFilter />
                Filters
              </button>
              <button 
                onClick={() => {
                  setLoading(true);
                  // Fetch and refresh immediately
                  consignmentApi.getMyConsignments()
                    .then(response => {
                      let rawAssets = [];
                      if (Array.isArray(response)) rawAssets = response;
                      else if (response?.data) rawAssets = response.data;
                      else if (response?.results) rawAssets = response.results;
                      setAssets(rawAssets);
                    })
                    .catch(err => setError(err.message))
                    .finally(() => setLoading(false));
                }}
                disabled={loading}
                className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
                title="Refresh charges and asset data"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                <option value="gold_bars">Gold Coins & Bars</option>
                <option value="diamonds">Diamonds & Jewelry</option>
                <option value="gold_jewellery">Gold Jewellery</option>
              </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-gray-300 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
              >
                <option value="date">Most Recent</option>
                <option value="value">Highest Value</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <FaChevronDown className="text-gray-400" />
            </div>
          </div>

          {/* Asset List - Royal Mint Horizontal Style */}
          <div className="space-y-4">
            {filteredAssets.map((asset) => {
          const totalFees = calculateTotalCharges(asset.charges);
          const pendingFees = calculatePendingCharges(asset.charges);
          const isPending = pendingFees > 0;
          
          return (
            <div
              key={asset.id}
              className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-kestrel-gold/40"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section - Left - Rectangle for better fit */}
                <div className="relative w-full md:w-80 bg-gray-800 flex items-center justify-center overflow-hidden" style={{ minHeight: '280px' }}>
                  
                  {/* Asset Image */}
                  <div className="relative w-full sm:w-64 md:w-72 h-64 sm:h-72 overflow-hidden shadow-lg border-2 border-kestrel-gold/30 flex items-center justify-center bg-gray-800 flex-shrink-0">
                    <img 
                      src={asset.imageUrl} 
                      alt={asset.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                      }}
                    />
                  </div>

                  {/* Quantity Badge */}
                  <div className="absolute top-3 right-3 bg-gray-900 border border-kestrel-gold/50 px-3 py-1 rounded-full shadow-md">
                    <span className="text-xs font-bold text-kestrel-gold">Qty {asset.quantity}</span>
                  </div>
                </div>

                {/* Description Section - Right */}
                <div className="flex-1 p-4 sm:p-6 bg-gray-900">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                        {asset.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Consignment #{asset.consignmentNumber}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[asset.status]} px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap`}>
                      {STATUS_LABELS[asset.status]}
                    </span>
                  </div>

                  {/* Storage Location */}
                  <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <FaShieldAlt className="text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-300">
                        {asset.quantity} stored in {asset.storageLocation}
                      </p>
                      <p className="text-xs text-emerald-400">Unit: {asset.storageUnit}</p>
                    </div>
                  </div>

                  {/* Asset Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="font-semibold text-sm text-gray-200">{formatWeight(asset.weight, asset.weightUnit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Purity</p>
                      <p className="font-semibold text-sm text-gray-200">{asset.purity}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Declared Value</p>
                      <p className="font-semibold text-sm text-gray-200">{formatCurrency(asset.declaredValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Assessed Value</p>
                      <p className="font-bold text-sm text-kestrel-gold">{formatCurrency(asset.assessedValue)}</p>
                    </div>
                  </div>

                  {/* Deposit Information */}
                  <div className="bg-blue-900/30 border-l-4 border-blue-500 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-400 font-semibold mb-2 uppercase tracking-wide">Deposit Information</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-blue-400">Date</p>
                        <p className="font-semibold text-sm text-blue-200">{formatDate(asset.receivedDate, 'MMM dd')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-400">Year</p>
                        <p className="font-semibold text-sm text-blue-200">{formatDate(asset.receivedDate, 'yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-400">Days Stored</p>
                        <p className="font-semibold text-sm text-blue-200">{Math.floor((new Date() - new Date(asset.receivedDate)) / (1000 * 60 * 60 * 24))} days</p>
                      </div>
                    </div>
                  </div>

                  {/* Fees Section */}
                  <div className="border-t border-gray-700 pt-4 mb-4">
                    <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <FaCoins className="text-kestrel-gold" />
                      Fee Breakdown
                    </h4>
                    <div className="space-y-2">
                      {Array.isArray(asset.charges) && asset.charges.length > 0 ? (
                        <>
                          {asset.charges.map((charge, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm bg-gray-800/50 p-3 rounded">
                              <div className="flex-1">
                                <p className="text-gray-300 font-semibold">
                                  {charge.type}
                                </p>
                                {charge.description && (
                                  <p className="text-xs text-gray-500 mt-1">{charge.description}</p>
                                )}
                                {charge.chargedBy && (
                                  <p className="text-xs text-gray-500">Company Policy</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-gray-200 block">{formatCurrency(charge.amount)}</span>
                                <span className="text-xs text-gray-500">{charge.createdAt ? new Date(charge.createdAt).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          ))}
                          
                          {/* Total Fees */}
                          <div className="border-t border-gray-700 pt-2 mt-3 flex justify-between items-center font-bold">
                            <span className="text-gray-300">Total Fees:</span>
                            <span className="text-lg text-kestrel-gold">{formatCurrency(totalFees)}</span>
                          </div>
                          
                          {/* Pending Fees Warning */}
                          {isPending && (
                            <div className="bg-red-900/30 border border-red-700/40 rounded-lg p-3 mt-2">
                              <p className="text-sm font-semibold text-red-300 flex items-center gap-2">
                                <FaExclamationTriangle />
                                Outstanding Balance: {formatCurrency(pendingFees)}
                              </p>
                              <p className="text-xs text-red-400 mt-1">
                                ⚠️ Payment required before next process stage
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400 text-sm">No charges applied yet</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleViewDetails(asset)}
                      className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                    >
                      <FaEye />
                      View Details
                    </button>
                    <button
                      onClick={() => handleViewHistory(asset)}
                      className="flex-1 btn-secondary text-sm py-2.5 flex items-center justify-center gap-2"
                    >
                      <FaHistory />
                      Status History
                    </button>
                    {(asset.status === 'in_transit' || asset.status === 'completed' || (asset.shipments && asset.shipments.length > 0)) && (
                      <button
                        onClick={() => window.location.href = '/client/tracking-dashboard'}
                        className="px-4 sm:px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 text-sm py-2.5 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <FaTruck />
                        <span>Track</span>
                      </button>
                    )}
                    {asset.status === 'approved' && !asset.status.includes('delivery') && (
                      <button
                        onClick={() => handleOpenDeliveryChoice(asset)}
                        className="px-4 sm:px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-300 text-sm py-2.5 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <FaArrowRight />
                        <span className="hidden sm:inline">Next Step</span>
                      </button>
                    )}
                    {isPending && (
                      <button
                        className="px-4 sm:px-6 bg-kestrel-gold hover:bg-yellow-600 text-kestrel-black font-semibold rounded-lg transition-colors text-sm py-2.5"
                      >
                        Pay Fees
                      </button>
                    )}
                  </div>

                  {/* Coin Specifications Expandable */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleViewDetails(asset)}
                      className="text-sm text-gray-400 hover:text-kestrel-gold flex items-center gap-2 w-full justify-center border border-gray-700 rounded-lg py-2 hover:border-kestrel-gold transition-colors"
                    >
                      <FaChevronDown />
                      Coin Specifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
          </div>

          {/* Details Modal */}
          {selectedAsset && (
            <Modal
              isOpen={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
              title="Asset Details"
              size="large"
            >
              <div className="space-y-6">
                {/* Asset Information */}
                <div>
                  <h4 className="text-lg font-semibold text-kestrel-charcoal mb-3 border-b pb-2">
                    Asset Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Consignment Number</p>
                      <p className="font-semibold">{selectedAsset.consignmentNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Asset Name</p>
                      <p className="font-semibold">{selectedAsset.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-semibold">{CATEGORY_LABELS[selectedAsset.category]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-semibold">{selectedAsset.quantity} pieces</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`badge ${STATUS_COLORS[selectedAsset.status]}`}>
                        {STATUS_LABELS[selectedAsset.status]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Storage Location</p>
                      <p className="font-semibold">{selectedAsset.storageLocation} - {selectedAsset.storageUnit}</p>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h4 className="text-lg font-semibold text-kestrel-charcoal mb-3 border-b pb-2">
                    Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedAsset.specifications && Object.entries(selectedAsset.specifications).length > 0 ? (
                      Object.entries(selectedAsset.specifications).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase">{key}</p>
                          <p className="font-semibold text-sm">{value}</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 p-3 text-gray-500 text-sm">
                        No specifications available
                      </div>
                    )}
                  </div>
                </div>

                {/* Valuation */}
                <div>
                  <h4 className="text-lg font-semibold text-kestrel-charcoal mb-3 border-b pb-2">
                    Valuation
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Declared Value</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(selectedAsset.declaredValue)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Assessed Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedAsset.assessedValue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Charges */}
                <div>
                  <h4 className="text-lg font-semibold text-kestrel-charcoal mb-3 border-b pb-2">
                    Charges Breakdown
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-kestrel-grey">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Charge Type</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
                          <th className="px-4 py-2 text-right text-sm font-semibold">Amount</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(selectedAsset.charges) && selectedAsset.charges.length > 0 ? (
                          <>
                            {selectedAsset.charges.map((charge, index) => (
                              <tr key={index} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-800">{charge.type}</td>
                                <td className="px-4 py-3 text-gray-600 text-sm">{charge.description || '-'}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                  {formatCurrency(charge.amount)}
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-sm">
                                  {charge.createdAt ? new Date(charge.createdAt).toLocaleDateString() : '-'}
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t-2 font-bold bg-kestrel-grey">
                              <td colSpan="2" className="px-4 py-3">Total Charges</td>
                              <td className="px-4 py-3 text-right">
                                {formatCurrency(calculateTotalCharges(selectedAsset.charges))}
                              </td>
                              <td className="px-4 py-3"></td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                              No charges have been applied yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {/* Status History Modal */}
          {selectedAsset && (
            <Modal
              isOpen={showStatusHistory}
              onClose={() => setShowStatusHistory(false)}
              title="Status Tracking History"
              size="large"
            >
              <StatusTimeline
                statusHistory={selectedAsset.statusHistory}
                consignmentNumber={selectedAsset.consignmentNumber}
                itemName={selectedAsset.name}
              />
            </Modal>
          )}

          {/* Collection/Shipping Modal - Post-Clearance Flow */}
          {selectedAsset && (
            <CollectionShippingModal
              isOpen={showDeliveryModal}
              onClose={() => setShowDeliveryModal(false)}
              asset={selectedAsset}
              onConfirm={handleDeliveryConfirm}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default ClientDashboard;
