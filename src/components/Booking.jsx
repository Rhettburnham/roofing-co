import React, { useState } from "react";
import { logoImg } from "../utils"; // Ensure this path is correct
import axios from "axios";
import { FaTools, FaFan, FaPaintRoller, FaTint } from "react-icons/fa";

const Booking = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  // State to control the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to control form visibility on small screens
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Define the services
  const inspectionSteps = [
    {
      icon: FaTools,
      title: "Shingle Installation",
      link: "/shingleinstallation",
      color: "#ffffff",
    },
    {
      icon: FaFan,
      title: "Ventilation",
      link: "/ventilation",
      color: "#ffffff",
    },
    {
      icon: FaPaintRoller,
      title: "Roof Coating",
      link: "/roofcoating",
      color: "#ffffff",
    },
    {
      icon: FaTint,
      title: "Gutter Options",
      link: "/gutterrelated",
      color: "#ffffff",
    },
  ];

  // Toggle form (small screens)
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Select a service
  const handleServiceSelect = (serviceTitle) => {
    setFormData((prevData) => ({ ...prevData, service: serviceTitle }));
    setIsModalOpen(false);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.service ||
      !formData.message
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const data = { ...formData };

      // Debug
      console.log("Data being sent:", data);

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://roofingco-backend.herokuapp.com"; // fallback URL

      const response = await axios.post(`${API_BASE_URL}/submit-booking`, data);
      alert(response.data.message);

      // Reset form
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
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center bg-white"
      id="booking"
    >
      {/* ─────────────────────────────────────────────────────────────────
          HEADER SECTION WITH FULL-WIDTH RIBBON
         ───────────────────────────────────────────────────────────────── */}
      <div className="relative w-full ">
        <div className="absolute inset-0 bg-hover-color opacity-100" />

        <div className="relative z-10 py-4 px-4 flex flex-row items-center justify-center">
          <img src="assets/images/clipped-cowboy.png" alt="logo" className="w-20 h-auto mr-6" style={{ filter: 'invert(1)' }} />

          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Contact Us!
            </h2>
            <div className="font-bold md:text-lg text-white mt-1">
              <a href="tel:4422363783"> (442)236-3783</a>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          "BOOK" BUTTON (SMALL SCREENS)
         ───────────────────────────────────────────────────────────────── */}
      <button
        onClick={toggleFormVisibility}
        className="block md:hidden p-2 my-4 dark_button text-white text-md font-semibold rounded-md hover:bg-white hover:text-black shadow-xl"
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
        }}
      >
        {isFormVisible ? "..." : "Book"}
      </button>

      {/* ─────────────────────────────────────────────────────────────────
          FORM SECTION
         ───────────────────────────────────────────────────────────────── */}
      <div className={`${isFormVisible ? "block" : "hidden"} md:block `}>
        <form onSubmit={handleSubmit} className="w-full mb-1">
          <div className="grid grid-cols-1 gap-4">
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

            {/* Service Selection */}
            <div>
              <div
                onClick={() => setIsModalOpen(true)}
                className="w-full p-2 bg-transparent border-b border-gray-400 cursor-pointer focus:outline-none focus:border-blue-600 placeholder-gray-600"
              >
                {formData.service ? (
                  <span className="text-gray-800">{formData.service}</span>
                ) : (
                  <span className="text-gray-600">Select a Service</span>
                )}
              </div>
            </div>

            {/* Spacing placeholder */}
            <div />

            {/* Message (span both columns) */}
            <div className="col-span-1 md:col-span-2">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                required
                rows="3"
                className="w-full p-2 bg-transparent border-b border-gray-400 cursor-pointer focus:outline-none focus:border-blue-600 placeholder-gray-600"
              ></textarea>
            </div>
          </div>

          {/* Centered Submit Button */}
          <div className="flex justify-center relative w-full ">
            <button
              type="submit"
              className="p-4 text-white text-lg md:px-[25vw] md:my-5 font-semibold rounded-md dark_button hover:bg-white hover:text-black"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 0 15px 1px rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL POPUP
         ───────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Select a Service
            </h2>
            <ul className="space-y-4 max-h-80 overflow-y-auto">
              {inspectionSteps.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start cursor-pointer p-2 hover:bg-gray-100 rounded"
                  onClick={() => handleServiceSelect(item.title)}
                >
                  <div className="text-2xl text-dark-below-header mr-3">
                    {<item.icon />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-gray-700 mt-1 text-sm">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
