import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import ThemeColorPicker from '../common/ThemeColorPicker';

/**
 * AccordionBlock
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
const AccordionBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      sectionTitle: 'Frequently Asked Questions',
      items: [
        { id: '1', question: 'What services do you offer?', answer: 'We offer a wide range of roofing services including repair, replacement, and new installations.' },
        { id: '2', question: 'How long does a roof replacement take?', answer: 'Typically, a roof replacement can take anywhere from a few days to a week, depending on the size and complexity.' },
      ],
      itemHeaderColor: '#333333', // Default dark gray for question text
      itemTextColor: '#555555',   // Default medium gray for answer text
      itemBackground: '#FFFFFF', // Default white for item background
      iconColor: '#007AFF',       // Default blue for expand/collapse icon
      titleColor: '#1A202C',      // Default very dark blue/black for main section title
      sectionBackgroundColor: '#F9FAFB' // Default light gray for overall section background
    };
    // Ensure all default color fields are present in the merged config
    const mergedConfig = { ...defaultConfig, ...config };
    Object.keys(defaultConfig).forEach(key => {
      if (key.toLowerCase().includes('color') && mergedConfig[key] === undefined) {
        mergedConfig[key] = defaultConfig[key];
      }
    });
    return mergedConfig;
  });

  const [openItemId, setOpenItemId] = useState(null);
  const answerRefs = useRef({});

  // When readOnly, sync with external config.
  // When editable, localConfig is source of truth until onConfigChange is called (e.g., on blur or panel change).
  useEffect(() => {
    if (readOnly) {
       // Smart merge: prioritize incoming config but preserve local structure if items exist
      const defaultConfig = {
        sectionTitle: 'Frequently Asked Questions',
        items: [
          { id: '1', question: 'What services do you offer?', answer: 'We offer a wide range of roofing services including repair, replacement, and new installations.' },
          { id: '2', question: 'How long does a roof replacement take?', answer: 'Typically, a roof replacement can take anywhere from a few days to a week, depending on the size and complexity.' },
        ],
        itemHeaderColor: '#333333',
        itemTextColor: '#555555',
        itemBackground: '#FFFFFF',
        iconColor: '#007AFF',
        titleColor: '#1A202C',
        sectionBackgroundColor: '#F9FAFB'
      };
      const currentItems = localConfig.items && localConfig.items.length > 0 ? localConfig.items : (config?.items || defaultConfig.items);
      const newConfig = { ...defaultConfig, ...(config || {}), items: currentItems };
      
      Object.keys(defaultConfig).forEach(key => {
        if (key.toLowerCase().includes('color') && newConfig[key] === undefined) {
          newConfig[key] = defaultConfig[key];
        }
      });
      setLocalConfig(newConfig);
    }
  }, [config, readOnly]);


  // Call onConfigChange when localConfig changes in edit mode, or when exiting edit mode
  const prevReadOnlyRef = useRef(readOnly);
  useEffect(() => {
    if (!readOnly && JSON.stringify(localConfig) !== JSON.stringify(config)) {
      if (typeof onConfigChange === 'function') {
        onConfigChange(localConfig);
      }
    } else if (prevReadOnlyRef.current === false && readOnly === true) { // Exiting edit mode
      if (typeof onConfigChange === 'function') {
        onConfigChange(localConfig);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [localConfig, readOnly, onConfigChange, config]);


  const handleInputChange = (fieldOrIndex, value, subField = null) => {
    if (!readOnly) {
      setLocalConfig(prev => {
        let newConfig;
        if (typeof fieldOrIndex === 'number') { // Editing an item
          const newItems = prev.items.map((item, idx) => {
            if (idx === fieldOrIndex) {
              return { ...item, [subField]: value };
            }
            return item;
          });
          newConfig = { ...prev, items: newItems };
        } else { // Editing a top-level config field
          newConfig = { ...prev, [fieldOrIndex]: value };
        }
        // No immediate onConfigChange here for inline edits, it's handled by useEffect or panel interaction
        return newConfig;
      });
    }
  };
  
  const handleAddItem = () => {
    if(!readOnly) {
      const newItemId = `item_${Date.now()}`;
      const newItems = [...localConfig.items, { id: newItemId, question: 'New Question', answer: 'New Answer details...' }];
      setLocalConfig(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    if(!readOnly) {
      const newItems = localConfig.items.filter((_, i) => i !== indexToRemove);
      setLocalConfig(prev => ({ ...prev, items: newItems }));
    }
  };


  const toggleItem = (itemId) => {
    setOpenItemId(prevOpenItemId => (prevOpenItemId === itemId ? null : itemId));
  };

  // Auto-resize textareas in edit mode
  useEffect(() => {
    if (!readOnly) {
      Object.values(answerRefs.current).forEach(ref => {
        if (ref && ref.scrollHeight > ref.clientHeight) {
          ref.style.height = `${ref.scrollHeight}px`;
        }
      });
    }
  }, [openItemId, localConfig.items, readOnly]);


  const { sectionTitle, items, itemHeaderColor, itemTextColor, itemBackground, iconColor, titleColor, sectionBackgroundColor } = localConfig;

  return (
    <div className="accordion-block py-8 md:py-12" style={{ backgroundColor: sectionBackgroundColor }}>
      <div className="container mx-auto px-4">
        {readOnly ? (
          sectionTitle && <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8" style={{color: titleColor}}>{sectionTitle}</h2>
        ) : (
          <input 
            type="text" 
            value={sectionTitle} 
            onChange={(e) => handleInputChange('sectionTitle', e.target.value)} 
            className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8 bg-transparent border-b-2 border-dashed border-gray-400 focus:border-gray-600 outline-none w-auto block mx-auto max-w-full"
            style={{color: titleColor, borderColor: titleColor ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.2)'}}
            placeholder="Section Title"
          />
        )}
        <div className="space-y-3 max-w-3xl mx-auto">
          {(items || []).map((item, index) => (
            <div key={item.id || index} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: itemBackground }}>
              <button 
                onClick={() => toggleItem(item.id || index)} 
                className="w-full flex justify-between items-center p-3 md:p-4 text-left focus:outline-none group"
              >
                {readOnly ? (
                  <span className="text-md md:text-lg font-medium" style={{ color: itemHeaderColor }}>{item.question || 'Question Missing'}</span>
                ) : (
                  <input 
                    type="text" 
                    value={item.question || ''}
                    onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking input
                    onChange={(e) => handleInputChange(index, e.target.value, 'question')} 
                    className="text-md md:text-lg font-medium bg-transparent border-b border-dashed border-gray-400/50 focus:border-gray-600 outline-none flex-grow mr-2 group-hover:border-gray-500"
                    style={{ color: itemHeaderColor }}
                    placeholder="Question"
                  />
                )}
                <div className="flex-shrink-0">
                {openItemId === (item.id || index) ? 
                  <MinusIcon className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200" style={{ color: iconColor }} /> : 
                  <PlusIcon className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200" style={{ color: iconColor }} />} 
                </div>
              </button>
              <AnimatePresence>
                {openItemId === (item.id || index) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3, ease: "circOut" } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: "circIn" } }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 md:px-4 md:pb-4 border-t border-gray-200" style={{ color: itemTextColor }}>
                        {readOnly ? (
                            item.answer && <div className="prose prose-sm md:prose-base max-w-none mt-2"><ReactMarkdown>{item.answer}</ReactMarkdown></div>
                        ) : (
                            <textarea 
                            value={item.answer || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                handleInputChange(index, e.target.value, 'answer');
                                // Auto-resize
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            className="w-full bg-transparent border-b border-dashed border-gray-400/50 focus:border-gray-600 outline-none resize-none text-sm md:text-base mt-2 min-h-[60px]"
                            style={{ color: itemTextColor }}
                            placeholder="Answer details..."
                            ref={el => {
                                if (el && !answerRefs.current[item.id || index]) {
                                    el.style.height = 'auto';
                                    el.style.height = `${el.scrollHeight}px`;
                                }
                                answerRefs.current[item.id || index] = el;
                            }}
                            />
                        )}
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {!readOnly && (
            <div className="mt-6 text-center">
              <button 
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm shadow"
              >
                + Add FAQ Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AccordionBlock.propTypes = {
  config: PropTypes.shape({
    sectionTitle: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.string,
      answer: PropTypes.string,
    })),
    itemHeaderColor: PropTypes.string,
    itemTextColor: PropTypes.string,
    itemBackground: PropTypes.string,
    iconColor: PropTypes.string,
    titleColor: PropTypes.string,
    sectionBackgroundColor: PropTypes.string,
  }), // Removed .isRequired as TopStickyEditPanel might pass partial/empty initially
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

AccordionBlock.tabsConfig = (config, onPanelChange, themeColors) => {
  // Helper function to create ThemeColorPicker props
  const colorPickerProps = (label, fieldName, defaultColor) => ({
    label,
    fieldName,
    currentColorValue: config[fieldName] || defaultColor,
    onColorChange: (name, value) => onPanelChange({ ...config, [name]: value }),
    themeColors,
    className: "text-xs"
  });

  const handleItemManagement = (action, index = null) => {
    let newItems = [...(config.items || [])];
    if (action === 'add') {
      newItems.push({ id: `item_${Date.now()}`, question: 'New Question', answer: 'New Answer...' });
    } else if (action === 'remove' && index !== null) {
      newItems.splice(index, 1);
    }
    onPanelChange({ ...config, items: newItems });
  };

  return {
    general: () => (
      <div className="p-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Section Title (Editable inline too):</label>
          <input 
            type="text" 
            value={config.sectionTitle || ''} 
            onChange={(e) => onPanelChange({ ...config, sectionTitle: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">FAQ Items:</h4>
          <p className="text-xs text-gray-500 mb-2">Question and Answer text can be edited directly on the block preview.</p>
          {(config.items || []).map((item, index) => (
            <div key={item.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-1">
              <span className="text-xs text-gray-600 truncate w-3/4" title={item.question}>{index + 1}. {item.question || '(Untitled Question)'}</span>
              <button 
                onClick={() => handleItemManagement('remove', index)} 
                className="text-red-500 hover:text-red-700 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
          <button 
            onClick={() => handleItemManagement('add')} 
            className="mt-2 w-full px-3 py-1.5 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
          >
            + Add FAQ Item
          </button>
        </div>
      </div>
    ),
    colors: () => (
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ThemeColorPicker {...colorPickerProps("Section Title Color", "titleColor", "#1A202C")} />
          <ThemeColorPicker {...colorPickerProps("Section Background", "sectionBackgroundColor", "#F9FAFB")} />
          <ThemeColorPicker {...colorPickerProps("Item Header (Question)", "itemHeaderColor", "#333333")} />
          <ThemeColorPicker {...colorPickerProps("Item Text (Answer)", "itemTextColor", "#555555")} />
          <ThemeColorPicker {...colorPickerProps("Item Background", "itemBackgroundColor", "#FFFFFF")} />
          <ThemeColorPicker {...colorPickerProps("Icon (+/-) Color", "iconColor", "#007AFF")} />
        </div>
      </div>
    ),
    // No specific 'images' or 'styling' tabs needed for AccordionBlock based on current features
  };
};

export default AccordionBlock; 