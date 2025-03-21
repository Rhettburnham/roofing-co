// useScrollRestoration.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollRestoration = () => {
  const location = useLocation();
  const positions = useRef({});

  useEffect(() => {
    const { pathname } = location;

    // Restore scroll position on navigation
    if (positions.current[pathname]) {
      window.scrollTo(0, positions.current[pathname]);
    } else {
      // Scroll to top if no saved position
      window.scrollTo(0, 0);
    }

    // Save scroll position before navigation
    return () => {
      positions.current[pathname] = window.scrollY;
    };
  }, [location]);

  return null;
};

export default useScrollRestoration;
