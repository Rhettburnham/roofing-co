import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

/**
 * DetailedListBlock
 *
 * config: {
 *   title: string, // alternative to sectionTitle
 *   sectionTitle: string,
 *   items: [
 *     // Can be structured items
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       advantages: string[],
 *       colorPossibilities?: string,
 *       installationTime?: string,
 *       pictures: string[]
 *     },
 *     // Or can be simple strings
 *     "Item 1",
 *     "Item 2",
 *     ...
 *   ],
 *   listStyle?: "bullet" | "numbered" | "none"
 * }
 */
const DetailedListBlock = ({ config = {}, readOnly = false, onConfigChange, getDisplayUrl, onFileChange }) => {
    const {
        sectionTitle = "Select a Siding Type",
        title,
        items = [],
        listStyle = "none",
        backgroundColor = '#FFFFFF', // Default white background
        textColor = '#333333',       // Default dark text
        itemBackgroundColor = '#F9FAFB',
        itemTextColor = '#111827',
        imageBorderColor = '#E5E7EB'
    } = config;

    // Use title as a fallback if sectionTitle is not provided
    const displayTitle = sectionTitle || title || "Service List";

    // Initialize localConfig with defaults and merge with incoming config
    const [localConfig, setLocalConfig] = useState(() => {
        const defaultConfig = {
            title: 'Default Section Title',
            items: [],
            backgroundColor: '#FFFFFF', // Default white background
            textColor: '#333333',       // Default dark text
            itemBackgroundColor: '#F9FAFB',
            itemTextColor: '#111827',
            imageBorderColor: '#E5E7EB'
        };
        return { ...defaultConfig, ...(config || {}) };
    });

    const titleInputRef = useRef(null);
    const itemTextareaRefs = useRef({}); // Use an object to store refs for item fields

    // Effect to sync localConfig with prop changes if not in edit mode (readOnly = true)
    // or if the incoming config is substantially different (e.g. new page loaded)
    useEffect(() => {
        const defaultConfig = {
            title: 'Default Section Title',
            items: [],
            backgroundColor: '#FFFFFF',
            textColor: '#333333',
            itemBackgroundColor: '#F9FAFB',
            itemTextColor: '#111827',
            imageBorderColor: '#E5E7EB'
        };
        // Smart merging: prioritize incoming config but preserve local structure if items exist
        const currentItems = localConfig.items && localConfig.items.length > 0 ? localConfig.items : (config?.items || defaultConfig.items);
        const newConfig = { ...defaultConfig, ...(config || {}), items: currentItems };

        if (readOnly || JSON.stringify(config) !== JSON.stringify(localConfig)) {
            setLocalConfig(newConfig);
        }
    }, [config, readOnly]);

    // Auto-resize textareas
    useEffect(() => {
        if (!readOnly) {
            if (titleInputRef.current) {
                titleInputRef.current.style.height = 'auto';
                titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
            }
            Object.values(itemTextareaRefs.current).forEach(fieldRefs => {
                if (fieldRefs) {
                    Object.values(fieldRefs).forEach(ref => {
                        if (ref && ref.current) {
                            ref.current.style.height = 'auto';
                            ref.current.style.height = `${ref.current.scrollHeight}px`;
                        }
                    });
                }
            });
        }
    }, [localConfig.title, localConfig.items, readOnly]);

    const handleMainTitleChange = (e) => {
        const newTitle = e.target.value;
        setLocalConfig(prev => ({ ...prev, title: newTitle }));
        if (!readOnly) onConfigChange({ ...localConfig, title: newTitle });
    };

    const handleItemFieldChange = (itemIndex, field, value) => {
        setLocalConfig(prev => {
            const updatedItems = prev.items.map((item, i) => 
                i === itemIndex ? { ...item, [field]: value } : item
            );
            const newFullConfig = { ...prev, items: updatedItems };
            if(!readOnly) onConfigChange(newFullConfig);
            return newFullConfig;
        });
    };

    const handleItemAdvantageChange = (itemIndex, advIndex, value) => {
        setLocalConfig(prev => {
            const updatedItems = prev.items.map((item, i) => {
                if (i === itemIndex) {
                    const updatedAdvantages = (item.advantages || []).map((adv, j) => 
                        j === advIndex ? value : adv
                    );
                    return { ...item, advantages: updatedAdvantages };
                }
                return item;
            });
            const newFullConfig = { ...prev, items: updatedItems };
            if(!readOnly) onConfigChange(newFullConfig);
            return newFullConfig;
        });
    };

    const handleBlur = () => {
        if (!readOnly) {
            onConfigChange(localConfig);
        }
    };
    
    // Destructure with defaults from localConfig for rendering
    const {
        title: localTitle,
        items: localItems,
        backgroundColor: localBackgroundColor,
        textColor: localTextColor,
        itemBackgroundColor: localItemBackgroundColor,
        itemTextColor: localItemTextColor,
        imageBorderColor: localImageBorderColor 
    } = localConfig;

    // For readOnly mode, we track which item is selected
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Check if the items are strings or objects
    const hasStructuredItems = localItems.length > 0 && typeof localItems[0] === "object";

    // ---------- READONLY MODE -----------
    if (readOnly) {
        // For simple string items list
        if (!hasStructuredItems) {
            return (
                <section className="my-6 container mx-auto px-4 md:px-16">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-0 text-center">
                        {displayTitle}
                    </h2>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {listStyle === "numbered" ? (
                            <ol className="list-decimal pl-5 space-y-2">
                                {localItems.map((item, index) => (
                                    <li key={index} className="text-gray-700 text-lg">
                                        <div className="markdown-content">
                                            {typeof ReactMarkdown !== "undefined" ? (
                                                <ReactMarkdown>{item}</ReactMarkdown>
                                            ) : (
                                                <p>{item}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        ) : listStyle === "bullet" ? (
                            <ul className="list-disc pl-5 space-y-2">
                                {localItems.map((item, index) => (
                                    <li key={index} className="text-gray-700 text-lg">
                                        <div className="markdown-content">
                                            {typeof ReactMarkdown !== "undefined" ? (
                                                <ReactMarkdown>{item}</ReactMarkdown>
                                            ) : (
                                                <p>{item}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="space-y-4">
                                {localItems.map((item, index) => (
                                    <div key={index} className="text-gray-700">
                                        <div className="markdown-content">
                                            {typeof ReactMarkdown !== "undefined" ? (
                                                <ReactMarkdown>{item}</ReactMarkdown>
                                            ) : (
                                                <p>{item}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            );
        }

        // Original structured items display
        const activeItem = localItems[selectedIndex] || {};

        return (
            <section className="my-2 md:my-4 px-4 md:px-16">
                {/* "Siding selection" buttons */}
                <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold mb-2 mt-3">
                    {displayTitle}
                </h2>
                <div className="flex flex-wrap justify-center mt-2 gap-2 mb-2 ">
                    {localItems.map((item, index) => (
                        <button
                            key={item.id || index}
                            onClick={() => setSelectedIndex(index)}
                            className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base 
                                rounded-full font-semibold shadow-lg transition-all duration-300 ${
                                    selectedIndex === index
                                        ? "bg-second-accent text-white font-semibold shadow-xl"
                                        : "bg-accent text-black"
                                }`}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow =
                                    "0 0 15px 3px rgba(0,0,0,0.5)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow =
                                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                            }}
                        >
                            {item.name || `Option ${index + 1}`}
                        </button>
                    ))}
                </div>

                {/* Display selected item */}
                <motion.div
                    key={activeItem.id || selectedIndex}
                    className="flex flex-col items-start bg-white rounded-2xl shadow-lg p-4 sm:p-6 transition-all duration-500 mx-4 md:mx-16 md:mt-4 @container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-full">
                        {/* Name & Description */}
                        {activeItem.name && (
                            <h3 className="md:ml-10 text-xl sm:text-2xl md:text-[4vh] font-bold mb-2 md:mb-4 text-gray-800 md:text-left ml-0 text-center">
                                {activeItem.name}
                            </h3>
                        )}
                        {activeItem.description && (
                            <p 
                                className="text-gray-700 text-sm sm:text-base md:text-lg" 
                            >
                                {activeItem.description}
                            </p>
                        )}

                        {/* Advantages */}
                        {activeItem.advantages && activeItem.advantages.length > 0 && (
                            <div className="mt-3 md:mt-6">
                                <h4 className="text-lg sm:text-xl md:text-2xl text-left md:text-center font-bold mb-2 text-gray-800">
                                    Advantages
                                </h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 md:gap-y-2 pl-0">
                                    {activeItem.advantages.map((adv, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start text-base md:text-lg text-gray-700"
                                        >
                                            <FaCheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                                            <span>{adv}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Pictures */}
                        {activeItem.pictures && activeItem.pictures.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                                {activeItem.pictures.map((pic, picIdx) => (
                                    <div key={picIdx} className="aspect-video overflow-hidden rounded-lg shadow-md">
                                        <img
                                            src={typeof pic === "string" ? pic : getDisplayUrl(pic)}
                                            alt={`${activeItem.name} - Image ${picIdx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Additional Info - moved below the pictures */}
                        {(activeItem.colorPossibilities || activeItem.installationTime) && (
                            <div className="mt-4 md:mt-6">
                                {activeItem.colorPossibilities && (
                                    <p className="text-gray-700 mb-2 text-sm sm:text-base md:text-lg">
                                        <strong className="text-sm sm:text-base md:text-lg">
                                            Color Possibilities:{" "}
                                        </strong>
                                        {activeItem.colorPossibilities}
                                    </p>
                                )}
                                {activeItem.installationTime && (
                                    <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                                        <strong className="text-sm sm:text-base md:text-lg">
                                            Installation Time:{" "}
                                        </strong>
                                        {activeItem.installationTime}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>
        );
    }

    // ---------- EDIT MODE -----------
    const handleFieldChange = (field, value) => {
        onConfigChange?.({
            ...config,
            [field]: value,
        });
    };

    // For the edit mode, if we have string items, convert to simple editor
    if (!hasStructuredItems) {
        return (
            <div className="p-2 bg-gray-700 rounded text-white">
                <h3 className="font-bold mb-2">Simple List Editor</h3>

                {/* Title */}
                <label className="block text-sm mb-2">
                    List Title:
                    <input
                        type="text"
                        value={displayTitle}
                        onChange={(e) => handleFieldChange("sectionTitle", e.target.value)}
                        className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                    />
                </label>

                {/* List Style */}
                <label className="block text-sm mb-2">
                    List Style:
                    <select
                        value={listStyle}
                        onChange={(e) => handleFieldChange("listStyle", e.target.value)}
                        className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                    >
                        <option value="none">None</option>
                        <option value="bullet">Bullet Points</option>
                        <option value="numbered">Numbered List</option>
                    </select>
                </label>

                {/* Items */}
                <div className="mt-2">
                    <h4 className="font-semibold mb-1">List Items:</h4>
                    <div className="space-y-2">
                        {localItems.map((item, idx) => (
                            <div key={idx} className="flex items-start">
                                <textarea
                                    rows={2}
                                    value={item}
                                    onChange={(e) => {
                                        const newItems = [...localItems];
                                        newItems[idx] = e.target.value;
                                        handleFieldChange("items", newItems);
                                    }}
                                    className="flex-grow px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newItems = [...localItems];
                                        newItems.splice(idx, 1);
                                        handleFieldChange("items", newItems);
                                    }}
                                    className="ml-2 bg-red-600 text-white px-2 py-1 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            handleFieldChange("items", [...localItems, "New item"]);
                        }}
                        className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-sm"
                    >
                        + Add Item
                    </button>
                </div>
            </div>
        );
    }

    // Standard structured items editor - original code below
    // Updaters for items array
    const addItem = () => {
        const newItem = {
            id: Date.now(),
            name: "",
            description: "",
            advantages: [],
            colorPossibilities: "",
            installationTime: "",
            pictures: [],
        };
        handleFieldChange("items", [...localItems, newItem]);
    };

    const removeItem = (id) => {
        handleFieldChange(
            "items",
            localItems.filter((i) => i.id !== id)
        );
    };

    const updateItemField = (id, field, newVal) => {
        const updated = localItems.map((i) =>
            i.id === id ? { ...i, [field]: newVal } : i
        );
        handleFieldChange("items", updated);
    };

    const addAdvantage = (id) => {
        const updated = localItems.map((i) =>
            i.id === id ? { ...i, advantages: [...i.advantages, ""] } : i
        );
        handleFieldChange("items", updated);
    };

    const updateAdvantage = (id, idx, newVal) => {
        const updated = localItems.map((i) => {
            if (i.id === id) {
                const advantages = [...i.advantages];
                advantages[idx] = newVal;
                return { ...i, advantages };
            }
            return i;
        });
        handleFieldChange("items", updated);
    };

    const removeAdvantage = (id, idx) => {
        const updated = localItems.map((i) => {
            if (i.id === id) {
                const advantages = [...i.advantages];
                advantages.splice(idx, 1);
                return { ...i, advantages };
            }
            return i;
        });
        handleFieldChange("items", updated);
    };

    const addPicture = (id) => {
        const updated = localItems.map((i) =>
            i.id === id ? { ...i, pictures: [...i.pictures, ""] } : i // Ensure picture is initialized as string
        );
        handleFieldChange("items", updated);
    };

    const updatePicture = (id, idx, newVal) => {
        const updated = localItems.map((i) => {
            if (i.id === id) {
                const pictures = [...i.pictures];
                pictures[idx] = newVal;
                return { ...i, pictures };
            }
            return i;
        });
        handleFieldChange("items", updated);
    };

    const removePicture = (id, idx) => {
        const updated = localItems.map((i) => {
            if (i.id === id) {
                const pictures = [...i.pictures];
                pictures.splice(idx, 1);
                return { ...i, pictures };
            }
            return i;
        });
        handleFieldChange("items", updated);
    };

    const handleImageUpload = (itemIndex, picIndex, file) => {
        if (!file) return;

        // Create a URL for display
        const fileURL = URL.createObjectURL(file);

        // Update the picture item
        const targetItem = localItems.find((_, i) => i === itemIndex);
        if (targetItem) {
            // Ensure pictures array exists
            const currentPictures = targetItem.pictures || [];
            const newPictures = [...currentPictures];
            newPictures[picIndex] = { url: fileURL, name: file.name }; // Store as object with URL
            updateItemField(targetItem.id, "pictures", newPictures);
        }
    };

    // Original editor code
    return (
        <div className="p-2 bg-gray-700 rounded text-white overflow-auto max-h-[80vh]">
            <h3 className="font-bold mb-2">Siding Options Editor</h3>

            {/* Section Title */}
            <label className="block text-sm mb-2">
                Section Title:
                <input
                    type="text"
                    value={displayTitle}
                    onChange={(e) => handleFieldChange("sectionTitle", e.target.value)}
                    className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                />
            </label>

            {/* Items */}
            <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Options</h4>
                {localItems.map((item, itemIdx) => ( // Add itemIdx for handleImageUpload
                    <div
                        key={item.id}
                        className="border border-gray-600 p-3 rounded mb-3"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold">{item.name || "Unnamed Option"}</h5>
                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-400 hover:text-red-300"
                            >
                                Remove
                            </button>
                        </div>

                        {/* Name */}
                        <label className="block text-sm mb-2">
                            Name:
                            <input
                                type="text"
                                value={item.name || ""}
                                onChange={(e) =>
                                    updateItemField(item.id, "name", e.target.value)
                                }
                                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                            />
                        </label>

                        {/* Description */}
                        <label className="block text-sm mb-2">
                            Description:
                            <textarea
                                rows="2"
                                value={item.description || ""}
                                onChange={(e) =>
                                    updateItemField(item.id, "description", e.target.value)
                                }
                                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                            />
                        </label>

                        {/* Advantages */}
                        <div className="mt-2">
                            <label className="block text-sm mb-1">Advantages:</label>
                            <div className="ml-3">
                                {item.advantages?.map((adv, idx) => (
                                    <div key={idx} className="flex items-center mb-1">
                                        <input
                                            type="text"
                                            value={adv}
                                            onChange={(e) =>
                                                updateAdvantage(item.id, idx, e.target.value)
                                            }
                                            className="flex-grow px-2 py-1 bg-gray-600 text-white text-sm rounded border border-gray-500"
                                        />
                                        <button
                                            onClick={() => removeAdvantage(item.id, idx)}
                                            className="ml-2 text-red-400 hover:text-red-300"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addAdvantage(item.id)}
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                                >
                                    Add Advantage
                                </button>
                            </div>
                        </div>

                        {/* Color Possibilities */}
                        <label className="block text-sm mt-2 mb-1">
                            Color Possibilities:
                                <input
                                    type="text"
                                value={item.colorPossibilities || ""}
                                onChange={(e) =>
                                    updateItemField(item.id, "colorPossibilities", e.target.value)
                                }
                                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white text-sm rounded border border-gray-500"
                            />
                        </label>

                        {/* Installation Time */}
                        <label className="block text-sm mt-2 mb-1">
                            Installation Time:
                            <input
                                type="text"
                                value={item.installationTime || ""}
                                onChange={(e) =>
                                    updateItemField(item.id, "installationTime", e.target.value)
                                }
                                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white text-sm rounded border border-gray-500"
                            />
                        </label>

                        {/* Pictures */}
                        <div className="mt-2">
                            <label className="block text-sm mb-1">Pictures:</label>
                            <div className="ml-3">
                                {(item.pictures || []).map((pic, idx) => (
                                    <div key={idx} className="flex items-center mb-1">
                                        <div className="flex-grow flex items-center">
                                                    <input
                                                        type="text"
                                                value={typeof pic === 'string' ? pic : pic.url || ''} // Handle string or object
                                                onChange={(e) =>
                                                    updatePicture(item.id, idx, e.target.value)
                                                }
                                                className="flex-grow px-2 py-1 bg-gray-600 text-white text-sm rounded-l border border-gray-500"
                                            />
                                            <label className="bg-gray-500 px-2 py-1 cursor-pointer text-xs border-t border-r border-b border-gray-500 rounded-r">
                                                Browse
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleImageUpload(itemIdx, idx, file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => removePicture(item.id, idx)}
                                            className="ml-2 text-red-400 hover:text-red-300"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addPicture(item.id)}
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                                >
                                    Add Picture
                                </button>
                                </div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={addItem}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded font-medium"
                >
                    Add Option
                </button>
            </div>
        </div>
    );
};

DetailedListBlock.propTypes = {
    config: PropTypes.shape({
        title: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string,
            description: PropTypes.string,
            advantages: PropTypes.arrayOf(PropTypes.string),
            colorPossibilities: PropTypes.string,
            installationTime: PropTypes.string,
            pictures: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
        })),
        backgroundColor: PropTypes.string,
        textColor: PropTypes.string,
        itemBackgroundColor: PropTypes.string,
        itemTextColor: PropTypes.string,
        imageBorderColor: PropTypes.string,
    }),
    readOnly: PropTypes.bool,
    onConfigChange: PropTypes.func.isRequired,
    getDisplayUrl: PropTypes.func,
    onFileChange: PropTypes.func, 
};

DetailedListBlock.EditorPanel = function DetailedListBlockEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl }) {
    const [formData, setFormData] = useState(currentConfig || {});

    useEffect(() => {
        setFormData(currentConfig || {});
    }, [currentConfig]);

    const handleOverallChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        onPanelConfigChange(newFormData); // Propagate all changes live
    };

    const handleItemDetailChange = (itemIndex, field, value) => {
        const updatedItems = (formData.items || []).map((item, i) => 
            i === itemIndex ? { ...item, [field]: value } : item
        );
        handleOverallChange('items', updatedItems);
    };

    const handleItemAdvantageChange = (itemIndex, advIndex, value) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                const updatedAdvantages = (item.advantages || []).map((adv, j) => 
                    j === advIndex ? value : adv
                );
                return { ...item, advantages: updatedAdvantages };
            }
            return item;
        });
        handleOverallChange('items', updatedItems);
    };

    const handleAddItemAdvantage = (itemIndex) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                return { ...item, advantages: [...(item.advantages || []), 'New Advantage'] };
            }
            return item;
        });
        handleOverallChange('items', updatedItems);
    };

    const handleRemoveItemAdvantage = (itemIndex, advIndex) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                const updatedAdvantages = (item.advantages || []).filter((_, j) => j !== advIndex);
                return { ...item, advantages: updatedAdvantages };
            }
            return item;
        });
        handleOverallChange('items', updatedItems);
    };

    const handleAddItem = () => {
        const newItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: 'New Item',
            description: 'New item description.',
            advantages: ['Advantage 1'],
            colorPossibilities: '',
            installationTime: '',
            pictures: [] // Start with an empty pictures array
        };
        handleOverallChange('items', [...(formData.items || []), newItem]);
    };

    const handleRemoveItem = (itemIndex) => {
        const itemToRemove = formData.items?.[itemIndex];
        if (itemToRemove && itemToRemove.pictures) {
            itemToRemove.pictures.forEach(pic => {
                if (typeof pic === 'object' && pic.url && pic.url.startsWith('blob:')) {
                    URL.revokeObjectURL(pic.url);
                }
            });
        }
        const updatedItems = (formData.items || []).filter((_, i) => i !== itemIndex);
        handleOverallChange('items', updatedItems);
    };

    const handleItemPictureChange = (itemIndex, picIndex, file) => {
        if (file && onPanelFileChange) {
            // This tells ServiceEditPage to handle the file and update the config path
            onPanelFileChange({ blockItemIndex: itemIndex, pictureIndex: picIndex, file: file, field: 'pictures'});
        }
    };
    
    const handleAddPictureToItem = (itemIndex) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                // Add a null placeholder. The actual file object will be added by ServiceEditPage
                return { ...item, pictures: [...(item.pictures || []), null] }; 
            }
            return item;
        });
        handleOverallChange('items', updatedItems);
    };

    const handleRemoveItemPicture = (itemIndex, picIndex) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                const picToRemove = item.pictures?.[picIndex];
                if (typeof picToRemove === 'object' && picToRemove.url && picToRemove.url.startsWith('blob:')) {
                    URL.revokeObjectURL(picToRemove.url);
                }
                const updatedPictures = (item.pictures || []).filter((_, j) => j !== picIndex);
                return { ...item, pictures: updatedPictures };
            }
            return item;
        });
        handleOverallChange('items', updatedItems);
    };


    return (
        <div className="space-y-6 p-3 bg-gray-50 rounded-md shadow">
            <div>
                <label className="block text-sm font-medium text-gray-700">Main Title (Panel Edit):</label>
                <input 
                    type="text" 
                    value={formData.title || ''} 
                    onChange={(e) => handleOverallChange('title', e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            <h4 className="text-lg font-semibold text-gray-700 pt-3 border-t mt-5">Color Scheme</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Overall Background Color:</label>
                    <input type="color" value={formData.backgroundColor || '#FFFFFF'} onChange={(e) => handleOverallChange('backgroundColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Overall Text Color:</label>
                    <input type="color" value={formData.textColor || '#333333'} onChange={(e) => handleOverallChange('textColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Item Background Color:</label>
                    <input type="color" value={formData.itemBackgroundColor || '#F9FAFB'} onChange={(e) => handleOverallChange('itemBackgroundColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Item Text Color:</label>
                    <input type="color" value={formData.itemTextColor || '#111827'} onChange={(e) => handleOverallChange('itemTextColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Image Border Color (Edit Mode):</label>
                    <input type="color" value={formData.imageBorderColor || '#E5E7EB'} onChange={(e) => handleOverallChange('imageBorderColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-700 pt-3 border-t mt-5">Manage Items</h4>
            {(formData.items || []).map((item, itemIndex) => (
                <div key={item.id || itemIndex} className="space-y-3 p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex justify-between items-center">
                        <h5 className="text-md font-semibold text-gray-600">Item {itemIndex + 1}: {item.name || 'Unnamed Item'}</h5>
                        <button onClick={() => handleRemoveItem(itemIndex)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove Item</button>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Name (Panel Edit):</label>
                        <input type="text" value={item.name || ''} onChange={(e) => handleItemDetailChange(itemIndex, 'name', e.target.value)} className="mt-0.5 block w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Description (Panel Edit):</label>
                        <textarea value={item.description || ''} onChange={(e) => handleItemDetailChange(itemIndex, 'description', e.target.value)} rows={3} className="mt-0.5 block w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md resize-none" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Advantages (Panel Edit):</label>
                        {(item.advantages || []).map((adv, advIndex) => (
                            <div key={advIndex} className="flex items-center space-x-2 mt-1">
                                <input type="text" value={adv} onChange={(e) => handleItemAdvantageChange(itemIndex, advIndex, e.target.value)} className="flex-grow px-2 py-1 text-xs bg-gray-50 border border-gray-300 rounded-md" />
                                <button onClick={() => handleRemoveItemAdvantage(itemIndex, advIndex)} className="text-xs text-red-500 hover:text-red-700 font-semibold">&times; Remove</button>
                            </div>
                        ))}
                        <button onClick={() => handleAddItemAdvantage(itemIndex)} className="mt-1 text-xs text-blue-500 hover:text-blue-700 font-semibold">+ Add Advantage</button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600">Pictures:</label>
                        {(item.pictures || []).map((pic, picIndex) => {
                            const picUrl = getDisplayUrl ? getDisplayUrl(pic) : (typeof pic === 'object' && pic?.url ? pic.url : typeof pic === 'string' ? pic : '');
                            return (
                                <div key={picIndex} className="flex items-center space-x-2 mt-1 p-1 border border-dashed border-gray-300 rounded">
                                    {picUrl && <img src={picUrl} alt={`Pic ${picIndex + 1}`} className="h-12 w-12 object-cover rounded" />}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleItemPictureChange(itemIndex, picIndex, e.target.files[0])} 
                                        className="flex-grow text-xs file:text-xs file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                    />
                                    <button onClick={() => handleRemoveItemPicture(itemIndex, picIndex)} className="text-xs text-red-500 hover:text-red-700 font-semibold">&times; Remove</button>
                                </div>
                            );
                        })}
                        <button onClick={() => handleAddPictureToItem(itemIndex)} className="mt-1 text-xs text-blue-500 hover:text-blue-700 font-semibold">+ Add Picture Slot</button>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Color Possibilities:</label>
                        <input type="text" value={item.colorPossibilities || ''} onChange={(e) => handleItemDetailChange(itemIndex, 'colorPossibilities', e.target.value)} className="mt-0.5 block w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Installation Time:</label>
                        <input type="text" value={item.installationTime || ''} onChange={(e) => handleItemDetailChange(itemIndex, 'installationTime', e.target.value)} className="mt-0.5 block w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                </div>
            ))}
            <button onClick={handleAddItem} className="mt-4 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm font-semibold">+ Add New Item</button>
        </div>
    );
};

DetailedListBlock.EditorPanel.propTypes = {
    currentConfig: PropTypes.object.isRequired,
    onPanelConfigChange: PropTypes.func.isRequired,
    onPanelFileChange: PropTypes.func.isRequired, 
    getDisplayUrl: PropTypes.func.isRequired, 
};

export default DetailedListBlock;
