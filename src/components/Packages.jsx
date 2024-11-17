import React from "react";
import { Link } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import {
  FaTools,
  FaFan,
  FaPaintRoller,
  FaTint,
  
} from "react-icons/fa";

// Common class names
const iconClass = "mb-4 drop-shadow";
const sectionTitleClass =
  "flex justify-center text-[3.5vh] font-semibold mb-1 text-center";

// Combined data array with individual colors
const services = [
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
  // {
  //   icon: GiMushrooms,
  //   title: "Mold & Algae",
  //   link: "/moldalgaegrowth",
  //   color: "#98c15a",
  // },
  // {
  //   icon: GiCrackedGlass,
  //   title: "Deterioration",
  //   link: "/roofingmaterialdeterioration",
  //   color: "#a3914d",
  // },
  // {
  //   icon: MdWaterDamage,
  //   title: "Water Damage",
  //   link: "/leakswaterdamage",
  //   color: "#2980B9",
  // },
];

const Packages = () => {
  // Animation variants
  const itemVariants = {
    hidden: { scale: 0.7, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "ease",
        duration: 0.5,
      },
    },
  };

  return (
  <div className="w-full md:px-9 ">

      <div className="relative overflow-hidden">
        <section className="my-6">
          <h2 className={sectionTitleClass}>Our Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4 px-12 ">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Tilt
                  className="transform transition-transform duration-500 hover:custom-circle-shadow"
                  tiltMaxAngleX={15}
                  tiltMaxAngleY={15}
                  scale={1.05}
                >
                  <div className="dark_button hover:bg-gray-600 backdrop-filter backdrop-blur-lg rounded-2xl custom-circle-shadow overflow-hidden  transition duration-300">
                    <Link to={service.link}>
                      {/* Set fixed width and height for the card */}
                      <div className=" h-[17vh] flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center">
                          {/* Render the icon with specific color */}
                          {React.createElement(service.icon, {
                            color: service.color,
                            className: `${iconClass} text-5xl text-white`,
                          })}
                          <h3 className="text-sm md:text-xl font-semibold text-white  text-center ">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Packages;
