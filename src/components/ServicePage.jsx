import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import LoadingScreen from "./loadingScreen";

// Import ALL block components used across commercial & residential
import HeroBlock from "./blocks/HeroBlock";
import GeneralList from "./blocks/GeneralList";
import VideoCTA from "./blocks/VideoCTA";
import GeneralListVariant2 from "./blocks/GeneralListVariant2";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import ActionButtonBlock from "./blocks/ActionButtonBlock";
import HeaderBannerBlock from "./blocks/HeaderBannerBlock";
import PricingGrid from "./blocks/PricingGrid";
import ListDropdown from "./blocks/ListDropdown";
import ListImageVerticalBlock from "./blocks/ListImageVerticalBlock";
import ShingleSelectorBlock from "./blocks/ShingleSelectorBlock";
import ImageWrapBlock from "./blocks/ImageWrapBlock";
import ThreeGridWithRichTextBlock from "./blocks/ThreeGridWithRichTextBlock";
import GridImageTextBlock from "./blocks/GridImageTextBlock";

// Lookup object to map block names to components
const blockComponents = {
  HeroBlock,
  GeneralList,
  VideoCTA,
  GeneralListVariant2,
  OverviewAndAdvantagesBlock,
  ActionButtonBlock,
  HeaderBannerBlock,
  PricingGrid,
  ListDropdown,
  ListImageVerticalBlock,
  ShingleSelectorBlock,
  ImageWrapBlock,
  ThreeGridWithRichTextBlock,
  GridImageTextBlock,
};

/**
 * ServicePage Component
 * 
 * Renders a service page based on the URL parameters.
 * This component only supports the modern URL format: /services/:serviceType/:serviceName
 * Where:
 * - serviceType: The category of service (e.g., "residential" or "commercial")
 * - serviceName: Either a slug, name, or numeric ID referencing a service in services.json
 */
const ServicePage = ({ forcedServiceData = null }) => {
  const navigate = useNavigate();
  const { serviceType, serviceName } = useParams();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (forcedServiceData) {
      setServiceData(forcedServiceData);
      setLoading(false);
      return;
    }

    const fetchService = async () => {
      try {
        if (!serviceType || !serviceName) {
          throw new Error("Invalid service URL format");
        }

        // Try to load services.json
        const possiblePaths = [
          "/data/ignore/services.json"
        ];

        let servicesData = null;
        let succeeded = false;
        
        for (const path of possiblePaths) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              servicesData = await response.json();
              console.log(`Successfully loaded services from ${path}`);
              succeeded = true;
              break;
            }
          } catch (err) {
            console.warn(`Failed to load from ${path}, trying next path...`);
          }
        }

        if (!succeeded || !servicesData) {
          throw new Error("Could not load services data from any path");
        }

        // Find the service by name or id in the correct category (case-insensitive)
        let foundService = null;
        const category = serviceType.toLowerCase();
        
        if (servicesData[category]) {
          // First try to find by slug
          foundService = servicesData[category].find(
            (service) => service.slug?.toLowerCase() === `${category}-${serviceName}`.toLowerCase()
          );
          
          // If not found by slug, try to find by name property
          if (!foundService) {
            foundService = servicesData[category].find(
              (service) => service.name?.toLowerCase() === serviceName.toLowerCase()
            );
          }
          
          // If still not found, try to find by numeric ID
          if (!foundService) {
            const numericId = parseInt(serviceName, 10);
            if (!isNaN(numericId)) {
              foundService = servicesData[category].find(
                (service) => service.id === numericId
              );
            }
          }
        }

        if (!foundService) {
          throw new Error(`Service not found: ${serviceType}/${serviceName}`);
        }

        setServiceData(foundService);
        setError(null);
      } catch (error) {
        console.error("Error loading service:", error);
        setError(`Failed to load service: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceType, serviceName, forcedServiceData]);

  // Helper function to clean text content of special markdown formatting
  const cleanTextContent = (text) => {
    if (!text || typeof text !== "string") return text;
    
    // Remove standalone ** markers at the beginning
    return text.replace(/^\*\*$/, "").replace(/^\*\*\s*/, "").replace(/\s*\*\*$/, "").trim();
  };

  // Helper function to adapt block data based on block type
  const adaptBlockData = (block) => {
    const { blockName, config = {}, imagePath, searchTerms } = block;
    
    // Create a base adapted config that includes ALL original config properties
    let adaptedConfig = { ...config };
    
    // If there's an imagePath at the block level, add it to the config
    if (imagePath) {
      adaptedConfig.backgroundImage = imagePath;
    }

    // Clean text content in items if they exist
    if (adaptedConfig.items && Array.isArray(adaptedConfig.items)) {
      adaptedConfig.items = adaptedConfig.items.map(item => {
        if (typeof item === "string") {
          return cleanTextContent(item);
        }
        
        if (typeof item === "object") {
          const cleanedItem = { ...item };
          
          // Clean up common text fields
          if (typeof cleanedItem.title === "string") {
            cleanedItem.title = cleanTextContent(cleanedItem.title);
          }
          if (typeof cleanedItem.content === "string") {
            cleanedItem.content = cleanTextContent(cleanedItem.content);
          }
          if (typeof cleanedItem.description === "string") {
            cleanedItem.description = cleanTextContent(cleanedItem.description);
          }
          if (typeof cleanedItem.name === "string") {
            cleanedItem.name = cleanTextContent(cleanedItem.name);
          }
          
          // Clean arrays of text items if they exist
          if (cleanedItem.advantages && Array.isArray(cleanedItem.advantages)) {
            cleanedItem.advantages = cleanedItem.advantages.map(adv => 
              typeof adv === "string" ? cleanTextContent(adv) : adv
            );
          }
          if (cleanedItem.features && Array.isArray(cleanedItem.features)) {
            cleanedItem.features = cleanedItem.features.map(feature => 
              typeof feature === "string" ? cleanTextContent(feature) : feature
            );
          }
          
          return cleanedItem;
        }
        
        return item;
      });
    }
    
    // Clean up text fields with special formatting tokens
    if (adaptedConfig.title) {
      adaptedConfig.title = cleanTextContent(adaptedConfig.title);
    }
    if (adaptedConfig.subtitle) {
      adaptedConfig.subtitle = cleanTextContent(adaptedConfig.subtitle);
    }
    if (adaptedConfig.description) {
      adaptedConfig.description = cleanTextContent(adaptedConfig.description);
    }
    if (adaptedConfig.heading) {
      adaptedConfig.heading = cleanTextContent(adaptedConfig.heading);
    }
    if (adaptedConfig.paragraph) {
      adaptedConfig.paragraph = cleanTextContent(adaptedConfig.paragraph);
    }
    if (adaptedConfig.footnote) {
      adaptedConfig.footnote = cleanTextContent(adaptedConfig.footnote);
    }
    if (adaptedConfig.paragraphText) {
      adaptedConfig.paragraphText = cleanTextContent(adaptedConfig.paragraphText);
    }
    
    // Block-specific adaptations to ensure proper prop mapping
    switch (blockName) {
      case "HeroBlock":
        // Ensure critical props are set correctly
        if (adaptedConfig.sectionTitle && !adaptedConfig.title) {
          adaptedConfig.title = cleanTextContent(adaptedConfig.sectionTitle);
        }
        break;
        
      case "HeaderBannerBlock":
        // Nothing special needed, main props already cleaned
        break;
        
      case "GeneralList":
        // Ensure sectionTitle is properly set
        if (adaptedConfig.title && !adaptedConfig.sectionTitle) {
          adaptedConfig.sectionTitle = cleanTextContent(adaptedConfig.title);
        }
        break;
        
      case "GridImageTextBlock":
        // Ensure items have image property
        if (adaptedConfig.items && Array.isArray(adaptedConfig.items)) {
          adaptedConfig.items = adaptedConfig.items.map(item => {
            const adaptedItem = { ...item };
            
            // Convert imagePath to image if needed
            if (adaptedItem.imagePath && !adaptedItem.image) {
              adaptedItem.image = adaptedItem.imagePath;
            }
            
            return adaptedItem;
          });
        }
        break;
        
      case "PricingGrid":
        // Ensure items structure is correct
        if (adaptedConfig.items && Array.isArray(adaptedConfig.items)) {
          adaptedConfig.items = adaptedConfig.items.map(item => {
            const cleanedItem = { ...item };
            
            // Ensure price is available
            if (!cleanedItem.price && cleanedItem.rate) {
              cleanedItem.price = cleanedItem.rate;
            } else if (!cleanedItem.price) {
              cleanedItem.price = "Contact for Quote";
            }
            
            return cleanedItem;
          });
        }
        break;
        
      case "VideoCTA":
        // Ensure all required properties are correctly mapped
        if (adaptedConfig.buttonLink && !adaptedConfig.buttonUrl) {
          adaptedConfig.buttonUrl = adaptedConfig.buttonLink;
        }
        if (adaptedConfig.buttonUrl && !adaptedConfig.buttonLink) {
          adaptedConfig.buttonLink = adaptedConfig.buttonUrl;
        }
        break;
        
      case "OverviewAndAdvantagesBlock":
        // Nothing special needed, main props already cleaned
        break;
        
      case "ShingleSelectorBlock":
        // Ensure shingleOptions are properly formatted
        if (adaptedConfig.shingleOptions && Array.isArray(adaptedConfig.shingleOptions)) {
          adaptedConfig.shingleOptions = adaptedConfig.shingleOptions.map(option => {
            const cleanedOption = { ...option };
            return cleanedOption;
          });
        }
        break;
        
      case "ListImageVerticalBlock":
        // Make sure any number property is converted to string
        if (adaptedConfig.items && Array.isArray(adaptedConfig.items)) {
          adaptedConfig.items = adaptedConfig.items.map(item => {
            const cleanedItem = { ...item };
            // Ensure number is a string
            if (cleanedItem.number !== undefined && typeof cleanedItem.number !== 'string') {
              cleanedItem.number = String(cleanedItem.number);
            }
            return cleanedItem;
          });
        }
        break;
        
      case "ActionButtonBlock":
        // Ensure buttonUrl and buttonLink are synchronized
        if (adaptedConfig.buttonLink && !adaptedConfig.buttonUrl) {
          adaptedConfig.buttonUrl = adaptedConfig.buttonLink;
        }
        if (adaptedConfig.buttonUrl && !adaptedConfig.buttonLink) {
          adaptedConfig.buttonLink = adaptedConfig.buttonUrl;
        }
        break;
      
      case "ThreeGridWithRichTextBlock":
        // Nothing special needed, main props already cleaned
        break;
        
      case "ImageWrapBlock":
        // Ensure imageUrl is set
        if (adaptedConfig.imageUrl && !adaptedConfig.imagePath) {
          adaptedConfig.imagePath = adaptedConfig.imageUrl;
        }
        if (adaptedConfig.imagePath && !adaptedConfig.imageUrl) {
          adaptedConfig.imageUrl = adaptedConfig.imagePath;
        }
        break;
          
      case "GeneralListVariant2":
        // Nothing special needed, main props already cleaned
        break;
        
      case "ListDropdown":
        // Ensure items have correct structure
        if (adaptedConfig.items && Array.isArray(adaptedConfig.items)) {
          adaptedConfig.items = adaptedConfig.items.map(item => {
            // If the item is a string, convert it to the expected format
            if (typeof item === "string") {
              return { 
                title: cleanTextContent(item),
                content: "" 
              };
            }
            return item;
          });
        }
        break;
        
      default:
        // Default handling for other block types
        console.warn(`No specific adaptations for block type: ${blockName}`);
        break;
    }
    
    return adaptedConfig;
  };

  // Define a function to render blocks based on their type
  const renderBlock = (block, index) => {
    const { blockName } = block;

    // Get the component from our lookup object
    const BlockComponent = blockComponents[blockName];

    if (!BlockComponent) {
      console.warn(`Unknown block type: ${blockName}`);
      return (
        <div key={index} className="p-4 bg-red-100 text-red-700 rounded">
          Unknown block type: {blockName}
        </div>
      );
    }

    try {
      // IMPORTANT: First create a merged config from block.config and all top-level properties
      // This ensures that properties at both the root and config levels are included
      const mergedConfig = {
        ...block,  // Include all top-level properties
        ...block.config, // Override with config properties
      };
      
      // Remove internal properties we don't want to pass to components
      delete mergedConfig.blockName;
      delete mergedConfig.config;
      
      // Extra logging to debug the HeroBlock title issue
      if (blockName === "HeroBlock") {
        console.log("HeroBlock Original Config:", block.config);
        console.log("HeroBlock Merged Config:", mergedConfig);
      }
      
      // Now adapt the merged config
      const adaptedConfig = adaptBlockData({ 
        blockName,
        config: mergedConfig
      });
      
      // For debugging - log adapted config
      console.log(`Rendering ${blockName} with config:`, adaptedConfig);
      
      // Add readOnly prop
      const propsToPass = { 
        ...adaptedConfig,
        readOnly: true
      };
      
      // For HeroBlock specifically, ensure the title is correct
      if (blockName === "HeroBlock" && block.config.title) {
        propsToPass.title = cleanTextContent(block.config.title);
        console.log("Explicitly set HeroBlock title to:", propsToPass.title);
      }
      
      // Enable this for detailed debugging if needed
      const showDebugInfo = false;
      if (showDebugInfo) {
        return (
          <div key={index} className="border border-blue-300 p-4 mb-4">
            <h3 className="font-bold text-blue-700">{blockName}</h3>
            <div className="mb-2">
              <details open>
                <summary className="text-sm text-blue-500 mb-2">Props being passed:</summary>
                <pre className="text-xs bg-gray-100 p-2 overflow-auto max-h-40">
                  {JSON.stringify(propsToPass, null, 2)}
                </pre>
              </details>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <BlockComponent {...propsToPass} />
            </div>
          </div>
        );
      }
      
      // Render the normal component with the adapted config
      return <BlockComponent key={index} {...propsToPass} />;
    } catch (error) {
      console.error(`Error rendering ${blockName}:`, error);
      return (
        <div key={index} className="p-4 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold">Error rendering {blockName}:</h3>
          <p>{error.message}</p>
          <details>
            <summary>Block Configuration</summary>
            <pre className="mt-2 p-2 bg-gray-200 text-xs overflow-x-auto">
              {JSON.stringify(block, null, 2)}
            </pre>
          </details>
        </div>
      );
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>{error}</p>
        <div className="mt-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Get the page title - using a dedicated title field, or the title from the first HeroBlock
  const getPageTitle = () => {
    if (serviceData?.title) return serviceData.title;
    if (serviceData?.name) return serviceData.name;

    // Try to find the first HeroBlock
    const heroBlock = serviceData?.blocks?.find(
      (b) => b.blockName === "HeroBlock"
    );
    return heroBlock?.config?.title || "Service Page";
  };

  // Render page title for showcase pages
  const isShowcasePage =
    forcedServiceData || serviceData?.id === "all-blocks-showcase";

  return (
    <div className="service-page">
      {isShowcasePage && (
        <div className="py-4 bg-gray-800 text-white">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            <p className="text-gray-300">
              This is a design reference showing all available block types
            </p>
          </div>
        </div>
      )}

      {/* Map through and render all blocks for this service */}
      {serviceData?.blocks?.map(renderBlock)}
    </div>
  );
};

ServicePage.propTypes = {
  forcedServiceData: PropTypes.object,
};

export default ServicePage; 