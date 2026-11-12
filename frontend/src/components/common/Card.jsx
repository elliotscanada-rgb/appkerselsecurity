import React from 'react';

const Card = ({ title, children, className = '', headerAction = null }) => {
  return (
    <div className={`bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg hover:shadow-kestrel-gold/5 hover:border-kestrel-gold/30 transition-all duration-300 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-kestrel-gold">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
