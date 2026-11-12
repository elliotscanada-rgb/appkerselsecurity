import React from 'react';
import {
  FaBox,
  FaChartLine,
  FaTruck,
  FaFileAlt,
  FaBell,
  FaUser,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';

const ProfilePage = () => {
  const menuItems = [
    { path: '/client/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { path: '/client/consignments', label: 'My Consignments', icon: <FaBox /> },
    { path: '/client/tracking', label: 'Track Packages', icon: <FaTruck /> },
    { path: '/client/documents', label: 'Documents', icon: <FaFileAlt /> },
    { divider: true },
    { path: '/client/notifications', label: 'Notifications', icon: <FaBell /> },
    { path: '/client/profile', label: 'Profile', icon: <FaUser /> },
  ];

  return (
    <Layout menuItems={menuItems}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-kestrel-gold">Profile Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account preferences</p>
        </div>

        {/* Account Settings */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
              <p className="text-gray-400">Additional account settings will be available here</p>
            </div>
          </div>
        </Card>
      </Layout>
    
  );
};

export default ProfilePage;
