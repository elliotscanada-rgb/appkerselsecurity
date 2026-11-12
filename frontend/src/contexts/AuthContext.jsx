import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Generate unique session ID for this window/tab
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => {
    // Try to get existing session ID from sessionStorage
    let id = sessionStorage.getItem('kestrel_session_id');
    if (!id) {
      id = generateSessionId();
      sessionStorage.setItem('kestrel_session_id', id);
    }
    console.log('Session ID:', id);
    return id;
  });
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = sessionStorage.getItem('kestrel_user');
      const token = sessionStorage.getItem('kestrel_token');

      console.log('AuthContext Init - Session ID:', sessionId);
      console.log('AuthContext Init - Stored User:', storedUser ? 'YES' : 'NO');
      console.log('AuthContext Init - Token:', token ? 'YES' : 'NO');

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('AuthContext Init - Loaded user:', parsedUser.email, parsedUser.role);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          sessionStorage.removeItem('kestrel_user');
          sessionStorage.removeItem('kestrel_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [sessionId]);

  // Login function
  const login = (userData, token) => {
    console.log('Login - User:', userData.email, 'Role:', userData.role, 'Session:', sessionId);
    
    sessionStorage.setItem('kestrel_user', JSON.stringify(userData));
    sessionStorage.setItem('kestrel_token', token);
    sessionStorage.setItem('kestrel_session_id', sessionId);
    setUser(userData);

    // Redirect based on role
    switch (userData.role) {
      case 'client':
        navigate('/client/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'staff':
        navigate('/staff/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logout - Session:', sessionId);
    sessionStorage.removeItem('kestrel_user');
    sessionStorage.removeItem('kestrel_token');
    setUser(null);
    navigate('/login');
  };

  // Get authentication token
  const getToken = () => {
    return sessionStorage.getItem('kestrel_token');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!getToken();
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if staff has specific department
  const hasDepartment = (department) => {
    return user?.department === department;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    getToken,
    isAuthenticated,
    hasRole,
    hasDepartment,
    sessionId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
