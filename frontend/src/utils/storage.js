/**
 * Storage Utility
 * Handles localStorage/sessionStorage with mobile browser compatibility
 * Falls back gracefully when storage is disabled (Safari private mode, etc.)
 */

// In-memory fallback for when storage is unavailable
const memoryStorage = {};

/**
 * Check if storage is available and working
 */
const isStorageAvailable = (type = 'localStorage') => {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Safe storage wrapper
 */
const createStorage = (storageType = 'localStorage') => {
  const useStorage = isStorageAvailable(storageType);

  return {
    getItem: (key) => {
      try {
        if (useStorage) {
          return window[storageType].getItem(key);
        }
        return memoryStorage[key] || null;
      } catch (e) {
        console.warn(`Storage getItem failed for key: ${key}`, e);
        return memoryStorage[key] || null;
      }
    },

    setItem: (key, value) => {
      try {
        if (useStorage) {
          window[storageType].setItem(key, value);
        }
        memoryStorage[key] = value;
      } catch (e) {
        console.warn(`Storage setItem failed for key: ${key}`, e);
        memoryStorage[key] = value;
      }
    },

    removeItem: (key) => {
      try {
        if (useStorage) {
          window[storageType].removeItem(key);
        }
        delete memoryStorage[key];
      } catch (e) {
        console.warn(`Storage removeItem failed for key: ${key}`, e);
        delete memoryStorage[key];
      }
    },

    clear: () => {
      try {
        if (useStorage) {
          window[storageType].clear();
        }
        Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
      } catch (e) {
        console.warn('Storage clear failed', e);
        Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
      }
    },

    isAvailable: () => useStorage,
  };
};

// Export localStorage and sessionStorage wrappers
export const storage = createStorage('localStorage');
export const sessionStorage = createStorage('sessionStorage');

// Default export is localStorage (most compatible)
export default storage;

// Storage utility functions for common operations
export const storageUtils = {
  /**
   * Get and parse JSON from storage
   */
  getJSON: (key, defaultValue = null) => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Failed to parse JSON for key: ${key}`, e);
      return defaultValue;
    }
  },

  /**
   * Set JSON in storage
   */
  setJSON: (key, value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to stringify JSON for key: ${key}`, e);
    }
  },

  /**
   * Check if storage is working
   */
  test: () => {
    const testKey = '__test__';
    const testValue = 'test';
    try {
      storage.setItem(testKey, testValue);
      const retrieved = storage.getItem(testKey);
      storage.removeItem(testKey);
      return retrieved === testValue;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get storage info
   */
  getInfo: () => {
    return {
      localStorageAvailable: isStorageAvailable('localStorage'),
      sessionStorageAvailable: isStorageAvailable('sessionStorage'),
      usingFallback: !storage.isAvailable(),
    };
  },
};
