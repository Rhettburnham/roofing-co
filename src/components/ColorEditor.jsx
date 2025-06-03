import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import PanelColorPicker from './common/PanelColorPicker';

// Define the original four default colors with their properties
export const defaultColorDefinitions = [
  { id: 'default-accent', name: 'accent', label: 'Accent Color', value: '#1d5a88', description: 'Used for buttons, links, and primary interactive elements.', isDefault: true, isRemovable: false },
  { id: 'default-banner', name: 'banner', label: 'Banner Color', value: '#143e5f', description: 'Used for headers, navigation bars, and prominent UI elements.', isDefault: true, isRemovable: false },
  { id: 'default-faint-color', name: 'faint-color', label: 'Faint Color', value: '#2574b0', description: 'Used for backgrounds, subtle highlights, and secondary elements.', isDefault: true, isRemovable: false },
  { id: 'default-second-accent', name: 'second-accent', label: 'Second Accent Color', value: '#c8c0c7', description: 'Used for call-to-actions, highlights, and accent elements.', isDefault: true, isRemovable: false },
];

const ColorEditor = ({ initialColors: initialColorsProp, onColorChange }) => {
  const [editableColors, setEditableColors] = useState([]);

  // Function to transform initialColorsProp (object) to editableColors (array)
  const transformInitialColors = useCallback((colorsProp) => {
    const transformed = [];
    const propColorNames = Object.keys(colorsProp || {});

    // Add default colors, using values from props if available
    defaultColorDefinitions.forEach(def => {
      transformed.push({
        ...def,
        value: colorsProp && colorsProp[def.name] !== undefined ? colorsProp[def.name] : def.value,
      });
    });

    // Add any other colors from props as custom, non-default colors
    propColorNames.forEach(name => {
      if (!defaultColorDefinitions.some(def => def.name === name)) {
        transformed.push({
          id: `custom-${name}-${Date.now()}`,
          name: name, 
          label: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
          value: colorsProp[name],
          description: 'User-defined custom color.',
          isDefault: false,
          isRemovable: true,
        });
      }
    });
    return transformed;
  }, []);

  useEffect(() => {
    const startingColorsObject = initialColorsProp || defaultColorDefinitions.reduce((obj, item) => {
        obj[item.name] = item.value;
        return obj;
    }, {});
    setEditableColors(transformInitialColors(startingColorsObject));
  }, [initialColorsProp, transformInitialColors]);

  const triggerColorChange = useCallback((updatedColorsArray) => {
    const colorsObjectForParent = updatedColorsArray.reduce((obj, color) => {
      obj[color.name] = color.value;
      return obj;
    }, {});
    
    updatedColorsArray.forEach(color => {
      if (color.name) {
          document.documentElement.style.setProperty(`--color-${color.name}`, color.value);
      }
    });

    if (onColorChange) {
      // Pass both the simple object AND the full array of editableColors
      onColorChange(colorsObjectForParent, updatedColorsArray);
    }
  }, [onColorChange]);

  const handleColorPropertyChange = (id, property, newValue) => {
    setEditableColors(prevColors => {
      const newColors = prevColors.map(color => {
        if (color.id === id) {
          let processedNewValue = newValue;
          if (property === 'name' && !color.isDefault) {
            processedNewValue = newValue.replace(/\s+/g, '-').toLowerCase();
            if (prevColors.some(c => c.id !== id && c.name === processedNewValue)) {
              alert(`Color name "${processedNewValue}" already exists. Please choose a unique name.`);
              return color; 
            }
          }
          return { ...color, [property]: processedNewValue };
        }
        return color;
      });
      triggerColorChange(newColors);
      return newColors;
    });
  };

  // Create a theme colors object from all current colors (for the dropdown in PanelColorPicker)
  const themeColorsForDropdown = editableColors.reduce((obj, color) => {
    obj[color.name] = color.value;
    return obj;
  }, {});

  const addNewColor = () => {
    setEditableColors(prevColors => {
      let newColorName = `custom-color-${prevColors.filter(c => !c.isDefault).length + 1}`;
      let counter = 1;
      while (prevColors.some(c => c.name === newColorName)) {
        newColorName = `custom-color-${prevColors.filter(c => !c.isDefault).length + 1 + counter}`;
        counter++;
      }

      const newColor = {
        id: `custom-${Date.now()}`,
        name: newColorName,
        label: 'New Custom Color',
        value: '#000000',
        description: 'A new user-defined color.',
        isDefault: false,
        isRemovable: true,
      };
      const updatedColors = [...prevColors, newColor];
      triggerColorChange(updatedColors);
      return updatedColors;
    });
  };

  const removeColor = (idToRemove) => {
    setEditableColors(prevColors => {
      const colorToRemove = prevColors.find(c => c.id === idToRemove);
      if (colorToRemove && colorToRemove.name) {
         document.documentElement.style.removeProperty(`--color-${colorToRemove.name}`);
      }
      const updatedColors = prevColors.filter(color => color.id !== idToRemove);
      triggerColorChange(updatedColors);
      return updatedColors;
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 text-gray-800">
      <div className="mb-6 bg-gray-800 text-white p-4 rounded shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Theme Color Editor</h1>
          <p className="text-gray-300 mt-1">Adjust the website's theme colors. Add or remove custom colors.</p>
        </div>
        <button
          onClick={addNewColor}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Add New Color
        </button>
      </div>

      {/* Compact Grid Layout - 4 colors per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {editableColors.map(color => (
          <div key={color.id} className="p-3 bg-white rounded-lg shadow relative border">
            {/* Remove button for custom colors */}
            {color.isRemovable && (
              <button
                onClick={() => removeColor(color.id)}
                className="absolute top-1 right-1 text-red-500 hover:text-red-700 p-1 bg-red-100 rounded-full"
                title="Remove Color"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            )}
            
            {/* Label input */}
            <div className="mb-2">
              <input
                type="text"
                value={color.label}
                onChange={(e) => handleColorPropertyChange(color.id, 'label', e.target.value)}
                className="w-full px-2 py-1 text-sm font-medium bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                placeholder="Color Label"
              />
            </div>

            {/* Color picker using PanelColorPicker component */}
            <PanelColorPicker
              currentColorValue={color.value}
              themeColors={themeColorsForDropdown}
              onColorChange={(fieldName, newValue) => handleColorPropertyChange(color.id, 'value', newValue)}
              fieldName={`color-${color.id}`}
              className="mb-2"
            />

            {/* CSS Variable name (read-only for defaults, editable for custom) */}
            <div className="text-xs text-gray-500 mb-1">
              CSS: --color-{color.name}
            </div>
            {!color.isDefault && (
              <input
                type="text"
                value={color.name}
                onChange={(e) => handleColorPropertyChange(color.id, 'name', e.target.value)}
                className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                placeholder="css-name"
              />
            )}
          </div>
        ))}
      </div>

      {/* Live Preview Section */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Live Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {editableColors.map(color => (
            <div key={`preview-${color.id}`} className="flex items-center p-2 bg-gray-50 rounded border">
              <div 
                className="w-6 h-6 rounded-full mr-3 border"
                style={{ backgroundColor: color.value }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: color.value }}>
                  {color.label}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {color.value} • --color-{color.name}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Sample Usage */}
        <div className="mt-6 p-3 border rounded-md" style={{borderColor: editableColors.find(c=>c.name==='accent')?.value || '#000000'}}>
          <h4 className="font-medium" style={{color: editableColors.find(c=>c.name==='accent')?.value || '#000000'}}>
            Sample Card Header (Accent)
          </h4>
          <p className="text-sm p-2 rounded mt-2" style={{
            backgroundColor: editableColors.find(c=>c.name==='faint-color')?.value || '#f0f0f0', 
            color: editableColors.find(c=>c.name==='banner')?.value || '#000000'
          }}>
            This card uses faint background, banner text, and an accent border.
          </p>
          <div className="flex gap-2 mt-3">
            <button 
              className="text-white px-3 py-1 rounded text-xs" 
              style={{backgroundColor: editableColors.find(c=>c.name==='second-accent')?.value || '#cccccc'}}
            >
              CTA (Second Accent)
            </button>
            {editableColors.find(c => c.name === 'custom-color-1') && (
              <button 
                className="text-white px-3 py-1 rounded text-xs" 
                style={{backgroundColor: editableColors.find(c=>c.name==='custom-color-1')?.value || '#000000'}}
              >
                CTA (Custom Color 1)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ColorEditor.propTypes = {
  initialColors: PropTypes.object, 
  onColorChange: PropTypes.func.isRequired,
};

export default ColorEditor; 