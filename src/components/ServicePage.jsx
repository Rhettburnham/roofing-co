// src/components/ServicePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import GridImageTextBlock from "./blocks/GridImageTextBlock";
import ThreeGridWithRichTextBlock from "./blocks/ThreeGridWithRichTextBlock";
import ImageWrapBlock from "./blocks/ImageWrapBlock";
import ShingleSelectorBlock from "./blocks/ShingleSelectorBlock";
import ListImageVerticalBlock from "./blocks/ListImageVerticalBlock";

// Map block names from the JSON to the actual React components
const blockMap = {
  HeroBlock,
  GeneralList,
  VideoCTA,
  GeneralListVariant2,
  OverviewAndAdvantagesBlock,
  ActionButtonBlock,
  HeaderBannerBlock,
  PricingGrid,
  ListDropdown,
  GridImageTextBlock,
  ThreeGridWithRichTextBlock,
  ImageWrapBlock,
  ShingleSelectorBlock,
  ListImageVerticalBlock,
};

const ServicePage = () => {
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { serviceSlug, category, id: routeId } = useParams();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

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
  }, [serviceSlug, category, routeId, location.pathname]);

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

  // Render blocks directly as in the original code
  return (
    <div className="w-full">
      {serviceData.blocks.map((block, index) => {
        const Component = blockMap[block.blockName];
        if (!Component) {
          console.warn(`No component found for block: ${block.blockName}`);
          return null;
        }
        return <Component key={index} config={block.config} readOnly={true} />;
      })}
    </div>
  );
};

export default ServicePage;
