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
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Fetch real statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('kestrel_token') || sessionStorage.getItem('access_token');
        
        // If no token, wait and retry (token might not be set yet)
        if (!token) {
          console.warn('No token found, using default stats');
          setStats(getDefaultStats());
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/consignments/statistics/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Process the statistics
          const byStatus = data.by_status || {};
          const formattedStats = {
            totalClients: 0, // Will be fetched from clients endpoint
            totalConsignments: data.total_consignments || 0,
            totalValue: parseFloat(data.total_declared_value || 0),
            inStorage: byStatus['in_secure_storage']?.count || 0,
            inTransit: byStatus['in_transit']?.count || 0,
            pendingApprovals: byStatus['pending_approval']?.count || 0,
            inVerification: byStatus['under_verification']?.count || 0,
            verified: byStatus['verified']?.count || 0,
            rejected: byStatus['rejected']?.count || 0,
            completedConsignments: byStatus['completed']?.count || 0,
            totalChargesPaid: 0, // Will be fetched from charges endpoint
            chargesPending: 0, // Will be fetched from charges endpoint
          };
          
          setStats(formattedStats);
        } else {
          console.error('Failed to fetch statistics:', response.status);
          setStats(getDefaultStats());
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setStats(getDefaultStats());
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  const getDefaultStats = () => ({
    totalClients: 0,
    totalConsignments: 0,
    totalValue: 0,
    inStorage: 0,
    inTransit: 0,
    pendingApprovals: 0,
    inVerification: 0,
    verified: 0,
    rejected: 0,
    completedConsignments: 0,
    totalChargesPaid: 0,
    chargesPending: 0,
  });

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kestrel-gold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Complete overview of Kestrel Security operations
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading statistics...</p>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              icon={<FaUsers size={24} />}
              color="blue"
            />
            <StatCard
              title="Total Consignments"
              value={stats.totalConsignments}
              icon={<FaBox size={24} />}
              color="purple"
            />
            <StatCard
              title="Total Value"
              value={formatCurrency(stats.totalValue)}
              icon={<FaCoins size={24} />}
              color="gold"
            />
            <StatCard
              title="In Storage"
              value={stats.inStorage}
              icon={<FaWarehouse size={24} />}
              color="green"
            />
            <StatCard
              title="In Transit"
              value={stats.inTransit}
              icon={<FaTruck size={24} />}
              color="orange"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={<FaShieldAlt size={24} />}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Under Verification"
              value={stats.inVerification}
              icon={<FaBox size={24} />}
              color="yellow"
            />
            <StatCard
              title="Verified & Approved"
              value={stats.verified}
              icon={<FaShieldAlt size={24} />}
              color="green"
            />
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={<FaBox size={24} />}
              color="red"
            />
            <StatCard
              title="Completed"
              value={stats.completedConsignments}
              icon={<FaBox size={24} />}
              color="teal"
            />
          </div>

          {/* Financial Overview */}
          <Card title="Financial Overview" className="mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-green-900/30 border border-green-700/40 p-6 rounded-lg">
                <p className="text-green-400 text-sm font-semibold uppercase">Charges Paid</p>
                <p className="text-3xl font-bold text-green-300 mt-2">
                  {formatCurrency(stats.totalChargesPaid)}
                </p>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-700/40 p-6 rounded-lg">
                <p className="text-yellow-400 text-sm font-semibold uppercase">Charges Pending</p>
                <p className="text-3xl font-bold text-yellow-300 mt-2">
                  {formatCurrency(stats.chargesPending)}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Asset Status Distribution">
              <div className="space-y-3">
                {[
                  { label: 'In Secure Storage', value: stats.inStorage, color: 'bg-blue-500' },
                  { label: 'In Transit', value: stats.inTransit, color: 'bg-orange-500' },
                  { label: 'Under Verification', value: stats.inVerification, color: 'bg-yellow-500' },
                  { label: 'Pending Approvals', value: stats.pendingApprovals, color: 'bg-red-500' },
                  { label: 'Completed', value: stats.completedConsignments, color: 'bg-green-500' },
                ].map(({ label, value, color }) => {
                  const pct = stats.totalConsignments > 0
                    ? Math.round((value / stats.totalConsignments) * 100)
                    : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{label}</span>
                        <span className="font-semibold text-white">
                          {value} <span className="text-gray-500 text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="13-Status Tracking System">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700/50">
                <p className="text-sm text-gray-300 mb-3">
                  All consignments are tracked through 13 distinct statuses:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-kestrel-gold">
                  <div>✓ Pending</div>
                  <div>✓ Received</div>
                  <div>✓ Under Verification</div>
                  <div>✓ Verification Passed</div>
                  <div>✓ Verification Failed</div>
                  <div>✓ Approved</div>
                  <div>✓ Rejected</div>
                  <div>✓ In Secure Storage</div>
                  <div>✓ On Hold</div>
                  <div>✓ Withdrawal Requested</div>
                  <div>✓ Released</div>
                  <div>✓ In Transit</div>
                  <div>✓ Completed</div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Each status change is recorded with timestamp and responsible staff member.
                </p>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load statistics</p>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
