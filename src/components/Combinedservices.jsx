import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTools,
  FaFan,
  FaPaintRoller,
  FaTint,
} from "react-icons/fa";

// Services data
const servicesData = [
  { icon: FaTools, title: "Shingling", link: "/shingleinstallation" },
  { icon: FaFan, title: "Ventilation", link: "/ventilation" },
  { icon: FaPaintRoller, title: "Coating", link: "/roofcoating" },
  { icon: FaTint, title: "Guttering", link: "/gutterrelated" },
];

// Framer Motion variants
const itemVariants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "ease", duration: 0.5 },
  },
};

const CombinedServices = () => {
  return (
    <div className="w-full">

      {/* ──────────────────────────────────────────────────────────
          SMALL SCREENS: Single Row of Buttons
      ────────────────────────────────────────────────────────── */}
      <div className="block md:hidden relative w-full">
        <img
          src="/assets/images/main_img.jpg"
          alt="Main Display (small screen)"
          className="w-full h-auto"
        />

        {/* White triangle at bottom (if you still want it) */}
        <div
          className="absolute bottom-0 left-0 w-full h-[12vh] bg-white"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />

        {/* SERVICES text at ~80% opacity, near top-center */}
        <h2
          className="absolute top-2 left-1/2 transform -translate-x-1/2 
                     text-white text-3xl font-bold text-center drop-shadow-md"
        >
          Services
        </h2>

        {/* 
          Single row: We'll place all 4 circle buttons in one line.
          We center them both horizontally & vertically within the image area.
        */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-row gap-4">
            {servicesData.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex flex-col items-center"
              >
                {/* 
                  Circle Button (slightly smaller to fit in a single row).
                  We'll also add an inline style for a "big" inner shadow on hover.
                */}
                <Link to={service.link}>
                  <div
                    className="dark_button w-12 h-12 rounded-full 
                               flex items-center justify-center
                               text-white text-xl 
                               transition-all duration-300"
                    style={{
                      // This ensures a strong inner shadow on hover.
                      // One approach: Tailwind doesn’t provide a big shadow-inner,
                      // so we override it with inline style + :hover pseudoclass trick.
                      // If you need more dynamic control, consider a custom class in CSS.
                    }}
                    // Use group-hover or a custom approach to apply the shadow on hover:
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "inset 0 0 25px 8px rgba(0,0,0,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {React.createElement(service.icon, { color: "#ffffff" })}
                  </div>
                </Link>
                {/* 
                  Service Title below the button, minimal gap => mt-1
                  text-sm for smaller phones 
                */}
                <h3 className="mt-1 text-white text-sm font-semibold">
                  {service.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          LARGE SCREENS: 4 columns, bigger circles
      ────────────────────────────────────────────────────────── */}
      <div className="hidden md:block relative w-full h-[50vh]">
        <img
          src="/assets/images/main_image_expanded.jpg"
          alt="Main Display (large screen)"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" />

        <h2
          className="absolute top-5 left-1/2 transform -translate-x-1/2
                     text-white text-5xl font-bold text-center drop-shadow-md"
        >
          Services
        </h2>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 gap-12">
            {servicesData.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex flex-col items-center"
              >
                <Link to={service.link}>
                  <div
                    className="dark_button w-36 h-36 rounded-full 
                               flex items-center justify-center
                               text-white text-4xl 
                               transition-all duration-300"
                    // Again, a strong inline shadow on hover:
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "inset 0 0 30px 10px rgba(0,0,0,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {React.createElement(service.icon, { color: "#ffffff" })}
                  </div>
                </Link>
                <h3 className="mt-1 text-white text-lg font-semibold">
                  {service.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedServices;
