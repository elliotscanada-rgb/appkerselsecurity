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
  FaPlus,
  FaClock,
  FaMoneyBillWave,
  FaPercent,
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaSave,
  FaTimes,
} from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';

const FeesConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState('charge_types');
  const [chargeTypes, setChargeTypes] = useState([]);
  const [editingCharge, setEditingCharge] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Default charge types available in the system
  const defaultChargeTypes = [
    {
      id: 'storage',
      name: 'Storage Fee',
      code: 'storage',
      description: 'Fee charged for storing consignment items in secure facility',
      calculation_method: 'per_day',
      icon: <FaWarehouse className="text-blue-400" />,
      color: 'blue',
    },
    {
      id: 'handling',
      name: 'Handling Fee',
      code: 'handling',
      description: 'Fee for receiving, processing, and handling consignment items',
      calculation_method: 'flat_rate',
      icon: <FaBox className="text-green-400" />,
      color: 'green',
    },
    {
      id: 'insurance',
      name: 'Insurance Fee',
      code: 'insurance',
      description: 'Insurance coverage fee based on declared value',
      calculation_method: 'percentage',
      icon: <FaShieldAlt className="text-purple-400" />,
      color: 'purple',
    },
    {
      id: 'transport',
      name: 'Transport Fee',
      code: 'transport',
      description: 'Fee for shipping and transportation services',
      calculation_method: 'flat_rate',
      icon: <FaTruck className="text-cyan-400" />,
      color: 'cyan',
    },
    {
      id: 'processing',
      name: 'Processing Fee',
      code: 'processing',
      description: 'Administrative and processing fee',
      calculation_method: 'flat_rate',
      icon: <FaFileAlt className="text-yellow-400" />,
      color: 'yellow',
    },
    {
      id: 'demurrage',
      name: 'Demurrage Fee',
      code: 'demurrage',
      description: 'Fee charged for delays beyond agreed timeframe (detention charges)',
      calculation_method: 'per_day',
      icon: <FaClock className="text-red-400" />,
      color: 'red',
    },
    {
      id: 'customs',
      name: 'Customs Fee',
      code: 'customs',
      description: 'Customs clearance and documentation fee',
      calculation_method: 'flat_rate',
      icon: <FaFileAlt className="text-orange-400" />,
      color: 'orange',
    },
    {
      id: 'valuation',
      name: 'Valuation Fee',
      code: 'valuation',
      description: 'Professional appraisal and valuation service fee',
      calculation_method: 'flat_rate',
      icon: <FaCoins className="text-amber-400" />,
      color: 'amber',
    },
  ];

  useEffect(() => {
    // Initialize with default charge types
    // In production, fetch from API
    setChargeTypes(defaultChargeTypes);
  }, []);

  const getCalculationMethodLabel = (method) => {
    const methods = {
      flat_rate: 'Flat Rate',
      per_day: 'Per Day',
      percentage: 'Percentage of Value',
      per_kg: 'Per Kilogram',
      per_unit: 'Per Unit',
    };
    return methods[method] || method;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-900/30 border-blue-500/50',
      green: 'bg-green-900/30 border-green-500/50',
      purple: 'bg-purple-900/30 border-purple-500/50',
      cyan: 'bg-cyan-900/30 border-cyan-500/50',
      yellow: 'bg-yellow-900/30 border-yellow-500/50',
      red: 'bg-red-900/30 border-red-500/50',
      orange: 'bg-orange-900/30 border-orange-500/50',
      amber: 'bg-amber-900/30 border-amber-500/50',
    };
    return colors[color] || 'bg-gray-900/30 border-gray-500/50';
  };

  return (
    <Layout menuItems={menuItems}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-kestrel-gold flex items-center gap-3">
          <FaCoins />
          Fees & Process Configuration
        </h1>
        <p className="text-gray-400 mt-2">
          Manage service charges, fees, and process requirements
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('charge_types')}
          className={`px-4 py-3 font-semibold transition border-b-2 ${
            activeTab === 'charge_types'
              ? 'border-kestrel-gold text-kestrel-gold'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Charge Types
        </button>
        <button
          onClick={() => setActiveTab('process_config')}
          className={`px-4 py-3 font-semibold transition border-b-2 ${
            activeTab === 'process_config'
              ? 'border-kestrel-gold text-kestrel-gold'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Process Configuration
        </button>
      </div>

      {/* Charge Types Tab */}
      {activeTab === 'charge_types' && (
        <div className="space-y-4">
          {/* Info Banner */}
          <Card>
            <div className="flex items-start gap-3 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
              <FaInfoCircle className="text-cyan-400 text-xl mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">About Charge Types</h3>
                <p className="text-gray-400 text-sm">
                  These are the standard charge types available when adding fees to consignments.
                  Each charge type has a calculation method (flat rate, per day, percentage, etc.).
                  <strong className="text-cyan-400"> Demurrage fees</strong> are now available for detention charges.
                </p>
              </div>
            </div>
          </Card>

          {/* Charge Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chargeTypes.map((charge) => (
              <Card key={charge.id}>
                <div className={`p-5 rounded-lg border ${getColorClasses(charge.color)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{charge.icon}</div>
                    {charge.code === 'demurrage' && (
                      <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-xs font-bold text-red-400">
                        NEW
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{charge.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{charge.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-800 rounded text-gray-300 font-semibold">
                      {charge.code}
                    </span>
                    <span className="px-2 py-1 bg-gray-800 rounded text-gray-300">
                      {getCalculationMethodLabel(charge.calculation_method)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Demurrage Fee Details */}
          <Card>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="text-4xl">
                  <FaClock className="text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    Demurrage Fee
                    <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-xs font-bold text-red-400">
                      NEW
                    </span>
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Demurrage fees are detention charges applied when consignments or shipments are held
                    beyond the agreed free time period. This is commonly used for delayed pickups, 
                    extended storage beyond contracted terms, or shipment delays.
                  </p>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Charge Code:</span>
                      <span className="text-white font-semibold">demurrage</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calculation Method:</span>
                      <span className="text-white font-semibold">Per Day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Common Usage:</span>
                      <span className="text-white font-semibold">Detention charges, delayed pickup</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-sm text-yellow-300">
                    <strong>Note:</strong> When adding demurrage charges to a consignment, specify the number
                    of days and daily rate. The system will calculate the total automatically.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Usage Instructions */}
          <Card>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-4">How to Use Charge Types</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex gap-3">
                  <span className="text-kestrel-gold font-bold">1.</span>
                  <p>Navigate to a consignment detail page</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-kestrel-gold font-bold">2.</span>
                  <p>Click "Add Charge" or "Add Fee" button</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-kestrel-gold font-bold">3.</span>
                  <p>Select the charge type from the dropdown (including "Demurrage")</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-kestrel-gold font-bold">4.</span>
                  <p>Enter the amount or rate based on the calculation method</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-kestrel-gold font-bold">5.</span>
                  <p>Add a description and save the charge</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Process Configuration Tab */}
      {activeTab === 'process_config' && (
        <Card>
          <div className="text-center py-12">
            <FaFileAlt className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Process Configuration</p>
            <p className="text-gray-500 text-sm">
              Configure workflow processes, approval requirements, and automation rules
            </p>
          </div>
        </Card>
      )}
    </Layout>
  );
};

export default FeesConfigurationPage;
