import { useContext, createContext } from 'react';

// Create Viewport Context (also exported from OneForm.jsx)
export const ViewportContext = createContext({
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
  isMobile: false,
  isForced: false,
});

// Custom hook to use viewport
export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (!context) {
    // Fallback to actual window dimensions if no context
    return {
      width: typeof window !== 'undefined' ? window.innerWidth : 1024,
      height: typeof window !== 'undefined' ? window.innerHeight : 768,
      isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
      isForced: false,
    };
  }
  return context;
};

// Utility functions that respect the viewport context
export const getViewportWidth = () => {
  if (typeof window === 'undefined') return 1024;
  
  // Try to get from context first
  try {
    const context = useViewport();
    return context.width;
  } catch {
    // Fallback to window if context not available
    return window.innerWidth;
  }
};

export const getViewportHeight = () => {
  if (typeof window === 'undefined') return 768;
  
  // Try to get from context first
  try {
    const context = useViewport();
    return context.height;
  } catch {
    // Fallback to window if context not available
    return window.innerHeight;
  }
};

export const isMobileViewport = () => {
  if (typeof window === 'undefined') return false;
  
  // Try to get from context first
  try {
    const context = useViewport();
    return context.isMobile;
  } catch {
    // Fallback to window if context not available
    return window.innerWidth < 768;
  }
};

// Viewport-aware media query helper
export const useMediaQuery = (query) => {
  const viewport = useViewport();
  
  // If we have a forced viewport, use those dimensions
  if (viewport.isForced) {
    if (query.includes('min-width')) {
      const minWidth = parseInt(query.match(/min-width:\s*(\d+)px/)?.[1] || '0');
      return viewport.width >= minWidth;
    }
    if (query.includes('max-width')) {
      const maxWidth = parseInt(query.match(/max-width:\s*(\d+)px/)?.[1] || '9999');
      return viewport.width <= maxWidth;
    }
    if (query.includes('min-height')) {
      const minHeight = parseInt(query.match(/min-height:\s*(\d+)px/)?.[1] || '0');
      return viewport.height >= minHeight;
    }
    if (query.includes('max-height')) {
      const maxHeight = parseInt(query.match(/max-height:\s*(\d+)px/)?.[1] || '9999');
      return viewport.height <= maxHeight;
    }
  }
  
  // Fallback to native matchMedia for non-forced viewports
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia(query).matches;
  }
  
  return false;
};

// Helper for common breakpoints
export const useBreakpoint = () => {
  const viewport = useViewport();
  
  return {
    isMobile: viewport.width < 768,
    isTablet: viewport.width >= 768 && viewport.width < 1024,
    isDesktop: viewport.width >= 1024,
    isLarge: viewport.width >= 1280,
    width: viewport.width,
    height: viewport.height,
    isForced: viewport.isForced,
  };
}; 