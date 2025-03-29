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
          serviceIdentifier = `${params.category.toLowerCase()}_${params.id}`;
        } else if (params.id && !params.serviceSlug) {
          // Handle /Residential_service_X or /Commercial_service_X format
          if (location.pathname.includes("Residential_service_")) {
            serviceIdentifier = `residential_${params.id}`;
          } else if (location.pathname.includes("Commercial_service_")) {
            serviceIdentifier = `commercial_${params.id}`;
          }
        }

        if (!serviceIdentifier) {
          throw new Error("Invalid service identifier");
        }

        // Step 2: Fetch the services.json data
        const servicesResponse = await fetch("/data/services.json");
        if (!servicesResponse.ok) {
          throw new Error(`HTTP error! Status: ${servicesResponse.status}`);
        }
        const servicesData = await servicesResponse.json();

        // Step 3: Find the service by slug or legacy identifier
        let foundService = null;

        // Check all categories (residential, commercial, and potentially showcase)
        for (const category in servicesData) {
          const categoryServices = servicesData[category];
          if (Array.isArray(categoryServices)) {
            // Try to find by slug (modern format)
            foundService = categoryServices.find(
              (service) => service.slug === serviceIdentifier
            );

            // If not found by slug, try legacy identifier formats
            if (!foundService) {
              const legacyId = serviceIdentifier.split("_").pop();
              foundService = categoryServices.find(
                (service) => service.id == legacyId
              );
            }

            if (foundService) break;
          }
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
      return <BlockComponent key={index} {...config} />;
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

    const fetchData = async () => {
      setLoading(true);
      console.log("ServicePage: Fetching data for params:", {
        serviceSlug,
        category,
        routeId,
      });
      console.log("Current URL path:", location.pathname);

      try {
        // Fetch services data
        const response = await fetch("/data/services.json");
        const data = await response.json();

        console.log("ServicePage: Data fetched successfully");
        let foundService = null;

        // Parse path to extract service type and ID for old URL formats
        const pathParts = location.pathname.split("/");
        const isOldResidentialFormat = pathParts[1]?.startsWith(
          "Residential_service_"
        );
        const isOldCommercialFormat = pathParts[1]?.startsWith(
          "Commercial_service_"
        );

        let extractedId;
        let serviceType;

        if (isOldResidentialFormat) {
          extractedId = pathParts[1].replace("Residential_service_", "");
          serviceType = "residential";
        } else if (isOldCommercialFormat) {
          extractedId = pathParts[1].replace("Commercial_service_", "");
          serviceType = "commercial";
        } else if (category) {
          serviceType = category;
          extractedId = routeId;
        }

        console.log("Extracted service info:", { serviceType, extractedId });

        // Check if serviceSlug contains a numeric ID (for old URL patterns)
        const slugMatch = serviceSlug?.match(/^(residential|commercial)-(\d+)/);
        if (slugMatch) {
          serviceType = slugMatch[1];
          extractedId = slugMatch[2];
        }

        // Special case for all-service-blocks path
        if (location.pathname === "/all-service-blocks") {
          try {
            const specialResponse = await fetch("/data/all_blocks_service.json");
            const specialData = await specialResponse.json();
            setServiceData(specialData);
            setError(null);
            setLoading(false);
            return;
          } catch (e) {
            console.error("Failed to load all-blocks service:", e);
            // Continue with normal service loading
          }
        }

        // First try to find by slug
        if (serviceSlug) {
          console.log(
            `ServicePage: Searching for service with slug: ${serviceSlug}`
          );

          // Check commercial services first
          data.commercial.forEach((service, idx) => {
            const title =
              service.blocks?.find((block) => block.blockName === "HeroBlock")
                ?.config?.title || "";
            const tempSlug = `commercial-${service.id}-${title.toLowerCase().replace(/\s+/g, "-")}`;

            console.log(
              `ServicePage: Checking commercial service #${idx + 1}:`,
              {
                id: service.id,
                title,
                dynamicSlug: tempSlug,
              }
            );

            if (service.slug === serviceSlug || tempSlug === serviceSlug) {
              console.log(
                `ServicePage: Found matching commercial service:`,
                service
              );
              foundService = service;
            }
          });

          // If not found in commercial, check residential
          if (!foundService) {
            data.residential.forEach((service, idx) => {
              const title =
                service.blocks?.find((block) => block.blockName === "HeroBlock")
                  ?.config?.title || "";
              const tempSlug = `residential-${service.id}-${title.toLowerCase().replace(/\s+/g, "-")}`;

              console.log(
                `ServicePage: Checking residential service #${idx + 1}:`,
                {
                  id: service.id,
                  title,
                  dynamicSlug: tempSlug,
                }
              );

              if (service.slug === serviceSlug || tempSlug === serviceSlug) {
                console.log(
                  `ServicePage: Found matching residential service:`,
                  service
                );
                foundService = service;
              }
            });
          }
        }

        // If service not found by slug, try to find by ID from old URL formats
        if (!foundService && extractedId) {
          console.log(
            `ServicePage: Searching for service with ID: ${extractedId} in ${serviceType || "both"} category`
          );

          if (!serviceType || serviceType === "commercial") {
            const commercialService = data.commercial.find(
              (s) => s.id.toString() === extractedId.toString()
            );
            if (commercialService) {
              console.log(
                `ServicePage: Found matching commercial service by ID:`,
                commercialService
              );
              foundService = commercialService;
            }
          }

          if (
            !foundService &&
            (!serviceType || serviceType === "residential")
          ) {
            const residentialService = data.residential.find(
              (s) => s.id.toString() === extractedId.toString()
            );
            if (residentialService) {
              console.log(
                `ServicePage: Found matching residential service by ID:`,
                residentialService
              );
              foundService = residentialService;
            }
          }
        }

        if (foundService) {
          console.log("ServicePage: Setting service data:", foundService);
          setServiceData(foundService);
          setError(null);
        } else {
          setError("Service not found");
          console.error("ServicePage: Service not found for", {
            serviceSlug,
            category,
            routeId,
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError("Failed to load service data");
          console.error("ServicePage: Error fetching data:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceSlug, category, routeId, location.pathname, forcedServiceData]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>{error}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Show a loading state while data is being fetched
  if (!serviceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  // Render the service page with blocks
  return (
    <div className="service-page">
      {serviceData.blocks && serviceData.blocks.map((block, index) => {
        const BlockComponent = blockMap[block.blockName];
        if (!BlockComponent) {
          console.error(`Block type ${block.blockName} not found`);
          return (
            <div key={`unknown-block-${index}`} className="p-4 bg-red-100 text-red-700 my-4">
              Unknown block type: {block.blockName}
            </div>
          );
        }

        // Handle potential errors with individual blocks
        try {
          return (
            <div key={`${block.blockName}-${index}`} className="block-wrapper">
              <BlockComponent readOnly {...block.config} />
            </div>
          );
        } catch (error) {
          console.error(`Error rendering ${block.blockName}:`, error);
          return (
            <div key={`error-block-${index}`} className="p-4 bg-yellow-100 text-yellow-800 my-4">
              Error rendering {block.blockName}: {error.message}
            </div>
          );
        }
      })}
    </div>
  );
};

ServicePage.propTypes = {
  forcedServiceData: PropTypes.object
};

export default ServicePage;
