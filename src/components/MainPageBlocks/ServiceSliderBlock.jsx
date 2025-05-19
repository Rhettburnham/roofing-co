import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import {
  FaTools,
  FaFan,
  FaPaintRoller,
  FaTint,
  FaHome,
  FaBuilding,
  FaWarehouse,
  FaSmog, // Alternative to FaChimney
  FaBroom,
  FaHardHat,
} from "react-icons/fa";
import { Home as LucideHome, Building2 } from "lucide-react"; // Renamed to avoid conflict
import IconSelectorModal from "../common/IconSelectorModal";

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeImageState = (imageConfig, defaultPath) => {
    if (imageConfig && typeof imageConfig === 'object' && imageConfig.url) return imageConfig;
    if (typeof imageConfig === 'string') return { file: null, url: imageConfig, name: imageConfig.split('/').pop() };
    return { file: null, url: defaultPath, name: defaultPath.split('/').pop() };
};

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
    if (!imageValue) return defaultPath;
    if (typeof imageValue === 'string') return imageValue; // Assumes string is a direct URL or path
    if (typeof imageValue === 'object' && imageValue.url) return imageValue.url; // Handles {file, url, name}
    return defaultPath;
};

// Helper function to resolve icon name strings to React components
function resolveIcon(iconName) {
  const iconMap = {
    FaTools,
    FaFan,
    FaPaintRoller,
    FaTint,
    FaHome,
    FaBuilding,
    FaWarehouse,
    FaSmog,
    FaBroom,
    FaHardHat,
  };
  return iconMap[iconName] || FaTools; // Default to FaTools if not found
}

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
      residentialServices: initialConfig.residentialServices?.map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9), link: s.link || "#", iconPack: s.iconPack || 'fa'})) || [],
      commercialServices: initialConfig.commercialServices?.map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9), link: s.link || "#", iconPack: s.iconPack || 'fa'})) || [],
      largeResidentialImg: initializeImageState(initialConfig.largeResidentialImg, "/assets/images/main_image_expanded.jpg"),
      largeCommercialImg: initializeImageState(initialConfig.largeCommercialImg, "/assets/images/commercialservices.jpg"),
      isCommercial: initialConfig.isCommercial || false, 
      activeButtonBgColor: initialConfig.activeButtonBgColor || "#FF5733", // Example: Bright Red/Orange
      inactiveButtonBgColor: initialConfig.inactiveButtonBgColor || "#6c757d", // Example: Gray
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
            link: serviceConfig.link !== undefined ? serviceConfig.link : localService?.link || "#",
            icon: serviceConfig.icon !== undefined ? serviceConfig.icon : localService?.icon || 'FaTools',
            iconPack: serviceConfig.iconPack !== undefined ? serviceConfig.iconPack : localService?.iconPack || 'fa',
            // Prioritize local title if it's different and not just default/empty vs prop
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
            link: serviceConfig.link !== undefined ? serviceConfig.link : localService?.link || "#",
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

          // Explicitly prioritize prevLocalData for simple inline-editable text fields
          title: (prevLocalData.title !== config.title && prevLocalData.title !== (config.title || "Services"))
                   ? prevLocalData.title
                   : config.title || "Services",
          residentialButtonText: (prevLocalData.residentialButtonText !== config.residentialButtonText && prevLocalData.residentialButtonText !== (config.residentialButtonText || "Residential"))
                                 ? prevLocalData.residentialButtonText
                                 : config.residentialButtonText || "Residential",
          commercialButtonText: (prevLocalData.commercialButtonText !== config.commercialButtonText && prevLocalData.commercialButtonText !== (config.commercialButtonText || "Commercial"))
                                ? prevLocalData.commercialButtonText
                                : config.commercialButtonText || "Commercial",
          
          residentialServices: newResidentialServices,
          commercialServices: newCommercialServices,
          
          largeResidentialImg: newResImg,
          largeCommercialImg: newComImg,
          // These are usually changed via panel, so config prop should be authoritative if present
          isCommercial: config.isCommercial !== undefined ? config.isCommercial : prevLocalData.isCommercial,
          activeButtonBgColor: config.activeButtonBgColor !== undefined ? config.activeButtonBgColor : prevLocalData.activeButtonBgColor,
          inactiveButtonBgColor: config.inactiveButtonBgColor !== undefined ? config.inactiveButtonBgColor : prevLocalData.inactiveButtonBgColor,
        };

        // This part was for edit mode UI sync, keep it separate or controlled by readOnly state change in another effect
        // if (prevReadOnlyRef.current === true && readOnly === false) { 
        //     setCurrentEditDisplayType(updatedData.isCommercial ? 'commercial' : 'residential');
        // }
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
        // For file objects, only send the name/path for the config, actual file handled by OneForm
        if (localData.largeResidentialImg?.file) {
            dataToSave.largeResidentialImg = { url: localData.largeResidentialImg.name, name: localData.largeResidentialImg.name }; 
        }
        if (localData.largeCommercialImg?.file) {
            dataToSave.largeCommercialImg = { url: localData.largeCommercialImg.name, name: localData.largeCommercialImg.name };
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
  
  const currentActiveColor = localData.activeButtonBgColor || '#FF5733';
  const currentInactiveColor = localData.inactiveButtonBgColor || '#6c757d';

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
                animate={{ x: displayType === 'commercial' ? "-100%" : "0%" }}
                transition={{ duration: 0.8 }}
                className="flex w-[200%] h-full"
            >
                <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Residential Services" className="w-full h-full object-cover" />
                <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Commercial Services" className="w-full h-full object-cover" />
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
                  style={{ backgroundColor: displayType === 'residential' ? currentActiveColor : currentInactiveColor }}
                  className={`${commonButtonClass} ${displayType === 'residential' ? activeButtonClass : inactiveButtonClass} md:py-2`}
                >
                  <LucideHome className="mr-2" size={16} />
                  <p className="text-[3vw] font-sans">{localData.residentialButtonText}</p>
                </button>
                <button
                  onClick={() => readOnly ? handleLocalDataChange({isCommercial: true}) : setCurrentEditDisplayType('commercial')}
                  style={{ backgroundColor: displayType === 'commercial' ? currentActiveColor : currentInactiveColor }}
                  className={`${commonButtonClass} ${displayType === 'commercial' ? activeButtonClass : inactiveButtonClass} py-1 md:py-2 text-lg`}
                >
                  <FaWarehouse className="mr-2" size={16} />
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
                                className={`group whitespace-nowrap flex-col dark_button bg-banner w-[9vh] h-[9vh] p-2 md:w-24 md:h-24 rounded-full flex items-center justify-around text-white text-[5vw] hover:text-gray-200 hover:bg-gray-200 transition drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                {React.createElement(resolveIcon(service.icon), { className: "w-[8vw] h-[8vw] md:w-10 md:h-10" })}
                                {readOnly ? (
                                  <h3 className="text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
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
                                  />
                                )}
                              </div>
                              {!readOnly && service.link && (
                                <Link to={service.link} className="text-xs text-blue-300 hover:underline mt-1" onClick={(e) => e.stopPropagation()}>Configure Link</Link>
                              )}
                              {readOnly && service.link && (
                                <Link to={service.link} className="text-xs text-blue-300 hover:underline mt-1 pointer-events-none">{service.link}</Link>
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
          <div className="relative w-full h-[60vh]">
            <motion.div
                animate={{ x: displayType === 'commercial' ? "-100%" : "0%" }}
                transition={{ duration: 1 }}
                className="flex w-[200%] h-full"
            >
                <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Residential Services" className="w-full h-full object-cover" />
                <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Commercial Services" className="w-full h-full object-cover" />
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
                      style={{ backgroundColor: displayType === 'residential' ? currentActiveColor : currentInactiveColor }}
                      className={`${commonButtonClass} ${displayType === 'residential' ? activeButtonClass : inactiveButtonClass} py-2 text-lg`}
                  >
                      <LucideHome className="mr-2" size={30} /> {localData.residentialButtonText}
                  </button>
                  <button
                      onClick={() => readOnly ? handleLocalDataChange({isCommercial: true}) : setCurrentEditDisplayType('commercial')}
                      style={{ backgroundColor: displayType === 'commercial' ? currentActiveColor : currentInactiveColor }}
                      className={`${commonButtonClass} ${displayType === 'commercial' ? activeButtonClass : inactiveButtonClass} py-2 text-lg`}
                  >
                      <Building2 className="mr-2" size={30} /> {localData.commercialButtonText}
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
                                  className={`dark_button bg-banner flex-col w-28 h-28 rounded-full flex items-center justify-center text-white text-[6vh] hover:text-black hover:bg-gray-200 transition drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                  {React.createElement(resolveIcon(service.icon), { className: "w-[5vw] h-[5vw] md:w-10 md:h-10" })}
                                  {readOnly ? (
                                    <h3 className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
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
                                    />
                                  )}
                                </div>
                                {!readOnly && service.link && (
                                    <Link to={service.link} className="text-xs text-blue-300 hover:underline mt-1" onClick={(e) => e.stopPropagation()}>Configure Link</Link>
                                )}
                                {readOnly && service.link && (
                                    <Link to={service.link} className="text-xs text-blue-300 hover:underline mt-1 pointer-events-none">{service.link}</Link>
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
      link: "#"
    };
    onPanelChange({ [serviceListKey]: [...(localData[serviceListKey] || []), newService] });
  };

  const handleRemoveService = (serviceType, index) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    const updatedServices = [...(localData[serviceListKey] || [])];
    updatedServices.splice(index, 1);
    onPanelChange({ [serviceListKey]: updatedServices });
  };

  const handleImageUpload = (fieldName, file) => {
    if (!file) return;
    const currentImageState = localData[fieldName];
    if (currentImageState && currentImageState.url && currentImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageState.url);
    }
    const fileURL = URL.createObjectURL(file);
    onPanelChange({ [fieldName]: { file: file, url: fileURL, name: file.name }});
  };
  
  const handleImageUrlChange = (fieldName, url) => {
    const currentImageState = localData[fieldName];
    if (currentImageState && currentImageState.url && currentImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageState.url);
    }
    onPanelChange({ [fieldName]: { file: null, url: url, name: url.split('/').pop() }});
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
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Commercial Button Text:</label>
            <input
            type="text"
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
            value={localData.commercialButtonText || "Commercial"}
            onChange={(e) => handleFieldChange('commercialButtonText', e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Default View (for Read-Only Mode):</label>
            <select
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
                value={localData.isCommercial ? 'commercial' : 'residential'}
                onChange={(e) => handleFieldChange('isCommercial', e.target.value === 'commercial')}
            >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-4 border-t">
        <div>
            <label className="block text-sm font-medium text-gray-700">Active Button Background Color:</label>
            <input
                type="color"
                className="mt-1 block w-full h-10 px-1 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
                value={localData.activeButtonBgColor || "#FF5733"} 
                onChange={(e) => handleFieldChange('activeButtonBgColor', e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Inactive Button Background Color:</label>
            <input
                type="color"
                className="mt-1 block w-full h-10 px-1 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
                value={localData.inactiveButtonBgColor || "#6c757d"} 
                onChange={(e) => handleFieldChange('inactiveButtonBgColor', e.target.value)}
            />
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
                <label className="block text-xs font-medium mt-1">Link URL:</label>
                <input type="text" value={service.link || ""} onChange={(e) => handleServiceListChange('residential', index, 'link', e.target.value)} className="w-full bg-white border border-gray-300 px-2 py-1 rounded text-xs" />
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
                <label className="block text-xs font-medium mt-1">Link URL:</label>
                <input type="text" value={service.link || ""} onChange={(e) => handleServiceListChange('commercial', index, 'link', e.target.value)} className="w-full bg-white border border-gray-300 px-2 py-1 rounded text-xs" />
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
    </div>
  );
} 