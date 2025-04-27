import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "../StarRating";

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
      className="p-2 md:p-4 bg-white rounded-lg custom-circle-shadow relative cursor-pointer"
      onClick={handleExpandClick}
    >
      {/* Name, rating, date with logo to the left */}
      <div className="flex items-start mb-2">
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
              className="w-6 h-6 md:w-12 md:h-12"
            />
          </a>
        )}

        {/* Name and date in column with reduced spacing */}
        <div className="flex-grow">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[3vw] md:text-[1.8vh] font-semibold text-black font-sans truncate">
              {testimonial.name}
            </p>
            <div className="flex-shrink-0">
              <StarRating rating={testimonial.stars} />
            </div>
          </div>
          <p className="text-gray-700 text-[2vw] md:text-[1.4vh] md:-mt-2">
            {testimonial.date}
          </p>
        </div>
      </div>

      {/* Text */}
      <p className="text-gray-800 indent-4">
        <span className="text-[2.8vw] md:text-[2.2vh] block md:hidden font-serif">
          {isExpanded ? testimonial.text : truncated}
        </span>
        <span className="md:text-xs hidden md:block font-serif">
          {testimonial.text}
        </span>
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   EDITOR PANEL COMPONENT
   This component handles the editing interface for CombinedPageBlock
───────────────────────────────────────────────────────────── */
function CombinedPageEditorPanel({ localData, setLocalData, onSave }) {
  const [activeTab, setActiveTab] = useState("residential");
  
  // Helper to create URL paths for image uploads
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // Image upload handler
  const handleImageUpload = (fieldName) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a URL for display
    const fileURL = URL.createObjectURL(file);
    
    setLocalData((prev) => ({
      ...prev,
      [fieldName]: {
        file: file,
        url: fileURL,
        name: file.name,
      },
    }));
  };

  // Add new testimonial
  const handleAddTestimonial = () => {
    setLocalData(prev => ({
      ...prev,
      googleReviews: [
        ...prev.googleReviews || [],
        {
          name: "New Customer",
          stars: 5,
          date: "1 month ago",
          text: "Add your testimonial text here...",
          logo: "/assets/images/hero/googleimage.png",
          link: "https://www.google.com/maps"
        }
      ]
    }));
  };

  // Remove testimonial
  const handleRemoveTestimonial = (index) => {
    setLocalData(prev => {
      const updatedReviews = [...prev.googleReviews];
      updatedReviews.splice(index, 1);
      return {
        ...prev,
        googleReviews: updatedReviews
      };
    });
  };

  // Update testimonial fields
  const handleTestimonialChange = (index, field, value) => {
    setLocalData(prev => {
      const updatedReviews = [...prev.googleReviews];
      updatedReviews[index] = {
        ...updatedReviews[index],
        [field]: field === 'stars' ? Number(value) : value
      };
      return {
        ...prev,
        googleReviews: updatedReviews
      };
    });
  };

  // Add new service
  const handleAddService = (serviceType) => {
    const serviceList = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    const iconOptions = ['FaTools', 'FaFan', 'FaPaintRoller', 'FaTint', 'FaHome', 'FaBuilding', 'FaWarehouse', 'FaSmog', 'FaBroom', 'FaHardHat'];
    
    setLocalData(prev => ({
      ...prev,
      [serviceList]: [
        ...prev[serviceList] || [],
        {
          icon: iconOptions[Math.floor(Math.random() * iconOptions.length)],
          title: `New ${serviceType === 'residential' ? 'Residential' : 'Commercial'} Service`,
          link: "#"
        }
      ]
    }));
  };

  // Remove service
  const handleRemoveService = (serviceType, index) => {
    const serviceList = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    
    setLocalData(prev => {
      const updatedServices = [...prev[serviceList]];
      updatedServices.splice(index, 1);
      return {
        ...prev,
        [serviceList]: updatedServices
      };
    });
  };

  // Update service fields
  const handleServiceChange = (serviceType, index, field, value) => {
    const serviceList = serviceType === 'residential' ? 'residentialServices' : 'commercialServices';
    
    setLocalData(prev => {
      const updatedServices = [...prev[serviceList]];
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value
      };
      return {
        ...prev,
        [serviceList]: updatedServices
      };
    });
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg max-h-[75vh] overflow-auto">
      {/* Header with tabs */}
      <div className="flex flex-col mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Services & Testimonials Editor</h2>
          <button
            onClick={onSave}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-medium"
          >
            Save Changes
          </button>
        </div>
        
        {/* Tabs for different sections */}
        <div className="flex border-b border-gray-700 mb-4">
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
            className={`px-4 py-2 ${activeTab === 'testimonials' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} rounded-t`}
            onClick={() => setActiveTab('testimonials')}
          >
            Testimonials
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'images' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} rounded-t`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
        </div>
      </div>

      {/* Section Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Section Title:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-3 py-2 rounded text-white"
          value={localData.title || "Services"}
          onChange={(e) => setLocalData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>
      
      {/* Residential Services */}
      {activeTab === 'residential' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Residential Services</h3>
            <button
              onClick={() => handleAddService('residential')}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              + Add Service
            </button>
          </div>
          
          {localData.residentialServices?.map((service, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded mb-3 relative">
              <button
                onClick={() => handleRemoveService('residential', index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                title="Remove service"
              >
                ×
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">Icon:</label>
                  <select
                    className="w-full bg-gray-600 px-2 py-1 rounded"
                    value={service.icon || "FaTools"}
                    onChange={(e) => handleServiceChange('residential', index, 'icon', e.target.value)}
                  >
                    <option value="FaTools">Tools</option>
                    <option value="FaFan">Fan</option>
                    <option value="FaPaintRoller">Paint Roller</option>
                    <option value="FaTint">Water Drop</option>
                    <option value="FaHome">Home</option>
                    <option value="FaBuilding">Building</option>
                    <option value="FaWarehouse">Warehouse</option>
                    <option value="FaSmog">Smog/Chimney</option>
                    <option value="FaBroom">Broom</option>
                    <option value="FaHardHat">Hard Hat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Title:</label>
                  <input
                    type="text"
                    className="w-full bg-gray-600 px-2 py-1 rounded"
                    value={service.title || ""}
                    onChange={(e) => handleServiceChange('residential', index, 'title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Link:</label>
                  <input
                    type="text"
                    className="w-full bg-gray-600 px-2 py-1 rounded"
                    value={service.link || ""}
                    onChange={(e) => handleServiceChange('residential', index, 'link', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Commercial Services */}
      {activeTab === 'commercial' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Commercial Services</h3>
            <button
              onClick={() => handleAddService('commercial')}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              + Add Service
            </button>
          </div>
          
          {localData.commercialServices?.map((service, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded mb-3 relative">
              <button
                onClick={() => handleRemoveService('commercial', index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                title="Remove service"
              >
                ×
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">Icon:</label>
                  <select
                    className="w-full bg-gray-600 px-2 py-1 rounded"
                    value={service.icon || "FaTools"}
                    onChange={(e) => handleServiceChange('commercial', index, 'icon', e.target.value)}
                  >
                    <option value="FaTools">Tools</option>
                    <option value="FaFan">Fan</option>
                    <option value="FaPaintRoller">Paint Roller</option>
                    <option value="FaTint">Water Drop</option>
                    <option value="FaHome">Home</option>
                    <option value="FaBuilding">Building</option>
                    <option value="FaWarehouse">Warehouse</option>
                    <option value="FaSmog">Smog/Chimney</option>
                    <option value="FaBroom">Broom</option>
                    <option value="FaHardHat">Hard Hat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Title:</label>
                  <input
                    type="text"
                    className="w-full bg-gray-600 px-2 py-1 rounded"
                    value={service.title || ""}
                    onChange={(e) => handleServiceChange('commercial', index, 'title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Link:</label>
                  <input
                    type="text"
                    className="w-full bg-gray-600 px-2 py-1 rounded"
                    value={service.link || ""}
                    onChange={(e) => handleServiceChange('commercial', index, 'link', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Testimonials */}
      {activeTab === 'testimonials' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Google Reviews</h3>
            <button
              onClick={handleAddTestimonial}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              + Add Testimonial
            </button>
          </div>
          
          {localData.googleReviews?.map((review, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded mb-4 relative">
              <button
                onClick={() => handleRemoveTestimonial(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                title="Remove testimonial"
              >
                ×
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm mb-1">Name:</label>
                  <input
                    type="text"
                    className="w-full bg-gray-600 px-2 py-1 rounded"
                    value={review.name || ""}
                    onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Date:</label>
                  <input
                    type="text"
                    className="w-full bg-gray-600 px-2 py-1 rounded"
                    value={review.date || ""}
                    onChange={(e) => handleTestimonialChange(index, 'date', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Rating (1-5):</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full bg-gray-600 px-2 py-1 rounded"
                  value={review.stars || 5}
                  onChange={(e) => handleTestimonialChange(index, 'stars', e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Review Text:</label>
                <textarea
                  className="w-full bg-gray-600 px-2 py-1 rounded h-20"
                  value={review.text || ""}
                  onChange={(e) => handleTestimonialChange(index, 'text', e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Link:</label>
                <input
                  type="text"
                  className="w-full bg-gray-600 px-2 py-1 rounded"
                  value={review.link || ""}
                  onChange={(e) => handleTestimonialChange(index, 'link', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Logo:</label>
                <input
                  type="text"
                  className="w-full bg-gray-600 px-2 py-1 rounded"
                  value={review.logo || ""}
                  onChange={(e) => handleTestimonialChange(index, 'logo', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Images */}
      {activeTab === 'images' && (
        <div>
          <h3 className="text-lg font-medium mb-3">Banner Images</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Residential Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload('largeResidentialImg')}
              className="mb-2"
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
              className="w-full bg-gray-700 px-3 py-2 mt-2 rounded text-white"
              value={typeof localData.largeResidentialImg === 'string' ? localData.largeResidentialImg : ''}
              placeholder="Or enter image URL"
              onChange={(e) => setLocalData(prev => ({ 
                ...prev, 
                largeResidentialImg: e.target.value 
              }))}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Commercial Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload('largeCommercialImg')}
              className="mb-2"
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
              className="w-full bg-gray-700 px-3 py-2 mt-2 rounded text-white"
              value={typeof localData.largeCommercialImg === 'string' ? localData.largeCommercialImg : ''}
              placeholder="Or enter image URL"
              onChange={(e) => setLocalData(prev => ({ 
                ...prev, 
                largeCommercialImg: e.target.value 
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [localData, setLocalData] = useState(() => {
    return { 
      ...config,
      isCommercial: config.isCommercial || false,
      title: config.title || "Services",
      googleReviews: config.googleReviews || [],
      residentialServices: config.residentialServices || [],
      commercialServices: config.commercialServices || [],
      largeResidentialImg: config.largeResidentialImg || "/assets/images/main_image_expanded.jpg",
      largeCommercialImg: config.largeCommercialImg || "/assets/images/commercialservices.jpg",
    };
  });

  console.log("CombinedPageBlock config:", config);

  useEffect(() => {
    // First try to use the provided config data for services
    if (
      config &&
      config.residentialServices &&
      config.residentialServices.length > 0
    ) {
      console.log(
        "Using config residentialServices:",
        config.residentialServices
      );

      // Map residential services with proper slug-based links
      const mappedResidentialServices = config.residentialServices.map(
        (service) => ({
          ...service,
          link: service.slug ? `/services/${service.slug}` : service.link,
        })
      );

      setResidentialServices(mappedResidentialServices);
    } else {
      // Warn about missing residential services in the config
      console.warn(
        "No residential services found in config, this shouldn't happen in production"
      );
      setResidentialServices([]);
    }

    // Same for commercial services
    if (
      config &&
      config.commercialServices &&
      config.commercialServices.length > 0
    ) {
      console.log(
        "Using config commercialServices:",
        config.commercialServices
      );

      // Map commercial services with proper slug-based links
      const mappedCommercialServices = config.commercialServices.map(
        (service) => ({
          ...service,
          link: service.slug ? `/services/${service.slug}` : service.link,
        })
      );

      setCommercialServices(mappedCommercialServices);
    } else {
      // Warn about missing commercial services in the config
      console.warn(
        "No commercial services found in config, this shouldn't happen in production"
      );
      setCommercialServices([]);
    }

    // For testimonials, use config data
    if (config && config.googleReviews && config.googleReviews.length > 0) {
      console.log("Using config googleReviews:", config.googleReviews);
      setGoogleReviews(config.googleReviews);
    } else {
      // Warn about missing reviews data
      console.warn(
        "No Google reviews found in config, this shouldn't happen in production"
      );
      setGoogleReviews([]);
    }

    // Set initial isCommercial state from config if provided
    if (config && config.isCommercial !== undefined) {
      setIsCommercial(config.isCommercial);
    }
  }, [config]);

  // Choose which services to display based on the toggle.
  const currentServices = isCommercial
    ? commercialServices
    : residentialServices;

  // Testimonial pagination.
  const chunkSize = 3;
  const totalReviews = googleReviews.length;
  const visibleReviews = googleReviews.slice(
    currentIndex,
    currentIndex + chunkSize
  );

  const handlePrev = () => {
    if (currentIndex - chunkSize >= 0) {
      setCurrentIndex((prev) => prev - chunkSize);
    }
  };

  const handleNext = () => {
    if (currentIndex + chunkSize < totalReviews) {
      setCurrentIndex((prev) => prev + chunkSize);
    }
  };

  const handleResidentialClick = () => setIsCommercial(false);
  const handleCommercialClick = () => setIsCommercial(true);

  console.log("Google Reviews for testimonials:", googleReviews);

  // Handle save button click
  const handleSave = () => {
    if (onConfigChange) {
      onConfigChange(localData);
    }
  };

  // If we're in edit mode, show the editor panel
  if (!readOnly) {
    return (
      <CombinedPageEditorPanel 
        localData={localData} 
        setLocalData={setLocalData} 
        onSave={handleSave} 
      />
    );
  }

  // READ-ONLY MODE - Continue with the existing component's render logic
  return (
    <div className="w-full bg-black mt-3">
      {/* ──────────────────────────────────────────────────────────
          1) SMALL SCREEN SECTION
      ────────────────────────────────────────────────────────── */}
      <div className="block md:hidden relative w-full">
        {/* Two images side-by-side, animate x for swap */}
        <div className="overflow-hidden w-full relative h-[40vh]">
          <motion.div
            animate={{ x: isCommercial ? "-100vw" : "0%" }}
            transition={{ duration: 0.8 }}
            className="flex"
          >
            <img
              src={config.largeResidentialImg || "/assets/images/main_img.jpg"}
              alt="Residential Services"
              className="w-full h-[50vh] object-cover" /* Increased height and added object-cover */
            />
            <img
              src={
                config.largeCommercialImg ||
                "/assets/images/commercialservices.jpg"
              }
              alt="Commercial Services"
              className="w-full h-[50vh] object-cover" /* Increased height and added object-cover */
            />
          </motion.div>
        </div>

        {/* White triangle at bottom (no pointer events) */}
        <div
          className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-black z-0 pointer-events-none"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
        <h2 className="absolute top-[1vh] left-1/2 transform -translate-x-1/2 text-white text-[10vw] font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)]">
          {config.title || "Services"}
        </h2>

        {/* SERVICES Buttons (staggered exit/enter) */}
        <div className="absolute bottom-[10vh] left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex flex-row gap-3">
            <button
              onClick={handleResidentialClick}
              className={`flex items-center px-2 md:px-4 md:py-2 rounded-full border-1 mx-2 text-md ${
                !isCommercial
                  ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                  : "bg-gray-500 text-white hover:bg-white hover:text-black"
              } transition-colors duration-300 font-sans`}
              onMouseEnter={(e) => {
                if (isCommercial) {
                  e.currentTarget.style.boxShadow =
                    "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              <Home className="mr-2" size={16} />
              <p className="text-[3vw] font-sans">Residential</p>
            </button>
            <button
              onClick={handleCommercialClick}
              className={`flex items-center px-2 md:px-4 py-1 md:py-2 text-lg rounded-full border-1 mx-2 ${
                isCommercial
                  ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                  : "bg-gray-500 hover:bg-white hover:text-black text-white"
              } transition-colors duration-300 font-sans`}
              onMouseEnter={(e) => {
                if (!isCommercial) {
                  e.currentTarget.style.boxShadow =
                    "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0,0,0 / 0.1)";
              }}
            >
              <FaWarehouse className="mr-2" size={16} />
              <p className="text-[3vw] font-sans">Commercial</p>
            </button>
          </div>
        </div>

        {/* Staggered row of service icons */}
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-[23vh] p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={isCommercial ? "commercial" : "residential"}
              className="flex flex-row gap-4"
              variants={containerVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              {[...currentServices].reverse().map((service) => (
                <motion.div
                  key={service.title}
                  variants={itemVariants}
                  className=" flex flex-col items-center -mt-[14vh] "
                >
                  <Link to={service.link}>
                    <div
                      className="group whitespace-nowrap flex-col dark_button bg-banner w-[9vh] h-[9vh] p-2 md:w-24 md:h-24 rounded-full p-2 flex items-center justify-around text-white text-[5vw] hover:text-gray-200 hover:bg-gray-200 transition drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 0 30px 10px rgba(0,0,0,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {typeof service.icon === "string"
                        ? React.createElement(resolveIcon(service.icon), {
                            className: "w-[8vw] h-[8vw] md:w-10 md:h-10",
                          })
                        : React.createElement(service.icon, {
                            className: "w-[5vw] h-[5vw] md:w-10 md:h-10",
                          })}
                      <h3 className=" text-white text-[3.6vw] group-hover:text-gray-200 md:text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
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

      {/* TESTIMONIALS (SMALL SCREEN) */}
      <div className="block md:hidden -mt-[5vh] relative z-20 px-[6vw] pb-6">
        <div className="flex items-center justify-center px-4">
          <h2 className="text-[7.5vw] text-white md:text-[6vh] md:text-5xl font-serif mr-2 mt-3">
            Testimonials
          </h2>
        </div>
        <div className="relative mt-3 pb-3">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 ml-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-3 h-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          )}
          <div className="grid grid-cols-1 gap-3 px-6">
            {visibleReviews.map((t, idx) => (
              <TestimonialItem key={idx} testimonial={t} />
            ))}
          </div>
          {currentIndex + chunkSize < totalReviews && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 mr-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-3 h-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="text-center">
          <div className="flex justify-center space-x-4">
            <a
              href={googleReviews[0]?.link || "https://www.google.com/maps"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-xs font-sans"
            >
              <img src={googleIcon} alt="Google" className="w-4 h-4 mr-1" />
              <span>Review on Google</span>
            </a>
          </div>
        </div>
      </div>

      {/* LARGE SCREENS */}
      <div className="hidden md:block overflow-hidden">
        <div className="relative w-full h-[60vh]">
          <motion.div
            animate={{ x: isCommercial ? "-100vw" : "0%" }}
            transition={{ duration: 1 }}
            className="flex w-[200%] h-full"
          >
            <img
              src={
                config.largeResidentialImg ||
                "/assets/images/main_image_expanded.jpg"
              }
              alt="Residential Services"
              className="w-[100vw] h-full object-cover"
            />
            <img
              src={
                config.largeCommercialImg ||
                "/assets/images/commercialservices.jpg"
              }
              alt="Commercial Services"
              className="w-[100vw] h-full object-cover"
            />
          </motion.div>
          <div className="absolute top-0 w-full flex justify-center">
            <h2 className="relative z-40 text-white text-[11.5vh] tracking-wider font-rye first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)]">
              {config.title || "Services"}
            </h2>
          </div>
          <div className="absolute bottom-[6vh] left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex flex-row">
              <button
                onClick={handleResidentialClick}
                className={`flex items-center px-4 py-2 rounded-full border-1 mx-2 text-lg ${
                  !isCommercial
                    ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                    : "bg-gray-500 text-white hover:bg-white hover:text-black"
                } transition-colors duration-300 font-sans`}
                onMouseEnter={(e) => {
                  if (isCommercial) {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                }}
              >
                <Home className="mr-2" size={30} />
                Residential
              </button>
              <button
                onClick={handleCommercialClick}
                className={`flex items-center px-4 py-2 text-lg rounded-full border-1 mx-2 ${
                  isCommercial
                    ? "bg-banner text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                    : "bg-gray-500 hover:bg-white hover:text-black text-white"
                } transition-colors duration-300 font-sans`}
                onMouseEnter={(e) => {
                  if (!isCommercial) {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                }}
              >
                <Building2 className="mr-2" size={30} />
                Commercial
              </button>
            </div>
          </div>
          <div className="absolute inset-0 flex items-end justify-center mb-[26vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isCommercial ? "commercial-lg" : "residential-lg"}
                className="grid grid-cols-4 gap-[5.5vw] group-hover:text-black"
                variants={containerVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                {[...currentServices].reverse().map((service) => (
                  <motion.div
                    key={service.title}
                    variants={itemVariants}
                    className="flex flex-col items-center group-hover:text-black"
                  >
                    <Link to={service.link}>
                      <div
                        className="dark_button bg-banner flex-col w-28 h-28 rounded-full flex items-center justify-center text-white text-[6vh] hover:text-black hover:bg-gray-200 transition drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 30px 10px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {typeof service.icon === "string"
                          ? React.createElement(resolveIcon(service.icon), {
                              className: "w-[5vw] h-[5vw] md:w-10 md:h-10",
                            })
                          : React.createElement(service.icon, {
                              className: "w-[5vw] h-[5vw] md:w-10 md:h-10",
                            })}
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
        <section id="testimonials" className="relative bg-black px-3 pt-5">
          <div className="flex items-center justify-center mb-3">
            <h2 className="text-5xl text-white mr-4 my-2 font-serif">
              Testimonials
            </h2>
          </div>
          <div className="container mx-auto px-2 relative pb-3">
            <div className="grid gap-4 grid-cols-3">
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
              )}
              {visibleReviews.map((t, idx) => (
                <TestimonialItem key={idx} testimonial={t} />
              ))}
              {currentIndex + chunkSize < totalReviews && (
                <button
                  onClick={handleNext}
                  className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="py-1 text-center px-3">
            <div className="flex justify-center space-x-6">
              <a
                href={googleReviews[0]?.link || "https://www.google.com/maps"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-1 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-sm md:text-lg font-sans"
              >
                <img src={googleIcon} alt="Google" className="w-6 h-6 mr-2" />
                <span>Review us on Google</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
