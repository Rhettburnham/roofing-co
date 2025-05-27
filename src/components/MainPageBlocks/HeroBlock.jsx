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
  if (typeof pathOrFile === 'string') return pathOrFile; // URL or path
  if (pathOrFile instanceof File) return URL.createObjectURL(pathOrFile); // File object
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

  const bannerStyles = {
    "--banner-color": heroconfig.bannerColor || "#1e293b",
    "--top-banner-color": heroconfig.topBannerColor || "#FFFFFF",
  };

  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);

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
          originalTitle: originalIdentifier // Ensure originalTitle is present
        };
      });
    };

    setResidentialServices(processSubServices(residential.subServices, 'residential'));
    setCommercialServices(processSubServices(commercial.subServices, 'commercial'));
  }, [residential.subServices, commercial.subServices]);

  const [activeSection, setActiveSection] = useState("neutral");

  // Props for inline editing, only relevant if HeroBlock's readOnly is false
  const { onServiceNameChange, onRemoveService, readOnly: isPreviewReadOnly, onEditServiceIcon } = heroconfig;

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
    hidden: { opacity: 0, y: -10 }, // Items slide in from top slightly
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
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
        className="w-1/2 h-full flex flex-col items-center justify-start pt-2 md:pt-4 cursor-pointer"
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
                className={`absolute left-[calc(100%_-_10px)] md:left-[calc(100%_-_5px)] top-1/2 transform -translate-y-1/2 flex items-center space-x-2 md:space-x-3
                            p-1 md:p-1.5 rounded-lg shadow-xl overflow-hidden 
                            ${isPreviewReadOnly ? 'bg-transparent' : 'bg-second-accent/20'} 
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
                    className={`whitespace-nowrap flex items-center justify-center group py-0.5 md:py-1 rounded-md 
                                ${!isPreviewReadOnly ? 'hover:bg-white/10 px-1.5 md:px-2' : 'px-1 md:px-1.5'}
                              `}
                  >
                    {!isPreviewReadOnly ? (
                      <input
                        type="text"
                        value={service.label} // Editable display title
                        onChange={(e) => onServiceNameChange(type, service.id, e.target.value)}
                        className="py-0.5 px-1 bg-transparent text-white focus:bg-white/20 outline-none text-center w-auto max-w-[100px] md:max-w-[120px] text-xs md:text-sm rounded-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <Link 
                        to={service.route} // Uses new slug-based route
                        onClick={(e) => e.stopPropagation()}
                        className="block py-0.5 text-white hover:underline text-xs md:text-sm"
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
                    className="text-xs text-gray-400 italic py-1 px-2"
                  >
                    No services.
                  </motion.p>
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
        className={`absolute top-[0vh] left-0 right-0 from-0% to-transparent pointer-events-none ${activeSection === "neutral" ? "h-[18vh] md:h-[18vh]" : "h-[10vh] md:h-[10vh]"}`} 
        style={{ 
          backgroundImage: `linear-gradient(to bottom, var(--top-banner-color) 0%, rgba(255,255,255,0) 100%)`,
          transition: "height 0.3s ease-out 0.4s", 
          zIndex: 1 
        }}
      />
      <div className="relative w-full h-[50vw] md:h-[45vh] overflow-hidden">
        {heroImage && (
          <motion.div
            className="absolute inset-0 h-full"
            style={{
              width: "130vw",
              left: "-15vw",
              backgroundImage: `url('${getDisplayPath(heroImage)}')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
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
        <div className="relative w-full h-full flex pt-[6vh] md:pt-[8vh] z-10"> {/* Adjusted top padding slightly */}
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
    residential = { subServices: [], icon: 'Home', iconPack: 'lucide' },
    commercial = { subServices: [], icon: 'Building2', iconPack: 'lucide' },
    heroImage, 
    bannerColor,
    topBannerColor,
  } = currentData;

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingIconContext, setEditingIconContext] = useState({ type: null, currentPack: 'lucide', currentName: null });

  // These will store all available services from services.json
  const [allAvailableResidentialServices, setAllAvailableResidentialServices] = useState([]);
  const [allAvailableCommercialServices, setAllAvailableCommercialServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);

  useEffect(() => {
    setIsServicesLoading(true);
    fetch("/data/ignore/services.json") 
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Extract main service page titles and map them for selection
        const mapServiceData = (serviceArray, type) => {
          return (serviceArray || []).map(servicePage => {
            const heroBlock = servicePage.blocks?.find(b => b.blockName === "HeroBlock");
            const title = heroBlock?.config?.title || servicePage.name || servicePage.title || `Service ${servicePage.id}`;
            const slug = slugify(title); // Use the same slugification
            // Ensure a more unique key for the panel's list items
            const uniqueKeyForPanel = `available-service-${type}-${servicePage.id || slug}`;
            return {
              id: uniqueKeyForPanel, // Use this more unique key for the list rendering
              slug: slug, // Keep the original slug for matching/logic if needed elsewhere
              title: title, 
              originalTitle: title, 
            };
          });
        };

        if (data.residential) {
          setAllAvailableResidentialServices(mapServiceData(data.residential, 'residential'));
        }
        if (data.commercial) {
          setAllAvailableCommercialServices(mapServiceData(data.commercial, 'commercial'));
        }
        setIsServicesLoading(false);
      })
      .catch(error => {
        console.error("HeroControlsPanel: Error fetching services data from services.json:", error);
        setIsServicesLoading(false);
        setAllAvailableResidentialServices([]);
        setAllAvailableCommercialServices([]);
      });
  }, []);

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

  // This toggles selection of services to be displayed in the HeroPreview
  const handleServiceToggle = (serviceType, serviceItemFromPanel) => {
    const currentBlockSubServices = currentData[serviceType]?.subServices || [];
    // serviceItemFromPanel.id is the uniqueKeyForPanel. We need to match based on its original slug.
    const serviceIndex = currentBlockSubServices.findIndex(s => slugify(s.originalTitle || s.title) === serviceItemFromPanel.slug);
    let newSubServices;

    if (serviceIndex > -1) { // Service is selected, so unselect it
      newSubServices = currentBlockSubServices.filter(s => slugify(s.originalTitle || s.title) !== serviceItemFromPanel.slug);
    } else { // Service is not selected, so select it
      newSubServices = [
        ...currentBlockSubServices, 
        { 
          id: serviceItemFromPanel.slug, // Store the slug as the ID for the subService item
          title: serviceItemFromPanel.originalTitle, 
          originalTitle: serviceItemFromPanel.originalTitle 
        }
      ];
    }
    onControlsChange({ 
      [serviceType]: { 
        ...(currentData[serviceType] || {}),
        icon: currentData[serviceType]?.icon || (serviceType === 'residential' ? 'Home' : 'Building2'),
        iconPack: currentData[serviceType]?.iconPack || 'lucide',
        subServices: newSubServices 
      } 
    });
  };

  // This handles changes to the *display title* of an already selected service in the HeroPreview
  // It is called from HeroPreview, and then needs to be reflected back to HeroControlsPanel if necessary,
  // but primarily updates localData for HeroPreview.
  const handleServiceTitleChange = (serviceType, serviceId, newTitle) => {
    // serviceId here is the slug (or generated ID for new services) from HeroPreview's subService item.
    const currentBlockSubServices = currentData[serviceType]?.subServices || [];
    const newSubServices = currentBlockSubServices.map(s => 
      s.id === serviceId ? { ...s, title: newTitle } : s // Update display title
    );
    onControlsChange({ 
      [serviceType]: { 
        ...(currentData[serviceType] || {}),
        icon: currentData[serviceType]?.icon || (serviceType === 'residential' ? 'Home' : 'Building2'),
        iconPack: currentData[serviceType]?.iconPack || 'lucide',
        subServices: newSubServices 
      } 
    });
  };
  
  // Gets a service from the *currently selected subServices* in HeroPreview's data
  const getSelectedSubServiceForEditing = (serviceType, serviceIdFromPreview) => {
    return currentData[serviceType]?.subServices?.find(s => s.id === serviceIdFromPreview);
  };

  // Checks if a service from the *available services list (from services.json)* is currently selected
  const isServiceSelected = (serviceType, serviceItemFromPanel) => {
    // serviceItemFromPanel.id is uniqueKeyForPanel. Match using serviceItemFromPanel.slug
    return currentData[serviceType]?.subServices?.some(s => slugify(s.originalTitle || s.title) === serviceItemFromPanel.slug) || false;
  }

  const fileInputStyle = "w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer";

  // This adds a *new custom service* to the HeroPreview, not one from services.json
  const handleAddCustomService = (serviceType) => {
    const newService = {
      id: `custom-${serviceType}-${Date.now()}`, // Unique ID for custom service
      title: "New Custom Service",
      originalTitle: "New Custom Service" // Ensure originalTitle is set
    };
    const currentSubServices = currentData[serviceType]?.subServices || [];
    onControlsChange({
      [serviceType]: {
        ...(currentData[serviceType] || {}),
        icon: currentData[serviceType]?.icon || (serviceType === 'residential' ? 'Home' : 'Building2'),
        iconPack: currentData[serviceType]?.iconPack || 'lucide',
        subServices: [...currentSubServices, newService]
      }
    });
  };

  return (
    <div className="bg-gray-800 text-white p-3 rounded-lg mt-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-center border-b border-gray-600 pb-2 text-gray-100">Edit Hero Background & Services</h3>
      
      <div className="mb-4">
        <label className="block text-xs mb-1 font-medium text-gray-200">Hero Background Image:</label>
        <input type="file" accept="image/*" onChange={(e) => handleHeroImageUpload(e.target.files?.[0])} className={fileInputStyle} />
        {getDisplayPath(heroImage) && <img src={getDisplayPath(heroImage)} alt="Hero Background Preview" className="mt-2 h-20 w-full object-cover rounded bg-gray-700 p-1" />}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs mb-1 font-medium text-gray-200">Top Banner Gradient Color:</label>
          <ThemeColorPicker
            label=""
            currentColorValue={topBannerColor || "#FFFFFF"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) => handleTopBannerColorChange(value)}
            fieldName="topBannerColor"
            className="mt-0" // Remove internal label margins if label prop is empty
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs mb-1 font-medium text-gray-200">Bottom Banner Gradient Color:</label>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-amber-400">Available Residential Services (from services.json)</h4>
            {/* Add custom service button for residential */}
             <button onClick={() => handleAddCustomService('residential')} className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded_md_focus_outline_none_focus_ring_2_focus_ring_green_400 ml-2">
              + Add Custom
            </button>
          </div>
          {isServicesLoading ? <p className="text-gray-300 text-xs">Loading available services...</p> : (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 border border-gray-600 rounded-md p-2 bg-gray-700/50">
              {allAvailableResidentialServices.map(serviceItem => {
                // serviceItem.id is the slug, serviceItem.title is the display name from services.json
                const isSelected = isServiceSelected("residential", serviceItem);
                const subServiceForEditing = isSelected ? getSelectedSubServiceForEditing("residential", serviceItem.slug) : null;

                return (
                  <div key={serviceItem.id} className={`p-2 rounded-md flex items-center justify-between ${isSelected ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}>
                    <div className="flex-grow flex items-center">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => handleServiceToggle("residential", serviceItem)} // serviceItem here has .id (slug) and .originalTitle
                        className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-0 cursor-pointer mr-3" 
                      />
                      {isSelected && subServiceForEditing ? (
                        <span className="text-sm text-white">{subServiceForEditing.title}</span>
                      ) : (
                        <span className="text-sm cursor-pointer text-gray-300" onClick={() => handleServiceToggle("residential", serviceItem)}>
                          {serviceItem.title} {/* Display title from services.json */}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {allAvailableResidentialServices.length === 0 && !isServicesLoading && <p className="text-xs text-gray-400 italic">No services found in services.json.</p>}
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-amber-400">Available Commercial Services (from services.json)</h4>
            {/* Add custom service button for commercial */}
            <button onClick={() => handleAddCustomService('commercial')} className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded_md_focus_outline_none_focus_ring_2_focus_ring_green_400 ml-2">
              + Add Custom
            </button>
          </div>
          {isServicesLoading ? <p className="text-gray-300 text-xs">Loading available services...</p> : (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 border border-gray-600 rounded-md p-2 bg-gray-700/50">
              {allAvailableCommercialServices.map(serviceItem => {
                const isSelected = isServiceSelected("commercial", serviceItem);
                const subServiceForEditing = isSelected ? getSelectedSubServiceForEditing("commercial", serviceItem.slug) : null;

                return (
                  <div key={serviceItem.id} className={`p-2 rounded-md flex items-center justify-between ${isSelected ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}>
                    <div className="flex-grow flex items-center">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => handleServiceToggle("commercial", serviceItem)}
                        className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-0 cursor-pointer mr-3"
                      />
                      {isSelected && subServiceForEditing ? (
                         <span className="text-sm text-white">{subServiceForEditing.title}</span>
                      ) : (
                        <span className="text-sm cursor-pointer text-gray-300" onClick={() => handleServiceToggle("commercial", serviceItem)}>
                          {serviceItem.title}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {allAvailableCommercialServices.length === 0 && !isServicesLoading && <p className="text-xs text-gray-400 italic">No services found in services.json.</p>}
            </div>
          )}
        </div>
      </div>
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
  heroconfig, 
  readOnly = false,
  onConfigChange,
  themeColors, // Accept themeColors
}) {
  const [localData, setLocalData] = useState(() => {
    const initialConfig = heroconfig || {}; 
    let initialHeroImagePath = initialConfig.heroImage || "/assets/images/hero/hero_split_background.jpg";
    let initialHeroImageFile = initialConfig.heroImageFile || null;

    if (initialConfig.heroImage instanceof File) {
        initialHeroImageFile = initialConfig.heroImage;
        initialHeroImagePath = URL.createObjectURL(initialConfig.heroImage); 
    }
    
    const originalPathFromProps = (typeof initialConfig.heroImage === 'string' && !initialConfig.heroImage.startsWith('blob:'))
        ? initialConfig.heroImage
        : (initialConfig._heroImageOriginalPathFromProps || null); 

    // Ensure subServices always have originalTitle for consistent slug generation
    const ensureOriginalTitle = (subServices) => {
      return (subServices || []).map(s => ({
        ...s,
        originalTitle: s.originalTitle || s.title // Fallback if originalTitle is missing
      }));
    };

    return {
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
      heroImage: initialHeroImagePath, 
      heroImageFile: initialHeroImageFile, 
      _heroImageOriginalPathFromProps: originalPathFromProps,
      bannerColor: initialConfig.bannerColor || "#1e293b",
      topBannerColor: initialConfig.topBannerColor || "#FFFFFF",
    };
  });

  // State for IconSelectorModal, now managed by HeroBlock
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingIconServiceType, setEditingIconServiceType] = useState(null); // 'residential' or 'commercial'

  useEffect(() => {
    if (heroconfig) {
      setLocalData(prevLocalData => {
        let newHeroImagePathForState = prevLocalData.heroImage;
        let newHeroImageFileForState = prevLocalData.heroImageFile;
        let newOriginalPathFromProps = prevLocalData._heroImageOriginalPathFromProps;

        if (heroconfig.heroImageFile instanceof File) { 
            if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
                URL.revokeObjectURL(prevLocalData.heroImage); 
            }
            newHeroImagePathForState = URL.createObjectURL(heroconfig.heroImageFile);
            newHeroImageFileForState = heroconfig.heroImageFile;
            newOriginalPathFromProps = heroconfig.originalUrl || prevLocalData._heroImageOriginalPathFromProps; 
        } else if (typeof heroconfig.heroImage === 'string') { 
            if (heroconfig.heroImage.startsWith('blob:')) {
                if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:') && prevLocalData.heroImage !== heroconfig.heroImage) {
                    URL.revokeObjectURL(prevLocalData.heroImage);
                }
                newHeroImagePathForState = heroconfig.heroImage;
                newHeroImageFileForState = prevLocalData.heroImageFile; 
                 if (heroconfig.heroImageFile) newHeroImageFileForState = heroconfig.heroImageFile;

            } else { 
                if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
                    URL.revokeObjectURL(prevLocalData.heroImage); 
                }
                newHeroImagePathForState = heroconfig.heroImage;
                newHeroImageFileForState = null; 
                newOriginalPathFromProps = heroconfig.heroImage; 
            }
        }

        const ensureOriginalTitleInEffect = (subServices) => {
            return (subServices || []).map(s => ({
                ...s,
                id: s.id || slugify(s.originalTitle || s.title), // Ensure ID exists, can be slug
                originalTitle: s.originalTitle || s.title, // Fallback
            }));
        };
        
        const nextResSubServicesSource = heroconfig.residential?.subServices || prevLocalData.residential?.subServices;
        const nextResSubServices = ensureOriginalTitleInEffect(nextResSubServicesSource);
        const nextResIcon = heroconfig.residential?.icon || prevLocalData.residential?.icon || 'Home';
        const nextResIconPack = heroconfig.residential?.iconPack || prevLocalData.residential?.iconPack || 'lucide';
        
        const nextComSubServicesSource = heroconfig.commercial?.subServices || prevLocalData.commercial?.subServices;
        const nextComSubServices = ensureOriginalTitleInEffect(nextComSubServicesSource);
        const nextComIcon = heroconfig.commercial?.icon || prevLocalData.commercial?.icon || 'Building2';
        const nextComIconPack = heroconfig.commercial?.iconPack || prevLocalData.commercial?.iconPack || 'lucide';

        return {
          ...prevLocalData, 
          ...heroconfig, 
          residential: { subServices: nextResSubServices, icon: nextResIcon, iconPack: nextResIconPack },
          commercial: { subServices: nextComSubServices, icon: nextComIcon, iconPack: nextComIconPack },
          heroImage: newHeroImagePathForState,
          heroImageFile: newHeroImageFileForState,
          _heroImageOriginalPathFromProps: newOriginalPathFromProps,
          bannerColor: heroconfig.bannerColor !== undefined ? heroconfig.bannerColor : (prevLocalData.bannerColor || "#1e293b"),
          topBannerColor: heroconfig.topBannerColor !== undefined ? heroconfig.topBannerColor : (prevLocalData.topBannerColor || "#FFFFFF"),
        };
      });
    }
  }, [heroconfig]);

  const handleControlsChange = (changedFields) => {
    setLocalData(prevLocalData => {
      let newHeroImage = prevLocalData.heroImage;
      let newHeroImageFile = prevLocalData.heroImageFile;

      if (changedFields.heroImageFile && changedFields.heroImage) { 
        if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
          URL.revokeObjectURL(prevLocalData.heroImage);
        }
        newHeroImage = changedFields.heroImage; 
        newHeroImageFile = changedFields.heroImageFile; 
      } else if (changedFields.hasOwnProperty('heroImage') && !changedFields.heroImageFile) {
        if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
          URL.revokeObjectURL(prevLocalData.heroImage);
        }
        newHeroImage = changedFields.heroImage;
        newHeroImageFile = null; 
      }

      const updatedData = {
        ...prevLocalData,
        ...changedFields, 
        heroImage: newHeroImage,
        heroImageFile: newHeroImageFile,
      };
      
      const ensureOriginalTitleAndId = (subServices) => {
        return (subServices || []).map(s => ({
          ...s,
          id: s.id || slugify(s.originalTitle || s.title), // Crucial for linking selection to preview item
          originalTitle: s.originalTitle || s.title
        }));
      };

      if (changedFields.residential?.subServices) {
        updatedData.residential = {
          ...(prevLocalData.residential || {}),
          ...(changedFields.residential || {}),
          subServices: ensureOriginalTitleAndId(changedFields.residential.subServices)
        };
      }
      if (changedFields.commercial?.subServices) {
        updatedData.commercial = {
          ...(prevLocalData.commercial || {}),
          ...(changedFields.commercial || {}),
          subServices: ensureOriginalTitleAndId(changedFields.commercial.subServices)
        };
      }

      if (onConfigChange) {
        const dataForConfigChange = { ...updatedData };
        if (updatedData.heroImageFile) { 
          dataForConfigChange.originalUrl = localData._heroImageOriginalPathFromProps;
          console.log(
            'HeroBlock: Preparing onConfigChange with File:',
            '\n  Uploaded File Name:', updatedData.heroImageFile.name,
            '\n  Uploaded File Size:', updatedData.heroImageFile.size,
            '\n  Intended Original URL to replace:', dataForConfigChange.originalUrl,
            '\n  Display heroImage (blob URL):', updatedData.heroImage 
          );
        } else {
          console.log(
            'HeroBlock: Preparing onConfigChange (no new file uploaded):',
            '\n  Display heroImage (path):', updatedData.heroImage,
            '\n  Original Path from Props cache:', localData._heroImageOriginalPathFromProps
          );
        }
        onConfigChange(dataForConfigChange);
      }
      return updatedData;
    });
  };

  const handleOpenIconModalForService = (serviceType) => { 
    const currentServiceSettings = localData[serviceType] || {};
    setEditingIconServiceType(serviceType); 
    setIsIconModalOpen(true);
  };

  const handleIconSelectionConfirm = (selectedPack, selectedIconName) => {
    if (editingIconServiceType) {
      handleControlsChange({
        [editingIconServiceType]: {
          ...(localData[editingIconServiceType] || {}), 
          icon: selectedIconName,
          iconPack: selectedPack,
        },
      });
    }
    setIsIconModalOpen(false);
    setEditingIconServiceType(null); 
  };

  if (readOnly) {
    return <HeroPreview heroconfig={{ ...(heroconfig || {}), readOnly: true }} />;
  }

  // These handlers are passed to HeroPreview for its inline editing capabilities.
  const previewHandlers = {
    onServiceNameChange: (serviceType, serviceId, newTitle) => {
      // serviceId here is the unique ID (slug or custom generated) of the subService item in HeroPreview
      handleControlsChange({
        [serviceType]: {
          ...(localData[serviceType] || {}),
          subServices: (localData[serviceType]?.subServices || []).map(s =>
            s.id === serviceId ? { ...s, title: newTitle } : s // Update display title
          ),
        },
      });
    },
    onRemoveService: (serviceType, serviceId) => {
      handleControlsChange({
        [serviceType]: {
          ...(localData[serviceType] || {}),
          subServices: (localData[serviceType]?.subServices || []).filter(s => s.id !== serviceId),
        },
      });
    },
    readOnly: false, 
    onEditServiceIcon: handleOpenIconModalForService, 
  };

  return (
    <>
      <HeroPreview heroconfig={{ ...localData, ...previewHandlers }} />
      <HeroControlsPanel 
        currentData={localData} 
        onControlsChange={handleControlsChange} 
        themeColors={themeColors} // Pass themeColors to HeroControlsPanel
      />
      {isIconModalOpen && editingIconServiceType && (
        <IconSelectorModal
          isOpen={isIconModalOpen}
          onClose={() => {
            setIsIconModalOpen(false);
            setEditingIconServiceType(null);
          }}
          onIconSelect={handleIconSelectionConfirm}
          currentIconPack={localData[editingIconServiceType]?.iconPack || 'lucide'}
          currentIconName={localData[editingIconServiceType]?.icon}
        />
      )}
    </>
  );
}
