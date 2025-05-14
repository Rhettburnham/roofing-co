import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa";

/* 
====================================================
 1) HERO PREVIEW (Displays actual hero content)
----------------------------------------------------
- Does NOT display mainTitle, subTitle, or logo.
- Shows heroImage background and interactive service sections.
- Takes `heroconfig` prop. This will be `localData` from HeroBlock 
  when HeroBlock is in edit mode, or original `heroconfig` 
  from MainPageForm when HeroBlock is read-only.
====================================================
*/
function HeroPreview({ heroconfig }) { 
  if (!heroconfig) {
    return <p>No data found for HeroPreview.</p>;
  }

  const bannerStyles = {
    "--banner-color": "#1e293b",
  };

  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);

  const {
    residential = { subServices: [] },
    commercial = { subServices: [] },
    heroImage, 
  } = heroconfig;

  useEffect(() => {
    const processedResidentialServices = residential.subServices.map(
      (service) => {
        const originalTitle = service.title;
        const lowercaseTitle = originalTitle.toLowerCase();
        let actualServiceName = lowercaseTitle;
        if (lowercaseTitle === "siding") actualServiceName = "chimney";
        else if (lowercaseTitle === "chimney") actualServiceName = "guttering";
        else if (lowercaseTitle === "repairs") actualServiceName = "skylights";
        return {
          label: originalTitle,
          route: `/services/residential/${actualServiceName.replace(/\s+/g, "-")}`,
        };
      }
    );
    const processedCommercialServices = commercial.subServices.map(
      (service) => {
        const urlTitle = service.title.toLowerCase().replace(/\s+/g, "-");
        return { label: service.title, route: `/services/commercial/${urlTitle}` };
      }
    );
    setResidentialServices(processedResidentialServices);
    setCommercialServices(processedCommercialServices);
  }, [residential.subServices, commercial.subServices]);

  const [activeSection, setActiveSection] = useState("neutral");

  const iconVariants = { active: { opacity: [1,1,0], y: [-0,-10,-10], transition: { duration: 0.5, times: [0,0.6,1]}}, default: { opacity: 1, y: 0, transition: { duration: 0.3 }}};
  const titleVariants = { active: { y: 0, transition: { duration: 0.5 }}, default: { y: 0, transition: { duration: 0.3 }}};
  const listVariants = { hidden: { opacity: 0, height: 0}, visible: { opacity: 1, height: window.innerWidth < 768 ? 150:220, transition: { staggerChildren:0.1, duration:0.3, delay:0.3 }}};
  const itemVariants = { hidden: { opacity: 0, y: 10}, visible: { opacity: 1, y: 0, transition: { duration: 0.2 }}};

  const getDisplayPath = (pathOrBlob) => (pathOrBlob && typeof pathOrBlob === 'string') ? pathOrBlob : '';

  return (
    <section className="relative overflow-y-hidden" style={bannerStyles}>
      <div className={`absolute top-[0vh] left-0 right-0 bg-gradient-to-b from-white from-0% to-transparent pointer-events-none ${activeSection === "neutral" ? "h-[18vh] md:h-[18vh]" : "h-[10vh] md:h-[10vh]"}`} style={{ transition: "height 0.3s ease-out 0.4s", zIndex: 1 }}/>
      {/* mainTitle, subTitle, and logo are NOT rendered by HeroPreview */}
      <div className="relative w-full h-[50vw] md:h-[45vh] ">
        <motion.div className="absolute inset-0 w-full h-full overflow-hidden" initial={{ x: 0, scale: 1 }} animate={{x: activeSection === "commercial" ? "-20vw" : activeSection === "residential" ? "20vw" : "0vw", scale: activeSection === "commercial" ? 1.35 : activeSection === "residential" ? 1.3 : 1}} transition={{ duration: 0.5, ease: "easeInOut" }}>
          {heroImage && <div className="absolute inset-0 w-[100vw] h-full left-[-0vw]" style={{background: `url('${getDisplayPath(heroImage)}') no-repeat center center`, backgroundSize: "cover", transformOrigin: activeSection === "residential" ? "25% center" : activeSection === "commercial" ? "75% center" : "center center", transition: "transform-origin 0.5s ease-in-out"}}/>}
        </motion.div>
        <div className="relative w-full h-full flex pt-[15vh] md:pt-[20vh]">
          <div className="w-1/2 h-full cursor-pointer flex items-center justify-center" onClick={() => setActiveSection(prev => prev === "residential" ? "neutral" : "residential")}>
            <div className="flex flex-col items-center pointer-events-auto">
              <div className={`flex flex-col items-center cursor-pointer rounded-lg p-1`} onClick={(e) => { e.stopPropagation(); setActiveSection(prev => prev === "residential" ? "neutral" : "residential"); }}>
                <motion.div variants={iconVariants} animate={activeSection === "residential" ? "active" : "default"}><Home className="w-[6.5vw] h-[6.5vw] md:w-[6.5vh] md:h-[6.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-gray-50" /></motion.div>
                <motion.h2 variants={titleVariants} animate={activeSection === "residential" ? "active" : "default"} className="text-[3.2vw] md:text-[2.4vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-gray-50 font-serif -mt-3">Residential</motion.h2>
              </div>
              {activeSection === "residential" && (<motion.ul variants={listVariants} initial="hidden" animate="visible" className="text-white font-serif text-center -space-y-2 md:space-y-0 text-[2.3vw] md:text-[2.4vh] font-normal drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]">{residentialServices.map((service, idx) => (<motion.li key={idx} variants={itemVariants} className="flex items-center justify-center whitespace-nowrap"><Link to={service.route} onClick={(e) => e.stopPropagation()} className="text-white font-serif py-1 rounded hover:underline">{service.label}</Link></motion.li>))}</motion.ul>)}
            </div>
          </div>
          <div className="w-1/2 h-full cursor-pointer flex items-center justify-center" onClick={() => setActiveSection(prev => prev === "commercial" ? "neutral" : "commercial")}>
            <div className="flex flex-col items-center pointer-events-auto">
              <div className={`flex flex-col items-center cursor-pointer`} onClick={(e) => { e.stopPropagation(); setActiveSection(prev => prev === "commercial" ? "neutral" : "commercial"); }}>
                <motion.div variants={iconVariants} animate={activeSection === "commercial" ? "active" : "default"}><FaWarehouse className="w-[6.5vw] h-[6.5vw] md:w-[6.5vh] md:h-[6.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-gray-50" /></motion.div>
                <motion.h2 variants={titleVariants} animate={activeSection === "commercial" ? "active" : "default"} className="text-[3.2vw] md:text-[2.4vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] text-gray-50 font-serif -mt-3">Commercial</motion.h2>
              </div>
              {activeSection === "commercial" && (<motion.ul variants={listVariants} initial="hidden" animate="visible" className="text-white font-serif text-center -space-y-2 md:space-y-0 text-[2.3vw] md:text-[2.4vh] font-normal drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]">{commercialServices.map((service, idx) => (<motion.li key={idx} variants={itemVariants} className="flex items-center justify-center whitespace-nowrap"><Link to={service.route} onClick={(e) => e.stopPropagation()} className="text-white font-serif py-1 rounded hover:underline">{service.label}</Link></motion.li>))}</motion.ul>)}
            </div>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-t from-banner from-10% to-transparent ${activeSection === "neutral" ? "h-[15vh] md:h-[18vh]" : "h-[9vh] md:h-[10vh]"}`} style={{ transition: "height 0.3s ease-out 0.4s", zIndex: 1 }}/>
      </div>
    </section>
  );
}

/* 
====================================================
 2) HERO CONTROLS PANEL (For Hero Image & Services Only)
----------------------------------------------------
 - Provides controls for hero background image and service selection.
 - Logo, mainTitle, subTitle are NOT handled here.
 - All changes call `onControlsChange` to update parent's localData.
====================================================
*/
function HeroControlsPanel({ currentData, onControlsChange }) { 
  const {
    residential = { subServices: [] },
    commercial = { subServices: [] },
    heroImage, 
  } = currentData;

  const [allResidentialServices, setAllResidentialServices] = useState([]);
  const [allCommercialServices, setAllCommercialServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);

  const getDisplayPath = (pathOrBlob) => (pathOrBlob && typeof pathOrBlob === 'string') ? pathOrBlob : '';
  
  useEffect(() => {
    setIsServicesLoading(true);
    fetch("/data/raw_data/step_4/combined_data.json") 
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP error! Status: ${res.status}`)))
      .then(data => {
        if (data.hero?.residential?.subServices) {
          setAllResidentialServices(data.hero.residential.subServices.map((s, i) => ({ id: `res-${i}`, title: s.title })));
        }
        if (data.hero?.commercial?.subServices) {
          setAllCommercialServices(data.hero.commercial.subServices.map((s, i) => ({ id: `com-${i}`, title: s.title })));
        }
        setIsServicesLoading(false);
      })
      .catch(error => {
        console.error("HeroControlsPanel: Error fetching services data:", error);
        setIsServicesLoading(false);
      });
  }, []);

  const handleHeroImageUpload = (file) => {
    if (file) onControlsChange({ heroImageFile: file });
  };

  const handleServiceToggle = (serviceType, serviceItem) => {
    const currentBlockSubServices = currentData[serviceType]?.subServices || [];
    const isSelected = currentBlockSubServices.some(s => s.title === serviceItem.title);
    let newSubServices = isSelected 
      ? currentBlockSubServices.filter(s => s.title !== serviceItem.title)
      : [...currentBlockSubServices, { title: serviceItem.title }];
    onControlsChange({ [serviceType]: { ...currentData[serviceType], subServices: newSubServices } });
  };

  const isServiceSelected = (serviceType, serviceItem) => 
    currentData[serviceType]?.subServices?.some(s => s.title === serviceItem.title) || false;

  const fileInputStyle = "w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer";

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mt-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center border-b border-gray-700 pb-2">Edit Hero Background & Services</h3>
      <div className="mb-6">
        <label className="block text-sm mb-1 font-medium text-gray-300">Hero Background Image:</label>
        <input type="file" accept="image/*" onChange={(e) => handleHeroImageUpload(e.target.files?.[0])} className={fileInputStyle} />
        {heroImage && <img src={getDisplayPath(heroImage)} alt="Hero Background Preview" className="mt-2 h-24 w-full object-cover rounded bg-gray-700 p-1" />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-semibold mb-2 text-amber-300">Select Residential Services</h4>
          {isServicesLoading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border border-gray-700 rounded-md p-3 bg-gray-900">
              {allResidentialServices.map(service => (
                <div key={service.id} className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${isServiceSelected("residential", service) ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`} onClick={() => handleServiceToggle("residential", service)}>
                  <span className="text-sm">{service.title}</span>
                  <input type="checkbox" checked={isServiceSelected("residential", service)} readOnly className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-0 cursor-pointer" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-md font-semibold mb-2 text-amber-300">Select Commercial Services</h4>
          {isServicesLoading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border border-gray-700 rounded-md p-3 bg-gray-900">
              {allCommercialServices.map(service => (
                <div key={service.id} className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${isServiceSelected("commercial", service) ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`} onClick={() => handleServiceToggle("commercial", service)}>
                  <span className="text-sm">{service.title}</span>
                  <input type="checkbox" checked={isServiceSelected("commercial", service)} readOnly className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-0 cursor-pointer" />
                </div>
              ))}
            </div>
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
 - If readOnly is true, renders HeroPreview with original heroconfig.
 - If readOnly is false, renders HeroPreview (with localData for live background updates) 
   AND HeroControlsPanel (for heroImage & services).
 - All changes are auto-saved via onConfigChange.
 - mainTitle, subTitle, logo are NO LONGER part of this block's data/editing.
====================================================
*/
export default function HeroBlock({
  heroconfig, 
  readOnly = false,
  onConfigChange,
}) {
  const [localData, setLocalData] = useState(() => {
    const initial = heroconfig || {};
    return {
      residential: initial.residential || { subServices: [] },
      commercial: initial.commercial || { subServices: [] },
      heroImage: initial.heroImage || "/assets/images/hero/hero_split_background.jpg", 
      heroImageFile: null, 
    };
  });

  useEffect(() => {
    if (heroconfig) {
      setLocalData(prevData => {
        const newHeroImageIsPath = typeof heroconfig.heroImage === 'string' && !heroconfig.heroImage.startsWith('blob:');
        return {
          residential: heroconfig.residential || prevData.residential || { subServices: [] },
          commercial: heroconfig.commercial || prevData.commercial || { subServices: [] },
          heroImage: heroconfig.heroImage !== undefined ? heroconfig.heroImage : prevData.heroImage,
          heroImageFile: newHeroImageIsPath && heroconfig.heroImage !== prevData.heroImage ? null : prevData.heroImageFile,
        };
      });
    }
  }, [heroconfig]);

  const handleControlsChange = (changedFields) => {
    let newHeroImage = localData.heroImage;
    let newHeroImageFile = localData.heroImageFile;

    if (changedFields.heroImageFile) {
      if (localData.heroImage && localData.heroImage.startsWith('blob:')) URL.revokeObjectURL(localData.heroImage);
      newHeroImage = URL.createObjectURL(changedFields.heroImageFile);
      newHeroImageFile = changedFields.heroImageFile;
    }

    const updatedData = {
      ...localData,
      ...changedFields, 
      heroImage: newHeroImage,
      heroImageFile: newHeroImageFile,
    };
    setLocalData(updatedData);
    if (onConfigChange) onConfigChange(updatedData);
  };

  if (readOnly) {
    return <HeroPreview heroconfig={heroconfig} />; 
  }

  return (
    <>
      <HeroPreview heroconfig={localData} />
      <HeroControlsPanel 
        currentData={localData} 
        onControlsChange={handleControlsChange} 
      />
    </>
  );
}
