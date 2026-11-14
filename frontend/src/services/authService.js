/**
 * Authentication Service
 * Handles user authentication, token management, and session management
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://appkerselsecurity.onrender.com/api';

// Key names for localStorage
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'currentUser';

// Token expiration time (in ms) - used for local refresh
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before actual expiry

/**
 * Decode JWT token payload (without verification - for client-side only)
 * @param {string} token - JWT token
 */
export const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() >= expiryTime - TOKEN_EXPIRY_BUFFER;
};

// =====================================================
// MAIN AUTH SERVICE
// =====================================================

export const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Store tokens and user info
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      // Notify backend
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Logout on client side even if server request fails
        });
      }

      // Clear local storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Clear anyway
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get auth token
   */
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token && !isTokenExpired(token);
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);

      return {
        success: true,
        token: data.token,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear auth and force re-login
      authService.logout();
      throw error;
    }
  },

  /**
   * Verify token validity
   */
  verifyToken: async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/auth/verify/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  /**
   * Check if user has specific role
   * @param {string} role - Role to check (admin, officer, staff, customer)
   */
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   */
  hasAnyRole: (roles) => {
    const user = authService.getCurrentUser();
    return user && roles.includes(user.role);
  },

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   */
  hasPermission: (permission) => {
    const user = authService.getCurrentUser();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  },

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   */
  updateProfile: async (updates) => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const data = await response.json();
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Password reset request failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  /**
   * Enable two-factor authentication
   */
  enableTwoFactor: async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/auth/2fa/setup/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('2FA setup failed');
      }

      const data = await response.json();
      return {
        success: true,
        qrCode: data.qrCode,
        secret: data.secret,
      };
    } catch (error) {
      console.error('2FA setup error:', error);
      throw error;
    }
  },

  /**
   * Verify two-factor authentication code
   * @param {string} code - 2FA code
   */
  verifyTwoFactor: async (code) => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/auth/2fa/verify/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('2FA verification failed');
      }

      return { success: true };
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  },
};

export default authService;
