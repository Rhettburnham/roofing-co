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
const iconClass = "mb-2 drop-shadow";

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
    <div className="w-full md:px-9">
      <div className="relative overflow-hidden">
        <section className="mb-2 md:my-6">
          <h2 className="flex justify-center text-[3.5vh] font-semibold mb-1 text-center my-6">
            Our Services
          </h2>
          <div className="grid grid-cols-4 gap-2 mt-2 md:mt-4 px-12 items-stretch">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex"
              >
                <Tilt
                  className="transform transition-transform duration-500 hover:custom-circle-shadow h-full w-full flex flex-col"
                  tiltMaxAngleX={15}
                  tiltMaxAngleY={15}
                  scale={1.05}
                >
                  <div className="dark_button hover:bg-gray-600 backdrop-filter backdrop-blur-lg rounded-2xl custom-circle-shadow overflow-hidden transition duration-300 p-4 md:p-6 flex flex-col h-full">
                    <Link to={service.link} className="flex flex-col h-full">
                      <div className="flex flex-col items-center justify-center flex-grow">
                        {React.createElement(service.icon, {
                          color: service.color,
                          className: `${iconClass} text-[8vw] md:text-5xl text-white mb-2`,
                        })}
                        <h3 className="text-[2.5vw] md:text-xl font-semibold text-white text-center mt-2">
                          {service.title}
                        </h3>
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
