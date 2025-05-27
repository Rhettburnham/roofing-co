// src/components/MainPageBlocks/BookingBlock.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FaTools, FaFan, FaPaintRoller, FaTint } from "react-icons/fa";
import {
  FaXTwitter,
  FaLinkedin,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa6";
import { X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// import * as FaIcons from "react-icons/fa";

// Register GSAP's ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Helper to initialize image state for logo
const initializeLogoState = (logoValue, defaultPath = "/assets/images/logo.svg") => {
  if (logoValue && typeof logoValue === 'object' && logoValue.url) {
    return { ...logoValue, name: logoValue.name || logoValue.url.split('/').pop() };
  }
  if (typeof logoValue === 'string') {
    return { file: null, url: logoValue, name: logoValue.split('/').pop() };
  }
  return { file: null, url: defaultPath, name: defaultPath.split('/').pop() };
};

// Helper to get display URL for logo
const getLogoDisplayUrl = (logoState, defaultPath = "/assets/images/logo.svg") => {
  if (!logoState) return defaultPath;
  if (typeof logoState === 'string') return logoState; // Direct path
  if (typeof logoState === 'object' && logoState.url) return logoState.url; // Object with URL (e.g., blob)
  return defaultPath;
};

/* ===============================================
   1) BOOKING PREVIEW (Read-Only)
   -----------------------------------------------
   Uses bookingData.headerText for the main heading,
   bookingData.phone for the phone number link, and
   bookingData.logo for the logo image.
=============================================== */
const BookingPreview = memo(({ bookingData, readOnly, onHeaderTextChange, onPhoneChange }) => {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", service: "", message: "" });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);
  const [activeTab, setActiveTab] = useState("residential");
  const [isMobile, setIsMobile] = useState(false);
  const bannerRef = useRef(null); const formContainerRef = useRef(null); const toggleButtonRef = useRef(null); const contentRef = useRef(null);

  const socialIconComponents = { twitter: FaXTwitter, linkedin: FaLinkedin, instagram: FaInstagram, facebook: FaFacebook };
  const residentialIcons = useMemo(() => [FaTools, FaFan, FaTint, FaPaintRoller], []);
  const commercialIcons = useMemo(() => [FaTools, FaPaintRoller, FaTint, FaFan], []);

  const showNailAnimationProp = bookingData?.showNailAnimation !== undefined ? bookingData.showNailAnimation : true;
  console.log(`[BookingPreview] Instance created/re-rendered. Initial showNailAnimation prop from bookingData: ${showNailAnimationProp}`);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); window.addEventListener("resize", checkMobile); return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!bookingData || readOnly) return; // Only fetch if not in true readOnly from parent (i.e. if form is active)
    let isMounted = true; const controller = new AbortController(); const signal = controller.signal;
    const fetchServices = async () => {
      try {
        const res = await fetch("/data/roofing_services.json", { signal, credentials: "same-origin" });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        if (isMounted) {
          const data = await res.json();
          setResidentialServices(data.residential.map((s, i) => ({ icon: residentialIcons[i % residentialIcons.length] || FaTools, title: s.name, id: s.id, category: "residential" })));
          setCommercialServices(data.commercial.map((s, i) => ({ icon: commercialIcons[i % commercialIcons.length] || FaTools, title: s.name, id: s.id, category: "commercial" })));
        }
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error fetching services data for BookingBlock form:", error);
      }
    };
    fetchServices();
    return () => { isMounted = false; controller.abort(); };
  }, [bookingData, readOnly, residentialIcons, commercialIcons]);

  useEffect(() => {
    if (!bannerRef.current || !contentRef.current || !formContainerRef.current) return;
    const leftNails = Array.from(bannerRef.current.querySelectorAll('[id^="left-nail-"]')).filter(Boolean);
    const rightNails = Array.from(bannerRef.current.querySelectorAll('[id^="right-nail-"]')).filter(Boolean);
    
    console.log(`[BookingPreview GSAP Effect] Running. bookingData.showNailAnimation: ${bookingData?.showNailAnimation}`);

    // Kill existing animations on these elements
    gsap.killTweensOf([bannerRef.current, contentRef.current, formContainerRef.current, ...leftNails, ...rightNails]);
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === bannerRef.current) {
        st.kill();
      }
    });

    gsap.set(bannerRef.current, { y: "-120%", opacity: 0 });
    gsap.set(contentRef.current, { opacity: 1 }); // Assuming content within banner should be visible initially
    gsap.set(formContainerRef.current, { opacity: 0, scale: 0.95 });
    gsap.set(leftNails, { x: "-100vw" }); 
    gsap.set(rightNails, { x: "100vw" }); 

    const showNailAnimation = bookingData?.showNailAnimation !== undefined ? bookingData.showNailAnimation : true;
    console.log(`[BookingPreview GSAP Effect] Resolved showNailAnimation for GSAP: ${showNailAnimation}`);

    const masterTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: bannerRef.current,
            start: "top 80%",
            toggleActions: "play none none none", 
            once: true,
        },
    });

    masterTimeline.to(bannerRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "bounce.out" })
                  .to(formContainerRef.current, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" }, "-=0.2");

    if (showNailAnimation) {
      masterTimeline.to(leftNails, { x: "-20%", duration: 0.4, ease: "power2.out", stagger: 0.12 }, "+=0.2")
                    .to(rightNails, { x: "20%", duration: 0.4, ease: "power2.out", stagger: 0.12 }, "-=0.4");
      console.log("[BookingPreview GSAP Effect] Applied nail animation timeline.");
    } else {
      // Set nails to a static/hidden state if animation is off
      gsap.set(leftNails, { opacity: 0 }); // Hide left nails
      gsap.set(rightNails, { opacity: 0 }); // Hide right nails
      console.log("[BookingPreview GSAP Effect] Set nail opacity to 0 because showNailAnimation is false.");
    }
    
    return () => { 
      console.log(`[BookingPreview GSAP Effect] Cleanup. bookingData.showNailAnimation was: ${bookingData?.showNailAnimation}`);
      masterTimeline.kill();
      // It might be good to also kill tweens specifically if the component unmounts while animation is running
      gsap.killTweensOf([bannerRef.current, contentRef.current, formContainerRef.current, ...leftNails, ...rightNails]);
    };
  }, [bookingData?.showNailAnimation]); // Depend on showNailAnimation prop

  const toggleFormVisibility = useCallback(() => {
    if (!isMobile || isAnimating || readOnly) return;
    setIsAnimating(true);
    if (!isFormVisible) {
      gsap.to(bannerRef.current, { height: "auto", duration: 0.4, ease: "power2.inOut", onComplete: () => { gsap.to(formContainerRef.current, { opacity: 1, duration: 0.3, onComplete: () => setIsAnimating(false) }); } });
    } else {
      gsap.to(formContainerRef.current, { opacity: 0, duration: 0.3, onComplete: () => { gsap.to(bannerRef.current, { height: "140px", duration: 0.4, ease: "power2.inOut", onComplete: () => setIsAnimating(false) }); } });
    }
    setIsFormVisible(prev => !prev);
  }, [isFormVisible, isMobile, isAnimating, readOnly]);

  const handleChange = useCallback((e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })), []);
  const handleServiceSelect = useCallback((serviceTitle) => { setFormData(prev => ({ ...prev, service: serviceTitle })); setIsModalOpen(false); }, []);
  const handleSubmit = useCallback(async (e) => { 
    e.preventDefault(); 
    if (readOnly) { console.log("BookingBlock Preview: Form submission prevented in read-only context."); return; }
    try { 
        await axios.post("/api/sendForm", formData); 
        alert("Form submitted successfully!"); 
        setFormData({ firstName: "", lastName: "", email: "", phone: "", service: "", message: "" }); 
        if(isMobile) setIsFormVisible(false); 
    } catch (error) { 
        console.error("Error submitting form:", error); alert("Error submitting form."); 
    } 
  }, [formData, readOnly, isMobile]);
  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  if (!bookingData) return <p>No Booking data found.</p>;
  const { headerText, phone, logo, socialLinks, mainBackgroundColor, headerTextColor, formBackgroundColor, inputTextColor, buttonTextColor, buttonBackgroundColor } = bookingData;
  const currentMainBgColor = mainBackgroundColor || '#1f2937'; 
  const currentHeaderTextColor = headerTextColor || '#FFFFFF';
  const currentFormBgColor = formBackgroundColor || '#FFFFFF';
  const currentInputTextColor = inputTextColor || '#374151';
  const currentButtonTextColor = buttonTextColor || '#FFFFFF';
  const currentButtonBgColor = buttonBackgroundColor || '#F97316';

  // Determine initial visibility of the form part for non-mobile based on readOnly
  useEffect(() => {
    if (!isMobile) {
      setIsFormVisible(!readOnly);
    } else {
      // For mobile, keep it initially collapsed if readOnly, or if !readOnly allow toggle
      setIsFormVisible(false); // Start collapsed on mobile
    }
  }, [isMobile, readOnly]);

  return (
    <div className="flex flex-col items-center justify-center w-full px-6 overflow-hidden mt-4">
      <div ref={bannerRef} className={`md:max-w-xl w-full rounded-lg shadow-lg relative z-30 md:h-auto ${isFormVisible && isMobile && !readOnly ? "h-auto" : "h-[140px]"}`} style={{ backgroundColor: currentMainBgColor }}>
        <div className="absolute left-0 top-0 h-full hidden md:flex flex-col z-10 justify-between py-8 overflow-visible">
            {[1,2,3].map(i => <div key={`ln-${i}`} id={`left-nail-${i}`} className="w-[8vw] h-[2.5vh] relative"><div className="w-full h-full" style={{backgroundImage: "url('/assets/images/nail.png')", backgroundPosition: " center", backgroundRepeat: "no-repeat", backgroundSize: "contain", transform: "scale(1.8)", transformOrigin: " center", position: "absolute", left: `-${6 + (i*2)}%`, top:0, filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))"}}/></div>)}
        </div>
        <div className="absolute right-0 top-0 h-full hidden md:flex flex-col z-10 justify-between py-8 overflow-visible">
            {[1,2,3].map(i => <div key={`rn-${i}`} id={`right-nail-${i}`} className="w-[8vw] h-[2.5vh] relative"><div className="w-full h-full" style={{backgroundImage: "url('/assets/images/nail.png')", backgroundPosition: " center", backgroundRepeat: "no-repeat", backgroundSize: "contain", transform: "scale(1.8) scaleX(-1)", transformOrigin: "center", position: "absolute", right: `-${6 + (i*2)}%`, top:0, filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))"}}/></div>)}
        </div>

        <div ref={contentRef} className="relative z-20">
          <div className="relative py-3 px-4 flex flex-col items-center z-30">
            <div className="flex items-center justify-center w-full">
              <img src={getLogoDisplayUrl(logo)} alt="logo" className="w-16 h-auto mr-4 drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)]" style={{ filter: "invert(1)" }}/>
              <div className="text-left drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" style={{color: currentHeaderTextColor}}>
                {readOnly ? (
                  <h2 className="text-2xl md:text-3xl font-bold">{headerText}</h2>
                ) : (
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => onHeaderTextChange && onHeaderTextChange(e.target.value)}
                    className="text-2xl md:text-3xl font-bold bg-transparent border-b border-gray-500 focus:outline-none focus:border-white w-full placeholder-gray-300"
                    placeholder="Header Text"
                    style={{color: currentHeaderTextColor}}
                  />
                )}
                {readOnly ? (
                  <div className="font-bold md:text-lg"><a href={`tel:${phone?.replace(/[^0-9]/g, "")}`} style={{color: currentHeaderTextColor}}>{phone}</a></div>
                ) : (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => onPhoneChange && onPhoneChange(e.target.value)}
                    className="font-bold md:text-lg bg-transparent border-b border-gray-500 focus:outline-none focus:border-white w-full mt-1 placeholder-gray-300"
                    placeholder="Phone Number"
                    style={{color: currentHeaderTextColor}}
                  />
                )}
              </div>
            </div>
            {!readOnly && (
              <button ref={toggleButtonRef} onClick={toggleFormVisibility} disabled={isAnimating} className={`md:hidden mt-2 px-6 py-2 rounded-md shadow-lg relative transition-all duration-300 ${isAnimating ? "opacity-50" : "opacity-100"} ${isFormVisible ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}>
                {isFormVisible ? <div className="relative z-40 flex space-x-1 justify-center"><div className="w-2 h-2 rounded-full bg-white"></div><div className="w-2 h-2 rounded-full bg-white"></div><div className="w-2 h-2 rounded-full bg-white"></div></div> : <span className="relative z-40 text-white text-md font-semibold">Book Now</span>}
              </button>
            )}
          </div>
          <div
            ref={formContainerRef}
            className={`
              w-full pb-2 md:block
              transition-opacity duration-300 ease-in-out
              ${
                readOnly
                  ? 'opacity-100 scale-100' // Preview mode: always visible
                  : isMobile
                  ? isFormVisible
                    ? 'opacity-100 scale-100' // Mobile interactive: visible
                    : 'opacity-0 scale-95' // Mobile interactive: hidden/collapsed
                  : 'opacity-100 scale-100' // Desktop interactive: always visible
              }
            `}
            style={{
              display:
                readOnly
                  ? 'block' // Preview mode: always display
                  : isMobile
                  ? isFormVisible
                    ? 'block' // Mobile interactive: display
                    : 'none' // Mobile interactive: hide (collapse)
                  : 'block', // Desktop interactive: always display
            }}
          >
            {(socialLinks && socialLinks.length > 0) && ( // Always show social links if they exist
              <div className="flex justify-center space-x-12 py-4 md:py-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = socialIconComponents[social.platform.toLowerCase()];
                  return (
                    <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="block" onClick={(e) => { if(!readOnly && readOnly !== undefined) e.preventDefault();}}>
                      <div className="bg-second-accent p-2 rounded-md transform transition-transform hover:scale-110"><IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" /></div>
                    </a>
                  );
                })}
              </div>
            )}
            <div className="rounded-lg p-3 shadow-inner mx-2 mt-2" style={{backgroundColor: currentFormBgColor}}>
              <form onSubmit={handleSubmit} className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105"><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600" style={{color: currentInputTextColor}} disabled={readOnly}/></div>
                  <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105"><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600" style={{color: currentInputTextColor}} disabled={readOnly}/></div>
                  <div className="md:col-span-2 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105"><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600" style={{color: currentInputTextColor}} disabled={readOnly}/></div>
                  <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105"><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your Phone" required className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600" style={{color: currentInputTextColor}} disabled={readOnly}/></div>
                  <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105"><div onClick={() => !readOnly && setIsModalOpen(true)} className={`w-full p-2 bg-transparent border-b border-gray-400 ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`} style={{color: formData.service ? currentInputTextColor : '#4B5563' }}>{formData.service ? formData.service : "Select a Service"}</div></div>
                  <div className="md:col-span-2 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105"><textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" required rows="3" className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600" style={{color: currentInputTextColor}} disabled={readOnly}/></div>
                </div>
                <div className="flex justify-center w-full mt-4 relative"><button type="submit" disabled={readOnly} className="relative px-8 py-2 text-lg font-semibold rounded-md md:w-auto shadow-md" style={{color: currentButtonTextColor, backgroundColor: currentButtonBgColor}}>Submit</button></div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg p-4 md:p-6 relative max-w-md w-full mx-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-4 text-center">Select a Service</h2>
            <div className="flex border-b mb-4">
              <button className={`flex-1 py-2 font-medium ${activeTab === "residential"? "text-banner border-b-2 border-banner" : "text-gray-500"}`} onClick={() => handleTabChange("residential")}>Residential</button>
              <button className={`flex-1 py-2 font-medium ${activeTab === "commercial"? "text-banner border-b-2 border-banner" : "text-gray-500"}`} onClick={() => handleTabChange("commercial")}>Commercial</button>
            </div>
            <ul className="space-y-4 max-h-80 overflow-y-auto">
              {activeTab === "residential" ? (residentialServices.length > 0 ? residentialServices.map((s, i) => <li key={i} className="flex items-start cursor-pointer p-2 hover:bg-gray-100 rounded" onClick={() => handleServiceSelect(s.title)}><div className="text-2xl text-banner mr-3">{React.createElement(s.icon, {className: "w-6 h-6"})}</div><div><h3 className="text-lg font-semibold">{s.title}</h3></div></li>) : <li className="text-center text-gray-600">Loading...</li>) : (commercialServices.length > 0 ? commercialServices.map((s, i) => <li key={i} className="flex items-start cursor-pointer p-2 hover:bg-gray-100 rounded" onClick={() => handleServiceSelect(s.title)}><div className="text-2xl text-banner mr-3">{React.createElement(s.icon, {className: "w-6 h-6"})}</div><div><h3 className="text-lg font-semibold">{s.title}</h3></div></li>) : <li className="text-center text-gray-600">Loading...</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});
BookingPreview.displayName = "BookingPreview";
BookingPreview.propTypes = {
  bookingData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  onHeaderTextChange: PropTypes.func,
  onPhoneChange: PropTypes.func,
};

/* ===============================================
   2) BOOKING EDITOR PANEL (Editing Mode)
   -----------------------------------------------
   Now allows editing of headerText, phone, 
   and the logo image on the left of the header.
=============================================== */
function BookingEditorPanel({ localData, onPanelChange }) { 
  const { logo, socialLinks = [], mainBackgroundColor, headerTextColor, formBackgroundColor, inputTextColor, buttonTextColor, buttonBackgroundColor, showNailAnimation } = localData;

  const handleFieldChange = (field, value) => {
    onPanelChange(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updatedSocialLinks = [...(socialLinks || [])]; // Ensure socialLinks is an array
    updatedSocialLinks[index] = { ...updatedSocialLinks[index], [field]: value };
    onPanelChange(prev => ({ ...prev, socialLinks: updatedSocialLinks }));
  };

  const addSocialLink = () => {
    onPanelChange(prev => ({ ...prev, socialLinks: [...(prev.socialLinks || []), { platform: "twitter", url: "" }] }));
  };

  const removeSocialLink = (index) => {
    onPanelChange(prev => ({ ...prev, socialLinks: (prev.socialLinks || []).filter((_, i) => i !== index) }));
  };

  const handleLogoFileChange = (file) => {
    if (!file) return;
    if (localData.logo?.url?.startsWith('blob:')) URL.revokeObjectURL(localData.logo.url);
    const fileURL = URL.createObjectURL(file);
    onPanelChange(prev => ({ ...prev, logo: { file, url: fileURL, name: file.name } }));
  };

  const handleLogoUrlChange = (urlValue) => {
    if (localData.logo?.url?.startsWith('blob:')) URL.revokeObjectURL(localData.logo.url);
    onPanelChange(prev => ({ ...prev, logo: { file: null, url: urlValue, name: urlValue.split('/').pop() } }));
  };

  const handleToggleNailAnimation = () => {
    const currentShowState = localData.showNailAnimation !== undefined ? localData.showNailAnimation : true;
    const newShowState = !currentShowState;
    console.log(`[BookingEditorPanel] handleToggleNailAnimation: Current: ${currentShowState}, New: ${newShowState}`);
    onPanelChange({ showNailAnimation: newShowState });
  };

  return (
    <div className="bg-black text-white p-4 rounded mt-0 space-y-4">
      <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Booking Settings</h2>
      
      <div>
        <label className="block text-sm mb-1">Logo Image:</label>
        <input type="file" accept="image/*" onChange={(e) => handleLogoFileChange(e.target.files?.[0])} className="w-full bg-gray-700 px-2 py-1 rounded text-xs file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
        {getLogoDisplayUrl(logo) && <img src={getLogoDisplayUrl(logo)} alt="Logo Preview" className="mt-2 h-20 rounded shadow bg-gray-700 p-1"/>}
      </div>

      <div className="space-y-3 pt-3 border-t border-gray-700">
        <h3 className="text-lg font-semibold">Social Media Links:</h3>
        {(socialLinks || []).map((link, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800 rounded">
            <select value={link.platform} onChange={(e) => handleSocialLinkChange(index, "platform", e.target.value)} className="bg-gray-700 px-2 py-1 rounded text-xs"><option value="twitter">Twitter/X</option><option value="linkedin">LinkedIn</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option></select>
            <input type="url" placeholder="Social Media URL" value={link.url} onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)} className="w-full bg-gray-700 px-2 py-1 rounded text-xs"/>
            <button type="button" onClick={() => removeSocialLink(index)} className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white text-xs">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addSocialLink} className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm">+ Add Social Link</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-700">
        <div><label className="block text-sm font-medium">Main Background Color:</label><input type="color" className="mt-1 block w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm" value={mainBackgroundColor || '#1f2937'} onChange={(e) => handleFieldChange('mainBackgroundColor', e.target.value)}/></div>
        <div><label className="block text-sm font-medium">Header Text Color:</label><input type="color" className="mt-1 block w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm" value={headerTextColor || '#FFFFFF'} onChange={(e) => handleFieldChange('headerTextColor', e.target.value)}/></div>
        <div><label className="block text-sm font-medium">Form Background Color:</label><input type="color" className="mt-1 block w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm" value={formBackgroundColor || '#FFFFFF'} onChange={(e) => handleFieldChange('formBackgroundColor', e.target.value)}/></div>
        <div><label className="block text-sm font-medium">Form Input Text Color:</label><input type="color" className="mt-1 block w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm" value={inputTextColor || '#374151'} onChange={(e) => handleFieldChange('inputTextColor', e.target.value)}/></div>
        <div><label className="block text-sm font-medium">Submit Button Text Color:</label><input type="color" className="mt-1 block w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm" value={buttonTextColor || '#FFFFFF'} onChange={(e) => handleFieldChange('buttonTextColor', e.target.value)}/></div>
        <div><label className="block text-sm font-medium">Submit Button Background Color:</label><input type="color" className="mt-1 block w-full h-10 px-1 py-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm" value={buttonBackgroundColor || '#F97316'} onChange={(e) => handleFieldChange('buttonBackgroundColor', e.target.value)}/></div>
      </div>
      <div className="pt-3 border-t border-gray-700">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localData.showNailAnimation !== undefined ? localData.showNailAnimation : true}
            onChange={handleToggleNailAnimation}
            className="form-checkbox h-5 w-5 text-blue-600 rounded bg-gray-700 border-gray-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Show Nail Animation</span>
        </label>
      </div>
    </div>
  );
}
BookingEditorPanel.propTypes = { localData: PropTypes.object.isRequired, onPanelChange: PropTypes.func.isRequired };

/* ===============================================
   3) MAIN EXPORT: BOOKING BLOCK
   -----------------------------------------------
   - If readOnly=true, show BookingPreview
   - Otherwise, show BookingEditorPanel.
   - The default logo is set to "/assets/images/logo.svg" if not provided.
=============================================== */
export default function BookingBlock({
  readOnly = false,
  bookingData, 
  onConfigChange,
}) {
  const [localData, setLocalData] = useState(() => {
    const initialConfig = bookingData || {};
    const initialShowNailAnimation = initialConfig.showNailAnimation !== undefined ? initialConfig.showNailAnimation : true;
    console.log(`[BookingBlock useState init] initialConfig.showNailAnimation: ${initialConfig.showNailAnimation}, Resolved to: ${initialShowNailAnimation}`);
    return {
      logo: initializeLogoState(initialConfig.logo), 
      headerText: initialConfig.headerText || "Contact Us!",
      phone: initialConfig.phone || "(770) 880-1319",
      socialLinks: initialConfig.socialLinks || [{ platform: "twitter", url: "" }, { platform: "facebook", url: "" }],
      mainBackgroundColor: initialConfig.mainBackgroundColor || '#1f2937', 
      headerTextColor: initialConfig.headerTextColor || '#FFFFFF',
      formBackgroundColor: initialConfig.formBackgroundColor || '#FFFFFF',
      inputTextColor: initialConfig.inputTextColor || '#374151',
      buttonTextColor: initialConfig.buttonTextColor || '#FFFFFF',
      buttonBackgroundColor: initialConfig.buttonBackgroundColor || '#F97316',
      showNailAnimation: initialShowNailAnimation,
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (bookingData) {
      setLocalData(prevLocal => {
        const newLogo = initializeLogoState(bookingData.logo, prevLocal.logo?.url);
        if (prevLocal.logo?.file && prevLocal.logo.url?.startsWith('blob:') && prevLocal.logo.url !== newLogo.url) {
          URL.revokeObjectURL(prevLocal.logo.url);
        }

        // Default values from initial state for comparison
        const defaultHeaderText = "Contact Us!";
        const defaultPhone = "(770) 880-1319";

        // Social links: Panel driven, prop is authoritative if defined, else keep local, else default to empty.
        // The original `BookingBlock.defaultProps` has a more extensive default, but useState initializes with a simpler one.
        // We'll use the useState initializer's perspective for "is it different from default".
        // The original `BookingBlock.defaultProps` has a more extensive default, but useState initializes with a simpler one.
        // We'll use the useState initializer's perspective for "is it different from default".
        const defaultSocialLinks = [{ platform: "twitter", url: "" }, { platform: "facebook", url: "" }];
        let newSocialLinks;
        if (bookingData.socialLinks !== undefined) {
          newSocialLinks = bookingData.socialLinks; // Prop is source of truth for structure if present
        } else if (prevLocal.socialLinks !== undefined) {
          newSocialLinks = prevLocal.socialLinks; // Else keep local
        } else {
          newSocialLinks = defaultSocialLinks; // Else default (empty or minimal)
        }

        return {
          ...prevLocal, // Start with local state
          ...bookingData, // Overlay with incoming prop data (handles colors correctly due to specific lines below)

          // Prioritize prevLocal for panel-editable text fields if they hold uncommitted changes
          headerText: (prevLocal.headerText !== bookingData.headerText && 
                       prevLocal.headerText !== (bookingData.headerText || defaultHeaderText))
                     ? prevLocal.headerText
                     : (bookingData.headerText || defaultHeaderText),
          phone: (prevLocal.phone !== bookingData.phone && // This is the header phone
                  prevLocal.phone !== (bookingData.phone || defaultPhone))
                ? prevLocal.phone
                : (bookingData.phone || defaultPhone),

          logo: newLogo, // Uses initializeLogoState, handles blob revocation
          socialLinks: newSocialLinks, // Panel driven, prop is authoritative for structure if defined

          // Colors are handled by explicit merges, preferring bookingData if defined (already in ...bookingData spread, re-stated for clarity)
          mainBackgroundColor: bookingData.mainBackgroundColor !== undefined ? bookingData.mainBackgroundColor : prevLocal.mainBackgroundColor,
          headerTextColor: bookingData.headerTextColor !== undefined ? bookingData.headerTextColor : prevLocal.headerTextColor,
          formBackgroundColor: bookingData.formBackgroundColor !== undefined ? bookingData.formBackgroundColor : prevLocal.formBackgroundColor,
          inputTextColor: bookingData.inputTextColor !== undefined ? bookingData.inputTextColor : prevLocal.inputTextColor,
          buttonTextColor: bookingData.buttonTextColor !== undefined ? bookingData.buttonTextColor : prevLocal.buttonTextColor,
          buttonBackgroundColor: bookingData.buttonBackgroundColor !== undefined ? bookingData.buttonBackgroundColor : prevLocal.buttonBackgroundColor,
          showNailAnimation: bookingData.showNailAnimation !== undefined ? bookingData.showNailAnimation : (prevLocal.showNailAnimation !== undefined ? prevLocal.showNailAnimation : true),
        };
      });
    }
    // If bookingData is null/undefined, localData remains as is.
  }, [bookingData]);

  useEffect(() => {
    return () => { if (localData.logo?.file && localData.logo.url?.startsWith('blob:')) URL.revokeObjectURL(localData.logo.url); };
  }, [localData.logo]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("[BookingBlock onConfigChange Effect] Editing finished. Calling onConfigChange.");
        const dataToSave = { 
            ...localData, 
            logo: localData.logo?.file ? (localData.logo.name || 'default_logo.svg') : localData.logo?.url,
            showNailAnimation: localData.showNailAnimation, // Already simplified
        };
        console.log("[BookingBlock onConfigChange Effect] dataToSave:", JSON.parse(JSON.stringify(dataToSave, (k,v) => v instanceof File ? ({name: v.name, type: v.type, size: v.size}) : v)));
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, onConfigChange]);

  const handleLocalDataChange = (updater) => {
    setLocalData(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      console.log('[BookingBlock handleLocalDataChange] prevState.showNailAnimation:', prevState.showNailAnimation, 'newState.showNailAnimation:', newState.showNailAnimation);
      return newState;
    });
  };

  if (readOnly) {
    return <BookingPreview bookingData={localData} readOnly={true} />;
  }
  
  return (
    <>
      <BookingPreview 
        bookingData={localData} 
        readOnly={false}
        onHeaderTextChange={(newText) => handleLocalDataChange(prev => ({ ...prev, headerText: newText }))}
        onPhoneChange={(newPhone) => handleLocalDataChange(prev => ({ ...prev, phone: newPhone }))}
      />
      <BookingEditorPanel 
        localData={localData}
        onPanelChange={handleLocalDataChange}
      />
    </>
  );
}

BookingBlock.propTypes = {
  readOnly: PropTypes.bool,
  bookingData: PropTypes.object,
  onConfigChange: PropTypes.func,
};

// Default props for BookingBlock
BookingBlock.defaultProps = {
  readOnly: false,
  bookingData: {
    logo: "/assets/images/logo.svg",
    headerText: "Contact Us!",
    phone: "(770) 880-1319",
    showNailAnimation: true,
    socialLinks: [
      { platform: "twitter", url: "https://twitter.com" },
      { platform: "linkedin", url: "https://linkedin.com" },
      { platform: "instagram", url: "https://instagram.com" },
      { platform: "facebook", url: "https://facebook.com" },
    ],
  },
  onConfigChange: () => {},
};
