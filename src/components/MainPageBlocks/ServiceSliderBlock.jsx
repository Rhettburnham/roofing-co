import React, { useState, useEffect } from "react";
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

// ANIMATION VARIANTS
const containerVariants = {
  enter: { transition: { staggerChildren: 0.07, staggerDirection: 1 } },
  exit: { transition: { staggerChildren: 0.07, staggerDirection: 1 } },
};

const itemVariants = {
  initial: { opacity: 0, x: "-50%" },
  enter: { opacity: 1, x: "0%", transition: { duration: 0.3 } },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.3 } },
};

// EDITOR PANEL (will be modified later)
function ServiceSliderEditorPanel({ localData, setLocalData, onSave, onServiceChange, onAddService, onRemoveService, onImageUpload, onIconSelect }) {
  const [activeTab, setActiveTab] = useState("residential");
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingServiceInfo, setEditingServiceInfo] = useState({ type: null, index: null });

  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  const handleAddServiceInternal = (serviceType) => {
    const serviceList = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    const iconOptions = ['FaTools', 'FaFan', 'FaPaintRoller', 'FaTint', 'FaHome', 'FaBuilding', 'FaWarehouse', 'FaSmog', 'FaBroom', 'FaHardHat'];
    onAddService(serviceType, {
      icon: iconOptions[Math.floor(Math.random() * iconOptions.length)],
      title: `New ${serviceType === 'residential' ? 'Residential' : 'Commercial'} Service`,
      link: "#"
    });
  };

  const handleRemoveService = (serviceType, index) => {
    const serviceList = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    onRemoveService(serviceType, index);
  };

  const handleServiceChange = (serviceType, index, field, value) => {
    const serviceList = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    onServiceChange(serviceType, index, field, value);
  };

  const openIconModal = (serviceType, index) => {
    setEditingServiceInfo({ type: serviceType, index });
    setIsIconModalOpen(true);
  };

  const handleIconSelectInternal = (pack, iconName) => {
    if (editingServiceInfo.type && editingServiceInfo.index !== null) {
      onIconSelect(editingServiceInfo.type, editingServiceInfo.index, iconName);
    }
    setIsIconModalOpen(false);
    setEditingServiceInfo({ type: null, index: null });
  };

  return (
    <div className="bg-white text-gray-800 px-4 py-0 rounded-lg mt-4 border border-gray-300">
      <div className="flex flex-col mb-4 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Service Details Editor</h2>
          {/* <button
            onClick={onSave}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-medium"
          >
            Save All Slider Changes 
          </button> */}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Residential Button Text:</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
            value={localData.residentialButtonText || "Residential"}
            onChange={(e) => setLocalData(prev => ({ ...prev, residentialButtonText: e.target.value }))}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Commercial Button Text:</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
            value={localData.commercialButtonText || "Commercial"}
            onChange={(e) => setLocalData(prev => ({ ...prev, commercialButtonText: e.target.value }))}
          />
        </div>
        {/* Tabs removed */}
        {/* <div className="flex border-b border-gray-700 mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'residential' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} rounded-t`}
            onClick={() => setActiveTab('residential')}
          >
            Residential Services
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'commercial' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} rounded-t`}
            onClick={() => setActiveTab('commercial')}
          >
            Commercial Services
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'images' ? 'bg-gray-200 text-gray-800 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'} rounded-t`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
        </div> */}
      </div>
      
      {/* Residential Services Editor - No longer tabbed */}
      <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Residential Services</h3>
            <button
              onClick={() => handleAddServiceInternal('residential')}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              + Add Service
            </button>
          </div>
          {/* Existing residential services list removed */}
          {/* {localData.residentialServices?.map((service, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded mb-3 relative border border-gray-300">
              <button
                onClick={() => handleRemoveService('residential', index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                title="Remove service"
              > X </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Link input removed */}
              {/*</div>
            </div>
          ))} */}
        </div>
      
      {/* Commercial Services Editor - No longer tabbed */}
      <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Commercial Services</h3>
            <button
              onClick={() => handleAddServiceInternal('commercial')}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              + Add Service
            </button>
          </div>
           {/* Existing commercial services list removed */}
          {/* {localData.commercialServices?.map((service, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded mb-3 relative border border-gray-300">
              <button
                onClick={() => handleRemoveService('commercial', index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                title="Remove service"
              > X </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {/* Link input removed */}
              {/* </div>
            </div>
          ))} */}
        </div>
      
      {/* Images Editor - No longer tabbed */}
      <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Banner Images</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Residential Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload('largeResidentialImg')}
              className="mb-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {getDisplayUrl(localData.largeResidentialImg) && (
              <div className="mt-2 border border-gray-600 rounded overflow-hidden h-32">
                <img
                  src={getDisplayUrl(localData.largeResidentialImg)}
                  alt="Residential banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              type="text"
              className="w-full bg-gray-100 border border-gray-300 px-3 py-2 mt-2 rounded text-gray-800 placeholder-gray-400"
              value={ (localData.largeResidentialImg && typeof localData.largeResidentialImg === 'object' && !localData.largeResidentialImg.file) ? localData.largeResidentialImg.url : (typeof localData.largeResidentialImg === 'string' ? localData.largeResidentialImg : '')}
              placeholder="Or enter image URL"
              onChange={(e) => setLocalData(prev => ({ ...prev, largeResidentialImg: { file: null, url: e.target.value } }))}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Commercial Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload('largeCommercialImg')}
              className="mb-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {getDisplayUrl(localData.largeCommercialImg) && (
              <div className="mt-2 border border-gray-600 rounded overflow-hidden h-32">
                <img
                  src={getDisplayUrl(localData.largeCommercialImg)}
                  alt="Commercial banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              type="text"
              className="w-full bg-gray-100 border border-gray-300 px-3 py-2 mt-2 rounded text-gray-800 placeholder-gray-400"
              value={ (localData.largeCommercialImg && typeof localData.largeCommercialImg === 'object' && !localData.largeCommercialImg.file) ? localData.largeCommercialImg.url : (typeof localData.largeCommercialImg === 'string' ? localData.largeCommercialImg : '')}
              placeholder="Or enter image URL"
              onChange={(e) => setLocalData(prev => ({ ...prev, largeCommercialImg: { file: null, url: e.target.value } }))}
            />
          </div>
        </div>

      <IconSelectorModal 
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onIconSelect={handleIconSelectInternal}
        currentIconPack="fa"
        currentIconName={editingServiceInfo.index !== null && localData[editingServiceInfo.type === 'residential' ? 'residentialServices' : 'commercialServices'][editingServiceInfo.index]?.icon}
      />
    </div>
  );
}


// NEW Editable Preview Component for Service Slider
function ServiceSliderEditablePreview({ 
  data, 
  onTitleChange, 
  onServiceItemChange, 
  onServiceIconClick,
  onToggleServiceType, // For "Switch to Commercial/Residential"
  currentServiceType // 'residential' or 'commercial'
}) {
  const { title = "Services", residentialServices = [], commercialServices = [] } = data;
  const currentServicesToDisplay = currentServiceType === 'commercial' ? commercialServices : residentialServices;
  
  const getDisplayUrl = (imageValue, defaultPath) => {
    if (imageValue && typeof imageValue === 'object' && imageValue.url) return imageValue.url;
    if (typeof imageValue === 'string') return imageValue;
    return defaultPath;
  };

  // Simplified rendering, focusing on editable parts. GSAP animations removed for brevity here,
  // but could be added back if needed for the editable preview.
  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg border border-gray-300">
      {/* Editable Section Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="text-3xl font-bold text-center w-full mb-6 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1"
        placeholder="Section Title"
      />

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => onToggleServiceType('residential')}
          className={`px-6 py-2 rounded-md font-medium ${currentServiceType === 'residential' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
        >
          Show Residential
        </button>
        <button
          onClick={() => onToggleServiceType('commercial')}
          className={`px-6 py-2 rounded-md font-medium ${currentServiceType === 'commercial' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
        >
          Show Commercial
        </button>
      </div>
      
      {/* Service Items Grid - Simplified for Click-to-Edit */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentServicesToDisplay.map((service, index) => (
          <div key={service.title + index} className="bg-white p-3 rounded-lg shadow flex flex-col items-center text-center">
            <div 
              className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl mb-2 cursor-pointer hover:bg-blue-700"
              onClick={() => onServiceIconClick(currentServiceType, index)}
              title="Click to change icon"
            >
              {service.icon ? React.createElement(resolveIcon(service.icon)) : <FaTools />}
            </div>
            <input
              type="text"
              value={service.title || ""}
              onChange={(e) => onServiceItemChange(currentServiceType, index, 'title', e.target.value)}
              className="font-semibold text-center w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 placeholder-gray-400"
              placeholder="Service Title"
            />
            {/* Link editing will remain in the panel below for now */}
            {/* {!isPreviewReadOnly && <p className="text-xs text-gray-500 mt-1 truncate w-full" title={service.link || '#'}>
              Link: {service.link || '#'}
            </p>} */}
          </div>
        ))}
      </div>
      {currentServicesToDisplay.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No {currentServiceType} services to display. Add them below.</p>
      )}
    </div>
  );
}


// SERVICE SLIDER COMPONENT
export default function ServiceSliderBlock({ readOnly = false, config = {}, onConfigChange }) {
  const [currentEditDisplayType, setCurrentEditDisplayType] = useState('residential'); // For editable preview
  const [isIconModalOpen, setIsIconModalOpen] = useState(false); // Unified Icon Modal state
  const [editingServiceInfo, setEditingServiceInfo] = useState({ type: null, index: null }); // Unified editing info
  const [isCommercialForReadOnly, setIsCommercialForReadOnly] = useState(false); // Added for read-only state

  const getDisplayUrl = (imageValue, defaultPath) => {
    if (imageValue && typeof imageValue === 'object' && imageValue.url) return imageValue.url;
    if (typeof imageValue === 'string') return imageValue;
    return defaultPath;
  };

  const initializeImageState = (imageConfig, defaultPath) => {
    if (imageConfig && typeof imageConfig === 'object' && imageConfig.url) return imageConfig;
    if (typeof imageConfig === 'string') return { file: null, url: imageConfig };
    return { file: null, url: defaultPath };
  };

  const [localData, setLocalData] = useState(() => {
    const initialConfig = config || {};
    return {
      ...initialConfig,
      title: initialConfig.title || "Services",
      residentialButtonText: initialConfig.residentialButtonText || "Residential",
      commercialButtonText: initialConfig.commercialButtonText || "Commercial",
      residentialServices: initialConfig.residentialServices?.map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9)})) || [],
      commercialServices: initialConfig.commercialServices?.map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9)})) || [],
      largeResidentialImg: initializeImageState(initialConfig.largeResidentialImg, "/assets/images/main_image_expanded.jpg"),
      largeCommercialImg: initializeImageState(initialConfig.largeCommercialImg, "/assets/images/commercialservices.jpg"),
    };
  });

  useEffect(() => {
    const currentConfig = config || {};
    setLocalData(prevLocalData => {
      const newResidentialImg = initializeImageState(currentConfig.largeResidentialImg, "/assets/images/main_image_expanded.jpg");
      const newCommercialImg = initializeImageState(currentConfig.largeCommercialImg, "/assets/images/commercialservices.jpg");

      if (prevLocalData.largeResidentialImg?.url?.startsWith('blob:') && prevLocalData.largeResidentialImg.url !== newResidentialImg.url) {
        URL.revokeObjectURL(prevLocalData.largeResidentialImg.url);
      }
      if (prevLocalData.largeCommercialImg?.url?.startsWith('blob:') && prevLocalData.largeCommercialImg.url !== newCommercialImg.url) {
        URL.revokeObjectURL(prevLocalData.largeCommercialImg.url);
      }

      return {
        ...prevLocalData,
        ...currentConfig,
        title: currentConfig.title || prevLocalData.title || "Services",
        residentialButtonText: currentConfig.residentialButtonText || prevLocalData.residentialButtonText || "Residential",
        commercialButtonText: currentConfig.commercialButtonText || prevLocalData.commercialButtonText || "Commercial",
        residentialServices: currentConfig.residentialServices?.map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9)})) || prevLocalData.residentialServices || [],
        commercialServices: currentConfig.commercialServices?.map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9)})) || prevLocalData.commercialServices || [],
        largeResidentialImg: newResidentialImg,
        largeCommercialImg: newCommercialImg,
      };
    });
  }, [config]);

  const displayTypeForEditing = readOnly ? (config?.isCommercial ? 'commercial' : 'residential') : currentEditDisplayType;
  const currentServicesToDisplay = displayTypeForEditing === 'commercial' ? (localData.commercialServices || []) : (localData.residentialServices || []);

  const handleToggleServiceType = (type) => {
    if (!readOnly) {
      setCurrentEditDisplayType(type);
    } else {
      // In readOnly mode, this would be controlled by a different mechanism if needed
      // For now, the readOnly view uses its own isCommercialForReadOnly state based on initial config
      // This function is primarily for edit mode toggle of currentEditDisplayType
      const newIsCommercial = type === 'commercial';
      // If we need to update a prop for read-only display type, it would be done here
      // e.g., onConfigChange({ ...localData, isCommercial: newIsCommercial });
      // However, the task is to make edit mode visually similar to read-only, so this primarily affects edit mode's `currentEditDisplayType`.
      // The read-only display itself uses `isCommercialForReadOnly` which is derived from `config.isCommercial`
    }
  };

  const updateLocalDataAndPropagate = (updater) => {
    setLocalData(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      if (onConfigChange) {
        onConfigChange(newState);
      }
      return newState;
    });
  };
  
  const handleSaveForPanel = () => {
    if (onConfigChange) {
      onConfigChange(localData);
    }
  };

  const handleServiceItemChange = (serviceType, index, field, value) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    updateLocalDataAndPropagate(prev => {
      const updatedServices = [...(prev[serviceListKey] || [])];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      return { ...prev, [serviceListKey]: updatedServices };
    });
  };

  const handleAddServiceToPanel = (serviceType, newServiceData) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    updateLocalDataAndPropagate(prev => ({
      ...prev,
      [serviceListKey]: [...(prev[serviceListKey] || []), {...newServiceData, id: Math.random().toString(36).substr(2,9)}]
    }));
  };
  
  const handleRemoveServiceFromPanel = (serviceType, index) => {
    const serviceListKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    updateLocalDataAndPropagate(prev => {
      const updatedServices = [...(prev[serviceListKey] || [])];
      updatedServices.splice(index, 1);
      return { ...prev, [serviceListKey]: updatedServices };
    });
  };

  const handleImageUploadForPanel = (fieldName) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const oldUrl = localData[fieldName]?.url;
    if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
    }
    const fileURL = URL.createObjectURL(file);
    updateLocalDataAndPropagate((prev) => ({
      ...prev,
      [fieldName]: { file: file, url: fileURL, name: file.name },
    }));
  };
  
  const openIconModalHandler = (serviceType, index) => {
    setEditingServiceInfo({ type: serviceType, index });
    setIsIconModalOpen(true);
  };

  const handleIconSelect = (pack, iconName) => {
    if (editingServiceInfo.type && editingServiceInfo.index !== null) {
      handleServiceItemChange(editingServiceInfo.type, editingServiceInfo.index, 'icon', iconName);
    }
    setIsIconModalOpen(false);
    setEditingServiceInfo({ type: null, index: null });
  };

  // Determine if we are in readOnly mode for display purposes of the preview section
  // The actual editing capability is controlled by the top-level readOnly prop
  const isPreviewReadOnly = readOnly; 

  // When in editing mode (i.e., !readOnly passed to ServiceSliderBlock),
  // the preview section itself should behave like the read-only version but with editable fields.
  // The `isCommercial` state for the main animated display will be `currentEditDisplayType === 'commercial'` if !readOnly,
  // or `config.isCommercial` if readOnly.
  
  const motionIsCommercial = isPreviewReadOnly ? (config?.isCommercial || false) : (currentEditDisplayType === 'commercial');
  const servicesForMotion = motionIsCommercial ? (localData.commercialServices || []) : (localData.residentialServices || []);

  // Remove the mt-3 class from the main wrapper div in edit mode to prevent extra space.
  const wrapperClassName = `w-full bg-black relative ${readOnly ? 'mt-3' : ''}`;

  if (!readOnly) {
    // EDITING MODE: Render the visually identical preview with editable fields, then the slimmed editor panel.
    return (
      <>
        {/* This is the combined Preview & Inline Edit Area */}
        <div className={wrapperClassName}>
          {/* SMALL SCREEN SECTION - Adapted for inline editing */}
          <div className="block md:hidden relative w-full">
            <div className="overflow-hidden w-full relative h-[40vh]">
              <motion.div
                animate={{ x: motionIsCommercial ? "-100vw" : "0%" }}
                transition={{ duration: 0.8 }}
                className="flex"
              >
                <img
                  src={getDisplayUrl(localData.largeResidentialImg, "/assets/images/main_img.jpg")}
                  alt="Residential Services"
                  className="w-full h-[50vh] object-cover"
                />
                <img
                  src={getDisplayUrl(localData.largeCommercialImg, "/assets/images/commercialservices.jpg")}
                  alt="Commercial Services"
                  className="w-full h-[50vh] object-cover"
                />
              </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-black z-10 pointer-events-none" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}/>
            {!isPreviewReadOnly ? (
              <input 
                type="text" 
                value={localData.title || "Services"} 
                onChange={(e) => updateLocalDataAndPropagate(prev => ({...prev, title: e.target.value}))} 
                className="absolute top-[1vh] left-1/2 transform -translate-x-1/2 text-white text-[10vw] font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-2 min-w-[70vw]"
                placeholder="Section Title"
              />
            ) : (
              <h2 className="absolute top-[1vh] left-1/2 transform -translate-x-1/2 text-white text-[10vw] font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20">
                {localData.title || "Services"}
              </h2>
            )}
            <div className="absolute bottom-[10vh] left-1/2 transform -translate-x-1/2 z-30">
              <div className="flex flex-row gap-3">
                <button
                  onClick={() => { if (readOnly) setIsCommercialForReadOnly(false); else handleToggleServiceType('residential'); }}
                  className={`flex items-center px-2 md:px-4 md:py-2 rounded-full border-1 mx-2 text-md ${!motionIsCommercial ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "bg-gray-500 text-white hover:bg-white hover:text-black"} transition-colors duration-300 font-sans`}
                >
                  <LucideHome className="mr-2" size={16} />
                  <p className="text-[3vw] font-sans">{localData.residentialButtonText || "Residential"}</p>
                </button>
                <button
                  onClick={() => { if (readOnly) setIsCommercialForReadOnly(true); else handleToggleServiceType('commercial'); }}
                  className={`flex items-center px-2 md:px-4 py-1 md:py-2 text-lg rounded-full border-1 mx-2 ${motionIsCommercial ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "bg-gray-500 hover:bg-white hover:text-black text-white"} transition-colors duration-300 font-sans`}
                >
                  <FaWarehouse className="mr-2" size={16} />
                  <p className="text-[3vw] font-sans">{localData.commercialButtonText || "Commercial"}</p>
                </button>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-[23vh] p-2 z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={motionIsCommercial ? "commercial-edit" : "residential-edit"} // Key change for animation
                  className="flex flex-row gap-4"
                  variants={containerVariants} initial="initial" animate="enter" exit="exit"
                >
                  {[...servicesForMotion].reverse().map((service, index) => (
                    <motion.div key={service.id || index} variants={itemVariants} className="flex flex-col items-center -mt-[14vh]">
                      <div
                        onClick={() => !isPreviewReadOnly && openIconModalHandler(displayTypeForEditing, index)}
                        className={`group whitespace-nowrap flex-col dark_button bg-banner w-[9vh] h-[9vh] p-2 md:w-24 md:h-24 rounded-full flex items-center justify-around text-white text-[5vw] hover:text-gray-200 hover:bg-gray-200 transition drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] ${!isPreviewReadOnly ? 'cursor-pointer' : ''}`}
                      >
                        {React.createElement(resolveIcon(service.icon), { className: "w-[8vw] h-[8vw] md:w-10 md:h-10" })}
                        {!isPreviewReadOnly ? (
                          <input 
                            type="text" 
                            value={service.title} 
                            onChange={(e) => handleServiceItemChange(displayTypeForEditing, index, 'title', e.target.value)}
                            className="text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded w-full truncate"
                            placeholder="Title"
                            onClick={(e) => e.stopPropagation()} // Prevent icon modal when clicking input
                          />
                        ) : (
                          <h3 className="text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                            {service.title}
                          </h3>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* LARGE SCREENS - Adapted for inline editing */}
          <div className="hidden md:block overflow-hidden">
            <div className="relative w-full h-[60vh]">
              <motion.div
                animate={{ x: motionIsCommercial ? "-100vw" : "0%" }}
                transition={{ duration: 1 }}
                className="flex w-[200%] h-full"
              >
                <img src={getDisplayUrl(localData.largeResidentialImg, "/assets/images/main_image_expanded.jpg")} alt="Residential Services" className="w-[100vw] h-full object-cover" />
                <img src={getDisplayUrl(localData.largeCommercialImg, "/assets/images/commercialservices.jpg")} alt="Commercial Services" className="w-[100vw] h-full object-cover" />
              </motion.div>
              <div className="absolute top-0 w-full flex justify-center">
                 {!isPreviewReadOnly ? (
                    <input 
                      type="text" 
                      value={localData.title || "Services"} 
                      onChange={(e) => updateLocalDataAndPropagate(prev => ({...prev, title: e.target.value}))} 
                      className="relative z-40 text-white text-[11.5vh] tracking-wider font-rye first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-2 min-w-[50vw]"
                      placeholder="Section Title"
                    />
                  ) : (
                    <h2 className="relative z-40 text-white text-[11.5vh] tracking-wider font-rye first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)]">
                      {localData.title || "Services"}
                    </h2>
                  )}
              </div>
              <div className="absolute bottom-[6vh] left-1/2 transform -translate-x-1/2 z-30">
                <div className="flex flex-row">
                  <button
                    onClick={() => { if (readOnly) setIsCommercialForReadOnly(false); else handleToggleServiceType('residential'); }}
                    className={`flex items-center px-4 py-2 rounded-full border-1 mx-2 text-lg ${!motionIsCommercial ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "bg-gray-500 text-white hover:bg-white hover:text-black"} transition-colors duration-300 font-sans`}
                  >
                    <LucideHome className="mr-2" size={30} /> {localData.residentialButtonText || "Residential"}
                  </button>
                  <button
                    onClick={() => { if (readOnly) setIsCommercialForReadOnly(true); else handleToggleServiceType('commercial'); }}
                    className={`flex items-center px-4 py-2 text-lg rounded-full border-1 mx-2 ${motionIsCommercial ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "bg-gray-500 hover:bg-white hover:text-black text-white"} transition-colors duration-300 font-sans`}
                  >
                    <Building2 className="mr-2" size={30} /> {localData.commercialButtonText || "Commercial"}
                  </button>
                </div>
              </div>
              <div className="absolute inset-0 flex items-end justify-center mb-[26vh]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={motionIsCommercial ? "commercial-lg-edit" : "residential-lg-edit"} // Key change
                    className="grid grid-cols-4 gap-[5.5vw]"
                    variants={containerVariants} initial="initial" animate="enter" exit="exit"
                  >
                    {[...servicesForMotion].reverse().map((service, index) => (
                      <motion.div key={service.id || index} variants={itemVariants} className="flex flex-col items-center">
                        <div 
                          onClick={() => !isPreviewReadOnly && openIconModalHandler(displayTypeForEditing, index)}
                          className={`dark_button bg-banner flex-col w-28 h-28 rounded-full flex items-center justify-center text-white text-[6vh] hover:text-black hover:bg-gray-200 transition drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] ${!isPreviewReadOnly ? 'cursor-pointer' : ''}`}
                        >
                          {React.createElement(resolveIcon(service.icon), { className: "w-[5vw] h-[5vw] md:w-10 md:h-10" })}
                           {!isPreviewReadOnly ? (
                            <input 
                              type="text" 
                              value={service.title} 
                              onChange={(e) => handleServiceItemChange(displayTypeForEditing, index, 'title', e.target.value)}
                              className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded w-full truncate"
                              placeholder="Title"
                              onClick={(e) => e.stopPropagation()} // Prevent icon modal when clicking input
                            />
                          ) : (
                            <h3 className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                              {service.title}
                            </h3>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <ServiceSliderEditorPanel 
          localData={localData} 
          setLocalData={updateLocalDataAndPropagate}
          onSave={handleSaveForPanel}
          onServiceChange={handleServiceItemChange}
          onAddService={handleAddServiceToPanel}
          onRemoveService={handleRemoveServiceFromPanel}
          onImageUpload={handleImageUploadForPanel}
          onIconSelect={handleIconSelect} // Unified icon selection handler for panel
        />
        <IconSelectorModal 
          isOpen={isIconModalOpen}
          onClose={() => setIsIconModalOpen(false)}
          onIconSelect={handleIconSelect} // Unified icon selection
          currentIconPack="fa"
          currentIconName={editingServiceInfo.index !== null && localData[editingServiceInfo.type === 'residential' ? 'residentialServices' : 'commercialServices']?.[editingServiceInfo.index]?.icon}
        />
      </>
    );
  }

  // READ-ONLY rendering (remains largely the same, but uses localData and motionIsCommercial)
  return (
    <div className={wrapperClassName}> 
      {/* SMALL SCREEN SECTION */}
      <div className="block md:hidden relative w-full">
        <div className="overflow-hidden w-full relative h-[40vh]">
          <motion.div
            animate={{ x: motionIsCommercial ? "-100vw" : "0%" }} // Use motionIsCommercial
            transition={{ duration: 0.8 }}
            className="flex"
          >
            <img src={getDisplayUrl(localData.largeResidentialImg, "/assets/images/main_img.jpg")} alt="Residential Services" className="w-full h-[50vh] object-cover" />
            <img src={getDisplayUrl(localData.largeCommercialImg, "/assets/images/commercialservices.jpg")} alt="Commercial Services" className="w-full h-[50vh] object-cover" />
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-black z-10 pointer-events-none" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}/>
        <h2 className="absolute top-[1vh] left-1/2 transform -translate-x-1/2 text-white text-[10vw] font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20">
          {localData.title || "Services"}
        </h2>
        <div className="absolute bottom-[10vh] left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex flex-row gap-3">
            <button
              onClick={() => { if (readOnly) setIsCommercialForReadOnly(false); else handleToggleServiceType('residential'); }}
              className={`flex items-center px-2 md:px-4 md:py-2 rounded-full border-1 mx-2 text-md ${!motionIsCommercial ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "bg-gray-500 text-white hover:bg-white hover:text-black"} transition-colors duration-300 font-sans`}
            >
              <LucideHome className="mr-2" size={16} />
              <p className="text-[3vw] font-sans">{localData.residentialButtonText || "Residential"}</p>
            </button>
            <button
              onClick={() => { if (readOnly) setIsCommercialForReadOnly(true); else handleToggleServiceType('commercial'); }}
              className={`flex items-center px-2 md:px-4 py-1 md:py-2 text-lg rounded-full border-1 mx-2 ${motionIsCommercial ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "bg-gray-500 hover:bg-white hover:text-black text-white"} transition-colors duration-300 font-sans`}
            >
              <FaWarehouse className="mr-2" size={16} />
              <p className="text-[3vw] font-sans">{localData.commercialButtonText || "Commercial"}</p>
            </button>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-[23vh] p-2 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={motionIsCommercial ? "commercial" : "residential"} // Use motionIsCommercial
              className="flex flex-row gap-4"
              variants={containerVariants} initial="initial" animate="enter" exit="exit"
            >
              {[...servicesForMotion].reverse().map((service) => (
                <motion.div key={service.id || service.title} variants={itemVariants} className="flex flex-col items-center -mt-[14vh]">
                  <Link to={service.link || '#'}>
                    <div className="group whitespace-nowrap flex-col dark_button bg-banner w-[9vh] h-[9vh] p-2 md:w-24 md:h-24 rounded-full flex items-center justify-around text-white text-[5vw] hover:text-gray-200 hover:bg-gray-200 transition drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]">
                      {React.createElement(resolveIcon(service.icon), { className: "w-[8vw] h-[8vw] md:w-10 md:h-10" })}
                      <h3 className="text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                        {service.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* LARGE SCREENS */}
      <div className="hidden md:block overflow-hidden">
        <div className="relative w-full h-[60vh]">
          <motion.div
            animate={{ x: motionIsCommercial ? "-100vw" : "0%" }} // Use motionIsCommercial
            transition={{ duration: 1 }}
            className="flex w-[200%] h-full"
          >
            <img src={getDisplayUrl(localData.largeResidentialImg, "/assets/images/main_image_expanded.jpg")} alt="Residential Services" className="w-[100vw] h-full object-cover" />
            <img src={getDisplayUrl(localData.largeCommercialImg, "/assets/images/commercialservices.jpg")} alt="Commercial Services" className="w-[100vw] h-full object-cover" />
          </motion.div>
          <div className="absolute top-0 w-full flex justify-center">
            <h2 className="relative z-40 text-white text-[11.5vh] tracking-wider font-rye first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)]">
              {localData.title || "Services"}
            </h2>
          </div>
          <div className="absolute bottom-[6vh] left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex flex-row">
              <button
                onClick={() => { if (readOnly) setIsCommercialForReadOnly(false); else handleToggleServiceType('residential'); }}
                className={`flex items-center px-4 py-2 rounded-full border-1 mx-2 text-lg ${!motionIsCommercial ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "bg-gray-500 text-white hover:bg-white hover:text-black"} transition-colors duration-300 font-sans`}
              >
                <LucideHome className="mr-2" size={30} /> {localData.residentialButtonText || "Residential"}
              </button>
              <button
                onClick={() => { if (readOnly) setIsCommercialForReadOnly(true); else handleToggleServiceType('commercial'); }}
                className={`flex items-center px-4 py-2 text-lg rounded-full border-1 mx-2 ${motionIsCommercial ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "bg-gray-500 hover:bg-white hover:text-black text-white"} transition-colors duration-300 font-sans`}
              >
                <Building2 className="mr-2" size={30} /> {localData.commercialButtonText || "Commercial"}
              </button>
            </div>
          </div>
          <div className="absolute inset-0 flex items-end justify-center mb-[26vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={motionIsCommercial ? "commercial-lg" : "residential-lg"} // Use motionIsCommercial
                className="grid grid-cols-4 gap-[5.5vw]"
                variants={containerVariants} initial="initial" animate="enter" exit="exit"
              >
                {[...servicesForMotion].reverse().map((service, index) => (
                  <motion.div key={service.id || service.title} variants={itemVariants} className="flex flex-col items-center">
                    <Link to={service.link || '#'}>
                      <div className="dark_button bg-banner flex-col w-28 h-28 rounded-full flex items-center justify-center text-white text-[6vh] hover:text-black hover:bg-gray-200 transition drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                        {React.createElement(resolveIcon(service.icon), { className: "w-[5vw] h-[5vw] md:w-10 md:h-10" })}
                        <h3 className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                          {service.title}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 