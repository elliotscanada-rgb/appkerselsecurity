import React from 'react';
import { FaChartLine, FaBoxOpen, FaCoins, FaShieldAlt, FaTruck, FaShippingFast } from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';

const ReceivingPage = () => {
  const menuItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { path: '/staff/receiving', label: 'Receiving', icon: <FaBoxOpen /> },
    { path: '/staff/valuation', label: 'Valuation', icon: <FaCoins /> },
    { path: '/staff/custody', label: 'Custody', icon: <FaShieldAlt /> },
    { path: '/staff/logistics', label: 'Logistics', icon: <FaTruck /> },
    { path: '/staff/dispatch', label: 'Dispatch', icon: <FaShippingFast /> },
  ];

  return (
    <Layout menuItems={menuItems}>
      <h1 className="text-3xl font-bold text-kestrel-gold mb-6">Receiving</h1>
      <Card><p className="text-center text-gray-400 py-12">Consignment receiving interface</p></Card>
    </Layout>
  );
};

export default ReceivingPage;
