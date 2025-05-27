// src/components/blocks/ListDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown'; // Make sure this is installed or comment it out if not
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'; // Using Heroicons for +/-
import { ChevronDown, ChevronUp } from 'lucide-react'; // Using lucide-react for icons

/**
 * ListDropdown
 * 
 * config = {
 *   title: string,
 *   items: [
 *     {
 *       title: string,
 *       content: string,
 *       // Legacy properties still supported:
 *       causes?: string,
 *       impact?: string,
 *       diagnosis?: string[],
 *     },
 *     ...
 *   ],
 *   textColor: "#000000"
 * }
 */
const ListDropdownBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      title: 'Frequently Asked Questions',
      items: [
        { id: 1, title: 'What is your return policy?', content: 'Our return policy lasts 30 days...' },
        { id: 2, title: 'How do I track my order?', content: 'You can track your order using the link...' },
      ],
      openMultiple: false, // Allow multiple items to be open at once
      backgroundColor: '#FFFFFF',
      titleColor: '#1A202C',
      itemTitleColor: '#2D3748',
      itemContentColor: '#4A5568',
      iconColor: '#718096',
      borderColor: '#E2E8F0',
    };
    return { ...defaultConfig, ...config };
  });

  const [openIndices, setOpenIndices] = useState([]);
  const titleRef = useRef(null);
  const itemRefs = useRef({}); // For item title and content textareas

  useEffect(() => {
    const defaultConfig = { /* ... same as above ... */ };
    const newEffectiveConfig = { ...defaultConfig, ...(config || {}) };
    if (readOnly || JSON.stringify(newEffectiveConfig) !== JSON.stringify(localConfig)) {
      setLocalConfig(newEffectiveConfig);
    }
    // Reset open state if items change or openMultiple changes
    if (config && (JSON.stringify(config.items) !== JSON.stringify(localConfig.items) || config.openMultiple !== localConfig.openMultiple)) {
      setOpenIndices([]);
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (!readOnly) {
      if (titleRef.current) {
        titleRef.current.style.height = 'auto';
        titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
      }
      (localConfig.items || []).forEach((_, index) => {
        if (itemRefs.current[index]) {
          Object.values(itemRefs.current[index]).forEach(ref => {
            if (ref && ref.current) {
              ref.current.style.height = 'auto';
              ref.current.style.height = `${ref.current.scrollHeight}px`;
            }
          });
        }
      });
    }
  }, [localConfig.title, localConfig.items, readOnly]);

  const handleInputChange = (field, value, itemIndex = null, subField = null) => {
    setLocalConfig(prev => {
      let updatedConfig;
      if (itemIndex !== null && subField) {
        const updatedItems = prev.items.map((item, i) => 
          i === itemIndex ? { ...item, [subField]: value } : item
        );
        updatedConfig = { ...prev, items: updatedItems };
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

  const toggleItem = (index) => {
    if (localConfig.openMultiple) {
      setOpenIndices(prev => 
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndices(prev => (prev.includes(index) ? [] : [index]));
    }
  };

  const getItemRef = (itemIndex, field) => (el) => {
    if (!itemRefs.current[itemIndex]) itemRefs.current[itemIndex] = {};
    itemRefs.current[itemIndex][field] = { current: el }; 
  };

  const { 
    title, items, backgroundColor, titleColor, itemTitleColor, 
    itemContentColor, iconColor, borderColor 
  } = localConfig;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4" style={{ backgroundColor }}>
      {readOnly ? (
        <h2 className="text-2xl font-semibold text-center mb-6" style={{ color: titleColor }}>{title}</h2>
      ) : (
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          onBlur={handleBlur}
          className="text-2xl font-semibold text-center mb-6 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 w-full resize-none"
          rows={1} placeholder="Section Title" style={{ color: titleColor }}
        />
      )}
      <div className="space-y-3">
        {(items || []).map((item, index) => (
          <div key={item.id || index} className="border rounded-lg" style={{ borderColor }}>
            <button 
              onClick={() => !readOnly && toggleItem(index)} 
              disabled={readOnly} // Button is only for visual toggling in readOnly mode if content is visible
              className={`w-full flex justify-between items-center p-4 text-left focus:outline-none ${readOnly ? 'cursor-default' : 'hover:bg-gray-50'}`}
              style={{ color: itemTitleColor, backgroundColor: readOnly ? 'transparent' : (openIndices.includes(index) ? '#f0f0f0' : 'transparent') }}
            >
              {readOnly ? (
                <span className="font-medium">{item.title}</span>
              ) : (
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => handleInputChange(null, e.target.value, index, 'title')}
                  onBlur={handleBlur}
                  className="font-medium bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-[calc(100%-2rem)]"
                  placeholder="Question/Title" style={{ color: 'inherit' }}
                  onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking input
                />
              )}
              {openIndices.includes(index) ? 
                <ChevronUp size={20} style={{ color: iconColor }} /> : 
                <ChevronDown size={20} style={{ color: iconColor }} />
              }
            </button>
            {openIndices.includes(index) && (
              <div className="p-4 border-t" style={{ borderColor, color: itemContentColor }}>
                {readOnly ? (
                  <p className="text-sm">{item.content}</p>
                ) : (
                  <textarea
                    ref={getItemRef(index, 'content')}
                    value={item.content || ''}
                    onChange={(e) => handleInputChange(null, e.target.value, index, 'content')}
                    onBlur={handleBlur}
                    className="text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full resize-none"
                    rows={3} placeholder="Answer/Content" style={{ color: 'inherit' }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

ListDropdownBlock.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      content: PropTypes.string,
    })),
    openMultiple: PropTypes.bool,
    backgroundColor: PropTypes.string,
    titleColor: PropTypes.string,
    itemTitleColor: PropTypes.string,
    itemContentColor: PropTypes.string,
    iconColor: PropTypes.string,
    borderColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func.isRequired,
};

ListDropdownBlock.EditorPanel = function ListDropdownEditorPanel({ currentConfig, onPanelConfigChange }) {
  const [formData, setFormData] = useState(currentConfig || {});

  useEffect(() => {
    setFormData(currentConfig || {});
  }, [currentConfig]);

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onPanelConfigChange(newFormData);
  };

  const handleItemChange = (itemIndex, field, value) => {
    const updatedItems = (formData.items || []).map((item, i) => i === itemIndex ? { ...item, [field]: value } : item);
    handleChange('items', updatedItems);
  };

  const handleAddItem = () => {
    const newItem = { id: `faq_${Date.now()}`, title: 'New Question?', content: 'Answer to the new question.' };
    handleChange('items', [...(formData.items || []), newItem]);
  };

  const handleRemoveItem = (itemIndex) => {
    handleChange('items', (formData.items || []).filter((_, i) => i !== itemIndex));
  };

  return (
    <div className="space-y-4 p-2 bg-gray-50 rounded-md shadow">
      <div><label className="input-label">Section Title (Panel Edit):</label><input type="text" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="input-text-class" /></div>
      <div className="flex items-center"><input type="checkbox" checked={formData.openMultiple || false} onChange={(e) => handleChange('openMultiple', e.target.checked)} className="mr-2" /><label className="input-label">Allow Multiple Open</label></div>

      <h4 className="h4-style">Color Scheme</h4>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="input-label-sm">Background:</label><input type="color" value={formData.backgroundColor || '#FFFFFF'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Main Title:</label><input type="color" value={formData.titleColor || '#1A202C'} onChange={(e) => handleChange('titleColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Item Title:</label><input type="color" value={formData.itemTitleColor || '#2D3748'} onChange={(e) => handleChange('itemTitleColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Item Content:</label><input type="color" value={formData.itemContentColor || '#4A5568'} onChange={(e) => handleChange('itemContentColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Icon Color:</label><input type="color" value={formData.iconColor || '#718096'} onChange={(e) => handleChange('iconColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Border Color:</label><input type="color" value={formData.borderColor || '#E2E8F0'} onChange={(e) => handleChange('borderColor', e.target.value)} className="input-color-sm" /></div>
      </div>

      <h4 className="h4-style">Manage Items (FAQ)</h4>
      {(formData.items || []).map((item, itemIndex) => (
        <div key={item.id || itemIndex} className="panel-item-container">
          <div className="flex justify-between items-center"><h5 className="h5-style">Item {itemIndex + 1}</h5><button onClick={() => handleRemoveItem(itemIndex)} className="btn-remove-xs">Remove</button></div>
          <div><label className="input-label-xs">Question/Title:</label><input type="text" value={item.title || ''} onChange={(e) => handleItemChange(itemIndex, 'title', e.target.value)} className="input-text-xs" /></div>
          <div><label className="input-label-xs">Answer/Content:</label><textarea value={item.content || ''} onChange={(e) => handleItemChange(itemIndex, 'content', e.target.value)} rows={3} className="input-textarea-xs" /></div>
        </div>
      ))}
      <button onClick={handleAddItem} className="btn-add-item">+ Add FAQ Item</button>
      <style jsx>{`
        .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: #4A5568; margin-bottom: 0.25rem; }
        .input-label-sm { display: block; font-size: 0.8rem; font-weight: 500; color: #4A5568; margin-bottom: 0.1rem; }
        .input-label-xs { display: block; font-size: 0.75rem; font-weight: 500; color: #555; margin-bottom: 0.1rem; }
        .input-text-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
        .input-text-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; }
        .input-textarea-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; resize: vertical; min-height: 60px; }
        .input-color-sm { margin-top: 0.1rem; height: 1.75rem; width: 100%; padding: 0.1rem; border: 1px solid #D1D5DB; border-radius: 0.25rem; }
        .h4-style { font-size: 1.1rem; font-weight: 600; color: #374151; padding-top: 0.75rem; border-top: 1px solid #E5E7EB; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .h5-style { font-size: 0.95rem; font-weight: 600; color: #4A5568; }
        .panel-item-container { padding: 0.75rem; border: 1px solid #E5E7EB; border-radius: 0.375rem; background-color: white; margin-bottom: 0.75rem; }
        .btn-remove-xs { font-size: 0.75rem; color: #EF4444; font-weight: 500; }
        .btn-add-item { margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem; background-color: #10B981; color: white; border-radius: 0.375rem; font-weight: 500; }
      `}</style>
    </div>
  );
};

ListDropdownBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
};

export default ListDropdownBlock;

