/**
 * Asset API Service
 * Handles all CRUD operations for assets, shipments, locations, and consignments
 * Base URL should be set via environment variable API_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  // Priority: sessionStorage > localStorage
  const sessionToken = sessionStorage.getItem('kestrel_token');
  if (sessionToken) return sessionToken;
  
  const localToken = localStorage.getItem('authToken');
  if (localToken) return localToken;
  
  return null;
};

// Helper function to clear auth data (logout)
const clearAuth = () => {
  sessionStorage.removeItem('kestrel_token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('kestrel_user');
  sessionStorage.removeItem('kestrel_session_id');
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

// Helper function for API requests with error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  let token = getAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };

  try {
    let response = await fetch(url, config);

    // If 401 Unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && sessionStorage.getItem('refreshToken')) {
      console.log('Token expired, attempting refresh...');
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: sessionStorage.getItem('refreshToken') })
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          // Update stored tokens (refresh token may be rotated)
          sessionStorage.setItem('kestrel_token', refreshData.access);
          if (refreshData.refresh) {
            sessionStorage.setItem('refreshToken', refreshData.refresh);
          }
          
          console.log('Token refreshed successfully');
          
          // Retry original request with new token
          defaultHeaders['Authorization'] = `Bearer ${refreshData.access}`;
          config.headers = defaultHeaders;
          response = await fetch(url, config);
        } else {
          console.error('Token refresh failed with status:', refreshResponse.status);
          // Refresh failed, clear auth and force login
          clearAuth();
          window.location.href = '/login?session=expired';
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        // Clear auth and redirect to login
        clearAuth();
        window.location.href = '/login?session=expired';
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // If still 401 after refresh attempt, clear auth
      if (response.status === 401) {
        clearAuth();
        window.location.href = '/login?session=expired';
      }
      
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Handle empty responses (like successful DELETE requests)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { success: true };
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
};

// =====================================================
// CONSIGNMENT ENDPOINTS
// =====================================================

export const consignmentApi = {
  /**
   * Get all consignments for the current user
   * @param {Object} filters - Filter options
   */
  getConsignments: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/consignments/${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Get my consignments (client endpoint)
   */
  getMyConsignments: async () => {
    return apiRequest(`/consignments/my_consignments/`);
  },

  /**
   * Get single consignment
   * @param {string} consignmentId - Consignment ID
   */
  getConsignment: async (consignmentId) => {
    return apiRequest(`/consignments/${consignmentId}/`);
  },

  /**
   * Get consignment tracking info with shipments
   * @param {string} consignmentId - Consignment ID
   */
  getConsignmentTracking: async (consignmentId) => {
    return apiRequest(`/consignments/${consignmentId}/tracking_info/`);
  },

  /**
   * Get consignment history
   * @param {string} consignmentId - Consignment ID
   */
  getConsignmentHistory: async (consignmentId) => {
    return apiRequest(`/consignments/${consignmentId}/history/`);
  },

  /**
   * Get consignment statistics
   */
  getStatistics: async () => {
    return apiRequest(`/consignments/statistics/`);
  },

  /**
   * Create new consignment
   * @param {Object} consignmentData - Consignment data
   */
  createConsignment: async (consignmentData) => {
    return apiRequest(`/consignments/`, {
      method: 'POST',
      body: JSON.stringify(consignmentData),
    });
  },

  /**
   * Create consignment with image (multipart form data)
   * @param {FormData} formData - Form data with consignment data and image
   */
  createConsignmentWithImage: async (formData) => {
    const url = `${API_BASE_URL}/consignments/`;
    
    const defaultHeaders = {};

    const token = getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: 'POST',
      headers: defaultHeaders,
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed: /consignments/`, error);
      throw error;
    }
  },

  /**
   * Update consignment
   * @param {number} consignmentId - Consignment ID
   * @param {Object} updates - Fields to update
   */
  updateConsignment: async (consignmentId, updates) => {
    return apiRequest(`/consignments/${consignmentId}/`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Update consignment with image (multipart form data)
   * @param {number} consignmentId - Consignment ID
   * @param {FormData} formData - Form data with updates and image
   */
  updateConsignmentWithImage: async (consignmentId, formData) => {
    const url = `${API_BASE_URL}/consignments/${consignmentId}/`;
    
    const defaultHeaders = {};

    const token = getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: 'PUT',
      headers: defaultHeaders,
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed: /consignments/${consignmentId}/`, error);
      throw error;
    }
  },

  /**
   * Update consignment status
   * @param {string} consignmentId - Consignment ID
   * @param {string} status - New status
   * @param {string} location - New location
   * @param {string} description - Status change description
   */
  updateConsignmentStatus: async (consignmentId, status, location = '', description = '') => {
    return apiRequest(`/consignments/${consignmentId}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status, location, description }),
    });
  },

  /**
   * Delete consignment
   * @param {number} consignmentId - Consignment ID
   */
  deleteConsignment: async (consignmentId) => {
    return apiRequest(`/consignments/${consignmentId}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Add charge to consignment
   * @param {number} consignmentId - Consignment ID
   * @param {Object} chargeData - Charge details
   */
  addCharge: async (consignmentId, chargeData) => {
    return apiRequest(`/consignments/${consignmentId}/add_charge/`, {
      method: 'POST',
      body: JSON.stringify(chargeData),
    });
  },

  /**
   * Update a service charge
   * @param {number} consignmentId - Consignment ID
   * @param {Object} chargeData - Updated charge data (charge_id, amount, description, charge_type)
   */
  updateCharge: async (consignmentId, chargeData) => {
    return apiRequest(`/consignments/${consignmentId}/update_charge/`, {
      method: 'PUT',
      body: JSON.stringify(chargeData),
    });
  },

  /**
   * Delete a service charge with reason
   * @param {number} consignmentId - Consignment ID
   * @param {Object} chargeData - Charge ID and deletion reason
   */
  deleteCharge: async (consignmentId, chargeData) => {
    return apiRequest(`/consignments/${consignmentId}/delete_charge/`, {
      method: 'DELETE',
      body: JSON.stringify(chargeData),
    });
  },
};

// =====================================================
// ASSET ENDPOINTS
// =====================================================

export const assetApi = {
  /**
   * Get consignments (alias for compatibility)
   */
  getConsignments: consignmentApi.getConsignments,
  
  /**
   * Get my consignments (client endpoint)
   */
  getMyConsignments: consignmentApi.getMyConsignments,
  
  /**
   * Get all assets (with filters)
   * @param {Object} filters - Filter options
   * @param {string} filters.status - Filter by asset status
   * @param {number} filters.consignmentId - Filter by consignment
   * @param {number} filters.page - Pagination page
   * @param {number} filters.limit - Items per page
   */
  getAssets: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/assets?${queryString}`);
  },

  /**
   * Get single asset by ID
   * @param {string} assetId - Asset ID
   */
  getAsset: async (assetId) => {
    return apiRequest(`/assets/${assetId}`);
  },

  /**
   * Create new asset
   * @param {Object} assetData - Asset data
   */
  createAsset: async (assetData) => {
    return apiRequest('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  },

  /**
   * Update asset
   * @param {string} assetId - Asset ID
   * @param {Object} updates - Fields to update
   */
  updateAsset: async (assetId, updates) => {
    return apiRequest(`/assets/${assetId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Update asset status
   * @param {string} assetId - Asset ID
   * @param {string} status - New status
   * @param {string} notes - Status change notes
   */
  updateAssetStatus: async (assetId, status, notes = '') => {
    return apiRequest(`/assets/${assetId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  /**
   * Delete asset
   * @param {string} assetId - Asset ID
   */
  deleteAsset: async (assetId) => {
    return apiRequest(`/assets/${assetId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get asset valuation details
   * @param {string} assetId - Asset ID
   */
  getAssetValuation: async (assetId) => {
    return apiRequest(`/assets/${assetId}/valuation`);
  },

  /**
   * Upload asset photo
   * @param {string} assetId - Asset ID
   * @param {File} file - Image file
   */
  uploadAssetPhoto: async (assetId, file) => {
    const formData = new FormData();
    formData.append('photo', file);

    return apiRequest(`/assets/${assetId}/photo`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  },

  /**
   * Get asset history/timeline
   * @param {string} assetId - Asset ID
   */
  getAssetHistory: async (assetId) => {
    return apiRequest(`/assets/${assetId}/history`);
  },

  /**
   * Bulk update assets
   * @param {Array} assetIds - Array of asset IDs
   * @param {Object} updates - Updates to apply
   */
  bulkUpdateAssets: async (assetIds, updates) => {
    return apiRequest('/assets/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ assetIds, updates }),
    });
  },

  /**
   * Export assets list
   * @param {Object} filters - Export filters
   * @param {string} format - Export format (csv, xlsx, pdf)
   */
  exportAssets: async (filters = {}, format = 'csv') => {
    const queryString = new URLSearchParams({ ...filters, format }).toString();
    return apiRequest(`/assets/export?${queryString}`);
  },
};

// =====================================================
// SHIPMENT ENDPOINTS
// =====================================================

export const shipmentApi = {
  /**
   * Get all shipments
   * @param {Object} filters - Filter options
   */
  getShipments: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/shipments/?${queryString}`);
  },

  /**
   * Get single shipment
   * @param {string} shipmentId - Shipment ID
   */
  getShipment: async (shipmentId) => {
    return apiRequest(`/shipments/${shipmentId}/`);
  },

  /**
   * Create new shipment
   * @param {Object} shipmentData - Shipment data
   */
  createShipment: async (shipmentData) => {
    return apiRequest('/shipments/', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  },

  /**
   * Update shipment
   * @param {string} shipmentId - Shipment ID
   * @param {Object} updates - Fields to update
   */
  updateShipment: async (shipmentId, updates) => {
    return apiRequest(`/shipments/${shipmentId}/`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Update shipment status
   * @param {string} shipmentId - Shipment ID
   * @param {string} status - New status
   */
  updateShipmentStatus: async (shipmentId, status) => {
    return apiRequest(`/shipments/${shipmentId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Dispatch shipment
   * @param {string} shipmentId - Shipment ID
   * @param {Object} dispatchData - Dispatch details
   */
  dispatchShipment: async (shipmentId, dispatchData) => {
    return apiRequest(`/shipments/${shipmentId}/dispatch/`, {
      method: 'POST',
      body: JSON.stringify(dispatchData),
    });
  },

  /**
   * Delete shipment
   * @param {string} shipmentId - Shipment ID
   */
  deleteShipment: async (shipmentId) => {
    return apiRequest(`/shipments/${shipmentId}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get shipment tracking info
   * @param {string} shipmentId - Shipment ID
   */
  getShipmentTracking: async (shipmentId) => {
    return apiRequest(`/shipments/${shipmentId}/tracking/`);
  },

  /**
   * Get assets in shipment
   * @param {string} shipmentId - Shipment ID
   */
  getShipmentAssets: async (shipmentId) => {
    return apiRequest(`/shipments/${shipmentId}/assets/`);
  },

  /**
   * Assign officer to shipment
   * @param {string} shipmentId - Shipment ID
   * @param {number} officerId - Officer user ID
   */
  assignOfficer: async (shipmentId, officerId) => {
    return apiRequest(`/shipments/${shipmentId}/assign-officer/`, {
      method: 'PATCH',
      body: JSON.stringify({ officerId }),
    });
  },

  /**
   * Update location for a shipment
   * @param {string} shipmentId - Shipment ID
   * @param {Object} locationData - {location_type, latitude, longitude, address, city, country}
   */
  updateLocation: async (shipmentId, locationData) => {
    return apiRequest(`/shipments/${shipmentId}/update-location/`, {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },
};

// =====================================================
// LOCATION ENDPOINTS
// =====================================================

export const locationApi = {
  /**
   * Get location history for asset
   * @param {string} assetId - Asset ID
   * @param {number} limit - Number of records
   */
  getAssetLocations: async (assetId, limit = 50) => {
    return apiRequest(`/locations/asset/${assetId}?limit=${limit}`);
  },

  /**
   * Get current location of asset
   * @param {string} assetId - Asset ID
   */
  getCurrentLocation: async (assetId) => {
    return apiRequest(`/locations/asset/${assetId}/current`);
  },

  /**
   * Add new location update
   * @param {string} assetId - Asset ID
   * @param {Object} locationData - Location information
   */
  addLocation: async (assetId, locationData) => {
    return apiRequest(`/locations/asset/${assetId}`, {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },

  /**
   * Update location
   * @param {number} locationId - Location record ID
   * @param {Object} updates - Updates to apply
   */
  updateLocation: async (locationId, updates) => {
    return apiRequest(`/locations/${locationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Upload location proof photo
   * @param {number} locationId - Location record ID
   * @param {File} file - Evidence photo
   */
  uploadLocationPhoto: async (locationId, file) => {
    const formData = new FormData();
    formData.append('photo', file);

    return apiRequest(`/locations/${locationId}/photo`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  /**
   * Get location by shipment
   * @param {string} shipmentId - Shipment ID
   */
  getShipmentLocations: async (shipmentId) => {
    return apiRequest(`/locations/shipment/${shipmentId}`);
  },

  /**
   * Delete location record
   * @param {number} locationId - Location record ID
   */
  deleteLocation: async (locationId) => {
    return apiRequest(`/locations/${locationId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get location statistics
   * @param {string} assetId - Asset ID
   */
  getLocationStats: async (assetId) => {
    return apiRequest(`/locations/asset/${assetId}/stats`);
  },
};

// =====================================================
// CUSTODY ENDPOINTS
// =====================================================

export const custodyApi = {
  /**
   * Get custody records for asset
   * @param {string} assetId - Asset ID
   */
  getAssetCustodyRecords: async (assetId) => {
    return apiRequest(`/custody/asset/${assetId}`);
  },

  /**
   * Create custody transfer record
   * @param {Object} custodyData - Custody transfer details
   */
  createCustodyRecord: async (custodyData) => {
    return apiRequest('/custody', {
      method: 'POST',
      body: JSON.stringify(custodyData),
    });
  },

  /**
   * Verify security seal
   * @param {number} custodyId - Custody record ID
   * @param {Object} verificationData - Verification details
   */
  verifySeal: async (custodyId, verificationData) => {
    return apiRequest(`/custody/${custodyId}/verify-seal`, {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  },

  /**
   * Report custody incident
   * @param {number} custodyId - Custody record ID
   * @param {Object} incidentData - Incident details
   */
  reportIncident: async (custodyId, incidentData) => {
    return apiRequest(`/custody/${custodyId}/incident`, {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  },

  /**
   * Get custody chain for asset
   * @param {string} assetId - Asset ID
   */
  getCustodyChain: async (assetId) => {
    return apiRequest(`/custody/asset/${assetId}/chain`);
  },

  /**
   * Upload custody evidence
   * @param {number} custodyId - Custody record ID
   * @param {File} file - Evidence file
   */
  uploadEvidence: async (custodyId, file) => {
    const formData = new FormData();
    formData.append('evidence', file);

    return apiRequest(`/custody/${custodyId}/evidence`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },
};

// Note: consignmentApi is defined earlier in the file (line 52)
// It includes all necessary methods for consignment management

// =====================================================
// SEARCH & FILTER ENDPOINTS
// =====================================================

export const searchApi = {
  /**
   * Search across all assets
   * @param {string} query - Search term
   * @param {Object} filters - Additional filters
   */
  searchAssets: async (query, filters = {}) => {
    const queryString = new URLSearchParams({ q: query, ...filters }).toString();
    return apiRequest(`/search/assets?${queryString}`);
  },

  /**
   * Search shipments
   * @param {string} query - Search term
   */
  searchShipments: async (query) => {
    return apiRequest(`/search/shipments?q=${encodeURIComponent(query)}`);
  },

  /**
   * Advanced search with multiple filters
   * @param {Object} searchParams - Search parameters
   */
  advancedSearch: async (searchParams) => {
    const queryString = new URLSearchParams(searchParams).toString();
    return apiRequest(`/search/advanced?${queryString}`);
  },
};

// =====================================================
// STATISTICS & REPORTING ENDPOINTS
// =====================================================

export const reportingApi = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    return apiRequest('/reports/dashboard-stats');
  },

  /**
   * Get asset statistics
   * @param {Object} filters - Filter options
   */
  getAssetStats: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/reports/asset-stats?${queryString}`);
  },

  /**
   * Get shipment statistics
   * @param {Object} filters - Filter options
   */
  getShipmentStats: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/reports/shipment-stats?${queryString}`);
  },

  /**
   * Get value statistics
   * @param {string} period - Time period (daily, weekly, monthly, yearly)
   */
  getValueStats: async (period = 'monthly') => {
    return apiRequest(`/reports/value-stats?period=${period}`);
  },

  /**
   * Generate report
   * @param {string} reportType - Type of report
   * @param {Object} filters - Report filters
   */
  generateReport: async (reportType, filters = {}) => {
    return apiRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ reportType, filters }),
    });
  },
};

// =====================================================
// NOTIFICATION ENDPOINTS
// =====================================================

export const notificationApi = {
  /**
   * Get user notifications
   * @param {boolean} unreadOnly - Only unread notifications
   */
  getNotifications: async (unreadOnly = false) => {
    return apiRequest(`/notifications?unreadOnly=${unreadOnly}`);
  },

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   */
  markAsRead: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Delete notification
   * @param {number} notificationId - Notification ID
   */
  deleteNotification: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};

// =====================================================
// USER MANAGEMENT ENDPOINTS (Admin only)
// =====================================================

export const userApi = {
  /**
   * Get all users (admin only)
   * @param {Object} filters - Filter options
   */
  getUsers: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/auth/users/${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Get single user by ID (admin only)
   * @param {number} userId - User ID
   */
  getUser: async (userId) => {
    return apiRequest(`/auth/users/${userId}/`);
  },

  /**
   * Create new user (admin only)
   * @param {Object} userData - User data
   */
  createUser: async (userData) => {
    return apiRequest('/auth/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user (admin only)
   * @param {number} userId - User ID
   * @param {Object} updates - Fields to update
   */
  updateUser: async (userId, updates) => {
    return apiRequest(`/auth/users/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Partial update user (admin only)
   * @param {number} userId - User ID
   * @param {Object} updates - Fields to update
   */
  patchUser: async (userId, updates) => {
    return apiRequest(`/auth/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete user (admin only)
   * @param {number} userId - User ID
   */
  deleteUser: async (userId) => {
    return apiRequest(`/auth/users/${userId}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiRequest('/auth/profile/');
  },

  /**
   * Update current user profile
   * @param {Object} updates - Fields to update
   */
  updateProfile: async (updates) => {
    return apiRequest('/auth/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Change password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: async (oldPassword, newPassword) => {
    return apiRequest('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  },
};

// =====================================================
// CLIENT MANAGEMENT ENDPOINTS
// =====================================================

export const clientApi = {
  /**
   * Get all clients
   * @param {Object} filters - Filter options
   */
  getClients: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/clients/${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Get single client by ID
   * @param {number} clientId - Client ID
   */
  getClient: async (clientId) => {
    return apiRequest(`/clients/${clientId}/`);
  },

  /**
   * Create new client (admin only)
   * @param {Object} clientData - Client data
   */
  createClient: async (clientData) => {
    return apiRequest('/clients/', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  /**
   * Update client (admin only)
   * @param {number} clientId - Client ID
   * @param {Object} updates - Fields to update
   */
  updateClient: async (clientId, updates) => {
    return apiRequest(`/clients/${clientId}/`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Partial update client
   * @param {number} clientId - Client ID
   * @param {Object} updates - Fields to update
   */
  patchClient: async (clientId, updates) => {
    return apiRequest(`/clients/${clientId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete client (admin only)
   * @param {number} clientId - Client ID
   */
  deleteClient: async (clientId) => {
    return apiRequest(`/clients/${clientId}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get current user's client profile
   */
  getMyProfile: async () => {
    return apiRequest('/clients/me/');
  },

  /**
   * Get client's consignments
   * @param {number} clientId - Client ID
   */
  getClientConsignments: async (clientId) => {
    return apiRequest(`/clients/${clientId}/consignments/`);
  },
};

// =====================================================
// AUDIT LOG ENDPOINTS
// =====================================================

export const auditApi = {
  /**
   * Get audit logs with filters
   * @param {Object} filters - Filter options
   */
  getLogs: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/audit/logs/${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Get single audit log by ID
   * @param {number} logId - Audit log ID
   */
  getLog: async (logId) => {
    return apiRequest(`/audit/logs/${logId}/`);
  },

  /**
   * Get audit logs for specific resource
   * @param {string} resourceType - Type of resource (consignment, shipment, etc.)
   * @param {number} resourceId - Resource ID
   */
  getResourceLogs: async (resourceType, resourceId) => {
    return apiRequest(`/audit/logs/?resource_type=${resourceType}&resource_id=${resourceId}`);
  },

  /**
   * Get audit logs for specific user
   * @param {number} userId - User ID
   */
  getUserLogs: async (userId) => {
    return apiRequest(`/audit/logs/?user_id=${userId}`);
  },

  /**
   * Export audit logs
   * @param {Object} filters - Export filters
   * @param {string} format - Export format (csv, xlsx, pdf)
   */
  exportLogs: async (filters = {}, format = 'csv') => {
    const queryString = new URLSearchParams({ ...filters, format }).toString();
    return apiRequest(`/audit/logs/export?${queryString}`);
  },
};

export default {
  assetApi,
  shipmentApi,
  locationApi,
  custodyApi,
  consignmentApi,
  searchApi,
  reportingApi,
  notificationApi,
  userApi,
  clientApi,
  auditApi,
};
