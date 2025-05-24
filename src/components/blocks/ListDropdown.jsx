// src/components/blocks/ListDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown'; // Make sure this is installed or comment it out if not
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'; // Using Heroicons for +/-

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
      sectionTitle: 'Frequently Asked Questions',
      items: [
        { id: '1', question: 'What services do you offer?', answer: 'We offer a wide range of roofing services including repair, replacement, and new installations.' },
        { id: '2', question: 'How long does a roof replacement take?', answer: 'Typically, a roof replacement can take anywhere from a few days to a week, depending on the size and complexity.' },
      ],
      itemHeaderColor: '#333333', // Dark gray for question text
      itemTextColor: '#555555',   // Medium gray for answer text
      itemBackground: '#FFFFFF', // White background for items
      iconColor: '#007AFF', // Blue for icons
    };
    return { ...defaultConfig, ...config };
  });

  const [openItemId, setOpenItemId] = useState(null);
  const answerRefs = useRef({}); // To store refs for animating answer heights

  useEffect(() => {
    if (readOnly) {
      setLocalConfig(prevConfig => ({ ...prevConfig, ...config }));
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (readOnly && typeof onConfigChange === 'function') {
      if (JSON.stringify(localConfig) !== JSON.stringify(config)) {
        onConfigChange(localConfig);
      }
    }
  }, [readOnly, localConfig, onConfigChange, config]);

  const handleInputChange = (fieldOrIndex, value, subField = null) => {
    if (!readOnly) {
      setLocalConfig(prev => {
        if (typeof fieldOrIndex === 'number') { // Editing an item in the array
          const newItems = prev.items.map((item, idx) => {
            if (idx === fieldOrIndex) {
              return { ...item, [subField]: value };
            }
            return item;
          });
          return { ...prev, items: newItems };
        } else { // Editing a top-level field like sectionTitle
          return { ...prev, [fieldOrIndex]: value };
        }
      });
    }
  };

  const toggleItem = (itemId) => {
    setOpenItemId(prevOpenItemId => (prevOpenItemId === itemId ? null : itemId));
  };

  useEffect(() => {
    // GSAP or similar animation logic for dropdowns can be placed here
    // For simplicity, this example uses CSS transitions triggered by height change
    Object.values(answerRefs.current).forEach(ref => {
      if (ref) {
        // Example: Animate height if you were using a library like GSAP
        // gsap.to(ref, { height: ref.scrollHeight, duration: 0.3, ease: "power1.inOut" });
      }
    });
  }, [openItemId, localConfig.items]);

  const { sectionTitle, items, itemHeaderColor, itemTextColor, itemBackground, iconColor } = localConfig;

  return (
    <div className="list-dropdown-block py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {readOnly ? (
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8 text-gray-800">{sectionTitle}</h2>
        ) : (
          <input 
            type="text" 
            value={sectionTitle} 
            onChange={(e) => handleInputChange('sectionTitle', e.target.value)} 
            className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8 text-gray-800 bg-transparent border-b-2 border-dashed border-gray-400 focus:border-gray-600 outline-none w-full block mx-auto"
          />
        )}
        <div className="space-y-4 max-w-3xl mx-auto">
          {(items || []).map((item, index) => (
            <div key={item.id || index} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: itemBackground }}>
              <button 
                onClick={() => toggleItem(item.id || index)} 
                className="w-full flex justify-between items-center p-4 md:p-5 text-left focus:outline-none"
                style={{ color: itemHeaderColor }}
              >
                {readOnly ? (
                  <span className="text-lg font-medium">{item.question}</span>
                ) : (
                  <input 
                    type="text" 
                    value={item.question}
                    onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking input
                    onChange={(e) => handleInputChange(index, e.target.value, 'question')} 
                    className="text-lg font-medium bg-transparent border-b border-dashed border-gray-400 focus:border-gray-600 outline-none flex-grow mr-2"
                    style={{ color: itemHeaderColor }}
                  />
                )}
                {openItemId === (item.id || index) ? 
                  <MinusIcon className="w-6 h-6" style={{ color: iconColor }} /> : 
                  <PlusIcon className="w-6 h-6" style={{ color: iconColor }} />} 
              </button>
              <div 
                ref={el => answerRefs.current[item.id || index] = el}
                className={`overflow-hidden transition-max-height duration-500 ease-in-out ${openItemId === (item.id || index) ? 'max-h-[1000px]' : 'max-h-0'}`}
              >
                <div className="p-4 md:p-5 border-t border-gray-200" style={{ color: itemTextColor }}>
                  {readOnly ? (
                    <p>{item.answer}</p>
                  ) : (
                    <textarea 
                      value={item.answer} 
                      onClick={(e) => e.stopPropagation()} // Prevent toggle
                      onChange={(e) => handleInputChange(index, e.target.value, 'answer')}
                      className="w-full bg-transparent border-b border-dashed border-gray-400 focus:border-gray-600 outline-none resize-none text-base"
                      style={{ color: itemTextColor }}
                      rows={Math.max(3, (item.answer || '').split('\n').length)} // Auto-adjust rows
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          {!readOnly && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  const newItemId = `item_${Date.now()}`;
                  const newItems = [...localConfig.items, { id: newItemId, question: 'New Question', answer: 'New Answer' }];
                  handleInputChange('items', newItems);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Add FAQ Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ListDropdownBlock.propTypes = {
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
  }).isRequired,
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

ListDropdownBlock.EditorPanel = ({ currentConfig, onPanelConfigChange }) => {
  const [panelData, setPanelData] = useState(currentConfig);

  useEffect(() => {
    setPanelData(currentConfig);
  }, [currentConfig]);

  const handlePanelChange = (field, value) => {
    setPanelData(prev => ({ ...prev, [field]: value }));
  };

  const commitChanges = () => {
    onPanelConfigChange(panelData);
  };

  const handleRemoveItem = (index) => {
    const newItems = panelData.items.filter((_, i) => i !== index);
    setPanelData(prev => ({ ...prev, items: newItems }));
    // Immediately commit change for removal
    onPanelConfigChange({ ...panelData, items: newItems }); 
  };

  return (
    <div className="space-y-4 p-1">
      <div>
        <label className="block text-sm font-medium text-gray-300">Section Title:</label>
        <input 
          type="text" 
          value={panelData.sectionTitle || ''} 
          onChange={(e) => handlePanelChange('sectionTitle', e.target.value)} 
          onBlur={commitChanges}
          className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-300">Item Header (Question) Color:</label>
            <input type="color" value={panelData.itemHeaderColor || '#333333'} onChange={(e) => handlePanelChange('itemHeaderColor', e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md bg-gray-600"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-300">Item Text (Answer) Color:</label>
            <input type="color" value={panelData.itemTextColor || '#555555'} onChange={(e) => handlePanelChange('itemTextColor', e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md bg-gray-600"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-300">Item Background Color:</label>
            <input type="color" value={panelData.itemBackground || '#FFFFFF'} onChange={(e) => handlePanelChange('itemBackground', e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md bg-gray-600"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-300">Icon (+/-) Color:</label>
            <input type="color" value={panelData.iconColor || '#007AFF'} onChange={(e) => handlePanelChange('iconColor', e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md bg-gray-600"/>
        </div>
      </div>

      <p className="text-sm font-medium text-gray-300 mt-3">Manage FAQ Items (Question/Answer text is edited on the block preview directly):</p>
      {(panelData.items || []).map((item, index) => (
        <div key={item.id || index} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
          <span className="text-gray-200 text-sm truncate" title={item.question}>Item: {item.question.substring(0,30)}{item.question.length > 30 ? '...' : ''}</span>
          <button 
            onClick={() => handleRemoveItem(index)} 
            className="text-red-400 hover:text-red-300 text-xs font-semibold"
          >
            Remove
          </button>
        </div>
      ))}
       <button 
        onClick={() => {
          const newItemId = `item_${Date.now()}`;
          const newItems = [...(panelData.items || []), { id: newItemId, question: 'New Question', answer: 'New Answer' }];
          setPanelData(prev => ({ ...prev, items: newItems }));
          // Commit this structural change immediately
          onPanelConfigChange({ ...panelData, items: newItems }); 
        }}
        className="mt-2 w-full px-3 py-1.5 border border-dashed border-gray-500 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:border-solid"
      >
        + Add FAQ Item (in Panel)
      </button>
    </div>
  );
};

ListDropdownBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
};

export default ListDropdownBlock;
