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

  // Convert logo to standardized path
  const formattedLogo = logo
    ? logo.startsWith("/")
      ? logo
      : `/assets/images/${logo.split("/").pop() || "clipped-cowboy.png"}`
    : "/assets/images/clipped-cowboy.png";

  const resBg = residentialImage
    ? residentialImage.startsWith("/")
      ? residentialImage
      : `/assets/images/${residentialImage.split("/").pop() || "residentialnight.jpg"}`
    : "/assets/images/residentialnight.jpg";

  const comBg = commercialImage
    ? commercialImage.startsWith("/")
      ? commercialImage
      : `/assets/images/${commercialImage.split("/").pop() || "commercialnight.jpg"}`
    : "/assets/images/commercialnight.jpg";

  useEffect(() => {
    // Trigger animation on first mount
    setHasAnimated(true);

    // Fetch services.json to get the latest service data
    fetch("/data/services.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("HeroBlock: Services data fetched:", data);

        // Process residential services from services.json
        const residentialFromJson = data.residential.map((service, idx) => {
          const heroBlock =
            service.blocks.find((b) => b.blockName === "HeroBlock") ||
            service.blocks[0];
          const title = heroBlock?.config?.title || `Service ${service.id}`;
          const slug =
            service.slug ||
            `residential-${service.id}-${title.toLowerCase().replace(/\s+/g, "-")}`;

          console.log(
            `HeroBlock: Built residential service: ${title} with route: /services/${slug}`
          );

          return {
            label: title,
            route: `/services/${slug}`,
          };
        });

        // Process commercial services from services.json
        const commercialFromJson = data.commercial.map((service, idx) => {
          const heroBlock =
            service.blocks.find((b) => b.blockName === "HeroBlock") ||
            service.blocks[0];
          const title = heroBlock?.config?.title || `Service ${service.id}`;
          const slug =
            service.slug ||
            `commercial-${service.id}-${title.toLowerCase().replace(/\s+/g, "-")}`;

          console.log(
            `HeroBlock: Built commercial service: ${title} with route: /services/${slug}`
          );

          return {
            label: title,
            route: `/services/${slug}`,
          };
        });

        setResidentialServices(residentialFromJson);
        setCommercialServices(commercialFromJson);
      })
      .catch((error) => {
        console.error("HeroBlock: Error fetching services data:", error);

        // Fallback to config data if fetch fails
        const residentialFallback = (residential.subServices || []).map(
          (item, idx) => {
            const slug =
              item.slug ||
              `residential-${idx + 1}-${(item.title || "").toLowerCase().replace(/\s+/g, "-")}`;
            return {
              label: item.title || "",
              route: `/services/${slug}`,
            };
          }
        );

        const commercialFallback = (commercial.subServices || []).map(
          (item, idx) => {
            const slug =
              item.slug ||
              `commercial-${idx + 1}-${(item.title || "").toLowerCase().replace(/\s+/g, "-")}`;
            return {
              label: item.title || "",
              route: `/services/${slug}`,
            };
          }
        );

        setResidentialServices(residentialFallback);
        setCommercialServices(commercialFallback);
      });
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
    x: [10, 30, 10],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear",
    },
  };

  const iconVariants = {
    active: {
      opacity: [1, 1, 0],
      y: [-0, -20, -20],
      transition: {
        duration: 0.6,
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
      y: -170,
      transition: { duration: 0.6 },
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
      height: "auto",
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
        delay: 0.4,
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
      <div className="h-[6vh] md:h-[8vh] bg-white w-full relative z-10">
        {/* Logo & Titles - Controls vertical position via transform translate */}
        <div className="absolute bottom-0 lef-0 right-0 transform translate-y-1/2 w-full z-40 flex flex-row items-center justify-center">
          <motion.img
            initial={{ x: -100, opacity: 0 }}
            animate={hasAnimated ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            about
            src={formattedLogo}
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
        className={`absolute top-[6vh] md:top-[8vh] left-0 right-0 bg-gradient-to-b from-white from-0% to-transparent ${
          activeSection === "neutral"
            ? "h-[20vh] md:h-[25vh]"
            : "h-[10vh] md:h-[15vh]"
        }`}
        style={{ transition: "height 0.3s ease-out 0.4s", zIndex: 5 }}
      />

      {/* Hero Split Sections */}
      <div className="relative w-full h-[65vw] md:h-[65vh]">
        {/* Residential half */}
        <motion.div
          className="absolute left-0 h-full w-1/2 cursor-pointer"
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
          onClick={(e) => handleSectionElementClick(e, "residential")}
        >
          <div className="relative w-full h-full">
            <div
              className="absolute top-0 right-0 w-[100vw] h-full"
              style={{
                background: `url('${resBg}') no-repeat center center`,
                backgroundSize: "cover",
                transformOrigin: "center center",
              }}
            />
            <div className="absolute top-0 left-0 w-full h-full z-20 flex flex-col items-end justify-center">
              <div className="flex flex-col items-center mr-[8vh] md:mr-[13.2vw]">
                {/* Grouped container for icon and title */}
                <div
                  className="flex flex-col items-center cursor-pointer z-30"
                  onClick={(e) => handleSectionElementClick(e, "residential")}
                >
                  {/* Icon that fades out when active */}
                  <motion.div
                    variants={iconVariants}
                    animate={
                      activeSection === "residential" ? "active" : "default"
                    }
                  >
                    <Home className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-amber-100" />
                  </motion.div>

                  {/* Title that moves up when active */}
                  <motion.h2
                    variants={titleVariants}
                    animate={
                      activeSection === "residential" ? "active" : "default"
                    }
                    className="text-[4.5vw] md:text-[4.2vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-amber-100 font-serif"
                  >
                    Residential
                  </motion.h2>
                </div>

                {/* Services list that appears below */}
                {activeSection === "residential" && (
                  <motion.div
                    className="absolute right-0 top-1/2 transform -translate-y-1/3 z-20 w-full flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-white font-serif w-3/4 text-center space-y-1 md:space-y-3 text-[3.5vw] md:text-[2.8vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)] mt-5"
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
                  </motion.div>
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
          onClick={(e) => handleSectionElementClick(e, "commercial")}
        >
          <div className="relative w-full h-full">
            <div
              className="absolute top-0 left-0 w-[100vw] h-full"
              style={{
                background: `url('${comBg}') no-repeat center center`,
                backgroundSize: "cover",
                transformOrigin: "center center",
              }}
            />
            <div className="absolute top-0 right-0 w-full h-full z-20 flex flex-col items-start justify-center">
              <div className="flex flex-col items-center ml-[8vh] md:ml-[13.2vw]">
                {/* Grouped container for icon and title */}
                <div
                  className="flex flex-col items-center cursor-pointer z-30"
                  onClick={(e) => handleSectionElementClick(e, "commercial")}
                >
                  {/* Icon that fades out when active */}
                  <motion.div
                    variants={iconVariants}
                    animate={
                      activeSection === "commercial" ? "active" : "default"
                    }
                  >
                    <Building2 className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-amber-100" />
                  </motion.div>

                  {/* Title that moves up when active */}
                  <motion.h2
                    variants={titleVariants}
                    animate={
                      activeSection === "commercial" ? "active" : "default"
                    }
                    className="text-[4.5vw] md:text-[4.2vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-amber-100 font-serif"
                  >
                    Commercial
                  </motion.h2>
                </div>

                {/* Services list that appears below */}
                {activeSection === "commercial" && (
                  <motion.div
                    className="absolute left-0 top-1/2 transform -translate-y-1/3 z-20 w-full flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-white font-serif w-3/4 text-center space-y-1 md:space-y-3 text-[3.5vw] md:text-[2.8vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)] mt-5"
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
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dark red gradient at the bottom - overlay only on the images */}
        <div
          className={`absolute bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-t from-banner from-10% to-transparent z-30 ${
            activeSection === "neutral"
              ? "h-[20vh] md:h-[22vh]"
              : "h-[10vh] md:h-[15vh]"
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
Only the image functionality is changed.
- New file inputs for Logo, Residential Background, and Commercial Background.
- When a file is chosen, URL.createObjectURL is used to immediately preview the image.
The rest of the editor remains unchanged.
====================================================
*/
function HeroEditorPanel({ localData, setLocalData, onSave }) {
  const {
    mainTitle = "",
    subTitle = "",
    residential = { subServices: [] },
    commercial = { subServices: [] },
  } = localData;

  // Image upload handlers
  const handleLogoChange = (file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setLocalData((prev) => ({ ...prev, logo: fileURL }));
    }
  };

  /**
   * Handles residential image upload
   * Stores both the URL for display and the file object for the ZIP
   *
   * @param {File} file - The uploaded file
   */
  const handleResidentialImageChange = (file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store just the URL for display
    setLocalData((prev) => ({ ...prev, residentialImage: fileURL }));
  };

  /**
   * Handles commercial image upload
   * Stores both the URL for display and the file object for the ZIP
   *
   * @param {File} file - The uploaded file
   */
  const handleCommercialImageChange = (file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store just the URL for display
    setLocalData((prev) => ({ ...prev, commercialImage: fileURL }));
  };

  /**
   * Gets the display URL from either a string URL or an object with a URL property
   *
   * @param {string|Object} value - The value to extract URL from
   * @returns {string|null} - The URL to display
   */
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // Existing text and sub-service handlers remain unchanged...
  const addResidentialService = () => {
    setLocalData((prev) => ({
      ...prev,
      residential: {
        ...prev.residential,
        subServices: [...(prev.residential.subServices || []), { title: "" }],
      },
    }));
  };
  const removeResidentialService = (idx) => {
    const newArr = [...(residential.subServices || [])];
    newArr.splice(idx, 1);
    setLocalData((prev) => ({
      ...prev,
      residential: { ...prev.residential, subServices: newArr },
    }));
  };
  const changeResidentialService = (idx, newTitle) => {
    const newArr = [...(residential.subServices || [])];
    newArr[idx] = { title: newTitle };
    setLocalData((prev) => ({
      ...prev,
      residential: { ...prev.residential, subServices: newArr },
    }));
  };

  const addCommercialService = () => {
    setLocalData((prev) => ({
      ...prev,
      commercial: {
        ...prev.commercial,
        subServices: [...(prev.commercial.subServices || []), { title: "" }],
      },
    }));
  };
  const removeCommercialService = (idx) => {
    const newArr = [...(commercial.subServices || [])];
    newArr.splice(idx, 1);
    setLocalData((prev) => ({
      ...prev,
      commercial: { ...prev.commercial, subServices: newArr },
    }));
  };
  const changeCommercialService = (idx, newTitle) => {
    const newArr = [...(commercial.subServices || [])];
    newArr[idx] = { title: newTitle };
    setLocalData((prev) => ({
      ...prev,
      commercial: { ...prev.commercial, subServices: newArr },
    }));
  };

  return (
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Hero Editor</h1>
        <button
          type="button"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save
        </button>
      </div>

      {/* Image Uploads */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Logo Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleLogoChange(file);
          }}
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
        {localData.logo && (
          <img
            src={localData.logo}
            alt="Logo Preview"
            className="mt-2 h-24 rounded shadow"
          />
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm mb-1">
          Residential Background Image:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleResidentialImageChange(file);
          }}
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
        {getDisplayUrl(localData.residentialImage) && (
          <img
            src={getDisplayUrl(localData.residentialImage)}
            alt="Residential Preview"
            className="mt-2 h-24 rounded shadow"
          />
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm mb-1">
          Commercial Background Image:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleCommercialImageChange(file);
          }}
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
        {getDisplayUrl(localData.commercialImage) && (
          <img
            src={getDisplayUrl(localData.commercialImage)}
            alt="Commercial Preview"
            className="mt-2 h-24 rounded shadow"
          />
        )}
      </div>

      {/* Main Title */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Main Title:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={localData.mainTitle}
          onChange={(e) =>
            setLocalData((prev) => ({ ...prev, mainTitle: e.target.value }))
          }
        />
      </div>

      {/* Sub Title */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Sub Title:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={localData.subTitle}
          onChange={(e) =>
            setLocalData((prev) => ({ ...prev, subTitle: e.target.value }))
          }
        />
      </div>

      {/* Residential Sub-Services */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Residential Sub-Services</h2>
          <button
            onClick={addResidentialService}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            + Add
          </button>
        </div>
        {(localData.residential.subServices || []).map((svc, idx) => (
          <div key={idx} className="bg-gray-800 p-3 rounded mb-2 relative">
            <button
              onClick={() => removeResidentialService(idx)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>
            <label className="block text-sm mb-1">
              Title:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={svc.title || ""}
                onChange={(e) => changeResidentialService(idx, e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Commercial Sub-Services */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Commercial Sub-Services</h2>
          <button
            onClick={addCommercialService}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            + Add
          </button>
        </div>
        {(localData.commercial.subServices || []).map((svc, idx) => (
          <div key={idx} className="bg-gray-800 p-3 rounded mb-2 relative">
            <button
              onClick={() => removeCommercialService(idx)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>
            <label className="block text-sm mb-1">
              Title:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={svc.title || ""}
                onChange={(e) => changeCommercialService(idx, e.target.value)}
              />
            </label>
          </div>
        ))}
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
  const [localData, setLocalData] = useState(() => {
    if (!heroconfig) {
      return {
        mainTitle: "",
        subTitle: "",
        residential: { subServices: [] },
        commercial: { subServices: [] },
        logo: "",
        residentialImage: "",
        commercialImage: "",
      };
    }
    return {
      mainTitle: heroconfig.mainTitle || "",
      subTitle: heroconfig.subTitle || "",
      residential: {
        subServices:
          heroconfig.residential?.subServices?.map((s) => ({ ...s })) || [],
      },
      commercial: {
        subServices:
          heroconfig.commercial?.subServices?.map((s) => ({ ...s })) || [],
      },
      logo: heroconfig.logo || "",
      residentialImage: heroconfig.residentialImage || "",
      commercialImage: heroconfig.commercialImage || "",
    };
  });

  const handleSave = () => {
    onConfigChange?.(localData);
  };

  if (readOnly) {
    return <HeroPreview heroconfig={heroconfig} />;
  }

  return (
    <HeroEditorPanel
      localData={localData}
      setLocalData={setLocalData}
      onSave={handleSave}
    />
  );
}
