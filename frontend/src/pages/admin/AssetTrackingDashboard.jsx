import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaCircle,
  FaUser,
  FaSearch,
  FaShieldAlt,
  FaWeightHanging,
  FaCheck,
  FaBox,
  FaCoins,
  FaTruck,
  FaArrowRight,
  FaPlane,
  FaShip,
  FaArrowLeft,
  FaSpinner,
  FaExclamationCircle,
} from 'react-icons/fa';
import LocationMap from '../../components/common/LocationMap';
import { shipmentApi } from '../../services/assetApi';

const AssetTrackingDashboard = () => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user from session
  const currentUser = JSON.parse(sessionStorage.getItem('kestrel_user') || '{}');
  const isClient = currentUser?.role === 'client';

  // Fetch shipments using the shared API (works for both admin and client)
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await shipmentApi.getShipments();
        const shipments = Array.isArray(response) ? response : response?.results || [];
        setAssets(shipments);
        if (shipments.length > 0) setSelectedAsset(shipments[0]);
      } catch (err) {
        console.error('Error fetching shipments:', err);
        setError('Failed to load shipments. Please try again.');
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  // Transport mode icon
  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'air': return <FaPlane className="text-2xl md:text-4xl text-cyan-400" />;
      case 'sea': return <FaShip className="text-2xl md:text-4xl text-cyan-400" />;
      case 'rail': return <FaTruck className="text-2xl md:text-4xl text-cyan-400" />;
      default: return <FaTruck className="text-2xl md:text-4xl text-cyan-400" />;
    }
  };

  // Filter assets based on search and status - use real API fields
  const filteredAssets = assets.filter((asset) => {
    const shipmentNum = (asset.shipment_number || '').toLowerCase();
    const origin = (asset.origin || '').toLowerCase();
    const originAddr = (asset.origin_location?.address || '').toLowerCase();
    const destination = (asset.destination || '').toLowerCase();
    const destAddr = (asset.destination_location?.address || '').toLowerCase();
    const itemName = (asset.consignment?.item_name || '').toLowerCase();
    const clientName = (asset.consignment?.client_name || '').toLowerCase();

    const matchesSearch = !searchTerm ||
      shipmentNum.includes(searchTerm.toLowerCase()) ||
      origin.includes(searchTerm.toLowerCase()) ||
      originAddr.includes(searchTerm.toLowerCase()) ||
      destination.includes(searchTerm.toLowerCase()) ||
      destAddr.includes(searchTerm.toLowerCase()) ||
      itemName.includes(searchTerm.toLowerCase()) ||
      clientName.includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Set first asset as selected by default
  useEffect(() => {
    if (!selectedAsset && filteredAssets.length > 0) {
      setSelectedAsset(filteredAssets[0]);
    }
  }, [filteredAssets]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="hidden md:flex md:w-64 lg:w-72 bg-gray-950 border-r border-gray-800 overflow-y-auto flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-cyan-500 text-2xl" />
            <div>
              <h1 className="text-lg font-bold">Kestrel</h1>
              <p className="text-xs text-gray-500">Asset Tracking</p>
            </div>
          </div>
        </div>

        {/* Back button + shipment list */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide px-2 mb-2">My Shipments</p>

          {loading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-cyan-400 text-2xl" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <FaTruck className="text-3xl mx-auto mb-2 opacity-30" />
              <p>No shipments found</p>
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  selectedAsset?.id === asset.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-l-4 border-cyan-500'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <FaTruck className="mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{asset.shipment_number}</p>
                  <p className="text-xs text-gray-500 truncate">{asset.consignment?.item_name || 'Asset'}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block ${
                    asset.status === 'delivered' ? 'bg-green-900/50 text-green-400' :
                    asset.status === 'in_transit' ? 'bg-cyan-900/50 text-cyan-400' :
                    asset.status === 'dispatched' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-yellow-900/50 text-yellow-400'
                  }`}>
                    {asset.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)}></div>
          <div className="absolute left-0 top-0 w-64 h-screen bg-gray-950 border-r border-gray-800 overflow-y-auto z-50">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-cyan-500 text-2xl" />
                <div>
                  <h1 className="text-lg font-bold">Kestrel</h1>
                  <p className="text-xs text-gray-500">Asset Tracking</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => { setSelectedAsset(asset); setShowMobileMenu(false); }}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    selectedAsset?.id === asset.id
                      ? 'bg-cyan-500/20 text-cyan-400 border-l-4 border-cyan-500'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <FaTruck className="mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{asset.shipment_number}</p>
                    <p className="text-xs text-gray-500">{asset.consignment?.item_name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* TOP HEADER */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 px-4 md:px-6 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              <FaTruck className="text-gray-400" />
            </button>
            <FaMapMarkerAlt className="text-cyan-500 text-xl hidden md:block flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-bold truncate">
                {isClient ? 'Track Your Shipment' : 'Asset Tracking'}
              </h2>
              {filteredAssets.length > 0 && (
                <p className="text-xs text-gray-500 hidden md:block">
                  {filteredAssets.length} shipment{filteredAssets.length !== 1 ? 's' : ''} tracked
                </p>
              )}
            </div>
          </div>

          {/* Right - clean and minimal */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Back button */}
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-xs" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* User info - shows real user */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
              <div className="w-7 h-7 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-cyan-400 text-xs" />
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-300 truncate max-w-32">
                {currentUser?.full_name || currentUser?.email?.split('@')[0] || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD AREA */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* LEFT PANEL - TRACKING LIST */}
          <div className="w-full lg:w-96 bg-gray-950 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col overflow-hidden order-2 lg:order-1 max-h-48 lg:max-h-none">
            {/* Search and Filter */}
            <div className="p-3 md:p-4 border-b border-gray-800 space-y-2 md:space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-2.5 text-gray-500 text-sm" />
                  <input
                    type="text"
                    placeholder="Search shipments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Statuses</option>
                <option value="preparing">Preparing</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Shipment List */}
            <div className="flex-1 overflow-y-auto space-y-2 p-2 md:p-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-cyan-400 text-2xl" />
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-400 text-sm">
                  <FaExclamationCircle className="text-2xl mx-auto mb-2" />
                  {error}
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <FaTruck className="text-3xl mx-auto mb-2 opacity-30" />
                  <p>No shipments found</p>
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const progress = {
                    'preparing': 10, 'dispatched': 30, 'in_transit': 60, 'arrived': 85, 'delivered': 100
                  }[asset.status] || 0;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`p-3 md:p-4 rounded-lg cursor-pointer transition-all border text-xs md:text-sm ${
                        selectedAsset?.id === asset.id
                          ? 'bg-cyan-500/20 border-cyan-500'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-xs md:text-sm">{asset.shipment_number}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{asset.consignment?.item_name || 'Asset'}</p>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold text-white flex-shrink-0 ${
                          asset.status === 'delivered' ? 'bg-green-600' :
                          asset.status === 'in_transit' ? 'bg-cyan-600' :
                          asset.status === 'dispatched' ? 'bg-blue-600' :
                          'bg-yellow-600'
                        }`}>
                          {asset.status?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="space-y-0.5 mb-2 text-xs hidden md:block">
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaMapMarkerAlt className="text-green-400 flex-shrink-0" />
                          <span className="truncate">{asset.origin || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 ml-4">
                          <FaArrowRight className="text-cyan-400 flex-shrink-0" />
                          <span className="text-cyan-400 truncate">
                            {asset.destination_location?.address || asset.destination || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="mb-1.5">
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-cyan-500 h-1 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Updated: {asset.updated_at ? new Date(asset.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL - MAP AND DETAILS */}
          <div className="flex-1 flex flex-col overflow-hidden order-1 lg:order-2">
            {/* MAP AREA */}
            <div className="flex-1 bg-gray-900 relative mb-2 md:mb-4 mx-2 md:m-4 rounded-lg overflow-hidden border border-gray-800 min-h-48 md:min-h-96">
              <LocationMap shipment={selectedAsset} />
            </div>

            {/* BOTTOM PANELS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 px-2 md:px-4 pb-2 md:pb-4 flex-shrink-0 max-h-96 overflow-y-auto">

              {/* TRANSPORT & ROUTE PANEL */}
              <div className="lg:col-span-1 bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 overflow-y-auto">
                {selectedAsset ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-cyan-400 text-xs md:text-sm flex items-center gap-2">
                        <FaTruck className="text-sm" /> Transport
                      </h3>
                      <div className="bg-gray-900 rounded-lg p-3 flex flex-col items-center justify-center space-y-2">
                        <div className="text-4xl">
                          {getTransportIcon(selectedAsset.transport_mode)}
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-center capitalize">
                          {selectedAsset.transport_mode} Transport
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-cyan-400 text-xs md:text-sm flex items-center gap-2">
                        <FaMapMarkerAlt className="text-sm" /> Route
                      </h3>
                      <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-xs">
                        <div>
                          <p className="text-gray-500">From</p>
                          <p className="text-white font-semibold">
                            {selectedAsset.origin_location?.address || selectedAsset.origin || 'N/A'}
                          </p>
                        </div>
                        <div className="text-cyan-400 text-center">↓</div>
                        <div>
                          <p className="text-gray-500">To</p>
                          <p className="text-white font-semibold">
                            {selectedAsset.destination_location?.address || selectedAsset.destination || 'N/A'}
                          </p>
                        </div>
                        {selectedAsset.current_location && (
                          <div className="border-t border-gray-700 pt-2">
                            <p className="text-gray-500">Current</p>
                            <p className="text-cyan-400 font-semibold">{selectedAsset.current_location}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedAsset.assigned_to_name && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-cyan-400 text-xs md:text-sm flex items-center gap-2">
                          <FaUser className="text-sm" /> Officer
                        </h3>
                        <div className="bg-gray-900 rounded-lg p-2.5 space-y-2">
                          <p className="text-xs md:text-sm font-semibold">{selectedAsset.assigned_to_name}</p>
                          <div className="flex items-center gap-1">
                            <FaCircle className="text-green-400 text-xs" />
                            <span className="text-xs text-green-400">On duty</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    <p>Select shipment</p>
                  </div>
                )}
              </div>

              {/* SHIPMENT DETAILS PANEL */}
              <div className="lg:col-span-1 bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 overflow-y-auto">
                {selectedAsset ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-cyan-400 text-xs md:text-sm flex items-center gap-2">
                        <FaShieldAlt className="text-sm" /> Shipment Info
                      </h3>
                      <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Shipment #</span>
                          <span className="font-semibold text-white">{selectedAsset.shipment_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status</span>
                          <span className={`font-semibold capitalize ${
                            selectedAsset.status === 'delivered' ? 'text-green-400' :
                            selectedAsset.status === 'in_transit' ? 'text-cyan-400' : 'text-yellow-400'
                          }`}>
                            {selectedAsset.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {selectedAsset.dispatch_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Dispatched</span>
                            <span className="text-white">{selectedAsset.dispatch_date}</span>
                          </div>
                        )}
                        {selectedAsset.expected_arrival_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">ETA</span>
                            <span className="text-cyan-400">{selectedAsset.expected_arrival_date}</span>
                          </div>
                        )}
                        {selectedAsset.container_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Container</span>
                            <span className="text-white">{selectedAsset.container_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location History */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-cyan-400 text-xs md:text-sm flex items-center gap-2">
                        <FaMapMarkerAlt className="text-sm" /> Location History
                      </h3>
                      <div className="bg-gray-900 rounded-lg p-2.5 space-y-2 max-h-32 overflow-y-auto">
                        {selectedAsset.location_history?.length > 0 ? (
                          selectedAsset.location_history.map((loc, idx) => (
                            <div key={idx} className="border-l-2 border-cyan-500/50 pl-2">
                              <p className="text-xs text-white font-semibold">{loc.address}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(loc.recorded_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">No location updates yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    <p>Select shipment</p>
                  </div>
                )}
              </div>

              {/* ASSET DETAILS PANEL */}
              <div className="lg:col-span-1 bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 overflow-y-auto">
                {selectedAsset ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-cyan-400 text-xs md:text-sm flex items-center gap-2">
                      <FaCoins className="text-sm" /> Asset Details
                    </h3>

                    {selectedAsset.consignment?.image_url && (
                      <div className="w-full h-24 md:h-32 bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={selectedAsset.consignment.image_url}
                          alt={selectedAsset.consignment.item_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                            e.target.parentElement.innerHTML = '<span style="color:#6b7280;font-size:12px">No image</span>';
                          }}
                        />
                      </div>
                    )}

                    <div className="bg-gray-900 rounded-lg p-2.5 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Consignment:</span>
                        <span className="font-semibold truncate ml-2 text-white">
                          {selectedAsset.consignment?.consignment_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Item:</span>
                        <span className="font-semibold text-white truncate ml-2">
                          {selectedAsset.consignment?.item_name || 'N/A'}
                        </span>
                      </div>
                      {!isClient && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Client:</span>
                          <span className="font-semibold text-white truncate ml-2">
                            {selectedAsset.consignment?.client_name || 'N/A'}
                          </span>
                        </div>
                      )}
                      {selectedAsset.consignment?.weight && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Weight:</span>
                          <span className="font-semibold text-white">
                            {selectedAsset.consignment.weight} {selectedAsset.consignment.weight_unit}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center p-2 bg-gray-900 rounded-lg">
                        <span className="text-gray-400">Declared Value:</span>
                        <span className="font-semibold text-green-400">
                          ${parseFloat(selectedAsset.consignment?.declared_value || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <FaCheck className="text-green-500" />
                        <span className="text-gray-400">Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-cyan-500" />
                        <span className="text-gray-400">Secured</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    <p>Select shipment</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetTrackingDashboard;
