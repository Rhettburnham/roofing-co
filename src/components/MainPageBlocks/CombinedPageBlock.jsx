import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "../StarRating";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";
import IconSelectorModal from "../common/IconSelectorModal";

// Icons for Services - Make sure all icons are available
import {
  FaTools,
  FaFan,
  FaPaintRoller,
  FaTint,
  FaHome,
  FaBuilding,
  FaWarehouse,
  // FaChimney might not be available, use an alternative
  FaSmog, // Alternative to FaChimney
  FaBroom,
  FaHardHat,
} from "react-icons/fa";
import googleIcon from "/assets/images/hero/googleimage.png";

// Additional icons from lucide-react
import { Home, Building2 } from "lucide-react";

/**
 * Helper function to resolve icon name strings to React components
 * @param {string} iconName - Name of the icon
 * @returns {React.ComponentType} - The icon component
 */
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

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS FOR THE SERVICES BUTTONS (unchanged)
───────────────────────────────────────────────────────────── */
const containerVariants = {
  enter: {
    transition: {
      // Stagger children from last to first on enter
      staggerChildren: 0.07,
      staggerDirection: 1,
    },
  },
  exit: {
    transition: {
      // Stagger children from last to first on exit
      staggerChildren: 0.07,
      staggerDirection: 1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: "-50%" },
  enter: {
    opacity: 1,
    x: "0%",
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.3 },
  },
};

/* ─────────────────────────────────────────────────────────────
   A SINGLE TESTIMONIAL ITEM COMPONENT
───────────────────────────────────────────────────────────── */
const TestimonialItem = ({ testimonial }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleExpandClick = () => setIsExpanded(!isExpanded);

  // Show truncated text on small screens unless expanded
  const truncated =
    testimonial.text.length > 100
      ? testimonial.text.slice(0, 250) + "..."
      : testimonial.text;

  return (
    <div
      className="p-2 md:p-4 bg-white rounded-lg custom-circle-shadow relative cursor-pointer flex flex-col h-full overflow-hidden justify-between"
      onClick={handleExpandClick}
    >
      {/* Name, rating, date with logo to the left */}
      <div className="flex items-start mb-2 flex-shrink-0">
        {/* Logo on left, vertically centered with name and date */}
        {testimonial.link && testimonial.logo && (
          <a
            href={testimonial.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center self-center mr-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()} // don't toggle on logo click
          >
            <img
              src={testimonial.logo}
              alt="Logo"
              className="w-6 h-6 md:w-9 md:h-9"
            />
          </a>
        )}

        {/* Name and date in column with reduced spacing */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[3vw] md:text-[1.8vh] font-semibold text-black font-sans truncate min-w-0 overflow-hidden text-center">
              {testimonial.name}
            </p>
            <div className="flex-shrink-0">
              <StarRating rating={testimonial.stars} />
            </div>
          </div>
          <p className="text-gray-700 text-[3vw] md:text-[1.4vh] md:-mt-2 truncate text-center">
            {testimonial.date}
          </p>
        </div>
      </div>

      {/* Text */}
      <div className="flex-grow min-h-0 flex items-center justify-center">
        <div className="w-full text-center">
          <p className="text-gray-800 indent-3 break-words text-center">
            <span className="text-[3.2vw] md:text-[2.2vh] block md:hidden break-words">
              {isExpanded ? testimonial.text : truncated}
            </span>
            <span className="md:text-xs hidden md:block font-serif break-words">
              {testimonial.text}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   EDITOR PANEL COMPONENT
   This component handles the editing interface for CombinedPageBlock
───────────────────────────────────────────────────────────── */
function CombinedPageEditorPanel({ localData, onPanelChange }) {
  const [activeTab, setActiveTab] = useState("services"); // Default to services or general
  const [editingIconInfo, setEditingIconInfo] = useState({ type: null, index: null, for: null }); // for: 'service'
  const [isModalOpen, setIsModalOpen] = useState(false); // Separate modal state for this panel

  const handleFieldChange = (field, value) => {
    onPanelChange(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceListChange = (serviceType, index, field, value) => {
    const listKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    onPanelChange(prev => {
      const services = [...(prev[listKey] || [])];
      if (services[index]) {
        services[index] = { ...services[index], [field]: value };
      }
      return { ...prev, [listKey]: services };
    });
  };

  const handleAddService = (serviceType) => {
    const listKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    const iconOptions = ['FaTools', 'FaFan', 'FaPaintRoller', 'FaTint', 'FaHome', 'FaBuilding', 'FaWarehouse', 'FaSmog', 'FaBroom', 'FaHardHat'];
    const newService = { id: Math.random().toString(36).substr(2,9), icon: iconOptions[Math.floor(Math.random() * iconOptions.length)], iconPack: 'fa', title: `New ${serviceType} Service`, link: "#" };
    onPanelChange(prev => ({ ...prev, [listKey]: [...(prev[listKey] || []), newService] }));
  };

  const handleRemoveService = (serviceType, index) => {
    const listKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    onPanelChange(prev => ({ ...prev, [listKey]: prev[listKey].filter((_, i) => i !== index) }));
  };

  const openServiceIconModalForPanel = (serviceType, index) => {
    setEditingIconInfo({ type: serviceType, index, for: 'service' });
    setIsModalOpen(true);
  };

  const handlePanelIconSelect = (pack, iconName) => {
    if (editingIconInfo.for === 'service' && editingIconInfo.type && editingIconInfo.index !== null) {
        const listKey = editingIconInfo.type === 'residential' ? 'residentialServices' : 'commercialServices';
        onPanelChange(prev => {
            const services = [...(prev[listKey] || [])];
            if (services[editingIconInfo.index]) {
                services[editingIconInfo.index] = { ...services[editingIconInfo.index], icon: iconName, iconPack: pack };
            }
            return { ...prev, [listKey]: services };
        });
    }
    setIsModalOpen(false);
    setEditingIconInfo({ type: null, index: null, for: null });
  };

  const handleImageUploadForPanel = (fieldName, file) => {
    if (!file) return;
    if (localData[fieldName]?.url?.startsWith('blob:')) URL.revokeObjectURL(localData[fieldName].url);
    const fileURL = URL.createObjectURL(file);
    onPanelChange({ [fieldName]: { file, url: fileURL, name: file.name }});
  };

  const handleImageUrlChangeForPanel = (fieldName, urlValue) => {
    if (localData[fieldName]?.url?.startsWith('blob:')) URL.revokeObjectURL(localData[fieldName].url);
    onPanelChange({ [fieldName]: { file: null, url: urlValue, name: urlValue.split('/').pop() }});
  };
  
  const handleTestimonialChange = (index, field, value) => {
    onPanelChange(prev => {
        const reviews = [...(prev.googleReviews || [])];
        if(reviews[index]) reviews[index] = {...reviews[index], [field]: field === 'stars' ? Number(value) : value };
        return {...prev, googleReviews: reviews};
    });
  };
  const handleAddTestimonial = () => {
    onPanelChange(prev => ({...prev, googleReviews: [...(prev.googleReviews || []), {name: "New Customer", stars: 5, date: "Date", text:"Review text", logo: googleIcon, link:"#"}]}));
  };
  const handleRemoveTestimonial = (index) => {
    onPanelChange(prev => ({...prev, googleReviews: prev.googleReviews.filter((_,i) => i !== index)}));
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mt-0 max-h-[80vh] overflow-y-auto space-y-4">
      <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Combined Block Settings</h2>
      <div className="flex border-b border-gray-700 mb-3">
        {['services', 'testimonials', 'images', 'colors'].map(tabName => (
            <button key={tabName} className={`px-3 py-1.5 text-xs sm:text-sm ${activeTab === tabName ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'} rounded-t`} onClick={() => setActiveTab(tabName)}>{tabName.charAt(0).toUpperCase() + tabName.slice(1)}</button>
        ))}
      </div>

      {activeTab === 'services' && (
        <div className="space-y-4">
            <div><label className="block text-sm font-medium">Main Title (for Service Slider part):</label><input type="text" value={localData.title || ""} onChange={(e) => handleFieldChange('title', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
            <div><label className="block text-sm font-medium">Residential Button Text:</label><input type="text" value={localData.residentialButtonText || ""} onChange={(e) => handleFieldChange('residentialButtonText', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
            <div><label className="block text-sm font-medium">Commercial Button Text:</label><input type="text" value={localData.commercialButtonText || ""} onChange={(e) => handleFieldChange('commercialButtonText', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
            <div><label className="block text-sm font-medium">Default Service View:</label><select value={localData.isCommercial ? 'commercial' : 'residential'} onChange={(e) => handleFieldChange('isCommercial', e.target.value === 'commercial')} className="w-full bg-gray-700 p-1.5 rounded text-sm"><option value="residential">Residential</option><option value="commercial">Commercial</option></select></div>
            
            {[ 'residential', 'commercial'].map(serviceType => (
                <div key={serviceType} className="pt-2 mt-2 border-t border-gray-600">
                    <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-md font-medium">{serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Services</h4>
                        <button onClick={() => handleAddService(serviceType)} className="bg-blue-500 hover:bg-blue-600 px-2 py-0.5 rounded text-white text-xs">+ Add</button>
                    </div>
                    {(localData[serviceType === 'residential' ? 'residentialServices' : 'commercialServices'] || []).map((service, index) => (
                        <div key={service.id || index} className="bg-gray-700 p-1.5 rounded mb-1.5 text-xs">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium truncate w-1/2">{service.title || `Service ${index+1}`}</span>
                                <button onClick={() => handleRemoveService(serviceType, index)} className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px]">X</button>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                <div><label>Title:</label><input type="text" value={service.title || ""} onChange={e => handleServiceListChange(serviceType, index, 'title', e.target.value)} className="w-full bg-gray-600 p-1 rounded"/></div>
                                <div><label>Link URL:</label><input type="text" value={service.link || ""} onChange={e => handleServiceListChange(serviceType, index, 'link', e.target.value)} className="w-full bg-gray-600 p-1 rounded"/></div>
                            </div>
                            <button onClick={() => openServiceIconModalForPanel(serviceType, index)} className="mt-1 text-xs bg-gray-600 hover:bg-gray-500 p-1 rounded w-full text-left">Icon: {service.iconPack}/{service.icon || 'N/A'}</button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
      )}

      {activeTab === 'testimonials' && (
        <div className="space-y-4">
            <div><label className="block text-sm font-medium">Testimonial Section Title:</label><input type="text" value={localData.testimonialTitle || ""} onChange={(e) => handleFieldChange('testimonialTitle', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
            <div><label className="block text-sm font-medium">Review Button Text:</label><input type="text" value={localData.reviewButtonText || ""} onChange={(e) => handleFieldChange('reviewButtonText', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
            <div><label className="block text-sm font-medium">Review Button Link:</label><input type="text" value={localData.reviewButtonLink || ""} onChange={(e) => handleFieldChange('reviewButtonLink', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-600"><h4 className="text-md font-medium">Reviews</h4><button onClick={handleAddTestimonial} className="bg-blue-500 hover:bg-blue-600 px-2 py-0.5 rounded text-white text-xs">+ Add</button></div>
            {(localData.googleReviews || []).map((review, index) => (
                <div key={index} className="bg-gray-700 p-1.5 rounded mb-1.5 text-xs">
                    <div className="flex justify-between items-center mb-1"><span className="font-medium truncate w-3/4">{review.name} - {review.date}</span><button onClick={() => handleRemoveTestimonial(index)} className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px]">X</button></div>
                    <div className="grid grid-cols-2 gap-1.5 mb-1">
                        <div><label>Name:</label><input type="text" value={review.name || ""} onChange={e => handleTestimonialChange(index, 'name', e.target.value)} className="w-full bg-gray-600 p-1 rounded"/></div>
                        <div><label>Date:</label><input type="text" value={review.date || ""} onChange={e => handleTestimonialChange(index, 'date', e.target.value)} className="w-full bg-gray-600 p-1 rounded"/></div>
                    </div>
                    <div className="mb-1"><label>Stars (1-5):</label><input type="number" min="1" max="5" value={review.stars || 5} onChange={e => handleTestimonialChange(index, 'stars', e.target.value)} className="w-full bg-gray-600 p-1 rounded"/></div>
                    <div className="mb-1"><label>Text:</label><textarea value={review.text || ""} onChange={e => handleTestimonialChange(index, 'text', e.target.value)} className="w-full bg-gray-600 p-1 rounded h-16"/></div>
                    <div className="mb-1"><label>Link URL:</label><input type="text" value={review.link || ""} onChange={e => handleTestimonialChange(index, 'link', e.target.value)} className="w-full bg-gray-600 p-1 rounded"/></div>
                    <div><label>Logo URL:</label><input type="text" value={review.logo || ""} onChange={e => handleTestimonialChange(index, 'logo', e.target.value)} className="w-full bg-gray-600 p-1 rounded"/></div>
                </div>
            ))}
        </div>
      )}

      {activeTab === 'images' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Residential Banner Image:</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUploadForPanel('largeResidentialImg', e.target.files?.[0])} className="mb-1 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                <input type="text" value={getDisplayUrl(localData.largeResidentialImg, '')} placeholder="Or image URL" onChange={(e) => handleImageUrlChangeForPanel('largeResidentialImg', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded text-xs"/>
                {getDisplayUrl(localData.largeResidentialImg) && <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Preview" className="mt-1 h-20 w-auto object-cover rounded border"/>}
            </div>
            <div><label className="block text-sm font-medium mb-1">Commercial Banner Image:</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUploadForPanel('largeCommercialImg', e.target.files?.[0])} className="mb-1 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                <input type="text" value={getDisplayUrl(localData.largeCommercialImg, '')} placeholder="Or image URL" onChange={(e) => handleImageUrlChangeForPanel('largeCommercialImg', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded text-xs"/>
                {getDisplayUrl(localData.largeCommercialImg) && <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Preview" className="mt-1 h-20 w-auto object-cover rounded border"/>}
            </div>
        </div>
      )}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Active Service Button BG Color:</label><input type="color" className="mt-1 block w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm" value={localData.activeButtonBgColor || '#FF5733'} onChange={(e) => handleFieldChange('activeButtonBgColor', e.target.value)}/></div>
            <div><label className="block text-sm font-medium">Inactive Service Button BG Color:</label><input type="color" className="mt-1 block w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm" value={localData.inactiveButtonBgColor || '#6c757d'} onChange={(e) => handleFieldChange('inactiveButtonBgColor', e.target.value)}/></div>
        </div>
      )}

      <IconSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onIconSelect={handlePanelIconSelect} currentIconPack={editingIconInfo.for === 'service' && editingIconInfo.type ? localData[editingIconInfo.type === 'residential' ? 'residentialServices' : 'commercialServices']?.[editingIconInfo.index]?.iconPack || 'fa' : 'fa'} currentIconName={editingIconInfo.for === 'service' && editingIconInfo.type ? localData[editingIconInfo.type === 'residential' ? 'residentialServices' : 'commercialServices']?.[editingIconInfo.index]?.icon : null} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMBINED PAGE IMAGES CONTROLS
   Using standard PanelImagesController
───────────────────────────────────────────────────────────── */
const CombinedPageImagesControls = ({ currentData, onControlsChange, themeColors }) => {
  // Handle main hero image
  const heroImagesArray = currentData.heroImage ? [{
    id: 'hero_image',
    url: getDisplayUrl(currentData.heroImage, "/assets/images/hero/default-background.jpg"),
    file: currentData.heroImage?.file || null,
    name: 'Hero Background Image',
    originalUrl: currentData.heroImage?.originalUrl || "/assets/images/hero/default-background.jpg",
    type: 'hero'
  }] : [];

  const handleHeroImageChange = (newImagesArray) => {
    const heroImage = newImagesArray.length > 0 ? {
      file: newImagesArray[0].file,
      url: newImagesArray[0].url,
      name: newImagesArray[0].name,
      originalUrl: newImagesArray[0].originalUrl
    } : null;
    onControlsChange({ heroImage });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <h3 className="text-sm font-semibold mb-3">Combined Page Images</h3>
      
      <div className="space-y-6">
        {/* Hero Background Image */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Hero Background Image</h4>
          <PanelImagesController
            currentData={{ images: heroImagesArray }}
            onControlsChange={(data) => handleHeroImageChange(data.images || [])}
            imageArrayFieldName="images"
            maxImages={1}
          />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   COMBINED PAGE COLOR CONTROLS
   Using standard ThemeColorPicker
───────────────────────────────────────────────────────────── */
const CombinedPageColorControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ [fieldName]: value });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <h3 className="text-sm font-semibold mb-3">Combined Page Colors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Hero Background Color:"
          currentColorValue={currentData.heroBackgroundColor || '#1F2937'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="heroBackgroundColor"
        />
        <ThemeColorPicker
          label="Text Color:"
          currentColorValue={currentData.textColor || '#FFFFFF'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="textColor"
        />
        <ThemeColorPicker
          label="Service Button Color:"
          currentColorValue={currentData.serviceButtonColor || '#3B82F6'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="serviceButtonColor"
        />
        <ThemeColorPicker
          label="Testimonial Background:"
          currentColorValue={currentData.testimonialBackgroundColor || '#F3F4F6'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="testimonialBackgroundColor"
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   COMBINED PAGE STYLING CONTROLS
   Using standard PanelStylingController
───────────────────────────────────────────────────────────── */
const CombinedPageStylingControls = ({ currentData, onControlsChange }) => {
  return (
    <PanelStylingController
      currentData={currentData}
      onControlsChange={onControlsChange}
      blockType="CombinedPageBlock"
      controlType="height"
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   COMBINEDPAGE COMPONENT
   (All styling, no Yelp toggles — only Google data)
───────────────────────────────────────────────────────────── */
export default function CombinedPageBlock({ readOnly = false, config = {}, onConfigChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCommercial, setIsCommercial] = useState(false);
  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);
  const [googleReviews, setGoogleReviews] = useState([]);

  const getDisplayUrl = (imageValue, defaultPath) => {
    if (imageValue && typeof imageValue === 'object' && imageValue.url) {
      return imageValue.url;
    }
    if (typeof imageValue === 'string') {
      return imageValue;
    }
    return defaultPath;
  };

  // Helper to initialize image state: handles string path or {file, url} object
  const initializeImageState = (imageConfig, defaultPath) => {
    if (imageConfig && typeof imageConfig === 'object' && imageConfig.url) {
      return imageConfig;
    }
    if (typeof imageConfig === 'string') {
      return { file: null, url: imageConfig };
    }
    return { file: null, url: defaultPath };
  };

  const [localData, setLocalData] = useState({
    title: config.title || "Choose Your Service Type",
    testimonialTitle: config.testimonialTitle || "Our Reviews", 
    reviewButtonText: config.reviewButtonText || "Leave us a Review!",
    residentialServices: config.residentialServices || [],
    commercialServices: config.commercialServices || [],
    testimonials: config.testimonials || [],
    heroImage: initializeImageState(config.heroImage, "/assets/images/hero/default-background.jpg"),
    // Add standard color properties
    heroBackgroundColor: config.heroBackgroundColor || '#1F2937',
    textColor: config.textColor || '#FFFFFF',
    serviceButtonColor: config.serviceButtonColor || '#3B82F6',
    testimonialBackgroundColor: config.testimonialBackgroundColor || '#F3F4F6',
    styling: config.styling || { desktopHeightVH: 40, mobileHeightVW: 70 }
  });

  const [currentServiceDisplayType, setCurrentServiceDisplayType] = useState(localData.isCommercial ? 'commercial' : 'residential');
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingServiceInfoForIcon, setEditingServiceInfoForIcon] = useState({ type: null, index: null });
  const prevReadOnlyRef = useRef(readOnly);

  // Sync with config prop
  useEffect(() => {
    if (config) {
      setLocalData(prev => {
        const newResImg = initializeImageState(config.largeResidentialImg, prev.largeResidentialImg?.url);
        const newComImg = initializeImageState(config.largeCommercialImg, prev.largeCommercialImg?.url);
        if(prev.largeResidentialImg?.file && prev.largeResidentialImg.url?.startsWith('blob:') && prev.largeResidentialImg.url !== newResImg.url) URL.revokeObjectURL(prev.largeResidentialImg.url);
        if(prev.largeCommercialImg?.file && prev.largeCommercialImg.url?.startsWith('blob:') && prev.largeCommercialImg.url !== newComImg.url) URL.revokeObjectURL(prev.largeCommercialImg.url);

        const updated = {
            ...prev,
            ...config,
            title: config.title !== undefined ? config.title : prev.title,
            isCommercial: config.isCommercial !== undefined ? config.isCommercial : prev.isCommercial,
            residentialServices: (config.residentialServices || prev.residentialServices || []).map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9), link: s.link || "#", iconPack: s.iconPack || 'fa'})),
            commercialServices: (config.commercialServices || prev.commercialServices || []).map(s => ({...s, id: s.id || Math.random().toString(36).substr(2,9), link: s.link || "#", iconPack: s.iconPack || 'fa'})),
            largeResidentialImg: newResImg,
            largeCommercialImg: newComImg,
            isCommercial: currentConfig.isCommercial !== undefined ? currentConfig.isCommercial : prevLocalData.isCommercial || false,
        };
        if (prevReadOnlyRef.current === true && readOnly === false) { // Entering edit mode
            setCurrentServiceDisplayType(updated.isCommercial ? 'commercial' : 'residential');
        }
        return updated;
      });
    }
  }, [config, readOnly]);

  // Save on finishing edit
  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("CombinedPageBlock: Editing finished. Calling onConfigChange.");
        const dataToSave = { ...localData };
        if (localData.largeResidentialImg?.file) dataToSave.largeResidentialImg = { url: localData.largeResidentialImg.name, name: localData.largeResidentialImg.name };
        if (localData.largeCommercialImg?.file) dataToSave.largeCommercialImg = { url: localData.largeCommercialImg.name, name: localData.largeCommercialImg.name };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (localData.largeResidentialImg?.file && localData.largeResidentialImg.url?.startsWith('blob:')) URL.revokeObjectURL(localData.largeResidentialImg.url);
      if (localData.largeCommercialImg?.file && localData.largeCommercialImg.url?.startsWith('blob:')) URL.revokeObjectURL(localData.largeCommercialImg.url);
    };
  }, [localData.largeResidentialImg, localData.largeCommercialImg]);

  // Handlers for inline edits in preview
  const handleMainTitleChange = (newTitle) => setLocalData(prev => ({ ...prev, title: newTitle }));
  const handleServiceItemTitleChange = (serviceType, index, newTitle) => {
    const listKey = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    setLocalData(prev => {
      const services = [...(prev[listKey] || [])];
      if (services[index]) services[index] = { ...services[index], title: newTitle };
      return { ...prev, [listKey]: services };
    });
  };
  const handleTestimonialTitleChange = (newTitle) => setLocalData(prev => ({ ...prev, testimonialTitle: newTitle }));
  const handleReviewButtonTextChange = (newText) => setLocalData(prev => ({...prev, reviewButtonText: newText }));

  // Handler for changes from EditorPanel
  const handlePanelChange = (updater) => {
    setLocalData(prevState => {
        const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
        if (newState.hasOwnProperty('isCommercial')) {
            setCurrentServiceDisplayType(newState.isCommercial ? 'commercial' : 'residential');
        }
        return newState;
    });
  };

  const openServiceIconModal = (serviceType, serviceIndex) => {
    if(readOnly) return;
    setEditingServiceInfoForIcon({ type: serviceType, index: serviceIndex });
    setIsIconModalOpen(true);
  };

  const handleServiceIconSelect = (pack, iconName) => {
    if (editingServiceInfoForIcon.type && editingServiceInfoForIcon.index !== null) {
      const listKey = editingServiceInfoForIcon.type === 'residential' ? 'residentialServices' : 'commercialServices';
      setLocalData(prev => {
        const services = [...(prev[listKey] || [])];
        if (services[editingServiceInfoForIcon.index]) {
          services[editingServiceInfoForIcon.index] = { ...services[editingServiceInfoForIcon.index], icon: iconName, iconPack: pack };
        }
        return { ...prev, [listKey]: services };
      });
    }
    setIsIconModalOpen(false);
    setEditingServiceInfoForIcon({ type: null, index: null });
  };

  // --- Preview Rendering --- 
  const displayServiceType = readOnly ? (localData.isCommercial ? 'commercial' : 'residential') : currentServiceDisplayType;
  const servicesToDisplay = displayServiceType === 'commercial' ? (localData.commercialServices || []) : (localData.residentialServices || []);
  const wrapperClass = `w-full bg-black ${readOnly ? 'mt-3' : ''}`;
  const currentActiveBtnColor = localData.activeButtonBgColor;
  const currentInactiveBtnColor = localData.inactiveButtonBgColor;

  const renderServiceSliderPart = () => (
    <div className={wrapperClass}>
        {/* Small Screen */}
        <div className="block md:hidden relative w-full">
            <div className="overflow-hidden w-full relative h-[40vh]">
                <motion.div animate={{ x: displayServiceType === 'commercial' ? "-100%" : "0%" }} transition={{ duration: 0.8 }} className="flex w-[200%] h-full">
                    <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Residential Services" className="w-full h-full object-cover" />
                    <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Commercial Services" className="w-full h-full object-cover" />
                </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-black z-10 pointer-events-none" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}/>
            {readOnly ? (
                <h2 className="absolute top-[1vh] left-1/2 transform -translate-x-1/2 text-white text-[10vw] font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20 select-none">{localData.title}</h2>
            ) : (
                <input type="text" value={localData.title} onChange={(e) => handleMainTitleChange(e.target.value)} className="absolute top-[1vh] left-1/2 transform -translate-x-1/2 text-white text-[10vw] font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-20 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-2 min-w-[70vw]" placeholder="Block Title"/>
            )}
            <div className="absolute bottom-[10vh] left-1/2 transform -translate-x-1/2 z-30">
                <div className="flex flex-row gap-3">
                    <button onClick={() => readOnly ? handlePanelChange({isCommercial: false}) : setCurrentServiceDisplayType('residential')} style={{ backgroundColor: displayServiceType === 'residential' ? currentActiveBtnColor : currentInactiveBtnColor }} className={`flex items-center px-2 md:px-4 md:py-2 rounded-full border-1 mx-2 text-md ${displayServiceType === 'residential' ? "text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "text-white hover:opacity-80"} transition-colors duration-300 font-sans`}>
                        <Home className="mr-2" size={16} /><p className="text-[3vw] font-sans">{localData.residentialButtonText}</p>
                    </button>
                    <button onClick={() => readOnly ? handlePanelChange({isCommercial: true}) : setCurrentServiceDisplayType('commercial')} style={{ backgroundColor: displayServiceType === 'commercial' ? currentActiveBtnColor : currentInactiveBtnColor }} className={`flex items-center px-2 md:px-4 py-1 md:py-2 text-lg rounded-full border-1 mx-2 ${displayServiceType === 'commercial' ? "text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "text-white hover:opacity-80"} transition-colors duration-300 font-sans`}>
                        <FaWarehouse className="mr-2" size={16} /><p className="text-[3vw] font-sans">{localData.commercialButtonText}</p>
                    </button>
                </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-[23vh] p-2 z-20">
                <AnimatePresence mode="wait">
                    <motion.div key={displayServiceType} className="flex flex-row gap-4" variants={containerVariants} initial="initial" animate="enter" exit="exit">
                        {servicesToDisplay.slice().reverse().map((service, idx_rev) => {
                            const originalIdx = servicesToDisplay.length - 1 - idx_rev;
                            return (
                                <motion.div key={service.id || originalIdx} variants={itemVariants} className="flex flex-col items-center -mt-[14vh]">
                                    <div onClick={() => openServiceIconModal(displayServiceType, originalIdx)} className={`group whitespace-nowrap flex-col dark_button bg-banner w-[9vh] h-[9vh] p-2 md:w-24 md:h-24 rounded-full flex items-center justify-around text-white text-[5vw] hover:text-gray-200 hover:bg-gray-200 transition drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}>
                                        {React.createElement(resolveIcon(service.icon), { className: "w-[8vw] h-[8vw] md:w-10 md:h-10" })}
                                        {readOnly ? (<h3 className="text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">{service.title}</h3>) 
                                                  : (<input type="text" value={service.title} onChange={(e) => handleServiceItemTitleChange(displayServiceType, originalIdx, e.target.value)} className="text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded w-full truncate" placeholder="Title" onClick={(e)=>e.stopPropagation()}/>)}
                                    </div>
                                    {readOnly ? (<Link to={service.link || '#'} className="text-xs text-blue-400 hover:underline mt-1">View</Link>) : (<span className="text-xs text-gray-400 mt-1">Link in panel</span>)}
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
                <motion.div animate={{ x: displayServiceType === 'commercial' ? "-100%" : "0%" }} transition={{ duration: 1 }} className="flex w-[200%] h-full">
                    <img src={getDisplayUrl(localData.largeResidentialImg)} alt="Residential Services" className="w-full h-full object-cover" />
                    <img src={getDisplayUrl(localData.largeCommercialImg)} alt="Commercial Services" className="w-full h-full object-cover" />
                </motion.div>
                <div className="absolute top-0 w-full flex justify-center">
                    {readOnly ? (<h2 className="relative z-40 text-white text-[11.5vh] tracking-wider font-rye first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)] select-none">{localData.title}</h2>) 
                              : (<input type="text" value={localData.title} onChange={(e) => handleMainTitleChange(e.target.value)} className="relative z-40 text-white text-[11.5vh] tracking-wider font-rye first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-2 min-w-[50vw]" placeholder="Block Title"/>)}
                </div>
                <div className="absolute bottom-[6vh] left-1/2 transform -translate-x-1/2 z-30">
                    <div className="flex flex-row">
                        <button onClick={() => readOnly ? handlePanelChange({isCommercial: false}) : setCurrentServiceDisplayType('residential')} style={{ backgroundColor: displayServiceType === 'residential' ? currentActiveBtnColor : currentInactiveBtnColor }} className={`flex items-center px-4 py-2 rounded-full border-1 mx-2 text-lg ${displayServiceType === 'residential' ? "text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "text-white hover:opacity-80"} transition-colors duration-300 font-sans`}>
                            <Home className="mr-2" size={30} /> {localData.residentialButtonText}
                        </button>
                        <button onClick={() => readOnly ? handlePanelChange({isCommercial: true}) : setCurrentServiceDisplayType('commercial')} style={{ backgroundColor: displayServiceType === 'commercial' ? currentActiveBtnColor : currentInactiveBtnColor }} className={`flex items-center px-4 py-2 text-lg rounded-full border-1 mx-2 ${displayServiceType === 'commercial' ? "text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]" : "text-white hover:opacity-80"} transition-colors duration-300 font-sans`}>
                            <Building2 className="mr-2" size={30} /> {localData.commercialButtonText}
                        </button>
                    </div>
                </div>
                <div className="absolute inset-0 flex items-end justify-center mb-[26vh]">
                    <AnimatePresence mode="wait">
                        <motion.div key={displayServiceType === 'commercial' ? "commercial-lg-services" : "residential-lg-services"} className="grid grid-cols-4 gap-[5.5vw]" variants={containerVariants} initial="initial" animate="enter" exit="exit">
                            {servicesToDisplay.slice().reverse().map((service, idx_rev) => {
                                const originalIdx = servicesToDisplay.length - 1 - idx_rev;
                                return (
                                <motion.div key={service.id || originalIdx} variants={itemVariants} className="flex flex-col items-center">
                                    <div onClick={() => !readOnly && openServiceIconModal(displayServiceType, originalIdx)} className={`dark_button bg-banner flex-col w-28 h-28 rounded-full flex items-center justify-center text-white text-[6vh] hover:text-black hover:bg-gray-200 transition drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}>
                                        {React.createElement(resolveIcon(service.icon), { className: "w-[5vw] h-[5vw] md:w-10 md:h-10" })}
                                        {readOnly ? (<h3 className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">{service.title}</h3>)
                                                  : (<input type="text" value={service.title} onChange={(e) => handleServiceItemTitleChange(displayServiceType, originalIdx, e.target.value)} className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded w-full truncate" placeholder="Title" onClick={(e)=>e.stopPropagation()}/>)}
                                    </div>
                                     {readOnly ? (<Link to={service.link || '#'} className="text-xs text-blue-400 hover:underline mt-1">View</Link>) : (<span className="text-xs text-gray-400 mt-1">Link in panel</span>)}
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

  const renderTestimonialPart = () => {
    const totalReviews = localData.googleReviews?.length || 0;
    const chunkSize = 3;
    const smallScreenChunkSize = 1;
    const getVisibleReviews = (isSmallScreen) => {
        const currentChunkSize = isSmallScreen ? smallScreenChunkSize : chunkSize;
        return localData.googleReviews?.slice(currentTestimonialIndex, currentTestimonialIndex + currentChunkSize) || [];
    };
    const handlePrevTestimonial = (isSmallScreen) => {
        const currentChunkSize = isSmallScreen ? smallScreenChunkSize : chunkSize;
        if (currentTestimonialIndex - currentChunkSize >= 0) setCurrentTestimonialIndex(prev => prev - currentChunkSize);
    };
    const handleNextTestimonial = (isSmallScreen) => {
        const currentChunkSize = isSmallScreen ? smallScreenChunkSize : chunkSize;
        if (currentTestimonialIndex + currentChunkSize < totalReviews) setCurrentTestimonialIndex(prev => prev + currentChunkSize);
    };

    return (
        <section className="relative bg-black px-3 pt-5 pb-6">
            {/* Small Screen Testimonials */}
            <div className="block md:hidden -mt-[5vh] relative z-20 px-[2vw]">
                <div className="flex items-center justify-center px-4">
                {readOnly ? (<h2 className="text-[7.5vw] text-white md:text-[6vh] font-serif mt-3">{localData.testimonialTitle}</h2>)
                          : (<input type="text" value={localData.testimonialTitle} onChange={(e) => handleTestimonialTitleChange(e.target.value)} placeholder="Testimonial Title" className="text-[7.5vw] text-white md:text-[6vh] font-serif mt-3 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded"/>)}
                </div>
                <div className="relative mt-3 pb-3">
                    {totalReviews > smallScreenChunkSize && currentTestimonialIndex > 0 && (<button onClick={() => handlePrevTestimonial(true)} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 ml-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>)}
                    <div className="flex flex-col gap-3 px-6">
                        {getVisibleReviews(true).map((t, idx) => (
                            <div key={idx} className="w-full">
                                <TestimonialItem testimonial={t} />
                            </div>
                        ))}
                    </div>
                    {totalReviews > smallScreenChunkSize && currentTestimonialIndex + smallScreenChunkSize < totalReviews && (<button onClick={() => handleNextTestimonial(true)} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 mr-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>)}
                </div>
                <div className="text-center mt-3">
                    <div className="flex justify-center space-x-4">
                        {readOnly ? (<a href={localData.reviewButtonLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-xs font-sans"><img src={googleIcon} alt="Google" className="w-4 h-4 mr-1" /><span>{localData.reviewButtonText}</span></a>)
                                  : (<input type="text" value={localData.reviewButtonText} onChange={(e) => handleReviewButtonTextChange(e.target.value)} placeholder="Button Text" className="text-xs font-sans bg-gray-700 text-white p-1 rounded focus:outline-none focus:ring-1 ring-yellow-300"/>)}
                    </div>
                </div>
            </div>
            {/* Large Screen Testimonials */}
            <div className="hidden md:block">
                <div className="flex items-center justify-center mb-3">
                 {readOnly ? (<h2 className="text-5xl text-white mr-4 my-2 font-serif">{localData.testimonialTitle}</h2>)
                           : (<input type="text" value={localData.testimonialTitle} onChange={(e) => handleTestimonialTitleChange(e.target.value)} placeholder="Testimonial Title" className="text-5xl text-white mr-4 my-2 font-serif bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded"/>)}
                </div>
                <div className="container mx-auto px-2 relative pb-3">
                    <div className="flex gap-4 justify-center items-stretch">
                        {currentTestimonialIndex > 0 && (<button onClick={() => handlePrevTestimonial(false)} className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>)}
                        {getVisibleReviews(false).map((t, idx) => (
                            <div key={idx} className="flex-1 min-w-0 max-w-md">
                                <TestimonialItem testimonial={t} />
                            </div>
                        ))}
                        {currentTestimonialIndex + chunkSize < totalReviews && (<button onClick={() => handleNextTestimonial(false)} className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>)}
                    </div>
                </div>
                <div className="py-1 text-center px-3">
                    <div className="flex justify-center space-x-6">
                         {readOnly ? (<a href={localData.reviewButtonLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-1 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-sm md:text-lg font-sans"><img src={googleIcon} alt="Google" className="w-6 h-6 mr-2" /><span>{localData.reviewButtonText}</span></a>)
                                   : (<input type="text" value={localData.reviewButtonText} onChange={(e) => handleReviewButtonTextChange(e.target.value)} placeholder="Button Text" className="text-sm md:text-lg font-sans bg-gray-700 text-white p-1 rounded focus:outline-none focus:ring-1 ring-yellow-300"/>)}
                    </div>
                </div>
            </div>
        </section>
    );
  };

  if (readOnly && !config?.title) { // Simple check for initial data if readOnly
    return <div className="p-4 text-center text-gray-500">Combined block content not available.</div>;
  }

  return (
    <>
      {renderServiceSliderPart()}
      {renderTestimonialPart()}
      {!readOnly && (
        <CombinedPageEditorPanel 
          localData={localData} 
          onPanelChange={handlePanelChange} 
        />
      )}
      <IconSelectorModal 
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onIconSelect={handleServiceIconSelect}
        currentIconPack={editingServiceInfoForIcon.type ? localData[editingServiceInfoForIcon.type === 'residential' ? 'residentialServices' : 'commercialServices']?.[editingServiceInfoForIcon.index]?.iconPack || 'fa' : 'fa'}
        currentIconName={editingServiceInfoForIcon.type ? localData[editingServiceInfoForIcon.type === 'residential' ? 'residentialServices' : 'commercialServices']?.[editingServiceInfoForIcon.index]?.icon : null}
      />
    </>
  );
}

// Expose tabsConfig for BottomStickyEditPanel
CombinedPageBlock.tabsConfig = (blockData, onUpdate, themeColors) => ({
  images: (props) => (
    <CombinedPageImagesControls 
      {...props} 
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  colors: (props) => (
    <CombinedPageColorControls 
      {...props} 
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors} 
    />
  ),
  styling: (props) => (
    <CombinedPageStylingControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
    />
  ),
  general: (props) => (
    <div className="p-4 space-y-4">
      <div><label className="block text-sm font-medium">Main Title (for Service Slider part):</label><input type="text" value={props.currentData.title || ""} onChange={(e) => props.onControlsChange({ title: e.target.value })} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
      <div><label className="block text-sm font-medium">Residential Button Text:</label><input type="text" value={props.currentData.residentialButtonText || ""} onChange={(e) => props.onControlsChange({ residentialButtonText: e.target.value })} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
      <div><label className="block text-sm font-medium">Commercial Button Text:</label><input type="text" value={props.currentData.commercialButtonText || ""} onChange={(e) => props.onControlsChange({ commercialButtonText: e.target.value })} className="w-full bg-gray-700 p-1.5 rounded text-sm"/></div>
      <div><label className="block text-sm font-medium">Default Service View:</label><select value={props.currentData.isCommercial ? 'commercial' : 'residential'} onChange={(e) => props.onControlsChange({ isCommercial: e.target.value === 'commercial' })} className="w-full bg-gray-700 p-1.5 rounded text-sm"><option value="residential">Residential</option><option value="commercial">Commercial</option></select></div>
      
      {[ 'residential', 'commercial'].map(serviceType => (
          <div key={serviceType} className="pt-2 mt-2 border-t border-gray-600">
              <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-md font-medium">{serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Services</h4>
                  <button onClick={() => props.onControlsChange({ [serviceType]: [...(props.currentData[serviceType] || []), { id: Math.random().toString(36).substr(2,9), icon: 'FaTools', iconPack: 'fa', title: `New ${serviceType} Service`, link: "#" }] })} className="bg-blue-500 hover:bg-blue-600 px-2 py-0.5 rounded text-white text-xs">+ Add</button>
              </div>
              {(props.currentData[serviceType] || []).map((service, index) => (
                  <div key={service.id || index} className="bg-gray-700 p-1.5 rounded mb-1.5 text-xs">
                      <div className="flex justify-between items-center mb-1">
                          <span className="font-medium truncate w-1/2">{service.title || `Service ${index+1}`}</span>
                          <button onClick={() => props.onControlsChange({ [serviceType]: props.currentData[serviceType].filter((_, i) => i !== index) })} className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px]">X</button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                          <div><label>Title:</label><input type="text" value={service.title || ""} onChange={(e) => props.onControlsChange({ [serviceType]: props.currentData[serviceType].map((s, i) => i === index ? { ...s, title: e.target.value } : s) })} className="w-full bg-gray-600 p-1 rounded"/></div>
                          <div><label>Link URL:</label><input type="text" value={service.link || ""} onChange={(e) => props.onControlsChange({ [serviceType]: props.currentData[serviceType].map((s, i) => i === index ? { ...s, link: e.target.value } : s) })} className="w-full bg-gray-600 p-1 rounded"/></div>
                      </div>
                      <button onClick={() => props.onControlsChange({ [serviceType]: props.currentData[serviceType].map((s, i) => i === index ? { ...s, icon: 'FaTools', iconPack: 'fa' } : s) })} className="mt-1 text-xs bg-gray-600 hover:bg-gray-500 p-1 rounded w-full text-left">Icon: {service.iconPack}/{service.icon || 'N/A'}</button>
                  </div>
              ))}
          </div>
      ))}
    </div>
  ),
});
