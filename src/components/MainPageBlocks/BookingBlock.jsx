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
import PanelFontController from "../common/PanelFontController";
import PanelStylingController from "../common/PanelStylingController";
import { motion, AnimatePresence } from "framer-motion";

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
      console.log(
        "Book Now button clicked - isMobile:",
        isMobile,
        "isAnimating:",
        isAnimating,
        "readOnly:",
        readOnly,
        "isFormVisible:",
        isFormVisible
      );

      if (!isMobile || isAnimating || readOnly) return;

      // Check if the form container ref exists
      if (!formContainerRef.current) {
        console.warn(
          "Form container ref not found, cannot toggle form visibility"
        );
        return;
      }

      console.log("Starting form toggle animation");
      setIsAnimating(true);

      if (!isFormVisible) {
        // Show form
        gsap.set(formContainerRef.current, {
          visibility: "visible",
          pointerEvents: "auto",
        });
        gsap.to(formContainerRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            console.log("Form show animation complete");
            setIsAnimating(false);
            setIsFormVisible(true);
          },
        });
      } else {
        // Hide form
        gsap.to(formContainerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (formContainerRef.current) {
              gsap.set(formContainerRef.current, {
                visibility: "hidden",
                pointerEvents: "none",
              });
            }
            console.log("Form hide animation complete");
            setIsAnimating(false);
            setIsFormVisible(false);
          },
        });
      }
    }, [isFormVisible, isMobile, isAnimating, readOnly]);

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
            <div className="relative py-3 px-4 flex flex-col items-center z-30">
              <div className="flex items-center justify-center w-full">
                <img
                  src={getLogoDisplayUrl(logo)}
                  alt="logo"
                  className="w-20 h-20 mr-4 drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)]"
                  style={{ filter: "invert(1)" }}
                />
                <div
                  className="text-left drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                  style={{ color: currentHeaderTextColor }}
                >
                  {!readOnly ? (
                    <input
                      type="text"
                      value={headerText}
                      onChange={(e) =>
                        handleVariantFieldChange("headerText", e.target.value)
                      }
                      className="text-2xl md:text-3xl font-bold bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded p-1 w-full placeholder-gray-300"
                      placeholder="Header Text"
                      style={{ color: currentHeaderTextColor }}
                    />
                  ) : (
                    <h2
                      className="text-2xl md:text-3xl font-bold booking-header-text"
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
                      className="font-bold md:text-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded p-1 w-full mt-1 placeholder-gray-300"
                      placeholder="Phone Number"
                      style={{ color: currentHeaderTextColor }}
                    />
                  ) : (
                    <p
                      className="font-bold md:text-lg mt-1 booking-subheader-text"
                    >
                      {phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Icons - always show in edit mode, or show based on config in readOnly mode */}
              {socialLinks &&
                socialLinks.length > 0 &&
                (!readOnly || socialIconLocation === "above") && (
                  <div className="flex justify-center space-x-12 py-4">
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
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}

              {isMobile && (
                <button
                  ref={toggleButtonRef}
                  onClick={toggleFormVisibility}
                  disabled={isAnimating}
                  className={`mt-2 px-6 py-2 rounded-md shadow-lg relative transition-all duration-300 ${isAnimating ? "opacity-50" : "opacity-100"} border-2 border-black font-bold`}
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
                    <span className="relative z-40 text-md font-semibold booking-button-text">
                      BOOK NOW
                    </span>
                  )}
                </button>
              )}
            </div>

            <div
              ref={formContainerRef}
              className="w-full pb-2"
              style={{
                // Let GSAP handle all visibility/animation, avoid CSS conflicts
                opacity: readOnly ? 1 : isMobile && !isFormVisible ? 0 : 1,
                transform: readOnly
                  ? "scale(1)"
                  : isMobile && !isFormVisible
                    ? "scale(0.95)"
                    : "scale(1)",
                visibility: readOnly
                  ? "visible"
                  : isMobile && !isFormVisible
                    ? "hidden"
                    : "visible",
                pointerEvents: readOnly
                  ? "auto"
                  : isMobile && !isFormVisible
                    ? "none"
                    : "auto",
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
                      className="text-lg md:text-xl font-semibold text-center booking-form-title-text"
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
                      className="relative px-8 py-2 text-lg font-semibold rounded-md md:w-auto shadow-md booking-button-text"
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
                    <h1
                      className="text-4xl lg:text-5xl font-light mb-4 leading-tight booking-header-text"
                    >
                      {headerText}
                    </h1>
                    <p
                      className="text-xl lg:text-2xl font-medium booking-subheader-text"
                    >
                      {phone}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div
                      key={feature.id || index}
                      className="flex items-center space-x-4 relative"
                    >
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">{feature.emoji}</span>
                      </div>
                      <div className="flex-1">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div
              className="p-8 lg:p-12"
              style={{ backgroundColor: cardBgColor }}
            >
              {/* Form Title - variant specific */}
              <h2
                className="text-3xl lg:text-4xl font-light mb-8 booking-form-title-text"
              >
                {formTitle}
              </h2>

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
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={readOnly || isSubmitting}
                    className="w-full font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg booking-button-text"
                    style={{
                      backgroundColor: buttonBgColor,
                      color: buttonTextColor,
                    }}
                  >
                    {isSubmitting
                      ? formFields.submittingText || "Sending..."
                      : formFields.submitButtonText || "Get Free Quote"}
                  </button>
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
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent booking-header-text">
                    {headerText}
                  </h1>

                  <p
                    className="text-2xl md:text-3xl font-bold mb-4 booking-subheader-text"
                    style={{ color: primaryTextColor }}
                  >
                    {phone}
                  </p>
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
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{
                            background: `linear-gradient(to bottom right, ${badgeGradientStart}, ${badgeGradientEnd})`,
                          }}
                        >
                          <span className="text-3xl">{badge.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-white">
                            {badge.text}
                          </h3>
                          <p className="text-orange-200">
                            {badge.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                          <img
                            src={image.url}
                            alt={image.alt || "Gallery"}
                            className="w-full h-32 object-cover rounded-xl shadow-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Form */}
              <div className="lg:col-span-1">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                  <h3 className="text-3xl lg:text-4xl font-light mb-8 booking-form-title-text">
                    {formTitle}
                  </h3>

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
                      </div>
                    </div>

                    <div className="space-y-2">
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/90 placeholder-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/90 placeholder-gray-500"
                      />
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
                    </div>

                    <div className="space-y-2">
                      <button
                        type="submit"
                        disabled={readOnly || isSubmitting}
                        className="w-full font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg booking-button-text"
                        style={{
                          backgroundColor: buttonBgColor,
                          color: buttonTextColor,
                        }}
                      >
                        {isSubmitting
                          ? formFields.submittingText || "🚀 Sending..."
                          : formFields.submitButtonText || "🎯 Get Free Quote"}
                      </button>
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

const BookingGeneralControls = ({ currentData, onControlsChange }) => {
  const handleFieldChange = (field, value) => {
    onControlsChange({ [field]: value });
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updatedSocialLinks = [...(currentData.socialLinks || [])];
    updatedSocialLinks[index] = { ...updatedSocialLinks[index], [field]: value };
    onControlsChange({ socialLinks: updatedSocialLinks });
  };

  const addSocialLink = () => {
    onControlsChange({
      socialLinks: [...(currentData.socialLinks || []), { platform: 'twitter', url: '' }],
    });
  };

  const removeSocialLink = (index) => {
    onControlsChange({
      socialLinks: (currentData.socialLinks || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Variant:</label>
        <select
          value={currentData.variant || 'nail'}
          onChange={(e) => handleFieldChange('variant', e.target.value)}
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm border border-gray-300"
        >
          <option value="nail">Nail (Classic)</option>
          <option value="modern">Modern</option>
          <option value="creative">Creative</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Phone Number:</label>
        <input
          type="text"
          value={currentData.phone || ''}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm border border-gray-300"
          placeholder="(404) 227-5000"
        />
      </div>
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold">Social Media Links:</h3>
        {(currentData.socialLinks || []).map((link, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <select
              value={link.platform}
              onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
              className="bg-white px-3 py-2 rounded text-sm border border-gray-300"
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
              onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
              className="flex-1 bg-white px-3 py-2 rounded text-sm border border-gray-300"
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
BookingGeneralControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

const BookingImagesControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const logoArray = currentData.logo ? [currentData.logo] : [];

  const handleLogoChange = (newImagesArray) => {
    const newLogoObject = newImagesArray[0] || null;
    const { onControlsChange: _, ...restOfCurrentData } = currentData;
    onControlsChange({ ...restOfCurrentData, logo: newLogoObject });
  };

  return (
    <div className="p-4 space-y-6">
      <PanelImagesController
        currentData={{ logo: logoArray }}
        onControlsChange={(data) => handleLogoChange(data.logo)}
        imageArrayFieldName="logo"
        maxImages={1}
      />
    </div>
  );
};

BookingImagesControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
};

const colorConfig = {
  nail: ['primaryBackground', 'secondaryBackground', 'primaryText', 'inputText', 'buttonBackground', 'buttonText', 'accentText'],
  modern: [
    'primaryBackground', 'secondaryBackground', 'primaryText', 'secondaryText', 'buttonBackground', 'buttonText',
    'inputBackground', 'inputText', 'cardBackground', 'gradientStart', 'gradientEnd', 'modernGradientStart',
    'modernGradientEnd', 'modernAccentStart', 'modernAccentEnd'
  ],
  creative: [
    'primaryBackground', 'secondaryBackground', 'primaryText', 'secondaryText', 'buttonBackground', 'buttonText',
    'inputBackground', 'inputText', 'cardBackground', 'gradientStart', 'gradientEnd', 'creativeGradientStart',
    'creativeGradientEnd', 'creativeHeaderGradient', 'creativeSubHeaderColor', 'creativeBadgeGradientStart',
    'creativeBadgeGradientEnd'
  ],
  status: ['successColor', 'errorColor', 'warningColor', 'infoColor']
};

const allColorPickers = {
  primaryBackground: { label: "Primary Background:", default: '#1f2937' },
  secondaryBackground: { label: "Secondary Background:", default: '#FFFFFF' },
  primaryText: { label: "Primary Text Color:", default: '#FFFFFF' },
  secondaryText: { label: "Secondary Text Color:", default: '#374151' },
  accentText: { label: "Accent Text Color:", default: '#F97316' },
  buttonBackground: { label: "Button Background:", default: '#F97316' },
  buttonText: { label: "Button Text Color:", default: '#FFFFFF' },
  inputBackground: { label: "Input Background:", default: '#FFFFFF' },
  inputText: { label: "Input Text Color:", default: '#374151' },
  cardBackground: { label: "Card Background:", default: '#FFFFFF' },
  gradientStart: { label: "Gradient Start:", default: '#1f2937' },
  gradientEnd: { label: "Gradient End:", default: '#374151' },
  modernGradientStart: { label: "Modern Gradient Start:", default: '#1e293b' },
  modernGradientEnd: { label: "Modern Gradient End:", default: '#334155' },
  modernAccentStart: { label: "Modern Accent Start:", default: '#3b82f6' },
  modernAccentEnd: { label: "Modern Accent End:", default: '#8b5cf6' },
  creativeGradientStart: { label: "Creative Gradient Start:", default: '#4c1d95' },
  creativeGradientEnd: { label: "Creative Gradient End:", default: '#be185d' },
  creativeHeaderGradient: { label: "Creative Header Gradient:", default: '#fbbf24' },
  creativeSubHeaderColor: { label: "Creative Sub Header Color:", default: '#fed7aa' },
  creativeBadgeGradientStart: { label: "Creative Badge Gradient Start:", default: '#fbbf24' },
  creativeBadgeGradientEnd: { label: "Creative Badge Gradient End:", default: '#f59e0b' },
  successColor: { label: "Success Color:", default: '#10B981' },
  errorColor: { label: "Error Color:", default: '#EF4444' },
  warningColor: { label: "Warning Color:", default: '#F59E0B' },
  infoColor: { label: "Info Color:", default: '#3B82F6' },
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
  const variantColors = colorConfig[currentVariant] || [];
  const statusColors = colorConfig.status;

  const renderColorPicker = (key) => {
    const pickerConfig = allColorPickers[key];
    if (!pickerConfig) return null;
    return (
      <ThemeColorPicker
        key={key}
        label={pickerConfig.label}
        currentColorValue={currentColors[key] || pickerConfig.default}
        themeColors={themeColors}
        onColorChange={(fieldName, value) => handleColorUpdate(key, value)}
        fieldName={key}
      />
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {currentVariant.charAt(0).toUpperCase() + currentVariant.slice(1)} Variant Colors
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variantColors.map(renderColorPicker)}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Status Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusColors.map(renderColorPicker)}
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
  return (
    <div className="space-y-6">
      {/* Variant Controls using PanelStylingController */}


      {/* Animation Controls using PanelStylingController */}
      <div>
        <PanelStylingController
          currentData={currentData}
          onControlsChange={onControlsChange}
          blockType="BookingBlock"
          controlType="animations"
        />
      </div>
    </div>
  );
};

BookingStylingControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

// Add GeneralPanel component after the BookingImagesControls and before BookingColorControls




/* ==============================================
   BOOKING FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for Booking text elements
=============================================== */
const BookingFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  const [viewportMode, setViewportMode] = useState('desktop');

  const handleSettingsChange = (textType, newSettings) => {
    onControlsChange({
      textSettings: {
        ...currentData.textSettings,
        [textType]: {
          ...(currentData.textSettings?.[textType] || {}),
          ...newSettings,
        },
      },
    });
  };

  const textTypes = [
    { key: 'header', label: 'Header Text' },
    { key: 'subHeader', label: 'Sub-Header Text (Phone)' },
    { key: 'formTitle', label: 'Form Title' },
    { key: 'button', label: 'Button Text' },
  ];

  return (
    <div className="p-4 space-y-6 bg-gray-800 text-white">
      <div className="text-center">
        <h3 className="text-lg font-medium">Font Settings</h3>
        <div className="mt-2 flex justify-center bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`px-3 py-1 text-sm font-medium rounded-md ${viewportMode === 'desktop' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
          >
            Desktop
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`px-3 py-1 text-sm font-medium rounded-md ${viewportMode === 'mobile' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
          >
            Mobile
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewportMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {textTypes.map(({ key, label }) => (
            <div key={key} className="p-3 bg-gray-700/50 rounded-lg">
              <PanelFontController
                label={label}
                currentData={currentData.textSettings?.[key]}
                onControlsChange={(newSettings) => handleSettingsChange(key, newSettings)}
                fieldPrefix={viewportMode}
                themeColors={themeColors}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

BookingFontsControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.array,
};

// =============================================

const ModernVariantControls = ({ currentData, onControlsChange }) => {
  const currentVariant = currentData.variant || 'modern';
  const variantData = currentData.variants?.[currentVariant] || {};

  const handleVariantFieldChange = (field, value) => {
    const newVariants = {
      ...(currentData.variants || {}),
      [currentVariant]: {
        ...(currentData.variants?.[currentVariant] || {}),
        [field]: value,
      },
    };
    onControlsChange({
      variants: newVariants,
      [field]: value, // Also update at root level for current display
    });
  };
  
  const handleFeatureChange = (index, field, value) => {
    const features = [...(variantData.features || [])];
    features[index] = { ...features[index], [field]: value };
    handleVariantFieldChange('features', features);
  };

  const addFeature = () => {
    const features = [...(variantData.features || []), { id: `feature_${Date.now()}`, emoji: '🔥', title: 'New Feature', subtitle: 'Description' }];
    handleVariantFieldChange('features', features);
  };

  const removeFeature = (index) => {
    const features = (variantData.features || []).filter((_, i) => i !== index);
    handleVariantFieldChange('features', features);
  };

  const handleFormFieldChange = (field, value) => {
    const formFields = { ...(variantData.formFields || {}), [field]: value };
    handleVariantFieldChange('formFields', formFields);
  };

  const handleServiceOptionChange = (index, value) => {
    const serviceOptions = [...(variantData.serviceOptions || [])];
    serviceOptions[index] = value;
    handleVariantFieldChange('serviceOptions', serviceOptions);
  };

  const addServiceOption = () => {
    const serviceOptions = [...(variantData.serviceOptions || []), 'New Service'];
    handleVariantFieldChange('serviceOptions', serviceOptions);
  };

  const removeServiceOption = (index) => {
    const serviceOptions = (variantData.serviceOptions || []).filter((_, i) => i !== index);
    handleVariantFieldChange('serviceOptions', serviceOptions);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Modern Variant Settings</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Header Text</label>
        <input
          type="text"
          value={variantData.headerText || ''}
          onChange={(e) => handleVariantFieldChange('headerText', e.target.value)}
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Form Title</label>
        <input
          type="text"
          value={variantData.formTitle || ''}
          onChange={(e) => handleVariantFieldChange('formTitle', e.target.value)}
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm border border-gray-300"
        />
      </div>
      <div className="space-y-2">
        <h4 className="text-md font-semibold">Features</h4>
        {(variantData.features || []).map((feature, index) => (
          <div key={feature.id || index} className="p-2 border rounded space-y-2 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={feature.emoji}
                onChange={(e) => handleFeatureChange(index, 'emoji', e.target.value)}
                className="w-12 text-center bg-white p-1"
                placeholder="🔥"
              />
              <div className="flex-grow">
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                  className="w-full font-semibold p-1"
                  placeholder="Feature Title"
                />
                <input
                  type="text"
                  value={feature.subtitle}
                  onChange={(e) => handleFeatureChange(index, 'subtitle', e.target.value)}
                  className="w-full text-sm p-1"
                  placeholder="Feature Subtitle"
                />
              </div>
              <button onClick={() => removeFeature(index)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Remove</button>
            </div>
          </div>
        ))}
        <button onClick={addFeature} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">+ Add Feature</button>
      </div>

      <div className="space-y-2">
        <h4 className="text-md font-semibold">Form Placeholders</h4>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" value={variantData.formFields?.firstNamePlaceholder || ''} onChange={(e) => handleFormFieldChange('firstNamePlaceholder', e.target.value)} placeholder="First Name Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.lastNamePlaceholder || ''} onChange={(e) => handleFormFieldChange('lastNamePlaceholder', e.target.value)} placeholder="Last Name Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.emailPlaceholder || ''} onChange={(e) => handleFormFieldChange('emailPlaceholder', e.target.value)} placeholder="Email Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.phonePlaceholder || ''} onChange={(e) => handleFormFieldChange('phonePlaceholder', e.target.value)} placeholder="Phone Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.servicePlaceholder || ''} onChange={(e) => handleFormFieldChange('servicePlaceholder', e.target.value)} placeholder="Service Select Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.messagePlaceholder || ''} onChange={(e) => handleFormFieldChange('messagePlaceholder', e.target.value)} placeholder="Message Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.submitButtonText || ''} onChange={(e) => handleFormFieldChange('submitButtonText', e.target.value)} placeholder="Submit Button Text" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.submittingText || ''} onChange={(e) => handleFormFieldChange('submittingText', e.target.value)} placeholder="Submitting Text" className="text-xs p-1"/>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-md font-semibold">Service Options</h4>
        {(variantData.serviceOptions || []).map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleServiceOptionChange(index, e.target.value)}
              className="w-full p-1"
            />
            <button onClick={() => removeServiceOption(index)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Remove</button>
          </div>
        ))}
        <button onClick={addServiceOption} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">+ Add Service</button>
      </div>
    </div>
  );
};

const CreativeVariantControls = ({ currentData, onControlsChange, themeColors }) => {
  const currentVariant = currentData.variant || 'creative';
  const variantData = currentData.variants?.[currentVariant] || {};

  const handleVariantFieldChange = (field, value) => {
    const newVariants = {
      ...(currentData.variants || {}),
      [currentVariant]: {
        ...(currentData.variants?.[currentVariant] || {}),
        [field]: value,
      },
    };
    onControlsChange({
      variants: newVariants,
      [field]: value,
    });
  };

  const handleBadgeChange = (index, field, value) => {
    const badges = [...(variantData.badges || [])];
    badges[index] = { ...badges[index], [field]: value };
    handleVariantFieldChange('badges', badges);
  };

  const addBadge = () => {
    const badges = [...(variantData.badges || []), { id: `badge_${Date.now()}`, icon: '🏆', text: 'New Badge', subtitle: 'Description' }];
    handleVariantFieldChange('badges', badges);
  };

  const removeBadge = (index) => {
    const badges = (variantData.badges || []).filter((_, i) => i !== index);
    handleVariantFieldChange('badges', badges);
  };
  
  const handleImagesChange = (images) => {
    handleVariantFieldChange('galleryImages', images);
  };

  const handleFormFieldChange = (field, value) => {
    const formFields = { ...(variantData.formFields || {}), [field]: value };
    handleVariantFieldChange('formFields', formFields);
  };

  const handleServiceOptionChange = (index, value) => {
    const serviceOptions = [...(variantData.serviceOptions || [])];
    serviceOptions[index] = value;
    handleVariantFieldChange('serviceOptions', serviceOptions);
  };

  const addServiceOption = () => {
    const serviceOptions = [...(variantData.serviceOptions || []), 'New Service'];
    handleVariantFieldChange('serviceOptions', serviceOptions);
  };

  const removeServiceOption = (index) => {
    const serviceOptions = (variantData.serviceOptions || []).filter((_, i) => i !== index);
    handleVariantFieldChange('serviceOptions', serviceOptions);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Creative Variant Settings</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Header Text</label>
        <input
          type="text"
          value={variantData.headerText || ''}
          onChange={(e) => handleVariantFieldChange('headerText', e.target.value)}
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Form Title</label>
        <input
          type="text"
          value={variantData.formTitle || ''}
          onChange={(e) => handleVariantFieldChange('formTitle', e.target.value)}
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm border border-gray-300"
        />
      </div>

       <div className="space-y-2">
        <h4 className="text-md font-semibold">Badges</h4>
        {(variantData.badges || []).map((badge, index) => (
          <div key={badge.id || index} className="p-2 border rounded space-y-2 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={badge.icon}
                onChange={(e) => handleBadgeChange(index, 'icon', e.target.value)}
                className="w-12 text-center bg-white p-1"
                placeholder="🏆"
              />
              <div className="flex-grow">
                <input
                  type="text"
                  value={badge.text}
                  onChange={(e) => handleBadgeChange(index, 'text', e.target.value)}
                  className="w-full font-semibold p-1"
                  placeholder="Badge Text"
                />
                <input
                  type="text"
                  value={badge.subtitle}
                  onChange={(e) => handleBadgeChange(index, 'subtitle', e.target.value)}
                  className="w-full text-sm p-1"
                  placeholder="Badge Subtitle"
                />
              </div>
              <button onClick={() => removeBadge(index)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Remove</button>
            </div>
          </div>
        ))}
        <button onClick={addBadge} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">+ Add Badge</button>
      </div>

      <div>
        <h4 className="text-md font-semibold">Gallery Images</h4>
        <PanelImagesController
          currentData={{ images: variantData.galleryImages || [] }}
          onControlsChange={(data) => handleImagesChange(data.images)}
          imageArrayFieldName="images"
          themeColors={themeColors}
          allowMultiple={true}
          maxImages={10}
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-md font-semibold">Form Placeholders</h4>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" value={variantData.formFields?.firstNamePlaceholder || ''} onChange={(e) => handleFormFieldChange('firstNamePlaceholder', e.target.value)} placeholder="First Name Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.lastNamePlaceholder || ''} onChange={(e) => handleFormFieldChange('lastNamePlaceholder', e.target.value)} placeholder="Last Name Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.emailPlaceholder || ''} onChange={(e) => handleFormFieldChange('emailPlaceholder', e.target.value)} placeholder="Email Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.phonePlaceholder || ''} onChange={(e) => handleFormFieldChange('phonePlaceholder', e.target.value)} placeholder="Phone Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.servicePlaceholder || ''} onChange={(e) => handleFormFieldChange('servicePlaceholder', e.target.value)} placeholder="Service Select Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.messagePlaceholder || ''} onChange={(e) => handleFormFieldChange('messagePlaceholder', e.target.value)} placeholder="Message Placeholder" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.submitButtonText || ''} onChange={(e) => handleFormFieldChange('submitButtonText', e.target.value)} placeholder="Submit Button Text" className="text-xs p-1"/>
          <input type="text" value={variantData.formFields?.submittingText || ''} onChange={(e) => handleFormFieldChange('submittingText', e.target.value)} placeholder="Submitting Text" className="text-xs p-1"/>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-md font-semibold">Service Options</h4>
        {(variantData.serviceOptions || []).map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleServiceOptionChange(index, e.target.value)}
              className="w-full p-1"
            />
            <button onClick={() => removeServiceOption(index)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Remove</button>
          </div>
        ))}
        <button onClick={addServiceOption} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">+ Add Service</button>
      </div>
    </div>
  );
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

        const newTextSettings = {
          ...(prevLocal.textSettings || {}),
          ...(bookingData.textSettings || {}),
        };

        return {
          ...prevLocal,
          ...bookingData,
          logo: newLogo,
          textSettings: newTextSettings,
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
    const activeVariant = localData.variant || variant;

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

  const activeVariant = currentData.variant || 'nail';

  if (activeVariant === 'modern') {
    tabs['Variant Settings'] = (props) => (
      <ModernVariantControls
        {...props}
        currentData={currentData}
        onControlsChange={onControlsChange}
      />
    );
  } else if (activeVariant === 'creative') {
    tabs['Variant Settings'] = (props) => (
      <CreativeVariantControls
        {...props}
        currentData={currentData}
        onControlsChange={onControlsChange}
        themeColors={themeColors}
      />
    );
  }

  // Fonts Tab
  tabs.fonts = (props) => (
    <BookingFontsControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
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
