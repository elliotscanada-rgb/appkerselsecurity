import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaUsers,
  FaUserTie,
  FaBox,
  FaCoins,
  FaTruck,
  FaWarehouse,
  FaShieldAlt,
  FaFileAlt,
  FaHistory,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/formatters';

const FeesConfigurationPage = () => {
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { heading: true, label: 'Management' },
    { path: '/admin/clients', label: 'Clients', icon: <FaUsers /> },
    { path: '/admin/staff', label: 'Staff', icon: <FaUserTie /> },
    { path: '/admin/consignments', label: 'Consignments', icon: <FaBox /> },
    { path: '/admin/valuations', label: 'Valuations', icon: <FaCoins /> },
    { heading: true, label: 'Configuration' },
    { path: '/admin/fees', label: 'Fees & Processes', icon: <FaCoins /> },
    { path: '/admin/logistics', label: 'Logistics', icon: <FaTruck /> },
    { path: '/admin/custody', label: 'Custody', icon: <FaShieldAlt /> },
    { divider: true },
    { path: '/admin/reports', label: 'Reports', icon: <FaFileAlt /> },
    { path: '/admin/audit', label: 'Audit Logs', icon: <FaHistory /> },
  ];

  useEffect(() => {
    // TODO: Fetch fee and process configurations from API
    setLoading(false);
  }, []);

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-kestrel-gold">Fees & Process Configuration</h1>
        <p className="text-gray-400 mt-2">Manage fees, charges, and process requirements</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-400">Fees and process configuration interface - Coming soon</p>
          <p className="text-gray-500 text-sm mt-2">This page will allow admins to configure service charges and workflow processes</p>
        </div>
      </Card>
    </Layout>
  );
};

export default FeesConfigurationPage;
