// src/components/blocks/GeneralListVariant2.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaPlus, FaTrash, FaTimes, FaPencilAlt } from "react-icons/fa";
import PanelImagesController from "../common/PanelImagesController";

// Copied and adapted EditableText from GeneralList.jsx
const EditableText = ({ value, onChange, onBlur, tag: Tag = 'p', className = '', inputClassName = '', isTextarea = false, placeholder = "Edit", readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (isTextarea) { // Auto-grow textarea
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }
  }, [isEditing, currentValue, isTextarea]); // Added currentValue and isTextarea to dependencies

  const handleTextareaInput = (e) => { // Auto-grow textarea on input
    if (isTextarea && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${e.target.scrollHeight}px`;
    }
    setCurrentValue(e.target.value);
  };
  
  const localOnBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextarea) {
      localOnBlur();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
      if (onBlur) onBlur();
    }
  };

  const activateEditMode = (e) => {
    // Prevent click from propagating to parent button if Tag is span inside button
    if (Tag === 'span') {
        e.stopPropagation();
    }
    if (!readOnly && !isEditing) {
      setIsEditing(true);
    }
  };

  if (!readOnly && isEditing) {
    const commonInputProps = {
      ref: inputRef,
      value: currentValue || '', // Ensure value is not null/undefined
      onChange: isTextarea ? handleTextareaInput : (e) => setCurrentValue(e.target.value),
      onBlur: localOnBlur,
      onKeyDown: handleKeyDown,
      className: `${inputClassName || className} outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm bg-white/80 placeholder-gray-500/70 shadow-inner p-1`, // Added some padding
      style: { width: '100%' } // Ensure input takes full width of its container
    };
    if (isTextarea) {
      return <textarea {...commonInputProps} placeholder={placeholder} rows={1} />; // Start with 1 row
    }
    return <input {...commonInputProps} type="text" placeholder={placeholder} />;
  }

  return (
    <Tag
      className={`${className} cursor-pointer hover:bg-gray-400/10 transition-colors duration-150 ease-in-out min-h-[1em] ${readOnly && !value ? 'italic text-gray-400/80' : ''}`}
      onClick={activateEditMode}
      title={!readOnly ? "Click to edit" : ""}
    >
      {value || (readOnly && !placeholder ? '' : <span className="text-gray-400/80 italic text-sm">({placeholder || 'empty'})</span>)}
    </Tag>
  );
};

/**
 * GeneralListVariant2
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
const GeneralListVariant2 = ({
  config = {},
  readOnly = false,
  onConfigChange,
  getDisplayUrl,
  onFileChange,
  themeColors,
  onToggleEditor
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = () => {
    setIsEditing(prev => !prev);
  };

  // Standard MainPageForm icons
  const PencilIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"/></svg> );
  const CheckIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> );

  const {
    title = "Selection Title",
    items = [],
  } = config;

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Ensure selectedIndex is valid
  useEffect(() => {
    if (selectedIndex >= items.length && items.length > 0) {
      setSelectedIndex(items.length - 1);
    } else if (items.length === 0) {
      setSelectedIndex(0); // or -1 if no selection desired for empty list
    }
  }, [items, selectedIndex]);

  const handleFieldChange = (field, value) => {
    onConfigChange?.({ ...config, [field]: value });
  };

  const handleItemFieldChange = (idx, field, value) => {
    const newItems = items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    handleFieldChange("items", newItems);
  };

  const handleFeatureChange = (itemIndex, featureIndex, newValue) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        const newFeatures = (item.features || []).map((feat, fIdx) => fIdx === featureIndex ? newValue : feat);
        return { ...item, features: newFeatures };
      }
      return item;
    });
    handleFieldChange("items", newItems);
  };
  
  const activeItem = items[selectedIndex] || {}; // Fallback to empty object if no items or invalid index

  // Common styling
  const sectionClasses = "my-2 md:my-4 px-4 md:px-16 relative group";
  const detailsCardClasses = "bg-white rounded-2xl shadow-lg p-4 md:p-6 @container"; // Added @container
  const editModeBorderClass = !readOnly ? "border-2 border-blue-400/50" : "";

  const TitleComponent = () => (
    <EditableText
      tag="h2"
      value={title}
      onChange={(newVal) => handleFieldChange("title", newVal)}
      readOnly={readOnly}
      className="text-center text-[4vw] md:text-[3vh] font-bold mb-2 text-gray-800"
      inputClassName="text-center text-[4vw] md:text-[3vh] font-bold mb-2 text-gray-800 w-auto"
      placeholder="Block Title"
    />
  );

  return (
    <section className={`relative w-full px-4 md:px-8 py-8 bg-gradient-to-br from-blue-50 to-white ${!readOnly && isEditing ? 'border-2 border-blue-400/50' : ''}`}>
      {!readOnly && (
        <button
          onClick={handleToggleEdit}
          className={`absolute top-4 right-4 z-50 ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-2 shadow-lg transition-colors`}
          title={isEditing ? "Finish Editing" : "Edit List Variant 2"}
        >
          {isEditing ? CheckIcon : PencilIcon}
        </button>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <EditableText
            value={config.title || "Section Title"}
            onChange={(newVal) => onConfigChange({ ...config, title: newVal })}
            tag="h2"
            className="text-4xl font-bold text-gray-800 mb-4"
            inputClassName="text-4xl font-bold text-gray-800 text-center w-full"
            placeholder="Section Title"
            readOnly={readOnly || !isEditing}
          />
          <EditableText
            value={config.description || "Section description goes here"}
            onChange={(newVal) => onConfigChange({ ...config, description: newVal })}
            tag="p"
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            inputClassName="text-lg text-gray-600 w-full"
            isTextarea={true}
            placeholder="Section Description"
            readOnly={readOnly || !isEditing}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(config.items || []).map((item, index) => (
            <div key={item.id || index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="p-6">
                <EditableText
                  value={item.title || "Item Title"}
                  onChange={(newVal) => {
                    const newItems = (config.items || []).map((itm, i) => 
                      i === index ? { ...itm, title: newVal } : itm
                    );
                    onConfigChange({ ...config, items: newItems });
                  }}
                  tag="h3"
                  className="text-xl font-semibold text-gray-800 mb-3"
                  inputClassName="text-xl font-semibold text-gray-800 w-full"
                  placeholder="Item Title"
                  readOnly={readOnly || !isEditing}
                />
                <EditableText
                  value={item.description || "Item description"}
                  onChange={(newVal) => {
                    const newItems = (config.items || []).map((itm, i) => 
                      i === index ? { ...itm, description: newVal } : itm
                    );
                    onConfigChange({ ...config, items: newItems });
                  }}
                  tag="p"
                  className="text-gray-600 leading-relaxed"
                  inputClassName="text-gray-600 w-full"
                  isTextarea={true}
                  placeholder="Item Description"
                  readOnly={readOnly || !isEditing}
                />
                {!readOnly && isEditing && (
                  <button
                    onClick={() => {
                      const newItems = (config.items || []).filter((_, i) => i !== index);
                      onConfigChange({ ...config, items: newItems });
                    }}
                    className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-red-500 hover:text-red-700 transition-opacity p-2"
                    title="Remove Item"
                  >
                    <FaTimes size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!readOnly && isEditing && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                const newItems = [...(config.items || []), { 
                  id: Date.now(), 
                  title: "New Item", 
                  description: "Item description" 
                }];
                onConfigChange({ ...config, items: newItems });
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <FaPlus size={16} className="inline mr-2" />
              Add New Item
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

GeneralListVariant2.tabsConfig = (config, onPanelChange, themeColors, sitePalette, onPanelFileChange) => {
  const { items = [] } = config;

  // Helper for transforming items for PanelImagesController
  const getImagesForController = () => {
    return (config?.items || []).map((item, index) => ({
      // Ensure item.imageUrl is treated as an image object for PanelImagesController
      ...( (typeof item.imageUrl === 'string') ? { url: item.imageUrl, name: item.name || `Item ${index+1} Image`, originalUrl: item.imageUrl } : (item.imageUrl || { url: '', name: 'Default Image', originalUrl: '' }) ),
      id: item.id || `item_img_${index}`,
      name: item.name || `Item ${index + 1} Image`, // Use item name for better context in controller
      itemIndex: index, // To map back
    }));
  };

  const handleImagesChangeFromController = (updatedFlatImages) => {
    const newItems = JSON.parse(JSON.stringify(config?.items || [])); // Deep clone

    (updatedFlatImages || []).forEach(imgCtrl => {
      if (imgCtrl.itemIndex !== undefined && newItems[imgCtrl.itemIndex]) {
        const itemToUpdate = newItems[imgCtrl.itemIndex];
        // Construct the image object to store, handling potential file object
        const imageToStore = {
          url: imgCtrl.url || '',
          name: imgCtrl.name || (imgCtrl.url || '').split('/').pop() || `Image ${imgCtrl.itemIndex + 1}`,
          originalUrl: imgCtrl.originalUrl || imgCtrl.url || ''
        };
        if (imgCtrl.file) {
          imageToStore.file = imgCtrl.file;
        }
        itemToUpdate.imageUrl = imageToStore;
      }
    });
    onPanelChange({ ...config, items: newItems });
  };
  
  const handleAddItem = () => {
    const newItemId = `item_${Date.now()}`;
    const newItem = {
      id: newItemId,
      name: "New Option",
      description: "Detailed description for this new option.",
      features: ["Feature A", "Feature B"],
      uses: "Common application areas.",
      limitations: "Known limitations or considerations.",
      imageUrl: { url: "", name: "placeholder.jpg", file: null, originalUrl: "" } // Default empty image object
    };
    onPanelChange({ ...config, items: [...(config.items || []), newItem] });
  };

  const handleRemoveItem = (indexToRemove) => {
    const itemRemoved = (config.items || [])[indexToRemove];
    if (itemRemoved?.imageUrl && typeof itemRemoved.imageUrl === 'object' && itemRemoved.imageUrl.url?.startsWith('blob:')) {
        URL.revokeObjectURL(itemRemoved.imageUrl.url);
    }
    const updatedItems = (config.items || []).filter((_, i) => i !== indexToRemove);
    onPanelChange({ ...config, items: updatedItems });
  };

  return {
    general: () => (
      <div className="p-3 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Block Title (Editable inline too):</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => onPanelChange({ ...config, title: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter block title"
          />
        </div>
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Manage Items:</h4>
          <p className="text-xs text-gray-500 mb-3">Item details (name, description, features, etc.) are editable directly on the block preview.</p>
          {(items || []).map((item, index) => (
            <div key={item.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2 shadow-sm">
              <span className="text-xs text-gray-600 truncate w-3/4" title={item.name}>{index + 1}. {item.name || '(Untitled Item)'}</span>
              <button 
                onClick={() => handleRemoveItem(index)} 
                className="text-red-500 hover:text-red-700 text-xs font-semibold p-1 hover:bg-red-100 rounded-full"
                title="Remove Item"
              >
                ✕ Remove
              </button>
            </div>
          ))}
          <button 
            onClick={handleAddItem} 
            className="mt-2 w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:border-solid"
          >
            + Add Item
          </button>
           {(items || []).length === 0 && <p className="text-xs text-gray-400 text-center italic mt-2">No items yet. Click "Add Item".</p>}
        </div>
      </div>
    ),
    images: () => (
      (items || []).length > 0 ? (
        <PanelImagesController
          currentData={{ images: getImagesForController() }}
          onControlsChange={handleImagesChangeFromController} // This expects { images: [...] }
          imageArrayFieldName="images"
          getItemName={(img) => img?.name || 'Item Image'} // Uses the name property from the transformed image object
          allowAdd={false} // Adding items is handled in general tab
          allowRemove={false} // Removing items is handled in general tab
        />
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p>No items available to manage images for. Add items in the 'General' tab first.</p>
        </div>
      )
    ),
    // Colors and Styling tabs can be added here if needed for this block
    // colors: () => ( <div className="p-4">Color controls here...</div> ),
    // styling: () => ( <div className="p-4">Styling controls here...</div> ),
  };
};

export default GeneralListVariant2;
