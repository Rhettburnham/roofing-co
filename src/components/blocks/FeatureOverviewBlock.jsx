import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as LucideIcons from "lucide-react";
import { FaTrash, FaPlus } from 'react-icons/fa';
import ThemeColorPicker from '../common/ThemeColorPicker';

/**
 * FeatureOverviewBlock
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

const EditableField = ({ value, onChange, placeholder, type = 'text', className, style, rows }) => (
  type === 'textarea' ?
    <textarea value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} rows={rows} /> :
    <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} />
);

function FeatureOverviewPreview({ localConfig, readOnly, onInlineChange, onIconClick }) {
  const {
    overviewTitle, overviewText, advantagesTitle, advantages,
    overviewTitleColor, overviewTextColor, advantagesTitleColor, advantageTextColor, advantageIconColor, backgroundColor
  } = localConfig;

  const getIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <IconComponent />;
  };

  return (
    <section className="py-8 md:py-12 px-4 md:px-8" style={{ backgroundColor: backgroundColor || '#F9FAFB' }}>
      <div className="max-w-5xl mx-auto">
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

FeatureOverviewPreview.propTypes = {
  localConfig: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onInlineChange: PropTypes.func.isRequired,
  onIconClick: PropTypes.func,
};

const FeatureOverviewBlock = ({
  config = {},
  readOnly = true,
  onConfigChange,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      overviewTitle: 'Project Overview',
      overviewText: 'Detailed description of the project, its goals, and expected outcomes. This section provides a comprehensive look at what the project entails.',
      advantagesTitle: 'Key Advantages',
      advantages: [
        { id: `adv_${Date.now()}_1`, text: 'High-quality materials', icon: 'CheckCircle' },
        { id: `adv_${Date.now()}_2`, text: 'Experienced team', icon: 'Users' },
        { id: `adv_${Date.now()}_3`, text: 'Timely completion', icon: 'Clock' },
      ],
      overviewTitleColor: '#1A202C',
      overviewTextColor: '#4A5568',
      advantagesTitleColor: '#1A202C',
      advantageTextColor: '#333333',
      advantageIconColor: '#2C5282',
      backgroundColor: '#F9FAFB'
    };
    const initialData = { ...defaultConfig, ...config };
    return {
      ...initialData,
      advantages: (initialData.advantages || []).map((adv, idx) => ({
        ...defaultConfig.advantages[0],
        ...adv,
        id: adv.id || `adv_init_${idx}_${Date.now()}`,
        icon: adv.icon || 'CheckCircle',
      }))
    };
  });

  const prevReadOnlyRef = useRef(readOnly);
  const [editingAdvantageIconIndex, setEditingAdvantageIconIndex] = useState(null);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

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
      <FeatureOverviewPreview 
        localConfig={localConfig} 
        readOnly={readOnly} 
        onInlineChange={handleInlineChange}
        onIconClick={handleAdvantageIconClick}
      />
      {!readOnly && (
        <div className="bg-gray-900 p-0 rounded-b-lg shadow-xl mt-0">
          <FeatureOverviewPanel 
            localConfig={localConfig} 
            onPanelChange={handlePanelChange}
            onAddAdvantage={handleAddAdvantage}
            onRemoveAdvantage={handleRemoveAdvantage}
          />
        </div>
      )}
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

FeatureOverviewBlock.propTypes = {
  config: PropTypes.shape({
    overviewTitle: PropTypes.string,
    overviewText: PropTypes.string,
    advantagesTitle: PropTypes.string,
    advantages: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      text: PropTypes.string,
      icon: PropTypes.string,
    })),
    overviewTitleColor: PropTypes.string,
    overviewTextColor: PropTypes.string,
    advantagesTitleColor: PropTypes.string,
    advantageTextColor: PropTypes.string,
    advantageIconColor: PropTypes.string,
    backgroundColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

FeatureOverviewBlock.tabsConfig = (config, onPanelChange, themeColors) => {
  const { advantages = [] } = config;

  const handlePanelColorChange = (fieldName, value) => {
    onPanelChange({ ...config, [fieldName]: value });
  };

  const handleAddAdvantageFromPanel = () => {
    const newAdvantage = {
      id: `adv_panel_${Date.now()}`,
      text: 'New Advantage from Panel',
      icon: config.advantages?.[0]?.icon || 'CheckCircle', // Default to first item's icon or CheckCircle
    };
    onPanelChange({ ...config, advantages: [...advantages, newAdvantage] });
  };

  const handleRemoveAdvantageFromPanel = (indexToRemove) => {
    const newAdvantages = advantages.filter((_, index) => index !== indexToRemove);
    onPanelChange({ ...config, advantages: newAdvantages });
  };
  
  const colorPickerProps = (label, fieldName, defaultColor) => ({
    label,
    fieldName,
    currentColorValue: config[fieldName] || defaultColor,
    onColorChange: handlePanelColorChange, // Direct pass since it expects (field, value)
    themeColors,
    className: "text-xs"
  });

  return {
    general: () => (
      <div className="p-3 space-y-3">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 text-center border-b pb-1.5">Manage Advantages</h3>
        <p className="text-xs text-gray-500 mb-2">Advantage text and icons are edited directly on the block preview.</p>
        {(advantages || []).map((adv, idx) => (
          <div key={adv.id || idx} className="flex items-center justify-between p-1.5 bg-gray-100 rounded-md shadow-sm">
            <span className="text-xs text-gray-600 truncate pr-2">{idx + 1}. {adv.text || '(Untitled Advantage)'}</span>
            <button
              type="button"
              onClick={() => handleRemoveAdvantageFromPanel(idx)}
              className="p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors flex-shrink-0"
              title="Remove Advantage"
            >
              <FaTrash size={10} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddAdvantageFromPanel}
          className="w-full mt-2 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1.5 rounded-md shadow flex items-center justify-center"
        >
          <FaPlus size={10} className="mr-1" /> Add Advantage
        </button>
        {(!advantages || advantages.length === 0) && <p className="text-xs text-gray-400 text-center italic mt-2">No advantages defined.</p>}
      </div>
    ),
    colors: () => (
      <div className="p-3 space-y-3">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 text-center border-b pb-1.5">Color Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ThemeColorPicker {...colorPickerProps("Overall BG Color", "backgroundColor", "#F9FAFB")} />
          <ThemeColorPicker {...colorPickerProps("Overview Title Color", "overviewTitleColor", "#1A202C")} />
          <ThemeColorPicker {...colorPickerProps("Overview Text Color", "overviewTextColor", "#4A5568")} />
          <ThemeColorPicker {...colorPickerProps("Advantages Title Color", "advantagesTitleColor", "#1A202C")} />
          <ThemeColorPicker {...colorPickerProps("Advantage Text Color", "advantageTextColor", "#333333")} />
          <ThemeColorPicker {...colorPickerProps("Advantage Icon Color", "advantageIconColor", "#2C5282")} />
        </div>
      </div>
    ),
  };
};

export default FeatureOverviewBlock; 