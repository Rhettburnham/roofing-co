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

const PanelColorPicker = ({
  currentColorValue = '#FFFFFF',
  themeColors = [],
  onColorChange,
  fieldName,
  className = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        {/* Circular color splotch on the left */}
        <div 
          className="w-6 h-6 rounded-full flex-shrink-0"
          style={{ backgroundColor: currentColorValue }}
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