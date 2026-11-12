import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;

  const sizes = {
    small: 'max-w-sm md:max-w-md',
    default: 'max-w-sm md:max-w-2xl',
    large: 'max-w-md md:max-w-4xl',
    full: 'max-w-md md:max-w-7xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div
          className={`relative bg-gray-900 border border-kestrel-gold/30 rounded-xl shadow-2xl ${sizes[size]} w-full`}
          style={{ boxShadow: '0 0 40px rgba(212, 175, 55, 0.1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700/50">
            <h3 className="text-lg sm:text-xl font-semibold text-kestrel-gold truncate">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-kestrel-gold transition-colors p-1.5 rounded-lg hover:bg-gray-800 flex-shrink-0"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 max-h-[calc(100vh-200px)] overflow-y-auto text-gray-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
