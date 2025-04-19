
// src/components/ServicePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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

const ServicePage = ({ forcedServiceData = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // If forcedServiceData is provided, use that instead of fetching from the URL params
  useEffect(() => {
    if (forcedServiceData) {
      setServiceData(forcedServiceData);
      setLoading(false);
      return;
    }

    // Only run the data fetching if forcedServiceData is not provided
    const fetchService = async () => {
      try {
        // Extract service information from URL params
        // Expected format: /services/residential/siding or /services/commercial/metal-roof
        const { serviceType, serviceName } = params;
        
        console.log("Service params:", { serviceType, serviceName });
        
        if (!serviceType || !serviceName) {
          throw new Error(`Missing service parameters. Type: ${serviceType}, Name: ${serviceName}`);
        }

        // Step 2: Fetch the services.json data
        const servicesResponse = await fetch("/data/raw_data/step_4/services.json");
        if (!servicesResponse.ok) {
          throw new Error(`HTTP error! Status: ${servicesResponse.status}`);
        }
        const servicesData = await servicesResponse.json();

        console.log("Services data:", servicesData);

        // Step 3: Find the service by type and name (case-insensitive)
        const serviceCategory = serviceType.toLowerCase();
        const normalizedSearchName = serviceName.toLowerCase().replace(/-/g, ' ');
        
        console.log(`Looking for service: ${serviceCategory}/${normalizedSearchName}`);
        
        if (!servicesData[serviceCategory]) {
          throw new Error(`Invalid service type: ${serviceCategory}`);
        }

        // First try exact match by name
        let foundService = servicesData[serviceCategory].find(
          (service) => service.name && service.name.toLowerCase() === normalizedSearchName
        );

        if (!foundService) {
          // Try a more flexible search if exact match fails
          console.log("Exact match not found, trying flexible match");
          const closeMatch = servicesData[serviceCategory].find(
            (service) => 
              (service.name && service.name.toLowerCase().includes(normalizedSearchName)) || 
              (normalizedSearchName.includes(service.name && service.name.toLowerCase()))
          );
          
          if (closeMatch) {
            console.log("Found close match:", closeMatch.name);
            foundService = closeMatch;
          } else {
            throw new Error(`Service not found: ${serviceCategory}/${normalizedSearchName}`);
          }
        }

        // Step 4: Use the found service data
        console.log("Found service:", foundService);
        setServiceData(foundService);
        setError(null);
      } catch (error) {
        console.error("Error loading service:", error);
        setError(`Failed to load service: ${error.message}`);
        
        // Debugging information
        console.log("URL params:", params);
        console.log("URL path:", location.pathname);
        console.log("All available parameters:", { params, location });
        
        // Attempt to list available services for debugging
        try {
          const debugResponse = await fetch("/data/raw_data/step_4/services.json");
          if (debugResponse.ok) {
            const debugData = await debugResponse.json();
            console.log("Available services:", debugData);
          }
        } catch (debugError) {
          console.error("Error loading debug data:", debugError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [params, location.pathname, forcedServiceData]);

  // Define a function to render blocks based on their type
  const renderBlock = (block, index) => {
    const { blockName, config = {} } = block;

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
      // Render the appropriate component for this block
      // Pass readOnly=true to ensure blocks render in view mode, not edit mode
      return <BlockComponent key={index} readOnly={true} {...config} />;
    } catch (error) {
      console.error(`Error rendering ${blockName}:`, error);
      return (
        <div key={index} className="p-4 bg-red-100 text-red-700 rounded">
          Error rendering {blockName}: {error.message}
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
