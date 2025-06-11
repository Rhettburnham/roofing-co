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
import PropTypes from "prop-types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import OneFormAuthButton from "./auth/OneFormAuthButton";
import ServiceEditPage, {
  blockMap as importedServiceBlockMap,
} from "./ServiceEditPage";
import MainPageForm from "./MainPageForm";
import AboutBlock from "./MainPageBlocks/AboutBlock";
import { useConfig } from "../context/ConfigContext";
import AllServiceBlocksTab from "./AllServiceBlocksTab"; // Import the new component

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
  const [allServiceBlocksData, setAllServiceBlocksData] = useState(null);
  const [initialAllServiceBlocksData, setInitialAllServiceBlocksData] =
    useState(null);
  const [loadingAllServiceBlocks, setLoadingAllServiceBlocks] = useState(false);
  const [activeEditShowcaseBlockIndex, setActiveEditShowcaseBlockIndex] =
    useState(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [initialServicesData, setInitialServicesData] = useState(null);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const navigate = useNavigate();

  const isDevelopment = import.meta.env.DEV;

  const [serviceBlockMap, setServiceBlockMap] = useState({});
  const [activeTab, setActiveTab] = useState("mainPage");

  // Ref to prevent duplicate fetches
  const fetchingRef = useRef(false);
  const dataLoadedRef = useRef(false);

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
      console.log(
        "[OneForm] fetchAllData initiated. InitialData provided:",
        !!initialData,
        "BlockName:",
        blockName
      );
      setIsLoading(true);
      setError(null);

      let currentMainPageData = null;
      let rawServicesSource = null;
      let currentAboutData = null;
      let currentNavbarData = null;
      let currentThemeColorsValue = null;
      let currentAllServiceBlocks = null;
      let currentSitePaletteValue = []; // Initialize for sitePalette

      try {
        if (initialData) {
          console.log("[OneForm] Using initialData prop as primary source.");
          currentMainPageData = initialData.mainPageBlocks
            ? { mainPageBlocks: initialData.mainPageBlocks }
            : null;
          rawServicesSource = initialData.services || null;
          currentAboutData = initialData.aboutPageData || null;
          currentNavbarData = initialData.navbarData || null;
          currentThemeColorsValue = initialData.themeColors || null;
          currentSitePaletteValue = initialData.sitePalette || []; // Get sitePalette from initialData if available
          currentAllServiceBlocks = initialData.allServiceBlocksData || null;
          if (
            blockName &&
            !currentMainPageData &&
            !rawServicesSource &&
            !currentAboutData &&
            !currentNavbarData
          ) {
            console.log(
              `[OneForm] initialData likely for a single block ('${blockName}'), not full structure.`
            );
          }
        }

        // Use config theme colors if not provided in initialData
        if (!currentThemeColorsValue) {
          currentThemeColorsValue = configThemeColors;
        }

        // If we have colors from config, use them
        if (configThemeColors) {
          console.log("[OneForm] Using colors from config context:", configThemeColors);
          currentThemeColorsValue = configThemeColors;
        }

        if (currentThemeColorsValue) {
          console.log("[OneForm] Setting theme colors:", currentThemeColorsValue);
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
          console.log(
            "[OneForm] Navbar data sourced from initialData.",
            currentNavbarData
          );
          setNavbarData(currentNavbarData);
          setInitialNavbarData(JSON.parse(JSON.stringify(currentNavbarData)));
        } else if (!blockName) {
          console.log("[OneForm] Fetching navbar data (nav.json)...");
          try {
            const navResponse = await fetch("/personal/old/jsons/nav.json");
            if (navResponse.ok) {
              const navDataFetched = await navResponse.json();
              const initializedNavData =
                initializeMediaFieldsRecursive(navDataFetched);
              setNavbarData(initializedNavData);
              setInitialNavbarData(JSON.parse(JSON.stringify(navDataFetched)));
              console.log(
                "[OneForm] Successfully fetched /personal/old/jsons/nav.json."
              );
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
              setInitialNavbarData(JSON.parse(JSON.stringify(fallbackNavbar)));
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
            setInitialNavbarData(JSON.parse(JSON.stringify(fallbackNavbar)));
          }
        }

        if (currentMainPageData) {
          console.log("[OneForm] Main page data sourced.", currentMainPageData);
          setMainPageFormData(currentMainPageData);
          setInitialFormDataForOldExport(
            JSON.parse(JSON.stringify(currentMainPageData))
          );
        } else if (!blockName) {
          console.log(
            "[OneForm] Fetching main page data (combined_data.json)..."
          );
        }

        if (currentAboutData) {
          console.log("[OneForm] About page data sourced.", currentAboutData);
          setAboutPageJsonData(currentAboutData);
          setInitialAboutPageJsonData(
            JSON.parse(JSON.stringify(currentAboutData))
          );
        } else if (!blockName) {
          console.log(
            "[OneForm] Fetching about page data (/personal/new/jsons/about_page.json)..."
          );
          try {
            const aboutResponse = await fetch(
              "/personal/new/jsons/about_page.json"
            );
            if (aboutResponse.ok) {
              const aboutDataFetched = await aboutResponse.json();
              setAboutPageJsonData(aboutDataFetched);
              setInitialAboutPageJsonData(
                JSON.parse(JSON.stringify(aboutDataFetched))
              );
              console.log(
                "[OneForm] Successfully fetched /personal/new/jsons/about_page.json."
              );
            } else {
              console.error(
                "[OneForm] Failed to fetch /personal/new/jsons/about_page.json. Status:",
                aboutResponse.status
              );
              // Fallback to the alternative data source
              try {
                const aboutJsonResponse = await fetch(
                  "/data/raw_data/step_3/about_page.json"
                );
                if (aboutJsonResponse.ok) {
                  const aboutJson = await aboutJsonResponse.json();
                  setAboutPageJsonData(aboutJson);
                  setInitialAboutPageJsonData(
                    JSON.parse(JSON.stringify(aboutJson))
                  );
                  console.log(
                    "OneForm: Loaded about_page.json data from fallback source:",
                    aboutJson
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
              "[OneForm] Error fetching /personal/new/jsons/about_page.json:",
              fetchError
            );
            // Fallback to the alternative data source
            try {
              const aboutJsonResponse = await fetch(
                "/data/raw_data/step_3/about_page.json"
              );
              if (aboutJsonResponse.ok) {
                const aboutJson = await aboutJsonResponse.json();
                setAboutPageJsonData(aboutJson);
                setInitialAboutPageJsonData(
                  JSON.parse(JSON.stringify(aboutJson))
                );
                console.log(
                  "OneForm: Loaded about_page.json data from fallback source after error:",
                  aboutJson
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
          console.log("[OneForm] Fetching services.json...");
          try {
            const servicesResponse = await fetch(
              "/personal/new/jsons/services.json"
            );
            if (servicesResponse.ok) {
              rawServicesSource = await servicesResponse.json();
              console.log(
                "[OneForm] Successfully fetched /personal/new/jsons/services.json."
              );
            } else {
              console.error(
                "[OneForm] Failed to fetch /personal/new/jsons/services.json. Status:",
                servicesResponse.status
              );
              rawServicesSource = { commercial: [], residential: [] };
            }
          } catch (fetchError) {
            console.error(
              "[OneForm] Error fetching /personal/new/jsons/services.json:",
              fetchError
            );
            rawServicesSource = { commercial: [], residential: [] };
          }
        }

        if (rawServicesSource) {
          setServicesDataForOldExport(
            JSON.parse(JSON.stringify(rawServicesSource))
          );
          const initializedServices =
            initializeMediaFieldsRecursive(rawServicesSource);
          setManagedServicesData(initializedServices);
          console.log("[OneForm] Managed services data initialized and set.");
        } else {
          console.warn(
            "[OneForm] No raw service data available. ManagedServicesData will be null or default."
          );
          setServicesDataForOldExport({ commercial: [], residential: [] });
          setManagedServicesData({ commercial: [], residential: [] });
        }

        if (currentAllServiceBlocks) {
          console.log(
            "[OneForm] AllServiceBlocks data sourced from initialData."
          );
          setAllServiceBlocksData(currentAllServiceBlocks);
          setInitialAllServiceBlocksData(
            JSON.parse(JSON.stringify(currentAllServiceBlocks))
          );
        } else if (!blockName) {
          console.log("[OneForm] Fetching all_blocks_showcase.json...");
          try {
            const showcaseResponse = await fetch(
              "/personal/new/jsons/all_blocks_showcase.json"
            );
            if (showcaseResponse.ok) {
              const showcaseData = await showcaseResponse.json();
              setAllServiceBlocksData(showcaseData);
              setInitialAllServiceBlocksData(
                JSON.parse(JSON.stringify(showcaseData))
              );
              console.log(
                "[OneForm] Successfully fetched /personal/new/jsons/all_blocks_showcase.json."
              );
            } else {
              console.error(
                "[OneForm] Failed to fetch /personal/new/jsons/all_blocks_showcase.json. Status:",
                showcaseResponse.status
              );
              setAllServiceBlocksData({ blocks: [] });
              setInitialAllServiceBlocksData({ blocks: [] });
            }
          } catch (fetchError) {
            console.error(
              "[OneForm] Error fetching /personal/new/jsons/all_blocks_showcase.json:",
              fetchError
            );
            setAllServiceBlocksData({ blocks: [] });
            setInitialAllServiceBlocksData({ blocks: [] });
          }
        }

        if (!currentMainPageData && !blockName) {
          console.log("[OneForm] Fetching combined_data.json as a fallback...");
          try {
            // Check if we're on a custom domain
            const customDomain =
              window.location.hostname !== "roofing-co.pages.dev" &&
              window.location.hostname !== "roofing-www.pages.dev" &&
              window.location.hostname !== "localhost";
            setIsCustomDomain(customDomain);

            if (customDomain) {
              console.log(
                "[OneForm] On custom domain:",
                window.location.hostname
              );
              try {
                // Fetch the domain-specific config
                const domainConfigResponse = await fetch("/api/public/config");
                console.log(
                  "[OneForm] Domain config response status:",
                  domainConfigResponse.status
                );

                if (domainConfigResponse.ok) {
                  const domainData = await domainConfigResponse.json();
                  console.log(
                    "[OneForm] Successfully loaded domain config data"
                  );
                  setMainPageFormData(domainData);
                  setInitialFormDataForOldExport(
                    JSON.parse(JSON.stringify(domainData))
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
              console.log("[OneForm] Checking authentication status...");
              const authResponse = await fetch("/api/auth/status", {
                credentials: "include",
              });
              console.log(
                "[OneForm] Auth response status:",
                authResponse.status
              );

              const authData = await authResponse.json();
              console.log("[OneForm] Auth data received:", authData);

              if (authData.isAuthenticated) {
                console.log(
                  "[OneForm] User is authenticated. Config ID:",
                  authData.configId
                );
                try {
                  // Fetch the user's custom config
                  console.log(
                    "[OneForm] Fetching custom config from:",
                    `/api/config/load`
                  );
                  const customConfigResponse = await fetch(`/api/config/load`, {
                    credentials: "include",
                  });
                  console.log(
                    "[OneForm] Custom config response status:",
                    customConfigResponse.status
                  );

                  if (customConfigResponse.ok) {
                    const configData = await customConfigResponse.json();
                    console.log(
                      "[OneForm] Successfully loaded custom config data"
                    );
                    if (configData.combined_data) {
                      setMainPageFormData(configData.combined_data);
                      setInitialFormDataForOldExport(
                        JSON.parse(JSON.stringify(configData.combined_data))
                      );
                    }
                    if (configData.about_page) {
                      setAboutPageJsonData(configData.about_page);
                      setInitialAboutPageJsonData(
                        JSON.parse(JSON.stringify(configData.about_page))
                      );
                    }
                    if (configData.all_blocks_showcase) {
                      setAllServiceBlocksData(configData.all_blocks_showcase);
                      setInitialAllServiceBlocksData(
                        JSON.parse(
                          JSON.stringify(configData.all_blocks_showcase)
                        )
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
              } else {
                console.log("[OneForm] User is not authenticated");
              }
            }

            // Fallback to local files if all else fails
            const combinedResponse = await fetch(
              "/personal/old/jsons/combined_data.json"
            );
            if (combinedResponse.ok) {
              const fetchedMainData = await combinedResponse.json();
              setMainPageFormData(fetchedMainData);
              console.log("[OneForm] Fallback: loaded combined_data.json");
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
        setAllServiceBlocksData({ blocks: [] });
      } finally {
        setIsLoading(false);
        setIsInitialLoadComplete(true);
        fetchingRef.current = false;
        console.log("[OneForm] fetchAllData finished.");
      }
    };

    fetchAllData();
  }, []); // Empty dependency array - only run once

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
    serviceContext = null
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
                serviceContext
              ),
            };
          }
          return processDataForJson(
            block,
            assetsToCollect,
            parentBlockName,
            false,
            contentType,
            serviceContext
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
            serviceData
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
          serviceContext
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

      // Function to generate appropriate path based on content type and block (matching OLD structure)
      const generateAssetPath = (
        fileName,
        blockName,
        contentType,
        serviceData = null,
        originalUrl = null
      ) => {
        // Try to preserve original filename
        const finalFileName = getOriginalFileName(
          fileName,
          originalUrl,
          contentType,
          blockName
        );

        switch (contentType) {
          case "main":
            // Match the old structure: /personal/old/img/main_page_images/
            return `personal/old/img/main_page_images/${blockName || "global"}/${finalFileName}`;

          case "navbar":
            // Match the old structure: /personal/old/img/nav/
            return `personal/old/img/nav/${finalFileName}`;

          case "about":
            // Match the old structure: /personal/old/img/about_page/
            if (blockName === "AboutBlock") {
              // Determine subfolder based on file type or name
              if (
                finalFileName.toLowerCase().includes("team") ||
                finalFileName.toLowerCase().includes("member") ||
                finalFileName.toLowerCase().includes("roofer") ||
                finalFileName.toLowerCase().includes("foreman")
              ) {
                return `personal/old/img/about_page/team/${finalFileName}`;
              } else if (
                finalFileName.toLowerCase().includes("video") ||
                finalFileName.toLowerCase().includes(".mp4") ||
                finalFileName.toLowerCase().includes(".webm")
              ) {
                return `personal/old/img/about_page/videos/${finalFileName}`;
              }
              return `personal/old/img/about_page/${finalFileName}`;
            }
            return `personal/old/img/about_page/${finalFileName}`;

          case "services":
            // Match the old structure: /personal/old/img/services/
            if (serviceData) {
              const category = serviceData.category || "general";
              const serviceId = serviceData.id || "unknown";
              const serviceSlug = `${category}_${serviceId}`;

              if (
                finalFileName.toLowerCase().includes("video") ||
                finalFileName.toLowerCase().includes(".mp4") ||
                finalFileName.toLowerCase().includes(".webm")
              ) {
                return `personal/old/img/services/${serviceSlug}/assets/videos/${finalFileName}`;
              }
              return `personal/old/img/services/${serviceSlug}/assets/images/${finalFileName}`;
            }
            // Fallback if no service data
            const serviceFolder = blockName || "general";
            if (
              finalFileName.toLowerCase().includes("video") ||
              finalFileName.toLowerCase().includes(".mp4") ||
              finalFileName.includes(".webm")
            ) {
              return `personal/old/img/services/${serviceFolder}/assets/videos/${finalFileName}`;
            }
            return `personal/old/img/services/${serviceFolder}/assets/images/${finalFileName}`;

          case "showcase":
            // Match the old structure: /personal/old/img/all_dev/
            return `personal/old/img/all_dev/assets/images/${finalFileName}`;

          default:
            return `personal/old/img/global_assets/${finalFileName}`;
        }
      };

      // Handle images array (new structure used by HeroBlock and other blocks)
      if (Array.isArray(originalDataNode) && parentBlockName) {
        return originalDataNode.map((imageItem, imageIndex) => {
          if (imageItem && typeof imageItem === "object") {
            const originalFileName =
              imageItem.name ||
              imageItem.originalUrl?.split("/").pop() ||
              `image_${imageIndex}`;
            const imagePath = generateAssetPath(
              originalFileName,
              parentBlockName,
              contentType,
              serviceContext,
              imageItem.originalUrl
            );

            // If there's a file, collect it for the ZIP
            if (imageItem.file instanceof File) {
              assetsToCollect.push({
                path: imagePath,
                file: imageItem.file,
                type: "file",
                originalName: originalFileName,
                serviceContext: serviceContext,
              });
            } else if (
              imageItem.url &&
              typeof imageItem.url === "string" &&
              imageItem.url.startsWith("blob:")
            ) {
              // Combined approach: handle both file objects and blob URLs
              if (imageItem.file) {
                assetsToCollect.push({
                  path: imagePath,
                  file: imageItem.file,
                  type: "file",
                  originalName: originalFileName,
                  serviceContext: serviceContext,
                });
              } else {
                console.log(
                  `[OneForm] Fetching image from blob URL: ${imageItem.url}`
                );
                assetsToCollect.push({
                  path: imagePath,
                  url: imageItem.url,
                  type: "blob",
                  originalName: originalFileName,
                  serviceContext: serviceContext,
                  name: originalFileName,
                });
              }
            } else if (
              imageItem.url &&
              typeof imageItem.url === "string" &&
              !imageItem.url.startsWith("http")
            ) {
              // Local asset that needs to be copied
              assetsToCollect.push({
                path: imagePath,
                url: imageItem.url,
                type: "local",
                originalName: originalFileName,
                serviceContext: serviceContext,
              });
            }

            // Return cleaned image object for JSON (create new object, don't mutate original)
            return {
              id: imageItem.id,
              url: `/${imagePath}`, // Add leading slash for absolute path
              name: imagePath.split("/").pop(), // Use the final processed filename
              originalUrl: imageItem.originalUrl || `/${imagePath}`,
              // Note: We deliberately exclude 'file' from the JSON output to avoid circular references
            };
          }
          return imageItem;
        });
      }

      // Handle individual image objects
      if (
        originalDataNode.file instanceof File ||
        (originalDataNode.url && originalDataNode.url.startsWith("blob:"))
      ) {
        const originalFileName =
          originalDataNode.name || originalDataNode.file?.name || "image";
        const imagePath = generateAssetPath(
          originalFileName,
          parentBlockName,
          contentType,
          serviceContext,
          originalDataNode.originalUrl
        );

        if (originalDataNode.file instanceof File) {
          assetsToCollect.push({
            path: imagePath,
            file: originalDataNode.file,
            type: "file",
            originalName: originalFileName,
            serviceContext: serviceContext,
          });
        } else if (
          originalDataNode.url &&
          originalDataNode.url.startsWith("blob:")
        ) {
          // Combined approach: handle both file objects and blob URLs
          if (originalDataNode.file) {
            assetsToCollect.push({
              path: imagePath,
              file: originalDataNode.file,
              type: "file",
              originalName: originalFileName,
              serviceContext: serviceContext,
            });
          } else {
            console.log(
              `[OneForm] Fetching image from blob URL: ${originalDataNode.url}`
            );
            assetsToCollect.push({
              path: imagePath,
              url: originalDataNode.url,
              type: "blob",
              originalName: originalFileName,
              serviceContext: serviceContext,
              name: originalFileName,
            });
          }
        }

        // Return cleaned object for JSON (create new object, don't mutate original)
        return {
          id: originalDataNode.id,
          url: `/${imagePath}`,
          name: imagePath.split("/").pop(),
          originalUrl: originalDataNode.originalUrl || `/${imagePath}`,
          // Note: We deliberately exclude 'file' from the JSON output to avoid circular references
        };
      }

      // Handle legacy heroImageFile - preserve this functionality
      if (
        parentBlockName === "HeroBlock" &&
        originalDataNode.heroImageFile instanceof File
      ) {
        const fileName = originalDataNode.heroImageFile.name;
        const imagePath = generateAssetPath(
          fileName,
          "HeroBlock",
          contentType,
          serviceContext,
          originalDataNode.originalUrl ||
            originalDataNode._heroImageOriginalPathFromProps
        );

        assetsToCollect.push({
          path: imagePath,
          file: originalDataNode.heroImageFile,
          type: "file",
          originalName: fileName,
          serviceContext: serviceContext,
        });

        // Return cleaned object for JSON (create new object without mutating original)
        const cleaned = { ...originalDataNode };
        delete cleaned.heroImageFile;
        delete cleaned.originalUrl;
        delete cleaned._heroImageOriginalPathFromProps;
        cleaned.heroImage = `/${imagePath}`;

        return cleaned;
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
              serviceContext
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
              serviceContext
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
              serviceContext
            );
          } else {
            newObj[key] = processDataForJson(
              originalDataNode[key],
              assetsToCollect,
              parentBlockName,
              false,
              contentType,
              serviceContext
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

      console.log(
        "[OneForm] Starting download process. Original mainPageFormData:",
        mainPageFormData
      );

      const zip = new JSZip();
      let assetsToCollect = [];

      // Create deep copies of data to avoid mutating the original state
      const combinedDataCopy = deepCloneWithFiles(
        mainPageFormData.combined_data || mainPageFormData
      );
      const managedServicesDataCopy = managedServicesData
        ? deepCloneWithFiles(managedServicesData)
        : null;
      const navbarDataCopy = navbarData ? deepCloneWithFiles(navbarData) : null;
      const aboutPageJsonDataCopy = aboutPageJsonData
        ? deepCloneWithFiles(aboutPageJsonData)
        : null;
      const allServiceBlocksDataCopy = allServiceBlocksData
        ? deepCloneWithFiles(allServiceBlocksData)
        : null;

      console.log(
        "[OneForm] Created data copies for processing. Combined data copy:",
        combinedDataCopy
      );

      // Process combined_data.json
      const cleanedCombinedData = processDataForJson(
        combinedDataCopy,
        assetsToCollect,
        null,
        false,
        "main"
      );
      zip.file(
        "jsons/combined_data.json",
        JSON.stringify(cleanedCombinedData, null, 2)
      );

      // Process nav.json if available
      if (navbarDataCopy && !blockName) {
        const cleanedNavbarData = processDataForJson(
          navbarDataCopy,
          assetsToCollect,
          "Navbar",
          false,
          "navbar"
        );
        zip.file("jsons/nav.json", JSON.stringify(cleanedNavbarData, null, 2));
      }

      // Process services.json if available - combined approach
      if (managedServicesDataCopy && !blockName) {
        const cleanedServicesData = processDataForJson(
          managedServicesDataCopy,
          assetsToCollect,
          null,
          false,
          "services"
        );
        console.log("[OneForm] Saving services data:", cleanedServicesData);
        zip.file(
          "jsons/services.json",
          JSON.stringify(cleanedServicesData, null, 2)
        );
      }

      // Process about_page.json if available
      if (aboutPageJsonDataCopy && !blockName) {
        const cleanedAboutData = processDataForJson(
          aboutPageJsonDataCopy,
          assetsToCollect,
          "AboutBlock"
        );
        console.log("[OneForm] Saving about page data:", cleanedAboutData);
        zip.file(
          "jsons/about_page.json",
          JSON.stringify(cleanedAboutData, null, 2)
        );
      }

      // Process all_blocks_showcase.json if available
      if (allServiceBlocksDataCopy && !blockName) {
        const cleanedShowcaseData = processDataForJson(
          allServiceBlocksDataCopy,
          assetsToCollect,
          null,
          false,
          "showcase"
        );
        zip.file(
          "jsons/all_blocks_showcase.json",
          JSON.stringify(cleanedShowcaseData, null, 2)
        );
      }

      // Process colors_output.json
      if (themeColors) {
        const colorsForJson = {};
        // Convert kebab-case to snake_case for the JSON output
        Object.entries(themeColors).forEach(([key, value]) => {
          const snakeCaseKey = key.replace(/-/g, "_");
          colorsForJson[snakeCaseKey] = value;
        });
        console.log("[OneForm] Saving colors data:", colorsForJson);
        zip.file(
          "jsons/colors_output.json",
          JSON.stringify(colorsForJson, null, 2)
        );
      }

      // Process all collected assets
      console.log("[OneForm] Processing collected assets:", assetsToCollect);

      // Process assets and add them to the ZIP
      for (const asset of assetsToCollect) {
        try {
          if (asset.type === "file" && asset.file instanceof File) {
            console.log(`[OneForm] Adding file to ZIP: ${asset.path}`);
            zip.file(asset.path, asset.file);
          } else if (asset.type === "blob" && asset.url) {
            console.log(`[OneForm] Fetching blob URL: ${asset.url}`);
            const response = await fetch(asset.url);
            if (!response.ok) {
              throw new Error(
                `Failed to fetch blob ${asset.url}: ${response.status} ${response.statusText}`
              );
            }
            const blob = await response.blob();
            console.log(`[OneForm] Adding blob to ZIP: ${asset.path}`);
            zip.file(asset.path, blob);
          } else if (asset.type === "local" && asset.url) {
            console.log(`[OneForm] Fetching local file: ${asset.url}`);
            const response = await fetch(asset.url);
            if (!response.ok) {
              throw new Error(
                `Failed to fetch local file ${asset.url}: ${response.status} ${response.statusText}`
              );
            }
            const blob = await response.blob();
            console.log(`[OneForm] Adding local file to ZIP: ${asset.path}`);
            zip.file(asset.path, blob);
          }
        } catch (error) {
          console.error(
            `[OneForm] Error processing asset ${asset.path}:`,
            error
          );
        }
      }

      // Create a manifest file to track changes
      const manifest = {
        generated: new Date().toISOString(),
        structure:
          "mirrors /personal/old/ directory structure with original filename preservation",
        totalAssets: assetsToCollect.length,
        assetsByType: {
          uploaded: assetsToCollect.filter((a) => a.type === "file").length,
          modified: assetsToCollect.filter((a) => a.type === "blob").length,
          copied: assetsToCollect.filter((a) => a.type === "local").length,
        },
        directories: {
          "jsons/": "Updated JSON configuration files",
          "personal/old/img/main_page_images/":
            "Home page block images organized by block type",
          "personal/old/img/nav/": "Navigation bar logos and icons",
          "personal/old/img/about_page/":
            "About page images (team photos, videos, etc.)",
          "personal/old/img/services/":
            "Service page images organized by service type",
          "personal/old/img/all_dev/": "Development/showcase block images",
        },
        assets: assetsToCollect.map((asset) => ({
          path: asset.path,
          type: asset.type,
          originalName: asset.originalName || "unknown",
          description:
            asset.type === "file"
              ? "New upload"
              : asset.type === "blob"
                ? "Modified existing"
                : "Copied from current",
        })),
        note: "Original filenames are preserved when possible. Uploaded images replace existing ones with matching names in the old structure.",
      };

      zip.file("manifest.json", JSON.stringify(manifest, null, 2));

      // Create README with instructions
      const readmeContent = `# Website Content Update Package

Generated: ${new Date().toISOString()}

## Structure

This package contains updated website content organized to mirror the /personal/old/ directory structure with original filename preservation:

\`\`\`
jsons/                     # Updated JSON configuration files
├── combined_data.json     # Main page blocks configuration
├── nav.json               # Navigation bar configuration
├── services.json          # Service pages configuration  
├── about_page.json        # About page configuration
├── all_blocks_showcase.json # Development blocks showcase
└── colors_output.json     # Color theme configuration

personal/old/              # OLD structure assets (preserves original filenames)
└── img/                   # All image and video assets
    ├── main_page_images/  # Home page content
    │   ├── HeroBlock/     # Hero section images
    │   ├── AboutBlock/    # About section images
    │   ├── ServiceSliderBlock/ # Service slider images
    │   └── [other blocks]/ # Other home page blocks
    ├── nav/               # Navigation bar content
    │   ├── logo.png       # Main logo
    │   └── logo_white.png # White logo for dark backgrounds
    ├── about_page/        # About page content
    │   ├── team/          # Team member photos (roofer.png, foreman.png, etc.)
    │   ├── videos/        # About page videos
    │   └── about-hero.jpg # About page hero image
    ├── services/          # Service page content
    │   ├── commercial_1/  # Commercial service folders
    │   │   └── assets/
    │   │       ├── images/ # Service images with original names
    │   │       └── videos/ # Service videos with original names
    │   ├── residential_2/ # Residential service folders
    │   │   └── assets/
    │   │       ├── images/ # Service images with original names
    │   │       └── videos/ # Service videos with original names
    │   └── [other services]/ # Additional service folders
    └── all_dev/           # Development/showcase content
        └── assets/images/ # Development block images
\`\`\`

## Key Features

- **Original Filename Preservation**: When possible, uploaded images retain their original names from the old structure
- **OLD Structure Compatibility**: Paths match the /personal/old/ directory structure exactly
- **Intelligent Name Mapping**: System attempts to map new uploads to existing filename patterns
- **Team Photo Mapping**: Recognizes team-related uploads and places them in /personal/old/img/about_page/team/

## Integration Instructions

1. **Backup Current Files**: Always backup your current /personal/old/ directory before applying changes.

2. **JSON Files**: Replace the corresponding JSON files in /personal/old/jsons/ with the updated versions.

3. **Assets**: 
   - Extract the personal/old/img/ directory contents to your existing /personal/old/img/
   - Original filenames are preserved where possible (e.g., roofer.png, foreman.png)
   - New uploads use clean, readable names
   - Check manifest.json for a complete list of asset changes

4. **Verification**: After integration, verify that:
   - All image paths in JSON files point to existing assets
   - No broken links exist
   - New uploads display correctly
   - Original filenames are preserved for unchanged assets

## Filename Preservation Logic

The system preserves original filenames by:
- Extracting names from originalUrl properties when available
- Recognizing /personal/old/ paths and preserving their names
- Mapping team photos to known names (roofer.png, foreman.png)
- Using clean, descriptive names for new uploads

## Asset Summary

- Total Assets: ${assetsToCollect.length}
- New Uploads: ${assetsToCollect.filter((a) => a.type === "file").length}
- Modified Existing: ${assetsToCollect.filter((a) => a.type === "blob").length}
- Copied Assets: ${assetsToCollect.filter((a) => a.type === "local").length}

See manifest.json for detailed asset information.
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
    managedServicesData,
    aboutPageJsonData,
    allServiceBlocksData,
    themeColors,
    blockName,
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
    const clonedConfig = JSON.parse(JSON.stringify(preservedConfig));
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
      setServicesDataForOldExport(JSON.parse(JSON.stringify(newData)));
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
            formData={{
              [blockName]: singleBlockData,
              navbar: navbarDataForSingleBlock,
            }}
            setFormData={setMainPageFormData}
            singleBlockMode={blockName}
            themeColors={themeColors}
            sitePalette={sitePalette}
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
    { id: "allServiceBlocks", label: "dev" },
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
              <MainPageForm
                formData={mainPageFormData}
                setFormData={handleMainPageFormChange}
                navbarData={navbarData}
                onNavbarChange={handleNavbarConfigChange}
                themeColors={themeColors}
                sitePalette={sitePalette}
              />
            )}
            {activeTab === "services" && (
              <ServiceEditPage
                themeColors={themeColors}
                sitePalette={sitePalette}
                servicesData={managedServicesData}
                onServicesChange={handleManagedServicesChange}
              />
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
    </div>
  );
};

OneForm.propTypes = {
  initialData: PropTypes.object,
  blockName: PropTypes.string,
  title: PropTypes.string,
};

export default OneForm;
