import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'default',
  disabled = false,
  className = '',
  icon = null,
}) => {
  const baseClasses =
    'font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variants = {
    primary:
      'bg-kestrel-gold hover:bg-kestrel-gold-dark text-kestrel-black',
    secondary:
      'bg-kestrel-charcoal hover:bg-kestrel-black text-kestrel-white',
    outline:
      'border-2 border-kestrel-gold text-kestrel-gold hover:bg-kestrel-gold hover:text-kestrel-black',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  const sizes = {
    small: 'py-2 px-3 sm:px-4 sm:py-1 text-xs sm:text-sm',    // Mobile: 32px height
    default: 'py-2.5 px-4 sm:py-2 sm:px-6 text-xs sm:text-sm',   // Mobile: 40px height
    large: 'py-3 px-6 sm:px-8 text-sm sm:text-base',  // Mobile: 48px height
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
