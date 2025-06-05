import React from 'react';
import PropTypes from 'prop-types';

const BrightnessController = ({ 
  currentData, 
  onControlsChange, 
  fieldName = 'brightness',
  label = 'Screen Brightness',
  min = 0,
  max = 100,
  step = 5,
  className = ''
}) => {
  const brightness = currentData[fieldName] || 50; // Default to 50%

  const handleBrightnessChange = (e) => {
    const value = parseFloat(e.target.value);
    onControlsChange({
      ...currentData,
      [fieldName]: value
    });
  };

  // Get emoji based on brightness level
  const getBrightnessEmoji = (brightnessValue) => {
    if (brightnessValue <= 20) return '🌑'; // New moon (darkest)
    if (brightnessValue <= 40) return '🌘'; // Waning crescent
    if (brightnessValue <= 60) return '🌓'; // Half moon
    if (brightnessValue <= 80) return '🌖'; // Waxing gibbous
    return '☀️'; // Sun (brightest)
  };

  const currentEmoji = getBrightnessEmoji(brightness);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentEmoji}</span>
          <span className="text-sm font-semibold text-gray-600">
            {brightness}%
          </span>
        </div>
      </div>

      {/* Range Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={brightness}
          onChange={handleBrightnessChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer brightness-slider"
          style={{
            background: `linear-gradient(to right, #1f2937 0%, #374151 25%, #6b7280 50%, #d1d5db 75%, #fbbf24 100%)`
          }}
        />
        
        {/* Brightness level indicators */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>🌑</span>
          <span>🌘</span>
          <span>🌓</span>
          <span>🌖</span>
          <span>☀️</span>
        </div>
      </div>

      {/* Number Input */}
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={brightness}
          onChange={handleBrightnessChange}
          className="w-20 px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="text-sm text-gray-500">%</span>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-5 gap-1">
        {[
          { value: 10, label: 'Dark', emoji: '🌑' },
          { value: 30, label: 'Dim', emoji: '🌘' },
          { value: 50, label: 'Normal', emoji: '🌓' },
          { value: 70, label: 'Bright', emoji: '🌖' },
          { value: 90, label: 'Max', emoji: '☀️' }
        ].map(preset => (
          <button
            key={preset.value}
            onClick={() => onControlsChange({ ...currentData, [fieldName]: preset.value })}
            className={`px-2 py-1 text-xs rounded transition-all ${
              brightness === preset.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={`${preset.label} (${preset.value}%)`}
          >
            <div className="text-xs">{preset.emoji}</div>
            <div className="text-xs">{preset.value}%</div>
          </button>
        ))}
      </div>

      <style>
        {`
          .brightness-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: ${brightness <= 50 ? '#1f2937' : '#fbbf24'};
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background-color 0.2s ease;
          }

          .brightness-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: ${brightness <= 50 ? '#1f2937' : '#fbbf24'};
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background-color 0.2s ease;
          }

          .brightness-slider::-webkit-slider-track {
            background: linear-gradient(to right, #1f2937 0%, #374151 25%, #6b7280 50%, #d1d5db 75%, #fbbf24 100%);
            height: 8px;
            border-radius: 4px;
          }

          .brightness-slider::-moz-range-track {
            background: linear-gradient(to right, #1f2937 0%, #374151 25%, #6b7280 50%, #d1d5db 75%, #fbbf24 100%);
            height: 8px;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
};

BrightnessController.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  fieldName: PropTypes.string,
  label: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  className: PropTypes.string,
};

export default BrightnessController; 