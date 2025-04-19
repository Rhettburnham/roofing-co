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
        // Step 1: Extract the service identifier from URL params
        let serviceIdentifier = params.serviceSlug;

        // Handle legacy URL formats
        if (params.category && params.id) {
          serviceIdentifier = `${params.category}-${params.id}`;
        }

        if (!serviceIdentifier) {
          throw new Error("Invalid service identifier");
        }

        // Step 2: Fetch the services.json data from the correct path
        const servicesResponse = await fetch(
          "/data/raw_data/step_4/services.json"
        );
        if (!servicesResponse.ok) {
          throw new Error(`HTTP error! Status: ${servicesResponse.status}`);
        }
        const servicesData = await servicesResponse.json();

        // Step 3: Find the service by slug
        let foundService = null;

        // Check both residential and commercial categories
        for (const category of ["residential", "commercial"]) {
          foundService = servicesData[category]?.find(
            (service) => service.slug === serviceIdentifier
          );
          if (foundService) break;
        }

        if (!foundService) {
          throw new Error(`Service not found: ${serviceIdentifier}`);
        }

        // Step 4: Use the found service data
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

    // Try to find the first HeroBlock
    const heroBlock = serviceData?.blocks?.find(
      (b) => b.blockName === "HeroBlock"
    );
    return heroBlock?.config?.title || "Service Page";
  };

  // Render page title for showcase pages
  const isShowcasePage =
    forcedServiceData || serviceData?.id === "all-blocks-showcase";

  const resolveServicePath = (params) => {
    // Handle modern slug format
    if (params.serviceSlug) {
      return params.serviceSlug;
    }

    // Handle legacy format
    if (params.category && params.id) {
      return `${params.category}-${params.id}`;
    }

    return null;
  };

  // Use in the component
  const servicePath = resolveServicePath(params);

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
