import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
// import JSZip from "jszip"; // No longer needed for zipping here
// import { useConfig } from "../context/ConfigContext"; // No longer needed for services

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
// let servicesDataRef = null;

// Helper to get display URL (can be enhanced for file objects later)
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value; // Handles direct URLs or blob URLs
  if (typeof value === "object" && value.url) return value.url; // Handles { url: '...', ... }
  return null;
};

// Helper to transform string URLs to file object format for compatibility
// const transformImageUrlToFileObject = (url) => { ... };

// Helper to recursively transform image fields in service data
// const transformServiceDataImages = (data) => { ... };

// REMOVE traverseAndCleanServiceData function
// function traverseAndCleanServiceData(originalDataNode, assetsToCollect, pathContext, uploadBaseDir) {
//   // ... entire function body ...
// }

/* 
=============================================
ServiceEditPage Component
---------------------------------------------
This component provides a comprehensive editor for service pages.
It loads data from services.json and allows editing of all
service page content.
=============================================
*/
const ServiceEditPage = ({ servicesData: servicesDataFromProps, onServicesChange, themeColors }) => {
  // Removed local states: servicesData, loading, error, initialServicesDataForOldExport
  // const { services: configServices } = useConfig(); // Removed

  const [selectedCategory, setSelectedCategory] = useState("commercial");
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedBlockType, setSelectedBlockType] = useState(Object.keys(blockMap)[0]);
  const [activeEditBlockIndex, setActiveEditBlockIndex] = useState(null);

  // Derive currentPage from props
  useEffect(() => {
    if (servicesDataFromProps && servicesDataFromProps[selectedCategory]) {
      const page = servicesDataFromProps[selectedCategory].find(
        (p) => p.id === Number(selectedPageId)
      );
      setCurrentPage(page || null); // Set to null if page not found
      if (!page) {
        console.warn(`[ServiceEditPage] Page not found for category '${selectedCategory}', ID '${selectedPageId}'`);
        // Optionally reset selectedPageId to the first available if current one is invalid
        if (servicesDataFromProps[selectedCategory].length > 0) {
          setSelectedPageId(servicesDataFromProps[selectedCategory][0].id);
        }
      }
    } else {
      setCurrentPage(null); // No data or category
    }
  }, [servicesDataFromProps, selectedCategory, selectedPageId]);

  useEffect(() => {
    setActiveEditBlockIndex(null);
  }, [selectedCategory, selectedPageId]);

  // Helper to get display URL (can be enhanced for file objects later)
  // const getDisplayUrlHelper = (value) => { ... };

  // Update internal page state and then call onServicesChange prop with the full updated page data
  const updatePageAndPropagate = (updatedPageData) => {
    setCurrentPage(updatedPageData);
    if (onServicesChange) {
      onServicesChange(updatedPageData, selectedCategory, selectedPageId);
    } else {
      console.warn("[ServiceEditPage] onServicesChange prop is not defined.");
    }
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
    if (typeof value === "object") {
      // Handle file objects with blob URLs (priority for uploaded files)
      if (value.file && value.url && value.url.startsWith('blob:')) return value.url;
      // Handle file objects with regular URLs
      if (value.url) return value.url;
      // Handle objects that might have other URL properties
      if (value.originalUrl) return value.originalUrl;
    }
    return null;
  };

  // Modified handleBlockConfigUpdate to use updatePageAndPropagate
  const handleBlockConfigUpdate = (blockIndex, newConfig) => {
    if (!currentPage) return;
    const updatedBlocks = currentPage.blocks.map((block, index) => {
      if (index === blockIndex) {
        return { ...block, config: newConfig };
      }
      return block;
    });
    updatePageAndPropagate({ ...currentPage, blocks: updatedBlocks });
  };

  // Modified handleFileChangeForBlock to use updatePageAndPropagate
  const handleFileChangeForBlock = (blockIndex, configKeyOrPathData, fileOrFileObject) => {
    if (!currentPage || !fileOrFileObject) return;

    let newMediaConfig;
    const currentBlock = currentPage.blocks[blockIndex];
    let existingMediaConfig;
    let isNestedPath = typeof configKeyOrPathData === 'object' && configKeyOrPathData !== null;
    let fieldToUpdate = isNestedPath ? configKeyOrPathData.field : configKeyOrPathData;

    // Simplified access for common structures, expand if needed
    if (isNestedPath) {
        if (configKeyOrPathData.field === 'pictures' && currentBlock.config.items && currentBlock.config.items[configKeyOrPathData.blockItemIndex]) {
            existingMediaConfig = currentBlock.config.items[configKeyOrPathData.blockItemIndex].pictures?.[configKeyOrPathData.pictureIndex];
        } else if (currentBlock.config.items && currentBlock.config.items[configKeyOrPathData.blockItemIndex]) {
            existingMediaConfig = currentBlock.config.items[configKeyOrPathData.blockItemIndex][fieldToUpdate];
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
            originalUrl: (existingMediaConfig?.originalUrl) || `assets/service_uploads/generated/${fileOrFileObject.name}`
        };
    } else if (typeof fileOrFileObject === 'object' && fileOrFileObject.url !== undefined) {
        if (existingMediaConfig?.file && existingMediaConfig?.url?.startsWith('blob:') && existingMediaConfig.url !== fileOrFileObject.url) {
             URL.revokeObjectURL(existingMediaConfig.url);
        }
        newMediaConfig = fileOrFileObject;
    } else if (typeof fileOrFileObject === 'string') { 
        if (existingMediaConfig?.file && existingMediaConfig?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(existingMediaConfig.url);
        }
        newMediaConfig = {
            file: null,
            url: fileOrFileObject,
            name: fileOrFileObject.split('/').pop(),
            originalUrl: fileOrFileObject
        };
    } else {
        console.warn("[ServiceEditPage] Unsupported file/URL type in handleFileChangeForBlock", fileOrFileObject);
        return;
    }

    const updatedBlocks = currentPage.blocks.map((block, index) => {
        if (index === blockIndex) {
            let newBlockConfig = { ...block.config };
            if (isNestedPath && fieldToUpdate === 'pictures') {
                if (!newBlockConfig.items) newBlockConfig.items = [];
                 while (newBlockConfig.items.length <= configKeyOrPathData.blockItemIndex) newBlockConfig.items.push({ pictures: [] });
                if (!newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures) newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures = [];
                 while (newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures.length <= configKeyOrPathData.pictureIndex) newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures.push(null);
                newBlockConfig.items[configKeyOrPathData.blockItemIndex].pictures[configKeyOrPathData.pictureIndex] = newMediaConfig;
            } else if (isNestedPath) {
                if (!newBlockConfig.items) newBlockConfig.items = [];
                 while (newBlockConfig.items.length <= configKeyOrPathData.blockItemIndex) newBlockConfig.items.push({});
                 newBlockConfig.items[configKeyOrPathData.blockItemIndex] = { ...newBlockConfig.items[configKeyOrPathData.blockItemIndex], [fieldToUpdate]: newMediaConfig };
            } else {
                newBlockConfig[fieldToUpdate] = newMediaConfig;
            }
            return { ...block, config: newBlockConfig };
        }
        return block;
    });
    updatePageAndPropagate({ ...currentPage, blocks: updatedBlocks });
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
    if (!servicesDataFromProps) return <p>No service data provided.</p>;
    return (
      <div className="mb-6 flex justify-between items-start">
        <div className="flex flex-col space-y-2 items-start">
          {Object.keys(servicesDataFromProps).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                if (servicesDataFromProps[category] && servicesDataFromProps[category].length > 0) {
                  setSelectedPageId(servicesDataFromProps[category][0].id);
                } else {
                  setSelectedPageId(null); // No pages in this category
                }
              }}
              className={`px-4 py-2 rounded text-sm font-medium w-full text-left ${selectedCategory === category ? 'bg-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-start items-start w-3/4">
          {servicesDataFromProps[selectedCategory] && servicesDataFromProps[selectedCategory].map((page) => {
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
    if (!currentPage) return null;
    const Component = blockMap[block.blockName];
    const isEditingThisBlock = activeEditBlockIndex === blockIndex;
    if (!Component) return <div key={`unknown-${blockIndex}`} className="bg-red-100 p-4 mb-0"><p className="text-red-700">Unknown block type: {block.blockName}</p></div>;
    const blockConfig = block.config || {};
    return (
      <div key={block.uniqueKey || blockIndex} className="relative border-t border-b border-gray-300 mb-0 bg-white overflow-hidden">
        <div className="absolute top-2 right-2 z-40">
          <button type="button" onClick={() => setActiveEditBlockIndex(isEditingThisBlock ? null : blockIndex)} className={`${isEditingThisBlock ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-2 shadow-lg transition-colors`} title={isEditingThisBlock ? "Done Editing" : "Edit Block"}>
            {isEditingThisBlock ? CheckIcon : PencilIcon}
          </button>
        </div>
        <Component 
          config={blockConfig} 
          readOnly={!isEditingThisBlock} 
          onConfigChange={(newFullConfig) => handleBlockConfigUpdate(blockIndex, newFullConfig)}
          getDisplayUrl={getDisplayUrlHelper}
          onFileChange={(fieldKey, fileOrFileObject) => handleFileChangeForBlock(blockIndex, fieldKey, fileOrFileObject)}
          themeColors={themeColors} // Pass themeColors here
        />
        {isEditingThisBlock && Component.EditorPanel && (
          <div className="border-t border-gray-200 bg-gray-100 p-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">{block.blockName} - Edit Panel</h3>
            <Component.EditorPanel
              currentConfig={blockConfig}
              onPanelConfigChange={(updatedFields) => {
                const currentBlockConfig = currentPage.blocks[blockIndex].config || {};
                const newConfig = { ...currentBlockConfig, ...updatedFields };
                handleBlockConfigUpdate(blockIndex, newConfig);
              }}
              onPanelFileChange={(fieldKey, fileOrFileObject) => {
                handleFileChangeForBlock(blockIndex, fieldKey, fileOrFileObject);
              }}
              getDisplayUrl={getDisplayUrlHelper}
              themeColors={themeColors}
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
    if (!currentPage) return;
    const updatedBlocks = [...currentPage.blocks];
    const newIndex = direction === "up" ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= updatedBlocks.length) return;
    const temp = updatedBlocks[blockIndex];
    updatedBlocks[blockIndex] = updatedBlocks[newIndex];
    updatedBlocks[newIndex] = temp;
    updatePageAndPropagate({ ...currentPage, blocks: updatedBlocks });
  };

  /* 
  =============================================
  handleRemoveBlock
  ---------------------------------------------
  Removes a block from the page layout.
  =============================================
  */
  const handleRemoveBlock = (blockIndex) => {
    if (!currentPage || !window.confirm("Are you sure you want to remove this block?")) return;
    const updatedBlocks = currentPage.blocks.filter((_, index) => index !== blockIndex);
    updatePageAndPropagate({ ...currentPage, blocks: updatedBlocks });
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
      if (!currentPage) return;
      const blockDefaults = getDefaultConfigForBlock(selectedBlockType);

      const newBlock = {
        blockName: selectedBlockType,
        config: blockDefaults,
        uniqueKey: `${selectedBlockType}_${Date.now()}`
      };
      const heroBlockIndex = currentPage.blocks.findIndex(b => b.blockName === "HeroBlock");
      const insertIndex = heroBlockIndex === -1 ? 0 : heroBlockIndex + 1;
      const updatedBlocks = [...currentPage.blocks];
      updatedBlocks.splice(insertIndex, 0, newBlock);
      updatePageAndPropagate({ ...currentPage, blocks: updatedBlocks });
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
        backgroundImage: { url: "", file: null, name: "", originalUrl: ""},
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
            image: { url: "", file: null, name: "", originalUrl: ""},
            alt: "Feature image",
            description: "Description of this feature",
          },
        ],
      },
    };

    // Return the default config for the requested block type, or a generic empty object
    return defaults[blockType] || {};
  };

  if (!currentPage && !servicesDataFromProps) { // Initial loading state check
    return <div className="min-h-screen flex items-center justify-center"><p>Loading service editor...</p></div>;
  }
  if (!servicesDataFromProps || Object.keys(servicesDataFromProps).length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><p>No service data loaded. Check console.</p></div>;
  }
  if (!currentPage) {
    return (
        <div className="p-4">
            {renderPageButtons()} {/* Still show page buttons to allow selection if possible */}
            <p className="text-center mt-4">Please select a service page to edit, or page not found for current selection.</p>
        </div>
    );
  }

  return (
    <div className="p-4">
      {renderPageButtons()}
      {renderAddBlockSection()}
      <div className="border border-gray-300 rounded overflow-hidden">
        {currentPage.blocks.map((block, blockIndex) => renderBlockEditor(block, blockIndex))}
      </div>
    </div>
  );
};

ServiceEditPage.propTypes = {
  servicesData: PropTypes.object, // Expects the full services object
  onServicesChange: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
};

export default ServiceEditPage;
// Removed getServicesData export
export { blockMap }; // Keep exporting blockMap
