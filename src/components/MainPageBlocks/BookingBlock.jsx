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

/* ===============================================
   1) BOOKING PREVIEW (Read-Only)
   -----------------------------------------------
   Uses bookingData.headerText for the main heading,
   bookingData.phone for the phone number link, and
   bookingData.logo for the logo image.
=============================================== */
const BookingPreview = memo(({ bookingData }) => {
  // Initialize state at the top level to avoid conditional hooks
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

  // Refs for GSAP animations
  const bannerRef = useRef(null);
  const formContainerRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const contentRef = useRef(null);

  // Social Icons mapping
  const socialIconComponents = {
    twitter: FaXTwitter,
    linkedin: FaLinkedin,
    instagram: FaInstagram,
    facebook: FaFacebook,
  };

  // Memoize the icons array to prevent recreating it on every render
  const residentialIcons = useMemo(
    () => [FaTools, FaFan, FaTint, FaPaintRoller],
    []
  );
  const commercialIcons = useMemo(
    () => [FaTools, FaPaintRoller, FaTint, FaFan],
    []
  );

  // Check for mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Fetch services from services.json with optimized loading
  useEffect(() => {
    if (!bookingData) return;

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

          // Process data outside of state updates to minimize render cycles
          const processedResServices = data.residential.map(
            (service, index) => {
              return {
                icon:
                  residentialIcons[index % residentialIcons.length] || FaTools,
                title: service.name,
                id: service.id,
                category: "residential",
              };
            }
          );

          const processedComServices = data.commercial.map((service, index) => {
            return {
              icon: commercialIcons[index % commercialIcons.length] || FaTools,
              title: service.name,
              id: service.id,
              category: "commercial",
            };
          });

          // Batch state updates to reduce renders
          setResidentialServices(processedResServices);
          setCommercialServices(processedComServices);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching services data:", error);
          // Set fallback data
          setResidentialServices([
            {
              title: "Roof Repair",
              icon: FaTools,
              id: 1,
              category: "residential",
            },
            {
              title: "Roof Replacement",
              icon: FaFan,
              id: 2,
              category: "residential",
            },
            {
              title: "Roof Inspection",
              icon: FaTint,
              id: 3,
              category: "residential",
            },
            {
              title: "Gutter Installation",
              icon: FaPaintRoller,
              id: 4,
              category: "residential",
            },
          ]);
          setCommercialServices([
            {
              title: "Commercial Roofing",
              icon: FaTools,
              id: 1,
              category: "commercial",
            },
            {
              title: "Flat Roof Repair",
              icon: FaPaintRoller,
              id: 2,
              category: "commercial",
            },
            {
              title: "Industrial Roofing",
              icon: FaTint,
              id: 3,
              category: "commercial",
            },
            {
              title: "Roof Maintenance",
              icon: FaFan,
              id: 4,
              category: "commercial",
            },
          ]);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [bookingData, residentialIcons, commercialIcons]);

  // GSAP animations for banner reveal and nails
  useEffect(() => {
    // Exit if no elements are available
    if (!bannerRef.current || !contentRef.current || !formContainerRef.current)
      return;

    // Get nail elements
    const leftNails = [
      document.getElementById("left-nail-1"),
      document.getElementById("left-nail-2"),
      document.getElementById("left-nail-3"),
    ].filter(Boolean); // Filter out any null values

    const rightNails = [
      document.getElementById("right-nail-1"),
      document.getElementById("right-nail-2"),
      document.getElementById("right-nail-3"),
    ].filter(Boolean); // Filter out any null values

    // Set initial positions
    gsap.set(bannerRef.current, { y: "-120%", opacity: 0 });
    gsap.set(contentRef.current, { opacity: 1 });
    gsap.set(formContainerRef.current, { opacity: 0, scale: 0.95 });

    // Set initial positions for nails
    gsap.set(leftNails, { x: "-100w" }); // Start completely off-screen to the left
    gsap.set(rightNails, { x: "100vw" }); // Start completely off-screen to the right

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: bannerRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
        markers: false,
        once: true,
      },
    });

    // 1. Banner falls from above with bounce effect
    masterTimeline.to(bannerRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "bounce.out",
    });

    // 2. Form scales and fades in with slight delay
    masterTimeline.to(
      formContainerRef.current,
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.4)",
      },
      "-=0.2" // Start slightly before banner animation finishes
    );

    // 3. After form is visible, animate left nails to slide in from left
    masterTimeline.to(
      leftNails,
      {
        x: "-20%", // Adjusted for shorter distance
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.12,
      },
      "+=0.2" // Delay slightly after form appears
    );

    // 4. Animate right nails to slide in from right
    masterTimeline.to(
      rightNails,
      {
        x: "20%", // Adjusted for shorter distance
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.12,
      },
      "-=0.4" // Overlap slightly with left nails animation
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // GSAP animation for mobile toggle
  const toggleFormVisibility = useCallback(() => {
    if (!isMobile) return; // Exit early if not mobile

    if (!isAnimating) {
      setIsAnimating(true);

      if (!isFormVisible) {
        // Expanding: First expand banner, then show form
        gsap.to(bannerRef.current, {
          height: "auto",
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.to(formContainerRef.current, {
              opacity: 1,
              duration: 0.3,
              onComplete: () => {
                setIsAnimating(false);
              },
            });
          },
        });
      } else {
        // Collapsing: First hide form, then collapse banner
        gsap.to(formContainerRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            gsap.to(bannerRef.current, {
              height: "140px",
              duration: 0.4,
              ease: "power2.inOut",
              onComplete: () => {
                setIsAnimating(false);
              },
            });
          },
        });
      }
      setIsFormVisible((prev) => !prev);
    }
  }, [isFormVisible, isMobile, isAnimating]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleServiceSelect = useCallback((serviceTitle) => {
    setFormData((prev) => ({ ...prev, service: serviceTitle }));
    setIsModalOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        // Show some form of loading indicator if needed
        const response = await axios.post("/api/sendForm", formData);

        if (response.status === 200) {
          alert("Form submitted successfully!");
          // Reset form data after successful submission
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            service: "",
            message: "",
          });
          // Hide the form after submission
          setIsFormVisible(false);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert(
          "There was an error submitting your form. Please try again later."
        );
      }
    },
    [formData]
  );

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  if (!bookingData) {
    return <p>No Booking data found.</p>;
  }

  const { headerText, phone, logo, socialLinks } = bookingData;

  // Format logo path for proper display
  const formattedLogo = logo
    ? `/assets/images/booking/${logo.split("/").pop() || "clipped.png"}`
    : logo || "";

  return (
    <div className="flex flex-col items-center justify-center w-full px-6 overflow-hidden mt-4">
      {/* OUTER BOX WITH BANNER COLOR */}
      <div
        ref={bannerRef}
        className={`md:max-w-xl w-full bg-banner rounded-lg shadow-lg relative z-30 transition-all duration-300 ease-in-out md:h-auto
          ${isFormVisible ? "h-auto" : "h-[140px]"}`}
      >
        {/* Left Nails */}
        <div className="absolute left-0  top-0 h-full hidden md:flex flex-col z-10 justify-between py-8 overflow-visible">
          <div id="left-nail-1" className="w-[8vw] h-[2.5vh] relative">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "url('/assets/images/nail.png')",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                transform: "scale(1.8)",
                transformOrigin: " center",
                position: "absolute",
                left: "-10%", // Adjusted position
                top: 0,
                filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
              }}
            />
          </div>
          <div id="left-nail-2" className="w-[8vw] h-[2.5vh] relative">
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
                left: "-6%", // Adjusted position
                top: 0,
                filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
              }}
            />
          </div>
          <div id="left-nail-3" className="w-[8vw] h-[2.5vh] relative">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "url('/assets/images/nail.png')",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                transform: "scale(1.8)",
                transformOrigin: " center",
                position: "absolute",
                left: "-8%", // Adjusted position
                top: 0,
                filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
              }}
            />
          </div>
        </div>

        {/* Right Nails */}
        <div className="absolute right-0 top-0 h-full hidden md:flex flex-col z-10 justify-between py-8 overflow-visible">
          <div id="right-nail-1" className="w-[8vw] h-[2.5vh] relative">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "url('/assets/images/nail.png')",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                transform: "scale(1.8) scaleX(-1)",
                transformOrigin: "center",
                position: "absolute",
                right: "-10%", // Adjusted position
                top: 0,
                filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
              }}
            />
          </div>
          <div id="right-nail-2" className="w-[8vw] h-[2.5vh] relative">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "url('/assets/images/nail.png')",
                backgroundPosition: " center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                transform: "scale(1.8) scaleX(-1)",
                transformOrigin: " center",
                position: "absolute",
                right: "-6%", // Adjusted position
                top: 0,
                filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
              }}
            />
          </div>
          <div id="right-nail-3" className="w-[8vw] h-[2.5vh] relative">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "url('/assets/images/nail.png')",
                backgroundPosition: " center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                transform: "scale(1.8) scaleX(-1)",
                transformOrigin: " center",
                position: "absolute",
                right: "-8%", // Adjusted position
                top: 0,
                filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
              }}
            />
          </div>
        </div>

        {/* Content Container */}
        <div ref={contentRef} className="relative z-20">
          {/* HEADER RIBBON WITH LOGO & TEXT */}
          <div className="relative py-3 px-4 flex flex-col items-center z-30">
            <div className="flex items-center justify-center w-full">
              <img
                src={formattedLogo}
                alt="logo"
                className="w-16 h-auto mr-4 drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)]"
                style={{ filter: "invert(1)" }}
              />
              <div className="text-left drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {headerText}
                </h2>
                <div className="font-bold md:text-lg text-white">
                  <a href={`tel:${phone}`}>{phone}</a>
                </div>
              </div>
            </div>

            {/* TOGGLE BUTTON (mobile only) */}
            <button
              ref={toggleButtonRef}
              onClick={toggleFormVisibility}
              disabled={isAnimating}
              className={`md:hidden mt-2 px-6 py-2 rounded-md shadow-lg relative transition-all duration-300 
                ${isAnimating ? "opacity-50" : "opacity-100"}
                ${isFormVisible ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
            >
              {isFormVisible ? (
                <div className="relative z-40 flex space-x-1 justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              ) : (
                <span className="relative z-40 text-white text-md font-semibold">
                  Book Now
                </span>
              )}
            </button>
          </div>

          {/* INNER BOX WITH FORM (white background) */}
          <div
            ref={formContainerRef}
            className={`w-full pb-2 md:block md:opacity-100
              ${isMobile ? `transition-opacity duration-300 ease-in-out ${isFormVisible ? "opacity-100" : "opacity-0"}` : ""}`}
            style={{
              display: !isMobile || isFormVisible ? "block" : "none",
            }}
          >
            {/* Social Icons Row - MOVED HERE */}
            {socialLinks && socialLinks.length > 0 && (
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
                    >
                      <div className="bg-second-accent p-2 rounded-md transform transition-transform hover:scale-110  ">
                        {IconComponent ? (
                          <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        ) : (
                          <span className="text-white">{social.platform}</span> // Fallback for unknown platforms
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
            <div className="bg-white rounded-lg p-3 shadow-inner mx-2 mt-2">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                    />
                  </div>
                  {/* Last Name */}
                  <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                    />
                  </div>
                  {/* Email */}
                  <div className="md:col-span-2 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      required
                      className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                    />
                  </div>
                  {/* Phone */}
                  <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your Phone"
                      required
                      className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                    />
                  </div>
                  {/* Service */}
                  <div className="md:col-span-1 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                    <div
                      onClick={() => setIsModalOpen(true)}
                      className="w-full p-2 bg-transparent border-b border-gray-400 cursor-pointer"
                    >
                      {formData.service ? (
                        <span className="text-gray-800">
                          {formData.service}
                        </span>
                      ) : (
                        <span className="text-gray-600">Select a Service</span>
                      )}
                    </div>
                  </div>
                  {/* Message */}
                  <div className="md:col-span-2 p-2 rounded-md bg-gray-50 transition-transform hover:scale-105">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your Message"
                      required
                      rows="3"
                      className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
                    />
                  </div>
                </div>
                {/* Submit Button - Made more narrow */}
                <div className="flex justify-center w-full mt-4 relative">
                  <button
                    type="submit"
                    className="relative px-8 py-2 text-white text-lg font-semibold rounded-md bg-accent hover:bg-banner hover:text-white md:w-auto shadow-md" // md:w-auto to allow natural width
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: SELECT SERVICE */}
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

            {/* Tabs for Residential/Commercial */}
            <div className="flex border-b mb-4">
              <button
                className={`flex-1 py-2 font-medium ${
                  activeTab === "residential"
                    ? "text-banner border-b-2 border-banner"
                    : "text-gray-500"
                }`}
                onClick={() => handleTabChange("residential")}
              >
                Residential
              </button>
              <button
                className={`flex-1 py-2 font-medium ${
                  activeTab === "commercial"
                    ? "text-banner border-b-2 border-banner"
                    : "text-gray-500"
                }`}
                onClick={() => handleTabChange("commercial")}
              >
                Commercial
              </button>
            </div>

            {/* Service List */}
            <ul className="space-y-4 max-h-80 overflow-y-auto">
              {activeTab === "residential" ? (
                residentialServices.length > 0 ? (
                  residentialServices.map((service, idx) => (
                    <li
                      key={idx}
                      className="flex items-start cursor-pointer p-2 hover:bg-gray-100 rounded"
                      onClick={() => handleServiceSelect(service.title)}
                    >
                      <div className="text-2xl text-banner mr-3">
                        {React.createElement(service.icon, {
                          className: "w-6 h-6",
                        })}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {service.title}
                        </h3>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center text-gray-600">
                    Loading residential services...
                  </li>
                )
              ) : commercialServices.length > 0 ? (
                commercialServices.map((service, idx) => (
                  <li
                    key={idx}
                    className="flex items-start cursor-pointer p-2 hover:bg-gray-100 rounded"
                    onClick={() => handleServiceSelect(service.title)}
                  >
                    <div className="text-2xl text-banner mr-3">
                      {React.createElement(service.icon, {
                        className: "w-6 h-6",
                      })}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{service.title}</h3>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-600">
                  Loading commercial services...
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

// Add display name to the component
BookingPreview.displayName = "BookingPreview";

// Added PropTypes validation for BookingPreview
BookingPreview.propTypes = {
  bookingData: PropTypes.shape({
    headerText: PropTypes.string,
    phone: PropTypes.string,
    logo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        split: PropTypes.func, // For the case when logo is a string
        name: PropTypes.string,
        url: PropTypes.string,
        file: PropTypes.object,
      }),
    ]),
    socialLinks: PropTypes.arrayOf(
      PropTypes.shape({
        platform: PropTypes.string,
        url: PropTypes.string,
      })
    ),
  }).isRequired,
};

/* ===============================================
   2) BOOKING EDITOR PANEL (Editing Mode)
   -----------------------------------------------
   Now allows editing of headerText, phone, 
   and the logo image on the left of the header.
=============================================== */
function BookingEditorPanel({ localData, setLocalData, onSave }) {
  const { logo, headerText = "", phone = "", socialLinks = [] } = localData;

  const handleSocialLinkChange = (index, field, value) => {
    const updatedSocialLinks = [...socialLinks];
    updatedSocialLinks[index] = {
      ...updatedSocialLinks[index],
      [field]: value,
    };
    setLocalData((prev) => ({ ...prev, socialLinks: updatedSocialLinks }));
  };

  const addSocialLink = () => {
    setLocalData((prev) => ({
      ...prev,
      socialLinks: [
        ...(prev.socialLinks || []),
        { platform: "twitter", url: "" },
      ],
    }));
  };

  const removeSocialLink = (index) => {
    const updatedSocialLinks = socialLinks.filter((_, i) => i !== index);
    setLocalData((prev) => ({ ...prev, socialLinks: updatedSocialLinks }));
  };

  /**
   * Handles logo image upload
   * Stores both the URL for display and the file object for the ZIP
   *
   * @param {Event} e - The file input change event
   */
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store both the file and URL
    setLocalData((prev) => ({
      ...prev,
      logo: {
        file: file,
        url: fileURL,
        name: file.name,
      },
    }));
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

  return (
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Booking Editor</h2>
        <button
          type="button"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save
        </button>
      </div>

      {/* Logo Image Upload */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Logo Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
        {getDisplayUrl(logo) && (
          <img
            src={getDisplayUrl(logo)}
            alt="Logo Preview"
            className="mt-2 h-24 rounded shadow"
          />
        )}
      </div>

      {/* Header Text */}
      <div>
        <label className="block text-sm mb-1">Header Text:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={headerText}
          onChange={(e) =>
            setLocalData((prev) => ({ ...prev, headerText: e.target.value }))
          }
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm mb-1">Phone:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={phone}
          onChange={(e) =>
            setLocalData((prev) => ({ ...prev, phone: e.target.value }))
          }
        />
      </div>

      {/* Social Links Editor */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Social Media Links:</h3>
        {socialLinks.map((link, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-2 bg-gray-800 rounded"
          >
            <select
              value={link.platform}
              onChange={(e) =>
                handleSocialLinkChange(index, "platform", e.target.value)
              }
              className="bg-gray-700 px-2 py-1 rounded"
            >
              <option value="twitter">Twitter/X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              {/* Add other platforms as needed */}
            </select>
            <input
              type="url"
              placeholder="Social Media URL"
              value={link.url}
              onChange={(e) =>
                handleSocialLinkChange(index, "url", e.target.value)
              }
              className="w-full bg-gray-700 px-2 py-1 rounded"
            />
            <button
              type="button"
              onClick={() => removeSocialLink(index)}
              className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSocialLink}
          className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
        >
          Add Social Link
        </button>
      </div>
    </div>
  );
}

// Added PropTypes validation for BookingEditorPanel
BookingEditorPanel.propTypes = {
  localData: PropTypes.shape({
    logo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
        file: PropTypes.object,
      }),
    ]),
    headerText: PropTypes.string,
    phone: PropTypes.string,
    socialLinks: PropTypes.arrayOf(
      PropTypes.shape({
        platform: PropTypes.string,
        url: PropTypes.string,
      })
    ),
  }).isRequired,
  setLocalData: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

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
    if (!bookingData) {
      return {
        logo: "/assets/images/logo.svg",
        headerText: "Contact Us!",
        phone: "(770) 880-1319",
        socialLinks: [
          // Default social links
          { platform: "twitter", url: "https://twitter.com" },
          { platform: "linkedin", url: "https://linkedin.com" },
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "facebook", url: "https://facebook.com" },
        ],
      };
    }
    // Ensure socialLinks exists in bookingData, otherwise provide default
    return {
      ...bookingData,
      socialLinks: bookingData.socialLinks || [
        { platform: "twitter", url: "https://twitter.com" },
        { platform: "linkedin", url: "https://linkedin.com" },
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "facebook", url: "https://facebook.com" },
      ],
    };
  });

  const handleSave = () => {
    onConfigChange?.(localData);
  };

  if (readOnly) {
    return <BookingPreview bookingData={localData} />;
  }

  return (
    <BookingEditorPanel
      localData={localData}
      setLocalData={setLocalData}
      onSave={handleSave}
    />
  );
}

// Added PropTypes validation for BookingBlock
BookingBlock.propTypes = {
  readOnly: PropTypes.bool,
  bookingData: PropTypes.shape({
    headerText: PropTypes.string,
    phone: PropTypes.string,
    logo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
        file: PropTypes.object,
      }),
    ]),
    socialLinks: PropTypes.arrayOf(
      PropTypes.shape({
        platform: PropTypes.string,
        url: PropTypes.string,
      })
    ),
  }),
  onConfigChange: PropTypes.func,
};

// Default props for BookingBlock
BookingBlock.defaultProps = {
  readOnly: false,
  bookingData: {
    logo: "/assets/images/logo.svg",
    headerText: "Contact Us!",
    phone: "(770) 880-1319",
    socialLinks: [
      { platform: "twitter", url: "https://twitter.com" },
      { platform: "linkedin", url: "https://linkedin.com" },
      { platform: "instagram", url: "https://instagram.com" },
      { platform: "facebook", url: "https://facebook.com" },
    ],
  },
  onConfigChange: () => {},
};
