import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
    "--banner-color": heroconfig.bannerColor || "#1e293b", // Use from config or default
  };

  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);

  const {
    residential = { subServices: [], icon: 'Home', iconPack: 'lucide' },
    commercial = { subServices: [], icon: 'Building2', iconPack: 'lucide' },
    heroImage, 
  } = heroconfig;

  useEffect(() => {
    const processedResidentialServices = residential.subServices.map(
      (service) => {
        const originalTitle = service.title;
        // const lowercaseTitle = originalTitle.toLowerCase();
        // let actualServiceName = lowercaseTitle;
        // if (lowercaseTitle === "siding") actualServiceName = "chimney";
        // else if (lowercaseTitle === "chimney") actualServiceName = "guttering";
        // else if (lowercaseTitle === "repairs") actualServiceName = "skylights";
        // Keep original title for route generation for now, ensure it's URL friendly
        const actualServiceName = originalTitle.toLowerCase().replace(/\\s+/g, "-").replace(/[^a-z0-9-]/g, '');

        return {
          label: originalTitle,
          route: `/service/residential/${actualServiceName}`,
        };
      }
    );
    const processedCommercialServices = commercial.subServices.map(
      (service) => {
        const urlTitle = service.title.toLowerCase().replace(/\\s+/g, "-").replace(/[^a-z0-9-]/g, '');
        return { label: service.title, route: `/service/commercial/${urlTitle}` };
      }
    );
    setResidentialServices(processedResidentialServices);
    setCommercialServices(processedCommercialServices);
  }, [residential.subServices, commercial.subServices]);

  const [activeSection, setActiveSection] = useState("neutral");

  const iconVariants = { 
    active: { opacity: 0.7, y: -10, transition: { duration: 0.3 }}, 
    default: { opacity: 1, y: 0, transition: { duration: 0.3 }}
  };
  
  const listVariants = { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2, duration: 0.3 } }
  };
  
  const itemVariants = { 
    hidden: { opacity: 0, x: -30 }, 
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" }}
  };

  const boxVariants = {
    hidden: { opacity: 0, height: 0, y: -10, transition: { duration: 0.3, ease: "easeInOut", when: "afterChildren" } },
    visible: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.4, ease: "easeInOut", when: "beforeChildren" } }
  };

  const getDisplayPath = (pathOrBlob) => (pathOrBlob && typeof pathOrBlob === 'string') ? pathOrBlob : (pathOrBlob instanceof File ? URL.createObjectURL(pathOrBlob) : '');


  return (
    <section className="relative overflow-y-hidden" style={bannerStyles}>
      <div className={`absolute top-[0vh] left-0 right-0 bg-gradient-to-b from-white from-0% to-transparent pointer-events-none ${activeSection === "neutral" ? "h-[18vh] md:h-[18vh]" : "h-[10vh] md:h-[10vh]"}`} style={{ transition: "height 0.3s ease-out 0.4s", zIndex: 1 }}/>
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
        <div className="relative w-full h-full flex pt-[8vh] md:pt-[10vh] z-10">
          {/* Residential Section */}
          <div className="w-1/2 h-full cursor-pointer flex flex-col items-center justify-start" onClick={() => setActiveSection(prev => prev === "residential" ? "neutral" : "residential")}>
            <div className="flex flex-col items-center pointer-events-auto">
              <motion.div variants={iconVariants} animate={activeSection === "residential" ? "active" : "default"} className="mb-1 md:mb-2 text-gray-50 w-[6.5vw] h-[6.5vw] md:w-[60px] md:h-[60px] flex items-center justify-center drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,0.7)]">
                {renderDynamicIcon(residential.iconPack, residential.icon, DefaultHomeIcon)}
              </motion.div>
              
              <motion.div
                className={`relative w-[90%] md:w-[80%] bg-second-accent text-banner rounded-lg shadow-lg overflow-hidden ${activeSection === "residential" ? "pointer-events-auto" : "pointer-events-none"}`}
                variants={boxVariants}
                initial="hidden"
                animate={activeSection === "residential" ? "visible" : "hidden"}
              >
                <div className="p-3 md:p-4">
                  <h2 className="text-lg md:text-xl font-semibold text-center mb-2">Residential</h2>
                  {activeSection === "residential" && (
                    <motion.ul variants={listVariants} initial="hidden" animate="visible" className="text-center -space-y-1 md:space-y-0 text-sm md:text-base font-normal">
                      {residentialServices.map((service, idx) => (
                        <motion.li key={idx} variants={itemVariants} className="whitespace-nowrap">
                          <Link to={service.route} onClick={(e) => e.stopPropagation()} className="block py-1 rounded hover:underline">
                            {service.label}
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
          {/* Commercial Section */}
          <div className="w-1/2 h-full cursor-pointer flex flex-col items-center justify-start" onClick={() => setActiveSection(prev => prev === "commercial" ? "neutral" : "commercial")}>
            <div className="flex flex-col items-center pointer-events-auto">
              <motion.div variants={iconVariants} animate={activeSection === "commercial" ? "active" : "default"} className="mb-1 md:mb-2 text-gray-50 w-[6.5vw] h-[6.5vw] md:w-[60px] md:h-[60px] flex items-center justify-center drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,0.7)]">
                {renderDynamicIcon(commercial.iconPack, commercial.icon, DefaultWarehouseIcon)}
              </motion.div>

              <motion.div
                className={`relative w-[90%] md:w-[80%] bg-second-accent text-banner rounded-lg shadow-lg overflow-hidden ${activeSection === "commercial" ? "pointer-events-auto" : "pointer-events-none"}`}
                variants={boxVariants}
                initial="hidden"
                animate={activeSection === "commercial" ? "visible" : "hidden"}
              >
                <div className="p-3 md:p-4">
                  <h2 className="text-lg md:text-xl font-semibold text-center mb-2">Commercial</h2>
                  {activeSection === "commercial" && (
                    <motion.ul variants={listVariants} initial="hidden" animate="visible" className="text-center -space-y-1 md:space-y-0 text-sm md:text-base font-normal">
                      {commercialServices.map((service, idx) => (
                        <motion.li key={idx} variants={itemVariants} className="whitespace-nowrap">
                          <Link to={service.route} onClick={(e) => e.stopPropagation()} className="block py-1 rounded hover:underline">
                            {service.label}
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-t from-banner from-10% to-transparent ${activeSection === "neutral" ? "h-[15vh] md:h-[18vh]" : "h-[9vh] md:h-[10vh]"}`} style={{ transition: "height 0.3s ease-out 0.4s", zIndex: 1 }}/>
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
  } = currentData;

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingIconContext, setEditingIconContext] = useState({ type: null, currentPack: 'lucide', currentName: null });

  const [allResidentialServices, setAllResidentialServices] = useState([]);
  const [allCommercialServices, setAllCommercialServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);

  // Helper to get display path for image previews
  const getDisplayPath = (pathOrFile) => {
    if (!pathOrFile) return '';
    if (typeof pathOrFile === 'string') return pathOrFile; // URL or path
    if (pathOrFile instanceof File) return URL.createObjectURL(pathOrFile); // File object
    return '';
  };
  
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
          setAllResidentialServices(data.hero.residential.subServices.map((s, i) => ({ id: `res-${i}`, title: s.title })));
        }
        if (data.hero?.commercial?.subServices) {
          setAllCommercialServices(data.hero.commercial.subServices.map((s, i) => ({ id: `com-${i}`, title: s.title })));
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

  const openIconSelectionModal = (type) => {
    const currentSettings = currentData[type] || {};
    setEditingIconContext({ 
      type: type, 
      currentPack: currentSettings.iconPack || 'lucide', 
      currentName: currentSettings.icon 
    });
    setIsIconModalOpen(true);
  };

  const handleIconSelection = (pack, name) => {
    if (editingIconContext.type) {
      onControlsChange({
        [editingIconContext.type]: {
          // Spread existing subServices and other properties for the type
          ...(currentData[editingIconContext.type] || {}),
          subServices: currentData[editingIconContext.type]?.subServices || [], 
          icon: name,
          iconPack: pack,
        },
      });
    }
    setIsIconModalOpen(false);
  };

  const handleServiceToggle = (serviceType, serviceItem) => {
    const currentBlockSubServices = currentData[serviceType]?.subServices || [];
    const isSelected = currentBlockSubServices.some(s => s.title === serviceItem.title);
    let newSubServices = isSelected 
      ? currentBlockSubServices.filter(s => s.title !== serviceItem.title)
      : [...currentBlockSubServices, { title: serviceItem.title }]; // Storing only title as per original logic
    onControlsChange({ [serviceType]: { ...currentData[serviceType], subServices: newSubServices } });
  };

  const isServiceSelected = (serviceType, serviceItem) => 
    currentData[serviceType]?.subServices?.some(s => s.title === serviceItem.title) || false;

  const fileInputStyle = "w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer";

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mt-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center border-b border-gray-700 pb-2">Edit Hero Background & Services</h3>
      
      <div className="mb-6">
        <label className="block text-sm mb-1 font-medium text-gray-300">Hero Background Image:</label>
        <input type="file" accept="image/*" onChange={(e) => handleHeroImageUpload(e.target.files?.[0])} className={fileInputStyle} />
        {getDisplayPath(heroImage) && <img src={getDisplayPath(heroImage)} alt="Hero Background Preview" className="mt-2 h-24 w-full object-cover rounded bg-gray-700 p-1" />}
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1 font-medium text-gray-300">Banner Gradient Color (bottom overlay):</label>
        <input 
          type="color" 
          value={bannerColor || "#1e293b"} 
          onChange={(e) => handleBannerColorChange(e.target.value)}
          className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
        />
      </div>
      
      {/* Icon Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-300">Residential Section Icon:</label>
          <button 
            type="button"
            onClick={() => openIconSelectionModal('residential')} 
            className="bg-gray-700 hover:bg-gray-600 text-sm p-2 rounded w-full flex items-center justify-between"
          >
            <span className="truncate">{residential.iconPack}/{residential.icon}</span>
            <div className="w-5 h-5 flex-shrink-0">
              {renderDynamicIcon(residential.iconPack, residential.icon, DefaultHomeIcon, { className: "w-full h-full"})}
            </div>
          </button>
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-300">Commercial Section Icon:</label>
          <button 
            type="button"
            onClick={() => openIconSelectionModal('commercial')} 
            className="bg-gray-700 hover:bg-gray-600 text-sm p-2 rounded w-full flex items-center justify-between"
          >
            <span className="truncate">{commercial.iconPack}/{commercial.icon}</span>
            <div className="w-5 h-5 flex-shrink-0">
             {renderDynamicIcon(commercial.iconPack, commercial.icon, DefaultWarehouseIcon, { className: "w-full h-full"})}
            </div>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-semibold mb-2 text-amber-300">Select Residential Services</h4>
          {isServicesLoading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border border-gray-700 rounded-md p-3 bg-gray-900">
              {allResidentialServices.map(service => (
                <div key={service.id} className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${isServiceSelected("residential", service) ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`} onClick={() => handleServiceToggle("residential", service)}>
                  <span className="text-sm">{service.title}</span>
                  <input type="checkbox" checked={isServiceSelected("residential", service)} readOnly className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-0 cursor-pointer" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-md font-semibold mb-2 text-amber-300">Select Commercial Services</h4>
          {isServicesLoading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border border-gray-700 rounded-md p-3 bg-gray-900">
              {allCommercialServices.map(service => (
                <div key={service.id} className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${isServiceSelected("commercial", service) ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`} onClick={() => handleServiceToggle("commercial", service)}>
                  <span className="text-sm">{service.title}</span>
                  <input type="checkbox" checked={isServiceSelected("commercial", service)} readOnly className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-0 cursor-pointer" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isIconModalOpen && (
        <IconSelectorModal
          isOpen={isIconModalOpen}
          onClose={() => setIsIconModalOpen(false)}
          onIconSelect={handleIconSelection}
          currentIconPack={editingIconContext.currentPack}
          currentIconName={editingIconContext.currentName}
        />
      )}
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
    const initialConfig = heroconfig || {}; // heroconfig is prop, could be undefined initially
    return {
      residential: initialConfig.residential || { subServices: [], icon: 'Home', iconPack: 'lucide' },
      commercial: initialConfig.commercial || { subServices: [], icon: 'Building2', iconPack: 'lucide' },
      heroImage: initialConfig.heroImage || "/assets/images/hero/hero_split_background.jpg",
      heroImageFile: initialConfig.heroImageFile || null, // Use file from initialConfig if present
      bannerColor: initialConfig.bannerColor || "#1e293b",
    };
  });

  useEffect(() => {
    if (heroconfig) {
      setLocalData(prevLocalData => {
        const isNewImage = heroconfig.heroImage !== prevLocalData.heroImage;
        if (isNewImage && typeof prevLocalData.heroImage === 'string' && prevLocalData.heroImage.startsWith('blob:')) {
          URL.revokeObjectURL(prevLocalData.heroImage);
        }

        // Ensure subServices are preserved if not in heroconfig, and icon/iconPack are updated
        const updatedResidential = {
          subServices: heroconfig.residential?.subServices || prevLocalData.residential?.subServices || [],
          icon: heroconfig.residential?.icon || prevLocalData.residential?.icon || 'Home',
          iconPack: heroconfig.residential?.iconPack || prevLocalData.residential?.iconPack || 'lucide',
        };
        const updatedCommercial = {
          subServices: heroconfig.commercial?.subServices || prevLocalData.commercial?.subServices || [],
          icon: heroconfig.commercial?.icon || prevLocalData.commercial?.icon || 'Building2',
          iconPack: heroconfig.commercial?.iconPack || prevLocalData.commercial?.iconPack || 'lucide',
        };

        return {
          ...prevLocalData, // Keep other fields from prevLocalData if not in heroconfig
          ...heroconfig,    // Overlay with all heroconfig fields
          residential: updatedResidential,
          commercial: updatedCommercial,
          heroImage: heroconfig.heroImage || prevLocalData.heroImage || "/assets/images/hero/hero_split_background.jpg",
          heroImageFile: heroconfig.heroImageFile !== undefined ? heroconfig.heroImageFile : prevLocalData.heroImageFile,
          bannerColor: heroconfig.bannerColor !== undefined ? heroconfig.bannerColor : prevLocalData.bannerColor || "#1e293b",
        };
      });
    }
    // No 'else' part: if heroconfig is null/undefined, localData remains as is,
    // or relies on initial useState if this is the very first effect run with undefined heroconfig.
    // The useState initializer should ensure a valid default state.
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
      
      if (onConfigChange) {
        // Prepare data for onConfigChange: send path if image is path, or keep blob for preview but send file for saving
        const dataForConfigChange = { ...updatedData };
        if (updatedData.heroImageFile) { // If a file was uploaded
          // For config change, we might want to signal that there's a new file to be uploaded.
          // The actual file object `heroImageFile` is already in `updatedData`.
          // `heroImage` (the blob URL) is fine for `localData` for preview.
        }
        onConfigChange(dataForConfigChange);
      }
      return updatedData;
    });
  };

  if (readOnly) {
    // Pass the original heroconfig, which might include a path or a blob URL if it came from an edited state
    return <HeroPreview heroconfig={heroconfig} />; 
  }

  return (
    <>
      <HeroPreview heroconfig={localData} />
      <HeroControlsPanel 
        currentData={localData} 
        onControlsChange={handleControlsChange} 
      />
    </>
  );
}
