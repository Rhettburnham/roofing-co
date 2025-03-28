import { useEffect, useState } from "react";
import PropTypes from "prop-types";

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
const EditOverlay = ({ children, onClose }) => (
  <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex flex-col overflow-auto">
    <div className="flex justify-end p-2">
      <button
        type="button"
        onClick={onClose}
        className="bg-gray-800 rounded-full p-2 text-white hover:bg-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    <div className="flex-1 overflow-auto p-4">{children}</div>
  </div>
);

EditOverlay.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

// Export a reference to the services data
let servicesDataRef = null;

/* 
=============================================
ServiceEditPage Component
---------------------------------------------
This component provides a comprehensive editor for service pages.
It loads data from services.json and allows editing of all
service page content.
=============================================
*/
const ServiceEditPage = () => {
  const [servicesData, setServicesData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("commercial");
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedBlockType, setSelectedBlockType] = useState(
    Object.keys(blockMap)[0]
  );
  // Track which block is being edited
  const [activeEditBlock, setActiveEditBlock] = useState(null);

  // Update the reference when servicesData changes
  useEffect(() => {
    if (servicesData) {
      servicesDataRef = servicesData;
    }
  }, [servicesData]);

  // Fetch services.json on mount
  useEffect(() => {
    fetch("/data/services.json")
      .then((res) => res.json())
      .then((data) => {
        setServicesData(data);
        const page = data[selectedCategory].find(
          (p) => p.id === Number(selectedPageId)
        );
        setCurrentPage(page);
      })
      .catch((err) => console.error("Error loading services data:", err));
  }, []);

  // Update current page when category or page ID changes
  useEffect(() => {
    if (servicesData) {
      const page = servicesData[selectedCategory].find(
        (p) => p.id === Number(selectedPageId)
      );
      setCurrentPage(page);
    }
  }, [selectedCategory, selectedPageId, servicesData]);

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

    // Store just the URL for display
    handleConfigChange(blockIndex, key, fileURL);
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
        <label className="block mb-1 font-semibold">{key} (Array):</label>
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
                      // Create a URL for display
                      const fileURL = URL.createObjectURL(file);

                      // Update the array with just the URL
                      const newArr = [...arr];
                      newArr[idx] = fileURL;
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
                        newArr.splice(idx, 1);
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
                        value={subValue}
                        onChange={(e) => {
                          const newArr = [...arr];
                          newArr[idx] = {
                            ...newArr[idx],
                            [subKey]: e.target.value,
                          };
                          handleConfigChange(blockIndex, key, newArr);
                        }}
                        className="w-full border px-2 py-1 rounded"
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
                className="flex-grow border px-2 py-1 rounded"
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
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(servicesData).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded ${
                selectedCategory === category
                  ? "bg-blue text-white drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)]"
                  : "bg-gray-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {servicesData[selectedCategory].map((page) => {
            // Find the service name from the HeroBlock or first block
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
                className={`px-3 py-1 rounded ${
                  selectedPageId === page.id
                    ? "bg-blue text-white drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)]"
                    : "bg-gray-200"
                }`}
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
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"
      />
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

    if (!Component) {
      return (
        <div className="bg-red-100 p-4 mb-0">
          <p className="text-red-700">Unknown block type: {block.blockName}</p>
        </div>
      );
    }

    // Always show HeroBlock without toggle option if it's the first block
    const isHeroBlock = block.blockName === "HeroBlock" && blockIndex === 0;

    return (
      <div
        key={blockIndex}
        className="relative border-t border-b border-gray-300 mb-0 bg-white overflow-hidden"
      >
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock(blockIndex)}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>

        {/* Always show the preview */}
        <Component config={block.config} readOnly={true} />

        {/* Show editing overlay when activeEditBlock matches this block's index */}
        {activeEditBlock === blockIndex && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <div className="bg-gray-800 p-4 mb-0 text-white">
              <h3 className="text-lg font-semibold">{block.blockName}</h3>
              <div className="mt-4">
                <div className="space-y-3 max-h-[600px] overflow-y-auto p-3 bg-gray-700 rounded">
                  {Object.entries(block.config).map(([key, value]) => {
                    // Skip rendering certain fields that are handled specially
                    if (key === "id") return null;

                    // Handle different field types
                    if (Array.isArray(value)) {
                      return renderArrayField(blockIndex, key, value);
                    } else if (typeof value === "object" && value !== null) {
                      return renderObjectField(blockIndex, key, value);
                    } else if (typeof value === "boolean") {
                      return (
                        <div key={key} className="mb-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                handleConfigChange(
                                  blockIndex,
                                  key,
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            <span>{key}</span>
                          </label>
                        </div>
                      );
                    } else if (typeof value === "number") {
                      return (
                        <div key={key} className="mb-3">
                          <label className="block mb-1">{key}:</label>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) =>
                              handleConfigChange(
                                blockIndex,
                                key,
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full p-1 border rounded"
                          />
                        </div>
                      );
                    } else {
                      // Handle image fields specially
                      if (
                        key.toLowerCase().includes("image") ||
                        key.toLowerCase().includes("picture") ||
                        key.toLowerCase().includes("photo")
                      ) {
                        return (
                          <div key={key} className="mb-3">
                            <label className="block mb-1">{key}:</label>
                            <div className="flex flex-col space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    handleFileChange(blockIndex, key, file);
                                  }
                                }}
                                className="p-1 border rounded"
                              />
                              {getDisplayUrl(value) && (
                                <div className="mt-2">
                                  <img
                                    src={getDisplayUrl(value)}
                                    alt={`Preview for ${key}`}
                                    className="h-24 object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        // Default text input
                        return (
                          <div key={key} className="mb-3">
                            <label className="block mb-1">{key}:</label>
                            <input
                              type="text"
                              value={value || ""}
                              onChange={(e) =>
                                handleConfigChange(
                                  blockIndex,
                                  key,
                                  e.target.value
                                )
                              }
                              className="w-full p-1 border rounded"
                            />
                          </div>
                        );
                      }
                    }
                  })}
                </div>
              </div>

              {/* Block action buttons */}
              <div className="mt-4 flex justify-between">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleMoveBlock(blockIndex, "up")}
                    disabled={blockIndex === 0}
                    className={`px-3 py-1 rounded ${
                      blockIndex === 0
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Move Up
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveBlock(blockIndex, "down")}
                    disabled={blockIndex === currentPage.blocks.length - 1}
                    className={`px-3 py-1 rounded ${
                      blockIndex === currentPage.blocks.length - 1
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Move Down
                  </button>
                </div>
                {!isHeroBlock && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(blockIndex)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Remove Block
                  </button>
                )}
              </div>
            </div>
          </EditOverlay>
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
        <label className="block mb-1 font-semibold">{key} (Object):</label>
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
                    className="w-full p-1 border rounded"
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
                    className="w-full p-1 border rounded"
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
      // Insert the new block at the beginning of the array (after any HeroBlock)
      const heroBlockIndex = updatedPage.blocks.findIndex(
        (block) => block.blockName === "HeroBlock"
      );
      const insertIndex = heroBlockIndex === -1 ? 0 : heroBlockIndex + 1;

      updatedPage.blocks.splice(insertIndex, 0, {
        blockName: selectedBlockType,
        config: blockDefaults,
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
      setActiveEditBlock(insertIndex);
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
    <div className="container mx-auto px-4 py-6 bg-gray-100">
      <div className="mb-4 bg-gray-800 text-white p-4 rounded">
        <h1 className="text-2xl font-bold">Service Pages</h1>
        <p className="text-gray-300 mt-1">
          Edit individual service pages and their blocks
        </p>
      </div>

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
export default ServiceEditPage;
export const getServicesData = () => servicesDataRef;
