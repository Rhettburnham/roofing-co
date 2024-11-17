import React from "react";
import {
  FaBinoculars,
  FaBolt,
  FaWater,
  FaWind,
  FaLeaf,
  FaHome,
} from "react-icons/fa";

// Data arrays
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

const Inspection = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* For medium and larger screens */}
        <div className="hidden md:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/assets/images/growth/hero_growth.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 dark-below-header"></div>

        </div>

        {/* For small screens */}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-6">
        {/* Inspection Steps */}
        <section className="mb-5" id="inspection-steps">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inspectionSteps.map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="text-4xl text-dark-below-header mr-4">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-700 mt-1">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Inspection;
