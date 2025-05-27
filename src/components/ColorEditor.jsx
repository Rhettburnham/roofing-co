import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline'; // Example icons

// Define the original four default colors with their properties
const defaultColorDefinitions = [
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
          id: `custom-${name}-${Date.now()}`, // Ensure unique ID
          name: name, // Retain original name
          label: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), // Generate label
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
    // Initialize editableColors based on initialColorsProp
    // If initialColorsProp is null/undefined, start with defaults
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
    
    // Update CSS variables
    updatedColorsArray.forEach(color => {
      if (color.name) { // Ensure name is not empty
          document.documentElement.style.setProperty(`--color-${color.name}`, color.value);
      }
    });
    // If a color was removed, its CSS variable might need explicit removal (though overwriting is usually fine)

    if (onColorChange) {
      onColorChange(colorsObjectForParent);
    }
  }, [onColorChange]);

  const handleColorPropertyChange = (id, property, newValue) => {
    setEditableColors(prevColors => {
      const newColors = prevColors.map(color => {
        if (color.id === id) {
          // Basic name validation: replace spaces with hyphens, convert to lowercase
          // More robust validation might be needed (e.g., ensure it's a valid CSS custom property name part)
          let processedNewValue = newValue;
          if (property === 'name' && !color.isDefault) {
            processedNewValue = newValue.replace(/\s+/g, '-').toLowerCase();
            // Check for uniqueness if it's a name change
            if (prevColors.some(c => c.id !== id && c.name === processedNewValue)) {
              alert(`Color name "${processedNewValue}" already exists. Please choose a unique name.`);
              return color; // Return original color if name is not unique
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

  const addNewColor = () => {
    setEditableColors(prevColors => {
      let newColorName = `custom-color-${prevColors.filter(c => !c.isDefault).length + 1}`;
      let counter = 1;
      // Ensure newColorName is unique
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
         // Remove the CSS custom property
         document.documentElement.style.removeProperty(`--color-${colorToRemove.name}`);
      }
      const updatedColors = prevColors.filter(color => color.id !== idToRemove);
      triggerColorChange(updatedColors);
      return updatedColors;
    });
  };
  
  // The old colorFields array is no longer needed as we iterate over editableColors

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Input Fields Section */}
        <div className="space-y-5">
          {editableColors.map(color => (
            <div key={color.id} className="p-4 bg-white rounded-lg shadow relative">
              {color.isRemovable && (
                <button
                  onClick={() => removeColor(color.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-red-100 rounded-full"
                  title="Remove Color"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
              <div className="mb-2">
                <label htmlFor={`${color.id}-label`} className="block text-sm font-medium text-gray-700">Label</label>
                <input
                  type="text"
                  id={`${color.id}-label`}
                  value={color.label}
                  onChange={(e) => handleColorPropertyChange(color.id, 'label', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-2">
                <label htmlFor={`${color.id}-name`} className="block text-sm font-medium text-gray-700">
                  Name (for CSS: --color-{color.name || '...'})
                </label>
                <input
                  type="text"
                  id={`${color.id}-name`}
                  value={color.name}
                  onChange={(e) => handleColorPropertyChange(color.id, 'name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={color.isDefault}
                  readOnly={color.isDefault}
                />
                 {color.isDefault && <p className="text-xs text-gray-500 mt-1">Default color names cannot be changed.</p>}
              </div>
              <div className="mb-2">
                <label htmlFor={`${color.id}-value`} className="block text-sm font-medium text-gray-700">Value</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    id={`${color.id}-value-picker`}
                    value={color.value}
                    onChange={(e) => handleColorPropertyChange(color.id, 'value', e.target.value)}
                    className="h-10 w-12 p-0.5 border border-gray-300 rounded-md cursor-pointer shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    id={`${color.id}-value-text`}
                    value={color.value}
                    onChange={(e) => handleColorPropertyChange(color.id, 'value', e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${color.id}-description`} className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  id={`${color.id}-description`}
                  value={color.description}
                  onChange={(e) => handleColorPropertyChange(color.id, 'description', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live Preview Section - Update to use dynamic colors */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Live Preview</h2>
          <div className="space-y-4">
            {editableColors.map(color => (
              <div key={`preview-${color.id}`} style={{ padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #eee' }}>
                <div className="flex items-center">
                    <div style={{ width: '24px', height: '24px', backgroundColor: color.value, marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}></div>
                    <div>
                        <p className="font-medium" style={{ color: color.value }}>{color.label} (--color-{color.name})</p>
                        <p className="text-xs text-gray-600">{color.value} - {color.description}</p>
                    </div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-3 border rounded-md" style={{borderColor: editableColors.find(c=>c.name==='accent')?.value || '#000000'}}>
                <h4 className="font-medium" style={{color: editableColors.find(c=>c.name==='accent')?.value || '#000000'}}>Sample Card Header (Accent)</h4>
                <p className="text-sm" style={{backgroundColor: editableColors.find(c=>c.name==='faint-color')?.value || '#f0f0f0', color: editableColors.find(c=>c.name==='banner')?.value || '#000000'}}>
                    This card uses faint background, banner text, and an accent border.
                </p>
                <button className="mt-2 text-white px-3 py-1 rounded text-xs" style={{backgroundColor: editableColors.find(c=>c.name==='second-accent')?.value || '#cccccc'}}>
                    CTA (Second Accent)
                </button>
                 {editableColors.find(c => c.name === 'custom-color-1') && (
                     <button className="mt-2 ml-2 text-white px-3 py-1 rounded text-xs" style={{backgroundColor: editableColors.find(c=>c.name==='custom-color-1')?.value || '#000000'}}>
                        CTA (Custom Color 1)
                    </button>
                 )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ColorEditor.propTypes = {
  initialColors: PropTypes.object, // Remains an object { name: value }
  onColorChange: PropTypes.func.isRequired,
};

export default ColorEditor; 