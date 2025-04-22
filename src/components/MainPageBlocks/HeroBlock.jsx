import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa";

/* 
====================================================
 1) HERO PREVIEW (READ-ONLY)
----------------------------------------------------
Uses a `heroconfig` prop with (at minimum):
{
  mainTitle: string,
  subTitle: string,
  residential: { subServices: [{ title: string }, ...] },
  commercial:  { subServices: [{ title: string }, ...] },
  logo: string,              // URL for logo image
  heroImage: string,         // URL for hero background image
}
If a field is missing, a default is used.
====================================================
*/
function HeroPreview({ heroconfig }) {
  if (!heroconfig) {
    return <p>No data found.</p>;
  }

  // CSS variables for consistent styling
  const bannerStyles = {
    "--banner-color": "#1e293b", // Match the banner color from tailwind.config.js
  };

  console.log("HeroBlock config:", heroconfig);

  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);
  const [hasAnimated, setHasAnimated] = useState(false);

  const {
    mainTitle,
    subTitle,
    residential = { subServices: [] },
    commercial = { subServices: [] },
    logo,
    heroImage,
  } = heroconfig;

  useEffect(() => {
    setHasAnimated(true);

    // Create residential service links with the new URL format
    // Add a special mapping to fix the mismatch between combined_data.json and services.json
    const processedResidentialServices = residential.subServices.map(service => {
      // Get the title and convert to lowercase for comparison
      const originalTitle = service.title;
      const lowercaseTitle = originalTitle.toLowerCase();
      
      // Special mapping for services that don't match between files
      let actualServiceName = lowercaseTitle;
      
      // This fixes the mismatch where:
      // - "Siding" in combined_data.json should link to "Chimney" (ID 3) in services.json
      // - "Chimney" in combined_data.json should link to "Guttering" (ID 2) in services.json
      // - "Repairs" in combined_data.json should link to "Skylights" (ID 4) in services.json
      if (lowercaseTitle === "siding") {
        actualServiceName = "chimney";
        console.log("Mapping 'Siding' to 'chimney' service");
      } else if (lowercaseTitle === "chimney") {
        actualServiceName = "guttering";
        console.log("Mapping 'Chimney' to 'guttering' service");
      } else if (lowercaseTitle === "repairs") {
        actualServiceName = "skylights";
        console.log("Mapping 'Repairs' to 'skylights' service");
      }
      
      return {
        label: originalTitle, // Keep the display label as shown in the HeroBlock
        // Use the mapped service name for the actual URL
        route: `/services/residential/${actualServiceName}`,
      };
    });
    
    // Create commercial service links with the new URL format
    const processedCommercialServices = commercial.subServices.map(service => {
      // Convert title to URL-friendly format
      const urlTitle = service.title.toLowerCase().replace(/\s+/g, '-');
      
      return {
        label: service.title,
        // New URL format: /services/commercial/metal-roof
        route: `/services/commercial/${urlTitle}`,
      };
    });
    
    setResidentialServices(processedResidentialServices);
    setCommercialServices(processedCommercialServices);
  }, [residential.subServices, commercial.subServices]);

  const [activeSection, setActiveSection] = useState("neutral");
  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? "neutral" : section));
  };

  // Function to handle clicks on a section or its elements
  const handleSectionElementClick = (e, section) => {
    e.stopPropagation();
    setActiveSection((prev) => (prev === section ? "neutral" : section));
  };

  // Modified animation variants
  const iconVariants = {
    active: {
      opacity: [1, 1, 0],
      y: [-0, -10, -10], // Reduced vertical movement
      transition: {
        duration: 0.5,
        times: [0, 0.6, 1],
      },
    },
    default: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const titleVariants = {
    active: {
      y: 0, // Reduced vertical distance
      transition: { duration: 0.5 },
    },
    default: {
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const listVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: window.innerWidth < 768 ? 150 : 220,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
        delay: 0.3, // Reduced delay to account for shorter animation
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <section className="relative" style={bannerStyles}>
      {/* Top white area - Controls distance from top via height */}

      {/* Gradient from white to transparent - overlay on top of images */}
      <div
        className={`absolute top-[4vh] md:top-[0vh] left-0 right-0 bg-gradient-to-b from-white from-0% to-transparent pointer-events-none ${
          activeSection === "neutral"
            ? "h-[18vh] md:h-[18vh]"
            : "h-[10vh] md:h-[10vh]"
        }`}
        style={{ transition: "height 0.3s ease-out 0.4s", zIndex: 1 }}
      />

      {/* Hero Split Sections */}
      <div className="relative w-full h-[50vw] md:h-[45vh] ">
        {/* Single background image container */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ x: 0 }}
          animate={{
            x: activeSection === "commercial" 
              ? "-20vw" 
              : activeSection === "residential" 
                ? "20vw" 
                : "0vw"
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          <div
            className="absolute inset-0 w-[100vw] h-full"
            style={{
              background: `url('${heroImage}') no-repeat center center`,
              backgroundSize: "cover",
              transformOrigin: "center center",
            }}
          />
        </motion.div>

        {/* Interactive sections overlay */}
        <div className="relative w-full h-full flex">
          {/* Residential section */}
          <div 
            className="w-1/2 h-full cursor-pointer"
            onClick={() =>
              setActiveSection((prev) =>
                prev === "residential" ? "neutral" : "residential"
              )
            }
          >
            <div className="absolute inset-0 left-0 right-1/2 flex items-center justify-center pointer-events-none z-50">
              <div className="flex flex-col items-center pointer-events-auto">
                <div
                  className={`flex flex-col items-center cursor-pointer rounded-lg p-1 ${
                    activeSection !== "residential" ? "" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection((prev) =>
                      prev === "residential" ? "neutral" : "residential"
                    );
                  }}
                >
                  <motion.div
                    variants={iconVariants}
                    animate={
                      activeSection === "residential" ? "active" : "default"
                    }
                  >
                    <Home className="w-[6.5vw] h-[6.5vw] md:w-[6.5vh] md:h-[6.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-gray-50" />
                  </motion.div>

                  <motion.h2
                    variants={titleVariants}
                    animate={
                      activeSection === "residential" ? "active" : "default"
                    }
                    className="text-[3.2vw] md:text-[2.4vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-gray-50 font-serif -mt-3"
                  >
                    Residential
                  </motion.h2>
                </div>

                {activeSection === "residential" && (
                  <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-white font-serif text-center -space-y-2 md:space-y-0 text-[2.3vw] md:text-[2.4vh] font-normal drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                  >
                    {residentialServices.map((service, idx) => (
                      <motion.li
                        key={idx}
                        variants={itemVariants}
                        className="flex items-center justify-center whitespace-nowrap"
                      >
                        <Link
                          to={service.route}
                          onClick={(e) => e.stopPropagation()}
                          className="text-white font-serif py-1 rounded hover:underline"
                        >
                          {service.label}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </div>
          </div>

          {/* Commercial section */}
          <div 
            className="w-1/2 h-full cursor-pointer"
            onClick={() =>
              setActiveSection((prev) =>
                prev === "commercial" ? "neutral" : "commercial"
              )
            }
          >
            <div className="absolute inset-0 left-1/2 right-0 flex items-center justify-center pointer-events-none z-50">
              <div className="flex flex-col items-center pointer-events-auto">
                <div
                  className={`flex flex-col items-center cursor-pointer ${
                    activeSection !== "commercial" ? "" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection((prev) =>
                      prev === "commercial" ? "neutral" : "commercial"
                    );
                  }}
                >
                  <motion.div
                    variants={iconVariants}
                    animate={
                      activeSection === "commercial" ? "active" : "default"
                    }
                  >
                    <FaWarehouse className="w-[6.5vw] h-[6.5vw] md:w-[6.5vh] md:h-[6.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-gray-50" />
                  </motion.div>

                  <motion.h2
                    variants={titleVariants}
                    animate={
                      activeSection === "commercial" ? "active" : "default"
                    }
                    className="text-[3.2vw] md:text-[2.4vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-gray-50 font-serif -mt-3"
                  >
                    Commercial
                  </motion.h2>
                </div>

                {activeSection === "commercial" && (
                  <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-white font-serif text-center -space-y-2 md:space-y-0 text-[2.3vw] md:text-[2.4vh] font-normal drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                  >
                    {commercialServices.map((service, idx) => (
                      <motion.li
                        key={idx}
                        variants={itemVariants}
                        className="flex items-center justify-center whitespace-nowrap"
                      >
                        <Link
                          to={service.route}
                          onClick={(e) => e.stopPropagation()}
                          className="text-white font-serif py-1 rounded hover:underline"
                        >
                          {service.label}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dark red gradient at the bottom - overlay only on the images */}
        <div
          className={`absolute bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-t from-banner from-10% to-transparent ${
            activeSection === "neutral"
              ? "h-[15vh] md:h-[18vh]"
              : "h-[9vh] md:h-[10vh]"
          }`}
          style={{ transition: "height 0.3s ease-out 0.4s", zIndex: 1 }}
        />
      </div>
    </section>
  );
}

/* 
====================================================
 2) HERO EDITOR PANEL (EDIT MODE)
----------------------------------------------------
Reorganized to match the visual layout of the preview.
Connects services directly to the services.json file.
====================================================
*/
function HeroEditorPanel({ localData, setLocalData, onSave }) {
  const {
    mainTitle = "",
    subTitle = "",
    residential = { subServices: [] },
    commercial = { subServices: [] },
    logo,
    heroImage,
  } = localData;

  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);

  // Simplified path display method
  const getDisplayPath = (imagePath) => {
    return imagePath || "";
  };

  // Load services from combined_data.json
  useEffect(() => {
    setIsServicesLoading(true);

    // First try to fetch from the main data directory
    fetch("/data/combined_data.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("HeroEditorPanel: Combined data fetched:", data);
        processData(data);
      })
      .catch((error) => {
        console.error(
          "HeroEditorPanel: Error fetching from main directory:",
          error
        );

        // Fallback to step_4 directory
        console.log("HeroEditorPanel: Trying fallback location...");
        fetch("/data/raw_data/step_4/combined_data.json")
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
          })
          .then((data) => {
            console.log("HeroEditorPanel: Fallback data fetched:", data);
            processData(data);
          })
          .catch((fallbackError) => {
            console.error(
              "HeroEditorPanel: Error fetching fallback data:",
              fallbackError
            );
            setIsServicesLoading(false);
          });
      });

    // Function to process the fetched data
    const processData = (data) => {
      // Process residential services from combined_data
      const residentialFromJson = data.hero.residential.subServices.map(
        (service, idx) => {
          const title = service.title || `Service ${idx + 1}`;
          const slug = `residential-${idx + 1}-${title.toLowerCase().replace(/\s+/g, "-")}`;

          return {
            id: idx + 1,
            label: title,
            route: `/services/${slug}`,
            slug,
          };
        }
      );

      // Process commercial services from combined_data
      const commercialFromJson = data.hero.commercial.subServices.map(
        (service, idx) => {
          const title = service.title || `Service ${idx + 1}`;
          const slug = `commercial-${idx + 1}-${title.toLowerCase().replace(/\s+/g, "-")}`;

          return {
            id: idx + 1,
            label: title,
            route: `/services/${slug}`,
            slug,
          };
        }
      );

      setResidentialServices(residentialFromJson);
      setCommercialServices(commercialFromJson);
      setIsServicesLoading(false);
    };
  }, []);

  // Image upload handlers
  const handleLogoChange = (file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setLocalData((prev) => ({ ...prev, logo: fileURL }));
    }
  };

  const handleHeroImageChange = (file) => {
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    setLocalData((prev) => ({ ...prev, heroImage: fileURL }));
  };

  // Handler for service selection/deselection
  const handleServiceToggle = (serviceType, serviceId) => {
    const services =
      serviceType === "residential" ? residentialServices : commercialServices;
    const selectedService = services.find((s) => s.id === serviceId);

    if (!selectedService) return;

    const currentSubServices = localData[serviceType]?.subServices || [];
    const isSelected = currentSubServices.some((s) => s.id === serviceId);

    let newSubServices;
    if (isSelected) {
      // Remove service
      newSubServices = currentSubServices.filter((s) => s.id !== serviceId);
    } else {
      // Add service
      newSubServices = [
        ...currentSubServices,
        {
          id: serviceId,
          title: selectedService.label,
          slug: selectedService.slug,
        },
      ];
    }

    setLocalData((prev) => ({
      ...prev,
      [serviceType]: {
        ...prev[serviceType],
        subServices: newSubServices,
      },
    }));
  };

  // Utility function to check if a service is selected
  const isServiceSelected = (serviceType, serviceId) => {
    return (
      localData[serviceType]?.subServices?.some((s) => s.id === serviceId) ||
      false
    );
  };

  return (
    <div className="bg-gray-900 text-white rounded-md ">
      {/* Title Bar with Save Button */}
      <div className="flex items-center justify-between bg-banner p-4">
        <h2 className="text-xl font-semibold">Hero Block Editor</h2>
        <button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Main Title and Logo Section */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-sm mb-1 text-gray-300">Logo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoChange(e.target.files?.[0])}
              className="w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2"
            />
            {logo && (
              <img
                src={getDisplayPath(logo)}
                alt="Logo Preview"
                className="mt-2 h-20 object-contain"
              />
            )}
          </div>
          <div className="w-full md:w-2/3">
            <div className="mb-3">
              <label className="block text-sm mb-1 text-gray-300">
                Main Title:
              </label>
              <input
                type="text"
                value={localData.mainTitle || ""}
                onChange={(e) =>
                  setLocalData((prev) => ({
                    ...prev,
                    mainTitle: e.target.value,
                  }))
                }
                className="w-full bg-gray-700 text-white rounded-md border border-gray-600 p-2"
                placeholder="Enter main title"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Sub Title:
              </label>
              <input
                type="text"
                value={localData.subTitle || ""}
                onChange={(e) =>
                  setLocalData((prev) => ({
                    ...prev,
                    subTitle: e.target.value,
                  }))
                }
                className="w-full bg-gray-700 text-white rounded-md border border-gray-600 p-2"
                placeholder="Enter subtitle"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Split Section for Residential and Commercial */}
      <div className="flex flex-col md:flex-row">
        {/* Residential Side */}
        <div className="w-full md:w-1/2 p-4 bg-gray-800 border-r border-gray-700 ">
          <h3 className="text-lg font-semibold mb-3 text-amber-100 -mt-3">
            Residential
          </h3>

          <div className="mt-4">
            <label className="block text-sm mb-2 text-gray-300">
              Available Services:
            </label>
            {isServicesLoading ? (
              <p className="text-gray-400 text-sm">Loading services...</p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                {residentialServices.map((service) => (
                  <div
                    key={service.id}
                    className={`p-2 rounded-md cursor-pointer flex items-center ${
                      isServiceSelected("residential", service.id)
                        ? "bg-blue-900"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() =>
                      handleServiceToggle("residential", service.id)
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isServiceSelected("residential", service.id)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span>{service.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Commercial Side */}
        <div className="w-full md:w-1/2 p-4 bg-gray-800">
          <h3 className="text-lg font-semibold mb-3 text-amber-100">
            Commercial
          </h3>

          <div className="mt-4">
            <label className="block text-sm mb-2 text-gray-300">
              Available Services:
            </label>
            {isServicesLoading ? (
              <p className="text-gray-400 text-sm">Loading services...</p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                {commercialServices.map((service) => (
                  <div
                    key={service.id}
                    className={`p-2 rounded-md cursor-pointer flex items-center ${
                      isServiceSelected("commercial", service.id)
                        ? "bg-blue-900"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() =>
                      handleServiceToggle("commercial", service.id)
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isServiceSelected("commercial", service.id)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span>{service.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Background Image Section */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-amber-100">
          Hero Background Image
        </h3>
        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-300">
            Background Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleHeroImageChange(e.target.files?.[0])}
            className="w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2"
          />
          {getDisplayPath(heroImage) && (
            <img
              src={getDisplayPath(heroImage)}
              alt="Hero Background"
              className="mt-2 h-24 w-full object-cover rounded-md"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* 
====================================================
 3) MAIN EXPORT: HERO BLOCK
----------------------------------------------------
If readOnly=true, renders HeroPreview.
If false, renders HeroEditorPanel.
====================================================
*/
export default function HeroBlock({
  heroconfig,
  readOnly = false,
  onConfigChange,
}) {
  // Helper function to ensure proper image paths
  const ensureProperImagePaths = (config) => {
    // If we're in edit mode, we might get object URLs or other temporary paths
    // This ensures that when saving, paths are properly formatted
    const updatedConfig = { ...config };

    // Only process and update paths if they exist
    if (
      updatedConfig.logo &&
      !updatedConfig.logo.startsWith("/assets/images/hero/")
    ) {
      // If it's an object URL or other temporary path, we'll need to handle it differently
      // For now, we'll just note that this path needs to be processed
      console.log(
        "Logo path might need server-side processing:",
        updatedConfig.logo
      );
    }

    if (
      updatedConfig.heroImage &&
      !updatedConfig.heroImage.startsWith("/assets/images/hero/")
    ) {
      console.log(
        "Hero image path might need server-side processing:",
        updatedConfig.heroImage
      );
    }

    return updatedConfig;
  };

  const [localHero, setLocalHero] = useState(() => {
    // Use provided hero config or create a default one
    if (!heroconfig) {
      return {
        mainTitle: "",
        subTitle: "",
        residential: {
          subServices: [],
        },
        commercial: {
          subServices: [],
        },
        logo: "",
        heroImage: "",
      };
    }
    return { ...heroconfig };
  });

  const handleSave = () => {
    if (onConfigChange) {
      // Process paths before saving
      const processedConfig = ensureProperImagePaths(localHero);
      onConfigChange(processedConfig);
    }
  };

  if (readOnly) {
    return <HeroPreview heroconfig={heroconfig} />;
  }

  return (
    <HeroEditorPanel
      localData={localHero}
      setLocalData={setLocalHero}
      onSave={handleSave}
    />
  );
}
