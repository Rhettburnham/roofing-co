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

// Helper to transform the themeColors object/array from OneForm into the array format ColorEditor uses
// This can be adapted based on how ColorEditor.jsx exports its default definitions or how OneForm provides it.
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

const ThemeColorPicker = ({
  label,
  currentColorValue = '#FFFFFF',
  themeColors = [],
  onColorChange,
  fieldName,
  className = '',
}) => {
  const [selectedColorName, setSelectedColorName] = useState('Custom');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const paletteColors = transformEditableColorsForPicker(themeColors);
  
  useEffect(() => {
    let matchedName = 'Custom';
    if (paletteColors && currentColorValue) {
      const normalizedCurrentColor = currentColorValue.toUpperCase();
      for (const color of paletteColors) {
        if (color.value.toUpperCase() === normalizedCurrentColor) {
          matchedName = color.label; // Use label for display
          break;
        }
      }
    }
    setSelectedColorName(matchedName);
  }, [currentColorValue, paletteColors]);

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
  }, [dropdownRef]);

  const handlePaletteColorSelect = (color) => {
    onColorChange(fieldName, color.value);
    setSelectedColorName(color.label);
    setIsDropdownOpen(false);
  };

  const handleDirectColorInputChange = (e) => {
    const newColorValue = e.target.value;
    onColorChange(fieldName, newColorValue);
    // useEffect will update selectedColorName to 'Custom' if not in palette
  };

  const labelStyle = "text-sm mb-1 font-medium text-gray-700";

  return (
    <div className={`block text-sm ${className || ''}`}>
      <span className={labelStyle}>{label}</span>
      <div className="mt-1 mb-2 flex items-center space-x-2">
        {/* Direct color input type=color */}
        <input 
          type="color" 
          className="h-10 w-12 rounded-md shadow-sm cursor-pointer border border-gray-300 p-0.5"
          value={currentColorValue || '#FFFFFF'} 
          onChange={handleDirectColorInputChange}
        />
        {/* Read-only text input showing current hex, or direct hex input */}
        <input
          type="text"
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={currentColorValue || ''}
          onChange={handleDirectColorInputChange}
          placeholder="#RRGGBB"
        />
      </div>

      {/* Dropdown for Palette Colors */}
      {paletteColors.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          >
            <span className="flex items-center">
              <span 
                className="w-4 h-4 rounded-sm mr-2 border border-gray-400"
                style={{ backgroundColor: currentColorValue }}
              ></span>
              {selectedColorName || 'Select Color'} {selectedColorName === 'Custom' && `(${currentColorValue})`}
            </span>
            {/* Chevron Icon */}
            <svg className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto py-1">
              {paletteColors.map((color) => (
                <button
                  key={color.id || color.name}
                  onClick={() => handlePaletteColorSelect(color)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center hover:bg-gray-100 ${currentColorValue.toUpperCase() === color.value.toUpperCase() ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-900'}`}
                  title={`${color.label} (${color.value})\n${color.description || ''}`}
                >
                  <span 
                    className="w-4 h-4 rounded-sm mr-2.5 border border-gray-400 shrink-0"
                    style={{ backgroundColor: color.value }}
                  ></span>
                  <span className="flex-grow truncate">{color.label}</span>
                  <span className="ml-2 text-gray-500 text-xs shrink-0">({color.value})</span>
                </button>
              ))}
               <button // Option to explicitly set to custom if user wants to clear a palette selection
                  onClick={() => {
                      setSelectedColorName('Custom');
                      setIsDropdownOpen(false);
                      // Note: This doesn't change the color itself, only the displayed name if it was a palette color.
                      // User would then use the hex input or color picker for a new custom value.
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center hover:bg-gray-100 text-gray-700 italic`}
                >
                  <span 
                    className="w-4 h-4 rounded-sm mr-2.5 border border-gray-400 shrink-0 bg-transparent flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </span>
                  Use Custom Color
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ThemeColorPicker.propTypes = {
  label: PropTypes.string.isRequired,
  currentColorValue: PropTypes.string,
  themeColors: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), 
  onColorChange: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ThemeColorPicker; 