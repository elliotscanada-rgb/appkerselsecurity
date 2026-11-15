/**
 * Mobile Debug Utility
 * Helps diagnose mobile-specific issues
 */

export const mobileDebug = {
  /**
   * Get device and browser information
   */
  getDeviceInfo: () => {
    const ua = navigator.userAgent;
    const info = {
      userAgent: ua,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      isIOS: /iPhone|iPad|iPod/i.test(ua),
      isAndroid: /Android/i.test(ua),
      isSafari: /Safari/i.test(ua) && !/Chrome/i.test(ua),
      isChrome: /Chrome/i.test(ua),
      isFirefox: /Firefox/i.test(ua),
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
    return info;
  },

  /**
   * Check storage availability
   */
  checkStorage: () => {
    const result = {
      localStorage: { available: false, working: false },
      sessionStorage: { available: false, working: false },
    };

    // Test localStorage
    try {
      result.localStorage.available = typeof window.localStorage !== 'undefined';
      if (result.localStorage.available) {
        const testKey = '__test__';
        localStorage.setItem(testKey, 'test');
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        result.localStorage.working = retrieved === 'test';
      }
    } catch (e) {
      result.localStorage.error = e.message;
    }

    // Test sessionStorage
    try {
      result.sessionStorage.available = typeof window.sessionStorage !== 'undefined';
      if (result.sessionStorage.available) {
        const testKey = '__test__';
        sessionStorage.setItem(testKey, 'test');
        const retrieved = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);
        result.sessionStorage.working = retrieved === 'test';
      }
    } catch (e) {
      result.sessionStorage.error = e.message;
    }

    return result;
  },

  /**
   * Check network connectivity
   */
  checkNetwork: async () => {
    const result = {
      online: navigator.onLine,
      apiReachable: false,
      apiUrl: import.meta.env.VITE_API_BASE_URL || 'https://appkerselsecurity.onrender.com/api',
    };

    try {
      const response = await fetch(`${result.apiUrl}/auth/login/`, {
        method: 'OPTIONS', // Preflight request
      });
      result.apiReachable = true;
      result.apiStatus = response.status;
    } catch (e) {
      result.apiError = e.message;
    }

    return result;
  },

  /**
   * Run full diagnostic
   */
  runDiagnostics: async () => {
    console.group('🔍 Mobile Diagnostics');
    
    const device = mobileDebug.getDeviceInfo();
    console.log('📱 Device Info:', device);

    const storage = mobileDebug.checkStorage();
    console.log('💾 Storage:', storage);

    const network = await mobileDebug.checkNetwork();
    console.log('🌐 Network:', network);

    console.groupEnd();

    return { device, storage, network };
  },

  /**
   * Log to screen (useful for mobile debugging)
   */
  logToScreen: (message, type = 'info') => {
    const existingLogger = document.getElementById('mobile-debug-logger');
    if (existingLogger) {
      existingLogger.remove();
    }

    const logger = document.createElement('div');
    logger.id = 'mobile-debug-logger';
    logger.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      right: 10px;
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 999999;
      max-height: 200px;
      overflow-y: auto;
      word-break: break-word;
    `;
    logger.textContent = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
    document.body.appendChild(logger);

    setTimeout(() => logger.remove(), 5000);
  },

  /**
   * Create debug panel
   */
  createDebugPanel: () => {
    const panel = document.createElement('div');
    panel.id = 'mobile-debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #0f0;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 10px;
      z-index: 999999;
      max-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    `;

    const button = document.createElement('button');
    button.textContent = 'Run Diagnostics';
    button.style.cssText = `
      background: #0f0;
      color: #000;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
      margin-bottom: 10px;
    `;
    button.onclick = async () => {
      const results = await mobileDebug.runDiagnostics();
      const output = document.createElement('pre');
      output.textContent = JSON.stringify(results, null, 2);
      output.style.cssText = 'font-size: 9px; margin: 5px 0;';
      panel.appendChild(output);
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: #f00;
      color: #fff;
      border: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
    `;
    closeBtn.onclick = () => panel.remove();

    panel.appendChild(closeBtn);
    panel.appendChild(button);
    document.body.appendChild(panel);

    return panel;
  },
};

// Auto-run diagnostics in development
if (import.meta.env.DEV) {
  window.mobileDebug = mobileDebug;
  console.log('🔍 Mobile Debug available: window.mobileDebug');
}

export default mobileDebug;
