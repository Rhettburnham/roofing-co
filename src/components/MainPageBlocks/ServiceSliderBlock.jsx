import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import IconSelectorModal from "../common/IconSelectorModal"; // Import IconSelectorModal here for the panel

// Icons
import {
  FaTools,
  FaFan,
  FaPaintRoller,
  FaTint,
  FaHome as FaHomeIcon, // Renamed to avoid conflict if a LucideHome is also used directly
  FaBuilding,
  FaWarehouse,
  FaSmog, // Alternative to FaChimney
  FaBroom,
  FaHardHat,
  FaQuestionCircle, // For default/error icon
} from "react-icons/fa";
import * as LucideIcons from "lucide-react"; // Import all of Lucide

// Filter out non-component exports from LucideIcons
const { createLucideIcon, ...FilteredLucideIcons } = LucideIcons;

const iconPacks = {
  lucide: FilteredLucideIcons,
  fa: { // Manually list Fa icons to be used or import * as FaIconsModule and assign.
    FaTools, FaFan, FaPaintRoller, FaTint, 
    FaHome: FaHomeIcon, // This was the potential issue, if iconName is 'FaHomeIcon'
    // Let's change the key to match the alias if that's what you intend to store in config
    FaHomeIcon: FaHomeIcon, // Use the alias as the key if names like 'FaHomeIcon' are stored
    FaBuilding, FaWarehouse, FaSmog, FaBroom, FaHardHat, FaQuestionCircle
  },
};

// Helper function to resolve icon name strings to React components
function resolveIcon(iconName, iconPack = 'fa') {
  if (!iconName || !iconPack) return iconPacks.fa.FaQuestionCircle; // Default icon
  const selectedIconPack = iconPacks[iconPack];
  if (!selectedIconPack) {
    console.warn('Icon pack "' + iconPack + '" not found. Defaulting to FaQuestionCircle.');
    return iconPacks.fa.FaQuestionCircle; // Pack not found
  }
  const IconComponent = selectedIconPack[iconName];
  if (!IconComponent) {
    console.warn('Icon "' + iconName + '" not found in pack "' + iconPack + '". Defaulting to FaQuestionCircle.');
    return iconPacks.fa.FaQuestionCircle; // Icon not found in pack
  }
  return IconComponent;
}

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeImageState = (imageConfig, defaultPath) => {
    let originalUrlToStore = defaultPath;
    let nameToStore = defaultPath.split('/').pop();
    let urlToDisplay = defaultPath;
    let fileObject = null;

    if (imageConfig && typeof imageConfig === 'object') {
        urlToDisplay = imageConfig.url || defaultPath;
        nameToStore = imageConfig.name || urlToDisplay.split('/').pop();
        fileObject = imageConfig.file || null;
        originalUrlToStore = imageConfig.originalUrl || (typeof imageConfig.url === 'string' && !imageConfig.url.startsWith('blob:') ? imageConfig.url : defaultPath);
    } else if (typeof imageConfig === 'string') {
        urlToDisplay = imageConfig;
        nameToStore = imageConfig.split('/').pop();
        originalUrlToStore = imageConfig;
    }
    
    return { 
        file: fileObject, 
        url: urlToDisplay, 
        name: nameToStore,
        originalUrl: originalUrlToStore
    }; 
};

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
    if (!imageValue) return defaultPath;
    if (typeof imageValue === 'string') return imageValue; // Assumes string is a direct URL or path
    if (typeof imageValue === 'object' && imageValue.url) return imageValue.url; // Handles {file, url, name}
    return defaultPath;
};

// GSAP ANIMATION VARIANTS (defined once)
const containerVariants = {
  enter: { transition: { staggerChildren: 0.07, staggerDirection: 1 } },
  exit: { transition: { staggerChildren: 0.07, staggerDirection: 1 } },
};

const itemVariants = {
  initial: { opacity: 0, x: "-50%" },
  enter: { opacity: 1, x: "0%", transition: { duration: 0.3 } },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.3 } },
};

// SERVICE SLIDER COMPONENT
export default function ServiceSliderBlock({ readOnly = false, config = {}, onConfigChange }) {
  const [localData, setLocalData] = useState(() => {
    const initialConfig = config || {};
    return {
      ...initialConfig,
      title: initialConfig.title || "Services",
      residentialButtonText: initialConfig.residentialButtonText || "Residential",
      commercialButtonText: initialConfig.commercialButtonText || "Commercial",
      
      residentialButtonIcon: initialConfig.residentialButtonIcon || { pack: 'lucide', name: 'Home' },
      commercialButtonIcon: initialConfig.commercialButtonIcon || { pack: 'lucide', name: 'Building2' }, // Or 'FaWarehouse' from 'fa'

      activeButtonConfig: initialConfig.activeButtonConfig || {
        bgColor: initialConfig.activeButtonBgColor || "#FF5733", // Migrated from old activeButtonBgColor
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },
      inactiveButtonConfig: initialConfig.inactiveButtonConfig || {
        bgColor: initialConfig.inactiveButtonBgColor || "#6c757d", // Migrated from old inactiveButtonBgColor
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },
      serviceItemConfig: initialConfig.serviceItemConfig || {
        bgColor: "#1F2937", // Tailwind bg-slate-800 equivalent, adjust as needed for "bg-banner"
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },

      residentialServices: initialConfig.residentialServices?.map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9), iconPack: s.iconPack || 'fa'})) || [],
      commercialServices: initialConfig.commercialServices?.map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9), iconPack: s.iconPack || 'fa'})) || [],
      largeResidentialImg: initializeImageState(initialConfig.largeResidentialImg, "/assets/images/main_image_expanded.jpg"),
      largeCommercialImg: initializeImageState(initialConfig.largeCommercialImg, "/assets/images/commercialservices.jpg"),
      isCommercial: initialConfig.isCommercial || false, 
      // activeButtonBgColor and inactiveButtonBgColor are now part of activeButtonConfig and inactiveButtonConfig
    };
  });

  const [currentEditDisplayType, setCurrentEditDisplayType] = useState(localData.isCommercial ? 'commercial' : 'residential');
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingServiceInfo, setEditingServiceInfo] = useState({ type: null, index: null }); 
  
  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalData(prevLocalData => {
        const newResImg = initializeImageState(config.largeResidentialImg, prevLocalData.largeResidentialImg?.url || "/assets/images/main_image_expanded.jpg");
        const newComImg = initializeImageState(config.largeCommercialImg, prevLocalData.largeCommercialImg?.url || "/assets/images/commercialservices.jpg");

        if (prevLocalData.largeResidentialImg?.file && prevLocalData.largeResidentialImg.url?.startsWith('blob:') && prevLocalData.largeResidentialImg.url !== newResImg.url) {
          URL.revokeObjectURL(prevLocalData.largeResidentialImg.url);
        }
        if (prevLocalData.largeCommercialImg?.file && prevLocalData.largeCommercialImg.url?.startsWith('blob:') && prevLocalData.largeCommercialImg.url !== newComImg.url) {
          URL.revokeObjectURL(prevLocalData.largeCommercialImg.url);
        }
        
        const newResidentialServices = (config.residentialServices || prevLocalData.residentialServices || []).map(serviceConfig => {
          const localService = prevLocalData.residentialServices?.find(s => s.id === serviceConfig.id);
          return {
            ...serviceConfig, // Base from prop or existing local if prop is sparse
            id: serviceConfig.id || localService?.id || Math.random().toString(36).substr(2,9),
            // link: serviceConfig.link !== undefined ? serviceConfig.link : localService?.link || "#", // Link removed
            icon: serviceConfig.icon !== undefined ? serviceConfig.icon : localService?.icon || 'FaTools',
            iconPack: serviceConfig.iconPack !== undefined ? serviceConfig.iconPack : localService?.iconPack || 'fa',
            title: (localService && localService.title !== serviceConfig.title && localService.title !== (serviceConfig.title || "")) 
                   ? localService.title 
                   : serviceConfig.title || "",
          };
        });

        const newCommercialServices = (config.commercialServices || prevLocalData.commercialServices || []).map(serviceConfig => {
          const localService = prevLocalData.commercialServices?.find(s => s.id === serviceConfig.id);
          return {
            ...serviceConfig,
            id: serviceConfig.id || localService?.id || Math.random().toString(36).substr(2,9),
            // link: serviceConfig.link !== undefined ? serviceConfig.link : localService?.link || "#", // Link removed
            icon: serviceConfig.icon !== undefined ? serviceConfig.icon : localService?.icon || 'FaTools',
            iconPack: serviceConfig.iconPack !== undefined ? serviceConfig.iconPack : localService?.iconPack || 'fa',
            title: (localService && localService.title !== serviceConfig.title && localService.title !== (serviceConfig.title || "")) 
                   ? localService.title 
                   : serviceConfig.title || "",
          };
        });
        
        const updatedData = {
          ...prevLocalData, // Start with previous local state
          ...config,        // Overlay with incoming config prop for panel-managed fields

          title: (prevLocalData.title !== config.title && prevLocalData.title !== (config.title || "Services"))
                   ? prevLocalData.title
                   : config.title || "Services",
          residentialButtonText: (prevLocalData.residentialButtonText !== config.residentialButtonText && prevLocalData.residentialButtonText !== (config.residentialButtonText || "Residential"))
                                 ? prevLocalData.residentialButtonText
                                 : config.residentialButtonText || "Residential",
          commercialButtonText: (prevLocalData.commercialButtonText !== config.commercialButtonText && prevLocalData.commercialButtonText !== (config.commercialButtonText || "Commercial"))
                                ? prevLocalData.commercialButtonText
                                : config.commercialButtonText || "Commercial",
          
          residentialButtonIcon: config.residentialButtonIcon || prevLocalData.residentialButtonIcon || { pack: 'lucide', name: 'Home' },
          commercialButtonIcon: config.commercialButtonIcon || prevLocalData.commercialButtonIcon || { pack: 'lucide', name: 'Building2' },

          activeButtonConfig: config.activeButtonConfig || prevLocalData.activeButtonConfig || { bgColor: "#FF5733", textColor: "#FFFFFF", iconColor: "#FFFFFF" },
          inactiveButtonConfig: config.inactiveButtonConfig || prevLocalData.inactiveButtonConfig || { bgColor: "#6c757d", textColor: "#FFFFFF", iconColor: "#FFFFFF" },
          serviceItemConfig: config.serviceItemConfig || prevLocalData.serviceItemConfig || { bgColor: "#1F2937", textColor: "#FFFFFF", iconColor: "#FFFFFF" },
          
          residentialServices: newResidentialServices,
          commercialServices: newCommercialServices,
          
          largeResidentialImg: newResImg,
          largeCommercialImg: newComImg,
          isCommercial: config.isCommercial !== undefined ? config.isCommercial : prevLocalData.isCommercial,
          // activeButtonBgColor, inactiveButtonBgColor are removed as they are part of new config objects
        };
        return updatedData;
      });
    }
  }, [config]); // REMOVED readOnly from dependencies

  // Effect to handle UI changes when readOnly flips (like setting currentEditDisplayType)
  useEffect(() => {
    if (prevReadOnlyRef.current === true && readOnly === false) { // Entering edit mode
        setCurrentEditDisplayType(localData.isCommercial ? 'commercial' : 'residential');
    }
  }, [readOnly, localData.isCommercial]); // Runs when readOnly or localData.isCommercial changes

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("ServiceSliderBlock: Editing finished. Calling onConfigChange.");
        const dataToSave = { ...localData };
        
        if (localData.largeResidentialImg?.file) {
            dataToSave.largeResidentialImg = { ...localData.largeResidentialImg }; 
        } else {
            dataToSave.largeResidentialImg = { url: localData.largeResidentialImg?.originalUrl || localData.largeResidentialImg?.url };
        }

        if (localData.largeCommercialImg?.file) {
            dataToSave.largeCommercialImg = { ...localData.largeCommercialImg };
        } else {
            dataToSave.largeCommercialImg = { url: localData.largeCommercialImg?.originalUrl || localData.largeCommercialImg?.url };
        }
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (updater) => {
    setLocalData(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      if (newState.hasOwnProperty('isCommercial')) {
          setCurrentEditDisplayType(newState.isCommercial ? 'commercial' : 'residential');
      }
      return newState;
    });
  };
  
  const handleTitleChange = (newTitle) => {
    setLocalData(prev => ({ ...prev, title: newTitle }));
  };

  const handleServiceItemTitleChange = (serviceType, index, newTitle) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    setLocalData(prev => {
      const updatedServices = [...(prev[serviceListKey] || [])];
      if(updatedServices[index]) {
        updatedServices[index] = { ...updatedServices[index], title: newTitle };
      }
      return { ...prev, [serviceListKey]: updatedServices };
    });
  };
  
  const openIconModalHandler = (serviceType, index) => {
    if (readOnly) return; 
    setEditingServiceInfo({ type: serviceType, index });
    setIsIconModalOpen(true);
  };

  const handleIconSelectAndSave = (pack, iconName) => {
    if (editingServiceInfo.type && editingServiceInfo.index !== null) {
      const serviceListKey = editingServiceInfo.type === 'residential' ? 'residentialServices' : 'commercialServices';
      setLocalData(prev => {
        const updatedServices = [...(prev[serviceListKey] || [])];
        if(updatedServices[editingServiceInfo.index]) {
            updatedServices[editingServiceInfo.index] = { ...updatedServices[editingServiceInfo.index], icon: iconName, iconPack: pack };
        }
        return { ...prev, [serviceListKey]: updatedServices };
      });
    }
    setIsIconModalOpen(false);
    setEditingServiceInfo({ type: null, index: null });
  };

  const displayType = readOnly ? (localData.isCommercial ? 'commercial' : 'residential') : currentEditDisplayType;
  const servicesForDisplay = displayType === 'commercial' ? (localData.commercialServices || []) : (localData.residentialServices || []);
  const wrapperClassName = `w-full bg-black relative ${readOnly ? 'mt-3' : ''}`;
  
  const commonButtonClass = "flex items-center px-2 md:px-4 rounded-full border-1 mx-2 text-md transition-colors duration-300 font-sans";
  const activeButtonClass = "text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]";
  const inactiveButtonClass = "text-white hover:opacity-80";

  // --- Combined Read-Only and Editable Preview Rendering Logic ---
  const renderPreview = () => (
    <div className={wrapperClassName}>
      {/* Small Screen */}
      <div className="block md:hidden relative w-full">
          <div className="overflow-hidden w-full relative h-[40vh]">
            <motion.div
                animate={{ x: displayType === 'commercial' ? "-50%" : "0%" }}
                transition={{ duration: 0.8 }}
                className="flex w-[200%] h-full"
            >
                <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Residential Services" className="w-1/2 h-full object-cover" />
                <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Commercial Services" className="w-1/2 h-full object-cover" />
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-black z-10 pointer-events-none" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}/>
          {readOnly ? (
            <h2 className="absolute top-[1vh] left-1/2 transform -translate-x-1/2 text-white text-[10vw] font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20 select-none">
              {localData.title}
            </h2>
          ) : (
            <input 
                type="text" 
                value={localData.title} 
                onChange={(e) => handleTitleChange(e.target.value)} 
                className="absolute top-[1vh] left-1/2 transform -translate-x-1/2 text-white text-[10vw] font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-2 min-w-[70vw]"
                placeholder="Section Title"
            />
          )}
          <div className="absolute bottom-[10vh] left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex flex-row gap-3">
                <button
                  onClick={() => readOnly ? handleLocalDataChange({isCommercial: false}) : setCurrentEditDisplayType('residential')}
                  style={{
                    backgroundColor: (displayType === 'residential' ? localData.activeButtonConfig.bgColor : localData.inactiveButtonConfig.bgColor),
                    color: (displayType === 'residential' ? localData.activeButtonConfig.textColor : localData.inactiveButtonConfig.textColor)
                  }}
                  className={`${commonButtonClass} ${displayType === 'residential' ? activeButtonClass : inactiveButtonClass} md:py-2`}
                >
                  {React.createElement(resolveIcon(localData.residentialButtonIcon.name, localData.residentialButtonIcon.pack), { className: "mr-2", size: 16, style: { color: (displayType === 'residential' ? localData.activeButtonConfig.iconColor : localData.inactiveButtonConfig.iconColor) } })}
                  <p className="text-[3vw] font-sans">{localData.residentialButtonText}</p>
                </button>
                <button
                  onClick={() => readOnly ? handleLocalDataChange({isCommercial: true}) : setCurrentEditDisplayType('commercial')}
                  style={{
                    backgroundColor: (displayType === 'commercial' ? localData.activeButtonConfig.bgColor : localData.inactiveButtonConfig.bgColor),
                    color: (displayType === 'commercial' ? localData.activeButtonConfig.textColor : localData.inactiveButtonConfig.textColor)
                   }}
                  className={`${commonButtonClass} ${displayType === 'commercial' ? activeButtonClass : inactiveButtonClass} py-1 md:py-2 text-lg`}
                >
                  {React.createElement(resolveIcon(localData.commercialButtonIcon.name, localData.commercialButtonIcon.pack), { className: "mr-2", size: 16, style: { color: (displayType === 'commercial' ? localData.activeButtonConfig.iconColor : localData.inactiveButtonConfig.iconColor) } })}
                  <p className="text-[3vw] font-sans">{localData.commercialButtonText}</p>
                </button>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-[23vh] p-2 z-20">
              <AnimatePresence mode="wait">
                  <motion.div
                    key={displayType === 'commercial' ? "commercial-services" : "residential-services"}
                    className="flex flex-row gap-4"
                    variants={containerVariants} initial="initial" animate="enter" exit="exit"
                  >
                    {servicesForDisplay.slice().reverse().map((service, index_reversed) => {
                        const originalIndex = servicesForDisplay.length - 1 - index_reversed;
                        return (
                          <motion.div key={service.id || originalIndex} variants={itemVariants} className="flex flex-col items-center -mt-[14vh]">
                              <div
                                onClick={() => !readOnly && openIconModalHandler(displayType, originalIndex)}
                                className={`group whitespace-nowrap flex-col dark_button w-[9vh] h-[9vh] p-2 md:w-24 md:h-24 rounded-full flex items-center justify-around text-white text-[5vw] hover:text-gray-200 hover:bg-gray-200 transition drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                                style={{ backgroundColor: localData.serviceItemConfig.bgColor }}
                              >
                                {React.createElement(resolveIcon(service.icon, service.iconPack), { className: "w-[8vw] h-[8vw] md:w-10 md:h-10", style: { color: localData.serviceItemConfig.iconColor } })}
                                {readOnly ? (
                                  <h3 className="text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" style={{ color: localData.serviceItemConfig.textColor }}>
                                      {service.title}
                                  </h3>
                                ) : (
                                  <input 
                                      type="text" 
                                      value={service.title} 
                                      onChange={(e) => handleServiceItemTitleChange(displayType, originalIndex, e.target.value)}
                                      className="text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded w-full truncate"
                                      placeholder="Title"
                                      onClick={(e) => e.stopPropagation()} 
                                      style={{ color: localData.serviceItemConfig.textColor }}
                                  />
                                )}
                              </div>
                          </motion.div>
                        );
                    })}
                  </motion.div>
              </AnimatePresence>
          </div>
      </div>

      {/* Large Screen */}
      <div className="hidden md:block overflow-hidden">
          <div className="relative w-full h-[60vh]">
            <motion.div
                animate={{ x: displayType === 'commercial' ? "-50%" : "0%" }}
                transition={{ duration: 1 }}
                className="flex w-[200%] h-full"
            >
                <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Residential Services" className="w-1/2 h-full object-cover" />
                <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Commercial Services" className="w-1/2 h-full object-cover" />
            </motion.div>
            <div className="absolute top-0 w-full flex justify-center">
              {readOnly ? (
                  <h2 className="relative z-40 text-white text-[11.5vh] tracking-wider font-rye first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)] select-none">
                    {localData.title}
                  </h2>
                ) : (
                  <input 
                      type="text" 
                      value={localData.title} 
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="relative z-40 text-white text-[11.5vh] tracking-wider font-rye first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-2 min-w-[50vw]"
                      placeholder="Section Title"
                  />
                )}
            </div>
            <div className="absolute bottom-[6vh] left-1/2 transform -translate-x-1/2 z-30">
                <div className="flex flex-row">
                  <button
                      onClick={() => readOnly ? handleLocalDataChange({isCommercial: false}) : setCurrentEditDisplayType('residential')}
                      style={{
                        backgroundColor: (displayType === 'residential' ? localData.activeButtonConfig.bgColor : localData.inactiveButtonConfig.bgColor),
                        color: (displayType === 'residential' ? localData.activeButtonConfig.textColor : localData.inactiveButtonConfig.textColor)
                       }}
                      className={`${commonButtonClass} ${displayType === 'residential' ? activeButtonClass : inactiveButtonClass} py-2 text-lg`}
                  >
                      {React.createElement(resolveIcon(localData.residentialButtonIcon.name, localData.residentialButtonIcon.pack), { className: "mr-2", size: 30, style: { color: (displayType === 'residential' ? localData.activeButtonConfig.iconColor : localData.inactiveButtonConfig.iconColor) } })} {localData.residentialButtonText}
                  </button>
                  <button
                      onClick={() => readOnly ? handleLocalDataChange({isCommercial: true}) : setCurrentEditDisplayType('commercial')}
                      style={{
                        backgroundColor: (displayType === 'commercial' ? localData.activeButtonConfig.bgColor : localData.inactiveButtonConfig.bgColor),
                        color: (displayType === 'commercial' ? localData.activeButtonConfig.textColor : localData.inactiveButtonConfig.textColor)
                       }}
                      className={`${commonButtonClass} ${displayType === 'commercial' ? activeButtonClass : inactiveButtonClass} py-2 text-lg`}
                  >
                      {React.createElement(resolveIcon(localData.commercialButtonIcon.name, localData.commercialButtonIcon.pack), { className: "mr-2", size: 30, style: { color: (displayType === 'commercial' ? localData.activeButtonConfig.iconColor : localData.inactiveButtonConfig.iconColor) } })} {localData.commercialButtonText}
                  </button>
                </div>
            </div>
            <div className="absolute inset-0 flex items-end justify-center mb-[26vh]">
                <AnimatePresence mode="wait">
                  <motion.div
                      key={displayType === 'commercial' ? "commercial-lg-services" : "residential-lg-services"}
                      className="grid grid-cols-4 gap-[5.5vw]"
                      variants={containerVariants} initial="initial" animate="enter" exit="exit"
                  >
                      {servicesForDisplay.slice().reverse().map((service, index_reversed) => {
                          const originalIndex = servicesForDisplay.length - 1 - index_reversed;
                          return (
                            <motion.div key={service.id || originalIndex} variants={itemVariants} className="flex flex-col items-center">
                                <div 
                                  onClick={() => !readOnly && openIconModalHandler(displayType, originalIndex)}
                                  className={`dark_button flex-col w-28 h-28 rounded-full flex items-center justify-center text-white text-[6vh] hover:text-black hover:bg-gray-200 transition drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                                  style={{ backgroundColor: localData.serviceItemConfig.bgColor }}
                                >
                                  {React.createElement(resolveIcon(service.icon, service.iconPack), { className: "w-[5vw] h-[5vw] md:w-10 md:h-10", style: { color: localData.serviceItemConfig.iconColor } })}
                                  {readOnly ? (
                                    <h3 className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" style={{ color: localData.serviceItemConfig.textColor }}>
                                      {service.title}
                                    </h3>
                                  ) : (
                                    <input 
                                        type="text" 
                                        value={service.title} 
                                        onChange={(e) => handleServiceItemTitleChange(displayType, originalIndex, e.target.value)}
                                        className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded w-full truncate"
                                        placeholder="Title"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ color: localData.serviceItemConfig.textColor }}
                                    />
                                  )}
                                </div>
                            </motion.div>
                          );
                      })}
                  </motion.div>
                </AnimatePresence>
            </div>
          </div>
      </div>
    </div>
  );

  if (readOnly) {
    return renderPreview();
  }

  // EDITING MODE: Render the preview (which is now inline editable) 
  // AND the ServiceSliderEditorPanel for ancillary controls.
  return (
    <>
      {renderPreview()} 
      <ServiceSliderEditorPanel 
        localData={localData}
        onPanelChange={handleLocalDataChange} 
      />
      <IconSelectorModal 
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onIconSelect={handleIconSelectAndSave}
        currentIconPack={editingServiceInfo.type ? localData[editingServiceInfo.type === 'residential' ? 'residentialServices' : 'commercialServices']?.[editingServiceInfo.index]?.iconPack || 'fa' : 'fa'}
        currentIconName={editingServiceInfo.type ? localData[editingServiceInfo.type === 'residential' ? 'residentialServices' : 'commercialServices']?.[editingServiceInfo.index]?.icon : null}
      />
    </>
  );
}

function ServiceSliderEditorPanel({ localData, onPanelChange }) {
  
  const handleFieldChange = (field, value) => {
    onPanelChange({ [field]: value });
  };

  const handleNestedFieldChange = (configKey, field, value) => {
    onPanelChange(prevData => ({
      ...prevData,
      [configKey]: {
        ...(prevData[configKey] || {}),
        [field]: value,
      }
    }));
  };
  
  const handleIconFieldChange = (field, iconData) => { // iconData is { pack, name }
    onPanelChange({ [field]: iconData });
  };

  const handleServiceListChange = (serviceType, index, field, value) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    const updatedServices = [...(localData[serviceListKey] || [])];
    if (updatedServices[index]) {
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      onPanelChange({ [serviceListKey]: updatedServices });
    }
  };

  const handleAddService = (serviceType) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    const iconOptions = ['FaTools', 'FaFan', 'FaPaintRoller', 'FaTint', 'FaHome', 'FaBuilding', 'FaWarehouse', 'FaSmog', 'FaBroom', 'FaHardHat'];
    const newService = {
      id: Math.random().toString(36).substr(2,9),
      icon: iconOptions[Math.floor(Math.random() * iconOptions.length)],
      iconPack: 'fa', // Default new icons to FontAwesome
      title: `New ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service`,
    };
    onPanelChange({ [serviceListKey]: [...(localData[serviceListKey] || []), newService] });
  };

  const handleRemoveService = (serviceType, index) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    const updatedServices = [...(localData[serviceListKey] || [])];
    updatedServices.splice(index, 1);
    onPanelChange({ [serviceListKey]: updatedServices });
  };

  // State for managing which icon is being edited by IconSelectorModal
  const [isIconModalOpenForPanel, setIsIconModalOpenForPanel] = useState(false);
  const [editingIconTarget, setEditingIconTarget] = useState({ field: null, currentIcon: null });

  const openIconModalForPanel = (field, currentIcon) => {
    setEditingIconTarget({ field, currentIcon });
    setIsIconModalOpenForPanel(true);
  };

  const handlePanelIconSelectAndSave = (pack, iconName) => {
    if (editingIconTarget.field) {
      handleIconFieldChange(editingIconTarget.field, { pack, name: iconName });
    }
    setIsIconModalOpenForPanel(false);
    setEditingIconTarget({ field: null, currentIcon: null });
  };

  const handleImageUpload = (fieldName, file) => {
    if (!file) return;
    const currentImageState = localData[fieldName];
    if (currentImageState && currentImageState.url && currentImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageState.url);
    }
    const fileURL = URL.createObjectURL(file);
    onPanelChange({ 
        [fieldName]: { 
            file: file, 
            url: fileURL, 
            name: file.name, 
            originalUrl: currentImageState?.originalUrl // Preserve originalUrl
        }
    });
  };
  
  const handleImageUrlChange = (fieldName, url) => {
    const currentImageState = localData[fieldName];
    if (currentImageState && currentImageState.url && currentImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageState.url);
    }
    onPanelChange({ 
        [fieldName]: { 
            file: null, 
            url: url, 
            name: url.split('/').pop(), 
            originalUrl: url // New URL is the new original reference
        }
    });
  };
  
  return (
    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg mt-0 border border-gray-300">
      <h2 className="text-xl font-semibold mb-3 border-b pb-2">Slider Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Residential Button Text:</label>
            <input
            type="text"
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
            value={localData.residentialButtonText || "Residential"}
            onChange={(e) => handleFieldChange('residentialButtonText', e.target.value)}
            />
            <button 
              onClick={() => openIconModalForPanel('residentialButtonIcon', localData.residentialButtonIcon)}
              className="mt-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Change Residential Icon ({localData.residentialButtonIcon?.pack}/{localData.residentialButtonIcon?.name})
            </button>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Commercial Button Text:</label>
            <input
            type="text"
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
            value={localData.commercialButtonText || "Commercial"}
            onChange={(e) => handleFieldChange('commercialButtonText', e.target.value)}
            />
            <button 
              onClick={() => openIconModalForPanel('commercialButtonIcon', localData.commercialButtonIcon)}
              className="mt-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Change Commercial Icon ({localData.commercialButtonIcon?.pack}/{localData.commercialButtonIcon?.name})
            </button>
        </div>
      </div>

      <h3 className="text-lg font-medium mt-4 pt-3 border-t">Main Toggle Button Colors</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
            <label className="block text-sm font-medium text-gray-700">Active BG Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.activeButtonConfig?.bgColor || "#FF5733"} onChange={(e) => handleNestedFieldChange('activeButtonConfig', 'bgColor', e.target.value)} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Active Text Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.activeButtonConfig?.textColor || "#FFFFFF"} onChange={(e) => handleNestedFieldChange('activeButtonConfig', 'textColor', e.target.value)} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Active Icon Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.activeButtonConfig?.iconColor || "#FFFFFF"} onChange={(e) => handleNestedFieldChange('activeButtonConfig', 'iconColor', e.target.value)} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Inactive BG Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.inactiveButtonConfig?.bgColor || "#6c757d"} onChange={(e) => handleNestedFieldChange('inactiveButtonConfig', 'bgColor', e.target.value)} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Inactive Text Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.inactiveButtonConfig?.textColor || "#FFFFFF"} onChange={(e) => handleNestedFieldChange('inactiveButtonConfig', 'textColor', e.target.value)} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Inactive Icon Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.inactiveButtonConfig?.iconColor || "#FFFFFF"} onChange={(e) => handleNestedFieldChange('inactiveButtonConfig', 'iconColor', e.target.value)} />
        </div>
      </div>

      <h3 className="text-lg font-medium mt-4 pt-3 border-t">Service Item Colors</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
            <label className="block text-sm font-medium text-gray-700">Background Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.serviceItemConfig?.bgColor || "#1F2937"} onChange={(e) => handleNestedFieldChange('serviceItemConfig', 'bgColor', e.target.value)} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Text Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.serviceItemConfig?.textColor || "#FFFFFF"} onChange={(e) => handleNestedFieldChange('serviceItemConfig', 'textColor', e.target.value)} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Icon Color:</label>
            <input type="color" className="mt-1 block w-full h-10" value={localData.serviceItemConfig?.iconColor || "#FFFFFF"} onChange={(e) => handleNestedFieldChange('serviceItemConfig', 'iconColor', e.target.value)} />
        </div>
      </div>

      {/* Residential Services List Editor */}
      <div className="mb-4 pt-3 border-t mt-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Residential Services</h3>
            <button onClick={() => handleAddService('residential')} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs">+ Add</button>
        </div>
        {(localData.residentialServices || []).map((service, index) => (
            <div key={service.id || index} className="bg-gray-100 p-2 rounded mb-2 border border-gray-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{service.title || `Service ${index + 1}`} (Icon: {service.iconPack}/{service.icon})</span>
                    <button onClick={() => handleRemoveService('residential', index)} className="bg-red-500 text-white px-2 py-0.5 rounded">Remove</button>
                </div>
            </div>
        ))}
      </div>
      
      {/* Commercial Services List Editor */}
      <div className="mb-4 pt-3 border-t mt-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Commercial Services</h3>
            <button onClick={() => handleAddService('commercial')} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs">+ Add</button>
        </div>
        {(localData.commercialServices || []).map((service, index) => (
             <div key={service.id || index} className="bg-gray-100 p-2 rounded mb-2 border border-gray-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{service.title || `Service ${index + 1}`} (Icon: {service.iconPack}/{service.icon})</span>
                    <button onClick={() => handleRemoveService('commercial', index)} className="bg-red-500 text-white px-2 py-0.5 rounded">Remove</button>
                </div>
            </div>
        ))}
      </div>

      {/* Image Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t mt-4">
        <div>
            <label className="block text-sm font-medium mb-1">Residential Banner Image:</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload('largeResidentialImg', e.target.files?.[0])} className="mb-1 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            <input type="text" value={getDisplayUrl(localData.largeResidentialImg, '')} placeholder="Or enter image URL" onChange={(e) => handleImageUrlChange('largeResidentialImg', e.target.value)} className="w-full bg-gray-50 border border-gray-300 px-2 py-1 rounded text-xs"/>
            {getDisplayUrl(localData.largeResidentialImg) && <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Preview" className="mt-1 h-16 w-auto object-cover rounded border"/>}
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Commercial Banner Image:</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload('largeCommercialImg', e.target.files?.[0])} className="mb-1 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            <input type="text" value={getDisplayUrl(localData.largeCommercialImg, '')} placeholder="Or enter image URL" onChange={(e) => handleImageUrlChange('largeCommercialImg', e.target.value)} className="w-full bg-gray-50 border border-gray-300 px-2 py-1 rounded text-xs"/>
            {getDisplayUrl(localData.largeCommercialImg) && <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Preview" className="mt-1 h-16 w-auto object-cover rounded border"/>}
        </div>
      </div>
      {isIconModalOpenForPanel && (
        <IconSelectorModal 
            isOpen={isIconModalOpenForPanel}
            onClose={() => setIsIconModalOpenForPanel(false)}
            onIconSelect={handlePanelIconSelectAndSave}
            currentIconPack={editingIconTarget.currentIcon?.pack || 'lucide'}
            currentIconName={editingIconTarget.currentIcon?.name}
        />
      )}
    </div>
  );
} 