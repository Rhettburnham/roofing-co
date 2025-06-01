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
import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useNavigate } from 'react-router-dom';
import OneFormAuthButton from "./auth/OneFormAuthButton";
import ServiceEditPage, { blockMap as importedServiceBlockMap } from "./ServiceEditPage";
import MainPageForm from "./MainPageForm";
import AboutBlock from "./MainPageBlocks/AboutBlock";
import { useConfig } from "../context/ConfigContext";
import AllServiceBlocksTab from './AllServiceBlocksTab'; // Import the new component

import Navbar from "./Navbar"; // Import Navbar for preview
import ColorEditor from "./ColorEditor"; // Import the new ColorEditor component
import { defaultColorDefinitions } from "./ColorEditor"; // Import defaultColorDefinitions
import ServicePage from "./ServicePage"; // For rendering all blocks

// Helper function to check if a URL is a local asset to be processed
function isProcessableAssetUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }
  
  // Exclude absolute URLs, data URLs, blob URLs
  if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('data:') || url.startsWith('blob:')) {
    return false;
  }
  
  // Exclude anchor links and document files
  if (url.startsWith('#') || url === 'about' || url === 'inspection' || url === 'shingleinstallation') {
    return false;
  }
  
  // Check if the URL points to a known media folder or a file with an extension
  const validPathCheck = (path) => {
    // Known media folders we want to include
    const validFolders = ['assets/', 'Commercial/', 'data/'];
    
    // Valid media file extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.mp4', '.webm', '.pdf'];
    
    // Check if path starts with a valid folder
    const isInValidFolder = validFolders.some(folder => 
      path.includes(folder) || path.includes(folder.toLowerCase())
    );
    
    // Check if path has a valid file extension
    const hasValidExtension = validExtensions.some(ext => 
      path.toLowerCase().endsWith(ext)
    );
    
    return isInValidFolder || hasValidExtension;
  };
  
  // Clean up the URL (remove leading slash) for validating
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  
  // Only process valid paths
  return validPathCheck(cleanPath);
}

function transformUrlToMediaObject(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return url && url.trim() !== '' ? { file: null, url: url, name: url.split('/').pop() || 'image', originalUrl: url } : null;
  }
  return {
    file: null, 
    url: url,
    name: url.split('/').pop() || 'image',
    originalUrl: url 
  };
}

function initializeMediaFieldsRecursive(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => initializeMediaFieldsRecursive(item));
  }

  const transformedNode = { ...data };

  const directMediaFields = [
    'backgroundImage', 'heroImage', 'imageUrl', 'image', 'videoSrc', 'videoUrl',
    'largeResidentialImg', 'largeCommercialImg', 'posterImage', 'icon' 
  ];

  directMediaFields.forEach(field => {
    if (transformedNode[field] && typeof transformedNode[field] === 'string') {
      transformedNode[field] = transformUrlToMediaObject(transformedNode[field]);
    }
  });

  if (transformedNode.pictures && Array.isArray(transformedNode.pictures)) {
    transformedNode.pictures = transformedNode.pictures.map(pic =>
      typeof pic === 'string' ? transformUrlToMediaObject(pic) : initializeMediaFieldsRecursive(pic) 
    );
  }

  if (transformedNode.items && Array.isArray(transformedNode.items)) {
    transformedNode.items = transformedNode.items.map(item => initializeMediaFieldsRecursive(item));
  }

  if (transformedNode.blocks && Array.isArray(transformedNode.blocks)) {
    transformedNode.blocks = transformedNode.blocks.map(block => initializeMediaFieldsRecursive(block));
  }

  if (transformedNode.config && typeof transformedNode.config === 'object') {
    transformedNode.config = initializeMediaFieldsRecursive(transformedNode.config);
  }
  
  Object.keys(transformedNode).forEach(key => {
    if (
      !directMediaFields.includes(key) &&
      key !== 'pictures' &&
      key !== 'items' &&
      key !== 'blocks' &&
      key !== 'config' &&
      transformedNode[key] &&
      typeof transformedNode[key] === 'object'
    ) {
      if (!(transformedNode[key].hasOwnProperty('file') && transformedNode[key].hasOwnProperty('url'))) {
         transformedNode[key] = initializeMediaFieldsRecursive(transformedNode[key]);
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
  const { config, loading: configLoading, error: configError, services: configServices, themeColors: configThemeColors, combinedGlobalData, aboutPageData } = useConfig();
  const [mainPageFormData, setMainPageFormData] = useState(null);
  const [servicesDataForOldExport, setServicesDataForOldExport] = useState(null); 
  const [managedServicesData, setManagedServicesData] = useState(null); 
  const [themeColors, setThemeColors] = useState(null); 
  const [sitePalette, setSitePalette] = useState([]); // New state for the rich array of color objects
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [initialFormDataForOldExport, setInitialFormDataForOldExport] = useState(null);
  const [aboutPageJsonData, setAboutPageJsonData] = useState(null);
  const [initialAboutPageJsonData, setInitialAboutPageJsonData] = useState(null);
  const [allServiceBlocksData, setAllServiceBlocksData] = useState(null);
  const [initialAllServiceBlocksData, setInitialAllServiceBlocksData] = useState(null);
  const [loadingAllServiceBlocks, setLoadingAllServiceBlocks] = useState(false);
  const [activeEditShowcaseBlockIndex, setActiveEditShowcaseBlockIndex] = useState(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [initialServicesData, setInitialServicesData] = useState(null); 
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const navigate = useNavigate();

  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const autoDownloadTimerRef = useRef(null);
  const lastDownloadRef = useRef(0);
  const DOWNLOAD_DEBOUNCE_MS = 3000; 
  const MIN_DOWNLOAD_INTERVAL_MS = 30000; 

  const isDevelopment = import.meta.env.DEV;

  const [serviceBlockMap, setServiceBlockMap] = useState({}); 
  const [activeTab, setActiveTab] = useState("mainPage"); 

  useEffect(() => {
    setServiceBlockMap(importedServiceBlockMap); 
  }, [importedServiceBlockMap]); 

  useEffect(() => {
    const fetchAllData = async () => {
      console.log("[OneForm] fetchAllData initiated. InitialData provided:", !!initialData, "BlockName:", blockName);
      setIsLoading(true);
      setError(null);

      let currentMainPageData = null;
      let rawServicesSource = null; 
      let currentAboutData = null;
      let currentThemeColorsValue = null;
      let currentAllServiceBlocks = null;
      let currentSitePaletteValue = []; // Initialize for sitePalette

      try {
        if (initialData) {
          console.log("[OneForm] Using initialData prop as primary source.");
          currentMainPageData = initialData.mainPageBlocks ? { mainPageBlocks: initialData.mainPageBlocks, navbar: initialData.navbar } : null;
          rawServicesSource = initialData.services || null;
          currentAboutData = initialData.aboutPageData || null;
          currentThemeColorsValue = initialData.themeColors || null;
          currentSitePaletteValue = initialData.sitePalette || []; // Get sitePalette from initialData if available
          currentAllServiceBlocks = initialData.allServiceBlocksData || null;
          if (blockName && !currentMainPageData && !rawServicesSource && !currentAboutData) {
             console.log(`[OneForm] initialData likely for a single block ('${blockName}'), not full structure.`);
          }
        }

        if (!currentThemeColorsValue) currentThemeColorsValue = configThemeColors;
        if (currentThemeColorsValue) {
            setThemeColors(currentThemeColorsValue);
            // Initialize sitePalette from themeColors if sitePalette wasn't directly in initialData
            if (currentSitePaletteValue.length === 0) {
                const initialPalette = Object.entries(currentThemeColorsValue).map(([name, value], index) => ({
                    id: `initial-theme-${name}-${index}`,
                    name: name,
                    label: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: typeof value === 'string' ? value : '#000000',
                    description: `Theme color: ${name}`,
                    isDefault: defaultColorDefinitions.some(def => def.name === name),
                    isRemovable: !defaultColorDefinitions.some(def => def.name === name),
                }));
                currentSitePaletteValue = initialPalette;
            }
        } else {
           console.warn("[OneForm] Theme colors not found. Using defaults.");
           const defaultTheme = defaultColorDefinitions.reduce((obj, item) => { obj[item.name] = item.value; return obj; }, {});
           setThemeColors(defaultTheme);
           currentSitePaletteValue = [...defaultColorDefinitions]; // Use full default definitions for sitePalette
        }
        setSitePalette(currentSitePaletteValue); // Set sitePalette state

        if (!currentMainPageData) currentMainPageData = combinedGlobalData ? { mainPageBlocks: combinedGlobalData.mainPageBlocks || [], navbar: combinedGlobalData.navbar || {} } : null;
        if (!currentAboutData) currentAboutData = aboutPageData;
        if (!rawServicesSource) rawServicesSource = configServices;

        if (currentMainPageData) {
          console.log("[OneForm] Main page data sourced.", currentMainPageData);
          setMainPageFormData(currentMainPageData);
          setInitialFormDataForOldExport(JSON.parse(JSON.stringify(currentMainPageData)));
        } else if (!blockName) { 
          console.log("[OneForm] Fetching main page data (combined_data.json)...");
        }

        if (currentAboutData) {
          console.log("[OneForm] About page data sourced.", currentAboutData);
          setAboutPageJsonData(currentAboutData); 
          setInitialAboutPageJsonData(JSON.parse(JSON.stringify(currentAboutData))); 
        } else if (!blockName) { 
          console.log("[OneForm] Fetching about page data (/personal/new/jsons/about_page.json)...");
          try {
            const aboutResponse = await fetch("/personal/new/jsons/about_page.json"); 
            if (aboutResponse.ok) {
              const aboutDataFetched = await aboutResponse.json();
              setAboutPageJsonData(aboutDataFetched);
              setInitialAboutPageJsonData(JSON.parse(JSON.stringify(aboutDataFetched)));
              console.log("[OneForm] Successfully fetched /personal/new/jsons/about_page.json.");
            } else {
              console.error("[OneForm] Failed to fetch /personal/new/jsons/about_page.json. Status:", aboutResponse.status);
              setAboutPageJsonData({}); 
              setInitialAboutPageJsonData({});
            }
          } catch (fetchError) {
            console.error("[OneForm] Error fetching /personal/new/jsons/about_page.json:", fetchError);
            setAboutPageJsonData({}); 
            setInitialAboutPageJsonData({});
          }
        }

        if (!rawServicesSource && !blockName) { 
          console.log("[OneForm] Fetching services.json...");
          try {
            const servicesResponse = await fetch("/personal/new/jsons/services.json");
            if (servicesResponse.ok) {
              rawServicesSource = await servicesResponse.json();
              console.log("[OneForm] Successfully fetched /personal/new/jsons/services.json.");
            } else {
              console.error("[OneForm] Failed to fetch /personal/new/jsons/services.json. Status:", servicesResponse.status);
              rawServicesSource = { commercial: [], residential: [] }; 
            }
          } catch (fetchError) {
            console.error("[OneForm] Error fetching /personal/new/jsons/services.json:", fetchError);
            rawServicesSource = { commercial: [], residential: [] }; 
          }
        }
        
        if (rawServicesSource) {
          setServicesDataForOldExport(JSON.parse(JSON.stringify(rawServicesSource)));
          const initializedServices = initializeMediaFieldsRecursive(rawServicesSource);
          setManagedServicesData(initializedServices);
          console.log("[OneForm] Managed services data initialized and set.");
        } else {
          console.warn("[OneForm] No raw service data available. ManagedServicesData will be null or default.");
          setServicesDataForOldExport({ commercial: [], residential: [] }); 
          setManagedServicesData({ commercial: [], residential: [] }); 
        }

        if (currentAllServiceBlocks) {
            console.log("[OneForm] AllServiceBlocks data sourced from initialData.");
            setAllServiceBlocksData(currentAllServiceBlocks);
            setInitialAllServiceBlocksData(JSON.parse(JSON.stringify(currentAllServiceBlocks))); 
        } else if (!blockName) { 
            console.log("[OneForm] Fetching all_blocks_showcase.json...");
            try {
              const showcaseResponse = await fetch("/personal/new/jsons/all_blocks_showcase.json");
              if (showcaseResponse.ok) {
                const showcaseData = await showcaseResponse.json();
                setAllServiceBlocksData(showcaseData);
                setInitialAllServiceBlocksData(JSON.parse(JSON.stringify(showcaseData))); 
                console.log("[OneForm] Successfully fetched /personal/new/jsons/all_blocks_showcase.json.");
              } else {
                console.error("[OneForm] Failed to fetch /personal/new/jsons/all_blocks_showcase.json. Status:", showcaseResponse.status);
                setAllServiceBlocksData({ blocks: [] }); 
                setInitialAllServiceBlocksData({ blocks: [] });
              }
            } catch (fetchError) {
              console.error("[OneForm] Error fetching /personal/new/jsons/all_blocks_showcase.json:", fetchError);
              setAllServiceBlocksData({ blocks: [] }); 
              setInitialAllServiceBlocksData({ blocks: [] });
            }
        }
        
        if (!currentMainPageData && !blockName) {
            console.log("[OneForm] Fetching combined_data.json as a fallback...");
            try {
                const combinedResponse = await fetch("/personal/new/jsons/combined_data.json");
                if (combinedResponse.ok) {
                    const fetchedMainData = await combinedResponse.json();
                    setMainPageFormData(fetchedMainData);
                    console.log("[OneForm] Fallback: loaded combined_data.json");
                } else {
                    console.error("[OneForm] Fallback: Failed to load combined_data.json");
                    setMainPageFormData({ mainPageBlocks: [], navbar: {} }); 
                }
            } catch (e) {
                console.error("[OneForm] Fallback: Error loading combined_data.json", e);
                setMainPageFormData({ mainPageBlocks: [], navbar: {} });
            }
        }

      } catch (error) {
        console.error("[OneForm] Error in fetchAllData:", error);
        setError(error.message || "Failed to load data.");
        setMainPageFormData({ mainPageBlocks: [], navbar: {} });
        setAboutPageJsonData({}); 
        const defaultThemeOnErr = defaultColorDefinitions.reduce((obj, item) => { obj[item.name] = item.value; return obj; }, {});
        setThemeColors(configThemeColors || defaultThemeOnErr);
        setSitePalette([...defaultColorDefinitions]); // Fallback for sitePalette
        setManagedServicesData({ commercial: [], residential: [] });
        setServicesDataForOldExport({ commercial: [], residential: [] });
        setAllServiceBlocksData({ blocks: [] });

      } finally {
        setIsLoading(false);
        setIsInitialLoadComplete(true); 
        console.log("[OneForm] fetchAllData finished.");
      }
    };

    fetchAllData();
  }, [initialData, blockName, configServices, configThemeColors, combinedGlobalData, aboutPageData, isDevelopment]);

  const preserveImageUrls = useCallback((data) => {
    if (!data || typeof data !== 'object') return data;
    
    const preserveInObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => preserveInObject(item));
      }
      
      const preserved = { ...obj };
      
      if (preserved.file instanceof File && preserved.url) {
        return preserved;
      }
      
      if (preserved.url && typeof preserved.url === 'string' && preserved.url.startsWith('blob:')) {
        return preserved;
      }
      
      Object.keys(preserved).forEach(key => {
        preserved[key] = preserveInObject(preserved[key]);
      });
      
      return preserved;
    };
    
    return preserveInObject(data);
  }, []);

  // Helper function to deep clone objects while preserving File objects and other non-serializable types
  function deepCloneWithFiles(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof File) {
      return obj; // Return File objects as-is
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => deepCloneWithFiles(item));
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
  function processDataForJson(originalDataNode, assetsToCollect, parentBlockName = null, isProcessingMainPageBlocks = false) {
    if (originalDataNode === null || originalDataNode === undefined) {
      return originalDataNode;
    }

    if (Array.isArray(originalDataNode)) {
      // Special handling for mainPageBlocks array
      if (isProcessingMainPageBlocks) {
        return originalDataNode.map(block => {
          if (block && block.blockName && block.config) {
            return {
              ...block,
              config: processDataForJson(block.config, assetsToCollect, block.blockName)
            };
          }
          return processDataForJson(block, assetsToCollect, parentBlockName);
        });
      }
      
      return originalDataNode.map(item => processDataForJson(item, assetsToCollect, parentBlockName));
    }

    if (typeof originalDataNode === 'object' && !(originalDataNode instanceof File)) {
      // Handle images array (new structure used by HeroBlock and other blocks)
      if (Array.isArray(originalDataNode) && parentBlockName) {
        return originalDataNode.map((imageItem, imageIndex) => {
          if (imageItem && typeof imageItem === 'object') {
            const fileName = imageItem.name || imageItem.originalUrl?.split('/').pop() || `image_${imageIndex}`;
            const imagePath = `img/main_page_images/${parentBlockName}/${fileName}`;
            
            // If there's a file, collect it for the ZIP
            if (imageItem.file instanceof File) {
              assetsToCollect.push({
                path: imagePath,
                file: imageItem.file,
                type: 'file'
              });
            } else if (imageItem.url && typeof imageItem.url === 'string' && imageItem.url.startsWith('blob:')) {
              assetsToCollect.push({
                path: imagePath,
                url: imageItem.url,
                type: 'blob'
              });
            } else if (imageItem.url && typeof imageItem.url === 'string' && !imageItem.url.startsWith('http')) {
              // Local asset that needs to be copied
              assetsToCollect.push({
                path: imagePath,
                url: imageItem.url,
                type: 'local'
              });
            }

            // Return cleaned image object for JSON (without mutating original)
            return {
              id: imageItem.id,
              url: imagePath,
              name: fileName,
              originalUrl: imageItem.originalUrl || imagePath
              // Note: We deliberately exclude 'file' from the JSON output
            };
          }
          return imageItem;
        });
      }

      // Handle individual image objects
      if (originalDataNode.file instanceof File || (originalDataNode.url && originalDataNode.url.startsWith('blob:'))) {
        const fileName = originalDataNode.name || originalDataNode.file?.name || 'image';
        const imagePath = parentBlockName 
          ? `img/main_page_images/${parentBlockName}/${fileName}`
          : `img/global_assets/${fileName}`;

        if (originalDataNode.file instanceof File) {
          assetsToCollect.push({
            path: imagePath,
            file: originalDataNode.file,
            type: 'file'
          });
        } else if (originalDataNode.url && originalDataNode.url.startsWith('blob:')) {
          assetsToCollect.push({
            path: imagePath,
            url: originalDataNode.url,
            type: 'blob'
          });
        }

        // Return cleaned object for JSON (without mutating original)
        return {
          id: originalDataNode.id,
          url: imagePath,
          name: fileName,
          originalUrl: originalDataNode.originalUrl || imagePath
          // Note: We deliberately exclude 'file' from the JSON output
        };
      }

      // Handle legacy heroImageFile
      if (parentBlockName === 'HeroBlock' && originalDataNode.heroImageFile instanceof File) {
        const fileName = originalDataNode.heroImageFile.name;
        const imagePath = `img/main_page_images/HeroBlock/${fileName}`;
        
        assetsToCollect.push({
          path: imagePath,
          file: originalDataNode.heroImageFile,
          type: 'file'
        });

        // Return cleaned object for JSON (create new object without mutating original)
        const cleaned = { ...originalDataNode };
        delete cleaned.heroImageFile;
        delete cleaned.originalUrl;
        delete cleaned._heroImageOriginalPathFromProps;
        cleaned.heroImage = imagePath;
        
        return cleaned;
      }

      // Process object recursively
      const newObj = {};
      for (const key in originalDataNode) {
        if (Object.prototype.hasOwnProperty.call(originalDataNode, key)) {
          if (key === 'mainPageBlocks' && Array.isArray(originalDataNode[key])) {
            newObj[key] = processDataForJson(originalDataNode[key], assetsToCollect, parentBlockName, true);
          } else if (key === 'images' && Array.isArray(originalDataNode[key]) && parentBlockName) {
            newObj[key] = processDataForJson(originalDataNode[key], assetsToCollect, parentBlockName);
          } else {
            newObj[key] = processDataForJson(originalDataNode[key], assetsToCollect, parentBlockName);
          }
        }
      }
      return newObj;
    }

    return originalDataNode;
  }

  const handleSubmit = useCallback(async (isAutoDownload = false) => {
    try {
      if (!mainPageFormData) {
        console.error("No form data to submit.");
        alert("No data available to download.");
        return;
      }

      const zip = new JSZip();
      let assetsToCollect = [];

      // Create deep copies of data to avoid mutating the original state
      const combinedDataCopy = deepCloneWithFiles(mainPageFormData.combined_data || mainPageFormData);
      const managedServicesDataCopy = managedServicesData ? deepCloneWithFiles(managedServicesData) : null;
      const aboutPageJsonDataCopy = aboutPageJsonData ? deepCloneWithFiles(aboutPageJsonData) : null;
      const allServiceBlocksDataCopy = allServiceBlocksData ? deepCloneWithFiles(allServiceBlocksData) : null;

      // Process combined_data.json
      const cleanedCombinedData = processDataForJson(combinedDataCopy, assetsToCollect);
      zip.file("jsons/combined_data.json", JSON.stringify(cleanedCombinedData, null, 2));

      // Process services.json if available
      if (managedServicesDataCopy && !blockName) {
        const cleanedServicesData = processDataForJson(managedServicesDataCopy, assetsToCollect);
        zip.file("jsons/services.json", JSON.stringify(cleanedServicesData, null, 2));
      }

      // Process about_page.json if available
      if (aboutPageJsonDataCopy && !blockName) {
        const cleanedAboutData = processDataForJson(aboutPageJsonDataCopy, assetsToCollect, 'AboutBlock');
        zip.file("jsons/about_page.json", JSON.stringify(cleanedAboutData, null, 2));
      }

      // Process all_blocks_showcase.json if available
      if (allServiceBlocksDataCopy && !blockName) {
        const cleanedShowcaseData = processDataForJson(allServiceBlocksDataCopy, assetsToCollect);
        zip.file("jsons/all_blocks_showcase.json", JSON.stringify(cleanedShowcaseData, null, 2));
      }

      // Process colors_output.json
      if (themeColors) {
        const colorsForJson = {};
        Object.keys(themeColors).forEach(key => {
          colorsForJson[key.replace(/-/g, '_')] = themeColors[key];
        });
        zip.file("jsons/colors_output.json", JSON.stringify(colorsForJson, null, 2));
      }

      // Add all collected assets to the ZIP
      const assetPromises = assetsToCollect.map(async (asset) => {
        try {
          if (asset.type === 'file') {
            zip.file(asset.path, asset.file);
            console.log(`Added file to ZIP: ${asset.path}`);
          } else if (asset.type === 'blob') {
            const response = await fetch(asset.url);
            const blob = await response.blob();
            zip.file(asset.path, blob);
            console.log(`Added blob to ZIP: ${asset.path}`);
          } else if (asset.type === 'local') {
            const response = await fetch(asset.url);
            const blob = await response.blob();
            zip.file(asset.path, blob);
            console.log(`Added local asset to ZIP: ${asset.path}`);
          }
        } catch (error) {
          console.error(`Error processing asset ${asset.path}:`, error);
        }
      });

      await Promise.all(assetPromises);

      // Generate and download the ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
      const zipFileName = blockName
        ? `${blockName}_edit_${dateStr}_${timeStr}.zip`
        : `website_content_${isAutoDownload ? 'auto_' : ''}${dateStr}_${timeStr}.zip`;
      
      if (isAutoDownload) {
        console.log(`[AutoDownload] Auto-saved ZIP: ${zipFileName}`);
        saveAs(content, zipFileName);
      } else {
        saveAs(content, zipFileName);
        console.log("ZIP file generation complete:", zipFileName);
      }

    } catch (error) {
      console.error("Error creating ZIP file:", error);
      if (!isAutoDownload) {
        alert("Error creating ZIP file. See console for details.");
      }
    }
  }, [mainPageFormData, managedServicesData, aboutPageJsonData, allServiceBlocksData, themeColors, blockName]);

  // Update auto-download to save changes immediately
  const triggerAutoDownload = useCallback(() => {
    if (!autoDownloadEnabled || downloadInProgress) return;
    
    if (autoDownloadTimerRef.current) {
      clearTimeout(autoDownloadTimerRef.current);
    }
    
    setPendingChanges(true);
    
    autoDownloadTimerRef.current = setTimeout(async () => {
      const now = Date.now();
      
      if (now - lastDownloadRef.current < MIN_DOWNLOAD_INTERVAL_MS) {
        console.log('[AutoDownload] Skipping download - too soon since last download');
        return;
      }
      
      console.log('[AutoDownload] Triggering automatic save and download');
      setDownloadInProgress(true);
      setPendingChanges(false);
      
      try {
        await handleSubmit(true); // Generate and download ZIP
        lastDownloadRef.current = now;
        console.log('[AutoDownload] Automatic save and download completed');
      } catch (error) {
        console.error('[AutoDownload] Auto-download failed:', error);
      } finally {
        setDownloadInProgress(false);
      }
    }, DOWNLOAD_DEBOUNCE_MS);
  }, [autoDownloadEnabled, downloadInProgress, handleSubmit]);

  useEffect(() => {
    return () => {
      if (autoDownloadTimerRef.current) {
        clearTimeout(autoDownloadTimerRef.current);
      }
    };
  }, []);

  const handleMainPageFormChange = (newMainPageFormData) => {
    setMainPageFormData(prev => {
      const updatedData = {
        ...prev, 
        mainPageBlocks: newMainPageFormData.mainPageBlocks || prev.mainPageBlocks,
        navbar: newMainPageFormData.navbar || prev.navbar,
        hero: newMainPageFormData.hero || prev.hero 
      };
      console.log("Updated main page form data:", updatedData);
      
      if (!blockName) { 
        triggerAutoDownload();
      }
      
      return updatedData;
    });
};

  const handleAboutConfigChange = (newAboutConfig) => {
    console.log("[OneForm] About page config changed:", newAboutConfig);
    setAboutPageJsonData(preserveImageUrls(newAboutConfig));
    triggerAutoDownload();
  };

  const handleManagedServicesChange = (updatedServicePageData, serviceCategory, servicePageId) => {
    console.log(`[OneForm] handleManagedServicesChange called for category '${serviceCategory}', page ID '${servicePageId}':`, updatedServicePageData);
    setManagedServicesData(prevServicesData => {
      if (!prevServicesData || !prevServicesData[serviceCategory]) {
        console.error(`[OneForm] Invalid service category '${serviceCategory}' in handleManagedServicesChange.`);
        return prevServicesData; 
      }
      const updatedCategoryPages = prevServicesData[serviceCategory].map(page => {
        if (page.id === servicePageId) {
          return updatedServicePageData; 
        }
        return page;
      });
      const newData = {
        ...prevServicesData,
        [serviceCategory]: updatedCategoryPages,
      };
      triggerAutoDownload(); 
      return newData;
    });
  };

  const handleThemeColorChange = (newColorsObject, newSitePaletteArray) => {
    setThemeColors(newColorsObject); 
    if (newSitePaletteArray) {
        setSitePalette(newSitePaletteArray);
    }
    Object.keys(newColorsObject).forEach(key => {
      const cssVarName = `--color-${key}`;
        document.documentElement.style.setProperty(cssVarName, newColorsObject[key]);
    });
    
    if (!blockName) {
      triggerAutoDownload();
    }
  };

  const fetchShowcaseData = async () => {
    if (allServiceBlocksData && allServiceBlocksData.blocks && allServiceBlocksData.blocks.length > 0) {
      console.log("fetchShowcaseData: Data already exists for showcase, skipping fetch.");
      return;
    }
    if (loadingAllServiceBlocks) return;

    setLoadingAllServiceBlocks(true);
    try {
      const response = await fetch("/personal/new/jsons/all_blocks_showcase.json");
      if (!response.ok) {
        throw new Error('Failed to fetch all_blocks_showcase.json');
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
    setAllServiceBlocksData(prevData => {
      if (!prevData || !prevData.blocks) return prevData;
      const updatedBlocks = prevData.blocks.map((block, index) => {
        if (index === blockIndex) {
          return { ...block, config: preserveImageUrls(newConfig) };
        }
        return block;
      });
      const updatedData = { ...prevData, blocks: updatedBlocks };
      
      triggerAutoDownload();
      
      return updatedData;
    });
  };

  const handleShowcaseFileChangeForBlock = (blockIndex, configKeyOrPathData, fileOrFileObject) => {
    if (!fileOrFileObject) return;

    let newMediaConfig;
    const currentBlock = allServiceBlocksData.blocks[blockIndex];
    let existingMediaConfig;

    let isNestedPath = typeof configKeyOrPathData === 'object' && configKeyOrPathData !== null;
    let fieldToUpdate = isNestedPath ? configKeyOrPathData.field : configKeyOrPathData;

    if (isNestedPath) {
      if (configKeyOrPathData.field === 'pictures' && currentBlock.config.items && currentBlock.config.items[configKeyOrPathData.blockItemIndex]) {
        existingMediaConfig = currentBlock.config.items[configKeyOrPathData.blockItemIndex].pictures?.[configKeyOrPathData.pictureIndex];
      } else if (currentBlock.config.items && currentBlock.config.items[configKeyOrPathData.blockItemIndex]) {
        existingMediaConfig = currentBlock.config.items[configKeyOrPathData.blockItemIndex][fieldToUpdate];
      } else {
        existingMediaConfig = currentBlock.config[fieldToUpdate];
      }
    } else {
      existingMediaConfig = currentBlock?.config?.[fieldToUpdate];
    }

    if (fileOrFileObject instanceof File) {
      if (existingMediaConfig && typeof existingMediaConfig === 'object' && existingMediaConfig.url && existingMediaConfig.url.startsWith('blob:')) {
        URL.revokeObjectURL(existingMediaConfig.url);
      }
      const fileURL = URL.createObjectURL(fileOrFileObject);
      newMediaConfig = {
        file: fileOrFileObject,
        url: fileURL,
        name: fileOrFileObject.name,
        originalUrl: (typeof existingMediaConfig === 'object' ? existingMediaConfig.originalUrl : typeof existingMediaConfig === 'string' ? existingMediaConfig : null) || `assets/showcase_uploads/generated/${fileOrFileObject.name}`
      };
    } else if (typeof fileOrFileObject === 'object' && fileOrFileObject.url !== undefined) {
      if (existingMediaConfig && typeof existingMediaConfig === 'object' && existingMediaConfig.file && existingMediaConfig.url && existingMediaConfig.url.startsWith('blob:')) {
        if (existingMediaConfig.url !== fileOrFileObject.url) { 
          URL.revokeObjectURL(existingMediaConfig.url);
        }
      }
      newMediaConfig = fileOrFileObject;
    } else if (typeof fileOrFileObject === 'string') { 
      if (existingMediaConfig && typeof existingMediaConfig === 'object' && existingMediaConfig.file && existingMediaConfig.url && existingMediaConfig.url.startsWith('blob:')) {
        URL.revokeObjectURL(existingMediaConfig.url);
      }
      newMediaConfig = {
        file: null,
        url: fileOrFileObject,
        name: fileOrFileObject.split('/').pop(),
        originalUrl: fileOrFileObject
      };
    } else {
      console.warn("Unsupported file/URL type in handleShowcaseFileChangeForBlock", fileOrFileObject);
      return;
    }

    setAllServiceBlocksData(prevData => {
      const updatedBlocks = prevData.blocks.map((block, index) => {
        if (index === blockIndex) {
          let newBlockConfig = { ...block.config };
          if (isNestedPath) {
            if (!newBlockConfig.items) newBlockConfig.items = [];
             while (newBlockConfig.items.length <= configKeyOrPathData.blockItemIndex) {
                newBlockConfig.items.push({ pictures: [] }); 
              }
              if(configKeyOrPathData.field === 'pictures'){
                if (!newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures) {
                  newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures = [];
                }
                while (newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures.length <= configKeyOrPathData.pictureIndex) {
                  newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures.push(null);
                }
                newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures[configKeyOrPathData.pictureIndex] = newMediaConfig;
              } else {
                newBlockConfig.items[configKeyOrPathData.blockItemIndex] = {
                  ...newBlockConfig.items[configKeyOrPathData.blockItemIndex],
                  [fieldToUpdate]: newMediaConfig
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
      
      triggerAutoDownload();
      
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
      setMainPageFormData(prev => preserveImageUrls(prev));
      setAboutPageJsonData(prev => preserveImageUrls(prev));
      setAllServiceBlocksData(prev => preserveImageUrls(prev));
      
      console.log('[TabSwitch] Preserved image URLs during tab switch');
    }
    
    setActiveTab(tabId);
    if (tabId === 'allServiceBlocks' && !allServiceBlocksData && !loadingAllServiceBlocks) {
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
        <p>Failed to load form data. Please check console for errors or try refreshing.</p>
      </div>
    );
  }

  if (blockName && title) {
    console.log(`OneForm: Editing specific block: ${blockName}`, mainPageFormData);
    const singleBlockData = mainPageFormData[blockName] || {};
    const navbarDataForSingleBlock = mainPageFormData.navbar || { navLinks: [], logo: '', whiteLogo: '' };

    return (
      <div className="min-h-screen bg-gray-100 text-black">
        <div className="bg-gray-900 text-white p-3 shadow-md sticky top-0 z-50 flex justify-between items-center">
          <h1 className="text-xl font-medium">{title}</h1>
          <button onClick={() => handleSubmit(false)} type="button" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
            Download JSON for {blockName}
          </button>
        </div>
        <div className="p-4">
          <MainPageForm
            formData={{ [blockName]: singleBlockData, navbar: navbarDataForSingleBlock }}
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
  const oneFormNavbarConfig = mainPageFormData.navbar || { navLinks: [], logo: '', whiteLogo: '' };

  const tabs = [
    { id: "mainPage", label: "Home" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "colors", label: "Color Palette" },
    { id: "allServiceBlocks", label: "dev" }
  ];

  return (
    <div className="min-h-screen bg-sky-100 text-black flex flex-col"> 
      
      <div className="flex flex-col"> 
        <div className="flex-grow">
            <div className="bg-slate-100 px-4 py-2 flex justify-between items-center shadow-md">
              <div className="flex">
                {tabs.map(tabInfo => (
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
                {!blockName && (
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => setAutoDownloadEnabled(!autoDownloadEnabled)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        autoDownloadEnabled 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      }`}
                    >
                      Auto-Save: {autoDownloadEnabled ? 'ON' : 'OFF'}
                    </button>
                    
                    {autoDownloadEnabled && (
                      <div className="flex items-center gap-1">
                        {downloadInProgress && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs">Saving...</span>
                          </div>
                        )}
                        {pendingChanges && !downloadInProgress && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span className="text-xs">Changes pending</span>
                          </div>
                        )}
                        {!pendingChanges && !downloadInProgress && (
                          <div className="flex items-center gap-1 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs">Saved</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <button 
                  onClick={() => handleSubmit(false)} 
                  type="button" 
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                  disabled={downloadInProgress}
                >
                  {downloadInProgress ? 'Creating ZIP...' : 'Download ZIP'}
                </button>
              </div>
            </div>

            <div className="tab-content">
              {activeTab === "mainPage" && (
                <MainPageForm 
                  formData={mainPageFormData} 
                  setFormData={handleMainPageFormChange}
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
                <div className="container mx-auto px-4 py-6 bg-gray-100">
                  <div className="mb-4 bg-gray-800 text-white p-4 rounded">
                    <h1 className="text-2xl font-bold">About Page Content</h1>
                    <p className="text-gray-300 mt-1">Edit the about page block content</p>
                  </div>
                  <div className="relative border border-gray-300 bg-white overflow-hidden">
                    <AboutBlock
                      readOnly={false}
                      aboutData={aboutPageJsonData}
                      onConfigChange={handleAboutConfigChange}
                      themeColors={themeColors}
                      sitePalette={sitePalette}
                    />
                  </div>
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
                  setActiveEditShowcaseBlockIndex={setActiveEditShowcaseBlockIndex}
                  serviceBlockMap={serviceBlockMap}
                  handleShowcaseBlockConfigUpdate={handleShowcaseBlockConfigUpdate}
                  getShowcaseDisplayUrl={getShowcaseDisplayUrl}
                  handleShowcaseFileChangeForBlock={handleShowcaseFileChangeForBlock}
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