// src/components/blocks/OverviewAndAdvantagesBlock.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as LucideIcons from "lucide-react"; // Import all for dynamic selection
import { CheckCircle } from 'lucide-react'; // Example icon

/**
 * OverviewAndAdvantagesBlock
 *
 * config = {
 *   heading: "Overview & Advantages",
 *   description: "Single-ply membranes like TPO, PVC, and EPDM ...",
 *   bullets: [
 *     { title: "Durability", desc: "Resistant to punctures, tears ..." },
 *     { title: "Flexibility", desc: "Adapts to building movement ..." },
 *     ...
 *   ]
 *   footnote?: "Optional last line or paragraph"
 * }
 */

// Helper for inline editable fields
const EditableField = ({ value, onChange, placeholder, type = 'text', className, style, rows }) => (
  type === 'textarea' ?
    <textarea value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} rows={rows} /> :
    <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} />
);

// Preview Component
function OverviewAndAdvantagesPreview({ localConfig, readOnly, onInlineChange, onIconClick }) {
  const {
    overviewTitle, overviewText, advantagesTitle, advantages,
    overviewTitleColor, overviewTextColor, advantagesTitleColor, advantageTextColor, advantageIconColor, backgroundColor
  } = localConfig;

  const getIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle; // Default to HelpCircle if not found
    return <IconComponent />;
  };

  return (
    <section className="py-8 md:py-12 px-4 md:px-8" style={{ backgroundColor: backgroundColor || '#F9FAFB' }}>
      <div className="max-w-5xl mx-auto">
        {/* Overview Section */}
        <div className="mb-8 md:mb-12 text-center">
          {readOnly ? (
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: overviewTitleColor }}>{overviewTitle}</h2>
          ) : (
            <EditableField 
              value={overviewTitle} 
              onChange={(e) => onInlineChange('overviewTitle', e.target.value)} 
              placeholder="Overview Title" 
              className="text-3xl md:text-4xl font-bold mb-3 text-center" 
              style={{ color: overviewTitleColor }}
            />
          )}
          {readOnly ? (
            <p className="text-base md:text-lg leading-relaxed" style={{ color: overviewTextColor }}>{overviewText}</p>
          ) : (
            <EditableField 
              value={overviewText} 
              onChange={(e) => onInlineChange('overviewText', e.target.value)} 
              placeholder="Overview description..." 
              className="text-base md:text-lg leading-relaxed text-center min-h-[60px]" 
              style={{ color: overviewTextColor }}
              type="textarea"
              rows={3}
            />
          )}
        </div>

        {/* Advantages Section */}
        {(advantages && advantages.length > 0) || !readOnly ? (
          <div className="text-center">
            {readOnly ? (
              <h3 className="text-2xl md:text-3xl font-semibold mb-6" style={{ color: advantagesTitleColor }}>{advantagesTitle}</h3>
            ) : (
              <EditableField 
                value={advantagesTitle} 
                onChange={(e) => onInlineChange('advantagesTitle', e.target.value)} 
                placeholder="Advantages Title" 
                className="text-2xl md:text-3xl font-semibold mb-6 text-center" 
                style={{ color: advantagesTitleColor }}
              />
            )}
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(advantages || []).map((advantage, index) => (
                <li key={advantage.id || index} className="flex items-start bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {!readOnly && onIconClick ? (
                    <button 
                      onClick={() => onIconClick(index)} 
                      title="Change Icon"
                      className="p-1 rounded hover:bg-gray-200 mr-3 flex-shrink-0"
                    >
                      {React.cloneElement(getIconComponent(advantage.icon), { size: 24, style: { color: advantageIconColor } })}
                    </button>
                  ) : (
                    <div className="mr-3 flex-shrink-0">
                       {React.cloneElement(getIconComponent(advantage.icon), { size: 24, style: { color: advantageIconColor } })}
                    </div>
                  )}
                  {readOnly ? (
                    <span className="text-base" style={{ color: advantageTextColor }}>{advantage.text}</span>
                  ) : (
                    <EditableField 
                      value={advantage.text} 
                      onChange={(e) => onInlineChange('advantages', e.target.value, index, 'text')} 
                      placeholder="Advantage description" 
                      className="text-base flex-grow" 
                      style={{ color: advantageTextColor }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

OverviewAndAdvantagesPreview.propTypes = {
  localConfig: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onInlineChange: PropTypes.func.isRequired,
  onIconClick: PropTypes.func, // For opening icon selector
};

// Panel Component
function OverviewAndAdvantagesPanel({ localConfig, onPanelChange, onAddAdvantage, onRemoveAdvantage }) {
  const {
    advantages,
    overviewTitleColor, overviewTextColor, advantagesTitleColor, advantageTextColor, advantageIconColor, backgroundColor
  } = localConfig;

  const handleColorChange = (field, value) => {
    onPanelChange({ ...localConfig, [field]: value });
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg space-y-4">
      <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Overview & Advantages Settings</h3>
      
      {/* Color Settings */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Overall BG Color:</label>
          <input type="color" value={backgroundColor || '#F9FAFB'} onChange={(e) => handleColorChange('backgroundColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Overview Title Color:</label>
          <input type="color" value={overviewTitleColor || '#1A202C'} onChange={(e) => handleColorChange('overviewTitleColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Overview Text Color:</label>
          <input type="color" value={overviewTextColor || '#4A5568'} onChange={(e) => handleColorChange('overviewTextColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Advantages Title Color:</label>
          <input type="color" value={advantagesTitleColor || '#1A202C'} onChange={(e) => handleColorChange('advantagesTitleColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Advantage Text Color:</label>
          <input type="color" value={advantageTextColor || '#333333'} onChange={(e) => handleColorChange('advantageTextColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Advantage Icon Color:</label>
          <input type="color" value={advantageIconColor || '#2C5282'} onChange={(e) => handleColorChange('advantageIconColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
        </div>
      </div>

      {/* Advantages List Management */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-md font-medium text-gray-200">Advantages List:</h4>
          <button onClick={onAddAdvantage} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs">+ Add Advantage</button>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
          {(advantages || []).map((adv, index) => (
            <div key={adv.id || index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
              <span className="text-sm text-gray-300 truncate w-3/4" title={adv.text}>{adv.text || '(New Advantage)'}</span>
              <button onClick={() => onRemoveAdvantage(index)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
            </div>
          ))}
          {(!advantages || advantages.length === 0) && <p className="text-xs text-gray-400 text-center py-2">No advantages listed.</p>}
        </div>
      </div>
    </div>
  );
}

OverviewAndAdvantagesPanel.propTypes = {
  localConfig: PropTypes.object.isRequired,
  onPanelChange: PropTypes.func.isRequired,
  onAddAdvantage: PropTypes.func.isRequired,
  onRemoveAdvantage: PropTypes.func.isRequired,
};

// Main Block Component
export default function OverviewAndAdvantagesBlock({
  config = {},
  readOnly = true,
  onConfigChange,
  // IconSelectorModal related props could be passed if integrated
  // For now, assuming simple icon name string handling in localConfig
}) {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      heading: 'Overview & Advantages',
      description: 'Detailed description of the service or product, highlighting its key aspects and benefits to the customer.',
      bullets: [
        { title: 'Key Advantage 1', desc: 'Description for advantage 1.' },
        { title: 'Key Advantage 2', desc: 'Description for advantage 2.' },
      ],
      footnote: 'Additional important information or a small disclaimer.',
      backgroundColor: '#F3F4F6', // Light gray background
      headingColor: '#111827',    // Darker gray for heading
      descriptionColor: '#374151', // Medium gray for description/footnote
      bulletTitleColor: '#1F2937', // Dark gray for bullet titles
      bulletDescColor: '#4B5563',  // Slightly lighter for bullet descriptions
      bulletIconColor: '#10B981',  // Green for bullet icons
    };
    const initialData = { ...defaultConfig, ...config };
    return {
      ...initialData,
      advantages: (initialData.advantages || []).map((adv, idx) => ({
        ...defaultConfig.advantages[0], // Base defaults for an advantage
        ...adv,
        id: adv.id || `adv_init_${idx}_${Date.now()}`,
        icon: adv.icon || 'CheckCircle', // Ensure icon has a default
      }))
    };
  });

  const prevReadOnlyRef = useRef(readOnly);
  const [editingAdvantageIconIndex, setEditingAdvantageIconIndex] = useState(null);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const footnoteRef = useRef(null);
  const bulletRefs = useRef({}); // Stores { title_idx: ref, desc_idx: ref }

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newAdv = (config.advantages || []).map((propAdv, idx) => {
          const localAdv = prevLocal.advantages.find(la => la.id === propAdv.id) || prevLocal.advantages[idx] || {};
          return {
            ...localAdv,
            ...propAdv,
            id: propAdv.id || localAdv.id || `adv_prop_${idx}_${Date.now()}`,
            text: !readOnly && prevLocal.advantages[idx]?.text !== (propAdv.text || '') ? prevLocal.advantages[idx].text : (propAdv.text || localAdv.text || ''),
            icon: !readOnly && prevLocal.advantages[idx]?.icon !== (propAdv.icon || '') ? prevLocal.advantages[idx].icon : (propAdv.icon || localAdv.icon || 'CheckCircle')
          };
        });
        return {
          ...prevLocal,
          ...config,
          overviewTitle: !readOnly && prevLocal.overviewTitle !== (config.overviewTitle || '') ? prevLocal.overviewTitle : (config.overviewTitle || prevLocal.overviewTitle || ''),
          overviewText: !readOnly && prevLocal.overviewText !== (config.overviewText || '') ? prevLocal.overviewText : (config.overviewText || prevLocal.overviewText || ''),
          advantagesTitle: !readOnly && prevLocal.advantagesTitle !== (config.advantagesTitle || '') ? prevLocal.advantagesTitle : (config.advantagesTitle || prevLocal.advantagesTitle || ''),
          advantages: newAdv,
        };
      });
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && onConfigChange) {
      onConfigChange(localConfig);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    if (!readOnly) {
      const refsToResize = [headingRef, descriptionRef, footnoteRef];
      refsToResize.forEach(ref => {
        if (ref.current) {
          ref.current.style.height = 'auto';
          ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
      });
      Object.values(bulletRefs.current).forEach(bulletFieldRefs => {
        if(bulletFieldRefs) {
          Object.values(bulletFieldRefs).forEach(ref => {
            if (ref && ref.current) {
              ref.current.style.height = 'auto';
              ref.current.style.height = `${ref.current.scrollHeight}px`;
            }
          });
        }
      });
    }
  }, [localConfig.heading, localConfig.description, localConfig.footnote, localConfig.bullets, readOnly]);

  const handleInputChange = (field, value, bulletIndex = null, bulletField = null) => {
    setLocalConfig(prev => {
      let updatedConfig;
      if (bulletIndex !== null && bulletField) {
        const updatedBullets = prev.bullets.map((bullet, i) => 
          i === bulletIndex ? { ...bullet, [bulletField]: value } : bullet
        );
        updatedConfig = { ...prev, bullets: updatedBullets };
      } else {
        updatedConfig = { ...prev, [field]: value };
      }
      if (!readOnly) onConfigChange(updatedConfig);
      return updatedConfig;
    });
  };

  const handleBlur = () => {
    if (!readOnly) onConfigChange(localConfig);
  };

  const getBulletRef = (index, field) => (el) => {
    if (!bulletRefs.current[index]) bulletRefs.current[index] = {};
    bulletRefs.current[index][field] = { current: el };
  };

  const handleInlineChange = (field, value, itemIndex = null, itemSubField = null) => {
    if (!readOnly) {
      setLocalConfig(prev => {
        if (field === 'advantages' && itemIndex !== null && itemSubField) {
          const newAdvantages = prev.advantages.map((adv, idx) => 
            idx === itemIndex ? { ...adv, [itemSubField]: value } : adv
          );
          return { ...prev, advantages: newAdvantages };
        } else {
          return { ...prev, [field]: value };
        }
      });
    }
  };

  const handlePanelChange = (panelData) => {
    if (!readOnly) {
      setLocalConfig(prev => ({ ...prev, ...panelData }));
    }
  };

  const handleAddAdvantage = () => {
    if (!readOnly) {
      setLocalConfig(prev => ({
        ...prev,
        advantages: [...(prev.advantages || []), { id: `adv_new_${Date.now()}`, text: 'New Advantage', icon: 'CheckCircle' }]
      }));
    }
  };

  const handleRemoveAdvantage = (indexToRemove) => {
    if (!readOnly) {
      setLocalConfig(prev => ({
        ...prev,
        advantages: prev.advantages.filter((_, index) => index !== indexToRemove)
      }));
    }
  };

  const handleAdvantageIconClick = (index) => {
    if (!readOnly) {
      setEditingAdvantageIconIndex(index);
      setIsIconModalOpen(true);
    }
  };

  const handleIconSelectForAdvantage = (iconName) => {
    if (editingAdvantageIconIndex !== null) {
      handleInlineChange('advantages', iconName, editingAdvantageIconIndex, 'icon');
    }
    setIsIconModalOpen(false);
    setEditingAdvantageIconIndex(null);
  };

  return (
    <>
      <OverviewAndAdvantagesPreview 
        localConfig={localConfig} 
        readOnly={readOnly} 
        onInlineChange={handleInlineChange}
        onIconClick={handleAdvantageIconClick}
      />
      {!readOnly && (
        <div className="bg-gray-900 p-0 rounded-b-lg shadow-xl mt-0">
          <OverviewAndAdvantagesPanel 
            localConfig={localConfig} 
            onPanelChange={handlePanelChange}
            onAddAdvantage={handleAddAdvantage}
            onRemoveAdvantage={handleRemoveAdvantage}
          />
        </div>
      )}
      {/* Basic IconSelectorModal - Consider enhancing or using a shared one */}
      {isIconModalOpen && (
        <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 100, border: '1px solid #ccc', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
          <h4>Select Icon</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '300px', overflowY: 'auto'}}>
            {Object.keys(LucideIcons).map(iconKey => {
              const IconComp = LucideIcons[iconKey];
              return (
                <button key={iconKey} onClick={() => handleIconSelectForAdvantage(iconKey)} title={iconKey} style={{padding: '8px', border: '1px solid #eee', borderRadius: '4px'}}>
                  <IconComp size={24} />
                </button>
              );
            })}
          </div>
          <button onClick={() => setIsIconModalOpen(false)} style={{marginTop: '15px', padding: '8px 12px', backgroundColor: '#eee', border: 'none', borderRadius: '4px'}}>Close</button>
        </div>
      )}
    </>
  );
}

OverviewAndAdvantagesBlock.propTypes = {
  config: PropTypes.shape({
    heading: PropTypes.string,
    description: PropTypes.string,
    bullets: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      desc: PropTypes.string,
      // icon field could be added here if icons per bullet are needed
    })),
    footnote: PropTypes.string,
    backgroundColor: PropTypes.string,
    headingColor: PropTypes.string,
    descriptionColor: PropTypes.string,
    bulletTitleColor: PropTypes.string,
    bulletDescColor: PropTypes.string,
    bulletIconColor: PropTypes.string,
  }), // config is not .isRequired, defaults are provided in useState
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

OverviewAndAdvantagesBlock.EditorPanel = function OverviewAndAdvantagesEditorPanel({ currentConfig, onPanelConfigChange }) {
  const [formData, setFormData] = useState(currentConfig || {});

  useEffect(() => {
    setFormData(currentConfig || {});
  }, [currentConfig]);

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onPanelConfigChange(newFormData); 
  };

  const handleBulletChange = (index, field, value) => {
    const updatedBullets = (formData.bullets || []).map((bullet, i) => 
      i === index ? { ...bullet, [field]: value } : bullet
    );
    handleChange('bullets', updatedBullets);
  };

  const handleAddBullet = () => {
    const newBullet = { title: 'New Advantage', desc: 'Description for new advantage.' };
    handleChange('bullets', [...(formData.bullets || []), newBullet]);
  };

  const handleRemoveBullet = (index) => {
    const updatedBullets = (formData.bullets || []).filter((_, i) => i !== index);
    handleChange('bullets', updatedBullets);
  };

  return (
    <div className="space-y-4 p-2 bg-gray-50 rounded-md shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Heading (Panel Edit):</label>
        <input type="text" value={formData.heading || ''} onChange={(e) => handleChange('heading', e.target.value)} className="input-class input-heading-oa-panel" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description (Panel Edit):</label>
        <textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="input-class resize-none input-description-oa-panel" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Footnote (Panel Edit):</label>
        <textarea value={formData.footnote || ''} onChange={(e) => handleChange('footnote', e.target.value)} rows={2} className="input-class resize-none input-description-oa-panel" />
      </div>

      <h4 className="text-md font-semibold text-gray-700 pt-2 border-t mt-4">Color Scheme</h4>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm font-medium">Background:</label><input type="color" value={formData.backgroundColor || '#F3F4F6'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="input-color-class" /></div>
        <div><label className="text-sm font-medium">Heading Text:</label><input type="color" value={formData.headingColor || '#111827'} onChange={(e) => handleChange('headingColor', e.target.value)} className="input-color-class" /></div>
        <div><label className="text-sm font-medium">Desc/Footnote Text:</label><input type="color" value={formData.descriptionColor || '#374151'} onChange={(e) => handleChange('descriptionColor', e.target.value)} className="input-color-class" /></div>
        <div><label className="text-sm font-medium">Bullet Title Text:</label><input type="color" value={formData.bulletTitleColor || '#1F2937'} onChange={(e) => handleChange('bulletTitleColor', e.target.value)} className="input-color-class" /></div>
        <div><label className="text-sm font-medium">Bullet Desc Text:</label><input type="color" value={formData.bulletDescColor || '#4B5563'} onChange={(e) => handleChange('bulletDescColor', e.target.value)} className="input-color-class" /></div>
        <div><label className="text-sm font-medium">Bullet Icon:</label><input type="color" value={formData.bulletIconColor || '#10B981'} onChange={(e) => handleChange('bulletIconColor', e.target.value)} className="input-color-class" /></div>
      </div>

      <h4 className="text-md font-semibold text-gray-700 pt-2 border-t mt-4">Manage Bullets/Advantages</h4>
      {(formData.bullets || []).map((bullet, index) => (
        <div key={index} className="p-2 border border-gray-200 rounded bg-white">
          <div className="flex justify-between items-center mb-1">
            <h5 className="text-sm font-semibold">Bullet {index + 1}</h5>
            <button onClick={() => handleRemoveBullet(index)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
          </div>
          <div><label className="text-xs">Title:</label><input type="text" value={bullet.title || ''} onChange={(e) => handleBulletChange(index, 'title', e.target.value)} className="input-xs-class input-bullet-title-oa-panel" /></div>
          <div><label className="text-xs">Description:</label><textarea value={bullet.desc || ''} onChange={(e) => handleBulletChange(index, 'desc', e.target.value)} rows={2} className="input-xs-class resize-none input-bullet-desc-oa-panel" /></div>
        </div>
      ))}
      <button onClick={handleAddBullet} className="mt-2 btn-primary-sm">+ Add Bullet</button>
      
      <style jsx>{`
        .input-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; color: #374151; }
        .input-xs-class { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; color: #374151; }
        .input-heading-oa-panel { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; /* text-3xl font-bold */ }
        .input-description-oa-panel { font-size: 1rem; line-height: 1.625; /* text-base leading-relaxed */ }
        .input-bullet-title-oa-panel { font-size: 1rem; /* text-base */ line-height: 1.5rem; /* Ensure good line height for input */ }
        .input-bullet-desc-oa-panel { /* .input-xs-class already sets font-size: 0.875rem (text-sm) */ line-height: 1.5; /* Adjust if needed for text-sm textarea */ }
        .input-color-class { margin-top: 0.25rem; height: 2rem; width: 100%; padding: 0.125rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
        .btn-primary-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; background-color: #4F46E5; color: white; border-radius: 0.375rem; font-weight: 500; }
      `}</style>
    </div>
  );
};

OverviewAndAdvantagesBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  // No onPanelFileChange needed for this block currently
};
