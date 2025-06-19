// src/components/blocks/GeneralList.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaPlus, FaTrash, FaImage, FaTimes, FaPencilAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelTextSectionController from '../common/PanelTextSectionController';

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

const GeneralList = ({ config = {}, readOnly = false, onConfigChange, getDisplayUrl, onFileChange, themeColors }) => {
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
    <section className={`${commonSectionWrapperClasses} ${!readOnly ? 'py-8 pb-12' : ''}`}>
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
                        )}
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
                        ) : (!readOnly && <p className="text-xs text-gray-400 italic mt-1">No pictures. Add pictures using the editor panel.</p>)}
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
                            placeholder="e.g., 2-3 days"
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

// Static method for BottomStickyEditPanel integration
GeneralList.tabsConfig = (config, onUpdate, themeColors) => {
  const hasStructuredItems = config?.items?.length > 0 && typeof config.items[0] === "object" && config.items[0] !== null && !Array.isArray(config.items[0]);

  return {
    general: (props) => (
      <PanelTextSectionController
        currentData={config}
        onControlsChange={props.onControlsChange}
        controlType={hasStructuredItems ? 'items' : 'simpleItems'}
        blockType="GeneralList"
        sectionConfig={hasStructuredItems ? {
          label: 'Service Items',
          itemLabel: 'Service',
          arrayFieldName: 'items',
          itemTemplate: {
            id: Date.now(),
            name: "New Service",
            description: "Service description",
            advantages: ["Advantage 1"],
            colorPossibilities: "Various",
            installationTime: "1-2 days",
            pictures: []
          },
          showIcons: false,
          showDescriptions: true,
          isStructured: true
        } : {
          label: 'List Items',
          itemLabel: 'Item',
          arrayFieldName: 'items',
          itemTemplate: "New List Item",
          showIcons: false,
          showDescriptions: false,
          isSimple: true
        }}
      />
    ),
    
    images: () => hasStructuredItems ? (
      <PanelImagesController
        currentData={{ 
          images: config?.items?.reduce((acc, item, itemIndex) => {
            if (item?.pictures) {
              item.pictures.forEach((pic, picIndex) => {
                acc.push({
                  ...pic,
                  id: `item_${itemIndex}_pic_${picIndex}`,
                  name: `${item.name || `Item ${itemIndex + 1}`} - Image ${picIndex + 1}`,
                  itemIndex,
                  picIndex
                });
              });
            }
            return acc;
          }, []) || []
        }}
        onControlsChange={(updatedData) => {
          // Convert flat images back to nested structure
          const newItems = [...(config?.items || [])];
          updatedData.images.forEach(img => {
            if (img.itemIndex !== undefined && img.picIndex !== undefined) {
              if (!newItems[img.itemIndex]) newItems[img.itemIndex] = { pictures: [] };
              if (!newItems[img.itemIndex].pictures) newItems[img.itemIndex].pictures = [];
              newItems[img.itemIndex].pictures[img.picIndex] = img;
            }
          });
          onUpdate({ ...config, items: newItems });
        }}
        imageArrayFieldName="images"
        getItemName={(img) => img?.name || 'List Item Image'}
      />
    ) : (
      <div className="p-6 text-center text-gray-500">
        <p className="mb-2">Image management is available for structured list items.</p>
        <p className="text-sm">Convert this to a structured list to manage individual item images.</p>
      </div>
    ),
    
    colors: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Color Settings</h3>
        
        <ThemeColorPicker
          label="Text Color"
          fieldName="textColor"
          currentColorValue={config?.textColor || themeColors?.text || '#374151'}
          onColorChange={(fieldName, value) => onUpdate({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
        
        <ThemeColorPicker
          label="Background Color"
          fieldName="backgroundColor"
          currentColorValue={config?.backgroundColor || themeColors?.background || '#FFFFFF'}
          onColorChange={(fieldName, value) => onUpdate({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
        
        <ThemeColorPicker
          label="Accent Color (Selected Item)"
          fieldName="accentColor"
          currentColorValue={config?.accentColor || themeColors?.accent || '#3B82F6'}
          onColorChange={(fieldName, value) => onUpdate({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
      </div>
    ),
    
    styling: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Layout & Style Settings</h3>
        
        {!hasStructuredItems && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Style
            </label>
            <select
              value={config?.listStyle || 'none'}
              onChange={(e) => onUpdate({ ...config, listStyle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No Bullets/Numbers</option>
              <option value="bullet">Bullet Points</option>
              <option value="numbered">Numbered List</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose how simple list items are displayed
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Style
          </label>
          <select
            value={config?.cardStyle || 'default'}
            onChange={(e) => onUpdate({ ...config, cardStyle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default Cards</option>
            <option value="minimal">Minimal Style</option>
            <option value="elevated">Elevated Cards</option>
            <option value="bordered">Bordered Style</option>
          </select>
        </div>
        
        {hasStructuredItems && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Grid
            </label>
            <select
              value={config?.galleryColumns || 'auto'}
              onChange={(e) => onUpdate({ ...config, galleryColumns: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto (Responsive)</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Controls image gallery layout for structured items
            </p>
          </div>
        )}
      </div>
    )
  };
};

export default GeneralList;
