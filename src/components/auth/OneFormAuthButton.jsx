import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminButton from './AdminButton';
import WorkerButton from './WorkerButton';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

// Global cache for blob URL to data URL conversions
const globalDataUrlCache = new Map();

// Helper function to check if a URL is a local asset to be processed
function isProcessableAssetUrl(url) {
  if (typeof url !== 'string') return false;
  if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('data:') || url.startsWith('blob:')) return false;
  if (url.startsWith('#') || url === 'about' || url === 'inspection' || url === 'shingleinstallation') return false;
  
  const validPathCheck = (path) => {
    // Only include specific folders we want to track
    const validFolders = ['assets/user_uploads/'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.mp4', '.webm', '.pdf'];
    
    // Check if path starts with a valid folder
    const isInValidFolder = validFolders.some(folder => path.startsWith(folder));
    
    // Check if path has a valid file extension
    const hasValidExtension = validExtensions.some(ext => path.toLowerCase().endsWith(ext));
    
    return isInValidFolder && hasValidExtension;
  };
  
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return validPathCheck(cleanPath);
}

// Update getDataUrl with more detailed logging
const getDataUrl = async (blobUrl, originalBlob = null) => {
  console.log(`[OneFormAuthButton] getDataUrl called with:`, {
    blobUrl,
    hasOriginalBlob: !!originalBlob,
    originalBlobType: originalBlob ? originalBlob.constructor.name : 'none',
    originalBlobSize: originalBlob ? originalBlob.size : 'N/A',
    hasCachedData: globalDataUrlCache.has(blobUrl)
  });

  // Check cache first
  if (globalDataUrlCache.has(blobUrl)) {
    const cachedData = globalDataUrlCache.get(blobUrl);
    console.log(`[OneFormAuthButton] Found cached data:`, {
      type: typeof cachedData,
      isFile: cachedData instanceof File,
      isBlob: cachedData instanceof Blob,
      isObject: typeof cachedData === 'object'
    });

    if (cachedData instanceof File || cachedData instanceof Blob) {
      try {
        const dataUrl = await blobToBase64(cachedData);
        console.log(`[OneFormAuthButton] Converted cached data to base64:`, {
          dataUrlLength: dataUrl.length,
          dataUrlPrefix: dataUrl.substring(0, 50) + '...'
        });
        return dataUrl;
      } catch (error) {
        console.error(`[OneFormAuthButton] Error converting cached data:`, error);
      }
    }
  }

  // Only use original blob/file, never try to fetch blob URL
  if (originalBlob instanceof Blob || originalBlob instanceof File) {
    console.log(`[OneFormAuthButton] Using original blob/file:`, {
      type: originalBlob.type,
      size: originalBlob.size,
      name: originalBlob instanceof File ? originalBlob.name : 'blob'
    });
    try {
      const dataUrl = await blobToBase64(originalBlob);
      console.log(`[OneFormAuthButton] Successfully converted to base64:`, {
        dataUrlLength: dataUrl.length,
        dataUrlPrefix: dataUrl.substring(0, 50) + '...'
      });
      globalDataUrlCache.set(blobUrl, dataUrl);
      return dataUrl;
    } catch (error) {
      console.error(`[OneFormAuthButton] Error converting original blob to data URL:`, {
        error: error.message,
        stack: error.stack,
        blobType: originalBlob.type,
        blobSize: originalBlob.size
      });
      return blobUrl;
    }
  }
  
  console.warn(`[OneFormAuthButton] No original blob/file available for ${blobUrl}, using URL as is`);
  return blobUrl;
};

// Helper function to check if a URL is a data URL
const isDataUrl = (url) => {
  return typeof url === 'string' && url.startsWith('data:');
};

// Recursive function to traverse data, collect assets, and return cleaned data for ZIP
const traverseAndModifyDataForZip = async (originalDataNode, assetsToCollect, pathContext, uploadBaseDir) => {
  if (originalDataNode === null || originalDataNode === undefined) return originalDataNode;
  if (Array.isArray(originalDataNode)) {
    return Promise.all(originalDataNode.map((item, index) =>
      traverseAndModifyDataForZip(item, assetsToCollect, `${pathContext}[${index}]`, uploadBaseDir)
    ));
  }

  if (typeof originalDataNode === 'object' && !(originalDataNode instanceof File)) {
    // Handle File objects in config
    if (originalDataNode.heroImageFile instanceof File) {
      const file = originalDataNode.heroImageFile;
      const fileName = file.name || 'untitled_hero_image';
      let pathInZip;
      let jsonUrl;
      const replacementUrl = originalDataNode.originalUrl || originalDataNode._heroImageOriginalPathFromProps;

      if (replacementUrl && typeof replacementUrl === 'string') {
        let tempPath = replacementUrl;
        if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
        pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
        jsonUrl = pathInZip;
      } else {
        const sanitizedPathContext = pathContext.replace(/[\W_]+/g, '_').slice(0, 50);
        pathInZip = `assets/${uploadBaseDir}/${sanitizedPathContext}_${fileName}`;
        jsonUrl = pathInZip;
      }
      assetsToCollect.push({ pathInZip, dataSource: file, type: 'file' });
      
      const cleanedConfig = { ...originalDataNode };
      delete cleanedConfig.heroImageFile;
      delete cleanedConfig.originalUrl;
      delete cleanedConfig._heroImageOriginalPathFromProps;
      cleanedConfig.heroImage = jsonUrl;
      return cleanedConfig;
    }

    // Handle generic file objects
    if (originalDataNode.file && originalDataNode.file instanceof File && typeof originalDataNode.name === 'string') {
      const file = originalDataNode.file;
      const fileName = originalDataNode.name || file.name || 'untitled_asset';
      let pathInZip;
      let jsonUrl;

      if (originalDataNode.originalUrl && typeof originalDataNode.originalUrl === 'string') {
        let tempPath = originalDataNode.originalUrl;
        if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
        pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
        jsonUrl = pathInZip;
      } else {
        const sanitizedPathContext = pathContext.replace(/[\W_]+/g, '_').slice(0, 50);
        pathInZip = `assets/${uploadBaseDir}/${sanitizedPathContext}_${fileName}`;
        jsonUrl = pathInZip;
      }
      
      assetsToCollect.push({ pathInZip, dataSource: file, type: 'file' });
      
      const cleanedFileObject = { ...originalDataNode };
      delete cleanedFileObject.file;
      delete cleanedFileObject.originalUrl;
      cleanedFileObject.url = jsonUrl;
      if (originalDataNode.url && originalDataNode.url.startsWith('blob:')) {
        const dataUrl = await getDataUrl(originalDataNode.url);
        cleanedFileObject.url = dataUrl;
        globalDataUrlCache.set(originalDataNode.url, dataUrl);
      }
      return cleanedFileObject;
    }

    // Handle image objects from about page (photo, videoSrc, etc.)
    if (originalDataNode.url && typeof originalDataNode.url === 'string' && originalDataNode.url.startsWith('blob:')) {
      console.log(`[OneFormAuthButton] Processing blob URL node:`, {
        url: originalDataNode.url,
        hasFile: originalDataNode.file instanceof File,
        hasBlob: originalDataNode.blob instanceof Blob,
        originalUrl: originalDataNode.originalUrl,
        nodeKeys: Object.keys(originalDataNode),
        nodeType: typeof originalDataNode,
        pathContext
      });

      const blobUrl = originalDataNode.url;
      const fileName = originalDataNode.name || 'pasted_image.png';
      let pathInZip;
      let jsonUrl;

      // Only process if we have the original file or blob
      if (originalDataNode.file instanceof File) {
        console.log(`[OneFormAuthButton] Found File object:`, {
          name: originalDataNode.file.name,
          type: originalDataNode.file.type,
          size: originalDataNode.file.size,
          lastModified: originalDataNode.file.lastModified,
          pathContext
        });
        
        const file = originalDataNode.file;
        
        // Use the same path logic as the ZIP file
        if (originalDataNode.originalUrl && typeof originalDataNode.originalUrl === 'string') {
          let tempPath = originalDataNode.originalUrl;
          if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
          pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
          jsonUrl = pathInZip;
        } else {
          // Use the same path structure as the ZIP file
          pathInZip = `assets/images/team/${fileName}`;
          jsonUrl = pathInZip;
        }

        console.log(`[OneFormAuthButton] Adding file to assets:`, {
          pathInZip,
          jsonUrl,
          fileType: file.type,
          fileSize: file.size,
          pathContext
        });

        // Store the file object in the cache for getDataUrl to use
        globalDataUrlCache.set(blobUrl, {
          type: 'file',
          data: file
        });

        assetsToCollect.push({ 
          pathInZip, 
          dataSource: file,
          type: 'file',
          originalBlob: file
        });

        const cleanedObject = { ...originalDataNode };
        delete cleanedObject.file;
        delete cleanedObject.originalUrl;
        cleanedObject.url = jsonUrl;
        return cleanedObject;
      } else if (originalDataNode.blob instanceof Blob) {
        console.log(`[OneFormAuthButton] Found Blob object:`, {
          type: originalDataNode.blob.type,
          size: originalDataNode.blob.size
        });
        
        const blob = originalDataNode.blob;
        
        // Use the same path logic as the ZIP file
        if (originalDataNode.originalUrl && typeof originalDataNode.originalUrl === 'string') {
          let tempPath = originalDataNode.originalUrl;
          if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
          pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
          jsonUrl = pathInZip;
        } else {
          // Use the same path structure as the ZIP file
          pathInZip = `assets/images/team/${fileName}`;
          jsonUrl = pathInZip;
        }

        console.log(`[OneFormAuthButton] Adding blob to assets:`, {
          pathInZip,
          jsonUrl,
          blobType: blob.type,
          blobSize: blob.size
        });

        assetsToCollect.push({ 
          pathInZip, 
          dataSource: blob,
          type: 'blob',
          originalBlob: blob
        });

        const cleanedObject = { ...originalDataNode };
        delete cleanedObject.blob;
        delete cleanedObject.originalUrl;
        cleanedObject.url = jsonUrl;
        return cleanedObject;
      } else {
        // If no original file/blob, try to fetch from blob URL
        console.log(`[OneFormAuthButton] No original file/blob, fetching from blob URL:`, {
          url: blobUrl,
          pathContext
        });

        // Use the same path logic as the ZIP file
        if (originalDataNode.originalUrl && typeof originalDataNode.originalUrl === 'string') {
          let tempPath = originalDataNode.originalUrl;
          if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
          pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
          jsonUrl = pathInZip;
        } else {
          // Use the same path structure as the ZIP file
          pathInZip = `assets/images/team/${fileName}`;
          jsonUrl = pathInZip;
        }

        // Add the blob URL to be processed later
        assetsToCollect.push({
          pathInZip,
          dataSource: blobUrl,
          type: 'url',
          originalUrl: originalDataNode.originalUrl
        });

        const cleanedObject = { ...originalDataNode };
        delete cleanedObject.originalUrl;
        cleanedObject.url = jsonUrl;
        return cleanedObject;
      }
    }
    
    // Handle regular URLs
    if (originalDataNode.url && typeof originalDataNode.url === 'string' && isProcessableAssetUrl(originalDataNode.url)) {
      let url = originalDataNode.url;
      let pathInZip = url;
      let jsonUrl = url;

      if (pathInZip.startsWith('/')) {
        pathInZip = pathInZip.substring(1);
        jsonUrl = jsonUrl.substring(1);
      }
      
      if (!pathInZip.startsWith('assets/') && !pathInZip.startsWith('http') && !pathInZip.startsWith('data:') && !pathInZip.startsWith('blob:')) {
        pathInZip = `assets/${pathInZip}`;
        jsonUrl = pathInZip;
      }
      
      if (!assetsToCollect.some(asset => asset.pathInZip === pathInZip && asset.type === 'url')) {
        assetsToCollect.push({ pathInZip, dataSource: url, type: 'url' });
      }
      
      return { ...originalDataNode, url: jsonUrl };
    }

    // Handle generic objects
    const newObj = {};
    for (const key in originalDataNode) {
      if (Object.prototype.hasOwnProperty.call(originalDataNode, key)) {
        newObj[key] = await traverseAndModifyDataForZip(
          originalDataNode[key],
          assetsToCollect,
          `${pathContext}.${key}`,
          uploadBaseDir
        );
      }
    }
    return newObj;
  }

  // Handle string URLs
  if (typeof originalDataNode === 'string' && isProcessableAssetUrl(originalDataNode)) {
    let pathInZip = originalDataNode;
    let jsonUrl = originalDataNode;

    if (pathInZip.startsWith('/')) {
      pathInZip = pathInZip.substring(1);
      jsonUrl = jsonUrl.substring(1);
    }
    
    if (!pathInZip.startsWith('assets/') && !pathInZip.startsWith('http') && !pathInZip.startsWith('data:') && !pathInZip.startsWith('blob:')) {
      pathInZip = `assets/${pathInZip}`;
      jsonUrl = pathInZip;
    }

    if (!assetsToCollect.some(asset => asset.pathInZip === pathInZip && asset.type === 'url')) {
      assetsToCollect.push({ pathInZip, dataSource: originalDataNode, type: 'url' });
    }
    return jsonUrl;
  }

  return originalDataNode;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for base64 encoding
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for large files

// Helper function to check if a file is too large for base64 encoding
const isFileTooLarge = (file) => {
  return file.size > MAX_FILE_SIZE;
};

// Helper function to chunk a large file
const chunkFile = async (file) => {
  const chunks = [];
  let start = 0;
  
  while (start < file.size) {
    const chunk = file.slice(start, start + CHUNK_SIZE);
    chunks.push(chunk);
    start += CHUNK_SIZE;
  }
  
  return chunks;
};

// Helper function to convert a chunk to base64
const chunkToBase64 = (chunk) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(chunk);
  });
};

// Helper function to validate a blob
const isValidBlob = (blob) => {
  return blob instanceof Blob && blob.size > 0 && blob.type.startsWith('image/');
};

// Helper function to ensure we have a valid blob
const ensureValidBlob = async (dataSource) => {
  if (dataSource instanceof Blob) {
    return dataSource;
  }
  
  if (dataSource instanceof File) {
    return dataSource;
  }
  
  if (typeof dataSource === 'string') {
    if (dataSource.startsWith('blob:')) {
      try {
        const response = await fetch(dataSource);
        if (!response.ok) throw new Error('Failed to fetch blob URL');
        const blob = await response.blob();
        if (!isValidBlob(blob)) throw new Error('Invalid blob from URL');
        return blob;
      } catch (error) {
        console.error('Error fetching blob URL:', error);
        throw error;
      }
    } else if (!dataSource.startsWith('http:') && !dataSource.startsWith('https:') && !dataSource.startsWith('data:')) {
      try {
        const fetchUrl = dataSource.startsWith('/') ? dataSource : `/${dataSource}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Failed to fetch local URL');
        const blob = await response.blob();
        if (!isValidBlob(blob)) throw new Error('Invalid blob from local URL');
        return blob;
      } catch (error) {
        console.error('Error fetching local URL:', error);
        throw error;
      }
    }
  }
  
  throw new Error('Invalid data source type');
};

// Helper function to convert blob to base64 with validation
const blobToBase64 = async (blob) => {
  if (!blob || !(blob instanceof Blob)) {
    throw new Error('Invalid blob provided');
  }

  if (blob.size === 0) {
    throw new Error('Empty blob provided');
  }

  if (!blob.type.startsWith('image/')) {
    throw new Error('Invalid blob type: must be an image');
  }

  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (!result || typeof result !== 'string' || !result.startsWith('data:')) {
          reject(new Error('Invalid base64 conversion result'));
          return;
        }
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob to base64:', error);
    throw new Error(`Failed to convert blob to base64: ${error.message}`);
  }
};

// Helper function to safely process an asset
const processAsset = async (asset) => {
  try {
    let blob;
    let base64Data;

    // Validate asset data
    if (!asset || !asset.pathInZip) {
      throw new Error('Invalid asset: missing pathInZip');
    }

    // Process based on asset type
    if (asset.type === 'file' && asset.dataSource instanceof File) {
      console.log(`[OneFormAuthButton] Processing file for save: ${asset.pathInZip} (${asset.dataSource.size} bytes)`);
      blob = asset.dataSource; // Use the File directly
      base64Data = await blobToBase64(blob);
    } else if (asset.type === 'blob' && asset.dataSource instanceof Blob) {
      console.log(`[OneFormAuthButton] Processing blob for save: ${asset.pathInZip} (${asset.dataSource.size} bytes)`);
      blob = asset.dataSource; // Use the Blob directly
      base64Data = await blobToBase64(blob);
    } else if (asset.type === 'url' && typeof asset.dataSource === 'string') {
      if (asset.dataSource.startsWith('blob:')) {
        console.log(`[OneFormAuthButton] Processing blob URL for save: ${asset.pathInZip}`);
        blob = await ensureValidBlob(asset.dataSource);
        base64Data = await blobToBase64(blob);
      } else if (!asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:')) {
        console.log(`[OneFormAuthButton] Processing local URL for save: ${asset.pathInZip}`);
        blob = await ensureValidBlob(asset.dataSource);
        base64Data = await blobToBase64(blob);
      } else {
        throw new Error(`Invalid URL type for ${asset.pathInZip}`);
      }
    } else {
      throw new Error(`Invalid asset type for ${asset.pathInZip}`);
    }

    // Validate the result
    if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
      throw new Error(`Invalid base64 data for ${asset.pathInZip}`);
    }

    return {
      path: asset.pathInZip,
      data: base64Data,
      preview: blob ? URL.createObjectURL(blob) : null,
      size: blob ? blob.size : 0,
      type: blob ? blob.type : 'unknown'
    };
  } catch (error) {
    console.error(`[OneFormAuthButton] Error processing asset ${asset.pathInZip}:`, error);
    throw error;
  }
};

export default function OneFormAuthButton({ 
  formData, 
  themeColors, 
  servicesData, 
  aboutPageData, 
  showcaseData,
  initialFormDataForOldExport,
  initialServicesData,
  initialAboutPageJsonData,
  initialAllServiceBlocksData,
  initialThemeColors
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignOut, setShowSignOut] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);
  const [debug, setDebug] = useState('');
  const [isDevelopment] = useState(process.env.NODE_ENV === 'development');
  const [imagesBeingSent, setImagesBeingSent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDevelopment) {
    checkAuthStatus();
    } else {
      setIsLoading(false);
    }
  }, [isDevelopment]);

  const checkAuthStatus = async () => {
    try {
      console.log("OneFormAuthButton: Starting auth status check...");
      setDebug('Checking auth status...');
      
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log("OneFormAuthButton: Auth status data:", data);
      
      if (data.isAuthenticated) {
        console.log("OneFormAuthButton: User is authenticated");
        setIsLoggedIn(true);
        setDebug('Successfully authenticated');
      } else {
        console.log("OneFormAuthButton: User is not authenticated");
        setIsLoggedIn(false);
        setDebug('Not authenticated');
      }
    } catch (error) {
      console.error("OneFormAuthButton: Auth status check failed:", error);
      setDebug(`Auth status error: ${error.message}`);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    if (isLoggedIn) {
      try {
        console.log("OneFormAuthButton: Starting logout process...");
        setDebug('Logging out...');
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          console.log("OneFormAuthButton: Logout successful");
          setIsLoggedIn(false);
          setShowSignOut(false);
          setDebug('Logged out successfully');
        } else {
          console.error("OneFormAuthButton: Logout failed with status:", response.status);
          setDebug(`Logout failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error("OneFormAuthButton: Logout error:", error);
        setDebug(`Logout error: ${error.message}`);
      }
    } else {
      console.log("OneFormAuthButton: Redirecting to login page...");
      setDebug('Redirecting to login...');
      navigate('/login');
    }
  };

  const handleSaveClick = async () => {
    // Set up console log collection at the very start
    const consoleLogs = [];
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      consoleLogs.push(['LOG', ...args]);
      originalConsoleLog.apply(console, args);
    };
    console.error = (...args) => {
      consoleLogs.push(['ERROR', ...args]);
      originalConsoleError.apply(console, args);
    };
    console.warn = (...args) => {
      consoleLogs.push(['WARN', ...args]);
      originalConsoleWarn.apply(console, args);
    };

    try {
      setSaveClicked(true);
      setDebug('Processing data...');
      setImagesBeingSent([]); // Reset images being sent

      if (!formData) {
        setDebug('No form data found');
        return;
      }

      console.log("[OneFormAuthButton] Starting ZIP generation...");
      const zip = new JSZip();

      // Declare variables at the top
      let cleanedNewCombinedData;
      let colorsForNewJson;
      let cleanedServicesDataNew;
      let cleanedNewAboutData;
      let cleanedNewShowcaseData;
      let assetsToSave = {};

      // Process "NEW" (current formData) data
      console.log("[OneFormAuthButton] Processing NEW data for ZIP:", formData);
      let newCollectedAssets = [];

      // Ensure we're using the correct data structure for authenticated users
      const dataToProcess = formData.combined_data || formData;

      // Only process and add files that have changed
      if (JSON.stringify(dataToProcess) !== JSON.stringify(initialFormDataForOldExport)) {
        cleanedNewCombinedData = await traverseAndModifyDataForZip(
          dataToProcess,
          newCollectedAssets,
          'formDataRoot',
          'user_uploads/combined_data'
        );
        zip.file("combined_data.json", JSON.stringify(cleanedNewCombinedData, null, 2));
        console.log("[OneFormAuthButton] Added combined_data.json to ZIP");
      }

      // Process services data if changed
      if (servicesData) {
        try {
          console.log("[OneFormAuthButton] Processing services data:", {
            currentServices: servicesData,
            initialServices: initialServicesData,
            hasChanges: JSON.stringify(servicesData) !== JSON.stringify(initialServicesData)
          });

          const serviceAssetsForNew = [];
          // Deep clone the services data to ensure we're working with a fresh copy
          const currentServicesData = JSON.parse(JSON.stringify(servicesData));
          cleanedServicesDataNew = await traverseAndModifyDataForZip(
            currentServicesData,
            serviceAssetsForNew,
            'servicesDataRoot',
            'user_uploads/services_data'
          );
          zip.file("services.json", JSON.stringify(cleanedServicesDataNew, null, 2));
          newCollectedAssets.push(...serviceAssetsForNew);
          console.log("[OneFormAuthButton] Added services.json to ZIP with data:", cleanedServicesDataNew);
        } catch (serviceError) {
          console.error("[OneFormAuthButton] Error processing services.json:", serviceError);
        }
      }

      // Process about page data if changed
      if (aboutPageData) {
        console.log("[OneFormAuthButton] Processing about_page.json for ZIP:", aboutPageData);
        let newAboutAssets = [];
        cleanedNewAboutData = await traverseAndModifyDataForZip(
          aboutPageData,
          newAboutAssets,
          'aboutPageDataRoot',
          'user_uploads/about_page_data'
        );
        zip.file("about_page.json", JSON.stringify(cleanedNewAboutData, null, 2));
        newCollectedAssets.push(...newAboutAssets);
        console.log("[OneFormAuthButton] Added about_page.json to ZIP");
      }

      // Process showcase data if changed
      if (showcaseData && JSON.stringify(showcaseData) !== JSON.stringify(initialAllServiceBlocksData)) {
        console.log("[OneFormAuthButton] Processing all_blocks_showcase.json for ZIP:", showcaseData);
        let newShowcaseAssets = [];
        cleanedNewShowcaseData = await traverseAndModifyDataForZip(
          showcaseData,
          newShowcaseAssets,
          'showcaseDataRoot',
          'user_uploads/showcase_data'
        );
        zip.file("all_blocks_showcase.json", JSON.stringify(cleanedNewShowcaseData, null, 2));
        newCollectedAssets.push(...newShowcaseAssets);
        console.log("[OneFormAuthButton] Added all_blocks_showcase.json to ZIP");
      }

      // Add colors if changed
      if (themeColors /*&& JSON.stringify(themeColors) !== JSON.stringify(initialThemeColors)*/) {
        colorsForNewJson = {};
        Object.keys(themeColors).forEach(key => {
          colorsForNewJson[key.replace(/-/g, '_')] = themeColors[key];
        });
        zip.file("colors_output.json", JSON.stringify(colorsForNewJson, null, 2));
        console.log("[OneFormAuthButton] Added colors_output.json to ZIP");
      }

      // Process all collected assets
      console.log("[OneFormAuthButton] Processing collected assets:", newCollectedAssets.map(a => ({
        path: a.pathInZip,
        type: a.type,
        hasFile: a.dataSource instanceof File,
        hasBlob: a.dataSource instanceof Blob,
        size: a.dataSource instanceof File || a.dataSource instanceof Blob ? a.dataSource.size : 'N/A'
      })));

      // Process assets and add them to both ZIP and assetsToSave
      for (const asset of newCollectedAssets) {
        try {
          if (asset.type === 'file' && asset.dataSource instanceof File) {
            console.log(`[OneFormAuthButton] Processing file:`, {
              path: asset.pathInZip,
              name: asset.dataSource.name,
              type: asset.dataSource.type,
              size: asset.dataSource.size
            });
            
            zip.file(asset.pathInZip, asset.dataSource);
            
            // Convert to base64 for saving
            const base64Data = await blobToBase64(asset.dataSource);
            console.log(`[OneFormAuthButton] Converted file to base64:`, {
              path: asset.pathInZip,
              base64Length: base64Data.length
            });
            
            assetsToSave[asset.pathInZip] = base64Data;
            
            // Add to preview
            setImagesBeingSent(prev => [...prev, {
              path: asset.pathInZip,
              data: URL.createObjectURL(asset.dataSource),
              size: asset.dataSource.size,
              type: asset.dataSource.type
            }]);
          } else if (asset.type === 'blob' && asset.dataSource instanceof Blob) {
            console.log(`[OneFormAuthButton] Processing blob:`, {
              path: asset.pathInZip,
              type: asset.dataSource.type,
              size: asset.dataSource.size
            });
            
            zip.file(asset.pathInZip, asset.dataSource);
            
            // Convert to base64 for saving
            const base64Data = await blobToBase64(asset.dataSource);
            console.log(`[OneFormAuthButton] Converted blob to base64:`, {
              path: asset.pathInZip,
              base64Length: base64Data.length
            });
            
            assetsToSave[asset.pathInZip] = base64Data;
            
            // Add to preview
            setImagesBeingSent(prev => [...prev, {
              path: asset.pathInZip,
              data: URL.createObjectURL(asset.dataSource),
              size: asset.dataSource.size,
              type: asset.dataSource.type
            }]);
          } else if (asset.type === 'url' && typeof asset.dataSource === 'string') {
            console.log(`[OneFormAuthButton] Processing URL:`, {
              path: asset.pathInZip,
              url: asset.dataSource
            });
            
            if (asset.dataSource.startsWith('blob:')) {
              // Try to get the original blob from the asset
              const originalBlob = asset.originalBlob || asset.blob;
              if (originalBlob instanceof Blob) {
                console.log(`[OneFormAuthButton] Using original blob for URL:`, {
                  path: asset.pathInZip,
                  type: originalBlob.type,
                  size: originalBlob.size
                });
                
                zip.file(asset.pathInZip, originalBlob);
                
                // Convert to base64 for saving
                const base64Data = await blobToBase64(originalBlob);
                console.log(`[OneFormAuthButton] Converted original blob to base64:`, {
                  path: asset.pathInZip,
                  base64Length: base64Data.length
                });
                
                assetsToSave[asset.pathInZip] = base64Data;
                
                // Add to preview
                setImagesBeingSent(prev => [...prev, {
                  path: asset.pathInZip,
                  data: URL.createObjectURL(originalBlob),
                  size: originalBlob.size,
                  type: originalBlob.type
                }]);
              } else {
                // Fall back to fetching the blob URL
                const response = await fetch(asset.dataSource);
                if (!response.ok) {
                  throw new Error(`Failed to fetch blob ${asset.dataSource}: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();
                console.log(`[OneFormAuthButton] Fetched blob from URL:`, {
                  path: asset.pathInZip,
                  type: blob.type,
                  size: blob.size
                });
                
                zip.file(asset.pathInZip, blob);
                
                // Convert to base64 for saving
                const base64Data = await blobToBase64(blob);
                console.log(`[OneFormAuthButton] Converted URL blob to base64:`, {
                  path: asset.pathInZip,
                  base64Length: base64Data.length
                });
                
                assetsToSave[asset.pathInZip] = base64Data;
                
                // Add to preview
                setImagesBeingSent(prev => [...prev, {
                  path: asset.pathInZip,
                  data: URL.createObjectURL(blob),
                  size: blob.size,
                  type: blob.type
                }]);
              }
            } else if (!asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:')) {
              const fetchUrl = asset.dataSource.startsWith('/') ? asset.dataSource : `/${asset.dataSource}`;
              console.log(`[OneFormAuthButton] Fetching local URL:`, {
                path: asset.pathInZip,
                url: fetchUrl
              });
              
              const response = await fetch(fetchUrl);
              if (!response.ok) {
                throw new Error(`Failed to fetch ${fetchUrl}: ${response.status} ${response.statusText}`);
              }
              const blob = await response.blob();
              console.log(`[OneFormAuthButton] Fetched local file:`, {
                path: asset.pathInZip,
                type: blob.type,
                size: blob.size
              });
              
              zip.file(asset.pathInZip, blob);
              
              // Convert to base64 for saving
              const base64Data = await blobToBase64(blob);
              console.log(`[OneFormAuthButton] Converted local file to base64:`, {
                path: asset.pathInZip,
                base64Length: base64Data.length
              });
              
              assetsToSave[asset.pathInZip] = base64Data;
              
              // Add to preview
              setImagesBeingSent(prev => [...prev, {
                path: asset.pathInZip,
                data: URL.createObjectURL(blob),
                size: blob.size,
                type: blob.type
              }]);
            }
          }
        } catch (error) {
          console.error(`[OneFormAuthButton] Error processing asset ${asset.pathInZip}:`, {
            error: error.message,
            stack: error.stack,
            assetType: asset.type,
            dataSourceType: asset.dataSource ? typeof asset.dataSource : 'undefined'
          });
          setDebug(`Error processing ${asset.pathInZip}: ${error.message}`);
        }
      }

      // Generate and download the ZIP
      console.log("[OneFormAuthButton] Generating ZIP file...");
      const content = await zip.generateAsync({ type: "blob" });
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
      const zipFileName = `website_content_${dateStr}_${timeStr}.zip`;
      
      saveAs(content, zipFileName);
      console.log("[OneFormAuthButton] ZIP file downloaded:", zipFileName);
      setDebug('ZIP file downloaded successfully');

      // Use the same data that was prepared for the ZIP
      const dataToSave = {};
      
      // Only add data if it was processed and exists
      if (cleanedNewCombinedData) {
        dataToSave.combined_data = cleanedNewCombinedData;
      }
      if (colorsForNewJson) {
        dataToSave.colors = colorsForNewJson;
      }
      if (cleanedServicesDataNew) {
        dataToSave.services = cleanedServicesDataNew;
      }
      if (cleanedNewAboutData) {
        dataToSave.about_page = cleanedNewAboutData;
      }
      if (cleanedNewShowcaseData) {
        dataToSave.all_blocks_showcase = cleanedNewShowcaseData;
      }

      // Only proceed with save if we have some data to save
      if (Object.keys(dataToSave).length > 0 || Object.keys(assetsToSave).length > 0) {
        if (isDevelopment) {
          // In development, save logs to a file
          const logContent = `=== Save Log ${new Date().toISOString()} ===\n\n` +
            `Data being saved:\n${JSON.stringify(dataToSave, null, 2)}\n\n` +
            `Assets being saved:\n${Object.keys(assetsToSave).join('\n')}\n\n` +
            `Data presence:\n` +
            `- Combined Data: ${!!dataToSave.combined_data}\n` +
            `- Colors: ${!!dataToSave.colors}\n` +
            `- Services: ${!!dataToSave.services}\n` +
            `- About Page: ${!!dataToSave.about_page}\n` +
            `- All Blocks Showcase: ${!!dataToSave.all_blocks_showcase}\n` +
            `- Assets: ${Object.keys(assetsToSave).length}\n\n` +
            `Console Logs:\n${consoleLogs.map(([type, ...args]) => 
              `[${type}] ${args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
              ).join(' ')}`
            ).join('\n')}`;

          // Create a blob and save it
          const logBlob = new Blob([logContent], { type: 'text/plain' });
          const logFileName = `save_log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
          saveAs(logBlob, logFileName);
          
          setDebug('Development mode: Log file downloaded');
        } else {
          // In production, save to server
          const response = await fetch('/api/config/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              ...dataToSave,
              assets: assetsToSave
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to save: ${response.statusText}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || 'Failed to save');
          }

          setDebug('Changes saved successfully!');
        }
      } else {
        console.log("[OneFormAuthButton] No data to save");
        setDebug('No changes to save');
      }
    } catch (error) {
      console.error('[OneFormAuthButton] Save error:', error);
      setDebug(`Save error: ${error.message}`);
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      setTimeout(() => setSaveClicked(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 z-[9999]">
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded text-sm">
          Loading auth status...
        </div>
      </div>
    );
  }

  if (isDevelopment) {
    return (
      <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-center gap-2">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-sm mb-2">
          Development Mode
        </div>
        {debug && (
          <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded text-sm max-w-md">
            <pre>{debug}</pre>
          </div>
        )}
        {imagesBeingSent.length > 0 && (
          <div className="bg-white border border-gray-400 p-4 rounded text-sm max-w-md">
            <h3 className="font-bold mb-2">Images Being Sent:</h3>
            <div className="grid grid-cols-2 gap-2">
              {imagesBeingSent.map((img, index) => (
                <div key={index} className="border border-gray-200 p-2">
                  <img src={img.data} alt={img.path} className="w-full h-auto mb-1" />
                  <p className="text-xs truncate">{img.path}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round(img.size / 1024)}KB - {img.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={handleSaveClick}
          className="px-4 py-2 rounded-full bg-blue-600 text-white 
                   border border-blue-700 hover:bg-blue-700 
                   transition-all duration-300 shadow-lg"
          disabled={saveClicked}
        >
          {saveClicked ? 'Creating ZIP...' : 'Download ZIP'}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-[9999] flex flex-col items-center gap-2"
    >
      {/* Debug information */}
      {debug && (
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded mb-4 text-sm max-w-md">
          <pre>{debug}</pre>
        </div>
      )}

      {imagesBeingSent.length > 0 && (
        <div className="bg-white border border-gray-400 p-4 rounded text-sm max-w-md">
          <h3 className="font-bold mb-2">Images Being Sent:</h3>
          <div className="grid grid-cols-2 gap-2">
            {imagesBeingSent.map((img, index) => (
              <div key={index} className="border border-gray-200 p-2">
                <img src={img.data} alt={img.path} className="w-full h-auto mb-1" />
                <p className="text-xs truncate">{img.path}</p>
                <p className="text-xs text-gray-500">
                  {Math.round(img.size / 1024)}KB - {img.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoggedIn ? (
        <>
          <div className="flex gap-2">
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 rounded-full bg-blue-600 text-white 
                       border border-blue-700 hover:bg-blue-700 
                       transition-all duration-300 shadow-lg"
              disabled={saveClicked}
            >
              {saveClicked ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => navigate('/initial-payment')}
              className="px-4 py-2 rounded-full bg-green-600 text-white 
                       border border-green-700 hover:bg-green-700 
                       transition-all duration-300 shadow-lg"
            >
              Buy Plan
            </button>
            <button
              onClick={() => navigate('/view-plan')}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white 
                       border border-indigo-700 hover:bg-indigo-700 
                       transition-all duration-300 shadow-lg"
            >
              View Plan
            </button>
          </div>
          <button
            onClick={() => setShowSignOut(!showSignOut)}
            className="px-4 py-2 rounded-full bg-gray-600 text-white 
                     border border-gray-700 hover:bg-gray-700 
                     transition-all duration-300 shadow-lg"
          >
            {showSignOut ? 'Cancel' : 'Sign Out'}
          </button>
          <AnimatePresence>
            {showSignOut && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-4 rounded-lg shadow-lg mt-2"
              >
                <p className="text-gray-700 mb-4">Are you sure you want to sign out?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAuth}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Yes, Sign Out
                  </button>
                  <button
                    onClick={() => setShowSignOut(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <button
          onClick={handleAuth}
          className="px-4 py-2 rounded-full bg-blue-600 text-white 
                   border border-blue-700 hover:bg-blue-700 
                   transition-all duration-300 shadow-lg"
        >
          Sign In
        </button>
      )}
    </motion.div>
  );
} 