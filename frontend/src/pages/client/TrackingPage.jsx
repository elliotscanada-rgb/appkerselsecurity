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

const TrackingPage = () => {
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
          <h1 className="text-3xl font-bold text-kestrel-gold">Track Packages</h1>
          <p className="text-gray-400 mt-2">Monitor your consignment shipments</p>
        </div>
        
        <Card>
          <p className="text-center text-gray-500 py-12">
            Package tracking interface will be displayed here
          </p>
        </Card>
      </Layout>
    );
};

export default TrackingPage;
