import { format, parseISO } from 'date-fns';

/**
 * Format currency with symbol
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return '-';
  
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
  };

  const symbol = symbols[currency] || currency;
  const formattedAmount = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formattedAmount}`;
};

/**
 * Format date
 */
export const formatDate = (dateString, formatStr = 'PPP') => {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (error) {
    return dateString;
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'PPP p');
};

/**
 * Format weight
 */
export const formatWeight = (weight, unit = 'kg') => {
  if (!weight && weight !== 0) return '-';
  return `${Number(weight).toLocaleString()} ${unit}`;
};

/**
 * Format purity
 */
export const formatPurity = (purity) => {
  if (!purity) return '-';
  return `${purity}%`;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Generate random color for avatar
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  const charCode = name ? name.charCodeAt(0) : 0;
  return colors[charCode % colors.length];
};
