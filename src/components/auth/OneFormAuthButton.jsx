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
    setSaveClicked(true);
    setDebug('Starting save process...');
    
    try {
      // First, create and download the ZIP file
      const zip = new JSZip();
      let collectedAssets = [];
      
      // Process all data and collect assets
      const processedData = {
        combined_data: await traverseAndModifyDataForZip(formData, collectedAssets, 'formDataRoot', 'user_uploads/combined_data'),
        colors: themeColors,
        services: servicesData,
        aboutPageData: aboutPageData,
        all_blocks_showcase: showcaseData
      };

      // Add all JSON files to ZIP
      zip.file('json/combined_data.json', JSON.stringify(processedData.combined_data, null, 2));
      zip.file('json/colors_output.json', JSON.stringify(processedData.colors, null, 2));
      zip.file('json/services.json', JSON.stringify(processedData.services, null, 2));
      zip.file('json/about_page.json', JSON.stringify(processedData.aboutPageData, null, 2));
      zip.file('json/all_blocks_showcase.json', JSON.stringify(processedData.all_blocks_showcase, null, 2));

      // Process and add assets to ZIP
      const assetPromises = collectedAssets.map(async (asset) => {
        try {
          if (asset.type === 'file' && asset.dataSource instanceof File) {
            zip.file(asset.pathInZip, asset.dataSource);
          } else if (asset.type === 'url' && typeof asset.dataSource === 'string') {
            if (!asset.dataSource.startsWith('http') && !asset.dataSource.startsWith('data:') && !asset.dataSource.startsWith('blob:')) {
              const response = await fetch(asset.dataSource);
              if (!response.ok) throw new Error(`Failed to fetch ${asset.dataSource}`);
              const blob = await response.blob();
              zip.file(asset.pathInZip, blob);
            }
          }
        } catch (error) {
          console.error(`Error processing asset ${asset.pathInZip}:`, error);
        }
      });

      await Promise.all(assetPromises);

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
      const zipFileName = `website_content_${dateStr}_${timeStr}.zip`;
      saveAs(content, zipFileName);

      // In production, also upload the files
      if (!isDevelopment) {
        setDebug('Uploading files to server...');
        
        // Prepare assets for upload
        const assetsToUpload = {};
        for (const asset of collectedAssets) {
          try {
            if (asset.type === 'file' && asset.dataSource instanceof File) {
              const arrayBuffer = await asset.dataSource.arrayBuffer();
              assetsToUpload[asset.pathInZip] = arrayBuffer;
            } else if (asset.type === 'url' && typeof asset.dataSource === 'string') {
              if (!asset.dataSource.startsWith('http') && !asset.dataSource.startsWith('data:') && !asset.dataSource.startsWith('blob:')) {
                const response = await fetch(asset.dataSource);
                if (!response.ok) throw new Error(`Failed to fetch ${asset.dataSource}`);
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                assetsToUpload[asset.pathInZip] = arrayBuffer;
              }
            }
          } catch (error) {
            console.error(`Error preparing asset ${asset.pathInZip} for upload:`, error);
          }
        }

        // Upload to server
        const response = await fetch('/api/config/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...processedData,
            assets: assetsToUpload
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to upload files: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to upload files');
        }

        setDebug('Files uploaded successfully!');
      } else {
        setDebug('ZIP file downloaded successfully!');
      }
    } catch (error) {
      console.error('Error in save process:', error);
      setDebug(`Error: ${error.message}`);
    } finally {
      setSaveClicked(false);
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