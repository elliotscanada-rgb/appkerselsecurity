import React from 'react';

const StatCard = ({ title, value, icon, color = 'gold', trend = null }) => {
  const colorClasses = {
    gold:   'bg-gradient-to-br from-kestrel-gold to-kestrel-gold-dark text-kestrel-black',
    blue:   'bg-gradient-to-br from-blue-500 to-blue-700 text-white',
    green:  'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-700 text-white',
    red:    'bg-gradient-to-br from-red-500 to-red-700 text-white',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-kestrel-black',
    teal:   'bg-gradient-to-br from-teal-500 to-teal-700 text-white',
  };

  return (
    <div
      className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg hover:border-kestrel-gold/40 hover:shadow-kestrel-gold/5 transition-all duration-300 overflow-hidden hover-lift"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </h3>
          <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.gold}`}>
            {icon}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && (
              <p className={`text-sm mt-1 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gold accent bottom bar */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-kestrel-gold/40 to-transparent" />
    </div>
  );
};

export default StatCard;
