import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminButton from './AdminButton';
import WorkerButton from './WorkerButton';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

// Helper function to convert blob URL to data URL with caching
const getDataUrl = async (blobUrl) => {
  if (globalDataUrlCache.has(blobUrl)) {
    return globalDataUrlCache.get(blobUrl);
  }
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      console.warn(`Failed to fetch blob URL: ${blobUrl}, status: ${response.status}`);
      return blobUrl; // Return original URL if fetch fails
    }
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    globalDataUrlCache.set(blobUrl, dataUrl);
    return dataUrl;
  } catch (error) {
    console.warn('Error converting blob URL to data URL:', error);
    return blobUrl; // Return original URL if conversion fails
  }
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
      if (originalDataNode.url && originalDataNode.url.startsWith('blob:')) {
        const dataUrl = await getDataUrl(originalDataNode.url);
        cleanedConfig.url = dataUrl;
        globalDataUrlCache.set(originalDataNode.url, dataUrl);
      }
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
    
    // Handle blob URLs
    if (originalDataNode.url && typeof originalDataNode.url === 'string' && originalDataNode.url.startsWith('blob:') && originalDataNode.name) {
      const blobUrl = originalDataNode.url;
      const fileName = originalDataNode.name || 'pasted_image.png';
      let pathInZip;
      let jsonUrl;

      if (originalDataNode.originalUrl && typeof originalDataNode.originalUrl === 'string' && !originalDataNode.originalUrl.startsWith('blob:')) {
        let tempPath = originalDataNode.originalUrl;
        if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
        pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
        jsonUrl = pathInZip;
      } else {
        const sanitizedPathContext = pathContext.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 50);
        pathInZip = `assets/${uploadBaseDir}/${sanitizedPathContext}_${fileName}`;
        jsonUrl = pathInZip;
      }
      
      assetsToCollect.push({ pathInZip, dataSource: blobUrl, type: 'url' });
      
      const cleanedBlobObject = { ...originalDataNode };
      delete cleanedBlobObject.file;
      const dataUrl = await getDataUrl(blobUrl);
      cleanedBlobObject.url = dataUrl;
      globalDataUrlCache.set(blobUrl, dataUrl);
      delete cleanedBlobObject.originalUrl;
      return cleanedBlobObject;
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
      window.location.href = '/login';
    }
  };

  const handleSaveClick = async () => {
    try {
      setSaveClicked(true);
      setDebug('Processing data...');

      if (!formData) {
        setDebug('No form data found');
        return;
      }

      console.log("[OneFormAuthButton] Starting ZIP generation...");
      const zip = new JSZip();
      let collectedAssets = [];

      // Declare variables at the top
      let cleanedNewCombinedData;
      let colorsForNewJson;
      let cleanedServicesDataNew;
      let cleanedNewAboutData;
      let cleanedNewShowcaseData;

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
      if (servicesData && JSON.stringify(servicesData) !== JSON.stringify(initialServicesData)) {
        try {
          const serviceAssetsForNew = [];
          cleanedServicesDataNew = await traverseAndModifyDataForZip(
            servicesData,
            serviceAssetsForNew,
            'servicesDataRoot',
            'user_uploads/services_data'
          );
          zip.file("services.json", JSON.stringify(cleanedServicesDataNew, null, 2));
          newCollectedAssets.push(...serviceAssetsForNew);
          console.log("[OneFormAuthButton] Added services.json to ZIP");
        } catch (serviceError) {
          console.error("[OneFormAuthButton] Error processing services.json:", serviceError);
        }
      }

      // Process about page data if changed
      if (aboutPageData && JSON.stringify(aboutPageData) !== JSON.stringify(initialAboutPageJsonData)) {
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
      if (themeColors && JSON.stringify(themeColors) !== JSON.stringify(initialThemeColors)) {
        colorsForNewJson = {};
        Object.keys(themeColors).forEach(key => {
          colorsForNewJson[key.replace(/-/g, '_')] = themeColors[key];
        });
        zip.file("colors_output.json", JSON.stringify(colorsForNewJson, null, 2));
        console.log("[OneFormAuthButton] Added colors_output.json to ZIP");
      }

      // Process all collected assets
      console.log("[OneFormAuthButton] Processing collected assets:", newCollectedAssets);
      const assetPromises = newCollectedAssets.map(async (asset) => {
        try {
          if (asset.type === 'file' && asset.dataSource instanceof File) {
            console.log(`[OneFormAuthButton] Adding file to ZIP: ${asset.pathInZip}`);
            zip.file(asset.pathInZip, asset.dataSource);
          } else if (asset.type === 'url' && typeof asset.dataSource === 'string') {
            if (asset.dataSource.startsWith('blob:')) {
              console.log(`[OneFormAuthButton] Fetching blob URL for ZIP: ${asset.pathInZip}`);
              const response = await fetch(asset.dataSource);
              if (!response.ok) throw new Error(`Failed to fetch blob ${asset.dataSource}`);
              const blob = await response.blob();
              console.log(`[OneFormAuthButton] Adding blob to ZIP: ${asset.pathInZip}`);
              zip.file(asset.pathInZip, blob);
            } else if (!asset.dataSource.startsWith('http:') && !asset.dataSource.startsWith('https:') && !asset.dataSource.startsWith('data:')) {
              console.log(`[OneFormAuthButton] Fetching local URL for ZIP: ${asset.pathInZip}`);
              const fetchUrl = asset.dataSource.startsWith('/') ? asset.dataSource : `/${asset.dataSource}`;
              const response = await fetch(fetchUrl);
              if (!response.ok) throw new Error(`Failed to fetch ${fetchUrl}`);
              const blob = await response.blob();
              console.log(`[OneFormAuthButton] Adding local file to ZIP: ${asset.pathInZip}`);
              zip.file(asset.pathInZip, blob);
            }
          }
        } catch (error) {
          console.error(`[OneFormAuthButton] Error processing asset ${asset.pathInZip}:`, error);
        }
      });

      await Promise.all(assetPromises);

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

      // Use the same data that was prepared for the ZIP, but only include what exists
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
        dataToSave.aboutPageData = cleanedNewAboutData;
      }
      if (cleanedNewShowcaseData) {
        dataToSave.all_blocks_showcase = cleanedNewShowcaseData;
      }

      console.log("[OneFormAuthButton] Full dataToSave object:", JSON.stringify(dataToSave, null, 2));
      console.log("[OneFormAuthButton] Saving data to server:", {
        hasCombinedData: !!dataToSave.combined_data,
        hasColors: !!dataToSave.colors,
        hasServices: !!dataToSave.services,
        hasAboutPage: !!dataToSave.aboutPageData,
        hasAllBlocksShowcase: !!dataToSave.all_blocks_showcase
      });

      // Only proceed with save if we have some data to save
      if (Object.keys(dataToSave).length > 0) {
        if (isDevelopment) {
          // In development, save logs to a file
          const logContent = `=== Save Log ${new Date().toISOString()} ===\n\n` +
            `Data being saved:\n${JSON.stringify(dataToSave, null, 2)}\n\n` +
            `Data presence:\n` +
            `- Combined Data: ${!!dataToSave.combined_data}\n` +
            `- Colors: ${!!dataToSave.colors}\n` +
            `- Services: ${!!dataToSave.services}\n` +
            `- About Page: ${!!dataToSave.aboutPageData}\n` +
            `- All Blocks Showcase: ${!!dataToSave.all_blocks_showcase}\n`;

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
            body: JSON.stringify(dataToSave)
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

      {isLoggedIn ? (
        <>
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