import { useState, useEffect, Suspense } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import LoadingScreen from "./loadingScreen";
import { slugify } from "../utils/slugify"; // Import the slugify utility
import { useConfig } from "../context/ConfigContext"; // Import ConfigContext

// Import all blocks from ServiceEditPage as a reference for blockMap
import { blockMap as serviceEditBlockMap } from "./ServiceEditPage";

/**
 * Utility function to normalize image URLs (ensure leading slash for relative paths)
 */
const ensureLeadingSlash = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  return `/${url}`;
};

/**
 * Deeply traverses an object or array and applies ensureLeadingSlash to image URLs.
 * Handles various image key names and structures (direct string, object with .url, arrays of strings/objects).
 */
const normalizeImagePathsInData = (dataNode) => {
  if (Array.isArray(dataNode)) {
    return dataNode.map(normalizeImagePathsInData);
  }
  if (dataNode && typeof dataNode === 'object' && !(dataNode instanceof File)) {
    const newNode = { ...dataNode };
    for (const key in newNode) {
      if (Object.prototype.hasOwnProperty.call(newNode, key)) {
        const value = newNode[key];
        const lowerKey = key.toLowerCase();

        if (
          (lowerKey.includes('image') ||
           lowerKey.includes('picture') ||
           lowerKey.includes('background') ||
           lowerKey.includes('logo') || // Added logo
           lowerKey === 'videosrc' || // Added videoSrc
           lowerKey === 'icon') && // Added icon (though less likely to be a path here)
          typeof value === 'string'
        ) {
          newNode[key] = ensureLeadingSlash(value);
        } else if (
          value &&
          typeof value === 'object' &&
          value.url && // Handles { file, url, name, originalUrl } structure
          typeof value.url === 'string'
        ) {
           newNode[key] = { ...value, url: ensureLeadingSlash(value.url) };
        } else if (Array.isArray(value)) {
          // If the array itself is a list of images (e.g., pictures: ['/path1.jpg', {url: '/path2.jpg'}])
          if (lowerKey.includes('image') || lowerKey.includes('picture') || lowerKey.includes('gallery')) {
            newNode[key] = value.map(item => {
              if (typeof item === 'string') return ensureLeadingSlash(item);
              if (item && typeof item === 'object' && item.url && typeof item.url === 'string') {
                return { ...item, url: ensureLeadingSlash(item.url) };
              }
              return item; // Return as is if not a recognizable image string/object
            });
          } else {
            // Otherwise, recurse for arrays of complex objects
            newNode[key] = value.map(normalizeImagePathsInData);
          }
        } else if (value && typeof value === 'object') {
          newNode[key] = normalizeImagePathsInData(value); // Recurse for nested objects
        }
      }
    }
    return newNode;
  }
  return dataNode; // Primitives or Files
};

/**
 * ServicePageCreator Component
 *
 * Dynamically creates service pages based on the services.json data.
 * Routes are /services/:serviceType/:serviceName (e.g., /services/commercial/built-up-roofing)
 */
const ServicePageCreator = () => {
  const [servicePageContent, setServicePageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { serviceType, serviceName: serviceNameFromRoute } = useParams(); // serviceName is the slug
  const { services: configServices } = useConfig(); // Get services from ConfigContext

  useEffect(() => {
    const processServiceData = () => {
      setLoading(true);
      setError(null);
      try {
        if (!configServices) {
          throw new Error("No services data available from ConfigContext");
        }

        if (!configServices[serviceType] || !Array.isArray(configServices[serviceType])) {
          throw new Error(`Service type "${serviceType}" not found or not an array in services data.`);
        }

        const foundService = configServices[serviceType].find(service => {
          // Find the HeroBlock to get the title for slugification
          const heroBlock = service.blocks?.find(b => b.blockName === "HeroBlock" || b.blockName === "PageHeroBlock");
          const titleFromHero = heroBlock?.config?.title;
          const titleToSlugify = titleFromHero || service.name || service.title || `service-${service.id}`;
          return slugify(titleToSlugify) === serviceNameFromRoute;
        });

        if (foundService) {
          // Deep normalize image paths in the found service's config
          const normalizedService = normalizeImagePathsInData(foundService);
          setServicePageContent(normalizedService);
        } else {
          throw new Error(
            `Service with name slug "${serviceNameFromRoute}" not found in category "${serviceType}".`
          );
        }
      } catch (err) {
        console.error("Error in ServicePageCreator:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (serviceType && serviceNameFromRoute) {
      processServiceData();
    } else {
      setError("Service type or name missing from route.");
      setLoading(false);
    }
  }, [serviceType, serviceNameFromRoute, configServices]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <p className="text-sm mt-2">Please check the URL or contact support.</p>
        </div>
      </div>
    );
  }

  if (!servicePageContent || !servicePageContent.blocks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No content found for this service page.</p>
      </div>
    );
  }
  
  console.log("Rendering ServicePageCreator with content:", servicePageContent);

  return (
    <div className="service-page-container">
      <Suspense fallback={<LoadingScreen />}>
        {servicePageContent.blocks.map((block, index) => {
          const BlockComponent = serviceEditBlockMap[block.blockName];
          if (!BlockComponent) {
            console.warn(`ServicePageCreator: Unknown block type "${block.blockName}" at index ${index}.`);
            return (
              <div key={`unknown-${index}`} className="p-4 my-2 text-center bg-yellow-100 text-yellow-700 border border-yellow-300 rounded">
                Block type "{block.blockName}" is not recognized. Please check configuration.
              </div>
            );
          }
          
          // Ensure config is always an object, even if undefined in JSON
          const config = block.config || {}; 
          const uniqueKey = block.uniqueKey || `block-${index}`;

          // Log props being passed to each block for debugging
           console.log(`Rendering block: ${block.blockName} (key: ${uniqueKey}) with config:`, config);

          // For HeroBlock, ensure it gets its config directly if the blockMap uses PageHeroBlock or HeroBlock
          if (block.blockName === "HeroBlock" || block.blockName === "PageHeroBlock") {
             return <BlockComponent key={uniqueKey} config={config} readOnly={true} />;
          }
          
          // Standard rendering for other blocks
          return <BlockComponent key={uniqueKey} config={config} readOnly={true} />;
        })}
      </Suspense>
    </div>
  );
};

ServicePageCreator.propTypes = {
  // No props expected directly anymore as data is fetched based on route params
};

export default ServicePageCreator; 