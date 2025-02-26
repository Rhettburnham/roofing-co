// src/components/GeneralServicesForm.jsx
import React, { useState, useEffect } from "react";
import { Edit3, ChevronDown, Trash2 } from "lucide-react";

// ALL block components used in your new ServicePage approach:
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

/**
 * Mapping from blockName => actual React component
 * so we can render “live” previews.
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

// Example color defaults
const customColors = {
  "faint-color": "#E0F7FA",
  "hover-color": "#434358",
  "dark-below-header": "#6a0202",
};

/**
 * GeneralServicesForm
 * -------------------------------------------------------
 * - Edits your “services” data, which is shaped like:
 *   {
 *     commercial: [ {id, blocks: [{ blockName, config }, ... ]}, ... ],
 *     residential: [ {id, blocks: [{ blockName, config }, ... ]}, ... ]
 *   }
 * - Renders each category in its own section (“Commercial Services”, “Residential Services”).
 * - For each service, you can expand/collapse and edit the blocks within.
 * - Changing the data updates your local formData => which merges into services.json on save.
 */
export default function GeneralServicesForm({ formData, setFormData }) {
  // Extract “services” from formData
  // We expect formData.services to look like:
  // { commercial: [...], residential: [...] }
  const servicesData = formData.services || {
    commercial: [],
    residential: [],
  };

  // We keep the “global color picking” logic as before:
  const [logoPreview, setLogoPreview] = useState(null);
  const [colorCombos, setColorCombos] = useState([]);

  const [faintColor, setFaintColor] = useState(
    formData.colors?.faintColor || customColors["faint-color"]
  );
  const [hoverColor, setHoverColor] = useState(
    formData.colors?.hoverColor || customColors["hover-color"]
  );
  const [darkBelowHeader, setDarkBelowHeader] = useState(
    formData.colors?.darkBelowHeader || customColors["dark-below-header"]
  );

  const [selectedColorTarget, setSelectedColorTarget] = useState("faintColor");

  // Sync the color changes back to formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      colors: {
        faintColor,
        hoverColor,
        darkBelowHeader,
      },
    }));
  }, [faintColor, hoverColor, darkBelowHeader, setFormData]);

  // “openServices” tracks expanded or collapsed service items (by unique key)
  const [openServices, setOpenServices] = useState([]);
  const isOpen = (key) => openServices.includes(key);
  const toggleOpen = (key) => {
    if (isOpen(key)) {
      setOpenServices(openServices.filter((x) => x !== key));
    } else {
      setOpenServices([...openServices, key]);
    }
  };

  // “activeBlockEdits” tracks which block is in “edit mode” vs. readOnly
  const [activeBlockEdits, setActiveBlockEdits] = useState({});
  const toggleBlockEdit = (blockId) => {
    setActiveBlockEdits((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  /**
   * Add a new empty service to a given category
   * (commercial or residential).
   */
  const addNewService = (category) => {
    // We can limit total or per category, if desired
    // But for simplicity, just allow indefinite here:
    const newId = Date.now(); // or any unique approach
    const newService = {
      id: newId,
      blocks: [],
    };

    setFormData((prev) => {
      const updated = { ...prev.services };
      updated[category] = [...(updated[category] || []), newService];
      return {
        ...prev,
        services: updated,
      };
    });
  };

  /**
   * Remove an existing service by ID
   */
  const removeService = (category, id) => {
    setFormData((prev) => {
      const updated = { ...prev.services };
      updated[category] = updated[category].filter((svc) => svc.id !== id);
      return {
        ...prev,
        services: updated,
      };
    });
  };

  /**
   * Add a block to a given service
   */
  const addBlockToService = (category, id, blockName) => {
    const newBlock = {
      blockName,
      config: {}, // or an initial structure if desired
    };

    setFormData((prev) => {
      const updated = { ...prev.services };
      updated[category] = updated[category].map((svc) => {
        if (svc.id === id) {
          return {
            ...svc,
            blocks: [...svc.blocks, newBlock],
          };
        }
        return svc;
      });
      return { ...prev, services: updated };
    });
  };

  /**
   * Remove a block from a given service
   */
  const removeBlockFromService = (category, id, blockIndex) => {
    setFormData((prev) => {
      const updated = { ...prev.services };
      updated[category] = updated[category].map((svc) => {
        if (svc.id === id) {
          const newBlocks = [...svc.blocks];
          newBlocks.splice(blockIndex, 1);
          return { ...svc, blocks: newBlocks };
        }
        return svc;
      });
      return { ...prev, services: updated };
    });
  };

  /**
   * Update a block’s config for a given service
   */
  const handleBlockConfigChange = (category, id, blockIndex, newConfig) => {
    setFormData((prev) => {
      const updated = { ...prev.services };
      updated[category] = updated[category].map((svc) => {
        if (svc.id === id) {
          const newBlocks = [...svc.blocks];
          newBlocks[blockIndex] = {
            ...newBlocks[blockIndex],
            config: newConfig,
          };
          return { ...svc, blocks: newBlocks };
        }
        return svc;
      });
      return { ...prev, services: updated };
    });
  };

  /**
   * Provide optional link path UI (like in your previous code)
   */
  const renderLinkPathSelect = (currentValue, onChange) => {
    const commonPaths = ["/", "/about", "/services"];
    const isCommonPath = commonPaths.includes(currentValue);

    return (
      <div className="flex gap-2 items-center">
        <label className="text-sm">Link Path:</label>
        <select
          value={isCommonPath ? currentValue : "custom"}
          onChange={(e) => {
            const selected = e.target.value;
            if (selected !== "custom") {
              onChange(selected);
            }
          }}
          className="bg-gray-700 text-white rounded border border-gray-600 px-2 py-1"
        >
          {commonPaths.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        <input
          type="text"
          value={!isCommonPath ? currentValue : ""}
          placeholder="Custom path..."
          onChange={(e) => onChange(e.target.value)}
          className="w-40 bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
        />
      </div>
    );
  };

  // Sample function for extracting colors from a new logo file
  const handleLogoFileChange = async (file) => {
    if (!file) {
      setLogoPreview(null);
      setColorCombos([]);
      setFormData((prev) => ({
        ...prev,
        logo: { ...prev.logo, file: null, fileName: "" },
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      logo: { ...prev.logo, file, fileName: file.name },
    }));
    const previewURL = URL.createObjectURL(file);
    setLogoPreview(previewURL);

    // Attempt color extraction from the new file
    try {
      const formDataUp = new FormData();
      formDataUp.append("logo", file);
      const response = await fetch("http://localhost:5001/api/extract-colors", {
        method: "POST",
        body: formDataUp,
      });
      if (!response.ok) throw new Error("Color extraction failed");
      const data = await response.json();
      setColorCombos(data.color_combos || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Render each block in read-only “preview” mode + an overlay with edit button
  // If user toggles edit, we show the component in "editing" mode if available
  // For simplicity, we can inline a subcomponent or just do it in-line.

  return (
    <div className="border border-gray-700 p-3 rounded space-y-6">
      <h2 className="text-xl font-bold mb-4">Services Editor</h2>

      {/* LOGO + Color Extraction (same as your older approach) */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Logo Upload */}
        <div className="w-full md:w-1/3 min-w-[250px]">
          <label className="block mb-2 font-semibold">Upload Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoFileChange(e.target.files[0] || null)}
          />
          {formData.logo?.fileName && (
            <p className="text-sm mt-1">
              Current logo file: {formData.logo.fileName}
            </p>
          )}
          {logoPreview && (
            <div className="mt-4">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="max-w-full h-auto border border-gray-400 rounded"
              />
            </div>
          )}

          {/* Color picking UI */}
          <div className="mt-6">
            <label className="block mb-2 font-semibold">Assign Colors:</label>
            <div className="flex items-center mb-4">
              <label className="text-sm text-gray-300 mr-2">Assign to:</label>
              <select
                value={selectedColorTarget}
                onChange={(e) => setSelectedColorTarget(e.target.value)}
                className="bg-gray-700 text-white rounded border border-gray-600 px-2 py-1"
              >
                <option value="faintColor">faint-color</option>
                <option value="hoverColor">hover-color</option>
                <option value="darkBelowHeader">dark-below-header</option>
              </select>
            </div>

            {/* Global color pickers */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">faint-color:</label>
                <input
                  type="color"
                  value={faintColor}
                  onChange={(e) => setFaintColor(e.target.value)}
                  className="w-16 h-8 border border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-white">{faintColor}</span>
              </div>
              <div>
                <label className="block text-sm font-semibold">hover-color:</label>
                <input
                  type="color"
                  value={hoverColor}
                  onChange={(e) => setHoverColor(e.target.value)}
                  className="w-16 h-8 border border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-white">{hoverColor}</span>
              </div>
              <div>
                <label className="block text-sm font-semibold">
                  dark-below-header:
                </label>
                <input
                  type="color"
                  value={darkBelowHeader}
                  onChange={(e) => setDarkBelowHeader(e.target.value)}
                  className="w-16 h-8 border border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-white">{darkBelowHeader}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Color Combos Preview */}
        <div
          className="w-full md:w-2/3 border border-gray-600 rounded p-2 overflow-y-auto"
          style={{ maxHeight: "400px" }}
        >
          <p className="text-sm text-gray-300 mb-3">
            Color Gallery – Click a color to assign to{" "}
            <strong>
              {selectedColorTarget.replace(/([A-Z])/g, " $1").trim()}
            </strong>
          </p>
          {colorCombos.length === 0 ? (
            <p className="text-gray-500">
              No colors extracted yet. Please upload a logo.
            </p>
          ) : (
            colorCombos.map((combo, idx) => (
              <div key={idx} className="mb-4 border-b border-gray-500 pb-3">
                <h4 className="text-white font-semibold mb-2">
                  Base Color: {combo.base}
                </h4>
                <div
                  className="inline-block w-14 h-14 mr-2 mb-2 rounded border border-gray-600 cursor-pointer"
                  style={{ backgroundColor: combo.base }}
                  onClick={() => handleColorClick(combo.base)}
                />
                {Object.entries(combo.theory).map(([schemeName, val]) => {
                  if (Array.isArray(val)) {
                    return (
                      <div key={schemeName} className="mb-2">
                        <p className="text-sm text-gray-200 capitalize">
                          {schemeName}:
                        </p>
                        {val.map((clr) => (
                          <div
                            key={clr}
                            className="inline-block w-14 h-14 mr-2 mb-2 rounded border border-gray-600 cursor-pointer"
                            style={{ backgroundColor: clr }}
                            onClick={() => handleColorClick(clr)}
                          />
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div key={schemeName} className="mb-2">
                        <p className="text-sm text-gray-200 capitalize">
                          {schemeName}:
                        </p>
                        <div
                          className="inline-block w-14 h-14 mr-2 mb-2 rounded border border-gray-600 cursor-pointer"
                          style={{ backgroundColor: val }}
                          onClick={() => handleColorClick(val)}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* COMMERCIAL SERVICES */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Commercial Services</h2>
          <button
            type="button"
            onClick={() => addNewService("commercial")}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            + Add Commercial Service
          </button>
        </div>
        {servicesData.commercial?.map((svc, idx) => {
          // Unique key for expansion
          const expandKey = `commercial-${svc.id}`;
          const open = isOpen(expandKey);

          return (
            <div key={svc.id} className="border border-gray-700 p-2 mb-4 rounded">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleOpen(expandKey)}
                    className="mr-2 bg-gray-800 p-1 rounded hover:bg-gray-700"
                  >
                    <ChevronDown
                      size={16}
                      color="#fff"
                      className={`transform transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  <p className="font-semibold">
                    Service ID {svc.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeService("commercial", svc.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
              {/* If expanded, show blocks + editing */}
              {open && (
                <div className="mt-2">
                  {svc.blocks.map((block, blockIdx) => (
                    <BlockEditor
                      key={blockIdx}
                      block={block}
                      category="commercial"
                      serviceId={svc.id}
                      blockIndex={blockIdx}
                      activeBlockEdits={activeBlockEdits}
                      toggleBlockEdit={toggleBlockEdit}
                      handleBlockConfigChange={handleBlockConfigChange}
                      removeBlockFromService={removeBlockFromService}
                      renderLinkPathSelect={renderLinkPathSelect}
                    />
                  ))}

                  {/* Buttons to add new blocks */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.keys(blockMap).map((blockName) => (
                      <button
                        key={blockName}
                        type="button"
                        className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        onClick={() => addBlockToService("commercial", svc.id, blockName)}
                      >
                        + {blockName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RESIDENTIAL SERVICES */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Residential Services</h2>
          <button
            type="button"
            onClick={() => addNewService("residential")}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            + Add Residential Service
          </button>
        </div>
        {servicesData.residential?.map((svc, idx) => {
          // Unique key for expansion
          const expandKey = `residential-${svc.id}`;
          const open = isOpen(expandKey);

          return (
            <div key={svc.id} className="border border-gray-700 p-2 mb-4 rounded">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleOpen(expandKey)}
                    className="mr-2 bg-gray-800 p-1 rounded hover:bg-gray-700"
                  >
                    <ChevronDown
                      size={16}
                      color="#fff"
                      className={`transform transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  <p className="font-semibold">
                    Service ID {svc.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeService("residential", svc.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
              {/* If expanded, show blocks + editing */}
              {open && (
                <div className="mt-2">
                  {svc.blocks.map((block, blockIdx) => (
                    <BlockEditor
                      key={blockIdx}
                      block={block}
                      category="residential"
                      serviceId={svc.id}
                      blockIndex={blockIdx}
                      activeBlockEdits={activeBlockEdits}
                      toggleBlockEdit={toggleBlockEdit}
                      handleBlockConfigChange={handleBlockConfigChange}
                      removeBlockFromService={removeBlockFromService}
                      renderLinkPathSelect={renderLinkPathSelect}
                    />
                  ))}

                  {/* Buttons to add new blocks */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.keys(blockMap).map((blockName) => (
                      <button
                        key={blockName}
                        type="button"
                        className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        onClick={() => addBlockToService("residential", svc.id, blockName)}
                      >
                        + {blockName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Sub-component for rendering a single block in “live preview” + optional edit
 */
function BlockEditor({
  block,
  category,
  serviceId,
  blockIndex,
  activeBlockEdits,
  toggleBlockEdit,
  handleBlockConfigChange,
  removeBlockFromService,
  renderLinkPathSelect,
}) {
  const blockId = `${category}-${serviceId}-block-${blockIndex}`;
  const editing = !!activeBlockEdits[blockId];
  const { blockName, config } = block;

  // Find the React component for the block
  const BlockComponent = blockMap[blockName];
  if (!BlockComponent) {
    // In case no match
    return <div className="text-red-400">Unknown block: {blockName}</div>;
  }

  return (
    <div className="relative border border-gray-600 rounded mb-2">
      {/* Overly bar with block type, edit, remove */}
      <div className="absolute top-0 right-0 flex items-center bg-gray-700 bg-opacity-80 px-2 py-1 rounded-bl">
        <span className="text-xs text-white mr-2 uppercase">{blockName}</span>
        <button
          type="button"
          onClick={() => toggleBlockEdit(blockId)}
          className="p-1 mr-1 hover:bg-gray-600 rounded"
        >
          <Edit3 size={14} color="#fff" />
        </button>
        <button
          type="button"
          className="hover:bg-red-600 p-1 rounded"
          onClick={() => removeBlockFromService(category, serviceId, blockIndex)}
        >
          <Trash2 size={14} color="#fff" />
        </button>
      </div>

      {/* Always show read-only preview behind */}
      <div className="p-2 bg-gray-800 rounded">
        <BlockComponent config={config} readOnly={true} />
      </div>

      {/* If editing, show the actual editor for that block */}
      {editing && (
        <div className="mt-1 p-2 bg-gray-700 rounded-b">
          {/* For each block type, we pass readOnly={false} + onConfigChange */}
          {blockName === "HeroBlock" && (
            <HeroBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "GeneralList" && (
            <GeneralList
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "VideoCTA" && (
            <VideoCTA
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
              extraLinkPathUI={renderLinkPathSelect}
            />
          )}
          {blockName === "GeneralListVariant2" && (
            <GeneralListVariant2
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "OverviewAndAdvantagesBlock" && (
            <OverviewAndAdvantagesBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "ActionButtonBlock" && (
            <ActionButtonBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
              extraLinkPathUI={renderLinkPathSelect}
            />
          )}
          {blockName === "HeaderBannerBlock" && (
            <HeaderBannerBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "PricingGrid" && (
            <PricingGrid
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "ListDropdown" && (
            <ListDropdown
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "GridImageTextBlock" && (
            <GridImageTextBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "ThreeGridWithRichTextBlock" && (
            <ThreeGridWithRichTextBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "ImageWrapBlock" && (
            <ImageWrapBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "ShingleSelectorBlock" && (
            <ShingleSelectorBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
          {blockName === "ListImageVerticalBlock" && (
            <ListImageVerticalBlock
              config={config}
              readOnly={false}
              onConfigChange={(newCfg) =>
                handleBlockConfigChange(category, serviceId, blockIndex, newCfg)
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Helper for color picking
 */
function handleColorClick(hex) {
  // no-op: we define it inside the main for convenience
  console.log("Clicked color:", hex);
}
