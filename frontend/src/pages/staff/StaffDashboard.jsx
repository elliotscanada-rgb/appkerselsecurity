import React from 'react';
import {
  FaChartLine,
  FaClipboardList,
  FaBoxOpen,
  FaCoins,
  FaShieldAlt,
  FaTruck,
  FaShippingFast,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';

const StaffDashboard = () => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { path: '/staff/receiving', label: 'Receiving', icon: <FaBoxOpen /> },
    { path: '/staff/valuation', label: 'Valuation', icon: <FaCoins /> },
    { path: '/staff/custody', label: 'Custody', icon: <FaShieldAlt /> },
    { path: '/staff/logistics', label: 'Logistics', icon: <FaTruck /> },
    { path: '/staff/dispatch', label: 'Dispatch', icon: <FaShippingFast /> },
  ];

  const stats = {
    assignedTasks: 5,
    completedToday: 12,
    pendingApprovals: 3,
  };

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">
          Staff Dashboard
        </h1>
        <p className="text-gray-400">Welcome back, {user?.name}</p>
        <p className="text-sm text-gray-500 capitalize">
          Department: {user?.department}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Assigned Tasks"
          value={stats.assignedTasks}
          icon={<FaClipboardList size={24} />}
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={<FaChartLine size={24} />}
          color="green"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<FaShieldAlt size={24} />}
          color="orange"
        />
      </div>

      <Card title="My Tasks">
        <p className="text-center text-gray-500 py-12">
          Task list will be displayed here
        </p>
      </Card>
    </Layout>
  );
};

export default StaffDashboard;
