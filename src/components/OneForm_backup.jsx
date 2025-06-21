/**
 * OneForm Component
 *
 * This component provides a comprehensive editing interface for website content.
 * It allows for editing both main page blocks and service pages, and generates
 * a downloadable ZIP file containing:
 *
 * 1. Updated JSON data files (combined_data.json and service_edit.json)
 * 2. Any uploaded images organized in the correct directory structure
 *
 * This is a key part of the website's content management system that allows
 * for local editing of content without direct database access. The downloaded
 * ZIP file can be sent to the developer for permanent integration into the site.
 */
import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";
import PropTypes from "prop-types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import OneFormAuthButton from "./auth/OneFormAuthButton";
import ServiceEditPage, {
  blockMap as importedServiceBlockMap,
} from "./ServiceEditPage";
import MainPageForm from "./MainPageForm";
import AboutBlock from "./MainPageBlocks/AboutBlock";
import { useConfig } from "../context/ConfigContext";
import BottomStickyEditPanel from "./BottomStickyEditPanel";

import Navbar from "./Navbar"; // Import Navbar for preview
import ColorEditor from "./ColorEditor"; // Import the new ColorEditor component
import { defaultColorDefinitions } from "./ColorEditor"; // Import defaultColorDefinitions
import ServicePage from "./ServicePage"; // For rendering all blocks

// Create Viewport Context
const ViewportContext = createContext({
  width: window.innerWidth,
  height: window.innerHeight,
  isMobile: false,
  isForced: false,
});

// Custom hook to use viewport
export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (!context) {
    // Fallback to actual window dimensions if no context
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
      isForced: false,
    };
  }
  return context;
};

// IframePreview Component for true mobile viewport isolation
const IframePreview = ({ children, width = 390, height = 700, deviceViewport }) => {
  const iframeRef = useRef(null);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Copy all stylesheets from parent to iframe
        const parentStylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
        parentStylesheets.forEach(stylesheet => {
          if (stylesheet.tagName === 'LINK') {
            const link = iframeDoc.createElement('link');
            link.rel = 'stylesheet';
            link.href = stylesheet.href;
            iframeDoc.head.appendChild(link);
          } else if (stylesheet.tagName === 'STYLE') {
            const style = iframeDoc.createElement('style');
            style.textContent = stylesheet.textContent;
            iframeDoc.head.appendChild(style);
          }
        });

        // Set up basic HTML structure
        iframeDoc.body.innerHTML = '<div id="iframe-root"></div>';
        iframeDoc.body.style.margin = '0';
        iframeDoc.body.style.padding = '0';
        iframeDoc.body.style.overflow = 'auto';
        
        // Add viewport meta tag for proper mobile rendering
        const viewport = iframeDoc.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = `width=${width}, initial-scale=1`;
        iframeDoc.head.appendChild(viewport);

        setIframeReady(true);
      } catch (error) {
        console.error('Error setting up iframe:', error);
      }
    };

    iframe.addEventListener('load', handleLoad);
    
    // Trigger load if already loaded
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [width]);

  // Render children into iframe when ready
  useEffect(() => {
    if (!iframeReady || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const iframeRoot = iframeDoc.getElementById('iframe-root');
    
    if (iframeRoot && children) {
      // Use React's createPortal to render into iframe
      const portalContent = (
        <ViewportContext.Provider value={{
          width,
          height,
          isMobile: width < 768,
          isForced: true,
        }}>
          {children}
        </ViewportContext.Provider>
      );
      
      // The portal will be created in the render method
      setPortalTarget(iframeRoot);
    }
  }, [iframeReady, children, width, height]);

  const [portalTarget, setPortalTarget] = useState(null);

  return (
    <>
      <iframe
        ref={iframeRef}
        width={width}
        height={height}
        style={{
          border: 'none',
          borderRadius: '2rem',
          backgroundColor: 'white',
          display: 'block',
        }}
        title="Mobile Preview"
      />
      {portalTarget && createPortal(
        <ViewportContext.Provider value={{
          width,
          height,
          isMobile: width < 768,
          isForced: true,
        }}>
          {children}
        </ViewportContext.Provider>,
        portalTarget
      )}
    </>
  );
};

// Viewport Provider Component (simplified since iframe handles isolation)
const ViewportProvider = ({ children, forcedWidth, forcedHeight, deviceViewport }) => {
  const [actualWidth, setActualWidth] = useState(window.innerWidth);
  const [actualHeight, setActualHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setActualWidth(window.innerWidth);
      setActualHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const contextValue = useMemo(() => {
    if (deviceViewport === 'mobile' && forcedWidth && forcedHeight) {
      return {
        width: forcedWidth,
        height: forcedHeight,
        isMobile: true,
        isForced: true,
      };
    }
    
    return {
      width: actualWidth,
      height: actualHeight,
      isMobile: actualWidth < 768,
      isForced: false,
    };
  }, [actualWidth, actualHeight, deviceViewport, forcedWidth, forcedHeight]);

  return (
    <ViewportContext.Provider value={contextValue}>
      {children}
    </ViewportContext.Provider>
  );
};

// Helper function to check if a URL is a local asset to be processed
function isProcessableAssetUrl(url) {
  if (typeof url !== "string") {
    return false;
  }

  // Exclude absolute URLs, data URLs, blob URLs
  if (
    url.startsWith("http:") ||
    url.startsWith("https:") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return false;
  }

  // Exclude anchor links and document files
  if (
    url.startsWith("#") ||
    url === "about" ||
    url === "inspection" ||
    url === "shingleinstallation"
  ) {
    return false;
  }

  // Check if the URL points to a known media folder or a file with an extension
  const validPathCheck = (path) => {
    // Known media folders we want to include
    const validFolders = ["assets/", "Commercial/", "data/"];

    // Valid media file extensions
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".avif",
      ".mp4",
      ".webm",
      ".pdf",
    ];

    // Check if path starts with a valid folder
    const isInValidFolder = validFolders.some(
      (folder) => path.includes(folder) || path.includes(folder.toLowerCase())
    );

    // Check if path has a valid file extension
    const hasValidExtension = validExtensions.some((ext) =>
      path.toLowerCase().endsWith(ext)
    );

    return isInValidFolder || hasValidExtension;
  };

  // Clean up the URL (remove leading slash) for validating
  const cleanPath = url.startsWith("/") ? url.substring(1) : url;

  // Only process valid paths
  return validPathCheck(cleanPath);
}

function transformUrlToMediaObject(url) {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return url && url.trim() !== ""
      ? {
          file: null,
          url: url,
          name: url.split("/").pop() || "image",
          originalUrl: url,
        }
      : null;
  }
  return {
    file: null,
    url: url,
    name: url.split("/").pop() || "image",
    originalUrl: url,
  };
}

function initializeMediaFieldsRecursive(data) {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => initializeMediaFieldsRecursive(item));
  }

  const transformedNode = { ...data };

  const directMediaFields = [
    "backgroundImage",
    "heroImage",
    "imageUrl",
    "image",
    "videoSrc",
    "videoUrl",
    "largeResidentialImg",
    "largeCommercialImg",
    "posterImage",
    "icon",
    "logo",
    "before",
    "after",
  ];

  directMediaFields.forEach((field) => {
    if (transformedNode[field] && typeof transformedNode[field] === "string") {
      transformedNode[field] = transformUrlToMediaObject(
        transformedNode[field]
      );
    }
  });

  if (transformedNode.pictures && Array.isArray(transformedNode.pictures)) {
    transformedNode.pictures = transformedNode.pictures.map((pic) =>
      typeof pic === "string"
        ? transformUrlToMediaObject(pic)
        : initializeMediaFieldsRecursive(pic)
    );
  }

  if (transformedNode.items && Array.isArray(transformedNode.items)) {
    transformedNode.items = transformedNode.items.map((item) =>
      initializeMediaFieldsRecursive(item)
    );
  }

  if (transformedNode.blocks && Array.isArray(transformedNode.blocks)) {
    transformedNode.blocks = transformedNode.blocks.map((block) =>
      initializeMediaFieldsRecursive(block)
    );
  }

  if (transformedNode.config && typeof transformedNode.config === "object") {
    transformedNode.config = initializeMediaFieldsRecursive(
      transformedNode.config
    );
  }

  Object.keys(transformedNode).forEach((key) => {
    if (
      !directMediaFields.includes(key) &&
      key !== "pictures" &&
      key !== "items" &&
      key !== "blocks" &&
      key !== "config" &&
      transformedNode[key] &&
      typeof transformedNode[key] === "object"
    ) {
      if (
        !(
          transformedNode[key].hasOwnProperty("file") &&
          transformedNode[key].hasOwnProperty("url")
        )
      ) {
        transformedNode[key] = initializeMediaFieldsRecursive(
          transformedNode[key]
        );
      }
    }
  });

  return transformedNode;
}

const TabButton = ({ id, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium transition-all duration-300 rounded-t-lg ${
      isActive
        ? "bg-blue-600 text-white border-t-2 border-blue-600"
        : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
    }`}
    data-tab-id={id}
  >
    {label}
  </button>
);

TabButton.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const OneForm = ({ initialData = null, blockName = null, title = null }) => {
  const {
    config,
    loading: configLoading,
    error: configError,
    services: configServices,
    colors: configThemeColors,
    combinedGlobalData,
    aboutPageData,
  } = useConfig();
  const [mainPageFormData, setMainPageFormData] = useState(null);
  const [navbarData, setNavbarData] = useState(null);
  const [initialNavbarData, setInitialNavbarData] = useState(null);
  const [servicesDataForOldExport, setServicesDataForOldExport] =
    useState(null);
  const [managedServicesData, setManagedServicesData] = useState(null);
  const [themeColors, setThemeColors] = useState(null);
  const [sitePalette, setSitePalette] = useState([]); // New state for the rich array of color objects
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialFormDataForOldExport, setInitialFormDataForOldExport] =
    useState(null);
  const [aboutPageJsonData, setAboutPageJsonData] = useState(null);
  const [initialAboutPageJsonData, setInitialAboutPageJsonData] =
    useState(null);
  const [sentimentReviewsData, setSentimentReviewsData] = useState(null);
  const [initialSentimentReviewsData, setInitialSentimentReviewsData] =
    useState(null);
  const [allServiceBlocksData, setAllServiceBlocksData] = useState({
    blocks: [],
  });
  const [initialAllServiceBlocksData, setInitialAllServiceBlocksData] =
    useState({ blocks: [] });
  const [loadingAllServiceBlocks, setLoadingAllServiceBlocks] = useState(true);
  const [activeEditShowcaseBlockIndex, setActiveEditShowcaseBlockIndex] =
    useState(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [initialServicesData, setInitialServicesData] = useState(null);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const navigate = useNavigate();

  // Add editing state for services
  const [editingTarget, setEditingTarget] = useState(null);

  const isDevelopment = import.meta.env.DEV;

  const [serviceBlockMap, setServiceBlockMap] = useState({});
  const [activeTab, setActiveTab] = useState("mainPage");

  // Ref to prevent duplicate fetches
  const fetchingRef = useRef(false);
  const dataLoadedRef = useRef(false);
  
  // Ref for the BottomStickyEditPanel to get its actual height
  const panelRef = useRef(null);

  // Add device viewport state and forced preview states
  const [deviceViewport, setDeviceViewport] = useState('desktop'); // 'desktop' or 'mobile'
  const [forcedPreviewStates, setForcedPreviewStates] = useState({});

  useEffect(() => {
    setServiceBlockMap(importedServiceBlockMap);
  }, []);

  // Handle preview state changes
  const handlePreviewStateChange = useCallback((blockType, newState) => {
    setForcedPreviewStates(prev => ({
      ...prev,
      [blockType]: newState
    }));
  }, []);

  // Add handler for starting editing
  const handleStartEditing = useCallback((target) => {
    setEditingTarget(target);
  }, []);

  // Add handler for closing editing
  const handleCloseEditing = useCallback(() => {
    // Scroll DOWN by actual panel height when closing
    setTimeout(() => {
      const actualPanelHeight = panelRef.current ? panelRef.current.offsetHeight : 400; // fallback height
      const currentScrollY = window.scrollY;
      console.log('[OneForm] Closing panel - scrolling DOWN by', actualPanelHeight, 'pixels from', currentScrollY, 'to', currentScrollY + actualPanelHeight);
      // Scroll down by adding the panel height to current position
      window.scrollTo({
        top: currentScrollY + actualPanelHeight,
        behavior: 'smooth',
      });
    }, 100);
    
    setEditingTarget(null);
  }, []);

  // Get active block data for the panel
  const getActiveBlockData = useCallback(() => {
    if (!editingTarget) return null;
    
    // Return the editingTarget data directly since ServiceEditPage already formats it
    return editingTarget;
  }, [editingTarget]);

  // Memoize default theme colors to prevent recreation
  const defaultThemeColors = useMemo(
    () =>
      defaultColorDefinitions.reduce((obj, item) => {
        obj[item.name] = item.value;
        return obj;
      }, {}),
    []
  );

  useEffect(() => {
    // Prevent duplicate fetches
    if (fetchingRef.current || dataLoadedRef.current) {
      return;
    }

    fetchingRef.current = true;

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      let currentMainPageData = null;
      let rawServicesSource = null;
      let currentAboutData = null;
      let currentNavbarData = null;
      let currentThemeColorsValue = null;
      let currentAllBlocksShowcaseData = null;
      let currentSentimentReviewsData = null;
      let currentSitePaletteValue = []; // Initialize for sitePalette

      try {
        if (initialData) {
          currentMainPageData = initialData.mainPageBlocks
            ? { mainPageBlocks: initialData.mainPageBlocks }
            : null;
          rawServicesSource = initialData.services || null;
          currentAboutData = initialData.aboutPageData || null;
          currentNavbarData = initialData.navbarData || null;
          currentThemeColorsValue = initialData.themeColors || null;
          currentAllBlocksShowcaseData = initialData.all_blocks_showcase || null;
          currentSitePaletteValue = initialData.sitePalette || []; // Get sitePalette from initialData if available
          currentSentimentReviewsData = initialData.sentimentReviewsData || null;
        }

        // Use config theme colors if not provided in initialData
        if (!currentThemeColorsValue) {
          currentThemeColorsValue = configThemeColors;
        }

        if (currentThemeColorsValue) {
          setThemeColors(currentThemeColorsValue);
          // Initialize sitePalette from themeColors if sitePalette wasn't directly in initialData
          if (currentSitePaletteValue.length === 0) {
            const initialPalette = Object.entries(currentThemeColorsValue).map(
              ([name, value], index) => ({
                id: `initial-theme-${name}-${index}`,
                name: name,
                label: name
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
                value: typeof value === "string" ? value : "#000000",
                description: `Theme color: ${name}`,
                isDefault: defaultColorDefinitions.some(
                  (def) => def.name === name
                ),
                isRemovable: !defaultColorDefinitions.some(
                  (def) => def.name === name
                ),
              })
            );
            currentSitePaletteValue = initialPalette;
          }
        } else {
          console.warn("[OneForm] Theme colors not found. Using defaults.");
          setThemeColors(defaultThemeColors);
          currentSitePaletteValue = [...defaultColorDefinitions]; // Use full default definitions for sitePalette
        }
        setSitePalette(currentSitePaletteValue); // Set sitePalette state

        if (!currentMainPageData)
          currentMainPageData = combinedGlobalData
            ? { mainPageBlocks: combinedGlobalData.mainPageBlocks || [] }
            : null;
        if (!currentAboutData) currentAboutData = aboutPageData;
        if (!rawServicesSource) rawServicesSource = configServices;

        // Handle navbar data
        if (currentNavbarData) {
          setNavbarData(currentNavbarData);
          setInitialNavbarData(deepCloneWithFiles(currentNavbarData));
        } else if (!blockName) {
          try {
            const navResponse = await fetch("/personal/old/jsons/nav.json");
            if (navResponse.ok) {
              const navDataFetched = await navResponse.json();
              const initializedNavData =
                initializeMediaFieldsRecursive(navDataFetched);
              setNavbarData(initializedNavData);
              setInitialNavbarData(deepCloneWithFiles(navDataFetched));
            } else {
              console.error(
                "[OneForm] Failed to fetch /personal/old/jsons/nav.json. Status:",
                navResponse.status
              );
              const fallbackNavbar = {
                title: "COWBOYS-VAQUEROS",
                subtitle: "CONSTRUCTION",
                navLinks: [],
                images: [],
                whiteImages: [],
              };
              setNavbarData(fallbackNavbar);
              setInitialNavbarData(deepCloneWithFiles(fallbackNavbar));
            }
          } catch (fetchError) {
            console.error(
              "[OneForm] Error fetching /personal/old/jsons/nav.json:",
              fetchError
            );
            const fallbackNavbar = {
              title: "COWBOYS-VAQUEROS",
              subtitle: "CONSTRUCTION",
              navLinks: [],
              images: [],
              whiteImages: [],
            };
            setNavbarData(fallbackNavbar);
            setInitialNavbarData(deepCloneWithFiles(fallbackNavbar));
          }
        }

        if (currentMainPageData) {
          setMainPageFormData(currentMainPageData);
          setInitialFormDataForOldExport(
            deepCloneWithFiles(currentMainPageData)
          );
        }

        if (currentAboutData) {
          setAboutPageJsonData(currentAboutData);
          setInitialAboutPageJsonData(
            deepCloneWithFiles(currentAboutData)
          );
        } else if (!blockName) {
          try {
            const aboutResponse = await fetch(
              "/personal/old/jsons/about_page.json"
            );
            if (aboutResponse.ok) {
              const aboutDataFetched = await aboutResponse.json();
              setAboutPageJsonData(aboutDataFetched);
              setInitialAboutPageJsonData(
                deepCloneWithFiles(aboutDataFetched)
              );
            } else {
              console.error(
                "[OneForm] Failed to fetch /personal/old/jsons/about_page.json. Status:",
                aboutResponse.status
              );
               try {
                const aboutJsonResponse = await fetch(
                  "/data/raw_data/step_3/about_page.json"
                );
                if (aboutJsonResponse.ok) {
                  const aboutJson = await aboutJsonResponse.json();
                  setAboutPageJsonData(aboutJson);
                  setInitialAboutPageJsonData(
                    deepCloneWithFiles(aboutJson)
                  );
                } else {
                  console.warn(
                    "OneForm: Failed to load about_page.json from fallback. About page editor might not work as expected."
                  );
                  setAboutPageJsonData({});
                  setInitialAboutPageJsonData({});
                }
              } catch (aboutJsonError) {
                console.error(
                  "OneForm: Error loading about_page.json from fallback:",
                  aboutJsonError
                );
                setAboutPageJsonData({});
                setInitialAboutPageJsonData({});
              }
            }
          } catch (fetchError) {
            console.error(
              "[OneForm] Error fetching /personal/old/jsons/about_page.json:",
              fetchError
            );
            try {
              const aboutJsonResponse = await fetch(
                "/data/raw_data/step_3/about_page.json"
              );
              if (aboutJsonResponse.ok) {
                const aboutJson = await aboutJsonResponse.json();
                setAboutPageJsonData(aboutJson);
                setInitialAboutPageJsonData(
                  deepCloneWithFiles(aboutJson)
                );
              } else {
                console.warn(
                  "OneForm: Failed to load about_page.json from fallback after error."
                );
                setAboutPageJsonData({});
                setInitialAboutPageJsonData({});
              }
            } catch (aboutJsonErrorFallback) {
              console.error(
                "OneForm: Error loading about_page.json from fallback after error:",
                aboutJsonErrorFallback
              );
              setAboutPageJsonData({});
              setInitialAboutPageJsonData({});
            }
          }
        }

        if (!rawServicesSource && !blockName) {
          try {
            const servicesResponse = await fetch(
              "/personal/old/jsons/services.json"
            );
            if (servicesResponse.ok) {
              rawServicesSource = await servicesResponse.json();
            } else {
              console.error(
                "[OneForm] Failed to fetch /personal/old/jsons/services.json. Status:",
                servicesResponse.status
              );
              rawServicesSource = { commercial: [], residential: [] };
            }
          } catch (fetchError) {
            console.error(
              "[OneForm] Error fetching /personal/old/jsons/services.json:",
              fetchError
            );
            rawServicesSource = { commercial: [], residential: [] };
          }
        }

        if (rawServicesSource) {
          setServicesDataForOldExport(
            deepCloneWithFiles(rawServicesSource)
          );
          const initializedServices =
            initializeMediaFieldsRecursive(rawServicesSource);
          setManagedServicesData(initializedServices);
        } else {
          console.warn(
            "[OneForm] No raw service data available. ManagedServicesData will be null or default."
          );
          setServicesDataForOldExport({ commercial: [], residential: [] });
          setManagedServicesData({ commercial: [], residential: [] });
        }

        if (currentAllBlocksShowcaseData) {
          setAllServiceBlocksData(currentAllBlocksShowcaseData);
          setInitialAllServiceBlocksData(
            deepCloneWithFiles(currentAllBlocksShowcaseData)
          );
          setLoadingAllServiceBlocks(false);
        } else if (!blockName) {
          try {
            const allBlocksResponse = await fetch(
              "/personal/old/jsons/all_blocks_showcase.json"
            );
            if (allBlocksResponse.ok) {
              const data = await allBlocksResponse.json();
              setAllServiceBlocksData(data);
              setInitialAllServiceBlocksData(deepCloneWithFiles(data));
            } else {
              setAllServiceBlocksData({ blocks: [] });
              setInitialAllServiceBlocksData({ blocks: [] });
            }
          } catch (error) {
            console.error(
              "[OneForm] Error fetching all_blocks_showcase.json",
              error
            );
            setAllServiceBlocksData({ blocks: [] });
            setInitialAllServiceBlocksData({ blocks: [] });
          } finally {
            setLoadingAllServiceBlocks(false);
          }
        }

        if (currentSentimentReviewsData) {
            setSentimentReviewsData(currentSentimentReviewsData);
            setInitialSentimentReviewsData(deepCloneWithFiles(currentSentimentReviewsData));
        } else if (!blockName) {
            try {
                const sentimentResponse = await fetch("/personal/old/jsons/sentiment_reviews.json");
                if (sentimentResponse.ok) {
                    const sentimentData = await sentimentResponse.json();
                    setSentimentReviewsData(sentimentData);
                    setInitialSentimentReviewsData(deepCloneWithFiles(sentimentData));
                } else {
                    console.error("[OneForm] Failed to fetch /personal/old/jsons/sentiment_reviews.json. Status:", sentimentResponse.status);
                    setSentimentReviewsData([]);
                    setInitialSentimentReviewsData([]);
                }
            } catch (fetchError) {
                console.error("[OneForm] Error fetching /personal/old/jsons/sentiment_reviews.json:", fetchError);
                setSentimentReviewsData([]);
                setInitialSentimentReviewsData([]);
            }
        }

        if (!currentMainPageData && !blockName) {
          try {
            // Check if we're on a custom domain
            const customDomain =
              window.location.hostname !== "roofing-co.pages.dev" &&
              window.location.hostname !== "roofing-www.pages.dev" &&
              window.location.hostname !== "localhost";
            setIsCustomDomain(customDomain);

            if (customDomain) {
              try {
                // Fetch the domain-specific config
                const domainConfigResponse = await fetch("/api/public/config");

                if (domainConfigResponse.ok) {
                  const domainData = await domainConfigResponse.json();
                  setMainPageFormData(domainData);
                  setInitialFormDataForOldExport(
                    deepCloneWithFiles(domainData)
                  );
                  return;
                } else {
                  console.error(
                    "[OneForm] Failed to load domain config. Status:",
                    domainConfigResponse.status
                  );
                  const errorText = await domainConfigResponse.text();
                  console.error("[OneForm] Error response:", errorText);
                }
              } catch (domainConfigError) {
                console.error(
                  "[OneForm] Error loading domain config:",
                  domainConfigError
                );
              }
            }

            // If not on custom domain or domain config failed, check authentication
            if (!isDevelopment) {
              const authResponse = await fetch("/api/auth/status", {
                credentials: "include",
              });

              const authData = await authResponse.json();

              if (authData.isAuthenticated) {
                try {
                  // Fetch the user's custom config
                  const customConfigResponse = await fetch(`/api/config/load`, {
                    credentials: "include",
                  });

                  if (customConfigResponse.ok) {
                    const configData = await customConfigResponse.json();
                    if (configData.combined_data) {
                      setMainPageFormData(configData.combined_data);
                      setInitialFormDataForOldExport(
                        deepCloneWithFiles(configData.combined_data)
                      );
                    }
                    if (configData.about_page) {
                      setAboutPageJsonData(configData.about_page);
                      setInitialAboutPageJsonData(
                        deepCloneWithFiles(configData.about_page)
                      );
                    }
                    return;
                  } else {
                    console.error(
                      "[OneForm] Failed to load custom config. Status:",
                      customConfigResponse.status
                    );
                    const errorText = await customConfigResponse.text();
                    console.error("[OneForm] Error response:", errorText);
                  }
                } catch (customConfigError) {
                  console.error(
                    "[OneForm] Error loading custom config:",
                    customConfigError
                  );
                }
              }
            }

            // Fallback to local files if all else fails
            const combinedResponse = await fetch(
              "/personal/old/jsons/combined_data.json"
            );
            if (combinedResponse.ok) {
              const fetchedMainData = await combinedResponse.json();
              setMainPageFormData(fetchedMainData);
            } else {
              console.error(
                "[OneForm] Fallback: Failed to load combined_data.json"
              );
              setMainPageFormData({ mainPageBlocks: [], navbar: {} });
            }
          } catch (e) {
            console.error(
              "[OneForm] Fallback: Error loading combined_data.json",
              e
            );
            setMainPageFormData({ mainPageBlocks: [], navbar: {} });
          }
        }

        dataLoadedRef.current = true;
      } catch (error) {
        console.error("[OneForm] Error in fetchAllData:", error);
        setError(error.message || "Failed to load data.");
        setMainPageFormData({ mainPageBlocks: [], navbar: {} });
        setAboutPageJsonData({});
        setAllServiceBlocksData({ blocks: [] });
        setThemeColors(configThemeColors || defaultThemeColors);
        setSitePalette([...defaultColorDefinitions]); // Fallback for sitePalette
        setManagedServicesData({ commercial: [], residential: [] });
        setServicesDataForOldExport({ commercial: [], residential: [] });
        setSentimentReviewsData([]);
      } finally {
        setIsLoading(false);
        setIsInitialLoadComplete(true);
        fetchingRef.current = false;
      }
    };

    fetchAllData();
  }, [config, configLoading, configError, configServices, configThemeColors, combinedGlobalData, aboutPageData, initialData, blockName, isDevelopment, defaultThemeColors]);

  const preserveImageUrls = useCallback((data) => {
    if (!data || typeof data !== "object") return data;

    const preserveInObject = (obj) => {
      if (!obj || typeof obj !== "object") return obj;

      if (Array.isArray(obj)) {
        return obj.map((item) => preserveInObject(item));
      }

      const preserved = { ...obj };

      if (preserved.file instanceof File && preserved.url) {
        return preserved;
      }

      if (
        preserved.url &&
        typeof preserved.url === "string" &&
        preserved.url.startsWith("blob:")
      ) {
        return preserved;
      }

      Object.keys(preserved).forEach((key) => {
        preserved[key] = preserveInObject(preserved[key]);
      });

      return preserved;
    };

    return preserveInObject(data);
  }, []);

  // Helper function to deep clone objects while preserving File objects and other non-serializable types
  function deepCloneWithFiles(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof File) {
      return obj; // Return File objects as-is
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => deepCloneWithFiles(item));
    }

    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepCloneWithFiles(obj[key]);
      }
    }
    return cloned;
  }

  // Helper function to process and clean data for JSON output, replacing file objects with proper paths
  function processDataForJson(
    originalDataNode,
    assetsToCollect,
    parentBlockName = null,
    isProcessingMainPageBlocks = false,
    contentType = "main",
    serviceContext = null,
    {
      pathPrefix = 'personal/old', 
      collectNewOnly = false 
    } = {}
  ) {
    if (originalDataNode === null || originalDataNode === undefined) {
      return originalDataNode;
    }

    if (Array.isArray(originalDataNode)) {
      // Special handling for mainPageBlocks array
      if (isProcessingMainPageBlocks) {
        return originalDataNode.map((block) => {
          if (block && block.blockName && block.config) {
            return {
              ...block,
              config: processDataForJson(
                block.config,
                assetsToCollect,
                block.blockName,
                false,
                "main",
                serviceContext,
                { pathPrefix, collectNewOnly }
              ),
            };
          }
          return processDataForJson(
            block,
            assetsToCollect,
            parentBlockName,
            false,
            contentType,
            serviceContext,
            { pathPrefix, collectNewOnly }
          );
        });
      }

      // Special handling for services arrays (commercial/residential)
      if (
        contentType === "services" &&
        (parentBlockName === "commercial" || parentBlockName === "residential")
      ) {
        return originalDataNode.map((serviceItem, index) => {
          const serviceData = {
            category: parentBlockName,
            id: serviceItem.id || index + 1,
            name:
              serviceItem.name || serviceItem.title || `Service ${index + 1}`,
            title:
              serviceItem.title || serviceItem.name || `Service ${index + 1}`,
          };
          return processDataForJson(
            serviceItem,
            assetsToCollect,
            `${parentBlockName}_service_${serviceData.id}`,
            false,
            contentType,
            serviceData,
            { pathPrefix, collectNewOnly }
          );
        });
      }

      return originalDataNode.map((item) =>
        processDataForJson(
          item,
          assetsToCollect,
          parentBlockName,
          false,
          contentType,
          serviceContext,
          { pathPrefix, collectNewOnly }
        )
      );
    }

    if (
      typeof originalDataNode === "object" &&
      !(originalDataNode instanceof File)
    ) {
      // Helper function to try to preserve original filenames from the old structure
      const getOriginalFileName = (
        currentFileName,
        originalUrl,
        contentType,
        blockName
      ) => {
        // If there's an originalUrl, try to extract the original filename
        if (originalUrl && typeof originalUrl === "string") {
          // Check if it's from the old structure (/personal/old/)
          if (originalUrl.includes("/personal/old/")) {
            const originalName = originalUrl.split("/").pop();
            if (
              originalName &&
              originalName !== "undefined" &&
              originalName !== "null"
            ) {
              return originalName;
            }
          }
          // Check for other known original paths
          if (
            originalUrl.includes("/assets/images/") ||
            originalUrl.includes("/assets/videos/")
          ) {
            const originalName = originalUrl.split("/").pop();
            if (
              originalName &&
              originalName !== "undefined" &&
              originalName !== "null"
            ) {
              return originalName;
            }
          }
        }

        // If no original URL or can't extract, use current filename but clean it
        const cleanFileName = currentFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        return cleanFileName;
      };

      // Function to generate appropriate path based on content type and block
      const generateAssetPath = (
        fileName,
        blockName,
        contentType,
        serviceData = null,
        originalUrl = null,
        currentPathPrefix
      ) => {
        const finalFileName = getOriginalFileName(
          fileName,
          originalUrl,
          contentType,
          blockName
        );

        let subPath = '';
        switch (contentType) {
          case "main":
            // Handle specialized paths for different image types
            if (finalFileName.includes("overlay")) {
              subPath = `img/main_page_images/${blockName || "global"}/overlays/${finalFileName}`;
            } else if (finalFileName.includes("carousel") || finalFileName.includes("slideshow")) {
              subPath = `img/main_page_images/${blockName || "global"}/carousel/${finalFileName}`;
            } else if (finalFileName.includes("gallery")) {
              subPath = `img/main_page_images/${blockName || "global"}/gallery/${finalFileName}`;
            } else {
              subPath = `img/main_page_images/${blockName || "global"}/${finalFileName}`;
            }
            break;
          case "navbar":
            subPath = `img/nav/${finalFileName}`;
            break;
          case "about":
            if (blockName === "AboutBlock") {
              if (
                finalFileName.toLowerCase().includes("team") ||
                finalFileName.toLowerCase().includes("member") ||
                finalFileName.toLowerCase().includes("roofer") ||
                finalFileName.toLowerCase().includes("foreman")
              ) {
                subPath = `img/about_page/team/${finalFileName}`;
              } else if (
                finalFileName.toLowerCase().includes("video") ||
                finalFileName.toLowerCase().includes(".mp4") ||
                finalFileName.toLowerCase().includes(".webm")
              ) {
                subPath = `img/about_page/videos/${finalFileName}`;
              } else {
                subPath = `img/about_page/${finalFileName}`;
              }
            } else {
               subPath = `img/about_page/${finalFileName}`;
            }
            break;
          case "services":
            if (serviceData) {
              const category = serviceData.category || "general";
              const serviceId = serviceData.id || "unknown";
              const serviceSlug = `${category}_${serviceId}`;
              const assetType = (finalFileName.toLowerCase().includes("video") || finalFileName.toLowerCase().includes(".mp4") || finalFileName.includes(".webm")) ? 'videos' : 'images';
              subPath = `img/services/${serviceSlug}/assets/${assetType}/${finalFileName}`;
            } else {
              const serviceFolder = blockName || "general";
              const assetType = (finalFileName.toLowerCase().includes("video") || finalFileName.toLowerCase().includes(".mp4") || finalFileName.includes(".webm")) ? 'videos' : 'images';
              subPath = `img/services/${serviceFolder}/assets/${assetType}/${finalFileName}`;
            }
            break;
          case "showcase":
            subPath = `img/all_dev/assets/images/${finalFileName}`;
            break;
          default:
            subPath = `img/global_assets/${finalFileName}`;
            break;
        }
        return `${currentPathPrefix}/${subPath}`;
      };

      // Handle arrays of image items
      if (Array.isArray(originalDataNode) && parentBlockName) {
        return originalDataNode.map((imageItem, imageIndex) => {
          if (imageItem && typeof imageItem === 'object') {
            const isNewFile = imageItem.file instanceof File || (imageItem.url && imageItem.url.startsWith('blob:'));
            
            if (collectNewOnly && !isNewFile) {
              // If we only collect new files and this isn't one, return it as is, but ensure URL is absolute.
              if(imageItem.url && !imageItem.url.startsWith('/')) {
                return { ...imageItem, url: `/${imageItem.url}` };
              }
              return imageItem;
            }

            const currentPrefix = isNewFile ? 'personal/new' : pathPrefix;
            
            const originalFileName = imageItem.name || imageItem.originalUrl?.split('/').pop() || `image_${imageIndex}`;
            const imagePath = generateAssetPath(originalFileName, parentBlockName, contentType, serviceContext, imageItem.originalUrl, currentPrefix);

            if (isNewFile) {
              assetsToCollect.push({
                path: imagePath,
                file: imageItem.file,
                url: imageItem.url,
                type: imageItem.file ? 'file' : 'blob',
                originalName: originalFileName,
              });
            } else if (imageItem.url && typeof imageItem.url === 'string' && !imageItem.url.startsWith('http')) {
              assetsToCollect.push({
                path: imagePath,
                url: imageItem.url,
                type: 'local',
                originalName: originalFileName,
              });
            }
            
            return {
              id: imageItem.id,
              url: `/${imagePath}`,
              name: imagePath.split('/').pop(),
              originalUrl: imageItem.originalUrl || `/${imagePath}`,
            };
          }
          return imageItem;
        });
      }
      
      const isNewFile = originalDataNode.file instanceof File || (originalDataNode.url && originalDataNode.url.startsWith("blob:"));
      
      if (isNewFile) {
        if (collectNewOnly && !isNewFile) {
          return originalDataNode;
        }

        const currentPrefix = isNewFile ? 'personal/new' : pathPrefix;
        const originalFileName = originalDataNode.name || originalDataNode.file?.name || 'image';
        const imagePath = generateAssetPath(originalFileName, parentBlockName, contentType, serviceContext, originalDataNode.originalUrl, currentPrefix);

        assetsToCollect.push({
          path: imagePath,
          file: originalDataNode.file,
          url: originalDataNode.url,
          type: originalDataNode.file ? 'file' : 'blob',
          originalName: originalFileName,
        });

        return {
          id: originalDataNode.id,
          url: `/${imagePath}`,
          name: imagePath.split('/').pop(),
          originalUrl: originalDataNode.originalUrl || `/${imagePath}`,
        };
      }
      
      // Process object recursively
      const newObj = {};
      for (const key in originalDataNode) {
        if (Object.prototype.hasOwnProperty.call(originalDataNode, key)) {
          if (
            key === "mainPageBlocks" &&
            Array.isArray(originalDataNode[key])
          ) {
            newObj[key] = processDataForJson(
              originalDataNode[key],
              assetsToCollect,
              parentBlockName,
              true,
              "main",
              serviceContext,
              { pathPrefix, collectNewOnly }
            );
          } else if (
            key === "images" &&
            Array.isArray(originalDataNode[key]) &&
            parentBlockName
          ) {
            newObj[key] = processDataForJson(
              originalDataNode[key],
              assetsToCollect,
              parentBlockName,
              false,
              contentType,
              serviceContext,
              { pathPrefix, collectNewOnly }
            );
          } else if (
            key === "overlayImages" &&
            Array.isArray(originalDataNode[key]) &&
            parentBlockName
          ) {
            newObj[key] = processDataForJson(
              originalDataNode[key],
              assetsToCollect,
              parentBlockName,
              false,
              contentType,
              serviceContext,
              { pathPrefix, collectNewOnly }
            );
          } else if (
            key === "gallery" &&
            Array.isArray(originalDataNode[key]) &&
            parentBlockName
          ) {
            newObj[key] = processDataForJson(
              originalDataNode[key],
              assetsToCollect,
              parentBlockName,
              false,
              contentType,
              serviceContext,
              { pathPrefix, collectNewOnly }
            );
          } else if (
            key === "employee" &&
            Array.isArray(originalDataNode[key]) &&
            parentBlockName
          ) {
            newObj[key] = processDataForJson(
              originalDataNode[key],
              assetsToCollect,
              parentBlockName,
              false,
              contentType,
              serviceContext,
              { pathPrefix, collectNewOnly }
            );
          } else if (
            (key === "commercial" || key === "residential") &&
            Array.isArray(originalDataNode[key]) &&
            contentType === "services"
          ) {
            newObj[key] = processDataForJson(
              originalDataNode[key],
              assetsToCollect,
              key,
              false,
              contentType,
              serviceContext,
              { pathPrefix, collectNewOnly }
            );
          } else {
            newObj[key] = processDataForJson(
              originalDataNode[key],
              assetsToCollect,
              parentBlockName,
              false,
              contentType,
              serviceContext,
              { pathPrefix, collectNewOnly }
            );
          }
        }
      }
      return newObj;
    }

    return originalDataNode;
  }

  const handleSubmit = useCallback(async () => {
    try {
      if (!mainPageFormData) {
        console.error("No form data to submit.");
        alert("No data available to download.");
        return;
      }

      console.log("[OneForm] Starting download process with new/old structure.");

      const zip = new JSZip();
      const oldRootPath = 'personal/old';
      const newRootPath = 'personal/new';
      
      const oldJsonsFolder = zip.folder(`${oldRootPath}/jsons`);
      const newJsonsFolder = zip.folder(`${newRootPath}/jsons`);

      const initialClonedData = {
        combined_data: deepCloneWithFiles(initialFormDataForOldExport),
        nav: deepCloneWithFiles(initialNavbarData),
        services: deepCloneWithFiles(servicesDataForOldExport),
        about_page: deepCloneWithFiles(initialAboutPageJsonData),
        all_blocks_showcase: deepCloneWithFiles(initialAllServiceBlocksData),
        sentiment_reviews: deepCloneWithFiles(initialSentimentReviewsData),
      };

      const currentClonedData = {
        combined_data: deepCloneWithFiles(mainPageFormData),
        nav: deepCloneWithFiles(navbarData),
        services: deepCloneWithFiles(managedServicesData),
        about_page: deepCloneWithFiles(aboutPageJsonData),
        all_blocks_showcase: deepCloneWithFiles(allServiceBlocksData),
        sentiment_reviews: deepCloneWithFiles(sentimentReviewsData),
      };
      
      const contentTypes = {
        combined_data: 'main',
        nav: 'navbar',
        services: 'services',
        about_page: 'about',
        all_blocks_showcase: 'showcase',
        sentiment_reviews: 'reviews',
      };

      // --- Process OLD data (Initial State Snapshot) ---
      const oldAssets = [];
      const oldJsons = {};
      console.log("[OneForm] Processing OLD data snapshot...");
      for(const [name, data] of Object.entries(initialClonedData)) {
        if (data) {
          const contentType = contentTypes[name] || 'main';
          const cleanedJson = processDataForJson(data, oldAssets, name, false, contentType, null, { pathPrefix: oldRootPath, collectNewOnly: false });
          oldJsons[name] = cleanedJson;
          oldJsonsFolder.file(`${name}.json`, JSON.stringify(cleanedJson, null, 2));
        }
      }

      // --- Process NEW data (The Diff) ---
      const newAssets = [];
      const newJsons = {};
      console.log("[OneForm] Processing NEW data (diff)...");
      for(const [name, data] of Object.entries(currentClonedData)) {
        if (data) {
           const contentType = contentTypes[name] || 'main';
           const cleanedJson = processDataForJson(data, newAssets, name, false, contentType, null, { pathPrefix: oldRootPath, collectNewOnly: true });

           // Always write the current state to the 'new' folder
           console.log(`[OneForm] Writing ${name}.json to NEW folder.`);
           newJsonsFolder.file(`${name}.json`, JSON.stringify(cleanedJson, null, 2));
        }
      }
      
      // Add colors if changed
      const initialColorsJson = JSON.stringify(defaultColorDefinitions.reduce((obj, item) => {
        const snakeCaseKey = item.name.replace(/-/g, "_");
        obj[snakeCaseKey] = item.value;
        return obj;
      }, {}), null, 2);
      
      const currentColorsForJson = {};
      Object.entries(themeColors).forEach(([key, value]) => {
        const snakeCaseKey = key.replace(/-/g, "_");
        currentColorsForJson[snakeCaseKey] = value;
      });
      const currentColorsJson = JSON.stringify(currentColorsForJson, null, 2);

      // Add old colors to old folder
      oldJsonsFolder.file("colors_output.json", initialColorsJson);

      // Always write current colors to 'new' folder
      console.log("[OneForm] Writing colors_output.json to NEW folder.");
      newJsonsFolder.file("colors_output.json", currentColorsJson);
      
      // --- Package all assets into the ZIP ---
      const allCollectedAssets = [...oldAssets, ...newAssets];
      console.log(`[OneForm] Processing ${allCollectedAssets.length} collected assets.`);

      for (const asset of allCollectedAssets) {
        try {
          let assetData;
          if (asset.type === "file" && asset.file instanceof File) {
             assetData = asset.file;
          } else if (asset.url) {
            const response = await fetch(asset.url);
            if (!response.ok) throw new Error(`Failed to fetch ${asset.url}: ${response.statusText}`);
            assetData = await response.blob();
          }

          if (assetData) {
            zip.file(asset.path, assetData);
          }
        } catch (error) {
          console.error(`[OneForm] Error processing asset ${asset.path}:`, error);
        }
      }

      // Create README with instructions reflecting the new structure
      const readmeContent = `# Website Content Update Package

Generated: ${new Date().toISOString()}

## Structure

This package contains website content updates separated into two distinct folders: 'personal/old' and 'personal/new'.

\`\`\`
/
├── personal/
│   ├── old/
│   │   ├── jsons/         # COMPLETE set of original JSON files
│   │   └── img/           # COMPLETE set of original image and video assets
│   │
│   └── new/
│       ├── jsons/         # ONLY JSON files that have been changed
│       └── img/           # ONLY new or updated image and video assets
│
└── README.md              # These instructions
\`\`\`

## Integration Instructions

1.  **Backup Existing Directories**: Before proceeding, create a backup of your project's existing \`/public/personal/old\` and \`/public/personal/new\` directories.

2.  **Apply OLD Folder (Reference)**: The \`personal/old\` folder in this ZIP is a complete snapshot of the content *before* this editing session. It can be used as a reference or to restore the original state if needed. For a standard update, you typically **do not** need to copy this folder over.

3.  **Apply NEW Folder (The Changes)**: This is the critical step.
    *   **Merge the contents** of the \`personal/new\` folder from this ZIP into your project's existing \`/public/personal/new\` directory.
    *   This will add any new JSON files and any new images to your project.
    *   Since the directory structure is mirrored, files will be placed in their correct locations.

4.  **Verification**: After merging the \`new\` folder:
    *   Clear your browser cache and review the live site.
    *   Verify that all text and image changes appear correctly.
    *   Check that both new images and existing (old) images are loading properly.

## How It Works

-   **\`personal/old\`**: A static snapshot of the content at the beginning of the editing session.
-   **\`personal/new\`**: A sparse 'diff' containing only the files that were modified. The updated JSON files in \`new/jsons\` contain paths that correctly reference assets from both \`new/img\` (for new files) and \`old/img\` (for unchanged files).
`;

      zip.file("README.md", readmeContent);

      // Generate and download the ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
      const zipFileName = blockName
        ? `${blockName}_edit_${dateStr}_${timeStr}.zip`
        : `website_content_${dateStr}_${timeStr}.zip`;

      saveAs(content, zipFileName);
      console.log("ZIP file generation complete:", zipFileName);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("Error creating ZIP file. See console for details.");
    }
  }, [
    mainPageFormData,
    navbarData,
    managedServicesData,
    aboutPageJsonData,
    allServiceBlocksData,
    themeColors,
    blockName,
    initialFormDataForOldExport,
    initialNavbarData,
    servicesDataForOldExport,
    initialAboutPageJsonData,
    initialAllServiceBlocksData,
    initialSentimentReviewsData,
    defaultColorDefinitions
  ]);

  const handleMainPageFormChange = (newMainPageFormData) => {
    setMainPageFormData((prev) => {
      const updatedData = {
        ...prev,
        mainPageBlocks:
          newMainPageFormData.mainPageBlocks || prev.mainPageBlocks,
        navbar: newMainPageFormData.navbar || prev.navbar,
        hero: newMainPageFormData.hero || prev.hero,
      };
      console.log("Updated main page form data:", updatedData);

      return updatedData;
    });
  };

  const handleAboutConfigChange = (newAboutConfig) => {
    console.log("[OneForm] About page config changed:", newAboutConfig);
    // Combined approach: preserve URLs and update both current and initial data
    const preservedConfig = preserveImageUrls(newAboutConfig);
    setAboutPageJsonData(preservedConfig);
    // Deep clone to ensure fresh copy and update initial data
    const clonedConfig = deepCloneWithFiles(preservedConfig);
    setInitialAboutPageJsonData(clonedConfig);
  };

  const handleNavbarConfigChange = (newNavbarConfig) => {
    console.log("[OneForm] Navbar config changed:", newNavbarConfig);
    setNavbarData(preserveImageUrls(newNavbarConfig));
  };

  const handleManagedServicesChange = (
    updatedServicePageData,
    serviceCategory,
    servicePageId
  ) => {
    console.log(
      `[OneForm] handleManagedServicesChange called for category '${serviceCategory}', page ID '${servicePageId}':`,
      updatedServicePageData
    );
    setManagedServicesData((prevServicesData) => {
      if (!prevServicesData || !prevServicesData[serviceCategory]) {
        console.error(
          `[OneForm] Invalid service category '${serviceCategory}' in handleManagedServicesChange.`
        );
        return prevServicesData;
      }
      const updatedCategoryPages = prevServicesData[serviceCategory].map(
        (page) => {
          if (page.id === servicePageId) {
            // Deep clone the updated data to preserve file objects
            const preservedData = deepCloneWithFiles(updatedServicePageData);
            console.log(
              "[OneForm] Preserved service data with files:",
              preservedData
            );
            return preservedData;
          }
          return page;
        }
      );
      const newData = {
        ...prevServicesData,
        [serviceCategory]: updatedCategoryPages,
      };
      // Update servicesDataForOldExport with the new data
      setServicesDataForOldExport(deepCloneWithFiles(newData));
      return newData;
    });
  };

  const handleThemeColorChange = (newColorsObject, newSitePaletteArray) => {
    setThemeColors(newColorsObject);
    if (newSitePaletteArray) {
      setSitePalette(newSitePaletteArray);
    }
    Object.keys(newColorsObject).forEach((key) => {
      const cssVarName = `--color-${key}`;
      document.documentElement.style.setProperty(
        cssVarName,
        newColorsObject[key]
      );
    });
  };

  const fetchShowcaseData = async () => {
    if (
      allServiceBlocksData &&
      allServiceBlocksData.blocks &&
      allServiceBlocksData.blocks.length > 0
    ) {
      console.log(
        "fetchShowcaseData: Data already exists for showcase, skipping fetch."
      );
      return;
    }
    if (loadingAllServiceBlocks) return;

    setLoadingAllServiceBlocks(true);
    try {
      const response = await fetch(
        "/personal/new/jsons/all_blocks_showcase.json"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch all_blocks_showcase.json");
      }
      const data = await response.json();
      setAllServiceBlocksData(data);
    } catch (error) {
      console.error("Error loading all_blocks_showcase.json:", error);
    } finally {
      setLoadingAllServiceBlocks(false);
    }
  };

  const handleShowcaseBlockConfigUpdate = (blockIndex, newConfig) => {
    setAllServiceBlocksData((prevData) => {
      if (!prevData || !prevData.blocks) return prevData;
      const updatedBlocks = prevData.blocks.map((block, index) => {
        if (index === blockIndex) {
          return { ...block, config: preserveImageUrls(newConfig) };
        }
        return block;
      });
      const updatedData = { ...prevData, blocks: updatedBlocks };

      return updatedData;
    });
  };

  const handleShowcaseFileChangeForBlock = (
    blockIndex,
    configKeyOrPathData,
    fileOrFileObject
  ) => {
    if (!fileOrFileObject) return;

    let newMediaConfig;
    const currentBlock = allServiceBlocksData.blocks[blockIndex];
    let existingMediaConfig;

    let isNestedPath =
      typeof configKeyOrPathData === "object" && configKeyOrPathData !== null;
    let fieldToUpdate = isNestedPath
      ? configKeyOrPathData.field
      : configKeyOrPathData;

    if (isNestedPath) {
      if (
        configKeyOrPathData.field === "pictures" &&
        currentBlock.config.items &&
        currentBlock.config.items[configKeyOrPathData.blockItemIndex]
      ) {
        existingMediaConfig =
          currentBlock.config.items[configKeyOrPathData.blockItemIndex]
            .pictures?.[configKeyOrPathData.pictureIndex];
      } else if (
        currentBlock.config.items &&
        currentBlock.config.items[configKeyOrPathData.blockItemIndex]
      ) {
        existingMediaConfig =
          currentBlock.config.items[configKeyOrPathData.blockItemIndex][
            fieldToUpdate
          ];
      } else {
        existingMediaConfig = currentBlock.config[fieldToUpdate];
      }
    } else {
      existingMediaConfig = currentBlock?.config?.[fieldToUpdate];
    }

    if (fileOrFileObject instanceof File) {
      if (
        existingMediaConfig &&
        typeof existingMediaConfig === "object" &&
        existingMediaConfig.url &&
        existingMediaConfig.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(existingMediaConfig.url);
      }
      const fileURL = URL.createObjectURL(fileOrFileObject);
      newMediaConfig = {
        file: fileOrFileObject,
        url: fileURL,
        name: fileOrFileObject.name,
        originalUrl:
          (typeof existingMediaConfig === "object"
            ? existingMediaConfig.originalUrl
            : typeof existingMediaConfig === "string"
              ? existingMediaConfig
              : null) ||
          `assets/showcase_uploads/generated/${fileOrFileObject.name}`,
      };
    } else if (
      typeof fileOrFileObject === "object" &&
      fileOrFileObject.url !== undefined
    ) {
      if (
        existingMediaConfig &&
        typeof existingMediaConfig === "object" &&
        existingMediaConfig.file &&
        existingMediaConfig.url &&
        existingMediaConfig.url.startsWith("blob:")
      ) {
        if (existingMediaConfig.url !== fileOrFileObject.url) {
          URL.revokeObjectURL(existingMediaConfig.url);
        }
      }
      newMediaConfig = fileOrFileObject;
    } else if (typeof fileOrFileObject === "string") {
      if (
        existingMediaConfig &&
        typeof existingMediaConfig === "object" &&
        existingMediaConfig.file &&
        existingMediaConfig.url &&
        existingMediaConfig.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(existingMediaConfig.url);
      }
      newMediaConfig = {
        file: null,
        url: fileOrFileObject,
        name: fileOrFileObject.split("/").pop(),
        originalUrl: fileOrFileObject,
      };
    } else {
      console.warn(
        "Unsupported file/URL type in handleShowcaseFileChangeForBlock",
        fileOrFileObject
      );
      return;
    }

    setAllServiceBlocksData((prevData) => {
      const updatedBlocks = prevData.blocks.map((block, index) => {
        if (index === blockIndex) {
          let newBlockConfig = { ...block.config };
          if (isNestedPath) {
            if (!newBlockConfig.items) newBlockConfig.items = [];
            while (
              newBlockConfig.items.length <= configKeyOrPathData.blockItemIndex
            ) {
              newBlockConfig.items.push({ pictures: [] });
            }
            if (configKeyOrPathData.field === "pictures") {
              if (
                !newBlockConfig.items[configKeyOrPathData.blockItemIndex]
                  .pictures
              ) {
                newBlockConfig.items[
                  configKeyOrPathData.blockItemIndex
                ].pictures = [];
              }
              while (
                newBlockConfig.items[configKeyOrPathData.blockItemIndex]
                  .pictures.length <= configKeyOrPathData.pictureIndex
              ) {
                newBlockConfig.items[
                  configKeyOrPathData.blockItemIndex
                ].pictures.push(null);
              }
              newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures[
                configKeyOrPathData.pictureIndex
              ] = newMediaConfig;
            } else {
              newBlockConfig.items[configKeyOrPathData.blockItemIndex] = {
                ...newBlockConfig.items[configKeyOrPathData.blockItemIndex],
                [fieldToUpdate]: newMediaConfig,
              };
            }
          } else {
            newBlockConfig[fieldToUpdate] = newMediaConfig;
          }
          return { ...block, config: newBlockConfig };
        }
        return block;
      });

      const updatedData = { ...prevData, blocks: updatedBlocks };

      return updatedData;
    });
  };

  const getShowcaseDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  const handleTabChange = (tabId) => {
    console.log(`[TabSwitch] Switching from ${activeTab} to ${tabId}`);

    if (activeTab !== tabId) {
      // Preserve all data before switching tabs
      setMainPageFormData((prev) => {
        console.log("[TabSwitch] Preserving main page data:", prev);
        const preserved = deepCloneWithFiles(prev);
        console.log(
          "[TabSwitch] Preserved main page data with files:",
          preserved
        );
        return preserved;
      });

      // For about page, ensure we're using the current state
      if (aboutPageJsonData) {
        console.log("[TabSwitch] Current about page data:", aboutPageJsonData);
        const preserved = deepCloneWithFiles(aboutPageJsonData);
        console.log(
          "[TabSwitch] Preserved about page data with files:",
          preserved
        );
        setAboutPageJsonData(preserved);
        setInitialAboutPageJsonData(preserved);
      }

      setAllServiceBlocksData((prev) => {
        console.log("[TabSwitch] Preserving showcase data:", prev);
        const preserved = deepCloneWithFiles(prev);
        console.log(
          "[TabSwitch] Preserved showcase data with files:",
          preserved
        );
        return preserved;
      });

      // Also preserve services data
      setManagedServicesData((prev) => {
        console.log("[TabSwitch] Preserving services data:", prev);
        const preserved = deepCloneWithFiles(prev);
        console.log(
          "[TabSwitch] Preserved services data with files:",
          preserved
        );
        return preserved;
      });

      console.log("[TabSwitch] Preserved all data during tab switch");
    }

    setActiveTab(tabId);
    if (
      tabId === "allServiceBlocks" &&
      !allServiceBlocksData &&
      !loadingAllServiceBlocks
    ) {
      fetchShowcaseData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
        <p>Loading data...</p>
      </div>
    );
  }

  if (!mainPageFormData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p>
          Failed to load form data. Please check console for errors or try
          refreshing.
        </p>
      </div>
    );
  }

  if (blockName && title) {
    console.log(
      `OneForm: Editing specific block: ${blockName}`,
      mainPageFormData
    );
    const singleBlockData = mainPageFormData[blockName] || {};
    const navbarDataForSingleBlock = mainPageFormData.navbar || {
      navLinks: [],
      logo: "",
      whiteLogo: "",
    };

    return (
      <div className="min-h-screen bg-gray-100 text-black">
        <div className="bg-gray-900 text-white p-3 shadow-md sticky top-0 z-50 flex justify-between items-center">
          <h1 className="text-xl font-medium">{title}</h1>
          <button
            onClick={() => handleSubmit()}
            type="button"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
          >
            Download JSON for {blockName}
          </button>
        </div>
        <div className="p-4">
          <MainPageForm
            key={`mainpage-${deviceViewport}`}
            formData={{
              [blockName]: singleBlockData,
              navbar: navbarDataForSingleBlock,
            }}
            setFormData={setMainPageFormData}
            singleBlockMode={blockName}
            themeColors={themeColors}
            sitePalette={sitePalette}
            initialFormData={initialFormDataForOldExport}
          />
        </div>
      </div>
    );
  }

  console.log("Rendering OneForm full editor with data:", mainPageFormData);
  const oneFormNavbarConfig = mainPageFormData.navbar || {
    navLinks: [],
    logo: "",
    whiteLogo: "",
  };

  const tabs = [
    { id: "mainPage", label: "Home" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "colors", label: "Color Palette" },
  ];

  return (
    <div className="min-h-screen bg-sky-100 text-black flex flex-col">
      <div className="flex flex-col">
        <div className="flex-grow">
          <div className="bg-slate-100 px-4 py-2 flex justify-between items-center shadow-md">
            <div className="flex">
              {tabs.map((tabInfo) => (
                <TabButton
                  key={tabInfo.id}
                  id={tabInfo.id}
                  label={tabInfo.label}
                  isActive={activeTab === tabInfo.id}
                  onClick={() => handleTabChange(tabInfo.id)}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              {/* Device Viewport Control - Now available for both mainPage and services */}
              {(activeTab === "mainPage" || activeTab === "services") && (
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-300">
                  <span className="text-sm font-medium text-gray-600 px-2">Preview:</span>
                  <button
                    onClick={() => setDeviceViewport('desktop')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                      deviceViewport === 'desktop' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🖥️ Desktop
                  </button>
                  <button
                    onClick={() => setDeviceViewport('mobile')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                      deviceViewport === 'mobile' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    📱 Mobile
                  </button>
                </div>
              )}

              {!isCustomDomain && (
                <OneFormAuthButton
                  formData={mainPageFormData}
                  themeColors={themeColors}
                  servicesData={servicesDataForOldExport}
                  aboutPageData={aboutPageJsonData}
                  showcaseData={allServiceBlocksData}
                  initialFormDataForOldExport={initialFormDataForOldExport}
                  initialServicesData={initialServicesData}
                  initialAboutPageJsonData={initialAboutPageJsonData}
                  initialAllServiceBlocksData={initialAllServiceBlocksData}
                  initialThemeColors={themeColors}
                />
              )}

              <button
                onClick={() => handleSubmit()}
                type="button"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
              >
                Download ZIP
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === "mainPage" && (
              <div className={`transition-all duration-500 ease-in-out ${
                deviceViewport === 'mobile' 
                  ? 'mx-auto bg-black rounded-[3rem] shadow-2xl flex flex-col items-center' 
                  : ''
              }`} style={
                deviceViewport === 'mobile' 
                  ? {
                      width: '400px',
                      height: '720px',
                      background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      border: '2px solid #333',
                      padding: '30px',
                    }
                  : {}
              }>
                {deviceViewport === 'mobile' && (
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                )}
                {deviceViewport === 'mobile' ? (
                  <IframePreview 
                    width={370} 
                    height={650} 
                    deviceViewport={deviceViewport}
                  >
                    <MainPageForm
                      key={`mainpage-${deviceViewport}`}
                      formData={mainPageFormData}
                      setFormData={handleMainPageFormChange}
                      navbarData={navbarData}
                      onNavbarChange={handleNavbarConfigChange}
                      themeColors={themeColors}
                      sitePalette={sitePalette}
                      initialFormData={initialFormDataForOldExport}
                      forcedPreviewStates={forcedPreviewStates}
                      onPreviewStateChange={handlePreviewStateChange}
                      deviceViewport={deviceViewport}
                    />
                  </IframePreview>
                ) : (
                  <ViewportProvider 
                    forcedWidth={390} 
                    forcedHeight={700} 
                    deviceViewport={deviceViewport}
                  >
                    <MainPageForm
                      key={`mainpage-${deviceViewport}`}
                      formData={mainPageFormData}
                      setFormData={handleMainPageFormChange}
                      navbarData={navbarData}
                      onNavbarChange={handleNavbarConfigChange}
                      themeColors={themeColors}
                      sitePalette={sitePalette}
                      initialFormData={initialFormDataForOldExport}
                      forcedPreviewStates={forcedPreviewStates}
                      onPreviewStateChange={handlePreviewStateChange}
                      deviceViewport={deviceViewport}
                    />
                  </ViewportProvider>
                )}
              </div>
            )}
            {activeTab === "services" && (
              <div className={`transition-all duration-500 ease-in-out ${
                deviceViewport === 'mobile' 
                  ? 'mx-auto bg-black rounded-[3rem] shadow-2xl flex flex-col items-center' 
                  : ''
              }`} style={
                deviceViewport === 'mobile' 
                  ? {
                      width: '400px',
                      height: '720px',
                      background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      border: '2px solid #333',
                      padding: '30px',
                    }
                  : {}
              }>
                {deviceViewport === 'mobile' && (
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                )}
                {deviceViewport === 'mobile' ? (
                  <IframePreview 
                    width={370} 
                    height={650} 
                    deviceViewport={deviceViewport}
                  >
                    <ServiceEditPage
                      key={`services-${deviceViewport}`}
                      themeColors={themeColors}
                      sitePalette={sitePalette}
                      servicesData={managedServicesData}
                      onServicesChange={handleManagedServicesChange}
                      initialServicesData={initialServicesData}
                      editingTarget={editingTarget}
                      onStartEditing={handleStartEditing}
                      forcedDeviceViewport={deviceViewport}
                    />
                  </IframePreview>
                ) : (
                  <ViewportProvider 
                    forcedWidth={390} 
                    forcedHeight={700} 
                    deviceViewport={deviceViewport}
                  >
                    <ServiceEditPage
                      key={`services-${deviceViewport}`}
                      themeColors={themeColors}
                      sitePalette={sitePalette}
                      servicesData={managedServicesData}
                      onServicesChange={handleManagedServicesChange}
                      initialServicesData={initialServicesData}
                      editingTarget={editingTarget}
                      onStartEditing={handleStartEditing}
                      forcedDeviceViewport={deviceViewport}
                    />
                  </ViewportProvider>
                )}
              </div>
            )}
            {activeTab === "about" && aboutPageJsonData && (
              <div className="relative bg-white overflow-hidden">
                <AboutBlock
                  readOnly={false}
                  aboutData={aboutPageJsonData}
                  onConfigChange={handleAboutConfigChange}
                  themeColors={themeColors}
                  sitePalette={sitePalette}
                />
              </div>
            )}
            {activeTab === "colors" && (
              <ColorEditor
                initialColors={themeColors}
                onColorChange={handleThemeColorChange}
              />
            )}
            {activeTab === "allServiceBlocks" && (
              <AllServiceBlocksTab
                allServiceBlocksData={allServiceBlocksData}
                loadingAllServiceBlocks={loadingAllServiceBlocks}
                activeEditShowcaseBlockIndex={activeEditShowcaseBlockIndex}
                setActiveEditShowcaseBlockIndex={
                  setActiveEditShowcaseBlockIndex
                }
                serviceBlockMap={serviceBlockMap}
                handleShowcaseBlockConfigUpdate={
                  handleShowcaseBlockConfigUpdate
                }
                getShowcaseDisplayUrl={getShowcaseDisplayUrl}
                handleShowcaseFileChangeForBlock={
                  handleShowcaseFileChangeForBlock
                }
                themeColors={themeColors}
                sitePalette={sitePalette}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Global BottomStickyEditPanel for all tabs */}
      {editingTarget && (
        <BottomStickyEditPanel
          ref={panelRef}
          isOpen={!!editingTarget}
          onClose={handleCloseEditing}
          activeBlockData={getActiveBlockData()}
          forcedPreviewStates={forcedPreviewStates}
          onPreviewStateChange={handlePreviewStateChange}
        />
      )}
    </div>
  );
};

OneForm.propTypes = {
  initialData: PropTypes.object,
  blockName: PropTypes.string,
  title: PropTypes.string,
};

export default OneForm; 