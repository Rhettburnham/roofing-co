import { useState, useEffect, Suspense } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import LoadingScreen from "./loadingScreen";

// Import all blocks
import HeroBlock from "./blocks/HeroBlock";
import GeneralList from "./blocks/GeneralList";
import ListDropdown from "./blocks/ListDropdown";
import VideoCTA from "./blocks/VideoCTA";
import ThreeGridWithRichTextBlock from "./blocks/ThreeGridWithRichTextBlock";
import PricingGrid from "./blocks/PricingGrid";
import ShingleSelectorBlock from "./blocks/ShingleSelectorBlock";
import ListImageVerticalBlock from "./blocks/ListImageVerticalBlock";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import ImageWrapBlock from "./blocks/ImageWrapBlock";
import HeaderBannerBlock from "./blocks/HeaderBannerBlock";
import GeneralListVariant2 from "./blocks/GeneralListVariant2";
import ActionButtonBlock from "./blocks/ActionButtonBlock";

// Import React to use for our custom component
import React from "react";

/**
 * Wrapper for HeroBlock to ensure props are passed correctly
 */
const SafeHeroBlock = ({ config, readOnly }) => {
  console.log("SafeHeroBlock received config:", config);
  
  // HeroBlock expects config directly as a prop
  return <HeroBlock config={config} readOnly={readOnly} />;
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
    const colClass = `grid grid-cols-1 md:grid-cols-${Math.min(columns, 3)}`;

    return (
      <section className="w-full py-0">
        <div className="container mx-auto">
          <div className={`${colClass} gap-4`}>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded overflow-hidden h-full flex flex-col"
              >
                {getDisplayUrl(item.image) && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={getDisplayUrl(item.image)}
                      alt={item.alt || item.title || "Feature"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex-grow">
                  {item.title && (
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-gray-700">{item.description}</p>
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
  switch (blockName) {
    case "HeroBlock":
      // HeroBlock expects props directly, not wrapped in heroconfig
      return config;
    case "GeneralList":
    case "GeneralListVariant2":
    case "ListDropdown":
    case "VideoCTA":
    case "ThreeGridWithRichTextBlock":
    case "PricingGrid":
    case "ShingleSelectorBlock":
    case "ListImageVerticalBlock":
    case "OverviewAndAdvantagesBlock":
    case "ImageWrapBlock":
    case "GridImageTextBlock":
    case "HeaderBannerBlock":
    case "ActionButtonBlock":
      return config;
    default:
      return config;
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
        // Properly handle credentials for the fetch to match the preload
        const response = await fetch("/data/ignore/services.json", {
          credentials: "same-origin"
        });
        
        if (!response.ok) throw new Error("Failed to fetch service data");

        const data = await response.json();
        setServiceData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading service data:", error);
        setLoading(false);
      }
    };

    fetchServiceData();
  }, []);

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

  // Render blocks based on the service configuration
  return (
    <div className="service-page">
      <Suspense fallback={<LoadingScreen />}>
        {service.blocks.map((block, index) => {
          // Get block props with special handling for certain blocks
          const blockProps = getBlockProps(block.blockName, block.config);
          
          // Debug what's being passed to HeroBlock
          if (block.blockName === "HeroBlock") {
            console.log("HeroBlock config:", block.config);
            console.log("Processed blockProps:", blockProps);
          }
          
          // Render the appropriate block component based on blockName
          switch (block.blockName) {
            case "HeroBlock":
              // For HeroBlock we need to pass the config directly, not wrapped in heroconfig
              return <SafeHeroBlock key={index} config={blockProps} readOnly={true} />;
            case "GeneralList":
              return <GeneralList key={index} readOnly={true} config={blockProps} />;
            case "GeneralListVariant2":
              return <GeneralListVariant2 key={index} readOnly={true} config={blockProps} />;
            case "ListDropdown":
              return <ListDropdown key={index} readOnly={true} config={blockProps} />;
            case "VideoCTA":
              return <VideoCTA key={index} readOnly={true} config={blockProps} />;
            case "ThreeGridWithRichTextBlock":
              return <ThreeGridWithRichTextBlock key={index} readOnly={true} config={blockProps} />;
            case "PricingGrid":
              return <PricingGrid key={index} readOnly={true} config={blockProps} />;
            case "ShingleSelectorBlock":
              return <ShingleSelectorBlock key={index} readOnly={true} config={blockProps} />;
            case "ListImageVerticalBlock":
              return <ListImageVerticalBlock key={index} readOnly={true} config={blockProps} />;
            case "OverviewAndAdvantagesBlock":
              return <OverviewAndAdvantagesBlock key={index} readOnly={true} config={blockProps} />;
            case "ImageWrapBlock":
              return <ImageWrapBlock key={index} readOnly={true} config={blockProps} />;
            case "GridImageTextBlock":
              // Use our fixed version instead of the original component
              return <FixedGridImageTextBlock key={index} readOnly={true} config={blockProps} />;
            case "HeaderBannerBlock":
              return <HeaderBannerBlock key={index} readOnly={true} config={blockProps} />;
            case "ActionButtonBlock":
              return <ActionButtonBlock key={index} readOnly={true} config={blockProps} />;
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