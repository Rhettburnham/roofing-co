import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import PanelImagesController from "../common/PanelImagesController"; // Assuming correct path
import ThemeColorPicker from "../common/ThemeColorPicker"; // Assuming correct path

/**
 * OptionSelectorBlock
 * 
 * config = {
 *   sectionTitle: "Explore Our Shingle Options",
 *   shingleOptions: [
 *     {
 *       title: string,
 *       description: string,
 *       benefit: string,
 *     },
 *     ...
 *   ]
 * }
 */

// Shared image state helpers
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
  if (getDisplayUrlProp && typeof getDisplayUrlProp === 'function') {
    const propUrl = getDisplayUrlProp(imageState);
    if (propUrl) return propUrl;
  }
  if (imageState && typeof imageState === 'object' && imageState.url) return imageState.url;
  if (typeof imageState === 'string' && imageState) {
    if (imageState.startsWith('/') || imageState.startsWith('blob:') || imageState.startsWith('data:')) return imageState;
    return imageState.startsWith('.') ? imageState : `/${imageState.replace(/^\/+/, "")}`;
  }
  return defaultPath;
};

// Reusable EditableField component
const EditableField = ({ value, onChange, placeholder, type = 'text', style = {}, className = '', rows = 1, isEditable = true }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (!isEditable || type !== 'textarea' || !inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [currentValue, isEditable, type]);

  const handleChange = (e) => { if (isEditable) setCurrentValue(e.target.value); };
  const handleBlur = () => { if (isEditable && value !== currentValue) onChange(currentValue); };
  const handleKeyDown = (e) => {
    if (!isEditable) return;
    if (type !== 'textarea' && e.key === 'Enter') { handleBlur(); e.preventDefault(); }
    else if (e.key === 'Escape') { setCurrentValue(value); inputRef.current?.blur(); }
  };

  if (!isEditable) {
    const Tag = type === 'textarea' ? 'div' : 'span';
    const displayValue = value || <span className="text-gray-400 italic">({placeholder})</span>;
    return <Tag className={`${className} ${type === 'textarea' ? 'whitespace-pre-wrap' : ''}`} style={style}>{displayValue}</Tag>;
  }
  const inputClasses = `bg-transparent border-b-2 border-dashed focus:border-gray-400/70 outline-none w-full ${className}`;
  if (type === 'textarea') {
    return <textarea ref={inputRef} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} rows={rows} />;
  }
  return <input ref={inputRef} type={type} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} />;
};

const OptionSelectorBlock = ({ config = {}, readOnly = false, onConfigChange, getDisplayUrl: getDisplayUrlFromProp }) => {
  const [localConfig, setLocalConfig] = useState(() => deriveInitialLocalData(config));
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const prevReadOnlyRef = useRef(readOnly);

  function deriveInitialLocalData(inputConfig) {
    const defaultConfig = {
      sectionTitle: "Choose Your Option",
      optionTypes: [
        { id: `type_default_1_${Date.now()}`, name: "Architectural", description: "High-quality, dimensional options.", imageUrl: initializeImageState(null, "/assets/images/shingles/architectural.jpg"), colors: [
            { id: `color_default_1_1_${Date.now()}`, name: "Weathered Wood", colorHex: "#8B735L", imageUrl: initializeImageState(null, "/assets/images/shingles/arch_weathered.jpg") },
            { id: `color_default_1_2_${Date.now()}`, name: "Charcoal Black", colorHex: "#36454F", imageUrl: initializeImageState(null, "/assets/images/shingles/arch_charcoal.jpg") },
        ]},
        { id: `type_default_2_${Date.now()}`, name: "Standard", description: "Traditional, affordable options.", imageUrl: initializeImageState(null, "/assets/images/shingles/3tab.jpg"), colors: [
            { id: `color_default_2_1_${Date.now()}`, name: "Desert Tan", colorHex: "#C19A6B", imageUrl: initializeImageState(null, "/assets/images/shingles/3tab_desert.jpg") },
            { id: `color_default_2_2_${Date.now()}`, name: "Estate Gray", colorHex: "#848482", imageUrl: initializeImageState(null, "/assets/images/shingles/3tab_gray.jpg") },
        ]}
      ],
      titleColor: "#1A202C", descriptionColor: "#4A5568", selectedTypeBorderColor: "#3182CE",
      selectedColorBorderColor: "#DD6B20", cardBackgroundColor: "#FFFFFF", imageBorderRadius: "0.5rem",
    };
    const initialData = { ...defaultConfig, ...inputConfig };
    return {
      ...initialData,
      optionTypes: (initialData.optionTypes || []).map((type, typeIdx) => ({
        ...defaultConfig.optionTypes[0], ...type, id: type.id || `type_init_${typeIdx}_${Date.now()}`,
        imageUrl: initializeImageState(type.imageUrl, defaultConfig.optionTypes[typeIdx % defaultConfig.optionTypes.length]?.imageUrl?.originalUrl || "/assets/images/shingles/placeholder_type.jpg"),
        colors: (type.colors || defaultConfig.optionTypes[0].colors).map((color, colorIdx) => ({
          ...defaultConfig.optionTypes[0].colors[0], ...color, id: color.id || `color_init_${typeIdx}_${colorIdx}_${Date.now()}`,
          imageUrl: initializeImageState(color.imageUrl, defaultConfig.optionTypes[typeIdx % defaultConfig.optionTypes.length]?.colors[colorIdx % defaultConfig.optionTypes[0].colors.length]?.imageUrl?.originalUrl || "/assets/images/shingles/placeholder_color.jpg"),
        }))
      }))
    };
  }

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => deriveInitialLocalData(config));
    }
  }, [config]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && typeof onConfigChange === 'function') {
      const dataToSave = {
        ...localConfig,
        optionTypes: localConfig.optionTypes.map(type => ({
          ...type,
          imageUrl: type.imageUrl?.file ? { ...type.imageUrl } : { url: type.imageUrl?.originalUrl || type.imageUrl?.url, name: type.imageUrl?.name },
          colors: type.colors.map(color => ({
            ...color,
            imageUrl: color.imageUrl?.file ? { ...color.imageUrl } : { url: color.imageUrl?.originalUrl || color.imageUrl?.url, name: color.imageUrl?.name },
          })),
        })),
      };
      onConfigChange(dataToSave);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    const cleanup = () => {
      (localConfig.optionTypes || []).forEach(type => {
        if (type.imageUrl?.file && type.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(type.imageUrl.url);
        (type.colors || []).forEach(color => {
          if (color.imageUrl?.file && color.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(color.imageUrl.url);
        });
      });
    };
    return cleanup;
  }, [localConfig.optionTypes]);

  const handleInlineChange = (path, value) => {
    if (readOnly) return;
    const keys = path.split('.'); // e.g., ['sectionTitle'] or ['optionTypes', typeId, 'name'] or ['optionTypes', typeId, 'colors', colorId, 'name']
    setLocalConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev)); // Deep clone for safety
      let currentLevel = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (Array.isArray(currentLevel)) { // Handle array paths (optionTypes, colors)
          const idOrIndex = keys[i+1]; // Next key is ID or index for array element
          const arr = currentLevel;
          const itemIndex = arr.findIndex(item => item.id === idOrIndex || String(item.indexFallbackForPanel) === idOrIndex ); // indexFallback for panel usage
          if (itemIndex > -1) {
            currentLevel = arr[itemIndex];
            i++; // Skip the ID/index key in the next iteration
          } else {
            console.warn(`Could not find item with id/index ${idOrIndex} in array ${key}`);
            return prev; // No change if path is invalid
          }
        } else {
          currentLevel = currentLevel[key];
        }
        if (!currentLevel) {
          console.warn(`Invalid path component ${key} in path ${path}`);
          return prev; // No change
        }
      }
      if (Array.isArray(currentLevel) && keys.length > 1 && keys[keys.length -2] === 'colors' ) { // Special case for colorHex which is directly on color object
          const colorId = keys[keys.length-1];
          const colorIndex = currentLevel.findIndex(c => c.id === colorId);
          if(colorIndex > -1) currentLevel[colorIndex][keys[keys.length-1]] = value;
          else console.warn('Color not found for hex update');
      } else {
           currentLevel[keys[keys.length - 1]] = value;
      }
      return newConfig;
    });
  };
  
  const currentOptionType = localConfig.optionTypes?.[selectedTypeIndex];
  const currentOptionColor = currentOptionType?.colors?.[selectedColorIndex];
  const mainDisplayImageUrl = currentOptionColor?.imageUrl || currentOptionType?.imageUrl;
  const mainDisplayUrlToUse = getEffectiveDisplayUrl(mainDisplayImageUrl, getDisplayUrlFromProp, "/assets/images/shingles/placeholder_type.jpg");

  return (
    <div className="option-selector-block py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <EditableField 
          value={localConfig.sectionTitle} 
          onChange={(val) => handleInlineChange("sectionTitle", val)} 
          placeholder="Section Title" 
          style={{ color: localConfig.titleColor }} 
          className="text-3xl md:text-4xl font-bold text-center mb-8" 
          isEditable={!readOnly} 
        />
        <div className={`flex flex-col gap-8 ${localConfig.layout === 'horizontal-split' ? 'lg:flex-row' : ''}`}>
          <div className={`flex justify-center items-center p-4 border rounded-lg shadow-lg min-h-[300px] md:min-h-[400px] ${localConfig.layout === 'horizontal-split' ? 'lg:w-1/2' : 'w-full'}`} style={{ backgroundColor: localConfig.cardBackgroundColor }}>
            {mainDisplayUrlToUse ? (
              <img src={mainDisplayUrlToUse} alt={currentOptionColor?.name || currentOptionType?.name || "Selected Option"} className="max-h-[300px] md:max-h-[400px] w-auto object-contain rounded-md" style={{borderRadius: localConfig.imageBorderRadius}} />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-md">Select an option to view image</div>
            )}
          </div>

          <div className={`${localConfig.layout === 'horizontal-split' ? 'lg:w-1/2' : 'w-full'}`}>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: localConfig.titleColor }}>Select Option Type:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(localConfig.optionTypes || []).map((type, index) => {
                  const typeImgUrl = getEffectiveDisplayUrl(type.imageUrl, getDisplayUrlFromProp, "/assets/images/shingles/placeholder_type.jpg");
                  return (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedTypeIndex(index); setSelectedColorIndex(0); }}
                      className={`p-3 border rounded-lg text-center transition-all ${selectedTypeIndex === index ? "shadow-md scale-105 ring-2" : "hover:shadow-md"}`}
                      style={{ borderColor: selectedTypeIndex === index ? localConfig.selectedTypeBorderColor : "#E2E8F0", backgroundColor: localConfig.cardBackgroundColor, ringColor: localConfig.selectedTypeBorderColor }}
                    >
                      {typeImgUrl && <img src={typeImgUrl} alt={type.name} className="w-full h-20 object-cover rounded mb-2" style={{borderRadius: localConfig.imageBorderRadius}} />}
                      {!typeImgUrl && (
                        <div className="w-full h-20 mb-2 flex items-center justify-center border-2 border-dashed border-gray-300 rounded text-xs text-gray-400" style={{borderRadius: localConfig.imageBorderRadius}}>
                           {readOnly ? 'No Image' : 'Set Type Image in Panel'}
                        </div>
                      )}
                      <EditableField 
                        value={type.name} 
                        onChange={(val) => handleInlineChange(`optionTypes.${type.id}.name`, val)} 
                        placeholder="Type Name" 
                        style={{ color: localConfig.descriptionColor}} 
                        className="font-medium text-sm text-center block truncate" 
                        isEditable={!readOnly} 
                      />
                      <EditableField 
                        value={type.description} 
                        onChange={(val) => handleInlineChange(`optionTypes.${type.id}.description`, val)} 
                        placeholder="Description" 
                        style={{color: localConfig.descriptionColor}} 
                        className="text-xs text-center mt-1 truncate" 
                        type="textarea" 
                        rows={2} 
                        isEditable={!readOnly} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {currentOptionType && (
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: localConfig.titleColor }}>Select Color for {currentOptionType.name}:</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-3 items-center">
                  {(currentOptionType.colors || []).map((color, colorIdx) => {
                     const colorImgUrl = getEffectiveDisplayUrl(color.imageUrl, getDisplayUrlFromProp);
                     return (
                      <div key={color.id} className={`flex items-center gap-2 p-1 border-2 rounded-lg ${selectedColorIndex === colorIdx ? "ring-2 ring-offset-1" : ""}`} style={{borderColor: selectedColorIndex === colorIdx ? localConfig.selectedColorBorderColor : 'transparent', ringColor: localConfig.selectedColorBorderColor}}>
                        <button
                          onClick={() => setSelectedColorIndex(colorIdx)}
                          className={`w-10 h-10 rounded-md focus:outline-none transition-all bg-center bg-cover border`}
                          style={{ 
                              backgroundColor: colorImgUrl ? 'transparent' : (color.colorHex || "#E2E8F0"), 
                              backgroundImage: colorImgUrl ? `url(${colorImgUrl})` : 'none',
                              borderColor: selectedColorIndex === colorIdx ? localConfig.selectedColorBorderColor : (color.colorHex || '#D1D5DB')
                          }}
                          title={color.name}
                        >
                         {!colorImgUrl && <span className={`text-[8px] ${color.colorHex && (parseInt(color.colorHex.substring(1,3),16)*0.299 + parseInt(color.colorHex.substring(3,5),16)*0.587 + parseInt(color.colorHex.substring(5,7),16)*0.114 > 186 ? 'text-gray-700' : 'text-white')}`}>Set Img</span>}
                        </button>
                        <EditableField 
                            value={color.name} 
                            onChange={(val) => handleInlineChange(`optionTypes.${currentOptionType.id}.colors.${color.id}.name`, val)} 
                            placeholder="Color Name" 
                            style={{color: localConfig.descriptionColor}} 
                            className="text-xs w-20 truncate" 
                            isEditable={!readOnly} 
                        />
                        {!readOnly && 
                          <input 
                            type="color" 
                            value={color.colorHex || "#000000"} 
                            onChange={(e) => handleInlineChange(`optionTypes.${currentOptionType.id}.colors.${color.id}.colorHex`, e.target.value)} 
                            className="w-6 h-6 rounded-sm cursor-pointer border-none p-0 block" 
                            title="Change hex color" 
                            onClick={(e) => e.stopPropagation()} 
                          />
                        }
                      </div>
                     );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

OptionSelectorBlock.propTypes = {
  config: PropTypes.shape({
    sectionTitle: PropTypes.string,
    optionTypes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      description: PropTypes.string,
      imageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      colors: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        colorHex: PropTypes.string,
        imageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      })),
    })),
    layout: PropTypes.oneOf(['default', 'horizontal-split']),
    titleColor: PropTypes.string,
    descriptionColor: PropTypes.string,
    selectedTypeBorderColor: PropTypes.string,
    selectedColorBorderColor: PropTypes.string,
    cardBackgroundColor: PropTypes.string,
    imageBorderRadius: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

OptionSelectorBlock.tabsConfig = (currentConfig, onPanelChange, themeColors) => {
  const { optionTypes = [], titleColor, descriptionColor, selectedTypeBorderColor, selectedColorBorderColor, cardBackgroundColor, imageBorderRadius, layout = 'default' } = currentConfig;

  const handlePanelListManagement = (listPath, action, index = null, subIndex = null, value = null) => {
    const keys = listPath.split('.');
    let currentLevel = { ...currentConfig };
    let targetArrayParent = null;
    let targetArrayKey = null;
    let targetItem = null;

    for(let i=0; i < keys.length; i++){
        const key = keys[i];
        if(Array.isArray(currentLevel[key])){
            targetArrayParent = currentLevel;
            targetArrayKey = key;
            if (keys[i+1] !== undefined && keys[i+1] !== '[]') { // Expecting an ID next for an item in array
                const itemId = keys[i+1];
                const itemIdx = currentLevel[key].findIndex(it => it.id === itemId);
                if(itemIdx > -1){
                    currentLevel = currentLevel[key][itemIdx];
                    i++; // Consumed item ID
                } else {
                    console.warn('Item not found by ID in path', listPath, itemId);
                    return;
                }
            } else {
                break; // Reached the target array itself
            }
        } else if (i < keys.length -1 ) { // Navigating through object properties
            currentLevel = currentLevel[key];
            if(!currentLevel) { console.warn('Invalid path', listPath); return; }
        } else { // Last key is the property to update on an object
             targetArrayParent = currentLevel; targetArrayKey = key; break; 
        }
    }
    
    let finalArray = targetArrayParent ? [...(targetArrayParent[targetArrayKey] || [])] : [];

    if (action === 'add') {
      if (listPath === 'optionTypes') {
        finalArray.push({ id: `type_panel_${Date.now()}`, name: "New Type", description: "Description", imageUrl: initializeImageState(null), colors: [] });
      } else if (listPath.endsWith('.colors')) { // Adding a color to a type
        finalArray.push({ id: `color_panel_${Date.now()}`, name: "New Color", colorHex: "#ffffff", imageUrl: initializeImageState(null) });
      }
    } else if (action === 'remove' && index !== null) {
      const itemToRemove = finalArray[index];
      if(itemToRemove?.imageUrl?.file && itemToRemove.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(itemToRemove.imageUrl.url);
      if(itemToRemove?.colors) { // If removing a type, clean up its color images too
          itemToRemove.colors.forEach(color => {
              if(color?.imageUrl?.file && color.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(color.imageUrl.url);
          });
      }
      finalArray.splice(index, 1);
    } else if (action === 'updateField' && index !== null && subIndex !== null) { // subIndex here is actually the field name for the item
        if(finalArray[index]) finalArray[index] = {...finalArray[index], [subIndex]: value };
    }
    
    // Reconstruct the path to update the config
    let updateAtPath = { ...currentConfig };
    let currentUpdateLevel = updateAtPath;
    for(let i=0; i < keys.length -1; i++){
        const key = keys[i];
        if (Array.isArray(currentUpdateLevel[key]) && keys[i+1] !== undefined && keys[i+1] !== '[]'){
            const itemId = keys[i+1];
            const itemIdx = currentUpdateLevel[key].findIndex(it => it.id === itemId);
            if (itemIdx > -1) { currentUpdateLevel = currentUpdateLevel[key][itemIdx]; i++; }
            else { console.warn('Cannot find item for update path'); return; }
        } else {
            currentUpdateLevel = currentUpdateLevel[key];
        }
    }
    if(targetArrayKey) currentUpdateLevel[targetArrayKey] = finalArray;
    else updateAtPath[keys[0]] = finalArray; // For top-level arrays like optionTypes itself

    onPanelChange(updateAtPath);
  };

  const handleImageUploadOrURL = (listPath, itemIdentifier, imageProperty, fileOrUrl) => {
    let newItems = JSON.parse(JSON.stringify(currentConfig[listPath] || []));
    const itemIndex = newItems.findIndex(item => item.id === itemIdentifier);

    if (itemIndex !== -1) {
        const currentImageState = newItems[itemIndex][imageProperty];
        if (currentImageState?.file && currentImageState.url?.startsWith('blob:')) {
            URL.revokeObjectURL(currentImageState.url);
        }
        if (fileOrUrl instanceof File) {
            newItems[itemIndex][imageProperty] = {
                file: fileOrUrl,
                url: URL.createObjectURL(fileOrUrl),
                name: fileOrUrl.name,
                originalUrl: currentImageState?.originalUrl || ''
            };
        } else if (typeof fileOrUrl === 'string') {
            newItems[itemIndex][imageProperty] = {
                file: null,
                url: fileOrUrl,
                name: fileOrUrl.split('/').pop(),
                originalUrl: fileOrUrl
            };
        }
        onPanelChange({ ...currentConfig, [listPath]: newItems });
    }
  };

  const colorPickerProps = (label, fieldName, defaultColor) => ({
    label,
    fieldName,
    currentColorValue: currentConfig[fieldName] || defaultColor,
    onColorChange: (name, value) => onPanelChange({ ...currentConfig, [name]: value }),
    themeColors,
  });

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-2">Manage Option Types & Colors</h4>
        <p className="text-xs text-gray-500 mb-3">Section Title, Type Names/Descriptions, and Color Names/Hex are editable directly on the block preview.</p>
        <button onClick={() => handlePanelListManagement('optionTypes', 'add')} className="w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:border-solid">+ Add Option Type</button>
        {(optionTypes || []).map((type, typeIdx) => (
          <div key={type.id || typeIdx} className="p-3 bg-gray-50 rounded-md mb-3 shadow-sm border border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-800 font-medium">Type: {type.name || '(Untitled Type)'}</span>
              <button onClick={() => handlePanelListManagement('optionTypes', 'remove', typeIdx)} className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-100 rounded-full">✕ Remove Type</button>
            </div>
            <div className="pl-3 border-l-2 border-gray-200 ml-1">
              <h5 className="text-xs font-semibold text-gray-600 mb-1.5">Colors for {type.name || 'Type'}:</h5>
              <button onClick={() => handlePanelListManagement(`optionTypes.${type.id}.colors`, 'add')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md shadow mb-2">+ Add Color to this Type</button>
              {(type.colors || []).map((color, colorIdx) => (
                <div key={color.id || colorIdx} className="flex justify-between items-center p-1.5 bg-white rounded shadow-xs mb-1 border">
                  <span className="text-xs text-gray-700 truncate w-2/3">Color: {color.name || '(Untitled)'} (Hex: {color.colorHex || 'N/A'})</span>
                  <button onClick={() => handlePanelListManagement(`optionTypes.${type.id}.colors`, 'remove', colorIdx)} className="text-[10px] text-red-500 hover:text-red-700 font-semibold p-0.5 hover:bg-red-50 rounded-full">✕ Remove</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
    images: () => (
      <div className="p-4 space-y-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Manage Images</h3>
        {(optionTypes || []).map((type, typeIdx) => (
          <div key={`type_img_${type.id || typeIdx}`} className="p-3 bg-gray-100 rounded-md shadow-sm border">
            <h4 className="text-md font-medium text-gray-800 mb-2">Images for Type: {type.name || '(Untitled Type)'}</h4>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Type Image (Overall):</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUploadOrURL('optionTypes', type.id, 'imageUrl', e.target.files?.[0])} className="block w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600" />
              <input type="text" placeholder="Or paste Type Image URL" value={getEffectiveDisplayUrl(type.imageUrl, null, '')} onChange={(e) => handleImageUploadOrURL('optionTypes', type.id, 'imageUrl', e.target.value)} className="mt-1 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs" />
              {getEffectiveDisplayUrl(type.imageUrl) && <img src={getEffectiveDisplayUrl(type.imageUrl)} alt={`${type.name} preview`} className="mt-2 h-20 w-auto object-contain rounded border p-0.5 bg-white"/>}
            </div>
            {(type.colors || []).length > 0 && <h5 className="text-sm font-semibold text-gray-700 mt-3 mb-1.5 border-t pt-2">Color Swatch Images:</h5>}
            {(type.colors || []).map((color, colorIdx) => (
              <div key={`color_img_${color.id || colorIdx}`} className="pl-3 border-l-2 border-gray-200 ml-1 mb-2 py-2 bg-white rounded-r-md">
                <label className="block text-xs font-medium text-gray-600 mb-1">Image for Color: {color.name || '(Untitled Color)'}</label>
                <input type="file" accept="image/*" onChange={(e) => {
                    let pathForColorImage = `optionTypes.${type.id}.colors`; // Construct path dynamically
                    handleImageUploadOrURL(pathForColorImage, color.id, 'imageUrl', e.target.files?.[0]);
                }} className="block w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600" />
                <input type="text" placeholder="Or paste Color Image URL" value={getEffectiveDisplayUrl(color.imageUrl, null, '')} onChange={(e) => {
                    let pathForColorImage = `optionTypes.${type.id}.colors`;
                    handleImageUploadOrURL(pathForColorImage, color.id, 'imageUrl', e.target.value);
                }} className="mt-1 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs" />
                {getEffectiveDisplayUrl(color.imageUrl) && <img src={getEffectiveDisplayUrl(color.imageUrl)} alt={`${color.name} swatch preview`} className="mt-2 h-16 w-16 object-cover rounded border p-0.5 bg-gray-50"/>}
              </div>
            ))}
          </div>
        ))}
        {optionTypes.length === 0 && <p className="text-center text-sm text-gray-500">Add Option Types in the 'General' tab to manage their images.</p>}
      </div>
    ),
    colors: () => (
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Color Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThemeColorPicker {...colorPickerProps("Section Title Color", "titleColor", "#1A202C")} />
          <ThemeColorPicker {...colorPickerProps("Description/Text Color", "descriptionColor", "#4A5568")} />
          <ThemeColorPicker {...colorPickerProps("Selected Type Border", "selectedTypeBorderColor", "#3182CE")} />
          <ThemeColorPicker {...colorPickerProps("Selected Color Border", "selectedColorBorderColor", "#DD6B20")} />
          <ThemeColorPicker {...colorPickerProps("Card Background Color", "cardBackgroundColor", "#FFFFFF")} />
        </div>
      </div>
    ),
    styling: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Layout & Image Style</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">Layout Style:</label>
          <select 
            value={layout} 
            onChange={(e) => onPanelChange({ ...currentConfig, layout: e.target.value})} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="default">Default (Main Image Top)</option>
            <option value="horizontal-split">Horizontal Split (Image Left, Options Right on Desktop)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image Border Radius (e.g., 0.5rem, 8px):</label>
          <input 
            type="text" 
            value={imageBorderRadius || '0.5rem'} 
            onChange={(e) => onPanelChange({ ...currentConfig, imageBorderRadius: e.target.value})} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., 0.5rem or 8px"
          />
        </div>
      </div>
    )
  };
};

export default OptionSelectorBlock; 