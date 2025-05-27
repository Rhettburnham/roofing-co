import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import JSZip from "jszip";
import { useConfig } from "../context/ConfigContext";

// Import preview components for blocks
import HeroBlock from "./blocks/HeroBlock";
import GeneralList from "./blocks/GeneralList";
import VideoCTA from "./blocks/VideoCTA";
import GeneralListVariant2 from "./blocks/GeneralListVariant2";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import ActionButtonBlock from "./blocks/ActionButtonBlock";
import HeaderBannerBlock from "./blocks/HeaderBannerBlock";
import PricingGrid from "./blocks/PricingGrid";
import ListDropdown from "./blocks/ListDropdown";
import GridImageTextBlock from "./blocks/GridImageTextBlock";
import ThreeGridWithRichTextBlock from "./blocks/ThreeGridWithRichTextBlock";
import ImageWrapBlock from "./blocks/ImageWrapBlock";
import ShingleSelectorBlock from "./blocks/ShingleSelectorBlock";
import ListImageVerticalBlock from "./blocks/ListImageVerticalBlock";

/* 
=============================================
Block Component Mapping
---------------------------------------------
Maps block type names from the JSON data to their 
corresponding React components for rendering.
This allows the service pages to be dynamically
constructed based on the JSON configuration.
=============================================
*/
const blockMap = {
  HeroBlock,
  GeneralList,
  VideoCTA,
  GeneralListVariant2,
  OverviewAndAdvantagesBlock,
  ActionButtonBlock,
  HeaderBannerBlock,
  PricingGrid,
  ListDropdown,
  GridImageTextBlock,
  ThreeGridWithRichTextBlock,
  ImageWrapBlock,
  ShingleSelectorBlock,
  ListImageVerticalBlock,
};

// EditOverlay component
// Remove EditOverlay as it's being replaced by inline panels
// const EditOverlay = ({ children, onClose }) => (
// ... EditOverlay code ...
// );

// EditOverlay.propTypes = {
// children: PropTypes.node.isRequired,
// onClose: PropTypes.func.isRequired,
// };

// Export a reference to the services data
let servicesDataRef = null;

// Helper to get display URL (can be enhanced for file objects later)
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value; // Handles direct URLs or blob URLs
  if (typeof value === "object" && value.url) return value.url; // Handles { url: '...', ... }
  return null;
};

// Simplified traversal function for ServiceEditPage (adapt as needed for its specific data structure)
// This version focuses on finding string URLs that might be local assets.
// If service blocks start containing File objects, this needs to be expanded like OneForm's version.
function traverseAndCleanServiceData(originalDataNode, assetsToCollect, pathContext, uploadBaseDir) {
  if (originalDataNode === null || originalDataNode === undefined) {
    return originalDataNode;
  }

  if (Array.isArray(originalDataNode)) {
    return originalDataNode.map((item, index) =>
      traverseAndCleanServiceData(item, assetsToCollect, `${pathContext}[${index}]`, uploadBaseDir)
    );
  }

  if (typeof originalDataNode === 'object' && !(originalDataNode instanceof File)) {
    // Check for our specific image object structure: { file: File, url: blobUrl, name: string, originalUrl?: string }
    if (originalDataNode.file && originalDataNode.file instanceof File && typeof originalDataNode.name === 'string') {
      console.log(`[traverseAndCleanServiceData - ServiceEdit] Detected FileObject. PathContext: ${pathContext}, File: ${originalDataNode.name}`);
      const file = originalDataNode.file;
      const fileName = originalDataNode.name || file.name || 'untitled_service_asset';
      let pathInZip;
      let jsonUrl;

      // Use originalUrl for path if it exists and seems valid, otherwise generate one.
      if (originalDataNode.originalUrl && typeof originalDataNode.originalUrl === 'string' && !originalDataNode.originalUrl.startsWith('blob:')) {
        let tempPath = originalDataNode.originalUrl;
        if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
        // Ensure it goes into an assets directory within the ZIP
        pathInZip = tempPath.startsWith('assets/') ? tempPath : `assets/${tempPath}`;
        jsonUrl = pathInZip;
        console.log(`[traverseAndCleanServiceData - ServiceEdit] Using originalUrl for FileObject: ${pathInZip}`);
      } else {
        const sanitizedPathContext = pathContext.replace(/[\W_]+/g, '_').slice(0, 50);
        pathInZip = `assets/${uploadBaseDir}/${sanitizedPathContext}_${fileName}`.replace(/\/{2,}/g, '/'); // Normalize slashes
        jsonUrl = pathInZip;
        console.log(`[traverseAndCleanServiceData - ServiceEdit] Generating new path for FileObject: ${pathInZip}`);
      }
      assetsToCollect.push({ pathInZip, dataSource: file, type: 'file' });
      // Replace the file object with just the URL for the JSON
      // Important: The key in JSON should point to jsonUrl. Often this is 'image' or 'imageUrl' or 'backgroundImage'.
      // The structure that held the file object might be { image: { file, url, ...} } or image: 'path_string'.
      // We return JUST the jsonUrl string, assuming the calling traversal will place it correctly.
      // This simplification means the block config should expect a string URL after this processing.
      // Example: if original was { config: { heroImage: {file: F, url: B} } }, it becomes { config: { heroImage: "assets/..." } }
      return jsonUrl; // Return only the URL string for the field that held the file object.
    }
    // Handle objects that are not file objects but might contain URLs (e.g., { imageUrl: 'path/to/image.jpg' })
    const newObj = {};
    for (const key in originalDataNode) {
      if (Object.prototype.hasOwnProperty.call(originalDataNode, key)) {
        newObj[key] = traverseAndCleanServiceData(originalDataNode[key], assetsToCollect, `${pathContext}.${key}`, uploadBaseDir);
      }
    }
    return newObj;
  }

  // Handle direct string URLs that might be existing assets
  if (typeof originalDataNode === 'string') {
    // Simplified check: if it doesn't start with http/https/data/blob and contains typical asset paths or extensions.
    const isLikelyLocalAsset = (url) => 
        !url.startsWith('http') && 
        !url.startsWith('data:') && 
        !url.startsWith('blob:') &&
        (url.includes('assets/') || url.includes('Commercial/') || url.includes('uploads/') || url.match(/\.(jpeg|jpg|gif|png|svg|webp|avif|pdf|mp4|webm)$/i) !== null);

    if (isLikelyLocalAsset(originalDataNode)) {
      let pathInZip = originalDataNode.startsWith('/') ? originalDataNode.substring(1) : originalDataNode;
      // Ensure it is placed under an 'assets/' directory in the ZIP if not already structured that way.
      if (!pathInZip.startsWith('assets/')) {
        pathInZip = `assets/${pathInZip}`.replace(/\/{2,}/g, '/'); // Normalize slashes
      }
      // Avoid duplicating asset collection for these existing URLs
      if (!assetsToCollect.some(asset => asset.pathInZip === pathInZip && asset.type === 'url')) {
        assetsToCollect.push({
          pathInZip,
          dataSource: originalDataNode, // The original URL to fetch from
          type: 'url',
        });
        console.log(`[traverseAndCleanServiceData - ServiceEdit] Collected string asset URL: ${pathInZip} from ${originalDataNode}`);
      }
      return pathInZip; // Return the path that will be in the JSON
    }
  }

  // Return primitives and other types (like already processed blob URLs which won't match isLikelyLocalAsset) as is
  return originalDataNode;
}

/* 
=============================================
ServiceEditPage Component
---------------------------------------------
This component provides a comprehensive editor for service pages.
It loads data from services.json and allows editing of all
service page content.
=============================================
*/
const ServiceEditPage = ({ themeColors }) => {
  const [servicesData, setServicesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { services: configServices } = useConfig();
  const [initialServicesDataForOldExport, setInitialServicesDataForOldExport] = useState(null); // For "old" export
  const [selectedCategory, setSelectedCategory] = useState("commercial");
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedBlockType, setSelectedBlockType] = useState(
    Object.keys(blockMap)[0]
  );
  // Track which block is being edited (stores blockIndex)
  const [activeEditBlockIndex, setActiveEditBlockIndex] = useState(null);

  // Update the reference when servicesData changes
  useEffect(() => {
    if (servicesData) {
      servicesDataRef = servicesData;
    }
  }, [servicesData]);

  // DEBUG: Log activeEditBlockIndex changes
  useEffect(() => {
    console.log('[ServiceEditPage] activeEditBlockIndex changed to:', activeEditBlockIndex);
  }, [activeEditBlockIndex]);

  // Fetch services.json on mount
  useEffect(() => {
    if (configServices) {
      setServicesData(configServices);
      setLoading(false);
      try {
          setInitialServicesDataForOldExport(JSON.parse(JSON.stringify(configServices))); // Deep copy for "old" export
      } catch (e) {
          console.error("Could not deep clone initial services data for old export:", e);
          setInitialServicesDataForOldExport(null);
      }
      const page = configServices[selectedCategory].find(
        (p) => p.id === Number(selectedPageId)
      );
      setCurrentPage(page);
    } else {
      setError("No services data available");
      setLoading(false);
    }
  }, [configServices, selectedCategory, selectedPageId]);

  // Update current page when category or page ID changes
  useEffect(() => {
    if (servicesData) {
      const page = servicesData[selectedCategory]?.find(
        (p) => p.id === Number(selectedPageId)
      );
      setCurrentPage(page || null); // Handle page not found if servicesData is temporarily out of sync
    }
  }, [selectedCategory, selectedPageId, servicesData]);

  // Reset activeEditBlockIndex ONLY when category or page ID changes.
  useEffect(() => {
    setActiveEditBlockIndex(null);
    console.log('[ServiceEditPage] Category or Page ID changed, resetting activeEditBlockIndex.');
  }, [selectedCategory, selectedPageId]);

  /* 
  =============================================
  handleDownloadJSON
  ---------------------------------------------
  Downloads the edited services data as a JSON file
  =============================================
  */
  // const handleDownloadJSON = async () => { ... }; // Commented out for now

  /* 
  =============================================
  handleConfigChange
  ---------------------------------------------
  Updates a specific configuration field in a block.
  =============================================
  */
  const handleConfigChange = (blockIndex, key, value) => {
    const updatedPage = { ...currentPage };
    updatedPage.blocks = updatedPage.blocks.map((block, index) => {
      if (index === blockIndex) {
        return {
          ...block,
          config: {
            ...block.config,
            [key]: value,
          },
        };
      }
      return block;
    });
    setCurrentPage(updatedPage);

    // Also update the master JSON in servicesData
    const updatedData = { ...servicesData };
    updatedData[selectedCategory] = updatedData[selectedCategory].map((page) =>
      page.id === updatedPage.id ? updatedPage : page
    );
    setServicesData(updatedData);
  };

  /* 
  =============================================
  handleFileChange
  ---------------------------------------------
  Handles file uploads for images within blocks.
  =============================================
  */
  const handleFileChange = (blockIndex, key, file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store the file object itself for later processing (e.g., zipping)
    // and the URL for display. The config field should store an object.
    const fileData = {
      file: file,
      url: fileURL, // For preview
      name: file.name,
      // originalUrl will be set/preserved if this file replaces an existing one
    };
    handleConfigChange(blockIndex, key, fileData);
  };

  /**
   * Gets the display URL from either a string URL or an object with a URL property
   */
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // New handler for when a block commits its entire config.
  // This will be passed as onConfigChange to each block component.
  const handleBlockConfigUpdate = (blockIndex, newConfig) => {
    const updatedPage = { ...currentPage };
    updatedPage.blocks = updatedPage.blocks.map((block, index) => {
      if (index === blockIndex) {
        return { ...block, config: newConfig };
      }
      return block;
    });
    setCurrentPage(updatedPage);

    const updatedData = { ...servicesData };
    updatedData[selectedCategory] = updatedData[selectedCategory].map((page) =>
      page.id === updatedPage.id ? updatedPage : page
    );
    setServicesData(updatedData);
  };

  // New handler for file changes from within a block's EditorPanel or in-place edit.
  // This is designed to store the file object correctly for ZIP export.
  const handleFileChangeForBlock = (blockIndex, configKeyOrPathData, fileOrFileObject) => {
    if (!fileOrFileObject) return;

    let newImageConfig;
    const currentBlock = currentPage.blocks[blockIndex];
    let existingImageConfig;

    // Determine if we are updating a direct config key or a nested path
    let isNestedPath = typeof configKeyOrPathData === 'object' && configKeyOrPathData !== null;
    let configKeyToUpdate = isNestedPath ? configKeyOrPathData.field : configKeyOrPathData;

    if (isNestedPath) {
        // Accessing nested existing config, e.g., items[itemIndex].pictures[picIndex]
        // This is a simplified example; a robust solution would use a helper to get/set nested properties.
        if (configKeyOrPathData.field === 'pictures' && currentBlock.config.items && currentBlock.config.items[configKeyOrPathData.blockItemIndex]) {
            existingImageConfig = currentBlock.config.items[configKeyOrPathData.blockItemIndex].pictures?.[configKeyOrPathData.pictureIndex];
        }
    } else {
        existingImageConfig = currentBlock?.config?.[configKeyToUpdate];
    }

    if (fileOrFileObject instanceof File) { // A new file is uploaded
        if (existingImageConfig && typeof existingImageConfig === 'object' && existingImageConfig.url && existingImageConfig.url.startsWith('blob:')) {
            URL.revokeObjectURL(existingImageConfig.url);
        }
        const fileURL = URL.createObjectURL(fileOrFileObject);
        newImageConfig = {
            file: fileOrFileObject,
            url: fileURL,
            name: fileOrFileObject.name,
            originalUrl: (typeof existingImageConfig === 'object' ? existingImageConfig.originalUrl : typeof existingImageConfig === 'string' ? existingImageConfig : null) || `assets/service_uploads/generated/${fileOrFileObject.name}` // Preserve or generate
        };
    } else if (typeof fileOrFileObject === 'object' && fileOrFileObject.url !== undefined) { // It's already a file object structure (e.g., from pasting a URL)
        // If the existing one was a blob from a file, revoke it
        if (existingImageConfig && typeof existingImageConfig === 'object' && existingImageConfig.file && existingImageConfig.url && existingImageConfig.url.startsWith('blob:')) {
           if (existingImageConfig.url !== fileOrFileObject.url) { // Only revoke if URL is different
             URL.revokeObjectURL(existingImageConfig.url);
           }
        }
        newImageConfig = fileOrFileObject; // Assume it's correctly formatted { file?, url, name?, originalUrl? }
    } else if (typeof fileOrFileObject === 'string') { // Pasted URL string
        if (existingImageConfig && typeof existingImageConfig === 'object' && existingImageConfig.file && existingImageConfig.url && existingImageConfig.url.startsWith('blob:')) {
            URL.revokeObjectURL(existingImageConfig.url);
        }
        newImageConfig = {
            file: null,
            url: fileOrFileObject,
            name: fileOrFileObject.split('/').pop(),
            originalUrl: fileOrFileObject
        };
    } else {
        console.warn("Unsupported file/URL type in handleFileChangeForBlock", fileOrFileObject);
        return;
    }

    // Update master servicesData
    const updatedPage = { ...currentPage };
    updatedPage.blocks = updatedPage.blocks.map((block, index) => {
        if (index === blockIndex) {
            let newBlockConfig = { ...block.config };
            if (isNestedPath && configKeyOrPathData.field === 'pictures') {
                if (!newBlockConfig.items) newBlockConfig.items = [];
                while (newBlockConfig.items.length <= configKeyOrPathData.blockItemIndex) {
                    newBlockConfig.items.push({ pictures: [] }); // Ensure item and pictures array exist
                }
                if (!newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures) {
                    newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures = [];
                }
                // Ensure picture slot exists
                 while (newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures.length <= configKeyOrPathData.pictureIndex) {
                    newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures.push(null);
                }
                newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures[configKeyOrPathData.pictureIndex] = newImageConfig;
            } else {
                newBlockConfig[configKeyToUpdate] = newImageConfig;
            }
            return {
                ...block,
                config: newBlockConfig,
            };
        }
        return block;
    });
    setCurrentPage(updatedPage);

    const updatedData = { ...servicesData };
    updatedData[selectedCategory] = updatedData[selectedCategory].map((page) =>
        page.id === updatedPage.id ? updatedPage : page
    );
    setServicesData(updatedData);
  };

  /* 
  =============================================
  renderArrayField
  ---------------------------------------------
  Renders form controls for array-type configuration fields.
  =============================================
  */
  const renderArrayField = (blockIndex, key, arr) => {
    return (
      <div key={key} className="mb-3 border p-2 rounded">
        <label className="block mb-1 font-semibold text-gray-300">{key} (Array):</label>
        {arr.map((item, idx) => {
          // Handle items that are images (string URL or object with a file)
          if (
            (typeof item === "string" || typeof item === "object") &&
            (key.toLowerCase().includes("image") ||
              key.toLowerCase().includes("picture"))
          ) {
            return (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Create a URL for display and store file object
                      const fileURL = URL.createObjectURL(file);
                      const fileData = { file: file, url: fileURL, name: file.name };

                      // Update the array with the file data object
                      const newArr = [...arr];
                      newArr[idx] = fileData;
                      handleConfigChange(blockIndex, key, newArr);
                    }
                  }}
                  className="flex-1 p-1 border text-gray-700 rounded"
                />
                {item && (
                  <div className="ml-2 flex items-center">
                    <img
                      src={typeof item === "string" ? item : item.url}
                      alt={`Preview ${idx}`}
                      className="h-10 w-10 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newArr = [...arr];
                        const removedItem = newArr.splice(idx, 1)[0];
                        // Revoke blob URL if it's a file object
                        if (typeof removedItem === 'object' && removedItem.url && removedItem.url.startsWith('blob:')) {
                          URL.revokeObjectURL(removedItem.url);
                        }
                        handleConfigChange(blockIndex, key, newArr);
                      }}
                      className="ml-2 bg-red-500 text-white p-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          }

          // Handle items that are objects (nested properties)
          if (typeof item === "object" && item !== null) {
            return (
              <div key={idx} className="border-l-2 pl-2 mb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Item {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newArr = [...arr];
                      newArr.splice(idx, 1);
                      handleConfigChange(blockIndex, key, newArr);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
                {Object.entries(item).map(([subKey, subValue]) => {
                  if (subKey === "file") return null; // Skip file objects
                  return (
                    <div key={subKey} className="ml-2 mb-1">
                      <label className="block text-sm">{subKey}:</label>
                      <input
                        type="text"
                        value={subValue || ''} // Ensure value is not null/undefined for input
                        onChange={(e) => {
                          const newArr = [...arr];
                          newArr[idx] = {
                            ...newArr[idx],
                            [subKey]: e.target.value,
                          };
                          handleConfigChange(blockIndex, key, newArr);
                        }}
                        className="w-full p-1 border rounded text-gray-800"
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          // Handle simple string/number items
          return (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newArr = [...arr];
                  newArr[idx] = e.target.value;
                  handleConfigChange(blockIndex, key, newArr);
                }}
                className="flex-grow border px-2 py-1 rounded text-gray-800"
              />
              <button
                type="button"
                onClick={() => {
                  const newArr = [...arr];
                  newArr.splice(idx, 1);
                  handleConfigChange(blockIndex, key, newArr);
                }}
                className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => {
            let newItem;
            if (arr.length > 0) {
              const lastItem = arr[arr.length - 1];
              if (typeof lastItem === "object" && lastItem !== null) {
                // Create a new object with the same structure but empty values
                newItem = Object.keys(lastItem).reduce((obj, key) => {
                  if (key !== "file" && key !== "url") {
                    // Skip file-related properties
                    obj[key] = "";
                  }
                  return obj;
                }, {});
              } else {
                newItem = "";
              }
            } else {
              // If array is empty, add a simple string
              newItem = "";
            }
            handleConfigChange(blockIndex, key, [...arr, newItem]);
          }}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Add Item
        </button>
      </div>
    );
  };

  /* 
  =============================================
  renderPageButtons
  ---------------------------------------------
  Renders navigation buttons for switching between service pages.
  =============================================
  */
  const renderPageButtons = () => {
    if (!servicesData) return null;

    return (
      <div className="mb-6 flex justify-between items-start">
        <div className="flex flex-col space-y-2 items-start">
          {Object.keys(servicesData).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                if (servicesData[category] && servicesData[category].length > 0) {
                  setSelectedPageId(servicesData[category][0].id);
                }
              }}
              className={`px-4 py-2 rounded text-sm font-medium w-full text-left ${selectedCategory === category ? 'bg-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-start items-start w-3/4">
          {servicesData[selectedCategory].map((page) => {
            const heroBlock =
              page.blocks.find((b) => b.blockName === "HeroBlock") ||
              page.blocks[0];
            const serviceName =
              heroBlock?.config?.title ||
              page.name ||
              page.title ||
              `Service ${page.id}`;

            return (
              <button
                key={page.id}
                onClick={() => setSelectedPageId(page.id)}
                className={`px-3 py-1 rounded text-xs ${selectedPageId === page.id ? 'bg-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {serviceName}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // SVG icons
  const PencilIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5" // Adjusted size for toggle button
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"
      />
    </svg>
  );

  const CheckIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
    </svg>
  );

  /* 
  =============================================
  renderBlockEditor
  ---------------------------------------------
  Renders the editor for a specific block.
  =============================================
  */
  const renderBlockEditor = (block, blockIndex) => {
    const Component = blockMap[block.blockName];
    const isEditingThisBlock = activeEditBlockIndex === blockIndex;

    if (!Component) {
      return (
        <div key={`unknown-${blockIndex}`} className="bg-red-100 p-4 mb-0">
          <p className="text-red-700">Unknown block type: {block.blockName}</p>
        </div>
      );
    }

    // Ensure block.config is an object
    const blockConfig = block.config || {};

    return (
      <div
        key={block.uniqueKey || blockIndex} // Use uniqueKey if available
        className="relative border-t border-b border-gray-300 mb-0 bg-white overflow-hidden"
      >
        <div className="absolute top-2 right-2 z-40"> {/* Adjusted positioning for better visibility */}
          <button
            type="button"
            onClick={() => {
              // This is the ONLY place activeEditBlockIndex should be set.
              // Clicking the button toggles the state for the current block.
              if (isEditingThisBlock) {
                setActiveEditBlockIndex(null); // Close if already editing this block
              } else {
                setActiveEditBlockIndex(blockIndex); // Open for this block if not already
              }
            }}
            className={`${isEditingThisBlock ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-2 shadow-lg transition-colors`}
            title={isEditingThisBlock ? "Done Editing" : "Edit Block"}
          >
            {isEditingThisBlock ? CheckIcon : PencilIcon}
          </button>
        </div>

        {/* Block Preview */}
        <Component 
          config={blockConfig} 
          readOnly={!isEditingThisBlock} 
          onConfigChange={(newFullConfig) => handleBlockConfigUpdate(blockIndex, newFullConfig)}
          getDisplayUrl={getDisplayUrlHelper} // Pass display helper
          // Pass file handler for blocks that manage files directly in their preview (e.g., in-place image upload)
          onFileChange={(fieldKey, fileOrFileObject) => handleFileChangeForBlock(blockIndex, fieldKey, fileOrFileObject)}
        />

        {/* Inline Editor Panel - Render if isEditingThisBlock and Component.EditorPanel exists */}
        {isEditingThisBlock && Component.EditorPanel && (
          <div className="border-t border-gray-200 bg-gray-100 p-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">{block.blockName} - Edit Panel</h3>
            <Component.EditorPanel
              currentConfig={blockConfig}
              onPanelConfigChange={(updatedFields) => {
                // This merges specific field updates from the panel into the block's config
                const currentBlockConfig = currentPage.blocks[blockIndex].config || {};
                const newConfig = { ...currentBlockConfig, ...updatedFields };
                handleBlockConfigUpdate(blockIndex, newConfig);
              }}
              onPanelFileChange={(fieldKey, fileOrFileObject) => {
                // For file inputs within the EditorPanel
                handleFileChangeForBlock(blockIndex, fieldKey, fileOrFileObject);
              }}
              getDisplayUrl={getDisplayUrlHelper} // Pass display helper to panel too
              themeColors={themeColors} // Pass themeColors to EditorPanel
            />
          </div>
        )}
      </div>
    );
  };

  /* 
  =============================================
  handleMoveBlock
  ---------------------------------------------
  Moves a block up or down in the page layout.
  =============================================
  */
  const handleMoveBlock = (blockIndex, direction) => {
    const updatedPage = { ...currentPage };
    const newIndex = direction === "up" ? blockIndex - 1 : blockIndex + 1;

    // Validate the new index
    if (newIndex < 0 || newIndex >= updatedPage.blocks.length) {
      return;
    }

    // Swap the blocks
    const temp = updatedPage.blocks[blockIndex];
    updatedPage.blocks[blockIndex] = updatedPage.blocks[newIndex];
    updatedPage.blocks[newIndex] = temp;

    // Update the current page
    setCurrentPage(updatedPage);

    // Update the master data
    const updatedData = { ...servicesData };
    updatedData[selectedCategory] = updatedData[selectedCategory].map((page) =>
      page.id === updatedPage.id ? updatedPage : page
    );
    setServicesData(updatedData);
  };

  /* 
  =============================================
  handleRemoveBlock
  ---------------------------------------------
  Removes a block from the page layout.
  =============================================
  */
  const handleRemoveBlock = (blockIndex) => {
    if (!window.confirm("Are you sure you want to remove this block?")) {
      return;
    }

    const updatedPage = { ...currentPage };
    updatedPage.blocks.splice(blockIndex, 1);

    // Update the current page
    setCurrentPage(updatedPage);

    // Update the master data
    const updatedData = { ...servicesData };
    updatedData[selectedCategory] = updatedData[selectedCategory].map((page) =>
      page.id === updatedPage.id ? updatedPage : page
    );
    setServicesData(updatedData);
  };

  /* 
  =============================================
  renderObjectField
  ---------------------------------------------
  Renders form controls for object-type configuration fields.
  =============================================
  */
  const renderObjectField = (blockIndex, key, obj) => {
    return (
      <div key={key} className="mb-3 border p-2 rounded">
        <label className="block mb-1 font-semibold text-gray-300">{key} (Object):</label>
        <div className="space-y-2">
          {Object.entries(obj).map(([subKey, subValue]) => {
            if (typeof subValue === "boolean") {
              return (
                <div key={subKey} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={subValue}
                      onChange={(e) => {
                        const updatedObj = {
                          ...obj,
                          [subKey]: e.target.checked,
                        };
                        handleConfigChange(blockIndex, key, updatedObj);
                      }}
                      className="mr-2"
                    />
                    <span>{subKey}</span>
                  </label>
                </div>
              );
            } else if (typeof subValue === "number") {
              return (
                <div key={subKey} className="mb-2">
                  <label className="block mb-1">{subKey}:</label>
                  <input
                    type="number"
                    value={subValue}
                    onChange={(e) => {
                      const updatedObj = {
                        ...obj,
                        [subKey]: parseFloat(e.target.value),
                      };
                      handleConfigChange(blockIndex, key, updatedObj);
                    }}
                    className="w-full p-1 border rounded text-gray-800"
                  />
                </div>
              );
            } else {
              return (
                <div key={subKey} className="mb-2">
                  <label className="block mb-1">{subKey}:</label>
                  <input
                    type="text"
                    value={subValue || ""}
                    onChange={(e) => {
                      const updatedObj = { ...obj, [subKey]: e.target.value };
                      handleConfigChange(blockIndex, key, updatedObj);
                    }}
                    className="w-full p-1 border rounded text-gray-800"
                  />
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  /* 
  =============================================
  renderAddBlockSection
  ---------------------------------------------
  Renders the controls for adding a new block.
  =============================================
  */
  const renderAddBlockSection = () => {
    const blockOptions = Object.keys(blockMap).map((blockName) => {
      // Create more user-friendly display names
      const displayNames = {
        HeroBlock: "Hero Section",
        GeneralList: "Service Options List",
        VideoCTA: "Video Call-to-Action",
        GeneralListVariant2: "Features List",
        OverviewAndAdvantagesBlock: "Overview & Advantages",
        ActionButtonBlock: "Action Button",
        HeaderBannerBlock: "Header Banner",
        PricingGrid: "Pricing Grid",
        ListDropdown: "FAQ Dropdown",
        GridImageTextBlock: "Image & Text Grid",
        ThreeGridWithRichTextBlock: "Three Column Grid",
        ImageWrapBlock: "Wrapped Image",
        ShingleSelectorBlock: "Shingle Selector",
        ListImageVerticalBlock: "Vertical List with Images",
      };

      return {
        value: blockName,
        label: displayNames[blockName] || blockName,
      };
    });

    const handleAddBlock = () => {
      const blockDefaults = getDefaultConfigForBlock(selectedBlockType);

      const updatedPage = { ...currentPage };
      // Ensure blocks array exists
      if (!updatedPage.blocks) updatedPage.blocks = [];

      // Insert the new block at the beginning of the array (after any HeroBlock)
      const heroBlockIndex = updatedPage.blocks.findIndex(
        (block) => block.blockName === "HeroBlock"
      );
      const insertIndex = heroBlockIndex === -1 ? 0 : heroBlockIndex + 1;

      updatedPage.blocks.splice(insertIndex, 0, {
        blockName: selectedBlockType,
        config: blockDefaults,
        uniqueKey: `${selectedBlockType}_${Date.now()}` // Add unique key
      });

      // Update the current page
      setCurrentPage(updatedPage);

      // Update the master data
      const updatedData = { ...servicesData };
      updatedData[selectedCategory] = updatedData[selectedCategory].map(
        (page) => (page.id === updatedPage.id ? updatedPage : page)
      );
      setServicesData(updatedData);

      // Automatically open edit mode for the new block
      setActiveEditBlockIndex(insertIndex);
    };

    return (
      <div className="flex items-center gap-3 mb-4 p-3 bg-white border border-gray-300 rounded">
        <select
          value={selectedBlockType}
          onChange={(e) => setSelectedBlockType(e.target.value)}
          className="p-2 border rounded flex-grow"
        >
          {blockOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddBlock}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
        >
          Add Block
        </button>
      </div>
    );
  };

  /**
   * Get default configuration for a block type
   */
  const getDefaultConfigForBlock = (blockType) => {
    // Default configurations for different block types
    const defaults = {
      HeroBlock: {
        backgroundImage: "",
        title: "New Section",
        shrinkAfterMs: 1000,
        initialHeight: "40vh",
        finalHeight: "20vh",
      },
      GeneralList: {
        sectionTitle: "New List Section",
        items: [
          {
            id: Date.now(),
            name: "Item 1",
            description: "Description for item 1",
            advantages: ["Advantage 1", "Advantage 2"],
            pictures: [],
          },
        ],
      },
      // Add defaults for other block types as needed
      GridImageTextBlock: {
        columns: 2,
        items: [
          {
            title: "New Feature",
            image: "",
            alt: "Feature image",
            description: "Description of this feature",
          },
        ],
      },
    };

    // Return the default config for the requested block type, or a generic empty object
    return defaults[blockType] || {};
  };

  if (!servicesData || !currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading service data...</p>
      </div>
    );
  }

  return (
    <div className="">
      {renderPageButtons()}
      {renderAddBlockSection()}

      {/* Blocks */}
      <div className="border border-gray-300 rounded overflow-hidden">
        {currentPage.blocks.map((block, blockIndex) =>
          renderBlockEditor(block, blockIndex)
        )}
      </div>
    </div>
  );
};

// Export the component and the services data getter
ServiceEditPage.propTypes = {
  themeColors: PropTypes.object, // Add prop type for themeColors
};

export default ServiceEditPage;
export const getServicesData = () => servicesDataRef;
export { blockMap }; // Export blockMap
