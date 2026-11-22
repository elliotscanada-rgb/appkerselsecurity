import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaUsers, FaUserTie, FaBox, FaCoins, FaTruck, FaWarehouse, 
  FaShieldAlt, FaFileAlt, FaHistory, FaPlus, FaArrowRight, FaClock, 
  FaUser, FaMapMarkerAlt, FaCheck, FaSpinner, FaExclamationTriangle,
  FaEdit, FaSave, FaTimes, FaSearch, FaTrash
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { API_BASE_URL, STATUS_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { consignmentApi } from '../../services/assetApi';

const CustodyPage = () => {
  // Custody transfers data
  const [custodyRecords, setCustodyRecords] = useState([]);
  
  // Consignments data for custody steps management
  const [consignments, setConsignments] = useState([]);
  const [filteredConsignments, setFilteredConsignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('steps'); // 'steps' or 'transfers'
  
  // Modals
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  const [showCustodyStepsModal, setShowCustodyStepsModal] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    consignment_id: '',
    new_custodian: '',
    new_location: '',
    notes: ''
  });

  const [custodyStepsForm, setCustodyStepsForm] = useState({
    steps: []
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

  // Fetch all consignments and custody records
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch consignments
        const consignmentsData = await consignmentApi.getConsignments();
        const consignmentsList = Array.isArray(consignmentsData) 
          ? consignmentsData 
          : (consignmentsData?.results || consignmentsData?.data || []);
        
        setConsignments(consignmentsList);
        setFilteredConsignments(consignmentsList);

        // Fetch custody records
        const token = localStorage.getItem('kestrel_token');
        if (token) {
          const recordsResponse = await fetch(`${API_BASE_URL}/custody/records/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (recordsResponse.ok) {
            const recordsData = await recordsResponse.json();
            setCustodyRecords(Array.isArray(recordsData) ? recordsData : recordsData.results || []);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter consignments by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredConsignments(consignments);
    } else {
      const filtered = consignments.filter(c =>
        c.consignment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConsignments(filtered);
    }
  }, [searchTerm, consignments]);

  // Open custody steps modal
  const handleEditCustodySteps = (consignment) => {
    setSelectedConsignment(consignment);
    const steps = consignment.custody_steps || [];
    setCustodyStepsForm({
      steps: steps.map(s => ({ ...s }))
    });
    setShowCustodyStepsModal(true);
  };

  // Add new custody step
  const handleAddCustodyStep = () => {
    const maxStepNumber = custodyStepsForm.steps.length > 0 
      ? Math.max(...custodyStepsForm.steps.map(s => s.step_number))
      : 0;
    
    const newStep = {
      id: null, // New step has no ID yet
      step_number: maxStepNumber + 1,
      title: '',
      description: '',
      evidence_description: '',
      status: 'not_established',
      completion_date: null,
      isNew: true // Mark as new so we know to POST instead of PATCH
    };
    
    setCustodyStepsForm({
      steps: [...custodyStepsForm.steps, newStep]
    });
  };

  // Delete custody step
  const handleDeleteCustodyStep = async (stepIndex) => {
    const step = custodyStepsForm.steps[stepIndex];
    
    if (confirm('Are you sure you want to delete this custody step?')) {
      try {
        const token = localStorage.getItem('kestrel_token');
        if (!token) {
          setError('No authentication token');
          return;
        }

        // If step already exists in DB, delete it
        if (step.id && !step.isNew) {
          await fetch(`${API_BASE_URL}/consignments/${selectedConsignment.id}/custody_steps/${step.id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
        }

        // Remove from form
        const updated = custodyStepsForm.steps.filter((_, i) => i !== stepIndex);
        setCustodyStepsForm({ steps: updated });
      } catch (err) {
        console.error('Error deleting custody step:', err);
        setError(err.message);
      }
    }
  };

  // Save custody steps
  const handleSaveCustodySteps = async () => {
    if (!selectedConsignment) return;

    try {
      const token = localStorage.getItem('kestrel_token');
      if (!token) {
        setError('No authentication token');
        return;
      }

      // Validate all steps have required fields
      for (const step of custodyStepsForm.steps) {
        if (!step.title || !step.description || !step.evidence_description) {
          alert('All fields (Title, Description, Evidence) are required for each step');
          return;
        }
      }

      // Process each step
      const createdStepIds = {};
      for (const step of custodyStepsForm.steps) {
        console.log('Processing step:', { step_number: step.step_number, isNew: step.isNew, id: step.id, title: step.title });
        
        if (step.isNew) {
          // Create new step
          console.log('Creating new step:', step.step_number);
          const response = await fetch(`${API_BASE_URL}/consignments/${selectedConsignment.id}/custody_steps/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              step_number: step.step_number,
              title: step.title,
              description: step.description,
              evidence_description: step.evidence_description,
              status: step.status,
              completion_date: step.completion_date,
            })
          });
          
          console.log(`Step ${step.step_number} response status:`, response.status);
          
          if (!response.ok) {
            const errData = await response.json();
            console.error(`Error creating step ${step.step_number}:`, errData);
            throw new Error(`Step ${step.step_number}: ${errData.detail || errData.error || 'Failed to create custody step'}`);
          }
          const createdStep = await response.json();
          console.log('Successfully created step:', createdStep);
          createdStepIds[step.step_number] = createdStep.id; // Track the new ID
        } else if (step.id) {
          // Update existing step
          console.log('Updating existing step:', step.id);
          const response = await fetch(`${API_BASE_URL}/consignments/${selectedConsignment.id}/custody_steps/${step.id}/`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: step.status,
              completion_date: step.completion_date,
              evidence_description: step.evidence_description,
              title: step.title,
              description: step.description,
            })
          });

          console.log(`Step ${step.id} update response status:`, response.status);

          if (!response.ok) {
            const errData = await response.json();
            console.error(`Error updating step ${step.id}:`, errData);
            throw new Error(`Step ${step.id}: ${errData.detail || errData.error || 'Failed to update custody step'}`);
          }
          const updatedStep = await response.json();
          console.log('Successfully updated step:', updatedStep);
        }
      }

      alert('Custody steps saved successfully');
      setShowCustodyStepsModal(false);
      
      // Refresh consignments
      const consignmentsData = await consignmentApi.getConsignments();
      const consignmentsList = Array.isArray(consignmentsData) 
        ? consignmentsData 
        : (consignmentsData?.results || consignmentsData?.data || []);
      setConsignments(consignmentsList);
      setFilteredConsignments(consignmentsList);
    } catch (err) {
      console.error('Error saving custody steps:', err);
      alert(`Error: ${err.message}`);
      setError(err.message);
    }
  };

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    
    if (!formData.new_custodian || !formData.new_location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = sessionStorage.getItem('kestrel_token') || localStorage.getItem('kestrel_token');
      
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/custody/transfer/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consignment_id: formData.consignment_id,
          new_custodian: formData.new_custodian,
          new_location: formData.new_location,
          notes: formData.notes
        })
      });

      if (response.ok) {
        alert('Custody transfer recorded successfully');
        setShowNewTransferModal(false);
        setFormData({ consignment_id: '', new_custodian: '', new_location: '', notes: '' });
        // Refresh the list
        window.location.reload();
      } else {
        const errData = await response.json();
        alert('Failed to record custody transfer: ' + (errData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error recording transfer:', err);
      alert('Error: ' + err.message);
    }
  };

  // Group custody records by consignment for chain visualization
  const groupByCustodyChain = (records) => {
    const chains = {};
    records.forEach(record => {
      const key = record.consignment_id;
      if (!chains[key]) {
        chains[key] = [];
      }
      chains[key].push(record);
    });
    return chains;
  };

  const custodyChains = groupByCustodyChain(custodyRecords);

  return (
    <Layout menuItems={menuItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-kestrel-gold mb-1">Custody Management</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage custody steps and track transfers</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 border-b border-gray-700 flex-wrap">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base border-b-2 transition-colors ${
              activeTab === 'steps'
                ? 'border-kestrel-gold text-kestrel-gold'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <FaShieldAlt className="inline mr-2" />
            Custody Steps
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base border-b-2 transition-colors ${
              activeTab === 'transfers'
                ? 'border-kestrel-gold text-kestrel-gold'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <FaTruck className="inline mr-2" />
            Transfers
          </button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border border-red-700/50">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-red-300 font-semibold">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <div className="flex items-center justify-center gap-3 py-12">
              <FaSpinner className="animate-spin text-cyan-400" />
              <p className="text-gray-400">Loading data...</p>
            </div>
          </Card>
        )}

        {/* CUSTODY STEPS TAB */}
        {!loading && activeTab === 'steps' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by consignment number, item name, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Consignments Grid */}
            {filteredConsignments.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <FaBox className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No consignments found</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredConsignments.map((consignment) => (
                  <Card key={consignment.id} className="hover:border-cyan-500/50 transition-colors">
                    <div className="space-y-4">
                      {/* Consignment Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-gray-700">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-sm sm:text-base break-words">
                            #{consignment.consignment_number}
                          </h3>
                          <p className="text-cyan-400 text-xs sm:text-sm font-semibold truncate">
                            {consignment.item_name}
                          </p>
                          <p className="text-gray-400 text-xs sm:text-sm">
                            Owner: {consignment.client_name || consignment.client?.full_name || 'N/A'}
                          </p>
                        </div>
                        <span className="bg-cyan-900/30 text-cyan-400 px-2 sm:px-3 py-1 rounded text-xs font-semibold whitespace-nowrap">
                          {STATUS_LABELS[consignment.status] || consignment.status}
                        </span>
                      </div>

                      {/* Custody Steps Summary */}
                      <div className="space-y-2">
                        {consignment.custody_steps && consignment.custody_steps.length > 0 ? (
                          <>
                            <div className="text-xs text-gray-500">
                              {consignment.custody_steps.filter(s => s.status === 'completed').length} of {consignment.custody_steps.length} steps completed
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {consignment.custody_steps.map((step) => (
                                <div
                                  key={step.id}
                                  className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                                    step.status === 'completed'
                                      ? 'bg-green-900/30 text-green-400'
                                      : step.status === 'pending'
                                      ? 'bg-blue-900/30 text-blue-400'
                                      : step.status === 'evidence_required'
                                      ? 'bg-orange-900/30 text-orange-400'
                                      : 'bg-gray-700/30 text-gray-400'
                                  }`}
                                >
                                  {step.step_number}. {step.title}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-xs">No custody steps defined</p>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleEditCustodySteps(consignment)}
                        className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-sm"
                      >
                        <FaEdit /> Manage Custody Steps
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSFERS TAB */}
        {!loading && activeTab === 'transfers' && (
          <div className="space-y-4">
            {/* Header with button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-gray-400 text-sm">Total transfers: {custodyRecords.length}</p>
              </div>
              <button
                onClick={() => setShowNewTransferModal(true)}
                className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-sm"
              >
                <FaPlus /> Record Transfer
              </button>
            </div>

            {/* Transfers List */}
            {custodyRecords.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <FaTruck className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No custody transfers recorded yet</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {custodyRecords.map((record, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <div className="space-y-3">
                      {/* Transfer Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                        <span className="font-semibold text-white">Consignment #{record.consignment_id}</span>
                        <span className="text-gray-500 hidden sm:inline">•</span>
                        <span className="text-gray-400">{formatDate(record.transfer_date, 'PPp')}</span>
                      </div>

                      {/* Custodian Transfer */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <FaUser className="text-blue-400" />
                          {record.previous_custodian_name || 'Origin'}
                        </span>
                        <FaArrowRight className="hidden sm:inline text-gray-500" />
                        <span className="text-gray-400 sm:hidden">→</span>
                        <span className="flex items-center gap-1">
                          <FaUser className="text-cyan-400" />
                          {record.new_custodian_name || 'Unknown'}
                        </span>
                      </div>

                      {/* Location Transfer */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-emerald-400" />
                          {record.previous_location || 'Unknown'}
                        </span>
                        <FaArrowRight className="hidden sm:inline text-gray-500" />
                        <span className="text-gray-400 sm:hidden">→</span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-emerald-400" />
                          {record.new_location}
                        </span>
                      </div>

                      {/* Notes */}
                      {record.notes && (
                        <div className="bg-gray-800/50 rounded p-2 text-xs italic text-gray-400 break-words">
                          "{record.notes}"
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custody Steps Modal */}
      {showCustodyStepsModal && selectedConsignment && (
        <Modal
          isOpen={showCustodyStepsModal}
          onClose={() => setShowCustodyStepsModal(false)}
          title={`Custody Steps - ${selectedConsignment.consignment_number}`}
          size="large"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Client Info */}
            <div className="bg-gray-800/50 rounded p-3 mb-4">
              <p className="text-xs text-gray-500">Item Owner</p>
              <p className="text-white font-semibold text-sm">
                {selectedConsignment.client_name || selectedConsignment.client?.full_name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedConsignment.item_name}
              </p>
            </div>

            {/* Custody Steps */}
            <div className="space-y-3">
              {custodyStepsForm.steps.map((step, idx) => (
                <div key={step.id || `new-${idx}`} className="border border-gray-700 rounded-lg p-4 space-y-3">
                  {/* Header with delete button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-700">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">
                        Step {step.step_number}
                        {step.isNew && <span className="text-cyan-400 text-xs ml-2">(New)</span>}
                      </h4>
                    </div>
                    {(step.id || step.isNew) && (
                      <button
                        onClick={() => handleDeleteCustodyStep(idx)}
                        className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-1 rounded border border-red-700/50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Step Number */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Step Number</label>
                    <input
                      type="number"
                      value={step.step_number}
                      onChange={(e) => {
                        const updated = [...custodyStepsForm.steps];
                        updated[idx].step_number = parseInt(e.target.value) || 1;
                        setCustodyStepsForm({ steps: updated });
                      }}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      min="1"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title *</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const updated = [...custodyStepsForm.steps];
                        updated[idx].title = e.target.value;
                        setCustodyStepsForm({ steps: updated });
                      }}
                      placeholder="e.g., Deposit registered"
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description *</label>
                    <textarea
                      value={step.description}
                      onChange={(e) => {
                        const updated = [...custodyStepsForm.steps];
                        updated[idx].description = e.target.value;
                        setCustodyStepsForm({ steps: updated });
                      }}
                      placeholder="Describe this step..."
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      rows="2"
                    />
                  </div>

                  {/* Status and Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Status */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Status</label>
                      <select
                        value={step.status}
                        onChange={(e) => {
                          const updated = [...custodyStepsForm.steps];
                          updated[idx].status = e.target.value;
                          setCustodyStepsForm({ steps: updated });
                        }}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="not_established">Not Established</option>
                        <option value="pending">Pending</option>
                        <option value="evidence_required">Evidence Required</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Completion Date */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Completion Date</label>
                      <input
                        type="date"
                        value={
                          step.completion_date
                            ? (step.completion_date.includes('T')
                                ? step.completion_date.split('T')[0]
                                : step.completion_date.split(' ')[0])
                            : ''
                        }
                        onChange={(e) => {
                          const updated = [...custodyStepsForm.steps];
                          // Store plain YYYY-MM-DD — backend accepts both date and datetime strings
                          updated[idx].completion_date = e.target.value || null;
                          setCustodyStepsForm({ steps: updated });
                        }}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Evidence Description */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Evidence Description *</label>
                    <textarea
                      value={step.evidence_description || ''}
                      onChange={(e) => {
                        const updated = [...custodyStepsForm.steps];
                        updated[idx].evidence_description = e.target.value;
                        setCustodyStepsForm({ steps: updated });
                      }}
                      placeholder="Describe the evidence for this step..."
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      rows="2"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Step Button */}
            <button
              onClick={handleAddCustodyStep}
              className="w-full bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-600/50 text-cyan-400 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <FaPlus /> Add New Custody Step
            </button>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-700">
              <button
                onClick={handleSaveCustodySteps}
                className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
              >
                <FaSave /> Save All Changes
              </button>
              <button
                onClick={() => setShowCustodyStepsModal(false)}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <FaTimes /> Cancel
              </button>
            </div>

            {/* Help Text */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3 text-xs text-blue-300">
              <p className="font-semibold mb-1">Instructions:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Fill in all fields for each step (Title, Description, Evidence)</li>
                <li>Change status to "Completed" when done</li>
                <li>Set completion date when step is done</li>
                <li>Click "Add New Custody Step" to add more steps</li>
                <li>Click "Delete" to remove a step</li>
                <li>Click "Save All Changes" when finished</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* New Transfer Modal */}
      {showNewTransferModal && (
        <Modal
          isOpen={showNewTransferModal}
          onClose={() => setShowNewTransferModal(false)}
          title="Record Custody Transfer"
          size="medium"
        >
          <form onSubmit={handleSubmitTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Consignment <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.consignment_id}
                onChange={(e) => setFormData({ ...formData, consignment_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold text-sm"
                required
              >
                <option value="">Select a consignment...</option>
                {consignments.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.consignment_number} - {c.item_name} ({c.client_name || c.client?.full_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                New Custodian (Staff) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.new_custodian}
                onChange={(e) => setFormData({ ...formData, new_custodian: e.target.value })}
                placeholder="Enter staff member name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                New Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.new_location}
                onChange={(e) => setFormData({ ...formData, new_location: e.target.value })}
                placeholder="Enter new location"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any relevant notes..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold text-sm"
                rows="3"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <button type="submit" className="flex-1 btn-primary text-sm">
                Record Transfer
              </button>
              <button
                type="button"
                onClick={() => setShowNewTransferModal(false)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
};

export default CustodyPage;
