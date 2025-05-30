// Helper function to check if a URL is a local asset to be processed
function isProcessableAssetUrl(url) {
  if (typeof url !== 'string') return false;
  if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('data:') || url.startsWith('blob:')) return false;
  if (url.startsWith('#') || url === 'about' || url === 'inspection' || url === 'shingleinstallation') return false;
  
  const validPathCheck = (path) => {
    const validFolders = ['assets/user_uploads/'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.mp4', '.webm', '.pdf'];
    
    const isInValidFolder = validFolders.some(folder => path.startsWith(folder));
    const hasValidExtension = validExtensions.some(ext => path.toLowerCase().endsWith(ext));
    
    return isInValidFolder && hasValidExtension;
  };
  
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return validPathCheck(cleanPath);
}

// Function to prepare data for saving
export const prepareDataForSave = async (dataNode, pathContext = '') => {
  if (dataNode === null || dataNode === undefined) return dataNode;
  
  // Handle arrays
  if (Array.isArray(dataNode)) {
    return Promise.all(dataNode.map((item, index) =>
      prepareDataForSave(item, `${pathContext}[${index}]`)
    ));
  }

  // Handle objects
  if (typeof dataNode === 'object' && !(dataNode instanceof File)) {
    // Handle image objects (photo, videoSrc, etc.)
    if (dataNode.url && typeof dataNode.url === 'string' && dataNode.url.startsWith('blob:')) {
      const fileName = dataNode.name || 'pasted_image.png';
      let pathInZip;
      let jsonUrl;

      // Use originalUrl if available, otherwise use the blob URL's name
      if (dataNode.originalUrl && typeof dataNode.originalUrl === 'string') {
        let tempPath = dataNode.originalUrl;
        if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
        pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
        jsonUrl = pathInZip;
      } else {
        // If no originalUrl, create a path based on the context and filename
        const sanitizedPathContext = pathContext.replace(/[\W_]+/g, '_').slice(0, 50);
        pathInZip = `assets/user_uploads/${sanitizedPathContext}_${fileName}`;
        jsonUrl = pathInZip;
      }
      
      // If we have a file object, use it
      if (dataNode.file instanceof File) {
        return {
          pathInZip,
          file: dataNode.file,
          url: jsonUrl
        };
      } else {
        // If no file object, just return the URL
        console.warn(`No file object found for ${pathInZip}, using URL only`);
        return {
          pathInZip,
          url: jsonUrl
        };
      }
    }

    // Handle regular URLs
    if (dataNode.url && typeof dataNode.url === 'string' && isProcessableAssetUrl(dataNode.url)) {
      let url = dataNode.url;
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
      
      return { ...dataNode, url: jsonUrl };
    }

    // Handle generic objects
    const newObj = {};
    for (const key in dataNode) {
      if (Object.prototype.hasOwnProperty.call(dataNode, key)) {
        newObj[key] = await prepareDataForSave(dataNode[key], `${pathContext}.${key}`);
      }
    }
    return newObj;
  }

  // Handle string URLs
  if (typeof dataNode === 'string' && isProcessableAssetUrl(dataNode)) {
    let pathInZip = dataNode;
    let jsonUrl = dataNode;

    if (pathInZip.startsWith('/')) {
      pathInZip = pathInZip.substring(1);
      jsonUrl = jsonUrl.substring(1);
    }
    
    if (!pathInZip.startsWith('assets/') && !pathInZip.startsWith('http') && !pathInZip.startsWith('data:') && !pathInZip.startsWith('blob:')) {
      pathInZip = `assets/${pathInZip}`;
      jsonUrl = pathInZip;
    }

    return jsonUrl;
  }

  return dataNode;
};

// Function to prepare all data for saving
export const prepareAllDataForSave = async ({
  formData,
  themeColors,
  servicesData,
  aboutPageData,
  showcaseData
}) => {
  const dataToSave = {};
  const filesToSave = new Map();

  // Process form data
  if (formData) {
    const processedData = await prepareDataForSave(formData.combined_data || formData);
    if (processedData && processedData.pathInZip) {
      filesToSave.set(processedData.pathInZip, processedData.file);
      dataToSave.combined_data = { ...processedData, file: undefined };
    } else {
      dataToSave.combined_data = processedData;
    }
  }

  // Process services data
  if (servicesData) {
    const processedData = await prepareDataForSave(servicesData);
    if (processedData && processedData.pathInZip) {
      filesToSave.set(processedData.pathInZip, processedData.file);
      dataToSave.services = { ...processedData, file: undefined };
    } else {
      dataToSave.services = processedData;
    }
  }

  // Process about page data
  if (aboutPageData) {
    const processedData = await prepareDataForSave(aboutPageData);
    if (processedData && processedData.pathInZip) {
      filesToSave.set(processedData.pathInZip, processedData.file);
      dataToSave.aboutPageData = { ...processedData, file: undefined };
    } else {
      dataToSave.aboutPageData = processedData;
    }
  }

  // Process showcase data
  if (showcaseData) {
    const processedData = await prepareDataForSave(showcaseData);
    if (processedData && processedData.pathInZip) {
      filesToSave.set(processedData.pathInZip, processedData.file);
      dataToSave.all_blocks_showcase = { ...processedData, file: undefined };
    } else {
      dataToSave.all_blocks_showcase = processedData;
    }
  }

  // Process colors
  if (themeColors) {
    const colorsForJson = {};
    Object.keys(themeColors).forEach(key => {
      colorsForJson[key.replace(/-/g, '_')] = themeColors[key];
    });
    dataToSave.colors = colorsForJson;
  }

  return {
    dataToSave,
    filesToSave
  };
}; 