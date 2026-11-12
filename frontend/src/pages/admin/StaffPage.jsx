import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaChevronDown,
  FaChartLine,
  FaUserTie,
  FaBox,
  FaCoins,
  FaTruck,
  FaWarehouse,
  FaShieldAlt,
  FaFileAlt,
  FaHistory,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import { userApi } from '../../services/assetApi';
import { useAuth } from '../../contexts/AuthContext';

const StaffPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});

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

  const ROLES = [
    { value: 'admin', label: 'Administrator' },
    { value: 'staff', label: 'Staff Member' },
    { value: 'client', label: 'Client' },
  ];

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUsers();
      if (response && Array.isArray(response)) {
        setUsers(response);
      } else if (response && response.results) {
        setUsers(response.results);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  };

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedUser(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
      role: 'staff',
      is_active: true,
    });
    setShowForm(true);
  };

  const handleEditClick = (u) => {
    setFormMode('edit');
    setSelectedUser(u);
    setFormData({
      email: u.email,
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      role: u.role || 'staff',
      is_active: u.is_active !== false,
    });
    setShowForm(true);
  };

  const handleDeleteClick = async (u) => {
    if (window.confirm(`Are you sure you want to delete ${u.email}?`)) {
      try {
        setLoading(true);
        await userApi.deleteUser(u.id);
        setSuccess(`User ${u.email} deleted successfully`);
        setTimeout(() => {
          setSuccess(null);
          fetchUsers();
        }, 2000);
      } catch (err) {
        setError('Error deleting user: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields');
      return;
    }

    if (formMode === 'create' && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    if (formMode === 'create' && formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: formData.is_active,
      };

      if (formMode === 'create') {
        submitData.password = formData.password;
        await userApi.createUser(submitData);
        setSuccess('User created successfully');
      } else {
        await userApi.updateUser(selectedUser.id, submitData);
        setSuccess('User updated successfully');
      }

      setShowForm(false);
      setTimeout(() => {
        setSuccess(null);
        fetchUsers();
      }, 2000);
    } catch (err) {
      setError('Error saving user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      'admin': 'bg-red-900/30 text-red-400',
      'staff': 'bg-blue-900/30 text-blue-400',
      'client': 'bg-green-900/30 text-green-400',
    };
    return roleColors[role] || 'bg-gray-900/30 text-gray-400';
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-900/30 text-green-400' 
      : 'bg-red-900/30 text-red-400';
  };

  const filteredUsers = getFilteredUsers();

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">
          Staff & Users Management
        </h1>
        <p className="text-gray-400">
          Manage admin staff, employees, and user accounts
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
            placeholder="Search by email, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full outline-none text-gray-100"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-gray-100 cursor-pointer"
        >
          <option value="all">All Roles</option>
          {ROLES.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>

        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 text-white rounded font-semibold flex items-center gap-2 transition"
        >
          <FaPlus /> Add User
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading && !showForm ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-kestrel-gold mx-auto mb-4" />
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <FaUsers className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-3 font-semibold text-white">{u.email}</td>
                    <td className="px-6 py-3 text-gray-300">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(u.is_active)}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">
                      {u.date_joined?.substring(0, 10) || 'N/A'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-2 text-kestrel-gold hover:bg-kestrel-gold/20 rounded transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u)}
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
            <FaUsers /> Total Users
          </p>
          <p className="text-3xl font-bold text-kestrel-gold">{users.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaCheckCircle /> Active Users
          </p>
          <p className="text-3xl font-bold text-green-400">
            {users.filter(u => u.is_active).length}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-2 flex items-center gap-2">
            <FaUserTie /> Admin Users
          </p>
          <p className="text-3xl font-bold text-red-400">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {formMode === 'create' ? 'Create New User' : 'Edit User'}
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
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="user@example.com"
                    disabled={formMode === 'edit'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Role *</label>
                  <select
                    required
                    value={formData.role || 'staff'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {formMode === 'create' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Password *</label>
                    <input
                      type="password"
                      required={formMode === 'create'}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      required={formMode === 'create'}
                      value={formData.confirm_password || ''}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded px-4 py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-300 cursor-pointer">
                  Active User
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-kestrel-gold hover:bg-kestrel-gold/80 disabled:bg-gray-600 rounded font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {formMode === 'create' ? 'Create User' : 'Update User'}
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

export default StaffPage;
