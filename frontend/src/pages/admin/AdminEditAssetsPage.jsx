import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaUsers,
  FaBox,
  FaCoins,
  FaTruck,
  FaWarehouse,
  FaShieldAlt,
  FaFileAlt,
  FaHistory,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaImage,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronRight,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import { consignmentApi, clientApi, shipmentApi } from '../../services/assetApi';

const AdminEditAssetsPage = () => {
  // State
  const [clients, setClients] = useState([]);
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Selection state
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit state
  const [editingField, setEditingField] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [chargeFormData, setChargeFormData] = useState({
    charge_type: '',
    amount: '',
    description: '',
  });
  const [charges, setCharges] = useState([]);
  
  // Charge edit/delete state
  const [editingChargeId, setEditingChargeId] = useState(null);
  const [editChargeData, setEditChargeData] = useState({});
  const [showDeleteChargeModal, setShowDeleteChargeModal] = useState(false);
  const [chargeToDelete, setChargeToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('cleared');
  const [deleteNotes, setDeleteNotes] = useState('');
  
  // Shipment arrangement state
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentType, setShipmentType] = useState('shipment'); // 'shipment' or 'collection'
  const [shipmentMode, setShipmentMode] = useState('air'); // for shipment
  const [collectionDetails, setCollectionDetails] = useState(''); // for collection

  // Menu
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { heading: true, label: 'Management' },
    { path: '/admin/clients', label: 'Clients', icon: <FaUsers /> },
    { path: '/admin/consignments', label: 'Consignments', icon: <FaBox /> },
    { path: '/admin/edit-assets', label: 'Edit Assets', icon: <FaEdit /> },
    { path: '/admin/valuations', label: 'Valuations', icon: <FaCoins /> },
    { heading: true, label: 'Operations' },
    { path: '/admin/logistics', label: 'Logistics', icon: <FaTruck /> },
    { path: '/admin/custody', label: 'Custody', icon: <FaShieldAlt /> },
    { path: '/admin/storage', label: 'Storage', icon: <FaWarehouse /> },
    { divider: true },
    { path: '/admin/reports', label: 'Reports', icon: <FaFileAlt /> },
    { path: '/admin/audit', label: 'Audit Logs', icon: <FaHistory /> },
  ];

  // Load clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Debug: Log when selectedConsignment changes
  useEffect(() => {
    if (selectedConsignment) {
      console.log('🔍 AdminEditAssetsPage - selectedConsignment updated:', {
        id: selectedConsignment.id,
        status: selectedConsignment.status,
        status_display: selectedConsignment.status_display,
        charges_count: selectedConsignment.service_charges?.length || 0
      });
    }
  }, [selectedConsignment]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getClients();
      if (Array.isArray(response)) {
        setClients(response);
      } else if (response.results) {
        setClients(response.results);
      }
    } catch (err) {
      setError('Failed to load clients: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load consignments for selected client
  const loadClientConsignments = async (clientId) => {
    try {
      setLoading(true);
      const response = await consignmentApi.getConsignments({ client: clientId });
      if (Array.isArray(response)) {
        setConsignments(response);
      } else if (response.results) {
        setConsignments(response.results);
      } else {
        setConsignments([]);
      }
      setSelectedConsignment(null);
      setEditingField(null);
    } catch (err) {
      setError('Failed to load consignments: ' + err.message);
      setConsignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load full consignment details
  const loadConsignmentDetails = async (consignmentId) => {
    try {
      setLoading(true);
      const response = await consignmentApi.getConsignment(consignmentId);
      const fullConsignment = response.data || response;
      
      console.log('📥 API Response for consignment:', {
        consignmentId,
        status: fullConsignment.status,
        status_display: fullConsignment.status_display,
        service_charges_count: fullConsignment.service_charges?.length,
        full_response: fullConsignment
      });
      
      setSelectedConsignment(fullConsignment);
      setEditFormData({
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
      });

      // Load charges - service_charges from backend
      if (fullConsignment.service_charges) {
        const chargesData = fullConsignment.service_charges.map(charge => ({
          id: charge.id,
          charge_type: charge.charge_type,
          charge_type_display: charge.charge_type_display,
          amount: charge.amount,
          description: charge.description,
          charged_by_name: charge.charged_by_name,
          created_at: charge.created_at,
        }));
        setCharges(chargesData);
      } else {
        setCharges([]);
      }

      setEditingField(null);
      setShowChargeForm(false);
    } catch (err) {
      setError('Failed to load consignment details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setSearchTerm('');
    loadClientConsignments(client.id);
  };

  // Handle consignment selection
  const handleConsignmentSelect = (consignment) => {
    loadConsignmentDetails(consignment.id);
  };

  // Update single field
  const handleFieldUpdate = async (field, value) => {
    try {
      setLoading(true);
      const updateData = {
        ...editFormData,
        [field]: value,
      };

      await consignmentApi.updateConsignment(selectedConsignment.id, updateData);
      setSuccess(`${field} updated successfully`);
      setEditingField(null);
      
      // Reload details
      await loadConsignmentDetails(selectedConsignment.id);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Error updating: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add charge
  const handleAddCharge = async (e) => {
    e.preventDefault();
    
    if (!chargeFormData.charge_type || !chargeFormData.amount) {
      setError('Please fill charge type and amount');
      return;
    }

    try {
      setLoading(true);
      await consignmentApi.addCharge(selectedConsignment.id, {
        charge_type: chargeFormData.charge_type,
        amount: parseFloat(chargeFormData.amount),
        description: chargeFormData.description || '',
      });

      setSuccess('Charge added successfully');
      setChargeFormData({ charge_type: '', amount: '', description: '' });
      setShowChargeForm(false);
      await loadConsignmentDetails(selectedConsignment.id);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Error adding charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit charge
  const handleEditCharge = async (chargeId) => {
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
      await loadConsignmentDetails(selectedConsignment.id);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Error updating charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete charge
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
      await loadConsignmentDetails(selectedConsignment.id);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Error deleting charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Arrange shipment (create shipment and route to tracking)
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
        destination: selectedConsignment.client.address || 'Client Address',
        transport_mode: shipmentMode,
        notes: collectionDetails,
        status: 'preparing',
      };

      // Create shipment using shipmentApi
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

  // Filter consignments by search
  const filteredConsignments = consignments.filter(c =>
    c.consignment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value) || 0);
  };

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">
          Edit Assets by Client
        </h1>
        <p className="text-gray-400">
          Select a client, then choose an asset to edit details and manage charges
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <FaExclamationCircle className="text-red-400 text-xl" />
          <div className="flex-1">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-900/30 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
          <FaCheckCircle className="text-green-400 text-xl" />
          <div className="flex-1">
            <p className="text-green-300 text-sm">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Three Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        {/* Panel 1: Clients */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-kestrel-gold">Clients</h2>
            <p className="text-xs text-gray-400">Select a client to view assets</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && !selectedClient ? (
              <div className="flex items-center justify-center h-full">
                <FaSpinner className="animate-spin text-2xl text-kestrel-gold" />
              </div>
            ) : clients.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No clients found</div>
            ) : (
              <div className="space-y-1 p-2">
                {clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={`w-full text-left p-3 rounded transition ${
                      selectedClient?.id === client.id
                        ? 'bg-kestrel-gold/20 border border-kestrel-gold text-kestrel-gold'
                        : 'hover:bg-gray-800 border border-transparent text-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-sm">{client.client_number}</p>
                    <p className="text-xs text-gray-400">{client.user?.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Client's Assets */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-kestrel-gold">Assets</h2>
            {selectedClient ? (
              <p className="text-xs text-gray-400">{selectedClient.client_number}'s assets</p>
            ) : (
              <p className="text-xs text-gray-400">Select a client first</p>
            )}
          </div>

          {!selectedClient ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p className="text-sm">Select a client to see assets</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-gray-700">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading && selectedConsignment === null ? (
                  <div className="flex items-center justify-center h-full">
                    <FaSpinner className="animate-spin text-2xl text-kestrel-gold" />
                  </div>
                ) : filteredConsignments.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    {consignments.length === 0 ? 'No assets' : 'No matching assets'}
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredConsignments.map(consignment => (
                      <button
                        key={consignment.id}
                        onClick={() => handleConsignmentSelect(consignment)}
                        className={`w-full text-left p-3 rounded transition flex items-center justify-between ${
                          selectedConsignment?.id === consignment.id
                            ? 'bg-kestrel-gold/20 border border-kestrel-gold'
                            : 'hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-200 truncate">{consignment.item_name}</p>
                          <p className="text-xs text-gray-400">{consignment.consignment_number}</p>
                          <p className="text-xs text-kestrel-gold font-semibold">{formatCurrency(consignment.declared_value)}</p>
                        </div>
                        <FaChevronRight className="text-gray-500 ml-2 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Panel 3: Asset Details & Edit */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-kestrel-gold">Details</h2>
            {selectedConsignment ? (
              <p className="text-xs text-gray-400">{selectedConsignment.consignment_number}</p>
            ) : (
              <p className="text-xs text-gray-400">Select an asset to edit</p>
            )}
          </div>

          {!selectedConsignment ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p className="text-sm">Select an asset to view details</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Asset Image */}
              {selectedConsignment.image_url && (
                <div className="mb-4">
                  <img
                    src={selectedConsignment.image_url}
                    alt={selectedConsignment.item_name}
                    className="w-full h-32 object-cover rounded border border-gray-700"
                  />
                </div>
              )}

              {/* Basic Fields */}
              <div className="space-y-3">
                {/* Item Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Item Name</label>
                  {editingField === 'item_name' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editFormData.item_name}
                        onChange={(e) => setEditFormData({ ...editFormData, item_name: e.target.value })}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                      />
                      <button
                        onClick={() => handleFieldUpdate('item_name', editFormData.item_name)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold"
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField('item_name')}
                      className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm text-gray-200 flex items-center justify-between"
                    >
                      <span>{selectedConsignment.item_name}</span>
                      <FaEdit className="text-xs text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Category</label>
                  <p className="p-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300">
                    {selectedConsignment.category_display || selectedConsignment.category}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Description</label>
                  <p className="p-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 max-h-20 overflow-y-auto">
                    {selectedConsignment.description || 'No description'}
                  </p>
                </div>

                {/* Declared Value */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Declared Value</label>
                  {editingField === 'declared_value' ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.declared_value}
                        onChange={(e) => setEditFormData({ ...editFormData, declared_value: e.target.value })}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                      />
                      <button
                        onClick={() => handleFieldUpdate('declared_value', editFormData.declared_value)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold"
                        disabled={loading}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField('declared_value')}
                      className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm text-kestrel-gold font-semibold flex items-center justify-between"
                    >
                      <span>{formatCurrency(selectedConsignment.declared_value)}</span>
                      <FaEdit className="text-xs text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Status</label>
                  {editingField === 'status' ? (
                    <div className="flex gap-2">
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="received">Received</option>
                        <option value="approved">Approved</option>
                        <option value="in_secure_storage">In Storage</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => handleFieldUpdate('status', editFormData.status)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold"
                        disabled={loading}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-stretch">
                      <button
                        onClick={() => setEditingField('status')}
                        className="flex-1 text-left p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm text-gray-300 flex items-center justify-between"
                      >
                        <span>{selectedConsignment.status_display || selectedConsignment.status}</span>
                        <FaEdit className="text-xs text-gray-500" />
                      </button>
                      {selectedConsignment.status === 'completed' ? (
                        <button
                          onClick={() => setShowShipmentModal(true)}
                          className="px-3 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 rounded text-xs font-semibold text-gray-900 flex items-center gap-1 whitespace-nowrap transition-all"
                        >
                          <FaTruck /> Arrange Shipment
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Weight */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Weight</label>
                    <p className="p-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300">
                      {selectedConsignment.weight || 'N/A'} {selectedConsignment.weight_unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Purity</label>
                    <p className="p-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300">
                      {selectedConsignment.purity || 'N/A'}%
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Quantity</label>
                    <p className="p-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300">
                      {selectedConsignment.quantity || 1}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Location</label>
                  {editingField === 'current_location' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editFormData.current_location}
                        onChange={(e) => setEditFormData({ ...editFormData, current_location: e.target.value })}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                      />
                      <button
                        onClick={() => handleFieldUpdate('current_location', editFormData.current_location)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold"
                        disabled={loading}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField('current_location')}
                      className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm text-gray-300 flex items-center justify-between"
                    >
                      <span>{selectedConsignment.current_location || 'Not specified'}</span>
                      <FaEdit className="text-xs text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Charges Section */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-kestrel-gold flex items-center gap-2">
                      <FaCoins /> Charges
                    </h3>
                    {!showChargeForm && (
                      <button
                        onClick={() => setShowChargeForm(true)}
                        className="px-2 py-1 bg-kestrel-gold hover:bg-kestrel-gold/80 rounded text-xs font-semibold text-gray-900 flex items-center gap-1"
                      >
                        <FaPlus /> Add
                      </button>
                    )}
                  </div>

                  {/* Add Charge Form */}
                  {showChargeForm && (
                    <div className="bg-gray-800 p-3 rounded mb-3 space-y-2">
                      <select
                        value={chargeFormData.charge_type}
                        onChange={(e) => setChargeFormData({ ...chargeFormData, charge_type: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                      >
                        <option value="">Select type...</option>
                        <option value="storage">Storage Fee</option>
                        <option value="handling">Handling Fee</option>
                        <option value="transportation">Transportation Fee</option>
                        <option value="insurance">Insurance Fee</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={chargeFormData.amount}
                        onChange={(e) => setChargeFormData({ ...chargeFormData, amount: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={chargeFormData.description}
                        onChange={(e) => setChargeFormData({ ...chargeFormData, description: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddCharge}
                          disabled={loading}
                          className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold"
                        >
                          {loading ? <FaSpinner className="animate-spin" /> : 'Add'}
                        </button>
                        <button
                          onClick={() => {
                            setShowChargeForm(false);
                            setChargeFormData({ charge_type: '', amount: '', description: '' });
                          }}
                          className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Charges List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {charges.length === 0 ? (
                      <p className="text-xs text-gray-500 p-2">No charges yet</p>
                    ) : (
                      charges.map((charge, idx) => (
                        <div key={idx} className="bg-gray-800 p-2 rounded text-xs border border-gray-700">
                          {editingChargeId === charge.id ? (
                            // Edit mode
                            <div className="space-y-2">
                              <select
                                value={editChargeData.charge_type || charge.charge_type}
                                onChange={(e) => setEditChargeData({ ...editChargeData, charge_type: e.target.value })}
                                className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
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
                                className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                              />
                              <textarea
                                value={editChargeData.description || charge.description}
                                onChange={(e) => setEditChargeData({ ...editChargeData, description: e.target.value })}
                                className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                                rows="2"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditCharge(charge.id)}
                                  disabled={loading}
                                  className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold"
                                >
                                  {loading ? <FaSpinner className="animate-spin" /> : 'Save'}
                                </button>
                                <button
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
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-200">{charge.charge_type_display}</p>
                                  {charge.description && (
                                    <p className="text-gray-400 text-xs mt-1">{charge.description}</p>
                                  )}
                                </div>
                                <span className="font-bold text-kestrel-gold ml-2">{formatCurrency(charge.amount)}</span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingChargeId(charge.id);
                                    setEditChargeData({});
                                  }}
                                  className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-semibold flex items-center justify-center gap-1"
                                >
                                  <FaEdit /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setChargeToDelete(charge);
                                    setShowDeleteChargeModal(true);
                                  }}
                                  className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold flex items-center justify-center gap-1"
                                >
                                  <FaTrash /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Total Charges */}
                  {charges.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-300">Total:</span>
                      <span className="text-sm font-bold text-kestrel-gold">
                        {formatCurrency(charges.reduce((sum, c) => sum + parseFloat(c.amount), 0))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipment Arrangement Modal */}
      {showShipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-kestrel-gold mb-4 flex items-center gap-2">
              <FaTruck /> Arrange Shipment
            </h2>
            
            <div className="space-y-4 mb-4">
              {/* Shipment Type Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Type:</label>
                <div className="flex gap-2">
                  <button
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

              {/* Shipment mode - only if shipment selected */}
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

              {/* Additional details */}
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

              {/* Asset Summary */}
              <div className="p-3 bg-gray-800 border border-gray-700 rounded">
                <p className="text-xs text-gray-400 mb-1">Consignment:</p>
                <p className="text-sm font-semibold text-gray-200">{selectedConsignment.consignment_number}</p>
                <p className="text-xs text-gray-400 mt-2">Value:</p>
                <p className="text-sm font-bold text-kestrel-gold">{formatCurrency(selectedConsignment.declared_value)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-kestrel-gold mb-4 flex items-center gap-2">
              <FaTrash /> Delete Charge
            </h2>
            
            <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded">
              <p className="text-sm text-gray-300 mb-2">
                <span className="font-semibold">{chargeToDelete.charge_type_display}</span>
              </p>
              <p className="text-lg font-bold text-kestrel-gold">
                {formatCurrency(chargeToDelete.amount)}
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
    </Layout>
  );
};

export default AdminEditAssetsPage;
