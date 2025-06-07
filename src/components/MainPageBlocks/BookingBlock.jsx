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
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";

// Register GSAP's ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Helper to initialize image state for logo
const initializeLogoState = (
  logoValue,
  defaultPath = "/assets/images/logo.svg"
) => {
  let originalUrlToStore = defaultPath;
  let nameToStore = defaultPath.split("/").pop();
  let urlToDisplay = defaultPath;
  let fileObject = null;

  if (logoValue && typeof logoValue === "object") {
    fileObject = logoValue.file || null;
    urlToDisplay = logoValue.url || defaultPath;
    nameToStore = logoValue.name || urlToDisplay.split("/").pop();
    originalUrlToStore =
      logoValue.originalUrl ||
      (typeof logoValue.url === "string" && !logoValue.url.startsWith("blob:")
        ? logoValue.url
        : defaultPath);
  } else if (typeof logoValue === "string") {
    urlToDisplay = logoValue;
    nameToStore = logoValue.split("/").pop();
    originalUrlToStore = logoValue;
  }

  return {
    file: fileObject,
    url: urlToDisplay,
    name: nameToStore,
    originalUrl: originalUrlToStore,
  };
};

// Helper to get display URL for logo
const getLogoDisplayUrl = (
  logoState,
  defaultPath = "/assets/images/logo.svg"
) => {
  if (!logoState) return defaultPath;
  if (typeof logoState === "string") return logoState;
  if (typeof logoState === "object" && logoState.url) return logoState.url;
  return defaultPath;
};

// Helper function to derive local state from props
const deriveInitialLocalData = (bookingDataInput) => {
  const initial = bookingDataInput || {};

  // Get the current variant
  const currentVariant = initial.variant || "nail";

  // Get variant-specific data
  let variantSpecificData = {};
  if (initial.variants && initial.variants[currentVariant]) {
    variantSpecificData = initial.variants[currentVariant];
  }

  return {
    ...initial,
    logo: initializeLogoState(initial.logo),
    phone: initial.phone || "",
    socialLinks: initial.socialLinks || [],
    variant: currentVariant,
    colors: initial.colors || {},

    // All variant-specific content comes from the variant object
    headerText: variantSpecificData.headerText || "",
    formTitle: variantSpecificData.formTitle || "",
    showNailAnimation:
      variantSpecificData.showNailAnimation !== undefined
        ? variantSpecificData.showNailAnimation
        : true,

    // Variant-specific data arrays (modern, creative)
    features: variantSpecificData.features || [],
    badges: variantSpecificData.badges || [],
    formFields: variantSpecificData.formFields || {},
    serviceOptions: variantSpecificData.serviceOptions || [],
    galleryImages: variantSpecificData.galleryImages || [],

    styling: {
      ...initial.styling,
      showNailAnimation:
        variantSpecificData.showNailAnimation !== undefined
          ? variantSpecificData.showNailAnimation
          : true,
    },
  };
};

/* ===============================================
   BOOKING PREVIEW (Read-Only or Editable)
   -----------------------------------------------
   Displays content with inline editing capabilities
=============================================== */
const BookingPreview = memo(
  ({ bookingData, readOnly, onBookingDataChange, socialIconLocation }) => {
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [residentialServices, setResidentialServices] = useState([]);
    const [commercialServices, setCommercialServices] = useState([]);
    const [activeTab, setActiveTab] = useState("residential");
    const [isMobile, setIsMobile] = useState(false);

    const bannerRef = useRef(null);
    const formContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const contentRef = useRef(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const socialIconComponents = {
      twitter: FaXTwitter,
      linkedin: FaLinkedin,
      instagram: FaInstagram,
      facebook: FaFacebook,
    };
    const residentialIcons = useMemo(
      () => [FaTools, FaFan, FaTint, FaPaintRoller],
      []
    );
    const commercialIcons = useMemo(
      () => [FaTools, FaPaintRoller, FaTint, FaFan],
      []
    );

    const showNailAnimationProp =
      bookingData?.showNailAnimation !== undefined
        ? bookingData.showNailAnimation
        : true;

    const handleFieldChange = (field, value) => {
      onBookingDataChange({ ...bookingData, [field]: value });
    };

    const handleVariantFieldChange = (field, value) => {
      const currentVariant = bookingData.variant || "nail";
      const updatedVariants = {
        ...bookingData.variants,
        [currentVariant]: {
          ...bookingData.variants?.[currentVariant],
          [field]: value,
        },
      };
      onBookingDataChange({
        ...bookingData,
        variants: updatedVariants,
        [field]: value, // Also update at root level for current display
      });
    };

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
      if (!bookingData || readOnly) return;
      let isMounted = true;
      const controller = new AbortController();
      const signal = controller.signal;
      const fetchServices = async () => {
        try {
          const res = await fetch("/data/roofing_services.json", {
            signal,
            credentials: "same-origin",
          });
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          if (isMounted) {
            const data = await res.json();
            setResidentialServices(
              data.residential.map((s, i) => ({
                icon: residentialIcons[i % residentialIcons.length] || FaTools,
                title: s.name,
                id: s.id,
                category: "residential",
              }))
            );
            setCommercialServices(
              data.commercial.map((s, i) => ({
                icon: commercialIcons[i % commercialIcons.length] || FaTools,
                title: s.name,
                id: s.id,
                category: "commercial",
              }))
            );
          }
        } catch (error) {
          if (error.name !== "AbortError")
            console.error(
              "Error fetching services data for BookingBlock form:",
              error
            );
        }
      };
      fetchServices();
      return () => {
        isMounted = false;
        controller.abort();
      };
    }, [bookingData, readOnly, residentialIcons, commercialIcons]);

    useEffect(() => {
      if (
        !bannerRef.current ||
        !contentRef.current ||
        !formContainerRef.current
      )
        return;
      const leftNails = Array.from(
        bannerRef.current.querySelectorAll('[id^="left-nail-"]')
      ).filter(Boolean);
      const rightNails = Array.from(
        bannerRef.current.querySelectorAll('[id^="right-nail-"]')
      ).filter(Boolean);

      gsap.killTweensOf([
        bannerRef.current,
        contentRef.current,
        formContainerRef.current,
        ...leftNails,
        ...rightNails,
      ]);
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === bannerRef.current) {
          st.kill();
        }
      });

      gsap.set(bannerRef.current, { y: "-120%", opacity: 0 });
      gsap.set(contentRef.current, { opacity: 1 });
      gsap.set(formContainerRef.current, { opacity: 0, scale: 0.95 });
      gsap.set(leftNails, { x: "-100vw" });
      gsap.set(rightNails, { x: "100vw" });

      const showNailAnimation =
        bookingData?.showNailAnimation !== undefined
          ? bookingData.showNailAnimation
          : true;

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: bannerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      masterTimeline
        .to(bannerRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "bounce.out",
        })
        .to(
          formContainerRef.current,
          { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" },
          "-=0.2"
        );

      if (showNailAnimation) {
        masterTimeline
          .to(
            leftNails,
            { x: "-15%", duration: 0.4, ease: "power2.out", stagger: 0.12 },
            "+=0.2"
          )
          .to(
            rightNails,
            { x: "15%", duration: 0.4, ease: "power2.out", stagger: 0.12 },
            "-=0.4"
          );
      } else {
        gsap.set(leftNails, { opacity: 0 });
        gsap.set(rightNails, { opacity: 0 });
      }

      return () => {
        masterTimeline.kill();
        gsap.killTweensOf([
          bannerRef.current,
          contentRef.current,
          formContainerRef.current,
          ...leftNails,
          ...rightNails,
        ]);
      };
    }, [bookingData?.showNailAnimation]);

    if (!bookingData) return <p>No Booking data found.</p>;

    const { headerText, phone, logo, socialLinks, colors } = bookingData;
    const currentMainBgColor = colors?.primaryBackground || "#1f2937";
    const currentHeaderTextColor = colors?.primaryText || "#FFFFFF";
    const currentFormBgColor = colors?.secondaryBackground || "#FFFFFF";
    const currentInputTextColor = colors?.inputText || "#374151";
    const currentButtonTextColor = colors?.buttonText || "#FFFFFF";
    const currentButtonBgColor = colors?.buttonBackground || "#F97316";

    useEffect(() => {
      if (!isMobile) {
        setIsFormVisible(!readOnly);
      } else {
        setIsFormVisible(false);
      }
    }, [isMobile, readOnly]);

    const toggleFormVisibility = useCallback(() => {
      if (isMobile) {
        // Only animate on mobile
        if (!isFormVisible) {
          // Ensure the form container is visible
          if (formContainerRef.current) {
            formContainerRef.current.style.display = "block";
          }
          // Animation to expand banner into form
          if (bannerRef.current) {
            gsap.to(bannerRef.current, {
              height: "auto",
              duration: 0.5,
              ease: "power2.inOut",
              onComplete: () => {
                // Fade in form elements
                if (formContainerRef.current) {
                  gsap.fromTo(
                    formContainerRef.current,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.3 }
                  );
                }
              },
            });
          }
        } else {
          // Animation to collapse form back to banner
          if (formContainerRef.current) {
            gsap.to(formContainerRef.current, {
              opacity: 0,
              y: 20,
              duration: 0.3,
              onComplete: () => {
                if (bannerRef.current) {
                  gsap.to(bannerRef.current, {
                    height: "auto",
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                      // Don't hide the form container, just reduce opacity
                      formContainerRef.current.style.opacity = "0";
                    },
                  });
                }
              },
            });
          }
        }
      }
      setIsFormVisible((prev) => !prev);
    }, [isFormVisible, isMobile]);

    const handleChange = useCallback(
      (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })),
      []
    );
    const handleServiceSelect = useCallback((serviceTitle) => {
      setFormData((prev) => ({ ...prev, service: serviceTitle }));
      setIsModalOpen(false);
    }, []);
    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        if (readOnly) {
          console.log(
            "BookingBlock Preview: Form submission prevented in read-only context."
          );
          return;
        }

        setSubmitting(true);
        setError(null);

        try {
          const response = await axios.post("/api/submit-booking", formData);
          if (response.data.success) {
            alert("Form submitted successfully!");
            setFormData({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              service: "",
              message: "",
            });
            if (isMobile) setIsFormVisible(false);
          } else {
            throw new Error(response.data.message || "Submission failed");
          }
        } catch (error) {
          console.error("Error submitting form:", error);
          setError(
            error.response?.data?.message ||
              error.message ||
              "Error submitting form. Please try again."
          );
        } finally {
          setSubmitting(false);
        }
      },
      [formData, readOnly, isMobile]
    );
    const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

    return (
      <div className="flex flex-col items-center justify-center w-full px-6 overflow-hidden mt-4">
        <div
          ref={bannerRef}
          className={`
          md:max-w-[70%] w-full rounded-lg shadow-lg relative z-30
        `}
          style={{
            backgroundColor: currentMainBgColor,
            height: isMobile
              ? `${bookingData?.styling?.mobileHeightVW || 100}vw`
              : `${bookingData?.styling?.desktopHeightVH || 100}vh`,
            minHeight: isMobile
              ? undefined
              : `${bookingData?.styling?.desktopHeightVH || 100}vh`,
          }}
        >
          <div className="absolute left-0 top-0 h-full hidden md:flex flex-col z-10 justify-between py-8 overflow-visible">
            {[1, 2, 3].map((i) => (
              <div
                key={`ln-${i}`}
                id={`left-nail-${i}`}
                className="w-[8vw] h-[2.5vh] relative"
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: "url('/assets/images/nail.png')",
                    backgroundPosition: " center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    transform: "scale(1.8)",
                    transformOrigin: " center",
                    position: "absolute",
                    left: `-${6 + i * 2}%`,
                    top: 0,
                    filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full hidden md:flex flex-col z-10 justify-between py-8 overflow-visible">
            {[1, 2, 3].map((i) => (
              <div
                key={`rn-${i}`}
                id={`right-nail-${i}`}
                className="w-[8vw] h-[2.5vh] relative"
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: "url('/assets/images/nail.png')",
                    backgroundPosition: " center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    transform: "scale(1.8) scaleX(-1)",
                    transformOrigin: "center",
                    position: "absolute",
                    right: `-${6 + i * 2}%`,
                    top: 0,
                    filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
                  }}
                />
              </div>
            ))}
          </div>

          <div ref={contentRef} className="relative z-20">
            {/* Header Section: Logo, Text, Button - Centered and aligned */}
            <div className="flex items-center justify-center w-full pt-4 pb-0 px-2 z-30">
              <div className="flex flex-row items-center justify-center w-full gap-4">
                <img
                    src={getLogoDisplayUrl(logo)}
                    alt="logo"
                    className="w-16 h-16 drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)]"
                    style={{ filter: "invert(1)" }}
                  />
                <div className="flex flex-col items-start">
                  {!readOnly ? (
                    <input
                      type="text"
                      value={headerText}
                      onChange={(e) =>
                        handleVariantFieldChange("headerText", e.target.value)
                      }
                      className="text-xl font-bold bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded p-0 w-full text-left placeholder-gray-300"
                      placeholder="Header Text"
                      style={{ color: currentHeaderTextColor }}
                    />
                  ) : (
                    <h2
                      className="text-xl font-bold text-left"
                      style={{ color: currentHeaderTextColor }}
                    >
                      {headerText}
                    </h2>
                  )}
                  {!readOnly ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) =>
                        handleFieldChange("phone", e.target.value)
                      }
                      className="font-bold text-base bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded p-0 w-full mt-1 text-left placeholder-gray-300"
                      placeholder="Phone Number"
                      style={{ color: currentHeaderTextColor }}
                    />
                  ) : (
                    <p
                      className="font-bold text-base mt-1 text-left"
                      style={{ color: currentHeaderTextColor }}
                    >
                      {phone}
                    </p>
                  )}
                </div>

                {isMobile && (
                  <button
                    ref={toggleButtonRef}
                    onClick={toggleFormVisibility}
                    disabled={isAnimating}
                    className={`mt-3 mb-0 px-6 py-2 rounded-md shadow-lg transition-all duration-300 border-2 border-black font-bold w-full max-w-xs ${isAnimating ? "opacity-50" : "opacity-100"}`}
                    style={{
                      backgroundColor: currentButtonBgColor,
                      color: currentButtonTextColor,
                    }}
                  >
                    {isFormVisible ? (
                      <div className="relative z-40 flex space-x-1 justify-center">
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                      </div>
                    ) : (
                      <span className="relative z-40 text-md font-semibold">
                        BOOK NOW
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
            {/* Form container: no extra margin/padding when collapsed */}
            <div
              ref={formContainerRef}
              className={`w-full transition-all duration-500 md:max-h-none md:overflow-visible ${isMobile ? (isFormVisible ? "max-h-[1000px] overflow-visible pt-2 pb-2" : "max-h-0 overflow-hidden p-0 m-0") : "pt-2 pb-2"}`}
              style={{
                ...(isMobile
                  ? {}
                  : {
                      opacity: 1,
                      transform: "scale(1)",
                      visibility: "visible",
                      pointerEvents: "auto",
                    }),
                backgroundColor: undefined,
              }}
            >
              {socialLinks &&
                socialLinks.length > 0 &&
                (!readOnly || socialIconLocation === "below") && (
                  <div className="flex justify-center space-x-12 py-4 md:py-3">
                    {socialLinks.map((social, index) => {
                      const IconComponent =
                        socialIconComponents[social.platform.toLowerCase()];
                      return (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                          onClick={(e) => {
                            if (!readOnly && readOnly !== undefined)
                              e.preventDefault();
                          }}
                        >
                          <div className="bg-second-accent p-2 rounded-md transform transition-transform hover:scale-110">
                            <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              <div
                className="rounded-lg p-3 shadow-inner mx-2 mt-2"
                style={{ backgroundColor: currentFormBgColor }}
              >
                {/* Form Title - variant specific */}
                <div className="mb-4 text-center">
                  {!readOnly ? (
                    <input
                      type="text"
                      value={bookingData.formTitle || ""}
                      onChange={(e) =>
                        handleVariantFieldChange("formTitle", e.target.value)
                      }
                      className="text-lg md:text-xl font-semibold bg-transparent focus:bg-gray-100 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full placeholder-gray-400 outline-none text-center"
                      placeholder="Form Title"
                      style={{ color: currentInputTextColor }}
                    />
                  ) : bookingData.formTitle ? (
                    <h3
                      className="text-lg md:text-xl font-semibold text-center"
                      style={{ color: currentInputTextColor }}
                    >
                      {bookingData.formTitle}
                    </h3>
                  ) : null}
                </div>
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First Name"
                          required
                          className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                          style={{ color: currentInputTextColor }}
                        />
                      </div>
                      <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last Name"
                          required
                          className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                          style={{ color: currentInputTextColor }}
                        />
                      </div>
                      <div className="md:col-span-2 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Your Email"
                          required
                          className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                          style={{ color: currentInputTextColor }}
                        />
                      </div>
                      <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Your Phone"
                          required
                          className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                          style={{ color: currentInputTextColor }}
                        />
                      </div>
                      <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                        <div
                          onClick={() => setIsModalOpen(true)}
                          className="w-full p-2 bg-transparent border-b border-gray-400 cursor-pointer"
                          style={{
                            color: formData.service
                              ? currentInputTextColor
                              : "#4B5563",
                          }}
                        >
                          {formData.service
                            ? formData.service
                            : "Select a Service"}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105 h-full flex flex-col">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project..."
                        required
                        rows="4"
                        className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600 flex-grow"
                        style={{ color: currentInputTextColor, resize: "none" }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center w-full mt-4 relative">
                    <button
                      type="submit"
                      className="relative px-8 py-2 text-lg font-semibold rounded-md md:w-auto shadow-md"
                      style={{
                        color: currentButtonTextColor,
                        backgroundColor: currentButtonBgColor,
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg p-4 md:p-6 relative max-w-md w-full mx-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Select a Service
              </h2>
              <div className="flex border-b mb-4">
                <button
                  className={`flex-1 py-2 font-medium ${activeTab === "residential" ? "text-banner border-b-2 border-banner" : "text-gray-500"}`}
                  onClick={() => handleTabChange("residential")}
                >
                  Residential
                </button>
                <button
                  className={`flex-1 py-2 font-medium ${activeTab === "commercial" ? "text-banner border-b-2 border-banner" : "text-gray-500"}`}
                  onClick={() => handleTabChange("commercial")}
                >
                  Commercial
                </button>
              </div>
              <ul className="space-y-4 max-h-80 overflow-y-auto">
                {activeTab === "residential" ? (
                  residentialServices.length > 0 ? (
                    residentialServices.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start cursor-pointer p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleServiceSelect(s.title)}
                      >
                        <div className="text-2xl text-banner mr-3">
                          {React.createElement(s.icon, {
                            className: "w-6 h-6",
                          })}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{s.title}</h3>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-gray-600">Loading...</li>
                  )
                ) : commercialServices.length > 0 ? (
                  commercialServices.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start cursor-pointer p-2 hover:bg-gray-100 rounded"
                      onClick={() => handleServiceSelect(s.title)}
                    >
                      <div className="text-2xl text-banner mr-3">
                        {React.createElement(s.icon, { className: "w-6 h-6" })}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{s.title}</h3>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center text-gray-600">Loading...</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
);
BookingPreview.displayName = "BookingPreview";
BookingPreview.propTypes = {
  bookingData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  onBookingDataChange: PropTypes.func.isRequired,
  socialIconLocation: PropTypes.string,
};

/* ===============================================
   MODERN BOOKING VARIANT
   -----------------------------------------------
   Clean, minimalist design with gradients
=============================================== */
const ModernBookingVariant = memo(
  ({ bookingData, readOnly, onBookingDataChange, socialIconLocation }) => {
    // All hooks must be called at the top, before any conditional logic
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback(
      (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })),
      []
    );

    const handleFieldChange = useCallback(
      (field, value) => {
        onBookingDataChange({ ...bookingData, [field]: value });
      },
      [bookingData, onBookingDataChange]
    );

    const handleVariantFieldChange = useCallback(
      (field, value) => {
        const currentVariant = bookingData.variant || "modern";
        const updatedVariants = {
          ...bookingData.variants,
          [currentVariant]: {
            ...bookingData.variants?.[currentVariant],
            [field]: value,
          },
        };
        onBookingDataChange({
          ...bookingData,
          variants: updatedVariants,
          [field]: value, // Also update at root level for current display
        });
      },
      [bookingData, onBookingDataChange]
    );

    const handleFeatureChange = useCallback(
      (index, field, value) => {
        const features = bookingData?.features || [];
        const updatedFeatures = [...features];
        if (updatedFeatures[index]) {
          updatedFeatures[index] = {
            ...updatedFeatures[index],
            [field]: value,
          };
          handleVariantFieldChange("features", updatedFeatures);
        }
      },
      [bookingData?.features, handleVariantFieldChange]
    );

    const handleFormFieldChange = useCallback(
      (field, value) => {
        const formFields = bookingData?.formFields || {};
        const updatedFormFields = { ...formFields, [field]: value };
        handleVariantFieldChange("formFields", updatedFormFields);
      },
      [bookingData?.formFields, handleVariantFieldChange]
    );

    const handleServiceOptionsChange = useCallback(
      (newOptions) => {
        handleVariantFieldChange("serviceOptions", newOptions);
      },
      [handleVariantFieldChange]
    );

    const addServiceOption = useCallback(() => {
      const serviceOptions = bookingData?.serviceOptions || [];
      const newOptions = [...serviceOptions, "New Service"];
      handleServiceOptionsChange(newOptions);
    }, [bookingData?.serviceOptions, handleServiceOptionsChange]);

    const removeServiceOption = useCallback(
      (index) => {
        const serviceOptions = bookingData?.serviceOptions || [];
        const newOptions = serviceOptions.filter((_, i) => i !== index);
        handleServiceOptionsChange(newOptions);
      },
      [bookingData?.serviceOptions, handleServiceOptionsChange]
    );

    const updateServiceOption = useCallback(
      (index, value) => {
        const serviceOptions = bookingData?.serviceOptions || [];
        const newOptions = [...serviceOptions];
        newOptions[index] = value;
        handleServiceOptionsChange(newOptions);
      },
      [bookingData?.serviceOptions, handleServiceOptionsChange]
    );

    const addFeature = useCallback(() => {
      const features = bookingData?.features || [];
      const newFeatures = [
        ...features,
        {
          id: `feature_${Date.now()}`,
          emoji: "🔥",
          title: "New Feature",
          subtitle: "Description",
        },
      ];
      handleVariantFieldChange("features", newFeatures);
    }, [bookingData?.features, handleVariantFieldChange]);

    const removeFeature = useCallback(
      (index) => {
        const features = bookingData?.features || [];
        const newFeatures = features.filter((_, i) => i !== index);
        handleVariantFieldChange("features", newFeatures);
      },
      [bookingData?.features, handleVariantFieldChange]
    );

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        if (readOnly) return;
        setIsSubmitting(true);
        setTimeout(() => {
          alert("Form submitted successfully!");
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            service: "",
            message: "",
          });
          setIsSubmitting(false);
        }, 1000);
      },
      [readOnly]
    );

    // Extract data after all hooks are called
    const {
      headerText = "",
      formTitle = "",
      phone = "",
      logo,
      features = [],
      formFields = {},
      serviceOptions = [],
      colors = {},
    } = bookingData || {};

    // Don't render if no essential data is available
    if (!headerText && !formTitle) {
      return (
        <div className="p-8 text-center text-gray-500">
          Modern variant data not configured
        </div>
      );
    }

    // Use unified color system with fallbacks
    const primaryBgColor = colors.primaryBackground || "#1f2937";
    const secondaryBgColor = colors.secondaryBackground || "#FFFFFF";
    const primaryTextColor = colors.primaryText || "#FFFFFF";
    const secondaryTextColor = colors.secondaryText || "#374151";
    const buttonBgColor = colors.buttonBackground || "#F97316";
    const buttonTextColor = colors.buttonText || "#FFFFFF";
    const inputBgColor = colors.inputBackground || "#FFFFFF";
    const inputTextColor = colors.inputText || "#374151";
    const cardBgColor = colors.cardBackground || "#FFFFFF";
    const gradientStart =
      colors.modernGradientStart || colors.gradientStart || "#1e293b";
    const gradientEnd =
      colors.modernGradientEnd || colors.gradientEnd || "#334155";

    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div
          className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden relative"
          style={{
            background: `linear-gradient(to bottom right, ${gradientStart}, ${primaryBgColor})`,
          }}
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Side - Contact Info */}
            <div
              className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, ${gradientStart}, ${gradientEnd})`,
              }}
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                {/* Logo and Header */}
                <div className="flex flex-col items-center lg:items-start mb-8">
                  {logo && (
                    <div className="mb-6">
                      <img
                        src={typeof logo === "string" ? logo : logo.url}
                        alt="logo"
                        className="w-24 h-24"
                        style={{ filter: "invert(1)" }}
                      />
                    </div>
                  )}

                  <div className="text-center lg:text-left">
                    {!readOnly ? (
                      <input
                        type="text"
                        value={headerText}
                        onChange={(e) =>
                          handleVariantFieldChange("headerText", e.target.value)
                        }
                        className="text-4xl lg:text-5xl font-light mb-4 bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-blue-300 rounded-lg p-3 w-full placeholder-gray-300 outline-none leading-tight"
                        placeholder="Header Text"
                        style={{ color: primaryTextColor }}
                      />
                    ) : (
                      <h1
                        className="text-4xl lg:text-5xl font-light mb-4 leading-tight"
                        style={{ color: primaryTextColor }}
                      >
                        {headerText}
                      </h1>
                    )}

                    {!readOnly ? (
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value)
                        }
                        className="text-xl lg:text-2xl font-medium bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-blue-300 rounded-lg p-3 w-full placeholder-gray-400 outline-none"
                        placeholder="Phone Number"
                        style={{ color: primaryTextColor }}
                      />
                    ) : (
                      <p
                        className="text-xl lg:text-2xl font-medium"
                        style={{ color: primaryTextColor }}
                      >
                        {phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div
                      key={feature.id || index}
                      className="flex items-center space-x-4 relative"
                    >
                      {!readOnly && (
                        <button
                          onClick={() => removeFeature(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-10"
                        >
                          ×
                        </button>
                      )}
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl flex items-center justify-center shadow-lg">
                        {!readOnly ? (
                          <input
                            type="text"
                            value={feature.emoji}
                            onChange={(e) =>
                              handleFeatureChange(
                                index,
                                "emoji",
                                e.target.value
                              )
                            }
                            className="text-2xl bg-transparent text-center outline-none w-10"
                            placeholder="🔥"
                          />
                        ) : (
                          <span className="text-2xl">{feature.emoji}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        {!readOnly ? (
                          <>
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) =>
                                handleFeatureChange(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="font-semibold text-lg bg-transparent focus:bg-white/10 focus:ring-1 focus:ring-blue-300 rounded px-2 py-1 outline-none w-full"
                              placeholder="Feature Title"
                              style={{ color: primaryTextColor }}
                            />
                            <input
                              type="text"
                              value={feature.subtitle}
                              onChange={(e) =>
                                handleFeatureChange(
                                  index,
                                  "subtitle",
                                  e.target.value
                                )
                              }
                              className="bg-transparent focus:bg-white/10 focus:ring-1 focus:ring-orange-400 rounded px-2 py-1 outline-none w-full"
                              placeholder="Feature Subtitle"
                              style={{ color: primaryTextColor, opacity: 0.8 }}
                            />
                          </>
                        ) : (
                          <>
                            <h3
                              className="font-semibold text-lg"
                              style={{ color: primaryTextColor }}
                            >
                              {feature.title}
                            </h3>
                            <p
                              style={{ color: primaryTextColor, opacity: 0.8 }}
                            >
                              {feature.subtitle}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {!readOnly && (
                    <button
                      onClick={addFeature}
                      className="flex items-center space-x-4 text-sm bg-white/10 hover:bg-white/20 px-4 py-3 rounded-2xl text-white w-full transition-all duration-300 border border-white/20"
                      style={{ color: primaryTextColor }}
                    >
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-white/40">
                        <span className="text-2xl">+</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Add Feature</p>
                        <p className="opacity-80 text-xs">
                          Click to add a new feature
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div
              className="p-8 lg:p-12"
              style={{ backgroundColor: cardBgColor }}
            >
              {/* Form Title - variant specific */}
              {!readOnly ? (
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) =>
                    handleVariantFieldChange("formTitle", e.target.value)
                  }
                  className="text-3xl lg:text-4xl font-light mb-8 bg-transparent focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 rounded-lg p-3 w-full placeholder-gray-400 outline-none"
                  placeholder="Form Title"
                  style={{ color: secondaryTextColor }}
                />
              ) : (
                <h2
                  className="text-3xl lg:text-4xl font-light mb-8"
                  style={{ color: secondaryTextColor }}
                >
                  {formTitle}
                </h2>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: secondaryTextColor }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={
                        formFields.firstNamePlaceholder ||
                        "Enter your first name"
                      }
                      required
                      disabled={readOnly}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                      style={{
                        backgroundColor: inputBgColor,
                        color: inputTextColor,
                      }}
                    />
                    {!readOnly && (
                      <input
                        type="text"
                        value={formFields.firstNamePlaceholder || ""}
                        onChange={(e) =>
                          handleFormFieldChange(
                            "firstNamePlaceholder",
                            e.target.value
                          )
                        }
                        className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                        placeholder="Edit placeholder text"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: secondaryTextColor }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={
                        formFields.lastNamePlaceholder || "Enter your last name"
                      }
                      required
                      disabled={readOnly}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                      style={{
                        backgroundColor: inputBgColor,
                        color: inputTextColor,
                      }}
                    />
                    {!readOnly && (
                      <input
                        type="text"
                        value={formFields.lastNamePlaceholder || ""}
                        onChange={(e) =>
                          handleFormFieldChange(
                            "lastNamePlaceholder",
                            e.target.value
                          )
                        }
                        className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                        placeholder="Edit placeholder text"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: secondaryTextColor }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={
                      formFields.emailPlaceholder || "Enter your email address"
                    }
                    required
                    disabled={readOnly}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                    style={{
                      backgroundColor: inputBgColor,
                      color: inputTextColor,
                    }}
                  />
                  {!readOnly && (
                    <input
                      type="text"
                      value={formFields.emailPlaceholder || ""}
                      onChange={(e) =>
                        handleFormFieldChange(
                          "emailPlaceholder",
                          e.target.value
                        )
                      }
                      className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                      placeholder="Edit placeholder text"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: secondaryTextColor }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={
                      formFields.phonePlaceholder || "Enter your phone number"
                    }
                    required
                    disabled={readOnly}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                    style={{
                      backgroundColor: inputBgColor,
                      color: inputTextColor,
                    }}
                  />
                  {!readOnly && (
                    <input
                      type="text"
                      value={formFields.phonePlaceholder || ""}
                      onChange={(e) =>
                        handleFormFieldChange(
                          "phonePlaceholder",
                          e.target.value
                        )
                      }
                      className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                      placeholder="Edit placeholder text"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: secondaryTextColor }}
                  >
                    Service Needed
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    disabled={readOnly}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                    style={{
                      backgroundColor: inputBgColor,
                      color: inputTextColor,
                    }}
                  >
                    <option value="">
                      {formFields.servicePlaceholder || "Select a service"}
                    </option>
                    {serviceOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {!readOnly && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={formFields.servicePlaceholder || ""}
                        onChange={(e) =>
                          handleFormFieldChange(
                            "servicePlaceholder",
                            e.target.value
                          )
                        }
                        className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                        placeholder="Edit select placeholder"
                      />
                      <div
                        className="text-xs"
                        style={{ color: secondaryTextColor }}
                      >
                        Service Options:
                      </div>
                      {serviceOptions.map((option, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateServiceOption(index, e.target.value)
                            }
                            className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeServiceOption(index)}
                            className="text-red-500 text-xs px-2 py-1 hover:bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addServiceOption}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        + Add Service Option
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: secondaryTextColor }}
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      formFields.messagePlaceholder ||
                      "Tell us about your project..."
                    }
                    required
                    disabled={readOnly}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white resize-none placeholder-gray-500"
                    style={{
                      backgroundColor: inputBgColor,
                      color: inputTextColor,
                    }}
                  />
                  {!readOnly && (
                    <input
                      type="text"
                      value={formFields.messagePlaceholder || ""}
                      onChange={(e) =>
                        handleFormFieldChange(
                          "messagePlaceholder",
                          e.target.value
                        )
                      }
                      className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                      placeholder="Edit placeholder text"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={readOnly || isSubmitting}
                    className="w-full font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                    style={{
                      backgroundColor: buttonBgColor,
                      color: buttonTextColor,
                    }}
                  >
                    {isSubmitting
                      ? formFields.submittingText || "Sending..."
                      : formFields.submitButtonText || "Get Free Quote"}
                  </button>
                  {!readOnly && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formFields.submitButtonText || ""}
                        onChange={(e) =>
                          handleFormFieldChange(
                            "submitButtonText",
                            e.target.value
                          )
                        }
                        className="text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                        placeholder="Submit button text"
                      />
                      <input
                        type="text"
                        value={formFields.submittingText || ""}
                        onChange={(e) =>
                          handleFormFieldChange(
                            "submittingText",
                            e.target.value
                          )
                        }
                        className="text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                        placeholder="Submitting text"
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ModernBookingVariant.displayName = "ModernBookingVariant";
ModernBookingVariant.propTypes = {
  bookingData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  onBookingDataChange: PropTypes.func.isRequired,
  socialIconLocation: PropTypes.string,
};

/* ===============================================
   CREATIVE BOOKING VARIANT
   -----------------------------------------------
   Artistic design with images and creative layout
=============================================== */
const CreativeBookingVariant = memo(
  ({ bookingData, readOnly, onBookingDataChange, socialIconLocation }) => {
    // All hooks must be called at the top, before any conditional logic
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback(
      (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })),
      []
    );

    const handleFieldChange = useCallback(
      (field, value) => {
        onBookingDataChange({ ...bookingData, [field]: value });
      },
      [bookingData, onBookingDataChange]
    );

    const handleVariantFieldChange = useCallback(
      (field, value) => {
        const currentVariant = bookingData.variant || "creative";
        const updatedVariants = {
          ...bookingData.variants,
          [currentVariant]: {
            ...bookingData.variants?.[currentVariant],
            [field]: value,
          },
        };
        onBookingDataChange({
          ...bookingData,
          variants: updatedVariants,
          [field]: value, // Also update at root level for current display
        });
      },
      [bookingData, onBookingDataChange]
    );

    const handleBadgeChange = useCallback(
      (index, field, value) => {
        const badges = bookingData?.badges || [];
        const updatedBadges = [...badges];
        if (updatedBadges[index]) {
          updatedBadges[index] = { ...updatedBadges[index], [field]: value };
          handleVariantFieldChange("badges", updatedBadges);
        }
      },
      [bookingData?.badges, handleVariantFieldChange]
    );

    const handleGalleryImageChange = useCallback(
      (index, field, value) => {
        const galleryImages = bookingData?.galleryImages || [];
        const updatedImages = [...galleryImages];
        if (updatedImages[index]) {
          updatedImages[index] = { ...updatedImages[index], [field]: value };
          handleVariantFieldChange("galleryImages", updatedImages);
        }
      },
      [bookingData?.galleryImages, handleVariantFieldChange]
    );

    const handleFormFieldChange = useCallback(
      (field, value) => {
        const formFields = bookingData?.formFields || {};
        const updatedFormFields = { ...formFields, [field]: value };
        handleVariantFieldChange("formFields", updatedFormFields);
      },
      [bookingData?.formFields, handleVariantFieldChange]
    );

    const handleServiceOptionsChange = useCallback(
      (newOptions) => {
        handleVariantFieldChange("serviceOptions", newOptions);
      },
      [handleVariantFieldChange]
    );

    const addBadge = useCallback(() => {
      const badges = bookingData?.badges || [];
      const newBadges = [
        ...badges,
        {
          id: `badge_${Date.now()}`,
          icon: "🏆",
          text: "New Badge",
          subtitle: "Description",
        },
      ];
      handleVariantFieldChange("badges", newBadges);
    }, [bookingData?.badges, handleVariantFieldChange]);

    const removeBadge = useCallback(
      (index) => {
        const badges = bookingData?.badges || [];
        const newBadges = badges.filter((_, i) => i !== index);
        handleVariantFieldChange("badges", newBadges);
      },
      [bookingData?.badges, handleVariantFieldChange]
    );

    const addGalleryImage = useCallback(() => {
      const galleryImages = bookingData?.galleryImages || [];
      const newImages = [
        ...galleryImages,
        {
          id: `image_${Date.now()}`,
          url: "/assets/images/gallery/sample.jpg",
          alt: "Gallery Image",
        },
      ];
      handleVariantFieldChange("galleryImages", newImages);
    }, [bookingData?.galleryImages, handleVariantFieldChange]);

    const removeGalleryImage = useCallback(
      (index) => {
        const galleryImages = bookingData?.galleryImages || [];
        const newImages = galleryImages.filter((_, i) => i !== index);
        handleVariantFieldChange("galleryImages", newImages);
      },
      [bookingData?.galleryImages, handleVariantFieldChange]
    );

    const addServiceOption = useCallback(() => {
      const serviceOptions = bookingData?.serviceOptions || [];
      const newOptions = [...serviceOptions, "New Service"];
      handleServiceOptionsChange(newOptions);
    }, [bookingData?.serviceOptions, handleServiceOptionsChange]);

    const removeServiceOption = useCallback(
      (index) => {
        const serviceOptions = bookingData?.serviceOptions || [];
        const newOptions = serviceOptions.filter((_, i) => i !== index);
        handleServiceOptionsChange(newOptions);
      },
      [bookingData?.serviceOptions, handleServiceOptionsChange]
    );

    const updateServiceOption = useCallback(
      (index, value) => {
        const serviceOptions = bookingData?.serviceOptions || [];
        const newOptions = [...serviceOptions];
        newOptions[index] = value;
        handleServiceOptionsChange(newOptions);
      },
      [bookingData?.serviceOptions, handleServiceOptionsChange]
    );

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        if (readOnly) return;
        setIsSubmitting(true);
        setTimeout(() => {
          alert("Form submitted successfully!");
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            service: "",
            message: "",
          });
          setIsSubmitting(false);
        }, 1000);
      },
      [readOnly]
    );

    // Extract data after all hooks are called
    const {
      headerText = "",
      formTitle = "",
      phone = "",
      logo,
      badges = [],
      galleryImages = [],
      formFields = {},
      serviceOptions = [],
      colors = {},
    } = bookingData || {};

    // Don't render if no essential data is available
    if (!headerText && !formTitle) {
      return (
        <div className="p-8 text-center text-gray-500">
          Creative variant data not configured
        </div>
      );
    }

    // Use unified color system
    const primaryBgColor = colors.primaryBackground || "#1f2937";
    const secondaryBgColor = colors.secondaryBackground || "#FFFFFF";
    const primaryTextColor = colors.primaryText || "#FFFFFF";
    const secondaryTextColor = colors.secondaryText || "#374151";
    const buttonBgColor = colors.buttonBackground || "#F97316";
    const buttonTextColor = colors.buttonText || "#FFFFFF";
    const inputBgColor = colors.inputBackground || "#FFFFFF";
    const inputTextColor = colors.inputText || "#374151";
    const cardBgColor = colors.cardBackground || "#FFFFFF";
    const gradientStart =
      colors.creativeGradientStart || colors.gradientStart || "#4c1d95";
    const gradientEnd =
      colors.creativeGradientEnd || colors.gradientEnd || "#be185d";
    const badgeGradientStart = colors.creativeBadgeGradientStart || "#fbbf24";
    const badgeGradientEnd = colors.creativeBadgeGradientEnd || "#f59e0b";

    // Use badges directly from data
    const displayBadges = badges;

    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div
          className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 rounded-3xl shadow-2xl overflow-hidden relative"
          style={{
            background: `linear-gradient(to bottom right, ${gradientStart}, ${gradientEnd})`,
          }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-32 h-32 bg-white rounded-full absolute top-10 left-10 animate-pulse"></div>
              <div className="w-24 h-24 bg-white rounded-full absolute top-32 right-20 animate-pulse delay-300"></div>
              <div className="w-20 h-20 bg-white rounded-full absolute bottom-20 left-32 animate-pulse delay-700"></div>
            </div>
          </div>

          <div className="relative z-10">
            {/* Header Section */}
            <div className="text-center py-12 px-8">
              <div className="flex flex-col items-center mb-8">
                {logo && (
                  <div className="mb-6">
                    <img
                      src={typeof logo === "string" ? logo : logo.url}
                      alt="logo"
                      className="w-28 h-28"
                      style={{ filter: "invert(1)" }}
                    />
                  </div>
                )}

                <div className="text-center max-w-2xl">
                  {!readOnly ? (
                    <input
                      type="text"
                      value={headerText}
                      onChange={(e) =>
                        handleVariantFieldChange("headerText", e.target.value)
                      }
                      className="text-5xl md:text-6xl font-bold mb-4 bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-yellow-400 rounded-lg p-3 w-full placeholder-gray-300 outline-none text-center bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent"
                      placeholder="Header Text"
                    />
                  ) : (
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
                      {headerText}
                    </h1>
                  )}

                  {!readOnly ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) =>
                        handleFieldChange("phone", e.target.value)
                      }
                      className="text-2xl md:text-3xl font-bold mb-4 bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-white rounded-lg p-3 w-full placeholder-gray-400 outline-none text-center"
                      placeholder="Phone Number"
                      style={{ color: primaryTextColor }}
                    />
                  ) : (
                    <p
                      className="text-2xl md:text-3xl font-bold mb-4"
                      style={{ color: primaryTextColor }}
                    >
                      {phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content Grid - Simplified to 2 columns */}
            <div className="grid lg:grid-cols-2 gap-8 px-8 pb-8">
              {/* Left Column - Combined Content */}
              <div className="lg:col-span-1">
                {/* Why Choose Us Section */}
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Why Choose Us
                </h3>
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {displayBadges.map((badge, index) => (
                    <div
                      key={badge.id || index}
                      className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 relative hover:transform hover:scale-105 transition-all duration-300"
                    >
                      {!readOnly && (
                        <button
                          onClick={() => removeBadge(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-10"
                        >
                          ×
                        </button>
                      )}
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{
                            background: `linear-gradient(to bottom right, ${badgeGradientStart}, ${badgeGradientEnd})`,
                          }}
                        >
                          {!readOnly ? (
                            <input
                              type="text"
                              value={badge.icon}
                              onChange={(e) =>
                                handleBadgeChange(index, "icon", e.target.value)
                              }
                              className="text-3xl bg-transparent text-center outline-none w-12"
                              placeholder="🏆"
                            />
                          ) : (
                            <span className="text-3xl">{badge.icon}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          {!readOnly ? (
                            <>
                              <input
                                type="text"
                                value={badge.text}
                                onChange={(e) =>
                                  handleBadgeChange(
                                    index,
                                    "text",
                                    e.target.value
                                  )
                                }
                                className="font-bold text-lg text-white bg-transparent focus:bg-white/10 focus:ring-1 focus:ring-yellow-400 rounded px-2 py-1 w-full outline-none"
                                placeholder="Badge Text"
                              />
                              <input
                                type="text"
                                value={badge.subtitle}
                                onChange={(e) =>
                                  handleBadgeChange(
                                    index,
                                    "subtitle",
                                    e.target.value
                                  )
                                }
                                className="bg-transparent focus:bg-white/10 focus:ring-1 focus:ring-orange-400 rounded px-2 py-1 outline-none w-full text-orange-200"
                                placeholder="Subtitle"
                              />
                            </>
                          ) : (
                            <>
                              <h3 className="font-bold text-lg text-white">
                                {badge.text}
                              </h3>
                              <p className="text-orange-200">
                                {badge.subtitle}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!readOnly && (
                    <button
                      onClick={addBadge}
                      className="bg-gradient-to-r from-gray-200/20 to-gray-100/10 border-2 border-dashed border-white/30 hover:border-white/50 rounded-2xl p-6 text-white hover:text-yellow-300 transition-all duration-300 flex items-center justify-center space-x-4"
                    >
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl">+</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg">Add Badge</p>
                        <p className="text-sm opacity-80">Click to add new</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Our Work Gallery Section */}
                {(galleryImages.length > 0 || !readOnly) && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">
                      Our Work
                    </h3>
                    <div className="space-y-4">
                      {galleryImages.map((image, index) => (
                        <div key={image.id || index} className="relative group">
                          {!readOnly && (
                            <button
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          )}
                          <img
                            src={image.url}
                            alt={image.alt || "Gallery"}
                            className="w-full h-32 object-cover rounded-xl shadow-lg"
                          />
                          {!readOnly && (
                            <div className="mt-2 space-y-1">
                              <input
                                type="text"
                                value={image.url}
                                onChange={(e) =>
                                  handleGalleryImageChange(
                                    index,
                                    "url",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs bg-white/10 text-white px-2 py-1 rounded border outline-none"
                                placeholder="Image URL"
                              />
                              <input
                                type="text"
                                value={image.alt || ""}
                                onChange={(e) =>
                                  handleGalleryImageChange(
                                    index,
                                    "alt",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs bg-white/10 text-white px-2 py-1 rounded border outline-none"
                                placeholder="Alt text"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      {!readOnly && (
                        <button
                          onClick={addGalleryImage}
                          className="w-full h-32 border-2 border-dashed border-white/30 hover:border-white/50 rounded-xl flex items-center justify-center text-white hover:text-yellow-300 transition-colors"
                        >
                          <div className="text-center">
                            <span className="text-4xl block">+</span>
                            <span className="text-sm">Add Image</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Form */}
              <div className="lg:col-span-1">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                  {!readOnly ? (
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) =>
                        handleVariantFieldChange("formTitle", e.target.value)
                      }
                      className="text-3xl font-bold text-gray-800 mb-6 bg-transparent focus:bg-gray-100 focus:ring-2 focus:ring-purple-500 rounded-lg p-3 w-full placeholder-gray-400 outline-none text-center"
                      placeholder="Form Title"
                    />
                  ) : (
                    <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                      {formTitle}
                    </h3>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder={
                            formFields.firstNamePlaceholder || "First Name"
                          }
                          required
                          disabled={readOnly}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/90 placeholder-gray-500"
                        />
                        {!readOnly && (
                          <input
                            type="text"
                            value={formFields.firstNamePlaceholder || ""}
                            onChange={(e) =>
                              handleFormFieldChange(
                                "firstNamePlaceholder",
                                e.target.value
                              )
                            }
                            className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                            placeholder="Edit placeholder"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder={
                            formFields.lastNamePlaceholder || "Last Name"
                          }
                          required
                          disabled={readOnly}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/90 placeholder-gray-500"
                        />
                        {!readOnly && (
                          <input
                            type="text"
                            value={formFields.lastNamePlaceholder || ""}
                            onChange={(e) =>
                              handleFormFieldChange(
                                "lastNamePlaceholder",
                                e.target.value
                              )
                            }
                            className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                            placeholder="Edit placeholder"
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={
                          formFields.emailPlaceholder ||
                          "Enter your email address"
                        }
                        required
                        disabled={readOnly}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/90 placeholder-gray-500"
                      />
                      {!readOnly && (
                        <input
                          type="text"
                          value={formFields.emailPlaceholder || ""}
                          onChange={(e) =>
                            handleFormFieldChange(
                              "emailPlaceholder",
                              e.target.value
                            )
                          }
                          className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                          placeholder="Edit placeholder"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={
                          formFields.phonePlaceholder ||
                          "Enter your phone number"
                        }
                        required
                        disabled={readOnly}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/90 placeholder-gray-500"
                      />
                      {!readOnly && (
                        <input
                          type="text"
                          value={formFields.phonePlaceholder || ""}
                          onChange={(e) =>
                            handleFormFieldChange(
                              "phonePlaceholder",
                              e.target.value
                            )
                          }
                          className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                          placeholder="Edit placeholder text"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                        disabled={readOnly}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/90"
                      >
                        <option value="">
                          {formFields.servicePlaceholder || "🏠 Select Service"}
                        </option>
                        {serviceOptions.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {!readOnly && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formFields.servicePlaceholder || ""}
                            onChange={(e) =>
                              handleFormFieldChange(
                                "servicePlaceholder",
                                e.target.value
                              )
                            }
                            className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                            placeholder="Select placeholder"
                          />
                          <div className="text-xs text-gray-600">
                            Service Options:
                          </div>
                          {serviceOptions.map((option, index) => (
                            <div
                              key={index}
                              className="flex gap-2 items-center"
                            >
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateServiceOption(index, e.target.value)
                                }
                                className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removeServiceOption(index)}
                                className="text-red-500 text-xs px-2 py-1 hover:bg-red-50 rounded"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addServiceOption}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            + Add Service Option
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={
                          formFields.messagePlaceholder ||
                          "Tell us about your project..."
                        }
                        required
                        disabled={readOnly}
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/90 resize-none placeholder-gray-500"
                      />
                      {!readOnly && (
                        <input
                          type="text"
                          value={formFields.messagePlaceholder || ""}
                          onChange={(e) =>
                            handleFormFieldChange(
                              "messagePlaceholder",
                              e.target.value
                            )
                          }
                          className="w-full text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                          placeholder="Edit placeholder text"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <button
                        type="submit"
                        disabled={readOnly || isSubmitting}
                        className="w-full font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                        style={{
                          backgroundColor: buttonBgColor,
                          color: buttonTextColor,
                        }}
                      >
                        {isSubmitting
                          ? formFields.submittingText || "🚀 Sending..."
                          : formFields.submitButtonText || "🎯 Get Free Quote"}
                      </button>
                      {!readOnly && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={formFields.submitButtonText || ""}
                            onChange={(e) =>
                              handleFormFieldChange(
                                "submitButtonText",
                                e.target.value
                              )
                            }
                            className="text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                            placeholder="Submit button text"
                          />
                          <input
                            type="text"
                            value={formFields.submittingText || ""}
                            onChange={(e) =>
                              handleFormFieldChange(
                                "submittingText",
                                e.target.value
                              )
                            }
                            className="text-xs bg-gray-100 px-2 py-1 rounded border outline-none"
                            placeholder="Submitting text"
                          />
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CreativeBookingVariant.displayName = "CreativeBookingVariant";
CreativeBookingVariant.propTypes = {
  bookingData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  onBookingDataChange: PropTypes.func.isRequired,
  socialIconLocation: PropTypes.string,
};

// =============================================
// Tab Control Components
// =============================================

const BookingImagesControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleLogoFileChange = (file) => {
    if (!file) return;
    const currentLogoState = currentData.logo;
    if (currentLogoState?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(currentLogoState.url);
    }
    const fileURL = URL.createObjectURL(file);
    onControlsChange({
      ...currentData,
      logo: {
        file,
        url: fileURL,
        name: file.name,
        originalUrl: currentLogoState?.originalUrl || "/assets/images/logo.svg",
      },
    });
  };

  const handleLogoUrlChange = (urlValue) => {
    const currentLogoState = currentData.logo;
    if (currentLogoState?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(currentLogoState.url);
    }
    onControlsChange({
      ...currentData,
      logo: {
        file: null,
        url: urlValue,
        name: urlValue.split("/").pop(),
        originalUrl: urlValue,
      },
    });
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updatedSocialLinks = [...(currentData.socialLinks || [])];
    updatedSocialLinks[index] = {
      ...updatedSocialLinks[index],
      [field]: value,
    };
    onControlsChange({ ...currentData, socialLinks: updatedSocialLinks });
  };

  const addSocialLink = () => {
    onControlsChange({
      ...currentData,
      socialLinks: [
        ...(currentData.socialLinks || []),
        { platform: "twitter", url: "" },
      ],
    });
  };

  const removeSocialLink = (index) => {
    onControlsChange({
      ...currentData,
      socialLinks: (currentData.socialLinks || []).filter(
        (_, i) => i !== index
      ),
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Logo Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleLogoFileChange(e.target.files?.[0])}
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        {getLogoDisplayUrl(currentData.logo) && (
          <img
            src={getLogoDisplayUrl(currentData.logo)}
            alt="Logo Preview"
            className="mt-3 h-24 rounded shadow bg-gray-100 p-2"
          />
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold">Social Media Links:</h3>
        {(currentData.socialLinks || []).map((link, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <select
              value={link.platform}
              onChange={(e) =>
                handleSocialLinkChange(index, "platform", e.target.value)
              }
              className="bg-white px-3 py-2 rounded text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="twitter">Twitter/X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
            <input
              type="url"
              placeholder="Social Media URL"
              value={link.url}
              onChange={(e) =>
                handleSocialLinkChange(index, "url", e.target.value)
              }
              className="flex-1 bg-white px-3 py-2 rounded text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeSocialLink(index)}
              className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-white text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSocialLink}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white text-sm"
        >
          + Add Social Link
        </button>
      </div>
    </div>
  );
};

BookingImagesControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
};

const BookingColorControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleColorUpdate = (fieldName, colorValue) => {
    const updatedColors = { ...currentData.colors, [fieldName]: colorValue };
    onControlsChange({ ...currentData, colors: updatedColors });
  };

  const currentColors = currentData.colors || {};
  const currentVariant = currentData.variant || "nail";

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Colors - Always Visible */}
        <ThemeColorPicker
          label="Primary Background:"
          currentColorValue={currentColors.primaryBackground || "#1f2937"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("primaryBackground", value)
          }
          fieldName="primaryBackground"
        />
        <ThemeColorPicker
          label="Secondary Background:"
          currentColorValue={currentColors.secondaryBackground || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("secondaryBackground", value)
          }
          fieldName="secondaryBackground"
        />
        <ThemeColorPicker
          label="Primary Text Color:"
          currentColorValue={currentColors.primaryText || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("primaryText", value)
          }
          fieldName="primaryText"
        />
        <ThemeColorPicker
          label="Secondary Text Color:"
          currentColorValue={currentColors.secondaryText || "#374151"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("secondaryText", value)
          }
          fieldName="secondaryText"
        />
        <ThemeColorPicker
          label="Accent Text Color:"
          currentColorValue={currentColors.accentText || "#F97316"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("accentText", value)
          }
          fieldName="accentText"
        />
        <ThemeColorPicker
          label="Button Background:"
          currentColorValue={currentColors.buttonBackground || "#F97316"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("buttonBackground", value)
          }
          fieldName="buttonBackground"
        />
        <ThemeColorPicker
          label="Button Text Color:"
          currentColorValue={currentColors.buttonText || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("buttonText", value)
          }
          fieldName="buttonText"
        />
        <ThemeColorPicker
          label="Input Background:"
          currentColorValue={currentColors.inputBackground || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("inputBackground", value)
          }
          fieldName="inputBackground"
        />
        <ThemeColorPicker
          label="Input Text Color:"
          currentColorValue={currentColors.inputText || "#374151"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("inputText", value)
          }
          fieldName="inputText"
        />
        <ThemeColorPicker
          label="Card Background:"
          currentColorValue={currentColors.cardBackground || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("cardBackground", value)
          }
          fieldName="cardBackground"
        />

        {/* Base Gradient Colors - Used by all variants */}
        <ThemeColorPicker
          label="Gradient Start:"
          currentColorValue={currentColors.gradientStart || "#1f2937"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("gradientStart", value)
          }
          fieldName="gradientStart"
        />
        <ThemeColorPicker
          label="Gradient End:"
          currentColorValue={currentColors.gradientEnd || "#374151"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorUpdate("gradientEnd", value)
          }
          fieldName="gradientEnd"
        />
      </div>

      {/* Variant-Specific Colors */}
      {currentVariant === "modern" && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Modern Variant Colors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeColorPicker
              label="Modern Gradient Start:"
              currentColorValue={currentColors.modernGradientStart || "#1e293b"}
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("modernGradientStart", value)
              }
              fieldName="modernGradientStart"
            />
            <ThemeColorPicker
              label="Modern Gradient End:"
              currentColorValue={currentColors.modernGradientEnd || "#334155"}
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("modernGradientEnd", value)
              }
              fieldName="modernGradientEnd"
            />
            <ThemeColorPicker
              label="Modern Accent Start:"
              currentColorValue={currentColors.modernAccentStart || "#3b82f6"}
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("modernAccentStart", value)
              }
              fieldName="modernAccentStart"
            />
            <ThemeColorPicker
              label="Modern Accent End:"
              currentColorValue={currentColors.modernAccentEnd || "#8b5cf6"}
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("modernAccentEnd", value)
              }
              fieldName="modernAccentEnd"
            />
          </div>
        </div>
      )}

      {currentVariant === "creative" && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Creative Variant Colors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeColorPicker
              label="Creative Gradient Start:"
              currentColorValue={
                currentColors.creativeGradientStart || "#4c1d95"
              }
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("creativeGradientStart", value)
              }
              fieldName="creativeGradientStart"
            />
            <ThemeColorPicker
              label="Creative Gradient End:"
              currentColorValue={currentColors.creativeGradientEnd || "#be185d"}
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("creativeGradientEnd", value)
              }
              fieldName="creativeGradientEnd"
            />
            <ThemeColorPicker
              label="Creative Header Gradient:"
              currentColorValue={
                currentColors.creativeHeaderGradient || "#fbbf24"
              }
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("creativeHeaderGradient", value)
              }
              fieldName="creativeHeaderGradient"
            />
            <ThemeColorPicker
              label="Creative Sub Header Color:"
              currentColorValue={
                currentColors.creativeSubHeaderColor || "#fed7aa"
              }
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("creativeSubHeaderColor", value)
              }
              fieldName="creativeSubHeaderColor"
            />
            <ThemeColorPicker
              label="Creative Badge Gradient Start:"
              currentColorValue={
                currentColors.creativeBadgeGradientStart || "#fbbf24"
              }
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("creativeBadgeGradientStart", value)
              }
              fieldName="creativeBadgeGradientStart"
            />
            <ThemeColorPicker
              label="Creative Badge Gradient End:"
              currentColorValue={
                currentColors.creativeBadgeGradientEnd || "#f59e0b"
              }
              themeColors={themeColors}
              onColorChange={(fieldName, value) =>
                handleColorUpdate("creativeBadgeGradientEnd", value)
              }
              fieldName="creativeBadgeGradientEnd"
            />
          </div>
        </div>
      )}

      {/* Status Colors - Less frequently used, so at the bottom */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Status Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThemeColorPicker
            label="Success Color:"
            currentColorValue={currentColors.successColor || "#10B981"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) =>
              handleColorUpdate("successColor", value)
            }
            fieldName="successColor"
          />
          <ThemeColorPicker
            label="Error Color:"
            currentColorValue={currentColors.errorColor || "#EF4444"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) =>
              handleColorUpdate("errorColor", value)
            }
            fieldName="errorColor"
          />
          <ThemeColorPicker
            label="Warning Color:"
            currentColorValue={currentColors.warningColor || "#F59E0B"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) =>
              handleColorUpdate("warningColor", value)
            }
            fieldName="warningColor"
          />
          <ThemeColorPicker
            label="Info Color:"
            currentColorValue={currentColors.infoColor || "#3B82F6"}
            themeColors={themeColors}
            onColorChange={(fieldName, value) =>
              handleColorUpdate("infoColor", value)
            }
            fieldName="infoColor"
          />
        </div>
      </div>
    </div>
  );
};

BookingColorControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
};

const BookingStylingControls = ({ currentData, onControlsChange }) => {
  const handleVariantChange = (newVariant) => {
    onControlsChange({
      ...currentData,
      variant: newVariant,
    });
  };

  const currentVariant = currentData.variant || "nail";

  const variantOptions = [
    {
      value: "nail",
      label: "Nail Style",
      description:
        "Original design with nail animations and wood plank styling",
    },
    {
      value: "modern",
      label: "Modern",
      description:
        "Clean, minimalist design with gradients and split-screen layout",
    },
    {
      value: "creative",
      label: "Creative",
      description:
        "Image-rich design with playful elements and three-column layout",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Variant Selector */}
      <div className="p-4 bg-gray-800 text-white rounded-lg">
        <div className="pb-6 border-b border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Design Variant
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {variantOptions.map((option) => (
              <div key={option.value} className="relative">
                <label className="flex flex-col items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="variant"
                    value={option.value}
                    checked={currentVariant === option.value}
                    onChange={() => handleVariantChange(option.value)}
                    className="sr-only"
                  />

                  {/* Visual Preview with Selection Ring */}
                  <div
                    className={`relative mb-2 p-1 rounded-lg transition-all duration-200 ${
                      currentVariant === option.value
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800"
                        : "ring-1 ring-gray-600 group-hover:ring-gray-500"
                    }`}
                  >
                    <div className="w-16 h-12 bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                      {option.value === "nail" && (
                        <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20">
                            <div className="h-1 bg-amber-800 mb-2"></div>
                            <div className="h-1 bg-amber-700 mb-2"></div>
                            <div className="h-1 bg-amber-800"></div>
                          </div>
                          <div className="absolute top-2 left-2 w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="absolute top-2 right-2 w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="absolute bottom-2 left-2 w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="absolute bottom-2 right-2 w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            <div className="w-6 h-6 bg-blue-400 rounded mb-1"></div>
                            <div className="w-8 h-1 bg-gray-400 rounded"></div>
                          </div>
                        </div>
                      )}
                      {option.value === "modern" && (
                        <div className="w-full h-full bg-gradient-to-r from-slate-50 to-gray-100 relative">
                          <div className="flex h-full">
                            <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                              <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            </div>
                            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                              <div className="w-6 h-1 bg-gray-400 rounded"></div>
                            </div>
                          </div>
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 to-gray-300"></div>
                        </div>
                      )}
                      {option.value === "creative" && (
                        <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
                          <div className="flex h-full">
                            <div className="flex-1 flex items-center justify-center">
                              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                              <div className="w-2 h-6 bg-pink-400 rounded"></div>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                              <div className="w-3 h-2 bg-orange-400 rounded"></div>
                            </div>
                          </div>
                          <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-400 rounded-full"></div>
                          <div className="absolute bottom-1 left-1 w-1 h-1 bg-green-400 rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Selected indicator */}
                    {currentVariant === option.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Variant Name */}
                  <div
                    className={`text-center transition-colors duration-200 ${
                      currentVariant === option.value
                        ? "text-blue-400"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-24 leading-tight">
                      {option.description}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Controls using PanelStylingController */}
      <PanelStylingController
        currentData={currentData}
        onControlsChange={onControlsChange}
        blockType="BookingBlock"
        controlType="animations"
      />
    </div>
  );
};

BookingStylingControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

// Add GeneralPanel component after the BookingImagesControls and before BookingColorControls
const BookingGeneralControls = ({ currentData, onControlsChange }) => {
  const socialIconLocation = currentData?.socialIconLocation || "above";

  return (
    <div className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Social Media Icon Location:
        </label>
        <select
          value={socialIconLocation}
          onChange={(e) =>
            onControlsChange({
              ...currentData,
              socialIconLocation: e.target.value,
            })
          }
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500"
        >
          <option value="above">Above Form</option>
          <option value="below">Below Form</option>
          <option value="hidden">Hidden</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Controls where the social media icons appear in the BookingBlock.
        </p>
      </div>
    </div>
  );
};

BookingGeneralControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

/* ===============================================
   MAIN EXPORT: BookingBlock
   -----------------------------------------------
   Main component that manages state and renders preview
=============================================== */
export default function BookingBlock({
  readOnly = false,
  bookingData = {},
  onConfigChange = () => {},
  themeColors,
  variant = "nail",
}) {
  const [localData, setLocalData] = useState(() =>
    deriveInitialLocalData(bookingData)
  );
  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (bookingData) {
      setLocalData((prevLocal) => {
        const newLogo = initializeLogoState(
          bookingData.logo,
          prevLocal.logo?.url
        );
        if (
          prevLocal.logo?.file &&
          prevLocal.logo.url?.startsWith("blob:") &&
          prevLocal.logo.url !== newLogo.url
        ) {
          URL.revokeObjectURL(prevLocal.logo.url);
        }

        return {
          ...prevLocal,
          ...bookingData,
          logo: newLogo,
          variant: bookingData.variant || prevLocal.variant || "nail",
          colors: bookingData.colors || prevLocal.colors || {},
          socialLinks: bookingData.socialLinks || prevLocal.socialLinks || [],
          phone: bookingData.phone || prevLocal.phone || "",
          headerText: bookingData.headerText || prevLocal.headerText || "",
          showNailAnimation:
            bookingData.showNailAnimation !== undefined
              ? bookingData.showNailAnimation
              : prevLocal.showNailAnimation !== undefined
                ? prevLocal.showNailAnimation
                : true,
          styling: {
            ...prevLocal.styling,
            ...bookingData.styling,
            showNailAnimation:
              bookingData.showNailAnimation !== undefined
                ? bookingData.showNailAnimation
                : prevLocal.showNailAnimation !== undefined
                  ? prevLocal.showNailAnimation
                  : true,
          },
        };
      });
    }
  }, [bookingData]);

  useEffect(() => {
    return () => {
      if (localData.logo?.file && localData.logo.url?.startsWith("blob:")) {
        URL.revokeObjectURL(localData.logo.url);
      }
    };
  }, [localData.logo]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        const dataToSave = {
          ...localData,
          logo: localData.logo?.file
            ? { ...localData.logo }
            : { url: localData.logo?.originalUrl || localData.logo?.url },
          variant: localData.variant || "nail",
          showNailAnimation: localData.showNailAnimation,
        };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = useCallback(
    (updatedFieldsOrFunction) => {
      setLocalData((prevState) => {
        const newState =
          typeof updatedFieldsOrFunction === "function"
            ? updatedFieldsOrFunction(prevState)
            : { ...prevState, ...updatedFieldsOrFunction };

        if (!readOnly && onConfigChange) {
          const liveDataToPropagate = {
            ...newState,
            logo: newState.logo?.file
              ? { ...newState.logo }
              : { url: newState.logo?.originalUrl || newState.logo?.url },
            variant: newState.variant || "nail",
          };
          onConfigChange(liveDataToPropagate);
        }

        return newState;
      });
    },
    [readOnly, onConfigChange]
  );

  // Render different variants based on the variant prop
  const renderVariant = () => {
    // Use bookingData.variant if available, otherwise fall back to the variant prop
    const activeVariant = bookingData?.variant || variant;

    switch (activeVariant) {
      case "modern":
        return (
          <ModernBookingVariant
            bookingData={localData}
            readOnly={readOnly}
            onBookingDataChange={handleLocalDataChange}
            socialIconLocation={bookingData.socialIconLocation}
          />
        );
      case "creative":
        return (
          <CreativeBookingVariant
            bookingData={localData}
            readOnly={readOnly}
            onBookingDataChange={handleLocalDataChange}
            socialIconLocation={bookingData.socialIconLocation}
          />
        );
      case "nail":
      default:
        return (
          <BookingPreview
            bookingData={localData}
            readOnly={readOnly}
            onBookingDataChange={handleLocalDataChange}
            socialIconLocation={bookingData.socialIconLocation}
          />
        );
    }
  };

  return renderVariant();
}

BookingBlock.propTypes = {
  readOnly: PropTypes.bool,
  bookingData: PropTypes.object,
  onConfigChange: PropTypes.func,
  themeColors: PropTypes.object,
  variant: PropTypes.oneOf(["nail", "modern", "creative"]),
};

// Tab configuration for TopStickyEditPanel
BookingBlock.tabsConfig = (
  currentData,
  onControlsChange,
  themeColors,
  sitePalette
) => {
  const tabs = {};

  // General Tab
  tabs.general = (props) => (
    <BookingGeneralControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
    />
  );

  // Images Tab
  tabs.images = (props) => (
    <BookingImagesControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  );

  // Colors Tab
  tabs.colors = (props) => (
    <BookingColorControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  );

  // Styling Tab
  tabs.styling = (props) => (
    <BookingStylingControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
    />
  );

  return tabs;
};
