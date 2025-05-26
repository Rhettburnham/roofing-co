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

import ServiceEditPage, { getServicesData } from "./ServiceEditPage";
import MainPageForm from "./MainPageForm";
import AboutBlock from "./MainPageBlocks/AboutBlock";
import Navbar from "./Navbar"; // Import Navbar for preview
import ColorEditor from "./ColorEditor"; // Import the new ColorEditor component
import ServicePage from "./ServicePage"; // For rendering all blocks
import { blockMap as serviceBlockMap } from './ServiceEditPage'; // Import blockMap for rendering service blocks

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
  const [initialFormDataForOldExport, setInitialFormDataForOldExport] = useState(null); // For "old" export
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mainPage");
  const [themeColors, setThemeColors] = useState(null); // State for current theme colors
  const [initialThemeColors, setInitialThemeColors] = useState(null); // State for initial theme colors for "old" export

  // State for the "All Service Blocks" tab
  const [allServiceBlocksData, setAllServiceBlocksData] = useState(null);
  const [loadingAllServiceBlocks, setLoadingAllServiceBlocks] = useState(false);
  const [activeEditShowcaseBlockIndex, setActiveEditShowcaseBlockIndex] = useState(null);

  // On mount, fetch combined_data.json to populate the form if no initialData is provided
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch theme colors first
        try {
          const colorsResponse = await fetch("/data/colors_output.json"); // Ensure this path is correct
          if (colorsResponse.ok) {
            const colors = await colorsResponse.json();
            setThemeColors(colors);
            setInitialThemeColors(JSON.parse(JSON.stringify(colors))); // Deep copy for "old" export
            // Apply colors as CSS variables
            Object.keys(colors).forEach(key => {
              const cssVarName = `--color-${key.replace('_', '-')}`;
              document.documentElement.style.setProperty(cssVarName, colors[key]);
            });
            console.log("OneForm: Loaded theme colors:", colors);
          } else {
            console.warn("OneForm: Failed to load theme colors from colors_output.json. Using defaults or previously set.");
            const defaultColors = { accent: '#2B4C7E', banner: '#1A2F4D', "second-accent": '#FFF8E1', "faint-color": '#E0F7FA' };
            setThemeColors(defaultColors);
            setInitialThemeColors(JSON.parse(JSON.stringify(defaultColors)));
          }
        } catch (colorsError) {
          console.error("OneForm: Error loading theme colors:", colorsError);
           const defaultColorsOnError = { accent: '#2B4C7E', banner: '#1A2F4D', "second-accent": '#FFF8E1', "faint-color": '#E0F7FA' };
           setThemeColors(defaultColorsOnError);
           setInitialThemeColors(JSON.parse(JSON.stringify(defaultColorsOnError)));
        }

        let dataToSet;
        // If initialData is provided, use it directly (for single block editing like /edit/hero)
        if (initialData && blockName) {
          const baseData = { ...initialData };
          if (!baseData.navbar && initialData.navbar) baseData.navbar = initialData.navbar;
          else if (!baseData.navbar) baseData.navbar = { navLinks: [{name: "Home", href: "/"}], logo: { url: '/assets/images/logo.png', name: 'logo.png' }, whiteLogo: { url: '/assets/images/logo-white.png', name: 'logo-white.png'} };
          dataToSet = { [blockName]: baseData[blockName] || baseData, navbar: baseData.navbar };
        } else if (initialData && !blockName) { // Case where OneForm is loaded with full data but not for a single block.
          dataToSet = initialData;
        } else {
          // Default: fetch the full combined_data.json for the main OneForm editor
          try {
            const combinedResponse = await fetch(
              "/data/raw_data/step_4/combined_data.json"
            );
            if (combinedResponse.ok) {
              dataToSet = await combinedResponse.json();
              console.log("Loaded combined data:", dataToSet);
            } else {
              console.error("Failed to load combined_data.json, status:", combinedResponse.status);
            }
          } catch (combinedError) {
            console.error("Error loading combined data:", combinedError);
          }
        }

        if (!dataToSet) { // Fallback if fetching or initialData failed
            console.warn("Falling back to default data structure for OneForm.");
            dataToSet = {
              navbar: { navLinks: [{name: "Home", href: "/"}], logo: { url: '/assets/images/logo.png', name: 'logo.png' }, whiteLogo: { url: '/assets/images/logo-white.png', name: 'logo-white.png'} },
              mainPageBlocks: [], 
              hero: { title: "Welcome" }, 
            };
        }
        
        setFormData(dataToSet);
        // Store a deep copy for the "old" export state, only if not in single block mode for simplicity of "old" state
        if (!blockName) {
            try {
                setInitialFormDataForOldExport(JSON.parse(JSON.stringify(dataToSet)));
            } catch (e) {
                console.error("Could not deep clone initial data for old export:", e);
                setInitialFormDataForOldExport(null); // or some other fallback
            }
        } else {
            setInitialFormDataForOldExport(null); // Don't create "old" folder for single block edits
        }
        setLoading(false);

        // Fetch data for "All Service Blocks" tab if it becomes active and data isn't loaded
        if (activeTab === 'allServiceBlocks' && !allServiceBlocksData) {
            fetchShowcaseData();
        }

      } catch (error) {
        console.error("Error loading form data:", error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [initialData, blockName, activeTab]);

  const handleMainPageFormChange = (newMainPageFormData) => {
    setFormData(prev => ({
        ...prev, 
        ...newMainPageFormData 
    }));
};

  const handleAboutConfigChange = (newAboutConfig) => {
    console.log("About config changed:", newAboutConfig);
    setFormData((prev) => ({ ...prev, aboutPage: newAboutConfig }));
  };

  const handleThemeColorChange = (newColors) => {
    setThemeColors(newColors);
    // Live update CSS variables from OneForm as well, in case ColorEditor's direct update has issues or for redundancy
    Object.keys(newColors).forEach(key => {
        const cssVarName = `--color-${key.replace('_', '-')}`; // Ensure hyphens for CSS vars
        document.documentElement.style.setProperty(cssVarName, newColors[key]);
    });
  };

  const fetchShowcaseData = async () => {
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
      // Optionally set an error state to display to the user
    } finally {
      setLoadingAllServiceBlocks(false);
    }
  };

  // Handler to update showcase block config (similar to ServiceEditPage's handleBlockConfigUpdate)
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

  // Handler for file changes in showcase blocks (similar to ServiceEditPage's handleFileChangeForBlock)
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
        existingMediaConfig = currentBlock.config[fieldToUpdate]; // Fallback for direct config if item path is wrong
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
                // General nested field like item.image
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

  // Helper to get display URL, can be passed to blocks
  const getShowcaseDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value; // Handles direct URLs or blob URLs
    if (typeof value === "object" && value.url) return value.url; // Handles { url: '...', ... }
    return null;
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
      let collectedAssets = []; // Re-initialize for each export section if needed, or manage carefully

      // Fetch services.json once if needed for both old and new processing
      let servicesJsonData = null;
      if (!blockName) { // Only fetch if not in single block mode, as services.json is for full site context
        try {
          const servicesResponse = await fetch("/data/ignore/services.json");
          if (servicesResponse.ok) {
            servicesJsonData = await servicesResponse.json();
            console.log("[OneForm] Fetched services.json for ZIP processing.");
          } else {
            console.warn("[OneForm] Failed to fetch services.json for ZIP processing.");
          }
        } catch (err) {
          console.error("[OneForm] Error fetching services.json for ZIP:", err);
        }
      }

      // --- Process "OLD" data if available (for full OneForm, not single block mode) ---
      const oldAssetPaths = new Set(); // To store paths of assets in the "old" export
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
        
        oldCollectedAssets.forEach(asset => oldAssetPaths.add(asset.pathInZip)); // Add relative path to set

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

        if (!blockName && servicesJsonData) { // Check if servicesJsonData was successfully fetched
            try {
                // const servicesResponse = await fetch("/data/ignore/services.json"); 
                // if (servicesResponse.ok) {
                    // const servicesDataOld = await servicesResponse.json();
                    let oldServiceAssets = []; 
                    const cleanedServicesDataOld = traverseAndModifyDataForZip(
                        servicesJsonData, // Use pre-fetched data
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
                        }
                    });
                    await Promise.all(oldServiceAssetPromises);
                // }
            } catch (serviceError) {
                console.error("Error processing OLD services.json for ZIP:", serviceError);
            }
        }
        console.log("[OneForm] Paths of assets included in OLD export:", Array.from(oldAssetPaths));

        // Add old colors_output.json
        if (initialThemeColors) {
            zip.file("old/json/colors_output.json", JSON.stringify(initialThemeColors, null, 2));
            console.log("[OneForm] Added old/json/colors_output.json to ZIP.");
        }
      }

      // --- Process "NEW" (current formData) data ---
      const newPathPrefix = initialFormDataForOldExport ? "new/" : ""; 
      console.log("Processing NEW data for ZIP:", formData);
      let newCollectedAssets = []; // Use a different variable name to avoid confusion with old assets

      const cleanedNewCombinedData = traverseAndModifyDataForZip(
        formData,
        newCollectedAssets, // Pass the new array
        newPathPrefix ? 'newFormDataRoot' : 'formDataRoot',
        newPathPrefix ? 'user_uploads/new_combined_data' : 'user_uploads/combined_data'
      );
      zip.file(`${newPathPrefix}json/combined_data.json`, JSON.stringify(cleanedNewCombinedData, null, 2));
      console.log("Cleaned NEW combined_data for ZIP:", cleanedNewCombinedData);
      // console.log("Assets collected from NEW combined_data:", newCollectedAssets); // Log raw newCollectedAssets

      if (!blockName && servicesJsonData) { // Check if servicesJsonData was successfully fetched
        try {
          // const servicesResponse = await fetch("/data/ignore/services.json"); 
          // if (servicesResponse.ok) {
            // const servicesDataNew = await servicesResponse.json();
            const serviceAssetsForNew = []; // Separate asset collection for services
            const cleanedServicesDataNew = traverseAndModifyDataForZip(
                servicesJsonData, // Use pre-fetched data
                serviceAssetsForNew,
                newPathPrefix ? 'newServicesDataRoot' : 'servicesDataRoot',
                newPathPrefix ? 'user_uploads/new_services_data' : 'user_uploads/services_data'
            );
            zip.file(`${newPathPrefix}json/services.json`, JSON.stringify(cleanedServicesDataNew, null, 2));
            newCollectedAssets.push(...serviceAssetsForNew); // Add service assets to the main new list
          // }
        } catch (serviceError) {
          console.error(`Error processing ${newPathPrefix}services.json for ZIP:`, serviceError);
        }
      }
      
      // De-duplicate and prioritize File objects for NEW assets
      const finalNewAssetsMap = new Map();
      console.log("[OneForm] Initial newCollectedAssets count:", newCollectedAssets.length);
      newCollectedAssets.forEach(asset => {
        const assetPathInZip = asset.pathInZip; 
        // console.log(`[OneForm] Processing asset for final map: pathInZip=${assetPathInZip}, type=${asset.type}, dataSource=${typeof asset.dataSource === 'object' ? asset.dataSource.name || 'FileObject' : asset.dataSource}`);
        
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
        zip.file(`${newPathPrefix}json/colors_output.json`, JSON.stringify(themeColors, null, 2));
        console.log(`[OneForm] Added ${newPathPrefix}json/colors_output.json to ZIP.`);
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
        {/* For single block editing, we might not show the OneForm Navbar editor, just the block's form */}
        {/* Or, if `initialData` was meant to be the *entire* site structure, this changes */}
        {/* The current logic in useEffect for initialData aims to make `formData` hold the full structure or the specific block. */}
        <div className="p-4">
          <MainPageForm
            formData={{ [blockName]: singleBlockData, navbar: navbarDataForSingleBlock }} // Pass necessary data for the single block
            setFormData={setFormData} // This would update OneForm's main formData state
            singleBlockMode={blockName}
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
    { id: "allServiceBlocks", label: "All Service Blocks" } // New tab
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
      
      {/* Tab Navigation and Content - below the sticky navbar editor */}
      <div className="flex-grow">
        <div className="bg-gray-800 px-4 flex border-b border-gray-700 shadow-md sticky top-[calc(3.5rem+env(safe-area-inset-top,0px)+Xpx)] z-[50]">
          {/* Xpx needs to be the height of the rendered Navbar preview section */}
          {/* This sticky positioning for tabs might be complex to get right with dynamic navbar height */}
          {/* For simplicity, let's make tabs not sticky for now, or assume fixed height for navbar */}
          <div className="bg-gray-800 px-4 flex border-b border-gray-700 shadow-md">
            {tabs.map(tabInfo => (
              <TabButton 
                key={tabInfo.id} 
                id={tabInfo.id} 
                label={tabInfo.label} 
                isActive={activeTab === tabInfo.id} 
                onClick={() => setActiveTab(tabInfo.id)} 
              />
            ))}
          </div>
        </div>

        <div className="tab-content">
          {activeTab === "mainPage" && (
            // Pass formData.mainPageBlocks if that's how MainPageForm expects it,
            // or the whole formData if MainPageForm is meant to extract what it needs.
            // Assuming MainPageForm expects the full formData that includes .navbar, .mainPageBlocks etc.
            <MainPageForm 
                formData={formData} 
                setFormData={handleMainPageFormChange} // Use the new handler
            />
          )}
          {activeTab === "services" && 
            <ServiceEditPage />
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
                  aboutData={formData.aboutPage || formData.mainPageBlocks?.find(b => b.blockName === 'AboutBlock')?.config || {}}
                  onConfigChange={handleAboutConfigChange} // Use the new handler
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
                <div className="space-y-0"> {/* No space for tight packing like ServiceEditPage */}
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
