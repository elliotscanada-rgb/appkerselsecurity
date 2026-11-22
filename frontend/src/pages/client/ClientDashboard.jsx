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
import CustodyChainTimeline from '../../components/common/CustodyChainTimeline';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, formatWeight } from '../../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS, CATEGORY_LABELS, CONSIGNMENT_STATUS, DELIVERY_METHOD } from '../../utils/constants';
import { consignmentApi, clientApi } from '../../services/assetApi';

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
  const [portfolio, setPortfolio] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  const menuItems = [
    { path: '/client/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { path: '/client/consignments', label: 'My Consignments', icon: <FaBox /> },
    { path: '/client/tracking', label: 'Track Packages', icon: <FaTruck /> },
    { path: '/client/documents', label: 'Documents', icon: <FaFileAlt /> },
    { divider: true },
    { path: '/client/notifications', label: 'Notifications', icon: <FaBell /> },
    { path: '/client/profile', label: 'Profile', icon: <FaUser /> },
  ];

  useEffect(() => {
    const fetchConsignments = async () => {
      try {
        setError(null);
        const response = await consignmentApi.getMyConsignments();
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
        if (!assets.length) {
          setError(err.message || 'Failed to load consignments');
        }
      }
    };

    const fetchPortfolio = async () => {
      try {
        setLoadingPortfolio(true);
        const data = await clientApi.getClientPortfolio();
        setPortfolio(data);
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
      } finally {
        setLoadingPortfolio(false);
      }
    };

    setLoading(true);
    fetchConsignments();
    fetchPortfolio();
    setLoading(false);
    
    // Only poll if tab is visible (tab-aware polling)
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        console.log('Tab visible - polling for updates');
        fetchConsignments();
        fetchPortfolio();
      } else {
        console.log('Tab hidden - skipping poll');
      }
    }, 10000);
    
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible - fetching fresh data');
        fetchConsignments();
        fetchPortfolio();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const normalizeAssets = (rawAssets) => {
    if (!Array.isArray(rawAssets)) return [];
    return rawAssets.map(asset => {
      const charges = Array.isArray(asset.service_charges) 
        ? asset.service_charges.map(charge => ({
            type: charge.charge_type_display || charge.charge_type,
            amount: parseFloat(charge.amount || 0),
            status: charge.status || 'pending',   // use the actual stored status
            description: charge.description,
            chargedBy: charge.charged_by_name,
            createdAt: charge.created_at
          }))
        : [];
      
      return {
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
        custody_steps: asset.custody_steps || [],
        
        name: asset.item_name || 'Unknown Item',
        consignmentNumber: asset.consignment_number || 'N/A',
        imageUrl: asset.image_url || null,
        storageLocation: asset.current_location || 'Secure Storage',
        storageUnit: 'Box',
        weightUnit: asset.weight_unit || 'kg',
        declaredValue: parseFloat(asset.declared_value || 0),
        assessedValue: parseFloat(asset.total_value || asset.declared_value || 0),
        receivedDate: asset.received_date || new Date().toISOString(),
        charges: charges
      };
    });
  };

  const normalizedAssets = normalizeAssets(assets) || [];

  const calculateTotalCharges = (charges) => {
    if (!charges || !Array.isArray(charges)) return 0;
    return charges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
  };

  const calculatePendingCharges = (charges) => {
    if (!charges || !Array.isArray(charges)) return 0;
    return charges.filter(c => c.status !== 'paid').reduce((sum, c) => sum + (c.amount || 0), 0);
  };

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
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-cyan-400 mb-4 mx-auto" />
            <p className="text-gray-400">Loading your consignments...</p>
          </div>
        </div>
      )}

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

      {!loading && normalizedAssets.length === 0 && !error && (
        <div className="text-center py-12">
          <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No consignments yet</p>
          <p className="text-sm text-gray-500">Your consignments will appear here once submitted</p>
        </div>
      )}

      {!loading && normalizedAssets.length > 0 && (
        <>
          {/* 2 BANNERS ONLY */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banner 1: Recorded Gold Weight */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border border-cyan-600/50 rounded-xl p-6 lg:p-8 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wide flex items-center gap-2 mb-2">
                      <FaBox className="text-cyan-400" />
                      Recorded gold weight
                    </p>
                    {loadingPortfolio ? (
                      <p className="text-2xl lg:text-4xl font-bold text-cyan-300">
                        <FaSpinner className="animate-spin inline" />
                      </p>
                    ) : (
                      <p className="text-2xl lg:text-4xl font-bold text-cyan-300">
                        {(portfolio?.total_gold_weight_kg || normalizedAssets.filter(a => a.category === 'gold_bars' || a.category === 'gold_jewellery').reduce((sum, a) => sum + (parseFloat(a.weight || 0)), 0)).toFixed(3)} kg
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-xs">
                  Total weight of all your gold items in custody
                </p>
              </div>

              {/* Banner 2: Consignments Count */}
              <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/30 border border-emerald-600/50 rounded-xl p-6 lg:p-8 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wide flex items-center gap-2 mb-2">
                      <FaBox className="text-emerald-400" />
                      Consignments
                    </p>
                    <p className="text-2xl lg:text-4xl font-bold text-emerald-300">
                      {normalizedAssets.length}
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs">
                  Active consignments in your account
                </p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
                <FaFilter />
                Filters
              </button>
              <button 
                onClick={() => {
                  setLoading(true);
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
                title="Refresh data"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-auto"
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
                className="flex-1 sm:flex-initial px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="date">Most Recent</option>
                <option value="value">Highest Value</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <FaChevronDown className="text-gray-400" />
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-6">
            {filteredAssets.map((asset) => {
              const totalFees = calculateTotalCharges(asset.charges);
              const pendingFees = calculatePendingCharges(asset.charges);
              const isPending = pendingFees > 0;
              
              return (
                <div key={asset.id} className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-cyan-400/40">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section - Photo Design */}
                    <div className="relative w-full md:w-80 bg-gray-800 flex items-center justify-center overflow-hidden" style={{ minHeight: '280px' }}>
                      <div className="relative w-full sm:w-64 md:w-72 h-64 sm:h-72 overflow-hidden shadow-lg border-2 border-cyan-500/30 flex items-center justify-center bg-gray-800 flex-shrink-0">
                        {asset.image_url ? (
                          <img 
                            src={asset.image_url} 
                            alt={asset.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent && !parent.querySelector('.img-fallback')) {
                                const fb = document.createElement('div');
                                fb.className = 'img-fallback w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center';
                                fb.innerHTML = '<div style="color:#92400e;font-size:3rem;opacity:0.3">📦</div>';
                                parent.appendChild(fb);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                            <FaBox className="text-yellow-700 text-6xl opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 bg-gray-900 border border-cyan-500/50 px-3 py-1 rounded-full shadow-md">
                        <span className="text-xs font-bold text-cyan-400">Qty {asset.quantity}</span>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 p-4 sm:p-6 bg-gray-900">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3 mb-4 min-w-0">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 break-words line-clamp-2">
                            {asset.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            Consignment #{asset.consignmentNumber}
                          </p>
                        </div>
                        <span className={`badge ${STATUS_COLORS[asset.status]} px-2 sm:px-3 py-1 sm:py-1.5 text-xs whitespace-nowrap flex-shrink-0`}>
                          {STATUS_LABELS[asset.status]}
                        </span>
                      </div>

                      {/* Storage Location */}
                      <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-lg p-2 sm:p-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 overflow-hidden">
                        <FaShieldAlt className="text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-xs sm:text-sm font-semibold text-emerald-300 break-words">
                            {asset.quantity} stored in {asset.storageLocation}
                          </p>
                          <p className="text-xs text-emerald-400">Unit: {asset.storageUnit}</p>
                        </div>
                      </div>

                      {/* Asset Details Grid - GOLD QUANTITY ONLY */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                        <div className="min-w-0 overflow-hidden">
                          <p className="text-xs text-gray-500 truncate">Quantity</p>
                          <p className="font-semibold text-xs sm:text-sm text-gray-200 break-words">{asset.quantity} items</p>
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <p className="text-xs text-gray-500 truncate">Weight</p>
                          <p className="font-semibold text-xs sm:text-sm text-gray-200 break-words">
                            {asset.weight != null ? Number(asset.weight).toFixed(3) : 'N/A'}{asset.weightUnit}
                          </p>
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <p className="text-xs text-gray-500 truncate">Purity</p>
                          <p className="font-semibold text-xs sm:text-sm text-gray-200 break-words">
                            {asset.purity != null ? `${Number(asset.purity).toFixed(3)}%` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Charges Section - shown when charges exist */}
                      {Array.isArray(asset.charges) && asset.charges.length > 0 && (
                      <div className="border-t border-gray-700 pt-4 overflow-hidden">
                        <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2 truncate">
                          <FaCoins className="text-cyan-400 flex-shrink-0" />
                          <span className="truncate">Service Charges</span>
                        </h4>
                        <div className="space-y-2">
                          {asset.charges.map((charge, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start gap-2 text-xs sm:text-sm bg-gray-800/50 p-2 sm:p-3 rounded overflow-hidden">
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-gray-300 font-semibold truncate">
                                      {charge.type}
                                    </p>
                                    {charge.description && (
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{charge.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right whitespace-nowrap flex flex-col items-end gap-1">
                                    <span className="font-semibold text-gray-200">{formatCurrency(charge.amount, 'GBP')}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                      charge.status === 'paid'
                                        ? 'bg-green-900/50 text-green-400'
                                        : charge.status === 'unpaid'
                                        ? 'bg-red-900/50 text-red-400'
                                        : 'bg-yellow-900/50 text-yellow-400'
                                    }`}>
                                      {charge.status === 'paid' ? '✓ Paid' : charge.status === 'unpaid' ? '✗ Unpaid' : '⏳ Pending'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                        </div>
                      </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <button
                          onClick={() => window.location.href = '/client/tracking-dashboard'}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all text-xs sm:text-sm py-2 px-2 sm:px-3 flex items-center justify-center gap-1 overflow-hidden shadow-lg hover:shadow-xl"
                          title="Track your item location on map"
                        >
                          <FaTruck className="flex-shrink-0" />
                          <span className="truncate">Track Location</span>
                        </button>
                        {asset.status === 'approved' && !asset.status.includes('delivery') && (
                          <button className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all text-xs sm:text-sm py-2 px-2 sm:px-3 flex items-center justify-center gap-1 overflow-hidden shadow-lg hover:shadow-xl">
                            <FaArrowRight className="flex-shrink-0" />
                            <span className="truncate">Next Step</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Custody Chain Timeline */}
                  <div className="border-t border-gray-700 p-4 sm:p-6">
                    <CustodyChainTimeline consignment={asset} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
};

export default ClientDashboard;
