// src/components/blocks/PricingGrid.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaPlus, FaTrash, FaImage, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";

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

// Helper function
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.url) return value.url;
  return null;
};

// EditableText Component (Copied)
const EditableText = ({ value, onChange, onBlur, tag: Tag = 'p', className = '', inputClassName = '', isTextarea = false, placeholder = "Edit", readOnly = false, style = {} }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (isTextarea && inputRef.current.scrollHeight > inputRef.current.clientHeight) {
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }
  }, [isEditing, isTextarea]);
  
  const handleInputChange = (e) => {
    setCurrentValue(e.target.value);
    if (isTextarea && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) { onChange(currentValue); }
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextarea) { handleBlur(); }
    else if (e.key === 'Escape') { setCurrentValue(value); setIsEditing(false); if (onBlur) onBlur(); }
  };

  const activateEditMode = () => { if (!readOnly && !isEditing) { setIsEditing(true); } };

  if (!readOnly && isEditing) {
    const commonInputProps = {
      ref: inputRef, value: currentValue, onChange: handleInputChange, onBlur: handleBlur, onKeyDown: handleKeyDown,
      className: `${className} ${inputClassName} outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm bg-white/80 placeholder-gray-500/70 shadow-inner`,
      style: { ...style, width: '100%' }
    };
    if (isTextarea) return <textarea {...commonInputProps} rows={Math.max(1, (currentValue || '').split('\\n').length)} placeholder={placeholder} />;
    return <input {...commonInputProps} type="text" placeholder={placeholder} />;
  }
  const cursorClass = !readOnly && !isEditing ? 'cursor-pointer hover:bg-gray-400/10' : '';
  return (
    <Tag className={`${className} ${cursorClass} transition-colors duration-150 ease-in-out p-0 m-0 min-h-[1em] w-full break-words`} onClick={activateEditMode} title={!readOnly ? "Click to edit" : ""} style={style}>
      {value || <span className="text-gray-400/80 italic text-sm">({placeholder})</span>}
    </Tag>
  );
};

const PricingGridDisplay = ({ config = {}, readOnly = false, onConfigChange }) => {
  const {
    showPrice = true,
    items = [
      { id:1, title: "Sample Item 1", image: "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Sample1", alt: "Sample Alt 1", description: "This is a description for sample item 1.", rate: "$10/unit" },
      { id:2, title: "Sample Item 2", image: "https://via.placeholder.com/150/AAAAAA/FFFFFF?text=Sample2", alt: "Sample Alt 2", description: "This is a description for sample item 2. It can be a bit longer to test wrapping.", rate: "$20/unit" },
    ],
  } = config;

  const handleItemChange = (index, field, value) => {
    if (onConfigChange) {
      const newItems = items.map((item, idx) => 
        idx === index ? { ...item, [field]: value } : item
      );
      onConfigChange({ ...config, items: newItems });
    }
  };

    return (
    <div className={`container mx-auto px-4 md:px-10 py-4 md:py-8 ${!readOnly ? 'p-1 bg-slate-50' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {(items || []).map((g, idx) => (
            <div
            key={g.id || idx}
            className="relative flex flex-col md:flex-row items-center md:space-x-4 p-3 md:p-4 rounded-lg shadow-md bg-white/80 hover:shadow-lg transition-all duration-300"
            >
            {getDisplayUrlHelper(g.image) ? (
              <img
                src={getDisplayUrlHelper(g.image)}
                alt={g.alt || g.title}
                className={`w-full md:w-32 h-32 md:h-32 object-cover rounded-lg mb-2 md:mb-0 shadow ${
                  g.title === "Steel Gutters" ? "transform -scale-x-100" : ""
                }`}
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
                inputClassName="text-lg font-bold text-gray-800 w-full" 
                readOnly={readOnly} 
                placeholder="Item Title"
              />
              <EditableText 
                tag="p" 
                value={g.description} 
                onChange={(newVal) => handleItemChange(idx, "description", newVal)} 
                className="text-sm md:text-base text-gray-700 mt-1" 
                inputClassName="text-sm md:text-base text-gray-700 w-full" 
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
                    inputClassName="text-sm md:text-base font-semibold text-blue-600 w-full" 
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

const PricingGrid = ({
  config = {},
  readOnly = false,
  onConfigChange,
  onToggleEditor,
  // onFileChange for EditorPanel
}) => {

  if (!readOnly) {
    return (
      <div className="relative group border-2 border-blue-400/50">
        <PricingGridDisplay 
            config={config} 
            readOnly={false} 
            onConfigChange={onConfigChange} 
        />
        {onToggleEditor && (
          <button
            onClick={onToggleEditor}
            className="absolute top-2 right-2 z-30 p-2 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors opacity-50 group-hover:opacity-100"
            title="Open Editor Panel"
          >
            <FaPencilAlt size={16} />
          </button>
        )}
      </div>
    );
  }
  return <PricingGridDisplay config={config} readOnly={true} />;
};

PricingGrid.EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl }) => {
  const {
    showPrice = true,
    items = [],
  } = currentConfig;

  const currentGetDisplayUrl = typeof getDisplayUrl === 'function' ? getDisplayUrl : getDisplayUrlHelper;

  const handleShowPriceToggle = () => {
    onPanelConfigChange({ showPrice: !showPrice });
  };

  const handleItemAltChange = (idx, altText) => {
    const newItems = items.map((item, itemIdx) => 
      itemIdx === idx ? { ...item, alt: altText } : item
    );
    onPanelConfigChange({ items: newItems });
  };

  const handleImageFileChange = (itemIndex, file) => {
     if (file && onPanelFileChange) {
        const pathData = { field: 'image', blockItemIndex: itemIndex };
        onPanelFileChange(pathData, file); 
     }
  };

  const handleImageUrlChange = (itemIndex, url) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        if (typeof item.image === 'object' && item.image?.file && item.image?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(item.image.url);
        }
        return { ...item, image: { file: null, url: url, name: url.split('/').pop() || `image_${i}`, originalUrl: url } };
      }
      return item;
    });
    onPanelConfigChange({ items: newItems });
  };

  const addItem = () => {
    const newItem = { 
        id: Date.now(), 
        title: "New Item", 
        image: { url: "", name: "New Image", file: null, originalUrl: "" }, 
        alt: "",
        description: "Description for new item.", 
        rate: "$0/unit" 
    };
    const newItems = [...(items || []), newItem];
    onPanelConfigChange({ items: newItems });
  };

  const removeItem = (idxToRemove) => {
    const itemToRemove = items[idxToRemove];
    if (itemToRemove && typeof itemToRemove.image === 'object' && itemToRemove.image?.url?.startsWith('blob:')){
        URL.revokeObjectURL(itemToRemove.image.url);
    }
    const newItems = (items || []).filter((_, idx) => idx !== idxToRemove);
    onPanelConfigChange({ items: newItems });
  };
  
  const inputBaseClass = "mt-1 w-full px-2 py-1.5 bg-gray-600 text-white rounded-md border border-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs";
  const labelBaseClass = "block text-xs font-medium text-gray-300 mb-0.5";

  return (
    <div className="p-3 space-y-3 bg-gray-800 text-gray-200 rounded-b-md max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200">Pricing Grid Settings</h3>
        <button 
            onClick={handleShowPriceToggle} 
            className={`p-1.5 rounded-full transition-colors duration-200 flex items-center text-xs ${showPrice ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-500'}`}
            title={showPrice ? "Hide Prices" : "Show Prices"}
        >
            {showPrice ? <FaToggleOn size={18} className="mr-1 text-white" /> : <FaToggleOff size={18} className="mr-1 text-gray-400" />}
            <span className="text-white">{showPrice ? 'Prices Shown' : 'Prices Hidden'}</span>
        </button>
      </div>
      
      <h4 className="text-xs font-semibold text-gray-300 pt-2">Manage Items:</h4>
      {(items || []).map((item, idx) => (
        <div key={item.id || idx} className="border border-gray-700 p-2.5 rounded-md mb-2 bg-gray-750 shadow-sm">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-gray-400 truncate pr-2">{idx + 1}. {item.title || 'Untitled Item'}</span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors flex-shrink-0"
              title="Remove Item"
            >
              <FaTrash size={10} />
            </button>
          </div>

          <div>
            <label className={labelBaseClass}>Image:</label>
            <div className="flex items-center space-x-1 mb-1 p-1 bg-gray-700 rounded">
                {currentGetDisplayUrl(item.image) && <img src={currentGetDisplayUrl(item.image)} alt={`Thumb ${idx}`} className="h-8 w-8 object-cover rounded"/>}
            <input
              type="text"
                    placeholder="Image URL" 
                    value={(typeof item.image === 'string' && !item.image.startsWith('blob:')) ? item.image : (item.image?.originalUrl || item.image?.url || '')}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)} 
                    className="flex-grow p-1 bg-gray-600 border-gray-500 rounded text-xs" 
                />
                <label className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-1.5 py-1 rounded cursor-pointer">
                    <FaImage size={10} className="inline"/>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(idx, e.target.files?.[0])} />
          </label>
                 {item.image && (item.image.url || typeof item.image === 'string') && (
                    <button onClick={() => handleImageUrlChange(idx, '')} className="text-red-500 hover:text-red-400 p-0.5" title="Remove Image">
                        <FaTimes size={10}/>
                    </button>
                )}
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>Alt Text (for image accessibility):</label>
            <input
              type="text"
              value={item.alt || ""}
              onChange={(e) => handleItemAltChange(idx, e.target.value)}
              className={inputBaseClass}
              placeholder="Descriptive alt text..."
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full mt-2 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md shadow flex items-center justify-center"
      >
        <FaPlus size={10} className="mr-1" /> Add Item
      </button>
      {(!items || items.length === 0) && <p className="text-xs text-gray-400 text-center italic mt-2">No items defined. Click 'Add Item' to start.</p>}
    </div>
  );
};

export default PricingGrid;
