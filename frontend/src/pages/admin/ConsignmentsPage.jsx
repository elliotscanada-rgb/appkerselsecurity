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
  FaImage,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import { consignmentApi, clientApi, shipmentApi } from '../../services/assetApi';

const ConsignmentsPage = () => {
  const [consignments, setConsignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [formData, setFormData] = useState({});
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [chargeFormData, setChargeFormData] = useState({
    charge_type: '',
    amount: '',
    description: '',
  });
  const [charges, setCharges] = useState([]);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentType, setShipmentType] = useState('shipment');
  const [shipmentMode, setShipmentMode] = useState('air');
  const [collectionDetails, setCollectionDetails] = useState('');
  const [editingChargeId, setEditingChargeId] = useState(null);
  const [editChargeData, setEditChargeData] = useState({});
  const [showDeleteChargeModal, setShowDeleteChargeModal] = useState(false);
  const [chargeToDelete, setChargeToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('cleared');
  const [deleteNotes, setDeleteNotes] = useState('');

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

  const STATUSES = [
    'pending', 'received', 'under_verification', 'verification_passed',
    'verification_failed', 'approved', 'rejected', 'in_secure_storage',
    'on_hold', 'withdrawal_requested', 'released', 'in_transit', 'completed',
  ];

  const CATEGORIES = ['gold_bars', 'gold_jewellery', 'precious_metals', 'diamonds', 'other'];
  const WEIGHT_UNITS = ['kg', 'g', 'oz', 't'];

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const consignmentsResponse = await consignmentApi.getConsignments();
      if (consignmentsResponse && Array.isArray(consignmentsResponse)) {
        setConsignments(consignmentsResponse);
      } else if (consignmentsResponse && consignmentsResponse.results) {
        setConsignments(consignmentsResponse.results);
      }

      const clientsResponse = await clientApi.getClients();
      if (clientsResponse && Array.isArray(clientsResponse)) {
        setClients(clientsResponse);
      } else if (clientsResponse && clientsResponse.results) {
        setClients(clientsResponse.results);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredConsignments = () => {
    return consignments.filter(consignment => {
      const matchesSearch =
        consignment.consignment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consignment.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consignment.client?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || consignment.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedConsignment(null);
    setCharges([]);
    setShowChargeForm(false);
    setFormData({
      client: '',
      item_name: '',
      category: '',
      description: '',
      quantity: 1,
      weight: '',
      weight_unit: 'kg',
      purity: '',
      declared_value: '',
      declared_value_currency: 'USD',
      status: 'pending',
      current_location: '',
      received_date: new Date().toISOString().split('T')[0],
      received_by: '',
      image: null,
      imagePreview: null,
    });
    setShowForm(true);
  };

  const handleEditClick = async (consignment) => {
    try {
      setLoading(true);
      // Fetch full consignment details first
      const response = await consignmentApi.getConsignment(consignment.id);
      const fullConsignment = response.data || response;
      
      setFormMode('edit');
      setSelectedConsignment(fullConsignment);
      
      // Load existing charges
      if (fullConsignment.service_charges && Array.isArray(fullConsignment.service_charges)) {
        setCharges(fullConsignment.service_charges);
      } else {
        setCharges([]);
      }
      
      // Prepare existing image preview if available
      let existingImagePreview = null;
      if (fullConsignment.image_url) {
        existingImagePreview = fullConsignment.image_url;
      }
      
      setFormData({
        client: fullConsignment.client?.id || '',
        item_name: fullConsignment.item_name || '',
        category: fullConsignment.category || '',
        description: fullConsignment.description || '',
        quantity: fullConsignment.quantity || 1,
        weight: fullConsignment.weight || '',
        weight_unit: fullConsignment.weight_unit || 'kg',
        purity: fullConsignment.purity || '',
        declared_value: fullConsignment.declared_value || '',
        declared_value_currency: fullConsignment.declared_value_currency || 'USD',
        status: fullConsignment.status || 'pending',
        current_location: fullConsignment.current_location || '',
        received_date: fullConsignment.received_date?.substring(0, 10) || '',
        received_by: fullConsignment.received_by || '',
        image: null,
        imagePreview: existingImagePreview,
      });
      setShowForm(true);
    } catch (err) {
      console.error('Failed to fetch consignment details:', err);
      setError('Failed to load consignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (consignment) => {
    if (window.confirm(`Are you sure you want to delete ${consignment.consignment_number}?`)) {
      try {
        setLoading(true);
        await consignmentApi.deleteConsignment(consignment.id);
        setSuccess(`Consignment ${consignment.consignment_number} deleted successfully`);
        setTimeout(() => {
          setSuccess(null);
          fetchData();
        }, 2000);
      } catch (err) {
        setError('Error deleting consignment: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    
    if (!chargeFormData.charge_type || !chargeFormData.amount) {
      setError('Please fill in charge type and amount');
      return;
    }

    if (!selectedConsignment) {
      setError('Please save consignment first before adding charges');
      return;
    }

    try {
      setLoading(true);
      const response = await consignmentApi.addCharge(selectedConsignment.id, {
        charge_type: chargeFormData.charge_type,
        amount: parseFloat(chargeFormData.amount),
        description: chargeFormData.description || '',
      });
      
      // Add the new charge to the list
      setCharges([...charges, response.data || response]);
      setChargeFormData({ charge_type: '', amount: '', description: '' });
      setShowChargeForm(false);
      setSuccess('Charge added successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Error adding charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete charge with reason
  const handleDeleteCharge = async () => {
    if (!chargeToDelete) return;

    try {
      setLoading(true);
      await consignmentApi.deleteCharge(selectedConsignment.id, {
        charge_id: chargeToDelete.id,
        reason: deleteReason,
        notes: deleteNotes,
      });

      setSuccess('Charge deleted successfully');
      setShowDeleteChargeModal(false);
      setChargeToDelete(null);
      setDeleteReason('cleared');
      setDeleteNotes('');
      
      // Refresh charges list
      setCharges(charges.filter(c => c.id !== chargeToDelete.id));
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Error deleting charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update charge
  const handleUpdateCharge = async (chargeId) => {
    if (!editChargeData.amount && !editChargeData.description && !editChargeData.charge_type) {
      setError('Please modify at least one field');
      return;
    }

    try {
      setLoading(true);
      await consignmentApi.updateCharge(selectedConsignment.id, {
        charge_id: chargeId,
        ...editChargeData,
      });

      setSuccess('Charge updated successfully');
      setEditingChargeId(null);
      setEditChargeData({});
      
      // Update charges list
      setCharges(charges.map(c => 
        c.id === chargeId ? { ...c, ...editChargeData } : c
      ));
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Error updating charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Arrange shipment
  const handleArrangeShipment = async () => {
    if (shipmentType === 'shipment' && !shipmentMode) {
      setError('Please select a transport mode');
      return;
    }

    try {
      setLoading(true);

      const shipmentData = {
        consignment: selectedConsignment.id,
        origin: selectedConsignment.current_location || 'Storage',
        destination: selectedConsignment.client?.address || 'Client Address',
        transport_mode: shipmentMode,
        notes: collectionDetails,
        status: 'preparing',
      };

      // Create shipment
      const shipment = await shipmentApi.createShipment(shipmentData);

      setSuccess(`${shipmentType === 'shipment' ? 'Shipment' : 'Collection'} arranged successfully`);
      setShowShipmentModal(false);
      
      // Route to tracking dashboard
      setTimeout(() => {
        window.location.href = '/admin/tracking';
      }, 1500);
    } catch (err) {
      setError('Error arranging shipment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client || !formData.item_name || !formData.category || !formData.declared_value) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let submitData = {
        client: parseInt(formData.client),
        item_name: formData.item_name,
        category: formData.category,
        description: formData.description,
        quantity: parseInt(formData.quantity) || 1,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        weight_unit: formData.weight_unit,
        purity: formData.purity ? parseFloat(formData.purity) : null,
        declared_value: parseFloat(formData.declared_value),
        declared_value_currency: formData.declared_value_currency,
        status: formData.status,
        current_location: formData.current_location,
        received_date: formData.received_date,
        received_by: formData.received_by ? parseInt(formData.received_by) : null,
      };

      // If there's an image, use FormData to send multipart data
      if (formData.image) {
        const formDataWithImage = new FormData();
        
        // Add all form fields - skip null/empty values to avoid type mismatches
        Object.keys(submitData).forEach(key => {
          // Don't add null, undefined, or empty string values to FormData
          if (submitData[key] !== null && submitData[key] !== undefined && submitData[key] !== '') {
            formDataWithImage.append(key, submitData[key]);
          }
        });
        
        // Add image file
        formDataWithImage.append('image', formData.image);
        
        if (formMode === 'create') {
          const response = await consignmentApi.createConsignmentWithImage(formDataWithImage);
          setSuccess('Consignment created successfully with image');
        } else {
          await consignmentApi.updateConsignmentWithImage(selectedConsignment.id, formDataWithImage);
          setSuccess('Consignment updated successfully');
        }
      } else {
        // No image - use regular JSON submission
        if (formMode === 'create') {
          const response = await consignmentApi.createConsignment(submitData);
          setSuccess('Consignment created successfully');
        } else {
          await consignmentApi.updateConsignment(selectedConsignment.id, submitData);
          setSuccess('Consignment updated successfully');
        }
      }

      setShowForm(false);
      setTimeout(() => {
        setSuccess(null);
        fetchData();
      }, 2000);
    } catch (err) {
      setError('Error saving consignment: ' + err.message);
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
      'verification_failed': 'bg-red-900/30 text-red-400',
      'approved': 'bg-green-900/30 text-green-400',
      'rejected': 'bg-red-900/30 text-red-400',
      'in_secure_storage': 'bg-indigo-900/30 text-indigo-400',
      'on_hold': 'bg-gray-900/30 text-gray-400',
      'withdrawal_requested': 'bg-purple-900/30 text-purple-400',
      'released': 'bg-green-900/30 text-green-400',
      'in_transit': 'bg-cyan-900/30 text-cyan-400',
      'completed': 'bg-green-900/30 text-green-400',
    };
    return statusColors[status] || 'bg-gray-900/30 text-gray-400';
  };

  const filteredConsignments = getFilteredConsignments();
  const totalValue = consignments.reduce((sum, c) => sum + (c.declared_value || 0), 0);

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">
          Consignments Management
        </h1>
        <p className="text-gray-400">
          Manage all consignments and valuables
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
            placeholder="Search by consignment #, item, email..."
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
          <FaPlus /> Add Consignment
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading && !showForm ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-kestrel-gold mx-auto mb-4" />
            <p className="text-gray-400">Loading consignments...</p>
          </div>
        ) : filteredConsignments.length === 0 ? (
          <div className="p-12 text-center">
            <FaBox className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No consignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Consignment #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Item</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredConsignments.map((consignment) => (
                  <tr key={consignment.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-3 font-semibold text-white">{consignment.consignment_number}</td>
                    <td className="px-6 py-3 text-gray-300">{consignment.item_name}</td>
                    <td className="px-6 py-3 text-gray-300">{consignment.client_name}</td>
                    <td className="px-6 py-3 text-kestrel-gold font-semibold">
                      ${consignment.declared_value?.toLocaleString()} {consignment.declared_value_currency}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(consignment.status)}`}>
                        {(consignment.status || 'unknown').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">
                      {consignment.received_date?.substring(0, 10) || 'N/A'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditClick(consignment)}
                          className="p-2 text-kestrel-gold hover:bg-kestrel-gold/20 rounded transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(consignment)}
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

      {/* Shipment Arrangement Modal */}
      {showShipmentModal && selectedConsignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-kestrel-gold mb-4 flex items-center gap-2">
              <FaTruck /> Arrange Shipment
            </h2>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Type:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShipmentType('shipment')}
                    className={`flex-1 px-3 py-2 rounded font-semibold text-sm transition ${
                      shipmentType === 'shipment'
                        ? 'bg-kestrel-gold text-gray-900'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    Shipment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShipmentType('collection')}
                    className={`flex-1 px-3 py-2 rounded font-semibold text-sm transition ${
                      shipmentType === 'collection'
                        ? 'bg-kestrel-gold text-gray-900'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    Collection
                  </button>
                </div>
              </div>

              {shipmentType === 'shipment' && (
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Transport Mode:</label>
                  <select
                    value={shipmentMode}
                    onChange={(e) => setShipmentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  >
                    <option value="air">Air Transport</option>
                    <option value="land">Land Transport</option>
                    <option value="sea">Sea Transport</option>
                    <option value="rail">Rail Transport</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">
                  {shipmentType === 'shipment' ? 'Shipping Details' : 'Collection Details'}:
                </label>
                <textarea
                  value={collectionDetails}
                  onChange={(e) => setCollectionDetails(e.target.value)}
                  placeholder={shipmentType === 'shipment' 
                    ? 'Add any special handling instructions...' 
                    : 'Specify collection address, time, contact info...'}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  rows="3"
                />
              </div>

              <div className="p-3 bg-gray-800 border border-gray-700 rounded">
                <p className="text-xs text-gray-400 mb-1">Consignment:</p>
                <p className="text-sm font-semibold text-gray-200">{selectedConsignment.consignment_number}</p>
                <p className="text-xs text-gray-400 mt-2">Value:</p>
                <p className="text-sm font-bold text-kestrel-gold">${parseFloat(selectedConsignment.declared_value).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowShipmentModal(false);
                  setShipmentType('shipment');
                  setShipmentMode('air');
                  setCollectionDetails('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArrangeShipment}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 disabled:bg-gray-600 rounded font-semibold text-gray-900 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <FaTruck /> Arrange
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Charge Modal */}
      {showDeleteChargeModal && chargeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-kestrel-gold mb-4 flex items-center gap-2">
              <FaTrash /> Delete Charge
            </h2>
            
            <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded">
              <p className="text-sm text-gray-400 mb-1">
                <span className="font-semibold">{chargeToDelete.charge_type_display}</span>
              </p>
              <p className="text-lg font-bold text-kestrel-gold">
                ${parseFloat(chargeToDelete.amount).toFixed(2)}
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Reason for Deletion:</label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="paid">Charge Paid</option>
                  <option value="cleared">Charge Cleared</option>
                  <option value="waived">Charge Waived</option>
                  <option value="error">Incorrect Charge</option>
                  <option value="other">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Notes (optional):</label>
                <textarea
                  value={deleteNotes}
                  onChange={(e) => setDeleteNotes(e.target.value)}
                  placeholder="Add notes about why this charge is being deleted..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteChargeModal(false);
                  setChargeToDelete(null);
                  setDeleteReason('cleared');
                  setDeleteNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCharge}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded font-semibold text-white transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaBox /> Total Consignments
          </p>
          <p className="text-3xl font-bold text-kestrel-gold">{consignments.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaCoins /> Total Value
          </p>
          <p className="text-3xl font-bold text-green-400">
            ${totalValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaCheckCircle /> In Storage
          </p>
          <p className="text-3xl font-bold text-blue-400">
            {consignments.filter(c => c.status === 'in_secure_storage').length}
          </p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {formMode === 'create' ? 'Create New Consignment' : 'Edit Consignment'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Client *</label>
                  <select
                    required
                    value={formData.client || ''}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.client_number} - {client.user?.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status *</label>
                  <div className="flex gap-2 items-stretch">
                    <select
                      required
                      value={formData.status || 'pending'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    {formData.status === 'completed' && selectedConsignment && (
                      <button
                        type="button"
                        onClick={() => setShowShipmentModal(true)}
                        className="px-3 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 rounded text-sm font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap"
                      >
                        <FaTruck /> Arrange Shipment
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.item_name || ''}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="e.g., Gold Bullion"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Category *</label>
                  <select
                    required
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  rows="2"
                  placeholder="Additional details..."
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity || 1}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Weight</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Unit</label>
                  <select
                    value={formData.weight_unit || 'kg'}
                    onChange={(e) => setFormData({ ...formData, weight_unit: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    {WEIGHT_UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Purity %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.purity || ''}
                    onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Declared Value *</label>
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
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Currency</label>
                  <select
                    value={formData.declared_value_currency || 'USD'}
                    onChange={(e) => setFormData({ ...formData, declared_value_currency: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="KES">KES</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Received Date</label>
                  <input
                    type="date"
                    value={formData.received_date || ''}
                    onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Current Location</label>
                  <input
                    type="text"
                    value={formData.current_location || ''}
                    onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="e.g., Vault A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Received By (Optional)</label>
                <input
                  type="text"
                  value={formData.received_by || ''}
                  onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  placeholder="Leave blank or enter staff ID"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">📝 Note: Staff assignment will be handled separately via staff management</p>
              </div>

              {/* Asset Picture/Image Upload Section */}
              <div className="border-t border-gray-700 pt-4">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Asset Picture</label>
                
                {/* Image Preview */}
                {formData.imagePreview && (
                  <div className="mb-4 relative">
                    <img 
                      src={formData.imagePreview} 
                      alt="Asset preview" 
                      className="w-full h-40 object-cover rounded border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imagePreview: null, image: null })}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 rounded"
                    >
                      <FaTimes className="text-white" />
                    </button>
                  </div>
                )}
                
                {/* Image Upload Input */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-4 py-2 bg-gray-800 border-2 border-dashed border-gray-600 hover:border-kestrel-gold rounded cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData({
                              ...formData,
                              image: file,
                              imagePreview: event.target?.result
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="text-center py-2">
                      <FaImage className="text-kestrel-gold text-2xl mx-auto mb-1" />
                      <span className="text-sm text-gray-400">
                        {formData.image ? formData.image.name : 'Click to upload or drag image'}
                      </span>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, WebP (Max 5MB)</p>
              </div>

              {/* Charges Section (only for edit mode) */}
              {formMode === 'edit' && selectedConsignment && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                      <FaCoins className="text-kestrel-gold" />
                      Service Charges
                    </h3>
                    {!showChargeForm && (
                      <button
                        type="button"
                        onClick={() => setShowChargeForm(true)}
                        className="px-3 py-1 bg-kestrel-gold hover:bg-kestrel-gold/80 rounded text-sm font-semibold flex items-center gap-2"
                      >
                        <FaPlus /> Add Charge
                      </button>
                    )}
                  </div>

                  {/* Existing Charges List */}
                  {charges.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {charges.map((charge, idx) => (
                        <div key={idx}>
                          {editingChargeId === charge.id ? (
                            // Edit mode
                            <div className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2">
                              <select
                                value={editChargeData.charge_type || charge.charge_type}
                                onChange={(e) => setEditChargeData({ ...editChargeData, charge_type: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                              >
                                <option value="storage">Storage Fee</option>
                                <option value="handling">Handling Fee</option>
                                <option value="transportation">Transportation Fee</option>
                                <option value="insurance">Insurance Fee</option>
                                <option value="other">Other</option>
                              </select>
                              <input
                                type="number"
                                step="0.01"
                                value={editChargeData.amount || charge.amount}
                                onChange={(e) => setEditChargeData({ ...editChargeData, amount: parseFloat(e.target.value) })}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                              />
                              <textarea
                                value={editChargeData.description || charge.description}
                                onChange={(e) => setEditChargeData({ ...editChargeData, description: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                                rows="2"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCharge(charge.id)}
                                  disabled={loading}
                                  className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingChargeId(null);
                                    setEditChargeData({});
                                  }}
                                  className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className="bg-gray-800 border border-gray-700 rounded p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-gray-300">{charge.charge_type_display}</p>
                                  {charge.description && (
                                    <p className="text-sm text-gray-400">{charge.description}</p>
                                  )}
                                </div>
                                <span className="font-bold text-kestrel-gold">${parseFloat(charge.amount).toFixed(2)}</span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingChargeId(charge.id);
                                    setEditChargeData({});
                                  }}
                                  className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-semibold flex items-center justify-center gap-1"
                                >
                                  <FaEdit /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setChargeToDelete(charge);
                                    setShowDeleteChargeModal(true);
                                  }}
                                  className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold flex items-center justify-center gap-1"
                                >
                                  <FaTrash /> Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="border-t border-gray-700 pt-2 flex justify-between items-center font-bold">
                        <span className="text-gray-300">Total Charges:</span>
                        <span className="text-lg text-kestrel-gold">
                          ${charges.reduce((sum, c) => sum + parseFloat(c.amount), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mb-4">No charges added yet</p>
                  )}

                  {/* Add Charge Form */}
                  {showChargeForm && (
                    <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Charge Type *</label>
                          <select
                            required
                            value={chargeFormData.charge_type}
                            onChange={(e) => setChargeFormData({ ...chargeFormData, charge_type: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                          >
                            <option value="">Select type</option>
                            <option value="storage">Storage Fee</option>
                            <option value="handling">Handling Fee</option>
                            <option value="transportation">Transportation Fee</option>
                            <option value="insurance">Insurance Fee</option>
                            <option value="other">Other Charges</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Amount *</label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            min="0"
                            value={chargeFormData.amount}
                            onChange={(e) => setChargeFormData({ ...chargeFormData, amount: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                        <textarea
                          value={chargeFormData.description}
                          onChange={(e) => setChargeFormData({ ...chargeFormData, description: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                          rows="2"
                          placeholder="Charge details..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddCharge}
                          disabled={loading}
                          className="flex-1 px-3 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 disabled:bg-gray-600 rounded font-semibold flex items-center justify-center gap-2"
                        >
                          {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                          Add Charge
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowChargeForm(false);
                            setChargeFormData({ charge_type: '', amount: '', description: '' });
                          }}
                          className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 disabled:bg-gray-600 rounded font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {formMode === 'create' ? 'Create Consignment' : 'Update Consignment'}
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
    </Layout>
  );
};

export default ConsignmentsPage;
