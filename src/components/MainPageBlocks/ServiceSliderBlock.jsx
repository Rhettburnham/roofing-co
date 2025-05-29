import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import IconSelectorModal from "../common/IconSelectorModal"; // Import IconSelectorModal here for the panel
import { slugify } from "../../utils/slugify"; // Import slugify

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
    FaHomeIcon: FaHomeIcon, // This was the potential issue, if iconName is 'FaHomeIcon'
    // Let's change the key to match the alias if that's what you intend to store in config
    FaHomeIcon: FaHomeIcon, // Use the alias as the key if names like 'FaHomeIcon' are stored
    FaBuilding, FaWarehouse, FaSmog, FaBroom, FaHardHat, FaQuestionCircle
  },
};

// Helper function to resolve icon name strings to React components
function resolveIcon(iconName, iconPack = 'fa') {
  if (!iconName || !iconPack) return iconPacks.fa.FaQuestionCircle; // Default icon
  const selectedIconPack = iconPacks[iconPack.toLowerCase()];
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
    const ensureOriginalTitle = (services) => (services || []).map(s => ({...s, id: s.id || slugify(s.originalTitle || s.title), originalTitle: s.originalTitle || s.title, iconPack: s.iconPack || 'fa' }));

    return {
      ...initialConfig,
      title: initialConfig.title || "Services",
      residentialButtonText: initialConfig.residentialButtonText || "Residential",
      commercialButtonText: initialConfig.commercialButtonText || "Commercial",
      
      residentialButtonIcon: initialConfig.residentialButtonIcon || { pack: 'lucide', name: 'Home' },
      commercialButtonIcon: initialConfig.commercialButtonIcon || { pack: 'lucide', name: 'Building2' }, 

      activeButtonConfig: initialConfig.activeButtonConfig || {
        bgColor: initialConfig.activeButtonBgColor || "#FF5733", 
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },
      inactiveButtonConfig: initialConfig.inactiveButtonConfig || {
        bgColor: initialConfig.inactiveButtonBgColor || "#6c757d", 
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },
      serviceItemConfig: initialConfig.serviceItemConfig || {
        bgColor: "#1F2937", 
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },

      residentialServices: ensureOriginalTitle(initialConfig.residentialServices),
      commercialServices: ensureOriginalTitle(initialConfig.commercialServices),
      largeResidentialImg: initializeImageState(initialConfig.largeResidentialImg, "/assets/images/main_image_expanded.jpg"),
      largeCommercialImg: initializeImageState(initialConfig.largeCommercialImg, "/assets/images/commercialservices.jpg"),
      isCommercial: initialConfig.isCommercial || false, 
    };
  });

  const [currentEditDisplayType, setCurrentEditDisplayType] = useState(localData.isCommercial ? 'commercial' : 'residential');
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingServiceInfo, setEditingServiceInfo] = useState({ type: null, index: null, field: null }); 
  
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
        
        const mergeServices = (propServices, localServices) => {
            return (propServices || localServices || []).map(serviceConfig => {
                const localService = localServices?.find(s => (s.id || slugify(s.originalTitle || s.title)) === (serviceConfig.id || slugify(serviceConfig.originalTitle || serviceConfig.title)));
                const title = (localService && localService.title !== serviceConfig.title && localService.title !== (config.title || "")) 
                   ? localService.title 
                   : serviceConfig.title || "";
                const originalTitle = serviceConfig.originalTitle || localService?.originalTitle || title;
                return {
                    ...serviceConfig, 
                    id: serviceConfig.id || localService?.id || slugify(originalTitle),
                    icon: serviceConfig.icon !== undefined ? serviceConfig.icon : localService?.icon || 'FaTools',
                    iconPack: serviceConfig.iconPack !== undefined ? serviceConfig.iconPack : localService?.iconPack || 'fa',
                    title: title,
                    originalTitle: originalTitle,
                };
            });
        };

        const newResidentialServices = mergeServices(config.residentialServices, prevLocalData.residentialServices);
        const newCommercialServices = mergeServices(config.commercialServices, prevLocalData.commercialServices);
        
        const updatedData = {
          ...prevLocalData, 
          ...config,        

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
        };
        return updatedData;
      });
    }
  }, [config]);

  useEffect(() => {
    if (prevReadOnlyRef.current === true && readOnly === false) { 
        setCurrentEditDisplayType(localData.isCommercial ? 'commercial' : 'residential');
    }
    prevReadOnlyRef.current = readOnly; // Update ref after comparison
  }, [readOnly, localData.isCommercial]); 

  useEffect(() => {
    // This effect now only handles committing changes when exiting edit mode.
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("ServiceSliderBlock: Exiting edit mode. Calling onConfigChange.");
        const dataToSave = { ...localData };
        
        // Ensure image data is prepared correctly for saving
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
    // prevReadOnlyRef.current is updated in the other useEffect for readOnly
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (updater) => {
    setLocalData(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      if (newState.hasOwnProperty('isCommercial')) {
          setCurrentEditDisplayType(newState.isCommercial ? 'commercial' : 'residential');
      }
      // If not in readOnly mode, call onConfigChange immediately with the new state
      if (!readOnly && onConfigChange) {
        const dataToSave = { ...newState };
        if (newState.largeResidentialImg?.file) {
            dataToSave.largeResidentialImg = { ...newState.largeResidentialImg };
        } else {
            dataToSave.largeResidentialImg = { url: newState.largeResidentialImg?.originalUrl || newState.largeResidentialImg?.url };
        }
        if (newState.largeCommercialImg?.file) {
            dataToSave.largeCommercialImg = { ...newState.largeCommercialImg };
        } else {
            dataToSave.largeCommercialImg = { url: newState.largeCommercialImg?.originalUrl || newState.largeCommercialImg?.url };
        }
        onConfigChange(dataToSave);
      }
      return newState;
    });
  };
  
  const handleTitleChange = (newTitle) => {
    handleLocalDataChange(prev => ({ ...prev, title: newTitle }));
  };

  const handleServiceItemTitleChange = (serviceType, index, newTitle) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    handleLocalDataChange(prev => {
      const updatedServices = [...(prev[serviceListKey] || [])];
      if(updatedServices[index]) {
        // originalTitle should remain unchanged by this edit
        updatedServices[index] = { ...updatedServices[index], title: newTitle }; 
      }
      return { ...prev, [serviceListKey]: updatedServices };
    });
  };
  
  const openIconModalForServiceItem = (serviceType, index) => {
    if (readOnly) return; 
    setEditingServiceInfo({ type: serviceType, index: index, field: 'serviceItem' });
    setIsIconModalOpen(true);
  };

  const openIconModalForButton = (buttonType) => { // buttonType: 'residentialButtonIcon' or 'commercialButtonIcon'
    if (readOnly) return;
    setEditingServiceInfo({ type: null, index: null, field: buttonType });
    setIsIconModalOpen(true);
  };

  const handleIconSelectAndSave = (pack, iconName) => {
    if (editingServiceInfo.field === 'serviceItem' && editingServiceInfo.type && editingServiceInfo.index !== null) {
      const serviceListKey = editingServiceInfo.type === 'residential' ? 'residentialServices' : 'commercialServices';
      handleLocalDataChange(prev => {
        const updatedServices = [...(prev[serviceListKey] || [])];
        if(updatedServices[editingServiceInfo.index]) {
            updatedServices[editingServiceInfo.index] = { ...updatedServices[editingServiceInfo.index], icon: iconName, iconPack: pack };
        }
        return { ...prev, [serviceListKey]: updatedServices };
      });
    } else if (editingServiceInfo.field === 'residentialButtonIcon' || editingServiceInfo.field === 'commercialButtonIcon') {
        handleLocalDataChange(prev => ({ 
            ...prev, 
            [editingServiceInfo.field]: { pack, name: iconName }
        }));
    }
    setIsIconModalOpen(false);
    setEditingServiceInfo({ type: null, index: null, field: null });
  };

  const displayType = readOnly ? (localData.isCommercial ? 'commercial' : 'residential') : currentEditDisplayType;
  const servicesForDisplay = displayType === 'commercial' ? (localData.commercialServices || []) : (localData.residentialServices || []);
  const wrapperClassName = `w-full bg-black relative ${readOnly ? 'mt-3' : ''}`;
  
  /* ---------------------------------------------------------------------
     TOGGLE BUTTONS (Residential  | Commercial)
     ------------------------------------------------------------------*/
  // Rectangle buttons that jut out from the left and animate when active
  const commonButtonClass =
    "flex pr-3 py-2  pl-6 my-1 rounded-r-md shadow-lg transform origin-right transition-all duration-300 font-serif";
  const activeButtonClass = "scale-110 translate-x-4 text-white";
  const inactiveButtonClass = "bg-gray-600 text-white opacity-80";

  // Default placeholder used when a service hover image is not provided
  const DEFAULT_SERVICE_HOVER_IMG = "/assets/images/clipped.png";

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
          {/* Title hidden for small screens */}
          {/* {readOnly ? (
            <h2 className="absolute top-[1vh] left-[2vw] text-left text-black text-[10vw]  drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20 select-none">
              {localData.title}
            </h2>
          ) : (
            <input 
                type="text" 
                value={localData.title} 
                onChange={(e) => handleTitleChange(e.target.value)} 
                className="absolute top-[1vh] left-[2vw] text-left text-white text-[10vw] font-serif drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20 bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-2 min-w-[70vw]"
                placeholder="Section Title"
            />
          )} */}
          {/*  ------------------  TOGGLE BUTTONS (SMALL)  ------------------ */}
          <div className="absolute top-[2vh] left-0 right-0 z-30 flex flex-row justify-center items-center space-x-4 px-4">
            <motion.button
                onClick={() => readOnly ? handleLocalDataChange(prev => ({...prev, isCommercial: false})) : setCurrentEditDisplayType('residential')}
                style={{
                    backgroundColor: (displayType === 'residential' ? localData.activeButtonConfig.bgColor : localData.inactiveButtonConfig.bgColor),
                    color: (displayType === 'residential' ? localData.activeButtonConfig.textColor : localData.inactiveButtonConfig.textColor),
                }}
                className={`${commonButtonClass} ${displayType === 'residential' ? 'scale-105' : 'opacity-80'}`}
                animate={{ scale: displayType === 'residential' ? 1.05 : 1 }}
            >
                {React.createElement(resolveIcon(localData.residentialButtonIcon.name, localData.residentialButtonIcon.pack), { className: "mr-2", size: 16, style: { color: displayType === 'residential' ? localData.activeButtonConfig.iconColor : localData.inactiveButtonConfig.iconColor } })}
                <p className="text-[4vw] font-sans">{localData.residentialButtonText}</p>
            </motion.button>
            <motion.button
                onClick={() => readOnly ? handleLocalDataChange(prev => ({...prev, isCommercial: true})) : setCurrentEditDisplayType('commercial')}
                style={{
                    backgroundColor: (displayType === 'commercial' ? localData.activeButtonConfig.bgColor : localData.inactiveButtonConfig.bgColor),
                    color: (displayType === 'commercial' ? localData.activeButtonConfig.textColor : localData.inactiveButtonConfig.textColor),
                }}
                className={`${commonButtonClass} ${displayType === 'commercial' ? 'scale-105' : 'opacity-80'}`}
                animate={{ scale: displayType === 'commercial' ? 1.05 : 1 }}
            >
                {React.createElement(resolveIcon(localData.commercialButtonIcon.name, localData.commercialButtonIcon.pack), { className: "mr-2", size: 16, style: { color: displayType === 'commercial' ? localData.activeButtonConfig.iconColor : localData.inactiveButtonConfig.iconColor } })}
                <p className="text-[4vw] font-sans">{localData.commercialButtonText}</p>
            </motion.button>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-[15vh] p-2 z-20"> {/* Adjusted pt for button row */} 
              <AnimatePresence mode="wait">
                  <motion.div
                    key={displayType === 'commercial' ? "commercial-services" : "residential-services"}
                    className="grid grid-cols-2 gap-x-4 gap-y-8 w-full px-4" // Changed to grid-cols-2 and added gap-y, w-full, px-4
                    variants={containerVariants} initial="initial" animate="enter" exit="exit"
                  >
                    {servicesForDisplay.slice().reverse().map((service, index_reversed) => {
                        const originalIndex = servicesForDisplay.length - 1 - index_reversed;
                        const serviceId = service.id || slugify(service.originalTitle || service.title);
                        // Link generation for read-only mode
                        const serviceLink = readOnly ? `/services/${displayType}/${serviceId}` : undefined;

                        const hoverVariants = { rest: { scale: 1, borderRadius: "50%" }, hover: { scale: 1.15, borderRadius: "10%", transition: { duration: 0.3 } } };
                        const iconFade = { rest: { opacity: 1 }, hover: { opacity: 0, transition: { duration: 0.15 } } };
                        const imgFade = { rest: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.15, duration: 0.2 } } };

                        const serviceContent = (
                          <motion.div 
                            onClick={() => !readOnly && openIconModalForServiceItem(displayType, originalIndex)}
                            className={`relative overflow-hidden dark_button flex-col w-full h-28 flex items-center justify-center text-white text-[6vh] ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                            style={{ backgroundColor: localData.serviceItemConfig.bgColor }}
                            variants={hoverVariants}
                            initial="rest"
                            whileHover="hover"
                          >
                            <motion.div variants={iconFade} className="z-10">
                              {React.createElement(resolveIcon(service.icon, service.iconPack), { className: "w-[5vw] h-[5vw] md:w-10 md:h-10", style: { color: localData.serviceItemConfig.iconColor } })}
                            </motion.div>
                            <motion.img variants={imgFade} src={service.hoverImg || DEFAULT_SERVICE_HOVER_IMG} alt="service" className="absolute inset-0 w-full h-full object-cover" />
                            {readOnly ? (
                              <h3 className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" style={{ color: localData.serviceItemConfig.textColor }}>
                                {service.title}
                              </h3>
                            ) : (
                              <input 
                                  type="text" 
                                  value={service.title} 
                                  onChange={(e) => handleServiceItemTitleChange(displayType, originalIndex, e.target.value)}
                                  className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-left "
                                  placeholder="Title"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ color: localData.serviceItemConfig.textColor }}
                              />
                            )}
                            {/* Extra sub text reveal */}
                            <motion.span variants={imgFade} className="absolute bottom-2 text-xs text-white drop-shadow">
                              {service.subtitle || "More Info"}
                            </motion.span>
                          </motion.div>
                        );

                        return (
                          <motion.div key={serviceId || originalIndex} variants={itemVariants} className="flex flex-col items-center">
                            {readOnly && serviceLink ? (
                                <Link to={serviceLink} className="block w-full">
                                    {serviceContent}
                                </Link>
                            ) : (
                                serviceContent
                            )}
                          </motion.div>
                        );
                    })}
                  </motion.div>
              </AnimatePresence>
          </div>
      </div>

      {/* Large Screen */}
      <div className="hidden md:block overflow-hidden">
          <div className="relative w-full h-[38vh]">
            <motion.div
                animate={{ x: displayType === 'commercial' ? "-50%" : "0%" }}
                transition={{ duration: 1 }}
                className="flex w-[200%] h-full"
            >
                <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Residential Services" className="w-1/2 h-full object-cover" />
                <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Commercial Services" className="w-1/2 h-full object-cover" />
            </motion.div>
            <div className="absolute top-0 w-full flex justify-start pl-6">
              {readOnly ? (
                  <h2 className="relative z-40 text-white text-[8vh] tracking-wider font-serif first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)] select-none">
                    {localData.title}
                  </h2>
                ) : (
                  <input 
                      type="text" 
                      value={localData.title} 
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="relative z-40 text-white text-[8vh] tracking-wider font-serif bg-transparent text-left px-2 min-w-[50vw]"
                      placeholder="Section Title"
                  />
                )}
            </div>
            {/*  ------------------  TOGGLE BUTTONS (LARGE)  ------------------ */}
            <div className="absolute top-[10vh] left-0 z-30 flex flex-col">
                <motion.button
                    onClick={() => readOnly ? handleLocalDataChange(prev => ({...prev, isCommercial: false})) : setCurrentEditDisplayType('residential')}
                    style={{
                        backgroundColor: (displayType === 'residential' ? localData.activeButtonConfig.bgColor : undefined),
                    }}
                    className={`${commonButtonClass} ${displayType === 'residential' ? activeButtonClass : inactiveButtonClass}`}
                    animate={{ x: displayType === 'residential' ? 12 : 0, scale: displayType === 'residential' ? 1.1 : 1 }}
                >
                    {React.createElement(resolveIcon(localData.residentialButtonIcon.name, localData.residentialButtonIcon.pack), { className: "mr-2", size: 24, style: { color: localData.activeButtonConfig.iconColor } })} {localData.residentialButtonText}
                </motion.button>
                <motion.button
                    onClick={() => readOnly ? handleLocalDataChange(prev => ({...prev, isCommercial: true})) : setCurrentEditDisplayType('commercial')}
                    style={{
                        backgroundColor: (displayType === 'commercial' ? localData.activeButtonConfig.bgColor : undefined),
                    }}
                    className={`${commonButtonClass} ${displayType === 'commercial' ? activeButtonClass : inactiveButtonClass}`}
                    animate={{ x: displayType === 'commercial' ? 12 : 0, scale: displayType === 'commercial' ? 1.1 : 1 }}
                >
                    {React.createElement(resolveIcon(localData.commercialButtonIcon.name, localData.commercialButtonIcon.pack), { className: "mr-2", size: 24, style: { color: localData.activeButtonConfig.iconColor } })} {localData.commercialButtonText}
                </motion.button>
            </div>
            <div className="absolute inset-0 flex items-center justify-center ">
                <AnimatePresence mode="wait">
                  <motion.div
                      key={displayType === 'commercial' ? "commercial-lg-services" : "residential-lg-services"}
                      className="grid grid-cols-4 gap-[5.5vw]"
                      variants={containerVariants} initial="initial" animate="enter" exit="exit"
                  >
                      {servicesForDisplay.slice().reverse().map((service, index_reversed) => {
                          const originalIndex = servicesForDisplay.length - 1 - index_reversed;
                          const serviceId = service.id || slugify(service.originalTitle || service.title);
                          const serviceLink = readOnly ? `/services/${displayType}/${serviceId}` : undefined;

                          const hoverVariants = { rest: { scale: 1, borderRadius: "50%" }, hover: { scale: 1.15, borderRadius: "10%", transition: { duration: 0.3 } } };
                          const iconFade = { rest: { opacity: 1 }, hover: { opacity: 0, transition: { duration: 0.15 } } };
                          const imgFade = { rest: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.15, duration: 0.2 } } };

                          const serviceContent = (
                            <motion.div 
                              onClick={() => !readOnly && openIconModalForServiceItem(displayType, originalIndex)}
                              className={`relative overflow-hidden dark_button flex-col w-28 h-28 flex items-center justify-center text-white text-[6vh] ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                              style={{ backgroundColor: localData.serviceItemConfig.bgColor }}
                              variants={hoverVariants}
                              initial="rest"
                              whileHover="hover"
                            >
                              <motion.div variants={iconFade} className="z-10">
                                {React.createElement(resolveIcon(service.icon, service.iconPack), { className: "w-[5vw] h-[5vw] md:w-10 md:h-10", style: { color: localData.serviceItemConfig.iconColor } })}
                              </motion.div>
                              <motion.img variants={imgFade} src={service.hoverImg || DEFAULT_SERVICE_HOVER_IMG} alt="service" className="absolute inset-0 w-full h-full object-cover" />
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
                            </motion.div>
                          );
                          return (
                            <motion.div key={serviceId || originalIndex} variants={itemVariants} className="flex flex-col items-center">
                                {readOnly && serviceLink ? (
                                    <Link to={serviceLink} className="block">
                                        {serviceContent}
                                    </Link>
                                ) : (
                                    serviceContent
                                )}
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

  // Determine current icon pack and name for the modal, depending on what's being edited
  let modalIconPack = 'fa';
  let modalIconName = null;
  if (editingServiceInfo.field === 'serviceItem' && editingServiceInfo.type && editingServiceInfo.index !== null) {
    const serviceListKey = editingServiceInfo.type === 'residential' ? 'residentialServices' : 'commercialServices';
    modalIconPack = localData[serviceListKey]?.[editingServiceInfo.index]?.iconPack || 'fa';
    modalIconName = localData[serviceListKey]?.[editingServiceInfo.index]?.icon;
  } else if (editingServiceInfo.field === 'residentialButtonIcon') {
    modalIconPack = localData.residentialButtonIcon?.pack || 'lucide';
    modalIconName = localData.residentialButtonIcon?.name;
  } else if (editingServiceInfo.field === 'commercialButtonIcon') {
    modalIconPack = localData.commercialButtonIcon?.pack || 'lucide';
    modalIconName = localData.commercialButtonIcon?.name;
  }

  if (readOnly) {
    return renderPreview();
  }

  return (
    <>
      {renderPreview()} 
      <ServiceSliderEditorPanel 
        localData={localData}
        onPanelChange={handleLocalDataChange} 
        onOpenIconButtonModal={openIconModalForButton} // Pass specialized handler for button icons
      />
      <IconSelectorModal 
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onIconSelect={handleIconSelectAndSave}
        currentIconPack={modalIconPack}
        currentIconName={modalIconName}
      />
    </>
  );
}

function ServiceSliderEditorPanel({ localData, onPanelChange, onOpenIconButtonModal }) {
  
  const handleFieldChange = (field, value) => {
    onPanelChange(prev => ({ ...prev, [field]: value }));
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
  
  const handleServiceListChange = (serviceType, index, field, value) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    onPanelChange(prev => {
        const updatedServices = [...(prev[serviceListKey] || [])];
        if (updatedServices[index]) {
          updatedServices[index] = { ...updatedServices[index], [field]: value };
        }
        return {...prev, [serviceListKey]: updatedServices };
    });
  };

  const handleAddService = (serviceType) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    const iconOptions = ['FaTools', 'FaFan', 'FaPaintRoller', 'FaTint', 'FaHomeIcon', 'FaBuilding', 'FaWarehouse', 'FaSmog', 'FaBroom', 'FaHardHat'];
    const newTitle = `New ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service`;
    const newService = {
      id: slugify(newTitle + " " + Date.now()), // Ensure unique ID, can be slug-based
      icon: iconOptions[Math.floor(Math.random() * iconOptions.length)],
      iconPack: 'fa', 
      title: newTitle,
      originalTitle: newTitle, 
    };
    onPanelChange(prev => ({...prev, [serviceListKey]: [...(prev[serviceListKey] || []), newService] }));
  };

  const handleRemoveService = (serviceType, index) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    onPanelChange(prev => {
        const updatedServices = [...(prev[serviceListKey] || [])];
        updatedServices.splice(index, 1);
        return {...prev, [serviceListKey]: updatedServices };
    });
  };

  const handleImageUpload = (fieldName, file) => {
    if (!file) return;
    const currentImageState = localData[fieldName];
    if (currentImageState && currentImageState.url && currentImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageState.url);
    }
    const fileURL = URL.createObjectURL(file);
    onPanelChange(prev => ({ 
        ...prev,
        [fieldName]: { 
            file: file, 
            url: fileURL, 
            name: file.name, 
            originalUrl: currentImageState?.originalUrl 
        }
    }));
  };
  
  const handleImageUrlChange = (fieldName, url) => {
    const currentImageState = localData[fieldName];
    if (currentImageState && currentImageState.url && currentImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageState.url);
    }
    onPanelChange(prev => ({ 
        ...prev,
        [fieldName]: { 
            file: null, 
            url: url, 
            name: url.split('/').pop(), 
            originalUrl: url 
        }
    }));
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
              onClick={() => onOpenIconButtonModal('residentialButtonIcon')}
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
              onClick={() => onOpenIconButtonModal('commercialButtonIcon')}
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

      {/* Residential Services List Editor - Titles are edited inline in preview */}
      <div className="mb-4 pt-3 border-t mt-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Residential Services (Titles edited in preview)</h3>
            <button onClick={() => handleAddService('residential')} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs">+ Add Service</button>
        </div>
        {(localData.residentialServices || []).map((service, index) => (
            <div key={service.id || index} className="bg-gray-100 p-2 rounded mb-2 border border-gray-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{service.originalTitle || service.title || `Service ${index + 1}`} (Icon: {service.iconPack}/{service.icon})</span>
                    <button onClick={() => handleRemoveService('residential', index)} className="bg-red-500 text-white px-2 py-0.5 rounded">Remove</button>
                </div>
            </div>
        ))}
      </div>
      
      {/* Commercial Services List Editor - Titles are edited inline in preview */}
      <div className="mb-4 pt-3 border-t mt-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Commercial Services (Titles edited in preview)</h3>
            <button onClick={() => handleAddService('commercial')} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs">+ Add Service</button>
        </div>
        {(localData.commercialServices || []).map((service, index) => (
             <div key={service.id || index} className="bg-gray-100 p-2 rounded mb-2 border border-gray-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{service.originalTitle || service.title || `Service ${index + 1}`} (Icon: {service.iconPack}/{service.icon})</span>
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
            <input type="text" value={getDisplayUrl(localData.largeResidentialImg, '') || ''} placeholder="Or enter image URL" onChange={(e) => handleImageUrlChange('largeResidentialImg', e.target.value)} className="w-full bg-gray-50 border border-gray-300 px-2 py-1 rounded text-xs"/>
            {getDisplayUrl(localData.largeResidentialImg) && <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Preview" className="mt-1 h-16 w-auto object-cover rounded border"/>}
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Commercial Banner Image:</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload('largeCommercialImg', e.target.files?.[0])} className="mb-1 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            <input type="text" value={getDisplayUrl(localData.largeCommercialImg, '') || ''} placeholder="Or enter image URL" onChange={(e) => handleImageUrlChange('largeCommercialImg', e.target.value)} className="w-full bg-gray-50 border border-gray-300 px-2 py-1 rounded text-xs"/>
            {getDisplayUrl(localData.largeCommercialImg) && <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Preview" className="mt-1 h-16 w-auto object-cover rounded border"/>}
        </div>
      </div>
      {/* IconSelectorModal is now managed by the main ServiceSliderBlock component */}
    </div>
  );
} 