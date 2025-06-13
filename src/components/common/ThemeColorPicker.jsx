import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
// EditableColorSelectionModal is no longer needed

// Helper function to determine if a color is dark (for text contrast)
const isColorDark = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string' || hexColor.length < 4) return false;
  let color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('');
  }
  if (color.length !== 6) return false;

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;

  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );
  return hsp < 127.5;
};

// Helper to transform the themeColors object/array from OneForm into a usable array
const transformEditableColorsForPicker = (themeColorsInput) => {
  if (Array.isArray(themeColorsInput)) return themeColorsInput;
  if (typeof themeColorsInput === 'object' && themeColorsInput !== null) {
    return Object.entries(themeColorsInput).map(([name, value], index) => ({
      id: `theme-color-${name}-${index}`,
      name: name,
      label: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: typeof value === 'string' ? value : '#000000',
      description: `Theme color: ${name}`,
      isDefault: false,
      isRemovable: false, 
    }));
  }
  return [];
};

// House Icon Component
const HouseIcon = ({ color, className = "" }) => (
  <svg 
    className={className}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill={color}
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

// Color Picker Modal Component
const ColorPickerModal = ({ isOpen, onClose, currentColor, onColorSelect }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor]);

  const handleSave = () => {
    onColorSelect(selectedColor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Choose Color</h3>
        
        <div className="mb-4">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full h-20 rounded-md border border-gray-300 cursor-pointer"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hex Value:</label>
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    
  );
};

const ThemeColorPicker = ({
  label,
  currentColorValue = '#FFFFFF',
  themeColors = [],
  onColorChange,
  fieldName,
  className = '',
  variant = 'splotch', // 'splotch', 'icon', 'text'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hexInputValue, setHexInputValue] = useState(currentColorValue);
  const dropdownRef = useRef(null);

  const paletteColors = transformEditableColorsForPicker(themeColors);

  // Update hex input when currentColorValue changes from outside
  useEffect(() => {
    setHexInputValue(currentColorValue);
  }, [currentColorValue]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePaletteColorSelect = (color) => {
    setHexInputValue(color.value);
    onColorChange(fieldName, color.value);
    setIsDropdownOpen(false);
  };

  const handleHexInputChange = (e) => {
    const newValue = e.target.value;
    setHexInputValue(newValue);
    // Validate hex color format before calling onChange
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue) || /^#[0-9A-Fa-f]{3}$/.test(newValue)) {
      onColorChange(fieldName, newValue);
    }
  };

  const handleHexInputBlur = () => {
    // On blur, ensure we have a valid hex color or revert to current
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInputValue) && !/^#[0-9A-Fa-f]{3}$/.test(hexInputValue)) {
      setHexInputValue(currentColorValue);
    } else {
      onColorChange(fieldName, hexInputValue);
    }
  };

  const handleDisplayClick = () => {
    setIsModalOpen(true);
  };

  const handleModalColorSelect = (newColor) => {
    setHexInputValue(newColor);
    onColorChange(fieldName, newColor);
  };

  // Render the appropriate display variant
  const renderDisplayVariant = () => {
    const baseClasses = "w-8 h-8 flex-shrink-0 border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all";
    
    switch (variant) {
      case 'icon':
        return (
          <button
            type="button"
            onClick={handleDisplayClick}
            className={`${baseClasses} rounded-md flex items-center justify-center bg-gray-100`}
            title="Click to open color picker"
          >
            <HouseIcon color={currentColorValue} className="w-5 h-5" />
          </button>
        );
      
      case 'text':
        return (
          <button
            type="button"
            onClick={handleDisplayClick}
            className={`${baseClasses} rounded-md flex items-center justify-center text-xs font-medium leading-none`}
            style={{ 
              color: currentColorValue,
              backgroundColor: isColorDark(currentColorValue) ? '#f5f5f5' : '#1a1a1a'
            }}
            title="Click to open color picker"
          >
            <span className="text-center">
              ABC<br />abc
            </span>
          </button>
        );
      
      case 'splotch':
      default:
        return (
          <button
            type="button"
            onClick={handleDisplayClick}
            className={`${baseClasses} rounded-full`}
            style={{ backgroundColor: currentColorValue }}
            title="Click to open color picker"
          />
        );
    }
  };

  return (
    <div className={`block text-sm ${className || ''}`}>
      {label && (
        <span className="text-base font-semibold text-black block mb-2">
          {label}
        </span>
      )}
      <div className={`relative`} ref={dropdownRef}>
        <div className="flex items-center space-x-2">
          {/* Render the appropriate display variant */}
          {renderDisplayVariant()}
          
          {/* Hex input in the middle */}
          <input
            type="text"
            value={hexInputValue}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:border-blue-500"
            placeholder="#000000"
          />
          
          {/* More obvious dropdown button on the right */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-600 border-l-0 rounded-r-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title="Choose from palette"
          >
            <svg 
              className={`w-4 h-4 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Dropdown menu with 4 columns */}
        {isDropdownOpen && paletteColors.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2 p-3">
              {paletteColors.map((color) => (
                <button
                  key={color.id || color.name}
                  onClick={() => handlePaletteColorSelect(color)}
                  className="group flex flex-col items-center p-2 rounded hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
                  title={`${color.label} (${color.value})`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      currentColorValue.toUpperCase() === color.value.toUpperCase() 
                        ? 'border-blue-400 ring-2 ring-blue-300' 
                        : 'border-gray-500 group-hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs text-gray-300 mt-1 text-center truncate w-full">
                    {color.value}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentColor={currentColorValue}
        onColorSelect={handleModalColorSelect}
      />
    </div>
  );
};

ThemeColorPicker.propTypes = {
  label: PropTypes.string,
  currentColorValue: PropTypes.string,
  themeColors: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), 
  onColorChange: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['splotch', 'icon', 'text']),
};

export default ThemeColorPicker; 