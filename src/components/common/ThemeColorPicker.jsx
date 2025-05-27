import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Helper function to determine if a color is dark (for text contrast)
const isColorDark = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string' || hexColor.length < 4) return false; // Basic check
  let color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('');
  }
  if (color.length !== 6) return false; // Invalid hex after potential expansion

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false; // Check for parsing errors

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );
  return hsp < 127.5; // Threshold can be adjusted
};

const ThemeColorPicker = ({ label, currentColorValue, themeColors, onColorChange, fieldName, className }) => {
  const [isCustom, setIsCustom] = useState(true); // Default to true, will be updated by useEffect
  const [selectedThemeColorName, setSelectedThemeColorName] = useState('custom');
  
  useEffect(() => {
    const isTheme = themeColors && Object.values(themeColors).includes(currentColorValue);
    setIsCustom(!isTheme);
    setSelectedThemeColorName(isTheme ? Object.keys(themeColors).find(key => themeColors[key] === currentColorValue) : 'custom');
  }, [currentColorValue, themeColors]);

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedThemeColorName(value);
    if (value === 'custom') {
      setIsCustom(true);
      // When switching to custom, we don't immediately change the color;
      // the user will use the input[type=color] or text input.
      // If currentColorValue was from a theme, it remains until changed by user.
    } else {
      setIsCustom(false);
      if (themeColors && themeColors[value]) {
        onColorChange(fieldName, themeColors[value]);
      }
    }
  };

  const handleColorInputChange = (e) => {
    const newColorValue = e.target.value;
    onColorChange(fieldName, newColorValue);
    // If user types or picks a color, assume it's custom
    if (selectedThemeColorName !== 'custom') {
        setSelectedThemeColorName('custom');
        setIsCustom(true);
    }
  };

  return (
    <label className={`block text-sm ${className || ''}`}>
      <span className="font-medium text-gray-400">{label}:</span>
      <div className="flex items-center space-x-2 mt-1">
        <select 
          value={selectedThemeColorName} 
          onChange={handleSelectChange}
          className="bg-gray-700 px-2 py-1.5 rounded text-white text-xs focus:ring-blue-500 focus:border-blue-500 h-8 flex-grow"
        >
          <option value="custom">Custom Color...</option>
          {themeColors && Object.entries(themeColors).map(([name, value]) => (
            <option 
              key={name} 
              value={name} 
              style={{ 
                backgroundColor: value, 
                color: isColorDark(value) ? '#FFFFFF' : '#000000',
                padding: '2px 5px' // Add some padding for better visual
              }}
            >
              {name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({value})
            </option>
          ))}
        </select>
        <input 
          type="color" 
          className="h-8 w-10 p-0.5 bg-gray-700 border border-gray-600 rounded-md shadow-sm cursor-pointer"
          value={currentColorValue || '#FFFFFF'} 
          onChange={handleColorInputChange}
        />
      </div>
      {isCustom && (
        <input 
          type="text"
          className="bg-gray-600 mt-1 px-2 py-1 rounded w-full text-xs text-white focus:ring-blue-500 focus:border-blue-500"
          value={currentColorValue || ''}
          onChange={handleColorInputChange}
          placeholder="#RRGGBB or Tailwind class (e.g. bg-red-500)"
        />
      )}
    </label>
  );
};

ThemeColorPicker.propTypes = {
  label: PropTypes.string.isRequired,
  currentColorValue: PropTypes.string,
  themeColors: PropTypes.object,
  onColorChange: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

ThemeColorPicker.defaultProps = {
  currentColorValue: '#FFFFFF',
  themeColors: {},
  className: '',
};

export default ThemeColorPicker; 