import React, { useState, useEffect } from 'react';
import { FaCircle, FaSignOutAlt, FaUser, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserNavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="text-2xl font-bold text-kestrel-gold">KESTREL</div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-6">
          {/* Online Status Indicator */}
          <div className="flex items-center gap-2">
            <FaCircle className={`text-xs ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Notification Icon */}
          <button className="text-gray-400 hover:text-white transition-colors relative">
            <FaBell className="text-lg" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Icon Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-kestrel-gold"
            >
              <FaUser className="text-lg" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                {/* User Details Header */}
                <div className="px-4 py-4 border-b border-gray-700 bg-gray-900/50">
                  <p className="text-xs text-gray-400 mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-kestrel-gold mb-3">
                    {user?.first_name || ''} {user?.last_name || ''}
                  </p>
                  
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm text-white mb-3 break-all">{user?.email}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Role</p>
                      <p className="text-sm text-white capitalize">{user?.role || 'Client'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Status</p>
                      <p className="text-sm text-green-400">Active</p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/30 hover:text-red-300 font-semibold flex items-center gap-2 transition-colors border-t border-gray-700"
                >
                  <FaSignOutAlt className="text-sm" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavBar;
