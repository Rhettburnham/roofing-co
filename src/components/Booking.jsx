import React, { useState } from "react";
import { logoImg } from "../utils"; // Import the logo image
import axios from "axios";
import {
  FaBinoculars,
  FaBolt,
  FaWater,
  FaWind,
  FaLeaf,
  FaHome,
} from "react-icons/fa";

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

  // Utility function to toggle form visibility
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  // Define the services
  const inspectionSteps = [
    {
      icon: <FaBinoculars />,
      title: "Exterior Inspection",
      description: "Checking for missing shingles, sagging, and debris buildup.",
    },
    {
      icon: <FaBolt />,
      title: "Flashing and Seals",
      description:
        "Inspecting flashing around vents, chimneys, and skylights for damage or gaps.",
    },
    {
      icon: <FaWater />,
      title: "Gutter Inspection",
      description: "Ensuring gutters are clear of blockages and drain properly.",
    },
    {
      icon: <FaWind />,
      title: "Roof Ventilation",
      description: "Checking attic ventilation to prevent moisture buildup.",
    },
    {
      icon: <FaLeaf />,
      title: "Signs of Water Damage",
      description:
        "Looking for water stains, mold, or dark spots inside the attic.",
    },
    {
      icon: <FaHome />,
      title: "Structural Integrity",
      description: "Inspecting the overall structure for sagging or instability.",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleServiceSelect = (serviceTitle) => {
    setFormData({
      ...formData,
      service: serviceTitle,
    });
    setIsModalOpen(false);
  };

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

      // Debug: Log the data being sent
      console.log("Data being sent:", data);

      // Send the form data to the backend
      // Define API base URL from environment variables
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

      // Send the form data to the backend
      const response = await axios.post(
        `${API_BASE_URL}/submit-booking`,
        data
      );


      // Show success message
      alert(response.data.message);

      // Reset form fields
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
      if (error.response && error.response.data && error.response.data.message) {
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
      className="flex flex-col items-center p-6 faint-color w-full"
      id="booking"
    >
      {/* Header Section */}
      <div className="w-full max-w-3xl mb-4">
        <div className="flex flex-row items-center justify-center">
          <img src={logoImg} alt="logo" className="w-20 h-auto mr-6" />
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-black">
              Contact Us!
            </h2>
            <p className="text-base md:text-lg text-gray-700 mt-1">
              📞 (770) 330-2349
            </p>
          </div>
        </div>
      </div>

      {/* "Book" Button for Small Screens */}
      <button
        onClick={toggleFormVisibility}
        className="block md:hidden p-3 mb-4 dark_button text-white text-md font-semibold rounded-md hover:bg-gray-600 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 shadow-xl"
      >
        {isFormVisible ? "..." : "Book"}
      </button>

      {/* Form Section */}
      <div className={`${isFormVisible ? "block" : "hidden"} md:block w-full`}>
        <form onSubmit={handleSubmit} className="w-full max-w-screen-md mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="w-full p-4 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
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
                className="w-full p-4 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
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
                className="w-full p-4 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
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
                className="w-full p-4 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600"
              />
            </div>
            {/* Service Selection */}
            <div>
              {/* Display the selected service or placeholder */}
              <div
                onClick={() => setIsModalOpen(true)}
                className="w-full p-4 bg-transparent border-b border-gray-400 cursor-pointer focus:outline-none focus:border-blue-600 placeholder-gray-600"
              >
                {formData.service ? (
                  <span className="text-gray-800">{formData.service}</span>
                ) : (
                  <span className="text-gray-600">Select a Service</span>
                )}
              </div>
            </div>
            {/* Empty div to maintain grid structure */}
            <div></div>
            {/* Message (span both columns) */}
            <div className="col-span-1 md:col-span-2">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                required
                className="w-full h-full p-4 bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-600 placeholder-gray-600 resize-none"
                rows="4"
              ></textarea>
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-4 mt-8 hover:bg-gray-600 text-white text-lg font-semibold rounded-md dark_button active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 max-w-md w-11/12 md:w-2/3 relative"
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
                    {item.icon}
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
