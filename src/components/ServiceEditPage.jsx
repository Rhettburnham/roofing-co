import React, { useEffect, useState } from "react";

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

// Export a reference to the services data
let servicesDataRef = null;

/* 
=============================================
ServiceEditPage Component
---------------------------------------------
This component provides a comprehensive editor for service pages.
It loads data from services.json and allows editing of all
service page content.

Key features:
- Loads and parses the services.json file
- Allows switching between service categories and pages
- Provides form controls for editing all aspects of each block
- Supports image uploads with local preview
- Enables downloading the edited JSON for later integration

This is part of the website's content management system that
allows for local editing of content without direct database access.
The edited JSON can be downloaded with the same filename and sent 
to the developer for permanent integration into the site.
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
  // Add state to track which blocks are being edited
  const [editingBlocks, setEditingBlocks] = useState({});

  // Update the reference when servicesData changes
  useEffect(() => {
    if (servicesData) {
      servicesDataRef = servicesData;
    }
  }, [servicesData]);

  // Fetch services.json on mount
  // This loads the services data for editing
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
  
  This function:
  1. Updates the current page state
  2. Updates the master JSON data in servicesData
  
  This ensures that all changes are tracked both in the
  current view and in the complete dataset that will be
  available for download.
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
  
  This function:
  1. Creates a URL for the uploaded file
  2. Updates the configuration with just the URL for display
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
   *
   * @param {string|Object} value - The value to extract URL from
   * @returns {string|null} - The URL to display
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
  
  This function handles different types of arrays:
  - Image arrays (with file upload controls)
  - Text arrays (with text input controls)
  - Object arrays (with nested form controls)
  
  It provides add/remove functionality for array items and
  appropriate input controls based on the data type.
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
  
  This function:
  1. Groups pages by category
  2. Creates buttons for each page
  3. Highlights the currently selected page
  
  This allows easy navigation between different service pages
  while editing.
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
          {servicesData[selectedCategory].map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              className={`px-3 py-1 rounded ${
                selectedPageId === page.id
                  ? "bg-blue text-white drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)]"
                  : "bg-gray-200"
              }`}
            >
              {page.title || `Page ${page.id}`}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // We'll keep the handleDownload function for potential future use, but not display the button
  const handleDownload = () => {
    const dataStr = JSON.stringify(servicesData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "services.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* 
  =============================================
  renderBlockEditor
  ---------------------------------------------
  Renders the editor for a specific block.

  This function:
  1. Creates a form for editing the block's configuration
  2. Handles different field types (text, number, array, etc.)
  3. Provides controls for adding/removing blocks

  The editor is dynamically generated based on the block's
  configuration, making it flexible for different block types.
  =============================================
  */
  const renderBlockEditor = (block, blockIndex) => {
    const Component = blockMap[block.blockName];

    if (!Component) {
      return (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-700">Unknown block type: {block.blockName}</p>
        </div>
      );
    }

    // Always show HeroBlock without toggle option if it's the first block
    const isHeroBlock = block.blockName === "HeroBlock" && blockIndex === 0;
    const isEditing = editingBlocks[blockIndex];

    return (
      <div
        key={blockIndex}
        className="border border-gray-300 rounded mb-4 bg-white overflow-hidden block-container"
      >
        <div className="flex justify-between items-center bg-gray-100 p-2">
          <h3 className="text-lg font-semibold">{block.blockName}</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => toggleEditBlock(blockIndex)}
              className={`px-2 py-1 rounded ${
                isEditing
                  ? "bg-blue-700 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
            <button
              type="button"
              onClick={() => handleMoveBlock(blockIndex, "up")}
              disabled={blockIndex === 0}
              className={`px-2 py-1 rounded ${
                blockIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => handleMoveBlock(blockIndex, "down")}
              disabled={blockIndex === currentPage.blocks.length - 1}
              className={`px-2 py-1 rounded ${
                blockIndex === currentPage.blocks.length - 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              ↓
            </button>
            {!isHeroBlock && (
              <button
                type="button"
                onClick={() => handleRemoveBlock(blockIndex)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Always show the preview */}
        <div className="bg-white border-b border-gray-200">
          <Component config={block.config} readOnly={true} />
        </div>

        {/* Only show the edit form when isEditing is true */}
        {isEditing && (
          <div className="grid grid-cols-1 gap-4 p-2 bg-gray-50">
            <div className="rounded">
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="space-y-3 max-h-[500px] overflow-y-auto px-1">
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

  This function:
  1. Swaps the block with its neighbor
  2. Updates both the current page and the master data
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

  This function:
  1. Removes the block at the specified index
  2. Updates both the current page and the master data
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

  This function:
  1. Creates a form for editing nested object properties
  2. Handles different field types within the object
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
  Renders a section for adding new blocks to the page.

  This function:
  1. Creates a dropdown with available block types
  2. Provides an "Add Block" button
  3. Handles the addition of new blocks
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
      setEditingBlocks((prev) => ({
        ...prev,
        [insertIndex]: true,
      }));

      // Scroll to the new block at top
      setTimeout(() => {
        const blockElements = document.querySelectorAll(".block-container");
        if (blockElements[insertIndex]) {
          blockElements[insertIndex].scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    };

    return (
      <div className="bg-white border border-gray-300 rounded mb-6 overflow-hidden">
        <div className="bg-gray-100 p-2 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Add New Block</h3>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-3">
            <select
              value={selectedBlockType}
              onChange={(e) => setSelectedBlockType(e.target.value)}
              className="p-1 border rounded flex-grow"
            >
              {blockOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddBlock}
              className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 whitespace-nowrap"
            >
              Add Block
            </button>
          </div>
        </div>
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

  // Toggle edit mode for a specific block
  const toggleEditBlock = (blockIndex) => {
    setEditingBlocks((prev) => ({
      ...prev,
      [blockIndex]: !prev[blockIndex],
    }));
  };

  if (!servicesData || !currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading service data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          Service Page Editor: {currentPage.title}
        </h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded mb-4">
        <p>
          You are directly editing the content from{" "}
          <strong>services.json</strong>. All changes will be included when you
          download the complete website data ZIP file from the button at the
          bottom of the page.
        </p>
      </div>

      {renderPageButtons()}

      {/* Add Block Section */}
      {renderAddBlockSection()}

      {/* Blocks */}
      {currentPage.blocks.map((block, blockIndex) =>
        renderBlockEditor(block, blockIndex)
      )}
    </div>
  );
};

// Export the component and the services data getter
export default ServiceEditPage;
export const getServicesData = () => servicesDataRef;
