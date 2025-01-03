import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Building2,
  X,
  Wrench,
  Package,
  Shield,
  Leaf,
} from "lucide-react";

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

  const serviceDetails = {
    residential: {
      "Installation": {
        icon: <Package className="w-6 h-6 lg:w-10 lg:h-10" />,
        image: "/assets/images/hero_modal/installation.jpg",
        description:
          "Complete roofing installation and replacement services for residential properties.",
        subServices: [
          {
            title: "New Roof Installation",
            description:
              "Expert installation of new roofs for new constructions, using premium materials and following strict quality standards.",
          },
          {
            title: "Roof Replacement",
            description:
              "Full roof replacement services including removal of old materials and installation of new roofing systems.",
          },
        ],
      },
      "Maintenance": {
        icon: <Wrench className="w-6 h-6 lg:w-10 lg:h-10" />,
        image: "/assets/images/hero_modal/repair.jpg",
        description:
          "Comprehensive repair and maintenance services to keep your roof in top condition.",
        subServices: [
          {
            title: "Roof Repairs",
            description:
              "Professional repair services for leaks, missing shingles, damaged flashing, and other roofing issues.",
          },
          {
            title: "Regular Inspections",
            description:
              "Thorough roof inspections to identify potential problems before they become major issues.",
          },
          {
            title: "Emergency Services",
            description:
              "24/7 emergency repair services for unexpected damage from storms or accidents.",
          },
        ],
      },
      "Accessories": {
        icon: <Shield className="w-6 h-6 lg:w-10 lg:h-10" />,
        image: "/assets/images/hero_modal/enhancements.jpg",
        description:
          "Additional services to improve your roof's functionality and appearance.",
        subServices: [
          {
            title: "Gutter Services",
            description:
              "Complete gutter solutions including installation, repair, and maintenance of gutters, downspouts, soffits, and fascia.",
          },
          {
            title: "Skylight Installation",
            description:
              "Professional installation and repair of skylights to enhance natural lighting.",
          },
          {
            title: "Ventilation Services",
            description:
              "Installation and maintenance of proper roof ventilation systems to prevent moisture buildup and regulate temperature.",
          },
        ],
      },
      "Repair": {
        icon: <Leaf className="w-6 h-6 lg:w-10 lg:h-10" />,
        image: "/assets/images/hero_modal/materials.jpg",
        description:
          "Expert services for various roofing materials to match your specific needs.",
        subServices: [
          {
            title: "Asphalt Shingle Roofing",
            description:
              "Installation and maintenance of cost-effective and reliable asphalt shingle roofs.",
          },
          {
            title: "Metal Roofing",
            description:
              "Specialized installation and maintenance of durable metal roofing systems.",
          },
          {
            title: "Tile & Slate Roofing",
            description:
              "Expert handling of premium tile and slate roofing materials for lasting beauty and protection.",
          },
        ],
      },
    },
    commercial: {
      "Installation": {
        icon: <Package className="w-6 h-6 lg:w-10 lg:h-10" />,
        image: "/assets/images/hero_modal/commercial-install.jpg",
        description:
          "Professional installation services for commercial roofing systems.",
        subServices: [
          {
            title: "Commercial Installation",
            description:
              "Complete installation services for new commercial constructions using various roofing systems.",
          },
          {
            title: "System Replacement",
            description:
              "Full replacement of commercial roofing systems including TPO, EPDM, and modified bitumen.",
          },
        ],
      },
      "Maintenance": {
        icon: <Wrench className="w-6 h-6 lg:w-10 lg:h-10" />,
        image: "/assets/images/hero_modal/commercial-repair.jpg",
        description:
          "Comprehensive maintenance and repair services for commercial properties.",
        subServices: [
          {
            title: "Scheduled Maintenance",
            description:
              "Regular maintenance programs including cleaning, inspection, and preventive repairs.",
          },
          {
            title: "Emergency Services",
            description:
              "Rapid response repair services for unexpected damage or leaks.",
          },
          {
            title: "Roof Coatings",
            description:
              "Application of protective coatings to extend roof life and improve energy efficiency.",
          },
        ],
      },
      "Accesories": {
        icon: <Shield className="w-6 h-6 lg:w-10 lg:h-10" />,
        image: "/assets/images/hero_modal/specialized.png",
        description:
          "Advanced roofing solutions for specific commercial needs.",
        subServices: [
          {
            title: "Green Roofing",
            description:
              "Installation of environmentally friendly roofing systems including vegetative roofs.",
          },
          {
            title: "Equipment Installation",
            description:
              "Professional installation of rooftop equipment while maintaining roof integrity.",
          },
          {
            title: "Safety Features",
            description:
              "Installation of safety systems including walkways, guardrails, and fall protection.",
          },
        ],
      },
      "Repair": {
        icon: <Leaf className="w-6 h-6 lg:w-10 lg:h-10" />,
        image: "/assets/images/hero_modal/technical.jpg",
        description:
          "Advanced technical services for commercial roofing systems.",
        subServices: [
          {
            title: "Thermal Imaging",
            description:
              "Advanced infrared scanning to detect moisture intrusion and insulation issues.",
          },
          {
            title: "Asset Management",
            description:
              "Comprehensive roof monitoring and maintenance planning services.",
          },
          {
            title: "Compliance Services",
            description:
              "Documentation and certification services to meet building codes and standards.",
          },
        ],
      },
    },
  };

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

  const restingAnimation = {
    x: [10, 30, 10],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear",
    },
  };

  return (
    <section>
      {/* Logo Section */}
      <div className="relative w-full h-[12.5vh]">
        <div className="absolute inset-0 flex items-center justify-center  text-center font-bold z-10 text-[11vw] md:text-[9vw]">
          <span className="text-black">Rhett's Roofing</span>
        </div>
      </div>

      <div className="relative w-full">
        {/* Content Section with Mirrored Gradient */}
        <div
          className="relative h-[35vh] md:h-[54vh] w-full"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3) 10%, white 20%, white 80%, rgba(255, 255, 255, 0.3) 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3) 10%, white 20%, white 80%, rgba(255, 255, 255, 0.3) 90%, transparent 100%)",
          }}
        >
          {/* Residential Section */}
          <motion.div
            className="absolute left-0 h-[35vh] md:h-[65vh] w-1/2 cursor-pointer"
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
                className="absolute top-0 right-0 w-[150%] h-full"
                style={{
                  background:
                    "url('/assets/images/residentialroofing.jpg') no-repeat center center",
                  backgroundSize: "cover",
                  transform: "skew(0deg)",
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
                      className="text-white text-right space-y-1 md:space-y-3 text-[2.5vw] md:text-[3.8vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
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
                              className="text-white -mx-[20vw] pr-[20vw] md:pr-[24vw] py-1 rounded"
                            >
                              {service} ←
                            </button>
                          </motion.li>
                        )
                      )}
                    </motion.ul>
                  )}
                  <div className="flex flex-col items-center mr-[8vh] md:mr-[13.2vh] group opacity-70 hover:opacity-100">
                    <Home
                      className={`h-[10vw] w-[10vw] md:w-[10.5vh] md:h-[10.5vh]  drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)] transition-colors duration-300 text-white hover:text-white`}
                    />
                    <h2
                      className={`text-[5vw] md:text-[4.2vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)] transition-colors duration-300 text-white`}
                    >
                      Residential
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Commercial Section */}
          <motion.div
            className="absolute right-0 h-[35vh] md:h-[65vh] w-1/2 cursor-pointer"
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
                className="absolute top-0 left-0 w-[150%] h-full"
                style={{
                  background:
                    "url('/assets/images/commercialroofing.jpg') no-repeat center center",
                  backgroundSize: "cover",
                  transformOrigin: "top left",
                  transform: "skew(-15deg)",
                }}
              />
              <div className="absolute top-0 right-0 w-full h-full">
                <div className="absolute left-0 top-[40%] -translate-y-1/2 flex items-center gap-4 md:gap-8">
                  <div className="flex flex-col items-center ml-[0vh] md:ml-[6vh] group opacity-70 hover:opacity-100">
                    <Building2
                      className={`w-[10vw] h-[10vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)] transition-colors duration-300 text-white hover:text-white`}
                    />
                    <h2
                      className={`text-[5vw] md:text-[4.2vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)] transition-colors duration-300 text-white `}
                    >
                      Commercial
                    </h2>
                  </div>
                  {activeSection === "commercial" && (
                    <motion.ul
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-white text-left space-y-1 md:space-y-3 text-[2.5vw] md:text-[3.8vh] font-bold drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]"
                    >
                      {Object.keys(serviceDetails.commercial).map((service) => (
                        <motion.li
                          key={service}
                          variants={itemVariants}
                          className="gap-2 "
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({
                                type: "commercial",
                                name: service,
                              });
                            }}
                            className="opacity-100 md:pl-[4vw] py-1 rounded "
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
          <div className="relative w-[90vw] max-w-4xl h-[60vh] bg-white rounded-lg p-6">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {
                  serviceDetails[selectedService.type][selectedService.name]
                    .icon
                }
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedService.name}
                </h2>
              </div>

              <img
                src={
                  serviceDetails[selectedService.type][selectedService.name]
                    .image
                }
                alt={selectedService.name}
                className="w-full h-64 object-cover rounded-lg"
              />

              <p className="text-lg text-gray-700">
                {
                  serviceDetails[selectedService.type][selectedService.name]
                    .description
                }
              </p>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Our Services Include:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {serviceDetails[selectedService.type][
                    selectedService.name
                  ].subServices.map((subService, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {subService.title}
                      </h4>
                      <p className="text-gray-600">{subService.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
