import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

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
  let nameToStore = defaultPath.split('/').pop();
  let originalUrlToStore = defaultPath;

  if (imageValue && typeof imageValue === 'object') {
    urlToDisplay = imageValue.url || defaultPath;
    nameToStore = imageValue.name || urlToDisplay.split('/').pop();
    fileObject = imageValue.file || null;
    originalUrlToStore = imageValue.originalUrl || (typeof imageValue.url === 'string' && !imageValue.url.startsWith('blob:') ? imageValue.url : defaultPath);
  } else if (typeof imageValue === 'string') {
    urlToDisplay = imageValue;
    nameToStore = imageValue.split('/').pop();
    originalUrlToStore = imageValue;
  }
  return { file: fileObject, url: urlToDisplay, name: nameToStore, originalUrl: originalUrlToStore };
};

const getEffectiveDisplayUrl = (imageState, getDisplayUrlProp) => {
  if (getDisplayUrlProp && imageState) return getDisplayUrlProp(imageState);
  if (imageState && typeof imageState === 'object' && imageState.url) return imageState.url;
  if (typeof imageState === 'string') {
    if (imageState.startsWith('/') || imageState.startsWith('blob:') || imageState.startsWith('data:')) return imageState;
    return imageState.startsWith('.') ? imageState : `/${imageState.replace(/^\/*/, "")}`;
  }
  return '';
};

const OptionSelectorBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
  getDisplayUrl,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      sectionTitle: "Choose Your Option",
      optionTypes: [
        {
          id: `type_${Date.now()}_1`,
          name: "Architectural",
          description: "High-quality, dimensional options.",
          imageUrl: initializeImageState(null, "/assets/images/shingles/architectural.jpg"),
          colors: [
            { id: `color_${Date.now()}_1_1`, name: "Weathered Wood", colorHex: "#8B735L", imageUrl: initializeImageState(null, "/assets/images/shingles/arch_weathered.jpg") },
            { id: `color_${Date.now()}_1_2`, name: "Charcoal Black", colorHex: "#36454F", imageUrl: initializeImageState(null, "/assets/images/shingles/arch_charcoal.jpg") },
          ]
        },
        {
          id: `type_${Date.now()}_2`,
          name: "Standard",
          description: "Traditional, affordable options.",
          imageUrl: initializeImageState(null, "/assets/images/shingles/3tab.jpg"),
          colors: [
            { id: `color_${Date.now()}_2_1`, name: "Desert Tan", colorHex: "#C19A6B", imageUrl: initializeImageState(null, "/assets/images/shingles/3tab_desert.jpg") },
            { id: `color_${Date.now()}_2_2`, name: "Estate Gray", colorHex: "#848482", imageUrl: initializeImageState(null, "/assets/images/shingles/3tab_gray.jpg") },
          ]
        }
      ],
      titleColor: "#1A202C",
      descriptionColor: "#4A5568",
      selectedTypeBorderColor: "#3182CE",
      selectedColorBorderColor: "#DD6B20",
      cardBackgroundColor: "#FFFFFF",
    };
    const initialData = config || {};
    const initializedTypes = (initialData.optionTypes || defaultConfig.optionTypes).map((type, typeIdx) => ({
      ...defaultConfig.optionTypes[0],
      ...type,
      id: type.id || `type_init_${typeIdx}_${Date.now()}`,
      imageUrl: initializeImageState(type.imageUrl, defaultConfig.optionTypes[typeIdx % defaultConfig.optionTypes.length]?.imageUrl?.originalUrl || "/assets/images/shingles/placeholder_type.jpg"),
      colors: (type.colors || defaultConfig.optionTypes[0].colors).map((color, colorIdx) => ({
        ...defaultConfig.optionTypes[0].colors[0],
        ...color,
        id: color.id || `color_init_${typeIdx}_${colorIdx}_${Date.now()}`,
        imageUrl: initializeImageState(color.imageUrl, defaultConfig.optionTypes[typeIdx % defaultConfig.optionTypes.length]?.colors[colorIdx % defaultConfig.optionTypes[0].colors.length]?.imageUrl?.originalUrl || "/assets/images/shingles/placeholder_color.jpg"),
      }))
    }));
    return { ...defaultConfig, ...initialData, optionTypes: initializedTypes };
  });

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newTypes = (config.optionTypes || []).map((propType, typeIdx) => {
          const localType = prevLocal.optionTypes.find(lt => lt.id === propType.id) || prevLocal.optionTypes[typeIdx] || { colors: [] };
          const newTypeImageUrl = initializeImageState(propType.imageUrl, localType.imageUrl?.originalUrl);
          if (localType.imageUrl?.file && localType.imageUrl.url?.startsWith('blob:') && localType.imageUrl.url !== newTypeImageUrl.url) {
            URL.revokeObjectURL(localType.imageUrl.url);
          }

          const newColors = (propType.colors || []).map((propColor, colorIdx) => {
            const localColor = (localType.colors || []).find(lc => lc.id === propColor.id) || (localType.colors || [])[colorIdx] || {};
            const newColorImageUrl = initializeImageState(propColor.imageUrl, localColor.imageUrl?.originalUrl);
            if (localColor.imageUrl?.file && localColor.imageUrl.url?.startsWith('blob:') && localColor.imageUrl.url !== newColorImageUrl.url) {
              URL.revokeObjectURL(localColor.imageUrl.url);
            }
            return {
              ...localColor, ...propColor, id: propColor.id || localColor.id || `color_prop_${typeIdx}_${colorIdx}_${Date.now()}`,
              imageUrl: newColorImageUrl,
              name: readOnly ? (propColor.name ?? localColor.name) : localColor.name,
              colorHex: readOnly ? (propColor.colorHex ?? localColor.colorHex) : localColor.colorHex,
            };
          });
          return {
            ...localType, ...propType, id: propType.id || localType.id || `type_prop_${typeIdx}_${Date.now()}`,
            imageUrl: newTypeImageUrl,
            name: readOnly ? (propType.name ?? localType.name) : localType.name,
            description: readOnly ? (propType.description ?? localType.description) : localType.description,
            colors: newColors,
          };
        });
        return { 
            ...prevLocal, 
            ...config, 
            sectionTitle: readOnly ? (config.sectionTitle ?? prevLocal.sectionTitle) : prevLocal.sectionTitle,
            optionTypes: newTypes
        };
      });
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && onConfigChange) {
      const dataToSave = {
        ...localConfig,
        optionTypes: localConfig.optionTypes.map(type => ({
          ...type,
          imageUrl: type.imageUrl?.file ? { ...type.imageUrl } : { url: type.imageUrl?.originalUrl || type.imageUrl?.url },
          colors: type.colors.map(color => ({
            ...color,
            imageUrl: color.imageUrl?.file ? { ...color.imageUrl } : { url: color.imageUrl?.originalUrl || color.imageUrl?.url },
          })),
        })),
      };
      onConfigChange(dataToSave);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    return () => {
      localConfig.optionTypes.forEach(type => {
        if (type.imageUrl?.file && type.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(type.imageUrl.url);
        type.colors.forEach(color => {
          if (color.imageUrl?.file && color.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(color.imageUrl.url);
        });
      });
    };
  }, [localConfig.optionTypes]);

  const handleLocalChange = (path, value) => {
    if (readOnly) return;
    const [field, typeId, itemField, colorId, colorItemField] = path.split('.');

    setLocalConfig(prev => {
      if (field === 'optionTypes' && typeId) {
        const newTypes = prev.optionTypes.map(type => {
          if (type.id === typeId) {
            if (itemField === 'colors' && colorId && colorItemField) {
              return {
                ...type,
                colors: type.colors.map(color => 
                  color.id === colorId ? { ...color, [colorItemField]: value } : color
                )
              };
            } else if (itemField) {
              return { ...type, [itemField]: value };
            }
          }
          return type;
        });
        return { ...prev, optionTypes: newTypes };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const handlePanelDataChange = (newData) => {
    if (readOnly) return;
    setLocalConfig(prevConfig => {
      const updatedConfig = { ...prevConfig, ...newData };
      if (newData.optionTypes) {
        updatedConfig.optionTypes = newData.optionTypes.map((panelType, typeIdx) => {
          const existingType = prevConfig.optionTypes.find(pt => pt.id === panelType.id) || prevConfig.optionTypes[typeIdx] || {};
          let typeImageState = existingType.imageUrl;

          if (panelType.imageUrl && typeof panelType.imageUrl === 'object' && panelType.imageUrl.file instanceof File) {
            if (existingType.imageUrl?.file && existingType.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(existingType.imageUrl.url);
            const blobUrl = URL.createObjectURL(panelType.imageUrl.file);
            typeImageState = { file: panelType.imageUrl.file, url: blobUrl, name: panelType.imageUrl.file.name, originalUrl: existingType.imageUrl?.originalUrl };
          } else if (typeof panelType.imageUrl === 'string') {
            if (existingType.imageUrl?.file && existingType.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(existingType.imageUrl.url);
            typeImageState = initializeImageState(panelType.imageUrl, existingType.imageUrl?.originalUrl);
          } else if (panelType.imageUrl && typeof panelType.imageUrl === 'object' && !panelType.imageUrl.file ) {
             typeImageState = initializeImageState(panelType.imageUrl, existingType.imageUrl?.originalUrl);
          }

          const panelColors = (panelType.colors || []).map((panelColor, colorIdx) => {
            const existingColor = (existingType.colors || []).find(ec => ec.id === panelColor.id) || (existingType.colors || [])[colorIdx] || {};
            let colorImageState = existingColor.imageUrl;
            if (panelColor.imageUrl && typeof panelColor.imageUrl === 'object' && panelColor.imageUrl.file instanceof File) {
              if (existingColor.imageUrl?.file && existingColor.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(existingColor.imageUrl.url);
              const blobUrl = URL.createObjectURL(panelColor.imageUrl.file);
              colorImageState = { file: panelColor.imageUrl.file, url: blobUrl, name: panelColor.imageUrl.file.name, originalUrl: existingColor.imageUrl?.originalUrl };
            } else if (typeof panelColor.imageUrl === 'string') {
              if (existingColor.imageUrl?.file && existingColor.imageUrl.url?.startsWith('blob:')) URL.revokeObjectURL(existingColor.imageUrl.url);
              colorImageState = initializeImageState(panelColor.imageUrl, existingColor.imageUrl?.originalUrl);
            } else if (panelColor.imageUrl && typeof panelColor.imageUrl === 'object' && !panelColor.imageUrl.file) {
               colorImageState = initializeImageState(panelColor.imageUrl, existingColor.imageUrl?.originalUrl);
            }
            return { ...existingColor, ...panelColor, imageUrl: colorImageState }; 
          });
          return { ...existingType, ...panelType, imageUrl: typeImageState, colors: panelColors };
        });
      }
      return updatedConfig;
    });
  };

  const currentOptionType = localConfig.optionTypes?.[selectedTypeIndex];
  const currentOptionColor = currentOptionType?.colors?.[selectedColorIndex];
  const mainDisplayImageUrl = currentOptionColor?.imageUrl || currentOptionType?.imageUrl;
  const mainDisplayUrlToUse = getEffectiveDisplayUrl(mainDisplayImageUrl, getDisplayUrl);

  const EditableField = ({ value, onChange, placeholder, type = 'text', style, className, rows }) => (
    type === 'textarea' ? 
    <textarea value={value} onChange={onChange} placeholder={placeholder} style={style} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} rows={rows} /> :
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={style} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} />
  );

  return (
    <>
      <div className="option-selector-block py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {readOnly ? (
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: localConfig.titleColor }}>{localConfig.sectionTitle}</h2>
          ) : (
            <EditableField value={localConfig.sectionTitle} onChange={(e) => handleLocalChange("sectionTitle", e.target.value)} placeholder="Section Title" style={{ color: localConfig.titleColor }} className="text-3xl md:text-4xl font-bold text-center mb-8" />
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2 flex justify-center items-center p-4 border rounded-lg shadow-lg min-h-[300px] md:min-h-[400px]" style={{ backgroundColor: localConfig.cardBackgroundColor }}>
              {mainDisplayUrlToUse ? (
                <img src={mainDisplayUrlToUse} alt={currentOptionColor?.name || currentOptionType?.name || "Selected Option"} className="max-h-[300px] md:max-h-[400px] w-auto object-contain rounded-md" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-md">No Image Selected</div>
              )}
            </div>

            <div className="lg:w-1/2">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: localConfig.titleColor }}>Select Option Type:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(localConfig.optionTypes || []).map((type, index) => {
                    const typeImgUrl = getEffectiveDisplayUrl(type.imageUrl, getDisplayUrl);
                    return (
                      <button
                        key={type.id}
                        onClick={() => { setSelectedTypeIndex(index); setSelectedColorIndex(0); }}
                        className={`p-3 border rounded-lg text-center transition-all ${selectedTypeIndex === index ? "shadow-md scale-105 ring-2" : "hover:shadow-md"}`}
                        style={{ borderColor: selectedTypeIndex === index ? localConfig.selectedTypeBorderColor : "#E2E8F0", backgroundColor: localConfig.cardBackgroundColor, ringColor: localConfig.selectedTypeBorderColor }}
                      >
                        {typeImgUrl && <img src={typeImgUrl} alt={type.name} className="w-full h-20 object-cover rounded mb-2" />}
                        {!typeImgUrl && !readOnly && <div className="w-full h-20 mb-2 flex items-center justify-center border-2 border-dashed border-gray-300 rounded text-xs text-gray-400">Set Type Image in Panel</div>}
                        {readOnly ? 
                          <span className="font-medium text-sm block truncate" style={{ color: localConfig.descriptionColor }}>{type.name}</span> : 
                          <EditableField value={type.name} onChange={(e) => handleLocalChange(`optionTypes.${type.id}.name`, e.target.value)} placeholder="Type Name" style={{ color: localConfig.descriptionColor}} className="font-medium text-sm text-center" />}
                        {readOnly ? 
                          <p className="text-xs mt-1 truncate" style={{color: localConfig.descriptionColor}}>{type.description}</p> : 
                          <EditableField value={type.description} onChange={(e) => handleLocalChange(`optionTypes.${type.id}.description`, e.target.value)} placeholder="Description" style={{color: localConfig.descriptionColor}} className="text-xs text-center mt-1" type="textarea" rows={2}/>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentOptionType && (
                <div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: localConfig.titleColor }}>Select Color for {currentOptionType.name}:</h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    {(currentOptionType.colors || []).map((color, colorIdx) => (
                      <div key={color.id} className={`flex items-center gap-2 p-1 border-2 rounded-lg ${selectedColorIndex === colorIdx ? "ring-2 ring-offset-1" : ""}`} style={{borderColor: selectedColorIndex === colorIdx ? localConfig.selectedColorBorderColor : 'transparent', ringColor: localConfig.selectedColorBorderColor}}>
                        <button
                          onClick={() => setSelectedColorIndex(colorIdx)}
                          className={`w-10 h-10 rounded-md focus:outline-none transition-all bg-center bg-cover border`}
                          style={{ backgroundColor: color.colorHex || "#E2E8F0", backgroundImage: getEffectiveDisplayUrl(color.imageUrl, getDisplayUrl) ? `url(${getEffectiveDisplayUrl(color.imageUrl, getDisplayUrl)})` : 'none', borderColor: selectedColorIndex === colorIdx ? localConfig.selectedColorBorderColor : (color.colorHex || '#D1D5DB')}}
                          title={color.name}
                        >
                         {!getEffectiveDisplayUrl(color.imageUrl, getDisplayUrl) && !readOnly && <span className="text-[8px] text-gray-600">Set Img</span>}
                        </button>
                        {readOnly ? <span className="text-xs truncate max-w-[80px]" style={{color: localConfig.descriptionColor}}>{color.name}</span> : 
                         <EditableField value={color.name} onChange={(e) => handleLocalChange(`optionTypes.${currentOptionType.id}.colors.${color.id}.name`, e.target.value)} placeholder="Color Name" style={{color: localConfig.descriptionColor}} className="text-xs w-20" />}
                        {!readOnly && <input type="color" value={color.colorHex || "#000000"} onChange={(e) => handleLocalChange(`optionTypes.${currentOptionType.id}.colors.${color.id}.colorHex`, e.target.value)} className="w-6 h-6 rounded-sm cursor-pointer border-none p-0 block" title="Change hex color"/>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {!readOnly && (
        <OptionSelectorBlock.EditorPanel
            currentConfig={localConfig} 
            onPanelConfigChange={handlePanelDataChange} 
            getDisplayUrl={(imgState) => getEffectiveDisplayUrl(imgState, getDisplayUrl)}
            selectedTypeIndex={selectedTypeIndex}
        />
      )}
    </>
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
    titleColor: PropTypes.string,
    descriptionColor: PropTypes.string,
    selectedTypeBorderColor: PropTypes.string,
    selectedColorBorderColor: PropTypes.string,
    cardBackgroundColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

OptionSelectorBlock.EditorPanel = ({ currentConfig, onPanelConfigChange, getDisplayUrl: getDisplayUrlForPanel, selectedTypeIndex }) => {
  const { optionTypes = [], titleColor, descriptionColor, selectedTypeBorderColor, selectedColorBorderColor, cardBackgroundColor } = currentConfig;

  const handleItemImageUpdate = (typeId, colorId, imageValue) => {
    const newTypes = optionTypes.map(type => {
      if (type.id === typeId) {
        if (colorId) {
          return {
            ...type,
            colors: type.colors.map(color =>
              color.id === colorId ? { ...color, imageUrl: imageValue instanceof File ? { file: imageValue } : imageValue } : color
            )
          };
        } else {
          return { ...type, imageUrl: imageValue instanceof File ? { file: imageValue } : imageValue };
        }
      }
      return type;
    });
    onPanelConfigChange({ optionTypes: newTypes });
  };

  const addType = () => {
    const newId = `type_${Date.now()}`;
    const newType = { 
      id: newId, 
      name: "New Option Type",
      description: "Description for new type.", 
      imageUrl: initializeImageState(null, '/assets/images/shingles/placeholder_type.jpg'), 
      colors: [
        { id: `color_${newId}_1`, name: "Default Color", colorHex: "#CCCCCC", imageUrl: initializeImageState(null, '/assets/images/shingles/placeholder_color.jpg') }
      ]
    };
    onPanelConfigChange({ optionTypes: [...optionTypes, newType] });
  };

  const removeType = (typeIdToRemove) => {
    onPanelConfigChange({ optionTypes: optionTypes.filter(type => type.id !== typeIdToRemove) });
  };

  const addColorToType = (typeId) => {
    const newColorId = `color_${typeId}_${Date.now()}`;
    const newColor = { 
      id: newColorId, 
      name: "New Color", 
      colorHex: "#EFEFEF", 
      imageUrl: initializeImageState(null, '/assets/images/shingles/placeholder_color.jpg')
    };
    const newTypes = optionTypes.map(type => {
      if (type.id === typeId) {
        return { ...type, colors: [...(type.colors || []), newColor] };
      }
      return type;
    });
    onPanelConfigChange({ optionTypes: newTypes });
  };

  const removeColorFromType = (typeId, colorIdToRemove) => {
    const newTypes = optionTypes.map(type => {
      if (type.id === typeId) {
        return { ...type, colors: (type.colors || []).filter(color => color.id !== colorIdToRemove) };
      }
      return type;
    });
    onPanelConfigChange({ optionTypes: newTypes });
  };

  const handleColorSettingChange = (field, value) => {
    onPanelConfigChange({ [field]: value });
  };

  const currentSelectedType = optionTypes[selectedTypeIndex];

  return (
    <div className="p-4 bg-gray-800 text-white rounded-b-md space-y-6">
      <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Option Selector Settings</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-gray-300 mb-1">Section Title Color:</label><input type="color" value={titleColor || "#1A202C"} onChange={(e) => handleColorSettingChange("titleColor", e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1">Text/Desc. Color:</label><input type="color" value={descriptionColor || "#4A5568"} onChange={(e) => handleColorSettingChange("descriptionColor", e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1">Selected Type Border:</label><input type="color" value={selectedTypeBorderColor || "#3182CE"} onChange={(e) => handleColorSettingChange("selectedTypeBorderColor", e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1">Selected Color Border:</label><input type="color" value={selectedColorBorderColor || "#DD6B20"} onChange={(e) => handleColorSettingChange("selectedColorBorderColor", e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1">Card Background Color:</label><input type="color" value={cardBackgroundColor || "#FFFFFF"} onChange={(e) => handleColorSettingChange("cardBackgroundColor", e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer" /></div>
      </div>

      <div className="space-y-4 border-t border-gray-700 pt-4">
        <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-200">Option Types:</h4>
            <button onClick={addType} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium">+ Add Option Type</button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2">
            {optionTypes.map((type) => (
            <div key={type.id} className="p-3 bg-gray-750 rounded-md border border-gray-600 space-y-2">
                <div className="flex justify-between items-center">
                <span className="text-gray-200 text-sm font-semibold truncate w-3/4" title={type.name}>Type: {type.name || '(Untitled)'} (ID: {type.id})</span>
                <button onClick={() => removeType(type.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Remove</button>
                </div>
                <div>
                <label className="block text-xs font-medium text-gray-400 mb-0.5">Image for {type.name || 'Type'}:</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && handleItemImageUpdate(type.id, null, e.target.files[0])} className="panel-file-input" />
                <input type="text" value={getDisplayUrlForPanel(type.imageUrl) || ""} onChange={(e) => handleItemImageUpdate(type.id, null, e.target.value)} placeholder="Type Image URL" className="panel-text-input-xs mt-1" />
                {getDisplayUrlForPanel(type.imageUrl) && <img src={getDisplayUrlForPanel(type.imageUrl)} alt={type.name} className="panel-img-preview-xs mt-1" />}
                </div>

                <div className="border-t border-gray-700 pt-2 mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                        <h5 className="text-xs font-medium text-gray-300">Colors for {type.name || 'Type'}:</h5>
                        <button onClick={() => addColorToType(type.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-medium">+ Add Color</button>
                    </div>
                    {(type.colors || []).map((color) => (
                    <div key={color.id} className="pl-2 border-l-2 border-gray-600 ml-1 space-y-1 pb-1">
                        <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-[11px] truncate w-3/4" title={color.name}>Color: {color.name || '(Untitled)'} (Hex: {color.colorHex})</span>
                        <button onClick={() => removeColorFromType(type.id, color.id)} className="text-red-400 hover:text-red-300 text-[10px] font-semibold">Remove</button>
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Img for {color.name || 'Color'}:</label>
                            <input type="file" accept="image/*" onChange={(e) => e.target.files && handleItemImageUpdate(type.id, color.id, e.target.files[0])} className="panel-file-input" />
                            <input type="text" value={getDisplayUrlForPanel(color.imageUrl) || ""} onChange={(e) => handleItemImageUpdate(type.id, color.id, e.target.value)} placeholder="Color Img URL" className="panel-text-input-xs mt-0.5" />
                            {getDisplayUrlForPanel(color.imageUrl) && <img src={getDisplayUrlForPanel(color.imageUrl)} alt={color.name} className="panel-img-preview-xs mt-0.5" />}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            ))}
            {optionTypes.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No option types defined. Add one to get started.</p>}
        </div>
      </div>
      <style jsx>{`
        .panel-file-input { margin-top: 2px; display: block; width: 100%; font-size: 0.75rem; color: #D1D5DB; }
        .panel-file-input::file-selector-button { margin-right: 8px; padding: 3px 6px; border-radius: 4px; border: 0; font-size: 0.75rem; font-weight: 600; background-color: #4F46E5; color: white; cursor: pointer; }
        .panel-file-input::file-selector-button:hover { background-color: #4338CA; }
        .panel-text-input-xs { width:100%; padding: 4px 8px; background-color: #374151; border: 1px solid #4B5563; border-radius: 4px; color: #E5E7EB; font-size: 0.75rem; }
        .panel-img-preview-xs { height: 2.5rem; width: 2.5rem; object-cover; border-radius: 4px; border: 1px solid #4B5563; background-color: #374151; }
      `}</style>
    </div>
  );
};

OptionSelectorBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func.isRequired,
  selectedTypeIndex: PropTypes.number,
};

export default OptionSelectorBlock; 