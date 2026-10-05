import { useEffect, useRef } from 'react';
import { environment } from '../config/environment';

/**
 * Custom hook: useDocumentTitle
 * -----------------------------
 * Hooks used: useEffect, useRef
 *
 * Sets the browser tab title when a component mounts.
 * Restores the previous title when the component unmounts.
 *
 * @param {string} title - The page title to set
 *
 * Example:
 *   useDocumentTitle('Home');
 *   // Browser tab shows: "Home | Local Host"
 */
const useDocumentTitle = (title) => {
  // useRef — stores the previous title WITHOUT causing a re-render
  // Unlike useState, changing a ref does NOT trigger a re-render.
  // This is perfect for values you need to "remember" but don't display.
  const previousTitle = useRef(document.title);

  // useEffect — sets the document title on mount/update
  useEffect(() => {
    document.title = `${title} | ${environment.title}`;

    // Cleanup: restore the previous title when the component unmounts
    // This is called when navigating away from the page
    const prevTitle = previousTitle.current;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
