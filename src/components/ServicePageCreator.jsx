import { useState, useEffect, Suspense } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import LoadingScreen from "./loadingScreen";

// Import all blocks
import PageHeroBlock from "./blocks/PageHeroBlock";
import DetailedListBlock from "./blocks/DetailedListBlock";
import AccordionBlock from "./blocks/AccordionBlock";
import VideoHighlightBlock from "./blocks/VideoHighlightBlock";
import CardGridBlock from "./blocks/CardGridBlock";
import PricingTableBlock from "./blocks/PricingTableBlock";
import OptionSelectorBlock from "./blocks/OptionSelectorBlock";
import NumberedImageTextBlock from "./blocks/NumberedImageTextBlock";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import TextImageBlock from "./blocks/TextImageBlock";
import SectionBannerBlock from "./blocks/SectionBannerBlock";
import GeneralListVariant2 from "./blocks/GeneralListVariant2";
import ActionButtonBlock from "./blocks/ActionButtonBlock";
import ImageFeatureListBlock from "./blocks/ImageFeatureListBlock";
import FeatureOverviewBlock from "./blocks/FeatureOverviewBlock";
import CallToActionButtonBlock from "./blocks/CallToActionButtonBlock";
import IconTextBlockGrid from "./blocks/IconTextBlockGrid";

// Import React to use for our custom component
import React from "react";

/**
 * Utility function to normalize image URLs
 * This ensures consistent image rendering across different ways of storing URLs
 */
const normalizeImageUrls = (config) => {
  if (!config) return config;
  
  // Clone the config to avoid mutations
  const newConfig = {...config};
  
  // Process all properties
  Object.keys(newConfig).forEach(key => {
    const value = newConfig[key];
    
    // Handle image/picture fields that contain URL objects or string URLs
    if (
      (key.toLowerCase().includes('image') || 
       key.toLowerCase().includes('picture') || 
       key.toLowerCase().includes('background')) && 
      value
    ) {
      if (typeof value === 'object' && value.url) {
        // If the URL is an object with a url property
        newConfig[key] = ensureLeadingSlash(value.url);
      } else if (typeof value === 'string') {
        // If the URL is a string, ensure it has leading slash
        newConfig[key] = ensureLeadingSlash(value);
      }
    }
    
    // Handle arrays that might contain images
    if (Array.isArray(value)) {
      newConfig[key] = value.map(item => {
        // If item is a simple image URL object
        if (item && typeof item === 'object' && item.url) {
          return ensureLeadingSlash(item.url);
        }
        
        // If item is a string (direct URL)
        if (item && typeof item === 'string' && 
            (item.includes('.jpg') || item.includes('.jpeg') || 
             item.includes('.png') || item.includes('.webp') || 
             item.includes('.avif') || item.includes('.gif'))) {
          return ensureLeadingSlash(item);
        }
        
        // If item is a complex object with image properties
        if (item && typeof item === 'object') {
          const newItem = {...item};
          Object.keys(newItem).forEach(itemKey => {
            if (
              (itemKey.toLowerCase().includes('image') || 
               itemKey.toLowerCase().includes('picture') || 
               itemKey.toLowerCase().includes('background') ||
               itemKey === 'url') && 
              newItem[itemKey]
            ) {
              if (typeof newItem[itemKey] === 'object' && newItem[itemKey].url) {
                newItem[itemKey] = ensureLeadingSlash(newItem[itemKey].url);
              } else if (typeof newItem[itemKey] === 'string') {
                newItem[itemKey] = ensureLeadingSlash(newItem[itemKey]);
              }
            }
          });
          return newItem;
        }
        
        return item;
      });
    }
    
    // Recursively process nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) {
      newConfig[key] = normalizeImageUrls(value);
    }
  });
  
  return newConfig;
};

/**
 * Ensures a URL has a leading slash if it's a relative path
 * Doesn't modify URLs that are already absolute or have a leading slash
 */
const ensureLeadingSlash = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // If URL is already absolute or has leading slash, return as is
  if (url.startsWith('http') || url.startsWith('/')) {
    return url;
  }
  
  // For relative URLs referring to assets, add a leading slash
  return `/${url}`;
};

/**
 * Special function to fix image paths in "pictures" arrays
 * This handles the specific case in the siding service data
 */
const normalizeServiceImages = (service) => {
  if (!service || !service.blocks) return service;
  
  const fixedService = {...service};
  
  fixedService.blocks = service.blocks.map(block => {
    // Make a copy of the block to modify
    const newBlock = {...block};
    
    // If this is a GeneralList block, check for pictures arrays in items
    if ((block.blockName === "GeneralList" || block.blockName === "DetailedListBlock") && block.config && block.config.items) {
      newBlock.config = {...block.config};
      
      // Process each item in the items array
      newBlock.config.items = block.config.items.map(item => {
        // Make a copy of the item
        const newItem = {...item};
        
        // If the item has a pictures array, normalize each picture path
        if (item.pictures && Array.isArray(item.pictures)) {
          newItem.pictures = item.pictures.map(pic => {
            return ensureLeadingSlash(pic);
          });
        }
        
        return newItem;
      });
    }
    
    return newBlock;
  });
  
  return fixedService;
};

/**
 * Wrapper for HeroBlock to ensure props are passed correctly
 */
const SafeHeroBlock = ({ config, readOnly }) => {
  console.log("SafeHeroBlock received config:", config);
  
  // HeroBlock expects config directly as a prop
  return <PageHeroBlock config={config} readOnly={readOnly} />;
};

/**
 * Fixed version of GridImageTextBlock component
 * This fixes the issue where getDisplayUrl is used before it's defined
 */
const FixedGridImageTextBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const { columns = 4, items = [] } = config;

  // Helper function defined BEFORE it's used
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // Default image to use when no image is provided
  const defaultImage = "/assets/images/placeholder.jpg";

  // READ ONLY version
  if (readOnly) {
    // Set a reasonable default for columns that's responsive
    const colClass = `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-${Math.min(columns, 3)}`;

    return (
      <section className="w-full py-0">
        <div className="container mx-auto px-4">
          <div className={`${colClass} gap-4`}>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded overflow-hidden h-full flex flex-col"
              >
                {getDisplayUrl(item.image) && (
                  <div className="w-full aspect-video overflow-hidden">
                    <img
                      src={getDisplayUrl(item.image)}
                      alt={item.alt || item.title || "Feature"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex-grow">
                  {item.title && (
                    <h3 className="text-lg @md:text-xl font-semibold mb-2">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-gray-700 text-sm @md:text-base">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // EDIT MODE (We won't use it but keep it for completeness)
  const handleFieldChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  return <div>Edit mode not supported</div>;
};

/**
 * Helper function to get proper props for specific block types
 * Some blocks might need special handling for their props
 */
const getBlockProps = (blockName, config) => {
  // First normalize all image URLs in the config
  const normalizedConfig = normalizeImageUrls(config);
  
  switch (blockName) {
    case "HeroBlock":
    case "PageHeroBlock":
      // HeroBlock expects props directly, not wrapped in heroconfig
      return normalizedConfig;
    case "GeneralList":
    case "DetailedListBlock":
    case "GeneralListVariant2":
    case "ImageFeatureListBlock":
    case "AccordionBlock":
    case "VideoCTA":
    case "VideoHighlightBlock":
    case "CardGridBlock":
    case "PricingTableBlock":
    case "OptionSelectorBlock":
    case "NumberedImageTextBlock":
    case "OverviewAndAdvantagesBlock":
    case "FeatureOverviewBlock":
    case "TextImageBlock":
    case "IconTextBlockGrid":
    case "SectionBannerBlock":
    case "ActionButtonBlock":
    case "CallToActionButtonBlock":
      return normalizedConfig;
    default:
      return normalizedConfig;
  }
};

/**
 * ServicePageCreator Component
 * 
 * Dynamically creates service pages based on the services.json data
 * Uses block components from the blocks folder
 * Routes are service/commercial/ID or service/residential/ID
 */
const ServicePageCreator = () => {
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { serviceType, serviceId } = useParams();

  // Fetch services data
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        // Log that we're making the request
        console.log("Fetching service data from /data/ignore/services.json");
        
        // Properly handle credentials for the fetch to match the preload
        const response = await fetch("/data/ignore/services.json", {
          credentials: "same-origin"
        });
        
        if (!response.ok) throw new Error("Failed to fetch service data");

        const data = await response.json();
        console.log("Service data fetched successfully:", data);
        
        // Process the data to normalize image URLs
        const processedData = JSON.parse(JSON.stringify(data)); // Deep clone
        
        // Log the service we're about to display
        if (serviceType && serviceId && processedData[serviceType]) {
          const service = processedData[serviceType].find(s => s.id.toString() === serviceId);
          if (service) {
            // Apply both general image path fixes and special handling for pictures arrays
            const fixedService = normalizeServiceImages(service);
            console.log(`Found service: ${serviceType}/${serviceId}`, fixedService);
            
            // Replace the service in the processed data
            processedData[serviceType] = processedData[serviceType].map(s => {
              if (s.id.toString() === serviceId) {
                return fixedService;
              }
              return s;
            });
          } else {
            console.log(`Service not found: ${serviceType}/${serviceId}`);
          }
        }
        
        setServiceData(processedData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading service data:", error);
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceType, serviceId]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!serviceData || !serviceType || !serviceId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Service not found. Please check the URL and try again.</p>
      </div>
    );
  }

  // Validate serviceType (must be commercial or residential)
  if (serviceType !== "commercial" && serviceType !== "residential") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid service type. Available types: commercial, residential.</p>
      </div>
    );
  }

  // Find the requested service
  const services = serviceData[serviceType] || [];
  const service = services.find((s) => s.id.toString() === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Service ID not found. Please check the URL and try again.</p>
      </div>
    );
  }

  // Log the service data to help with debugging
  console.log(`Rendering service: ${serviceType}/${serviceId}`, service);

  // Render blocks based on the service configuration
  return (
    <div className="service-page">
      <Suspense fallback={<LoadingScreen />}>
        {service.blocks.map((block, index) => {
          // Get block props with special handling for certain blocks
          const blockProps = getBlockProps(block.blockName, block.config);
          
          // Debug what's being passed to HeroBlock and GeneralList (where images are failing)
          if (block.blockName === "HeroBlock" || block.blockName === "PageHeroBlock" || block.blockName === "GeneralList" || block.blockName === "DetailedListBlock") {
            console.log(`${block.blockName} config:`, block.config);
            console.log(`${block.blockName} processed props:`, blockProps);
          }
          
          // Render the appropriate block component based on blockName
          switch (block.blockName) {
            case "HeroBlock":
            case "PageHeroBlock":
              // For HeroBlock we need to pass the config directly, not wrapped in heroconfig
              return <SafeHeroBlock key={index} config={blockProps} readOnly={true} />;
            case "GeneralList":
            case "DetailedListBlock":
              return <DetailedListBlock key={index} readOnly={true} config={blockProps} />;
            case "GeneralListVariant2":
            case "ImageFeatureListBlock":
              return <ImageFeatureListBlock key={index} readOnly={true} config={blockProps} />;
            case "AccordionBlock":
              return <AccordionBlock key={index} readOnly={true} config={blockProps} />;
            case "VideoCTA":
            case "VideoHighlightBlock":
              return <VideoHighlightBlock key={index} readOnly={true} config={blockProps} />;
            case "CardGridBlock":
              return <CardGridBlock key={index} readOnly={true} config={blockProps} />;
            case "PricingTableBlock":
              return <PricingTableBlock key={index} readOnly={true} config={blockProps} />;
            case "OptionSelectorBlock":
              return <OptionSelectorBlock key={index} readOnly={true} config={blockProps} />;
            case "NumberedImageTextBlock":
              return <NumberedImageTextBlock key={index} readOnly={true} config={blockProps} />;
            case "FeatureOverviewBlock":
              return <FeatureOverviewBlock key={index} readOnly={true} config={blockProps} />;
            case "TextImageBlock":
              return <TextImageBlock key={index} readOnly={true} config={blockProps} />;
            case "IconTextBlockGrid":
              return <IconTextBlockGrid key={index} readOnly={true} config={blockProps} />;
            case "SectionBannerBlock":
              return <SectionBannerBlock key={index} readOnly={true} config={blockProps} />;
            case "ActionButtonBlock":
            case "CallToActionButtonBlock":
              return <CallToActionButtonBlock key={index} readOnly={true} config={blockProps} />;
            default:
              return (
                <div key={index} className="p-4 text-center bg-red-100 text-red-500">
                  Unknown block type: {block.blockName}
                </div>
              );
          }
        })}
      </Suspense>
    </div>
  );
};

export default ServicePageCreator; 