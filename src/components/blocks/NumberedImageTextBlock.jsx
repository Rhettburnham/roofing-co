import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import PanelImagesController from "../common/PanelImagesController";
import ThemeColorPicker from "../common/ThemeColorPicker";

/**
 * NumberedImageTextBlock
 * 
 * Showcases a group of items with benefits and images in a vertical layout
 * 
 * config = {
 *   sectionTitle: string,
 *   items: [
 *     {
 *       id: number,
 *       title: string,
 *       description: string,
 *       benefits: string[],
 *       image: string or {url: string, file?: File, name?: string, originalUrl?: string}
 *     }
 *   ],
 *   defaultImage: string,
 *   titleColor: string,
 *   descriptionColor: string,
 *   benefitTextColor: string,
 *   benefitIconColor: string,
 *   imageStyle: "rounded" | "circle" | "none",
 *   layoutAlternating: boolean,
 *   itemBackgroundColor: string // Although present, not currently used in preview styling
 * }
 */

// Shared image state helpers (consistent with other blocks)
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

const getEffectiveDisplayUrl = (imageState, getDisplayUrlProp, defaultPath = '') => {
  if (getDisplayUrlProp && imageState) return getDisplayUrlProp(imageState); // Prop from OneForm/ServiceEditPage takes precedence
  if (imageState && typeof imageState === 'object' && imageState.url) return imageState.url;
  if (typeof imageState === 'string' && imageState) {
    if (imageState.startsWith('/') || imageState.startsWith('blob:') || imageState.startsWith('data:')) return imageState;
    return imageState.startsWith('.') ? imageState : `/${imageState.replace(/^\/+/, "")}`;
  }
  return defaultPath;
};

// Reusable EditableField component
const EditableField = ({ value, onChange, placeholder, type = 'text', className = '', style = {}, rows = 1, isEditable = true }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (!isEditable) return;
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset before calculating scrollHeight
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [currentValue, isEditable]); // Re-run on currentValue change to adjust height

  const handleChange = (e) => {
    if (!isEditable) return;
    setCurrentValue(e.target.value);
  };

  const handleBlur = () => {
    if (!isEditable) return;
    if (value !== currentValue) {
      onChange(currentValue);
    }
  };
  
  const handleKeyDown = (e) => {
    if (!isEditable) return;
    if (type !== 'textarea' && e.key === 'Enter') {
      handleBlur();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setCurrentValue(value); // Revert
      inputRef.current?.blur();
    }
  };

  if (!isEditable) {
    if (type === 'textarea') {
      return <div className={`${className} whitespace-pre-wrap`} style={style}>{value || <span className="text-gray-400 italic">({placeholder})</span>}</div>;
    }
    return <span className={className} style={style}>{value || <span className="text-gray-400 italic">({placeholder})</span>}</span>;
  }

  const inputClasses = `bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`;

  if (type === 'textarea') {
    return (
      <textarea 
        ref={inputRef}
        value={currentValue || ''} 
        onChange={handleChange} 
        onBlur={handleBlur} 
        onKeyDown={handleKeyDown}
        placeholder={placeholder} 
        className={inputClasses}
        style={style} 
        rows={rows}
      />
    );
  }
  return (
    <input 
      ref={inputRef}
      type={type} 
      value={currentValue || ''} 
      onChange={handleChange} 
      onBlur={handleBlur} 
      onKeyDown={handleKeyDown}
      placeholder={placeholder} 
      className={inputClasses}
      style={style}
    />
  );
};

function NumberedImageTextPreview({ config = {}, readOnly, onInlineChange, getDisplayUrl }) {
  const {
    sectionTitle = "Our Process", 
    items = [], 
    defaultImage = "/assets/images/placeholder-icon.png", 
    titleColor = "#1A202C", 
    descriptionColor = "#4A5568", 
    imageStyle = "rounded", 
    layoutAlternating = false, 
    benefitTextColor = "#374151", 
    benefitIconColor = "#10B981"
  } = config;

  const getImageClasses = (style) => {
    switch (style) {
      case "circle": return "rounded-full aspect-square";
      case "rounded": return "rounded-lg aspect-video";
      default: return "aspect-video"; // Default to aspect-video if style is none or undefined
    }
  };

  return (
    <section className={`py-8 md:py-12 px-4 ${!readOnly ? 'bg-slate-50 border-2 border-blue-300/50' : 'bg-gray-50'}`}>
      <EditableField 
        value={sectionTitle} 
        onChange={(newVal) => onInlineChange('sectionTitle', newVal)} 
        placeholder="Section Title" 
        className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12" 
        style={{ color: titleColor }}
        isEditable={!readOnly}
      />
      
      <div className="space-y-8 md:space-y-12 max-w-4xl mx-auto">
        {(items || []).map((item, index) => {
          const imageUrl = getEffectiveDisplayUrl(item.image, getDisplayUrl, defaultImage);
          const isReversed = layoutAlternating && index % 2 !== 0;
          return (
            <motion.div 
              key={item.id || index}
              className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-6 md:gap-8 p-4 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {imageUrl && (
                <div className={`w-full md:w-1/3 flex-shrink-0 overflow-hidden ${getImageClasses(imageStyle)}`}>
                  <img 
                    src={imageUrl} 
                    alt={item.altText || item.title || "Item image"} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              {!imageUrl && !readOnly && (
                 <div className={`w-full md:w-1/3 h-48 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm ${getImageClasses(imageStyle)}`}>
                   Add image in panel
                 </div>
              )}
              <div className={`flex-grow text-center ${isReversed ? 'md:text-right' : 'md:text-left'}`}>
                <EditableField 
                  value={item.title} 
                  onChange={(newVal) => onInlineChange('items', newVal, index, 'title')} 
                  placeholder="Item Title" 
                  className="text-xl md:text-2xl font-semibold mb-2" 
                  style={{ color: titleColor }} 
                  isEditable={!readOnly}
                />
                <EditableField 
                  value={item.description} 
                  onChange={(newVal) => onInlineChange('items', newVal, index, 'description')} 
                  placeholder="Item description" 
                  className="text-sm md:text-base leading-relaxed mb-3" 
                  style={{ color: descriptionColor }} 
                  type="textarea" 
                  rows={3} 
                  isEditable={!readOnly}
                />
                
                {((item.benefits && item.benefits.length > 0) || !readOnly) && (
                  <div className="mt-3">
                    <ul className={`space-y-2 ${isReversed ? 'md:items-end' : 'md:items-start'} flex flex-col`}>
                      {(item.benefits || []).map((benefit, benefitIdx) => (
                        <li key={benefitIdx} className={`flex items-center ${isReversed ? 'md:flex-row-reverse' : ''}`}>
                          <Check size={18} className={`${isReversed ? 'ml-2' : 'mr-2'} flex-shrink-0`} style={{color: benefitIconColor || '#10B981'}} />
                          <EditableField 
                            value={benefit} 
                            onChange={(newVal) => onInlineChange('items', newVal, index, 'benefits', benefitIdx)} 
                            placeholder="Benefit description" 
                            className={`text-sm ${isReversed ? 'md:text-right' : 'md:text-left'} flex-grow`} 
                            style={{color: benefitTextColor}}
                            isEditable={!readOnly}
                          />
                           {!readOnly && <button onClick={() => onInlineChange('items', null, index, 'removeBenefit', benefitIdx)} className="text-red-500 hover:text-red-700 text-xs p-0.5 ml-1">✕</button>}
                        </li>
                      ))}
                      {!readOnly && <button onClick={() => onInlineChange('items', 'New Benefit', index, 'addBenefit')} className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-1">+ Add Benefit</button>}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
         {items.length === 0 && !readOnly && (
            <div className="text-center text-gray-500 py-6">
                <p>No items yet. Add items using the editor panel.</p>
            </div>
        )}
      </div>
    </section>
  );
}
NumberedImageTextPreview.propTypes = { 
  config: PropTypes.object.isRequired, 
  readOnly: PropTypes.bool.isRequired, 
  onInlineChange: PropTypes.func.isRequired, 
  getDisplayUrl: PropTypes.func 
};

const NumberedImageTextBlock = ({ config, readOnly = true, onConfigChange, getDisplayUrl: getDisplayUrlFromProp }) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      sectionTitle: "Our Process",
      items: [
        { id: `item_default_1_${Date.now()}`, title: "Step 1: Consultation", image: initializeImageState(null, "/assets/images/placeholder_rect_1.jpg"), description: "Detailed consultation to understand your precise needs and goals.", benefits: ["Understand Requirements", "Site Assessment"], altText: "Consultation meeting" },
        { id: `item_default_2_${Date.now()}`, title: "Step 2: Design & Planning", image: initializeImageState(null, "/assets/images/placeholder_rect_2.jpg"), description: "Our expert team crafts a tailored solution and meticulous execution plan.", benefits: ["Custom Solution Design", "Material Selection"], altText: "Design blueprints" },
        { id: `item_default_3_${Date.now()}`, title: "Step 3: Execution & Quality Check", image: initializeImageState(null, "/assets/images/placeholder_rect_3.jpg"), description: "Skilled professionals carry out the work with rigorous quality assurance.", benefits: ["Professional Installation", "Final Inspection"], altText: "Roof installation in progress" },
      ],
      defaultImage: "/assets/images/placeholder-icon.png",
      titleColor: "#1A202C",
      descriptionColor: "#4A5568",
      benefitTextColor: "#374151",
      benefitIconColor: "#10B981",
      imageStyle: "rounded",
      layoutAlternating: false,
    };
    const initialData = { ...defaultConfig, ...config };
    return {
      ...initialData,
      items: (initialData.items || []).map((item, idx) => ({
        ...defaultConfig.items[0], 
        ...item,
        id: item.id || `item_init_${idx}_${Date.now()}`,
        image: initializeImageState(item.image, defaultConfig.items[idx % defaultConfig.items.length]?.image?.originalUrl || "/assets/images/placeholder_rect_1.jpg"),
        benefits: Array.isArray(item.benefits) ? item.benefits : [],
        altText: item.altText || item.title || `Item Image ${idx + 1}`
      }))
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newItems = (config.items || []).map((propItem, idx) => {
          const localItem = prevLocal.items.find(li => li.id === propItem.id) || prevLocal.items[idx] || {};
          const newImageState = initializeImageState(propItem.image, localItem.image?.originalUrl);
          if (localItem.image?.file && localItem.image.url?.startsWith('blob:') && localItem.image.url !== newImageState.url) {
            URL.revokeObjectURL(localItem.image.url);
          }
          return {
            ...localItem, ...propItem, image: newImageState,
            title: !readOnly && localItem.title !== (propItem.title || '') ? localItem.title : (propItem.title || localItem.title || ''),
            description: !readOnly && localItem.description !== (propItem.description || '') ? localItem.description : (propItem.description || localItem.description || ''),
            benefits: !readOnly && JSON.stringify(localItem.benefits) !== JSON.stringify(propItem.benefits || []) ? localItem.benefits : (propItem.benefits || localItem.benefits || []),
            altText: !readOnly && localItem.altText !== (propItem.altText || '') ? localItem.altText : (propItem.altText || localItem.altText || propItem.title || ''),
          };
        });
        return { ...prevLocal, ...config, items: newItems };
      });
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && typeof onConfigChange === 'function') {
      const dataToSave = { ...localConfig, items: localConfig.items.map(item => ({ ...item, image: item.image?.file ? { ...item.image } : { url: item.image?.originalUrl || item.image?.url, name: item.image?.name } })) };
      onConfigChange(dataToSave);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    const cleanup = () => localConfig.items.forEach(item => { if (item.image?.file && item.image.url?.startsWith('blob:')) URL.revokeObjectURL(item.image.url); });
    return cleanup;
  }, [localConfig.items]); 

  const handleInlineChange = (field, value, itemIndex = null, itemSubField = null, benefitIndex = null) => {
    if (readOnly) return;
    setLocalConfig(prev => {
      if (field === 'items' && itemIndex !== null) {
        const newItems = [...prev.items];
        if (newItems[itemIndex]) {
          if (itemSubField === 'benefits' && benefitIndex !== null) {
            const newBenefits = [...(newItems[itemIndex].benefits || [])];
            newBenefits[benefitIndex] = value;
            newItems[itemIndex] = { ...newItems[itemIndex], benefits: newBenefits };
          } else if (itemSubField === 'addBenefit') {
            newItems[itemIndex] = { ...newItems[itemIndex], benefits: [...(newItems[itemIndex].benefits || []), value] };
          } else if (itemSubField === 'removeBenefit' && benefitIndex !== null) {
            newItems[itemIndex] = { ...newItems[itemIndex], benefits: (newItems[itemIndex].benefits || []).filter((_, bIdx) => bIdx !== benefitIndex) };
          } else if (itemSubField) {
            newItems[itemIndex] = { ...newItems[itemIndex], [itemSubField]: value };
          }
        }
        return { ...prev, items: newItems };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  return (
    <NumberedImageTextPreview 
        config={localConfig} 
        readOnly={readOnly} 
        onInlineChange={handleInlineChange} 
        getDisplayUrl={getDisplayUrlFromProp} 
    />
  );
}

NumberedImageTextBlock.propTypes = {
  config: PropTypes.shape({
    sectionTitle: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      altText: PropTypes.string,
      description: PropTypes.string,
      benefits: PropTypes.arrayOf(PropTypes.string),
    })),
    defaultImage: PropTypes.string,
    titleColor: PropTypes.string,
    descriptionColor: PropTypes.string,
    benefitTextColor: PropTypes.string,
    benefitIconColor: PropTypes.string,
    imageStyle: PropTypes.oneOf(["rounded", "circle", "none"]),
    layoutAlternating: PropTypes.bool,
    // itemBackgroundColor: PropTypes.string, // Not used in preview
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

NumberedImageTextBlock.tabsConfig = (currentConfig, onPanelChange, themeColors) => {
  const { items = [], defaultImage, titleColor, descriptionColor, imageStyle, layoutAlternating, benefitTextColor, benefitIconColor } = currentConfig;

  const handlePanelConfigChange = (field, value) => {
    onPanelChange({ ...currentConfig, [field]: value });
  };

  const handleItemTextChangeInPanel = (itemIndex, field, value) => {
    const newItems = items.map((item, i) => (i === itemIndex ? { ...item, [field]: value } : item));
    onPanelChange({ ...currentConfig, items: newItems });
  };
  
  const handleBenefitChangeInPanel = (itemIndex, benefitIdx, value) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        const newBenefits = (item.benefits || []).map((ben, bIdx) => bIdx === benefitIdx ? value : ben);
        return { ...item, benefits: newBenefits };
      }
      return item;
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const addItemToPanel = () => {
    const newItem = {
      id: `item_panel_${Date.now()}`,
      title: "New Step",
      image: initializeImageState(null, currentConfig.defaultImage || '/assets/images/placeholder_rect_1.jpg'),
      altText: "New step image",
      description: "Description for the new step.",
      benefits: ["Benefit 1"]
    };
    onPanelChange({ ...currentConfig, items: [...items, newItem] });
  };

  const removeItemFromPanel = (index) => {
    const itemToRemove = items[index];
    if (itemToRemove?.image?.file && itemToRemove.image.url?.startsWith('blob:')){
      URL.revokeObjectURL(itemToRemove.image.url);
    }
    const newItems = items.filter((_, i) => i !== index);
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const addBenefitInPanel = (itemIndex) => {
    const newItems = items.map((item, i) => i === itemIndex ? { ...item, benefits: [...(item.benefits || []), "New Benefit"] } : item);
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const removeBenefitInPanel = (itemIndex, benefitIndex) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        const newBenefits = (item.benefits || []).filter((_, bIdx) => bIdx !== benefitIndex);
        return { ...item, benefits: newBenefits };
      }
      return item;
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const imagesForController = items.map((item, index) => ({
    ...(item.image || initializeImageState(null, currentConfig.defaultImage || '/assets/images/placeholder_rect_1.jpg')),
    id: item.id || `numbered_item_img_${index}`,
    name: item.title || `Step ${index + 1} Image`,
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

  const colorPickerProps = (label, fieldName, defaultVal) => ({
    label,
    fieldName,
    currentColorValue: currentConfig[fieldName] || defaultVal,
    onColorChange: (name, value) => handlePanelConfigChange(name, value),
    themeColors
  });

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-2">Manage Items</h4>
        <p className="text-xs text-gray-500">Item titles, descriptions, and benefit text are editable directly on the block preview above.</p>
        {(items || []).map((item, idx) => (
          <div key={item.id || idx} className="p-3 bg-gray-50 rounded-md mb-2 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 font-medium">{idx + 1}. {item.title || '(Untitled Step)'}</span>
              <button onClick={() => removeItemFromPanel(idx)} className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-100 rounded-full">✕ Remove</button>
            </div>
            <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600">Alt Text for Image:</label>
                <input type="text" value={item.altText || ""} onChange={(e) => handleItemTextChangeInPanel(idx, "altText", e.target.value)} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs" />
            </div>
            {/* Benefit management in panel if preferred over full inline */}
            {/* <div className="mt-2">
              <label className="block text-xs font-medium text-gray-600">Benefits:</label>
              {(item.benefits || []).map((ben, bIdx) => (
                <div key={bIdx} className="flex items-center mt-1">
                  <input type="text" value={ben} onChange={(e) => handleBenefitChangeInPanel(idx, bIdx, e.target.value)} className="flex-grow px-2 py-1 bg-white border border-gray-300 rounded-l-md sm:text-xs" />
                  <button onClick={() => removeBenefitInPanel(idx, bIdx)} className="bg-red-500 text-white px-2 py-1 rounded-r-md text-xs hover:bg-red-600">✕</button>
                </div>
              ))}
              <button onClick={() => addBenefitInPanel(idx)} className="mt-1 text-blue-600 hover:text-blue-800 text-xs font-medium">+ Add Benefit</button>
            </div> */}
          </div>
        ))}
        <button onClick={addItemToPanel} className="mt-3 w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:border-solid">+ Add Step</button>
      </div>
    ),
    images: () => (
      <div className="p-4 space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Default Fallback Image URL:</label>
            <input 
                type="text" 
                value={defaultImage || ''} 
                onChange={(e) => handlePanelConfigChange('defaultImage', e.target.value)} 
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="/assets/images/default.png"
            />
        </div>
        <PanelImagesController
            currentData={{ images: imagesForController }}
            onControlsChange={onImagesControllerChange}
            imageArrayFieldName="images"
            getItemName={(img) => img?.name || 'Step Image'}
            allowAdd={false} // Items added in general tab
            allowRemove={false} // Items removed in general tab
        />
      </div>
    ),
    colors: () => (
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Color Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeColorPicker {...colorPickerProps("Section Title Color", "titleColor", "#1A202C")} />
            <ThemeColorPicker {...colorPickerProps("Description Text Color", "descriptionColor", "#4A5568")} />
            <ThemeColorPicker {...colorPickerProps("Benefit Text Color", "benefitTextColor", "#374151")} />
            <ThemeColorPicker {...colorPickerProps("Benefit Icon Color", "benefitIconColor", "#10B981")} />
            {/* <ThemeColorPicker {...colorPickerProps("Item Background Color", "itemBackgroundColor", "#FFFFFF")} /> */}
        </div>
      </div>
    ),
    styling: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Layout & Style</h3>
        <div>
            <label className="block text-sm font-medium text-gray-700">Image Style:</label>
            <select 
                value={imageStyle || 'rounded'} 
                onChange={(e) => handlePanelConfigChange('imageStyle', e.target.value)} 
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option value="rounded">Rounded Rectangle</option>
                <option value="circle">Circle</option>
                <option value="none">None (Square)</option>
            </select>
        </div>
        <div>
            <label className="flex items-center text-sm font-medium text-gray-700">
                <input 
                    type="checkbox" 
                    checked={layoutAlternating || false} 
                    onChange={(e) => handlePanelConfigChange('layoutAlternating', e.target.checked)} 
                    className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                Alternate Layout (Image Left/Right)
            </label>
        </div>
      </div>
    )
  };
};

export default NumberedImageTextBlock; 