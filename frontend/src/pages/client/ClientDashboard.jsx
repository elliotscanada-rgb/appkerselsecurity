import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaChartLine,
  FaTruck,
  FaFileAlt,
  FaBell,
  FaUser,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaSync,
  FaCube,
  FaCoins,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import CustodyChainTimeline from '../../components/common/CustodyChainTimeline';
import { useAuth } from '../../contexts/AuthContext';
import { formatWeight } from '../../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import { consignmentApi, clientApi } from '../../services/assetApi';

/**
 * CLIENT DASHBOARD - SIMPLIFIED
 * Focus: Gold weight + Consignment count (2 banners)
 * Shows: Consignment details with custody chain tracking
 */
const ClientDashboard = () => {
  const { user } = useAuth();
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

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

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await consignmentApi.getMyConsignments();
        let rawConsignments = [];
        if (Array.isArray(response)) {
          rawConsignments = response;
        } else if (response?.data) {
          rawConsignments = response.data;
        } else if (response?.results) {
          rawConsignments = response.results;
        }
        setConsignments(rawConsignments);

        // Fetch portfolio
        try {
          setLoadingPortfolio(true);
          const portfolioData = await clientApi.getClientPortfolio();
          setPortfolio(portfolioData);
        } catch (err) {
          console.error('Failed to fetch portfolio:', err);
        } finally {
          setLoadingPortfolio(false);
        }
      } catch (err) {
        console.error('Failed to fetch consignments:', err);
        setError(err.message || 'Failed to load consignments');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll every 10 seconds
    const pollInterval = setInterval(fetchData, 10000);
    return () => clearInterval(pollInterval);
  }, []);

  // Calculate total gold weight
  const calculateTotalGoldWeight = () => {
    if (portfolio?.total_gold_weight_kg) {
      return portfolio.total_gold_weight_kg;
    }
    return consignments
      .filter(c => c.category === 'gold_bars' || c.category === 'gold_jewellery')
      .reduce((sum, c) => sum + (parseFloat(c.weight || 0)), 0);
  };

  return (
    <Layout menuItems={menuItems}>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-cyan-400 mb-4 mx-auto" />
            <p className="text-gray-400">Loading your assets...</p>
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
          <p className="text-sm text-gray-500">Your consignments will appear here</p>
        </div>
      )}

      {/* Content */}
      {!loading && consignments.length > 0 && (
        <>
          {/* Header - Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Your Gold Assets
            </h1>
            <p className="text-gray-400">
              Welcome back, {user?.first_name || user?.email?.split('@')[0] || 'there'}
            </p>
          </div>

          {/* 2 BANNERS ONLY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Banner 1: Recorded Gold Weight */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border border-cyan-600/50 rounded-xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wide flex items-center gap-2 mb-2">
                    <FaCube className="text-cyan-400" />
                    Recorded gold weight
                  </p>
                  {loadingPortfolio ? (
                    <p className="text-2xl lg:text-4xl font-bold text-cyan-300">
                      <FaSpinner className="animate-spin inline" />
                    </p>
                  ) : (
                    <p className="text-2xl lg:text-4xl font-bold text-cyan-300">
                      {calculateTotalGoldWeight().toFixed(2)} kg
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
                    {consignments.length}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">
                Active consignments in your account
              </p>
            </div>
          </div>

          {/* Consignments List with Custody Chain */}
          <div className="space-y-8">
            {consignments.map((consignment) => (
              <div key={consignment.id} className="space-y-4">
                {/* Consignment Header Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    {/* Left: Item Info */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {consignment.item_name}
                      </h2>
                      <p className="text-gray-400 text-sm mb-3">
                        Consignment: <span className="text-cyan-400 font-semibold">{consignment.consignment_number}</span>
                      </p>

                      {/* Status Badge */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className={`badge ${STATUS_COLORS[consignment.status]} px-3 py-1.5 text-xs font-semibold`}>
                          {STATUS_LABELS[consignment.status]}
                        </span>
                        <span className="text-gray-400 text-xs">
                          Location: <span className="text-gray-300">{consignment.current_location || 'Secure Storage'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Track Button */}
                    <button
                      onClick={() => window.location.href = '/client/tracking-dashboard'}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg px-6 py-3 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                      title="Track your item location on map - works in storage, transit, and all states"
                    >
                      <FaTruck className="inline mr-2" />
                      Track Location
                    </button>
                  </div>
                </div>

                {/* Consignment Details Grid - Physical specs only (NO MONEY VALUES) */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FaBox className="text-cyan-400" />
                    Consignment Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Weight</p>
                      <p className="text-xl font-bold text-cyan-300">
                        {consignment.weight} {consignment.weight_unit}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Purity</p>
                      <p className="text-xl font-bold text-cyan-300">
                        {consignment.purity}%
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Quantity</p>
                      <p className="text-xl font-bold text-cyan-300">
                        {consignment.quantity}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Category</p>
                      <p className="text-xl font-bold text-cyan-300">
                        {consignment.category_display || consignment.category}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {consignment.description && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm">{consignment.description}</p>
                    </div>
                  )}
                </div>

                {/* Custody Chain Timeline */}
                <CustodyChainTimeline consignment={consignment} />
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default ClientDashboard;
