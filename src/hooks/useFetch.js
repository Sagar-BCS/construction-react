import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook: useFetch
 * ---------------------
 * Hooks used: useState, useEffect, useCallback
 *
 * A reusable data-fetching hook that handles loading, error, and data states.
 * Automatically fetches on mount and provides a refetch function.
 *
 * @param {string} url - API endpoint to fetch (relative to baseURL)
 * @param {object} options - { immediate: true } to auto-fetch on mount
 * @returns {{ data, loading, error, refetch }}
 */
const useFetch = (url, options = { immediate: true }) => {
  // useState — manages three separate pieces of state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useCallback — memoizes the fetch function so it doesn't change on every render
  // This prevents infinite loops when passed as a dependency to useEffect
  const fetchData = useCallback(async () => {
    // Don't fetch if no URL provided
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [url]); // Only recreate if URL changes

  // useEffect — triggers the fetch when the component mounts
  // Also re-fetches if the URL or fetchData function changes
  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  // Return state and the refetch function for manual re-fetching
  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
