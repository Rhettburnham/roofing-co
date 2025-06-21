import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Warehouse, ChevronDown, MinusCircle } from 'lucide-react';

// Common Imports (assuming these are available in your project)
import { getDisplayPath } from "../../utils/imageUtils";
import { slugify } from "../../utils/slugify";
import DynamicIconRenderer from '../common/DynamicIconRenderer';
import IconSelectorModal from '../common/IconSelectorModal';
import ThemeColorPicker from "../common/ThemeColorPicker";
import BrightnessController from '../common/BrightnessController';
import PanelStylingController from '../common/PanelStylingController';
import PanelFontController from '../common/PanelFontController';
import PanelImagesController from '../common/PanelImagesController';

// Default Icons - can be overridden by config
const DefaultHomeIcon = () => <Home className="w-full h-full" />;
const DefaultWarehouseIcon = () => <Warehouse className="w-full h-full" />;

/* 
====================================================
 1) HERO PREVIEW
----------------------------------------------------
 - Renders the visual hero component based on provided config.
 - No internal state management.
 - All interactive elements (service selection, etc.) are handled via props.
====================================================
*/
function HeroPreview({ heroconfig = {}, onHeightChange, isPreviewReadOnly = true }) {
  const {
    residential = { subServices: [], icon: 'Home', iconPack: 'lucide' },
    commercial = { subServices: [], icon: 'Building2', iconPack: 'lucide' },
    images = [],
    bannerColor,
    topBannerColor,
    mainTitleTextSettings,
    subTitleTextSettings,
    brightness,
    styling = {},
    // Callbacks for non-readOnly mode
    onServiceNameChange,
    onAddService,
    onRemoveService,
    onEditServiceIcon,
  } = heroconfig;

  const [activeSection, setActiveSection] = useState("neutral");
  
  const { desktopHeightVH = 30, mobileHeightVW = 75 } = styling;

  const heroImageToDisplay = (images && images.length > 0) 
  ? getDisplayPath(images[0])
  : getDisplayPath(heroconfig.heroImage) || "/assets/images/hero/hero_split_background.jpg";

  const getBrightnessFilter = (brightnessValue) => {
    const value = brightnessValue ?? 75; // Default to 75 if undefined
    return `brightness(${value}%)`;
  };

  const bannerStyles = {
    // any additional styles for the main section can go here
  };
  
  const residentialServices = (residential?.subServices || []).map(s => ({...s, id: s.id || slugify(s.originalTitle || s.title), route: `/service/${s.slug || s.id}`}));
  const commercialServices = (commercial?.subServices || []).map(s => ({...s, id: s.id || slugify(s.originalTitle || s.title), route: `/service/${s.slug || s.id}`}));

  const textLabelAnimationVariants = {
    enter: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const subServiceContainerVariants = {
    hidden: { opacity: 0, y: -10, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  
  const subServiceItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const renderServiceSection = (type, services, sectionConfig) => {
    const isActive = activeSection === type;
    const isNeutral = activeSection === 'neutral';
    const otherType = type === 'residential' ? 'commercial' : 'residential';
    const isOtherActive = activeSection === otherType;

    const {
      icon: iconName = (type === 'residential' ? 'Home' : 'Building2'),
      iconPack = 'lucide',
      label: sectionLabel = type.charAt(0).toUpperCase() + type.slice(1)
    } = sectionConfig || {};

    const iconDetails = { icon: iconName, iconPack };
    
    // Default Font settings in case they are not in config
    const defaultMainTitleSettings = {
      desktop: { fontFamily: 'Inter', fontSize: 20, fontWeight: 600, color: '#FFFFFF' },
      mobile: { fontFamily: 'Inter', fontSize: 18, fontWeight: 600, color: '#FFFFFF' },
    };
    const defaultSubTitleSettings = {
      desktop: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, color: '#FFFFFF' },
      mobile: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, color: '#FFFFFF' },
    };
    
    const {
      desktop: mainTitleDesktop = defaultMainTitleSettings.desktop,
      mobile: mainTitleMobile = defaultMainTitleSettings.mobile,
    } = mainTitleTextSettings || defaultMainTitleSettings;

    const {
      desktop: subTitleDesktop = defaultSubTitleSettings.desktop,
      mobile: subTitleMobile = defaultSubTitleSettings.mobile,
    } = subTitleTextSettings || defaultSubTitleSettings;
    
    const serviceSectionTextBaseClass = 'font-bold tracking-wider uppercase transition-all duration-300';
    const serviceSectionIconBaseClass = 'cursor-pointer transition-all duration-300 ease-in-out';
    const subServiceTextBaseClass = 'font-semibold transition-colors duration-200';

    const getDynamicTextStyles = (textSettings) => ({
      fontFamily: textSettings.fontFamily || 'Inter',
      fontSize: `${textSettings.fontSize || 16}px`,
      fontWeight: textSettings.fontWeight || 400,
      letterSpacing: `${textSettings.letterSpacing || 0.5}px`,
      lineHeight: textSettings.lineHeight || 1.4,
      color: textSettings.color || '#FFFFFF',
    });
    
    // Add CSS variables for responsive font styles
    const mainTitleStyleVars = {
      '--main-title-font-family': mainTitleDesktop.fontFamily,
      '--main-title-font-size-desktop': `${mainTitleDesktop.fontSize}px`,
      '--main-title-font-weight-desktop': mainTitleDesktop.fontWeight,
      '--main-title-color-desktop': mainTitleDesktop.color,
      '--main-title-font-size-mobile': `${mainTitleMobile.fontSize}px`,
      '--main-title-font-weight-mobile': mainTitleMobile.fontWeight,
      '--main-title-color-mobile': mainTitleMobile.color,
    };
    const subTitleStyleVars = {
      '--sub-title-font-family': subTitleDesktop.fontFamily,
      '--sub-title-font-size-desktop': `${subTitleDesktop.fontSize}px`,
      '--sub-title-font-weight-desktop': subTitleDesktop.fontWeight,
      '--sub-title-color-desktop': subTitleDesktop.color,
      '--sub-title-font-size-mobile': `${subTitleMobile.fontSize}px`,
      '--sub-title-font-weight-mobile': subTitleMobile.fontWeight,
      '--sub-title-color-mobile': subTitleMobile.color,
    };
    
    const handleIconClick = () => {
      // Prevent interactions in readOnly mode
      if (isPreviewReadOnly) return;
      
      const newActiveSection = isActive ? 'neutral' : type;
      setActiveSection(newActiveSection);
    
      if(onHeightChange) {
        onHeightChange(newActiveSection !== 'neutral' ? 50 : 30);
      }
    };

    return (
      <div
        className={`flex-1 flex items-center transition-all duration-500 ease-in-out ${
          isActive ? 'justify-start pl-[5%]' : 'justify-center'
        } ${isOtherActive ? 'opacity-0' : 'opacity-100'}`}
        style={{
          flexBasis: isActive ? '70%' : (isNeutral ? '50%' : '30%'),
        }}
      >
        <div className="relative flex items-center">
          <motion.div
            className={`${serviceSectionIconBaseClass}`}
            style={{
              ...mainTitleStyleVars,
              ...subTitleStyleVars,
              width: isActive ? (window.innerWidth < 768 ? '10vw' : '4vw') : (window.innerWidth < 768 ? '25vw' : '10vw'),
              height: isActive ? (window.innerWidth < 768 ? '10vw' : '4vw') : (window.innerWidth < 768 ? '25vw' : '10vw'),
              color: mainTitleDesktop.color,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleIconClick();
            }}
          >
            <DynamicIconRenderer 
              pack={iconDetails.iconPack} 
              name={iconDetails.icon} 
              fallback={type === 'residential' ? DefaultHomeIcon : DefaultWarehouseIcon}
            />
          </motion.div>
          
          {/* Main Label - only shown when its section is NOT active OR if neutral */}
          <AnimatePresence mode="wait">
            {(isNeutral || !isActive) && (
              <motion.div
                className={`${serviceSectionTextBaseClass} hero-main-title`}
                variants={textLabelAnimationVariants}
                initial="exit"
                animate="enter"
                exit="exit"
              >
                {sectionLabel}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sub-services List (Horizontal) */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                className="absolute left-full ml-4 flex items-center space-x-4" // Positioned to the right of the icon
                variants={subServiceContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {services.map((service) => (
                  <motion.div key={service.id} variants={subServiceItemVariants} className="relative group">
                    <Link
                      to={service.route}
                      className={`${subServiceTextBaseClass} hero-sub-title px-3 py-1.5 rounded-md transition-colors duration-200 hover:bg-black/20`}
                      onClick={(e) => {
                        // If in edit mode, stop propagation to prevent navigation
                        if (!isPreviewReadOnly) e.preventDefault();
                      }}
                    >
                      {service.label}
                    </Link>
                    {!isPreviewReadOnly && (
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveService(type, service.id); }}
                          className="text-red-400 hover:text-red-300"
                          title="Remove Service"
                        >
                          <MinusCircle size={12} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
                {!isPreviewReadOnly && (
                  <motion.button
                    variants={subServiceItemVariants}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddService) onAddService(type);
                    }}
                    className="ml-2 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md"
                  >
                    + Add
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <section className="relative overflow-y-hidden" style={bannerStyles}>
      <div 
        className={`absolute top-[0vh] left-0 right-0 from-0% to-transparent z-60 pointer-events-none ${activeSection === "neutral" ? "h-[18vh] md:h-[13.5vh]" : "h-[10vh] md:h-[10vh]"}`}
        style={{ 
          backgroundImage: `linear-gradient(to bottom, ${topBannerColor || '#FFFFFF'} 20%, rgba(255, 255, 255, 0) 100%)`,
          transition: "height 0.3s ease-out 0.4s", 
          zIndex: 1 
        }}
      />
      <div 
        className="relative w-full overflow-hidden" 
        style={{ 
          height: window.innerWidth < 768 ? `${mobileHeightVW}vw` : `${desktopHeightVH}vh`
        }}
      >
        {heroImageToDisplay && (
          <motion.div
            className="absolute inset-0 h-full"
            style={{
              width: "130vw",
              left: "-15vw",
              backgroundImage: `url('${heroImageToDisplay}')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              filter: getBrightnessFilter(brightness),
            }}
            initial={{ x: "0%", scale: 1, transformOrigin: "center center" }}
            animate={{
              x: activeSection === "residential" ? "7.5%" : activeSection === "commercial" ? "-7.5%" : "0%",
              scale: activeSection !== "neutral" ? 1.15 : 1,
              transformOrigin: activeSection === "residential" ? "25% center" : activeSection === "commercial" ? "75% center" : "center center"
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        )}
        {/* Add overlay for better text readability */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-20"
          style={{ zIndex: 2 }}
        />
        <div className="relative w-full h-full flex z-10"> {/* Removed fixed padding, now using justify-center in service sections */}
          {/* Residential Section */}
          {renderServiceSection('residential', residentialServices, residential)}
          {/* Commercial Section */}
          {renderServiceSection('commercial', commercialServices, commercial)}
        </div>
        <div 
          className={`absolute bottom-0 left-0 right-0 pointer-events-none to-transparent ${activeSection === "neutral" ? "h-[15vh] md:h-[18vh]" : "h-[9vh] md:h-[10vh]"}`}
          style={{ 
            backgroundImage: `linear-gradient(to top, ${bannerColor || '#1e293b'} 10%, rgba(0,0,0,0) 100%)`,
            transition: "height 0.3s ease-out 0.4s", 
            zIndex: 1 
          }}
        />
      </div>
    </section>
  );
}

HeroPreview.propTypes = {
  heroconfig: PropTypes.object.isRequired,
  onHeightChange: PropTypes.func,
};

const HeroColorControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleBannerColorChange = (color) => {
    onControlsChange({ bannerColor: color });
  };
  const handleTopBannerColorChange = (color) => {
    onControlsChange({ topBannerColor: color });
  };

  const handleCustomColorChange = (colorId, property, value) => {
    const colors = currentData.colors || [];
    const updatedColors = colors.map(color => 
      color.id === colorId ? { ...color, [property]: value } : color
    );
    onControlsChange({ colors: updatedColors });
  };

  const handleAddCustomColor = () => {
    const colors = currentData.colors || [];
    const newColor = {
      id: `hero-custom-${Date.now()}`,
      name: `custom-${colors.length + 1}`,
      label: `Custom Color ${colors.length + 1}`,
      value: "#3b82f6",
      description: "Custom hero color"
    };
    onControlsChange({ colors: [...colors, newColor] });
  };

  const handleRemoveCustomColor = (colorId) => {
    const colors = currentData.colors || [];
    const updatedColors = colors.filter(color => color.id !== colorId);
    onControlsChange({ colors: updatedColors });
  };

  return (
    <div className="p-3 space-y-6 bg-gray-800 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-center border-b border-gray-600 pb-2 text-gray-100">Hero Colors</h3>
      
      {/* Gradient Colors */}
      <div className="space-y-4">
        <ThemeColorPicker
          label="Top Banner Gradient:"
          currentColorValue={currentData.topBannerColor || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleTopBannerColorChange(value)}
          fieldName="topBannerColor" 
          className="mt-0" 
        />
        <ThemeColorPicker
          label="Bottom Banner Gradient:"
          currentColorValue={currentData.bannerColor || "#1e293b"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleBannerColorChange(value)}
          fieldName="bannerColor" 
          className="mt-0" 
        />
      </div>

      {/* Custom Hero Colors */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-200">Custom Hero Colors</h4>
          <button
            onClick={handleAddCustomColor}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          >
            + Add Color
          </button>
        </div>
        
        {(currentData.colors || []).map((color, index) => (
          <div key={color.id} className="bg-gray-700 p-3 rounded-lg mb-3">
            <div className="flex items-center justify-between mb-2 gap-2">
              <input
                type="text"
                value={color.label}
                onChange={(e) => handleCustomColorChange(color.id, 'label', e.target.value)}
                className="bg-gray-600 text-white px-2 py-1 rounded text-sm flex-1"
                placeholder="Color Name"
              />
              <button
                onClick={() => handleRemoveCustomColor(color.id)}
                className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-900"
              >
                Remove
              </button>
            </div>
            <ThemeColorPicker
              label=""
              currentColorValue={color.value}
              themeColors={themeColors}
              onColorChange={(_, value) => handleCustomColorChange(color.id, 'value', value)}
              fieldName={`customColor-${color.id}`}
            />
          </div>
        ))}
        
        {(!currentData.colors || currentData.colors.length === 0) && (
          <p className="text-gray-400 text-sm italic">No custom colors defined. Click "Add Color" to create one.</p>
        )}
      </div>
    </div>
  );
};

HeroColorControls.propTypes = {
    currentData: PropTypes.object.isRequired,
    onControlsChange: PropTypes.func.isRequired,
    themeColors: PropTypes.array.isRequired,
};

/* ==============================================
   HERO FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for Hero text
=============================================== */
const HeroFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' or 'mobile'

  const handleSettingsChange = (settingsType, newSettings) => {
    // settingsType is 'mainTitleTextSettings' or 'subTitleTextSettings'
    // newSettings is the object from PanelFontController, e.g., { desktop: { ... } } or { mobile: { ... } }
    
    onControlsChange({
      [settingsType]: {
        ...currentData[settingsType],
        ...newSettings,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-white">Font Settings</h3>
        <p className="mt-1 text-sm text-gray-400">
          Toggle between desktop and mobile viewport settings.
        </p>
        <div className="mt-4 flex justify-center bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewportMode === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            } transition-all duration-200`}
          >
            Desktop (MD and above)
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewportMode === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            } transition-all duration-200`}
          >
            Mobile (Below MD)
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={viewportMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-8 p-4 bg-gray-800 rounded-lg">
            {/* Main Title Font Controller */}
            <PanelFontController
              label="Main Service Title"
              currentData={currentData.mainTitleTextSettings}
              onControlsChange={(newSettings) => handleSettingsChange('mainTitleTextSettings', newSettings)}
              fieldPrefix={viewportMode} // 'desktop' or 'mobile'
              themeColors={themeColors}
            />

            {/* Sub Title Font Controller */}
            <PanelFontController
              label="Sub-Service Title"
              currentData={currentData.subTitleTextSettings}
              onControlsChange={(newSettings) => handleSettingsChange('subTitleTextSettings', newSettings)}
              fieldPrefix={viewportMode} // 'desktop' or 'mobile'
              themeColors={themeColors}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* 
====================================================
 2) HERO CONTROLS PANEL (For Hero Image & Services Only)
----------------------------------------------------
 - Provides controls for hero background image and service selection.
 - Logo, mainTitle, subTitle are NOT handled here.
 - All changes call `onControlsChange` to update parent's localData.
====================================================
*/
function HeroControlsPanel({ currentData, onControlsChange, themeColors }) { 
  const {
    heroImage, 
    bannerColor,
    topBannerColor,
  } = currentData;

  const handleHeroImageUpload = (file) => {
    if (file) {
      if (currentData.heroImage && typeof currentData.heroImage === 'string' && currentData.heroImage.startsWith('blob:')) {
        URL.revokeObjectURL(currentData.heroImage);
      }
      const newImageSrc = URL.createObjectURL(file);
      onControlsChange({ heroImage: newImageSrc, heroImageFile: file });
    }
  };
  
  const handleBannerColorChange = (color) => {
    onControlsChange({ bannerColor: color });
  };

  const handleTopBannerColorChange = (color) => {
    onControlsChange({ topBannerColor: color });
  };

  const fileInputStyle = "w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer";

  return (
    <div className="bg-gray-800 text-white p-3 rounded-lg mt-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-center border-b border-gray-600 pb-2 text-gray-100">Hero Settings</h3>
      
      <div className="mb-4">
        <label className="block text-xs mb-1 font-medium text-gray-200">Background Image:</label>
        <input type="file" accept="image/*" onChange={(e) => handleHeroImageUpload(e.target.files?.[0])} className={fileInputStyle} />
        {getDisplayPath(heroImage) && <img src={getDisplayPath(heroImage)} alt="Hero Background Preview" className="mt-2 h-20 w-full object-cover rounded bg-gray-700 p-1" />}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs mb-1 font-medium text-gray-200">Top Banner Gradient:</label>
          <ThemeColorPicker
            label=""
            currentColorValue={topBannerColor || "#FFFFFF"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) => handleTopBannerColorChange(value)}
            fieldName="topBannerColor"
            className="mt-0"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs mb-1 font-medium text-gray-200">Bottom Banner Gradient:</label>
          <ThemeColorPicker
            label=""
            currentColorValue={bannerColor || "#1e293b"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) => handleBannerColorChange(value)}
            fieldName="bannerColor"
            className="mt-0"
          />
        </div>
      </div>
      
      {/* Removed the grid for service selection (Available Residential/Commercial Services) */}
      {/* The IconSelectorModal previously here is also removed as icon editing for services will be part of HeroPreview interaction */}
    </div>
  );
}

/* 
====================================================
 3) MAIN EXPORT: HERO BLOCK
----------------------------------------------------
 - If readOnly is true, renders HeroPreview with original heroconfig.
 - If readOnly is false, renders HeroPreview (with localData for live background updates) 
   AND HeroControlsPanel (for heroImage & services).
 - All changes are auto-saved via onConfigChange.
 - mainTitle, subTitle, logo are NO LONGER part of this block's data/editing.
====================================================
*/
export default function HeroBlock({
  heroconfig: heroconfigProp = { 
    residential: { subServices: [], icon: 'Home', iconPack: 'lucide' },
    commercial: { subServices: [], icon: 'Building2', iconPack: 'lucide' },
    images: [],
    bannerColor: "#1e293b",
    topBannerColor: "#FFFFFF",
    brightness: 75,
    mainTitleTextSettings: {
      desktop: {
        fontFamily: "Inter",
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: 0.5,
        color: "#FFFFFF"
      },
      mobile: {
        fontFamily: "Inter",
        fontSize: 18,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: 0.4,
        color: "#FFFFFF"
      }
    },
    subTitleTextSettings: {
      desktop: {
        fontFamily: "Inter",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: 0.3,
        color: "#FFFFFF"
      },
      mobile: {
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0.2,
        color: "#FFFFFF"
      }
    },
    colors: [],
    styling: { desktopHeightVH: 30, mobileHeightVW: 75 },
  },
  readOnly = false,
  onConfigChange = () => {},
  themeColors = [],
}) {
  const getInitializedData = (heroconfigProp) => {
    // Start with a deep copy of the default values from HeroBlock.defaultProps
    const defaults = HeroBlock.defaultProps.heroconfig;

    const mergedData = {
      ...defaults,
      ...heroconfigProp,
      residential: {
        ...defaults.residential,
        ...(heroconfigProp.residential || {}),
      },
      commercial: {
        ...defaults.commercial,
        ...(heroconfigProp.commercial || {}),
      },
      mainTitleTextSettings: {
        desktop: {
          ...defaults.mainTitleTextSettings.desktop,
          ...((heroconfigProp.mainTitleTextSettings || {}).desktop || {}),
        },
        mobile: {
          ...defaults.mainTitleTextSettings.mobile,
          ...((heroconfigProp.mainTitleTextSettings || {}).mobile || {}),
        },
      },
      subTitleTextSettings: {
        desktop: {
          ...defaults.subTitleTextSettings.desktop,
          ...((heroconfigProp.subTitleTextSettings || {}).desktop || {}),
        },
        mobile: {
          ...defaults.subTitleTextSettings.mobile,
          ...((heroconfigProp.subTitleTextSettings || {}).mobile || {}),
        },
      },
      styling: {
        ...defaults.styling,
        ...(heroconfigProp.styling || {}),
      },
    };
    
    // Legacy migration: if old `textSettings` exists, migrate it
    if (heroconfigProp.textSettings && !heroconfigProp.mainTitleTextSettings) {
      mergedData.mainTitleTextSettings.desktop = { ...heroconfigProp.textSettings };
      delete mergedData.mainTitleTextSettings.desktop.textAlign;
      mergedData.mainTitleTextSettings.mobile = { ...mergedData.mainTitleTextSettings.desktop };
      mergedData.mainTitleTextSettings.mobile.fontSize = Math.max(8, (mergedData.mainTitleTextSettings.desktop.fontSize || 18) - 2);
    }
    
    const ensureOriginalTitle = (subServices) => {
      return (subServices || []).map(s => ({
        ...s,
        id: s.id || slugify(s.originalTitle || s.title),
        originalTitle: s.originalTitle || s.title
      }));
    };

    mergedData.residential.subServices = ensureOriginalTitle(mergedData.residential.subServices);
    mergedData.commercial.subServices = ensureOriginalTitle(mergedData.commercial.subServices);


    // Image initialization logic
    let initialImages = [];
    const defaultHeroImagePath = "/assets/images/hero/hero_split_background.jpg";
    if (mergedData.images && Array.isArray(mergedData.images) && mergedData.images.length > 0) {
      initialImages = mergedData.images.map((img, index) => ({
        id: img.id || `heroimg_existing_${index}_${Date.now()}`,
        url: img.url || defaultHeroImagePath,
        file: img.file instanceof File ? img.file : null,
        name: img.name || img.url?.split('/').pop() || 'hero_split_background.jpg',
        originalUrl: img.originalUrl || (typeof img.url === 'string' && !img.url.startsWith('blob:') ? img.url : defaultHeroImagePath)
      }));
    } else if (mergedData.heroImage) {
        let urlToUse = null, fileToUse = null, originalUrlToUse = null, nameToUse = 'hero_split_background.jpg', idToUse = `heroimg_init_${Date.now()}`;
        const propImage = mergedData.heroImage;
        if (typeof propImage === 'object' && propImage.url !== undefined) {
          urlToUse = propImage.url || defaultHeroImagePath;
          fileToUse = (propImage.file instanceof File) ? propImage.file : null;
          originalUrlToUse = propImage.originalUrl || (typeof propImage.url === 'string' && !propImage.url.startsWith('blob:') ? propImage.url : defaultHeroImagePath);
          nameToUse = propImage.name || (fileToUse?.name) || (typeof urlToUse === 'string' ? urlToUse.split('/').pop() : 'hero_split_background.jpg') || 'hero_split_background.jpg';
          idToUse = propImage.id || idToUse;
        } else if (typeof propImage === 'string' && propImage.trim() !== '') {
          urlToUse = propImage;
          originalUrlToUse = propImage;
          nameToUse = propImage.split('/').pop() || 'hero_split_background.jpg';
        }
        if (urlToUse || fileToUse) {
            initialImages = [{ id: idToUse, url: urlToUse, file: fileToUse, name: nameToUse, originalUrl: originalUrlToUse }];
        }
    }
    
    if (initialImages.length === 0) {
        initialImages = [{ id: `heroimg_default_${Date.now()}`, url: defaultHeroImagePath, file: null, name: 'hero_split_background.jpg', originalUrl: defaultHeroImagePath }];
    }

    mergedData.images = initialImages;
    mergedData.styling.desktopHeightVH = Number(mergedData.styling.desktopHeightVH);
    mergedData.styling.mobileHeightVW = Number(mergedData.styling.mobileHeightVW);
    
    return mergedData;
  };

  const [localData, setLocalData] = useState(() => getInitializedData(heroconfigProp));
    
  // Define prepareDataForOnConfigChange within HeroBlock
  const prepareDataForOnConfigChange = (currentData) => {
    const dataToSave = { ...currentData };
    
    // Handle images array (new structure) - preserve original names for ZIP processing
    if (dataToSave.images && dataToSave.images.length > 0) {
      const heroImageFromArray = dataToSave.images[0];
      
      // Ensure we use original file names when available, with proper heroblock naming
      let fileName = heroImageFromArray.name;
      if (heroImageFromArray.file instanceof File) {
        fileName = heroImageFromArray.file.name;
      } else if (heroImageFromArray.originalUrl && !heroImageFromArray.originalUrl.startsWith('blob:')) {
        fileName = heroImageFromArray.originalUrl.split('/').pop();
      }
      
      // Default to hero_split_background.jpg if no name is available
      if (!fileName || fileName === 'Hero Image') {
        fileName = 'hero_split_background.jpg';
      }
      
      // Keep the full image object structure for proper asset handling
      dataToSave.heroImage = {
        url: heroImageFromArray.url,
        file: heroImageFromArray.file,
        originalUrl: heroImageFromArray.originalUrl,
        name: fileName,
        id: heroImageFromArray.id
      };
      
      // Update the images array with correct name
      dataToSave.images = dataToSave.images.map(img => ({
        id: img.id,
        url: img.url,
        file: img.file,
        name: img.file instanceof File ? img.file.name : (img.originalUrl && !img.originalUrl.startsWith('blob:') ? img.originalUrl.split('/').pop() : img.name || 'hero_split_background.jpg'),
        originalUrl: img.originalUrl
      }));
    } else {
      // Fallback to default if no images
      dataToSave.heroImage = { url: '', file: null, originalUrl: '', name: 'hero_split_background.jpg', id: null };
      dataToSave.images = [];
    }

    // Handle legacy heroImageFile for backwards compatibility
    if (dataToSave.heroImageFile instanceof File) {
      if (!dataToSave.images || dataToSave.images.length === 0) {
        dataToSave.images = [{
          id: `heroimg_legacy_${Date.now()}`,
          url: dataToSave.heroImage || URL.createObjectURL(dataToSave.heroImageFile),
          file: dataToSave.heroImageFile,
          name: dataToSave.heroImageFile.name, // Use actual file name
          originalUrl: dataToSave.originalUrl || dataToSave._heroImageOriginalPathFromProps || null
        }];
      }
      dataToSave.heroImage = {
        url: dataToSave.heroImage || URL.createObjectURL(dataToSave.heroImageFile),
        file: dataToSave.heroImageFile,
        originalUrl: dataToSave.originalUrl || dataToSave._heroImageOriginalPathFromProps || null,
        name: dataToSave.heroImageFile.name, // Use actual file name
        id: dataToSave.images[0]?.id || `heroimg_legacy_${Date.now()}`
      };
    }

    const transformSubServices = (subServicesArray) => (subServicesArray || []).map(s => ({
        title: s.label || s.title, // Prefer label if it exists (from editable input)
        originalTitle: s.originalTitle || s.label || s.title, 
        id: s.id,
        slug: s.slug, // Preserve the slug for routing
    }));
    dataToSave.residential = { ...(currentData.residential || {}), subServices: transformSubServices(currentData.residential?.subServices) };
    dataToSave.commercial = { ...(currentData.commercial || {}), subServices: transformSubServices(currentData.commercial?.subServices) };
    
    // Clean up temporary properties before saving
    delete dataToSave.textSettings; 
    
    return dataToSave;
  };

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingIconServiceType, setEditingIconServiceType] = useState(null);
  
  // Track blob URLs for proper cleanup without interfering with downloads
  const blobUrlsRef = useRef(new Set());

  useEffect(() => {
    // When heroconfigProp changes from the parent (e.g., on undo), we need to reset our local state.
    const newInitializedData = getInitializedData(heroconfigProp);
    setLocalData(newInitializedData);
  }, [heroconfigProp]);

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (typeof onConfigChange === 'function') {
        const dataForParent = prepareDataForOnConfigChange(localData);
        onConfigChange(dataForParent);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleControlsChange = (changedFields) => {
    setLocalData(prevData => {
      const newData = { ...prevData };
  
      for (const key in changedFields) {
        if (Object.prototype.hasOwnProperty.call(changedFields, key)) {
          // Deep merge for nested objects like styling and text settings
          if (
            typeof changedFields[key] === 'object' &&
            changedFields[key] !== null &&
            !Array.isArray(changedFields[key]) &&
            prevData[key] &&
            typeof prevData[key] === 'object'
          ) {
            newData[key] = {
              ...prevData[key],
              ...changedFields[key],
            };
            // Further deep merge for desktop/mobile inside text settings
            if (key === 'mainTitleTextSettings' || key === 'subTitleTextSettings') {
              if (changedFields[key].desktop) {
                newData[key].desktop = { ...prevData[key].desktop, ...changedFields[key].desktop };
              }
              if (changedFields[key].mobile) {
                newData[key].mobile = { ...prevData[key].mobile, ...changedFields[key].mobile };
              }
            }
          } else {
            // Shallow merge for other properties
            newData[key] = changedFields[key];
          }
        }
      }
  
      if (!readOnly && typeof onConfigChange === 'function') {
        onConfigChange(prepareDataForOnConfigChange(newData));
      }
  
      return newData;
    });
  };

  const handleServiceNameChange = (serviceType, serviceId, newName) => {
    setLocalData(prevData => {
      const services = prevData[serviceType]?.subServices || [];
      const updatedServices = services.map(service => service.id === serviceId ? { ...service, label: newName } : service);
      const newData = { ...prevData, [serviceType]: { ...prevData[serviceType], subServices: updatedServices } };
      
      if (!readOnly && typeof onConfigChange === 'function') {
        onConfigChange(prepareDataForOnConfigChange(newData));
      }
      
      return newData;
    });
  };

  const handleAddService = (serviceType) => {
    setLocalData(prevData => {
      const services = prevData[serviceType]?.subServices || [];
      const newServiceId = `service-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newService = { title: "New Service", label: "New Service", id: newServiceId, originalTitle: "New Service" };
      const newData = { ...prevData, [serviceType]: { ...prevData[serviceType], subServices: [...services, newService] } };
      
      if (!readOnly && typeof onConfigChange === 'function') {
        onConfigChange(prepareDataForOnConfigChange(newData));
      }
      
      return newData;
    });
  };

  const handleRemoveService = (serviceType, serviceIdToRemove) => {
    setLocalData(prevData => {
      const services = prevData[serviceType]?.subServices || [];
      const updatedServices = services.filter(service => service.id !== serviceIdToRemove);
      const newData = { ...prevData, [serviceType]: { ...prevData[serviceType], subServices: updatedServices } };
      
      if (!readOnly && typeof onConfigChange === 'function') {
        onConfigChange(prepareDataForOnConfigChange(newData));
      }
      
      return newData;
    });
  };
  
  const handleOpenIconModalForService = (serviceType) => { 
    setEditingIconServiceType(serviceType); 
    setIsIconModalOpen(true);
  };

  const handleIconSelectionConfirm = (selectedPack, selectedIconName) => {
    if (editingIconServiceType) {
      setLocalData(prevData => {
        const newData = {
          ...prevData, 
          [editingIconServiceType]: { 
            ...prevData[editingIconServiceType], 
            icon: selectedIconName, 
            iconPack: selectedPack 
          },
        };
        
        if (!readOnly && typeof onConfigChange === 'function') {
          onConfigChange(prepareDataForOnConfigChange(newData));
        }
        
        return newData;
      });
    }
    setIsIconModalOpen(false); 
    setEditingIconServiceType(null);
  };
  
  const previewHandlers = !readOnly ? {
    onServiceNameChange: handleServiceNameChange,
    onAddService: handleAddService,
    onRemoveService: handleRemoveService,
    onEditServiceIcon: handleOpenIconModalForService,
    readOnly: false,
  } : { readOnly: true };

  // Track and cleanup blob URLs properly
  useEffect(() => {
    // Cleanup function only runs on unmount
    return () => {
      // Only cleanup on component unmount
      blobUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('[HeroBlock] Error revoking blob URL:', url, error);
        }
      });
      blobUrlsRef.current.clear();
    };
  }, []); // No dependencies - only run on mount/unmount

  // Helper function to track new blob URLs
  const trackBlobUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      blobUrlsRef.current.add(url);
    }
  };

  // Track existing blob URLs after mount and when images change
  useEffect(() => {
    const currentImages = localData.images || [];
    currentImages.forEach(img => {
      if (img.url && img.url.startsWith('blob:')) {
        blobUrlsRef.current.add(img.url);
      }
    });
  }, [localData.images]);

  const previewConfig = {
    ...localData,
    ...previewHandlers,
    styling: {
        ...(localData.styling || {}),
        desktopHeightVH: Number(localData.styling?.desktopHeightVH) || 30,
        mobileHeightVW: Number(localData.styling?.mobileHeightVW) || 75,
    }
  };
  
  return (
    <>
      <HeroPreview heroconfig={previewConfig} />
      {!readOnly && isIconModalOpen && (
        <IconSelectorModal
          isOpen={isIconModalOpen} 
          onClose={() => setIsIconModalOpen(false)}
          onSelectIcon={handleIconSelectionConfirm}
          currentSelection={{ pack: localData[editingIconServiceType]?.iconPack, icon: localData[editingIconServiceType]?.icon }}
        />
      )}
    </>
  );
}

HeroBlock.propTypes = {
  heroconfig: PropTypes.object,
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  themeColors: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

HeroBlock.defaultProps = {
  heroconfig: {
    residential: { subServices: [], icon: 'Home', iconPack: 'lucide' },
    commercial: { subServices: [], icon: 'Building2', iconPack: 'lucide' },
    images: [],
    bannerColor: "#1e293b",
    topBannerColor: "#FFFFFF",
    brightness: 75,
    mainTitleTextSettings: {
      desktop: { fontFamily: "Inter", fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0.5, color: "#FFFFFF" },
      mobile: { fontFamily: "Inter", fontSize: 18, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0.4, color: "#FFFFFF" },
    },
    subTitleTextSettings: {
      desktop: { fontFamily: "Inter", fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0.3, color: "#FFFFFF" },
      mobile: { fontFamily: "Inter", fontSize: 14, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.2, color: "#FFFFFF" },
    },
    colors: [],
    styling: { desktopHeightVH: 30, mobileHeightVW: 75 },
  },
  readOnly: false,
  onConfigChange: () => {},
  themeColors: [],
};


// Expose tabsConfig for TopStickyEditPanel, using PanelImagesController for images
HeroBlock.tabsConfig = (blockCurrentData, onControlsChange, themeColors) => {
  const currentStyling = blockCurrentData.styling || { desktopHeightVH: 30, mobileHeightVW: 75 };
  
  let processedData = { ...blockCurrentData };

  return {
    images: (props) => (
      <PanelImagesController 
        {...props} 
        currentData={processedData}
        onControlsChange={onControlsChange}
        imageArrayFieldName="images" 
        maxImages={1} 
      />
    ),
    colors: (props) => <HeroColorControls 
      {...props} 
      currentData={processedData}
      onControlsChange={onControlsChange}
      themeColors={themeColors} 
    />,
    styling: (props) => (
      <div className="space-y-6">
        <PanelStylingController
          {...props}
          currentData={processedData}
          onControlsChange={onControlsChange}
          blockType="HeroBlock"
        />
        
        <div className="border-t border-gray-300 pt-6">
          <BrightnessController
            currentData={processedData}
            onControlsChange={onControlsChange}
            fieldName="brightness"
            label="Hero Image Brightness"
            min={10}
            max={100}
            step={5}
          />
        </div>
        
      </div>
    ),
    fonts: (props) => <HeroFontsControls 
      {...props} 
      currentData={processedData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />,
  };
}; 