import React, { useState } from 'react';
import { FaEye, FaHistory, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import { formatCurrency, formatWeight, formatDate } from '../../utils/formatters';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

const AssetCard = ({ asset, onViewDetails, onViewHistory, showActions = true }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getAssetImage = (category, name = '') => {
    // Prioritize local images from public folder, fall back to CDN
    const lowerName = name.toLowerCase();
    
    switch (category) {
      case 'gold_bars':
        if (lowerName.includes('bar')) {
          return '/gold bar.webp';
        } else if (lowerName.includes('britannia')) {
          return 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=400&fit=crop&q=80';
        } else if (lowerName.includes('sovereign')) {
          return '/soverign bullion.webp';
        } else if (lowerName.includes('krugerrand')) {
          return '/pyx coin.webp';
        } else {
          return '/gold bar.webp';
        }
      case 'diamonds':
        return '/diwali gift.webp';
      case 'gold_jewellery':
        return '/diwali gift.webp';
      case 'precious_metals':
        return '/gold bar.webp';
      default:
        return '/pyx coin.webp';
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-kestrel-gold">
      {/* Mobile & Desktop Responsive Layout */}
      <div className="flex flex-col md:flex-row">
        
        {/* Asset Image Section - Rectangular container for perfect fit */}
        <div className="relative w-full md:w-80 bg-white flex items-center justify-center overflow-hidden" style={{ minHeight: '280px' }}>
          
          {/* Loading Spinner */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <FaSpinner className="text-kestrel-gold animate-spin text-3xl" />
            </div>
          )}

          {/* Asset Image Container - Rectangle for better image fit */}
          <div className="relative w-full sm:w-64 md:w-72 h-64 sm:h-72 overflow-hidden shadow-lg border-2 border-kestrel-gold/30 flex items-center justify-center bg-white flex-shrink-0">
            {!imageError ? (
              <img 
                src={getAssetImage(asset.category, asset.name)} 
                alt={asset.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              // Fallback gradient when image fails
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200">
                <span className="text-gray-600 text-center px-4 font-semibold text-sm">{asset.name}</span>
              </div>
            )}
          </div>

          {/* Quantity Badge - Top Right */}
          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md border-2 border-kestrel-gold z-20">
            <span className="text-xs font-bold text-gray-700">Qty {asset.quantity}</span>
          </div>

          {/* Status Badge - Top Left */}
          <div className="absolute top-3 left-3 z-20">
            <span className={`badge ${STATUS_COLORS[asset.status]} px-3 py-1 text-xs font-semibold rounded-full`}>
              {STATUS_LABELS[asset.status]}
            </span>
          </div>
        </div>

        {/* Asset Details Section - Right side on desktop, below on mobile */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
              {asset.name}
            </h3>
            <p className="text-xs text-gray-500">
              Consignment #{asset.consignmentNumber}
            </p>
          </div>

          {/* Key Details Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 font-medium">Weight</p>
              <p className="font-semibold text-sm text-gray-900">{formatWeight(asset.weight, asset.weightUnit)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Purity</p>
              <p className="font-semibold text-sm text-gray-900">{asset.purity}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Value</p>
              <p className="font-bold text-sm text-kestrel-gold">{formatCurrency(asset.assessedValue)}</p>
            </div>
          </div>

          {/* Deposit Date & Time - NEW */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-600 font-semibold mb-1">DEPOSITED</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-blue-500">Date</p>
                <p className="font-semibold text-sm text-blue-900">{formatDate(asset.receivedDate, 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500">Year</p>
                <p className="font-semibold text-sm text-blue-900">{formatDate(asset.receivedDate, 'yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Storage Location */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-700">
              <FaShieldAlt className="text-sm" />
              <span className="text-sm font-medium">
                {asset.quantity} stored in {asset.storageLocation}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1 ml-5">Unit: {asset.storageUnit}</p>
          </div>

          {/* Spacer for flex growth */}
          <div className="flex-grow"></div>

          {/* Action Buttons - Full width on mobile, side by side on desktop */}
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-2">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(asset)}
                  className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2 rounded-lg"
                >
                  <FaEye size={14} />
                  <span>Details</span>
                </button>
              )}
              {onViewHistory && (
                <button
                  onClick={() => onViewHistory(asset)}
                  className="flex-1 btn-secondary text-sm py-2.5 flex items-center justify-center gap-2 rounded-lg"
                >
                  <FaHistory size={14} />
                  <span>History</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
