// src/components/blocks/GeneralListVariant2.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaPlus, FaTrash, FaTimes, FaPencilAlt } from "react-icons/fa";

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
  readOnly = true,
  onConfigChange,
  onToggleEditor
}) => {
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
  
  const getDisplayUrl = (value) => { // Simple helper, can be enhanced for File objects
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value.url) return value.url;
    return null;
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
    <section className={`${sectionClasses} ${!readOnly ? 'pb-12' : ''}`}>
      {!readOnly && onToggleEditor && (
        <button
          onClick={onToggleEditor}
          className="absolute top-2 right-2 z-20 p-2 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors opacity-50 group-hover:opacity-100"
          title="Open Editor Panel"
        >
          <FaPencilAlt size={16} />
        </button>
      )}
      <TitleComponent />

      {/* Item Selector Buttons */}
      {items.length > 0 && (
        <div className="flex flex-wrap justify-center mb-4 gap-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="relative group/itembtn">
                <button
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-semibold shadow-lg transition-all duration-300 ${
                        selectedIndex === idx
                        ? "bg-second-accent text-white shadow-2xl ring-2 ring-offset-1 ring-second-accent/70"
                        : "bg-accent text-black hover:bg-accent/80"
                    }`}
                >
                    <EditableText
                        tag="span"
                        value={item.name}
                        onChange={(newVal) => handleItemFieldChange(idx, "name", newVal)}
                        readOnly={readOnly}
                        className={`font-semibold ${selectedIndex === idx ? "text-white" : "text-black"}`}
                        inputClassName={`font-semibold ${selectedIndex === idx ? "text-white bg-second-accent/80" : "text-black bg-accent/80"} w-auto`}
                        placeholder="Item Name"
                    />
                </button>
                {!readOnly && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent button click if EditPanel has own logic
                            // Call removeItem from EditorPanel or via onConfigChange directly
                            const newItems = items.filter((_, i) => i !== idx);
                            handleFieldChange("items", newItems);
                            if (selectedIndex === idx) {
                              setSelectedIndex(Math.max(0, idx -1));
                            } else if (selectedIndex > idx) {
                              setSelectedIndex(selectedIndex -1);
                            }
                        }} 
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover/itembtn:opacity-100 hover:bg-red-600 transition-opacity duration-150 z-10"
                        title="Remove Item"
                    >
                        <FaTrash size={10} />
                    </button>
                )}
            </div>
          ))}
        </div>
      )}
      
      {items.length === 0 && !readOnly && (
        <div className="text-center py-6 text-gray-500">
          <p>No items yet. Add items using the editor panel.</p>
           <button
                onClick={onToggleEditor} // Or a direct add function if panel is too much for just this
                className="mt-2 px-3 py-1.5 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors text-sm"
            >
                <FaPlus size={10} className="inline mr-1" /> Open Editor to Add Items
            </button>
        </div>
      )}

      {/* Selected item details */}
      {items.length > 0 && (
        <motion.div
          key={activeItem.id || selectedIndex}
          className={`${detailsCardClasses} ${editModeBorderClass}`}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.4 }}
        >
          <EditableText
            tag="h3"
            value={activeItem.name}
            onChange={(newVal) => handleItemFieldChange(selectedIndex, "name", newVal)}
            readOnly={readOnly} // Name is also editable from buttons, make this readOnly if it causes issues or sync it. For now, editable here too.
            className="text-[3.5vh] font-bold mb-2 text-gray-800 text-center"
            inputClassName="text-[3.5vh] font-bold mb-2 text-gray-800 text-center w-auto"
            placeholder="Item Title"
          />
          
          <EditableText
            tag="div" // Using div for multi-line potential, ReactMarkdown will handle <p>
            value={activeItem.description}
            onChange={(newVal) => handleItemFieldChange(selectedIndex, "description", newVal)}
            readOnly={readOnly}
            isTextarea
            className="text-gray-700 mb-3 whitespace-pre-wrap" // Added whitespace-pre-wrap
            inputClassName="text-gray-700 w-full"
            placeholder="Item description..."
          />

          <div className="flex flex-col @lg:flex-row gap-6"> {/* Changed md: to @lg: for container query */}
            <div className="flex-1">
              {((activeItem.features && activeItem.features.length > 0) || !readOnly) && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">Features:</h4>
                  <ul className="space-y-1">
                    {(activeItem.features || []).map((feat, i) => (
                      <li key={i} className="flex items-start space-x-2 group/feature">
                        <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <EditableText
                          tag="span"
                          value={feat}
                          onChange={(newVal) => handleFeatureChange(selectedIndex, i, newVal)}
                          readOnly={readOnly}
                          className="text-gray-700 flex-grow"
                          inputClassName="text-gray-700 w-full"
                          placeholder="Feature description"
                        />
                        {!readOnly && (
                          <button 
                            onClick={() => {
                                const currentItem = items[selectedIndex];
                                const updatedFeatures = [...(currentItem.features || [])];
                                updatedFeatures.splice(i, 1);
                                handleItemFieldChange(selectedIndex, "features", updatedFeatures);
                            }}
                            className="ml-1 p-0.5 text-red-500 hover:text-red-600 opacity-0 group-hover/feature:opacity-100 transition-opacity"
                            title="Remove Feature"
                          >
                            <FaTimes size={12} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                   {!readOnly && (
                        <button
                            onClick={() => {
                                const currentItem = items[selectedIndex];
                                const updatedFeatures = [...(currentItem.features || []), "New Feature"];
                                handleItemFieldChange(selectedIndex, "features", updatedFeatures);
                            }}
                            className="mt-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md shadow"
                        >
                           <FaPlus size={10} className="inline mr-1" /> Add Feature
                        </button>
                    )}
                     {(!activeItem.features || activeItem.features.length === 0) && !readOnly && <p className="text-xs text-gray-400 ml-1 italic mt-1">No features listed. Click 'Add Feature'.</p>}
                </div>
              )}

              { (activeItem.uses || !readOnly) && (
                <div className="text-gray-700 mb-2">
                  <strong>Uses: </strong>
                  <EditableText
                    tag="span"
                    value={activeItem.uses}
                    onChange={(newVal) => handleItemFieldChange(selectedIndex, "uses", newVal)}
                    readOnly={readOnly}
                    className="text-gray-700"
                    inputClassName="text-gray-700 inline-block w-auto"
                    placeholder="Item uses..."
                  />
                </div>
              )}
              { (activeItem.limitations || !readOnly) && (
                <div className="text-gray-700 mb-2">
                  <strong>Limitations: </strong>
                  <EditableText
                    tag="span"
                    value={activeItem.limitations}
                    onChange={(newVal) => handleItemFieldChange(selectedIndex, "limitations", newVal)}
                    readOnly={readOnly}
                    className="text-gray-700"
                    inputClassName="text-gray-700 inline-block w-auto"
                    placeholder="Item limitations..."
                  />
                </div>
              )}
            </div>

            {(activeItem.imageUrl || !readOnly) && (
              <div className="flex-1 flex items-center justify-center">
                {activeItem.imageUrl ? (
                    <img
                        src={getDisplayUrl(activeItem.imageUrl)}
                        alt={activeItem.name || 'Item Image'}
                        className="max-w-full h-auto max-h-64 object-contain rounded-lg shadow-md" // Changed to object-contain and max-h
                    />
                ) : (
                    !readOnly && <p className="text-sm text-gray-400">No image. Add URL in Editor Panel.</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
};

export const GeneralListVariant2EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange }) => {
  const {
    title = "Selection Title",
    items = [],
  } = currentConfig;

  const handleConfigUpdate = (newConfig) => {
    onPanelConfigChange?.(newConfig);
  };

  const handleMainTitleChange = (newTitle) => {
    handleConfigUpdate({ ...currentConfig, title: newTitle });
  };
  
  const updateItemField = (idx, field, value) => {
    const newItems = currentConfig.items.map((item, i) => 
      i === idx ? { ...item, [field]: value } : item
    );
    handleConfigUpdate({ ...currentConfig, items: newItems });
  };
  
  const addItem = () => {
    const newItemId = Date.now();
    const newItems = [
      ...(currentConfig.items || []),
      {
        id: newItemId,
        name: "New Option",
        description: "Description for new option.", // Added default description
        features: ["Feature 1", "Feature 2"], // Added default features
        uses: "Typical uses.", // Added default uses
        limitations: "Known limitations.", // Added default limitations
        imageUrl: "", // Default empty image URL
      },
    ];
    handleConfigUpdate({ ...currentConfig, items: newItems });
    // Parent component (ServiceEditPage) should manage selectedIndex if needed
  };

  const removeItem = (idx) => {
    const newItems = (currentConfig.items || []).filter((_, i) => i !== idx);
    handleConfigUpdate({ ...currentConfig, items: newItems });
  };

  // Get display URL for previews
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value; // Direct URL or blob URL
    if (value.url) return value.url; // Object like { url: '...', file: File }
    return null;
  };

  const handleItemImageFileChange = (itemIndex, file) => {
    if (file && onPanelFileChange) {
      // The pathData helps ServiceEditPage determine where to put the uploaded file's URL
      const pathData = { 
        field: 'items', // Indicates the 'items' array in the config
        blockItemIndex: itemIndex, // The index of the item within the 'items' array
        property: 'imageUrl' // The specific property within the item object to update
      };
      onPanelFileChange(pathData, file); 
    }
  };
  
  const handleItemImageUrlManualChange = (itemIndex, url) => {
    // This allows manually pasting a URL if no file is uploaded
    // Construct an object similar to what onPanelFileChange would produce for consistency if needed by parent,
    // or just update the string directly.
    const newValue = { url: url, file: null, name: url.split('/').pop() || 'pasted_image' }; // Basic object structure
    updateItemField(itemIndex, "imageUrl", newValue); // or just `url` if parent expects string
  };


  return (
    <div className="p-3 space-y-3 bg-gray-800 text-gray-200 rounded-b-md max-h-[70vh] overflow-y-auto">
      <div>
        <label className="block text-xs font-medium mb-1">Block Title (Editable Inline Too):</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleMainTitleChange(e.target.value)}
          className="w-full p-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm"
          placeholder="Enter block title"
        />
      </div>
      
      <div className="border-t border-gray-700 pt-3">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold">Manage Items ({items.length})</h4>
            <button
                onClick={addItem}
                className="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 transition-colors"
            >
                <FaPlus size={10} className="inline mr-1" /> Add Item
            </button>
        </div>

        {items.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">No items yet. Click "Add Item".</p>}

        {items.map((item, idx) => (
          <div key={item.id || idx} className="p-2.5 mb-2 bg-gray-750 border border-gray-600 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-400 truncate pr-2">{item.name || `Item ${idx + 1}`}</span>
              <button
                onClick={() => removeItem(idx)}
                className="p-1 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 transition-colors flex-shrink-0"
                title="Remove Item"
              >
                <FaTrash size={10} />
              </button>
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-0.5">Name (Editable Inline Too):</label>
                <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => updateItemField(idx, "name", e.target.value)}
                    className="w-full p-1 bg-gray-700 border-gray-600 rounded text-xs"
                    placeholder="Item Name"
                />
            </div>
             <div>
                <label className="block text-xs text-gray-400 mb-0.5">Image:</label>
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleItemImageFileChange(idx, e.target.files?.[0])}
                        className="w-full text-xs p-1 bg-gray-700 border border-gray-600 rounded-md file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                </div>
                <input 
                    type="text"
                    value={getDisplayUrl(item.imageUrl) || ''} // Show current URL (blob or direct)
                    onChange={(e) => handleItemImageUrlManualChange(idx, e.target.value)}
                    className="mt-1 w-full p-1 bg-gray-700 border-gray-600 rounded text-xs"
                    placeholder="Or paste image URL"
                />
                {getDisplayUrl(item.imageUrl) && (
                    <img 
                        src={getDisplayUrl(item.imageUrl)} 
                        alt={`${item.name || 'Item'} preview`}
                        className="mt-2 h-20 w-auto rounded object-contain bg-gray-600 border border-gray-500 p-0.5"
                    />
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default GeneralListVariant2;
