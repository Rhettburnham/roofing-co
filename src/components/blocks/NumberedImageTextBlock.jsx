import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * NumberedImageTextBlock
 * 
 * Showcases a group of items with benefits and images in a vertical layout
 * 
 * config = {
 *   listTitle: string,
 *   items: [
 *     {
 *       id: number,
 *       title: string,
 *       description: string,
 *       benefits: string[],
 *       image: string or {url: string}
 *     }
 *   ]
 * }
 */

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

const getEffectiveDisplayUrl = (imageState, getDisplayUrlProp, defaultPath = '') => {
  if (getDisplayUrlProp && imageState) return getDisplayUrlProp(imageState);
  if (imageState && typeof imageState === 'object' && imageState.url) return imageState.url;
  if (typeof imageState === 'string' && imageState) return imageState.startsWith('/') || imageState.startsWith('blob:') || imageState.startsWith('data:') ? imageState : (imageState.startsWith('.') ? imageState : `/${imageState.replace(/^\/*/, "")}`);
  return defaultPath;
};

const EditableField = ({ value, onChange, placeholder, type = 'text', className, style, rows }) => (
  type === 'textarea' ?
    <textarea value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} rows={rows} /> :
    <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} />
);

function NumberedImageTextPreview({ localConfig, readOnly, onInlineChange, getDisplayUrl }) {
  const { sectionTitle, items, defaultImage, titleColor, descriptionColor, imageStyle, layoutAlternating, benefitTextColor, benefitIconColor } = localConfig;

  const getImageClasses = (style) => {
    switch (style) {
      case "circle": return "rounded-full aspect-square";
      case "rounded": return "rounded-lg aspect-video";
      default: return "aspect-video";
    }
  };

  return (
    <section className="py-8 md:py-12 px-4">
      {readOnly ? (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12" style={{ color: titleColor }}>
          {sectionTitle}
        </h2>
      ) : (
        <EditableField 
          value={sectionTitle} 
          onChange={(e) => onInlineChange('sectionTitle', e.target.value)} 
          placeholder="Section Title" 
          className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12" 
          style={{ color: titleColor }}
        />
      )}
      
      <div className="space-y-8 md:space-y-12 max-w-4xl mx-auto">
        {(items || []).map((item, index) => {
          const imageUrl = getEffectiveDisplayUrl(item.image, getDisplayUrl, defaultImage);
          return (
            <motion.div 
              key={item.id || index}
              className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 p-4 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${index % 2 !== 0 && localConfig.layoutAlternating ? 'md:flex-row-reverse' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {imageUrl && (
                <div className={`w-full md:w-1/3 flex-shrink-0 overflow-hidden ${getImageClasses(imageStyle)}`}>
                  <img 
                    src={imageUrl} 
                    alt={item.title || "Item image"} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <div className="flex-grow text-center md:text-left">
                {readOnly ? (
                  <h3 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: titleColor }}>{item.title}</h3>
                ) : (
                  <EditableField value={item.title} onChange={(e) => onInlineChange('items', e.target.value, index, 'title')} placeholder="Item Title" className="text-xl md:text-2xl font-semibold mb-2" style={{ color: titleColor }} />
                )}
                {readOnly ? (
                  <p className="text-sm md:text-base leading-relaxed mb-3" style={{ color: descriptionColor }}>{item.description}</p>
                ) : (
                  <EditableField value={item.description} onChange={(e) => onInlineChange('items', e.target.value, index, 'description')} placeholder="Item description" className="text-sm md:text-base leading-relaxed mb-3" style={{ color: descriptionColor }} type="textarea" rows={3}/>
                )}
                
                {(item.benefits && item.benefits.length > 0) || !readOnly ? (
                  <div className="mt-3">
                    <ul className="space-y-2">
                      {(item.benefits || []).map((benefit, benefitIdx) => (
                        <li key={benefitIdx} className="flex items-center">
                          <Check size={18} className="mr-2 flex-shrink-0" style={{color: benefitIconColor || '#10B981'}} />
                          {readOnly ? (
                            <span className="text-sm" style={{color: benefitTextColor}}>{benefit}</span>
                          ) : (
                            <EditableField value={benefit} onChange={(e) => onInlineChange('items', e.target.value, index, 'benefits', benefitIdx)} placeholder="Benefit description" className="text-sm flex-grow" style={{color: benefitTextColor}}/>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
NumberedImageTextPreview.propTypes = { localConfig: PropTypes.object.isRequired, readOnly: PropTypes.bool.isRequired, onInlineChange: PropTypes.func.isRequired, getDisplayUrl: PropTypes.func };

function NumberedImageTextPanel({ localConfig, onPanelChange, onAddItem, onRemoveItem, onUpdateItemImage, onAddBenefit, onRemoveBenefit }) {
  const { items, defaultImage, titleColor, descriptionColor, imageStyle, layoutAlternating, benefitTextColor, benefitIconColor, itemBackgroundColor } = localConfig;

  const handleColorChange = (field, value) => onPanelChange({ ...localConfig, [field]: value });
  const handleStyleChange = (field, value) => onPanelChange({ ...localConfig, [field]: value });

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg space-y-4">
      <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">List Settings</h3>
      <div><label className="block text-sm mb-1">Default Fallback Image URL:</label><input type="text" value={defaultImage || ''} onChange={(e) => handleStyleChange('defaultImage', e.target.value)} className="panel-text-input" /></div>
      <div><label className="block text-sm mb-1">Image Style:</label><select value={imageStyle || 'rounded'} onChange={(e) => handleStyleChange('imageStyle', e.target.value)} className="panel-select"><option value="rounded">Rounded</option><option value="circle">Circle</option><option value="none">None</option></select></div>
      <div><label className="flex items-center text-sm"><input type="checkbox" checked={layoutAlternating || false} onChange={(e) => handleStyleChange('layoutAlternating', e.target.checked)} className="mr-2" /> Alternate Layout (Image Left/Right)</label></div>
      
      <h4 className="text-md font-semibold border-t border-gray-700 pt-3">Color Settings</h4>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs mb-1">Section Title:</label><input type="color" value={titleColor || '#1A202C'} onChange={(e) => handleColorChange('titleColor', e.target.value)} className="panel-color-input" /></div>
        <div><label className="block text-xs mb-1">Description Text:</label><input type="color" value={descriptionColor || '#4A5568'} onChange={(e) => handleColorChange('descriptionColor', e.target.value)} className="panel-color-input" /></div>
        <div><label className="block text-xs mb-1">Benefit Text:</label><input type="color" value={benefitTextColor || '#374151'} onChange={(e) => handleColorChange('benefitTextColor', e.target.value)} className="panel-color-input" /></div>
        <div><label className="block text-xs mb-1">Benefit Icon:</label><input type="color" value={benefitIconColor || '#10B981'} onChange={(e) => handleColorChange('benefitIconColor', e.target.value)} className="panel-color-input" /></div>
         <div><label className="block text-xs mb-1">Item BG (unused currently):</label><input type="color" value={itemBackgroundColor || '#FFFFFF'} onChange={(e) => handleColorChange('itemBackgroundColor', e.target.value)} className="panel-color-input" /></div>
      </div>

      <h4 className="text-md font-semibold border-t border-gray-700 pt-3">Manage Items</h4>
      {(items || []).map((item, index) => (
        <div key={item.id || index} className="p-3 bg-gray-700 rounded-md space-y-2">
          <div className="flex justify-between items-center"><span className="text-sm font-medium">Item: {item.title || `(Item ${index + 1})`}</span><button onClick={() => onRemoveItem(index)} className="panel-button-sm-danger">Remove Item</button></div>
          <div><label className="block text-xs mb-0.5">Image for "{item.title || 'Item'}":</label><input type="file" accept="image/*" onChange={(e) => e.target.files && onUpdateItemImage(index, e.target.files[0])} className="panel-file-input" /></div>
          <div><label className="block text-xs mb-0.5">Current Image URL (or paste new):</label><input type="text" value={typeof item.image ==='string' ? item.image : (item.image?.url || '')} onChange={(e)=> onUpdateItemImage(index, e.target.value)} className="panel-text-input-xs"/></div>
          {item.image && <img src={typeof item.image === 'string' ? item.image : item.image.url} alt="Preview" className="panel-img-preview-xs" onError={(e)=>e.target.style.display='none'}/>}
          
          <div className="border-t border-gray-600 pt-2 mt-2"><div className="flex justify-between items-center"><label className="text-xs font-medium">Benefits:</label><button onClick={() => onAddBenefit(index)} className="panel-button-xs-action">+ Benefit</button></div>
            {(item.benefits || []).map((_, benefitIdx) => (
              <div key={benefitIdx} className="flex items-center mt-1"><span className="text-xs text-gray-300 w-full truncate">{item.benefits[benefitIdx] || '(Empty benefit)'}</span><button onClick={() => onRemoveBenefit(index, benefitIdx)} className="panel-button-xs-danger ml-2">✕</button></div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={onAddItem} className="panel-button-action w-full">+ Add Item</button>
    </div>
  );
}
NumberedImageTextPanel.propTypes = { localConfig: PropTypes.object.isRequired, onPanelChange: PropTypes.func.isRequired, onAddItem: PropTypes.func.isRequired, onRemoveItem: PropTypes.func.isRequired, onUpdateItemImage: PropTypes.func.isRequired, onAddBenefit: PropTypes.func.isRequired, onRemoveBenefit: PropTypes.func.isRequired };

const NumberedImageTextBlock = ({ config = {}, readOnly = true, onConfigChange, getDisplayUrl: getDisplayUrlProp }) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      sectionTitle: "Our Process",
      items: [
        { id: `item_${Date.now()}_1`, title: "Step 1: Consultation", image: initializeImageState(null, "/assets/images/placeholder_rect_1.jpg"), description: "Detailed consultation to understand your precise needs and goals.", benefits: ["Understand Requirements", "Site Assessment"] },
        { id: `item_${Date.now()}_2`, title: "Step 2: Design & Planning", image: initializeImageState(null, "/assets/images/placeholder_rect_2.jpg"), description: "Our expert team crafts a tailored solution and meticulous execution plan.", benefits: ["Custom Solution Design", "Material Selection"] },
        { id: `item_${Date.now()}_3`, title: "Step 3: Execution & Quality Check", image: initializeImageState(null, "/assets/images/placeholder_rect_3.jpg"), description: "Skilled professionals carry out the work with rigorous quality assurance.", benefits: ["Professional Installation", "Final Inspection"] },
      ],
      defaultImage: "/assets/images/placeholder-icon.png",
      titleColor: "#1A202C",
      descriptionColor: "#4A5568",
      benefitTextColor: "#374151",
      benefitIconColor: "#10B981",
      imageStyle: "rounded",
      layoutAlternating: false,
      itemBackgroundColor: '#FFFFFF',
    };
    const initialData = { ...defaultConfig, ...config };
    return {
      ...initialData,
      items: (initialData.items || []).map((item, idx) => ({
        ...defaultConfig.items[0], 
        ...item,
        id: item.id || `item_init_${idx}_${Date.now()}`,
        image: initializeImageState(item.image, defaultConfig.items[idx % defaultConfig.items.length]?.image?.originalUrl || "/assets/images/placeholder_general.jpg"),
        benefits: item.benefits || [],
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
            ...localItem, ...propItem,
            image: newImageState,
            title: !readOnly && localItem.title !== (propItem.title || '') ? localItem.title : (propItem.title || localItem.title || ''),
            description: !readOnly && localItem.description !== (propItem.description || '') ? localItem.description : (propItem.description || localItem.description || ''),
            benefits: !readOnly && JSON.stringify(localItem.benefits) !== JSON.stringify(propItem.benefits || []) ? localItem.benefits : (propItem.benefits || localItem.benefits || []),
          };
        });
        return { ...prevLocal, ...config, items: newItems };
      });
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && onConfigChange) {
      const dataToSave = { ...localConfig, items: localConfig.items.map(item => ({ ...item, image: item.image?.file ? { ...item.image } : { url: item.image?.originalUrl || item.image?.url } })) };
      onConfigChange(dataToSave);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    localConfig.items.forEach(item => { if (item.image?.file && item.image.url?.startsWith('blob:')) URL.revokeObjectURL(item.image.url); });
    return () => { localConfig.items.forEach(item => { if (item.image?.file && item.image.url?.startsWith('blob:')) URL.revokeObjectURL(item.image.url); }); };
  }, []);

  const handleInlineChange = (field, value, itemIndex = null, itemSubField = null, benefitIndex = null) => {
    if (!readOnly) {
      setLocalConfig(prev => {
        if (field === 'items' && itemIndex !== null && itemSubField) {
          const newItems = prev.items.map((item, idx) => {
            if (idx === itemIndex) {
              if (itemSubField === 'benefits' && benefitIndex !== null) {
                const newBenefits = (item.benefits || []).map((ben, bIdx) => bIdx === benefitIndex ? value : ben);
                return { ...item, benefits: newBenefits };
              }
              return { ...item, [itemSubField]: value };
            }
            return item;
          });
          return { ...prev, items: newItems };
        } else {
          return { ...prev, [field]: value };
        }
      });
    }
  };

  const handlePanelChange = (panelData) => {
    if (!readOnly) setLocalConfig(prev => ({ ...prev, ...panelData }));
  };

  const handleUpdateItemImage = (itemIndex, fileOrUrl) => {
    if (!readOnly) {
      setLocalConfig(prev => {
        const newItems = [...prev.items];
        const oldItemImage = newItems[itemIndex].image;
        if (oldItemImage?.file && oldItemImage.url?.startsWith('blob:')) URL.revokeObjectURL(oldItemImage.url);
        
        if (fileOrUrl instanceof File) {
          newItems[itemIndex].image = { file: fileOrUrl, url: URL.createObjectURL(fileOrUrl), name: fileOrUrl.name, originalUrl: oldItemImage?.originalUrl };
        } else if (typeof fileOrUrl === 'string') {
          newItems[itemIndex].image = initializeImageState(fileOrUrl, oldItemImage?.originalUrl);
        }
        return { ...prev, items: newItems };
      });
    }
  };

  const handleAddItem = () => {
    if (!readOnly) setLocalConfig(prev => ({ ...prev, items: [...(prev.items || []), { id: `item_new_${Date.now()}`, title: "New Item", image: initializeImageState(null, prev.defaultImage), description: "New item description.", benefits: ["New Benefit"] }] }));
  };
  const handleRemoveItem = (indexToRemove) => {
    if (!readOnly) setLocalConfig(prev => ({ ...prev, items: prev.items.filter((_, index) => index !== indexToRemove) }));
  };
  const handleAddBenefit = (itemIndex) => {
    if (!readOnly) setLocalConfig(prev => ({ ...prev, items: prev.items.map((item, idx) => idx === itemIndex ? { ...item, benefits: [...(item.benefits || []), "Another Benefit"] } : item) }));
  };
  const handleRemoveBenefit = (itemIndex, benefitIndexToRemove) => {
    if (!readOnly) setLocalConfig(prev => ({ ...prev, items: prev.items.map((item, idx) => idx === itemIndex ? { ...item, benefits: (item.benefits || []).filter((_, bIdx) => bIdx !== benefitIndexToRemove) } : item) }));
  };

  return (
    <>
      <NumberedImageTextPreview localConfig={localConfig} readOnly={readOnly} onInlineChange={handleInlineChange} getDisplayUrl={getDisplayUrlProp} />
      {!readOnly && (
        <div className="bg-gray-900 p-0 rounded-b-lg shadow-xl mt-0">
          <NumberedImageTextPanel
            localConfig={localConfig} 
            onPanelChange={handlePanelChange} 
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateItemImage={handleUpdateItemImage}
            onAddBenefit={handleAddBenefit}
            onRemoveBenefit={handleRemoveBenefit}
          />
        </div>
      )}
    </>
  );
}

NumberedImageTextBlock.propTypes = {
  config: PropTypes.shape({
    sectionTitle: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
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
    itemBackgroundColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

NumberedImageTextBlock.EditorPanel = NumberedImageTextPanel;

export default NumberedImageTextBlock; 