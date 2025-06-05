// src/components/blocks/GridImageTextBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import PanelImagesController from "../common/PanelImagesController";
import ThemeColorPicker from "../common/ThemeColorPicker";

/**
 * EditableText Component for inline editing
 */
const EditableText = ({ value, onChange, tag: Tag = 'p', className = '', placeholder = "Edit", readOnly = false, isTextarea = false }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e) => {
    setCurrentValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextarea) {
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  const activateEditMode = () => {
    if (!readOnly && !isEditing) {
      setIsEditing(true);
    }
  };

  if (!readOnly && isEditing) {
    const commonInputProps = {
      ref: inputRef,
      value: currentValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `${className} outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm bg-white/70 placeholder-gray-500/70 shadow-inner`,
    };
    if (isTextarea) {
      return <textarea {...commonInputProps} rows={Math.max(2, (currentValue || '').split('\n').length)} placeholder={placeholder} />;
    }
    return <input {...commonInputProps} type="text" placeholder={placeholder} />;
  }

  return (
    <Tag
      className={`${className} ${!readOnly ? 'cursor-pointer hover:bg-gray-400/10 transition-colors duration-150 ease-in-out' : ''} p-0 m-0 min-h-[1em]`}
      onClick={activateEditMode}
      title={!readOnly ? "Click to edit" : ""}
    >
      {value || (!readOnly && <span className="text-gray-400/80 italic text-sm">({placeholder})</span>)}
    </Tag>
  );
};

/**
 * GridImageTextBlock
 *
 * config = {
 *   columns: number, // number of columns (1-6)
 *   items: [
 *     { title, image, alt, description }
 *   ]
 * }
 */
const GridImageTextBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const [localConfig, setLocalConfig] = useState(config);

  // Sync with external config
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Propagate changes when not readOnly
  useEffect(() => {
    if (!readOnly && onConfigChange && JSON.stringify(localConfig) !== JSON.stringify(config)) {
      onConfigChange(localConfig);
    }
  }, [localConfig, readOnly, onConfigChange, config]);

  const { columns = 4, items = [] } = localConfig;

  // Default image to use when no image is provided
  const defaultImage = "/assets/images/placeholder.jpg";

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // READ ONLY version
  if (readOnly) {
    // Set a reasonable default for columns that's responsive
    // Using template literals for dynamic class generation is not recommended
    // Instead, create conditional logic to determine the class
    const getColClass = () => {
      const safeCols = Math.min(columns, 3);
      switch(safeCols) {
        case 1: return "grid-cols-1";
        case 2: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-2";
        case 3: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3";
        default: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-2";
      }
    };

    return (
      <section className="w-full py-0">
        <div className="container mx-auto px-4">
          <div className={`grid ${getColClass()} gap-4 @container`}>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded overflow-hidden h-full flex flex-col"
              >
                {getDisplayUrl(item.image) && (
                  <div className="w-full aspect-video overflow-hidden">
                    <img
                      src={getDisplayUrl(item.image)}
                      alt={item.alt || item.title || "Feature"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex-grow">
                  {item.title && (
                    <h3 className="text-lg @md:text-xl font-semibold mb-2">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-gray-700 text-sm @md:text-base">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // EDIT MODE
  const handleConfigUpdate = (newConfig) => {
    setLocalConfig(newConfig);
  };

  const handleFieldChange = (field, value) => {
    handleConfigUpdate({
      ...localConfig,
      [field]: value,
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    handleConfigUpdate({ ...localConfig, items: newItems });
  };

  const addItem = () => {
    const newItems = [
      ...items,
      { id: `item_${Date.now()}`, title: "New Item", image: "", alt: "New item image", description: "Description for the new item." },
    ];
    handleConfigUpdate({ ...localConfig, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    handleConfigUpdate({ ...localConfig, items: newItems });
  };

  const handleImageUpload = (idx, file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store just the URL for display
    updateItem(idx, "image", fileURL);
  };

  // Set a reasonable default for columns that's responsive
  const getColClass = () => {
    const safeCols = Math.min(columns, 3);
    switch(safeCols) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-2";
      case 3: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3";
      default: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-2";
    }
  };

  return (
    <section className={`w-full py-4 ${!readOnly ? 'bg-gray-50 border-2 border-blue-300/50 rounded p-4' : ''}`}>
      <div className="container mx-auto px-4">
        {!readOnly && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">Grid Layout</h3>
              <div className="space-x-2">
                <button
                  onClick={addItem}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Add Item
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Columns: 
                <select
                  value={columns}
                  onChange={(e) => handleFieldChange("columns", parseInt(e.target.value, 10))}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded"
                >
                  <option value={1}>1 Column</option>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                </select>
              </label>
            </div>
          </div>
        )}

        <div className={`grid ${getColClass()} gap-4 @container`}>
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`bg-white shadow-md rounded overflow-hidden h-full flex flex-col relative group ${!readOnly ? 'border-2 border-dashed border-gray-300' : ''}`}
            >
              {!readOnly && (
                <button
                  onClick={() => removeItem(idx)}
                  className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                  title="Remove Item"
                >
                  ×
                </button>
              )}

              {getDisplayUrl(item.image) ? (
                <div className="w-full aspect-video overflow-hidden">
                  <img
                    src={getDisplayUrl(item.image)}
                    alt={item.alt || item.title || "Feature"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                !readOnly && (
                  <div className="w-full aspect-video bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    Add image in panel
                  </div>
                )
              )}

              <div className="p-4 flex-grow">
                <EditableText
                  value={item.title}
                  onChange={(newValue) => updateItem(idx, 'title', newValue)}
                  tag="h3"
                  className="text-lg @md:text-xl font-semibold mb-2"
                  placeholder="Item title"
                  readOnly={readOnly}
                />
                
                <EditableText
                  value={item.description}
                  onChange={(newValue) => updateItem(idx, 'description', newValue)}
                  tag="p"
                  className="text-gray-700 text-sm @md:text-base"
                  placeholder="Item description"
                  isTextarea
                  readOnly={readOnly}
                />

                {!readOnly && (
                  <div className="mt-2">
                    <EditableText
                      value={item.alt}
                      onChange={(newValue) => updateItem(idx, 'alt', newValue)}
                      tag="p"
                      className="text-gray-500 text-xs"
                      placeholder="Image alt text"
                      readOnly={readOnly}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && !readOnly && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No items yet.</p>
            <button
              onClick={addItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add First Item
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

GridImageTextBlock.tabsConfig = (config, onPanelChange, themeColors, sitePalette, onPanelFileChange) => {
  const { columns = 3, items = [] } = config;

  const handleFieldChangeInPanel = (field, value) => {
    onPanelChange({ ...config, [field]: value });
  };

  const updateItemInPanel = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onPanelChange({ ...config, items: newItems });
  };

  const addItemInPanel = () => {
    const newItem = { 
      id: `item_${Date.now()}`,
      title: "New Item", 
      image: { url: "", file: null, name: "placeholder.jpg", originalUrl: "" }, 
      alt: "New item image", 
      description: "Description for the new item." 
    };
    onPanelChange({ ...config, items: [...items, newItem] });
  };

  const removeItemInPanel = (index) => {
    const itemToRemove = items[index];
    if(itemToRemove?.image?.url && itemToRemove.image.url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.image.url);
    }
    const newItems = items.filter((_, i) => i !== index);
    onPanelChange({ ...config, items: newItems });
  };

  // Prepare data for PanelImagesController
  const imagesForController = items.map((item, index) => ({
    ...(item.image || { url: "", name: "placeholder.jpg", originalUrl: "" }),
    id: item.id || `grid_item_img_${index}`,
    name: item.title || `Grid Item ${index + 1}`,
    itemIndex: index,
  }));

  const onImagesControllerChange = (updatedData) => {
    const newItems = [...items];
    (updatedData.images || []).forEach(imgCtrl => {
      if (imgCtrl.itemIndex !== undefined && newItems[imgCtrl.itemIndex]) {
        const oldImageState = newItems[imgCtrl.itemIndex].image;
        if (oldImageState?.file && oldImageState.url?.startsWith('blob:')) {
          if ((imgCtrl.file && oldImageState.url !== imgCtrl.url) || (!imgCtrl.file && oldImageState.url !== imgCtrl.originalUrl)) {
            URL.revokeObjectURL(oldImageState.url);
          }
        }
        newItems[imgCtrl.itemIndex].image = {
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
          <label className="block text-sm font-medium text-gray-700">Number of Columns (1-3):</label>
          <select 
            value={columns} 
            onChange={(e) => handleFieldChangeInPanel("columns", parseInt(e.target.value, 10))} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {[1, 2, 3].map(num => <option key={num} value={num}>{num}</option>)}
          </select>
        </div>
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Manage Grid Items:</h4>
          {(items || []).map((item, idx) => (
            <div key={item.id || idx} className="p-3 bg-gray-50 rounded-md mb-3 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-800 font-medium">Item {idx + 1}: {item.title || '(Untitled)'}</span>
                <button onClick={() => removeItemInPanel(idx)} className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-100 rounded-full">✕ Remove</button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Title:</label>
                  <input type="text" value={item.title || ""} onChange={(e) => updateItemInPanel(idx, "title", e.target.value)} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Alt Text:</label>
                  <input type="text" value={item.alt || ""} onChange={(e) => updateItemInPanel(idx, "alt", e.target.value)} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Description:</label>
                  <textarea rows={2} value={item.description || ""} onChange={(e) => updateItemInPanel(idx, "description", e.target.value)} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs resize-none" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addItemInPanel} className="mt-3 w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:border-solid">+ Add Item</button>
        </div>
      </div>
    ),
    images: () => (
      <PanelImagesController
        currentData={{ images: imagesForController }}
        onControlsChange={onImagesControllerChange}
        imageArrayFieldName="images"
        getItemName={(img) => img?.name || 'Grid Item Image'}
        allowAdd={false} // Item addition handled in general tab
        allowRemove={false} // Item removal handled in general tab
      />
    ),
  };
};

export default GridImageTextBlock;
