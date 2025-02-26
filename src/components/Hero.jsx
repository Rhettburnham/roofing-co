import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const [activeSection, setActiveSection] = useState("neutral");

  // Handle which side (residential/commercial) is expanded
  const handleSectionClick = (section) => {
    setActiveSection((prevSection) =>
      prevSection === section ? "neutral" : section
    );
  };

  /**
   * Animation variants (still used for fade-in effect on the list items)
   */
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

  // Subtle resting animation for each side when in "neutral" state
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

      {/* Top Logo Section */}
      <div className="relative w-full h-[2.5vh] md:h-[7.5vh] z-20">
        <div className="relative flex flex-row items-center justify-center ">
          <img
            src="assets/images/clipped-cowboy.png"
            alt="logo"
            className="w-[20vw] md:w-[17vh] h-auto mr-5 md:mr-10 "
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

      {/* Hero Split Section */}
      <div className="relative w-full">
        <div className="relative h-[35vh] mt-[5vh] md:h-[65vh] w-full ">

          {/* ================= Residential Section ================= */}
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
                      {/* Each service now links to /services1 */}
                      {["Roof", "Accessories", "Siding"].map((service) => (
                        <motion.li
                          key={service}
                          variants={itemVariants}
                          className="flex items-center justify-end gap-2"
                        >
                          <Link
                            to="/services1"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white font-serif -mx-[20vw] pr-[20vw] md:pr-[24vw] py-1 rounded"
                          >
                            {service} ←
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                  <div className="flex flex-col -space-y-1 md:-space-y-2 items-center mt-[8vh] md:mt-[12vh] mr-[8vh] md:mr-[13.2vw] group ">
                    <Home className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-white" />
                    <h2 className="text-[4.5vw] md:text-[4.2vh] font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,3)] text-white font-serif duration-300">
                      Residential
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= Commercial Section ================= */}
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
              <div className="absolute top-0 right-0 w-full h-full">
                <div className="absolute left-0 top-[40%] -translate-y-1/2 flex items-center gap-4 md:gap-8">
                  <div className="flex flex-col items-center -space-y-1 md:-space-y-2 group ml-[0vh] md:ml-[6vw]">
                    <Building2 className="w-[8.5vw] h-[8.5vw] md:w-[10.5vh] md:h-[10.5vh] drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,3)] text-white mt-[8vh] md:mt-[12vh]" />
                    <h2 className="text-[4.5vw] md:text-[4.2vh] font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,3)] text-white font-serif">
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
                      {/* Each service now links to /services4 */}
                      {["Roof", "Accessories", "Energy"].map((service) => (
                        <motion.li
                          key={service}
                          variants={itemVariants}
                          className="gap-2"
                        >
                          <Link
                            to="/services4"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-100 md:pl-[4vw] py-1 rounded"
                          >
                            → {service}
                          </Link>
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
    </section>
  );
};

export default Hero;
