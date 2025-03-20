/**
 * client-hints.js
 * Provides performance optimization utilities for the application
 */

// Function to lazily load images as they come into viewport
export const lazyLoadImages = () => {
  // Use IntersectionObserver to load images only when they become visible
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            img.classList.add("loaded");
            imageObserver.unobserve(img);
          }
        });
      },
      {
        rootMargin: "100px", // Start loading when image is 100px from viewport
        threshold: 0.1,
      }
    );

    lazyImages.forEach((img) => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    const lazyLoad = () => {
      const lazyImages = document.querySelectorAll("img[data-src]");

      lazyImages.forEach((img) => {
        if (
          img.getBoundingClientRect().top <= window.innerHeight &&
          img.getBoundingClientRect().bottom >= 0 &&
          getComputedStyle(img).display !== "none"
        ) {
          img.src = img.dataset.src;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.classList.add("loaded");
        }
      });
    };

    // Add event listeners
    document.addEventListener("scroll", lazyLoad);
    window.addEventListener("resize", lazyLoad);
    window.addEventListener("orientationchange", lazyLoad);
    // Initial load
    lazyLoad();
  }
};

// Priority resource hints for critical resources
export const addResourceHints = () => {
  const hints = [
    // Preconnect to API endpoint domains
    { type: "preconnect", href: "https://maps.googleapis.com" },
    { type: "preconnect", href: "https://fonts.googleapis.com" },

    // DNS prefetch for third-party resources
    { type: "dns-prefetch", href: "https://maps.googleapis.com" },
    { type: "dns-prefetch", href: "https://fonts.googleapis.com" },
  ];

  hints.forEach(({ type, href }) => {
    const link = document.createElement("link");
    link.rel = type;
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
};

// Function to defer non-critical JavaScript
export const deferNonCriticalJS = (scriptUrls) => {
  if (!scriptUrls || !scriptUrls.length) return;

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // Load scripts after page load
  window.addEventListener("load", () => {
    // Wait a bit to prioritize other post-load tasks
    setTimeout(() => {
      scriptUrls.forEach((url) => {
        loadScript(url).catch((err) =>
          console.warn(`Failed to load script: ${url}`, err)
        );
      });
    }, 1000);
  });
};

// Function to optimize animations by reducing their impact when tab is not visible
export const optimizeAnimations = () => {
  let isPageVisible = true;

  // Listen for visibility changes
  document.addEventListener("visibilitychange", () => {
    isPageVisible = document.visibilityState === "visible";

    // Add a CSS class to the body that can be used to control animations
    if (isPageVisible) {
      document.body.classList.remove("page-hidden");
    } else {
      document.body.classList.add("page-hidden");
    }

    // You can use this CSS to pause animations when page is hidden:
    // .page-hidden .animate-something { animation-play-state: paused; }
  });
};

// Initialize all performance optimizations
export const initPerformanceOptimizations = () => {
  addResourceHints();

  // Wait for DOM content to be loaded
  window.addEventListener("DOMContentLoaded", () => {
    lazyLoadImages();
    optimizeAnimations();
  });

  // Example of non-critical scripts that can be deferred
  deferNonCriticalJS([
    // Add non-critical script URLs here
    // '/path/to/analytics.js',
    // '/path/to/chat-widget.js'
  ]);
};

export default initPerformanceOptimizations;
