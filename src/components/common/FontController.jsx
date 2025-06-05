import React from 'react';
import PropTypes from 'prop-types';

const FontController = ({ 
  currentData, 
  onControlsChange, 
  fieldPrefix = 'text',
  label = 'Text Settings',
  className = ''
}) => {
  const textSettings = currentData[fieldPrefix] || {};
  const {
    fontFamily = 'Inter',
    fontSize = 16,
    fontWeight = 400,
    lineHeight = 1.5,
    letterSpacing = 0,
    textAlign = 'left',
    color = '#000000'
  } = textSettings;

  const handleTextSettingChange = (property, value) => {
    const updatedSettings = {
      ...textSettings,
      [property]: value
    };
    onControlsChange({
      ...currentData,
      [fieldPrefix]: updatedSettings
    });
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Modern)', preview: 'Aa' },
    { value: 'Georgia', label: 'Georgia (Serif)', preview: 'Aa' },
    { value: 'Helvetica', label: 'Helvetica (Clean)', preview: 'Aa' },
    { value: 'Times New Roman', label: 'Times (Classic)', preview: 'Aa' },
    { value: 'Arial', label: 'Arial (Standard)', preview: 'Aa' },
    { value: 'Roboto', label: 'Roboto (Google)', preview: 'Aa' },
    { value: 'Poppins', label: 'Poppins (Rounded)', preview: 'Aa' },
    { value: 'Montserrat', label: 'Montserrat (Bold)', preview: 'Aa' },
    { value: 'Open Sans', label: 'Open Sans (Clean)', preview: 'Aa' }
  ];

  const weightOptions = [
    { value: 100, label: 'Thin' },
    { value: 200, label: 'Light' },
    { value: 300, label: 'Light' },
    { value: 400, label: 'Normal' },
    { value: 500, label: 'Medium' },
    { value: 600, label: 'Semibold' },
    { value: 700, label: 'Bold' },
    { value: 800, label: 'Extrabold' },
    { value: 900, label: 'Black' }
  ];

  const alignmentOptions = [
    { value: 'left', label: 'Left', icon: '⬅️' },
    { value: 'center', label: 'Center', icon: '⬆️' },
    { value: 'right', label: 'Right', icon: '➡️' },
    { value: 'justify', label: 'Justify', icon: '↔️' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{label}</h3>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Family
        </label>
        <select
          value={fontFamily}
          onChange={(e) => handleTextSettingChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {fontOptions.map(font => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>
        <div className="mt-2 p-3 bg-gray-50 rounded border text-center" style={{ fontFamily: fontFamily }}>
          <span className="text-lg">Preview Text - {fontFamily}</span>
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="10"
          max="48"
          step="1"
          value={fontSize}
          onChange={(e) => handleTextSettingChange('fontSize', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer font-slider"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10px</span>
          <span>48px</span>
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Weight
        </label>
        <select
          value={fontWeight}
          onChange={(e) => handleTextSettingChange('fontWeight', parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {weightOptions.map(weight => (
            <option key={weight.value} value={weight.value} style={{ fontWeight: weight.value }}>
              {weight.label} ({weight.value})
            </option>
          ))}
        </select>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Alignment
        </label>
        <div className="grid grid-cols-4 gap-2">
          {alignmentOptions.map(align => (
            <button
              key={align.value}
              onClick={() => handleTextSettingChange('textAlign', align.value)}
              className={`px-3 py-2 text-sm rounded transition-all ${
                textAlign === align.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={align.label}
            >
              <div className="text-lg mb-1">{align.icon}</div>
              <div className="text-xs">{align.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line Height: {lineHeight}
        </label>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={lineHeight}
          onChange={(e) => handleTextSettingChange('lineHeight', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer font-slider"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1.0</span>
          <span>3.0</span>
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Letter Spacing: {letterSpacing}px
        </label>
        <input
          type="range"
          min="-2"
          max="5"
          step="0.1"
          value={letterSpacing}
          onChange={(e) => handleTextSettingChange('letterSpacing', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer font-slider"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>-2px</span>
          <span>5px</span>
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Color
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={color}
            onChange={(e) => handleTextSettingChange('color', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleTextSettingChange('color', e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-gray-50 rounded border">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div 
          style={{
            fontFamily: fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
            lineHeight: lineHeight,
            letterSpacing: `${letterSpacing}px`,
            textAlign: textAlign,
            color: color
          }}
        >
          The quick brown fox jumps over the lazy dog. This is a preview of your text settings.
        </div>
      </div>

      <style>
        {`
          .font-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .font-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .font-slider::-webkit-slider-track {
            background: #e5e7eb;
            height: 6px;
            border-radius: 3px;
          }

          .font-slider::-moz-range-track {
            background: #e5e7eb;
            height: 6px;
            border-radius: 3px;
          }
        `}
      </style>
    </div>
  );
};

FontController.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  fieldPrefix: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default FontController; 