// src/components/MainPageBlocks/HeroReadOnly.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, Building2, X } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * HeroReadOnly
 * - Displays your hero layout with residential/commercial sections
 * - Shows the modal on subservice click
 */
export default function HeroReadOnly({
  topLogoSrc,
  mainTitle,
  subTitle,
  residentialBg,
  commercialBg,
  serviceDetails,
}) {
  const [activeSection, setActiveSection] = useState("neutral");
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? "neutral" : section));
  };

  const openModal = (svcObj) => {
    setSelectedService(svcObj);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  // Idle “resting” animation
  const restingAnimation = {
    x: [10, 30, 10],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear",
    },
  };

  // Framer variants for list items
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="h-[48vh] md:h-[75.5vh] overflow-hidden">
      <div className="h-[30vh] md:h-[35vh] absolute top-0 left-0 right-0 bg-gradient-to-b from-dark-below-header from-60% to-transparent z-10"></div>

      {/* Top area: logo + titles */}
      <div className="relative w-full h-[2.5vh] md:h-[7.5vh] z-20">
        <div className="relative flex flex-row items-center justify-center">
          <img
            src={topLogoSrc}
            alt="logo"
            className="w-[20vw] md:w-[17vh] h-auto mr-5 md:mr-10"
            style={{ filter: "invert(0)" }}
          />
          <div className="relative flex flex-col items-center justify-center z-10 -space-y-[1vh] md:-space-y-[5vh]">
            <span
              className="
                text-[9vw]
                md:text-[12vh]
                text-white
                text-center
                drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]
                [ -webkit-text-stroke:6px_black ]
                font-rye font-normal font-ultra-condensed
              "
            >
              {mainTitle}
            </span>
            <span
              className="
                text-[4vw]
                md:text-[3.5vh]
                mr-[10vw]
                md:mr-[15vw]
                text-left
                drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]
                [ -webkit-text-stroke:1px_black ]
                text-gray-500
                font-serif
              "
            >
              {subTitle}
            </span>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div className="relative h-[35vh] mt-[5vh] md:h-[65vh] w-full">
          {/* Left half - Residential */}
          <motion.div
            className="absolute left-0 h-[65vw] md:h-[65vh] w-1/2 cursor-pointer"
            initial={{ x: 0 }}
            animate={{
              x:
                activeSection === "commercial"
                  ? "-20vw"
                  : activeSection === "residential"
                  ? "20vw"
                  : "0vw",
              ...(!activeSection || activeSection === "neutral"
                ? restingAnimation
                : {}),
            }}
            transition={{
              duration: activeSection === "neutral" ? 3 : 0.5,
              ease: "easeInOut",
            }}
            onClick={() => handleSectionClick("residential")}
          >
            <div className="relative w-full h-full">
              <div
                className="absolute top-0 right-0 w-[100vw] h-full"
                style={{
                  background: `url('${residentialBg}') no-repeat center center`,
                  backgroundSize: "cover",
                  transformOrigin: "top right",
                }}
              />
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute right-0 top-[40%] -translate-y-1/2 flex items-center gap-4 md:gap-8">
                  {activeSection === "residential" && (
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-white font-serif text-right space-y-1 md:space-y-2 text-[3.5vw] md:text-[3.8vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                    >
                      {Object.keys(serviceDetails.residential).map((svc) => (
                        <motion.li
                          key={svc}
                          variants={itemVariants}
                          className="flex items-center justify-end gap-2"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({ type: "residential", name: svc });
                            }}
                            className="text-white font-serif py-1 rounded"
                          >
                            {svc} ←
                          </button>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}

                  {/* Residential Icon + Label */}
                  <div className="flex flex-col -space-y-1 md:-space-y-2 items-center mt-[8vh] md:mt-[12vh] mr-[8vh] md:mr-[13.2vw] group">
                    <Home className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] text-white drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)]" />
                    <h2 className="text-[4.5vw] md:text-[4.2vh] font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,3)] text-white font-serif duration-300">
                      Residential
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right half - Commercial */}
          <motion.div
            className="absolute right-0 h-[65vw] md:h-[65vh] w-1/2 cursor-pointer"
            initial={{ x: 0 }}
            animate={{
              x:
                activeSection === "commercial"
                  ? "-20vw"
                  : activeSection === "residential"
                  ? "20vw"
                  : "0vw",
              ...(!activeSection || activeSection === "neutral"
                ? restingAnimation
                : {}),
            }}
            transition={{
              duration: activeSection === "neutral" ? 3 : 0.5,
              ease: "easeInOut",
            }}
            onClick={() => handleSectionClick("commercial")}
          >
            <div className="relative w-full h-full">
              <div
                className="absolute top-0 left-0 w-[100vw] h-full"
                style={{
                  background: `url('${commercialBg}') no-repeat center center`,
                  backgroundSize: "cover",
                  transformOrigin: "top left",
                  transform: "skew(-15deg)",
                }}
              />
              <div className="absolute top-0 right-0 w-full h-full">
                <div className="absolute left-0 top-[40%] -translate-y-1/2 flex items-center gap-4 md:gap-8">
                  {/* Commercial Icon + Label */}
                  <div className="flex flex-col items-center -space-y-1 md:-space-y-2 group ml-[6vw] mt-[8vh] md:mt-[12vh]">
                    <Building2 className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] text-white drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)]" />
                    <h2 className="text-[4.5vw] md:text-[4.2vh] font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,3)] text-white font-serif">
                      Commercial
                    </h2>
                  </div>
                  {activeSection === "commercial" && (
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-white text-left space-y-1 md:space-y-2 text-[3.5vw] md:text-[3.8vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                    >
                      {Object.keys(serviceDetails.commercial).map((svc) => (
                        <motion.li key={svc} variants={itemVariants}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({ type: "commercial", name: svc });
                            }}
                            className="py-1"
                          >
                            → {svc}
                          </button>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* The Modal if open */}
      {showModal && selectedService && (
        <ModalView
          serviceDetails={serviceDetails}
          selectedService={selectedService}
          closeModal={closeModal}
        />
      )}
    </section>
  );
}

/**
 * Modal for the subservice details
 */
function ModalView({ serviceDetails, selectedService, closeModal }) {
  const { type, name } = selectedService;
  const block = serviceDetails[type]?.[name];
  if (!block) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="relative w-[90vw] max-w-4xl bg-white rounded-lg p-6">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Row: Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={block.icon}
            alt={name}
            className="w-8 h-8 md:w-10 md:h-10 mr-2"
          />
          <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
        </div>

        {/* Image */}
        <img
          src={block.image}
          alt={name}
          className="w-full h-60 object-cover rounded-lg mb-4"
        />

        {/* Description */}
        <p className="text-gray-700 text-lg mb-6">{block.description}</p>

        {/* Subservices */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 font-serif">
            Our Services Include:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {block.subServices.map((sub, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 font-serif">
                  {sub.title}
                </h4>
                <p className="text-gray-600 font-serif">{sub.description}</p>
              </div>
            ))}
          </div>

          {/* Example CTA Buttons at bottom */}
          <div className="flex flex-wrap justify-end gap-3 mt-4">
            {/* Example routes. Adjust to your own. */}
            {type === "residential" && name === "Roof" && (
              <Link
                to="/shingleinstallation"
                className="px-6 py-2 dark_button font-serif text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
              >
                Go to Shingle Installation
              </Link>
            )}
            {type === "commercial" && name === "Roof" && (
              <Link
                to="/metalroofs"
                className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
              >
                Metal Roof
              </Link>
            )}
            {/* ... and so on for each subservice you need. */}
          </div>
        </div>
      </div>
    </div>
  );
}
