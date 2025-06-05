// src/components/blocks/PricingGrid.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaPlus, FaTrash, FaImage, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";
import PropTypes from 'prop-types';
import PanelImagesController from "../common/PanelImagesController"; // Assuming correct path

/**
 * PricingGrid
 * 
 * config = {
 *   showPrice: true,
 *   items: [
 *     {
 *       title: string,
 *       image: string,
 *       alt: string,
 *       description: string,
 *       rate: string
 *     },
 *     ...
 *   ]
 * }
 */

// Helper function to get display URL
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.url) return value.url;
  return null;
};

// Helper to initialize image state (consistent with other blocks)
const initializeImageState = (imageValue, defaultPath = '') => {
  let fileObject = null;
  let urlToDisplay = defaultPath;
  let nameToStore = defaultPath ? defaultPath.split('/').pop() : 'placeholder.jpg';
  let originalUrlToStore = defaultPath;

  if (imageValue && typeof imageValue === 'object') {
    urlToDisplay = imageValue.url || defaultPath;
    nameToStore = imageValue.name || (urlToDisplay ? urlToDisplay.split('/').pop() : 'image.jpg');
    fileObject = imageValue.file || null;
    originalUrlToStore = imageValue.originalUrl || (typeof imageValue.url === 'string' && !imageValue.url.startsWith('blob:') ? imageValue.url : defaultPath);
  } else if (typeof imageValue === 'string' && imageValue) {
    urlToDisplay = imageValue;
    nameToStore = imageValue.split('/').pop();
    originalUrlToStore = imageValue;
  }
  return { file: fileObject, url: urlToDisplay, name: nameToStore, originalUrl: originalUrlToStore };
};

// Reusable EditableText Component (simplified for this block's needs)
const EditableText = ({ value, onChange, tag: Tag = 'p', className = '', placeholder = "Edit", readOnly = false, isTextarea = false, style = {} }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (!readOnly && inputRef.current && isTextarea) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [currentValue, readOnly, isTextarea]);

  const handleChange = (e) => {
    if (readOnly) return;
    setCurrentValue(e.target.value);
  };

  const handleBlur = () => {
    if (readOnly) return;
    if (value !== currentValue) {
      onChange(currentValue);
    }
  };

  if (readOnly) {
    const displayValue = value || <span className="text-gray-400/70 italic">({placeholder})</span>;
    return <Tag className={className} style={style}>{displayValue}</Tag>;
  }

  const inputClasses = `bg-transparent border-b border-dashed border-gray-400/60 focus:border-blue-500 focus:ring-0 outline-none w-full ${className}`;

  if (isTextarea) {
    return <textarea ref={inputRef} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} placeholder={placeholder} className={inputClasses} style={{...style, resize: 'none'}} rows={2} />;
  }
  return <input ref={inputRef} type="text" value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} placeholder={placeholder} className={inputClasses} style={style} />;
};

const PricingGridDisplay = ({ config = {}, readOnly, onConfigChange }) => {
  const {
    showPrice = true,
    items = [
      { id:1, title: "Sample Item 1", image: initializeImageState("https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Sample1"), alt: "Sample Alt 1", description: "This is a description for sample item 1.", rate: "$10/unit" },
      { id:2, title: "Sample Item 2", image: initializeImageState("https://via.placeholder.com/150/AAAAAA/FFFFFF?text=Sample2"), alt: "Sample Alt 2", description: "This is a description for sample item 2. It can be a bit longer to test wrapping.", rate: "$20/unit" },
    ],
    title = "Pricing Options" // Added default title for the section
  } = config;

  const handleItemChange = (index, field, value) => {
    if (readOnly || !onConfigChange) return;
    const newItems = items.map((item, idx) => 
      idx === index ? { ...item, [field]: value } : item
    );
    onConfigChange({ ...config, items: newItems });
  };
  
  const handleTitleChange = (newTitle) => {
    if (readOnly || !onConfigChange) return;
    onConfigChange({ ...config, title: newTitle });
  }

  return (
    <div className={`container mx-auto px-4 md:px-10 py-4 md:py-8 ${!readOnly ? 'p-1 bg-slate-50 border-2 border-blue-300/50' : 'bg-gray-100'}`}>
        <EditableText 
            tag="h2"
            value={title}
            onChange={handleTitleChange}
            readOnly={readOnly}
            className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-6 md:mb-8"
            placeholder="Section Title"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {(items || []).map((g, idx) => (
            <div
              key={g.id || idx}
              className="relative flex flex-col md:flex-row items-center md:space-x-4 p-3 md:p-4 rounded-lg shadow-md bg-white/90 hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-gray-200/50"
            >
            {getDisplayUrlHelper(g.image) ? (
              <img
                src={getDisplayUrlHelper(g.image)}
                alt={g.alt || g.title}
                className={`w-full md:w-32 h-32 md:h-32 object-cover rounded-lg mb-2 md:mb-0 shadow ${g.title === "Steel Gutters" ? "transform -scale-x-100" : ""}`}
              />
            ) : (
              !readOnly && <div className="w-full md:w-32 h-32 md:h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-sm rounded-lg mb-2 md:mb-0">Add Image in Panel</div>
            )}
            <div className="mt-2 md:mt-0 flex-grow w-full">
              <EditableText 
                tag="h3" 
                value={g.title} 
                onChange={(newVal) => handleItemChange(idx, "title", newVal)} 
                className="text-lg font-bold text-gray-800" 
                readOnly={readOnly} 
                placeholder="Item Title"
              />
              <EditableText 
                tag="p" 
                value={g.description} 
                onChange={(newVal) => handleItemChange(idx, "description", newVal)} 
                className="text-sm md:text-base text-gray-700 mt-1" 
                isTextarea 
                readOnly={readOnly} 
                placeholder="Item description..."
              />
                {showPrice && (
                <EditableText 
                    tag="p" 
                    value={g.rate} 
                    onChange={(newVal) => handleItemChange(idx, "rate", newVal)} 
                    className="text-sm md:text-base font-semibold mt-1 text-blue-600" 
                    readOnly={readOnly} 
                    placeholder="Item rate, e.g. $X/unit"
                />
                )}
              </div>
            </div>
          ))}
        </div>
      {items.length === 0 && !readOnly && <p className="text-center text-gray-500 py-4">No items. Add items using the editor panel.</p>}
    </div>
  );
};
PricingGridDisplay.propTypes = {
    config: PropTypes.object,
    readOnly: PropTypes.bool,
    onConfigChange: PropTypes.func,
}

const PricingGrid = ({ config = {}, readOnly = false, onConfigChange, getDisplayUrl: getDisplayUrlFromProp }) => {
  // The main component now primarily manages local state for the panel and passes data to display.
  // Inline editing logic is within PricingGridDisplay itself.
  const [localConfig, setLocalConfig] = useState(() => {
    const initial = { ...config };
    return {
      ...initial,
      items: (initial.items || []).map(item => ({
        ...item,
        image: initializeImageState(item.image, '/assets/images/placeholder.jpg')
      }))
    };
  });

  useEffect(() => {
    // Sync localConfig with config prop, especially for image objects
    const initial = { ...config };
    setLocalConfig({
        ...initial,
        items: (initial.items || []).map(item => ({
            ...item,
            image: initializeImageState(item.image, '/assets/images/placeholder.jpg')
        }))
    });
  }, [config]);

  // When onConfigChange is called by PricingGridDisplay (due to inline edit)
  // or by the panel (via tabsConfig calling its own onPanelChange which is this onConfigChange)
  const handleConfigUpdateFromChildOrPanel = (newFullConfig) => {
    // Update local state first to reflect changes immediately if panel is open
    const updatedItems = (newFullConfig.items || []).map(item => ({
        ...item,
        // Ensure image objects are correctly formatted before setting local state or passing up
        image: typeof item.image === 'string' ? initializeImageState(item.image) : item.image 
    }));
    setLocalConfig({...newFullConfig, items: updatedItems });

    // Then, call the parent's onConfigChange with the fully processed data
    if (onConfigChange) {
        onConfigChange({...newFullConfig, items: updatedItems });
    }
  };

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      (localConfig.items || []).forEach(item => {
        if (item.image?.file && item.image.url?.startsWith('blob:')) {
          URL.revokeObjectURL(item.image.url);
        }
      });
    };
  }, [localConfig.items]);

  return (
    <PricingGridDisplay 
        config={localConfig} // Display uses localConfig which is synced with prop
        readOnly={readOnly} 
        onConfigChange={!readOnly ? handleConfigUpdateFromChildOrPanel : undefined}
        // getDisplayUrl is not needed by PricingGridDisplay as it uses getDisplayUrlHelper
    />
  );
};

PricingGrid.propTypes = {
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func, // Passed by ServiceEditPage/OneForm
};


PricingGrid.tabsConfig = (currentConfig, onPanelChange, themeColors, sitePalette) => {
  const { showPrice = true, items = [] } = currentConfig;

  const handleShowPriceToggle = () => {
    onPanelChange({ ...currentConfig, showPrice: !showPrice });
  };

  const handleItemTextChangeInPanel = (index, field, value) => {
    const newItems = items.map((item, itemIdx) => 
      itemIdx === index ? { ...item, [field]: value } : item
    );
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const addItemToPanel = () => {
    const newItem = { 
        id: `pg_item_${Date.now()}`,
        title: "New Pricing Item", 
        image: initializeImageState(null, '/assets/images/placeholder.jpg'), 
        alt: "New item placeholder",
        description: "Description for this new pricing item.", 
        rate: "$0/unit" 
    };
    onPanelChange({ ...currentConfig, items: [...items, newItem] });
  };

  const removeItemFromPanel = (index) => {
    const itemToRemove = items[index];
    if(itemToRemove?.image?.file && itemToRemove.image.url?.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.image.url);
    }
    const newItems = items.filter((_, i) => i !== index);
    onPanelChange({ ...currentConfig, items: newItems });
  };
  
  // Prepare data for PanelImagesController
  const imagesForController = items.map((item, index) => ({
    ...(item.image || initializeImageState(null, '/assets/images/placeholder.jpg')),
    id: item.id || `pg_item_img_${index}`,
    name: item.title || `Pricing Item ${index + 1}`,
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
    onPanelChange({ ...currentConfig, items: newItems });
  };

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between pb-2">
            <h3 className="text-lg font-semibold text-gray-700">General Settings</h3>
            <button 
                onClick={handleShowPriceToggle} 
                className={`p-1.5 rounded-full transition-colors duration-200 flex items-center text-xs ${showPrice ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                title={showPrice ? "Hide Prices" : "Show Prices"}
            >
                {showPrice ? <FaToggleOn size={16} className="mr-1.5 text-white" /> : <FaToggleOff size={16} className="mr-1.5 text-gray-300" />}
                <span className="text-white font-medium">{showPrice ? 'Prices Shown' : 'Prices Hidden'}</span>
            </button>
        </div>
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Manage Items:</h4>
           <p className="text-xs text-gray-500 mb-3">Title, description, and rate are editable directly on the block preview.</p>
          {(items || []).map((item, idx) => (
            <div key={item.id || idx} className="p-3 bg-gray-50 rounded-md mb-3 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-800 font-medium">Item {idx + 1}: {item.title || '(Untitled)'}</span>
                <button onClick={() => removeItemFromPanel(idx)} className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-100 rounded-full">✕ Remove</button>
              </div>
              <div className="space-y-2">
                 <div>
                  <label className="block text-xs font-medium text-gray-600">Alt Text (for image):</label>
                  <input type="text" value={item.alt || ""} onChange={(e) => handleItemTextChangeInPanel(idx, "alt", e.target.value)} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addItemToPanel} className="mt-3 w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:border-solid">+ Add Item</button>
        </div>
      </div>
    ),
    images: () => (
      <PanelImagesController
        currentData={{ images: imagesForController }}
        onControlsChange={onImagesControllerChange}
        imageArrayFieldName="images"
        getItemName={(img) => img?.name || 'Pricing Item Image'}
        allowAdd={false} 
        allowRemove={false}
      />
    ),
  };
};

export default PricingGrid;
