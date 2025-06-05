import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import PropTypes from 'prop-types';
import PanelImagesController from "../common/PanelImagesController";

/**
 * ImageFeatureListBlock
 *
 * This block is for a "selection row" of items
 * plus a detailed panel for the selected item (image, description, etc.).
 *
 * config = {
 *   title: "Explore Our Single-Ply Membranes",
 *   items: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       base?: string,
 *       features?: string[],       // or one big string with line breaks
 *       uses?: string,
 *       limitations?: string,
 *       imageUrl?: string,
 *     },
 *     ...
 *   ]
 * }
 */
const ImageFeatureListBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    title = "Selection Title",
    items = [],
  } = config;

  // Local state for readOnly selection
  const [selectedIndex, setSelectedIndex] = useState(0);

  // For a simple fade/slide in
  const infoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // READ ONLY RENDER
  if (readOnly) {
    const current = items[selectedIndex] || {};

    return (
      <section className="my-2 md:my-4 px-4 md:px-16">
        <h2 className="text-center text-[4vw] md:text-[3vh] font-bold mb-2">
          {title}
        </h2>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center mb-1">
          {items.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`m-2 px-2 py-1 md:px-2 md:py-1 rounded-full font-semibold shadow-lg ${
                selectedIndex === idx
                  ? "bg-second-accent text-white shadow-2xl"
                  : "bg-accent text-black"
              }`}
              style={{ transition: "box-shadow 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 0 15px 1px rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Selected item details */}
        <motion.div
          key={selectedIndex}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
          variants={infoVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <h3 className="text-[3.5vh] font-bold mb-2 text-gray-800 text-center">
            {current.name}
          </h3>
          {current.description && (
            <p className="text-gray-700 mb-1">{current.description}</p>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column: bullet items, etc. */}
            <div className="flex-1">
              {/* If you store features as an array */}
              {current.features?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">
                    Features:
                  </h4>
                  <ul className="space-y-0">
                    {current.features.map((feat, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <FaCheckCircle className="text-green-600 mt-1" />
                        <span className="text-gray-700">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {current.uses && (
                <p className="text-gray-700 mb-2">
                  <strong>Uses:</strong> {current.uses}
                </p>
              )}
              {current.limitations && (
                <p className="text-gray-700 mb-2">
                  <strong>Limitations:</strong> {current.limitations}
                </p>
              )}
            </div>

            {/* Right column: image */}
            {current.imageUrl && (
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={current.imageUrl}
                  alt={current.name}
                  className="max-w-full h-auto object-cover rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </motion.div>
      </section>
    );
  }

  // EDIT MODE
  const handleChange = (field, value) => {
    onConfigChange?.({ ...config, [field]: value });
  };

  const updateItemField = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    handleChange("items", newItems);
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        id: Date.now(),
        name: "New Option",
        description: "",
        features: [],
        uses: "",
        limitations: "",
        imageUrl: "",
      },
    ];
    handleChange("items", newItems);
  };

  const removeItem = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    handleChange("items", newItems);
  };

  // Return edit form
  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">ImageFeatureListBlock Editor</h3>

      <label className="block text-sm mb-1">
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
        />
      </label>

      <div className="mt-2 space-y-2">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="border border-gray-600 p-2 rounded">
            <div className="flex justify-between items-center mb-1">
              <span>Item {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                Remove
              </button>
            </div>
            <label className="block text-sm mb-1">
              Name:
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItemField(idx, "name", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
              />
            </label>
            <label className="block text-sm mb-1">
              Description:
              <textarea
                rows={2}
                value={item.description}
                onChange={(e) => updateItemField(idx, "description", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
              />
            </label>
            {/* features */}
            <p className="text-sm font-semibold mt-1">Features:</p>
            {item.features?.map((feat, fIdx) => (
              <div key={fIdx} className="flex items-center mb-1">
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => {
                    const updatedFeat = [...item.features];
                    updatedFeat[fIdx] = e.target.value;
                    updateItemField(idx, "features", updatedFeat);
                  }}
                  className="w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedFeat = [...item.features];
                    updatedFeat.splice(fIdx, 1);
                    updateItemField(idx, "features", updatedFeat);
                  }}
                  className="ml-2 text-red-300 hover:text-red-500"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const updatedFeat = [...(item.features || []), ""];
                updateItemField(idx, "features", updatedFeat);
              }}
              className="mt-1 px-2 py-1 bg-blue-600 text-white rounded text-sm"
            >
              + Add Feature
            </button>

            <label className="block text-sm mt-2">
              Uses:
              <input
                type="text"
                value={item.uses}
                onChange={(e) => updateItemField(idx, "uses", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
              />
            </label>
            <label className="block text-sm mt-1">
              Limitations:
              <input
                type="text"
                value={item.limitations}
                onChange={(e) => updateItemField(idx, "limitations", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
              />
            </label>
            <label className="block text-sm mt-1">
              Image URL:
              <input
                type="text"
                value={item.imageUrl}
                onChange={(e) => updateItemField(idx, "imageUrl", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
              />
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-2 bg-green-600 text-white px-2 py-1 rounded text-sm"
      >
        + Add New Item
      </button>
    </div>
  );
};

ImageFeatureListBlock.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      description: PropTypes.string,
      features: PropTypes.arrayOf(PropTypes.string), // Corresponds to GeneralListVariant2 items.features
      uses: PropTypes.string,
      limitations: PropTypes.string,
      imageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    })),
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

ImageFeatureListBlock.tabsConfig = (config, onPanelChange, themeColors, sitePalette, onPanelFileChange) => {
  const { items = [] } = config;

  const handleItemManagement = (action, index = null, field = null, value = null) => {
    let newItems = [...(config.items || [])];
    if (action === 'add') {
      newItems.push({
        id: `item_${Date.now()}`,
        name: "New Feature Item",
        description: "Description for the new feature.",
        features: ["Benefit 1", "Benefit 2"],
        uses: "Primary uses.",
        limitations: "Considerations.",
        imageUrl: { url: "", file: null, name: "placeholder.jpg", originalUrl: "" }
      });
    } else if (action === 'remove' && index !== null) {
      const itemRemoved = newItems[index];
      if (itemRemoved?.imageUrl && typeof itemRemoved.imageUrl === 'object' && itemRemoved.imageUrl.url?.startsWith('blob:')) {
        URL.revokeObjectURL(itemRemoved.imageUrl.url);
      }
      newItems.splice(index, 1);
    } else if (action === 'update' && index !== null && field !== null) {
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [field]: value };
      }
    }
    onPanelChange({ ...config, items: newItems });
  };

  // Prepare data for PanelImagesController
  const imagesForController = items.map((item, index) => ({
    ...( (typeof item.imageUrl === 'string') 
        ? { url: item.imageUrl, name: item.name || `Item ${index+1} Image`, originalUrl: item.imageUrl } 
        : (item.imageUrl || { url: '', name: 'Default Image', originalUrl: '' }) ),
    id: item.id || `feature_item_img_${index}`,
    name: item.name || `Feature Item ${index + 1}`,
    itemIndex: index, // To map back to the correct item
  }));

  const onImagesControllerChange = (updatedData) => {
    const newItems = [...items]; // Start with a copy of current items
    (updatedData.images || []).forEach(imgCtrl => {
      if (imgCtrl.itemIndex !== undefined && newItems[imgCtrl.itemIndex]) {
        const oldImageState = newItems[imgCtrl.itemIndex].imageUrl;
        if (oldImageState?.file && oldImageState.url?.startsWith('blob:')) {
          if ((imgCtrl.file && oldImageState.url !== imgCtrl.url) || (!imgCtrl.file && oldImageState.url !== imgCtrl.originalUrl)) {
            URL.revokeObjectURL(oldImageState.url);
          }
        }
        newItems[imgCtrl.itemIndex].imageUrl = {
          file: imgCtrl.file || null,
          url: imgCtrl.url || '',
          name: imgCtrl.name || (imgCtrl.url || '').split('/').pop() || 'image.jpg',
          originalUrl: imgCtrl.originalUrl || imgCtrl.url || ''
        };
      }
    });
    onPanelChange({ ...config, items: newItems });
  };

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Block Title (Editable inline):</label>
          <input 
            type="text" 
            value={config.title || ''} 
            onChange={(e) => onPanelChange({ ...config, title: e.target.value })} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter block title"
          />
        </div>
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Feature Items:</h4>
          <p className="text-xs text-gray-500 mb-3">Item details (name, description, features, etc.) are editable directly on the block preview.</p>
          {(items || []).map((item, idx) => (
            <div key={item.id || idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2 shadow-sm">
              <span className="text-sm text-gray-600 truncate w-3/4" title={item.name}>{idx + 1}. {item.name || '(Untitled Item)'}</span>
              <button onClick={() => handleItemManagement('remove', idx)} className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-100 rounded-full" title="Remove Item">✕ Remove</button>
            </div>
          ))}
          <button onClick={() => handleItemManagement('add')} className="mt-3 w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:border-solid">+ Add Feature Item</button>
        </div>
      </div>
    ),
    images: () => (
      (items || []).length > 0 ? (
        <PanelImagesController
          currentData={{ images: imagesForController }}
          onControlsChange={onImagesControllerChange} 
          imageArrayFieldName="images"
          getItemName={(img) => img?.name || 'Feature Image'}
          allowAdd={false} // Item addition handled in general tab
          allowRemove={false} // Item removal handled in general tab
        />
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p>No items available to manage images for. Add items in the 'General' tab first.</p>
        </div>
      )
    ),
  };
};

export default ImageFeatureListBlock; 