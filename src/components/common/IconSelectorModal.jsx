// src/components/common/IconSelectorModal.jsx
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import iconData from '../../constants/icon-lists.json'; // Import the generated list
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import * as FaIcons from 'react-icons/fa';
import { X, HelpCircle } from 'lucide-react'; // Import specific icons for the modal UI

// Helper to convert PascalCase to kebab-case for lucide icon names
const toKebabCase = (str) => {
  if (!str) return '';
  return str
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^-/, ''); // remove leading dash
};

const iconPacks = {
  lucide: {
    names: iconData.lucide,
    loader: (name) => {
      const iconKey = toKebabCase(name);
      if (!dynamicIconImports[iconKey]) {
        console.warn(`Lucide icon "${name}" (-> "${iconKey}") not found.`);
        return <HelpCircle size={24} />;
      }
      const LucideIcon = lazy(dynamicIconImports[iconKey]);
      return <LucideIcon size={24} />;
    },
  },
  fa: {
    names: iconData.fa,
    loader: (name) => {
      const LazyIcon = lazy(() =>
        import('react-icons/fa').then(module => ({ default: module[name] || FaIcons.FaQuestionCircle }))
      );
      return <LazyIcon size={24} />;
    },
  },
};

const IconSelectorModal = ({ isOpen, onClose, onIconSelect, currentIconPack = 'lucide', currentIconName }) => {
  const [selectedPack, setSelectedPack] = useState(currentIconPack);
  const [searchTerm, setSearchTerm] = useState('');

  const iconList = useMemo(() => {
    const names = iconPacks[selectedPack]?.names || [];
    if (!searchTerm) {
      return names;
    }
    return names.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedPack, searchTerm]);

  useEffect(() => {
    setSelectedPack(currentIconPack);
    setSearchTerm(''); // Reset search on open or pack change
  }, [isOpen, currentIconPack]);

  if (!isOpen) {
    return null;
  }

  const handleIconClick = (iconName) => {
    onIconSelect(selectedPack, iconName);
    onClose();
  };
  
  const renderIconPreview = (pack, name) => {
     if (!pack || !name) return <HelpCircle />;
     const packLoader = iconPacks[pack]?.loader;
     if (!packLoader) return <HelpCircle />;

     return (
        <Suspense fallback={<div className="w-6 h-6 bg-gray-700 rounded animate-pulse" />}>
            {packLoader(name)}
        </Suspense>
     );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] p-4" onClick={onClose}>
      <div
        className="bg-gray-800 text-white rounded-lg shadow-2xl p-4 md:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">Select an Icon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-4 mb-4 flex-shrink-0">
          <div className="flex-1">
            <label htmlFor="icon-pack-selector" className="block text-sm font-medium text-gray-300 mb-1">Icon Pack:</label>
            <select
              id="icon-pack-selector"
              value={selectedPack}
              onChange={(e) => setSelectedPack(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {Object.keys(iconPacks).map(packName => (
                <option key={packName} value={packName}>
                  {packName.charAt(0).toUpperCase() + packName.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
             <label htmlFor="icon-search" className="block text-sm font-medium text-gray-300 mb-1">Search:</label>
             <input
                id="icon-search"
                type="text"
                placeholder={`Search ${iconPacks[selectedPack]?.names.length || 0} icons...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
             />
          </div>
        </div>
        
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {iconList.map((iconName) => {
            const isSelected = selectedPack === currentIconPack && iconName === currentIconName;
            return (
              <button
                key={`${selectedPack}-${iconName}`}
                title={iconName}
                onClick={() => handleIconClick(iconName)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-150 ease-in-out aspect-square
                            ${isSelected ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'}
                            focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {renderIconPreview(selectedPack, iconName)}
                <span className="mt-1.5 text-[10px] text-gray-300 truncate w-full text-center">{iconName}</span>
              </button>
            );
          })}
          {iconList.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-4">
              No icons found for &quot;{searchTerm}&quot; in {selectedPack}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

IconSelectorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onIconSelect: PropTypes.func.isRequired, // Should accept (pack, iconName)
  currentIconPack: PropTypes.string,      // e.g., 'lucide', 'fa'
  currentIconName: PropTypes.string,      // The name of the currently selected icon
};

export default IconSelectorModal;