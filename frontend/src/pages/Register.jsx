import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaSpinner, FaUser } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.password || !formData.password_confirm) {
      setError('All fields are required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call backend registration API
      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password_confirm: formData.password_confirm,
      };
      
      console.log('Sending registration payload:', payload);
      
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Log the full error response for debugging
        console.error('Registration API error response:', data);
        
        // Handle specific field errors
        if (typeof data === 'object') {
          const errorMessages = Object.entries(data)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.map(err => typeof err === 'string' ? err : err.detail || String(err)).join(', ')}`;
              }
              return `${field}: ${typeof errors === 'string' ? errors : String(errors)}`;
            })
            .filter(msg => msg)
            .join('; ');
          throw new Error(errorMessages || 'Registration failed');
        }
        
        throw new Error(data.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token and user info
      if (data.token) {
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('kestrel_token', data.token);
        sessionStorage.setItem('refreshToken', data.refresh);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth context
        login(data.user, data.token);
        
        setSuccess('Registration successful! Redirecting...');
        
        // Navigate to dashboard after brief delay
        setTimeout(() => {
          const redirectPath = data.user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
          navigate(redirectPath);
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(135deg, #0f1923 0%, #1a1a2e 50%, #16213e 100%)' }}
    >
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-xl sm:rounded-2xl overflow-hidden border border-kestrel-gold/20"
          style={{ boxShadow: '0 0 60px rgba(212,175,55,0.12)' }}
        >
          {/* Header */}
          <div
            className="p-6 sm:p-8 text-center"
            style={{
              background:
                'linear-gradient(135deg, #2B2B2B 0%, #1a1a1a 60%, #2B2B2B 100%)',
            }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-kestrel-black border-2 border-kestrel-gold/50 mb-3 sm:mb-4 shadow-lg">
              <FaShieldAlt className="text-kestrel-gold text-6xl sm:text-7xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-kestrel-gold tracking-widest">
              KESTREL
            </h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">
              Security Consignment
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 bg-gray-900">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 text-center">
              Create Account
            </h2>
            <p className="text-gray-400 text-center mb-5 sm:mb-6 text-xs sm:text-sm">
              Join as a new client
            </p>

            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-900/40 border border-red-500/50 text-red-300 rounded-lg text-xs sm:text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 sm:p-4 bg-green-900/40 border border-green-500/50 text-green-300 rounded-lg text-xs sm:text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* First Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-kestrel-gold focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-kestrel-gold focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-kestrel-gold focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-kestrel-gold focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-kestrel-gold transition-colors text-sm"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-kestrel-gold focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-kestrel-gold transition-colors text-sm"
                  >
                    {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-2.5 sm:py-3 bg-gradient-to-r from-kestrel-gold to-yellow-500 hover:from-kestrel-gold/90 hover:to-yellow-500/90 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold rounded-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Link to Login */}
            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-kestrel-gold hover:text-kestrel-gold/80 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-950 px-6 sm:px-8 py-2 sm:py-3 text-center border-t border-gray-800">
            <p className="text-xs text-gray-600">
              © 2026 Kestrel Security. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
