// src/components/blocks/OverviewAndAdvantagesBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import IconSelectorModal from '../common/IconSelectorModal';

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
  onToggleEditor,
}) => {
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconTargetFieldPath, setIconTargetFieldPath] = useState(null);
  const [currentIconForModal, setCurrentIconForModal] = useState(null);

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
        <OverviewDisplay 
          config={config} 
          readOnly={false} 
          onConfigChange={onConfigChange}
          onOpenIconModal={handleOpenIconModal} 
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

export default OverviewAndAdvantagesBlock;
