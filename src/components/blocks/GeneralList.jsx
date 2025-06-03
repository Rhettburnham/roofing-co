
// src/components/blocks/GeneralList.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaPlus, FaTrash, FaImage, FaTimes, FaPencilAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

/**
 * GeneralList
 *
 * config: {
 *   title: string, // alternative to sectionTitle
 *   sectionTitle: string,
 *   items: [
 *     // Can be structured items
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       advantages: string[],
 *       colorPossibilities?: string,
 *       installationTime?: string,
 *       pictures: string[]
 *     },
 *     // Or can be simple strings
 *     "Item 1",
 *     "Item 2",
 *     ...
 *   ],
 *   listStyle?: "bullet" | "numbered" | "none"
 * }
 */

// Helper function (can be moved to a utils file if used elsewhere)
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.url) return value.url;
  return null;
};

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
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextarea) {
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
      if (onBlur) onBlur();
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
      onChange: (e) => setCurrentValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `${className} ${inputClassName} outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm bg-white/50 placeholder-gray-500/70 shadow-inner`,
    };
    if (isTextarea) {
      return <textarea {...commonInputProps} rows={Math.max(3, (currentValue || '').split('\n').length)} placeholder={placeholder} />;
    }
    return <input {...commonInputProps} type="text" placeholder={placeholder} />;
  }

  return (
    <Tag
      className={`${className} cursor-pointer hover:bg-gray-400/10 transition-colors duration-150 ease-in-out p-0 m-0 min-h-[1em]`}
      onClick={activateEditMode}
      title="Click to edit"
    >
      {value || <span className="text-gray-400/80 italic text-sm">({placeholder})</span>}
    </Tag>
  );
};

const GeneralList = ({ config = {}, readOnly = false, onConfigChange, getDisplayUrl, onFileChange, themeColors, onToggleEditor }) => {
  const {
    sectionTitle: rawSectionTitle,
    title: rawTitle,
    items = [],
    listStyle = "none",
  } = config;

  const displayTitle = rawSectionTitle || rawTitle || "Service List";
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentGetDisplayUrl = typeof getDisplayUrl === 'function' ? getDisplayUrl : getDisplayUrlHelper;
  const hasStructuredItems = items.length > 0 && typeof items[0] === "object" && items[0] !== null && !Array.isArray(items[0]);

  const handleConfigUpdate = (newConfig) => {
    if (onConfigChange) onConfigChange(newConfig);
  };

  // Helper function to add an item
  const addItem = () => {
    let newItem;
    if (hasStructuredItems || items.length === 0) {
      newItem = {
        id: Date.now(), name: "New Item", description: "Description", advantages: ["Advantage 1"],
        colorPossibilities: "Various", installationTime: "1-2 days", pictures: []
      };
    } else { 
      newItem = "New List Item";
    }
    const newItems = [...items, newItem];
    // If adding the first structured item, select it
    if (newItems.length === 1 && typeof newItem === 'object') setSelectedIndex(0);
    // If adding to existing structured items, select the new one
    else if (hasStructuredItems && typeof newItem === 'object') setSelectedIndex(newItems.length - 1);
    handleConfigUpdate({ ...config, items: newItems });
  };

  // Helper function to remove an item
  const removeItem = (indexToRemove) => {
    const newItems = items.filter((_, index) => index !== indexToRemove);
    // Adjust selectedIndex if the removed item was selected or before the selected one
    if (selectedIndex >= indexToRemove) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    }
    if (newItems.length === 0) setSelectedIndex(0); // Reset if list becomes empty
    handleConfigUpdate({ ...config, items: newItems });
  };

  // Helper function to add an advantage to a structured item
  const addAdvantage = (itemIndex) => {
    const newItems = items.map((item, idx) => {
      if (idx === itemIndex && typeof item === 'object') {
        return { ...item, advantages: [...(item.advantages || []), "New Advantage"] };
      }
      return item;
    });
    handleConfigUpdate({ ...config, items: newItems });
  };

  // Helper function to remove an advantage from a structured item
  const removeAdvantage = (itemIndex, advIndex) => {
    const newItems = items.map((item, idx) => {
      if (idx === itemIndex && typeof item === 'object') {
        return { ...item, advantages: (item.advantages || []).filter((_, aIdx) => aIdx !== advIndex) };
      }
      return item;
    });
    handleConfigUpdate({ ...config, items: newItems });
  };

  // Helper function to change list style for simple lists
  const handleListStyleChange = (newListStyle) => {
    handleConfigUpdate({ ...config, listStyle: newListStyle });
  };

  const handleItemFieldChange = (itemIndex, field, newValue) => {
    const newItems = items.map((item, idx) => idx === itemIndex ? { ...item, [field]: newValue } : item);
    handleConfigUpdate({ ...config, items: newItems });
  };

  const handleAdvantageChange = (itemIndex, advIndex, newValue) => {
    const newItems = items.map((item, idx) => {
      if (idx === itemIndex) {
        const newAdvantages = (item.advantages || []).map((adv, aIdx) => aIdx === advIndex ? newValue : adv);
        return { ...item, advantages: newAdvantages };
      }
      return item;
    });
    handleConfigUpdate({ ...config, items: newItems });
  };

  const commonSectionWrapperClasses = "my-6 container mx-auto px-4 md:px-16 relative group";
  const commonCardClasses = "bg-white rounded-lg shadow-lg p-6 mx-auto max-w-4xl"; // Centered card with max-width
  const editModeBorderClass = "border-2 border-blue-400/50";

  // --- READ-ONLY RENDERING --- 
  if (readOnly) {
    const TitleComp = () => <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center text-gray-800">{displayTitle}</h2>;

    if (!hasStructuredItems) {
      return (
        <section className={commonSectionWrapperClasses}>
          <TitleComp />
          <div className={commonCardClasses}>
            {listStyle === "numbered" ? (
              <ol className="list-decimal pl-5 space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="text-gray-700 text-lg"><div className="markdown-content"><ReactMarkdown>{String(item)}</ReactMarkdown></div></li>
                ))}
              </ol>
            ) : listStyle === "bullet" ? (
              <ul className="list-disc pl-5 space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="text-gray-700 text-lg"><div className="markdown-content"><ReactMarkdown>{String(item)}</ReactMarkdown></div></li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="text-gray-700 text-lg"><div className="markdown-content"><ReactMarkdown>{String(item)}</ReactMarkdown></div></div>
                ))}
              </div>
            )}
            {items.length === 0 && <p className="text-gray-500 text-center py-2">No items to display.</p>}
          </div>
        </section>
      );
    }

    // Read-only for Structured Items
    const activeItem = items[selectedIndex] || {};
    return (
      <section className={commonSectionWrapperClasses.replace('my-6', 'my-2 md:my-4')}>
        <TitleComp />
        {items.length > 0 && (
            <div className="flex flex-wrap justify-center mt-2 gap-2 mb-4">
          {items.map((item, index) => (
            <button
              key={item.id || index}
              onClick={() => setSelectedIndex(index)}
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full font-semibold shadow-md transition-all duration-300 ${selectedIndex === index ? "bg-second-accent text-white scale-105" : "bg-accent text-black hover:bg-accent/80"}`}
            >
              {item.name || `Option ${index + 1}`}
            </button>
          ))}
        </div>
        )}
        <motion.div
          key={activeItem.id || selectedIndex}
          className={`${commonCardClasses} transition-all duration-500 @container`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {items.length === 0 ? (
             <p className="text-gray-500 text-center py-4">No items to display.</p>
          ) : (
          <div className="w-full">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-gray-800 text-center md:text-left">{activeItem.name}</h3>
                {activeItem.description && <div className="text-gray-700 text-sm sm:text-base md:text-lg whitespace-pre-wrap mb-4"><ReactMarkdown>{activeItem.description}</ReactMarkdown></div>}
            {activeItem.advantages && activeItem.advantages.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">Advantages</h4>
                    <ul className="grid grid-cols-1 @[600px]:grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                    {(activeItem.advantages || []).map((adv, i) => (
                        <li key={i} className="flex items-start text-sm md:text-base"><FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" /><span>{adv}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {activeItem.pictures && activeItem.pictures.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">Gallery</h4>
                    <div className="mt-2 grid grid-cols-2 @[400px]:grid-cols-3 @[600px]:grid-cols-4 gap-3">
                    {(activeItem.pictures || []).map((pic, picIdx) => (
                        <div key={picIdx} className="aspect-square overflow-hidden rounded-lg shadow-md"><img src={currentGetDisplayUrl(pic)} alt={`${activeItem.name || 'Item'} - Image ${picIdx + 1}`} className="w-full h-full object-cover"/></div>
                ))}
              </div>
                </div>
                )}
                {(activeItem.colorPossibilities || activeItem.installationTime) && (
                <div className="text-sm text-gray-600 space-y-1">
                    {activeItem.colorPossibilities && <p><strong className="text-gray-700">Color Options: </strong>{activeItem.colorPossibilities}</p>}
                    {activeItem.installationTime && <p><strong className="text-gray-700">Installation Time: </strong>{activeItem.installationTime}</p>}
                </div>
                )}
              </div>
            )}
        </motion.div>
      </section>
    );
  }

  // --- EDIT MODE RENDERING --- 
  const activeItemForEdit = items[selectedIndex] || {};

    return (
    <section className={`${commonSectionWrapperClasses} ${!readOnly && onToggleEditor ? 'py-8' : ''} ${!readOnly ? 'pb-12' : ''}`}>
      {!readOnly && onToggleEditor && (
        <button
          onClick={onToggleEditor}
          className="absolute top-2 right-2 z-20 p-2 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors opacity-50 group-hover:opacity-100"
          title="Open Editor Panel"
        >
          <FaPencilAlt size={16} />
        </button>
      )}
      <div className="text-center mb-4">
        <EditableText
            value={displayTitle}
          onChange={(newVal) => handleConfigUpdate({ ...config, sectionTitle: newVal, title: undefined })}
          tag="h2"
          className="text-2xl md:text-3xl font-semibold text-gray-800 inline-block"
          inputClassName="text-2xl md:text-3xl font-semibold text-gray-800 text-center w-auto"
          placeholder="Section Title"
          readOnly={readOnly}
        />
      </div>

      {/* Item Selector Buttons for Structured List in Edit Mode */} 
      {hasStructuredItems && items.length > 0 && (
        <div className="flex flex-wrap justify-center items-center mt-2 gap-2 mb-4">
          {items.map((item, index) => (
            <div key={item.id || index} className="relative group/itembtn">
              <button
                onClick={() => setSelectedIndex(index)} // Single click to select
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full font-semibold shadow-md transition-all duration-300 
                           ${selectedIndex === index ? "bg-second-accent text-white scale-105 ring-2 ring-offset-1 ring-second-accent/70" : "bg-accent text-black hover:bg-accent/80"}`}
              >
                <EditableText
                  value={item.name || `Option ${index + 1}`}
                  onChange={(newName) => handleItemFieldChange(index, "name", newName)}
                  tag="span" // Render as span inside button
                  className={`font-semibold ${selectedIndex === index ? "text-white" : "text-black"}`} // Match button text color
                  inputClassName={`font-semibold w-auto ${selectedIndex === index ? "text-white bg-second-accent/80" : "text-black bg-accent/80"}`}
                  placeholder="Item Name"
                  readOnly={readOnly}
                />
              </button>
              {!readOnly && (
                <button 
                  onClick={() => removeItem(index)} 
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

      <div className={`${commonCardClasses} ${!readOnly ? editModeBorderClass : ''} relative`}> 
        {!readOnly && (
          <div className="absolute top-2 right-2 flex space-x-1 z-10">
            <button 
              onClick={addItem} 
              className="p-1.5 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors"
              title={hasStructuredItems || items.length === 0 ? "Add New Structured Item" : "Add New List Item"}
            >
              <FaPlus size={12} />
            </button>
          </div>
        )}
        
        {!hasStructuredItems && !readOnly && (
          <div className="absolute top-2 left-2 flex space-x-1 z-10 items-center">
            <span className="text-xs text-gray-500 mr-1">Style:</span>
            <select 
              value={listStyle}
              onChange={(e) => handleListStyleChange(e.target.value)}
              className="p-1 bg-gray-100 border border-gray-300 rounded-md text-xs shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">None</option>
              <option value="bullet">Bullet</option>
              <option value="numbered">Numbered</option>
            </select>
          </div>
        )}

        {!hasStructuredItems && ( // Simple List Editing
          <>
            {items.map((item, index) => (
              <div key={index} className={`py-1 flex items-center group/simpleitem ${listStyle === "bullet" || listStyle === "numbered" ? "ml-5" : ""}`}>
                {listStyle === "numbered" && <span className="mr-2 text-gray-700 text-lg pt-[3px]">{index + 1}.</span>}
                {listStyle === "bullet" && <FaCheckCircle className="text-green-500 mr-2 mt-[5px] flex-shrink-0" />}
                <EditableText
                  value={String(item)}
                  onChange={(newVal) => {
                    const newItems = items.map((s, i) => i === index ? newVal : s);
                    handleConfigUpdate({ ...config, items: newItems });
                  }}
                  tag="div"
                  className="text-gray-700 text-lg flex-grow"
                  inputClassName="text-gray-700 text-lg w-full"
                  isTextarea={String(item).length > 70 || String(item).includes('\n')}
                  placeholder="List item content"
                  readOnly={readOnly}
                />
                {!readOnly && (
                  <button 
                    onClick={() => removeItem(index)} 
                    className="ml-2 p-1 text-red-500 hover:text-red-600 opacity-0 group-hover/simpleitem:opacity-100 transition-opacity duration-150"
                    title="Remove Item"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
            {items.length === 0 && 
              <div className="text-gray-500 text-center py-10">
                <p className="mb-2">No items yet.</p>
                {!readOnly && (
                  <button 
                    onClick={addItem} 
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    <FaPlus size={10} className="inline mr-1" /> Add {hasStructuredItems || items.length === 0 ? "Structured Item" : "List Item"}
                  </button>
                )}
              </div>
            }
          </>
        )}

        {hasStructuredItems && ( // Structured List Editing (content part)
          items.length === 0 ? (
             <div className="text-gray-500 text-center py-10">
                <p className="mb-2">No items yet. Add a structured item to begin.</p>
                {!readOnly && (
                  <button 
                    onClick={addItem} 
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    <FaPlus size={10} className="inline mr-1" /> Add Structured Item
                  </button>
                )}
              </div>
          ) : (
            <motion.div // Use motion.div for consistency if animations are ever added here
                key={activeItemForEdit.id || selectedIndex} // Keyed for re-render on selection change
                className="w-full"
            >
                {/* Name is edited via the buttons above, so display it statically here or omit if redundant */} 
                {/* <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-gray-800 text-center md:text-left">{activeItemForEdit.name}</h3> */} 
                
                <div className="mb-3">
                  <EditableText
                    value={activeItemForEdit.description || ""}
                    onChange={(newVal) => handleItemFieldChange(selectedIndex, "description", newVal)}
                    tag="div"
                    className="text-gray-700 text-sm sm:text-base md:text-lg whitespace-pre-wrap"
                    inputClassName="text-gray-700 text-sm sm:text-base md:text-lg w-full"
                    isTextarea
                    placeholder="Item description..."
                    readOnly={readOnly}
                  />
                </div>

                { (activeItemForEdit.advantages && activeItemForEdit.advantages.length > 0) || !readOnly ? (
                    <div className="mb-3">
                        <h4 className="text-lg sm:text-xl font-semibold mb-1 text-gray-700">Advantages</h4>
                        <ul className="grid grid-cols-1 @[600px]:grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600 pl-1">
                        {(activeItemForEdit.advantages || []).map((adv, advIndex) => (
                        <li key={advIndex} className="flex items-center text-sm md:text-base py-0.5 group/advantage">
                            <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                            <EditableText
                            value={adv}
                            onChange={(newVal) => handleAdvantageChange(selectedIndex, advIndex, newVal)}
                            tag="span"
                            className="text-gray-600 text-sm md:text-base flex-grow"
                            inputClassName="text-gray-600 text-sm md:text-base w-full"
                            placeholder="Advantage"
                            readOnly={readOnly}
                            />
                            {!readOnly && (
                              <button 
                                onClick={() => removeAdvantage(selectedIndex, advIndex)}
                                className="ml-1 p-0.5 text-red-500 hover:text-red-600 opacity-0 group-hover/advantage:opacity-100 transition-opacity duration-150"
                                title="Remove Advantage"
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
                        </li>
                        ))}
                        </ul>
                        {/* Add Advantage Button */}
                        {!readOnly && (
                            <button 
                                onClick={() => addAdvantage(selectedIndex)} 
                                className="mt-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md shadow"
                            >
                                <FaPlus size={10} className="inline mr-1" /> Add Advantage
                            </button>
                        )
                        }
                        {(activeItemForEdit.advantages || []).length === 0 && !readOnly && <p className="text-xs text-gray-400 ml-2 italic mt-1">No advantages listed. Click 'Add Advantage' to add one.</p>}
                    </div>
                ) : null}
                
                {(activeItemForEdit.pictures && activeItemForEdit.pictures.length > 0) || !readOnly ? (
                    <div className="mb-4">
                        <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">Gallery</h4>
                        {(activeItemForEdit.pictures && activeItemForEdit.pictures.length > 0) ? (
                            <div className="mt-2 grid grid-cols-2 @[400px]:grid-cols-3 @[600px]:grid-cols-4 gap-3">
                                {(activeItemForEdit.pictures || []).map((pic, picIdx) => (
                                <div key={picIdx} className="aspect-square overflow-hidden rounded-lg shadow-md"><img src={currentGetDisplayUrl(pic)} alt={`Preview ${picIdx}`} className="w-full h-full object-cover"/></div>
                                ))}
                            </div>
                        ) : <p className="text-xs text-gray-400 italic mt-1">No pictures. Add pictures using the editor panel.</p>}
                    </div>
                ) : null}

                { (activeItemForEdit.colorPossibilities || activeItemForEdit.installationTime || !readOnly) ? (
                    <div className="text-sm text-gray-600 space-y-1">
                        <div>
                        <strong className="text-gray-700">Color Options: </strong>
                        <EditableText
                            value={activeItemForEdit.colorPossibilities || ""}
                            onChange={(newVal) => handleItemFieldChange(selectedIndex, "colorPossibilities", newVal)}
                            tag="span"
                            className="text-gray-600 text-sm"
                            inputClassName="text-gray-600 text-sm w-auto inline-block"
                            placeholder="e.g., Various colors"
                            readOnly={readOnly}
                        />
                        </div>
                        <div>
                        <strong className="text-gray-700">Installation Time: </strong>
                        <EditableText
                            value={activeItemForEdit.installationTime || ""}
                            onChange={(newVal) => handleItemFieldChange(selectedIndex, "installationTime", newVal)}
                            tag="span"
                            className="text-gray-600 text-sm"
                            inputClassName="text-gray-600 text-sm w-auto inline-block"
                            placeholder="e.g., 1-2 days"
                            readOnly={readOnly}
                        />
          </div>
        </div>
                ) : null}
            </motion.div>
          )
        )}
      </div>
    </section>
  );
};

GeneralList.EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl, themeColors }) => {
  const {
    sectionTitle: rawSectionTitle,
    title: rawTitle,
    items = [],
    listStyle = "none",
  } = currentConfig;

  const hasStructuredItems = items.length > 0 && typeof items[0] === "object" && items[0] !== null && !Array.isArray(items[0]);
  const currentGetDisplayUrl = typeof getDisplayUrl === 'function' ? getDisplayUrl : getDisplayUrlHelper;

  const addPictureSlot = (itemIndex) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex && typeof item === 'object' && item !== null) {
        return { ...item, pictures: [...(item.pictures || []), { url: '', name: 'New Picture', file: null, originalUrl: '' }] };
      }
      return item;
    });
    onPanelConfigChange({ ...currentConfig, items: newItems });
  };

  const removePicture = (itemIndex, picIndex) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex && typeof item === 'object' && item !== null) {
        const picToRemove = (item.pictures || [])[picIndex];
        if (picToRemove && typeof picToRemove === 'object' && picToRemove.url && picToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(picToRemove.url);
        }
        return { ...item, pictures: (item.pictures || []).filter((_,pIdx) => pIdx !== picIndex) };
      }
      return item;
    });
    onPanelConfigChange({ ...currentConfig, items: newItems });
  };
  
  const handlePictureFileChange = (itemIndex, picIndex, file) => {
     if (file && onPanelFileChange) {
        const pathData = { field: 'pictures', blockItemIndex: itemIndex, pictureIndex: picIndex };
        onPanelFileChange(pathData, file); 
     }
  };
  
  const handlePictureUrlChange = (itemIndex, picIndex, url) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex && typeof item === 'object' && item !== null) {
        const newPictures = (item.pictures || []).map((pic, pIdx) => {
          if (pIdx === picIndex) {
            if (typeof pic === 'object' && pic.file && pic.url && pic.url.startsWith('blob:')) {
              URL.revokeObjectURL(pic.url);
            }
            return { file: null, url: url, name: url.split('/').pop() || `image_${pIdx}`, originalUrl: url };
          }
          return pic;
        });
        return { ...item, pictures: newPictures };
      }
      return item;
    });
    onPanelConfigChange({ ...currentConfig, items: newItems });
  };

  return (
    <div className="p-3 space-y-3 bg-gray-800 text-gray-200 rounded-b-md max-h-[70vh] overflow-y-auto">
      {hasStructuredItems && items.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <h4 className="text-sm font-semibold mb-2">Manage Item Images ({items.length})</h4>
          {items.map((item, index) => {
            if (typeof item !== 'object' || item === null) {
              return (
                <div key={index} className="p-2.5 mb-2.5 bg-gray-750 border border-gray-600 rounded-md">
                  <span className="text-xs font-medium text-gray-400">Item {index + 1} (Not a structured item, cannot manage images)</span>
                </div>
              );
            }
            return (
              <div key={item.id || index} className="p-2.5 mb-2.5 bg-gray-750 border border-gray-600 rounded-md">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-gray-400">Images for: {item.name || `Item ${index + 1}`}</span>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-0.5">Pictures:</label>
                  {(item.pictures || []).map((pic, picIdx) => (
                    <div key={picIdx} className="flex items-center space-x-1 mb-1 p-1 bg-gray-700 rounded">
                      {currentGetDisplayUrl(pic) && <img src={currentGetDisplayUrl(pic)} alt={`Thumb ${picIdx}`} className="h-8 w-8 object-cover rounded"/>}
                      <input type="text" placeholder="Image URL" value={(typeof pic === 'object' && pic !== null ? pic.url : String(pic)) || ''} onChange={(e) => handlePictureUrlChange(index, picIdx, e.target.value)} className="flex-grow p-1 bg-gray-600 border-gray-500 rounded text-xs" />
                      <label className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-1.5 py-1 rounded cursor-pointer">
                        <FaImage size={10} className="inline"/>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePictureFileChange(index, picIdx, e.target.files?.[0])} />
                      </label>
                      <button onClick={() => removePicture(index, picIdx)} className="text-red-500 hover:text-red-400 p-0.5"><FaTimes size={10}/></button>
                    </div>
                  ))}
                  <button onClick={() => addPictureSlot(index)} className="text-xs bg-green-600 hover:bg-green-500 text-white px-1.5 py-0.5 rounded mt-0.5"><FaPlus size={8} className="inline mr-0.5"/>Add Picture Slot</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!hasStructuredItems && (
        <div className="p-3 text-center text-gray-400 text-sm">
          Image management is available for structured list items. This list is currently simple.
        </div>
      )}

      {hasStructuredItems && items.length === 0 && (
         <div className="p-3 text-center text-gray-400 text-sm">
          No items to manage images for. Add items in the main editor view.
        </div>
      )}
    </div>
  );
};

export default GeneralList;
