import { useState, useEffect } from 'react';

/**
 * Custom hook: useDebounce
 * ------------------------
 * Hooks used: useState, useEffect
 *
 * Delays updating a value until after a specified delay has passed
 * since the last change. Useful for search inputs to avoid making
 * API calls on every keystroke.
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} The debounced value
 *
 * Example:
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 *   // debouncedSearch only updates 300ms after user stops typing
 */
const useDebounce = (value, delay = 500) => {
  // useState — stores the debounced version of the value
  const [debouncedValue, setDebouncedValue] = useState(value);

  // useEffect — sets a timeout whenever the input value changes
  // The cleanup function clears the timeout if value changes again
  // before the delay expires (this is the "debounce" behavior)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: runs when value or delay changes, OR when component unmounts
    // This cancels the previous timeout, effectively "resetting" the debounce
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
