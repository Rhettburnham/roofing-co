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
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import OneFormAuthButton from "./auth/OneFormAuthButton";
import ServiceEditPage, {
  blockMap as importedServiceBlockMap,
} from "./ServiceEditPage";
import { MainPageForm } from "./MainPageForm";
import AboutBlock from "./MainPageBlocks/AboutBlock";
import { useConfig } from "../context/ConfigContext";
import BottomStickyEditPanel from "./BottomStickyEditPanel";
import PreviewStateController from "./common/PreviewStateController";
import BlockEditControl from './common/BlockEditControl'; // Import BlockEditControl

import Navbar from "./Navbar"; // Import Navbar for preview
import ColorEditor from "./ColorEditor"; // Import the new ColorEditor component
import { defaultColorDefinitions } from "./ColorEditor"; // Import defaultColorDefinitions
import ServicePage from "./ServicePage"; // For rendering all blocks

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

// Iframe component for true mobile preview
const IframePreview = ({ children }) => {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Basic HTML structure with a root div
      doc.open();
      doc.write('<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>');
      doc.close();

      // Copy all styles from parent to iframe
      Array.from(document.styleSheets).forEach(styleSheet => {
        try {
          if (styleSheet.cssRules) {
            const styleEl = doc.createElement('style');
            styleEl.textContent = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join(' ');
            doc.head.appendChild(styleEl);
          } else if (styleSheet.href) {
            const linkEl = doc.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = styleSheet.href;
            doc.head.appendChild(linkEl);
          }
        } catch (e) {
          console.warn('Could not copy stylesheet to iframe: ', e);
        }
      });
      
      setMountNode(doc.getElementById('root'));
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="Mobile Preview"
      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
    >
      {mountNode && ReactDOM.createPortal(children, mountNode)}
    </iframe>
  );
};
IframePreview.propTypes = {
  children: PropTypes.node.isRequired,
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
  const [initialSentimentReviewsData, setInitialSentimentReviewsData] = useState(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [initialServicesData, setInitialServicesData] = useState(null);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const navigate = useNavigate();

  const [previewViewport, setPreviewViewport] = useState('desktop');
  const [forcedPreviewStates, setForcedPreviewStates] = useState({});

  const isDevelopment = import.meta.env.DEV;

  const [serviceBlockMap, setServiceBlockMap] = useState({});
  const [activeTab, setActiveTab] = useState("main");

  // Ref to prevent duplicate fetches
  const fetchingRef = useRef(false);
  const dataLoadedRef = useRef(false);

  const [editingTarget, setEditingTarget] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingTarget?.blockName) {
      // Initialize block state if it doesn't exist
      setForcedPreviewStates(prev => {
        if (!prev[editingTarget.blockName]) {
          const newStates = { ...prev };
          if (editingTarget.blockName === 'Navbar') {
            newStates.Navbar = 'unscrolled';
          } else if (editingTarget.blockName === 'HeroBlock') {
            newStates.HeroBlock = 'neutral';
          }
          // Add other block initial states here if needed
          return newStates;
        }
        return prev;
      });
    }
  }, [editingTarget]);

  useEffect(() => {
    setServiceBlockMap(importedServiceBlockMap);
  }, [importedServiceBlockMap]);

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
            subPath = `img/main_page_images/${blockName || "global"}/${finalFileName}`;
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

            const currentPrefix = pathPrefix;
            
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

        const currentPrefix = pathPrefix;
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

      const zip = new JSZip();
      const rootPath = 'personal/old';
      const jsonsFolder = zip.folder(`${rootPath}/jsons`);
      const allAssets = [];

      const currentData = {
        combined_data: deepCloneWithFiles(mainPageFormData),
        nav: deepCloneWithFiles(navbarData),
        services: deepCloneWithFiles(managedServicesData),
        about_page: deepCloneWithFiles(aboutPageJsonData),
        sentiment_reviews: deepCloneWithFiles(sentimentReviewsData),
      };
      
      const contentTypes = {
        combined_data: 'main',
        nav: 'navbar',
        services: 'services',
        about_page: 'about',
        sentiment_reviews: 'reviews',
      };

      // --- Process all current data ---
      for(const [name, data] of Object.entries(currentData)) {
        if (data) {
          const contentType = contentTypes[name] || 'main';
          const cleanedJson = processDataForJson(data, allAssets, name, false, contentType, null, { pathPrefix: rootPath, collectNewOnly: false });
          jsonsFolder.file(`${name}.json`, JSON.stringify(cleanedJson, null, 2));
        }
      }
      
      // Add colors if changed
      const currentColorsForJson = {};
      Object.entries(themeColors).forEach(([key, value]) => {
        const snakeCaseKey = key.replace(/-/g, "_");
        currentColorsForJson[snakeCaseKey] = value;
      });
      const currentColorsJson = JSON.stringify(currentColorsForJson, null, 2);
      jsonsFolder.file("colors_output.json", currentColorsJson);
      
      // --- Package all assets into the ZIP ---
      for (const asset of allAssets) {
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

This package contains a complete snapshot of the website's updated content.

\`\`\`
/
├── personal/
│   │   ├── old/
│   │   │   ├── jsons/         # Complete set of updated JSON files
│   │   │   └── img/           # All image and video assets (new and existing)
│   │   │
└── README.md              # These instructions
\`\`\`

## Integration Instructions

1.  **Backup Existing Directory**: Before proceeding, create a backup of your project's existing \`/public/personal/old\` directory.

2.  **Replace Directory**:
    *   Delete the existing \`/public/personal/old\` directory from your project.
    *   Copy the \`personal/old\` folder from this ZIP into your project's \`/public/personal\` directory.

3.  **Verification**: After replacing the directory:
    *   Clear your browser cache and review the live site.
    *   Verify that all text and image changes appear correctly.

## How It Works

This package provides a self-contained, up-to-date version of all necessary content. The JSON files have been updated with your edits, and all required assets are included in their correct locations within the \`img\` folder.
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
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("Error creating ZIP file. See console for details.");
    }
  }, [
    mainPageFormData,
    navbarData,
    managedServicesData,
    aboutPageJsonData,
    themeColors,
    blockName,
    initialFormDataForOldExport,
    initialNavbarData,
    servicesDataForOldExport,
    initialAboutPageJsonData,
    initialSentimentReviewsData,
    sentimentReviewsData,
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
      
      return updatedData;
    });
  };

  const handleAboutConfigChange = (newAboutConfig) => {
    const preservedConfig = preserveImageUrls(newAboutConfig);
    setAboutPageJsonData(preservedConfig);
    setEditingTarget(prev => {
      if (prev && prev.key === 'about-block') {
          return { ...prev, config: preservedConfig };
      }
      return prev;
    });
  };

  const handleNavbarConfigChange = (newNavbarConfig) => {
    const preservedConfig = preserveImageUrls(newNavbarConfig);
    setNavbarData(preservedConfig);
    setEditingTarget(prev => {
        if (prev && prev.key === 'navbar') {
            return { ...prev, config: preservedConfig };
        }
        return prev;
    });
  };

  const handleManagedServicesChange = (
    updatedServicePageData,
    serviceCategory,
    servicePageId
  ) => {
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

  const handleTabChange = (tabId) => {
    if (activeTab !== tabId) {
      // Preserve all data before switching tabs
      setMainPageFormData((prev) => {
        const preserved = deepCloneWithFiles(prev);
        return preserved;
      });

      // For about page, ensure we're using the current state
      if (aboutPageJsonData) {
        const preserved = deepCloneWithFiles(aboutPageJsonData);
        setAboutPageJsonData(preserved);
        setInitialAboutPageJsonData(preserved);
      }

      // Also preserve services data
      setManagedServicesData((prev) => {
        const preserved = deepCloneWithFiles(prev);
        return preserved;
      });
    }

    setActiveTab(tabId);
  };

  const handleStartEditing = (target) => {
    console.log("[OneForm] Setting editing target:", target);
    if (editingTarget && target && editingTarget.key !== target.key) {
      // Logic to confirm discarding changes can be added here.
      // For now, we just switch.
      console.log(`[OneForm] Switching edit from ${editingTarget.key} to ${target.key}`);
    }
    setEditingTarget(target);
  };

  const handleStopEditing = () => {
    if (editingTarget?.onSave) {
      editingTarget.onSave(); // Persist changes before closing
    }
    setEditingTarget(null);
  };

  const handlePreviewStateChange = (blockName, state) => {
    setForcedPreviewStates(prev => ({ ...prev, [blockName]: state }));
  };

  // Centralized block manipulation functions
  const handleBlockConfigChange = (blockKey, newConfig, pageType = 'main', serviceContext = null) => {
    if (pageType === 'main') {
      setMainPageFormData(prevData => {
        const newBlocks = prevData.mainPageBlocks.map(block => 
          block.uniqueKey === blockKey ? { ...block, config: newConfig } : block
        );
        return { ...prevData, mainPageBlocks: newBlocks };
      });
    } else if (pageType === 'service' && serviceContext) {
      handleManagedServicesChange(
        {
          ...serviceContext.page,
          blocks: serviceContext.page.blocks.map(block => 
            block.uniqueKey === blockKey ? { ...block, config: newConfig } : block
          )
        },
        serviceContext.category,
        serviceContext.page.id
      );
    }
    
    // Also update the editing target if it's the one being changed
    setEditingTarget(prev => {
      if (prev && prev.key === blockKey) {
        return { ...prev, config: newConfig };
      }
      return prev;
    });
  };

  const handleUndoBlock = (blockKey, pageType = 'main', serviceContext = null) => {
    if (pageType === 'main') {
      const originalBlock = initialFormDataForOldExport.mainPageBlocks.find(b => b.uniqueKey === blockKey);
      if (originalBlock) {
        handleBlockConfigChange(blockKey, originalBlock.config, 'main');
      }
    } else if (pageType === 'service' && serviceContext) {
      const originalServicePage = initialServicesData.find(s => s.id === serviceContext.page.id && s.category === serviceContext.category);
      const originalBlock = originalServicePage?.blocks.find(b => b.uniqueKey === blockKey);
      if (originalBlock) {
        handleBlockConfigChange(blockKey, originalBlock.config, 'service', serviceContext);
      }
    }
    // TODO: Add logic for 'about' page
  };

  const handleSaveBlock = (blockKey, newConfig, pageType = 'main') => {
    // In our new model, changes are applied live via handleBlockConfigChange.
    // The "save" action at the block level is primarily for updating the 'last saved' state
    // which happens implicitly. We can add more explicit 'save' logic here if needed,
    // e.g., for optimistic UI updates. For now, this can be a no-op or just log.
    console.log(`[OneForm] Block ${blockKey} saved.`);
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
            formData={{
              mainPageBlocks: mainPageFormData.mainPageBlocks.filter(b => b.blockName === blockName),
              navbar: navbarDataForSingleBlock,
              previewViewport,
              forcedPreviewStates,
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

  const onStartEditingAbout = () => {
    handleStartEditing({
        type: 'about',
        key: 'about-block',
        blockName: 'AboutPage',
        config: aboutPageJsonData,
        onPanelChange: handleAboutConfigChange,
        onUndo: () => handleAboutConfigChange(initialAboutPageJsonData),
        onSave: () => {}, // No-op, changes are live
        tabsConfig: AboutBlock.tabsConfig(aboutPageJsonData, handleAboutConfigChange, themeColors, sitePalette),
        themeColors,
        sitePalette,
    });
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "mainPage":
        return (
          <MainPageForm
            formData={{
              ...mainPageFormData,
              previewViewport,
              forcedPreviewStates,
            }}
            setFormData={handleMainPageFormChange}
            navbarData={navbarData}
            onNavbarChange={handleNavbarConfigChange}
            themeColors={themeColors}
            sitePalette={sitePalette}
            initialFormData={initialFormDataForOldExport}
            editingTarget={editingTarget}
            onStartEditing={handleStartEditing}
            onBlockConfigChange={handleBlockConfigChange}
            onUndoBlock={handleUndoBlock}
            onSaveBlock={handleSaveBlock}
            previewViewport={previewViewport}
            forcedPreviewStates={forcedPreviewStates}
          />
        );
      case "services":
        return (
          <ServiceEditPage
            servicesData={managedServicesData}
            onServicesChange={handleManagedServicesChange}
            themeColors={themeColors}
            sitePalette={sitePalette}
            initialServicesData={initialServicesData}
            editingTarget={editingTarget}
            onStartEditing={handleStartEditing}
            onBlockConfigChange={handleBlockConfigChange}
            onUndoBlock={handleUndoBlock}
            onSaveBlock={handleSaveBlock}
            previewViewport={previewViewport}
            forcedPreviewStates={forcedPreviewStates}
          />
        );
      case "about":
        if (aboutPageJsonData) {
          const isEditing = editingTarget?.key === 'about-block';
          return (
              <div className="relative bg-white overflow-hidden p-4">
                   <div className={`relative border ${isEditing ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                      {!isEditing && (
                          <BlockEditControl onToggleEdit={onStartEditingAbout} isEditing={false} />
                      )}
                      <AboutBlock
                          readOnly={false}
                          aboutData={aboutPageJsonData}
                          onConfigChange={handleAboutConfigChange}
                          themeColors={themeColors}
                          sitePalette={sitePalette}
                          isEditing={isEditing}
                      />
                   </div>
              </div>
          );
        }
        return null;
      case "colors":
        return (
          <ColorEditor
            initialColors={themeColors}
            onColorChange={handleThemeColorChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen  text-black flex flex-col">
      <div className="flex flex-col">
        <div className="flex-grow">
          <div className="bg-slate-100 px-4 py-2 flex justify-between items-center shadow-md">
            <div className="flex items-center">
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
              <div className="ml-6">
                <PreviewStateController
                  label="Viewport"
                  options={[
                    { label: "Desktop", value: "desktop" },
                    { label: "Mobile", value: "mobile" },
                  ]}
                  value={previewViewport}
                  onChange={setPreviewViewport}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!isCustomDomain && (
                <OneFormAuthButton
                  formData={mainPageFormData}
                  themeColors={themeColors}
                  servicesData={servicesDataForOldExport}
                  aboutPageData={aboutPageJsonData}
                  initialFormDataForOldExport={initialFormDataForOldExport}
                  initialServicesData={initialServicesData}
                  initialAboutPageJsonData={initialAboutPageJsonData}
                  initialThemeColors={themeColors}
                  sentimentReviewsData={sentimentReviewsData}
                  initialSentimentReviewsData={initialSentimentReviewsData}
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
            {previewViewport === 'mobile' ? (
              <div className="bg-gray-800 py-12 flex justify-center items-center">
                <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[864px] w-[410px] shadow-xl">
                  <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                  <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                  <div className="rounded-[2rem] overflow-hidden w-[382px] h-[836px] bg-white dark:bg-gray-800">
                    <IframePreview>
                      {renderActiveTabContent()}
                    </IframePreview>
                  </div>
                </div>
              </div>
            ) : (
              renderActiveTabContent()
            )}
          </div>
        </div>
      </div>

      <BottomStickyEditPanel
        isOpen={!!editingTarget}
        onClose={handleStopEditing}
        onConfirm={handleStopEditing}
        activeBlockData={editingTarget}
        forcedPreviewStates={forcedPreviewStates}
        onPreviewStateChange={handlePreviewStateChange}
      />
    </div>
  );
};

OneForm.propTypes = {
  initialData: PropTypes.object,
  blockName: PropTypes.string,
  title: PropTypes.string,
};

export default OneForm;