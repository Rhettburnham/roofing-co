import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ThemeColorPicker from './ThemeColorPicker'; // Assuming ThemeColorPicker is in the same directory

// Comprehensive list of web-safe and Google Fonts
const FONT_OPTIONS = [
  // System fonts
  { name: 'Arial', value: 'Arial, sans-serif', category: 'Sans-Serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif', category: 'Sans-Serif' },
  { name: 'Georgia', value: 'Georgia, serif', category: 'Serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif', category: 'Serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace', category: 'Monospace' },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif', category: 'Sans-Serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif', category: 'Sans-Serif' },
  { name: 'Impact', value: 'Impact, Charcoal, sans-serif', category: 'Display' },
  
  // Google Fonts (commonly used)
  { name: 'Inter', value: '"Inter", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Roboto', value: '"Roboto", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Lato', value: '"Lato", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Source Sans Pro', value: '"Source Sans Pro", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Nunito', value: '"Nunito", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Poppins', value: '"Poppins", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Raleway', value: '"Raleway", sans-serif', category: 'Modern Sans-Serif' },
  { name: 'Ubuntu', value: '"Ubuntu", sans-serif', category: 'Modern Sans-Serif' },
  
  // Serif fonts
  { name: 'Playfair Display', value: '"Playfair Display", serif', category: 'Display Serif' },
  { name: 'Merriweather', value: '"Merriweather", serif', category: 'Serif' },
  { name: 'Lora', value: '"Lora", serif', category: 'Serif' },
  { name: 'PT Serif', value: '"PT Serif", serif', category: 'Serif' },
  { name: 'Crimson Text', value: '"Crimson Text", serif', category: 'Serif' },
  
  // Display fonts
  { name: 'Oswald', value: '"Oswald", sans-serif', category: 'Display' },
  { name: 'Bebas Neue', value: '"Bebas Neue", cursive', category: 'Display' },
  { name: 'Anton', value: '"Anton", sans-serif', category: 'Display' },
  { name: 'Righteous', value: '"Righteous", cursive', category: 'Display' },
  
  // Monospace
  { name: 'Fira Code', value: '"Fira Code", monospace', category: 'Monospace' },
  { name: 'Source Code Pro', value: '"Source Code Pro", monospace', category: 'Monospace' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace', category: 'Monospace' },
];

// Slider Control for numeric font properties
const FontSliderControl = ({ label, value, min, max, step, onChange, unit = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <div className="flex items-center space-x-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex items-center bg-gray-700 border border-gray-600 rounded-md px-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          className="w-16 bg-transparent text-white text-center focus:outline-none"
        />
        <span className="text-gray-400 text-xs">{unit}</span>
      </div>
    </div>
  </div>
);

// Font preview component
const FontPreview = ({ fontFamily, className = "" }) => (
  <div
    className={`text-center py-2 px-3 border-2 border-gray-300 rounded-md bg-white hover:border-gray-400 transition-all ${className}`}
    style={{ fontFamily }}
  >
    <div className="text-lg font-semibold leading-tight">ABC</div>
    <div className="text-sm leading-tight">abc</div>
  </div>
);

const PanelFontController = ({
  label = "Font Settings",
  // New props for handling nested data structures
  currentData,
  onControlsChange,
  fieldPrefix, // e.g., "textSettings"
  themeColors = [],
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const dropdownRef = useRef(null);

  const textSettings = (currentData && fieldPrefix && currentData[fieldPrefix]) || {};
  
  const {
    fontFamily = 'Arial, sans-serif',
    fontSize = 16,
    fontWeight = 400,
    lineHeight = 1.5,
    letterSpacing = 0,
    textAlign = 'left',
    color = '#000000',
  } = textSettings;

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

  const handleSettingChange = (setting, value) => {
    if (onControlsChange && fieldPrefix) {
      const updatedData = {
        [fieldPrefix]: {
          ...textSettings,
          [setting]: value,
        },
      };
      onControlsChange(updatedData);
    }
  };
  
  const handleFontSelect = (font) => {
    handleSettingChange('fontFamily', font.value);
    setIsDropdownOpen(false);
  };

  const getCurrentFont = () => {
    return FONT_OPTIONS.find(font => font.value === fontFamily) || 
           { name: 'Custom Font', value: fontFamily, category: 'Custom' };
  };

  const getCategories = () => {
    const categories = ['All', ...new Set(FONT_OPTIONS.map(font => font.category))];
    return categories;
  };

  const getFilteredFonts = () => {
    if (selectedCategory === 'All') {
      return FONT_OPTIONS;
    }
    return FONT_OPTIONS.filter(font => font.category === selectedCategory);
  };

  const currentFont = getCurrentFont();

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg space-y-6">
      <h3 className="text-xl font-bold text-center text-blue-300">{label}</h3>

      {/* Font Family Selection */}
      <div className="space-y-2">
        <label className="text-base font-semibold text-gray-200 block">Font Family</label>
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center space-x-3">
            <div className="w-20 flex-shrink-0">
              <FontPreview fontFamily={fontFamily} />
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500 hover:bg-gray-600 transition-colors"
                style={{ fontFamily }}
              >
                <span className="truncate">{currentFont.name}</span>
                <svg 
                  className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          {isDropdownOpen && (
             <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-96 overflow-hidden">
              <div className="p-3 border-b border-gray-600">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {getFilteredFonts().map((font) => (
                  <button
                    key={font.value}
                    onClick={() => handleFontSelect(font)}
                    className={`w-full flex items-center justify-between p-3 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors ${
                      fontFamily === font.value ? 'bg-gray-700 border-l-4 border-blue-400' : ''
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                     <div className="flex items-center space-x-3">
                      <div className="text-left">
                        <div className="text-white font-medium">{font.name}</div>
                        <div className="text-gray-400 text-xs">{font.category}</div>
                      </div>
                    </div>
                    <div className="text-white text-sm">
                      <div className="font-semibold">ABC</div>
                      <div className="text-xs">abc</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Font Color */}
      <div>
        <ThemeColorPicker
          label="Font Color"
          currentColorValue={color}
          themeColors={themeColors}
          onColorChange={(_, value) => handleSettingChange('color', value)}
          fieldName="fontColor"
          className="mt-0"
        />
      </div>

      {/* Font Size */}
      <FontSliderControl
        label="Font Size"
        value={fontSize}
        min={8}
        max={72}
        step={1}
        onChange={(value) => handleSettingChange('fontSize', value)}
        unit="px"
      />
      
      {/* Font Weight */}
      <FontSliderControl
        label="Font Weight"
        value={fontWeight}
        min={100}
        max={900}
        step={100}
        onChange={(value) => handleSettingChange('fontWeight', value)}
      />

      {/* Line Height */}
      <FontSliderControl
        label="Line Height"
        value={lineHeight}
        min={0.8}
        max={3}
        step={0.1}
        onChange={(value) => handleSettingChange('lineHeight', value)}
      />
      
      {/* Letter Spacing */}
      <FontSliderControl
        label="Letter Spacing"
        value={letterSpacing}
        min={-2}
        max={10}
        step={0.1}
        onChange={(value) => handleSettingChange('letterSpacing', value)}
        unit="px"
      />

      {/* Text Align */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Text Align</label>
        <div className="grid grid-cols-4 gap-2">
          {['left', 'center', 'right', 'justify'].map((align) => (
            <button
              key={align}
              onClick={() => handleSettingChange('textAlign', align)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                textAlign === align
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Font Preview Section */}
      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-lg font-semibold text-gray-200 mb-2 text-center">Preview</h4>
        <div 
          className="p-4 bg-gray-900 rounded-md border border-gray-700"
          style={{ ...textSettings, fontFamily: currentFont.value }}
        >
          <p>The quick brown fox jumps over the lazy dog.</p>
        </div>
      </div>
    </div>
  );
};

PanelFontController.propTypes = {
  label: PropTypes.string,
  currentData: PropTypes.object,
  onControlsChange: PropTypes.func,
  fieldPrefix: PropTypes.string,
  themeColors: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default PanelFontController; 