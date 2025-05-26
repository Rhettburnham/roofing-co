import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

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
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      sectionTitle: 'Our Pricing Plans',
      tiers: [
        { id: `tier_${Date.now()}_1`, name: 'Basic', price: '$29', frequency: '/month', description: 'Basic features for individuals.', features: ['Feature 1', 'Feature 2'], ctaText: 'Get Started', ctaLink: '#basic', isFeatured: false, featuredText: 'Popular' },
        { id: `tier_${Date.now()}_2`, name: 'Pro', price: '$79', frequency: '/month', description: 'Advanced features for professionals.', features: ['All Basic Features', 'Feature 3', 'Feature 4'], ctaText: 'Choose Pro', ctaLink: '#pro', isFeatured: true, featuredText: 'Best Value' },
        { id: `tier_${Date.now()}_3`, name: 'Enterprise', price: 'Contact Us', frequency: '', description: 'Custom solutions for large teams.', features: ['All Pro Features', 'Dedicated Support', 'Custom Integrations'], ctaText: 'Contact Sales', ctaLink: '#enterprise', isFeatured: false, featuredText: '' },
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
    const initialData = config || {};
    return {
      ...defaultConfig,
      ...initialData,
      tiers: (initialData.tiers || defaultConfig.tiers).map((tier, index) => ({
        ...defaultConfig.tiers[0],
        ...tier,
        id: tier.id || `tier_init_${index}_${Date.now()}`,
        features: tier.features || [],
      })),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newTiers = (config.tiers || []).map((propTier) => {
          const localTier = prevLocal.tiers.find(lt => lt.id === propTier.id) || {}; 
          return {
            ...localTier,
            ...propTier,
            id: propTier.id || localTier.id || `tier_prop_${Date.now()}`,
            name: readOnly ? (propTier.name ?? localTier.name) : localTier.name,
            price: readOnly ? (propTier.price ?? localTier.price) : localTier.price,
            frequency: readOnly ? (propTier.frequency ?? localTier.frequency) : localTier.frequency,
            description: readOnly ? (propTier.description ?? localTier.description) : localTier.description,
            features: readOnly ? (propTier.features ?? localTier.features) : localTier.features,
            ctaText: readOnly ? (propTier.ctaText ?? localTier.ctaText) : localTier.ctaText,
            ctaLink: readOnly ? (propTier.ctaLink ?? localTier.ctaLink) : localTier.ctaLink,
            featuredText: readOnly ? (propTier.featuredText ?? localTier.featuredText) : localTier.featuredText,
            isFeatured: propTier.isFeatured !== undefined ? propTier.isFeatured : localTier.isFeatured,
          };
        });

        return {
          ...prevLocal,
          ...config,
          sectionTitle: readOnly ? (config.sectionTitle ?? prevLocal.sectionTitle) : prevLocal.sectionTitle,
          tiers: newTiers,
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

  const handleLocalChange = (path, value) => {
    if (readOnly) return;
    const [field, tierId, itemField, featureIndexStr] = path.split('.');

    setLocalConfig(prev => {
      if (field === 'tiers' && tierId) {
        const newTiers = prev.tiers.map(tier => {
          if (tier.id === tierId) {
            if (itemField === 'features' && featureIndexStr !== undefined) {
              const featureIndex = parseInt(featureIndexStr, 10);
              const newFeatures = tier.features.map((feat, fIdx) => fIdx === featureIndex ? value : feat);
              return { ...tier, features: newFeatures };
            }
            return { ...tier, [itemField]: value };
          }
          return tier;
        });
        return { ...prev, tiers: newTiers };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const handlePanelDataChange = (newData) => {
    if (readOnly) return;
    setLocalConfig(prev => ({ ...prev, ...newData }));
  };

  const addFeatureToTierInline = (tierId) => {
    if (readOnly) return;
    setLocalConfig(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId ? { ...tier, features: [...(tier.features || []), 'New Feature'] } : tier
      )
    }));
  };

  const removeFeatureFromTierInline = (tierId, featureIndex) => {
    if (readOnly) return;
    setLocalConfig(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => {
        if (tier.id === tierId) {
          return { ...tier, features: tier.features.filter((_, fIdx) => fIdx !== featureIndex) };
        }
        return tier;
      })
    }));
  };

  const { sectionTitle, tiers } = localConfig;
  const { titleColor, tierNameColor, priceColor, descriptionColor, featureTextColor, ctaButtonColor, ctaTextColor, featuredBadgeColor, featuredBadgeTextColor, tierBackgroundColor, featuredTierBackgroundColor } = localConfig;

  const EditableField = ({ value, onChange, placeholder, type='text', className, style, rows}) => (
    type === 'textarea' ?
    <textarea value={value} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} rows={rows} /> :
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} />
  );
  
  return (
    <>
      <div className="pricing-table-block py-8 md:py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          {readOnly ? (
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12" style={{ color: titleColor }}>{sectionTitle}</h2>
          ) : (
            <EditableField value={sectionTitle} onChange={(e) => handleLocalChange('sectionTitle', e.target.value)} placeholder="Section Title" className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 block mx-auto" style={{ color: titleColor }} />
          )}
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
                  readOnly ? (
                    <div className="absolute top-0 -right-10 transform rotate-45 px-8 py-1 text-xs font-semibold tracking-wider uppercase z-10" style={{ backgroundColor: featuredBadgeColor, color: featuredBadgeTextColor }}>{tier.featuredText || 'Featured'}</div>
                  ) : (
                    <>
                      <EditableField value={tier.featuredText || 'Featured'} onChange={(e) => handleLocalChange(`tiers.${tier.id}.featuredText`, e.target.value)} placeholder="Badge Text" className="absolute top-2.5 right-[-35px] transform rotate-45 w-[150px] text-xs font-semibold tracking-wider uppercase text-center bg-transparent border-0 z-20" style={{ backgroundColor: 'transparent', color: featuredBadgeTextColor}}/>
                      <div className="absolute top-0 -right-10 transform rotate-45 px-8 py-1 z-10 pointer-events-none" style={{ backgroundColor: featuredBadgeColor, color: featuredBadgeTextColor}}><span className="opacity-0">{tier.featuredText || 'Featured'}</span></div>
                    </>
                  )
                )}

                {readOnly ? <h3 className="text-2xl font-semibold mb-2" style={{ color: tierNameColor }}>{tier.name}</h3> : <EditableField value={tier.name} onChange={(e) => handleLocalChange(`tiers.${tier.id}.name`, e.target.value)} placeholder="Tier Name" className="text-2xl font-semibold mb-2" style={{ color: tierNameColor }} />}
                
                {readOnly ? <p className="text-4xl font-bold mb-1" style={{ color: priceColor }}>{tier.price}<span className="text-lg font-normal" style={{ color: descriptionColor }}>{tier.frequency}</span></p> :
                  <div className="flex items-baseline mb-1">
                    <EditableField value={tier.price} onChange={(e) => handleLocalChange(`tiers.${tier.id}.price`, e.target.value)} placeholder="$XX" className="text-4xl font-bold w-auto mr-1" style={{ color: priceColor }} />
                    <EditableField value={tier.frequency} onChange={(e) => handleLocalChange(`tiers.${tier.id}.frequency`, e.target.value)} placeholder="/month" className="text-lg font-normal w-auto" style={{ color: descriptionColor }} />
                  </div>}
                {readOnly ? <p className="text-sm mb-6 min-h-[40px]" style={{ color: descriptionColor }}>{tier.description}</p> : <EditableField value={tier.description} onChange={(e) => handleLocalChange(`tiers.${tier.id}.description`, e.target.value)} placeholder="Tier description" className="text-sm mb-6 min-h-[40px] resize-none" style={{ color: descriptionColor }} type="textarea" rows={2}/>}

                <ul className="space-y-3 flex-grow mb-8">
                  {(tier.features || []).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      {readOnly ? <span style={{ color: featureTextColor }}>{feature}</span> :
                        <div className="flex-grow flex items-center">
                          <EditableField value={feature} onChange={(e) => handleLocalChange(`tiers.${tier.id}.features.${featureIndex}`, e.target.value)} placeholder="Feature description" className="text-sm" style={{ color: featureTextColor }} />
                          <button onClick={() => removeFeatureFromTierInline(tier.id, featureIndex)} className="ml-2 text-red-500 hover:text-red-700 text-xs p-1">✕</button>
                        </div>
                      }
                    </li>
                  ))}
                  {!readOnly && <button onClick={() => addFeatureToTierInline(tier.id)} className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">+ Add feature</button>}
                </ul>

                <div className="mt-auto">
                  {readOnly ? (
                    <a href={tier.ctaLink || '#'} className="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors hover:opacity-90" style={{ backgroundColor: ctaButtonColor, color: ctaTextColor }}>{tier.ctaText}</a>
                  ) : (
                    <>
                      <EditableField value={tier.ctaText} onChange={(e) => handleLocalChange(`tiers.${tier.id}.ctaText`, e.target.value)} placeholder="Button Text" className="block w-full text-center py-3 px-6 rounded-lg font-semibold border border-dashed mb-2" style={{ backgroundColor: ctaButtonColor, color: ctaTextColor, borderColor: ctaTextColor }} />
                      <EditableField value={tier.ctaLink} onChange={(e) => handleLocalChange(`tiers.${tier.id}.ctaLink`, e.target.value)} placeholder="Button Link (#contact)" className="block w-full text-center py-1 px-2 rounded-md text-xs mt-1" style={{color: descriptionColor}}/>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!readOnly && (
        <PricingTableBlock.EditorPanel currentConfig={localConfig} onPanelConfigChange={handlePanelDataChange} />
      )}
    </>
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

PricingTableBlock.EditorPanel = ({ currentConfig, onPanelConfigChange }) => {
  const { tiers = [] } = currentConfig;

  const handleTierUpdate = (tierId, field, value) => {
    const updatedTiers = tiers.map(tier => 
      tier.id === tierId ? { ...tier, [field]: value } : tier
    );
    onPanelConfigChange({ tiers: updatedTiers });
  };

  const addTier = () => {
    const newTier = {
      id: `tier_${Date.now()}`,
      name: 'New Plan', price: '$0', frequency: '/month', 
      description: 'New plan description.', features: ['Feature A'], 
      ctaText: 'Sign Up', ctaLink: '#new', 
      isFeatured: false, featuredText: ''
    };
    onPanelConfigChange({ tiers: [...tiers, newTier] });
  };

  const removeTier = (tierIdToRemove) => {
    onPanelConfigChange({ tiers: tiers.filter(tier => tier.id !== tierIdToRemove) });
  };

  const handleColorChange = (field, value) => {
    onPanelConfigChange({ [field]: value });
  };

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

  return (
    <div className="p-4 bg-gray-800 text-white rounded-b-md space-y-6">
      <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Pricing Table Settings</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-200">Pricing Tiers:</h4>
          <button onClick={addTier} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium">+ Add Tier</button>
        </div>
        <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2">
          {tiers.map((tier) => (
            <div key={tier.id} className="p-3 bg-gray-750 rounded-md border border-gray-600 flex justify-between items-center">
              <span className="text-gray-200 text-sm truncate w-2/3" title={tier.name}>{tier.name || '(Untitled Tier)'}</span>
              <div className="flex items-center space-x-2">
                 <label htmlFor={`featured-${tier.id}`} className="text-xs text-gray-300 flex items-center">
                    <input 
                        type="checkbox" 
                        id={`featured-${tier.id}`} 
                        checked={tier.isFeatured || false} 
                        onChange={(e) => handleTierUpdate(tier.id, 'isFeatured', e.target.checked)} 
                        className="form-checkbox h-4 w-4 text-orange-500 bg-gray-600 border-gray-500 rounded mr-1.5 focus:ring-orange-400"
                    />
                    Featured
                </label>
                <button onClick={() => removeTier(tier.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Remove</button>
              </div>
            </div>
          ))}
          {tiers.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No pricing tiers defined. Add one to get started.</p>}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-lg font-medium text-gray-200 mb-3">Color Customization:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
          {colorFields.map(cf => (
            <div key={cf.field}>
              <label className="block text-xs font-medium text-gray-300 mb-1">{cf.label}:</label>
              <input 
                type="color" 
                value={currentConfig[cf.field] || cf.default} 
                onChange={(e) => handleColorChange(cf.field, e.target.value)} 
                className="mt-1 h-9 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer p-0.5"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

PricingTableBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
};

export default PricingTableBlock; 