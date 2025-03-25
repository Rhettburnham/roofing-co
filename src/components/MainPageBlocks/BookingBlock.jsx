// src/components/MainPageBlocks/BookingBlock.jsx
import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import axios from "axios";
import { FaTools, FaFan, FaPaintRoller, FaTint } from "react-icons/fa";
import { X } from "lucide-react";
import gsap from "gsap";
// import * as FaIcons from "react-icons/fa";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [residentialServices, setResidentialServices] = useState([]);
  const [commercialServices, setCommercialServices] = useState([]);
  const [activeTab, setActiveTab] = useState("residential");
  const [isLoading, setIsLoading] = useState(false);

  // Refs for GSAP animations
  const bannerRef = useRef(null);
  const formContainerRef = useRef(null);
  const toggleButtonRef = useRef(null);

  // Memoize the icons array to prevent recreating it on every render
  const residentialIcons = useMemo(
    () => [FaTools, FaFan, FaTint, FaPaintRoller],
    []
  );
  const commercialIcons = useMemo(
    () => [FaTools, FaPaintRoller, FaTint, FaFan],
    []
  );

  // Fetch services from services.json with optimized loading
  useEffect(() => {
    if (!bookingData) return;

    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/data/services.json", { signal });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        if (isMounted) {
          const data = await res.json();

          // Process data outside of state updates to minimize render cycles
          const processedResServices = data.residential.map(
            (service, index) => {
              const heroBlock =
                service.blocks.find((b) => b.blockName === "HeroBlock") ||
                service.blocks[0];
              const title = heroBlock?.config?.title || `Service ${service.id}`;
              return {
                icon:
                  residentialIcons[index % residentialIcons.length] || FaTools,
                title,
                id: service.id,
                category: "residential",
              };
            }
          );

          const processedComServices = data.commercial.map((service, index) => {
            const heroBlock =
              service.blocks.find((b) => b.blockName === "HeroBlock") ||
              service.blocks[0];
            const title = heroBlock?.config?.title || `Service ${service.id}`;
            return {
              icon: commercialIcons[index % commercialIcons.length] || FaTools,
              title,
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
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [bookingData, residentialIcons, commercialIcons]);

  // GSAP animation for mobile toggle
  const toggleFormVisibility = useCallback(() => {
    if (window.innerWidth < 768) { // Only animate on mobile
      if (!isFormVisible) {
        // Animation to expand banner into form
        gsap.to(bannerRef.current, {
          height: "auto",
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            // Fade in form elements
            gsap.fromTo(
              formContainerRef.current,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.3 }
            );
          }
        });
      } else {
        // Animation to collapse form back to banner
        gsap.to(formContainerRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          onComplete: () => {
            gsap.to(bannerRef.current, {
              height: "auto",
              duration: 0.5,
              ease: "power2.inOut"
            });
          }
        });
      }
    }
    
    setIsFormVisible((prev) => !prev);
  }, [isFormVisible]);

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

  const { headerText, phone, logo } = bookingData;
  
  // Format logo path for proper display
  const formattedLogo = logo
    ? `/assets/images/${logo.split('/').pop() || 'clipped-cowboy.png'}`
    : logo || '/assets/images/clipped-cowboy.png';

  return (
    <div className="flex flex-col items-center w-full">
      {/* OUTER BOX WITH BANNER COLOR */}
      <div ref={bannerRef} className="w-full bg-banner rounded-lg overflow-hidden shadow-lg">
        {/* HEADER RIBBON WITH LOGO & TEXT */}
        <div className="relative py-4 px-4 flex flex-col items-center">
          <div className="flex items-center justify-center w-full">
            <img
              src={formattedLogo}
              alt="logo"
              className="w-20 h-auto mr-6 drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)]"
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
          
          {/* TOGGLE BUTTON (mobile only) - Now below the header content */}
          <button
            ref={toggleButtonRef}
            onClick={toggleFormVisibility}
            className="md:hidden mt-3 px-4 rounded-md shadow-lg relative"
          >
            {isFormVisible ? (
              <div className="relative z-40 flex space-x-1 justify-center p-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            ) : (
              <span className="relative z-40 text-white text-md font-semibold px-4 py-2">Book</span>
            )}
          </button>
        </div>

        {/* INNER BOX WITH FORM (white background) */}
        <div 
          ref={formContainerRef}
          className={`${isFormVisible ? "block" : "hidden"} md:block w-full`}
        >
          <div className="bg-white m-4 rounded-lg p-4 shadow-inner">
            <form onSubmit={handleSubmit} className="w-full mb-1">
              <div className="grid grid-cols-1 gap-4 md:max-w-xl mx-auto">
                {/* First Name */}
                <div>
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
                <div>
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
                <div>
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
                <div>
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
                <div>
                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="w-full p-2 bg-transparent border-b border-gray-400 cursor-pointer"
                  >
                    {formData.service ? (
                      <span className="text-gray-800">{formData.service}</span>
                    ) : (
                      <span className="text-gray-600">Select a Service</span>
                    )}
                  </div>
                </div>
                {/* Message */}
                <div>
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
                  className="relative px-8 py-2 text-white text-lg font-semibold rounded-md bg-accent hover:bg-banner hover:text-white md:w-1/3 shadow-md"
                >
                  Submit
                </button>
              </div>
            </form>
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

/* ===============================================
   2) BOOKING EDITOR PANEL (Editing Mode)
   -----------------------------------------------
   Now allows editing of headerText, phone, 
   and the logo image on the left of the header.
=============================================== */
function BookingEditorPanel({ localData, setLocalData, onSave }) {
  const { logo, headerText = "", phone = "" } = localData;

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
    </div>
  );
}

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
      };
    }
    return { ...bookingData };
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
