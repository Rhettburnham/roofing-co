import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home as DefaultHomeIcon, Building2 as DefaultWarehouseIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import IconSelectorModal from "../common/IconSelectorModal";

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
    const processedResidentialServices = (residential.subServices || []).map(
      (service) => {
        // Ensure service.title is used for display, and a stable original identifier for routes
        const originalIdentifier = service.originalTitle || service.title; // Fallback if originalTitle isn't there yet
        const actualServiceName = originalIdentifier.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, '');
        return {
          label: service.title, // This is the editable display title
          route: `/service/residential/${actualServiceName}`,
          id: service.id // Ensure id is carried over
        };
      }
    );
    const processedCommercialServices = (commercial.subServices || []).map(
      (service) => {
        const originalIdentifier = service.originalTitle || service.title;
        const urlTitle = originalIdentifier.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, '');
        return { 
          label: service.title, // This is the editable display title
          route: `/service/commercial/${urlTitle}`,
          id: service.id // Ensure id is carried over
        };
      }
    );
    setResidentialServices(processedResidentialServices);
    setCommercialServices(processedCommercialServices);
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
      y: -10, // Example: shift icon up a bit
      x: 0,     // Icon does not slide left in this revised columnar approach
      scale: 1.1,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    inactive: { x: 0, scale: 0.85, opacity: 0.6, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const textLabelAnimationVariants = {
    exit: { opacity: 0, x: 0, transition: { duration: 0.2, ease: "easeOut" } }, // Label fades out in place or slides subtly
    enter: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  // Variants for the sub-service column container
  const subServiceColumnVariants = {
    hidden: { opacity: 0, height: 0, y: -10, transition: { duration: 0.3, ease: "easeInOut", when: "afterChildren" } },
    visible: { 
      opacity: 1, 
      height: 'auto', // Animate to auto height
      y: 0, 
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
        className="w-1/2 h-full flex flex-col items-center justify-start pt-2 md:pt-4 cursor-pointer"
        onClick={handleSectionAreaClick}
      >
        {/* Icon and Main Label (Horizontal when neutral) */}
        <div className="flex items-center justify-center mb-2 md:mb-3 min-h-[40px] md:min-h-[50px]">
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
                className={serviceSectionTextBaseClass} // Restored class with ml for spacing
                variants={textLabelAnimationVariants}
                initial="exit" // Start from exit to animate in if becoming visible
                animate="enter"
                exit="exit"
              >
                {sectionLabel}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Sub-Services Column - Appears below the icon/label area when active */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className={`relative w-[90%] md:w-[85%] mt-1 rounded-lg shadow-xl overflow-hidden 
                          ${isPreviewReadOnly ? 'bg-transparent' : 'bg-second-accent/30'} // Subtle bg in edit mode for container
                        `}
              variants={subServiceColumnVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ pointerEvents: isActive ? 'auto' : 'none' }} 
            >
              <motion.ul className="flex flex-col items-center text-center p-2 space-y-1 md:space-y-1.5 text-sm md:text-base font-normal">
                {services.map((service, idx) => (
                  <motion.li
                    key={service.id || idx}
                    variants={subServiceItemVariants}
                    className={`whitespace-nowrap flex items-center justify-center group w-full py-0.5 md:py-1 rounded-md 
                                ${!isPreviewReadOnly ? 'hover:bg-white/10' : ''} // Hover effect for inputs
                              `}
                  >
                    {!isPreviewReadOnly ? (
                      <input
                        type="text"
                        value={service.label}
                        onChange={(e) => onServiceNameChange(type, service.id, e.target.value)}
                        className="py-1 px-2 bg-transparent text-white focus:bg-white/20 outline-none text-center w-auto max-w-[80%] text-sm md:text-base rounded-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <Link 
                        to={service.route} 
                        onClick={(e) => e.stopPropagation()} 
                        className="block py-0.5 text-white hover:underline"
                      >
                        {service.label}
                      </Link>
                    )}
                    {!isPreviewReadOnly && ( // Critical: Only show remove button if not in previewReadOnly mode
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveService(type, service.id); }}
                        className="ml-2 text-red-400 hover:text-red-300 opacity-50 group-hover:opacity-100 transition-opacity"
                        title="Remove Service"
                      >
                        <LucideIcons.MinusCircle size={14} />
                      </button>
                    )}
                  </motion.li>
                ))}
                {services.length === 0 && isActive && (
                  <motion.p
                    variants={subServiceItemVariants}
                    className="text-xs text-gray-400 italic py-1"
                  >
                    No services listed.
                  </motion.p>
                )}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
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
function HeroControlsPanel({ currentData, onControlsChange }) { 
  const {
    residential = { subServices: [], icon: 'Home', iconPack: 'lucide' },
    commercial = { subServices: [], icon: 'Building2', iconPack: 'lucide' },
    heroImage, 
    bannerColor,
    topBannerColor,
  } = currentData;

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingIconContext, setEditingIconContext] = useState({ type: null, currentPack: 'lucide', currentName: null });

  const [allResidentialServices, setAllResidentialServices] = useState([]);
  const [allCommercialServices, setAllCommercialServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);

  useEffect(() => {
    setIsServicesLoading(true);
    // Assuming combined_data.json is in public/data/raw_data/step_4/
    // Adjust path if necessary or use a more robust way to fetch if it's dynamic
    fetch("/data/raw_data/step_4/combined_data.json") 
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.hero?.residential?.subServices) {
          setAllResidentialServices(data.hero.residential.subServices.map((s, i) => ({ 
            id: s.slug || `res-${i}`, // Use slug as ID if available, otherwise generate
            title: s.title,
            originalTitle: s.title // Keep track of original title from data
          })));
        }
        if (data.hero?.commercial?.subServices) {
          setAllCommercialServices(data.hero.commercial.subServices.map((s, i) => ({ 
            id: s.slug || `com-${i}`, // Use slug as ID
            title: s.title,
            originalTitle: s.title
          })));
        }
        setIsServicesLoading(false);
      })
      .catch(error => {
        console.error("HeroControlsPanel: Error fetching services data:", error);
        setIsServicesLoading(false);
        // Optionally set empty arrays or some error state for services
        setAllResidentialServices([]);
        setAllCommercialServices([]);
      });
  }, []);

  const handleHeroImageUpload = (file) => {
    if (file) {
      // Revoke old blob URL if current heroImage is a blob
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

  const handleServiceToggle = (serviceType, serviceItem) => {
    const currentBlockSubServices = currentData[serviceType]?.subServices || [];
    const serviceIndex = currentBlockSubServices.findIndex(s => s.id === serviceItem.id);
    let newSubServices;

    if (serviceIndex > -1) { // Service is selected, so unselect it
      newSubServices = currentBlockSubServices.filter(s => s.id !== serviceItem.id);
    } else { // Service is not selected, so select it
      newSubServices = [
        ...currentBlockSubServices, 
        { 
          id: serviceItem.id, 
          title: serviceItem.originalTitle, // Add with original title initially
          originalTitle: serviceItem.originalTitle 
        }
      ];
    }
    onControlsChange({ 
      [serviceType]: { 
        ...(currentData[serviceType] || {}), // Preserve other properties like icon/iconPack
        icon: currentData[serviceType]?.icon || (serviceType === 'residential' ? 'Home' : 'Building2'),
        iconPack: currentData[serviceType]?.iconPack || 'lucide',
        subServices: newSubServices 
      } 
    });
  };

  const handleServiceTitleChange = (serviceType, serviceId, newTitle) => {
    const currentBlockSubServices = currentData[serviceType]?.subServices || [];
    const newSubServices = currentBlockSubServices.map(s => 
      s.id === serviceId ? { ...s, title: newTitle } : s
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
  
  const getSelectedService = (serviceType, serviceId) => {
    return currentData[serviceType]?.subServices?.find(s => s.id === serviceId);
  };

  const isServiceSelected = (serviceType, serviceItem) => 
    currentData[serviceType]?.subServices?.some(s => s.id === serviceItem.id) || false;

  const fileInputStyle = "w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer";

  const handleAddService = (serviceType) => {
    const newService = {
      id: `new-${serviceType}-${Date.now()}`, // Simple unique ID
      title: "New Service",
      originalTitle: "New Service"
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
          <input 
            type="color" 
            value={topBannerColor || "#FFFFFF"} 
            onChange={(e) => handleTopBannerColorChange(e.target.value)}
            className="w-full h-8 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs mb-1 font-medium text-gray-200">Bottom Banner Gradient Color:</label>
          <input 
            type="color" 
            value={bannerColor || "#1e293b"} 
            onChange={(e) => handleBannerColorChange(e.target.value)}
            className="w-full h-8 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-amber-400">Residential Services</h4>
            <button onClick={() => handleAddService('residential')} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded_md_focus_outline_none_focus_ring_2_focus_ring_blue_400">
              + Add
            </button>
          </div>
          {isServicesLoading ? <p className="text-gray-300 text-xs">Loading...</p> : (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 border border-gray-600 rounded-md p-2 bg-gray-700/50">
              {allResidentialServices.map(serviceItem => {
                const selectedService = getSelectedService("residential", serviceItem.id);
                const isSelected = !!selectedService;
                return (
                  <div key={serviceItem.id} className={`p-2 rounded-md flex items-center justify-between ${isSelected ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}>
                    <div className="flex-grow flex items-center">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => handleServiceToggle("residential", serviceItem)}
                        className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-0 cursor-pointer mr-3" 
                      />
                      {isSelected ? (
                        <input 
                          type="text"
                          value={selectedService.title}
                          onChange={(e) => handleServiceTitleChange("residential", serviceItem.id, e.target.value)}
                          className="text-sm bg-transparent border-b border-gray-500 focus:border-blue-400 outline-none w-full"
                        />
                      ) : (
                        <span className="text-sm cursor-pointer" onClick={() => handleServiceToggle("residential", serviceItem)}>
                          {serviceItem.title}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-amber-400">Commercial Services</h4>
            <button onClick={() => handleAddService('commercial')} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded_md_focus_outline_none_focus_ring_2_focus_ring_blue_400">
              + Add
            </button>
          </div>
          {isServicesLoading ? <p className="text-gray-300 text-xs">Loading...</p> : (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 border border-gray-600 rounded-md p-2 bg-gray-700/50">
              {allCommercialServices.map(serviceItem => {
                const selectedService = getSelectedService("commercial", serviceItem.id);
                const isSelected = !!selectedService;
                return (
                  <div key={serviceItem.id} className={`p-2 rounded-md flex items-center justify-between ${isSelected ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}>
                    <div className="flex-grow flex items-center">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => handleServiceToggle("commercial", serviceItem)}
                        className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-0 cursor-pointer mr-3"
                      />
                      {isSelected ? (
                        <input 
                          type="text"
                          value={selectedService.title}
                          onChange={(e) => handleServiceTitleChange("commercial", serviceItem.id, e.target.value)}
                          className="text-sm bg-transparent border-b border-gray-500 focus:border-blue-400 outline-none w-full"
                        />
                      ) : (
                        <span className="text-sm cursor-pointer" onClick={() => handleServiceToggle("commercial", serviceItem)}>
                          {serviceItem.title}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* {isIconModalOpen && ( // REMOVE IconSelectorModal instance from HeroControlsPanel
        <IconSelectorModal
          isOpen={isIconModalOpen}
          onClose={() => setIsIconModalOpen(false)}
          onIconSelect={handleIconSelection}
          currentIconPack={editingIconContext.currentPack}
          currentIconName={editingIconContext.currentName}
        />
      )} */}
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
}) {
  const [localData, setLocalData] = useState(() => {
    const initialConfig = heroconfig || {}; 
    let initialHeroImagePath = initialConfig.heroImage || "/assets/images/hero/hero_split_background.jpg";
    let initialHeroImageFile = initialConfig.heroImageFile || null;

    // If the initial heroImage from props is already a File object (e.g. from a previous non-saved state)
    // This situation should ideally be minimized by proper state flow, but as a safeguard:
    if (initialConfig.heroImage instanceof File) {
        initialHeroImageFile = initialConfig.heroImage;
        initialHeroImagePath = URL.createObjectURL(initialConfig.heroImage); // For preview
        // We don't have an "original path" if the prop itself is a File. 
        // This implies it's a new image not yet saved with a persistent path.
        // _heroImageOriginalPathFromProps would be undefined or null here.
    }
    
    // _heroImageOriginalPathFromProps should only store the string path from the props, not a blob.
    const originalPathFromProps = (typeof initialConfig.heroImage === 'string' && !initialConfig.heroImage.startsWith('blob:'))
        ? initialConfig.heroImage
        : (initialConfig._heroImageOriginalPathFromProps || null); // Fallback to prop if already processed

    return {
      residential: initialConfig.residential || { subServices: [], icon: 'Home', iconPack: 'lucide' },
      commercial: initialConfig.commercial || { subServices: [], icon: 'Building2', iconPack: 'lucide' },
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

        // Logic for heroImage, heroImageFile, and _heroImageOriginalPathFromProps updates
        if (heroconfig.heroImageFile instanceof File) { // Prop directly provides a new File
            if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
                URL.revokeObjectURL(prevLocalData.heroImage); // Revoke old local blob
            }
            newHeroImagePathForState = URL.createObjectURL(heroconfig.heroImageFile);
            newHeroImageFileForState = heroconfig.heroImageFile;
            // If a new file is provided via props, the original path to *replace* should come from heroconfig.originalUrl or current _heroImageOriginalPathFromProps
            newOriginalPathFromProps = heroconfig.originalUrl || prevLocalData._heroImageOriginalPathFromProps; 
        } else if (typeof heroconfig.heroImage === 'string') { // Prop provides a string path or blob
            if (heroconfig.heroImage.startsWith('blob:')) {
                // Prop is a blob. This usually means it's a reflection of a previous local change.
                // We should be cautious not to overwrite a newer local file with an older prop blob.
                // This scenario is tricky. If local has a file, and prop brings a blob, which one is newer?
                // Assuming prop change means to adopt it.
                if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:') && prevLocalData.heroImage !== heroconfig.heroImage) {
                    URL.revokeObjectURL(prevLocalData.heroImage);
                }
                newHeroImagePathForState = heroconfig.heroImage;
                newHeroImageFileForState = prevLocalData.heroImageFile; // Try to keep existing file if blob matches
                                                                      // Or, if prop is just a blob URL, file might be null.
                 if (heroconfig.heroImageFile) newHeroImageFileForState = heroconfig.heroImageFile;

            } else { // Prop is a string path (non-blob)
                if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
                    URL.revokeObjectURL(prevLocalData.heroImage); // Revoke old local blob if switching to path
                }
                newHeroImagePathForState = heroconfig.heroImage;
                newHeroImageFileForState = null; // Path means no local file object active for this path
                newOriginalPathFromProps = heroconfig.heroImage; // This IS the new original path
            }
        }
        // If heroconfig.heroImage is undefined, local state remains as is for image fields.

        const nextResSubServicesSource = heroconfig.residential?.subServices || prevLocalData.residential?.subServices;
        const nextResSubServices = (nextResSubServicesSource || []).map(s => ({
            id: s.id || s.slug, 
            title: s.title,
            originalTitle: s.originalTitle || s.title, 
        }));
        const nextResIcon = heroconfig.residential?.icon || prevLocalData.residential?.icon || 'Home';
        const nextResIconPack = heroconfig.residential?.iconPack || prevLocalData.residential?.iconPack || 'lucide';
        
        const nextComSubServicesSource = heroconfig.commercial?.subServices || prevLocalData.commercial?.subServices;
        const nextComSubServices = (nextComSubServicesSource || []).map(s => ({
            id: s.id || s.slug,
            title: s.title,
            originalTitle: s.originalTitle || s.title,
        }));
        const nextComIcon = heroconfig.commercial?.icon || prevLocalData.commercial?.icon || 'Building2';
        const nextComIconPack = heroconfig.commercial?.iconPack || prevLocalData.commercial?.iconPack || 'lucide';

        return {
          // Spread prevLocalData first to keep any other fields not explicitly managed
          ...prevLocalData, 
          // Then spread heroconfig to get most general updates from props
          ...heroconfig, 
          // Then specifically set the carefully merged/derived fields
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

      if (changedFields.heroImageFile && changedFields.heroImage) { // heroImage here is the new blob URL
        // If there was an old blob URL (from previous file upload in this session), revoke it
        if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
          URL.revokeObjectURL(prevLocalData.heroImage);
        }
        newHeroImage = changedFields.heroImage; // This is already a blob URL from HeroControlsPanel
        newHeroImageFile = changedFields.heroImageFile; // This is the File object
      } else if (changedFields.hasOwnProperty('heroImage') && !changedFields.heroImageFile) {
        // This case handles if heroImage is set to a path directly (e.g. reset to default)
        if (typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
          URL.revokeObjectURL(prevLocalData.heroImage);
        }
        newHeroImage = changedFields.heroImage;
        newHeroImageFile = null; // If image is set to a path, there's no corresponding file object
      }


      const updatedData = {
        ...prevLocalData,
        ...changedFields, 
        heroImage: newHeroImage,
        heroImageFile: newHeroImageFile,
      };
      
      // Ensure subServices always exist as arrays, even if changedFields tries to remove them
      if (!updatedData.residential || !Array.isArray(updatedData.residential.subServices)) {
        updatedData.residential = { ...(updatedData.residential || {}), subServices: [] };
      }
      if (!updatedData.commercial || !Array.isArray(updatedData.commercial.subServices)) {
        updatedData.commercial = { ...(updatedData.commercial || {}), subServices: [] };
      }


      if (onConfigChange) {
        // Prepare data for onConfigChange: send path if image is path, or keep blob for preview but send file for saving
        const dataForConfigChange = { ...updatedData };
        if (updatedData.heroImageFile) { // If a file was uploaded
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

  const handleOpenIconModalForService = (serviceType) => { // serviceType is 'residential' or 'commercial'
    const currentServiceSettings = localData[serviceType] || {};
    setEditingIconServiceType(serviceType); // Store which service's icon is being edited
    // Note: The modal in IconSelectorModal.jsx needs currentIconPack and currentIconName.
    // These will be derived from localData[serviceType].icon and localData[serviceType].iconPack
    setIsIconModalOpen(true);
  };

  const handleIconSelectionConfirm = (selectedPack, selectedIconName) => {
    if (editingIconServiceType) {
      handleControlsChange({
        [editingIconServiceType]: {
          ...(localData[editingIconServiceType] || {}), // Preserve other props like subServices
          icon: selectedIconName,
          iconPack: selectedPack,
        },
      });
    }
    setIsIconModalOpen(false);
    setEditingIconServiceType(null); // Reset
  };

  if (readOnly) {
    // Pass the original heroconfig, which might include a path or a blob URL if it came from an edited state
    return <HeroPreview heroconfig={heroconfig} />; 
  }

  const previewHandlers = {
    onServiceNameChange: (serviceType, serviceId, newTitle) => {
      handleControlsChange({
        [serviceType]: {
          ...(localData[serviceType] || {}),
          subServices: (localData[serviceType]?.subServices || []).map(s =>
            s.id === serviceId ? { ...s, title: newTitle } : s
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
    readOnly: false, // Explicitly pass false for HeroPreview when HeroBlock is editable
    onEditServiceIcon: handleOpenIconModalForService, // Pass the handler to HeroPreview
  };

  return (
    <>
      <HeroPreview heroconfig={{ ...localData, ...previewHandlers }} />
      <HeroControlsPanel 
        currentData={localData} 
        onControlsChange={handleControlsChange} 
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
