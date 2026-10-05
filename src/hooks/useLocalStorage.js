import { useState, useEffect } from 'react';

/**
 * Custom hook: useLocalStorage
 * ----------------------------
 * Hooks used: useState (with lazy initializer), useEffect
 *
 * Works exactly like useState, but persists the value in localStorage.
 * On page refresh, the value is restored from localStorage.
 *
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Default value if nothing in localStorage
 * @returns {[any, Function]} [storedValue, setValue] — same API as useState
 *
 * Example:
 *   const [theme, setTheme] = useLocalStorage('theme', 'dark');
 *   // theme persists across page refreshes
 */
const useLocalStorage = (key, initialValue) => {
  // useState with LAZY INITIALIZER (function form)
  // The function only runs on the FIRST render, not on every render.
  // This is important because reading from localStorage is slow.
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Parse stored JSON, or return initialValue if nothing stored
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If JSON.parse fails (corrupted data), fall back to initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // useEffect — syncs state changes back to localStorage
  // Runs whenever storedValue or key changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export default useLocalStorage;
