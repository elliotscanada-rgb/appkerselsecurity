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
  FaFilter,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import { clientApi, userApi } from '../../services/assetApi';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({});
  const [countries, setCountries] = useState([]);

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

  // Common countries list
  const COUNTRIES_LIST = [
    'Kenya', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'China', 'India', 'Switzerland',
    'Singapore', 'UAE', 'South Africa', 'Nigeria', 'Egypt'
  ].sort();

  // Fetch clients and users on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch clients
      const clientsResponse = await clientApi.getClients();
      if (clientsResponse && Array.isArray(clientsResponse)) {
        setClients(clientsResponse);
        // Extract unique countries
        const uniqueCountries = [...new Set(clientsResponse.map(c => c.country).filter(Boolean))];
        setCountries(uniqueCountries.sort());
      } else if (clientsResponse && clientsResponse.results) {
        setClients(clientsResponse.results);
      }

      // Fetch users for the form dropdown
      const usersResponse = await userApi.getUsers();
      if (usersResponse && Array.isArray(usersResponse)) {
        setUsers(usersResponse.filter(u => u.role === 'client'));
      } else if (usersResponse && usersResponse.results) {
        setUsers(usersResponse.results.filter(u => u.role === 'client'));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredClients = () => {
    return clients.filter(client => {
      const matchesSearch =
        client.client_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = filterCountry === 'all' || client.country === filterCountry;

      return matchesSearch && matchesCountry;
    });
  };

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedClient(null);
    setFormData({
      user: '',
      phone: '',
      address: '',
      city: '',
      country: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (client) => {
    setFormMode('edit');
    setSelectedClient(client);
    setFormData({
      user: client.user?.id || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || '',
    });
    setShowForm(true);
  };

  const handleDeleteClick = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.client_number}?`)) {
      try {
        setLoading(true);
        await clientApi.deleteClient(client.id);
        setSuccess(`Client ${client.client_number} deleted successfully`);
        setTimeout(() => {
          setSuccess(null);
          fetchData();
        }, 2000);
      } catch (err) {
        setError('Error deleting client: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.user || !formData.phone || !formData.address || !formData.city || !formData.country) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        user: parseInt(formData.user),
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
      };

      if (formMode === 'create') {
        await clientApi.createClient(submitData);
        setSuccess('Client created successfully');
      } else {
        await clientApi.updateClient(selectedClient.id, submitData);
        setSuccess('Client updated successfully');
      }

      setShowForm(false);
      setTimeout(() => {
        setSuccess(null);
        fetchData();
      }, 2000);
    } catch (err) {
      setError('Error saving client: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = getFilteredClients();

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">
          Client Management
        </h1>
        <p className="text-gray-400">
          Manage clients and their contact information
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
            placeholder="Search by client #, email, name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full outline-none text-gray-100"
          />
        </div>

        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-gray-100 cursor-pointer"
        >
          <option value="all">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 text-white rounded font-semibold flex items-center gap-2 transition"
        >
          <FaPlus /> Add Client
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading && !showForm ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-kestrel-gold mx-auto mb-4" />
            <p className="text-gray-400">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <FaUsers className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No clients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Client #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-3 font-semibold text-white">{client.client_number}</td>
                    <td className="px-6 py-3 text-gray-300">{client.user?.email}</td>
                    <td className="px-6 py-3 text-gray-300">
                      {client.user?.first_name} {client.user?.last_name}
                    </td>
                    <td className="px-6 py-3 text-gray-300 flex items-center gap-2">
                      <FaPhone className="text-kestrel-gold text-sm" />
                      {client.phone}
                    </td>
                    <td className="px-6 py-3 text-gray-300 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-kestrel-gold text-sm" />
                      {client.city}, {client.country}
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">
                      {client.created_at?.substring(0, 10) || 'N/A'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditClick(client)}
                          className="p-2 text-kestrel-gold hover:bg-kestrel-gold/20 rounded transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(client)}
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
            <FaUsers /> Total Clients
          </p>
          <p className="text-3xl font-bold text-kestrel-gold">{clients.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaGlobe /> Countries
          </p>
          <p className="text-3xl font-bold text-blue-400">
            {countries.length}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaCheckCircle /> Available Users
          </p>
          <p className="text-3xl font-bold text-green-400">
            {users.length}
          </p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {formMode === 'create' ? 'Create New Client' : 'Edit Client'}
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
                <label className="block text-sm font-semibold text-gray-300 mb-2">User *</label>
                <select
                  required
                  value={formData.user || ''}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  disabled={formMode === 'edit'}
                >
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.email} - {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  placeholder="+254 700 123456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Address *</label>
                <textarea
                  required
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  rows="3"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="e.g., Nairobi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Country *</label>
                  <select
                    required
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES_LIST.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 disabled:bg-gray-600 rounded font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {formMode === 'create' ? 'Create Client' : 'Update Client'}
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

export default ClientsPage;
