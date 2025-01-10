import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Building2,
  X,
  // These icons remain the same
  // Wrench, // remove old references you no longer need
  // Package,
  // Shield,
  // Leaf,
} from "lucide-react";

// ADDED:
import { Link } from "react-router-dom";

// Example new icons (optional) or reuse from above
// import { Tool, Factory, etc. } from "lucide-react";

const Hero = () => {
  const [activeSection, setActiveSection] = useState("neutral");
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleSectionClick = (section) => {
    setActiveSection((prevSection) =>
      prevSection === section ? "neutral" : section
    );
  };

  const openModal = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  /**
   * =========================================================
   * UPDATED SERVICE DETAILS
   * =========================================================
   */
  const serviceDetails = {
    residential: {
      // 1. Roof
      Roof: {
        icon: (
          <img
            src="/assets/icons/roof-icon.png"
            alt="Roof"
            className="w-8 h-8 md:w-10 md:h-10"
          />
        ),
        image: "/assets/images/hero_modal/residentialnight.jpg",
        description:
          "Our Residential Roof services include new shingle installation and full replacements, ensuring your home is protected with high-quality, long-lasting materials.",
        subServices: [
          {
            title: "Shingle Installation",
            description:
              "Expert shingle roofing—from asphalt and metal to tile—tailored to your budget and style.",
          },
        ],
      },

      // 2. Accessories
      Accessories: {
        icon: (
          <img
            src="/assets/icons/tools-icon.png"
            alt="Accessories"
            className="w-8 h-8 md:w-10 md:h-10"
          />
        ),
        image: "/assets/images/hero_modal/residential_accessories.jpg",
        description:
          "Enhance and protect your home with our accessories—from ventilation solutions for a cooler attic to gutter systems that prevent water damage.",
        subServices: [
          {
            title: "Ventilation",
            description:
              "Proper attic ventilation reduces energy costs and prolongs roof life.",
          },
          {
            title: "Gutter",
            description:
              "Gutter installation & maintenance to direct rainwater away from your foundation.",
          },
        ],
      },

      // 3. Siding
      Siding: {
        icon: (
          <img
            src="/assets/icons/wall-icon.png"
            alt="Siding"
            className="w-8 h-8 md:w-10 md:h-10"
          />
        ),
        image: "/assets/images/hero_modal/residential_siding.jpg",
        description:
          "Improve your home’s curb appeal and energy efficiency with our diverse siding options including vinyl, wood, metal, and more.",
        subServices: [
          {
            title: "Siding",
            description:
              "Full siding installation and replacement services to revamp your home's exterior.",
          },
        ],
      },
    },

    commercial: {
      // 1. Roof
      Roof: {
        icon: (
          <img
            src="/assets/icons/factory-icon.png"
            alt="Commercial Roof"
            className="w-8 h-8 md:w-10 md:h-10"
          />
        ),
        image: "/assets/images/hero_modal/commercialnight.jpg",
        description:
          "Comprehensive roof solutions for commercial properties—from metal roofs and coatings to single-ply membranes and built-up systems.",
        subServices: [
          {
            title: "Metal Roof",
            description:
              "Durable metal roofing systems for long-term protection and energy savings.",
          },
          {
            title: "Coating",
            description:
              "Extend roof lifespan, increase reflectivity, and reduce energy costs with roof coatings.",
          },
          {
            title: "Single Ply",
            description:
              "Efficient and versatile single-ply systems (TPO, PVC, EPDM) for a variety of commercial needs.",
          },
          {
            title: "Built Up",
            description:
              "Traditional multiple-layer systems (BUR) for excellent waterproofing and durability.",
          },
        ],
      },

      // 2. Accessories
      Accessories: {
        icon: (
          <img
            src="/assets/icons/gear-icon.png"
            alt="Accessories"
            className="w-8 h-8 md:w-10 md:h-10"
          />
        ),
        image: "/assets/images/hero_modal/commercial_accessories.jpg",
        description:
          "Safeguard and optimize your commercial roof with the right accessories—from ventilation setups to comprehensive guttering.",
        subServices: [
          {
            title: "Ventilation",
            description:
              "Prevent heat buildup and moisture issues with custom commercial ventilation systems.",
          },
          {
            title: "Gutter",
            description:
              "Seamless gutter installations designed for large-scale water management.",
          },
        ],
      },

      // 3. Energy
      Energy: {
        icon: (
          <img
            src="/assets/icons/lightning-icon.png"
            alt="Energy"
            className="w-8 h-8 md:w-10 md:h-10"
          />
        ),
        image: "/assets/images/hero_modal/commercial_energy.jpg",
        description:
          "Cut operating costs and meet green initiatives with our energy-focused solutions, including specialized coatings and advanced ventilation.",
        subServices: [
          {
            title: "Coating",
            description:
              "Protect, seal, and reflect heat with a range of commercial-grade coatings.",
          },
          {
            title: "Ventilation",
            description:
              "Reduce internal building temperatures and save on cooling with targeted ventilation strategies.",
          },
        ],
      },
    },
  };

  // List & item animations remain the same
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Resting animation remains the same
  const restingAnimation = {
    x: [10, 30, 10],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear",
    },
  };

  return (
    <section className="h-[48vh] md:h-[75.5vh] overflow-hidden">
      <div className="h-[30vh] md:h-[35vh] absolute top-0 left-0 right-0 bg-gradient-to-b from-dark-below-header from-60% to-transparent z-10"></div>
      {/* The top logo and hero split remains unchanged */}
      <div className="relative w-full h-[2.5vh] md:h-[7.5vh] z-20">
        <div className="relative flex flex-row items-center justify-center ">
          <img
            src="assets/images/clipped-cowboy.png"
            alt="logo"
            className="w-[20vw] md:w-[17vh] h-auto mr-5 md:mr-10 "
            style={{ filter: "invert(0)" }}
          />
          <div className="relative flex flex-col items-center justify-center  z-10 -space-y-[1vh] md:-space-y-[5vh]">
            <span
              className="
                text-[9vw] 
                md:text-[12vh] 
                text-white 
                text-center 
                drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]
                [ -webkit-text-stroke:6px_black ] font-rye  font-normal font-ultra-condensed
              "
            >
              COWBOYS
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
              CONSTRUCTION
            </span>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div className="relative h-[35vh] mt-[5vh] md:h-[65vh] w-full bg-red-600">
          {/* Residential Section */}
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
                  background:
                    "url('/assets/images/residentialnight.jpg') no-repeat center center",
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
                      className="text-white font-serif relative ml-[0vh] md:ml-[6vw] text-right space-y-1 md:space-y-2 text-[3.5vw] md:text-[3.8vh] font-semibold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                    >
                      {Object.keys(serviceDetails.residential).map(
                        (service) => (
                          <motion.li
                            key={service}
                            variants={itemVariants}
                            className="flex items-center justify-end gap-2"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal({
                                  type: "residential",
                                  name: service,
                                });
                              }}
                              className="text-white font-serif -mx-[20vw] pr-[20vw] md:pr-[24vw] py-1 rounded"
                            >
                              {service} ←
                            </button>
                          </motion.li>
                        )
                      )}
                    </motion.ul>
                  )}
                  <div className="flex flex-col -space-y-1 md:-space-y-2 items-center mt-[8vh] md:mt-[12vh] mr-[8vh] md:mr-[13.2vw] group ">
                    <Home className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)]   text-white " />
                    <h2 className="text-[4.5vw] md:text-[4.2vh] font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,3)] text-white font-serif duration-300">
                      Residential
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Commercial Section */}
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
                  background:
                    "url('/assets/images/commercialnight.jpg') no-repeat center center",
                  backgroundSize: "cover",
                  transformOrigin: "top left",
                  transform: "skew(-15deg)",
                }}
              />
              <div className="absolute top-0 right-0 w-full h-full " >
                <div className="absolute left-0 top-[40%] -translate-y-1/2 flex items-center gap-4 md:gap-8 ">
                  <div className="flex flex-col items-center -space-y-1 md:-space-y-2 group ml-[0vh] md:ml-[6vw] ">
                    <Building2 className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)]   text-white mt-[8vh] md:mt-[12vh]" />
                    <h2 className="text-[4.5vw] md:text-[4.2vh]  font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,3)] text-white font-serif ">
                      Commercial
                    </h2>
                  </div>
                  {activeSection === "commercial" && (
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-white ml-[0vh] md:ml-[6vw] w-[100vw] text-left space-y-1 md:space-y-2 text-[3.5vw] md:text-[3.8vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                    >
                      {Object.keys(serviceDetails.commercial).map((service) => (
                        <motion.li
                          key={service}
                          variants={itemVariants}
                          className="gap-2"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({
                                type: "commercial",
                                name: service,
                              });
                            }}
                            className="opacity-100 md:pl-[4vw] py-1 rounded"
                          >
                            → {service}
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

      {/* Modal */}
      {showModal && selectedService && (
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
              {serviceDetails[selectedService.type][selectedService.name].icon}
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedService.name}
              </h2>
            </div>

            {/* Image */}
            <img
              src={
                serviceDetails[selectedService.type][selectedService.name].image
              }
              alt={selectedService.name}
              className="w-full h-60 object-cover rounded-lg mb-4"
            />

            {/* Description */}
            <p className="text-gray-700 text-lg mb-6">
              {
                serviceDetails[selectedService.type][selectedService.name]
                  .description
              }
            </p>

            {/* Subservices + Buttons */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 font-serif">
                Our Services Include:
              </h3>

              {/* SubServices list */}
              <div className="grid md:grid-cols-2 gap-4">
                {serviceDetails[selectedService.type][
                  selectedService.name
                ].subServices.map((subService, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 font-serif">
                      {subService.title}
                    </h4>
                    <p className="text-gray-600 font-serif">{subService.description}</p>
                  </div>
                ))}
              </div>

              {/* 
                =============================================
                Buttons at the bottom of the modal
                Mimic your CTA style with hover effect, color
                =============================================
              */}
              <div className="flex flex-wrap justify-end gap-3 mt-4">
                {/* ---------------------- RESIDENTIAL ROUTES ---------------------- */}
                {selectedService.type === "residential" &&
                  selectedService.name === "Roof" && (
                    <Link
                      to="/shingleinstallation"
                      className="px-6 py-2 dark_button font-serif text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                      }}
                    >
                      Go to Shingle Installation
                    </Link>
                  )}

                {selectedService.type === "residential" &&
                  selectedService.name === "Accessories" && (
                    <>
                      <Link
                        to="/roofventilation"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Roof Ventilation
                      </Link>
                      <Link
                        to="/gutterrelated"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Guttering
                      </Link>
                    </>
                  )}

                {selectedService.type === "residential" &&
                  selectedService.name === "Siding" && (
                    <Link
                      to="/siding"
                      className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                      }}
                    >
                      Explore Siding
                    </Link>
                  )}

                {/* ---------------------- COMMERCIAL ROUTES ---------------------- */}
                {selectedService.type === "commercial" &&
                  selectedService.name === "Roof" && (
                    <>
                      <Link
                        to="/metalroofs"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Metal Roof
                      </Link>
                      <Link
                        to="/roofcoating"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Roof Coating
                      </Link>
                      <Link
                        to="/singleplysystems"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Single Ply
                      </Link>
                      <Link
                        to="/builtuproofing"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Built Up
                      </Link>
                    </>
                  )}

                {selectedService.type === "commercial" &&
                  selectedService.name === "Accessories" && (
                    <>
                      <Link
                        to="/roofventilation"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Ventilation
                      </Link>
                      <Link
                        to="/gutterrelated"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Guttering
                      </Link>
                    </>
                  )}

                {selectedService.type === "commercial" &&
                  selectedService.name === "Energy" && (
                    <>
                      <Link
                        to="/roofcoating"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Coating
                      </Link>
                      <Link
                        to="/roofventilation"
                        className="px-6 py-2 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                        }}
                      >
                        Ventilation
                      </Link>
                    </>
                  )}
              </div>
              {/* End of CTA-like buttons */}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
