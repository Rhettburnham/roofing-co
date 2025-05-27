import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ColorEditor = ({ initialColors, onColorChange }) => {
  const [colors, setColors] = useState(initialColors || {
    accent: '#1d5a88',
    banner: '#143e5f',
    'faint-color': '#2574b0',
    'second-accent': '#c8c0c7',
  });

  useEffect(() => {
    if (initialColors) {
      setColors(initialColors);
    }
  }, [initialColors]);

  const handleChange = (name, value) => {
    const newColors = { ...colors, [name]: value };
    setColors(newColors);
    if (onColorChange) {
      onColorChange(newColors);
    }
    // Also update CSS custom properties for live preview within OneForm
    document.documentElement.style.setProperty(`--color-${name.replace('-', '_')}`, value);
     // Special handling for faint-color and second-accent due to hyphen
    if (name === 'faint-color') {
        document.documentElement.style.setProperty('--color-faint-color', value);
    } else if (name === 'second-accent') {
        document.documentElement.style.setProperty('--color-second-accent', value);
    } else {
        document.documentElement.style.setProperty(`--color-${name}`, value);
    }
  };

  const colorFields = [
    { name: 'accent', label: 'Accent Color', description: 'Used for buttons, links, and primary interactive elements.' },
    { name: 'banner', label: 'Banner Color', description: 'Used for headers, navigation bars, and prominent UI elements.' },
    { name: 'faint-color', label: 'Faint Color', description: 'Used for backgrounds, subtle highlights, and secondary elements.' },
    { name: 'second-accent', label: 'Second Accent Color', description: 'Used for call-to-actions, highlights, and accent elements.' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 text-gray-800">
      <div className="mb-6 bg-gray-800 text-white p-4 rounded shadow-md">
        <h1 className="text-2xl font-bold">Theme Color Editor</h1>
        <p className="text-gray-300 mt-1">Adjust the website's primary theme colors. Changes will be reflected live in previews.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Input Fields */}
        <div className="space-y-5">
          {colorFields.map(field => (
            <div key={field.name} className="p-4 bg-white rounded-lg shadow">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id={field.name}
                  name={field.name}
                  value={colors[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="h-10 w-12 p-0.5 border border-gray-300 rounded-md cursor-pointer shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={colors[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="#RRGGBB"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">{field.description}</p>
            </div>
          ))}
        </div>

        {/* Live Preview Section */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Live Preview</h2>
          <div className="space-y-4">
            <div style={{ backgroundColor: colors.banner, color: '#FFF', padding: '1rem', borderRadius: '0.25rem' }}>
              <h3 className="text-xl font-bold">Banner Preview</h3>
              <p className="text-sm">This uses the "Banner" color.</p>
            </div>

            <div style={{ backgroundColor: colors['faint-color'], padding: '1rem', borderRadius: '0.25rem', border: `1px solid ${colors.accent}` }}>
              <p style={{ color: colors.accent }}>This text uses the "Accent" color on a "Faint Color" background.</p>
              <button
                style={{ backgroundColor: colors.accent, color: '#FFF', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', marginTop: '0.5rem' }}
              >
                Accent Button
              </button>
            </div>
            
            <div style={{ backgroundColor: colors['second-accent'], padding: '0.75rem', borderRadius: '0.25rem' }}>
              <p style={{ color: '#333' }}>This is the "Second Accent" color, often used for highlights.</p>
            </div>

            <div className="mt-4 p-3 border rounded-md" style={{borderColor: colors.accent}}>
                <h4 className="font-medium" style={{color: colors.accent}}>Sample Card Header (Accent)</h4>
                <p className="text-sm" style={{backgroundColor: colors['faint-color'], color: colors.banner || '#000000'}}>
                    This card has a faint background, banner-colored text, and an accent border.
                </p>
                <button className="mt-2 text-white px-3 py-1 rounded text-xs" style={{backgroundColor: colors['second-accent']}}>
                    CTA (Second Accent)
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ColorEditor.propTypes = {
  initialColors: PropTypes.shape({
    accent: PropTypes.string,
    banner: PropTypes.string,
    'faint-color': PropTypes.string,
    'second-accent': PropTypes.string,
  }),
  onColorChange: PropTypes.func.isRequired,
};

export default ColorEditor; 