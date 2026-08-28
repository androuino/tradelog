// Storage utility using localStorage with IndexedDB fallback capabilities

const STORAGE_KEY = 'trader_journal_entries_v1';

export const loadEntriesFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading entries from localStorage:', err);
    return null;
  }
};

export const saveEntriesToStorage = (entries) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (err) {
    console.error('Error saving entries to localStorage:', err);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Error clearing storage:', err);
    return false;
  }
};

// Converts image file to Base64 Data URL for persistent storage in browser
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
