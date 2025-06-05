// src/components/blocks/ListDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import ThemeColorPicker from "../common/ThemeColorPicker";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

/**
 * EditableText Component for inline editing
 */
const EditableText = ({ value, onChange, tag: Tag = 'p', className = '', placeholder = "Edit", readOnly = false, isTextarea = false }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e) => {
    setCurrentValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextarea) {
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  const activateEditMode = () => {
    if (!readOnly && !isEditing) {
      setIsEditing(true);
    }
  };

  if (!readOnly && isEditing) {
    const commonInputProps = {
      ref: inputRef,
      value: currentValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `${className} outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm bg-white/70 placeholder-gray-500/70 shadow-inner`,
    };
    if (isTextarea) {
      return <textarea {...commonInputProps} rows={Math.max(2, (currentValue || '').split('\n').length)} placeholder={placeholder} />;
    }
    return <input {...commonInputProps} type="text" placeholder={placeholder} />;
  }

  return (
    <Tag
      className={`${className} cursor-pointer hover:bg-gray-400/10 transition-colors duration-150 ease-in-out p-0 m-0 min-h-[1em]`}
      onClick={activateEditMode}
      title={!readOnly ? "Click to edit" : ""}
    >
      {value || <span className="text-gray-400/80 italic text-sm">({placeholder})</span>}
    </Tag>
  );
};

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
const ListDropdown = ({ config = {}, readOnly = false, onConfigChange }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [openIndex, setOpenIndex] = useState(null);

  // Sync with external config
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Propagate changes when not readOnly
  useEffect(() => {
    if (!readOnly && onConfigChange && JSON.stringify(localConfig) !== JSON.stringify(config)) {
      onConfigChange(localConfig);
    }
  }, [localConfig, readOnly, onConfigChange, config]);

  const {
    title = "Maintenance Guide",
    items = [],
    textColor = "#333333",
    headerTextColor = "#FFFFFF",
    headerBackgroundColor = "#007AFF",
    iconColor = "#FFFFFF",
    titleColor: sectionTitleColor = "#333333", // Renamed to avoid conflict with item title
  } = localConfig;

  const toggleIndex = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  const handleConfigUpdate = (newConfig) => {
    setLocalConfig(newConfig);
  };

  const handleTitleChange = (newTitle) => {
    handleConfigUpdate({ ...localConfig, title: newTitle });
  };

  const handleItemFieldChange = (itemIndex, field, value) => {
    const newItems = localConfig.items.map((item, idx) => 
      idx === itemIndex ? { ...item, [field]: value } : item
    );
    handleConfigUpdate({ ...localConfig, items: newItems });
  };

  const handleDiagnosisChange = (itemIndex, diagnosisIndex, value) => {
    const newItems = localConfig.items.map((item, idx) => {
      if (idx === itemIndex) {
        const newDiagnosis = [...(item.diagnosis || [])];
        newDiagnosis[diagnosisIndex] = value;
        return { ...item, diagnosis: newDiagnosis };
      }
      return item;
    });
    handleConfigUpdate({ ...localConfig, items: newItems });
  };

  const addItem = () => {
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
      title: "New Dropdown Title",
      content: "Content for the new dropdown.",
      causes: "",
      impact: "",
      diagnosis: [],
    };
    handleConfigUpdate({ ...localConfig, items: [...(localConfig.items || []), newItem] });
  };

  const removeItem = (indexToRemove) => {
    const newItems = localConfig.items.filter((_, idx) => idx !== indexToRemove);
    handleConfigUpdate({ ...localConfig, items: newItems });
  };

  const addDiagnosisPoint = (itemIndex) => {
    const newItems = localConfig.items.map((item, idx) => {
      if (idx === itemIndex) {
        return { ...item, diagnosis: [...(item.diagnosis || []), "New diagnosis point"] };
      }
      return item;
    });
    handleConfigUpdate({ ...localConfig, items: newItems });
  };

  const removeDiagnosisPoint = (itemIndex, diagnosisIndexToRemove) => {
    const newItems = localConfig.items.map((item, idx) => {
      if (idx === itemIndex) {
        return { ...item, diagnosis: (item.diagnosis || []).filter((_, dIdx) => dIdx !== diagnosisIndexToRemove) };
      }
      return item;
    });
    handleConfigUpdate({ ...localConfig, items: newItems });
  };
  
  const colorPickerProps = (label, fieldName, defaultColor) => ({
    label,
    fieldName,
    currentColorValue: localConfig[fieldName] || defaultColor,
    onColorChange: (name, value) => handleConfigUpdate({ ...localConfig, [name]: value }),
    themeColors: {
      // Assuming themeColors is passed down from the parent component
      // This is a placeholder and should be replaced with the actual themeColors
    },
  });

  return (
    <div className="container mx-auto w-full px-4 pb-4 md:pb-8">
      <EditableText
        value={title}
        onChange={handleTitleChange}
        tag="h2"
        className="text-2xl font-semibold mb-4 text-center"
        style={{ color: sectionTitleColor }}
        placeholder="Section Title"
        readOnly={readOnly}
      />
      
      {!readOnly && (
        <div className="mb-4 text-center">
          <button
            onClick={addItem}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Item
          </button>
        </div>
      )}

      <div className="space-y-2">
        {(items || []).map((item, i) => (
          <div key={item.id || i} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div
              className="p-4 cursor-pointer flex justify-between items-center transition-colors duration-200 hover:bg-gray-50 relative group"
              style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }}
              onClick={() => toggleIndex(i)}
            >
              <EditableText
                value={item.title}
                onChange={(newValue) => handleItemFieldChange(i, 'title', newValue)}
                tag="h3"
                className="text-lg font-semibold flex-grow mr-2"
                style={{ color: headerTextColor }}
                placeholder="Item Title"
                readOnly={readOnly}
              />
              
              {!readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(i);
                  }}
                  className="opacity-0 group-hover:opacity-100 mr-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                  title="Remove Item"
                >
                  ×
                </button>
              )}
              
              <div style={{ color: iconColor }}>
                {openIndex === i ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 border-t border-gray-200" style={{ color: textColor }}>
                    {item.content ? (
                      readOnly ? (
                        <ReactMarkdown>{item.content}</ReactMarkdown>
                      ) : (
                        <EditableText
                          value={item.content}
                          onChange={(newValue) => handleItemFieldChange(i, 'content', newValue)}
                          tag="div"
                          className="prose prose-sm max-w-none"
                          style={{ color: textColor }}
                          placeholder="Item content (Markdown supported)"
                          isTextarea
                          readOnly={readOnly}
                        />
                      )
                    ) : (
                      <>
                        {item.causes && (
                          <div className="mb-2">
                            <strong>Causes:</strong>
                            {readOnly ? (
                              <ReactMarkdown>{item.causes}</ReactMarkdown>
                            ) : (
                              <EditableText
                                value={item.causes}
                                onChange={(newValue) => handleItemFieldChange(i, 'causes', newValue)}
                                tag="div"
                                className="mt-1"
                                style={{ color: textColor }}
                                placeholder="Causes"
                                isTextarea
                                readOnly={readOnly}
                              />
                            )}
                          </div>
                        )}
                        {item.impact && (
                          <div className="mb-2">
                            <strong>Impact:</strong>
                            {readOnly ? (
                              <ReactMarkdown>{item.impact}</ReactMarkdown>
                            ) : (
                              <EditableText
                                value={item.impact}
                                onChange={(newValue) => handleItemFieldChange(i, 'impact', newValue)}
                                tag="div"
                                className="mt-1"
                                style={{ color: textColor }}
                                placeholder="Impact"
                                isTextarea
                                readOnly={readOnly}
                              />
                            )}
                          </div>
                        )}
                        {item.diagnosis?.length > 0 && (
                          <div className="mb-2">
                            <strong>Diagnosis:</strong>
                            <ul className="list-disc list-inside ml-5 mt-1">
                              {item.diagnosis.map((d, dIdx) => (
                                <li key={dIdx} className="mb-1">
                                  <EditableText
                                    value={d}
                                    onChange={(newValue) => handleDiagnosisChange(i, dIdx, newValue)}
                                    tag="span"
                                    className="ml-1"
                                    style={{ color: textColor }}
                                    placeholder="Diagnosis point"
                                    readOnly={readOnly}
                                  />
                                  {!readOnly && (
                                    <button
                                      onClick={() => removeDiagnosisPoint(i, dIdx)}
                                      className="ml-2 text-red-500 hover:text-red-700 text-sm"
                                    >
                                      ×
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                            {!readOnly && (
                              <button
                                onClick={() => addDiagnosisPoint(i)}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                + Add Diagnosis Point
                              </button>
                            )}
                          </div>
                        )}
                        {!(item.causes || item.impact || item.diagnosis?.length > 0) && !readOnly && (
                          <p className="italic text-gray-500">Click to edit content, or use the panel for structured editing.</p>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

ListDropdown.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      content: PropTypes.string,
      causes: PropTypes.string,
      impact: PropTypes.string,
      diagnosis: PropTypes.arrayOf(PropTypes.string),
    })),
    textColor: PropTypes.string,
    headerTextColor: PropTypes.string,
    headerBackgroundColor: PropTypes.string,
    iconColor: PropTypes.string,
    titleColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

ListDropdown.tabsConfig = (currentConfig, onPanelChange, themeColors) => {
  const { items = [] } = currentConfig;

  const handleItemFieldChange = (itemIndex, field, value) => {
    const newItems = (currentConfig.items || []).map((item, i) => 
      i === itemIndex ? { ...item, [field]: value } : item
    );
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const handleDiagnosisChange = (itemIndex, diagnosisIndex, value) => {
    const newItems = (currentConfig.items || []).map((item, i) => {
      if (i === itemIndex) {
        const newDiagnosis = [...(item.diagnosis || [])];
        newDiagnosis[diagnosisIndex] = value;
        return { ...item, diagnosis: newDiagnosis };
      }
      return item;
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const addItem = () => {
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
      title: "New Dropdown Title",
      content: "Content for the new dropdown.",
      causes: "",
      impact: "",
      diagnosis: [],
    };
    onPanelChange({ ...currentConfig, items: [...(currentConfig.items || []), newItem] });
  };

  const removeItem = (indexToRemove) => {
    const newItems = (currentConfig.items || []).filter((_, i) => i !== indexToRemove);
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const addDiagnosisPoint = (itemIndex) => {
    const newItems = (currentConfig.items || []).map((item, i) => {
      if (i === itemIndex) {
        return { ...item, diagnosis: [...(item.diagnosis || []), "New diagnosis point"] };
      }
      return item;
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const removeDiagnosisPoint = (itemIndex, diagnosisIndexToRemove) => {
    const newItems = (currentConfig.items || []).map((item, i) => {
      if (i === itemIndex) {
        return { ...item, diagnosis: (item.diagnosis || []).filter((_, dIdx) => dIdx !== diagnosisIndexToRemove) };
      }
      return item;
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };
  
  const colorPickerProps = (label, fieldName, defaultColor) => ({
    label,
    fieldName,
    currentColorValue: currentConfig[fieldName] || defaultColor,
    onColorChange: (name, value) => onPanelChange({ ...currentConfig, [name]: value }),
    themeColors,
  });

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Block Title:</label>
          <input
            type="text"
            value={currentConfig.title || ''}
            onChange={(e) => onPanelChange({ ...currentConfig, title: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter block title"
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-semibold text-gray-700">Dropdown Items:</h4>
            <button onClick={addItem} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md shadow">+ Add Item</button>
          </div>

          {(items || []).map((item, idx) => (
            <div key={item.id || idx} className="p-3 bg-gray-50 rounded-md mb-3 shadow-sm border border-gray-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-800 font-medium">Item {idx + 1}</span>
                <button onClick={() => removeItem(idx)} className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-100 rounded-full">✕ Remove</button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Title:</label>
                <input type="text" value={item.title || ""} onChange={(e) => handleItemFieldChange(idx, 'title', e.target.value)} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Content (Markdown supported):</label>
                <textarea rows={3} value={item.content || ""} onChange={(e) => handleItemFieldChange(idx, 'content', e.target.value)} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs resize-none" />
              </div>
              <details className="text-xs pt-1">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">Legacy Fields (Optional)</summary>
                <div className="pl-2 mt-1.5 border-l-2 border-gray-200 space-y-1.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Causes:</label>
                    <textarea rows={2} value={item.causes || ""} onChange={(e) => handleItemFieldChange(idx, 'causes', e.target.value)} className="mt-0.5 block w-full px-2 py-1 bg-white border border-gray-300 rounded-md sm:text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Impact:</label>
                    <textarea rows={2} value={item.impact || ""} onChange={(e) => handleItemFieldChange(idx, 'impact', e.target.value)} className="mt-0.5 block w-full px-2 py-1 bg-white border border-gray-300 rounded-md sm:text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Diagnosis Points:</label>
                    {(item.diagnosis || []).map((diag, dIdx) => (
                      <div key={dIdx} className="flex items-center mt-0.5">
                        <input type="text" value={diag} onChange={(e) => handleDiagnosisChange(idx, dIdx, e.target.value)} className="flex-grow px-2 py-1 bg-white border border-gray-300 rounded-l-md sm:text-xs" />
                        <button onClick={() => removeDiagnosisPoint(idx, dIdx)} className="bg-red-500 text-white px-2 py-1 rounded-r-md text-xs hover:bg-red-600">✕</button>
                      </div>
                    ))}
                    <button onClick={() => addDiagnosisPoint(idx)} className="mt-1 text-blue-600 hover:text-blue-800 text-xs font-medium">+ Add Diagnosis Point</button>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    ),
    colors: () => (
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Color Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeColorPicker {...colorPickerProps("Section Title Color", "titleColor", currentConfig.textColor || "#333333")} />
            <ThemeColorPicker {...colorPickerProps("Content Text Color", "textColor", "#333333")} />
            <ThemeColorPicker {...colorPickerProps("Item Header Background", "headerBackgroundColor", "#007AFF")} />
            <ThemeColorPicker {...colorPickerProps("Item Header Text", "headerTextColor", "#FFFFFF")} />
            <ThemeColorPicker {...colorPickerProps("Item Header Icon", "iconColor", "#FFFFFF")} />
        </div>
      </div>
    ),
  };
};

export default ListDropdown;
