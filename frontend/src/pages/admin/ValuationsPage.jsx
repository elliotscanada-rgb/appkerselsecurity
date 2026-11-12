import React from 'react';
import { FaChartLine, FaUsers, FaUserTie, FaBox, FaCoins, FaTruck, FaWarehouse, FaShieldAlt, FaFileAlt, FaHistory } from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';

const ValuationsPage = () => {
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { heading: true, label: 'Management' },
    { path: '/admin/clients', label: 'Clients', icon: <FaUsers /> },
    { path: '/admin/staff', label: 'Staff', icon: <FaUserTie /> },
    { path: '/admin/consignments', label: 'Consignments', icon: <FaBox /> },
    { path: '/admin/valuations', label: 'Valuations', icon: <FaCoins /> },
    { heading: true, label: 'Operations' },
    { path: '/admin/logistics', label: 'Logistics', icon: <FaTruck /> },
    { path: '/admin/custody', label: 'Custody', icon: <FaShieldAlt /> },
    { path: '/admin/storage', label: 'Storage', icon: <FaWarehouse /> },
    { divider: true },
    { path: '/admin/reports', label: 'Reports', icon: <FaFileAlt /> },
    { path: '/admin/audit', label: 'Audit Logs', icon: <FaHistory /> },
  ];

  return (
    <Layout menuItems={menuItems}>
      <h1 className="text-3xl font-bold text-kestrel-gold mb-6">Valuation Management</h1>
      <Card><p className="text-center text-gray-400 py-12">Valuation approval interface</p></Card>
    </Layout>
  );
};

export default ValuationsPage;
