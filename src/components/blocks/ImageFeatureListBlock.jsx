import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import PropTypes from 'prop-types';

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

ImageFeatureListBlock.EditorPanel = function ImageFeatureListBlockEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl }) {
  const handleChange = (field, value) => {
    onPanelConfigChange({ ...currentConfig, [field]: value });
  };

  const handleItemChange = (itemIndex, itemField, value) => {
    const updatedItems = (currentConfig.items || []).map((item, i) => {
      if (i === itemIndex) {
        return { ...item, [itemField]: value };
      }
      return item;
    });
    onPanelConfigChange({ ...currentConfig, items: updatedItems });
  };
  
  const handleItemFileChange = (itemIndex, file) => {
    if (onPanelFileChange) {
        // For items, the path usually includes the item index and the field (e.g., imageUrl)
        onPanelFileChange({ blockItemIndex: itemIndex, field: 'imageUrl' }, file);
    }
  };

  return (
    <div style={{ padding: '10px', background: '#e0e0e0' }}>
      <h5>Image Feature List Editor</h5>
      <div>
        <label>Title: </label>
        <input type="text" value={currentConfig.title || ''} onChange={(e) => handleChange('title', e.target.value)} />
      </div>
      {(currentConfig.items || []).map((item, index) => (
        <div key={item.id || index} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
          <h6>Item {index + 1}</h6>
          <div><label>Name: </label><input type="text" value={item.name || ''} onChange={e => handleItemChange(index, 'name', e.target.value)} /></div>
          <div><label>Description: </label><textarea value={item.description || ''} onChange={e => handleItemChange(index, 'description', e.target.value)} /></div>
          <div>
            <label>Image: </label>
            <input type="file" accept="image/*" onChange={(e) => handleItemFileChange(index, e.target.files[0])} />
            {getDisplayUrl && item.imageUrl && <img src={getDisplayUrl(item.imageUrl)} alt="preview" style={{width: '50px', height: '50px'}}/>}
            <input type="text" placeholder="Or paste URL" value={typeof item.imageUrl === 'string' ? item.imageUrl : (item.imageUrl?.originalUrl || '')} onChange={e => handleItemChange(index, 'imageUrl', e.target.value)} />
          </div>
          {/* Add controls for features, uses, limitations if needed */}
        </div>
      ))}
      {/* Add button to add new item */}
    </div>
  );
};

ImageFeatureListBlock.EditorPanel.propTypes = {
    currentConfig: PropTypes.object.isRequired,
    onPanelConfigChange: PropTypes.func.isRequired,
    onPanelFileChange: PropTypes.func,
    getDisplayUrl: PropTypes.func,
};

export default ImageFeatureListBlock; 