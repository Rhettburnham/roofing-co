import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Helper to transform the themeColors object/array from OneForm into a usable array
const transformColorsForPicker = (themeColorsInput) => {
  if (Array.isArray(themeColorsInput)) return themeColorsInput;
  if (typeof themeColorsInput === 'object' && themeColorsInput !== null) {
    return Object.entries(themeColorsInput).map(([name, value], index) => ({
      id: `theme-color-${name}-${index}`,
      name: name,
      label: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: typeof value === 'string' ? value : '#000000',
    }));
  }
  return [];
};

// Color Picker Modal Component (copied from ThemeColorPicker)
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

const PanelColorPicker = ({
  currentColorValue = '#FFFFFF',
  themeColors = [],
  onColorChange,
  fieldName,
  className = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hexInputValue, setHexInputValue] = useState(currentColorValue);
  const dropdownRef = useRef(null);

  const paletteColors = transformColorsForPicker(themeColors);

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

  const handleSplotchClick = () => {
    setIsModalOpen(true);
  };

  const handleModalColorSelect = (newColor) => {
    setHexInputValue(newColor);
    onColorChange(fieldName, newColor);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        {/* Clickable circular color splotch on the left */}
        <button
          type="button"
          onClick={handleSplotchClick}
          className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
          style={{ backgroundColor: currentColorValue }}
          title="Click to open color picker"
        />
        
        {/* Hex input in the middle */}
        <input
          type="text"
          value={hexInputValue}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:border-blue-500"
          placeholder="#000000"
        />
        
        {/* Dropdown button on the right */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-2 py-1 bg-gray-700 border border-gray-600 border-l-0 rounded-r-md text-gray-300 hover:text-white hover:bg-gray-600 focus:outline-none focus:border-blue-500"
          title="Choose from palette"
        >
          <svg 
            className={`w-3 h-3 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {isDropdownOpen && paletteColors.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
          <div className="grid grid-cols-4 gap-1 p-2">
            {paletteColors.map((color) => (
              <button
                key={color.id || color.name}
                onClick={() => handlePaletteColorSelect(color)}
                className="group flex flex-col items-center p-1 rounded hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
                title={`${color.label} (${color.value})`}
              >
                <div 
                  className={`w-6 h-6 rounded-full border-2 ${
                    currentColorValue.toUpperCase() === color.value.toUpperCase() 
                      ? 'border-blue-400' 
                      : 'border-gray-500'
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

PanelColorPicker.propTypes = {
  currentColorValue: PropTypes.string,
  themeColors: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onColorChange: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default PanelColorPicker; 