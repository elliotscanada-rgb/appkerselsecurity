import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check both sessionStorage and localStorage for token (mobile compatibility)
    // sessionStorage first (per-tab isolation), then localStorage (persistence)
    let token = sessionStorage.getItem('kestrel_token');
    
    if (!token) {
      token = localStorage.getItem('kestrel_token');
    }
    
    console.log('API Request - Token found:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Authorization header added');
    } else {
      console.warn('API Request - No token found in storage');
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response - Status:', response.status);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - Clearing storage and redirecting to login');
      // Unauthorized - clear storage and redirect to login
      sessionStorage.removeItem('kestrel_user');
      sessionStorage.removeItem('kestrel_token');
      sessionStorage.removeItem('refreshToken');
      localStorage.removeItem('kestrel_user');
      localStorage.removeItem('kestrel_token');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
