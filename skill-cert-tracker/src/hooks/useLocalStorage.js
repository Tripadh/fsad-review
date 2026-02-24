import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const toStore = value instanceof Function ? value(stored) : value;
      setStored(toStore);
      window.localStorage.setItem(key, JSON.stringify(toStore));
    } catch (err) {
      console.error(`useLocalStorage: failed to save "${key}"`, err);
    }
  }, [key, stored]);

  const removeValue = useCallback(() => {
    try {
      setStored(initialValue);
      window.localStorage.removeItem(key);
    } catch {}
  }, [key, initialValue]);

  return [stored, setValue, removeValue];
}
