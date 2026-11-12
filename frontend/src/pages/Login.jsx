import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.detail || 'Invalid email or password');
      }

      const data = await response.json();

      if (data.token) {
        sessionStorage.setItem('kestrel_token', data.token);
        sessionStorage.setItem('refreshToken', data.refresh);
        sessionStorage.setItem('kestrel_user', JSON.stringify(data.user));

        login(data.user, data.token);

        const redirectPath = data.user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #0f1923 0%, #1a1a2e 50%, #16213e 100%)' }}
    >
      {/* Dot grid background */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Two-column layout on large screens */}
      <div className="relative z-10 w-full max-w-5xl flex items-stretch gap-0 rounded-2xl overflow-hidden border border-kestrel-gold/20 shadow-2xl"
        style={{ boxShadow: '0 0 80px rgba(212,175,55,0.1)' }}
      >
        {/* LEFT PANEL — branding, hidden on mobile */}
        <div
          className="hidden lg:flex flex-col justify-between w-1/2 p-12"
          style={{ background: 'linear-gradient(160deg, #2B2B2B 0%, #1a1a1a 60%, #111 100%)' }}
        >
          {/* Logo */}
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black border-2 border-kestrel-gold/50 mb-6">
              <FaShieldAlt className="text-kestrel-gold text-3xl" />
            </div>
            <h1 className="text-4xl font-bold text-kestrel-gold tracking-widest mb-2">KESTREL</h1>
            <p className="text-gray-400 text-sm">Security Consignment System</p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              'End-to-end consignment tracking',
              'Real-time shipment monitoring',
              'Secure asset management',
              'Full audit trail',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-kestrel-gold flex-shrink-0" />
                <p className="text-gray-300 text-sm">{f}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Kestrel Security. All rights reserved.
          </p>
        </div>

        {/* RIGHT PANEL — form */}
        <div className="flex-1 bg-gray-900 flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black border-2 border-kestrel-gold/50 mb-3">
              <FaShieldAlt className="text-kestrel-gold text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-kestrel-gold tracking-widest">KESTREL</h1>
            <p className="text-gray-400 text-xs mt-1">Security Consignment System</p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-5 p-3 bg-red-900/40 border border-red-500/50 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kestrel-gold focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kestrel-gold focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-kestrel-gold transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-kestrel-gold to-yellow-500 hover:from-kestrel-gold/90 hover:to-yellow-500/90 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-8">
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
