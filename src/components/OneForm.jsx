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
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useNavigate } from 'react-router-dom';
import OneFormAuthButton from "./auth/OneFormAuthButton";
import ServiceEditPage, { getServicesData, blockMap as serviceBlockMap } from "./ServiceEditPage";
import MainPageForm from "./MainPageForm";
import AboutBlock from "./MainPageBlocks/AboutBlock";
import { useConfig } from "../context/ConfigContext";

import Navbar from "./Navbar"; // Import Navbar for preview
import ColorEditor from "./ColorEditor"; // Import the new ColorEditor component
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

// Recursive function to traverse data, collect assets, and return cleaned data for ZIP
function traverseAndModifyDataForZip(originalDataNode, assetsToCollect, pathContext, uploadBaseDir) {
  if (originalDataNode === null || originalDataNode === undefined) {
    return originalDataNode;
  }

  if (Array.isArray(originalDataNode)) {
    return originalDataNode.map((item, index) =>
      traverseAndModifyDataForZip(item, assetsToCollect, `${pathContext}[${index}]`, uploadBaseDir)
    );
  }

  if (typeof originalDataNode === 'object' && !(originalDataNode instanceof File)) {
    // Specific check for block config objects that might contain a direct File object
    // E.g., HeroBlock stores its file in `heroImageFile` and replacement target in `originalUrl` or `_heroImageOriginalPathFromProps`
    // This check needs to be robust and potentially identify other similar patterns.
    const isHeroBlockConfig = pathContext.endsWith('.config'); // Simple check, might need refinement

    if (isHeroBlockConfig && originalDataNode.heroImageFile instanceof File) {
      console.log(`[traverseAndModifyDataForZip] Detected HeroBlock-like config with File. PathContext: ${pathContext}, File Name: ${originalDataNode.heroImageFile.name}`);
      const file = originalDataNode.heroImageFile;
      const fileName = file.name || 'untitled_hero_image';
      let pathInZip;
      let jsonUrl;
      // The `originalUrl` for replacement should be at this level or `_heroImageOriginalPathFromProps`
      const replacementUrl = originalDataNode.originalUrl || originalDataNode._heroImageOriginalPathFromProps;

      if (replacementUrl && typeof replacementUrl === 'string') {
        console.log(`[traverseAndModifyDataForZip] HeroBlock File: Found replacementUrl: ${replacementUrl}`);
        let tempPath = replacementUrl;
        if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
        pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
        jsonUrl = pathInZip;
      } else {
        console.log(`[traverseAndModifyDataForZip] HeroBlock File: No replacementUrl. Creating new path.`);
        const sanitizedPathContext = pathContext.replace(/[\W_]+/g, '_').slice(0, 50);
        pathInZip = `assets/${uploadBaseDir}/${sanitizedPathContext}_${fileName}`;
        jsonUrl = pathInZip;
      }
      assetsToCollect.push({ pathInZip, dataSource: file, type: 'file' });
      console.log(`[traverseAndModifyDataForZip] HeroBlock File: Collected asset: type=file, pathInZip=${pathInZip}, dataSource name=${fileName}`);
      
      // Return a modified config object: heroImage points to jsonUrl, file object removed
      const cleanedConfig = { ...originalDataNode };
      delete cleanedConfig.heroImageFile;
      delete cleanedConfig.originalUrl; // originalUrl (if it was the source) is now represented by jsonUrl
      delete cleanedConfig._heroImageOriginalPathFromProps; // also clean this if it existed
      cleanedConfig.heroImage = jsonUrl; // The main image field should now point to the new path
      // Recursively process other properties within this config object, *excluding* the ones we just handled.
      const furtherProcessedConfig = {};
      for (const key in cleanedConfig) {
        if (key !== 'heroImage' && Object.prototype.hasOwnProperty.call(cleanedConfig, key)) {
            furtherProcessedConfig[key] = traverseAndModifyDataForZip(cleanedConfig[key], assetsToCollect, `${pathContext}.${key}`, uploadBaseDir);
        } else if (key === 'heroImage') {
            furtherProcessedConfig[key] = cleanedConfig.heroImage; // Already processed
        }
      }
      return furtherProcessedConfig;
    }

    // Generic file object structure check (as before)
    if (originalDataNode.file && originalDataNode.file instanceof File && typeof originalDataNode.name === 'string') {
      console.log(`[traverseAndModifyDataForZip] Detected Generic FileObject structure. PathContext: ${pathContext}, File Name: ${originalDataNode.name}, OriginalURL prop: ${originalDataNode.originalUrl}`);
      const file = originalDataNode.file;
      const fileName = originalDataNode.name || file.name || 'untitled_asset';
      let pathInZip;
      let jsonUrl;

      if (originalDataNode.originalUrl && typeof originalDataNode.originalUrl === 'string') {
        console.log(`traverseAndModifyDataForZip: Found originalUrl: ${originalDataNode.originalUrl} for file ${fileName}`);
        // Directly use originalUrl, ensuring it starts with 'assets/' and has no leading '/' for internal consistency.
        let tempPath = originalDataNode.originalUrl;
        if (tempPath.startsWith('/')) {
          tempPath = tempPath.substring(1);
        }
        // Ensure the path is treated as relative to the root of asset storage for ZIP pathing.
        // If originalUrl is like "/assets/images/foo.png", tempPath becomes "assets/images/foo.png".
        // If originalUrl is like "images/foo.png", tempPath becomes "images/foo.png". 
        // We need to ensure it becomes "assets/images/foo.png" for the ZIP structure.
        if (!tempPath.startsWith('assets/')) {
            console.warn(`traverseAndModifyDataForZip: originalUrl "${originalDataNode.originalUrl}" did not start with assets/. Prepending "assets/". This might indicate an issue with how originalUrl is formed or passed.`);
            // This prepending logic might be too broad. Consider if originalUrl *should* sometimes not start with assets/.
            // For heroImage, it *should* be like "/assets/images/hero/hero.png"
            pathInZip = `assets/${tempPath.split('/').pop()}`; // Fallback: take filename under assets if originalUrl is malformed.
                                                        // More robust: ensure originalUrl is always correctly formed upstream.
            // A safer approach if originalUrl is expected to be well-formed (e.g. /assets/images/...):
            pathInZip = tempPath; // Use the cleaned tempPath directly if it's already correct.
        } else {
            pathInZip = tempPath; // Use the cleaned tempPath directly.
        }
        jsonUrl = pathInZip; // The URL in JSON should match this structured path.
        console.log(`traverseAndModifyDataForZip: Determined pathInZip: ${pathInZip} and jsonUrl: ${jsonUrl} from originalUrl.`);

      } else {
        const sanitizedPathContext = pathContext.replace(/[\W_]+/g, '_').slice(0, 50); 
        // uploadBaseDir is like 'user_uploads/new_combined_data', so pathInZip is assets/user_uploads/new_combined_data/...
        pathInZip = `assets/${uploadBaseDir}/${sanitizedPathContext}_${fileName}`;
        jsonUrl = pathInZip;
        console.log(`traverseAndModifyDataForZip: No originalUrl. Determined pathInZip: ${pathInZip} for file ${fileName}`);
      }
      
      assetsToCollect.push({
        pathInZip, 
        dataSource: file,
        type: 'file', // Explicitly set type as file
      });
      console.log(`[traverseAndModifyDataForZip] Collected asset: type=file, pathInZip=${pathInZip}, dataSource name=${file.name}`);
      
      const cleanedFileObject = { ...originalDataNode };
      delete cleanedFileObject.file; 
      delete cleanedFileObject.originalUrl; 
      cleanedFileObject.url = jsonUrl; 
      return cleanedFileObject;
    }
    
    // NEW Check for pasted/blob URL objects
    // Handles objects like { url: "blob:...", name: "pasted.png", originalUrl: "optional_original_path_or_blob_url" }
    else if (originalDataNode.url && typeof originalDataNode.url === 'string' && originalDataNode.url.startsWith('blob:') && originalDataNode.name) {
      console.log(`[traverseAndModifyDataForZip] Detected Blob URL object. PathContext: ${pathContext}, URL: ${originalDataNode.url}, Name: ${originalDataNode.name}`);
      const blobUrl = originalDataNode.url;
      const fileName = originalDataNode.name || 'pasted_image.png'; // Fallback name
      let pathInZip;
      let jsonUrl;

      // Use originalUrl for path if it's provided and isn't another blob URL (i.e., it's a replacement target)
      if (originalDataNode.originalUrl && typeof originalDataNode.originalUrl === 'string' && !originalDataNode.originalUrl.startsWith('blob:')) {
        console.log(`[traverseAndModifyDataForZip] Blob URL object: Using originalUrl as replacement target: ${originalDataNode.originalUrl}`);
        let tempPath = originalDataNode.originalUrl;
        if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
        // Ensure 'assets/' prefix for consistency if originalUrl is a relative path like 'images/foo.png'
        pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
        jsonUrl = pathInZip;
      } else {
        // Generate a new path for this pasted image
        console.log(`[traverseAndModifyDataForZip] Blob URL object: Generating new path. uploadBaseDir: ${uploadBaseDir}`);
        const sanitizedPathContext = pathContext.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 50); // Ensure sanitize replaces non-word chars
        pathInZip = `assets/${uploadBaseDir}/${sanitizedPathContext}_${fileName}`;
        jsonUrl = pathInZip;
      }
      
      assetsToCollect.push({
        pathInZip,
        dataSource: blobUrl, // The blob URL itself is the source to be fetched
        type: 'url', // Treated as 'url' type, later logic fetches blob: sources
      });
      console.log(`[traverseAndModifyDataForZip] Collected asset for Blob URL: type=url, pathInZip=${pathInZip}, dataSource=${blobUrl}`);

      // Return a cleaned object, replacing blob URL with the new persistent path
      const cleanedBlobObject = { ...originalDataNode };
      delete cleanedBlobObject.file; // Remove 'file' property if it existed (e.g., was null)
      cleanedBlobObject.url = jsonUrl; // Update URL to the new path for JSON
      // Remove originalUrl as its information is now embodied in the jsonUrl (if it was a target path)
      // or it was a blob url itself / not useful for the final JSON structure.
      delete cleanedBlobObject.originalUrl; 
      
      // Recursively process other properties within this object, if any, excluding 'url' which is now set.
      const furtherProcessedBlobObject = {};
      for (const key in cleanedBlobObject) {
        if (key !== 'url' && Object.prototype.hasOwnProperty.call(cleanedBlobObject, key)) {
            furtherProcessedBlobObject[key] = traverseAndModifyDataForZip(cleanedBlobObject[key], assetsToCollect, `${pathContext}.${key}`, uploadBaseDir);
        } else if (key === 'url') {
            furtherProcessedBlobObject[key] = cleanedBlobObject.url; // Already processed
        }
      }
      return furtherProcessedBlobObject;
    }
    
    // Handle objects with url property (from pasted URLs or existing data)
    else if (originalDataNode.url && typeof originalDataNode.url === 'string' && isProcessableAssetUrl(originalDataNode.url)) {
      let url = originalDataNode.url;
      let pathInZip = url;
      let jsonUrl = url;
      console.log(`[traverseAndModifyDataForZip] Detected URL structure. PathContext: ${pathContext}, URL: ${url}`);

      if (pathInZip.startsWith('/')) {
        pathInZip = pathInZip.substring(1);
        jsonUrl = jsonUrl.substring(1);
      }
      
      // Ensure existing assets are also under 'assets/' in the ZIP and JSON
      if (!pathInZip.startsWith('assets/') && !pathInZip.startsWith('http') && !pathInZip.startsWith('data:') && !pathInZip.startsWith('blob:')) {
         // This assumes URLs like 'images/pic.jpg' or 'Commercial/thing.png' should be 'assets/images/pic.jpg'
         pathInZip = `assets/${pathInZip}`;
         jsonUrl = pathInZip;
      } else if (pathInZip.startsWith('assets/')) {
        // It's already good
      } else {
        // External URL, data URL, blob URL - do not add to assetsToCollect, return as is.
        return originalDataNode;
      }
      
      // Avoid duplicating asset collection for these existing URLs
      if (!assetsToCollect.some(asset => asset.pathInZip === pathInZip && asset.type === 'url')) {
        assetsToCollect.push({
          pathInZip,
          dataSource: url, 
          type: 'url', // Explicitly set type as url
        });
        console.log(`[traverseAndModifyDataForZip] Collected asset: type=url, pathInZip=${pathInZip}, dataSource=${url}`);
      }
      
      // Return a cloned object with updated url
      return { ...originalDataNode, url: jsonUrl };
    }

    // Otherwise, it's a generic object; traverse its properties and build a new object
    const newObj = {};
    for (const key in originalDataNode) {
      if (Object.prototype.hasOwnProperty.call(originalDataNode, key)) {
        newObj[key] = traverseAndModifyDataForZip(
          originalDataNode[key],
          assetsToCollect,
          `${pathContext}.${key}`,
          uploadBaseDir
        );
      }
    }
    return newObj;
  }

  // Handle string URLs that might be existing assets (these are direct string values, not in objects like {url: '...'})
  if (typeof originalDataNode === 'string' && isProcessableAssetUrl(originalDataNode)) {
    let pathInZip = originalDataNode;
    let jsonUrl = originalDataNode;
    console.log(`[traverseAndModifyDataForZip] Detected string URL. PathContext: ${pathContext}, URL: ${originalDataNode}`);

    if (pathInZip.startsWith('/')) {
      pathInZip = pathInZip.substring(1);
      jsonUrl = jsonUrl.substring(1);
    }
    
    // Add 'assets/' prefix if not an absolute URL and not already prefixed
     if (!pathInZip.startsWith('assets/') && !pathInZip.startsWith('http') && !pathInZip.startsWith('data:') && !pathInZip.startsWith('blob:')) {
        pathInZip = `assets/${pathInZip}`;
        jsonUrl = pathInZip;
    } else if (pathInZip.startsWith('assets/')) {
        // It's already good
    } else {
        // External URL, data URL, blob URL - return as is.
        return originalDataNode;
    }


    // Avoid duplicating asset collection
    if (!assetsToCollect.some(asset => asset.pathInZip === pathInZip && asset.type === 'url')) {
        assetsToCollect.push({
          pathInZip,
          dataSource: originalDataNode, 
          type: 'url', // Explicitly set type as url
        });
        console.log(`[traverseAndModifyDataForZip] Collected asset: type=url, pathInZip=${pathInZip}, dataSource=${originalDataNode}`);
    }
    return jsonUrl; // Return the potentially modified URL for the JSON
  }

  // Return primitives and other types as is
  return originalDataNode;
}



// Tab style button component
const TabButton = ({ id, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium transition-all duration-300 ${
      isActive
        ? "bg-blue text-white drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)] border-t-2 border-blue"
        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
    } rounded-t-lg`}
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
  const [formData, setFormData] = useState(null);
  const [initialFormDataForOldExport, setInitialFormDataForOldExport] = useState(null);
  const [aboutPageJsonData, setAboutPageJsonData] = useState(null);
  const [initialAboutPageJsonData, setInitialAboutPageJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mainPage");
  const [themeColors, setThemeColors] = useState(null);
  const [initialThemeColors, setInitialThemeColors] = useState(null);
  const { colors: configColors } = useConfig();
  const [allServiceBlocksData, setAllServiceBlocksData] = useState(null);
  const [initialAllServiceBlocksData, setInitialAllServiceBlocksData] = useState(null);
  const [loadingAllServiceBlocks, setLoadingAllServiceBlocks] = useState(false);
  const [activeEditShowcaseBlockIndex, setActiveEditShowcaseBlockIndex] = useState(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [servicesData, setServicesData] = useState(null);
  const [initialServicesData, setInitialServicesData] = useState(null);
  const navigate = useNavigate();

  // On mount, fetch combined_data.json to populate the form if no initialData is provided
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Use colors from ConfigContext if available
        if (configColors) {
          setThemeColors(configColors);
          setInitialThemeColors(JSON.parse(JSON.stringify(configColors)));
          console.log("OneForm: Using theme colors from ConfigContext:", configColors);
        } else {
          console.warn("OneForm: No colors available from ConfigContext. Using defaults.");
          const defaultColors = { accent: '#2B4C7E', banner: '#1A2F4D', "second-accent": '#FFF8E1', "faint-color": '#E0F7FA' };
          setThemeColors(defaultColors);
          setInitialThemeColors(JSON.parse(JSON.stringify(defaultColors)));
        }

        console.log("Starting fetchCombinedData...");
        
        // Check if we're on a custom domain
        const customDomain = window.location.hostname !== 'roofing-co.pages.dev' && 
                           window.location.hostname !== 'roofing-www.pages.dev' &&
                           window.location.hostname !== 'localhost';
        setIsCustomDomain(customDomain);
        
        // If initialData is provided, use it directly within the appropriate block structure
        if (initialData) {
          console.log("Using provided initialData:", initialData);
          if (blockName) {
            // For editing a specific block, structure the data properly
            setFormData({ [blockName]: initialData });
          } else {
            setFormData(initialData);
            setInitialFormDataForOldExport(JSON.parse(JSON.stringify(initialData)));
          }
        } else {
          // Default: fetch the full combined_data.json for the main OneForm editor
          try {
            const combinedResponse = await fetch("/data/raw_data/step_4/combined_data.json");
            if (combinedResponse.ok) {
              const dataToSet = await combinedResponse.json();
              console.log("Loaded combined data:", dataToSet);
              setFormData(dataToSet);
              setInitialFormDataForOldExport(JSON.parse(JSON.stringify(dataToSet)));

              // Also fetch about_page.json if in full editor mode
              if (!blockName) {
                try {
                  const aboutJsonResponse = await fetch("/data/raw_data/step_3/about_page.json");
                  if (aboutJsonResponse.ok) {
                    const aboutJson = await aboutJsonResponse.json();
                    setAboutPageJsonData(aboutJson);
                    setInitialAboutPageJsonData(JSON.parse(JSON.stringify(aboutJson)));
                    console.log("OneForm: Loaded about_page.json data:", aboutJson);
                  } else {
                    console.warn("OneForm: Failed to load about_page.json. About page editor might not work as expected.");
                    setAboutPageJsonData({});
                    setInitialAboutPageJsonData({});
                  }
                } catch (aboutJsonError) {
                  console.error("OneForm: Error loading about_page.json:", aboutJsonError);
                  setAboutPageJsonData({});
                  setInitialAboutPageJsonData({});
                }
              }

              // Fetch initial all_blocks_showcase.json for both 'initial' state and current working state
              if (!blockName) {
                try {
                  const showcaseResponse = await fetch("/data/all_blocks_showcase.json");
                  if (showcaseResponse.ok) {
                    const showcaseJson = await showcaseResponse.json();
                    setInitialAllServiceBlocksData(JSON.parse(JSON.stringify(showcaseJson)));
                    if (!allServiceBlocksData) {
                      setAllServiceBlocksData(showcaseJson);
                    }
                    console.log("OneForm: Loaded initial all_blocks_showcase.json data:", showcaseJson);
                  } else {
                    console.warn("OneForm: Failed to load all_blocks_showcase.json. Showcase tab might be empty or use fallback.");
                    const emptyShowcase = { blocks: [] };
                    setInitialAllServiceBlocksData(emptyShowcase);
                    if (!allServiceBlocksData) setAllServiceBlocksData(emptyShowcase);
                  }
                } catch (showcaseJsonError) {
                  console.error("OneForm: Error loading all_blocks_showcase.json:", showcaseJsonError);
                  const emptyShowcaseOnError = { blocks: [] };
                  setInitialAllServiceBlocksData(emptyShowcaseOnError);
                  if (!allServiceBlocksData) setAllServiceBlocksData(emptyShowcaseOnError);
                }
              }
            } else {
              console.error("Failed to load combined_data.json, status:", combinedResponse.status);
              const defaultData = {
                navbar: { navLinks: [{name: "Home", href: "/"}], logo: { url: '/assets/images/logo.png', name: 'logo.png' }, whiteLogo: { url: '/assets/images/logo-white.png', name: 'logo-white.png'} },
                mainPageBlocks: [], 
                hero: { title: "Welcome" }, 
              };
              setFormData(defaultData);
              setInitialFormDataForOldExport(JSON.parse(JSON.stringify(defaultData)));
            }
          } catch (error) {
            console.error("Error loading data:", error);
            // Set default data for all states
            const defaultData = {
              navbar: { navLinks: [{name: "Home", href: "/"}], logo: { url: '/assets/images/logo.png', name: 'logo.png' }, whiteLogo: { url: '/assets/images/logo-white.png', name: 'logo-white.png'} },
              mainPageBlocks: [], 
              hero: { title: "Welcome" }, 
            };
            setFormData(defaultData);
            setInitialFormDataForOldExport(JSON.parse(JSON.stringify(defaultData)));
          }
        }

        if (customDomain) {
          console.log("On custom domain:", window.location.hostname);
          try {
            // Fetch the domain-specific config
            const domainConfigResponse = await fetch('/api/public/config');
            console.log("Domain config response status:", domainConfigResponse.status);
            
            if (domainConfigResponse.ok) {
              const domainData = await domainConfigResponse.json();
              console.log("Successfully loaded domain config data");
              setFormData(domainData);
              setInitialFormDataForOldExport(JSON.parse(JSON.stringify(domainData)));
              setLoading(false);
              return;
            } else {
              console.error("Failed to load domain config. Status:", domainConfigResponse.status);
              const errorText = await domainConfigResponse.text();
              console.error("Error response:", errorText);
            }
          } catch (domainConfigError) {
            console.error("Error loading domain config:", domainConfigError);
          }
        }

        // If not on custom domain or domain config failed, check authentication
        console.log("Checking authentication status...");
        const authResponse = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        console.log("Auth response status:", authResponse.status);
        
        const authData = await authResponse.json();
        console.log("Auth data received:", authData);

        if (authData.isAuthenticated) {
          console.log("User is authenticated. Config ID:", authData.configId);
          try {
            // Fetch the user's custom config
            console.log("Fetching custom config from:", `/api/config/load`);
            const customConfigResponse = await fetch(`/api/config/load`, {
              credentials: 'include'
            });
            console.log("Custom config response status:", customConfigResponse.status);
            
            if (customConfigResponse.ok) {
              const configData = await customConfigResponse.json();
              console.log("Successfully loaded custom config data");
              if (configData.combined_data) {
                setFormData(configData.combined_data);
                setInitialFormDataForOldExport(JSON.parse(JSON.stringify(configData.combined_data)));
              }
              if (configData.about_page) {
                setAboutPageJsonData(configData.about_page);
                setInitialAboutPageJsonData(JSON.parse(JSON.stringify(configData.about_page)));
              }
              if (configData.all_blocks_showcase) {
                setAllServiceBlocksData(configData.all_blocks_showcase);
                setInitialAllServiceBlocksData(JSON.parse(JSON.stringify(configData.all_blocks_showcase)));
              }
              setLoading(false);
              return;
            } else {
              console.error("Failed to load custom config. Status:", customConfigResponse.status);
              const errorText = await customConfigResponse.text();
              console.error("Error response:", errorText);
            }
          } catch (customConfigError) {
            console.error("Error loading custom config:", customConfigError);
          }
        } else {
          console.log("User is not authenticated");
        }

        setLoading(false);

      } catch (error) {
        console.error("Error in fetchAllData:", error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [initialData, blockName, configColors]);

  const handleMainPageFormChange = (newMainPageFormData) => {
    setFormData(prev => {
      // Ensure we maintain the correct structure
      const updatedData = {
        ...prev,
        mainPageBlocks: newMainPageFormData.mainPageBlocks || prev.mainPageBlocks,
        navbar: newMainPageFormData.navbar || prev.navbar,
        hero: newMainPageFormData.hero || prev.hero
      };
      console.log("Updated main page form data:", updatedData);
      return updatedData;
    });
  };

  const handleAboutConfigChange = (newAboutConfig) => {
    console.log("About page JSON data changed:", newAboutConfig);
    setAboutPageJsonData(newAboutConfig);
  };

  const handleThemeColorChange = (newColors) => {
    setThemeColors(newColors);
    // Live update CSS variables from OneForm as well, in case ColorEditor's direct update has issues or for redundancy
    Object.keys(newColors).forEach(key => {
      const cssVarName = `--color-${key}`;
      document.documentElement.style.setProperty(cssVarName, newColors[key]);
    });
  };

  const fetchShowcaseData = async () => {
    if (allServiceBlocksData && allServiceBlocksData.blocks && allServiceBlocksData.blocks.length > 0) {
      console.log("fetchShowcaseData: Data already exists for showcase, skipping fetch.");
      return;
    }
    if (loadingAllServiceBlocks) return;

    setLoadingAllServiceBlocks(true);
    try {
      const response = await fetch("/data/all_blocks_showcase.json");
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

  // Handler to update showcase block config
  const handleShowcaseBlockConfigUpdate = (blockIndex, newConfig) => {
    setAllServiceBlocksData(prevData => {
      if (!prevData || !prevData.blocks) return prevData;
      const updatedBlocks = prevData.blocks.map((block, index) => {
        if (index === blockIndex) {
          return { ...block, config: newConfig };
        }
        return block;
      });
      return { ...prevData, blocks: updatedBlocks };
    });
  };

  // Handler for file changes in showcase blocks
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

    const processFile = async (file) => {
      // If it's a blob URL, fetch the actual file data
      if (typeof file === 'string' && file.startsWith('blob:')) {
        try {
          const response = await fetch(file);
          const blob = await response.blob();
          return new File([blob], 'pasted_image.png', { type: blob.type });
        } catch (error) {
          console.error('Error converting blob URL to file:', error);
          return null;
        }
      }
      return file;
    };

    const updateBlockConfig = async () => {
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
        // If it's a blob URL, convert it to a File
        if (fileOrFileObject.url.startsWith('blob:')) {
          const file = await processFile(fileOrFileObject.url);
          if (file) {
            const fileURL = URL.createObjectURL(file);
            newMediaConfig = {
              file: file,
              url: fileURL,
              name: fileOrFileObject.name || file.name,
              originalUrl: fileOrFileObject.originalUrl || `assets/showcase_uploads/generated/${file.name}`
            };
          } else {
            newMediaConfig = fileOrFileObject;
          }
        } else {
          newMediaConfig = fileOrFileObject;
        }
      } else if (typeof fileOrFileObject === 'string') { 
        if (existingMediaConfig && typeof existingMediaConfig === 'object' && existingMediaConfig.file && existingMediaConfig.url && existingMediaConfig.url.startsWith('blob:')) {
          URL.revokeObjectURL(existingMediaConfig.url);
        }
        // If it's a blob URL, convert it to a File
        if (fileOrFileObject.startsWith('blob:')) {
          const file = await processFile(fileOrFileObject);
          if (file) {
            const fileURL = URL.createObjectURL(file);
            newMediaConfig = {
              file: file,
              url: fileURL,
              name: file.name,
              originalUrl: fileOrFileObject
            };
          } else {
            newMediaConfig = {
              file: null,
              url: fileOrFileObject,
              name: fileOrFileObject.split('/').pop(),
              originalUrl: fileOrFileObject
            };
          }
        } else {
          newMediaConfig = {
            file: null,
            url: fileOrFileObject,
            name: fileOrFileObject.split('/').pop(),
            originalUrl: fileOrFileObject
          };
        }
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
        return { ...prevData, blocks: updatedBlocks };
      });
    };

    updateBlockConfig();
  };

  // Helper to get display URL, can be passed to blocks
  const getShowcaseDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'allServiceBlocks' && !allServiceBlocksData && !loadingAllServiceBlocks) {
      fetchShowcaseData();
    }
  };

  const handleServicesChange = (newServicesData) => {
    console.log("Services data changed:", newServicesData);
    setServicesData(newServicesData);
  };

  /**
   * handleSubmit - Generates and downloads a ZIP file with all edited content
   */
  const handleSubmit = async () => {
    try {
      if (!formData) {
        console.error("No form data to submit.");
        alert("No data available to download.");
        return;
      }
      
      const zip = new JSZip();
      let collectedAssets = [];

      // Process all_blocks_showcase.json first to ensure we have all assets
      if (allServiceBlocksData && !blockName) {
        console.log("Processing all_blocks_showcase.json for ZIP:", allServiceBlocksData);
        let showcaseAssets = [];
        const cleanedShowcaseData = traverseAndModifyDataForZip(
          allServiceBlocksData,
          showcaseAssets,
          'showcaseDataRoot',
          'user_uploads/showcase_data'
        );

        // Process showcase assets
        for (const asset of showcaseAssets) {
          if (asset.type === 'file' && asset.dataSource instanceof File) {
            console.log(`Adding showcase file to ZIP: ${asset.pathInZip}`);
            zip.file(asset.pathInZip, asset.dataSource);
          } else if (asset.type === 'url' && typeof asset.dataSource === 'string') {
            if (asset.dataSource.startsWith('blob:')) {
              try {
                const response = await fetch(asset.dataSource);
                const blob = await response.blob();
                console.log(`Adding blob URL content to ZIP: ${asset.pathInZip}`);
                zip.file(asset.pathInZip, blob);
              } catch (error) {
                console.error(`Error processing blob URL for ZIP: ${asset.pathInZip}`, error);
              }
            } else if (!asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:')) {
              try {
                const response = await fetch(asset.dataSource);
                const blob = await response.blob();
                console.log(`Adding local URL content to ZIP: ${asset.pathInZip}`);
                zip.file(asset.pathInZip, blob);
              } catch (error) {
                console.error(`Error processing local URL for ZIP: ${asset.pathInZip}`, error);
              }
            }
          }
        }

        zip.file("json/all_blocks_showcase.json", JSON.stringify(cleanedShowcaseData, null, 2));
        console.log("Added all_blocks_showcase.json to ZIP");
      }

      // Fetch initial services.json once if needed for "old" processing
      let initialServicesJsonData = null; 
      if (!blockName) { 
        try {
          const servicesResponse = await fetch("/data/ignore/services.json");
          if (servicesResponse.ok) {
            initialServicesJsonData = await servicesResponse.json();
            console.log("[OneForm] Fetched initial services.json for OLD ZIP processing.");
          } else {
            console.warn("[OneForm] Failed to fetch initial services.json for OLD ZIP processing.");
          }
        } catch (err) {
          console.error("[OneForm] Error fetching initial services.json for OLD ZIP:", err);
        }
      }

      // --- Process "OLD" data if available (for full OneForm, not single block mode) ---
      const oldAssetPaths = new Set();
      if (initialFormDataForOldExport) {
        console.log("Processing OLD data for ZIP:", initialFormDataForOldExport);
        let oldCollectedAssets = []; 
        const cleanedOldCombinedData = traverseAndModifyDataForZip(
          initialFormDataForOldExport,
          oldCollectedAssets,
          'oldFormDataRoot', 
          'user_uploads/old_combined_data' 
        );
        zip.file("old/json/combined_data.json", JSON.stringify(cleanedOldCombinedData, null, 2));
        
        oldCollectedAssets.forEach(asset => oldAssetPaths.add(asset.pathInZip));

        const oldAssetProcessingPromises = oldCollectedAssets.map(async (asset) => {
          const assetPathInZip = `old/${asset.pathInZip}`;
          try {
            if (asset.type === 'url' && typeof asset.dataSource === 'string') {
              if (!asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:') && !asset.dataSource.startsWith('blob:')) {
                const fetchUrl = asset.dataSource.startsWith('/') ? asset.dataSource : `/${asset.dataSource}`;
                const response = await fetch(fetchUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText} for ${fetchUrl}`);
                const blob = await response.blob();
                zip.file(assetPathInZip, blob);
              }
            } else if (asset.type === 'file' && asset.dataSource instanceof File) {
              // This case implies initialFormDataForOldExport itself contained File objects (less common)
              zip.file(assetPathInZip, asset.dataSource);
            }
          } catch (assetError) {
            console.error(`Error processing OLD asset ${assetPathInZip}:`, assetError);
          }
        });
        await Promise.all(oldAssetProcessingPromises);

        // Process OLD about_page.json
        if (initialAboutPageJsonData && !blockName) {
          console.log("Processing OLD about_page.json for ZIP:", initialAboutPageJsonData);
          let oldAboutAssets = [];
          const cleanedOldAboutData = traverseAndModifyDataForZip(
            initialAboutPageJsonData,
            oldAboutAssets,
            'oldAboutPageDataRoot',
            'user_uploads/old_about_page_data'
          );
          zip.file("old/json/about_page.json", JSON.stringify(cleanedOldAboutData, null, 2));
          oldAboutAssets.forEach(asset => oldAssetPaths.add(asset.pathInZip)); // Add relative path to set
          const oldAboutAssetPromises = oldAboutAssets.map(async (asset) => {
            const assetPathInZip = `old/${asset.pathInZip}`;
             try {
                if (asset.type === 'url' && typeof asset.dataSource === 'string') {
                  if (!asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:') && !asset.dataSource.startsWith('blob:')) {
                    const fetchUrl = asset.dataSource.startsWith('/') ? asset.dataSource : `/${asset.dataSource}`;
                    const response = await fetch(fetchUrl);
                    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText} for ${fetchUrl}`);
                    const blob = await response.blob();
                    zip.file(assetPathInZip, blob);
                  }
                } else if (asset.type === 'file' && asset.dataSource instanceof File) {
                  zip.file(assetPathInZip, asset.dataSource);
                }
              } catch (assetError) {
                console.error(`Error processing OLD about_page.json asset ${assetPathInZip}:`, assetError);
              }
          });
          await Promise.all(oldAboutAssetPromises);
          console.log("[OneForm] Added old/json/about_page.json to ZIP.");
        }

        if (!blockName && initialServicesJsonData) { // Check if initialServicesJsonData was successfully fetched for OLD
            try {
                    let oldServiceAssets = []; 
                    const cleanedServicesDataOld = traverseAndModifyDataForZip(
                        initialServicesJsonData, // Use pre-fetched initial data
                        oldServiceAssets,
                        'oldServicesDataRoot',
                        'user_uploads/old_services_data'
                    );
                    zip.file("old/json/services.json", JSON.stringify(cleanedServicesDataOld, null, 2));
                    oldServiceAssets.forEach(asset => oldAssetPaths.add(asset.pathInZip));
                    const oldServiceAssetPromises = oldServiceAssets.map(async (asset) => {
                        const assetPathInZip = `old/${asset.pathInZip}`;
                        if (asset.type === 'url' && typeof asset.dataSource === 'string' && !asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:') && !asset.dataSource.startsWith('blob:')) {
                            const fetchUrl = asset.dataSource.startsWith('/') ? asset.dataSource : `/${asset.dataSource}`;
                            const response = await fetch(fetchUrl);
                            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText} for ${fetchUrl}`);
                            const blob = await response.blob();
                            zip.file(assetPathInZip, blob);
                        } else if (asset.type === 'file' && asset.dataSource instanceof File) { // Handle direct files if they somehow end up in initial data
                           zip.file(assetPathInZip, asset.dataSource);
                        }
                        // Blob URLs in OLD data (if any) would also be handled by the 'url' type check if fetched like other URLs
                    });
                    await Promise.all(oldServiceAssetPromises);
                    console.log("[OneForm] Added old/json/services.json to ZIP using initial static data.");
            } catch (serviceError) {
                console.error("Error processing OLD services.json for ZIP:", serviceError);
            }
        }

        // Process OLD all_blocks_showcase.json
        if (!blockName && initialAllServiceBlocksData) {
          console.log("Processing OLD all_blocks_showcase.json for ZIP:", initialAllServiceBlocksData);
          let oldShowcaseAssets = [];
          const cleanedOldShowcaseData = traverseAndModifyDataForZip(
            initialAllServiceBlocksData,
            oldShowcaseAssets,
            'oldShowcaseDataRoot',
            'user_uploads/old_showcase_data'
          );
          zip.file("old/json/all_blocks_showcase.json", JSON.stringify(cleanedOldShowcaseData, null, 2));
          oldShowcaseAssets.forEach(asset => oldAssetPaths.add(asset.pathInZip)); // Add relative path to set
          const oldShowcaseAssetPromises = oldShowcaseAssets.map(async (asset) => {
            const assetPathInZip = `old/${asset.pathInZip}`;
            try {
                if (asset.type === 'url' && typeof asset.dataSource === 'string') {
                  if (!asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:') && !asset.dataSource.startsWith('blob:')) {
                    const fetchUrl = asset.dataSource.startsWith('/') ? asset.dataSource : `/${asset.dataSource}`;
                    const response = await fetch(fetchUrl);
                    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText} for ${fetchUrl}`);
                    const blob = await response.blob();
                    zip.file(assetPathInZip, blob);
                  }
                } else if (asset.type === 'file' && asset.dataSource instanceof File) {
                  zip.file(assetPathInZip, asset.dataSource);
                }
              } catch (assetError) {
                console.error(`Error processing OLD all_blocks_showcase.json asset ${assetPathInZip}:`, assetError);
              }
          });
          await Promise.all(oldShowcaseAssetPromises);
          console.log("[OneForm] Added old/json/all_blocks_showcase.json to ZIP.");
        }

        console.log("[OneForm] Paths of assets included in OLD export:", Array.from(oldAssetPaths));

        // Add old colors_output.json
        if (initialThemeColors) {
            const colorsForOldJson = {};
            Object.keys(initialThemeColors).forEach(key => {
              colorsForOldJson[key.replace(/-/g, '_')] = initialThemeColors[key];
            });
            zip.file("old/json/colors_output.json", JSON.stringify(colorsForOldJson, null, 2));
            console.log("[OneForm] Added old/json/colors_output.json to ZIP with snake_case keys.");
        }
      }

      // --- Process "NEW" (current formData) data ---
      const newPathPrefix = initialFormDataForOldExport ? "new/" : ""; 
      console.log("Processing NEW data for ZIP:", formData);
      let newCollectedAssets = [];

      // Ensure we're using the correct data structure for authenticated users
      const dataToProcess = formData.combined_data || formData;
      
      const cleanedNewCombinedData = traverseAndModifyDataForZip(
        dataToProcess,
        newCollectedAssets,
        newPathPrefix ? 'newFormDataRoot' : 'formDataRoot',
        newPathPrefix ? 'user_uploads/new_combined_data' : 'user_uploads/combined_data'
      );
      zip.file(`${newPathPrefix}json/combined_data.json`, JSON.stringify(cleanedNewCombinedData, null, 2));
      console.log("Cleaned NEW combined_data for ZIP:", cleanedNewCombinedData);

      if (!blockName) {
        const currentServicesData = getServicesData();
        if (currentServicesData) {
          try {
            const serviceAssetsForNew = []; 
            const cleanedServicesDataNew = traverseAndModifyDataForZip(
              currentServicesData,
              serviceAssetsForNew,
              newPathPrefix ? 'newServicesDataRoot' : 'servicesDataRoot',
              newPathPrefix ? 'user_uploads/new_services_data' : 'user_uploads/services_data'
            );
            zip.file(`${newPathPrefix}json/services.json`, JSON.stringify(cleanedServicesDataNew, null, 2));
            newCollectedAssets.push(...serviceAssetsForNew);
            console.log(`[OneForm] Added ${newPathPrefix}json/services.json to ZIP using live data from ServiceEditPage.`);
          } catch (serviceError) {
            console.error(`Error processing ${newPathPrefix}services.json from ServiceEditPage for ZIP:`, serviceError);
          }
        }
      }
      
      // De-duplicate and prioritize File objects for NEW assets
      const finalNewAssetsMap = new Map();
      console.log("[OneForm] Initial newCollectedAssets count:", newCollectedAssets.length);
      
      // Process NEW about_page.json (if available)
      if (aboutPageJsonData && !blockName) {
        console.log("Processing NEW about_page.json for ZIP:", aboutPageJsonData);
        let newAboutAssets = [];
        const cleanedNewAboutData = traverseAndModifyDataForZip(
          aboutPageJsonData,
          newAboutAssets,
          newPathPrefix ? 'newAboutPageDataRoot' : 'aboutPageDataRoot',
          newPathPrefix ? 'user_uploads/new_about_page_data' : 'user_uploads/about_page_data'
        );
        zip.file(`${newPathPrefix}json/about_page.json`, JSON.stringify(cleanedNewAboutData, null, 2));
        newCollectedAssets.push(...newAboutAssets); // Add about page assets to the main new list
        console.log(`[OneForm] Added ${newPathPrefix}json/about_page.json to ZIP.`);
      }

      // Process "NEW" all_blocks_showcase.json (if allServiceBlocksData exists)
      if (allServiceBlocksData && !blockName) {
        console.log("Processing NEW all_blocks_showcase.json for ZIP:", allServiceBlocksData);
        let newShowcaseAssets = [];
        const cleanedNewShowcaseData = traverseAndModifyDataForZip(
          allServiceBlocksData,
          newShowcaseAssets,
          newPathPrefix ? 'newShowcaseDataRoot' : 'showcaseDataRoot',
          newPathPrefix ? 'user_uploads/new_showcase_data' : 'user_uploads/showcase_data'
        );
        zip.file(`${newPathPrefix}json/all_blocks_showcase.json`, JSON.stringify(cleanedNewShowcaseData, null, 2));
        newCollectedAssets.push(...newShowcaseAssets); // Add showcase assets to the main new list
        console.log(`[OneForm] Added ${newPathPrefix}json/all_blocks_showcase.json to ZIP.`);
      }

      newCollectedAssets.forEach(asset => {
        const assetPathInZip = asset.pathInZip;
        
        const existingAsset = finalNewAssetsMap.get(assetPathInZip);
        if (existingAsset) {
          if (existingAsset.type === 'url' && asset.type === 'file') {
            // console.log(`[OneForm] Prioritizing FILE over URL for path: ${assetPathInZip}`);
            finalNewAssetsMap.set(assetPathInZip, asset);
          } else if (existingAsset.type === 'file' && asset.type === 'url') {
            // console.log(`[OneForm] Keeping existing FILE, ignoring URL for path: ${assetPathInZip}`);
          } else {
            finalNewAssetsMap.set(assetPathInZip, asset);
          }
        } else {
          finalNewAssetsMap.set(assetPathInZip, asset);
        }
      });

      const prioritizedNewAssets = Array.from(finalNewAssetsMap.values());
      console.log("[OneForm] Prioritized new assets count:", prioritizedNewAssets.length);
      // prioritizedNewAssets.forEach(a => console.log(`  Prioritized asset: path=${a.pathInZip}, type=${a.type}, src=${typeof a.dataSource === 'object' ? a.dataSource.name : a.dataSource}`));

      // Filter for truly new or changed assets to include in the new/assets folder
      const assetsForNewFolder = prioritizedNewAssets.filter(asset => {
        console.log(`[OneForm] FILTERING for new/assets: path="${asset.pathInZip}", type="${asset.type}", dataSourceType="${typeof asset.dataSource}", isFileObj=${asset.dataSource instanceof File}`);
        if (asset.type === 'file') {
          console.log(`[OneForm] Including FILE in new/assets: ${asset.pathInZip} (name: ${asset.dataSource.name})`);
          return true; // Always include new file uploads
        }
        // For type 'url', only include if it was NOT in the old assets OR if it's a blob (newly pasted image).
        if (asset.type === 'url') {
            if (!oldAssetPaths.has(asset.pathInZip) || asset.dataSource.startsWith('blob:')){
                console.log(`[OneForm] Including URL in new/assets (not in old OR is blob): ${asset.pathInZip}`);
                return true;
            }
            console.log(`[OneForm] SKIPPING URL in new/assets (already in old and not a blob): ${asset.pathInZip}`);
            return false;
        }
        return false; // Should not happen if types are only 'file' or 'url'
      });
      console.log("[OneForm] Assets to be physically included in new/assets/ folder:", assetsForNewFolder.map(a => a.pathInZip));

      // Filter out any assets that might have slipped through but should be excluded (for "NEW" assets) - this filtering is now part of assetsForNewFolder logic
      // const filteredFinalNewAssets = finalNewAssets.filter(asset => { ... });
      
      // console.log(`Filtered out ${prioritizedNewAssets.length - assetsForNewFolder.length} assets for NEW physical inclusion`);
      console.log("Final NEW assets for ZIP (physical files in new/assets):");
      assetsForNewFolder.forEach(a => console.log(`  Path: ${newPathPrefix}${a.pathInZip}, Type: ${a.type}`));

      // Add only the truly new/changed assets to the new/assets folder in the ZIP
      const newAssetProcessingPromises = assetsForNewFolder.map(async (asset) => {
        const assetPathInZip = `${newPathPrefix}${asset.pathInZip}`;
        try {
          if (asset.type === 'file' && asset.dataSource instanceof File) {
            console.log(`[OneForm] ADDING File to NEW ZIP: path="${assetPathInZip}",fileName="${asset.dataSource.name}", fileSize=${asset.dataSource.size}`);
            zip.file(assetPathInZip, asset.dataSource);
          } else if (asset.type === 'url' && typeof asset.dataSource === 'string') {
            if (!asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:') && !asset.dataSource.startsWith('blob:')) {
              const fetchUrl = asset.dataSource.startsWith('/') ? asset.dataSource : `/${asset.dataSource}`;
              console.log(`[OneForm] FETCHING local URL for NEW ZIP: path="${assetPathInZip}", from="${fetchUrl}"`);
              const response = await fetch(fetchUrl);
              if (!response.ok) {
                console.error(`[OneForm] FAILED to fetch local URL "${fetchUrl}" for NEW ZIP. Status: ${response.status}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText} for ${fetchUrl}`);
              }
              const blob = await response.blob();
              console.log(`[OneForm] ADDING fetched local URL content to NEW ZIP: path="${assetPathInZip}", size=${blob.size}`);
              zip.file(assetPathInZip, blob);
            } else if (asset.dataSource.startsWith('blob:')) {
                console.log(`[OneForm] FETCHING blob URL for NEW ZIP: path="${assetPathInZip}", from="${asset.dataSource}"`);
                const response = await fetch(asset.dataSource);
                if (!response.ok) {
                    console.error(`[OneForm] FAILED to fetch blob URL "${asset.dataSource}" for NEW ZIP. Status: ${response.status}`);
                    throw new Error(`HTTP ${response.status}: Failed to fetch blob ${asset.dataSource}`);
                }
                const blobContent = await response.blob();
                console.log(`[OneForm] ADDING fetched blob URL content to NEW ZIP: path="${assetPathInZip}", size=${blobContent.size}`);
                zip.file(assetPathInZip, blobContent);
            } else {
              // External http/https URLs are not added to the ZIP here by default
              console.log(`[OneForm] SKIPPING external URL for NEW ZIP: path="${assetPathInZip}", url="${asset.dataSource}"`);
            }
          }
        } catch (assetError) {
          console.error(`Error processing NEW asset ${assetPathInZip} for ZIP:`, assetError);
        }
      });
      await Promise.all(newAssetProcessingPromises);

      // Add new colors_output.json
      if (themeColors) {
        const colorsForNewJson = {};
        Object.keys(themeColors).forEach(key => {
          colorsForNewJson[key.replace(/-/g, '_')] = themeColors[key];
        });
        zip.file(`${newPathPrefix}json/colors_output.json`, JSON.stringify(colorsForNewJson, null, 2));
        console.log(`[OneForm] Added ${newPathPrefix}json/colors_output.json to ZIP with snake_case keys.`);
      }

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
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
        <p>Loading data...</p>
      </div>
    );
  }
  
  if (!formData) { // Check if formData is null after loading attempt
    return (
      <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
        <p>Failed to load form data. Please check console for errors or try refreshing.</p>
      </div>
    );
  }

  // If editing a specific block (e.g., /edit/hero), render MainPageForm in singleBlockMode
  if (blockName && title) {
    console.log(`OneForm: Editing specific block: ${blockName}`, formData);
    // Pass only the relevant part of formData for the specific block and the navbar config
    const singleBlockData = formData[blockName] || {};
    const navbarDataForSingleBlock = formData.navbar || { navLinks: [], logo: '', whiteLogo: '' };

    return (
      <div className="min-h-screen bg-gray-100 text-black">
        <div className="bg-gray-900 text-white p-3 shadow-md sticky top-0 z-50 flex justify-between items-center">
          <h1 className="text-xl font-medium">{title}</h1>
          <button onClick={handleSubmit} type="button" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
            Download JSON for {blockName}
          </button>
        </div>
        <div className="p-4">
          <MainPageForm
            formData={{ [blockName]: singleBlockData, navbar: navbarDataForSingleBlock }}
            setFormData={setFormData}
            singleBlockMode={blockName}
            themeColors={themeColors} // Pass themeColors
          />
        </div>
      </div>
    );
  }

  // Render the full OneForm editor interface
  console.log("Rendering OneForm full editor with data:", formData);
  const oneFormNavbarConfig = formData.navbar || { navLinks: [], logo: '', whiteLogo: '' };

  // Tab Button data
  const tabs = [
    { id: "mainPage", label: "Main Page Blocks" },
    { id: "services", label: "Service Pages" },
    { id: "about", label: "About Page Block" },
    { id: "colors", label: "Theme Colors" },
    { id: "allServiceBlocks", label: "All Service Blocks" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col">
      {/* Top OneForm Navigation Bar - Always Sticky */}
      <div className="bg-gray-900 text-white p-3 shadow-md sticky top-0 z-[60] flex justify-between items-center">
        <h1 className="text-[5vh] font-serif">WebEdit</h1>
        <button onClick={handleSubmit} type="button" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
          Download ZIP
        </button>
      </div>
      
      {/* Tab Navigation and Content */}
      <div className="flex-grow">
        <div className="bg-gray-800 px-4 flex border-b border-gray-700 shadow-md">
          {tabs.map(tabInfo => (
            <TabButton 
              key={tabInfo.id} 
              id={tabInfo.id} 
              label={tabInfo.label} 
              isActive={activeTab === tabInfo.id} 
              onClick={() => handleTabChange(tabInfo.id)} 
            />
          ))}
          {!isCustomDomain && (
            <OneFormAuthButton 
              formData={formData}
              themeColors={themeColors}
              servicesData={servicesData}
              aboutPageData={aboutPageJsonData}
              showcaseData={allServiceBlocksData}
            />
          )}
        </div>

        <div className="tab-content">
          {activeTab === "mainPage" && (
            <MainPageForm 
              formData={formData} 
              setFormData={handleMainPageFormChange}
              themeColors={themeColors}
            />
          )}
          {activeTab === "services" && 
            <ServiceEditPage 
              themeColors={themeColors}
              servicesData={servicesData}
              onServicesChange={handleServicesChange}
            />
          }
          {activeTab === "about" && (
            <div className="container mx-auto px-4 py-6 bg-gray-100">
              <div className="mb-4 bg-gray-800 text-white p-4 rounded">
                <h1 className="text-2xl font-bold">About Page Content</h1>
                <p className="text-gray-300 mt-1">Edit the about page block content</p>
              </div>
              <div className="relative border border-gray-300 bg-white overflow-hidden">
                <AboutBlock
                  readOnly={false}
                  aboutData={aboutPageJsonData || {}}
                  onConfigChange={handleAboutConfigChange}
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
            <div className="p-4">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Service Blocks Showcase</h2>
              {loadingAllServiceBlocks && <p>Loading showcase blocks...</p>}
              {(!loadingAllServiceBlocks && !allServiceBlocksData) && <p>Could not load showcase data. Check console.</p>}
              {allServiceBlocksData && allServiceBlocksData.blocks && (
                <div className="space-y-0">
                  {allServiceBlocksData.blocks.map((block, index) => {
                    const BlockComponent = serviceBlockMap[block.blockName];
                    const isEditingThisBlock = activeEditShowcaseBlockIndex === index;
                    if (!BlockComponent) {
                      return <div key={index} className="p-2 my-1 bg-red-100 text-red-700 rounded">Unknown block: {block.blockName}</div>;
                    }
                    return (
                      <div key={block.uniqueKey || `showcase-${index}`} className="relative border-t border-b border-gray-300 mb-0 bg-white overflow-hidden">
                        <div className="absolute top-2 right-2 z-40">
                          <button
                            type="button"
                            onClick={() => setActiveEditShowcaseBlockIndex(isEditingThisBlock ? null : index)}
                            className={`${isEditingThisBlock ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-1.5 shadow-lg transition-colors`}
                            title={isEditingThisBlock ? "Done Editing" : "Edit Block"}
                          >
                            {isEditingThisBlock ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"/></svg>
                            )}
                          </button>
                        </div>
                        <BlockComponent
                          config={block.config || {}}
                          readOnly={!isEditingThisBlock}
                          onConfigChange={(newFullConfig) => handleShowcaseBlockConfigUpdate(index, newFullConfig)}
                          getDisplayUrl={getShowcaseDisplayUrl}
                          onFileChange={(fieldKeyOrPathData, file) => handleShowcaseFileChangeForBlock(index, fieldKeyOrPathData, file)}
                          blockContext="allServiceBlocks"
                          themeColors={themeColors}
                        />
                        {isEditingThisBlock && BlockComponent.EditorPanel && (
                          <div className="border-t border-gray-200 bg-gray-100 p-4">
                            <h3 className="text-md font-semibold text-gray-700 mb-3">{block.blockName} - Edit Panel</h3>
                            <BlockComponent.EditorPanel
                              currentConfig={block.config || {}}
                              onPanelConfigChange={(updatedFields) => {
                                const currentBlockConfig = allServiceBlocksData.blocks[index].config || {};
                                const newConfig = { ...currentBlockConfig, ...updatedFields };
                                handleShowcaseBlockConfigUpdate(index, newConfig);
                              }}
                              onPanelFileChange={(fieldKeyOrPathData, file) => {
                                handleShowcaseFileChangeForBlock(index, fieldKeyOrPathData, file);
                              }}
                              getDisplayUrl={getShowcaseDisplayUrl}
                              blockContext="allServiceBlocks"
                              themeColors={themeColors}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
