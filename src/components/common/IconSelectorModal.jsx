// src/components/common/IconSelectorModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa'; // Example: For Font Awesome
// You can add more icon set imports here, e.g., import * as MdIcons from 'react-icons/md';

import { X } from 'lucide-react'; // Using Lucide for modal's own UI icons

console.log('[IconSelectorModal] Raw LucideIcons import:', LucideIcons);
const { createLucideIcon, ...FilteredLucideIcons } = LucideIcons;
console.log('[IconSelectorModal] FilteredLucideIcons object:', FilteredLucideIcons);
console.log('[IconSelectorModal] Keys in FilteredLucideIcons (first 10):', Object.keys(FilteredLucideIcons).slice(0, 10));
if (Object.keys(FilteredLucideIcons).length > 0) {
  const firstKey = Object.keys(FilteredLucideIcons)[0];
  console.log(`[IconSelectorModal] First key: ${firstKey}, typeof FilteredLucideIcons[firstKey]: ${typeof FilteredLucideIcons[firstKey]}`);
}

const iconPacks = {
  lucide: FilteredLucideIcons,
  fa: FaIcons,
  // md: MdIcons, // Example for Material Design
};

// Define categories and icon mappings
const lucideCategoryIcons = {
  'All': Object.keys(FilteredLucideIcons),
  'Arrows & Navigation': ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'Navigation', 'Locate', 'MousePointer', 'Move', 'Airplay', 'AppWindow', 'AtSign', 'Award'],
  'Common Actions': ['Edit', 'Plus', 'Minus', 'Trash2', 'Save', 'Copy', 'Clipboard', 'Check', 'X', 'RefreshCw', 'Search', 'Settings', 'Filter', 'LogIn', 'LogOut', 'Link', 'Share2'],
  'Objects & Symbols': ['File', 'Folder', 'Image', 'Home', 'User', 'Users', 'Info', 'HelpCircle', 'AlertTriangle', 'Calendar', 'Clock', 'Mail', 'Phone', 'Star', 'Heart', 'Sun', 'Moon', 'Briefcase', 'Gift', 'Archive', 'Book', 'Bookmark', 'Camera', 'CreditCard'],
  'Media & Layout': ['Play', 'Pause', 'StopCircle', 'Volume2', 'Mic', 'Maximize', 'Minimize', 'Menu', 'LayoutGrid', 'Sidebar', 'Monitor', 'Smartphone', 'Table', 'Tv', 'Video'],
};

const faCategoryIcons = {
  'All': Object.keys(FaIcons),
  'Brands': ['FaApple', 'FaGoogle', 'FaMicrosoft', 'FaFacebookF', 'FaTwitter', 'FaGithub', 'FaLinkedinIn', 'FaAmazon', 'FaBitcoin', 'FaWordpressSimple', 'FaAndroid', 'FaAppStoreIos', 'FaChrome', 'FaEdge', 'FaFirefoxBrowser'],
  'Web & Interface': ['FaBars', 'FaTimes', 'FaSearch', 'FaCog', 'FaHome', 'FaUser', 'FaEnvelope', 'FaPhone', 'FaInfoCircle', 'FaQuestionCircle', 'FaExclamationTriangle', 'FaCheckCircle', 'FaPlusSquare', 'FaMinusSquare', 'FaSpinner', 'FaDownload', 'FaUpload', 'FaPrint', 'FaEdit', 'FaShareAlt'],
  'Arrows & Chevrons': ['FaArrowDown', 'FaArrowLeft', 'FaArrowRight', 'FaArrowUp', 'FaChevronDown', 'FaChevronLeft', 'FaChevronRight', 'FaChevronUp', 'FaAngleDoubleLeft', 'FaAngleDoubleRight', 'FaLongArrowAltDown', 'FaLongArrowAltLeft', 'FaLongArrowAltRight', 'FaLongArrowAltUp', 'FaCaretSquareDown', 'FaCaretSquareLeft'],
  'Common Objects': ['FaFileAlt', 'FaFolderOpen', 'FaImage', 'FaCalendarAlt', 'FaClock', 'FaHeart', 'FaStar', 'FaRegComment', 'FaThumbsUp', 'FaShoppingCart', 'FaBook', 'FaBookmark', 'FaCamera', 'FaCreditCard', 'FaDatabase', 'FaDesktop', 'FaFileArchive', 'FaFileAudio', 'FaFileCode', 'FaFileExcel', 'FaFileImage', 'FaFilePdf', 'FaFilePowerpoint', 'FaFileVideo', 'FaFileWord', 'FaFlag', 'FaGamepad', 'FaGem', 'FaGift', 'FaGlobe', 'FaGraduationCap', 'FaHeadphones', 'FaKey', 'FaLaptop', 'FaLightbulb', 'FaLock', 'FaMapMarkerAlt', 'FaMicrophone', 'FaMobileAlt', 'FaMoneyBillWave', 'FaMusic', 'FaNewspaper', 'FaPaintBrush', 'FaPaperPlane', 'FaPaste', 'FaPauseCircle', 'FaPlayCircle', 'FaPlug', 'FaQuoteLeft', 'FaReceipt', 'FaRecycle', 'FaRedo', 'FaUndo', 'FaSave', 'FaSdCard', 'FaServer', 'FaShapes', 'FaShieldAlt', 'FaShoppingBag', 'FaSignal', 'FaSitemap', 'FaSlidersH', 'FaSmile', 'FaSort', 'FaStore', 'FaSync', 'FaTable', 'FaTabletAlt', 'FaTachometerAlt', 'FaTags', 'FaTasks', 'FaTerminal', 'FaThermometerHalf', 'FaTint', 'FaToggleOff', 'FaToggleOn', 'FaToolbox', 'FaTrashAlt', 'FaTree', 'FaTrophy', 'FaTruck', 'FaTv', 'FaUmbrella', 'FaUniversity', 'FaUnlock', 'FaUserCircle', 'FaUserFriends', 'FaUserPlus', 'FaUsers', 'FaUtensils', 'FaVideo', 'FaVolumeDown', 'FaVolumeMute', 'FaVolumeUp', 'FaWifi', 'FaWindowClose', 'FaWindowMaximize', 'FaWindowMinimize', 'FaWrench'],
};

const iconCategoryMappings = {
  lucide: lucideCategoryIcons,
  fa: faCategoryIcons,
};

const IconSelectorModal = ({ isOpen, onClose, onIconSelect, currentIconPack = 'lucide', currentIconName }) => {
  const [selectedPack, setSelectedPack] = useState(currentIconPack);

  useEffect(() => {
    // This initial log is fine.
    // console.log('[IconSelectorModal] FilteredLucideIcons keys count:', Object.keys(FilteredLucideIcons).length);
    // console.log('[IconSelectorModal] FaIcons keys count:', Object.keys(FaIcons).length);
  }, []);

  const activeIconSet = useMemo(() => {
    console.log('[IconSelectorModal] Determining activeIconSet for selectedPack:', selectedPack);
    const pack = iconPacks[selectedPack];
    if (!pack) {
      console.warn(`[IconSelectorModal] Icon pack "${selectedPack}" not found. Defaulting to Lucide.`);
      return FilteredLucideIcons; // Default to Lucide if pack is not found
    }
    return pack;
  }, [selectedPack]);

  const iconList = useMemo(() => {
    console.log(`[IconSelectorModal] Generating icon list for pack: ${selectedPack}`);
    if (!activeIconSet || typeof activeIconSet !== 'object') {
      console.error(`[IconSelectorModal] activeIconSet is invalid for pack ${selectedPack}:`, activeIconSet);
      return [];
    }
    const allIconNames = Object.keys(activeIconSet);
    console.log(`[IconSelectorModal] Total names in pack "${selectedPack}" (before filter):`, allIconNames.length, 'First 5:', allIconNames.slice(0,5));
    
    if (allIconNames.length > 0) {
      const firstIconName = allIconNames[0];
      console.log(`[IconSelectorModal] Checking first icon in activeIconSet for pack ${selectedPack}: Name="${firstIconName}", Component Exists: ${!!activeIconSet[firstIconName]}, Type: ${typeof activeIconSet[firstIconName]}`);
    }

    const filteredList = allIconNames
      .filter(name => {
        const isFunction = typeof activeIconSet[name] === 'function';
        if (!isFunction && allIconNames.includes(name)) { // Log if a key from the set isn't a function
            // console.warn(`[IconSelectorModal] Key "${name}" in pack "${selectedPack}" is not a function. Type: ${typeof activeIconSet[name]}`);
        }
        return isFunction;
      })
      .sort();
    
    console.log(`[IconSelectorModal] Final iconList length for pack ${selectedPack}:`, filteredList.length);
    if (filteredList.length === 0 && allIconNames.length > 0) {
        console.warn(`[IconSelectorModal] No renderable icons found for pack ${selectedPack} after filtering, though ${allIconNames.length} keys existed.`);
    }
    return filteredList;
  }, [activeIconSet, selectedPack]);

  useEffect(() => {
    setSelectedPack(currentIconPack);
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

        <div className="mb-4">
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
        
        <p className="text-sm text-gray-400 mb-2">Displaying all icons from: {selectedPack}</p>
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
            <p className="col-span-full text-center text-gray-400 py-4">No icons found for pack: {selectedPack}.</p>
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