import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PanelStylingController = ({ currentData, onControlsChange, step = 0.5 }) => {
  const initialStyling = currentData.styling || { desktopHeightVH: 30, mobileHeightVW: 75 };
  const [activeMode, setActiveMode] = useState('laptop'); // 'laptop' or 'mobile'
  // Ensure initial values are numbers with proper ranges
  const [desktopHeight, setDesktopHeight] = useState(Math.max(20, Math.min(40, parseFloat(initialStyling.desktopHeightVH) || 30)));
  const [mobileHeight, setMobileHeight] = useState(Math.max(50, Math.min(100, parseFloat(initialStyling.mobileHeightVW) || 75)));

  useEffect(() => {
    const newStyling = currentData.styling || { desktopHeightVH: 30, mobileHeightVW: 75 };
    // Ensure values are within proper ranges
    setDesktopHeight(Math.max(20, Math.min(40, parseFloat(newStyling.desktopHeightVH) || 30)));
    setMobileHeight(Math.max(50, Math.min(100, parseFloat(newStyling.mobileHeightVW) || 75)));
  }, [currentData.styling]);

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    if (activeMode === 'laptop') {
      setDesktopHeight(value);
      onControlsChange({
        styling: {
          ...initialStyling,
          desktopHeightVH: value,
        }
      });
    } else {
      setMobileHeight(value);
      onControlsChange({
        styling: {
          ...initialStyling,
          mobileHeightVW: value,
        }
      });
    }
  };

  const handleNumberInputChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;

    if (activeMode === 'laptop') {
      const clampedValue = Math.max(20, Math.min(40, value));
      setDesktopHeight(clampedValue);
      onControlsChange({
        styling: {
          ...initialStyling,
          desktopHeightVH: clampedValue,
        }
      });
    } else {
      const clampedValue = Math.max(50, Math.min(100, value));
      setMobileHeight(clampedValue);
      onControlsChange({
        styling: {
          ...initialStyling,
          mobileHeightVW: clampedValue,
        }
      });
    }
  };

  const currentValue = activeMode === 'laptop' ? desktopHeight : mobileHeight;
  const currentUnit = activeMode === 'laptop' ? 'vh' : 'vw';
  const minValue = activeMode === 'laptop' ? 20 : 50;
  const maxValue = activeMode === 'laptop' ? 40 : 100;
  const stepValue = activeMode === 'laptop' ? 1 : 5;

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-center">Height Controls</h3>
        
        {/* Mode Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveMode('laptop')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeMode === 'laptop' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            💻 Desktop (md+)
          </button>
          <button
            onClick={() => setActiveMode('mobile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeMode === 'mobile' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📱 Mobile
          </button>
        </div>

        {/* Current Value Display */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-blue-400">
            {currentValue}{currentUnit}
          </div>
          <div className="text-sm text-gray-400">
            {activeMode === 'laptop' ? 'Desktop Height' : 'Mobile Height'}
          </div>
        </div>

        {/* Range Slider - Similar to VideoCTA.jsx */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {activeMode === 'laptop' ? `Desktop Height (${minValue}-${maxValue}vh)` : `Mobile Height (${minValue}-${maxValue}vw)`}
          </label>
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={stepValue}
            value={currentValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{minValue}{currentUnit}</span>
            <span>{maxValue}{currentUnit}</span>
          </div>
        </div>

        {/* Number Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Precise Value:
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min={minValue}
              max={maxValue}
              step={stepValue}
              value={currentValue}
              onChange={handleNumberInputChange}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="ml-2 text-gray-400 font-medium">{currentUnit}</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-3 gap-2">
          {activeMode === 'laptop' ? (
            <>
              <button
                onClick={() => handleSliderChange({ target: { value: 25 } })}
                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Compact (25vh)
              </button>
              <button
                onClick={() => handleSliderChange({ target: { value: 30 } })}
                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Default (30vh)
              </button>
              <button
                onClick={() => handleSliderChange({ target: { value: 35 } })}
                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Tall (35vh)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleSliderChange({ target: { value: 60 } })}
                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Compact (60vw)
              </button>
              <button
                onClick={() => handleSliderChange({ target: { value: 75 } })}
                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Default (75vw)
              </button>
              <button
                onClick={() => handleSliderChange({ target: { value: 90 } })}
                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Tall (90vw)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Custom Styles for Slider - Same as VideoCTA.jsx */}
      <style>
        {`
          .slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .slider-thumb::-webkit-slider-track {
            background: #4b5563;
            height: 8px;
            border-radius: 4px;
          }

          .slider-thumb::-moz-range-track {
            background: #4b5563;
            height: 8px;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
};

PanelStylingController.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  step: PropTypes.number,
};

export default PanelStylingController; 