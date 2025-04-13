import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Home, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

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
  residentialImage: string,  // URL for residential background
  commercialImage: string    // URL for commercial background
}
If a field is missing, a default is used.
====================================================
*/
function HeroPreview({ heroconfig }) {
  if (!heroconfig) {
    return <p>No data found.</p>;
  }

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
    residentialImage,
    commercialImage,
  } = heroconfig;

  useEffect(() => {
    setHasAnimated(true);
    
    // Map residential services
    setResidentialServices(residential.subServices.map((service) => ({
      label: service.title,
      // Use the slug from services.json
      route: `/services/${service.slug}`
    })));

    // Map commercial services
    setCommercialServices(commercial.subServices.map((service) => ({
      label: service.title,
      // Use the slug from services.json
      route: `/services/${service.slug}`
    })));
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

  // Gentle sliding animation for default state
  const restingAnimation = {
    x: [-10, 20, -10],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear",
    },
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
    <section className="relative">
      {/* Top white area - Controls distance from top via height */}
      <div className="h-[14vh] md:h-[21vh] bg-white w-full relative z-10">
        {/* Logo & Titles - Controls vertical position via transform translate */}
        <div className="absolute top-10 md:top-8 left-0 right-0 transform translate-y-1/2 w-full z-60 flex flex-row items-center justify-center">
          <motion.img
            initial={{ x: -100, opacity: 0 }}
            animate={hasAnimated ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={logo}
            alt="hero-logo"
            className="w-[15vw] md:w-[14vh] h-auto mr-5 md:mr-10 z-50"
            style={{ filter: "invert(0)" }}
          />
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={hasAnimated ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative flex flex-col items-center justify-center z-50 -space-y-[1vh] md:-space-y-[5vh]"
          >
            <span className="whitespace-nowrap text-[6vw] md:text-[7vh] text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-normal font-ultra-condensed">
              {mainTitle}
            </span>
            <span className="text-[4vw] md:text-[4vh] md:pt-[2.5vh] text-left drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif">
              {subTitle}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Gradient from white to transparent - overlay on top of images */}
      <div
        className={`absolute top-[14vh] md:top-[21vh] left-0 right-0 bg-gradient-to-b z-40 from-white from-0% to-transparent pointer-events-none ${
          activeSection === "neutral"
            ? "h-[18vh] md:h-[18vh]"
            : "h-[10vh] md:h-[10vh]"
        }`}
        style={{ transition: "height 0.3s ease-out 0.4s", zIndex: 5 }}
      />

      {/* Hero Split Sections */}
      <div className="relative w-full h-[50vw] md:h-[55vh] overflow-hidden">
        {/* Residential half */}
        <motion.div
          className="absolute left-0 h-full w-1/2 cursor-pointer"
          initial={{ x: 0 }}
          animate={{
            x:
              activeSection === "commercial"
                ? " -20vw"
                : activeSection === "residential"
                  ? "20vw"
                  : "0vw",
            ...(activeSection === "neutral" ? restingAnimation : {}),
          }}
          transition={{
            duration: activeSection === "neutral" ? 5 : 0.5,
            ease: "easeInOut",
          }}
          onClick={(e) =>
            setActiveSection((prev) =>
              prev === "residential" ? "neutral" : "residential"
            )
          }
        >
          <div className="relative w-full h-full">
            {console.log("Residential image path:", residentialImage)}
            <div
              className="absolute top-0 right-0 w-[100vw] h-full -z-10"
              style={{
                background: `url('${residentialImage}') no-repeat center center`,
                backgroundSize: "cover",
                transformOrigin: "center center",
              }}
            />
            <div
              className="absolute top-0 right-0 w-[100vw] h-full"
              style={{
                background: `url('${residentialImage}') no-repeat center center`,
                backgroundSize: "cover",
                backgroundPosition: "right center",
                transformOrigin: "right center",
              }}
            />
            <div className="absolute top-0 left-0 w-full h-full z-40 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center ">
                {/* Combined container for icon and title - grouped for unified clicking */}
                <div
                  className="flex flex-col items-center z-70 cursor-pointer "
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection((prev) =>
                      prev === "residential" ? "neutral" : "residential"
                    );
                  }}
                >
                  {/* Icon that fades out when active */}
                  <motion.div
                    variants={iconVariants}
                    animate={
                      activeSection === "residential" ? "active" : "default"
                    }
                  >
                    <Home className="w-[6.5vw] h-[6.5vw] md:w-[12.5vh] md:h-[12.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-amber-100 bg-banner rounded-full p-4" />
                  </motion.div>

                  {/* Title that moves up when active */}
                  <motion.h2
                    variants={titleVariants}
                    animate={
                      activeSection === "residential" ? "active" : "default"
                    }
                    className="text-[3.2vw] md:text-[3.2vh] md:-mt-2 font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-amber-100 font-serif"
                  >
                    Residential
                  </motion.h2>
                </div>

                {/* Services list that appears below */}
                {activeSection === "residential" && (
                  <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-white font-serif text-center -space-y-2 md:space-y-0 text-[2.3vw] md:text-[2.4vh] font-normal drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)] z-50"
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
        </motion.div>

        {/* Commercial half */}
        <motion.div
          className="absolute right-0 h-full w-1/2 cursor-pointer"
          initial={{ x: 0 }}
          animate={{
            x:
              activeSection === "commercial"
                ? "-20vw"
                : activeSection === "residential"
                  ? "20vw"
                  : "0vw",
            ...(activeSection === "neutral" ? restingAnimation : {}),
          }}
          transition={{
            duration: activeSection === "neutral" ? 5 : 0.5,
            ease: "easeInOut",
          }}
          onClick={(e) =>
            setActiveSection((prev) =>
              prev === "commercial" ? "neutral" : "commercial"
            )
          }
        >
          <div className="relative w-full h-full">
            {console.log("Commercial image path:", commercialImage)}
            <div
              className="absolute top-0 left-0 w-[100vw] h-full"
              style={{
                background: `url('${commercialImage}') no-repeat center center`,
                backgroundSize: "cover",
                backgroundPosition: "left center",
                transformOrigin: "left center",
              }}
            />
            <div className="absolute top-0 right-0 w-full h-full z-40 flex flex-col items-start justify-center">
              <div className="flex flex-col items-center ml-[8vh] md:ml-[13.2vw]">
                {/* Combined container for icon and title - grouped for unified clicking */}
                <div
                  className="flex flex-col items-center z-50 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection((prev) =>
                      prev === "commercial" ? "neutral" : "commercial"
                    );
                  }}
                >
                  {/* Icon that fades out when active */}
                  <motion.div
                    variants={iconVariants}
                    animate={
                      activeSection === "commercial" ? "active" : "default"
                    }
                  >
                    <Building2 className="w-[6.5vw] h-[6.5vw] md:w-[12.5vh] md:h-[12.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-amber-100 bg-banner rounded-full p-4" />
                  </motion.div>

                  {/* Title that moves up when active */}
                  <motion.h2
                    variants={titleVariants}
                    animate={
                      activeSection === "commercial" ? "active" : "default"
                    }
                    className="text-[3.2vw] md:text-[3.2vh] md-mt-2 font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-amber-100 font-serif"
                  >
                    Commercial
                  </motion.h2>
                </div>

                {/* Services list that appears below */}
                {activeSection === "commercial" && (
                  <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-white font-serif text-center -space-y-2 md:space-y-0 text-[2.3vw] md:text-[2.4vh] font-normal drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]  z-50"
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
        </motion.div>

        {/* Dark red gradient at the bottom - overlay only on the images */}
        <div
          className={`absolute bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-t from-banner from-10% to-transparent z-30 ${
            activeSection === "neutral"
              ? "h-[15vh] md:h-[18vh]"
              : "h-[9vh] md:h-[10vh]"
          }`}
          style={{ transition: "height 0.3s ease-out 0.4s" }}
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
    residentialImage,
    commercialImage,
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

  const handleResidentialImageChange = (file) => {
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    setLocalData((prev) => ({ ...prev, residentialImage: fileURL }));
  };

  const handleCommercialImageChange = (file) => {
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    setLocalData((prev) => ({ ...prev, commercialImage: fileURL }));
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
    <div className="bg-gray-900 text-white rounded-md overflow-hidden">
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
        <div className="w-full md:w-1/2 p-4 bg-gray-800 border-r border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-amber-100">
            Residential
          </h3>

          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-300">
              Background Image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleResidentialImageChange(e.target.files?.[0])
              }
              className="w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2"
            />
            {getDisplayPath(residentialImage) && (
              <img
                src={getDisplayPath(residentialImage)}
                alt="Residential Background"
                className="mt-2 h-24 w-full object-cover rounded-md"
              />
            )}
          </div>

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

          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-300">
              Background Image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleCommercialImageChange(e.target.files?.[0])}
              className="w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2"
            />
            {getDisplayPath(commercialImage) && (
              <img
                src={getDisplayPath(commercialImage)}
                alt="Commercial Background"
                className="mt-2 h-24 w-full object-cover rounded-md"
              />
            )}
          </div>

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
      updatedConfig.residentialImage &&
      !updatedConfig.residentialImage.startsWith("/assets/images/hero/")
    ) {
      console.log(
        "Residential image path might need server-side processing:",
        updatedConfig.residentialImage
      );
    }

    if (
      updatedConfig.commercialImage &&
      !updatedConfig.commercialImage.startsWith("/assets/images/hero/")
    ) {
      console.log(
        "Commercial image path might need server-side processing:",
        updatedConfig.commercialImage
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
        residentialImage: "",
        commercialImage: "",
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
