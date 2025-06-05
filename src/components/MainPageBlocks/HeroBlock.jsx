import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home as DefaultHomeIcon, Building2 as DefaultWarehouseIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import IconSelectorModal from "../common/IconSelectorModal";
import { slugify } from "../../utils/slugify"; // Import slugify
import ThemeColorPicker from "../common/ThemeColorPicker"; // Import common ThemeColorPicker
import PropTypes from "prop-types";
import PanelStylingController from "../common/PanelStylingController";
import PanelImagesController from "../common/PanelImagesController";
import BrightnessController from "../common/BrightnessController";
import FontController from "../common/FontController";

const iconPacks = {
  lucide: LucideIcons,
  fa: FaIcons,
};

// Robust dynamic icon renderer
const renderDynamicIcon = (packName, iconName, defaultIconComponent, props = { className: "w-full h-full" }) => {
  const pack = iconPacks[packName?.toLowerCase()];
  if (pack) {
    const IconComponent = pack[iconName];
    if (IconComponent && typeof IconComponent === 'function') {
      return <IconComponent {...props} />;
    }
  }
  const DefaultIcon = defaultIconComponent || LucideIcons.HelpCircle; 
  return <DefaultIcon {...props} />;
};

// Helper to get display path for image previews
const getDisplayPath = (pathOrFile) => {
  if (!pathOrFile) return '';
  
  // Handle object structure: { url: '...', file: File, name: '...', originalUrl: '...' }
  if (typeof pathOrFile === 'object') {
    if (pathOrFile.url) {
      return pathOrFile.url; // This could be a blob URL or regular URL
    }
    if (pathOrFile instanceof File) {
      return URL.createObjectURL(pathOrFile); // Convert File to blob URL
    }
    return '';
  }
  
  // Handle string structure (direct URL path)
  if (typeof pathOrFile === 'string') {
    return pathOrFile; // URL or path string
  }
  
  return '';
};

/* 
====================================================
 1) HERO PREVIEW (Displays actual hero content)
----------------------------------------------------
- Does NOT display mainTitle, subTitle, or logo.
- Shows heroImage background and interactive service sections.
- Takes `heroconfig` prop. This will be `localData` from HeroBlock 
  when HeroBlock is in edit mode, or original `heroconfig` 
  from MainPageForm when HeroBlock is read-only.
====================================================
*/
function HeroPreview({ heroconfig }) { 
  if (!heroconfig) {
    return <p>No data found for HeroPreview.</p>;
  }

  console.log("[HeroPreview] Received heroconfig:", {
    hasImages: heroconfig.images?.length > 0,
    imagesArray: heroconfig.images,
    heroImage: heroconfig.heroImage,
    readOnly: heroconfig.readOnly
  });

  const bannerStyles = {
    "--banner-color": heroconfig.bannerColor || "#1e293b",
    "--top-banner-color": heroconfig.topBannerColor || "#FFFFFF",
  };

  // Destructure styling from heroconfig, providing defaults
  const { 
    styling: { desktopHeightVH = 30, mobileHeightVW = 75 } = {},
    readOnly: isPreviewReadOnly,
    brightness = 50, // Default brightness
    textSettings = {},
  } = heroconfig;

  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);

  // Get heroImage from the new images array structure if present, otherwise use direct heroImage
  const heroImageToDisplay = (() => {
    // First priority: images array (new structure for PanelImagesController)
    if (heroconfig.images && heroconfig.images.length > 0) {
      const imageObj = heroconfig.images[0];
      // Use blob URL if file was uploaded, otherwise use the original URL
      return imageObj.url || null;
    }
    
    // Second priority: direct heroImage property (legacy or direct assignment)
    if (heroconfig.heroImage) {
      if (typeof heroconfig.heroImage === 'object' && heroconfig.heroImage.url) {
        return heroconfig.heroImage.url;
      }
      if (typeof heroconfig.heroImage === 'string') {
        return heroconfig.heroImage;
      }
    }
    
    // Fallback to default
    return "/assets/images/hero/hero_split_background.jpg";
  })();

  // Calculate brightness filter
  const getBrightnessFilter = (brightnessValue) => {
    // Convert 0-100 brightness to CSS filter brightness (0.3 to 1.2)
    const filterValue = 0.3 + (brightnessValue / 100) * 0.9;
    return `brightness(${filterValue}) contrast(1.1)`;
  };

  // Get text styles from textSettings
  const getTextStyles = () => {
    if (!textSettings || Object.keys(textSettings).length === 0) {
      return {}; // Use default styles
    }
    
    return {
      fontFamily: textSettings.fontFamily || 'inherit',
      fontSize: textSettings.fontSize ? `${textSettings.fontSize}px` : 'inherit',
      fontWeight: textSettings.fontWeight || 'inherit',
      lineHeight: textSettings.lineHeight || 'inherit',
      letterSpacing: textSettings.letterSpacing ? `${textSettings.letterSpacing}px` : 'inherit',
      textAlign: textSettings.textAlign || 'inherit',
      color: textSettings.color || 'inherit',
    };
  };

  const textStyles = getTextStyles();

  const {
    residential = { subServices: [], icon: 'Home', iconPack: 'lucide' },
    commercial = { subServices: [], icon: 'Building2', iconPack: 'lucide' },
    heroImage, 
    bannerColor,
    topBannerColor,
  } = heroconfig;

  useEffect(() => {
    // Process subServices to include the new slug-based route
    const processSubServices = (subServices, type) => {
      return (subServices || []).map(service => {
        // Ensure service.title is used for display, and a stable original identifier for routes
        const originalIdentifier = service.originalTitle || service.title; // Fallback if originalTitle isn't there yet
        const slug = slugify(originalIdentifier);
        return {
          label: service.title, // This is the editable display title
          route: `/services/${type}/${slug}`,
          id: service.id, // Ensure id is carried over
          originalTitle: originalIdentifier, // Ensure originalTitle is present
          slug: slug, // Preserve the slug for routing
        };
      });
    };

    setResidentialServices(processSubServices(residential.subServices, 'residential'));
    setCommercialServices(processSubServices(commercial.subServices, 'commercial'));
  }, [residential.subServices, commercial.subServices]);

  const [activeSection, setActiveSection] = useState("neutral");

  // Props for inline editing, only relevant if HeroBlock's readOnly is false
  const { onServiceNameChange, onRemoveService, onEditServiceIcon, onAddService } = heroconfig;

  const iconWrapperBaseClass = "text-gray-50 w-[6.5vw] h-[6.5vw] md:w-[60px] md:h-[60px] flex items-center justify-center drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,0.7)]";
  const serviceSectionTextBaseClass = "text-lg md:text-xl font-semibold text-gray-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] ml-2 md:ml-3";

  // Animation Variants
  const iconAnimationVariants = {
    neutral: { x: 0, y: 0, scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
    active: { // Icon shifts up slightly when active, and sub-services appear below it
      y: 0, 
      x: -20, // Icon slides left slightly to make space for sub-services to its right
      scale: 1.1,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    inactive: { x: 0, scale: 0.85, opacity: 0.6, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const textLabelAnimationVariants = {
    exit: { opacity: 0, x: 10, transition: { duration: 0.2, ease: "easeOut" } }, // Label slides out to the right
    enter: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  // Variants for the sub-service column container (now a row/horizontal container)
  const subServiceContainerVariants = {
    hidden: { opacity: 0, width: 0, x: -10, transition: { duration: 0.3, ease: "easeInOut", when: "afterChildren" } },
    visible: { 
      opacity: 1, 
      width: 'auto', // Animate to auto width
      x: 0, 
      transition: { duration: 0.4, delay: 0.1, ease: "easeInOut", when: "beforeChildren", staggerChildren: 0.07 } 
    }
  };

  const subServiceItemVariants = {
    hidden: { opacity: 0, x: -10 }, // Items slide in from left slightly
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } }
  };

  const renderServiceSection = (type, services, iconDetails) => {
    const isActive = activeSection === type;
    const isNeutral = activeSection === "neutral";
    let iconState = "neutral";
    if (isActive) iconState = "active";
    else if (!isNeutral) iconState = "inactive";

    const sectionLabel = type.charAt(0).toUpperCase() + type.slice(1);

    const handleIconClick = () => {
      if (!isPreviewReadOnly && onEditServiceIcon) {
        onEditServiceIcon(type);
      } else {
        setActiveSection(prev => prev === type ? "neutral" : type);
      }
    };

    const handleSectionAreaClick = () => {
      setActiveSection(prev => prev === type ? "neutral" : type);
    };

    return (
      <div
        className="w-1/2 h-full flex flex-col items-center justify-center cursor-pointer"
        onClick={handleSectionAreaClick}
      >
        {/* Icon and Main Label (Horizontal when neutral, Icon slides left and sub-services appear right when active) */}
        <div className="flex items-center justify-center mb-2 md:mb-3 min-h-[40px] md:min-h-[50px] relative">
          <motion.div
            className={`${iconWrapperBaseClass} ${!isPreviewReadOnly ? 'hover:bg-white/10 rounded-md' : ''}`}
            variants={iconAnimationVariants}
            animate={iconState}
            layout
            onClick={(e) => {
              e.stopPropagation();
              handleIconClick();
            }}
          >
            {renderDynamicIcon(iconDetails.iconPack, iconDetails.icon, type === 'residential' ? DefaultHomeIcon : DefaultWarehouseIcon)}
          </motion.div>
          
          {/* Main Label - only shown when its section is NOT active OR if neutral */}
          <AnimatePresence mode="wait">
            {(isNeutral || !isActive) && (
              <motion.p
                key={`${type}-text-label-main`}
                className={serviceSectionTextBaseClass}
                style={textStyles}
                variants={textLabelAnimationVariants}
                initial="exit"
                animate="enter"
                exit="exit"
              >
                {sectionLabel}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Sub-Services Horizontal Container - Appears to the right of the icon when active */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                className={`absolute left-[calc(100%_-_10px)] md:left-[calc(100%_-_5px)] 
                            flex flex-col items-start  md:space-y-1.5 
                            p-1 md:p-1.5 rounded-lg shadow-xl overflow-hidden 
                            ${isPreviewReadOnly ? 'bg-transparent' : 'bg-second-accent/30'} 
                          `}
                variants={subServiceContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ pointerEvents: isActive ? 'auto' : 'none' }} 
                onClick={(e) => e.stopPropagation()}
              >
                {services.map((service, idx) => (
                  <motion.div
                    key={service.id || idx}
                    variants={subServiceItemVariants}
                    className={`whitespace-nowrap flex items-center justify-start group py-0.5 md:py-1 rounded-md w-full
                                ${!isPreviewReadOnly ? 'hover:bg-white/10 px-1.5 md:px-2' : 'px-1 md:px-1.5'}
                              `}
                  >
                    {!isPreviewReadOnly ? (
                      <input
                        type="text"
                        value={service.label} // Editable display title
                        onChange={(e) => onServiceNameChange(type, service.id, e.target.value)}
                        className="py-0.5 px-1 bg-transparent text-white focus:bg-white/20 outline-none w-auto max-w-[100px] md:max-w-[120px] text-xs md:text-sm rounded-sm text-left"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <Link 
                        to={service.route} // Uses new slug-based route
                        onClick={(e) => e.stopPropagation()}
                        className="block py-0.5 text-white hover:underline text-xs md:text-sm text-left"
                      >
                        {service.label} {/* Displays editable title */}
                      </Link>
                    )}
                    {!isPreviewReadOnly && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveService(type, service.id); }}
                        className="ml-1 md:ml-1.5 text-red-400 hover:text-red-300 opacity-30 group-hover:opacity-100 transition-opacity"
                        title="Remove Service"
                      >
                        <LucideIcons.MinusCircle size={12} />
                      </button>
                    )}
                  </motion.div>
                ))}
                {services.length === 0 && isActive && (
                  <motion.p
                    variants={subServiceItemVariants}
                    className="text-xs text-gray-400 italic py-1 px-2 text-left"
                  >
                    No services.
                  </motion.p>
                )}
                 {!isPreviewReadOnly && (
                  <motion.button
                    variants={subServiceItemVariants}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Call a new handler to add a service, passed down via previewHandlers
                      if (onAddService) onAddService(type);
                    }}
                    className="mt-1 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 self-start"
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
    <div className="p-3 space-y-6">
      <h3 className="text-lg font-semibold mb-3 text-center border-b border-gray-600 pb-2 text-gray-100">Hero Colors</h3>
      
      {/* Gradient Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ThemeColorPicker
            label="Top Banner Gradient:"
            currentColorValue={currentData.topBannerColor || "#FFFFFF"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) => handleTopBannerColorChange(value)}
            fieldName="topBannerColor" 
            className="mt-0" 
          />
        </div>
        <div>
          <ThemeColorPicker
            label="Bottom Banner Gradient:"
            currentColorValue={currentData.bannerColor || "#1e293b"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) => handleBannerColorChange(value)}
            fieldName="bannerColor" 
            className="mt-0" 
          />
        </div>
      </div>

      {/* Custom Hero Colors */}
      <div className="mt-6">
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
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={color.label}
                onChange={(e) => handleCustomColorChange(color.id, 'label', e.target.value)}
                className="bg-gray-600 text-white px-2 py-1 rounded text-sm flex-1 mr-2"
                placeholder="Color Name"
              />
              <button
                onClick={() => handleRemoveCustomColor(color.id)}
                className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={color.value}
                onChange={(e) => handleCustomColorChange(color.id, 'value', e.target.value)}
                className="w-8 h-8 rounded border border-gray-500"
              />
              <input
                type="text"
                value={color.value}
                onChange={(e) => handleCustomColorChange(color.id, 'value', e.target.value)}
                className="bg-gray-600 text-white px-2 py-1 rounded text-sm flex-1"
                placeholder="#000000"
              />
            </div>
            <input
              type="text"
              value={color.description || ''}
              onChange={(e) => handleCustomColorChange(color.id, 'description', e.target.value)}
              className="bg-gray-600 text-white px-2 py-1 rounded text-sm w-full mt-2"
              placeholder="Color description..."
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
    textSettings: {
      fontFamily: "Inter",
      fontSize: 20,
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: 0.5,
      textAlign: "center",
      color: "#FFFFFF"
    },
    colors: [],
    styling: { desktopHeightVH: 30, mobileHeightVW: 75 },
  },
  readOnly = false,
  onConfigChange = () => {},
  themeColors = [],
}) {
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
    
    return dataToSave;
  };

  const [localData, setLocalData] = useState(() => {
    const initialConfig = { ...heroconfigProp }; // Clone to avoid mutating prop
    const initialStyling = initialConfig.styling || {};
    console.log("[HeroBlock] Initializing localData. heroconfigProp.styling:", heroconfigProp.styling, "InitialStyling:", initialStyling);

    // Image initialization logic - prioritize existing images array, then heroImage prop
    let initialImages = [];
    const defaultHeroImagePath = "/assets/images/hero/hero_split_background.jpg";

    // Check if images array already exists and is valid
    if (initialConfig.images && Array.isArray(initialConfig.images) && initialConfig.images.length > 0) {
      console.log("[HeroBlock] Using existing images array from prop");
      initialImages = initialConfig.images.map((img, index) => ({
        id: img.id || `heroimg_existing_${index}_${Date.now()}`,
        url: img.url || defaultHeroImagePath,
        file: img.file instanceof File ? img.file : null,
        name: img.name || img.url?.split('/').pop() || 'hero_split_background.jpg',
        originalUrl: img.originalUrl || (typeof img.url === 'string' && !img.url.startsWith('blob:') ? img.url : defaultHeroImagePath)
      }));
    } else {
      // Initialize from heroImage prop or create default - this handles combined_data.json structure
      let urlToUse = null;
      let fileToUse = null;
      let originalUrlToUse = null;
      let nameToUse = 'hero_split_background.jpg';
      let idToUse = `heroimg_init_${Date.now()}`;

      const propImage = initialConfig.heroImage;
      if (propImage) {
        if (typeof propImage === 'object' && propImage.url !== undefined) {
          // Object structure: { url: '...', file: File, name: '...', originalUrl: '...' }
          urlToUse = propImage.url || defaultHeroImagePath;
          fileToUse = (propImage.file instanceof File) ? propImage.file : null;
          originalUrlToUse = propImage.originalUrl || (typeof propImage.url === 'string' && !propImage.url.startsWith('blob:') ? propImage.url : defaultHeroImagePath);
          nameToUse = propImage.name || (fileToUse?.name) || (typeof urlToUse === 'string' ? urlToUse.split('/').pop() : 'hero_split_background.jpg') || 'hero_split_background.jpg';
          idToUse = propImage.id || idToUse;
        } else if (typeof propImage === 'string' && propImage.trim() !== '') {
          // String structure from combined_data.json: "heroImage": "/assets/images/hero/hero_bg.png"
          urlToUse = propImage;
          originalUrlToUse = propImage;
          nameToUse = propImage.split('/').pop() || 'hero_split_background.jpg';
          console.log("[HeroBlock] Initialized from JSON string heroImage:", propImage);
        } else if (propImage instanceof File) {
          // Direct File object
          fileToUse = propImage;
          urlToUse = URL.createObjectURL(propImage);
          originalUrlToUse = initialConfig._heroImageOriginalPathFromProps || null; 
          nameToUse = fileToUse.name;
        }
      }
      
      // Only create images array if we have valid image data
      if (urlToUse || fileToUse) {
        initialImages = [{
          id: idToUse,
          url: urlToUse,
          file: fileToUse,
          name: nameToUse,
          originalUrl: originalUrlToUse,
        }];
        console.log("[HeroBlock] Initialized images array from heroImage prop:", initialImages);
      } else {
        // Create default image object for preview
        initialImages = [{
          id: `heroimg_default_${Date.now()}`,
          url: defaultHeroImagePath,
          file: null,
          name: 'hero_split_background.jpg',
          originalUrl: defaultHeroImagePath,
        }];
        console.log("[HeroBlock] No image data found, initializing with default image object");
      }
    }

    // Ensure subServices always have originalTitle for consistent slug generation
    const ensureOriginalTitle = (subServices) => {
      return (subServices || []).map(s => ({
        ...s,
        id: s.id || slugify(s.originalTitle || s.title),
        originalTitle: s.originalTitle || s.title
      }));
    };

    return {
      ...initialConfig,
      images: initialImages, 
      residential: {
        ...(initialConfig.residential || {}),
        subServices: ensureOriginalTitle(initialConfig.residential?.subServices),
        icon: initialConfig.residential?.icon || 'Home',
        iconPack: initialConfig.residential?.iconPack || 'lucide',
      },
      commercial: {
        ...(initialConfig.commercial || {}),
        subServices: ensureOriginalTitle(initialConfig.commercial?.subServices),
        icon: initialConfig.commercial?.icon || 'Building2',
        iconPack: initialConfig.commercial?.iconPack || 'lucide',
      },
      bannerColor: initialConfig.bannerColor || "#1e293b",
      topBannerColor: initialConfig.topBannerColor || "#FFFFFF",
      brightness: initialConfig.brightness !== undefined ? initialConfig.brightness : 75,
      textSettings: {
        fontFamily: initialConfig.textSettings?.fontFamily || "Inter",
        fontSize: initialConfig.textSettings?.fontSize || 20,
        fontWeight: initialConfig.textSettings?.fontWeight || 600,
        lineHeight: initialConfig.textSettings?.lineHeight || 1.4,
        letterSpacing: initialConfig.textSettings?.letterSpacing || 0.5,
        textAlign: initialConfig.textSettings?.textAlign || "center",
        color: initialConfig.textSettings?.color || "#FFFFFF",
      },
      colors: initialConfig.colors || [],
      styling: {
        desktopHeightVH: initialStyling.desktopHeightVH !== undefined ? Number(initialStyling.desktopHeightVH) : 30,
        mobileHeightVW: initialStyling.mobileHeightVW !== undefined ? Number(initialStyling.mobileHeightVW) : 75,
      },
    };
  });

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingIconServiceType, setEditingIconServiceType] = useState(null);
  
  // Track blob URLs for proper cleanup without interfering with downloads
  const blobUrlsRef = useRef(new Set());

  useEffect(() => {
    if (heroconfigProp) {
      console.log("[HeroBlock] useEffect for heroconfigProp sync. Incoming heroconfigProp.styling:", heroconfigProp.styling);
      setLocalData(prevLocalData => {
        console.log("[HeroBlock] Inside setLocalData for prop sync. Prev prevLocalData.styling:", prevLocalData.styling);
        
        // Image update logic from prop - prioritize images array, then heroImage
        let newImagesState = [...(prevLocalData.images || [])];
        const defaultHeroImagePathLocal = "/assets/images/hero/hero_split_background.jpg";

        // Check if incoming prop has images array
        if (heroconfigProp.images && Array.isArray(heroconfigProp.images) && heroconfigProp.images.length > 0) {
          console.log("[HeroBlock] Syncing from prop images array");
          // Clean up existing blob URLs if they're different
          const currentLocalImages = prevLocalData.images || [];
          currentLocalImages.forEach(localImg => {
            if (localImg.url && localImg.url.startsWith('blob:')) {
              const foundIncoming = heroconfigProp.images.find(propImg => propImg.url === localImg.url);
              if (!foundIncoming) {
                URL.revokeObjectURL(localImg.url);
              }
            }
          });

          newImagesState = heroconfigProp.images.map((propImg, index) => ({
            id: propImg.id || `heroimg_sync_${index}_${Date.now()}`,
            url: propImg.url || defaultHeroImagePathLocal,
            file: propImg.file instanceof File ? propImg.file : null,
            name: propImg.name || propImg.url?.split('/').pop() || 'hero_split_background.jpg',
            originalUrl: propImg.originalUrl || (typeof propImg.url === 'string' && !propImg.url.startsWith('blob:') ? propImg.url : defaultHeroImagePathLocal)
          }));
        } else {
          // Fallback to heroImage prop handling
          let newUrlSync = null;
          let newFileSync = null;
          let newOriginalUrlSync = null;
          let newNameSync = 'hero_split_background.jpg';

          const incomingImageProp = heroconfigProp.heroImage;
          if (incomingImageProp) {
            if (typeof incomingImageProp === 'object' && incomingImageProp.url !== undefined) {
              newUrlSync = incomingImageProp.url || null;
              newFileSync = (incomingImageProp.file instanceof File) ? incomingImageProp.file : null;
              newOriginalUrlSync = incomingImageProp.originalUrl || (typeof incomingImageProp.url === 'string' && !incomingImageProp.url.startsWith('blob:') ? incomingImageProp.url : null);
              newNameSync = incomingImageProp.name || (newFileSync?.name) || (typeof newUrlSync === 'string' ? newUrlSync.split('/').pop() : 'hero_split_background.jpg');
            } else if (typeof incomingImageProp === 'string' && incomingImageProp.trim() !== '') {
              newUrlSync = incomingImageProp;
              newOriginalUrlSync = incomingImageProp;
              newNameSync = newUrlSync.split('/').pop() || 'hero_split_background.jpg';
            } else if (incomingImageProp instanceof File) {
              newFileSync = incomingImageProp;
              newUrlSync = URL.createObjectURL(incomingImageProp);
              newOriginalUrlSync = heroconfigProp._heroImageOriginalPathFromProps || (prevLocalData.images && prevLocalData.images[0]?.originalUrl) || null;
              newNameSync = newFileSync.name;
            }
          }
          
          // Clean up old blob URL if it's different
          const currentLocalImage = prevLocalData.images && prevLocalData.images[0];
          if (currentLocalImage && currentLocalImage.url && currentLocalImage.url.startsWith('blob:') && currentLocalImage.url !== newUrlSync) {
            URL.revokeObjectURL(currentLocalImage.url);
          }

          // Only create images array if we have valid image data
          if (newUrlSync || newFileSync) {
              newImagesState = [{
                  id: (currentLocalImage?.id) || `heroimg_sync_${Date.now()}`,
                  url: newUrlSync,
                  file: newFileSync,
                  name: newNameSync,
                  originalUrl: newOriginalUrlSync,
              }];
          } else if (!heroconfigProp.hasOwnProperty('heroImage') && !heroconfigProp.hasOwnProperty('images')) {
              // No image props provided, keep existing state
              newImagesState = prevLocalData.images || [];
          } else {
              // Empty image props provided, create default image object for preview
              newImagesState = [{
                id: `heroimg_default_sync_${Date.now()}`,
                url: defaultHeroImagePathLocal,
                file: null,
                name: 'hero_split_background.jpg',
                originalUrl: defaultHeroImagePathLocal,
              }];
          }
        }

        const incomingStyling = heroconfigProp.styling || {};
        const prevStyling = prevLocalData.styling || {};

        const newDesktopHeight = incomingStyling.desktopHeightVH !== undefined 
                                  ? Number(incomingStyling.desktopHeightVH) 
                                  : (prevStyling.desktopHeightVH !== undefined ? Number(prevStyling.desktopHeightVH) : 30);
        const newMobileHeight = incomingStyling.mobileHeightVW !== undefined 
                                  ? Number(incomingStyling.mobileHeightVW) 
                                  : (prevStyling.mobileHeightVW !== undefined ? Number(prevStyling.mobileHeightVW) : 75);

        const ensureOriginalTitleInEffect = (subServices) => {
            return (subServices || []).map(s => ({
                ...s,
                id: s.id || slugify(s.originalTitle || s.title),
                originalTitle: s.originalTitle || s.title,
            }));
        };

        const newMergedData = {
          ...prevLocalData, 
          ...heroconfigProp, 
          images: newImagesState, 
          residential: { 
            ...(prevLocalData.residential || {}),
            ...(heroconfigProp.residential || {}),
            subServices: ensureOriginalTitleInEffect(
              heroconfigProp.residential?.subServices !== undefined 
                ? heroconfigProp.residential.subServices 
                : prevLocalData.residential?.subServices
            ),
            icon: heroconfigProp.residential?.icon || prevLocalData.residential?.icon || 'Home',
            iconPack: heroconfigProp.residential?.iconPack || prevLocalData.residential?.iconPack || 'lucide',
          },
          commercial: { 
            ...(prevLocalData.commercial || {}),
            ...(heroconfigProp.commercial || {}),
            subServices: ensureOriginalTitleInEffect(
              heroconfigProp.commercial?.subServices !== undefined 
                ? heroconfigProp.commercial.subServices 
                : prevLocalData.commercial?.subServices
            ),
            icon: heroconfigProp.commercial?.icon || prevLocalData.commercial?.icon || 'Building2',
            iconPack: heroconfigProp.commercial?.iconPack || prevLocalData.commercial?.iconPack || 'lucide',
          },
          styling: {
            desktopHeightVH: newDesktopHeight, 
            mobileHeightVW: newMobileHeight,
          },
        };
        console.log("[HeroBlock] Updated localData from prop sync. New merged styling:", newMergedData.styling);
        return newMergedData;
      });
    }
  }, [heroconfigProp]);

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (typeof onConfigChange === 'function') {
        const dataForParent = prepareDataForOnConfigChange(localData);
        console.log("[HeroBlock] readOnly changed to true. Calling onConfigChange with prepared data:", dataForParent);
        onConfigChange(dataForParent);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleControlsChange = (changedFields) => {
    console.log("[HeroBlock] handleControlsChange (from panel). Incoming changedFields:", changedFields);
    setLocalData(prevData => {
      console.log("[HeroBlock handleControlsChange->setLocalData] prevData.styling:", prevData.styling);
      let newStyling = prevData.styling || { desktopHeightVH: 30, mobileHeightVW: 75 };

      if (changedFields.styling) {
        console.log("[HeroBlock handleControlsChange->setLocalData] Applying changedFields.styling:", changedFields.styling);
        newStyling = { ...newStyling, ...changedFields.styling };
      }
      
      const otherChanges = { ...changedFields };
      delete otherChanges.styling;

      // Handle images array updates from PanelImagesController
      let newImages = prevData.images || [];
      if (changedFields.images && Array.isArray(changedFields.images)) {
        newImages = changedFields.images;
        console.log("[HeroBlock] Updated images array from PanelImagesController:", newImages);
        
        // Also update heroImage for backward compatibility
        if (newImages.length > 0) {
          const primaryImage = newImages[0];
          otherChanges.heroImage = {
            url: primaryImage.url,
            file: primaryImage.file,
            name: primaryImage.name,
            originalUrl: primaryImage.originalUrl,
            id: primaryImage.id
          };
        }
      }

      const newData = {
        ...prevData,
        ...otherChanges,
        images: newImages,
        styling: newStyling,
      };
      console.log("[HeroBlock handleControlsChange->setLocalData] Merged data. newStyling:", newStyling, "newData.styling:", newData.styling);
      
      // Add immediate live update for non-readOnly mode (like VideoCTA)
      if (!readOnly && typeof onConfigChange === 'function') {
        const dataForParent = prepareDataForOnConfigChange(newData);
        console.log("[HeroBlock] Live panel update: Calling onConfigChange immediately with:", dataForParent);
        onConfigChange(dataForParent);
      }
      
      return newData;
    });
  };

  const handleServiceNameChange = (serviceType, serviceId, newName) => {
    setLocalData(prevData => {
      const services = prevData[serviceType]?.subServices || [];
      const updatedServices = services.map(service => service.id === serviceId ? { ...service, label: newName } : service);
      const newData = { ...prevData, [serviceType]: { ...prevData[serviceType], subServices: updatedServices } };
      
      // Immediately propagate changes to parent for live updates and JSON download
      if (!readOnly && typeof onConfigChange === 'function') {
        const dataForParent = prepareDataForOnConfigChange(newData);
        console.log("[HeroBlock] Service name changed. Calling onConfigChange immediately with:", dataForParent);
        onConfigChange(dataForParent);
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
      
      // Immediately propagate changes to parent for live updates and JSON download
      if (!readOnly && typeof onConfigChange === 'function') {
        const dataForParent = prepareDataForOnConfigChange(newData);
        console.log("[HeroBlock] Service added. Calling onConfigChange immediately with:", dataForParent);
        onConfigChange(dataForParent);
      }
      
      return newData;
    });
  };

  const handleRemoveService = (serviceType, serviceIdToRemove) => {
    setLocalData(prevData => {
      const services = prevData[serviceType]?.subServices || [];
      const updatedServices = services.filter(service => service.id !== serviceIdToRemove);
      const newData = { ...prevData, [serviceType]: { ...prevData[serviceType], subServices: updatedServices } };
      
      // Immediately propagate changes to parent for live updates and JSON download
      if (!readOnly && typeof onConfigChange === 'function') {
        const dataForParent = prepareDataForOnConfigChange(newData);
        console.log("[HeroBlock] Service removed. Calling onConfigChange immediately with:", dataForParent);
        onConfigChange(dataForParent);
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
        
        // Immediately propagate changes to parent for live updates and JSON download
        if (!readOnly && typeof onConfigChange === 'function') {
          const dataForParent = prepareDataForOnConfigChange(newData);
          console.log("[HeroBlock] Service icon changed. Calling onConfigChange immediately with:", dataForParent);
          onConfigChange(dataForParent);
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
      console.log('[HeroBlock] Component unmounting, cleaning up blob URLs');
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
  console.log("[HeroBlock] Preparing previewConfig. localData.styling:", localData.styling, "previewConfig.styling:", previewConfig.styling, "Actual desktopHeightVH for preview:", previewConfig.styling.desktopHeightVH);
  
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
        
        <div className="border-t border-gray-300 pt-6">
          <FontController
            currentData={processedData}
            onControlsChange={onControlsChange}
            fieldPrefix="textSettings"
            label="Service Text Settings"
          />
        </div>
      </div>
    ),
  };
};
