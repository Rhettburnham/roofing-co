// src/components/blocks/ThreeGridWithRichTextBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaPlus, FaTrash, FaImage, FaTimes } from "react-icons/fa";

// Helper function (can be moved to a utils file if used elsewhere)
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value; // Handles direct URLs or blob URLs
  if (value.url) return value.url; // Handles { url: '...', file: File }
  return null;
};

// EditableText Component (Copied from GeneralList.jsx/VideoCTA.jsx, consider moving to common/)
const EditableText = ({ value, onChange, onBlur, tag: Tag = 'p', className = '', inputClassName = '', isTextarea = false, placeholder = "Edit", readOnly = false, style = {} }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

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
    if (currentValue !== value) {
      onChange(currentValue);
    }
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextarea) {
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
      if (onBlur) onBlur();
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
      onChange: handleInputChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `${className} ${inputClassName} outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm bg-white/70 placeholder-gray-500/70 shadow-inner`,
      style: { ...style, width: '100%' }
    };
    if (isTextarea) {
      return <textarea {...commonInputProps} rows={Math.max(2, (currentValue || '').split('\n').length)} placeholder={placeholder} />;
    }
    return <input {...commonInputProps} type="text" placeholder={placeholder} />;
  }

  const cursorClass = !readOnly && !isEditing ? 'cursor-pointer hover:bg-gray-400/10' : '';

  return (
    <Tag
      className={`${className} ${cursorClass} transition-colors duration-150 ease-in-out p-0 m-0 min-h-[1em] w-full break-words`}
      onClick={activateEditMode}
      title={!readOnly ? "Click to edit" : ""}
      style={style}
    >
      {value || <span className="text-gray-400/80 italic text-sm">(Edit to add text)</span>}
    </Tag>
  );
};

/**
 * ThreeGridWithRichTextBlock
 * 
 * config = {
 *   paragraphText: string,
 *   items: [
 *     { title, image, alt } // each column
 *   ]
 * }
 */
const ThreeGridWithRichTextBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
  onToggleEditor,
}) => {
  const {
    paragraphText = "",
    items = [],
  } = config;

  if (!readOnly) {
    return (
      <div className="relative group border-2 border-blue-400/50">
        <ThreeGridDisplay 
          config={config} 
          readOnly={false} 
          onConfigChange={onConfigChange} 
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
        </div>
    );
  }

  return <ThreeGridDisplay config={config} readOnly={true} />;
};

const ThreeGridDisplay = ({ config = {}, readOnly = false, onConfigChange }) => {
  const {
    paragraphText = "This is a default paragraph. Click to edit this text. You can add more details or introductory content here.",
    items = [
      { title: "Feature 1", image: "https://via.placeholder.com/400x300.png?text=Placeholder+1", alt: "Placeholder Image 1" },
      { title: "Feature 2", image: "https://via.placeholder.com/400x300.png?text=Placeholder+2", alt: "Placeholder Image 2" },
      { title: "Feature 3", image: "https://via.placeholder.com/400x300.png?text=Placeholder+3", alt: "Placeholder Image 3" },
    ],
  } = config;

  const handleLocalChange = (field, value, itemIndex = null) => {
    if (onConfigChange) {
      if (itemIndex !== null) {
        const newItems = items.map((item, idx) => 
          idx === itemIndex ? { ...item, [field]: value } : item
        );
        onConfigChange({ ...config, items: newItems });
      } else {
        onConfigChange({ ...config, [field]: value });
      }
    }
  };

  return (
    <section className={`w-full bg-gradient-to-t from-accent to-white py-8 md:py-12 ${!readOnly ? 'p-1 bg-slate-50' : ''}`}>
      <div className="container mx-auto text-center mb-4 px-6 md:px-10">
        <EditableText
          value={paragraphText}
          onChange={(newVal) => handleLocalChange("paragraphText", newVal)}
          tag="p"
          className="text-xs md:text-lg text-gray-700 my-4 max-w-full overflow-hidden text-ellipsis font-serif"
          inputClassName="text-xs md:text-lg text-gray-700 font-serif w-full"
          isTextarea
          placeholder="Introductory paragraph..."
          readOnly={readOnly}
        />
      </div>
        <div className="container mx-auto">
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 md:px-10">
          {(items || []).map((col, idx) => (
            <div key={col.id || idx} className="flex flex-col items-center text-center p-2 bg-white/30 rounded-lg shadow">
              {getDisplayUrlHelper(col.image) && (
                  <img
                  src={getDisplayUrlHelper(col.image)}
                  alt={col.alt || col.title || "Grid item image"}
                  className="w-full h-[15vh] md:h-48 object-cover shadow-md rounded-t-lg"
                  />
                )}
              {!getDisplayUrlHelper(col.image) && !readOnly && (
                <div className="w-full h-[15vh] md:h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-t-lg">
                  Add image in Editor Panel
                </div>
              )}
              <EditableText
                value={col.title}
                onChange={(newVal) => handleLocalChange("title", newVal, idx)}
                tag="h3"
                className="text-md md:text-xl font-semibold mt-3 md:mt-4 px-2"
                inputClassName="text-md md:text-xl font-semibold w-full text-center"
                placeholder="Item Title"
                readOnly={readOnly}
              />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
};

ThreeGridWithRichTextBlock.EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl }) => {
  const {
    items = [],
  } = currentConfig;

  const currentGetDisplayUrl = typeof getDisplayUrl === 'function' ? getDisplayUrl : getDisplayUrlHelper;

  const handleItemFieldChange = (idx, field, value) => {
    const newItems = items.map((item, itemIdx) => 
      itemIdx === idx ? { ...item, [field]: value } : item
    );
    onPanelConfigChange({ items: newItems });
  };

  const handleImageFileChange = (itemIndex, file) => {
    if (file && onPanelFileChange) {
      const pathData = { field: 'image', blockItemIndex: itemIndex }; // field refers to key in item object
      onPanelFileChange(pathData, file); 
    }
  };

  const handleImageUrlChange = (itemIndex, url) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        if (typeof item.image === 'object' && item.image?.file && item.image?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(item.image.url);
        }
        return { ...item, image: { file: null, url: url, name: url.split('/').pop() || `image_${i}`, originalUrl: url } };
      }
      return item;
    });
    onPanelConfigChange({ items: newItems });
  };

  const addColumn = () => {
    const newItem = { id: Date.now(), title: "New Column", image: {url: "", name: "New Image", file: null, originalUrl: ""}, alt: "" };
    const newItems = [...items, newItem];
    onPanelConfigChange({ items: newItems });
  };

  const removeColumn = (idxToRemove) => {
    const itemToRemove = items[idxToRemove];
    if (itemToRemove && typeof itemToRemove.image === 'object' && itemToRemove.image?.url?.startsWith('blob:')){
      URL.revokeObjectURL(itemToRemove.image.url);
    }
    const newItems = items.filter((_, idx) => idx !== idxToRemove);
    onPanelConfigChange({ items: newItems });
  };
  
  const inputBaseClass = "mt-1 w-full px-2 py-1.5 bg-gray-600 text-white rounded-md border border-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs";
  const labelBaseClass = "block text-xs font-medium text-gray-300 mb-0.5";

  return (
    <div className="p-3 space-y-3 bg-gray-800 text-gray-200 rounded-b-md max-h-[70vh] overflow-y-auto">
      <h3 className="text-sm font-semibold mb-2 text-center border-b border-gray-700 pb-1.5">Manage Grid Items</h3>
      
      {(items || []).map((col, idx) => (
        <div key={col.id || idx} className="border border-gray-700 p-2.5 rounded-md mb-2 bg-gray-750 shadow-sm">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-gray-400">Column {idx + 1} (Title: "{col.title || 'N/A'}")</span>
            <button
              type="button"
              onClick={() => removeColumn(idx)}
              className="p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
              title="Remove Column"
            >
              <FaTrash size={10} />
            </button>
          </div>

          <div>
            <label className={labelBaseClass}>Image:</label>
            <div className="flex items-center space-x-1 mb-1 p-1 bg-gray-700 rounded">
              {currentGetDisplayUrl(col.image) && <img src={currentGetDisplayUrl(col.image)} alt={`Thumb ${idx}`} className="h-8 w-8 object-cover rounded"/>}
            <input
              type="text"
                placeholder="Image URL" 
                value={(typeof col.image === 'string' && !col.image.startsWith('blob:')) ? col.image : (col.image?.originalUrl || col.image?.url || '')}
                onChange={(e) => handleImageUrlChange(idx, e.target.value)} 
                className="flex-grow p-1 bg-gray-600 border-gray-500 rounded text-xs" 
              />
              <label className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-1.5 py-1 rounded cursor-pointer">
                <FaImage size={10} className="inline"/>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(idx, e.target.files?.[0])} />
          </label>
              {col.image && (col.image.url || typeof col.image === 'string') && (
                <button onClick={() => handleImageUrlChange(idx, '')} className="text-red-500 hover:text-red-400 p-0.5" title="Remove Image">
                  <FaTimes size={10}/>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>Alt Text (for image accessibility):</label>
            <input
              type="text"
              value={col.alt || ""}
              onChange={(e) => handleItemFieldChange(idx, "alt", e.target.value)}
              className={inputBaseClass}
              placeholder="Descriptive alt text..."
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addColumn}
        className="w-full mt-2 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md shadow flex items-center justify-center"
      >
        <FaPlus size={10} className="mr-1" /> Add Column
      </button>
      {(!items || items.length === 0) && <p className="text-xs text-gray-400 text-center italic mt-2">No columns defined. Click 'Add Column' to start.</p>}
    </div>
  );
};

export default ThreeGridWithRichTextBlock;
