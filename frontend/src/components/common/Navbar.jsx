import React, { useState, useEffect } from 'react';
import { FaBell, FaUser, FaSignOutAlt, FaBars, FaCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Online/offline listener
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

  // Fetch real notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem('kestrel_token');
        if (!token) return;
        const response = await fetch('http://localhost:8000/api/notifications/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : data.results || [];
          setNotifications(list);
          setNotificationCount(list.filter((n) => !n.is_read).length);
        }
      } catch {
        // fail silently — notifications are non-critical
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const token = sessionStorage.getItem('kestrel_token');
      if (!token) return;
      await fetch('http://localhost:8000/api/notifications/mark_all_read/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // fail silently
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : '';

  return (
    <nav className="bg-gradient-to-r from-kestrel-charcoal via-gray-900 to-kestrel-charcoal shadow-lg sticky top-0 z-40 h-[72px]">
      <div className="px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">

          {/* Left — hamburger + logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-300 hover:text-kestrel-gold transition-colors p-1"
              aria-label="Open menu"
            >
              <FaBars size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="bg-kestrel-black rounded-lg p-2 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-kestrel-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-kestrel-gold leading-tight">KESTREL SECURITY</h1>
                <p className="text-xs text-gray-400 leading-tight">Consignment Management</p>
              </div>
            </div>
          </div>

          {/* Right — status, bell, avatar */}
          <div className="flex items-center gap-3 sm:gap-5">

            {/* Online status */}
            <div className="hidden sm:flex items-center gap-1.5">
              <FaCircle className={`text-xs ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                }}
                className="relative p-2 text-gray-300 hover:text-kestrel-gold transition-colors"
                aria-label="Notifications"
              >
                <FaBell size={19} />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-kestrel-charcoal rounded-lg shadow-xl border border-kestrel-gold/30 z-50">
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-kestrel-gold text-sm">Notifications</h3>
                    {notificationCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-gray-400 hover:text-kestrel-gold transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-gray-800 last:border-0 ${
                            !n.is_read ? 'bg-kestrel-gold/5' : ''
                          }`}
                        >
                          <p className={`text-sm font-medium ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-kestrel-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser size={15} className="text-kestrel-gold" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-white leading-tight truncate max-w-[120px]">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-400 capitalize leading-tight">{user?.role}</p>
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-kestrel-charcoal rounded-lg shadow-xl border border-kestrel-gold/30 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-sm font-semibold text-kestrel-gold">{displayName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 break-all">{user?.email}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="text-xs text-white capitalize">{user?.role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-xs text-green-400">Active</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 font-semibold flex items-center gap-2 transition-colors rounded-b-lg"
                  >
                    <FaSignOutAlt size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Click-outside handler */}
      {(showNotifications || showProfileDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileDropdown(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
