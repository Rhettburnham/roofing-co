// src/components/MainPageBlocks/BookingBlock.jsx
import React, { useState } from "react";
import axios from "axios";
// import * as Icons from "lucide-react";
// import * as FaIcons from "react-icons/fa";

/* ===============================================
   1) BOOKING PREVIEW (Read-Only)
   -----------------------------------------------
   Uses bookingData.headerText for the main heading,
   bookingData.phone for the phone number link, and
   bookingData.logo for the logo image.
=============================================== */
function BookingPreview({ bookingData }) {
  if (!bookingData) {
    return <p>No data found.</p>;
  }

  // Destructure headerText, phone, and logo from bookingData; use default logo if not provided
  const { headerText, phone, logo: bookingLogo } = bookingData;
  const logo = bookingLogo || "/assets/images/logo.svg";

  // Local state for the form inputs (omitted for brevity)
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

  const modalServices = [
    "Roof Replacement",
    "Gutter Installation",
    "Siding",
    "General Maintenance",
  ];

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceTitle) => {
    setFormData((prev) => ({ ...prev, service: serviceTitle }));
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, service, message } = formData;
    if (!firstName || !lastName || !email || !phone || !service || !message) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const dataToSend = { ...formData };
      console.log("Data being sent:", dataToSend);
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://roofingco-backend.herokuapp.com";
      const response = await axios.post(
        `${API_BASE_URL}/submit-booking`,
        dataToSend
      );
      alert(response.data.message);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center bg-white w-full bg-gradient-to-t from-black to-white">
      {/* HEADER RIBBON */}
      <div className="relative w-full">
        <div className="absolute inset-0 " />

        {/* Jagged SVG at the bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[10vh] md:h-[15vh] z-10"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            className = "text-transparent text-[5vh]"
            fill = "currentColor"
            opacity="1"
            d="M0,224 L80,192 C160,160, 320,96, 480,101.3 C640,107, 800,181, 960,192 C1120,203, 1280,149, 1360,122.7 L1440,96 L1440,320 L0,320 Z"
          />
        </svg>
        <div className="relative z-10 py-4 px-4 flex flex-row items-center justify-center">
          <img
            src={logo}
            alt="logo"
            className="w-20 h-auto mr-6 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            style={{ filter: "invert(0)" }}
          />
          <div className="text-left drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            <h2 className="text-2xl md:text-3xl font-bold text-black">
              {headerText}
            </h2>
            <div className="font-bold md:text-lg text-black ">
              <a href={`tel:${phone}`}>{phone}</a>
            </div>
          </div>
        </div>
      </div>

      {/* "BOOK" BUTTON (mobile) */}
      <button
        onClick={toggleFormVisibility}
        className="block md:hidden p-2 mb-2 px-6 dark_button text-white text-md font-semibold rounded-md hover:bg-white hover:text-black shadow-xl"
      >
        {isFormVisible ? "..." : "Book"}
      </button>

      {/* BOOKING FORM */}
      <div className={`${isFormVisible ? "block" : "hidden"} md:block w-full`}>
        <form onSubmit={handleSubmit} className="w-full mb-1 px-4 md:px-0">
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
          {/* Submit Button */}
          <div className="flex justify-center w-full mt-4">
            <button
              type="submit"
              className="p-4 text-white text-lg font-semibold rounded-md dark_button hover:bg-white hover:text-black md:px-[25vw] shadow-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* MODAL: SELECT SERVICE */}
      {/* {isModalOpen && (
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
              <Icons.X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Select a Service</h2>
            <ul className="space-y-4 max-h-80 overflow-y-auto">
              {modalServices.length > 0 ? (
                modalServices.map((title, idx) => (
                  <li
                    key={idx}
                    className="flex items-start cursor-pointer p-2 hover:bg-gray-100 rounded"
                    onClick={() => handleServiceSelect(title)}
                  >
                    <div className="text-2xl text-dark-below-header mr-3">
                      <Icons.Tools className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-600">No services found</li>
              )}
            </ul>
          </div>
        </div>
      )} */}
    </div>
  );
}


/* ===============================================
   2) BOOKING EDITOR PANEL (Editing Mode)
   -----------------------------------------------
   Now allows editing of headerText, phone, 
   and the logo image on the left of the header.
=============================================== */
function BookingEditorPanel({ localData, setLocalData, onSave }) {
  const { logo, headerText = "", phone = "" } = localData;

  // Handler for logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setLocalData((prev) => ({ ...prev, logo: fileURL }));
    }
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
        {logo && (
          <img src={logo} alt="Logo Preview" className="mt-2 h-24 rounded shadow" />
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
export default function BookingBlock({ readOnly = false, bookingData, onConfigChange }) {
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
    <BookingEditorPanel localData={localData} setLocalData={setLocalData} onSave={handleSave} />
  );
}
