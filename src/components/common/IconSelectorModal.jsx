// src/components/common/IconSelectorModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa'; // Example: For Font Awesome
// You can add more icon set imports here, e.g., import * as MdIcons from 'react-icons/md';

import { Search, X } from 'lucide-react'; // Using Lucide for modal's own UI icons

// Remove non-icon exports from Lucide (like createLucideIcon)
const { createLucideIcon, ...FilteredLucideIcons } = LucideIcons;

const iconPacks = {
  lucide: FilteredLucideIcons,
  fa: FaIcons,
  // md: MdIcons, // Example for Material Design
};

const IconSelectorModal = ({ isOpen, onClose, onIconSelect, currentIconPack = 'lucide', currentIconName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPack, setSelectedPack] = useState(currentIconPack);

  const activeIconSet = useMemo(() => {
    return iconPacks[selectedPack] || FilteredLucideIcons;
  }, [selectedPack]);

  const iconList = useMemo(() => {
    return Object.keys(activeIconSet)
      .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()) && typeof activeIconSet[name] === 'function') // Ensure it's a component
      .sort();
  }, [searchTerm, activeIconSet]);

  useEffect(() => {
    setSelectedPack(currentIconPack); // Sync with prop
    setSearchTerm(''); // Reset search on open or pack change
  }, [isOpen, currentIconPack]);

  if (!isOpen) {
    return null;
  }

  const handleIconClick = (iconName) => {
    onIconSelect(selectedPack, iconName);
    onClose();
  };

  const renderIconPreview = (IconComponent, name, pack) => {
    if (!IconComponent || typeof IconComponent !== 'function') {
      return <LucideIcons.HelpCircle title={`Invalid icon: ${name} from ${pack}`} />;
    }
    try {
      return <IconComponent size={24} />;
    } catch (e) {
      console.error(`Error rendering icon ${name} from ${pack}:`, e);
      return <LucideIcons.AlertTriangle title={`Error rendering ${name}`} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div
        className="bg-gray-800 text-white rounded-lg shadow-2xl p-4 md:p-6 w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Select an Icon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Icon Pack Selector (Optional - can be expanded) */}
        {/* For now, we assume the pack is passed correctly for the specific use case */}
        {/*
        <div className="mb-4">
          <select
            value={selectedPack}
            onChange={(e) => setSelectedPack(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
          >
            <option value="lucide">Lucide Icons</option>
            <option value="fa">Font Awesome</option>
            {/* <option value="md">Material Design</option> *}
          </select>
        </div>
        */}

        <div className="relative mb-4">
          <input
            type="text"
            placeholder={`Search in ${selectedPack} icons...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        
        <p className="text-sm text-gray-400 mb-2">Displaying icons from: {selectedPack}</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {iconList.map((iconName) => {
            const IconComponent = activeIconSet[iconName];
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
                {renderIconPreview(IconComponent, iconName, selectedPack)}
                <span className="mt-1.5 text-[10px] text-gray-300 truncate w-full text-center">{iconName}</span>
              </button>
            );
          })}
          {iconList.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-4">No icons found matching your search.</p>
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