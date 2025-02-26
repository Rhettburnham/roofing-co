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

// Map block names to preview components
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

const ServiceEditPage = () => {
  const [servicesData, setServicesData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("commercial");
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [currentPage, setCurrentPage] = useState(null);

  // Fetch services_edit.json on mount
  useEffect(() => {
    fetch("/data/services_edit.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setServicesData(data);
        const page = data[selectedCategory]?.find(
          (p) => p.id === Number(selectedPageId)
        );
        setCurrentPage(page);
      })
      .catch((error) => {
        console.error("Error fetching services_edit.json:", error);
      });
  }, []);

  // Update currentPage when category or page id changes
  useEffect(() => {
    if (servicesData && servicesData[selectedCategory]) {
      const page = servicesData[selectedCategory].find(
        (p) => p.id === Number(selectedPageId)
      );
      setCurrentPage(page);
    }
  }, [selectedCategory, selectedPageId, servicesData]);

  // Update a block's configuration (handles strings, images, arrays, and objects)
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

  // Update file changes to store both the file and its URL
  const handleFileChange = (blockIndex, key, fileObj) => {
    // fileObj is expected to be an object: { file, url }
    handleConfigChange(blockIndex, key, fileObj);
  };

  // Render editable array fields.
  const renderArrayField = (blockIndex, key, arr) => {
    return (
      <div key={key} className="mb-4 border p-2 rounded">
        <label className="block mb-1 font-semibold">{key} (Array):</label>
        {arr.map((item, idx) => {
          // Handle items that are images (string URL or object with a file)
          if (
            (typeof item === "string" || (typeof item === "object" && !item.file)) &&
            (key.toLowerCase().includes("image") ||
              key.toLowerCase().includes("picture"))
          ) {
            return (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const fileURL = URL.createObjectURL(file);
                      const newArr = [...arr];
                      newArr[idx] = { file, url: fileURL };
                      handleConfigChange(blockIndex, key, newArr);
                    }
                  }}
                  className="flex-1 border rounded p-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newArr = arr.filter((_, i) => i !== idx);
                    handleConfigChange(blockIndex, key, newArr);
                  }}
                  className="ml-2 text-red-500"
                >
                  Remove
                </button>
                {item && (
                  <>
                    {typeof item === "object" ? (
                      <img
                        src={item.url}
                        alt={`Picture ${idx + 1}`}
                        className="ml-2 h-24 rounded shadow"
                      />
                    ) : (
                      <img
                        src={item}
                        alt={`Picture ${idx + 1}`}
                        className="ml-2 h-24 rounded shadow"
                      />
                    )}
                  </>
                )}
              </div>
            );
          }
          // If the item is an object (for non-image fields or complex structures)
          if (typeof item === "object" && item !== null) {
            return (
              <div key={idx} className="mb-2 border p-2 rounded">
                {Object.keys(item).map((subKey) => {
                  if (
                    subKey.toLowerCase().includes("image") ||
                    subKey.toLowerCase().includes("picture")
                  ) {
                    return (
                      <div key={subKey} className="mb-1">
                        <label className="block text-sm font-semibold">
                          {subKey} (Image):
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const fileURL = URL.createObjectURL(file);
                              const newArr = [...arr];
                              newArr[idx] = {
                                ...newArr[idx],
                                [subKey]: { file, url: fileURL },
                              };
                              handleConfigChange(blockIndex, key, newArr);
                            }
                          }}
                          className="w-full border rounded p-1"
                        />
                        {item[subKey] && (
                          <img
                            src={item[subKey].url || item[subKey]}
                            alt={subKey}
                            className="mt-2 h-24 rounded shadow"
                          />
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div key={subKey} className="mb-1">
                        <label className="block text-sm font-semibold">
                          {subKey}:
                        </label>
                        <input
                          type="text"
                          value={item[subKey]}
                          onChange={(e) => {
                            const newArr = [...arr];
                            newArr[idx] = {
                              ...newArr[idx],
                              [subKey]: e.target.value,
                            };
                            handleConfigChange(blockIndex, key, newArr);
                          }}
                          className="w-full border rounded p-1"
                        />
                      </div>
                    );
                  }
                })}
                <button
                  type="button"
                  onClick={() => {
                    const newArr = arr.filter((_, i) => i !== idx);
                    handleConfigChange(blockIndex, key, newArr);
                  }}
                  className="mt-1 text-red-500"
                >
                  Remove Item
                </button>
              </div>
            );
          }
          // Fallback for other types
          return (
            <textarea
              key={idx}
              className="w-full border rounded p-1 mb-2"
              value={JSON.stringify(item, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  const newArr = [...arr];
                  newArr[idx] = parsed;
                  handleConfigChange(blockIndex, key, newArr);
                } catch (err) {
                  console.error("Invalid JSON input for array item", err);
                }
              }}
              rows={3}
            />
          );
        })}
        <button
          type="button"
          onClick={() => {
            let newItem;
            if (arr.length > 0) {
              if (typeof arr[0] === "string") {
                newItem = "";
              } else if (typeof arr[0] === "object" && arr[0] !== null) {
                newItem = {};
                Object.keys(arr[0]).forEach((k) => {
                  newItem[k] = "";
                });
              } else {
                newItem = "";
              }
            } else {
              newItem = "";
            }
            handleConfigChange(blockIndex, key, [...arr, newItem]);
          }}
          className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
        >
          + Add Item
        </button>
      </div>
    );
  };

  // Render a configuration field based on its type.
  const renderConfigField = (blockIndex, key, value) => {
    if (
      (typeof value === "string" &&
        (key.toLowerCase().includes("image") ||
          key.toLowerCase().includes("picture"))) ||
      (typeof value === "object" && value && value.url)
    ) {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 font-semibold">
            {key} (Image):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const fileURL = URL.createObjectURL(file);
                handleFileChange(blockIndex, key, { file, url: fileURL });
              }
            }}
            className="border p-1"
          />
          {value && (
            <>
              {typeof value === "object" ? (
                <img src={value.url} alt={key} className="mt-2 h-24 rounded shadow" />
              ) : (
                <img src={value} alt={key} className="mt-2 h-24 rounded shadow" />
              )}
            </>
          )}
        </div>
      );
    }
    if (typeof value === "string") {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 font-semibold">{key}:</label>
          <input
            type="text"
            value={value}
            onChange={(e) =>
              handleConfigChange(blockIndex, key, e.target.value)
            }
            className="w-full border rounded p-2"
          />
        </div>
      );
    }
    if (Array.isArray(value)) {
      return renderArrayField(blockIndex, key, value);
    }
    if (typeof value === "object" && value !== null) {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 font-semibold">
            {key} (JSON Object):
          </label>
          <textarea
            className="w-full border rounded p-2"
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleConfigChange(blockIndex, key, parsed);
              } catch (err) {
                console.error("Invalid JSON input for", key);
              }
            }}
            rows={4}
          />
        </div>
      );
    }
    return null;
  };

  const renderPageButtons = () => {
    if (!servicesData || !servicesData[selectedCategory]) return null;
    return servicesData[selectedCategory]
      .filter((page) => page.id <= 4)
      .map((page) => (
        <button
          type="button"
          key={page.id}
          onClick={() => setSelectedPageId(page.id)}
          className={`py-1 px-3 rounded mr-2 ${
            Number(selectedPageId) === page.id
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {page.id}
        </button>
      ));
  };

  if (!currentPage) {
    return (
      <div className="p-4">
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 text-black">
      <h1 className="text-3xl font-bold mb-4 text-center">Service Editor</h1>

      {/* Category Selection */}
      <div className="mb-4 flex justify-center">
        <label className="mr-2 font-semibold">Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedPageId(1); // Reset page id on category change
          }}
          className="border rounded p-1"
        >
          <option value="commercial">Commercial</option>
          <option value="residential">Residential</option>
        </select>
      </div>

      {/* Page Navigation */}
      <div className="mb-6 flex justify-center">
        <span className="mr-2 font-semibold">Page ID:</span>
        {renderPageButtons()}
      </div>

      {/* Live Preview */}
      <div className="mb-8 border p-4 rounded shadow bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
        {currentPage.blocks.map((block, index) => {
          const Component = blockMap[block.blockName];
          if (!Component) {
            return (
              <div key={index}>
                No preview available for block: {block.blockName}
              </div>
            );
          }
          return (
            <Component key={index} config={block.config} readOnly={true} />
          );
        })}
      </div>

      {/* Editor Section */}
      <div className="border p-4 rounded shadow bg-white">
        <h2 className="text-2xl font-semibold mb-4">Editor</h2>
        {currentPage.blocks.map((block, blockIndex) => (
          <div key={blockIndex} className="mb-6 border-b pb-4">
            <h3 className="text-xl font-bold mb-2">
              {block.blockName} Configuration
            </h3>
            {Object.keys(block.config).map((key) =>
              renderConfigField(blockIndex, key, block.config[key])
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceEditPage;
