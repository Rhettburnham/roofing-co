// src/components/MainPageBlocks/HeroBlock.jsx
import React, { useState } from "react";
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
  const {
    mainTitle,
    subTitle,
    residential = { subServices: [] },
    commercial = { subServices: [] },
    logo,
    residentialImage,
    commercialImage,
  } = heroconfig;

  // Use defaults if images are not provided
  const logoSrc = logo || "assets/images/clipped-cowboy.png";
  const resBg = residentialImage || "assets/images/residentialnight.jpg";
  const comBg = commercialImage || "assets/images/commercialnight.jpg";

  const residentialServices = (residential.subServices || []).map((item, idx) => ({
    label: item.title || "",
    route: `/Residential_service_${idx + 1}`,
  }));
  const commercialServices = (commercial.subServices || []).map((item, idx) => ({
    label: item.title || "",
    route: `/Commercial_service_${idx + 1}`,
  }));

  const [activeSection, setActiveSection] = useState("neutral");
  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? "neutral" : section));
  };

  const restingAnimation = {
    x: [10, 30, 10],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear",
    },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="h-[48vh] md:h-[75.5vh] overflow-hidden relative">
      {/* Top gradient overlay */}
      <div className="h-[20vh] md:h-[30vh] absolute top-0 left-0 right-0 bg-gradient-to-b from-dark-below-header from-60% to-transparent z-10" />

      {/* Logo & Titles */}
      <div className="relative w-full h-[2vh] md:h-[7.5vh] z-20 flex flex-row items-center justify-center mt-10">
        <img
          src={logoSrc}
          alt="hero-logo"
          className="w-[15vw] md:w-[14vh] h-auto mr-5 md:mr-10"
          style={{ filter: "invert(0)" }}
        />
        <div className="relative flex flex-col items-center justify-center z-10 -space-y-[1vh] md:-space-y-[5vh]">
          <span
            className="whitespace-nowrap text-[6vw] md:text-[7vh] text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-normal font-ultra-condensed"
          >
            {mainTitle}
          </span>
          <span
            className="text-[4vw] md:text-[4vh] md:pt-[2.5vh] text-left drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif"
          >
            {subTitle}
          </span>
        </div>
      </div>

      {/* Hero Split Sections */}
      <div className="relative w-full">
        <div className="relative h-[35vh] md:h-[65vh] w-full">
          {/* Residential half */}
          <motion.div
            className="absolute left-0 h-[65vw] md:h-[65vh] w-1/2 cursor-pointer"
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
            transition={{ duration: activeSection === "neutral" ? 3 : 0.5, ease: "easeInOut" }}
            onClick={() => handleSectionClick("residential")}
          >
            <div className="relative w-full h-full">
              <div
                className="absolute top-0 right-0 w-[100vw] h-full"
                style={{
                  background: `url('${resBg}') no-repeat center center`,
                  backgroundSize: "cover",
                  transformOrigin: "top right",
                }}
              />
              <div className="absolute top-0 left-0 w-full h-full z-20">
                <div className="absolute right-0 top-[40%] -translate-y-1/2 flex items-center gap-4 md:gap-8">
                  {activeSection === "residential" && (
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-white font-serif ml-[0vh] w-[100vw] text-left space-y-1 md:space-y-2 text-[3.5vw] md:text-[3vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                    >
                      {residentialServices.map((service, idx) => (
                        <motion.li key={idx} variants={itemVariants} className="flex items-center justify-end gap-2">
                          <Link
                            to={service.route}
                            onClick={(e) => e.stopPropagation()}
                            className="text-white font-serif -mx-[20vw] pr-[20vw] md:pr-[24vw] py-1 rounded"
                          >
                            {service.label} ←
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                  <div className="flex flex-col -space-y-1 md:-space-y-2 items-center mr-[8vh] md:mr-[13.2vw] group">
                    <Home className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-white" />
                    <h2 className="text-[4.5vw] md:text-[4.2vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-white font-serif duration-300">
                      Residential
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Commercial half */}
          <motion.div
            className="absolute right-0 h-[65vw] md:h-[65vh] w-1/2 cursor-pointer"
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
            transition={{ duration: activeSection === "neutral" ? 3 : 0.5, ease: "easeInOut" }}
            onClick={() => handleSectionClick("commercial")}
          >
            <div className="relative w-full h-full">
              <div
                className="absolute top-0 left-0 w-[100vw] h-full"
                style={{
                  background: `url('${comBg}') no-repeat center center`,
                  backgroundSize: "cover",
                  transformOrigin: "top left",
                  transform: "skew(-15deg)",
                }}
              />
              <div className=" top-0 right-0 w-full h-full relative z-20">
                <div className="absolute left-0 top-[40%] -translate-y-1/2 flex items-center gap-4 md:gap-8">
                  <div className="flex flex-col items-center -space-y-1 md:-space-y-2 group ml-[0vh] md:ml-[6vw]">
                    <Building2 className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-white" />
                    <h2 className="text-[4.5vw] md:text-[4.2vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-white font-serif">
                      Commercial
                    </h2>
                  </div>
                  {activeSection === "commercial" && (
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-white font-serif ml-[0vh] md:ml-[6vw] w-[100vw] text-left space-y-1 md:space-y-2 text-[3.5vw] md:text-[3vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                    >
                      {commercialServices.map((service, idx) => (
                        <motion.li key={idx} variants={itemVariants} className="gap-2">
                          <Link
                            to={service.route}
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-100 font-serif md:pl-[4vw] py-1 rounded"
                          >
                            → {service.label}
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* <div className="absolute bottom-0 left-0 right-0 h-[30vh] md:h-[35vh] pointer-events-none bg-gradient-to-t from-white from-30% to-transparent z-10" /> */}
        </div>
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
  const handleResidentialImageChange = (file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setLocalData((prev) => ({ ...prev, residentialImage: fileURL }));
    }
  };
  const handleCommercialImageChange = (file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setLocalData((prev) => ({ ...prev, commercialImage: fileURL }));
    }
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
    <div className="bg-black text-white p-4 rounded max-h-[75vh] ">
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
          <img src={localData.logo} alt="Logo Preview" className="mt-2 h-24 rounded shadow" />
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm mb-1">Residential Background Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleResidentialImageChange(file);
          }}
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
        {localData.residentialImage && (
          <img src={localData.residentialImage} alt="Residential Preview" className="mt-2 h-24 rounded shadow" />
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm mb-1">Commercial Background Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleCommercialImageChange(file);
          }}
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
        {localData.commercialImage && (
          <img src={localData.commercialImage} alt="Commercial Preview" className="mt-2 h-24 rounded shadow" />
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
export default function HeroBlock({ heroconfig, readOnly = false, onConfigChange }) {
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
        subServices: heroconfig.residential?.subServices?.map((s) => ({ ...s })) || [],
      },
      commercial: {
        subServices: heroconfig.commercial?.subServices?.map((s) => ({ ...s })) || [],
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

  return <HeroEditorPanel localData={localData} setLocalData={setLocalData} onSave={handleSave} />;
}
