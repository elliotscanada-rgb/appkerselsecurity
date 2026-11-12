import React from 'react';

const Loader = ({ size = 'default', text = '' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    default: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} border-kestrel-grey border-t-kestrel-gold rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-4 text-kestrel-charcoal">{text}</p>}
    </div>
  );
};

export default Loader;
