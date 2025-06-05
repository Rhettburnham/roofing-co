// src/components/blocks/OverviewAndAdvantagesBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { FaPencilAlt, FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import IconSelectorModal from '../common/IconSelectorModal';
import PanelTextSectionController from '../common/PanelTextSectionController';
import PanelImagesController from '../common/PanelImagesController';
import ThemeColorPicker from '../common/ThemeColorPicker';

// EditableText Component (Copied, consider moving to common/)
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
    if (isTextarea) return <textarea {...commonInputProps} rows={Math.max(2, (currentValue || '').split('\\n').length)} placeholder={placeholder} />;
    return <input {...commonInputProps} type="text" placeholder={placeholder} />;
  }
  const cursorClass = !readOnly && !isEditing ? 'cursor-pointer hover:bg-gray-400/10' : '';
  return (
    <Tag className={`${className} ${cursorClass} transition-colors duration-150 ease-in-out p-0 m-0 min-h-[1em] w-full break-words`} onClick={activateEditMode} title={!readOnly ? "Click to edit" : ""} style={style}>
      {value || <span className="text-gray-400/80 italic text-sm">({placeholder})</span>}
    </Tag>
  );
};

// Helper to render dynamic icons (ensure this is available or adapt)
const renderDynamicIcon = (pack, name, fallbackIcon = null, props = {}) => {
  // This is a placeholder. You'll need a robust way to import and render icons dynamically.
  // For example, using a map of icon libraries or a custom hook.
  // For now, let's assume CheckCircle is the default if nothing matches.
  if (pack === 'lucide' && name === 'CheckCircle') return <CheckCircle {...props} />;
  return fallbackIcon ? React.cloneElement(fallbackIcon, props) : <CheckCircle {...props} />;
};

/**
 * OverviewAndAdvantagesBlock Display Component
 */
const OverviewDisplay = ({ config = {}, readOnly = false, onConfigChange, onOpenIconModal }) => {
  const {
    heading = "Overview & Advantages",
    description = "Default description text. Click to edit.",
    bullets = [
      { id: 1, title: "Durability", desc: "Resistant to punctures, tears...", icon: { pack: 'lucide', name: 'CheckCircle' } },
      { id: 2, title: "Flexibility", desc: "Adapts to building movement...", icon: { pack: 'lucide', name: 'CheckCircle' } },
    ],
    footnote = "Optional last line or paragraph. Click to edit.",
  } = config;

  const handleLocalChange = (field, value, itemIndex = null, subField = null) => {
    if (onConfigChange) {
      if (itemIndex !== null) {
        const newBullets = bullets.map((bullet, idx) => {
          if (idx === itemIndex) {
            if (subField) return { ...bullet, [field]: { ...(bullet[field] || {}), [subField]: value } };
            return { ...bullet, [field]: value };
          }
          return bullet;
        });
        onConfigChange({ ...config, bullets: newBullets });
      } else {
        onConfigChange({ ...config, [field]: value });
      }
    }
  };

    return (
    <section className={`my-3 md:my-8 px-4 md:px-16 ${!readOnly ? 'p-1 bg-slate-50' : ''}`}>
      <EditableText
        value={heading}
        onChange={(newVal) => handleLocalChange("heading", newVal)}
        tag="h2"
        className="text-[5vw] md:text-4xl font-bold text-center text-gray-800 mb-1 md:mb-4"
        inputClassName="text-[5vw] md:text-4xl font-bold text-gray-800 text-center w-auto"
        placeholder="Main Heading"
        readOnly={readOnly}
      />

      { (description || !readOnly) && (
        <EditableText
          value={description}
          onChange={(newVal) => handleLocalChange("description", newVal)}
          tag="p"
          className="text-gray-600 text-center mx-auto max-w-3xl text-[3vw] md:text-lg mb-4"
          inputClassName="text-gray-600 text-center w-full md:text-lg"
          isTextarea
          placeholder="Detailed description..."
          readOnly={readOnly}
        />
        )}

      { (bullets.length > 0 || !readOnly) && (
        <ul className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {(bullets || []).map((adv, i) => (
              <li
              key={adv.id || i}
              className="flex bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500 items-start"
              >
              {!readOnly ? (
                <button 
                  onClick={() => onOpenIconModal && onOpenIconModal(`bullets[${i}].icon`, adv.icon)}
                  title="Change Icon"
                  className="p-1 mr-2 mt-0.5 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {renderDynamicIcon(adv.icon?.pack, adv.icon?.name, <CheckCircle className="text-blue-500 w-6 h-6 md:w-7 md:h-7" />, {className: "text-blue-500 w-6 h-6 md:w-7 md:h-7"})}
                </button>
              ) : (
                renderDynamicIcon(adv.icon?.pack, adv.icon?.name, <CheckCircle className="text-blue-500 w-6 h-6 md:w-7 md:h-7 mr-3 mt-0.5 flex-shrink-0" />, {className: "text-blue-500 w-6 h-6 md:w-7 md:h-7 mr-3 mt-0.5 flex-shrink-0"})
              )}
              <div className="flex-grow">
                <EditableText
                  value={adv.title}
                  onChange={(newVal) => handleLocalChange("title", newVal, i)}
                  tag="h4"
                  className="font-semibold text-gray-800 text-[3.5vw] md:text-lg"
                  inputClassName="font-semibold text-gray-800 md:text-lg w-full"
                  placeholder="Advantage Title"
                  readOnly={readOnly}
                />
                <EditableText
                  value={adv.desc}
                  onChange={(newVal) => handleLocalChange("desc", newVal, i)}
                  tag="p"
                  className="text-gray-600 text-[3vw] md:text-base mt-0.5"
                  inputClassName="text-gray-600 md:text-base w-full"
                  isTextarea
                  placeholder="Advantage description..."
                  readOnly={readOnly}
                />
                </div>
              </li>
            ))}
          </ul>
        )}
      {bullets.length === 0 && !readOnly && <p className="text-center text-gray-500 py-4">No advantages listed. Add some using the editor panel.</p>}

      { (footnote || !readOnly) && (
        <EditableText
          value={footnote}
          onChange={(newVal) => handleLocalChange("footnote", newVal)}
          tag="p"
          className="text-center text-[3vw] md:text-base text-gray-600 mt-6 max-w-3xl mx-auto"
          inputClassName="text-center md:text-base text-gray-600 w-full"
          isTextarea
          placeholder="Optional footnote..."
          readOnly={readOnly}
        />
        )}
      </section>
    );
};

const OverviewAndAdvantagesBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
  getDisplayUrl,
  onFileChange,
  themeColors,
  onToggleEditor,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconTargetFieldPath, setIconTargetFieldPath] = useState(null);
  const [currentIconForModal, setCurrentIconForModal] = useState(null);

  const handleToggleEdit = () => {
    setIsEditing(prev => !prev);
  };

  const handleOpenIconModal = (fieldPath, currentIcon) => {
    setIconTargetFieldPath(fieldPath);
    setCurrentIconForModal(currentIcon || { pack: 'lucide', name: 'CheckCircle' });
    setIsIconModalOpen(true);
  };

  const handleIconSelected = (pack, name) => {
    if (iconTargetFieldPath && onConfigChange) {
      const parts = iconTargetFieldPath.match(/(\w+)\[(\d+)\]\.(\w+)/);
      if (parts && parts.length === 4) {
        const arrayName = parts[1];
        const index = parseInt(parts[2]);

        const newArray = (config[arrayName] || []).map((item, idx) => {
          if (idx === index) {
            return { ...item, icon: { pack, name } };
          }
          return item;
        });
        onConfigChange({ ...config, [arrayName]: newArray });
      }
    }
    setIsIconModalOpen(false);
    setIconTargetFieldPath(null);
    setCurrentIconForModal(null);
  };

  if (!readOnly) {
    return (
      <div className="relative group border-2 border-blue-400/50">
        <section className={`relative w-full px-4 md:px-8 py-6 bg-gray-50 ${!readOnly && isEditing ? 'border-2 border-blue-400/50' : ''}`}>
          {!readOnly && (
            <button
              onClick={handleToggleEdit}
              className={`absolute top-4 right-4 z-50 ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-2 shadow-lg transition-colors`}
              title={isEditing ? "Finish Editing" : "Edit Overview & Advantages"}
            >
              {isEditing ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"/></svg>
              )}
            </button>
          )}

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Overview */}
            <div className="space-y-6">
              <div>
                <EditableText
                  value={config.heading}
                  onChange={(newVal) => onConfigChange({ heading: newVal })}
                  tag="h2"
                  className="text-3xl font-bold text-gray-900 mb-4"
                  inputClassName="text-3xl font-bold text-gray-900 mb-4 w-full"
                  placeholder="Section Title"
                  readOnly={readOnly || !isEditing}
                />
                <EditableText
                  value={config.description}
                  onChange={(newVal) => onConfigChange({ description: newVal })}
                  tag="p"
                  className="text-lg text-gray-600 leading-relaxed"
                  inputClassName="text-lg text-gray-600 leading-relaxed w-full"
                  isTextarea={true}
                  placeholder="Section Description"
                  readOnly={readOnly || !isEditing}
                />
              </div>

              {/* Features List */}
              {(config.bullets.length > 0 || (!readOnly && isEditing)) && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Key Features</h3>
                  <ul className="space-y-3">
                    {config.bullets.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3 group">
                        <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                        <EditableText
                          value={feature.title}
                          onChange={(newVal) => {
                            const newBullets = config.bullets.map((f, i) => i === index ? { ...f, title: newVal } : f);
                            onConfigChange({ bullets: newBullets });
                          }}
                          tag="span"
                          className="text-gray-700 flex-1"
                          inputClassName="text-gray-700 w-full"
                          placeholder="Feature description"
                          readOnly={readOnly || !isEditing}
                        />
                        {!readOnly && isEditing && (
                          <button
                            onClick={() => {
                              const newBullets = config.bullets.filter((_, i) => i !== index);
                              onConfigChange({ bullets: newBullets });
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity p-1"
                            title="Remove Feature"
                          >
                            <FaTimes size={14} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {!readOnly && isEditing && (
                    <button
                      onClick={() => onConfigChange({ bullets: [...config.bullets, { id: Date.now(), title: "New feature", desc: "Feature description", icon: { pack: 'lucide', name: 'CheckCircle' } }] })}
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md"
                    >
                      <FaPlus size={12} className="inline mr-1" /> Add Feature
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Advantages */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800">Advantages</h3>
              <div className="grid gap-4">
                {config.bullets.map((advantage, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-md group">
                    <EditableText
                      value={advantage.title}
                      onChange={(newVal) => {
                        const newBullets = config.bullets.map((adv, i) => 
                          i === index ? { ...adv, title: newVal } : adv
                        );
                        onConfigChange({ bullets: newBullets });
                      }}
                      tag="h4"
                      className="text-lg font-medium text-gray-900 mb-2"
                      inputClassName="text-lg font-medium text-gray-900 mb-2 w-full"
                      placeholder="Advantage Title"
                      readOnly={readOnly || !isEditing}
                    />
                    <EditableText
                      value={advantage.desc}
                      onChange={(newVal) => {
                        const newBullets = config.bullets.map((adv, i) => 
                          i === index ? { ...adv, desc: newVal } : adv
                        );
                        onConfigChange({ bullets: newBullets });
                      }}
                      tag="p"
                      className="text-gray-600"
                      inputClassName="text-gray-600 w-full"
                      isTextarea={true}
                      placeholder="Advantage Description"
                      readOnly={readOnly || !isEditing}
                    />
                    {!readOnly && isEditing && (
                      <button
                        onClick={() => {
                          const newBullets = config.bullets.filter((_, i) => i !== index);
                          onConfigChange({ bullets: newBullets });
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-red-500 hover:text-red-700 transition-opacity p-1"
                        title="Remove Advantage"
                      >
                        <FaTimes size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!readOnly && isEditing && (
                <button
                  onClick={() => onConfigChange({ bullets: [...config.bullets, { id: Date.now(), title: "New advantage", desc: "Advantage description", icon: { pack: 'lucide', name: 'CheckCircle' } }] })}
                  className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md"
                >
                  <FaPlus size={12} className="inline mr-1" /> Add Advantage
                </button>
              )}
            </div>
          </div>
        </section>
        {isIconModalOpen && (
          <IconSelectorModal 
            isOpen={isIconModalOpen} 
            onClose={() => setIsIconModalOpen(false)} 
            onIconSelect={handleIconSelected} 
            currentIconPack={currentIconForModal?.pack}
            currentIconName={currentIconForModal?.name}
          />
        )}
      </div>
    );
  }

  return <OverviewDisplay config={config} readOnly={true} />;
};

OverviewAndAdvantagesBlock.EditorPanel = ({ currentConfig, onPanelConfigChange }) => {
  const {
    bullets = [],
  } = currentConfig;

  const addBullet = () => {
    const newBullet = { 
      id: Date.now(), 
      title: "New Advantage", 
      desc: "Describe this new advantage.", 
      icon: { pack: 'lucide', name: 'CheckCircle' } 
    };
    const newBullets = [...(bullets || []), newBullet];
    onPanelConfigChange({ bullets: newBullets });
  };

  const removeBullet = (idxToRemove) => {
    const newBullets = (bullets || []).filter((_, idx) => idx !== idxToRemove);
    onPanelConfigChange({ bullets: newBullets });
  };

  return (
    <div className="p-3 space-y-3 bg-gray-800 text-gray-200 rounded-b-md max-h-[70vh] overflow-y-auto">
      <h3 className="text-sm font-semibold mb-2 text-center border-b border-gray-700 pb-1.5">Manage Advantages</h3>

      {(bullets || []).length > 0 && bullets.map((bullet, idx) => (
        <div key={bullet.id || idx} className="flex items-center justify-between p-1.5 bg-gray-750 rounded-md shadow-sm">
          <span className="text-xs text-gray-300 truncate pr-2">{idx + 1}. {bullet.title || 'Untitled'}</span>
            <button
              type="button"
            onClick={() => removeBullet(idx)}
            className="p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors flex-shrink-0"
            title="Remove Advantage"
            >
            <FaTrash size={10} />
            </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addBullet}
        className="w-full mt-2 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md shadow flex items-center justify-center"
      >
        <FaPlus size={10} className="mr-1" /> Add Advantage
      </button>
      {(!bullets || bullets.length === 0) && <p className="text-xs text-gray-400 text-center italic mt-2">No advantages defined. Click 'Add Advantage' to start.</p>}
    </div>
  );
};

// Static method for TopStickyEditPanel integration
OverviewAndAdvantagesBlock.tabsConfig = (config, onControlsChange, themeColors) => {
  return {
    general: () => (
      <PanelTextSectionController
        currentData={config}
        onControlsChange={onControlsChange}
        controlType="bullets"
        blockType="OverviewAndAdvantagesBlock"
      />
    ),
    
    images: () => (
      <div className="p-6 text-center text-gray-500">
        <p className="mb-2">Image management for advantages icons.</p>
        <p className="text-sm">Icon management is handled through the main editing interface.</p>
      </div>
    ),
    
    colors: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Color Settings</h3>
        
        <ThemeColorPicker
          label="Heading Color"
          fieldName="headingColor"
          currentColorValue={config?.headingColor || themeColors?.text || '#374151'}
          onColorChange={(fieldName, value) => onControlsChange({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
        
        <ThemeColorPicker
          label="Text Color"
          fieldName="textColor"
          currentColorValue={config?.textColor || themeColors?.text || '#6B7280'}
          onColorChange={(fieldName, value) => onControlsChange({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
        
        <ThemeColorPicker
          label="Accent Color (Icons & Borders)"
          fieldName="accentColor"
          currentColorValue={config?.accentColor || themeColors?.accent || '#3B82F6'}
          onColorChange={(fieldName, value) => onControlsChange({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
        
        <ThemeColorPicker
          label="Background Color"
          fieldName="backgroundColor"
          currentColorValue={config?.backgroundColor || themeColors?.background || '#FFFFFF'}
          onColorChange={(fieldName, value) => onControlsChange({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
      </div>
    ),
    
    styling: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Layout Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grid Layout
          </label>
          <select
            value={config?.gridLayout || 'two-column'}
            onChange={(e) => onControlsChange({ ...config, gridLayout: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="one-column">Single Column</option>
            <option value="two-column">Two Columns</option>
            <option value="three-column">Three Columns</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Controls how advantages are displayed in the grid
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Spacing
          </label>
          <select
            value={config?.cardSpacing || 'normal'}
            onChange={(e) => onControlsChange({ ...config, cardSpacing: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tight">Tight</option>
            <option value="normal">Normal</option>
            <option value="loose">Loose</option>
          </select>
        </div>
      </div>
    )
  };
};

export default OverviewAndAdvantagesBlock;
