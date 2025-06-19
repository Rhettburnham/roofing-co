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
const FontSliderControl = ({ label, value, min, max, step, onChange, unit = '' }) => {
  const progress = value !== undefined && min !== undefined && max !== undefined ? ((value - min) / (max - min)) * 100 : 0;
  const sliderStyle = {
    background: `linear-gradient(to right, #3b82f6 ${progress}%, #4b5563 ${progress}%)`,
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white ">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={sliderStyle}
        />
        <div className="flex items-center px-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || min)}
            className="w-20 bg-transparent text-white text-center focus:outline-none"
          />
          <span className="  text-gray-400 text-xs">{unit}</span>
        </div>
      </div>
    </div>
  );
};

const PanelFontController = ({
  label = "Font Settings",
  currentData,
  onControlsChange,
  fieldPrefix, // e.g., "desktop" or "mobile"
  themeColors = [],
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const dropdownRef = useRef(null);

  // The component now directly uses the data passed for the specific fieldPrefix.
  const textSettings = (currentData && currentData[fieldPrefix]) || {};
  
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
    <div className="bg-black text-white p-2 rounded-lg ">
      {/* Font Preview Section */}
      <div className="border-t border-gray-600 pt-4">
        <div 
          className="p-4 bg-gray-900 rounded-md border border-gray-700"
          style={{ ...textSettings, fontFamily: currentFont.value }}
        >
          <p>{label}</p>
        </div>
      </div>

      <div className="flex flex-row items-start mt-4">
        {/* Left Column */}
        <div className="w-[35%] pr-4 flex flex-col space-y-4">
          {/* Font Family Selection */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex flex-row items-center justify-center ">
              <div className="flex-0">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between rounded-md text-xl text-white animate-pulse"
                  style={{ fontFamily }}
                >
                  <span className="truncate">{currentFont.name}</span>
                  <svg 
                    className={`w-6 h-6 ml-2 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
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
              <div className="absolute z-50 mt-1  bg-gray-50  rounded-b-md  overflow-hidden">
                <div className=" ">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full  py-1 text-center font-bold bg-banner text-white text-sm "
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
                      className={`w-full flex items-center p-3 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors ${
                        fontFamily === font.value ? 'bg-gray-500 font-bold text-white border-l-4 border-blue-400' : ''
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <div className="flex w-full">
                        <div className="flex flex-row w-full justify-between items-center px-2">
                          <div className={`text-black font-semibold ${
                          fontFamily === font.value ? 'text-white' : ''
                      }`} >{font.name}</div>
                          <div className="text-gray-400 font-semibold">{font.category}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        
          {/* Font Color */}
          <ThemeColorPicker
            label="Font Color"
            currentColorValue={color}
            themeColors={themeColors}
            onColorChange={(_, value) => handleSettingChange('color', value)}
            fieldName="fontColor"
            className="mt-0"
            variant="text"
          />
          {/* Text Align */}
          <div>
            <label className="block text-lg font-medium text-white mb-1">Alignment</label>
            <div className="grid grid-cols-3 gap-1">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => handleSettingChange('textAlign', align)}
                  className={`px-3 py-2 rounded-md text-sm text-white font-medium transition-colors ${
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
        </div>

        {/* Right Column */}
        <div className="w-[65%] grid grid-cols-2 gap-x-4 gap-y-2">
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