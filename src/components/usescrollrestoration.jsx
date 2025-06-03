// useScrollRestoration.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollRestoration = () => {
  const location = useLocation();
  const positions = useRef({});
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const { pathname, search, hash } = location;
    const fullPath = pathname + search + hash;

    // Skip automatic scrolling on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Only restore scroll position if we have a saved position for this path
    // Don't automatically scroll to top unless this is a real navigation
    if (positions.current[fullPath] !== undefined) {
      window.scrollTo(0, positions.current[fullPath]);
    }
    // Note: Removed the automatic scroll to top for paths without saved positions
    // This prevents unwanted scrolling when state changes trigger location updates

    // Save scroll position before navigation
    return () => {
      positions.current[fullPath] = window.scrollY;
    };
  }, [location]);

  return null;
};

export default useScrollRestoration;
