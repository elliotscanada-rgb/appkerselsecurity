/**
 * Frontend URL Configuration
 * Use this in your marketing website to handle different environments
 */

const CONFIG = {
  development: {
    frontendUrl: 'http://localhost:5174',
    backendUrl: 'http://localhost:8000',
  },
  staging: {
    frontendUrl: 'https://resolved-prude-planner.ngrok-free.dev',
    backendUrl: 'https://appkerselsecurity.onrender.com',
  },
  production: {
    frontendUrl: 'https://app.kestrelsecuritycompany.com',
    backendUrl: 'https://appkerselsecurity.onrender.com',
  }
};

// Auto-detect environment
function getEnvironment() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
    return 'development';
  } else if (hostname.includes('ngrok')) {
    return 'staging';
  } else {
    return 'production';
  }
}

// Get current config
function getConfig() {
  const env = getEnvironment();
  return CONFIG[env];
}

// Export for use in your marketing site
const AppConfig = {
  getLoginUrl: () => `${getConfig().frontendUrl}/login`,
  getRegisterUrl: () => `${getConfig().frontendUrl}/register`,
  getDashboardUrl: () => `${getConfig().frontendUrl}/client/dashboard`,
  getApiUrl: () => getConfig().backendUrl,
  environment: getEnvironment(),
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.KestrelConfig = AppConfig;
}

// For module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}

console.log('Kestrel Config Loaded:', AppConfig);
