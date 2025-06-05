import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ThemeColorPicker from "../common/ThemeColorPicker"; // Assuming correct path

const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

// Reusable EditableField component
const EditableField = ({ value, onChange, placeholder, type='text', className, style, rows, isEditable }) => {
  if (!isEditable) {
    const Tag = type === 'textarea' ? 'div' : 'span';
    const displayValue = value || <span className="text-gray-400/70 italic">({placeholder})</span>;
    return <Tag className={`${className} ${type === 'textarea' ? 'whitespace-pre-wrap' : ''}`} style={style}>{displayValue}</Tag>;
  }
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (type === 'textarea' && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [currentValue, type]);

  const handleChange = (e) => setCurrentValue(e.target.value);
  const handleBlur = () => { if (value !== currentValue) onChange(currentValue); };
  const handleKeyDown = (e) => {
    if (type !== 'textarea' && e.key === 'Enter') { handleBlur(); e.preventDefault(); }
    else if (e.key === 'Escape') { setCurrentValue(value); inputRef.current?.blur(); }
  };
  const inputClasses = `bg-transparent border-b-2 border-dashed focus:border-gray-400/70 outline-none w-full ${className}`;
  if (type === 'textarea') {
    return <textarea ref={inputRef} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} rows={rows} />;
  }
  return <input ref={inputRef} type={type} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} />;
};

/**
 * PricingTableBlock
 * 
 * config = {
 *   showPrice: true,
 *   items: [
 *     {
 *       title: string,
 *       image: string,
 *       alt: string,
 *       description: string,
 *       rate: string
 *     },
 *     ...
 *   ]
 * }
 */
const PricingTableBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const [localConfig, setLocalConfig] = useState(() => deriveInitialLocalData(config));
  const prevReadOnlyRef = useRef(readOnly);

  function deriveInitialLocalData(inputConfig) {
    const defaultConfig = {
      sectionTitle: 'Our Pricing Plans',
      tiers: [
        { id: `tier_default_1_${Date.now()}`, name: 'Basic', price: '$29', frequency: '/month', description: 'Basic features for individuals.', features: ['Feature 1', 'Feature 2'], ctaText: 'Get Started', ctaLink: '#basic', isFeatured: false, featuredText: 'Popular' },
        { id: `tier_default_2_${Date.now()}`, name: 'Pro', price: '$79', frequency: '/month', description: 'Advanced features for professionals.', features: ['All Basic Features', 'Feature 3', 'Feature 4'], ctaText: 'Choose Pro', ctaLink: '#pro', isFeatured: true, featuredText: 'Best Value' },
        { id: `tier_default_3_${Date.now()}`, name: 'Enterprise', price: 'Contact Us', frequency: '', description: 'Custom solutions for large teams.', features: ['All Pro Features', 'Dedicated Support', 'Custom Integrations'], ctaText: 'Contact Sales', ctaLink: '#enterprise', isFeatured: false, featuredText: '' },
      ],
      titleColor: '#1A202C',
      tierNameColor: '#2D3748',
      priceColor: '#2C5282',
      descriptionColor: '#4A5568',
      featureTextColor: '#4A5568',
      ctaButtonColor: '#3182CE',
      ctaTextColor: '#FFFFFF',
      featuredBadgeColor: '#DD6B20',
      featuredBadgeTextColor: '#FFFFFF',
      tierBackgroundColor: '#FFFFFF',
      featuredTierBackgroundColor: '#EBF8FF',
    };
    const initialData = { ...defaultConfig, ...inputConfig };
    return {
      ...initialData,
      tiers: (initialData.tiers || []).map((tier, index) => ({
        ...defaultConfig.tiers[index % defaultConfig.tiers.length], // Cycle through defaults for structure
        ...tier,
        id: tier.id || `tier_init_${index}_${Date.now()}`,
        features: Array.isArray(tier.features) ? tier.features : (defaultConfig.tiers[index % defaultConfig.tiers.length]?.features || []),
      })),
    };
  }

  useEffect(() => {
    if (config) {
        setLocalConfig(prevLocal => deriveInitialLocalData(config));
    }
  }, [config]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && typeof onConfigChange === 'function') {
      onConfigChange(localConfig);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  const handleInlineChange = (path, value) => {
    if (readOnly || typeof onConfigChange !== 'function') return;
    const keys = path.split('.');
    let newConfig = JSON.parse(JSON.stringify(localConfig));
    let currentLevel = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (Array.isArray(currentLevel[key]) && keys[i+1] !== undefined) {
        const itemId = keys[i+1];
        const itemIndex = currentLevel[key].findIndex(item => item.id === itemId);
        if (itemIndex > -1) { currentLevel = currentLevel[key][itemIndex]; i++; }
        else { console.warn('Item not found in array for inline change:', path); return; }
      } else {
        currentLevel = currentLevel[key];
      }
      if (!currentLevel) { console.warn('Invalid path for inline change:', path); return; }
    }
    const finalKey = keys[keys.length - 1];
    const finalKeyIsArrayIndex = !isNaN(parseInt(finalKey, 10));

    if(Array.isArray(currentLevel) && finalKeyIsArrayIndex){
        currentLevel[parseInt(finalKey, 10)] = value;
    } else {
        currentLevel[finalKey] = value;
    }
    setLocalConfig(newConfig);
    onConfigChange(newConfig); // Live update
  };

  const addFeatureToTierInline = (tierId) => {
    if (readOnly || typeof onConfigChange !== 'function') return;
    const newConfig = JSON.parse(JSON.stringify(localConfig));
    const tierIndex = newConfig.tiers.findIndex(t => t.id === tierId);
    if (tierIndex > -1) {
      newConfig.tiers[tierIndex].features = [...(newConfig.tiers[tierIndex].features || []), 'New Feature'];
      setLocalConfig(newConfig);
      onConfigChange(newConfig);
    }
  };

  const removeFeatureFromTierInline = (tierId, featureIndex) => {
    if (readOnly || typeof onConfigChange !== 'function') return;
    const newConfig = JSON.parse(JSON.stringify(localConfig));
    const tierIndex = newConfig.tiers.findIndex(t => t.id === tierId);
    if (tierIndex > -1 && newConfig.tiers[tierIndex].features) {
      newConfig.tiers[tierIndex].features.splice(featureIndex, 1);
      setLocalConfig(newConfig);
      onConfigChange(newConfig);
    }
  };
  
  const { sectionTitle, tiers } = localConfig;
  const { titleColor, tierNameColor, priceColor, descriptionColor, featureTextColor, ctaButtonColor, ctaTextColor, featuredBadgeColor, featuredBadgeTextColor, tierBackgroundColor, featuredTierBackgroundColor } = localConfig;
  
  return (
    <div className={`pricing-table-block py-8 md:py-12 ${!readOnly ? 'bg-slate-50 border-2 border-blue-300/50' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4">
          <EditableField 
            value={sectionTitle} 
            onChange={(val) => handleInlineChange('sectionTitle', val)} 
            placeholder="Section Title" 
            className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 block mx-auto" 
            style={{ color: titleColor }} 
            isEditable={!readOnly}
          />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {(tiers || []).map((tier) => (
            <div
              key={tier.id}
              className={`p-6 rounded-xl shadow-lg flex flex-col relative overflow-hidden ${tier.isFeatured ? 'border-2' : 'border'}`}
              style={{
                backgroundColor: tier.isFeatured ? featuredTierBackgroundColor : tierBackgroundColor,
                borderColor: tier.isFeatured ? featuredBadgeColor : '#E2E8F0'
              }}
            >
              {tier.isFeatured && (
                  <EditableField 
                    value={tier.featuredText || 'Featured'} 
                    onChange={(val) => handleInlineChange(`tiers.${tier.id}.featuredText`, val)} 
                    placeholder="Badge Text" 
                    className="absolute top-2.5 right-[-35px] transform rotate-45 w-[150px] text-xs font-semibold tracking-wider uppercase text-center bg-transparent border-0 z-20" 
                    style={{ backgroundColor: 'transparent', color: featuredBadgeTextColor}}
                    isEditable={!readOnly}
                  />
              )}
              {/* This div creates the visual banner part, text is overlaid */} 
              {tier.isFeatured && <div className="absolute top-0 -right-10 transform rotate-45 px-8 py-1 z-10 pointer-events-none" style={{ backgroundColor: featuredBadgeColor }}><span className="opacity-0">{tier.featuredText || 'Featured'}</span></div>}

              <EditableField value={tier.name} onChange={(val) => handleInlineChange(`tiers.${tier.id}.name`, val)} placeholder="Tier Name" className="text-2xl font-semibold mb-2" style={{ color: tierNameColor }} isEditable={!readOnly}/>
              
              <div className="flex items-baseline mb-1">
                <EditableField value={tier.price} onChange={(val) => handleInlineChange(`tiers.${tier.id}.price`, val)} placeholder="$XX" className="text-4xl font-bold w-auto mr-1" style={{ color: priceColor }} isEditable={!readOnly}/>
                <EditableField value={tier.frequency} onChange={(val) => handleInlineChange(`tiers.${tier.id}.frequency`, val)} placeholder="/month" className="text-lg font-normal w-auto" style={{ color: descriptionColor }} isEditable={!readOnly}/>
              </div>
              <EditableField value={tier.description} onChange={(val) => handleInlineChange(`tiers.${tier.id}.description`, val)} placeholder="Tier description" className="text-sm mb-6 min-h-[40px] resize-none" style={{ color: descriptionColor }} type="textarea" rows={2} isEditable={!readOnly}/>

              <ul className="space-y-3 flex-grow mb-8">
                {(tier.features || []).map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <EditableField value={feature} onChange={(val) => handleInlineChange(`tiers.${tier.id}.features.${featureIndex}`, val)} placeholder="Feature description" className="text-sm flex-1" style={{ color: featureTextColor }} isEditable={!readOnly}/>
                    {!readOnly && <button onClick={() => removeFeatureFromTierInline(tier.id, featureIndex)} className="ml-2 text-red-400 hover:text-red-600 text-xs p-0.5">✕</button>}
                  </li>
                ))}
                {!readOnly && <button onClick={() => addFeatureToTierInline(tier.id)} className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium">+ Add feature</button>}
              </ul>

              <div className="mt-auto">
                  <EditableField 
                    value={tier.ctaText} 
                    onChange={(val) => handleInlineChange(`tiers.${tier.id}.ctaText`, val)} 
                    placeholder="Button Text" 
                    className="block w-full text-center py-3 px-6 rounded-lg font-semibold border border-dashed mb-2" 
                    style={{ backgroundColor: ctaButtonColor, color: ctaTextColor, borderColor: ctaButtonColor ? 'transparent' : ctaTextColor }} 
                    isEditable={!readOnly} 
                  />
                {!readOnly && (
                  <EditableField 
                    value={tier.ctaLink} 
                    onChange={(val) => handleInlineChange(`tiers.${tier.id}.ctaLink`, val)} 
                    placeholder="Button Link (#contact)" 
                    className="block w-full text-center py-1 px-2 rounded-md text-xs mt-1 border-b border-dashed" 
                    style={{color: descriptionColor}}
                    isEditable={!readOnly}
                  />
                )}
                {readOnly && (
                    <a href={tier.ctaLink || '#'} className="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors hover:opacity-90" style={{ backgroundColor: ctaButtonColor, color: ctaTextColor }}>{tier.ctaText}</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

PricingTableBlock.propTypes = {
  config: PropTypes.shape({
    sectionTitle: PropTypes.string,
    tiers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      price: PropTypes.string,
      frequency: PropTypes.string,
      description: PropTypes.string,
      features: PropTypes.arrayOf(PropTypes.string),
      ctaText: PropTypes.string,
      ctaLink: PropTypes.string,
      isFeatured: PropTypes.bool,
      featuredText: PropTypes.string,
    })),
    titleColor: PropTypes.string,
    tierNameColor: PropTypes.string,
    priceColor: PropTypes.string,
    descriptionColor: PropTypes.string,
    featureTextColor: PropTypes.string,
    ctaButtonColor: PropTypes.string,
    ctaTextColor: PropTypes.string,
    featuredBadgeColor: PropTypes.string,
    featuredBadgeTextColor: PropTypes.string,
    tierBackgroundColor: PropTypes.string,
    featuredTierBackgroundColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

PricingTableBlock.tabsConfig = (currentConfig, onPanelChange, themeColors) => {
  const { tiers = [] } = currentConfig;

  const handleTierUpdateInPanel = (tierId, field, value) => {
    const updatedTiers = tiers.map(tier => 
      tier.id === tierId ? { ...tier, [field]: value } : tier
    );
    onPanelChange({ ...currentConfig, tiers: updatedTiers });
  };

  const addTierToPanel = () => {
    const newTier = {
      id: `tier_panel_${Date.now()}`,
      name: 'New Plan', price: '$0', frequency: '/month', 
      description: 'New plan description.', features: ['Feature A'], 
      ctaText: 'Sign Up', ctaLink: '#new', 
      isFeatured: false, featuredText: ''
    };
    onPanelChange({ ...currentConfig, tiers: [...tiers, newTier] });
  };

  const removeTierFromPanel = (tierIdToRemove) => {
    onPanelChange({ ...currentConfig, tiers: tiers.filter(tier => tier.id !== tierIdToRemove) });
  };

  const colorPickerProps = (label, fieldName, defaultColor) => ({
    label,
    fieldName,
    currentColorValue: currentConfig[fieldName] || defaultColor,
    onColorChange: (name, value) => onPanelChange({ ...currentConfig, [name]: value }),
    themeColors,
  });
  
  const colorFields = [
    { label: 'Section Title Color', field: 'titleColor', default: '#1A202C' },
    { label: 'Tier Name Color', field: 'tierNameColor', default: '#2D3748' },
    { label: 'Price Color', field: 'priceColor', default: '#2C5282' },
    { label: 'Description Color', field: 'descriptionColor', default: '#4A5568' },
    { label: 'Feature Text Color', field: 'featureTextColor', default: '#4A5568' },
    { label: 'CTA Button Color', field: 'ctaButtonColor', default: '#3182CE' },
    { label: 'CTA Text Color', field: 'ctaTextColor', default: '#FFFFFF' },
    { label: 'Featured Badge BG', field: 'featuredBadgeColor', default: '#DD6B20' },
    { label: 'Featured Badge Text', field: 'featuredBadgeTextColor', default: '#FFFFFF' },
    { label: 'Tier Background', field: 'tierBackgroundColor', default: '#FFFFFF' },
    { label: 'Featured Tier BG', field: 'featuredTierBackgroundColor', default: '#EBF8FF' },
  ];

  return {
    general: () => (
      <div className="p-4 space-y-4">
         <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Manage Pricing Tiers</h3>
         <p className="text-xs text-gray-500 mb-3">Tier names, prices, descriptions, features, and CTA text/links are editable directly on the block preview.</p>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-md font-semibold text-gray-700">Tiers:</h4>
          <button onClick={addTierToPanel} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md shadow">+ Add Tier</button>
        </div>
        <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-1">
          {tiers.map((tier) => (
            <div key={tier.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center shadow-sm">
              <span className="text-sm text-gray-700 font-medium truncate w-2/3" title={tier.name}>{tier.name || '(Untitled Tier)'}</span>
              <div className="flex items-center space-x-2">
                <label htmlFor={`featured-${tier.id}`} className="text-xs text-gray-600 flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id={`featured-${tier.id}`} 
                        checked={tier.isFeatured || false} 
                        onChange={(e) => handleTierUpdateInPanel(tier.id, 'isFeatured', e.target.checked)} 
                        className="form-checkbox h-3.5 w-3.5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-400 focus:ring-offset-0"
                    />
                    <span className="ml-1.5">Featured</span>
                </label>
                <button onClick={() => removeTierFromPanel(tier.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold p-0.5 hover:bg-red-100 rounded-full">✕ Remove</button>
              </div>
            </div>
          ))}
          {tiers.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No pricing tiers defined.</p>}
        </div>
      </div>
    ),
    colors: () => (
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Color Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
          {colorFields.map(cf => (
            <div key={cf.field}>
              <ThemeColorPicker {...colorPickerProps(cf.label, cf.field, cf.default)} />
            </div>
          ))}
        </div>
      </div>
    ),
  };
};

export default PricingTableBlock; 