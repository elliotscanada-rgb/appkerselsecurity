import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaTruck,
  FaCoins,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimes,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { consignmentApi } from '../../services/assetApi';
import { shipmentApi } from '../../services/assetApi';

/**
 * ADMIN MANAGEMENT DASHBOARD
 * Allows admins to create, edit, and manage consignments, shipments, and assets
 */

const AdminManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('consignments');
  const [consignments, setConsignments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create or edit
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch data on component mount and tab change
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'consignments') {
        const response = await consignmentApi.getConsignments();
        if (response && Array.isArray(response)) {
          setConsignments(response);
        }
      } else if (activeTab === 'shipments') {
        const response = await shipmentApi.getShipments();
        if (response && Array.isArray(response)) {
          setShipments(response);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and status
  const getFilteredData = () => {
    const data = activeTab === 'consignments' ? consignments : shipments;
    
    return data.filter(item => {
      const matchesSearch = 
        item.consignment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEditClick = (item) => {
    setFormMode('edit');
    setSelectedItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDeleteClick = async (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.consignment_number || item.shipment_number}?`)) {
      try {
        setLoading(true);
        
        if (activeTab === 'consignments') {
          await consignmentApi.deleteConsignment(item.id);
        } else if (activeTab === 'shipments') {
          await shipmentApi.deleteShipment(item.id);
        }
        
        setSuccess('Item deleted successfully');
        setTimeout(() => fetchData(), 1000);
      } catch (err) {
        setError('Error deleting item: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (formMode === 'create') {
        if (activeTab === 'consignments') {
          await consignmentApi.createConsignment(formData);
        } else if (activeTab === 'shipments') {
          await shipmentApi.createShipment(formData);
        }
        setSuccess('Item created successfully');
      } else {
        if (activeTab === 'consignments') {
          await consignmentApi.updateConsignment(selectedItem.id, formData);
        } else if (activeTab === 'shipments') {
          await shipmentApi.updateShipment(selectedItem.id, formData);
        }
        setSuccess('Item updated successfully');
      }

      setShowForm(false);
      setTimeout(() => {
        setSuccess(null);
        fetchData();
      }, 2000);
    } catch (err) {
      setError('Error saving item: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-900/30 text-yellow-400',
      'received': 'bg-blue-900/30 text-blue-400',
      'under_verification': 'bg-orange-900/30 text-orange-400',
      'verification_passed': 'bg-cyan-900/30 text-cyan-400',
      'approved': 'bg-green-900/30 text-green-400',
      'in_secure_storage': 'bg-indigo-900/30 text-indigo-400',
      'in_transit': 'bg-cyan-900/30 text-cyan-400',
      'completed': 'bg-green-900/30 text-green-400',
      'delivered': 'bg-green-900/30 text-green-400',
      'preparing': 'bg-yellow-900/30 text-yellow-400',
      'dispatched': 'bg-blue-900/30 text-blue-400',
      'arrived': 'bg-cyan-900/30 text-cyan-400',
    };
    return statusColors[status] || 'bg-gray-900/30 text-gray-400';
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FaBox className="text-cyan-400" />
            Admin Management Dashboard
          </h1>
          <p className="text-gray-400">Manage consignments, shipments, and assets</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <FaExclamationCircle className="text-red-400 text-xl" />
            <div>
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-900/30 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
            <FaCheckCircle className="text-green-400 text-xl" />
            <div>
              <p className="text-green-400 font-semibold">Success</p>
              <p className="text-green-300 text-sm">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-300"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('consignments')}
            className={`px-4 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'consignments'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <FaBox /> Consignments
          </button>
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-4 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === 'shipments'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <FaTruck /> Shipments
          </button>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-800 rounded px-3 py-2">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
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
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>

          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded font-semibold flex items-center gap-2 transition"
          >
            <FaPlus /> Create New
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {loading && !showForm ? (
            <div className="p-12 text-center">
              <FaSpinner className="animate-spin text-4xl text-cyan-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <FaBox className="text-4xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      {activeTab === 'consignments' ? 'Consignment #' : 'Shipment #'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      {activeTab === 'consignments' ? 'Item' : 'From → To'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      {activeTab === 'consignments' ? 'Value' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-6 py-3 font-semibold text-white">
                        {item.consignment_number || item.shipment_number}
                      </td>
                      <td className="px-6 py-3 text-gray-300">
                        {item.item_name || `${item.origin} → ${item.destination}`}
                      </td>
                      <td className="px-6 py-3 text-gray-300">
                        {item.declared_value 
                          ? `$${item.declared_value} ${item.declared_value_currency}`
                          : item.status_display || item.status}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(item.status)}`}>
                          {item.status_display || item.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-sm">
                        {item.received_date?.substring(0, 10) || item.created_at?.substring(0, 10)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-cyan-400 hover:bg-cyan-900/30 rounded transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 mb-2 flex items-center gap-2">
              <FaBox /> Total
            </p>
            <p className="text-3xl font-bold text-cyan-400">{filteredData.length}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 mb-2 flex items-center gap-2">
              <FaCheckCircle /> Active
            </p>
            <p className="text-3xl font-bold text-green-400">
              {filteredData.filter(i => i.status === 'in_transit' || i.status === 'dispatched').length}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 mb-2 flex items-center gap-2">
              <FaCoins /> Total Value
            </p>
            <p className="text-3xl font-bold text-cyan-400">
              ${filteredData.reduce((sum, i) => sum + (i.declared_value || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {formMode === 'create' ? 'Create New' : 'Edit'} {activeTab === 'consignments' ? 'Consignment' : 'Shipment'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {activeTab === 'consignments' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Item Name</label>
                    <input
                      type="text"
                      required
                      value={formData.item_name || ''}
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="e.g., Gold Bullion 24K"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                    <select
                      required
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    >
                      <option value="">Select Category</option>
                      <option value="gold_bars">Gold Bars</option>
                      <option value="gold_jewellery">Gold Jewellery</option>
                      <option value="precious_metals">Precious Metals</option>
                      <option value="diamonds">Diamonds & Gemstones</option>
                      <option value="other">Other Valuables</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Weight</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Weight Unit</label>
                      <select
                        value={formData.weight_unit || 'kg'}
                        onChange={(e) => setFormData({ ...formData, weight_unit: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="oz">Ounces</option>
                        <option value="t">Tonnes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Declared Value</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.declared_value || ''}
                      onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="e.g., 25000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      rows="3"
                      placeholder="Additional details..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Origin</label>
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
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Destination</label>
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Transport Mode</label>
                    <select
                      value={formData.transport_mode || ''}
                      onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    >
                      <option value="">Select Transport Mode</option>
                      <option value="land">Land Transport</option>
                      <option value="air">Air Transport</option>
                      <option value="sea">Sea Transport</option>
                      <option value="rail">Rail Transport</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    >
                      <option value="">Select Status</option>
                      <option value="preparing">Preparing</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="in_transit">In Transit</option>
                      <option value="arrived">Arrived</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {formMode === 'create' ? 'Create' : 'Update'}
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
    </div>
  );
};

export default AdminManagementDashboard;
