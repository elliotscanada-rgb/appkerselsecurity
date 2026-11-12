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
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaPlane,
  FaShip,
  FaTrain,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import { shipmentApi, consignmentApi } from '../../services/assetApi';

const LogisticsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [formData, setFormData] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailShipment, setDetailShipment] = useState(null);
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);
  const [locationData, setLocationData] = useState({
    address: '', city: '', country: '', latitude: '', longitude: '', location_type: 'current'
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

  const STATUSES = ['preparing', 'dispatched', 'in_transit', 'arrived', 'delivered'];
  const TRANSPORT_MODES = ['land', 'air', 'sea', 'rail'];

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const shipmentsResponse = await shipmentApi.getShipments();
      if (shipmentsResponse && Array.isArray(shipmentsResponse)) {
        setShipments(shipmentsResponse);
      } else if (shipmentsResponse && shipmentsResponse.results) {
        setShipments(shipmentsResponse.results);
      }

      const consignmentsResponse = await consignmentApi.getConsignments();
      if (consignmentsResponse && Array.isArray(consignmentsResponse)) {
        setConsignments(consignmentsResponse);
      } else if (consignmentsResponse && consignmentsResponse.results) {
        setConsignments(consignmentsResponse.results);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredShipments = () => {
    return shipments.filter(shipment => {
      const matchesSearch =
        shipment.shipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedShipment(null);
    setFormData({
      consignment: '',
      origin: '',
      destination: '',
      transport_mode: 'land',
      status: 'preparing',
      dispatch_date: '',
      estimated_delivery: '', // This will map to expected_arrival_date
      actual_delivery: '', // This will map to actual_arrival_date
      tracking_number: '', // This will map to container_number
      notes: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (shipment) => {
    setFormMode('edit');
    setSelectedShipment(shipment);
    setFormData({
      consignment: shipment.consignment?.id || '',
      origin: shipment.origin || '',
      destination: shipment.destination || '',
      transport_mode: shipment.transport_mode || 'land',
      status: shipment.status || 'preparing',
      dispatch_date: shipment.dispatch_date?.substring(0, 10) || '',
      estimated_delivery: shipment.expected_arrival_date?.substring(0, 10) || '',
      actual_delivery: shipment.actual_arrival_date?.substring(0, 10) || '',
      tracking_number: shipment.container_number || '',
      notes: shipment.notes || '',
    });
    setShowForm(true);
  };

  const handleViewDetails = async (shipment) => {
    try {
      setLoading(true);
      // Fetch full shipment details with tracking data
      const fullShipment = await shipmentApi.getShipment(shipment.id);
      setDetailShipment(fullShipment);
      setShowDetailModal(true);
    } catch (err) {
      setError('Error loading shipment details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Geocode address using OpenStreetMap Nominatim (free, no API key needed)
  const geocodeAddress = async (address) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (e) { return null; }
  };

  // Update shipment location
  const handleUpdateLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate address first
      if (!locationData.address || !locationData.address.trim()) {
        setError('Please enter an address or city name');
        setLoading(false);
        return;
      }

      let lat = locationData.latitude ? parseFloat(locationData.latitude) : null;
      let lng = locationData.longitude ? parseFloat(locationData.longitude) : null;

      // Auto-geocode if no manual coords provided
      if (!lat || !lng) {
        const query = [locationData.address, locationData.city, locationData.country].filter(Boolean).join(', ');
        console.log('Geocoding query:', query);
        const coords = await geocodeAddress(query);
        if (coords) { 
          lat = coords.lat; 
          lng = coords.lng; 
          console.log('Geocoded to:', lat, lng);
        }
        else {
          setError('Could not find coordinates for this location. Please enter latitude/longitude manually.');
          setLoading(false);
          return;
        }
      }

      console.log('Sending location update:', {
        location_type: locationData.location_type,
        latitude: lat,
        longitude: lng,
        address: locationData.address,
        city: locationData.city,
        country: locationData.country,
      });

      await shipmentApi.updateLocation(detailShipment.id, {
        location_type: locationData.location_type,
        latitude: lat,
        longitude: lng,
        address: locationData.address,
        city: locationData.city || '',
        country: locationData.country || '',
      });

      setSuccess('Location updated! Map will show new position.');
      setShowLocationUpdate(false);
      setLocationData({ address: '', city: '', country: '', latitude: '', longitude: '', location_type: 'current' });

      // Refresh shipment details
      const updated = await shipmentApi.getShipment(detailShipment.id);
      setDetailShipment(updated);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Location update error:', err);
      setError('Error updating location: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (shipment) => {
    if (window.confirm(`Are you sure you want to delete ${shipment.shipment_number}?`)) {
      try {
        setLoading(true);
        await shipmentApi.deleteShipment(shipment.id);
        setSuccess(`Shipment ${shipment.shipment_number} deleted successfully`);
        setTimeout(() => {
          setSuccess(null);
          fetchData();
        }, 2000);
      } catch (err) {
        setError('Error deleting shipment: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.consignment || !formData.origin || !formData.destination) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        origin: formData.origin,
        destination: formData.destination,
        transport_mode: formData.transport_mode,
        status: formData.status,
        dispatch_date: formData.dispatch_date || null,
        expected_arrival_date: formData.estimated_delivery || null,
        actual_arrival_date: formData.actual_delivery || null,
        container_number: formData.tracking_number, // map tracking_number to container_number
        notes: formData.notes,
      };

      // Only include consignment for creation
      if (formMode === 'create') {
        submitData.consignment = parseInt(formData.consignment);
      }

      if (formMode === 'create') {
        await shipmentApi.createShipment(submitData);
        setSuccess('Shipment created successfully');
      } else {
        await shipmentApi.updateShipment(selectedShipment.id, submitData);
        setSuccess('Shipment updated successfully');
      }

      setShowForm(false);
      setTimeout(() => {
        setSuccess(null);
        fetchData();
      }, 2000);
    } catch (err) {
      setError('Error saving shipment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'preparing': 'bg-yellow-900/30 text-yellow-400',
      'dispatched': 'bg-blue-900/30 text-blue-400',
      'in_transit': 'bg-orange-900/30 text-orange-400',
      'arrived': 'bg-cyan-900/30 text-cyan-400',
      'delivered': 'bg-green-900/30 text-green-400',
    };
    return statusColors[status] || 'bg-gray-900/30 text-gray-400';
  };

  const getTransportIcon = (mode) => {
    const icons = {
      'land': '🚚',
      'air': '✈️',
      'sea': '🚢',
      'rail': '🚂',
    };
    return icons[mode] || '📦';
  };

  const filteredShipments = getFilteredShipments();

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">
          Logistics & Shipments Management
        </h1>
        <p className="text-gray-400">
          Manage shipments and logistics operations
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

      {success && (
        <div className="mb-6 bg-green-900/30 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
          <FaCheckCircle className="text-green-400 text-xl" />
          <div className="flex-1">
            <p className="text-green-400 font-semibold">Success</p>
            <p className="text-green-300 text-sm">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-400 hover:text-green-300"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-800 rounded px-3 py-2">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by shipment #, origin, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full outline-none text-gray-100"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-gray-100 cursor-pointer"
        >
          <option value="all">All Status</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 text-white rounded font-semibold flex items-center gap-2 transition"
        >
          <FaPlus /> Add Shipment
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading && !showForm ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-kestrel-gold mx-auto mb-4" />
            <p className="text-gray-400">Loading shipments...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-12 text-center">
            <FaTruck className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No shipments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Shipment #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Route</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Transport</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Consignment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tracking</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-3 font-semibold text-white">{shipment.shipment_number}</td>
                    <td className="px-6 py-3 text-gray-300 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-kestrel-gold text-sm" />
                      {shipment.origin} → {shipment.destination}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-2xl">{getTransportIcon(shipment.transport_mode)}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-300">{shipment.consignment?.consignment_number}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(shipment.status)}`}>
                        {shipment.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{shipment.tracking_number || 'N/A'}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleViewDetails(shipment)}
                          className="p-2 text-cyan-400 hover:bg-cyan-900/30 rounded transition"
                          title="View Details"
                        >
                          <FaMapMarkerAlt />
                        </button>
                        <button
                          onClick={() => handleEditClick(shipment)}
                          className="p-2 text-kestrel-gold hover:bg-kestrel-gold/20 rounded transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(shipment)}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaTruck /> Total Shipments
          </p>
          <p className="text-3xl font-bold text-kestrel-gold">{shipments.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaCheckCircle /> In Transit
          </p>
          <p className="text-3xl font-bold text-orange-400">
            {shipments.filter(s => s.status === 'in_transit').length}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaCheckCircle /> Delivered
          </p>
          <p className="text-3xl font-bold text-green-400">
            {shipments.filter(s => s.status === 'delivered').length}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            ✈️ Air Transport
          </p>
          <p className="text-3xl font-bold text-blue-400">
            {shipments.filter(s => s.transport_mode === 'air').length}
          </p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {formMode === 'create' ? 'Create New Shipment' : 'Edit Shipment'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Consignment *</label>
                <select
                  required
                  value={formData.consignment || ''}
                  onChange={(e) => setFormData({ ...formData, consignment: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="">Select a consignment</option>
                  {consignments.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.consignment_number} - {c.item_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Origin *</label>
                  <input
                    type="text"
                    required
                    value={formData.origin || ''}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Destination *</label>
                  <input
                    type="text"
                    required
                    value={formData.destination || ''}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="e.g., London, UK"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Transport Mode *</label>
                  <select
                    required
                    value={formData.transport_mode || 'land'}
                    onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    {TRANSPORT_MODES.map(mode => (
                      <option key={mode} value={mode}>{mode.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status *</label>
                  <select
                    required
                    value={formData.status || 'preparing'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Dispatch Date</label>
                  <input
                    type="date"
                    value={formData.dispatch_date || ''}
                    onChange={(e) => setFormData({ ...formData, dispatch_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Expected Arrival</label>
                  <input
                    type="date"
                    value={formData.estimated_delivery || ''}
                    onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Actual Arrival</label>
                  <input
                    type="date"
                    value={formData.actual_delivery || ''}
                    onChange={(e) => setFormData({ ...formData, actual_delivery: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Container/Tracking Number</label>
                <input
                  type="text"
                  value={formData.tracking_number || ''}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  placeholder="e.g., CONT123456 or TRK789012"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be saved as container_number in the database
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 disabled:bg-gray-600 rounded font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {formMode === 'create' ? 'Create Shipment' : 'Update Shipment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Detail Modal */}
      {showDetailModal && detailShipment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-kestrel-gold flex items-center gap-2">
                  <FaTruck /> {detailShipment.shipment_number}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Consignment: {detailShipment.consignment?.consignment_number}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusBadge(detailShipment.status)}`}>
                  {detailShipment.status?.replace(/_/g, ' ')}
                </span>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-white">
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-kestrel-gold mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt /> Route Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Origin</p>
                    <p className="text-sm font-semibold text-white">
                      {detailShipment.origin_location?.address || detailShipment.origin || 'N/A'}
                    </p>
                    {detailShipment.origin_location?.city && (
                      <p className="text-xs text-gray-400">
                        {detailShipment.origin_location.city}{detailShipment.origin_location.country ? `, ${detailShipment.origin_location.country}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center text-kestrel-gold">↓</div>
                  <div>
                    <p className="text-xs text-gray-400">Destination</p>
                    <p className="text-sm font-semibold text-white">
                      {detailShipment.destination_location?.address || detailShipment.destination || 'N/A'}
                    </p>
                    {detailShipment.destination_location?.city && (
                      <p className="text-xs text-gray-400">
                        {detailShipment.destination_location.city}{detailShipment.destination_location.country ? `, ${detailShipment.destination_location.country}` : ''}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Transport Mode</p>
                    <p className="text-sm font-semibold text-white capitalize">
                      {getTransportIcon(detailShipment.transport_mode)} {detailShipment.transport_mode}
                    </p>
                  </div>
                  {detailShipment.current_location && (
                    <div>
                      <p className="text-xs text-gray-400">Current Location</p>
                      <p className="text-sm font-semibold text-cyan-400">{detailShipment.current_location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates & Tracking */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-kestrel-gold mb-3 flex items-center gap-2">
                  <FaCheckCircle /> Shipment Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Shipment Number</p>
                    <p className="text-sm font-semibold text-white">{detailShipment.shipment_number}</p>
                  </div>
                  {detailShipment.container_number && (
                    <div>
                      <p className="text-xs text-gray-400">Container Number</p>
                      <p className="text-sm font-semibold text-white">{detailShipment.container_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">Dispatch Date</p>
                    <p className="text-sm font-semibold text-white">
                      {detailShipment.dispatch_date || 'Not dispatched yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Expected Arrival</p>
                    <p className="text-sm font-semibold text-white">
                      {detailShipment.expected_arrival_date || 'Not set'}
                    </p>
                  </div>
                  {detailShipment.actual_arrival_date && (
                    <div>
                      <p className="text-xs text-gray-400">Actual Arrival</p>
                      <p className="text-sm font-semibold text-green-400">{detailShipment.actual_arrival_date}</p>
                    </div>
                  )}
                  {detailShipment.assigned_to_name && (
                    <div>
                      <p className="text-xs text-gray-400">Assigned Officer</p>
                      <p className="text-sm font-semibold text-white">{detailShipment.assigned_to_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Asset Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-kestrel-gold mb-3 flex items-center gap-2">
                  <FaBox /> Asset Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Item</p>
                    <p className="text-sm font-semibold text-white">
                      {detailShipment.consignment?.item_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Client</p>
                    <p className="text-sm font-semibold text-white">
                      {detailShipment.consignment?.client_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Declared Value</p>
                    <p className="text-sm font-bold text-kestrel-gold">
                      ${parseFloat(detailShipment.consignment?.declared_value || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Weight</p>
                    <p className="text-sm font-semibold text-white">
                      {detailShipment.consignment?.weight || 'N/A'} {detailShipment.consignment?.weight_unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location History */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-kestrel-gold mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt /> Location History
                </h3>
                {detailShipment.location_history?.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {detailShipment.location_history.map((loc, idx) => (
                      <div key={idx} className="border-l-2 border-kestrel-gold pl-3">
                        <p className="text-xs text-gray-400">{new Date(loc.recorded_at).toLocaleString()}</p>
                        <p className="text-sm text-white font-semibold">{loc.address}</p>
                        {loc.city && <p className="text-xs text-gray-400">{loc.city}, {loc.country}</p>}
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                          {loc.location_type}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No location updates yet</p>
                )}
              </div>

              {/* Notes */}
              {detailShipment.notes && (
                <div className="md:col-span-2 bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-kestrel-gold mb-2">Notes</h3>
                  <p className="text-sm text-gray-300">{detailShipment.notes}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => setShowLocationUpdate(true)}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded font-semibold text-white flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt /> Update Location
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditClick(detailShipment);
                }}
                className="flex-1 px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 rounded font-semibold text-gray-900 flex items-center justify-center gap-2"
              >
                <FaEdit /> Update Shipment Details
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Update Modal */}
      {showLocationUpdate && detailShipment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <FaMapMarkerAlt /> Update Asset Location
              </h2>
              <button
                onClick={() => {
                  setShowLocationUpdate(false);
                  setLocationData({ address: '', city: '', country: '', latitude: '', longitude: '', location_type: 'current' });
                }}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Location Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={locationData.location_type}
                  onChange={(e) => setLocationData({ ...locationData, location_type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="origin">Origin</option>
                  <option value="current">Current Location</option>
                  <option value="destination">Destination</option>
                  <option value="intermediate">Intermediate Stop</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Address/City</label>
                  <input
                    type="text"
                    value={locationData.address}
                    onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                    placeholder="e.g., 123 Main St, Nairobi"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will be geocoded automatically if no coordinates provided
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Country</label>
                  <input
                    type="text"
                    value={locationData.country}
                    onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                    placeholder="e.g., Kenya"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Latitude <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={locationData.latitude}
                    onChange={(e) => setLocationData({ ...locationData, latitude: e.target.value })}
                    placeholder="e.g., -1.286389"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nairobi: -1.286389</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Longitude <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={locationData.longitude}
                    onChange={(e) => setLocationData({ ...locationData, longitude: e.target.value })}
                    placeholder="e.g., 36.817223"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nairobi: 36.817223</p>
                </div>
              </div>

              <div className="bg-cyan-900/20 border border-cyan-700 rounded p-3">
                <p className="text-sm text-cyan-300 font-semibold">
                  <FaInfoCircle className="inline mr-2" />
                  Location Map Instructions
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  • Leave lat/lng blank to auto‑geocode from address<br />
                  • Current location updates will show on map for tracking<br />
                  • Use "Destination" type to set exact delivery location<br />
                  • Nairobi coordinates: -1.286389, 36.817223
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleUpdateLocation}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  Update Location
                </button>
                <button
                  onClick={() => {
                    setShowLocationUpdate(false);
                    setLocationData({ address: '', city: '', country: '', latitude: '', longitude: '', location_type: 'current' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LogisticsPage;
